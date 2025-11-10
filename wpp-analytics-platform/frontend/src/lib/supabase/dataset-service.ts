/**
 * Dataset Service - CRUD operations for datasets in Supabase
 *
 * Datasets represent registered BigQuery tables that can be queried by dashboards.
 */

import { createClient } from './client';
import type {
  Dataset,
  DatasetOption,
  ListDatasetsResponse,
  GetDatasetResponse,
} from '@/types/dataset';

/**
 * List all datasets in user's workspace
 */
export async function listDatasets(): Promise<ListDatasetsResponse> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    // List datasets in workspace (or global datasets with null workspace_id)
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .or(`workspace_id.eq.${workspace.id},workspace_id.is.null`)
      .order('name', { ascending: true });

    if (error) {
      console.error('List datasets error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, datasets: data as Dataset[] };
  } catch (error) {
    console.error('listDatasets error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get dataset by ID
 */
export async function getDataset(datasetId: string): Promise<GetDatasetResponse> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (error) {
      console.error('Get dataset error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Dataset not found' };
    }

    return { success: true, dataset: data as Dataset };
  } catch (error) {
    console.error('getDataset error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convert Dataset to DatasetOption for UI display
 */
export function toDatasetOption(dataset: Dataset): DatasetOption {
  const platform = dataset.platform_metadata?.platform || 'bigquery';

  return {
    id: dataset.id,
    name: dataset.name,
    platform: platform as any,
    description: dataset.description || undefined,
    table: `${dataset.bigquery_project_id}.${dataset.bigquery_dataset_id}.${dataset.bigquery_table_id}`,
  };
}

/**
 * Convert multiple datasets to options
 */
export function toDatasetsOptions(datasets: Dataset[]): DatasetOption[] {
  return datasets.map(toDatasetOption);
}
