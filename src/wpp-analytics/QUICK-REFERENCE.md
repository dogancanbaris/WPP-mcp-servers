# Dashboard Tools - Quick Reference Card

## 🚀 Quick Start

### Install Dependency
```bash
npm install @supabase/supabase-js
```

### Environment Variables
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
```

---

## 📋 Tool Overview

| Tool | Purpose | Inputs | Output |
|------|---------|--------|--------|
| `create_dashboard` | Create new dashboard | title, rows, datasource | dashboard_id, URL |
| `update_dashboard_layout` | Modify existing | dashboard_id, operation | success status |
| `list_dashboard_templates` | Get templates | none | array of templates |

---

## 🎨 Component Types (14)

### Display
- `title` - Dashboard header
- `date_filter` - Date picker

### Metrics
- `scorecard` - KPI card
- `gauge` - Meter/gauge
- `time_series` - Line chart
- `area_chart` - Filled area

### Comparisons
- `bar_chart` - Bars
- `pie_chart` - Pie/donut
- `treemap` - Hierarchy
- `funnel_chart` - Funnel

### Advanced
- `table` - Data grid
- `heatmap` - Heat map
- `sankey` - Flow
- `scatter_chart` - Scatter
- `radar_chart` - Radar

---

## 📐 Layout System

### Column Widths
```
1/1  = Full width (12 cols)
1/2  = Half (6 cols)
1/3  = Third (4 cols)
2/3  = Two-thirds (8 cols)
1/4  = Quarter (3 cols)
3/4  = Three-quarters (9 cols)
```

### Common Patterns
```
Header:    [Title 3/4][Date 1/4]
KPI Row:   [KPI 1/4][KPI 1/4][KPI 1/4][KPI 1/4]
Charts:    [Chart 1/2][Chart 1/2]
Table:     [Table 1/1]
```

---

## 💻 Code Templates

### Minimal Dashboard
```js
createDashboardTool.handler({
  title: "Dashboard",
  rows: [{
    columns: [{
      width: "1/1",
      component: { type: "title", title: "My Dashboard" }
    }]
  }],
  supabaseUrl: "...",
  supabaseKey: "..."
})
```

### From Template
```js
const { templates } = await listDashboardTemplatesTool.handler({});
const seo = templates.find(t => t.id === 'seo_overview');
createDashboardTool.handler({ ...seo, supabaseUrl, supabaseKey });
```

### Add Row
```js
updateDashboardLayoutTool.handler({
  dashboard_id: "uuid",
  operation: "add_row",
  data: { columns: [{ width: "1/1", component: {...} }] },
  supabaseUrl: "...",
  supabaseKey: "..."
})
```

### Remove Row
```js
updateDashboardLayoutTool.handler({
  dashboard_id: "uuid",
  operation: "remove_row",
  data: { row_id: "row-abc123" },
  supabaseUrl: "...",
  supabaseKey: "..."
})
```

### Update Component
```js
updateDashboardLayoutTool.handler({
  dashboard_id: "uuid",
  operation: "update_component",
  data: {
    component_id: "col-xyz",
    component: { type: "scorecard", title: "New Title", metrics: ["clicks"] }
  },
  supabaseUrl: "...",
  supabaseKey: "..."
})
```

---

## 🗂️ Templates Available

### 1. SEO Overview (8 components)
- Header + 4 scorecards + time series + 2 bar charts
- Datasource: `gsc_performance_7days`

### 2. Campaign Performance (12 components)
- Header + 6 scorecards + 2 area charts + table
- Datasource: `google_ads_campaign_stats`

### 3. Analytics Overview (9 components)
- Header + 4 KPIs + area + 2 pies + bar
- Datasource: `google_analytics_sessions`

### 4. Blank Dashboard (1 component)
- Just header, build your own
- Datasource: `gsc_performance_7days`

---

## 📊 Data Sources

### Search Console
- `gsc_performance_7days`
- `gsc_performance_30days`
- `gsc_performance_90days`

**Metrics:** clicks, impressions, ctr, position

### Google Ads
- `google_ads_campaign_stats`
- `google_ads_ad_group_stats`
- `google_ads_keyword_stats`

**Metrics:** clicks, impressions, cost, conversions, roas, ctr, cpc, cpa

### Analytics
- `google_analytics_sessions`
- `google_analytics_pageviews`
- `google_analytics_conversions`

**Metrics:** users, sessions, bounce_rate, avg_session_duration, pageviews

---

## ⚡ Common Operations

### List Templates
```js
const { templates } = await listDashboardTemplatesTool.handler({});
templates.forEach(t => console.log(`${t.id}: ${t.name}`));
```

### Create from Scratch
```js
const dashboard = {
  title: "Custom",
  datasource: "gsc_performance_7days",
  rows: [
    { columns: [{ width: "3/4", component: { type: "title", title: "Title" }}] },
    { columns: [{ width: "1/4", component: { type: "scorecard", metrics: ["clicks"] }}] }
  ],
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};
const result = await createDashboardTool.handler(dashboard);
```

### Clone Template & Modify
```js
const template = templates.find(t => t.id === 'seo_overview');
template.rows[1].columns[0].component.title = "Custom Clicks";
const result = await createDashboardTool.handler({
  title: "Modified SEO",
  datasource: template.datasource,
  rows: template.rows,
  supabaseUrl, supabaseKey
});
```

---

## 🔧 Troubleshooting

### Error: User not authenticated
**Solution:** Add `workspaceId: "your-workspace-id"` to input

### Error: Dashboard not found
**Solution:** Check dashboard ID and user permissions

### Error: Validation error
**Solution:** Check error.details array for specific issues

### Error: Supabase connection
**Solution:** Verify SUPABASE_URL and SUPABASE_KEY

---

## 📁 File Locations

**Source:**
- `src/wpp-analytics/tools/dashboards.ts`
- `src/wpp-analytics/tools/index.ts`

**Docs:**
- `src/wpp-analytics/README.md` (full guide)
- `src/wpp-analytics/EXAMPLES.md` (15+ examples)
- `src/wpp-analytics/QUICK-REFERENCE.md` (this file)

**Config:**
- `.env` (environment variables)

**Build:**
- `dist/wpp-analytics/tools/` (compiled output)

---

## 🎯 Best Practices

1. **Always start with header row** (title + date filter)
2. **Group related metrics** in same row
3. **Use templates** as starting points
4. **Limit to 10-15 components** per dashboard
5. **Test with small dashboards** first
6. **Provide workspaceId** if auth issues occur

---

## 🔗 Integration

### MCP Server
Tools automatically registered in `src/gsc/tools/index.ts`

### Tool Count
60 total MCP tools (3 dashboard tools + 57 others)

### Supabase
Connects to `dashboards` table with workspace isolation

---

## 📞 Support

**Full Documentation:** `src/wpp-analytics/README.md`
**Usage Examples:** `src/wpp-analytics/EXAMPLES.md`
**Implementation Summary:** `DASHBOARD-TOOLS-SUMMARY.md`

**Debugging:**
```bash
LOG_LEVEL=DEBUG node dist/gsc/server.js
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-22
**Status:** Production Ready ✅
