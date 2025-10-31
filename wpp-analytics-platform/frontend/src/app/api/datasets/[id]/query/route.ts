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

/**
 * Helper function to determine metric aggregation type
 */
function getMetricAggregation(metric: string, platformMetadata: any): string {
  // Try to get aggregation from platform metadata first
  const metricDef = platformMetadata?.metrics?.find((met: any) => met.id === metric);
  if (metricDef?.aggregation) {
    return metricDef.aggregation;
  }

  // Fallback to heuristic-based detection
  const avgMetrics = ['ctr', 'position', 'cpc', 'avg', 'rate', 'ratio'];
  return avgMetrics.some((m) => metric.toLowerCase().includes(m)) ? 'AVG' : 'SUM';
}

/**
 * Build a SQL query for a specific time period
 */
function buildPeriodQuery(
  bigqueryTable: string,
  dimensions: string[],
  metrics: string[],
  filters: Array<{ field: string; operator: string; values: string[] }>,
  platformMetadata: any,
  periodLabel: 'current' | 'comparison',
  allPossibleDimensions: string[],
  options?: {
    fillGaps?: boolean;
    workspaceId?: string;
    chartType?: string;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }
): string {
  const selectFields: string[] = [];
  const whereConditions: string[] = [];

  // CRITICAL: Add workspace_id filter for shared table isolation
  // Shared tables (e.g., gsc_performance_shared) contain data from multiple workspaces
  // Without this filter, queries would aggregate data across ALL workspaces
  if (options?.workspaceId) {
    whereConditions.push(`workspace_id = '${options.workspaceId.replace(/'/g, "''")}'`);
    console.log(`[Dataset Query] Added workspace isolation filter: workspace_id = '${options.workspaceId}'`);
  }

  // CRITICAL: Filter out NULL dimension values for ranking/display charts
  // NULL values create unprofessional "Unknown" entries that dominate rankings
  // Apply to charts where dimension values are displayed (not aggregated)
  const chartTypeForNullFilter = options?.chartType || '';
  const chartsNeedingNullFilter = [
    'pie_chart', 'donut_chart', 'bar_chart', 'horizontal_bar',
    'table', 'treemap', 'stacked_bar', 'stacked_column',
    'heatmap', 'radar', 'funnel_chart', 'waterfall'
  ];

  if (chartsNeedingNullFilter.includes(chartTypeForNullFilter) && dimensions.length > 0) {
    dimensions.forEach(dim => {
      whereConditions.push(`${dim} IS NOT NULL`);
    });
    console.log(`[Dataset Query] Added NULL filter for dimensions: ${dimensions.join(', ')}`);
  }

  const groupByFields: string[] = [];
  const fillGaps = !!options?.fillGaps;

  // Add period label
  selectFields.push(`'${periodLabel}' AS period`);

  // Determine which dimensions to query
  const requestedDimensions = dimensions || [];

  if (requestedDimensions.length > 0) {
    // User wants specific dimensions - add them to SELECT and GROUP BY
    // Special handling for date: normalize to yyyy-MM-dd so clients can rely on string keys
    requestedDimensions.forEach((dim) => {
      if (dim === 'date') {
        selectFields.push("FORMAT_DATE('%Y-%m-%d', date) AS date");
        groupByFields.push("FORMAT_DATE('%Y-%m-%d', date)");
      } else {
        selectFields.push(dim);
        groupByFields.push(dim);
      }
    });

    // REMOVED: IS NOT NULL filter - this caused mismatch between scorecard and dimensional queries
    // For Search Console data, date is never NULL in valid rows
    // Adding this filter would exclude rows from dimensional queries but not from aggregates
    console.log('[Dataset Query] Dimension query mode: grouping by', requestedDimensions);
  } else {
    // No dimensions requested (scorecard total)
    // CHANGED: Do NOT filter for NULL dimensions - aggregate across all dimension values
    // This allows scorecards to sum/avg data regardless of how dimensions are populated
    console.log('[Dataset Query] Scorecard mode: aggregating across all dimension values');
  }

  // Add metrics with aggregation (cast to FLOAT64 for consistent numeric output)
  metrics.forEach((metric) => {
    const aggregation = getMetricAggregation(metric, platformMetadata);
    selectFields.push(`CAST(${aggregation}(${metric}) AS FLOAT64) AS ${metric}`);
  });

  // Apply filters (including date range)
  filters.forEach(filter => {
    const field = filter.field || (filter as any).member;
    const operator = filter.operator;
    const values = filter.values;

    // Helper function to escape single quotes in SQL values
    const escapeValue = (val: string) => val.replace(/'/g, "''");

    switch (operator) {
      case 'inDateRange':
        if (values.length >= 2) {
          whereConditions.push(`${field} BETWEEN '${escapeValue(values[0])}' AND '${escapeValue(values[1])}'`);
        }
        break;

      // Support both 'in' and 'inList' for multi-select filters
      case 'in':
      case 'inList':
        if (values.length > 0) {
          const valueList = values.map(v => `'${escapeValue(v)}'`).join(', ');
          whereConditions.push(`${field} IN (${valueList})`);
        }
        break;

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

  const groupByClause = groupByFields.length > 0
    ? `GROUP BY ${groupByFields.join(', ')}`
    : '';

  // INTELLIGENT DEFAULT SORTING SYSTEM
  // Determines optimal sorting based on chart type and data characteristics
  const hasDateDimension = (dimensions || []).includes('date');
  const chartType = options?.chartType || '';
  const sortBy = options?.sortBy;
  const sortDirection = options?.sortDirection || 'DESC';

  let orderByClause = '';
  let defaultSortBy = sortBy;  // Use explicit param if provided
  let defaultDirection = sortDirection;

  if (!defaultSortBy) {
    // Apply intelligent defaults based on chart type and data structure
    if (hasDateDimension) {
      // Time-series charts: always chronological
      defaultSortBy = 'date';
      defaultDirection = 'ASC';
    } else if (['pie_chart', 'donut_chart', 'bar_chart', 'horizontal_bar', 'treemap', 'stacked_bar', 'stacked_column'].includes(chartType)) {
      // Ranking charts: top performers first
      defaultSortBy = metrics[0];
      defaultDirection = 'DESC';
    } else if (chartType === 'table') {
      // Tables: sortable by first metric (user can override in UI)
      defaultSortBy = metrics[0] || dimensions[0];
      defaultDirection = metrics[0] ? 'DESC' : 'ASC';
    } else if (['funnel_chart', 'waterfall'].includes(chartType)) {
      // Sequential charts: preserve dimensional order
      defaultSortBy = dimensions[0];
      defaultDirection = 'ASC';
    } else if (['heatmap', 'radar'].includes(chartType)) {
      // Categorical charts: alphabetical
      defaultSortBy = dimensions[0];
      defaultDirection = 'ASC';
    }
    // else: no default sorting (database order)
  }

  if (defaultSortBy) {
    orderByClause = `ORDER BY ${defaultSortBy} ${defaultDirection}`;
  }

  // Special fillGaps handling for pure date dimension
  if (fillGaps && hasDateDimension && (dimensions || []).length === 1) {
    // Extract date range from filters
    const dateFilter = filters.find((f) => (f.field || (f as any).member) === 'date' && f.operator === 'inDateRange');
    const start = dateFilter?.values?.[0];
    const end = dateFilter?.values?.[1];
    if (start && end) {
      // Build WHERE without date to avoid double filtering; join on generated series
      const whereNoDate = whereConditions.filter((w) => !/\bdate\b\s+BETWEEN\s+/i.test(w));
      const metricSelects = metrics
        .map((metric) => `CAST(${getMetricAggregation(metric, platformMetadata)}(${metric}) AS FLOAT64) AS ${metric}`)
        .join(', ');

      return `
WITH date_series AS (
  SELECT day AS date
  FROM UNNEST(GENERATE_DATE_ARRAY(DATE('${start}'), DATE('${end}'))) AS day
),
base AS (
  SELECT
    FORMAT_DATE('%Y-%m-%d', date) AS date,
    ${metricSelects}
  FROM \`${bigqueryTable}\`
  ${whereNoDate.length > 0 ? `WHERE ${whereNoDate.join(' AND ')}` : ''}
  GROUP BY 1
)
SELECT '${periodLabel}' AS period,
       FORMAT_DATE('%Y-%m-%d', ds.date) AS date,
       ${metrics.map((m) => `COALESCE(b.${m}, 0) AS ${m}`).join(', ')}
FROM date_series ds
LEFT JOIN base b ON b.date = FORMAT_DATE('%Y-%m-%d', ds.date)
ORDER BY date ASC
LIMIT 1000`.trim();
    }
  }

  // Default query with pagination support
  const queryLimit = options?.limit || 1000;
  const queryOffset = options?.offset || 0;
  const offsetClause = queryOffset > 0 ? `OFFSET ${queryOffset}` : '';

  return `
    SELECT ${selectFields.join(', ')}
    FROM \`${bigqueryTable}\`
    ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    ${groupByClause}
    ${orderByClause}
    LIMIT ${queryLimit}
    ${offsetClause}
  `.trim();
}

/**
 * Calculate deltas between current and comparison periods
 */
function calculateDeltas(
  current: any[],
  comparison: any[],
  metrics: string[]
): Array<{
  metric: string;
  currentValue: number;
  comparisonValue: number;
  absoluteChange: number;
  percentChange: number;
}> {
  return metrics.map((metric) => {
    const currentSum = current.reduce((sum, row) => sum + (Number(row[metric]) || 0), 0);
    const comparisonSum = comparison.reduce((sum, row) => sum + (Number(row[metric]) || 0), 0);

    const absoluteChange = currentSum - comparisonSum;
    const percentChange = comparisonSum !== 0
      ? (absoluteChange / comparisonSum) * 100
      : 0;

    return {
      metric,
      currentValue: currentSum,
      comparisonValue: comparisonSum,
      absoluteChange,
      percentChange: Number(percentChange.toFixed(2)),
    };
  });
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
    const fillGaps = searchParams.get('fillGaps') === 'true';
    const debugNoCache = searchParams.get('debugNoCache') === 'true';
    const filtersStr = searchParams.get('filters');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const chartType = searchParams.get('chartType') || '';

    // NEW: Sorting and pagination parameters
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortDirection = (searchParams.get('sortDirection') || 'DESC').toUpperCase() as 'ASC' | 'DESC';
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeTotalCount = searchParams.get('includeTotalCount') === 'true';

    console.log('[Dataset Query] Request params:', {
      dataset_id: params.id,
      metrics,
      dimensions,
      dateRangeStr,
      filtersStr,
      limit,
      fillGaps,
      debugNoCache
    });

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

    // Helper: sanitize and normalize incoming filters (collapse duplicates by member+operator)
    type InFilter = { field?: string; member?: string; operator: string; values: string[]; comparisonEnabled?: boolean; comparisonValues?: string[]; comparisonType?: string };
    const sanitizeFilters = (input: InFilter[]): { sanitized: InFilter[]; hadDuplicates: boolean } => {
      const map = new Map<string, InFilter>();
      let hadDuplicates = false;
      for (const f of input) {
        const field = (f.field || f.member || '').toString();
        const key = `${field}||${f.operator}`;
        if (map.has(key)) hadDuplicates = true;
        const existing = map.get(key);
        if (!existing) {
          map.set(key, { ...f, field });
          continue;
        }
        // Prefer the one that carries comparison metadata when present; otherwise keep the last seen
        const preferNew = (f.comparisonEnabled && !existing.comparisonEnabled) || (!f.comparisonEnabled && !existing.comparisonEnabled);
        const chosen = preferNew ? { ...f, field } : { ...existing, field, ...(f.comparisonEnabled ? { comparisonEnabled: f.comparisonEnabled, comparisonValues: f.comparisonValues, comparisonType: f.comparisonType } : {}) };
        map.set(key, chosen);
      }
      return { sanitized: Array.from(map.values()), hadDuplicates };
    };

    // Parse filters
    let filters: Array<{ field: string; operator: string; values: string[]; comparisonEnabled?: boolean; comparisonValues?: string[]; comparisonType?: string }> = [];
    let comparisonFilters: Array<{ field: string; operator: string; values: string[] }> | null = null;

    if (filtersStr) {
      try {
        const parsed = JSON.parse(filtersStr);
        if (Array.isArray(parsed)) {
          // Normalize shape and sanitize duplicates by (member/field + operator)
          const normalized: InFilter[] = parsed.map((f: any) => ({
            field: f.field || f.member,
            operator: f.operator,
            values: f.values || [],
            comparisonEnabled: f.comparisonEnabled,
            comparisonValues: f.comparisonValues,
            comparisonType: f.comparisonType
          }));
          const { sanitized, hadDuplicates } = sanitizeFilters(normalized);
          if (hadDuplicates) {
            console.warn('[Dataset Query] Duplicate filters detected; sanitized by member+operator:', normalized);
          }
          filters = sanitized as any;
          try {
            console.log('[Dataset Query] Sanitized filters:', filters.map(f => ({ field: (f as any).field, operator: (f as any).operator, values: (f as any).values })));
          } catch {}

          // Extract comparison filters if any filter has comparison enabled
          const compSource = filters as any as InFilter[];
          const hasComparison = compSource.some((f) => f.comparisonEnabled && f.comparisonValues && Array.isArray(f.comparisonValues));

          if (hasComparison) {
            // Build comparison filters by replacing ONLY the comparison-enabled filter values
            comparisonFilters = compSource.map((f) => {
              if (f.comparisonEnabled && f.comparisonValues) {
                return {
                  field: f.field || f.member || '',
                  operator: f.operator,
                  values: f.comparisonValues as string[],
                };
              }
              return {
                field: f.field || f.member || '',
                operator: f.operator,
                values: f.values as string[],
              };
            }) as any;
            try {
              console.log('[Dataset Query] Comparison filters:', comparisonFilters.map(f => ({ field: f.field, operator: f.operator, values: f.values })));
            } catch {}
          }
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
      limit,
      fillGaps
    };

    // Create query hash for caching
    const queryHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(queryConfig))
      .digest('hex');

    // Check cache (unless debugNoCache active)
    if (!debugNoCache) {
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

    // Define all possible dimensions for the platform
    const allPossibleDimensions = ['date', 'query', 'page', 'device', 'country'];

    // Execute current period query
    let currentData: any[];
    let comparisonData: any[] | null = null;
    let deltas: any[] | null = null;

    if (comparisonFilters) {
      // COMPARISON MODE: Execute dual queries
      console.log('[Dataset Query] Comparison mode enabled, executing dual-period queries');

      // Build and execute current period query
      const currentQuery = buildPeriodQuery(
        bigqueryTable,
        queryConfig.dimensions,
        queryConfig.metrics,
        queryConfig.filters,
        platformMetadata,
        'current',
        allPossibleDimensions,
        { fillGaps, workspaceId: dataset.workspace_id, chartType, sortBy, sortDirection, limit, offset }
      );
      console.log('[Dataset Query] Current period SQL:', currentQuery);
      currentData = await executeQuery(currentQuery);
      try {
        const sumClicks = Array.isArray(currentData) ? currentData.reduce((s: number, r: any) => s + (Number(r.clicks) || 0), 0) : 0;
        const sumImpr = Array.isArray(currentData) ? currentData.reduce((s: number, r: any) => s + (Number(r.impressions) || 0), 0) : 0;
        console.log('[Dataset Query] Current period results:', {
          rowCount: currentData.length,
          firstRow: currentData[0],
          keys: Object.keys(currentData?.[0] || {}),
          sum: { clicks: sumClicks, impressions: sumImpr }
        });
      } catch {}

      // Build and execute comparison period query
      const comparisonQuery = buildPeriodQuery(
        bigqueryTable,
        queryConfig.dimensions,
        queryConfig.metrics,
        comparisonFilters,
        platformMetadata,
        'comparison',
        allPossibleDimensions,
        { fillGaps, workspaceId: dataset.workspace_id, chartType, sortBy, sortDirection, limit, offset }
      );
      console.log('[Dataset Query] Comparison period SQL:', comparisonQuery);
      comparisonData = await executeQuery(comparisonQuery);
      try {
        const sumClicksC = Array.isArray(comparisonData) ? comparisonData.reduce((s: number, r: any) => s + (Number(r.clicks) || 0), 0) : 0;
        const sumImprC = Array.isArray(comparisonData) ? comparisonData.reduce((s: number, r: any) => s + (Number(r.impressions) || 0), 0) : 0;
        console.log('[Dataset Query] Comparison period results:', {
          rowCount: comparisonData.length,
          firstRow: comparisonData[0],
          keys: Object.keys(comparisonData?.[0] || {}),
          sum: { clicks: sumClicksC, impressions: sumImprC }
        });
      } catch {}

      // Calculate deltas
      deltas = calculateDeltas(currentData, comparisonData, queryConfig.metrics);
      console.log('[Dataset Query] Calculated deltas:', deltas);

    } else {
      // SINGLE PERIOD MODE: Execute standard query (legacy behavior)
      console.log('[Dataset Query] Single period mode, executing standard query');

      const currentQuery = buildPeriodQuery(
        bigqueryTable,
        queryConfig.dimensions,
        queryConfig.metrics,
        queryConfig.filters,
        platformMetadata,
        'current',
        allPossibleDimensions,
        { fillGaps, workspaceId: dataset.workspace_id, chartType, sortBy, sortDirection, limit, offset }
      );
      console.log('[Dataset Query] SQL:', currentQuery);
      currentData = await executeQuery(currentQuery);
      try {
        const sumClicks = Array.isArray(currentData) ? currentData.reduce((s: number, r: any) => s + (Number(r.clicks) || 0), 0) : 0;
        const sumImpr = Array.isArray(currentData) ? currentData.reduce((s: number, r: any) => s + (Number(r.impressions) || 0), 0) : 0;
        console.log('[Dataset Query] Single period results:', {
          rowCount: currentData.length,
          firstRow: currentData[0],
          keys: Object.keys(currentData?.[0] || {}),
          sum: { clicks: sumClicks, impressions: sumImpr }
        });
      } catch {}
    }

    // Calculate total count for pagination (if requested)
    let totalCount: number | null = null;
    if (includeTotalCount && !fillGaps && queryConfig.dimensions.length > 0) {
      try {
        // Build WHERE clause for count query
        const countWhereConditions: string[] = [];

        // Add workspace filter
        if (dataset.workspace_id) {
          countWhereConditions.push(`workspace_id = '${dataset.workspace_id.replace(/'/g, "''")}'`);
        }

        // Add filter conditions
        queryConfig.filters.forEach((filter: any) => {
          const field = filter.field || filter.member;
          const operator = filter.operator;
          const values = filter.values || [];

          // Build condition based on operator (simplified for count)
          if (operator === 'inDateRange' && values.length >= 2) {
            countWhereConditions.push(`${field} BETWEEN '${values[0]}' AND '${values[1]}'`);
          } else if ((operator === 'in' || operator === 'inList') && values.length > 0) {
            const valueList = values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
            countWhereConditions.push(`${field} IN (${valueList})`);
          }
        });

        // Build count query
        const groupByFields = queryConfig.dimensions;
        const whereClause = countWhereConditions.length > 0 ? `WHERE ${countWhereConditions.join(' AND ')}` : '';

        const countQuery = `
          SELECT COUNT(*) as total
          FROM (
            SELECT ${groupByFields.join(', ')}
            FROM \`${bigqueryTable}\`
            ${whereClause}
            GROUP BY ${groupByFields.join(', ')}
          )
        `.trim();

        console.log('[Dataset Query] Total count query:', countQuery);
        const countResult = await executeQuery(countQuery);
        totalCount = countResult[0]?.total || 0;
        console.log('[Dataset Query] Total count:', totalCount);
      } catch (error) {
        console.warn('[Dataset Query] Failed to calculate total count:', error);
        totalCount = null;
      }
    }

    // Prepare response payload (structured if comparison, otherwise array)
    let responsePayload: any;
    if (comparisonData && deltas) {
      responsePayload = {
        current: currentData,
        comparison: comparisonData,
        deltas: deltas
      };
    } else {
      responsePayload = currentData;
    }

    // Calculate expiry (based on dataset refresh interval)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (dataset.refresh_interval_days || 1));

    // Store in cache (upsert)
    await supabase
      .from('dataset_cache')
      .upsert([{
        dataset_id: params.id,
        query_hash: queryHash,
        data: responsePayload,
        row_count: Array.isArray(responsePayload) ? responsePayload.length : (responsePayload.current?.length || 0),
        expires_at: expiresAt.toISOString()
      }], {
        onConflict: 'dataset_id,query_hash'
      });

    // Build response based on whether comparison is enabled
    const currentRowCount = Array.isArray(responsePayload) ? responsePayload.length : (responsePayload.current?.length || 0);

    const responseData: any = {
      success: true,
      rowCount: currentRowCount,
      cached: false,
      expiresAt: expiresAt.toISOString(),
      // NEW: Pagination metadata
      metadata: {
        totalCount,
        hasMore: totalCount ? (offset + currentRowCount < totalCount) : false,
        offset,
        limit,
        sortBy,
        sortDirection
      }
    };

    responseData.data = responsePayload;

    return NextResponse.json(responseData);

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
