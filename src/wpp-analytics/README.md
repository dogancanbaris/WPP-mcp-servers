# WPP Analytics Platform - Dashboard Management Tools

## Overview

This module provides MCP tools for programmatically creating and managing dashboards in the WPP Analytics Platform. AI agents can use these tools to build custom dashboards, update layouts, and work with pre-built templates.

## Architecture

```
src/wpp-analytics/
├── tools/
│   ├── dashboards.ts    # Main dashboard management tools
│   └── index.ts         # Export all tools
└── README.md           # This file
```

## Available Tools

### 1. `create_dashboard`

Create a new dashboard with custom layout and components.

**Key Features:**
- Flexible row/column layout system
- 14 component types (scorecard, charts, tables, etc.)
- Automatic ID generation
- Supabase persistence
- Workspace isolation

**Parameters:**
- `title`: Dashboard name (required)
- `datasource`: BigQuery table name (default: "gsc_performance_7days")
- `rows`: Array of row configurations (required)
- `workspaceId`: Optional workspace ID (auto-detected from user)
- `supabaseUrl`: Supabase project URL (required)
- `supabaseKey`: Supabase API key (required)

**Example:**
```json
{
  "title": "SEO Performance Dashboard",
  "datasource": "gsc_performance_7days",
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc...",
  "rows": [
    {
      "columns": [
        {
          "width": "3/4",
          "component": {
            "type": "title",
            "title": "SEO Overview"
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "date_filter"
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Total Clicks",
            "metrics": ["clicks"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Impressions",
            "metrics": ["impressions"]
          }
        }
      ]
    }
  ]
}
```

**Returns:**
```json
{
  "success": true,
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "dashboard_url": "/dashboards/550e8400-e29b-41d4-a716-446655440000",
  "workspace_id": "workspace-uuid",
  "row_count": 2,
  "component_count": 3,
  "created_at": "2025-10-22T15:00:00.000Z"
}
```

---

### 2. `update_dashboard_layout`

Modify existing dashboard by adding/removing rows or updating components.

**Operations:**
- `add_row`: Append new row at end
- `remove_row`: Delete row by ID
- `update_component`: Modify component configuration

**Parameters:**
- `dashboard_id`: UUID of dashboard (required)
- `operation`: Operation type (required)
- `data`: Operation-specific data (required)
- `supabaseUrl`: Supabase project URL (required)
- `supabaseKey`: Supabase API key (required)

**Example - Add Row:**
```json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "add_row",
  "data": {
    "columns": [
      {
        "width": "1/2",
        "component": {
          "type": "bar_chart",
          "title": "Device Breakdown",
          "dimension": "device",
          "metrics": ["clicks"]
        }
      }
    ]
  },
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
```

**Example - Remove Row:**
```json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "remove_row",
  "data": {
    "row_id": "row-abc123"
  },
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
```

**Example - Update Component:**
```json
{
  "dashboard_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation": "update_component",
  "data": {
    "component_id": "col-xyz789",
    "component": {
      "type": "scorecard",
      "title": "Updated Clicks",
      "metrics": ["clicks", "impressions"]
    }
  },
  "supabaseUrl": "https://xxx.supabase.co",
  "supabaseKey": "eyJhbGc..."
}
```

---

### 3. `list_dashboard_templates`

Get pre-built dashboard templates for quick creation.

**No Parameters Required**

**Returns:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "seo_overview",
      "name": "SEO Overview",
      "description": "Header + 4 scorecards + time series + 2 comparison charts",
      "datasource": "gsc_performance_7days",
      "component_count": 8,
      "rows": [...]
    }
  ],
  "count": 4
}
```

**Available Templates:**
1. **SEO Overview** - Search Console reporting (8 components)
2. **Campaign Performance** - Google Ads reporting (12 components)
3. **Analytics Overview** - Google Analytics reporting (9 components)
4. **Blank Dashboard** - Empty starting point (1 component)

---

## Component Types

### Display Components
- **`title`**: Dashboard header text
- **`date_filter`**: Date range picker

### Metric Visualizations
- **`scorecard`**: Single KPI card with large number
- **`gauge`**: Gauge/meter for percentage metrics
- **`time_series`**: Line chart over time
- **`area_chart`**: Filled area chart

### Comparison Charts
- **`bar_chart`**: Vertical/horizontal bar chart
- **`pie_chart`**: Pie or donut chart
- **`treemap`**: Hierarchical treemap
- **`funnel_chart`**: Conversion funnel

### Advanced Visualizations
- **`table`**: Data grid with sorting/filtering
- **`heatmap`**: Color-coded heatmap
- **`sankey`**: Flow diagram
- **`scatter_chart`**: X/Y scatter plot
- **`radar_chart`**: Spider/radar chart

---

## Column Width System

Based on 12-column grid (Bootstrap-style):

- **`1/1`**: Full width (12 columns)
- **`1/2`**: Half width (6 columns)
- **`1/3`**: One third (4 columns)
- **`2/3`**: Two thirds (8 columns)
- **`1/4`**: One quarter (3 columns)
- **`3/4`**: Three quarters (9 columns)

**Layout Examples:**

```
Header Row:
┌─────────────────┬──────┐
│  Title (3/4)    │ Date │
│                 │ (1/4)│
└─────────────────┴──────┘

KPI Row:
┌────┬────┬────┬────┐
│ KPI│ KPI│ KPI│ KPI│
│(1/4)(1/4)(1/4)(1/4)│
└────┴────┴────┴────┘

Chart Comparison:
┌──────────┬──────────┐
│  Chart   │  Chart   │
│  (1/2)   │  (1/2)   │
└──────────┴──────────┘

Full Width Table:
┌─────────────────────┐
│    Table (1/1)      │
└─────────────────────┘
```

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# WPP Analytics Platform - Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get these values from: **Settings > API** in your Supabase dashboard

---

## Usage Workflow

### Creating a Dashboard from Template

```typescript
// 1. List available templates
const templates = await listDashboardTemplatesTool.handler({});

// 2. Choose template (e.g., SEO Overview)
const template = templates.templates.find(t => t.id === 'seo_overview');

// 3. Customize and create
const result = await createDashboardTool.handler({
  title: "My Custom SEO Dashboard",
  datasource: "gsc_performance_30days", // Changed from 7 days
  rows: template.rows, // Use template layout
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});

console.log(`Dashboard created: ${result.dashboard_url}`);
```

### Creating a Custom Dashboard

```typescript
const result = await createDashboardTool.handler({
  title: "Custom Performance Dashboard",
  datasource: "google_ads_campaign_stats",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  rows: [
    {
      columns: [
        { width: "3/4", component: { type: "title", title: "Campaign Performance" }},
        { width: "1/4", component: { type: "date_filter" }}
      ]
    },
    {
      columns: [
        { width: "1/3", component: { type: "scorecard", title: "Spend", metrics: ["cost"] }},
        { width: "1/3", component: { type: "scorecard", title: "Conversions", metrics: ["conversions"] }},
        { width: "1/3", component: { type: "gauge", title: "CTR", metrics: ["ctr"] }}
      ]
    },
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "time_series",
            title: "Spend Trend",
            dimension: "date",
            metrics: ["cost", "conversions"]
          }
        }
      ]
    }
  ]
});
```

### Updating a Dashboard

```typescript
// Add a new row
await updateDashboardLayoutTool.handler({
  dashboard_id: "550e8400-e29b-41d4-a716-446655440000",
  operation: "add_row",
  data: {
    columns: [
      {
        width: "1/1",
        component: {
          type: "table",
          title: "Campaign Details",
          dimension: "campaign_name",
          metrics: ["clicks", "impressions", "cost", "conversions"]
        }
      }
    ]
  },
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
```

---

## Data Sources

Dashboards can connect to any BigQuery table in your WPP Analytics Platform:

### Available Data Sources

1. **Search Console**
   - `gsc_performance_7days`
   - `gsc_performance_30days`
   - `gsc_performance_90days`

2. **Google Ads**
   - `google_ads_campaign_stats`
   - `google_ads_ad_group_stats`
   - `google_ads_keyword_stats`

3. **Google Analytics**
   - `google_analytics_sessions`
   - `google_analytics_pageviews`
   - `google_analytics_conversions`

4. **Custom Tables**
   - Any BigQuery table you've created

### Available Metrics by Data Source

**Search Console:**
- `clicks`, `impressions`, `ctr`, `position`

**Google Ads:**
- `clicks`, `impressions`, `cost`, `conversions`, `roas`, `ctr`, `cpc`, `cpa`

**Google Analytics:**
- `users`, `sessions`, `bounce_rate`, `avg_session_duration`, `pageviews`

---

## Best Practices

### Dashboard Design

1. **Start with Header Row**: Always include title + date filter
2. **Group Related Metrics**: Put related KPIs together
3. **Visual Hierarchy**: Use larger components for important metrics
4. **Limit Components**: 10-15 components per dashboard for performance
5. **Consistent Widths**: Align components in rows for visual consistency

### Layout Patterns

**Executive Dashboard:**
```
Row 1: Title (3/4) + Date Filter (1/4)
Row 2: 4x Scorecards (1/4 each) - Key metrics
Row 3: 1x Large chart (1/1) - Main trend
Row 4: 2x Medium charts (1/2 each) - Comparisons
```

**Detailed Analysis:**
```
Row 1: Title (3/4) + Date Filter (1/4)
Row 2: 3x Scorecards (1/3 each) - Primary KPIs
Row 3: 2x Charts (1/2 each) - Trends
Row 4: 1x Table (1/1) - Detailed data
```

**Quick Overview:**
```
Row 1: Title (3/4) + Date Filter (1/4)
Row 2: 6x Scorecards (1/3 on mobile, 1/4 on desktop)
Row 3: 1x Summary chart (1/1)
```

### Performance Tips

1. **Limit row count**: Max 8-10 rows per dashboard
2. **Optimize queries**: Use pre-aggregated BigQuery tables
3. **Cache results**: Enable BigQuery caching in Cube.js
4. **Lazy loading**: Components load as user scrolls
5. **Mobile-friendly**: Test on mobile devices

---

## Integration with WPP Analytics Platform

### Dashboard Lifecycle

```
1. Agent calls create_dashboard
   ↓
2. Dashboard saved to Supabase
   ↓
3. Frontend loads dashboard config
   ↓
4. Components query Cube.js API
   ↓
5. Cube.js queries BigQuery
   ↓
6. Results rendered in components
```

### Workspace Isolation

- Each dashboard belongs to a workspace
- Workspaces tied to user accounts
- Row-Level Security (RLS) in Supabase
- Cross-workspace sharing available

### Real-time Updates

- Dashboard config changes are immediate
- Data refreshes based on Cube.js cache settings
- No page reload required for layout changes

---

## Error Handling

### Common Errors

**1. Authentication Error**
```json
{
  "success": false,
  "error": "User not authenticated. Please provide workspaceId."
}
```
**Solution:** Provide `workspaceId` explicitly or ensure user is logged in

**2. Invalid Dashboard ID**
```json
{
  "success": false,
  "error": "Dashboard not found"
}
```
**Solution:** Check dashboard ID is correct and user has access

**3. Validation Error**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    "rows.0.columns.0.width: Invalid enum value"
  ]
}
```
**Solution:** Fix validation errors listed in `details` array

**4. Supabase Connection Error**
```json
{
  "success": false,
  "error": "Failed to create dashboard: connection error"
}
```
**Solution:** Check `SUPABASE_URL` and `SUPABASE_KEY` in environment

---

## Testing

### Unit Tests

```bash
npm test src/wpp-analytics/tools/dashboards.test.ts
```

### Integration Tests

```typescript
// Test dashboard creation
const result = await createDashboardTool.handler({
  title: "Test Dashboard",
  datasource: "gsc_performance_7days",
  rows: [{ columns: [{ width: "1/1", component: { type: "title", title: "Test" }}]}],
  workspaceId: "test-workspace-id",
  supabaseUrl: process.env.TEST_SUPABASE_URL,
  supabaseKey: process.env.TEST_SUPABASE_KEY
});

expect(result.success).toBe(true);
expect(result.dashboard_id).toBeDefined();
```

---

## Roadmap

### Planned Features

- [ ] Dashboard cloning/duplication
- [ ] Export to PDF/PNG
- [ ] Scheduled email reports
- [ ] Dashboard versioning
- [ ] Undo/redo functionality
- [ ] Collaborative editing
- [ ] Custom component themes
- [ ] Advanced filtering UI
- [ ] Drill-down navigation
- [ ] Dashboard folders/organization

---

## Support

### Getting Help

1. Check tool descriptions in code
2. Review examples in this README
3. Test with `list_dashboard_templates` first
4. Enable DEBUG logging: `LOG_LEVEL=DEBUG`

### Debugging

Enable detailed logging:

```bash
LOG_LEVEL=DEBUG node dist/gsc/server.js
```

View logs:

```bash
tail -f logs/audit.log
```

---

## License

MIT License - See LICENSE file for details

---

## Contributors

- WPP Backend API Specialist (Tool Creator)
- Claude Code (Implementation Assistant)

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
**Status:** Production Ready ✅
