# WPP Digital Marketing Platform - Developer Guide

**Technical Implementation & Extension Guide**

**Version:** 1.0
**For:** Software engineers, DevOps, platform developers
**Last Updated:** October 22, 2025

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Creating New MCP Tools](#creating-new-mcp-tools)
5. [Extending the Frontend Dashboard](#extending-the-frontend-dashboard)
6. [Database & Schema Management](#database--schema-management)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)
9. [Performance Optimization](#performance-optimization)
10. [Security Best Practices](#security-best-practices)
11. [Troubleshooting & Debugging](#troubleshooting--debugging)

---

## Architecture Overview

### System Components

```
┌─────────────────────── PRESENTATION LAYER ────────────────────────┐
│                                                                     │
│  ┌──────────────────┐              ┌──────────────────────────┐  │
│  │  Claude Desktop   │              │   Next.js 15 Frontend     │  │
│  │  (MCP Client)     │              │   React 19 + TypeScript   │  │
│  └────────┬──────────┘              └──────────┬───────────────┘  │
│           │ MCP Protocol                       │ HTTPS/WebSocket   │
└───────────┼────────────────────────────────────┼───────────────────┘
            │                                    │
┌───────────▼────────────────────────────────────▼───────────────────┐
│                      APPLICATION LAYER                              │
│                                                                     │
│  ┌──────────────────────────────┐    ┌──────────────────────────┐ │
│  │   MCP Server (Node.js/TS)    │    │   Cube.js Semantic Layer │ │
│  │   - 58 Tools (11 modules)    │◄───┤   - Pre-aggregations     │ │
│  │   - Safety system (9 layers) │    │   - Intelligent caching  │ │
│  │   - OAuth management         │    │   - SQL generation       │ │
│  └──────────┬───────────────────┘    └──────────┬───────────────┘ │
│             │                                    │                  │
└─────────────┼────────────────────────────────────┼──────────────────┘
              │                                    │
┌─────────────▼────────────────────────────────────▼──────────────────┐
│                         DATA LAYER                                   │
│                                                                      │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────────┐ │
│  │ Google APIs │ │  Supabase    │ │ BigQuery  │ │  AWS Services│ │
│  │ - Ads v16   │ │  PostgreSQL  │ │ Data WH   │ │  - DynamoDB  │ │
│  │ - GSC       │ │  + Auth      │ │           │ │  - Secrets   │ │
│  │ - Analytics │ │  + Storage   │ │           │ │  - SES       │ │
│  └─────────────┘ └──────────────┘ └───────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend (MCP Server):**
- **Runtime:** Node.js 18+ (TypeScript 5.3)
- **MCP SDK:** `@modelcontextprotocol/sdk` v1.0
- **Google APIs:**
  - `google-ads-api` v21.0 (Ads API v16)
  - `googleapis` v118.0 (Search Console, Analytics, BigQuery)
  - `google-auth-library` v9.0
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js` v2.76
- **AWS:** SDK v3 (DynamoDB, Secrets Manager, SES)
- **Validation:** Zod v3.22
- **HTTP Server:** Express v5.1

**Frontend Dashboard:**
- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript 5+
- **UI Library:** Shadcn/ui + Radix UI primitives
- **Styling:** Tailwind CSS v3
- **Charts:** Apache ECharts v5.4 via `echarts-for-react`
- **Drag-Drop:** `@dnd-kit` v6
- **Data Layer:** Cube.js Client (`@cubejs-client/react`)
- **Auth:** Supabase Auth (OAuth 2.0)

**Data Warehouse:**
- **Primary:** Google BigQuery
- **Semantic Layer:** Cube.js (Node.js standalone server)

---

## Development Environment Setup

### Prerequisites

```bash
# Required versions
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
git --version     # v2.30 or higher

# Install globally (optional but recommended)
npm install -g typescript tsx nodemon
```

### Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/wpp-mcp-servers.git
cd wpp-mcp-servers

# Install dependencies
npm install

# Install frontend dependencies
cd wpp-analytics-platform/frontend
npm install

# Install all dependencies (backend + frontend)
cd ../cube-backend
npm install
cd ../..
```

### Environment Configuration

**Create `.env` in project root:**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Service Account (for server-to-server)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Safety Settings
APPROVAL_REQUIRED=true
SNAPSHOT_ENABLED=true
AUDIT_LOG_ENABLED=true
FINANCIAL_IMPACT_THRESHOLD=1000
VAGUENESS_DETECTION=strict
BUDGET_CAP_DAILY=10000
NOTIFICATION_EMAIL=dev@wpp.com

# OMA Integration (Optional)
OMA_SHARED_SECRET=your-oma-secret
OMA_API_URL=https://api.oma.wpp.com

# AWS (Optional - for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
```

**Frontend `.env.local`:**

```bash
# Supabase (same as backend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cube.js
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=your-random-secret-key
```

**Cube.js `.env`:**

```bash
CUBEJS_DB_TYPE=bigquery
CUBEJS_DB_BQ_PROJECT_ID=your-gcp-project
CUBEJS_DB_BQ_KEY_FILE=/path/to/service-account.json
CUBEJS_API_SECRET=your-random-secret-key  # Match frontend
```

### Build & Run

```bash
# Terminal 1: Build & run MCP server
npm run build    # Compile TypeScript to dist/
npm run dev:gsc  # Start MCP server with hot-reload

# Terminal 2: (Not needed - BigQuery queries directly)
cd wpp-analytics-platform/cube-backend
npm run dev  # Starts on http://localhost:4000

# Terminal 3: Run Next.js frontend
cd wpp-analytics-platform/frontend
npm run dev  # Starts on http://localhost:3000
```

### Verify Installation

**Test MCP Server:**

```bash
# Test tool execution directly
node --loader ts-node/esm src/test-google-ads.ts

# Expected output:
# ✅ OAuth client created
# ✅ Connected to Google Ads API
# ✅ Retrieved 3 accessible accounts
```

**Test Frontend:**

1. Open http://localhost:3000
2. Should see login page
3. Click "Sign in with Google"
4. After OAuth, should redirect to dashboard list

---

## Project Structure

### MCP Server Structure

```
wpp-mcp-servers/
├── src/
│   ├── ads/                      # Google Ads module
│   │   ├── client.ts             # Ads API client factory
│   │   └── tools/                # 25 tools
│   │       ├── reporting/        # Performance reports (5 tools, modular)
│   │       │   ├── list-campaigns.tool.ts
│   │       │   ├── get-campaign-performance.tool.ts
│   │       │   ├── get-search-terms.tool.ts
│   │       │   ├── list-budgets.tool.ts
│   │       │   ├── get-keyword-performance.tool.ts
│   │       │   └── index.ts
│   │       ├── campaigns/        # Campaign management (2 tools, modular)
│   │       │   ├── update-status.tool.ts
│   │       │   ├── create-campaign.tool.ts
│   │       │   └── index.ts
│   │       ├── accounts.ts       # Account management (1 tool)
│   │       ├── budgets.ts        # Budget management (2 tools)
│   │       ├── bidding.ts        # Bidding strategies (1 tool)
│   │       ├── keywords.ts       # Keyword management (2 tools)
│   │       ├── keyword-planning.ts  # Keyword ideas/forecasts (1 tool)
│   │       ├── assets.ts         # Ad assets (1 tool)
│   │       ├── extensions.ts     # Ad extensions (1 tool)
│   │       ├── audiences.ts      # Audience targeting (4 tools)
│   │       ├── conversions.ts    # Conversion tracking (5 tools)
│   │       └── index.ts          # Tool registry
│   │
│   ├── gsc/                      # Google Search Console module
│   │   ├── server.ts             # MCP server entry point
│   │   ├── validation.ts         # Input validation schemas
│   │   └── tools/                # 18 tools
│   │       ├── properties.ts     # Property management (3 tools)
│   │       ├── analytics.ts      # Performance queries (5 tools)
│   │       ├── url-inspection.ts # URL inspection (2 tools)
│   │       ├── sitemaps.ts       # Sitemap management (4 tools)
│   │       └── index.ts          # Tool registry
│   │
│   ├── analytics/                # Google Analytics module
│   │   └── tools/
│   │       ├── reporting/       # GA4 reports (2 tools, modular)
│   │       │   ├── run-report.tool.ts
│   │       │   ├── get-realtime-users.tool.ts
│   │       │   └── index.ts
│   │       ├── admin.ts          # Property admin (8 tools)
│   │       ├── accounts.ts       # Account listing (3 tools)
│   │       └── index.ts          # Tool registry
│   │
│   ├── bigquery/                 # BigQuery module
│   │   └── tools.ts              # Query, create table, load data (3 tools)
│   │
│   ├── business-profile/         # Google Business Profile
│   │   └── tools.ts              # Locations, insights (2 tools)
│   │
│   ├── crux/                     # Chrome UX Report
│   │   └── tools.ts              # CrUX metrics (1 tool)
│   │
│   ├── serp/                     # SERP API
│   │   └── tools.ts              # Search results (1 tool)
│   │
│   ├── wpp-analytics/            # Dashboard API tools
│   │   └── tools/
│   │       ├── dashboards/       # Dashboard CRUD (3 tools, modular)
│   │       │   ├── types.ts
│   │       │   ├── schemas.ts
│   │       │   ├── helpers.ts
│   │       │   ├── templates.ts
│   │       │   ├── create-dashboard.tool.ts
│   │       │   ├── update-dashboard.tool.ts
│   │       │   ├── list-templates.tool.ts
│   │       │   └── index.ts
│   │       ├── create-dashboard-from-table.ts
│   │       ├── push-data-to-bigquery.ts
│   │       ├── analyze-data-insights.ts
│   │       └── index.ts
│   │
│   ├── shared/                   # Shared utilities
│   │   ├── oauth-client-factory.ts  # OAuth client per tenant
│   │   ├── safety/               # Safety system
│   │   │   ├── approval-enforcer.ts
│   │   │   ├── snapshot-manager.ts
│   │   │   ├── financial-calculator.ts
│   │   │   ├── vagueness-detector.ts
│   │   │   └── audit-logger.ts
│   │   └── utils/
│   │       ├── date-helpers.ts
│   │       ├── format-helpers.ts
│   │       └── validation-helpers.ts
│   │
│   ├── http-server/              # Express HTTP server
│   │   ├── server.ts             # Main server
│   │   └── index.ts              # Entry point
│   │
│   ├── setup-auth.ts             # OAuth setup script
│   └── test-google-ads.ts        # Integration test
│
├── dist/                         # Compiled JavaScript (git-ignored)
│   └── (mirrors src/ structure)
│
├── tests/                        # Jest test suites
│   ├── gsc/
│   │   └── tools.test.ts
│   └── ads/
│       └── tools.test.ts
│
├── docs/                         # Documentation
│   ├── 00-START-HERE.md
│   ├── guides/
│   │   ├── INTEGRATION-GUIDE.md  # How to create new tools
│   │   ├── SETUP-GUIDE.md        # OAuth setup
│   │   ├── SKILLS-GUIDE.md       # Claude Code skills
│   │   └── TESTING-GUIDE.md
│   ├── architecture/
│   │   ├── CLAUDE.md             # Main technical doc
│   │   ├── OMA-MCP-INTEGRATION.md
│   │   └── AWS-DEPLOYMENT-GUIDE.md
│   ├── api-reference/
│   │   ├── GOOGLE-ADS-API-REFERENCE.md
│   │   └── GSC-API-REFERENCE.md
│   ├── safety/
│   │   ├── SAFETY-AUDIT.md
│   │   └── PRODUCTION-READINESS.md
│   └── status/
│       └── CURRENT-STATUS.md
│
├── .claude/                      # Claude Code skills
│   └── agents/
│       ├── backend-api-specialist.md
│       ├── frontend-developer.md
│       ├── database-analytics-architect.md
│       └── (11 more skills)
│
├── package.json
├── tsconfig.json
├── .env                          # Environment variables (git-ignored)
├── .gitignore
└── README.md
```

### Frontend Dashboard Structure

```
wpp-analytics-platform/
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js 15 App Router
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Home page (redirects to /dashboard)
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # OAuth login page
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx      # Dashboard list
│   │   │   │   └── [id]/
│   │   │   │       └── builder/
│   │   │   │           └── page.tsx  # Dashboard builder
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts  # OAuth callback handler
│   │   │
│   │   ├── components/
│   │   │   ├── ui/               # Shadcn/ui components (14)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   └── (10 more)
│   │   │   │
│   │   │   ├── charts/           # ECharts wrappers
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   ├── TableChart.tsx
│   │   │   │   └── (9 more chart types)
│   │   │   │
│   │   │   ├── dashboard-builder/
│   │   │   │   ├── DashboardCanvas.tsx     # Drag-drop canvas
│   │   │   │   ├── ChartPicker.tsx         # Chart type selector
│   │   │   │   ├── ChartConfigPanel.tsx    # Right sidebar config
│   │   │   │   ├── DataTab.tsx             # Data config
│   │   │   │   ├── StyleTab.tsx            # Style config
│   │   │   │   ├── FiltersTab.tsx          # Filters config
│   │   │   │   └── Topbar.tsx              # Builder toolbar
│   │   │   │
│   │   │   ├── filters/
│   │   │   │   ├── DateRangeFilter.tsx
│   │   │   │   ├── SearchFilter.tsx
│   │   │   │   ├── MultiSelectFilter.tsx
│   │   │   │   └── RangeSliderFilter.tsx
│   │   │   │
│   │   │   ├── providers.tsx     # Context providers (Cube, Theme)
│   │   │   ├── user-profile.tsx  # User dropdown menu
│   │   │   └── theme-toggle.tsx  # Dark mode switcher
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-cube-query.ts          # Cube.js data fetching
│   │   │   ├── use-dashboard.ts           # Dashboard state management
│   │   │   ├── use-keyboard-shortcuts.ts
│   │   │   └── use-chart-intelligence.ts  # Auto-formatting logic
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts              # Supabase client factory
│   │   │   │   ├── server.ts              # Server-side client
│   │   │   │   ├── dashboard-service.ts   # Dashboard CRUD
│   │   │   │   └── sharing-service.ts     # Sharing logic
│   │   │   │
│   │   │   ├── cubejs/
│   │   │   │   ├── client.ts              # Cube.js API client
│   │   │   │   └── query-builder.ts       # Query helpers
│   │   │   │
│   │   │   ├── export/
│   │   │   │   ├── pdf-exporter.ts
│   │   │   │   └── excel-exporter.ts
│   │   │   │
│   │   │   ├── themes/
│   │   │   │   ├── echarts-light.ts
│   │   │   │   └── echarts-dark.ts
│   │   │   │
│   │   │   └── utils.ts           # Helper functions
│   │   │
│   │   ├── types/
│   │   │   ├── dashboard.ts       # Dashboard TypeScript types
│   │   │   ├── chart.ts
│   │   │   └── cube.ts
│   │   │
│   │   └── middleware.ts          # Route protection
│   │
│   ├── public/
│   │   ├── logo.svg
│   │   └── (static assets)
│   │
│   ├── .env.local                # Environment variables
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── cube-backend/                 # Cube.js semantic layer
    ├── schema/
    │   ├── GoogleAds.js          # Google Ads cube model
    │   ├── SearchConsole.js      # GSC cube model
    │   ├── Analytics.js          # GA4 cube model
    │   └── Conversions.js        # Cross-platform conversions
    │
    ├── .env                      # Cube.js config
    ├── cube.js                   # Cube.js server config
    └── package.json
```

---

## Creating New MCP Tools

### Step-by-Step Guide

**Example: Create a tool to get Google Ads campaign budget utilization**

#### Step 1: Define Tool Interface

```typescript
// src/ads/tools/budgets.ts

import { z } from 'zod';

/**
 * Input schema for budget utilization tool
 */
export const GetBudgetUtilizationSchema = z.object({
  customerId: z.string()
    .regex(/^\d+$/, 'Customer ID must be numeric')
    .describe('Google Ads customer ID (e.g., "1234567890")'),

  dateRange: z.enum(['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'LAST_30_DAYS'])
    .default('TODAY')
    .describe('Date range for budget analysis'),
});

export type GetBudgetUtilizationInput = z.infer<typeof GetBudgetUtilizationSchema>;
```

#### Step 2: Implement Tool Logic

```typescript
import { GoogleAdsApi } from 'google-ads-api';
import { createOAuthClient } from '@/shared/oauth-client-factory';

/**
 * Get budget utilization for all campaigns
 *
 * Returns each campaign's budget, spend, and utilization percentage
 */
export async function getBudgetUtilization(
  input: GetBudgetUtilizationInput,
  userId: string
): Promise<BudgetUtilizationResult> {

  // Validate input
  const validated = GetBudgetUtilizationSchema.parse(input);

  // Create OAuth client for this user
  const oAuth2Client = await createOAuthClient(userId);

  // Create Google Ads client
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });

  const customer = client.Customer({
    customer_id: validated.customerId,
    refresh_token: oAuth2Client.credentials.refresh_token,
  });

  // Build GAQL query
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      campaign.status
    FROM campaign
    WHERE segments.date DURING ${validated.dateRange}
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `;

  // Execute query
  const results = await customer.query(query);

  // Transform results
  const budgetData = results.map(row => {
    const budgetAmount = row.campaign_budget.amount_micros / 1_000_000;
    const spendAmount = row.metrics.cost_micros / 1_000_000;
    const utilization = (spendAmount / budgetAmount) * 100;

    return {
      campaignId: row.campaign.id,
      campaignName: row.campaign.name,
      budgetDaily: budgetAmount,
      spendToDate: spendAmount,
      utilizationPercent: utilization,
      status: row.campaign.status,
      isOverBudget: utilization > 100,
      isUnderUtilized: utilization < 50,
    };
  });

  // Calculate totals
  const totalBudget = budgetData.reduce((sum, c) => sum + c.budgetDaily, 0);
  const totalSpend = budgetData.reduce((sum, c) => sum + c.spendToDate, 0);

  return {
    dateRange: validated.dateRange,
    campaigns: budgetData,
    summary: {
      totalBudget,
      totalSpend,
      averageUtilization: (totalSpend / totalBudget) * 100,
      campaignsOverBudget: budgetData.filter(c => c.isOverBudget).length,
      campaignsUnderUtilized: budgetData.filter(c => c.isUnderUtilized).length,
    }
  };
}

// Type definition for result
interface BudgetUtilizationResult {
  dateRange: string;
  campaigns: CampaignBudget[];
  summary: {
    totalBudget: number;
    totalSpend: number;
    averageUtilization: number;
    campaignsOverBudget: number;
    campaignsUnderUtilized: number;
  };
}

interface CampaignBudget {
  campaignId: string;
  campaignName: string;
  budgetDaily: number;
  spendToDate: number;
  utilizationPercent: number;
  status: string;
  isOverBudget: boolean;
  isUnderUtilized: boolean;
}
```

#### Step 3: Register Tool with MCP

```typescript
// src/ads/tools/index.ts

import { getBudgetUtilization, GetBudgetUtilizationSchema } from './budgets';

export const adsTools = [
  {
    name: 'google_ads_get_budget_utilization',
    description: 'Analyze budget utilization across all campaigns. Shows daily budget, actual spend, and utilization percentage. Identifies over-budget and under-utilized campaigns.',
    inputSchema: zodToJsonSchema(GetBudgetUtilizationSchema),
    handler: getBudgetUtilization,
  },
  // ... other 24 tools
];
```

#### Step 4: Add Safety Layer (If Write Operation)

```typescript
// For write operations only
import { requireApproval } from '@/shared/safety/approval-enforcer';
import { createSnapshot } from '@/shared/safety/snapshot-manager';
import { logAudit } from '@/shared/safety/audit-logger';

export async function updateCampaignBudget(
  input: UpdateBudgetInput,
  userId: string
): Promise<UpdateResult> {

  // Validate input
  const validated = UpdateBudgetSchema.parse(input);

  // Check if vague
  if (!validated.newBudget || validated.newBudget <= 0) {
    throw new Error('❌ Vague request: Please specify a valid budget amount');
  }

  // Get current budget
  const current = await getCurrentBudget(validated.customerId, validated.campaignId);

  // Calculate financial impact
  const dailyIncrease = validated.newBudget - current.budgetDaily;
  const monthlyImpact = dailyIncrease * 30;

  // Require approval if change >$1000/day or >50%
  const percentChange = (dailyIncrease / current.budgetDaily) * 100;

  if (Math.abs(dailyIncrease) > 1000 || Math.abs(percentChange) > 50) {
    const approved = await requireApproval({
      operation: 'budget_change',
      details: {
        campaign: current.campaignName,
        currentBudget: current.budgetDaily,
        newBudget: validated.newBudget,
        dailyChange: dailyIncrease,
        monthlyImpact: monthlyImpact,
        percentChange: percentChange,
      }
    });

    if (!approved) {
      throw new Error('Operation cancelled by user');
    }
  }

  // Create snapshot for rollback
  const snapshotId = await createSnapshot({
    userId,
    resourceType: 'campaign_budget',
    resourceId: validated.campaignId,
    currentState: current,
  });

  // Execute change
  try {
    const result = await executeBudgetUpdate(validated);

    // Log audit
    await logAudit({
      userId,
      toolName: 'google_ads_update_campaign_budget',
      input: validated,
      output: result,
      snapshotId,
      timestamp: new Date(),
    });

    return {
      ...result,
      snapshotId,
      message: `✅ Budget updated. Rollback available via: rollback_to_snapshot("${snapshotId}")`,
    };

  } catch (error) {
    // Rollback on failure
    await rollbackToSnapshot(snapshotId);
    throw error;
  }
}
```

#### Step 5: Add Tests

```typescript
// tests/ads/budgets.test.ts

import { describe, it, expect, beforeAll } from '@jest/globals';
import { getBudgetUtilization } from '@/ads/tools/budgets';

describe('Budget Utilization Tool', () => {
  let mockUserId: string;

  beforeAll(() => {
    mockUserId = 'test-user-123';
  });

  it('should return budget utilization for all campaigns', async () => {
    const result = await getBudgetUtilization({
      customerId: '1234567890',
      dateRange: 'TODAY',
    }, mockUserId);

    expect(result).toHaveProperty('campaigns');
    expect(result).toHaveProperty('summary');
    expect(result.campaigns.length).toBeGreaterThan(0);
    expect(result.summary.totalBudget).toBeGreaterThan(0);
  });

  it('should identify over-budget campaigns', async () => {
    const result = await getBudgetUtilization({
      customerId: '1234567890',
      dateRange: 'TODAY',
    }, mockUserId);

    const overBudget = result.campaigns.filter(c => c.isOverBudget);
    expect(result.summary.campaignsOverBudget).toBe(overBudget.length);
  });

  it('should reject invalid customer ID', async () => {
    await expect(
      getBudgetUtilization({
        customerId: 'invalid',
        dateRange: 'TODAY',
      }, mockUserId)
    ).rejects.toThrow('Customer ID must be numeric');
  });
});
```

#### Step 6: Update Documentation

```bash
# Use documentation-syncer Claude Code skill
"Update docs/api-reference/GOOGLE-ADS-API-REFERENCE.md with new tool:
- Tool name: google_ads_get_budget_utilization
- Category: Budget Management
- Description: Analyze budget utilization
- Input: customerId, dateRange
- Output: Budget data with utilization percentages
- Use cases: Identify over-budget campaigns, find under-utilized budgets"
```

### Tool Development Checklist

Before submitting a new tool:

- [ ] **Input validation:** Zod schema with clear descriptions
- [ ] **Error handling:** Try/catch with user-friendly messages
- [ ] **OAuth:** Uses `createOAuthClient(userId)` for multi-tenant
- [ ] **Safety (if write):** Approval, snapshot, audit log
- [ ] **Tests:** Unit tests with 80%+ coverage
- [ ] **Documentation:** Added to API reference
- [ ] **Type safety:** Full TypeScript types, no `any`
- [ ] **Rate limiting:** Handles API rate limits gracefully
- [ ] **Logging:** Logs errors to audit log

---

## Extending the Frontend Dashboard

### Adding a New Chart Type

**Example: Create a Waterfall Chart**

#### Step 1: Create Chart Component

```typescript
// frontend/src/components/charts/WaterfallChart.tsx

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { BaseChartProps } from './types';

interface WaterfallChartProps extends BaseChartProps {
  chartConfig: {
    showValues: boolean;
    positiveColor: string;
    negativeColor: string;
    totalColor: string;
  };
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  chartConfig,
  width,
  height,
}) => {

  const option = useMemo(() => {
    if (!data) return {};

    // Transform data for waterfall
    const waterfallData = transformToWaterfall(data);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const value = params[1].value;
          return `${params[1].name}: ${formatCurrency(value)}`;
        }
      },
      xAxis: {
        type: 'category',
        data: waterfallData.categories
      },
      yAxis: {
        type: 'value',
        name: 'Amount ($)'
      },
      series: [
        {
          name: 'Helper',  // Invisible helper series for positioning
          type: 'bar',
          stack: 'total',
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent'
            }
          },
          data: waterfallData.helperData
        },
        {
          name: 'Value',
          type: 'bar',
          stack: 'total',
          label: {
            show: chartConfig.showValues,
            position: 'inside',
            formatter: (params: any) => formatCurrency(params.value)
          },
          data: waterfallData.valueData.map((value, index) => ({
            value,
            itemStyle: {
              color: waterfallData.isTotal[index]
                ? chartConfig.totalColor
                : value > 0
                  ? chartConfig.positiveColor
                  : chartConfig.negativeColor
            }
          }))
        }
      ]
    };
  }, [data, chartConfig]);

  return (
    <ReactECharts
      option={option}
      style={{ width, height }}
    />
  );
};

function transformToWaterfall(data: any) {
  // Transform flat data to waterfall structure
  let cumulative = 0;
  const helperData = [];
  const valueData = [];
  const categories = [];
  const isTotal = [];

  data.forEach((item: any, index: number) => {
    categories.push(item.label);

    if (item.isTotal) {
      helperData.push(0);
      valueData.push(cumulative + item.value);
      isTotal.push(true);
    } else {
      helperData.push(cumulative);
      valueData.push(item.value);
      cumulative += item.value;
      isTotal.push(false);
    }
  });

  return { categories, helperData, valueData, isTotal };
}
```

#### Step 2: Register Chart in Chart Picker

```typescript
// frontend/src/components/dashboard-builder/ChartPicker.tsx

import { WaterfallChart } from '@/components/charts/WaterfallChart';

export const CHART_TYPES = [
  // ... existing chart types
  {
    id: 'waterfall',
    name: 'Waterfall Chart',
    icon: <BarChartIcon />,
    description: 'Show sequential positive and negative changes',
    component: WaterfallChart,
    defaultConfig: {
      showValues: true,
      positiveColor: '#10b981',
      negativeColor: '#ef4444',
      totalColor: '#3b82f6',
    },
    category: 'Comparison',
  },
];
```

#### Step 3: Add to Type Definitions

```typescript
// frontend/src/types/chart.ts

export enum ChartType {
  // ... existing types
  WATERFALL = 'waterfall',
}

export interface WaterfallChartConfig extends BaseChartConfig {
  showValues: boolean;
  positiveColor: string;
  negativeColor: string;
  totalColor: string;
}
```

#### Step 4: Update Chart Config Panel

```typescript
// frontend/src/components/dashboard-builder/StyleTab.tsx

export const StyleTab: React.FC<StyleTabProps> = ({ chart, onChange }) => {

  if (chart.type === ChartType.WATERFALL) {
    return (
      <div className="space-y-4">
        <div>
          <Label>Show Values</Label>
          <Switch
            checked={chart.config.showValues}
            onCheckedChange={(checked) => onChange({ showValues: checked })}
          />
        </div>

        <div>
          <Label>Positive Color</Label>
          <ColorPicker
            color={chart.config.positiveColor}
            onChange={(color) => onChange({ positiveColor: color })}
          />
        </div>

        <div>
          <Label>Negative Color</Label>
          <ColorPicker
            color={chart.config.negativeColor}
            onChange={(color) => onChange({ negativeColor: color })}
          />
        </div>

        <div>
          <Label>Total Color</Label>
          <ColorPicker
            color={chart.config.totalColor}
            onChange={(color) => onChange({ totalColor: color })}
          />
        </div>
      </div>
    );
  }

  // ... other chart types
};
```

---

*[Due to space constraints, I'm creating focused, practical guides. The complete DEVELOPER-GUIDE continues with sections on Database Management, Testing, Deployment, Performance, Security, and Debugging. For full technical documentation, see `/docs/architecture/CLAUDE.md`]*

---

## Database & Schema Management

### Supabase Migrations

**Create Migration:**

```bash
# Create new migration file
cd wpp-analytics-platform/supabase/migrations
touch 20251022000000_add_dashboard_templates.sql
```

**Example Migration:**

```sql
-- Migration: Add dashboard templates feature
-- File: supabase/migrations/20251022000000_add_dashboard_templates.sql

-- Create templates table
CREATE TABLE dashboard_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- 'gsc', 'ads', 'analytics', 'custom'
  thumbnail_url TEXT,
  config JSONB NOT NULL,   -- Chart configurations
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE dashboard_templates ENABLE ROW LEVEL SECURITY;

-- Users can read public templates
CREATE POLICY "Public templates are viewable by all"
ON dashboard_templates FOR SELECT
USING (is_public = true);

-- Users can read own templates
CREATE POLICY "Users can view own templates"
ON dashboard_templates FOR SELECT
USING (auth.uid() = created_by);

-- Users can create templates
CREATE POLICY "Users can create templates"
ON dashboard_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Users can update own templates
CREATE POLICY "Users can update own templates"
ON dashboard_templates FOR UPDATE
USING (auth.uid() = created_by);

-- Create index for faster queries
CREATE INDEX idx_dashboard_templates_category
ON dashboard_templates(category);

-- Function: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_templates_updated_at
BEFORE UPDATE ON dashboard_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Apply Migration:**

```bash
# Via Supabase CLI
supabase db push

# OR via Supabase Studio
# Settings → Database → SQL Editor → Paste migration → Run
```

### BigQuery Schema

**Example: Create Google Ads Performance Table**

```sql
-- BigQuery schema
-- Table: google_ads_data

CREATE TABLE `project.dataset.google_ads_data` (
  -- Dimensions
  date DATE,
  account_id STRING,
  campaign_id STRING,
  campaign_name STRING,
  ad_group_id STRING,
  ad_group_name STRING,
  keyword STRING,
  match_type STRING,
  device STRING,

  -- Metrics
  impressions INT64,
  clicks INT64,
  cost_micros INT64,  -- Cost in micros (divide by 1M for actual cost)
  conversions FLOAT64,
  conversion_value_micros INT64,

  -- Calculated fields (computed in Cube.js)
  -- ctr = clicks / impressions
  -- cpc = cost / clicks
  -- cpa = cost / conversions
  -- roas = revenue / cost

  -- Metadata
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
PARTITION BY date
CLUSTER BY account_id, campaign_id, device;
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/ads/campaigns.test.ts

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { listCampaigns } from '@/ads/tools/campaigns';

describe('Google Ads Campaign Tools', () => {

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('listCampaigns', () => {
    it('should return list of campaigns', async () => {
      const result = await listCampaigns({
        customerId: '1234567890'
      }, 'test-user');

      expect(result).toHaveProperty('campaigns');
      expect(Array.isArray(result.campaigns)).toBe(true);
      expect(result.campaigns.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const result = await listCampaigns({
        customerId: '1234567890',
        status: 'ENABLED'
      }, 'test-user');

      expect(result.campaigns.every(c => c.status === 'ENABLED')).toBe(true);
    });

    it('should handle pagination', async () => {
      const result = await listCampaigns({
        customerId: '1234567890',
        limit: 10
      }, 'test-user');

      expect(result.campaigns.length).toBeLessThanOrEqual(10);
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/end-to-end.test.ts

import { describe, it, expect } from '@jest/globals';
import { setupTestEnvironment, teardownTestEnvironment } from './helpers';

describe('End-to-End Workflow', () => {

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should complete full campaign creation workflow', async () => {
    // 1. List accounts
    const accounts = await listAccessibleCustomers('test-user');
    expect(accounts.length).toBeGreaterThan(0);

    const customerId = accounts[0].id;

    // 2. Create campaign (requires approval)
    const campaign = await createCampaign({
      customerId,
      name: 'Test Campaign',
      budget: 100,
      biddingStrategy: 'MANUAL_CPC'
    }, 'test-user');

    expect(campaign).toHaveProperty('id');
    expect(campaign.snapshotId).toBeDefined();

    // 3. Verify campaign exists
    const campaigns = await listCampaigns({ customerId }, 'test-user');
    expect(campaigns.campaigns.find(c => c.id === campaign.id)).toBeDefined();

    // 4. Rollback (cleanup)
    await rollbackToSnapshot(campaign.snapshotId);

    // 5. Verify campaign removed
    const afterRollback = await listCampaigns({ customerId }, 'test-user');
    expect(afterRollback.campaigns.find(c => c.id === campaign.id)).toBeUndefined();
  });
});
```

### Frontend Component Tests

```typescript
// frontend/src/components/charts/LineChart.test.tsx

import { render, screen } from '@testing-library/react';
import { LineChart } from './LineChart';

describe('LineChart Component', () => {

  const mockData = {
    xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: [{
      name: 'Clicks',
      data: [120, 200, 150, 180, 220]
    }]
  };

  it('should render chart with data', () => {
    render(
      <LineChart
        data={mockData}
        width={600}
        height={400}
        chartConfig={{
          smooth: false,
          showPoints: true,
          lineWidth: 2,
          colors: ['#3b82f6']
        }}
      />
    );

    // Check if ECharts instance created
    const chartContainer = screen.getByTestId('echarts-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    render(
      <LineChart
        data={null}
        width={600}
        height={400}
        chartConfig={{}}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

---

## Performance Optimization

### Backend Optimization

**1. Caching Layer:**

```typescript
// Implement Redis caching for API responses
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600  // 1 hour default
): Promise<T> {

  // Check cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from API
  const data = await fetcher();

  // Cache result
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// Usage in tool
export async function listCampaigns(input, userId) {
  const cacheKey = `campaigns:${userId}:${input.customerId}`;

  return getCachedOrFetch(cacheKey, async () => {
    // Actual API call
    return await fetchCampaignsFromAPI(input, userId);
  }, 300); // Cache for 5 minutes
}
```

**2. Request Batching:**

```typescript
// Batch multiple campaign queries into one request
export async function batchGetCampaigns(
  campaignIds: string[],
  customerId: string,
  userId: string
) {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.clicks,
      metrics.impressions,
      metrics.cost_micros
    FROM campaign
    WHERE campaign.id IN (${campaignIds.join(',')})
  `;

  // One API call instead of N
  const results = await customer.query(query);
  return results;
}
```

### Frontend Optimization

**1. Cube.js Pre-Aggregations:**

```javascript
// cube-backend/schema/GoogleAds.js

cube('GoogleAds', {
  // ... dimensions and measures

  preAggregations: {
    // Daily rollup (fast queries)
    dailyPerformance: {
      measures: [
        GoogleAds.clicks,
        GoogleAds.impressions,
        GoogleAds.cost,
        GoogleAds.conversions
      ],
      dimensions: [
        GoogleAds.campaignName,
        GoogleAds.device
      ],
      timeDimension: GoogleAds.date,
      granularity: `day`,
      refreshKey: {
        every: `1 hour`  // Refresh every hour
      },
      buildRangeStart: {
        sql: `SELECT DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)`
      },
      buildRangeEnd: {
        sql: `SELECT CURRENT_DATE()`
      }
    },

    // Monthly rollup (very fast for trends)
    monthlyPerformance: {
      measures: [
        GoogleAds.clicks,
        GoogleAds.cost
      ],
      timeDimension: GoogleAds.date,
      granularity: `month`,
      refreshKey: {
        every: `1 day`
      }
    }
  }
});
```

**2. React Virtualization (Large Tables):**

```typescript
// Use react-window for large tables
import { FixedSizeList } from 'react-window';

export const VirtualizedTable: React.FC<TableProps> = ({ data }) => {

  const Row = ({ index, style }) => (
    <div style={style}>
      {data[index].campaignName} - {data[index].clicks} clicks
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

---

## Deployment

**See `/docs/architecture/AWS-DEPLOYMENT-GUIDE.md` for complete deployment guide**

**Quick Reference:**

```bash
# Build for production
npm run build

# Deploy MCP server to AWS ECS
aws ecs update-service --cluster wpp-mcp --service mcp-server --force-new-deployment

# Deploy frontend to Vercel
cd wpp-analytics-platform/frontend
vercel --prod

# Deploy Cube.js to AWS
cd ../cube-backend
docker build -t cube-backend .
docker push your-registry.com/cube-backend:latest
```

---

## Security Best Practices

1. **Never commit secrets** - Use `.env` files (git-ignored)
2. **Encrypt OAuth tokens** - Use Supabase encryption or AWS Secrets Manager
3. **Validate all inputs** - Use Zod schemas
4. **Use RLS policies** - Multi-tenant data isolation
5. **Audit write operations** - Log to `audit_log` table
6. **Require approval for high-risk operations**
7. **Rate limit API calls** - Prevent abuse
8. **HTTPS only in production**
9. **Regular dependency updates** - `npm audit fix`
10. **Monitor for anomalies** - Set up CloudWatch alarms

---

## Troubleshooting & Debugging

### Enable Debug Logging

```bash
# MCP Server
DEBUG=* npm run dev:gsc

# Cube.js
DEBUG=cubejs:* npm run dev

# Next.js
DEBUG=* npm run dev
```

### Common Issues

**Issue:** "Module not found"
**Fix:** `npm install` and `npm run build`

**Issue:** "OAuth token expired"
**Fix:** Token auto-refreshes. If persistent, re-run OAuth flow.

**Issue:** "BigQuery quota exceeded"
**Fix:** Reduce query frequency, use Cube.js pre-aggregations

---

## Additional Resources

- **Full Technical Docs:** `/docs/architecture/CLAUDE.md`
- **Integration Guide:** `/docs/guides/INTEGRATION-GUIDE.md`
- **Safety Audit:** `/docs/safety/SAFETY-AUDIT.md`
- **Skills Guide:** `/docs/guides/SKILLS-GUIDE.md`
- **API Reference:** `/docs/api-reference/`

---

**For technical support:** support@wpp.com
**For architecture questions:** See `/docs/architecture/CLAUDE.md`

**Status:** ✅ Production Ready | **Version:** 1.0 | **Last Updated:** Oct 22, 2025
