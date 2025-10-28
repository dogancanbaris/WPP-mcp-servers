/**
 * Dataset Query API with Caching
 *
 * GET /api/datasets/[id]/query
 *
 * Queries a registered dataset with intelligent caching.
 * Checks cache first, queries BigQuery on cache miss, stores result.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { executeQuery } from '@/lib/data/bigquery-client';
import { buildQuery } from '@/lib/data/query-builder';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);

    const supabase = await createClient();

    // Get dataset
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', params.id)
      .single();

    if (datasetError || !dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const metrics = searchParams.get('metrics')?.split(',') || [];
    const dimensions = searchParams.get('dimensions')?.split(',').filter(Boolean) || [];
    const dateRangeStr = searchParams.get('dateRange');
    const filtersStr = searchParams.get('filters');
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Parse dateRange
    let dateRange: [string, string] | undefined;
    if (dateRangeStr) {
      try {
        const parsed = JSON.parse(dateRangeStr);
        if (Array.isArray(parsed) && parsed.length === 2) {
          dateRange = parsed as [string, string];
        }
      } catch (e) {
        // Invalid dateRange, ignore
      }
    }

    // Parse filters
    let filters: Array<{ field: string; operator: string; values: string[] }> = [];
    if (filtersStr) {
      try {
        const parsed = JSON.parse(filtersStr);
        if (Array.isArray(parsed)) {
          filters = parsed;
        }
      } catch (e) {
        // Invalid filters, ignore
      }
    }

    // Build query config
    const queryConfig = {
      platform: dataset.platform_metadata.platform,
      metrics,
      dimensions,
      dateRange,
      filters,
      limit
    };

    // Create query hash for caching
    const queryHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(queryConfig))
      .digest('hex');

    // Check cache
    const { data: cachedResult } = await supabase
      .from('dataset_cache')
      .select('*')
      .eq('dataset_id', params.id)
      .eq('query_hash', queryHash)
      .single();

    // If cache hit and not expired, return cached data
    if (cachedResult && new Date(cachedResult.expires_at) > new Date()) {
      console.log(`[Dataset Query] Cache HIT for dataset ${params.id}`);

      return NextResponse.json({
        success: true,
        data: cachedResult.data,
        rowCount: cachedResult.row_count,
        cached: true,
        cachedAt: cachedResult.cached_at
      });
    }

    console.log(`[Dataset Query] Cache MISS for dataset ${params.id}, querying BigQuery...`);

    // Build actual BigQuery table reference from dataset
    const bigqueryTable = `${dataset.bigquery_project_id}.${dataset.bigquery_dataset_id}.${dataset.bigquery_table_id}`;

    // Cache miss - query BigQuery with metadata-based aggregation
    const platform = dataset.platform_metadata.platform;

    // Load platform metadata to get correct aggregation functions
    let platformMetadata;
    try {
      const metadataPath = `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/lib/metadata/platforms/${platform}.json`;
      const fs = require('fs');
      platformMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (error) {
      console.error('[Dataset Query] Failed to load platform metadata:', error);
      platformMetadata = null;
    }

    const selectFields = [];
    const whereConditions = [];

    // Determine which dimensions to query
    const requestedDimensions = queryConfig.dimensions || [];
    const allPossibleDimensions = ['date', 'query', 'page', 'device', 'country'];

    if (requestedDimensions.length > 0) {
      // User wants specific dimensions - add them to SELECT
      selectFields.push(...requestedDimensions);

      // Filter: requested dimensions must NOT be NULL
      requestedDimensions.forEach(dim => {
        whereConditions.push(`${dim} IS NOT NULL`);
      });

      // If date is a requested dimension, apply date range filter
      if (requestedDimensions.includes('date') && queryConfig.dateRange) {
        whereConditions.push(`date BETWEEN '${queryConfig.dateRange[0]}' AND '${queryConfig.dateRange[1]}'`);
      }

      // All other dimensions (not requested, not date) must be NULL
      allPossibleDimensions
        .filter(dim => !requestedDimensions.includes(dim) && dim !== 'date')
        .forEach(dim => {
          whereConditions.push(`${dim} IS NULL`);
        });
    } else {
      // No dimensions requested (scorecard total) - all dimensions except date must be NULL
      allPossibleDimensions
        .filter(dim => dim !== 'date')
        .forEach(dim => {
          whereConditions.push(`${dim} IS NULL`);
        });

      // Apply date range filter for aggregated totals
      if (queryConfig.dateRange) {
        whereConditions.push(`date BETWEEN '${queryConfig.dateRange[0]}' AND '${queryConfig.dateRange[1]}'`);
      }
    }

    // Apply cascaded filters from component/page/global levels
    queryConfig.filters.forEach(filter => {
      const field = filter.field;
      const operator = filter.operator;
      const values = filter.values;

      // Helper function to escape single quotes in SQL values
      const escapeValue = (val: string) => val.replace(/'/g, "''");

      switch (operator) {
        case 'equals':
          if (values.length > 0) {
            whereConditions.push(`${field} = '${escapeValue(values[0])}'`);
          }
          break;

        case 'notEquals':
          if (values.length > 0) {
            whereConditions.push(`${field} != '${escapeValue(values[0])}'`);
          }
          break;

        case 'inList':
          if (values.length > 0) {
            const valueList = values.map(v => `'${escapeValue(v)}'`).join(', ');
            whereConditions.push(`${field} IN (${valueList})`);
          }
          break;

        case 'notInList':
          if (values.length > 0) {
            const valueList = values.map(v => `'${escapeValue(v)}'`).join(', ');
            whereConditions.push(`${field} NOT IN (${valueList})`);
          }
          break;

        case 'contains':
          if (values.length > 0) {
            whereConditions.push(`${field} LIKE '%${escapeValue(values[0])}%'`);
          }
          break;

        case 'notContains':
          if (values.length > 0) {
            whereConditions.push(`${field} NOT LIKE '%${escapeValue(values[0])}%'`);
          }
          break;

        case 'startsWith':
          if (values.length > 0) {
            whereConditions.push(`${field} LIKE '${escapeValue(values[0])}%'`);
          }
          break;

        case 'endsWith':
          if (values.length > 0) {
            whereConditions.push(`${field} LIKE '%${escapeValue(values[0])}'`);
          }
          break;

        case 'greaterThan':
          if (values.length > 0) {
            whereConditions.push(`${field} > ${parseFloat(values[0]) || 0}`);
          }
          break;

        case 'greaterThanOrEqual':
          if (values.length > 0) {
            whereConditions.push(`${field} >= ${parseFloat(values[0]) || 0}`);
          }
          break;

        case 'lessThan':
          if (values.length > 0) {
            whereConditions.push(`${field} < ${parseFloat(values[0]) || 0}`);
          }
          break;

        case 'lessThanOrEqual':
          if (values.length > 0) {
            whereConditions.push(`${field} <= ${parseFloat(values[0]) || 0}`);
          }
          break;

        case 'between':
          if (values.length >= 2) {
            whereConditions.push(`${field} BETWEEN ${parseFloat(values[0]) || 0} AND ${parseFloat(values[1]) || 0}`);
          }
          break;

        case 'inDateRange':
          if (values.length >= 2) {
            whereConditions.push(`${field} BETWEEN '${escapeValue(values[0])}' AND '${escapeValue(values[1])}'`);
          }
          break;

        case 'isNull':
          whereConditions.push(`${field} IS NULL`);
          break;

        case 'isNotNull':
          whereConditions.push(`${field} IS NOT NULL`);
          break;

        default:
          console.warn(`[Dataset Query] Unknown filter operator: ${operator}`);
      }
    });

    // Build metrics with correct aggregation from metadata
    selectFields.push(...queryConfig.metrics.map(m => {
      const metricDef = platformMetadata?.metrics?.find((met: any) => met.id === m);
      const aggregation = metricDef?.aggregation || 'SUM';

      return `${aggregation}(${m}) AS ${m}`;
    }));

    const groupBy = requestedDimensions.length > 0
      ? `GROUP BY ${requestedDimensions.join(', ')}`
      : '';

    const sql = `
      SELECT ${selectFields.join(', ')}
      FROM \`${bigqueryTable}\`
      ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
      ${groupBy}
      LIMIT ${queryConfig.limit}
    `.trim();

    console.log('[Dataset Query] SQL:', sql);

    const rows = await executeQuery(sql);

    // Calculate expiry (based on dataset refresh interval)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dataset.refresh_interval_days || 1));

    // Store in cache (upsert)
    await supabase
      .from('dataset_cache')
      .upsert([{
        dataset_id: params.id,
        query_hash: queryHash,
        data: rows,
        row_count: rows.length,
        expires_at: expiresAt.toISOString()
      }], {
        onConflict: 'dataset_id,query_hash'
      });

    return NextResponse.json({
      success: true,
      data: rows,
      rowCount: rows.length,
      cached: false,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('[Dataset Query] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Refresh cache for specific query
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const supabase = await createClient();

    // Clear cache for this dataset
    await supabase
      .from('dataset_cache')
      .delete()
      .eq('dataset_id', params.id);

    return NextResponse.json({
      success: true,
      message: 'Cache cleared for dataset'
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
