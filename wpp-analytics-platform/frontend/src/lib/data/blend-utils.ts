import type { BlendConfig, BlendSourceConfig } from '@/types/dashboard-builder';
import type { DataSource } from '@/lib/api/dashboards';

export interface BlendSummary {
  summaryLabel?: string;
  details: string[];
  joinKeys: string[];
  primarySource?: BlendSourceConfig;
}

const aliasForSource = (source: BlendSourceConfig, dataSources: DataSource[]) => {
  if (source.alias) return source.alias;
  const dataset = dataSources.find((ds) => ds.id === source.datasetId);
  return dataset?.name || dataset?.table || source.datasetId;
};

export const findPrimaryBlendSource = (blendConfig?: BlendConfig): BlendSourceConfig | undefined => {
  if (!blendConfig || !blendConfig.sources || blendConfig.sources.length === 0) {
    return undefined;
  }
  return (
    blendConfig.sources.find((source) => source.id === blendConfig.primarySourceId) ||
    blendConfig.sources[0]
  );
};

export const getBlendSummary = (blendConfig: BlendConfig | undefined, dataSources: DataSource[]): BlendSummary => {
  if (!blendConfig || !blendConfig.sources || blendConfig.sources.length === 0) {
    return { details: [], joinKeys: [] };
  }

  const aliasList = blendConfig.sources.map((source) => aliasForSource(source, dataSources));
  const primarySource = findPrimaryBlendSource(blendConfig);
  const joinKeys = primarySource?.joinKeys || [];

  let summaryLabel: string | undefined;
  if (aliasList.length === 1) {
    summaryLabel = aliasList[0];
  } else if (aliasList.length === 2) {
    summaryLabel = `${aliasList[0]} ↔ ${aliasList[1]}`;
  } else {
    summaryLabel = `${aliasList[0]} + ${aliasList.length - 1} more`;
  }

  const details = [
    joinKeys.length ? `Join keys: ${joinKeys.join(', ')}` : undefined,
    ...blendConfig.sources.map((source) => {
      const alias = aliasForSource(source, dataSources);
      const metricCount = source.metrics.length;
      const metricLabel = metricCount === 1 ? 'metric' : 'metrics';
      return `${alias} • ${metricCount} ${metricLabel}`;
    }),
  ].filter(Boolean) as string[];

  return {
    summaryLabel,
    details,
    joinKeys,
    primarySource,
  };
};

export const getPrimaryBlendDatasetInfo = (
  blendConfig: BlendConfig | undefined,
  dataSources: DataSource[]
) => {
  const primarySource = findPrimaryBlendSource(blendConfig);
  if (!primarySource) return undefined;
  const alias = aliasForSource(primarySource, dataSources);
  return {
    datasetId: primarySource.datasetId,
    label: alias || 'Blended Source',
  };
};
