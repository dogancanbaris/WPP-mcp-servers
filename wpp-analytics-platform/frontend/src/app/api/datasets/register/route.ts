/**
 * Dataset Registration API
 *
 * POST /api/datasets/register
 *
 * Registers a BigQuery table as a dataset in the platform.
 * Detects schema, matches against platform metadata, enables caching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadPlatformMetadata } from '@/lib/metadata';
import { getBigQueryClient } from '@/lib/data/bigquery-client';

export const dynamic = 'force-dynamic';

interface RegisterDatasetRequest {
  name: string;
  bigquery_table: string; // Full table ref: project.dataset.table
  platform: string; // 'gsc', 'google_ads', etc.
  description?: string;
  refresh_interval_days?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // TEMPORARY: Bypass auth for testing
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // If no auth, use default workspace for testing
    let workspaceId = '945907d8-7e88-45c4-8fde-9db35d5f5ce2'; // John Baris Workspace

    if (user) {
      // Get user's workspace if authenticated
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (workspace) {
        workspaceId = workspace.id;
      }
    }

    const workspace = { id: workspaceId };

    // Parse request
    const body: RegisterDatasetRequest = await request.json();
    const { name, bigquery_table, platform, description, refresh_interval_days = 1 } = body;

    if (!name || !bigquery_table || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: name, bigquery_table, platform' },
        { status: 400 }
      );
    }

    // Load platform metadata to validate
    const platformMeta = loadPlatformMetadata(platform);

    // Parse BigQuery table reference
    const tableParts = bigquery_table.split('.');
    if (tableParts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid bigquery_table format. Expected: project.dataset.table' },
        { status: 400 }
      );
    }

    const [projectId, datasetId, tableId] = tableParts;

    // Query BigQuery to detect schema using OAuth authentication
    const bigquery = getBigQueryClient();
    const table = bigquery.dataset(datasetId).table(tableId);

    let tableMetadata;
    try {
      [tableMetadata] = await table.getMetadata();
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to access BigQuery table: ${error.message}` },
        { status: 400 }
      );
    }

    // Detect columns
    const detectedColumns = tableMetadata.schema.fields.map((field: any) => ({
      name: field.name,
      type: field.type,
      mode: field.mode
    }));

    console.log('[Dataset Register] Detected columns:', detectedColumns);

    // Store dataset in Supabase
    const { data: dataset, error: insertError } = await supabase
      .from('datasets')
      .insert([{
        workspace_id: workspace.id,
        name,
        description,
        bigquery_project_id: projectId,
        bigquery_dataset_id: datasetId,
        bigquery_table_id: tableId,
        platform_metadata: {
          platform: platform,
          detected_schema: detectedColumns,
          platform_definition: platformMeta
        },
        refresh_interval_days,
        last_refreshed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('[Dataset Register] Error:', insertError);
      return NextResponse.json(
        { error: `Failed to register dataset: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dataset: {
        id: dataset.id,
        name: dataset.name,
        bigquery_table: bigquery_table,
        platform,
        schema: detectedColumns
      },
      message: `Dataset '${name}' registered successfully`
    });

  } catch (error) {
    console.error('[Dataset Register] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
