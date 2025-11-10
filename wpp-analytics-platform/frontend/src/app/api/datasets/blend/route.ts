import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { executeQuery } from '@/lib/data/bigquery-client';
import type { BlendConfig } from '@/types/dashboard-builder';
import type { Dataset } from '@/types/dataset';
import type { DatasetFilterInput } from '@/lib/data/fetchChartData';

interface BlendQueryPayload {
  blendConfig: BlendConfig;
  dimensions: string[];
  metrics: string[];
  filters?: DatasetFilterInput[];
  dateRange?: { start: string; end: string };
  limit?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  chartType?: string;
}

const sanitizeField = (field: string): string => field.replace(/[^a-zA-Z0-9_]/g, '');

const buildTablePath = (dataset: Dataset) =>
  `\`${dataset.bigquery_project_id}.${dataset.bigquery_dataset_id}.${dataset.bigquery_table_id}\``;

const escapeValue = (value: string | number): string =>
  typeof value === 'number' ? value.toString() : value.replace(/'/g, "''");

const buildFilterClauses = (filters: DatasetFilterInput[] = []): string[] => {
  const clauses: string[] = [];
  filters.forEach((filter) => {
    const field = sanitizeField(filter.member || (filter as any).field || '');
    const values = filter.values || [];
    switch (filter.operator) {
      case 'equals':
      case '=':
        if (values[0] !== undefined) {
          clauses.push(`\`${field}\` = '${escapeValue(values[0])}'`);
        }
        break;
      case 'notEquals':
      case '!=':
        if (values[0] !== undefined) {
          clauses.push(`\`${field}\` != '${escapeValue(values[0])}'`);
        }
        break;
      case 'in':
      case 'inList': {
        const list = values.map((v: string) => `'${escapeValue(v)}'`).join(', ');
        if (list.length) clauses.push(`\`${field}\` IN (${list})`);
        break;
      }
      case 'contains':
        if (values[0]) {
          clauses.push(`\`${field}\` LIKE '%${escapeValue(values[0])}%'`);
        }
        break;
      case 'notContains':
        if (values[0]) {
          clauses.push(`\`${field}\` NOT LIKE '%${escapeValue(values[0])}%'`);
        }
        break;
      case 'inDateRange':
        if (values[0] && values[1]) {
          clauses.push(`date BETWEEN '${escapeValue(values[0])}' AND '${escapeValue(values[1])}'`);
        }
        break;
      default:
        break;
    }
  });
  return clauses;
};

const buildDatasetSQL = (options: {
  dataset: Dataset;
  dimensions: string[];
  metrics: string[];
  filters?: DatasetFilterInput[];
  dateRange?: { start: string; end: string };
  limit?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  workspaceId?: string | null;
}): string => {
  const table = buildTablePath(options.dataset);
  const selectDims = options.dimensions.map((dim) => {
    const safe = sanitizeField(dim);
    if (safe === 'date') {
      return "FORMAT_DATE('%Y-%m-%d', date) AS date";
    }
    return `\`${safe}\``;
  });
  const selectMetrics = options.metrics.map((metric) => {
    const safe = sanitizeField(metric);
    return `CAST(SUM(\`${safe}\`) AS FLOAT64) AS ${safe}`;
  });

  const whereClauses: string[] = [];
  if (options.workspaceId && options.dataset.workspace_id === options.workspaceId) {
    whereClauses.push(`workspace_id = '${escapeValue(options.workspaceId)}'`);
  }
  if (options.dateRange) {
    whereClauses.push(`date BETWEEN '${escapeValue(options.dateRange.start)}' AND '${escapeValue(options.dateRange.end)}'`);
  }
  whereClauses.push(...buildFilterClauses(options.filters));

  const groupBy = options.dimensions.length
    ? `GROUP BY ${options.dimensions.map((dim) => (sanitizeField(dim) === 'date' ? 'date' : `\`${sanitizeField(dim)}\``)).join(', ')}`
    : '';

  const sortField = options.sortBy ? sanitizeField(options.sortBy) : '';
  const orderBy = sortField ? `ORDER BY ${sortField} ${options.sortDirection || 'DESC'}` : '';
  const limitClause = options.limit ? `LIMIT ${options.limit}` : '';

  return `SELECT ${[...selectDims, ...selectMetrics].join(', ')}
FROM ${table}
${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
${groupBy}
${orderBy}
${limitClause}`.trim();
};

const rowKey = (row: Record<string, any>, joinKeys: string[]): string =>
  joinKeys.map((key) => String(row[key] ?? '')).join('||');

const ensureDatasetAccess = async (datasetId: string, supabaseClient: Awaited<ReturnType<typeof createClient>>) => {
  const { data, error } = await supabaseClient
    .from('datasets')
    .select('*')
    .eq('id', datasetId)
    .single();

  if (error || !data) {
    throw new Error(`Dataset ${datasetId} not found or inaccessible`);
  }

  return data as Dataset;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BlendQueryPayload;
    if (!body.blendConfig || body.blendConfig.sources.length < 2) {
      return NextResponse.json({ error: 'Blend requires at least two sources' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .single();
    const workspaceId = workspace?.id ?? null;

    for (const source of body.blendConfig.sources) {
      if (!source.metrics || source.metrics.length === 0) {
        return NextResponse.json({ error: 'Each blended source must select at least one metric' }, { status: 400 });
      }
    }

    const joinKeys = Array.from(
      new Set(body.blendConfig.sources.flatMap((source) => source.joinKeys))
    );
    if (joinKeys.length === 0) {
      return NextResponse.json({ error: 'Blend requires at least one join key' }, { status: 400 });
    }

    const datasets = await Promise.all(
      body.blendConfig.sources.map((source) => ensureDatasetAccess(source.datasetId, supabase))
    );

    const sourceMap = new Map<string, { config: BlendConfig['sources'][number]; dataset: Dataset }>();
    body.blendConfig.sources.forEach((source, index) => {
      sourceMap.set(source.id, { config: source, dataset: datasets[index] });
    });

    const dimensionSet = Array.from(new Set([...body.dimensions, ...joinKeys]));

    const rowsBySource = await Promise.all(
      body.blendConfig.sources.map(async (source) => {
        const dataset = sourceMap.get(source.id)!.dataset;
        const sql = buildDatasetSQL({
          dataset,
          dimensions: dimensionSet,
          metrics: source.metrics,
          filters: body.filters,
          dateRange: body.dateRange,
          limit: body.limit ?? 1000,
          sortBy: body.sortBy,
          sortDirection: body.sortDirection,
          workspaceId,
        });
        const rows = await executeQuery(sql);
        return rows.map((row) => ({
          ...row,
          __sourceId: source.id,
        }));
      })
    );

    const primarySourceId = body.blendConfig.primarySourceId;
    const primaryRows = rowsBySource.find((rows) => rows[0]?.__sourceId === primarySourceId) || [];
    const merged = new Map<string, Record<string, any>>();

    primaryRows.forEach((row) => {
      const key = rowKey(row, joinKeys);
      const clean = { ...row };
      delete clean.__sourceId;
      merged.set(key, clean);
    });

    rowsBySource.forEach((rows) => {
      rows.forEach((row) => {
        const sourceId = row.__sourceId;
        const sourceMeta = sourceMap.get(sourceId)!.config;
        const key = rowKey(row, joinKeys);
        const clean = { ...row };
        delete clean.__sourceId;
        let target = merged.get(key);
        if (!target) {
          if (sourceMeta.joinType === 'inner' && sourceId !== primarySourceId) {
            return;
          }
          target = {};
          joinKeys.forEach((joinKey) => {
            target![joinKey] = clean[joinKey];
          });
        }
        sourceMeta.metrics.forEach((metric) => {
          const alias = sourceId === primarySourceId
            ? metric
            : `${sourceMeta.alias || sourceId}_${metric}`;
          target![alias] = clean[metric];
        });
        merged.set(key, target!);
      });
    });

    let result = Array.from(merged.values());

    if (body.sortBy) {
      const sortField = body.sortBy;
      const direction = body.sortDirection === 'ASC' ? 1 : -1;
      result = result.sort((a, b) => {
        const av = a[sortField] ?? 0;
        const bv = b[sortField] ?? 0;
        if (av === bv) return 0;
        return av > bv ? direction : -direction;
      });
    }

    if (body.limit && result.length > body.limit) {
      result = result.slice(0, body.limit);
    }

    return NextResponse.json({
      data: result,
      metadata: {
        type: 'blend',
        joinKeys,
        sourceCount: body.blendConfig.sources.length,
      },
    });
  } catch (error) {
    console.error('[Blend API] error', error);
    return NextResponse.json({ error: 'Blend query failed' }, { status: 500 });
  }
}
