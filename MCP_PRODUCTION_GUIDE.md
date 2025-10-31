# WPP MCP Server - Production Guide

**Last Updated:** October 30, 2025
**Version:** 1.0.0 (Consolidated)

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Tool Reference](#tool-reference)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

The WPP Digital Marketing MCP Server provides a unified interface for:
- **Data Pulling:** Extract data from Google Search Console, Google Ads, and GA4
- **BigQuery Integration:** Store data in shared tables for multi-dashboard support
- **Dashboard Creation:** Build interactive dashboards with 33+ chart types
- **Dataset Management:** Share data sources across multiple dashboards

### Key Features
- ✅ **Shared Table Architecture:** Reduces storage costs by 90%
- ✅ **Automatic Dataset Registration:** Tracks and reuses BigQuery tables
- ✅ **Multi-Page Dashboards:** Organize complex dashboards with pages
- ✅ **Filter Cascade System:** Global, page-level, and component-level filters
- ✅ **33+ Chart Types:** Scorecards, time series, tables, maps, and more

---

## Quick Start

### 1. Setup Environment

```bash
# Navigate to project
cd "/home/dogancanbaris/projects/MCP Servers"

# Install dependencies
npm install

# Build the server
npm run build
```

### 2. Configure Claude Desktop

Your `.mcp.json` should include:

```json
{
  "mcpServers": {
    "wpp-digital-marketing": {
      "command": "node",
      "args": [
        "/home/dogancanbaris/projects/MCP Servers/dist/gsc/server.js"
      ],
      "env": {
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

### 3. Verify Installation

Restart Claude Desktop and check for `wpp-digital-marketing` tools.

---

## Tool Reference

### Core Tools (Production-Ready)

#### 1. `push_platform_data_to_bigquery`

Pull data from marketing platforms and insert to BigQuery.

**Required Parameters:**
- `platform`: "gsc" | "google_ads" | "analytics"
- `property`: Property identifier (e.g., "sc-domain:example.com")
- `dateRange`: [startDate, endDate] in YYYY-MM-DD format
- `dimensions`: Array of dimensions (e.g., ["date", "page", "query"])
- `workspaceId`: Workspace UUID

**Optional Parameters:**
- `useSharedTable`: boolean (default: true)

**Example:**
```javascript
push_platform_data_to_bigquery({
  platform: 'gsc',
  property: 'sc-domain:themindfulsteward.com',
  dateRange: ['2024-06-25', '2025-10-29'],
  dimensions: ['date', 'page', 'query', 'device', 'country'],
  workspaceId: '945907d8-7e88-45c4-8fde-9db35d5f5ce2',
  useSharedTable: true
})
```

**Returns:**
```json
{
  "success": true,
  "table": "mcp-servers-475317.wpp_marketing.gsc_performance_shared",
  "rows_inserted": 5015590
}
```

---

#### 2. `create_dashboard`

Create interactive dashboards with custom layouts.

**Required Parameters:**
- `title`: Dashboard name
- `workspaceId`: Workspace UUID
- `datasource`: BigQuery table reference (e.g., "mcp-servers-475317.wpp_marketing.gsc_performance_shared")
- `rows`: Array of row configurations (single-page) OR `pages`: Array of page configurations (multi-page)

**Example:**
```javascript
create_dashboard({
  title: 'SEO Performance Dashboard',
  workspaceId: '945907d8-7e88-45c4-8fde-9db35d5f5ce2',
  datasource: 'mcp-servers-475317.wpp_marketing.gsc_performance_shared',
  rows: [
    {
      columns: [
        {width: '1/4', component: {type: 'scorecard', title: 'Clicks', metrics: ['clicks']}},
        {width: '1/4', component: {type: 'scorecard', title: 'Impressions', metrics: ['impressions']}},
        {width: '1/4', component: {type: 'scorecard', title: 'CTR', metrics: ['ctr']}},
        {width: '1/4', component: {type: 'scorecard', title: 'Position', metrics: ['position']}}
      ]
    },
    {
      columns: [
        {width: '1/1', component: {type: 'time_series', title: 'Traffic Trend', dimension: 'date', metrics: ['clicks', 'impressions']}}
      ]
    }
  ]
})
```

---

#### 3. `list_dashboards`

Find dashboards by name or list all in workspace.

**Parameters:**
- `search`: Search term (optional)
- `workspaceId`: Workspace UUID (optional - auto-detected)
- `limit`: Max results (default: 50)

**Example:**
```javascript
list_dashboards({
  search: 'Mindful Steward',
  limit: 10
})
```

---

#### 4. `get_dashboard`

Retrieve complete dashboard configuration.

**Parameters:**
- `dashboard_id`: Dashboard UUID

**Example:**
```javascript
get_dashboard({
  dashboard_id: 'c90e22de-b8ad-49dc-9f88-d60f5be085af'
})
```

---

#### 5. `update_dashboard_layout`

Modify existing dashboard structure.

**Parameters:**
- `dashboard_id`: Dashboard UUID
- `operation`: Type of modification
  - `add_page`, `remove_page`, `update_page`, `reorder_pages`
  - `add_row_to_page`, `remove_row_from_page`
  - `update_component_in_page`
  - `set_page_filters`, `set_component_filters`
- `data`: Operation-specific data

**Example:**
```javascript
update_dashboard_layout({
  dashboard_id: 'c90e22de-b8ad-49dc-9f88-d60f5be085af',
  operation: 'add_row_to_page',
  data: {
    page_id: 'page-abc123',
    columns: [...]
  }
})
```

---

#### 6. `list_datasets`

Discover shareable BigQuery datasets in workspace.

**Parameters:**
- `workspace_id`: Workspace UUID
- `platform`: Filter by platform (optional)

**Example:**
```javascript
list_datasets({
  workspace_id: '945907d8-7e88-45c4-8fde-9db35d5f5ce2',
  platform: 'gsc'
})
```

---

#### 7. `delete_dashboard`

Remove dashboard by ID.

**Parameters:**
- `dashboard_id`: Dashboard UUID
- `workspaceId`: Workspace UUID (optional)

**Example:**
```javascript
delete_dashboard({
  dashboard_id: 'c90e22de-b8ad-49dc-9f88-d60f5be085af'
})
```

---

## Common Workflows

### Workflow 1: Create Dashboard from GSC Data

```javascript
// Step 1: Pull GSC data to shared table
const dataResult = await push_platform_data_to_bigquery({
  platform: 'gsc',
  property: 'sc-domain:example.com',
  dateRange: ['2024-01-01', '2024-12-31'],
  dimensions: ['date', 'page', 'query', 'device', 'country'],
  workspaceId: 'workspace-uuid',
  useSharedTable: true
});

// Step 2: Create dashboard using returned table
const dashboardResult = await create_dashboard({
  title: 'SEO Performance 2024',
  workspaceId: 'workspace-uuid',
  datasource: dataResult.table,
  rows: [
    // ... row configurations
  ]
});

// Step 3: Open dashboard
console.log(`Dashboard URL: /dashboard/${dashboardResult.dashboard_id}/builder`);
```

---

### Workflow 2: Share Data Across Multiple Dashboards

```javascript
// Step 1: Pull data once to shared table
await push_platform_data_to_bigquery({
  platform: 'gsc',
  property: 'sc-domain:example.com',
  dateRange: ['2024-01-01', '2024-12-31'],
  dimensions: ['date', 'page', 'query'],
  workspaceId: 'workspace-uuid',
  useSharedTable: true
});

// Step 2: Create multiple dashboards using same table
const overviewDashboard = await create_dashboard({
  title: 'Executive Overview',
  workspaceId: 'workspace-uuid',
  datasource: 'mcp-servers-475317.wpp_marketing.gsc_performance_shared',
  // ... KPI-focused layout
});

const detailDashboard = await create_dashboard({
  title: 'Detailed Analysis',
  workspaceId: 'workspace-uuid',
  datasource: 'mcp-servers-475317.wpp_marketing.gsc_performance_shared',
  // ... detailed table layout
});

// Benefits:
// - Data pulled once
// - Storage costs shared
// - Consistent data across dashboards
```

---

### Workflow 3: Update Existing Dashboard

```javascript
// Step 1: Find dashboard
const dashboards = await list_dashboards({
  search: 'SEO Performance'
});

const dashboardId = dashboards.dashboards[0].id;

// Step 2: Get current structure
const dashboard = await get_dashboard({
  dashboard_id: dashboardId
});

// Step 3: Add new row
await update_dashboard_layout({
  dashboard_id: dashboardId,
  operation: 'add_row_to_page',
  data: {
    page_id: dashboard.dashboard.pages[0].id,
    columns: [
      {
        width: '1/1',
        component: {
          type: 'bar_chart',
          title: 'Top Countries',
          dimension: 'country',
          metrics: ['clicks']
        }
      }
    ]
  }
});
```

---

## Troubleshooting

### Issue: "workspaceId is required"

**Cause:** The consolidated tool requires explicit workspaceId.

**Solution:**
```javascript
// Always provide workspaceId
create_dashboard({
  title: 'My Dashboard',
  workspaceId: '945907d8-7e88-45c4-8fde-9db35d5f5ce2', // ✅ Required
  datasource: '...',
  rows: [...]
})
```

---

### Issue: "Could not find the 'cube_model_name' column"

**Cause:** Supabase schema cache needs refresh.

**Solution:**
1. The code has been fixed to set `cube_model_name: null`
2. Restart Claude Desktop to reload the MCP server
3. If issue persists, check that the build is up to date: `npm run build`

---

### Issue: "Dataset query failed, table might not exist"

**Cause:** The `datasets` table migration hasn't been applied.

**Solution:**
```bash
# Run the migration
cd wpp-analytics-platform
supabase migration up 20251029000000_add_datasets.sql
```

**Note:** The tool gracefully handles this - dashboards still work without dataset tracking.

---

### Issue: Dashboard shows no data

**Causes:**
1. Wrong BigQuery table reference
2. Missing workspace_id filter
3. Table doesn't contain data for workspace

**Solution:**
```javascript
// Verify table exists
list_datasets({
  workspace_id: 'workspace-uuid'
});

// Check table in BigQuery
// SELECT * FROM `mcp-servers-475317.wpp_marketing.gsc_performance_shared`
// WHERE workspace_id = 'workspace-uuid' LIMIT 10
```

---

## Best Practices

### 1. Always Use Shared Tables

```javascript
// ✅ GOOD: Shared table (default)
push_platform_data_to_bigquery({
  platform: 'gsc',
  property: 'sc-domain:example.com',
  dateRange: ['2024-01-01', '2024-12-31'],
  dimensions: ['date', 'page', 'query'],
  workspaceId: 'workspace-uuid',
  useSharedTable: true  // Default
});

// ❌ BAD: Per-dashboard table (legacy)
push_platform_data_to_bigquery({
  // ... same params
  useSharedTable: false  // Don't do this
});
```

**Benefits:**
- 90% reduction in BigQuery storage costs
- Consistent data across dashboards
- Easier data management

---

### 2. Pull All Dimensions Upfront

```javascript
// ✅ GOOD: Pull all dimensions you might need
dimensions: ['date', 'page', 'query', 'device', 'country']

// ❌ BAD: Pull minimal dimensions, then realize you need more later
dimensions: ['date', 'page']
```

**Why:** Re-pulling data is expensive and time-consuming.

---

### 3. Use Multi-Page for Complex Dashboards

```javascript
// ✅ GOOD: Organize into pages
create_dashboard({
  title: 'Complete SEO Report',
  workspaceId: 'workspace-uuid',
  datasource: '...',
  pages: [
    {name: 'Overview', rows: [/* KPIs */]},
    {name: 'Details', rows: [/* Tables */]},
    {name: 'Analysis', rows: [/* Advanced charts */]}
  ]
});

// ❌ BAD: 20+ components in single page
create_dashboard({
  title: 'Everything Dashboard',
  rows: [/* 20 rows of components */]
});
```

---

### 4. Verify Data Before Dashboard Creation

```javascript
// Step 1: Pull data
const result = await push_platform_data_to_bigquery({...});

// Step 2: Verify rows inserted
console.log(`Inserted ${result.rows_inserted} rows`);

// Step 3: Only create dashboard if data exists
if (result.rows_inserted > 0) {
  await create_dashboard({...});
} else {
  console.log('No data to display');
}
```

---

### 5. Use Descriptive Dashboard Names

```javascript
// ✅ GOOD: Clear, searchable names
title: 'SEO Performance - Q4 2024 - themindfulsteward.com'

// ❌ BAD: Generic names
title: 'Dashboard 1'
```

---

## Component Library

The consolidated tool supports 33+ chart types. See the full list in the tool description or check:

- **Core Charts (18):** scorecard, time_series, table, bar_chart, line_chart, area_chart, pie_chart, stacked_bar_chart, stacked_column_chart, scatter_chart, bubble_chart, heatmap_chart, radar_chart, funnel_chart, gauge_chart, treemap_chart, waterfall_chart, sankey_chart

- **Advanced Charts (15):** parallel_chart, bullet_chart, candlestick_chart, theme_river_chart, combo_chart, boxplot_chart, pictorial_bar_chart, sunburst_chart, calendar_heatmap, pivot_table_chart, graph_chart, tree_chart, timeline_chart, geomap_chart, and more

- **Control Components (10):** date_range_filter, checkbox_filter, list_filter, dimension_control, slider_filter, input_box_filter, advanced_filter, preset_filter, button_control, dropdown_filter

---

## Support & Resources

- **Source Code:** `/home/dogancanbaris/projects/MCP Servers/src/wpp-analytics/`
- **Build Output:** `/home/dogancanbaris/projects/MCP Servers/dist/`
- **Configuration:** `/home/dogancanbaris/projects/MCP Servers/.mcp.json`
- **Logs:** Check Claude Desktop console for MCP tool execution logs

---

## Changelog

### v1.0.0 (October 30, 2025) - Consolidated Release

**Breaking Changes:**
- `workspaceId` now REQUIRED for all operations
- `datasource` now REQUIRED for dashboard creation
- `useSharedTable` defaults to TRUE (was false)
- Removed `create_dashboard_from_table` tool (merged into `create_dashboard`)
- Removed `list_dashboard_templates` tool (not needed)

**New Features:**
- ✅ Automatic dataset registration and reuse
- ✅ Dataset_id injection into all components
- ✅ Graceful handling of missing datasets table
- ✅ Improved error messages and logging

**Bug Fixes:**
- Fixed TypeScript type errors in component counting
- Removed unused `getOrCreateWorkspace` import
- Set `cube_model_name: null` for legacy column compatibility

**Improvements:**
- Simplified tool exports (6 essential tools)
- Updated documentation with production workflows
- Added comprehensive troubleshooting guide

---

**Next Steps:**
1. Test dashboard creation after Claude Desktop restart
2. Monitor BigQuery storage usage (should see 90% reduction)
3. Verify dataset sharing across multiple dashboards

**Questions?** Check the troubleshooting section or review the source code.
