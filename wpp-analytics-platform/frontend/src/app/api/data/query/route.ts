/**
 * Data Query API Route
 *
 * POST /api/data/query
 *
 * Executes BigQuery queries based on declarative configuration.
 * Replaces Cube.js semantic layer with direct BigQuery access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildQuery, buildTimeComparisonQuery, calculatePreviousPeriod, QueryConfig } from '@/lib/data/query-builder';
import { executeQuery, executeQueryWithMetadata } from '@/lib/data/bigquery-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Execute data query
 */
export async function POST(request: NextRequest) {
  try {
    const config: QueryConfig = await request.json();

    // Validate required fields
    if (!config.platform) {
      return NextResponse.json(
        { error: 'Missing required field: platform' },
        { status: 400 }
      );
    }

    if (!config.metrics || config.metrics.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: metrics' },
        { status: 400 }
      );
    }

    // Build SQL query
    const sql = buildQuery(config);

    // Execute with metadata
    const result = await executeQueryWithMetadata(sql);

    return NextResponse.json({
      success: true,
      data: result.rows,
      metadata: {
        rowCount: result.metadata.rowCount,
        bytesProcessed: result.metadata.bytesProcessed,
        estimatedCost: result.metadata.estimatedCost,
        durationMs: result.metadata.durationMs,
        sql: result.metadata.sql
      }
    });

  } catch (error) {
    console.error('[API /data/query] Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get query template/example
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');

  if (!platform) {
    return NextResponse.json({
      example: {
        platform: 'gsc',
        metrics: ['clicks', 'impressions'],
        dimensions: ['date'],
        dateRange: ['2025-07-25', '2025-10-23'],
        limit: 100
      },
      description: 'POST request body format for querying data'
    });
  }

  // Return example for specific platform
  return NextResponse.json({
    platform,
    example: {
      platform,
      metrics: ['clicks'],
      dimensions: ['date', 'query'],
      dateRange: ['2025-10-01', '2025-10-23'],
      limit: 10,
      orderBy: { field: 'clicks', direction: 'DESC' }
    }
  });
}
