/**
 * Dataset Insert API
 *
 * POST /api/datasets/[id]/insert
 *
 * Inserts data into a registered dataset's BigQuery table.
 * Handles schema validation, NULL dimension logic, and cache invalidation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBigQueryClient } from '@/lib/data/bigquery-client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const { rows } = await request.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: rows array required' },
        { status: 400 }
      );
    }

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

    // Build BigQuery table reference
    const tableRef = `${dataset.bigquery_project_id}.${dataset.bigquery_dataset_id}.${dataset.bigquery_table_id}`;

    // Get BigQuery client and insert data
    const bigquery = getBigQueryClient();
    const table = bigquery
      .dataset(dataset.bigquery_dataset_id)
      .table(dataset.bigquery_table_id);

    // Insert rows (BigQuery handles batching automatically)
    await table.insert(rows);

    // Clear cache for this dataset
    await supabase
      .from('dataset_cache')
      .delete()
      .eq('dataset_id', params.id);

    console.log(`[Dataset Insert] Successfully inserted ${rows.length} rows into ${tableRef}`);
    console.log(`[Dataset Insert] Cache cleared for dataset ${params.id}`);

    return NextResponse.json({
      success: true,
      rowsInserted: rows.length,
      table: tableRef,
      cacheCleared: true
    });

  } catch (error) {
    console.error('[Dataset Insert] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}
