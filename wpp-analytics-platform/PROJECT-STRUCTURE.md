# 📁 WPP Analytics Platform - Complete Project Structure

> ⚠️ **OUTDATED DOCUMENT** - This file documents the project structure from **before Cube.js removal (Oct 2025)**.
>
> **Key Changes Since This Was Written:**
> - ❌ `cube-backend/` directory no longer exists (Cube.js removed)
> - ✅ Dataset-based architecture now used (Supabase + BigQuery + Redis)
> - ✅ See `DATA-LAYER-ARCHITECTURE.md` for current architecture
>
> This file is kept for historical reference. For current structure, see the actual codebase directories.

## Modular, Scalable Architecture (Historical)

```
wpp-analytics-platform/
├── README.md
├── PROJECT-STRUCTURE.md (this file)
├── package.json
├── tsconfig.json
├── .env.local
├── .gitignore
│
├── supabase/                          # Supabase configuration
│   ├── config.toml                    # Supabase project config
│   ├── seed.sql                       # Initial data
│   └── migrations/                    # Database migrations
│       └── 20251021_initial_schema.sql
│
├── cube-backend/                      # Cube.js semantic layer
│   ├── .env                           # Cube configuration
│   ├── cube.js                        # Cube server config
│   ├── package.json
│   └── schema/                        # Data models (auto-generated + enhanced)
│       ├── GscPerformance7days.js
│       ├── AdsPerformance7days.js
│       └── AnalyticsSessions7days.js
│
└── frontend/                          # Next.js Refine app
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── .env.local
    │
    ├── public/
    │   ├── logo.svg
    │   └── assets/
    │
    ├── src/
    │   ├── app/                       # Next.js App Router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── globals.css            # Global styles + CSS variables
    │   │   │
    │   │   ├── (auth)/                # Auth routes group
    │   │   │   ├── layout.tsx
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx
    │   │   │   └── callback/
    │   │   │       └── route.ts       # OAuth callback handler
    │   │   │
    │   │   ├── (dashboard)/           # Protected dashboard routes
    │   │   │   ├── layout.tsx
    │   │   │   ├── dashboard/
    │   │   │   │   ├── page.tsx       # Dashboard list
    │   │   │   │   └── [id]/
    │   │   │   │       ├── page.tsx   # Dashboard viewer
    │   │   │   │       └── edit/
    │   │   │   │           └── page.tsx  # Dashboard builder
    │   │   │   └── workspace/
    │   │   │       └── page.tsx       # Workspace settings
    │   │   │
    │   │   └── api/                   # API routes
    │   │       ├── trpc/
    │   │       │   └── [trpc]/
    │   │       │       └── route.ts
    │   │       └── mcp/               # MCP server integration
    │   │           └── route.ts
    │   │
    │   ├── components/
    │   │   ├── ui/                    # Shadcn/ui components
    │   │   │   ├── button.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── dropdown-menu.tsx
    │   │   │   ├── tabs.tsx
    │   │   │   ├── table.tsx
    │   │   │   ├── date-range-picker.tsx
    │   │   │   └── ...
    │   │   │
    │   │   ├── charts/                # Chart components (ECharts)
    │   │   │   ├── index.ts           # Export all charts
    │   │   │   ├── chart-factory.tsx  # Render any chart type
    │   │   │   ├── kpi-card.tsx
    │   │   │   ├── line-chart.tsx
    │   │   │   ├── bar-chart.tsx
    │   │   │   ├── pie-chart.tsx
    │   │   │   ├── table-chart.tsx
    │   │   │   ├── heatmap-chart.tsx
    │   │   │   ├── treemap-chart.tsx
    │   │   │   ├── sankey-chart.tsx
    │   │   │   ├── sunburst-chart.tsx
    │   │   │   ├── gauge-chart.tsx
    │   │   │   ├── radar-chart.tsx
    │   │   │   ├── scatter-chart.tsx
    │   │   │   ├── funnel-chart.tsx
    │   │   │   ├── calendar-chart.tsx
    │   │   │   ├── boxplot-chart.tsx
    │   │   │   └── waterfall-chart.tsx
    │   │   │
    │   │   ├── filters/               # Filter components
    │   │   │   ├── filter-panel.tsx   # Main filter container
    │   │   │   ├── date-filter.tsx
    │   │   │   ├── multi-select-filter.tsx
    │   │   │   ├── search-filter.tsx
    │   │   │   ├── range-filter.tsx
    │   │   │   └── filter-chip.tsx    # Active filter display
    │   │   │
    │   │   ├── builder/               # Dashboard builder components
    │   │   │   ├── dashboard-grid.tsx       # Drag-drop grid
    │   │   │   ├── draggable-chart.tsx      # @dnd-kit wrapper
    │   │   │   ├── add-chart-modal.tsx      # Chart selector
    │   │   │   ├── chart-config-panel.tsx   # Properties sidebar
    │   │   │   ├── metric-selector.tsx      # Auto-populated from Cube
    │   │   │   ├── dimension-selector.tsx
    │   │   │   ├── chart-preview.tsx
    │   │   │   └── layout-controls.tsx
    │   │   │
    │   │   ├── dashboard/             # Dashboard viewer components
    │   │   │   ├── dashboard-header.tsx
    │   │   │   ├── dashboard-canvas.tsx
    │   │   │   ├── chart-container.tsx
    │   │   │   └── dashboard-actions.tsx
    │   │   │
    │   │   └── common/                # Shared components
    │   │       ├── theme-toggle.tsx
    │   │       ├── workspace-selector.tsx
    │   │       ├── loading-spinner.tsx
    │   │       └── error-boundary.tsx
    │   │
    │   ├── lib/
    │   │   ├── supabase/              # Supabase client & utilities
    │   │   │   ├── client.ts          # Supabase client instance
    │   │   │   ├── server.ts          # Server-side client
    │   │   │   └── middleware.ts      # Auth middleware
    │   │   │
    │   │   ├── cubejs/                # Cube.js client & utilities
    │   │   │   ├── client.ts          # Cube.js client instance
    │   │   │   ├── queries.ts         # Query builders
    │   │   │   └── types.ts           # Cube.js TypeScript types
    │   │   │
    │   │   ├── intelligence/          # Intelligence library
    │   │   │   ├── index.ts           # Main exports
    │   │   │   ├── types.ts           # TypeScript definitions
    │   │   │   ├── gemini-client.ts   # BigQuery Gemini API
    │   │   │   ├── catalog-builder.ts # Build metadata catalog
    │   │   │   │
    │   │   │   ├── platforms/         # Platform-specific libraries
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── google-search-console.ts
    │   │   │   │   ├── google-ads.ts
    │   │   │   │   ├── google-analytics.ts
    │   │   │   │   └── custom.ts
    │   │   │   │
    │   │   │   └── detectors/         # Auto-detection logic
    │   │   │       ├── metric-detector.ts
    │   │   │       ├── format-detector.ts
    │   │   │       ├── sizing-detector.ts
    │   │   │       ├── aggregation-detector.ts
    │   │   │       └── filter-detector.ts
    │   │   │
    │   │   ├── themes/                # Theme system
    │   │   │   ├── echarts-theme.ts   # ECharts theme connector
    │   │   │   ├── colors.ts          # Color palette
    │   │   │   └── tokens.ts          # Design tokens
    │   │   │
    │   │   ├── trpc/                  # tRPC API
    │   │   │   ├── client.ts
    │   │   │   ├── server.ts
    │   │   │   └── routers/
    │   │   │       ├── index.ts       # Root router
    │   │   │       ├── auth.ts
    │   │   │       ├── workspace.ts
    │   │   │       ├── dashboard.ts
    │   │   │       ├── chart.ts
    │   │   │       ├── bigquery.ts
    │   │   │       └── catalog.ts
    │   │   │
    │   │   ├── services/              # Business logic services
    │   │   │   ├── workspace-service.ts
    │   │   │   ├── dashboard-service.ts
    │   │   │   ├── chart-service.ts
    │   │   │   ├── gemini-service.ts
    │   │   │   └── layout-service.ts
    │   │   │
    │   │   └── utils/                 # Utility functions
    │   │       ├── cn.ts              # Class name merger
    │   │       ├── format.ts          # Number formatting
    │   │       ├── validation.ts      # Zod schemas
    │   │       └── constants.ts
    │   │
    │   ├── hooks/                     # Custom React hooks
    │   │   ├── use-dashboard.ts
    │   │   ├── use-filters.ts
    │   │   ├── use-chart-data.ts
    │   │   └── use-workspace.ts
    │   │
    │   ├── providers/                 # Refine providers
    │   │   ├── auth-provider.ts       # Supabase auth
    │   │   ├── data-provider.ts       # Cube.js data
    │   │   ├── supabase-client.ts
    │   │   └── cube-client.ts
    │   │
    │   ├── types/                     # TypeScript types
    │   │   ├── dashboard.ts
    │   │   ├── chart.ts
    │   │   ├── filter.ts
    │   │   ├── intelligence.ts
    │   │   └── index.ts
    │   │
    │   └── styles/                    # Additional styles
    │       └── charts.css
    │
    ├── scripts/                       # Automation scripts
    │   ├── bootstrap-library.ts       # One-time: Generate library from Gemini
    │   ├── enhance-cube-models.ts     # Enhance Cube models with intelligence
    │   ├── sync-metadata.ts           # Sync metadata cache
    │   └── generate-types.ts          # Generate TypeScript types
    │
    └── docs/                          # Documentation
        ├── SETUP.md                   # Setup guide
        ├── ARCHITECTURE.md            # Architecture overview
        ├── API.md                     # API documentation
        ├── AGENT-GUIDE.md             # Guide for AI agents
        └── DEPLOYMENT.md              # Deployment guide
```

---

## 🎯 KEY PRINCIPLES

### **1. Modular by Component**
Each major component (charts, filters, builder) is in its own directory with clear separation of concerns.

### **2. Service Layer**
Business logic is in `services/`, not in components. Components are presentation only.

### **3. Type Safety**
All types defined in `types/` directory, imported everywhere.

### **4. Intelligence Separated**
`lib/intelligence/` is completely separate, can be enhanced without touching UI.

### **5. Platform-Specific**
Each platform (GSC, Ads, Analytics) has its own file in `platforms/`, making it easy to add new platforms.

### **6. Testable**
Services and utilities are pure functions, easy to unit test.

---

## 📦 MODULE DESCRIPTIONS

### **`components/charts/`** - Chart Components
- Each chart type is a separate file
- All use same pattern: `useCubeQuery` + `ReactECharts` + intelligence
- Easily add new chart types

### **`components/filters/`** - Filter System
- Each filter type is separate component
- `filter-panel.tsx` coordinates all filters
- Filter state managed by Cube.js

### **`components/builder/`** - Dashboard Builder
- `dashboard-grid.tsx`: Main drag-drop canvas
- `add-chart-modal.tsx`: Chart selector with intelligence preview
- `chart-config-panel.tsx`: Properties sidebar
- All builder UI logic separated from viewer

### **`lib/intelligence/`** - Intelligence System
- `platforms/`: One file per data platform
- `detectors/`: Auto-detection algorithms
- `gemini-client.ts`: Calls BigQuery Gemini
- `catalog-builder.ts`: Builds from Gemini + Cube

### **`lib/services/`** - Business Logic
- All business logic here, not in components
- Services call Supabase, Cube.js, Gemini
- Pure functions, easily testable

### **`lib/trpc/routers/`** - API Endpoints
- One router per domain (dashboard, chart, workspace)
- Type-safe with Zod validation
- Agent-friendly simple APIs

---

## 🔄 DATA FLOW

```
User Action (UI)
    ↓
Component (presentation only)
    ↓
tRPC Router (API endpoint)
    ↓
Service (business logic)
    ↓
Supabase / Cube.js / Gemini (data sources)
    ↓
Response → Component → User
```

**Clear separation at every layer** ✅

---

## 🎨 STYLING STRATEGY

### **Global Theme** (`app/globals.css`)
- All CSS variables defined once
- Dark/light mode handled
- Chart colors (--chart-1 through --chart-10)

### **Component Styles** (Tailwind)
- Use Tailwind utility classes
- Reference CSS variables: `bg-[hsl(var(--chart-1))]`

### **Chart Themes** (`lib/themes/echarts-theme.ts`)
- Read CSS variables
- Generate ECharts theme object
- One source of truth

---

## 📝 NAMING CONVENTIONS

### **Files**
- Components: `kebab-case.tsx` (e.g., `kpi-card.tsx`)
- Services: `kebab-case.ts` (e.g., `dashboard-service.ts`)
- Types: `kebab-case.ts` (e.g., `chart.ts`)
- Hooks: `use-*.ts` (e.g., `use-dashboard.ts`)

### **Functions**
- React components: `PascalCase` (e.g., `KpiCard`)
- Functions: `camelCase` (e.g., `getChartIntelligence`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_CHART_SIZE`)

### **Types**
- Interfaces: `PascalCase` (e.g., `ChartConfig`)
- Types: `PascalCase` (e.g., `FilterOperator`)
- Enums: `PascalCase` (e.g., `ChartType`)

---

This structure is **modular, scalable, and maintainable** ✅
