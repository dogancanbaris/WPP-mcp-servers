/**
 * Platform Metadata Registry
 *
 * Loads platform metadata (metrics, dimensions, blending rules) from JSON files.
 * This registry allows agents to understand what data is available and how to query it.
 */

import gscMetadata from './platforms/gsc.json';

export interface Metric {
  id: string;
  name: string;
  description?: string;
  sql: string;
  type: 'INTEGER' | 'FLOAT' | 'STRING';
  aggregation: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  format?: 'number' | 'percentage' | 'currency';
  decimals?: number;
  icon?: string;
  color?: string;
  inverted?: boolean;
  thresholds?: Array<{ value: number; label: string; color: string }>;
}

export interface Dimension {
  id: string;
  name: string;
  description?: string;
  sql: string;
  type: 'DATE' | 'STRING' | 'INTEGER';
  cardinality?: 'LOW' | 'MEDIUM' | 'HIGH';
  join_key?: boolean;
  filterable?: boolean;
  filter_type?: 'daterange' | 'search' | 'multiselect' | 'slider';
  values?: string[];
  maps_to?: Record<string, string>;
  granularities?: string[];
}

export interface PlatformMetadata {
  id: string;
  name: string;
  description: string;
  table: string;
  partition_field?: string;
  cluster_fields?: string[];
  metrics: Metric[];
  dimensions: Dimension[];
  blending?: {
    compatible_platforms: string[];
    join_keys: string[];
    common_metrics?: Record<string, string>;
  };
  default_query?: {
    dimensions: string[];
    metrics: string[];
    dateRange: string;
    limit: number;
  };
}

/**
 * Registry of all platform metadata
 */
const platformRegistry: Record<string, PlatformMetadata> = {
  gsc: gscMetadata as PlatformMetadata,
  // Add more as we create them:
  // google_ads: googleAdsMetadata,
  // analytics: analyticsMetadata,
};

/**
 * Load metadata for a specific platform
 */
export function loadPlatformMetadata(platformId: string): PlatformMetadata {
  const metadata = platformRegistry[platformId];

  if (!metadata) {
    throw new Error(`Platform '${platformId}' not found in metadata registry. Available: ${Object.keys(platformRegistry).join(', ')}`);
  }

  return metadata;
}

/**
 * Get all available platforms
 */
export function getAllPlatforms(): PlatformMetadata[] {
  return Object.values(platformRegistry);
}

/**
 * Get metric definition from platform
 */
export function getMetric(platformId: string, metricId: string): Metric {
  const platform = loadPlatformMetadata(platformId);
  const metric = platform.metrics.find(m => m.id === metricId);

  if (!metric) {
    throw new Error(`Metric '${metricId}' not found in platform '${platformId}'`);
  }

  return metric;
}

/**
 * Get dimension definition from platform
 */
export function getDimension(platformId: string, dimensionId: string): Dimension {
  const platform = loadPlatformMetadata(platformId);
  const dimension = platform.dimensions.find(d => d.id === dimensionId);

  if (!dimension) {
    throw new Error(`Dimension '${dimensionId}' not found in platform '${platformId}'`);
  }

  return dimension;
}

/**
 * Check if two platforms can be blended together
 */
export function canBlendPlatforms(platform1: string, platform2: string): boolean {
  const p1 = loadPlatformMetadata(platform1);

  if (!p1.blending) {
    return false;
  }

  return p1.blending.compatible_platforms.includes(platform2);
}

/**
 * Get common join keys between two platforms
 */
export function getJoinKeys(platform1: string, platform2: string): string[] {
  const p1 = loadPlatformMetadata(platform1);
  const p2 = loadPlatformMetadata(platform2);

  if (!canBlendPlatforms(platform1, platform2)) {
    return [];
  }

  // Find dimensions that are join keys in both platforms
  const p1JoinKeys = p1.dimensions.filter(d => d.join_key).map(d => d.id);
  const p2JoinKeys = p2.dimensions.filter(d => d.join_key).map(d => d.id);

  return p1JoinKeys.filter(key => p2JoinKeys.includes(key));
}
