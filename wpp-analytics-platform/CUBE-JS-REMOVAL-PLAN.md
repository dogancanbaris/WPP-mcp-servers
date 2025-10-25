# Cube.js Removal & New Data Architecture - Implementation Plan

**Date:** 2025-10-23
**Status:** IN PROGRESS - Metadata registry started
**Token Usage:** 455k/1M

---

## ✅ COMPLETED TODAY

### OAuth System (FULLY WORKING):
- ✅ OAuth token auto-loading from file
- ✅ Token refresh script (`refresh-oauth-token.cjs`)
- ✅ OAuth re-authorization script (`get-oauth-token.cjs`)
- ✅ Fresh token with BigQuery scope obtained
- ✅ All MCP tools working (`list_properties`, `query_search_analytics`, `run_bigquery_query`)

### Data Pulled:
- ✅ MindfulSteward GSC data (87 days): 6,268 clicks, 954,034 impressions
- ✅ Top 10 queries
- ✅ Top 10 pages
- ✅ Device breakdown (Mobile 63%, Desktop 34%, Tablet 3%)
- ✅ Country breakdown (10 countries)

### Infrastructure:
- ✅ BigQuery table created: `gsc_mindfulsteward_90days`
- ✅ OAuth working with BigQuery scope

### New Architecture Started:
- ✅ Platform metadata registry created: `frontend/src/lib/metadata/platforms/gsc.json`

---

## 📋 REMAINING TASKS

### Phase 1: Complete Metadata Registry (20 min)

**Create Files:**
1. `frontend/src/lib/metadata/platforms/google-ads.json`
2. `frontend/src/lib/metadata/platforms/analytics.json`
3. `frontend/src/lib/metadata/index.ts` - Registry loader

**Structure for each platform:**
```typescript
{
  id: string;
  name: string;
  table: string; // BigQuery table
  metrics: Metric[];
  dimensions: Dimension[];
  blending: { compatible_platforms, join_keys };
}
```

### Phase 2: Build Query System (30 min)

**Create Files:**

**1. `frontend/src/lib/data/bigquery-client.ts`**
```typescript
import { BigQuery } from '@google-cloud/bigquery';

export function createBigQueryClient() {
  return new BigQuery({
    projectId: 'mcp-servers-475317',
    // Use service account key for server-side
    keyFilename: '/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json'
  });
}

export async function executeQuery(sql: string) {
  const bigquery = createBigQueryClient();
  const [rows] = await bigquery.query(sql);
  return rows;
}
```

**2. `frontend/src/lib/data/query-builder.ts`**
```typescript
import { loadPlatformMetadata } from '../metadata';

export interface QueryConfig {
  platform: string;
  metrics: string[];
  dimensions?: string[];
  dateRange?: [string, string];
  filters?: Filter[];
  limit?: number;
}

export function buildQuery(config: QueryConfig): string {
  const platform = loadPlatformMetadata(config.platform);

  // Build SELECT clause
  const selectFields = [];

  if (config.dimensions) {
    selectFields.push(...config.dimensions.map(d => {
      const dim = platform.dimensions.find(dim => dim.id === d);
      return dim.sql;
    }));
  }

  selectFields.push(...config.metrics.map(m => {
    const metric = platform.metrics.find(met => met.id === m);
    return `${metric.aggregation}(${metric.sql}) AS ${metric.id}`;
  }));

  // Build WHERE clause
  const whereConditions = [];

  if (config.dateRange) {
    whereConditions.push(`date BETWEEN '${config.dateRange[0]}' AND '${config.dateRange[1]}'`);
  }

  if (config.filters) {
    whereConditions.push(...config.filters.map(f =>
      `${f.field} ${f.operator} ${formatValue(f.value)}`
    ));
  }

  // Build complete SQL
  return `
    SELECT ${selectFields.join(', ')}
    FROM \`${platform.table}\`
    ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    ${config.dimensions ? `GROUP BY ${config.dimensions.join(', ')}` : ''}
    ${config.limit ? `LIMIT ${config.limit}` : ''}
  `.trim();
}
```

**3. `frontend/src/app/api/data/query/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { buildQuery } from '@/lib/data/query-builder';
import { executeQuery } from '@/lib/data/bigquery-client';

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // Build SQL from config
    const sql = buildQuery(config);

    // Execute on BigQuery
    const rows = await executeQuery(sql);

    return NextResponse.json({
      success: true,
      data: rows,
      rowCount: rows.length,
      sql // For debugging
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

###Phase 3: Remove Cube.js (15 min)

**Delete:**
1. `/wpp-analytics-platform/cube-backend/` (entire 414MB folder)
2. `frontend/src/lib/cubejs/`
3. `frontend/src/lib/demo/dell-mock-data.ts`

**Update package.json:**
Remove:
```json
"@cubejs-client/core": "^1.3.82",
"@cubejs-client/react": "^1.3.82",
```

Add:
```json
"@tanstack/react-query": "^5.0.0",
"@google-cloud/bigquery": "^7.0.0"
```

### Phase 4: Update Chart Components (60 min)

**Pattern (Apply to all 71 files):**

**OLD (Cube.js):**
```typescript
import { useCubeQuery } from '@cubejs-client/react';
import { cubeApi } from '@/lib/cubejs/client';

const { resultSet, isLoading } = useCubeQuery({
  measures: ['GSC.impressions'],
  timeDimensions: [{ dimension: 'GSC.date', dateRange: 'last 7 days' }]
}, { cubeApi });

const data = resultSet?.tablePivot()[0];
```

**NEW (Direct API):**
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['data', platform, metrics, dateRange],
  queryFn: async () => {
    const res = await fetch('/api/data/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'gsc',
        metrics: ['impressions'],
        dateRange: ['2025-07-25', '2025-10-23']
      })
    });
    return res.json();
  }
});

const value = data?.data?.[0]?.impressions || 0;
```

**Files to update:** All 71 chart components in `frontend/src/components/dashboard-builder/charts/`

### Phase 5: Update Agent Docs (20 min)

**Files:**
1. `.claude/agents/frontend-developer.md`
   - Remove Cube.js references
   - Add new data fetching pattern
   - Document `/api/data/query` usage

2. `.claude/agents/backend-api-specialist.md`
   - Add query builder documentation
   - Add metadata registry explanation
   - Add BigQuery direct access patterns

3. `.claude/agents/database-analytics-architect.md`
   - Update with new architecture
   - Add blending strategies
   - Add BigQuery optimization tips

**Create NEW:**
4. `wpp-analytics-platform/DATA-LAYER-ARCHITECTURE.md`
   - Complete architecture documentation
   - Metadata registry guide
   - Query builder API
   - Agent usage examples

### Phase 6: Insert Data & Test (30 min)

1. Insert MindfulSteward GSC data into BigQuery
2. Create MindfulSteward dashboard with new API
3. Test all chart types render
4. Take screenshot

---

## 🚀 NEXT SESSION EXECUTION ORDER

**Due to token limits (455k used), recommend continuing in fresh session:**

1. Complete metadata registry (Google Ads, Analytics JSONs)
2. Create query builder module
3. Create BigQuery client module
4. Create `/api/data/query` route
5. Update 4 main chart components (Scorecard, TimeSeries, Table, Pie)
6. Test with real data
7. Then update remaining 67 charts in batch

**Estimated time:** 2-3 hours total

---

## 📁 FILES CREATED THIS SESSION

### OAuth System:
- `refresh-oauth-token.cjs` - Auto-refresh access token
- `get-oauth-token.cjs` - Re-authorize with new scopes
- Modified: `src/shared/oauth-client-factory.ts` (token auto-loading)
- Modified: `src/gsc/auth.ts` (added BigQuery scope)

### New Architecture:
- `frontend/src/lib/metadata/platforms/gsc.json` ✅

### Documentation:
- `OAUTH-TOKEN-SOLUTION.md`
- `SESSION-STATUS-REAL-DATA-PLAN.md`
- `CUBE-JS-REMOVAL-PLAN.md` (this file)

---

## 💡 KEY INSIGHTS FROM SESSION

### Why Cube.js Doesn't Fit:
1. Can't JOIN across platforms (agent's core need)
2. Requires separate backend server (complexity)
3. Cache is useless for dynamic queries
4. Semantic layer too rigid for agent flexibility

### Proper Architecture:
1. **BigQuery = Smart Data Layer** (does all aggregation, joining, blending)
2. **Next.js API Routes = Backend Logic** (SQL generation, execution, caching)
3. **Metadata Registry = Platform Definitions** (JSON, agent-readable)
4. **Frontend = Dumb Renderer** (just displays data)

### Agent-Friendly Design:
- Metadata is JSON (easy to read/understand)
- API routes are simple POST endpoints
- SQL is generated from declarative config
- No complex libraries to learn

---

## 🎯 SESSION GOALS ACHIEVED

- ✅ OAuth working end-to-end
- ✅ GSC data pulled successfully
- ✅ BigQuery table created
- ✅ Architecture decision made (remove Cube.js)
- ✅ New metadata-driven system designed
- ✅ First metadata file created (gsc.json)

**Next:** Complete the implementation in fresh session with full context window.
