# 🏗️ WPP Analytics Platform - Technical Specification

## Version 1.0.0 | October 21, 2025

---

## 📋 PROJECT OVERVIEW

**Platform Name**: WPP Analytics Platform
**Purpose**: AI-agent-friendly, self-service dashboard builder for digital marketing teams
**Target Users**: 1,000+ WPP practitioners
**Core Value**: Connect BigQuery → Auto-detect everything → Create beautiful dashboards in seconds

---

## 🎯 OBJECTIVES

### Primary Goals
1. **Plug-and-play for AI agents**: Simple API, automatic intelligence
2. **Beautiful and simple for users**: Looker Studio UX + PowerBI chart variety
3. **Complete OAuth isolation**: Each practitioner has own workspace with own data
4. **Self-sufficient intelligence**: Gemini bootstraps, library maintains
5. **Cost-effective**: <$100/month operational costs

### Success Metrics
- ✅ Agent creates dashboard in <30 seconds
- ✅ CTR displays as "2.17%" (not 0.0217) automatically
- ✅ Charts sized consistently (no giant/tiny chaos)
- ✅ 95%+ cache hit rate (library self-sufficient)
- ✅ Users can drag-drop to customize
- ✅ Dark/light mode works perfectly
- ✅ 100+ chart types available

---

## 🛠️ TECHNOLOGY STACK (Final)

### Frontend Layer
```
Framework: Next.js 15.1.0 (App Router, React 19, TypeScript 5.7)
UI Library: Shadcn/ui v4 (Radix UI + Tailwind CSS)
Charts:
  - Simple: Shadcn/ui Charts (Recharts-based)
  - Advanced: Apache ECharts 5.5+ (echarts-for-react)
  - Total: 130+ chart types
Drag-Drop: react-grid-layout + @dnd-kit
Styling: Tailwind CSS 3.4 + CSS Variables (global theme)
Icons: Lucide React
State: Zustand (global) + TanStack Query (server state)
Forms: TanStack Form + Zod validation
```

### Backend Layer
```
API: tRPC v11 (end-to-end type safety)
ORM: Prisma 6.3 (PostgreSQL)
Auth: NextAuth.js v5 (Google OAuth 2.0)
BigQuery: @google-cloud/bigquery v7.12 (direct SDK)
Intelligence: BigQuery Gemini API + Custom TypeScript library
Caching: Redis (ElastiCache or Upstash)
```

### Infrastructure (AWS)
```
Hosting: AWS Amplify (Next.js SSR, auto-scale)
Database: AWS RDS PostgreSQL db.t3.micro (1vCPU, 1GB, 20GB storage)
Cache: AWS ElastiCache Redis cache.t3.micro (0.5GB)
Storage: AWS S3 (exports, assets)
Monitoring: AWS CloudWatch
Cost: $40-60/month
```

**Alternative (Budget)**:
```
Hosting: Vercel Pro ($20/month)
Database: Neon PostgreSQL (FREE tier or $19/month)
Cache: Upstash Redis (FREE tier or $10/month)
Cost: $20-50/month
```

---

## 🧠 3-LAYER INTELLIGENCE ARCHITECTURE

### Layer 1: BigQuery Gemini (Bootstrap)
```
Purpose: AI-powered schema understanding
Features:
  - Auto-generate column descriptions
  - Detect semantic types (metric/dimension)
  - Identify data ranges and patterns
  - Suggest aggregations
Cost: FREE (within quota) or $23/month
Usage: First-time table analysis only
```

### Layer 2: Platform Intelligence Library (Core)
```
Purpose: Your custom metadata knowledge base
Features:
  - Platform-specific patterns (GSC, Ads, Analytics)
  - Metric rules (clicks = SUM, ctr = AVG * 100)
  - Dimension rules (device = multiselect, query = search)
  - Sizing standards (KPI = 3x2, chart = 6x6 or 12x6)
  - Format rules (ctr = percentage with 2 decimals)
Cost: FREE (your TypeScript code)
Usage: Every dashboard creation (cached lookup)
```

### Layer 3: Agent API (Interface)
```
Purpose: Simple interface for AI agents
Features:
  - addChart({ type, metric }) → System does everything
  - Auto-formatting, auto-sizing, auto-colors
  - No SQL writing needed for basic dashboards
Cost: FREE (your code)
Usage: OMA agent integration
```

---

## 📊 CHART CATALOG (130+ Types)

### Shadcn/ui Charts (7 types - Simple & Fast)
1. Area Chart
2. Bar Chart
3. Line Chart
4. Pie Chart
5. Radar Chart
6. Radial Chart
7. Donut Chart

**When to use**: KPIs, simple trends, basic breakdowns
**Bundle size**: Small (~50KB)

### Apache ECharts (120+ types - Advanced & Powerful)

**Basic (20)**:
Line, Bar, Pie, Scatter, Candlestick, Radar, Heatmap, Tree, Treemap, Sunburst, Boxplot, Parallel, Sankey, Funnel, Gauge, Graph, Chord, ThemeRiver, Calendar, Pictorial Bar

**3D (10)**:
Bar3D, Line3D, Scatter3D, Surface, Lines3D, Map3D, Globe, Flowgl, Scattergl, Graphgl

**Variations (100+)**:
- Stacked, grouped, normalized
- Horizontal, vertical
- Smooth, stepped, area
- Multi-axis, dual-axis
- Custom combinations

**When to use**: Complex visualizations, hierarchical data, flow diagrams
**Bundle size**: Medium (~200KB with code-splitting)

**Total Available: 130+ chart types** ✅

---

## 🎨 THEME SYSTEM SPECIFICATION

### Global Color Palette (CSS Variables)
```css
:root {
  --chart-1: 220 90% 56%;   /* Blue - Primary metrics */
  --chart-2: 142 71% 45%;   /* Green - Secondary metrics */
  --chart-3: 262 83% 58%;   /* Purple - Tertiary */
  --chart-4: 27 87% 67%;    /* Orange - Warnings */
  --chart-5: 0 84% 60%;     /* Red - Alerts */
  /* ... 10-color palette */
}

.dark {
  --chart-1: 220 70% 50%;   /* Adjusted for dark mode */
  /* ... same structure */
}
```

**Benefits**:
- Change ONE file → entire platform theme updates
- Dark/light mode automatic
- Consistent across Shadcn + ECharts
- Easy for practitioners to customize

### Pre-built Color Schemes
1. **Professional** (Blues, purples) - Default
2. **Vibrant** (Bright colors) - Optional
3. **Minimal** (Grays, single accent) - Optional
4. **Custom** (User-defined) - Future

---

## 🔐 OAUTH & WORKSPACE ISOLATION

### PostgreSQL Schema
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  google_refresh_token TEXT,  -- Encrypted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces (1-to-1 with users initially)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Dashboards
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  bigquery_table TEXT,  -- Full table name
  layout JSONB NOT NULL,  -- Grid layout + charts
  filters JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Metadata Cache (Intelligence Library Cache)
CREATE TABLE table_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  table_id TEXT NOT NULL,
  gemini_metadata JSONB,  -- Raw Gemini response
  platform_metadata JSONB,  -- Our enriched intelligence
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW(),
  refresh_interval_days INTEGER DEFAULT 30,
  UNIQUE(project_id, dataset_id, table_id)
);

-- Row-Level Security
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY dashboards_isolation ON dashboards
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = current_user_id()
  ));
```

---

## 🤖 AGENT API SPECIFICATION

### High-Level Interface (What Agents Use)

```typescript
interface AgentDashboardAPI {
  // Connect to BigQuery table (user's OAuth)
  connectTable(params: {
    oauthToken: string;
    tableFullName: string;  // 'project.dataset.table'
  }): Promise<TableConnection>;

  // Get intelligent metadata (from library/Gemini)
  getTableMetadata(tableId: string): Promise<TableMetadata>;

  // Create dashboard (auto-layout)
  createDashboard(params: {
    name: string;
    template?: 'gsc_standard' | 'ads_standard' | 'custom';
    tableId: string;
  }): Promise<Dashboard>;

  // Add chart (system auto-formats)
  addChart(params: {
    dashboardId: string;
    type: ChartType;  // 'kpi' | 'line' | 'bar' | 'pie' | ...
    metric: string;   // 'clicks' | 'ctr' | ...
    dimension?: string;  // 'date' | 'device' | ...
    filters?: Filter[];
  }): Promise<Chart>;

  // Get dashboard URL
  getDashboardUrl(dashboardId: string): Promise<string>;
}
```

### What System Does Automatically

```typescript
// Agent calls:
await api.addChart({
  dashboardId: 'dash_123',
  type: 'kpi',
  metric: 'ctr'
});

// System executes (behind the scenes):
1. Lookup 'ctr' in library
   → Found: GSC metric, FLOAT, percentage

2. Apply intelligence:
   ✅ Aggregation: AVG (from library)
   ✅ Transform: value * 100 (0.0217 → 2.17)
   ✅ Format: "2.17%" (2 decimals, % suffix)
   ✅ Size: { w: 3, h: 2 } (from library)
   ✅ Color: var(--chart-3) (from library)
   ✅ Icon: trending-up (from library)

3. Generate SQL:
   SELECT AVG(ctr) * 100 as ctr FROM table

4. Execute query (user's OAuth)

5. Render chart (perfect formatting)

6. Return: Chart created with ID 'chart_456'
```

**Agent never thinks about formatting. System knows everything.** ✅

---

## 📐 SIZING STANDARDS (Solves "Giant/Tiny" Problem)

### 12-Column Grid System

```
Width units (w):
  - 3 = Quarter width (KPI cards)
  - 6 = Half width (pie, bar charts)
  - 12 = Full width (time series, tables)

Height units (h):
  - 2 = Compact (KPIs)
  - 4 = Short (small charts)
  - 6 = Medium (standard charts)
  - 8 = Tall (tables, complex charts)
```

### Standard Sizes by Chart Type

```typescript
const STANDARD_CHART_SIZES = {
  // Metrics/KPIs
  kpi: { w: 3, h: 2 },
  scorecard: { w: 3, h: 2 },
  metric: { w: 3, h: 2 },

  // Time series (always full width)
  line: { w: 12, h: 6 },
  area: { w: 12, h: 6 },
  line_multi: { w: 12, h: 8 },  // Multiple series = taller

  // Breakdowns (half or full width)
  pie: { w: 6, h: 6 },
  donut: { w: 6, h: 6 },
  bar_horizontal: { w: 6, h: 6 },
  bar_vertical: { w: 12, h: 6 },

  // Comparisons
  radar: { w: 6, h: 6 },
  scatter: { w: 6, h: 6 },

  // Hierarchical (need space)
  treemap: { w: 12, h: 8 },
  sunburst: { w: 12, h: 8 },
  sankey: { w: 12, h: 8 },

  // Tables (always full width, tall)
  table: { w: 12, h: 8 },
  table_large: { w: 12, h: 12 },

  // Geographic
  map: { w: 12, h: 8 },

  // Gauges/Indicators
  gauge: { w: 6, h: 6 },
  funnel: { w: 6, h: 8 },

  // Complex
  heatmap: { w: 12, h: 8 },
  calendar: { w: 12, h: 6 },
  parallel: { w: 12, h: 8 }
};
```

**Result**: Perfect spacing, no overlaps, professional layout every time ✅

---

## 📊 PLATFORM INTELLIGENCE LIBRARY

### Structure

```typescript
// lib/intelligence/types.ts

export interface PlatformLibrary {
  platform: string;
  tables: Record<string, TableIntelligence>;
}

export interface TableIntelligence {
  display_name: string;
  description: string;
  metrics: Record<string, MetricIntelligence>;
  dimensions: Record<string, DimensionIntelligence>;
  default_dashboard?: DashboardTemplate;
}

export interface MetricIntelligence {
  type: 'INTEGER' | 'FLOAT' | 'NUMERIC';
  display_name: string;
  description: string;

  aggregation: {
    default: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
    allowed: AggregationType[];
  };

  format: {
    type: 'number' | 'percentage' | 'currency' | 'duration';
    raw_range?: [number, number];  // e.g., [0.0, 1.0] for percentages
    transform?: (value: number) => number;  // e.g., v => v * 100
    decimals: number;
    prefix?: string;  // e.g., '$'
    suffix?: string;  // e.g., '%'
    display_example: string;  // e.g., '2.17%'
  };

  visualization: {
    recommended_charts: ChartType[];
    kpi_config?: {
      size: { w: number; h: number };
      color: string;  // CSS variable
      icon?: string;  // Lucide icon name
      thresholds?: Threshold[];
      inverted_scale?: boolean;  // For metrics where lower is better
    };
  };
}

export interface DimensionIntelligence {
  type: 'STRING' | 'DATE' | 'TIMESTAMP' | 'GEOGRAPHY';
  display_name: string;
  semantic: 'TIME' | 'CATEGORY' | 'TEXT' | 'GEO';
  cardinality: 'LOW' | 'MEDIUM' | 'HIGH';
  possible_values?: string[];  // For LOW cardinality

  filterable: boolean;
  filter_type?: 'multiselect' | 'search' | 'daterange' | 'range';

  visualization: {
    recommended_charts: ChartType[];
    recommended_use?: 'x_axis' | 'group_by' | 'breakdown';
    chart_sizing: { w: number; h: number };
    max_categories?: number;  // For limiting bar charts
    colors?: Record<string, string>;  // Value-specific colors
  };

  // For time dimensions
  granularities?: ('second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year')[];
}
```

### Bootstrap Process

```typescript
// scripts/bootstrap-library.ts

/**
 * Run once to analyze standard tables with Gemini
 * and build initial intelligence library
 */
async function bootstrapIntelligenceLibrary() {
  const STANDARD_TABLES = [
    'mcp-servers-475317.wpp_marketing.gsc_performance_7days',
    'mcp-servers-475317.wpp_marketing.gsc_performance_30days',
    'mcp-servers-475317.wpp_marketing.ads_performance_7days',
    'mcp-servers-475317.wpp_marketing.analytics_sessions_7days',
    // Add 20-30 standard tables
  ];

  for (const table of STANDARD_TABLES) {
    console.log(`Analyzing ${table}...`);

    // Call Gemini (FREE - first time)
    const geminiMeta = await gemini.analyzeTable(table);

    // Build our intelligence
    const intelligence = buildTableIntelligence(geminiMeta, table);

    // Save to TypeScript file
    await fs.writeFile(
      `lib/intelligence/generated/${table.replace(/\./g, '_')}.ts`,
      generateTypeScriptLibrary(intelligence)
    );

    // Also save to PostgreSQL (runtime cache)
    await db.saveTableMetadata(table, geminiMeta, intelligence);

    console.log(`✅ ${table} added to library`);
  }

  console.log('🎉 Library bootstrap complete!');
  console.log('Gemini API calls: 30 (FREE)');
  console.log('Future cost: $0 (using library)');
}
```

---

## 🚀 WEEK 1 IMPLEMENTATION PLAN (Detailed)

### Day 1: Project Initialization

**Morning (4 hours)**:
```bash
# Create Next.js project
npx create-next-app@latest wpp-analytics-platform \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd wpp-analytics-platform

# Install core dependencies
npm install \
  next-auth@beta \
  @auth/prisma-adapter \
  @prisma/client \
  @google-cloud/bigquery \
  @trpc/server@next \
  @trpc/client@next \
  @trpc/react-query@next \
  @trpc/next@next \
  @tanstack/react-query \
  zustand \
  zod

# Install UI dependencies
npm install \
  lucide-react \
  class-variance-authority \
  clsx \
  tailwind-merge \
  next-themes

# Install chart dependencies
npm install \
  recharts \
  echarts \
  echarts-for-react

# Install drag-drop dependencies
npm install \
  react-grid-layout \
  @dnd-kit/core \
  @dnd-kit/sortable

# Dev dependencies
npm install -D \
  prisma \
  @types/react \
  @types/node \
  eslint \
  prettier
```

**Afternoon (4 hours)**:
- Initialize Shadcn/ui CLI
- Add base components (button, card, input, select, etc.)
- Setup dark/light theme with CSS variables
- Create color palette (10 chart colors)
- Test theme switching

**Evening**:
- Git init + first commit
- README with project overview

**Day 1 Deliverable**: ✅ Project initialized, all dependencies installed

---

### Day 2: Database Setup

**Morning**:
```bash
# Initialize Prisma
npx prisma init

# Create schema
```

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String      @id @default(uuid())
  email                String      @unique
  name                 String?
  avatarUrl            String?
  googleRefreshToken   String?     @db.Text
  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt
  workspace            Workspace?
  accounts             Account[]
  sessions             Session[]
}

model Workspace {
  id         String      @id @default(uuid())
  userId     String      @unique
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String
  settings   Json        @default("{}")
  createdAt  DateTime    @default(now())
  dashboards Dashboard[]
}

model Dashboard {
  id            String    @id @default(uuid())
  workspaceId   String
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name          String
  description   String?
  bigqueryTable String
  layout        Json      @default("[]")
  filters       Json      @default("[]")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model TableMetadata {
  id                String   @id @default(uuid())
  projectId         String
  datasetId         String
  tableId           String
  geminiMetadata    Json?
  platformMetadata  Json
  lastRefreshedAt   DateTime @default(now())
  refreshIntervalDays Int    @default(30)

  @@unique([projectId, datasetId, tableId])
}

// NextAuth models
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Afternoon**:
- Setup AWS RDS PostgreSQL instance
- Configure connection string
- Run `npx prisma migrate dev`
- Test connection
- Seed test data (optional)

**Day 2 Deliverable**: ✅ PostgreSQL ready, schema migrated

---

### Day 3: NextAuth.js Configuration

**Morning**:
```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/bigquery.readonly'
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },

    async signIn({ user, account }) {
      // Create workspace on first sign-in
      const existingWorkspace = await prisma.workspace.findUnique({
        where: { userId: user.id }
      });

      if (!existingWorkspace) {
        await prisma.workspace.create({
          data: {
            userId: user.id,
            name: `${user.name}'s Workspace`
          }
        });
      }

      return true;
    }
  }
});

export const { GET, POST } = handlers;
```

**Afternoon**:
- Create Google Cloud OAuth credentials
- Configure redirect URIs
- Test OAuth flow
- Build signin page (Shadcn button + branding)

**Day 3 Deliverable**: ✅ OAuth working, test user can sign in

---

### Day 4: BigQuery Connection

**Morning**:
```typescript
// lib/bigquery/client.ts

import { BigQuery } from '@google-cloud/bigquery';
import { OAuth2Client } from 'google-auth-library';

export class BigQueryService {
  /**
   * Create BigQuery client using user's OAuth token
   */
  static createClient(accessToken: string, projectId: string): BigQuery {
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    return new BigQuery({
      projectId,
      authClient: oauth2Client
    });
  }

  /**
   * Get table schema and metadata
   */
  static async getTableMetadata(
    client: BigQuery,
    tableRef: string
  ) {
    const [project, dataset, table] = tableRef.split('.');

    const [metadata] = await client
      .dataset(dataset)
      .table(table)
      .getMetadata();

    return {
      schema: metadata.schema,
      numRows: metadata.numRows,
      numBytes: metadata.numBytes,
      fields: metadata.schema.fields
    };
  }

  /**
   * Execute query and return results
   */
  static async executeQuery(
    client: BigQuery,
    sql: string
  ) {
    const [rows] = await client.query({ query: sql });
    return rows;
  }
}
```

**Afternoon**:
- Build tRPC router for BigQuery operations
- Test with user's OAuth token
- Query test table
- Verify data returns correctly

**Day 4 Deliverable**: ✅ BigQuery connected with user OAuth, can query tables

---

### Day 5: Gemini Integration + Deploy

**Morning**:
```typescript
// lib/intelligence/gemini-client.ts

import { BigQuery } from '@google-cloud/bigquery';

export class GeminiService {
  /**
   * Call BigQuery Gemini API to analyze table
   * Returns intelligent metadata
   */
  static async analyzeTable(
    client: BigQuery,
    projectId: string,
    datasetId: string,
    tableId: string
  ): Promise<GeminiMetadata> {
    // Check cache first
    const cached = await db.getTableMetadata(projectId, datasetId, tableId);
    if (cached && !isExpired(cached)) {
      console.log('✅ Using cached metadata');
      return cached.platformMetadata;
    }

    console.log('🔄 Calling Gemini API...');

    // Call Gemini (simplified - actual API might differ)
    const sql = `
      SELECT * FROM \`bigquery-public-data.ml_datasets.ulb_fraud_detection\`
      LIMIT 1000
    `;

    // Use BigQuery Data Insights API
    const response = await client.query({
      query: `
        SELECT bigquery.ml.GENERATE_TEXT_STATISTICS(
          '${projectId}.${datasetId}.${tableId}'
        ) as metadata
      `
    });

    const geminiMetadata = response[0][0].metadata;

    // Save to cache
    await db.saveTableMetadata(
      projectId,
      datasetId,
      tableId,
      geminiMetadata
    );

    return geminiMetadata;
  }
}
```

**Afternoon**:
- Test Gemini with 3-5 tables
- Build library builder (Gemini → TypeScript)
- Create initial GSC library file
- Deploy to AWS Amplify (dev)
- Test production build

**Day 5 Deliverable**: ✅ Gemini working, deployed to dev, OAuth flow tested

---

## 📋 COMPLETE FILE STRUCTURE

```
wpp-analytics-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signin/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # Dashboard list
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Dashboard viewer
│   │   │   │       └── edit/page.tsx  # Dashboard builder
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── trpc/[trpc]/route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                         # Shadcn components
│   │   ├── charts/
│   │   │   ├── kpi-card.tsx
│   │   │   ├── line-chart.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── pie-chart.tsx
│   │   │   ├── table-chart.tsx
│   │   │   └── echarts-wrapper.tsx
│   │   ├── builder/
│   │   │   ├── dashboard-grid.tsx     # Drag-drop canvas
│   │   │   ├── chart-selector.tsx
│   │   │   ├── metric-selector.tsx    # Auto-populated
│   │   │   ├── dimension-selector.tsx
│   │   │   ├── filter-builder.tsx
│   │   │   └── properties-panel.tsx
│   │   └── dashboard/
│   │       ├── dashboard-list.tsx
│   │       └── dashboard-viewer.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── bigquery/
│   │   │   ├── client.ts              # BigQuery service
│   │   │   └── queries.ts             # Query builders
│   │   ├── intelligence/
│   │   │   ├── index.ts
│   │   │   ├── gemini-client.ts       # Gemini API
│   │   │   ├── catalog-builder.ts     # Build from Gemini
│   │   │   ├── platforms/
│   │   │   │   ├── google-search-console.ts
│   │   │   │   ├── google-ads.ts
│   │   │   │   └── google-analytics.ts
│   │   │   ├── detectors/
│   │   │   │   ├── metric-detector.ts
│   │   │   │   ├── format-detector.ts
│   │   │   │   ├── sizing-detector.ts
│   │   │   │   └── filter-detector.ts
│   │   │   └── types.ts
│   │   ├── trpc/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── routers/
│   │   │       ├── auth.ts
│   │   │       ├── bigquery.ts
│   │   │       ├── dashboard.ts
│   │   │       ├── catalog.ts
│   │   │       └── export.ts
│   │   ├── stores/
│   │   │   ├── dashboard-store.ts     # Zustand
│   │   │   ├── builder-store.ts
│   │   │   └── catalog-store.ts
│   │   └── utils.ts
│   └── types/
│       ├── dashboard.ts
│       ├── chart.ts
│       └── intelligence.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── bootstrap-library.ts           # One-time Gemini bootstrap
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🎯 WEEK 1 GOALS (Specific)

By end of Week 1, the platform must have:

✅ **Authentication**
- User can visit site
- Click "Sign in with Google"
- Complete OAuth flow
- See personalized dashboard page
- Workspace auto-created

✅ **BigQuery Connection**
- User's OAuth token used for BigQuery
- Can list their accessible tables
- Can query a test table
- Results displayed in simple table

✅ **Gemini Test**
- Can call Gemini API for one table
- Metadata returned and displayed
- Understand field types

✅ **Deployed**
- Live on AWS Amplify (dev URL)
- Or Vercel (dev URL)
- SSL working
- OAuth redirect configured

✅ **Foundation for Week 2**
- Project structure solid
- All dependencies working
- No technical blockers

---

## 💡 KEY TECHNICAL DECISIONS

### Decision 1: Semantic Layer
**CUSTOM library (not Cube.js)** ✅
- Simpler (TypeScript objects)
- Supports per-user OAuth
- Gemini bootstraps, then self-sufficient
- No extra service to run

### Decision 2: Hosting
**Start with Vercel** (Week 1-8) → **Migrate to AWS** if leadership requires ✅
- Vercel: Faster development, cheaper ($20/month)
- AWS: Can migrate when ready (same Next.js code)

### Decision 3: Charts
**Hybrid: Shadcn (simple) + ECharts (advanced)** ✅
- Shadcn: KPIs, basic charts (lighter, faster)
- ECharts: Treemap, sankey, 3D, complex (powerful)
- Total: 130+ chart types

### Decision 4: Theme
**CSS Variables (global palette)** ✅
- Single source of truth
- Easy to change colors
- Dark/light mode automatic
- Consistent across platform

---

## 🚀 Ready to Start Week 1?

**If approved, I will immediately:**
1. Create Next.js 15 project
2. Install all dependencies
3. Setup Shadcn/ui with custom theme
4. Configure dark/light mode
5. Deploy PostgreSQL
6. Setup NextAuth.js
7. Build auth pages
8. Deploy to Vercel/AWS
9. Test OAuth end-to-end

**Week 1 goal: Working OAuth + BigQuery connection** ✅

Approve to proceed?