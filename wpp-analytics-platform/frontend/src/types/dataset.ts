/**
 * Dataset Type Definitions
 *
 * Datasets represent registered BigQuery tables that can be queried by dashboards.
 * Each dataset has metadata about its schema, platform, and caching settings.
 */

export type PlatformType = 'gsc' | 'google_ads' | 'analytics' | 'bigquery';

/**
 * Dataset from Supabase datasets table
 */
export interface Dataset {
  id: string;
  workspace_id: string | null;
  name: string;
  description: string | null;

  // BigQuery reference
  bigquery_project_id: string;
  bigquery_dataset_id: string;
  bigquery_table_id: string;

  // Platform metadata
  platform_metadata: {
    platform: PlatformType;
    property?: string;
    detected_schema?: Array<{
      name: string;
      type: string;
      mode?: string;
    }>;
    platform_definition?: any;
  } | null;

  // Cache settings
  last_refreshed_at: string;
  refresh_interval_days: number;
  gemini_generated_at: string | null;
}

/**
 * Simplified dataset for UI display
 */
export interface DatasetOption {
  id: string;
  name: string;
  platform: PlatformType;
  description?: string;
  table: string; // Full BigQuery table reference
}

/**
 * Dataset registration request
 */
export interface RegisterDatasetRequest {
  name: string;
  bigquery_table: string; // project.dataset.table
  platform: PlatformType;
  description?: string;
  refresh_interval_days?: number;
}

/**
 * Dataset API responses
 */
export interface ListDatasetsResponse {
  success: boolean;
  datasets?: Dataset[];
  error?: string;
}

export interface GetDatasetResponse {
  success: boolean;
  dataset?: Dataset;
  error?: string;
}

export interface RegisterDatasetResponse {
  success: boolean;
  dataset?: {
    id: string;
    name: string;
    bigquery_table: string;
    platform: string;
    schema: Array<{
      name: string;
      type: string;
      mode?: string;
    }>;
  };
  message?: string;
  error?: string;
}
