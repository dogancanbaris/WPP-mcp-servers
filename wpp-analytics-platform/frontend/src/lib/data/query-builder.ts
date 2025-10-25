/**
 * SQL Query Builder for BigQuery
 *
 * Generates optimized BigQuery SQL from declarative configurations.
 * Supports single-platform queries, multi-platform blending, time comparisons.
 */

import { loadPlatformMetadata, getMetric, getDimension, getJoinKeys } from '../metadata';

export interface Filter {
  field: string;
  operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'IN' | 'NOT IN' | 'LIKE' | 'BETWEEN';
  value: string | number | string[] | [string, string];
}

export interface QueryConfig {
  platform: string;              // 'gsc', 'google_ads', etc.
  metrics: string[];              // ['clicks', 'impressions']
  dimensions?: string[];          // ['date', 'query']
  dateRange?: [string, string];  // ['2025-07-25', '2025-10-23']
  filters?: Filter[];             // Additional WHERE conditions
  orderBy?: { field: string; direction: 'ASC' | 'DESC' };
  limit?: number;
  clientId?: string;             // For multi-tenant filtering
}

export interface BlendConfig {
  platforms: string[];            // ['gsc', 'google_ads']
  blendOn: string[];             // ['date', 'query']
  metrics: Record<string, string[]>; // { gsc: ['clicks'], google_ads: ['cost'] }
  calculatedMetrics?: string[];  // ['gsc_clicks + google_ads_clicks AS total_clicks']
  dateRange?: [string, string];
  filters?: Filter[];
  limit?: number;
  clientId?: string;
}

/**
 * Build single-platform query
 */
export function buildQuery(config: QueryConfig): string {
  const platform = loadPlatformMetadata(config.platform);

  // Build SELECT clause
  const selectFields: string[] = [];

  // Add dimensions (no aggregation)
  if (config.dimensions && config.dimensions.length > 0) {
    selectFields.push(...config.dimensions.map(dimId => {
      const dim = getDimension(config.platform, dimId);
      return `${dim.sql} AS ${dimId}`;
    }));
  }

  // Add metrics (with aggregation)
  selectFields.push(...config.metrics.map(metricId => {
    const metric = getMetric(config.platform, metricId);
    return `${metric.aggregation}(${metric.sql}) AS ${metricId}`;
  }));

  // Build WHERE clause
  const whereConditions: string[] = [];

  // Multi-tenant filter
  if (config.clientId) {
    whereConditions.push(`client_id = '${config.clientId}'`);
  }

  // Date range filter
  if (config.dateRange) {
    whereConditions.push(`date BETWEEN '${config.dateRange[0]}' AND '${config.dateRange[1]}'`);
  }

  // Custom filters
  if (config.filters) {
    whereConditions.push(...config.filters.map(filter => buildFilterCondition(filter)));
  }

  // Build GROUP BY
  const groupBy = config.dimensions && config.dimensions.length > 0
    ? `GROUP BY ${config.dimensions.join(', ')}`
    : '';

  // Build ORDER BY
  const orderBy = config.orderBy
    ? `ORDER BY ${config.orderBy.field} ${config.orderBy.direction}`
    : '';

  // Build LIMIT
  const limit = config.limit ? `LIMIT ${config.limit}` : '';

  // Assemble final SQL
  return `
SELECT
  ${selectFields.join(',\n  ')}
FROM \`${platform.table}\`
${whereConditions.length > 0 ? `WHERE ${whereConditions.join('\n  AND ')}` : ''}
${groupBy}
${orderBy}
${limit}
  `.trim();
}

/**
 * Build multi-platform blend query (FULL OUTER JOIN)
 */
export function buildBlendQuery(config: BlendConfig): string {
  if (config.platforms.length < 2) {
    throw new Error('Blending requires at least 2 platforms');
  }

  // Build CTE for each platform
  const ctes = config.platforms.map((platformId, index) => {
    const platform = loadPlatformMetadata(platformId);
    const platformMetrics = config.metrics[platformId] || [];

    // Build SELECT for this platform
    const selectFields = [
      ...config.blendOn.map(key => {
        const dim = getDimension(platformId, key);
        return `${dim.sql} AS ${key}`;
      }),
      ...platformMetrics.map(metricId => {
        const metric = getMetric(platformId, metricId);
        return `${metric.aggregation}(${metric.sql}) AS ${platformId}_${metricId}`;
      })
    ];

    const whereConditions = [];

    if (config.clientId) {
      whereConditions.push(`client_id = '${config.clientId}'`);
    }

    if (config.dateRange) {
      whereConditions.push(`date BETWEEN '${config.dateRange[0]}' AND '${config.dateRange[1]}'`);
    }

    return `
${platformId}_data AS (
  SELECT
    ${selectFields.join(',\n    ')}
  FROM \`${platform.table}\`
  ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
  GROUP BY ${config.blendOn.join(', ')}
)`;
  });

  // Build FULL OUTER JOIN chain
  const [firstPlatform, ...restPlatforms] = config.platforms;
  let joinChain = `${firstPlatform}_data`;

  for (const platform of restPlatforms) {
    const joinConditions = config.blendOn.map(key =>
      `${firstPlatform}_data.${key} = ${platform}_data.${key}`
    );

    joinChain += `
  FULL OUTER JOIN ${platform}_data
    ON ${joinConditions.join(' AND ')}`;
  }

  // Build final SELECT with COALESCE for join keys
  const finalSelect = [
    ...config.blendOn.map(key =>
      `COALESCE(${config.platforms.map(p => `${p}_data.${key}`).join(', ')}) AS ${key}`
    ),
    ...config.platforms.flatMap(platformId =>
      (config.metrics[platformId] || []).map(metricId =>
        `${platformId}_data.${platformId}_${metricId} AS ${platformId}_${metricId}`
      )
    )
  ];

  // Add calculated metrics
  if (config.calculatedMetrics) {
    finalSelect.push(...config.calculatedMetrics);
  }

  return `
WITH
  ${ctes.join(',\n  ')}

SELECT
  ${finalSelect.join(',\n  ')}
FROM ${joinChain}
${config.limit ? `LIMIT ${config.limit}` : ''}
  `.trim();
}

/**
 * Build filter condition SQL
 */
function buildFilterCondition(filter: Filter): string {
  switch (filter.operator) {
    case 'BETWEEN':
      if (!Array.isArray(filter.value) || filter.value.length !== 2) {
        throw new Error('BETWEEN operator requires array of 2 values');
      }
      return `${filter.field} BETWEEN '${filter.value[0]}' AND '${filter.value[1]}'`;

    case 'IN':
    case 'NOT IN':
      if (!Array.isArray(filter.value)) {
        throw new Error(`${filter.operator} operator requires array of values`);
      }
      const values = filter.value.map(v => `'${v}'`).join(', ');
      return `${filter.field} ${filter.operator} (${values})`;

    case 'LIKE':
      return `${filter.field} LIKE '%${filter.value}%'`;

    default:
      return `${filter.field} ${filter.operator} '${filter.value}'`;
  }
}

/**
 * Build time comparison query (period over period)
 */
export function buildTimeComparisonQuery(
  platform: string,
  metric: string,
  currentPeriod: [string, string],
  previousPeriod: [string, string]
): string {
  const platformMeta = loadPlatformMetadata(platform);
  const metricDef = getMetric(platform, metric);

  return `
WITH current_period AS (
  SELECT
    ${metricDef.aggregation}(${metricDef.sql}) AS value
  FROM \`${platformMeta.table}\`
  WHERE date BETWEEN '${currentPeriod[0]}' AND '${currentPeriod[1]}'
),
previous_period AS (
  SELECT
    ${metricDef.aggregation}(${metricDef.sql}) AS value
  FROM \`${platformMeta.table}\`
  WHERE date BETWEEN '${previousPeriod[0]}' AND '${previousPeriod[1]}'
)
SELECT
  current.value AS current_value,
  previous.value AS previous_value,
  ((current.value - previous.value) / previous.value) * 100 AS change_percent
FROM current_period current
CROSS JOIN previous_period previous
  `.trim();
}

/**
 * Calculate previous period dates
 */
export function calculatePreviousPeriod(
  startDate: string,
  endDate: string
): [string, string] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - diffDays);

  return [
    prevStart.toISOString().split('T')[0],
    prevEnd.toISOString().split('T')[0]
  ];
}
