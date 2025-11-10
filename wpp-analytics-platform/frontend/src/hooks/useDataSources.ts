import { useCallback, useEffect, useState } from 'react';
import type { DataSource, Field } from '@/lib/api/dashboards';
import { listDatasets } from '@/lib/supabase/dataset-service';
import type { Dataset } from '@/types/dataset';

export interface UseDataSourcesResult {
  dataSources: DataSource[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Shared hook for fetching dashboard data sources + field metadata.
 * Ensures sidebar panels and bulk editors reuse the same request.
 */
const NUMERIC_TYPES = ['int', 'float', 'double', 'num', 'decimal', 'percent', 'ratio'];
const DATE_TYPES = ['date', 'time', 'timestamp'];

const inferFieldType = (type?: string): 'dimension' | 'metric' => {
  if (!type) return 'dimension';
  const lower = type.toLowerCase();
  if (NUMERIC_TYPES.some((token) => lower.includes(token))) {
    return 'metric';
  }
  return 'dimension';
};

const mapDatasetToFields = (dataset: Dataset): Field[] => {
  const schema =
    (dataset.platform_metadata as any)?.platform_definition?.fields ||
    dataset.platform_metadata?.detected_schema ||
    [];

  return schema.map((column: any) => ({
    id: column.name,
    name: column.name,
    type: inferFieldType(column.type),
    dataType: column.type,
    description: column.description,
  }));
};

const mapDatasetToDataSource = (dataset: Dataset): DataSource => ({
  id: dataset.id,
  name: dataset.name,
  type: dataset.platform_metadata?.platform || 'bigquery',
  fields: mapDatasetToFields(dataset),
  table: `${dataset.bigquery_project_id}.${dataset.bigquery_dataset_id}.${dataset.bigquery_table_id}`,
  projectId: dataset.bigquery_project_id,
  datasetId: dataset.bigquery_dataset_id,
  description: dataset.description || undefined,
  shared: !dataset.workspace_id,
});

export function useDataSources(): UseDataSourcesResult {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listDatasets();
      if (!result.success || !result.datasets) {
        throw new Error(result.error || 'Unable to load datasets');
      }
      setDataSources(result.datasets.map(mapDatasetToDataSource));
    } catch (err) {
      console.error('[useDataSources] Failed to load sources', err);
      setError(err instanceof Error ? err.message : 'Failed to load data sources');
      setDataSources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSources();
  }, [fetchSources]);

  return {
    dataSources,
    loading,
    error,
    refresh: fetchSources,
  };
}

/**
 * Utility to flatten all fields for quick lookup.
 */
export function flattenFields(dataSources: DataSource[]): Field[] {
  return dataSources.flatMap((source) => source.fields || []);
}
