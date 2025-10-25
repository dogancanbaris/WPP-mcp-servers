# 🚀 WPP Analytics Platform - Complete Implementation Plan

## Project: LEGO-BLOCK Assembly (Proven Components)
## Timeline: 5 Weeks | All Local Development | Free Tier Everything
## Date: October 21, 2025

---

## 📋 EXECUTIVE SUMMARY

**Approach**: Assemble 6 proven, production-ready components
**Strategy**: Local development → Test everything → Deploy when ready
**Cost**: $0 (all free tiers during development)
**Confidence**: 95% (using battle-tested solutions)

---

## 🧩 THE 6 BUILDING BLOCKS

### **Block 1: Supabase** (Auth + Database)
- **Handles**: Google OAuth, PostgreSQL, workspace isolation (RLS)
- **Has**: MCP Server ✅, CLI ✅, 16,331 examples ✅
- **Setup**: `npx supabase init` (local development)
- **Cost**: FREE (local), FREE tier (production <50K users)

### **Block 2: Cube.js** (Semantic Layer)
- **Handles**: Metrics/dimensions, filters, caching, aggregations
- **Has**: CLI ✅ (`npx cubejs-cli create`)
- **Auto-generates**: Data models from BigQuery tables
- **Cost**: FREE (self-hosted locally)

### **Block 3: Refine** (Dashboard Framework)
- **Handles**: Routing, CRUD, filter management, state
- **Integrations**: Supabase (built-in), Cube.js (built-in)
- **Has**: CLI ✅ (`npx create-refine-app`)
- **Cost**: FREE (open-source)

### **Block 4: ECharts** (Charts - Exclusively)
- **Handles**: 120+ chart types, theming, animations
- **Has**: 1,973 examples ✅, Trust: 9.1
- **Customization**: JavaScript themes (not CSS)
- **Cost**: FREE (Apache 2.0)

### **Block 5: Shadcn/ui** (UI Components)
- **Handles**: Buttons, inputs, dialogs, dropdowns, layouts
- **Has**: 1,248 examples ✅, Trust: 10.0
- **Customization**: Full CSS control (Tailwind)
- **Cost**: FREE

### **Block 6: @dnd-kit** (Drag-and-Drop)
- **Handles**: All drag-drop logic
- **Has**: 9 examples ✅, Trust: 9.3, 4.9M weekly downloads
- **Status**: Actively maintained (2025)
- **Cost**: FREE

---

## 📐 COMPLETE ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND LAYER (What User Sees)                            │
│  ───────────────────────────────────────────────────────    │
│  Refine Framework (Dashboard UI)                            │
│    ├─ Shadcn/ui components (Buttons, Forms, Layouts)        │
│    ├─ ECharts (ALL charts - 120+ types)                     │
│    └─ @dnd-kit (Drag-and-drop dashboard builder)            │
│                                                              │
│  YOU BUILD: Chart renderer, theme connector, glue code      │
└────────────────────────┬────────────────────────────────────┘
                         │ (Refine's data provider)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  SEMANTIC LAYER (Data Intelligence)                          │
│  ───────────────────────────────────────────────────────    │
│  Cube.js (Local Server: http://localhost:4000)              │
│    ├─ Auto-generated data models (via Cube CLI)             │
│    ├─ Metrics: SUM(clicks), AVG(ctr), etc.                  │
│    ├─ Dimensions: date, query, device, country              │
│    ├─ Multi-filter state management (BUILT-IN)              │
│    └─ Query caching & optimization (BUILT-IN)               │
│                                                              │
│  YOU BUILD: Gemini → Enhance Cube models, add formatting    │
└────────────────────────┬────────────────────────────────────┘
                         │ (Cube.js BigQuery connector)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  DATA LAYER (BigQuery + Intelligence)                       │
│  ───────────────────────────────────────────────────────    │
│  BigQuery (User's OAuth token)                              │
│    └─ wpp_marketing.gsc_performance_7days                   │
│                                                              │
│  BigQuery Gemini (Metadata AI)                              │
│    └─ Auto-analyze schema → Generate descriptions           │
│                                                              │
│  YOU BUILD: Gemini caller, metadata enhancer                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  AUTH + STORAGE LAYER (Supabase Local)                      │
│  ───────────────────────────────────────────────────────    │
│  Supabase (Local: http://localhost:54321)                   │
│    ├─ PostgreSQL (users, workspaces, dashboards)            │
│    ├─ Google OAuth (configured via Supabase dashboard)      │
│    ├─ RLS policies (workspace isolation)                    │
│    ├─ Storage (dashboard exports, assets)                   │
│    └─ MCP Server (AI agent access)                          │
│                                                              │
│  YOU BUILD: Database schema, RLS policies (SQL)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 WEEK-BY-WEEK IMPLEMENTATION PLAN

### **WEEK 1: Setup All Components Locally**

#### **Day 1: Supabase Local Setup**

**Morning (3 hours)**:
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
mkdir wpp-analytics-platform
cd wpp-analytics-platform
supabase init

# Start Supabase local (PostgreSQL + Auth + Storage)
supabase start

# You get:
# - Studio URL: http://localhost:54323
# - API URL: http://localhost:54321
# - PostgreSQL: localhost:54322
# - Anon key: eyJhbGc...
# - Service role key: eyJhbGc...
```

**Afternoon (3 hours)**:
```bash
# Create database schema
supabase/migrations/20251021_initial_schema.sql
```

```sql
-- Users (handled by Supabase Auth automatically)

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own workspace
CREATE POLICY "Users can access own workspace"
  ON workspaces FOR ALL
  USING (auth.uid() = user_id);

-- Dashboards
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  bigquery_table TEXT NOT NULL,
  cube_model_name TEXT,  -- Reference to Cube.js model
  layout JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access dashboards in their workspace"
  ON dashboards FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- Table metadata cache
CREATE TABLE table_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  table_id TEXT NOT NULL,
  gemini_metadata JSONB,
  cube_model_path TEXT,  -- Path to Cube.js model file
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, dataset_id, table_id)
);
```

```bash
# Apply migration
supabase db reset

# Configure Google OAuth (in Supabase Studio: localhost:54323)
# 1. Go to Authentication → Providers → Google
# 2. Enable Google provider
# 3. Add Client ID and Secret (from Google Cloud Console)
# 4. Redirect URL: http://localhost:3000/auth/callback
```

**Day 1 Deliverable**: ✅ Supabase running locally, database schema created, OAuth configured

---

#### **Day 2: Cube.js Local Setup**

**Morning (3 hours)**:
```bash
# Create Cube.js project
npx cubejs-cli create cube-backend -d bigquery

cd cube-backend

# Configure BigQuery connection
# Edit .env file:
CUBEJS_DB_TYPE=bigquery
CUBEJS_DB_BQ_PROJECT_ID=mcp-servers-475317
CUBEJS_DB_BQ_KEY_FILE=/path/to/service-account.json

# Start Cube.js dev server
npm run dev

# Cube.js running at:
# - API: http://localhost:4000
# - Playground: http://localhost:4000 (visual query builder)
```

**Afternoon (4 hours)**:
```bash
# Use Cube CLI to auto-generate data models
npx cubejs-cli generate

# Select tables:
# ✓ wpp_marketing.gsc_performance_7days
# ✓ wpp_marketing.ads_performance_7days

# Cube CLI generates:
# schema/GscPerformance7days.js
# schema/AdsPerformance7days.js
```

**Generated file example** (schema/GscPerformance7days.js):
```javascript
cube(`GscPerformance7days`, {
  sql: `SELECT * FROM \`mcp-servers-475317.wpp_marketing.gsc_performance_7days\``,

  measures: {
    // Auto-detected metrics
    clicks: {
      sql: `clicks`,
      type: `sum`,
      title: `Total Clicks`
    },

    impressions: {
      sql: `impressions`,
      type: `sum`,
      title: `Total Impressions`
    },

    avgCtr: {
      sql: `ctr`,
      type: `avg`,
      title: `Average CTR`
    },

    avgPosition: {
      sql: `position`,
      type: `avg`,
      title: `Average Position`
    }
  },

  dimensions: {
    // Auto-detected dimensions
    date: {
      sql: `date`,
      type: `time`
    },

    query: {
      sql: `query`,
      type: `string`,
      title: `Search Query`
    },

    page: {
      sql: `page`,
      type: `string`,
      title: `Landing Page`
    },

    device: {
      sql: `device`,
      type: `string`,
      title: `Device Type`
    },

    country: {
      sql: `country`,
      type: `string`,
      title: `Country`
    }
  }
});
```

**Test in Playground**:
- Open http://localhost:4000
- Select measure: `clicks`
- Select dimension: `date`
- Add filter: `device = 'DESKTOP'`
- Run query → See results

**Day 2 Deliverable**: ✅ Cube.js running, data models auto-generated, can query BigQuery

---

#### **Day 3: Refine Frontend Setup**

**Morning (3 hours)**:
```bash
# Create Refine app with Supabase preset
npx create-refine-app@latest frontend

# Select options:
# - Framework: Next.js
# - UI Framework: Headless (we'll use Shadcn)
# - Data Provider: Supabase
# - Auth Provider: Supabase
# - i18n: No

cd frontend

# Install additional dependencies
npm install \
  @cubejs-client/core \
  @cubejs-client/react \
  echarts \
  echarts-for-react \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/utilities \
  lucide-react
```

**Install Shadcn/ui**:
```bash
npx shadcn@latest init

# Select options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - TypeScript: Yes

# Add essential components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add table
```

**Afternoon (4 hours)**:

**Configure Supabase connection** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # From supabase start output
```

**Configure Cube.js connection** (`.env.local`):
```bash
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=<from cube .env>
```

**Test connection**:
```typescript
// app/test/page.tsx
import { useQuery } from '@cubejs-client/react';

export default function TestPage() {
  const { resultSet, isLoading } = useQuery({
    measures: ['GscPerformance7days.clicks'],
    timeDimensions: [{
      dimension: 'GscPerformance7days.date',
      granularity: 'day',
      dateRange: 'last 7 days'
    }]
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Test Query</h1>
      <pre>{JSON.stringify(resultSet?.tablePivot(), null, 2)}</pre>
    </div>
  );
}
```

**Day 3 Deliverable**: ✅ Refine app created, Supabase connected, Cube.js connected, test query works

---

#### **Day 4: Theme System + First Chart**

**Morning (3 hours)**:

**Create global theme** (`app/globals.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand colors */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;

    /* Chart palette (10 colors) */
    --chart-1: 220 90% 56%;   /* Blue */
    --chart-2: 142 71% 45%;   /* Green */
    --chart-3: 262 83% 58%;   /* Purple */
    --chart-4: 27 87% 67%;    /* Orange */
    --chart-5: 0 84% 60%;     /* Red */
    --chart-6: 173 58% 39%;   /* Teal */
    --chart-7: 43 74% 66%;    /* Yellow */
    --chart-8: 338 78% 68%;   /* Pink */
    --chart-9: 197 37% 24%;   /* Navy */
    --chart-10: 32 95% 44%;   /* Dark Orange */

    /* Semantic colors */
    --success: 142 71% 45%;
    --warning: 43 74% 66%;
    --error: 0 84% 60%;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;

    /* Chart palette (adjusted for dark) */
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 280 65% 60%;
    --chart-4: 30 80% 55%;
    --chart-5: 0 70% 50%;
    --chart-6: 173 50% 35%;
    --chart-7: 43 70% 60%;
    --chart-8: 340 75% 55%;
    --chart-9: 210 50% 40%;
    --chart-10: 32 85% 40%;
  }
}
```

**Create ECharts theme connector** (`lib/echarts-theme.ts`):
```typescript
export function getEChartsTheme(mode: 'light' | 'dark') {
  // Read CSS variables
  const root = document.documentElement;
  const getColor = (varName: string) => {
    const hsl = getComputedStyle(root).getPropertyValue(varName).trim();
    return `hsl(${hsl})`;
  };

  return {
    color: [
      getColor('--chart-1'),
      getColor('--chart-2'),
      getColor('--chart-3'),
      getColor('--chart-4'),
      getColor('--chart-5'),
      getColor('--chart-6'),
      getColor('--chart-7'),
      getColor('--chart-8'),
      getColor('--chart-9'),
      getColor('--chart-10')
    ],
    backgroundColor: getColor('--background'),
    textStyle: {
      color: getColor('--foreground')
    },
    title: {
      textStyle: {
        color: getColor('--foreground')
      }
    },
    legend: {
      textStyle: {
        color: getColor('--foreground')
      }
    }
  };
}
```

**Afternoon (4 hours)**:

**Create first chart component** (`components/charts/line-chart.tsx`):
```typescript
import ReactECharts from 'echarts-for-react';
import { useCubeQuery } from '@cubejs-client/react';
import { useTheme } from 'next-themes';
import { getEChartsTheme } from '@/lib/echarts-theme';

interface LineChartProps {
  measure: string;
  dimension: string;
  filters?: any;
}

export function LineChart({ measure, dimension, filters }: LineChartProps) {
  const { theme } = useTheme();

  const { resultSet, isLoading } = useCubeQuery({
    measures: [measure],
    timeDimensions: [{
      dimension: dimension,
      granularity: 'day',
      dateRange: 'last 7 days'
    }],
    filters: filters || []
  });

  if (isLoading) return <div>Loading...</div>;

  const data = resultSet?.chartPivot();

  const option = {
    xAxis: {
      type: 'category',
      data: data?.map(d => d.x)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data?.map(d => d[measure]),
      type: 'line',
      smooth: true
    }],
    tooltip: {
      trigger: 'axis'
    }
  };

  return (
    <ReactECharts
      option={option}
      theme={getEChartsTheme(theme === 'dark' ? 'dark' : 'light')}
      style={{ height: '300px', width: '100%' }}
    />
  );
}
```

**Test chart**:
```tsx
// app/test-chart/page.tsx
import { LineChart } from '@/components/charts/line-chart';

export default function TestChartPage() {
  return (
    <div className="p-8">
      <h1>Test Chart</h1>
      <LineChart
        measure="GscPerformance7days.clicks"
        dimension="GscPerformance7days.date"
      />
    </div>
  );
}
```

**Day 4 Deliverable**: ✅ Theme system working, first ECharts component rendering data from Cube.js

---

#### **Day 5: Google OAuth + Workspace Creation**

**Morning (3 hours)**:

**Setup Google OAuth in Supabase Studio**:
1. Go to http://localhost:54323 (Supabase Studio)
2. Authentication → Providers → Google
3. Enable Google
4. Add credentials from Google Cloud Console
5. Redirect URL: `http://localhost:3000/auth/callback`

**Configure Refine auth** (`src/providers/auth-provider.ts`):
```typescript
import { AuthProvider } from '@refinedev/core';
import { supabaseClient } from './supabase-client';

export const authProvider: AuthProvider = {
  login: async ({ providerName }) => {
    if (providerName === 'google') {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'openid email profile https://www.googleapis.com/auth/bigquery.readonly',
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    }

    return { success: false, error: new Error('Invalid provider') };
  },

  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      return { success: false, error };
    }
    return { success: true, redirectTo: '/login' };
  },

  onError: async (error) => {
    console.error(error);
    return { error };
  },

  check: async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
      return { authenticated: true };
    }

    return {
      authenticated: false,
      redirectTo: '/login',
      logout: true
    };
  },

  getIdentity: async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
      return {
        id: user.id,
        name: user.user_metadata?.full_name,
        email: user.email,
        avatar: user.user_metadata?.avatar_url
      };
    }

    return null;
  }
};
```

**Afternoon (4 hours)**:

**Create workspace on first login** (`lib/workspace-service.ts`):
```typescript
export async function ensureWorkspace(userId: string, userName: string) {
  const { data: existing } = await supabaseClient
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) return existing;

  // Create workspace
  const { data: workspace } = await supabaseClient
    .from('workspaces')
    .insert({
      user_id: userId,
      name: `${userName}'s Workspace`
    })
    .select()
    .single();

  return workspace;
}
```

**Hook into auth callback** (`app/auth/callback/route.ts`):
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ensureWorkspace } from '@/lib/workspace-service';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Ensure workspace exists
      await ensureWorkspace(user.id, user.user_metadata?.full_name || user.email);
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

**Day 5 Deliverable**: ✅ OAuth flow working, workspace auto-created, user can sign in with Google

---

### **WEEK 2: Intelligence Layer (Gemini + Enhanced Models)**

#### **Day 1: Gemini Integration**

**Create Gemini service** (`lib/gemini-service.ts`):
```typescript
import { BigQuery } from '@google-cloud/bigquery';

export class GeminiService {
  /**
   * Call BigQuery Gemini to analyze table
   * Returns intelligent metadata
   */
  static async analyzeTable(
    projectId: string,
    datasetId: string,
    tableId: string
  ) {
    const bigquery = new BigQuery({ projectId });

    // Use BigQuery's data profiling + Gemini
    // (This is simplified - actual API might differ)
    const query = `
      SELECT
        column_name,
        data_type,
        description
      FROM \`${projectId}.${datasetId}.INFORMATION_SCHEMA.COLUMNS\`
      WHERE table_name = '${tableId}'
    `;

    const [rows] = await bigquery.query({ query });

    // Call Gemini for each field (if quota available)
    const metadata = await this.enrichWithGemini(rows);

    return metadata;
  }

  private static async enrichWithGemini(fields: any[]) {
    // For each field, ask Gemini:
    // - Is this a metric or dimension?
    // - What's the data range?
    // - What format? (percentage, currency, number)
    // - Suggested aggregation?

    // Return structured metadata
    return fields.map(field => ({
      name: field.column_name,
      type: field.data_type,
      semantic_type: this.detectSemanticType(field),
      format: this.detectFormat(field),
      aggregation: this.detectAggregation(field)
    }));
  }
}
```

**Day 1 Task**: Build Gemini caller, test with 1-2 tables

---

#### **Day 2-3: Enhance Cube.js Models**

**Create model enhancer** (`scripts/enhance-cube-models.ts`):
```typescript
/**
 * Reads Cube.js auto-generated models
 * Calls Gemini for intelligence
 * Enhances models with formatting, sizing, visualization rules
 * Saves enhanced models
 */

import fs from 'fs';
import path from 'path';
import { GeminiService } from '../lib/gemini-service';

async function enhanceCubeModels() {
  const modelsDir = path.join(__dirname, '../cube-backend/schema');
  const models = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

  for (const modelFile of models) {
    console.log(`Enhancing ${modelFile}...`);

    // Read Cube model
    const modelPath = path.join(modelsDir, modelFile);
    const modelContent = fs.readFileSync(modelPath, 'utf-8');

    // Extract table name
    const tableName = extractTableName(modelContent);

    // Call Gemini
    const [project, dataset, table] = tableName.split('.');
    const geminiMetadata = await GeminiService.analyzeTable(project, dataset, table);

    // Enhance Cube model
    const enhanced = enhanceModel(modelContent, geminiMetadata);

    // Save enhanced model
    fs.writeFileSync(modelPath, enhanced);

    // Save to Supabase cache
    await saveToCache(project, dataset, table, geminiMetadata, modelPath);

    console.log(`✅ Enhanced ${modelFile}`);
  }

  console.log('🎉 All models enhanced!');
}

function enhanceModel(original: string, metadata: GeminiMetadata): string {
  // Parse original Cube model
  // Add formatting meta, visualization hints, etc.

  // Example enhancement:
  // Original:
  //   avgCtr: { sql: `ctr`, type: `avg` }
  // Enhanced:
  //   avgCtr: {
  //     sql: `ctr`,
  //     type: `avg`,
  //     meta: {
  //       format: 'percentage',
  //       transform: 'multiply_100',
  //       decimals: 2,
  //       suffix: '%',
  //       chart_types: ['kpi', 'line', 'gauge'],
  //       kpi_size: { w: 3, h: 2 },
  //       color: 'var(--chart-3)'
  //     }
  //   }

  return enhanced;
}

// Run script
enhanceCubeModels();
```

**Run enhancement**:
```bash
npm run enhance-models

# Output:
# Enhancing GscPerformance7days.js...
# Calling Gemini API...
# ✅ Enhanced GscPerformance7days.js
# Saved to cache
#
# Enhancing AdsPerformance7days.js...
# ✅ Enhanced AdsPerformance7days.js
#
# 🎉 All models enhanced!
```

**Day 2-3 Deliverable**: ✅ All Cube models enhanced with formatting/visualization intelligence

---

#### **Day 4-5: Create Intelligence Library TypeScript**

**Create reusable library** (`lib/intelligence/index.ts`):
```typescript
export interface ChartIntelligence {
  metric: string;
  format: 'number' | 'percentage' | 'currency' | 'duration';
  transform?: (value: number) => number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  chart_types: string[];
  default_size: { w: number; h: number };
  color: string;
}

export const INTELLIGENCE_LIBRARY = {
  'GscPerformance7days.clicks': {
    format: 'number',
    decimals: 0,
    chart_types: ['kpi', 'line', 'bar'],
    default_size: { w: 3, h: 2 },
    color: 'hsl(var(--chart-1))'
  },

  'GscPerformance7days.avgCtr': {
    format: 'percentage',
    transform: (v) => v * 100,  // 0.0217 → 2.17
    decimals: 2,
    suffix: '%',
    chart_types: ['kpi', 'line', 'gauge'],
    default_size: { w: 3, h: 2 },
    color: 'hsl(var(--chart-3))'
  },

  // ... all other metrics
};

export function getChartIntelligence(metricName: string): ChartIntelligence {
  return INTELLIGENCE_LIBRARY[metricName] || DEFAULT_INTELLIGENCE;
}
```

**Day 4-5 Deliverable**: ✅ Intelligence library created, can lookup any metric/dimension

---

### **WEEK 3: Core Charts + Filter System**

#### **Day 1-2: Create 5 Core Chart Components**

**1. KPI Card** (`components/charts/kpi-card.tsx`):
```typescript
import ReactECharts from 'echarts-for-react';
import { useCubeQuery } from '@cubejs-client/react';
import { getChartIntelligence } from '@/lib/intelligence';
import { Card } from '@/components/ui/card';

export function KpiCard({ measure, filters }: KpiCardProps) {
  const intelligence = getChartIntelligence(measure);

  const { resultSet, isLoading } = useCubeQuery({
    measures: [measure],
    filters: filters || []
  });

  const value = resultSet?.tablePivot()[0]?.[measure];

  // Apply formatting from intelligence
  const formatted = intelligence.transform
    ? intelligence.transform(value)
    : value;

  const display = `${intelligence.prefix || ''}${formatted.toFixed(intelligence.decimals)}${intelligence.suffix || ''}`;

  return (
    <Card style={{
      background: intelligence.color,
      width: `${intelligence.default_size.w * 100}px`,
      height: `${intelligence.default_size.h * 60}px`
    }}>
      <div className="text-4xl font-bold">{display}</div>
      <div className="text-sm">{measure.split('.')[1]}</div>
    </Card>
  );
}
```

**2-5. Line, Bar, Pie, Table charts** (similar pattern)

**Day 1-2 Deliverable**: ✅ 5 chart components, all use intelligence library, formatting perfect

---

#### **Day 3-4: Multi-Filter System (Cube.js Handles State!)**

**Filter panel** (`components/filters/filter-panel.tsx`):
```typescript
import { Select } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  // Cube.js provides filter state management!
  // We just build the UI

  return (
    <div className="flex gap-4 p-4">
      {/* Date Range */}
      <DateRangePicker
        onSelect={(range) => {
          onFiltersChange({
            member: 'GscPerformance7days.date',
            operator: 'inDateRange',
            values: [range.from, range.to]
          });
        }}
      />

      {/* Device (multi-select) */}
      <MultiSelect
        options={['DESKTOP', 'MOBILE', 'TABLET']}
        onSelect={(values) => {
          onFiltersChange({
            member: 'GscPerformance7days.device',
            operator: 'equals',
            values: values
          });
        }}
      />

      {/* Country (multi-select) */}
      <MultiSelect
        options={getCountries()}  // Load from Cube.js
        onSelect={(values) => {
          onFiltersChange({
            member: 'GscPerformance7days.country',
            operator: 'equals',
            values: values
          });
        }}
      />

      {/* Query search */}
      <Input
        placeholder="Search queries..."
        onChange={(e) => {
          onFiltersChange({
            member: 'GscPerformance7days.query',
            operator: 'contains',
            values: [e.target.value]
          });
        }}
      />

      {/* CTR range */}
      <RangeSlider
        min={0}
        max={10}
        step={0.1}
        onValueChange={([min, max]) => {
          onFiltersChange({
            member: 'GscPerformance7days.avgCtr',
            operator: 'gte',
            values: [min / 100]  // Convert back to decimal
          });
        }}
      />
    </div>
  );
}
```

**Dashboard with filters** (`app/dashboard/[id]/page.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { CubeProvider } from '@cubejs-client/react';
import { FilterPanel } from '@/components/filters/filter-panel';
import { KpiCard } from '@/components/charts/kpi-card';
import { LineChart } from '@/components/charts/line-chart';

export default function DashboardPage() {
  // ALL filters in one state object
  const [filters, setFilters] = useState<any[]>([]);

  // When filters change, ALL charts automatically re-query
  // Cube.js handles this internally!

  return (
    <CubeProvider>
      <div>
        {/* Filter Panel */}
        <FilterPanel
          onFiltersChange={(newFilter) => {
            setFilters([...filters, newFilter]);
          }}
        />

        {/* All charts receive same filters */}
        <div className="grid grid-cols-12 gap-4">
          <KpiCard measure="GscPerformance7days.clicks" filters={filters} />
          <KpiCard measure="GscPerformance7days.avgCtr" filters={filters} />
          <LineChart
            measure="GscPerformance7days.clicks"
            dimension="GscPerformance7days.date"
            filters={filters}  // Same filters applied
          />
        </div>
      </div>
    </CubeProvider>
  );
}
```

**KEY POINT**: Cube.js handles all filter state management internally!
- ✅ Multiple filters simultaneously: Built-in
- ✅ Filter coordination: Built-in
- ✅ Query optimization: Built-in
- ✅ Caching: Built-in

**You just pass filters array to each chart. Cube.js does the rest.** ✅

**Day 3-4 Deliverable**: ✅ 5 filters working simultaneously, all charts update together

---

### **WEEK 4: Drag-and-Drop Dashboard Builder**

#### **Day 1-3: Grid Layout with @dnd-kit**

**Dashboard grid** (`components/builder/dashboard-grid.tsx`):
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DashboardGrid({ charts, onLayoutChange }: DashboardGridProps) {
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Update layout
      const newLayout = reorderCharts(charts, active.id, over.id);
      onLayoutChange(newLayout);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={charts.map(c => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-12 gap-4 p-4">
          {charts.map(chart => (
            <DraggableChart key={chart.id} chart={chart} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function DraggableChart({ chart }: { chart: Chart }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: chart.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${chart.size.w}`,
    gridRow: `span ${chart.size.h}`
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Render chart based on type */}
      {renderChart(chart)}
    </div>
  );
}
```

**Day 1-3 Deliverable**: ✅ Can drag charts to reorder, grid system working

---

#### **Day 4-5: Chart Builder UI**

**Add chart modal** (`components/builder/add-chart-modal.tsx`):
```typescript
export function AddChartModal({ onAdd }: AddChartModalProps) {
  const [chartType, setChartType] = useState('kpi');
  const [selectedMeasure, setSelectedMeasure] = useState('');

  // Load available measures from Cube.js
  const { data: meta } = useCubeMeta();
  const measures = meta?.measures || [];

  return (
    <Dialog>
      <DialogContent>
        <h2>Add Chart</h2>

        {/* Chart type selector */}
        <Select value={chartType} onValueChange={setChartType}>
          <SelectItem value="kpi">KPI Card</SelectItem>
          <SelectItem value="line">Line Chart</SelectItem>
          <SelectItem value="bar">Bar Chart</SelectItem>
          <SelectItem value="pie">Pie Chart</SelectItem>
          <SelectItem value="table">Table</SelectItem>
        </Select>

        {/* Measure selector (auto-populated from Cube.js!) */}
        <Select value={selectedMeasure} onValueChange={setSelectedMeasure}>
          {measures.map(m => (
            <SelectItem key={m.name} value={m.name}>
              {m.title}  {/* Cube.js provides friendly titles */}
            </SelectItem>
          ))}
        </Select>

        {/* Intelligence preview */}
        {selectedMeasure && (
          <div className="p-4 bg-muted rounded">
            <h3>Preview:</h3>
            <ChartPreview
              type={chartType}
              measure={selectedMeasure}
              intelligence={getChartIntelligence(selectedMeasure)}
            />
          </div>
        )}

        <Button onClick={() => {
          // Get intelligence for auto-sizing
          const intel = getChartIntelligence(selectedMeasure);

          onAdd({
            type: chartType,
            measure: selectedMeasure,
            size: intel.default_size,  // Auto-sized!
            color: intel.color          // Auto-colored!
          });
        }}>
          Add Chart
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

**Day 4-5 Deliverable**: ✅ Can add new charts via modal, auto-sized, auto-colored

---

### **WEEK 5: Complete Chart Library + Agent API**

#### **Day 1-2: Add 15 More Chart Types**

**Create chart factory** (`lib/charts/chart-factory.tsx`):
```typescript
import { KpiCard } from '@/components/charts/kpi-card';
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { TreemapChart } from '@/components/charts/treemap-chart';
import { SankeyChart } from '@/components/charts/sankey-chart';
import { HeatmapChart } from '@/components/charts/heatmap-chart';
import { GaugeChart } from '@/components/charts/gauge-chart';
import { RadarChart } from '@/components/charts/radar-chart';
import { ScatterChart } from '@/components/charts/scatter-chart';
import { FunnelChart } from '@/components/charts/funnel-chart';
import { SunburstChart } from '@/components/charts/sunburst-chart';
import { CalendarChart } from '@/components/charts/calendar-chart';
import { BoxplotChart } from '@/components/charts/boxplot-chart';
import { WaterfallChart } from '@/components/charts/waterfall-chart';
import { DataTable } from '@/components/charts/data-table';

export function renderChart(chart: ChartConfig, filters: any[]) {
  const props = { ...chart, filters };

  switch (chart.type) {
    case 'kpi': return <KpiCard {...props} />;
    case 'line': return <LineChart {...props} />;
    case 'bar': return <BarChart {...props} />;
    case 'pie': return <PieChart {...props} />;
    case 'treemap': return <TreemapChart {...props} />;
    case 'sankey': return <SankeyChart {...props} />;
    case 'heatmap': return <HeatmapChart {...props} />;
    case 'gauge': return <GaugeChart {...props} />;
    case 'radar': return <RadarChart {...props} />;
    case 'scatter': return <ScatterChart {...props} />;
    case 'funnel': return <FunnelChart {...props} />;
    case 'sunburst': return <SunburstChart {...props} />;
    case 'calendar': return <CalendarChart {...props} />;
    case 'boxplot': return <BoxplotChart {...props} />;
    case 'waterfall': return <WaterfallChart {...props} />;
    case 'table': return <DataTable {...props} />;
    default: return <div>Unknown chart type</div>;
  }
}
```

**All charts follow same pattern:**
- Use `useCubeQuery` (handles filters automatically)
- Use intelligence library (auto-formatting)
- Render with ECharts
- Apply theme

**Day 1-2 Deliverable**: ✅ 16 chart types available, all working with filters

---

#### **Day 3-4: Agent API (Simple Interface)**

**Create tRPC router** (`server/routers/dashboard.ts`):
```typescript
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const dashboardRouter = router({
  // Create dashboard
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      bigqueryTable: z.string(),
      template: z.enum(['gsc_standard', 'ads_standard', 'custom']).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Create dashboard in Supabase
      const { data: dashboard } = await ctx.supabase
        .from('dashboards')
        .insert({
          workspace_id: ctx.workspace.id,
          name: input.name,
          bigquery_table: input.bigqueryTable,
          layout: getTemplateLayout(input.template)
        })
        .select()
        .single();

      return dashboard;
    }),

  // Add chart (SIMPLE API for agents)
  addChart: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      type: z.string(),
      measure: z.string(),
      dimension: z.string().optional(),
      filters: z.array(z.any()).optional()
    }))
    .mutation(async ({ input }) => {
      // Get intelligence for this measure
      const intel = getChartIntelligence(input.measure);

      // Create chart config with AUTO-EVERYTHING
      const chartConfig = {
        id: generateId(),
        type: input.type,
        measure: input.measure,
        dimension: input.dimension,
        size: intel.default_size,    // AUTO-SIZED
        color: intel.color,           // AUTO-COLORED
        format: intel.format,         // AUTO-FORMATTED
        transform: intel.transform,   // AUTO-TRANSFORMED
        filters: input.filters || []
      };

      // Add to dashboard layout
      await updateDashboardLayout(input.dashboardId, chartConfig);

      return chartConfig;
    })
});
```

**Agent usage** (simple!):
```typescript
// Agent (via MCP tool):
await api.dashboard.create({
  name: 'Nike GSC Performance',
  bigqueryTable: 'gsc_performance_7days',
  template: 'gsc_standard'
});

await api.dashboard.addChart({
  dashboardId: 'dash_123',
  type: 'kpi',
  measure: 'GscPerformance7days.avgCtr'
  // System auto-applies:
  // - Format: percentage
  // - Transform: *100
  // - Display: "2.17%"
  // - Size: 3x2
  // - Color: purple
});
```

**Day 3-4 Deliverable**: ✅ Agent API working, can create dashboards with simple commands

---

#### **Day 5: Save/Load Dashboard State**

**Dashboard persistence**:
```typescript
// Save layout to Supabase
async function saveDashboard(dashboardId: string, layout: ChartConfig[]) {
  await supabaseClient
    .from('dashboards')
    .update({
      layout: JSON.stringify(layout),
      updated_at: new Date().toISOString()
    })
    .eq('id', dashboardId);
}

// Load layout
async function loadDashboard(dashboardId: string) {
  const { data } = await supabaseClient
    .from('dashboards')
    .select('*')
    .eq('id', dashboardId)
    .single();

  return {
    ...data,
    layout: JSON.parse(data.layout)
  };
}
```

**Day 5 Deliverable**: ✅ Dashboards persist, can reload after refresh

---

### **WEEK 6: Testing, Polish, Documentation**

#### **Day 1-3: Comprehensive Testing**

**Test all components**:
- ✅ OAuth flow (sign in → workspace created)
- ✅ BigQuery connection (via Cube.js)
- ✅ All 16 chart types render correctly
- ✅ 5 filters work simultaneously
- ✅ Filter changes → All charts update
- ✅ Drag-drop reordering
- ✅ Save/load dashboards
- ✅ Dark/light theme
- ✅ Agent API

**Performance testing**:
- Test with 10+ charts
- Test with large datasets
- Optimize if needed

**Day 1-3 Deliverable**: ✅ All features tested, bugs fixed

---

#### **Day 4: Create MCP Server Integration**

**Wrap agent API in MCP tool** (`mcp-server/dashboard-tools.ts`):
```typescript
export const dashboardTools = {
  create_analytics_dashboard: {
    description: 'Create analytics dashboard from BigQuery table',
    parameters: {
      name: 'string',
      bigqueryTable: 'string',
      template: 'gsc_standard | ads_standard | analytics_standard'
    },
    handler: async (params) => {
      const dashboard = await trpc.dashboard.create.mutate(params);
      return {
        dashboardId: dashboard.id,
        url: `http://localhost:3000/dashboard/${dashboard.id}`
      };
    }
  },

  add_chart: {
    description: 'Add chart to dashboard (auto-formats based on metric)',
    parameters: {
      dashboardId: 'string',
      type: 'kpi | line | bar | pie | treemap | ...',
      measure: 'string',  // e.g., 'GscPerformance7days.avgCtr'
      dimension: 'string (optional)'
    },
    handler: async (params) => {
      // System automatically:
      // - Formats CTR as "2.17%"
      // - Sizes chart correctly
      // - Applies colors
      // - Positions in grid

      const chart = await trpc.dashboard.addChart.mutate(params);
      return { chartId: chart.id, formatted: 'auto' };
    }
  }
};
```

**Day 4 Deliverable**: ✅ MCP tools available, agents can create dashboards

---

#### **Day 5: Documentation**

**Create docs**:
- User guide (how to create dashboards)
- Agent integration guide (MCP tools)
- Cube.js model enhancement guide
- Deployment guide (for later)

**Day 5 Deliverable**: ✅ Complete documentation

---

## 📦 COMPLETE DEPENDENCY LIST

```json
{
  "dependencies": {
    "@refinedev/core": "^4.54.0",
    "@refinedev/nextjs-router": "^6.2.0",
    "@refinedev/supabase": "^5.9.0",

    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.50.0",

    "@cubejs-client/core": "^0.35.0",
    "@cubejs-client/react": "^0.35.0",

    "echarts": "^5.5.1",
    "echarts-for-react": "^3.0.2",

    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^9.0.0",
    "@dnd-kit/utilities": "^3.2.2",

    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    "lucide-react": "^0.468.0",
    "tailwindcss": "^3.4.17",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.7.0",
    "next-themes": "^0.4.4",

    "zod": "^3.24.1",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/next": "^11.0.0"
  }
}
```

---

## 🎯 CRITICAL SUCCESS FACTORS

### **What Makes This Work**

**1. Cube.js Solves the Hard Problem** ✅
- Multi-filter state: Built-in (not our code)
- Query optimization: Built-in
- Caching: Built-in
- **We just configure, not build**

**2. Supabase Handles Auth + DB** ✅
- OAuth: Built-in
- RLS: SQL policies only
- MCP Server: Available
- **We just use, not build**

**3. Refine Provides Framework** ✅
- Routing, CRUD, state: Built-in
- Supabase + Cube integration: Built-in
- **We just assemble**

**4. Intelligence Library is Small** ✅
- Gemini bootstraps
- Cube CLI auto-generates
- We enhance with 200-300 lines of code
- **Manageable scope**

---

## ⏱️ WEEK-BY-WEEK DELIVERABLES

### **Week 1: Foundation**
- ✅ Supabase local running (Auth + DB)
- ✅ Cube.js local running (Semantic layer)
- ✅ Data models auto-generated (Cube CLI)
- ✅ Refine app created
- ✅ OAuth working
- ✅ First chart rendering

### **Week 2: Intelligence**
- ✅ Gemini integration
- ✅ Enhanced Cube models
- ✅ Intelligence library
- ✅ CTR displays as "2.17%" automatically

### **Week 3: Charts + Filters**
- ✅ 5 core charts
- ✅ 5 filters working simultaneously
- ✅ All charts update together
- ✅ Theme system (dark/light)

### **Week 4: Dashboard Builder**
- ✅ Drag-and-drop working
- ✅ Add/remove charts
- ✅ Save/load layouts
- ✅ Grid system

### **Week 5: Agent API + Polish**
- ✅ 16+ chart types
- ✅ MCP tools
- ✅ Agent can create dashboards
- ✅ Testing complete
- ✅ Documentation

---

## 💰 COST BREAKDOWN (All Free During Dev)

### **Local Development**
```
Supabase: FREE (local Docker)
Cube.js: FREE (local Node.js)
Refine: FREE (open-source)
ECharts: FREE (Apache 2.0)
Shadcn/ui: FREE (MIT)
@dnd-kit: FREE (MIT)

Total: $0 ✅
```

### **When Ready to Deploy** (Later)
```
Option A: All Free Tiers
- Supabase: FREE (50K MAU)
- Cube.js: Self-host on Vercel (FREE)
- Vercel: FREE tier
Total: $0/month ✅

Option B: Managed
- Supabase: FREE
- Cube.js Cloud: $99/month
- Vercel Pro: $20/month
Total: $119/month
```

---

## 🔧 SETUP COMMANDS (Day 1 - Complete List)

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Create project directory
mkdir wpp-analytics-platform
cd wpp-analytics-platform

# 3. Initialize Supabase
supabase init

# 4. Start Supabase (PostgreSQL + Auth + Storage + Studio)
supabase start

# Output:
# Studio URL: http://localhost:54323
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres

# 5. Create Cube.js backend
npx cubejs-cli create cube-backend -d bigquery
cd cube-backend

# 6. Configure BigQuery (.env)
echo "CUBEJS_DB_TYPE=bigquery" >> .env
echo "CUBEJS_DB_BQ_PROJECT_ID=mcp-servers-475317" >> .env
echo "CUBEJS_DB_BQ_KEY_FILE=../service-account.json" >> .env

# 7. Start Cube.js
npm run dev
# Running at: http://localhost:4000

# 8. Generate data models (Cube CLI auto-generates!)
npx cubejs-cli generate
# Select tables from BigQuery → Models auto-created

# 9. Create Refine frontend
cd ..
npx create-refine-app@latest frontend

# Select:
# - Next.js
# - Headless UI
# - Supabase data provider
# - Supabase auth provider

cd frontend

# 10. Install additional dependencies
npm install \
  @cubejs-client/core \
  @cubejs-client/react \
  echarts \
  echarts-for-react \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/utilities \
  next-themes

# 11. Install Shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input select dialog dropdown-menu

# 12. Configure environment (.env.local)
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>" >> .env.local
echo "NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1" >> .env.local

# 13. Start frontend
npm run dev
# Running at: http://localhost:3000

# ✅ ALL SERVICES RUNNING LOCALLY:
# - Supabase: localhost:54321
# - Cube.js: localhost:4000
# - Frontend: localhost:3000
```

---

## 🎯 THE MULTI-FILTER SOLUTION (Cube.js Handles It!)

### **How Filters Work (BUILT-IN)**

```typescript
// In your component
const [filters, setFilters] = useState<any[]>([]);

// Add date filter
const addDateFilter = (start: Date, end: Date) => {
  setFilters(prev => [
    ...prev.filter(f => f.member !== 'GscPerformance7days.date'),
    {
      member: 'GscPerformance7days.date',
      operator: 'inDateRange',
      values: [start, end]
    }
  ]);
};

// Add device filter
const addDeviceFilter = (devices: string[]) => {
  setFilters(prev => [
    ...prev.filter(f => f.member !== 'GscPerformance7days.device'),
    {
      member: 'GscPerformance7days.device',
      operator: 'equals',
      values: devices
    }
  ]);
};

// All charts receive same filters
<CubeProvider>
  {/* Pass filters to EVERY chart */}
  <KpiCard measure="..." filters={filters} />
  <LineChart measure="..." dimension="..." filters={filters} />
  <BarChart measure="..." dimension="..." filters={filters} />
</CubeProvider>

// Cube.js internally:
// - Merges all filters
// - Builds optimized SQL
// - Caches results
// - Updates all charts
// YOU DON'T BUILD THIS! Cube.js does it. ✅
```

**5 filters simultaneously**: ✅ Just add to filters array
**All charts update**: ✅ Cube.js handles re-querying
**Performance**: ✅ Cube.js caches and optimizes

---

## 📊 CHART INTELLIGENCE (Auto-Formatting)

### **The Flow**

```
1. Agent: addChart({ type: 'kpi', measure: 'avgCtr' })
    ↓
2. System looks up 'avgCtr' in intelligence library
    ↓
3. Library says:
   {
     format: 'percentage',
     transform: (v) => v * 100,
     decimals: 2,
     suffix: '%',
     size: { w: 3, h: 2 },
     color: 'hsl(var(--chart-3))'
   }
    ↓
4. Chart renders with:
   - Value: 0.0217 → 2.17
   - Display: "2.17%"
   - Size: 3 columns × 2 rows
   - Color: Purple
    ↓
5. Perfect formatting, zero agent configuration needed ✅
```

---

## 🚀 WHAT YOU GET IN 5 WEEKS

### **Fully Functional Platform**:
- ✅ Google OAuth (Supabase handles)
- ✅ Per-user workspaces (Supabase RLS)
- ✅ BigQuery connection (Cube.js connector)
- ✅ Auto-detected metrics/dimensions (Cube CLI + Gemini)
- ✅ 16+ chart types (ECharts)
- ✅ 5 filters simultaneously (Cube.js handles state)
- ✅ Drag-and-drop builder (@dnd-kit)
- ✅ Auto-formatting (CTR = "2.17%")
- ✅ Auto-sizing (KPI = 3x2, charts = correct size)
- ✅ Dark/light theme (CSS variables)
- ✅ Agent API (simple commands)
- ✅ MCP tools (agent integration)
- ✅ Dashboard persistence (Supabase)
- ✅ Professional UI (Shadcn/ui)

### **All Running Locally**:
- Supabase: localhost:54321
- Cube.js: localhost:4000
- Frontend: localhost:3000
- Cost: $0

### **Deploy When Ready**:
- Same code works in production
- Just change environment variables
- Deploy to Vercel/Supabase Cloud/Cube Cloud

---

## ✅ YOUR CONCERNS ADDRESSED

| Concern | Solution | Who Handles |
|---------|----------|-------------|
| **5 filters simultaneously** | ✅ Cube.js filter state | **Cube.js** |
| **Drag-and-drop** | ✅ @dnd-kit (4.9M downloads) | **@dnd-kit** |
| **OAuth + Database** | ✅ Supabase (MCP + CLI) | **Supabase** |
| **Chart variety** | ✅ ECharts (120+ types, FREE) | **ECharts** |
| **CSS customization** | ✅ Global CSS variables | **Your theme file** |
| **Auto-formatting** | ✅ Intelligence library + Cube | **Gemini + Your library** |
| **Reliable solutions** | ✅ All proven, production-ready | **Open-source ecosystem** |
| **Easy integration** | ✅ All have CLIs, docs, examples | **Community** |

---

## 🎊 CONFIDENCE LEVEL: 95%

**Why so high:**
- Using 6 proven, battle-tested components
- Not building complex features (filter state, caching, etc.)
- Assembling LEGO blocks
- Clear scope (5 weeks, specific deliverables)
- All local (no deployment complexity yet)

**Only 5% custom code**:
- Gemini caller
- Intelligence library
- Chart renderer
- Theme connector
- Agent API wrapper

**95% is glue code, not feature development** ✅

---

## 🚀 READY TO START?

**Day 1 begins with:**
```bash
npm install -g supabase
mkdir wpp-analytics-platform
cd wpp-analytics-platform
supabase init
supabase start
```

**Approve to proceed?**
