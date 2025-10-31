---
name: reporting-platform
description: Dashboard creation, visualization, and BigQuery data flows with 32 chart types + 12 controls and 9 API endpoints. Use when creating dashboards, selecting charts, querying BigQuery, or integrating reporting features. Triggers: "create dashboard", "bigquery data", "chart types", "reporting api", "visualize", "charts", "dashboards"
---

# Reporting Platform Skill - Dashboard Creation & Analytics Visualization

**Keywords that trigger this skill:** "create dashboard", "bigquery data", "chart types", "reporting api", "visualize", "charts", "dashboards"

## 🎯 When to Use This

Use this skill when:
- Creating or modifying dashboards for practitioners
- Selecting appropriate chart types for data visualization
- Querying BigQuery for dashboard data
- Understanding backend API endpoints for data flow
- Integrating platform data into visualizations

## 🏗️ Architecture Overview

**Frontend:** wpp-analytics-platform/frontend/
- Next.js 15 + React 19 + TypeScript
- ECharts 5.5 + Recharts 3.3 for visualizations
- Shadcn/ui components + Tailwind CSS
- Dark mode, export, sharing capabilities
- Drag-and-drop dashboard builder
- OAuth-authenticated requests

**Backend API:** wpp-analytics-platform/frontend/src/app/api/
- 9 endpoints for dashboard management and data queries
- BigQuery integration for unified data source (NO semantic layer)
- OAuth-authenticated requests (user's credentials)

**Data Flow (Direct BigQuery Architecture):**
```
Platform Data (GSC, Ads, Analytics)
  ↓
BigQuery (central hub for blending)
  ↓
Backend API (/api/datasets/[id]/query)
  ↓
Charts query BigQuery directly (with 24hr cache)
  ↓
Dashboard Display (32 chart types + 12 controls)
```

## 📊 32 Chart Types Available

### **Basic Charts (13 types - Most Common)**

The platform supports 13 fundamental chart types for 90% of use cases:

### 1. **Scorecard** - Single Metric Display
**Best for:** KPIs, totals, key numbers
**Example:** "Total Clicks: 45,328"
```json
{
  "type": "scorecard",
  "title": "Total Clicks",
  "metrics": ["clicks"]
}
```

### 2. **Line Chart** - Trends Over Time
**Best for:** Daily trends, weekly patterns, time series
**Dimensions:** date, week, month
**Metrics:** clicks, impressions, revenue
```json
{
  "type": "time_series",
  "title": "Clicks Over Time",
  "dimension": "date",
  "metrics": ["clicks"]
}
```

### 3. **Bar Chart** - Compare Categories
**Best for:** Top campaigns, devices, countries
**Example:** GSC clicks by device (Desktop vs Mobile)
```json
{
  "type": "bar_chart",
  "title": "Clicks by Device",
  "dimension": "device",
  "metrics": ["clicks"]
}
```

### 4. **Area Chart** - Stacked Trends
**Best for:** Composition over time, multiple metrics
**Example:** Spend trend with multiple campaigns
```json
{
  "type": "area_chart",
  "title": "Spend by Campaign",
  "dimension": "date",
  "metrics": ["cost"]
}
```

### 5. **Pie Chart** - Distribution
**Best for:** Showing proportions, percentages
**Example:** Traffic distribution by source
```json
{
  "type": "pie_chart",
  "title": "Traffic by Source",
  "dimension": "source",
  "metrics": ["sessions"]
}
```

### 6. **Table** - Detailed Data Grid
**Best for:** Lists, detailed metrics, sorting/filtering
**Example:** Top keywords with CTR and position
```json
{
  "type": "table",
  "title": "Top Keywords",
  "dimensions": ["query", "device"],
  "metrics": ["clicks", "impressions", "ctr", "position"]
}
```

### 7. **Treemap** - Hierarchical Distribution
**Best for:** Comparing sizes across hierarchy
**Example:** Campaign spend comparison
```json
{
  "type": "treemap",
  "title": "Campaign Spend",
  "dimension": "campaign",
  "metrics": ["cost"]
}
```

### 8. **Sankey** - Flow Diagram
**Best for:** Understanding data flows, attribution
**Example:** GSC clicks → GA4 sessions → conversions
```json
{
  "type": "sankey",
  "title": "Conversion Flow",
  "fromDimension": "source",
  "toDimension": "conversion",
  "metrics": ["users"]
}
```

### 9. **Heatmap** - 2D Distribution
**Best for:** Analyzing patterns across two dimensions
**Example:** CTR by device × country
```json
{
  "type": "heatmap",
  "title": "CTR Heatmap",
  "dimensionX": "device",
  "dimensionY": "country",
  "metrics": ["ctr"]
}
```

### 10. **Gauge** - Progress Indicator
**Best for:** Goal tracking, performance vs target
**Example:** Conversion rate vs goal (8% vs 10%)
```json
{
  "type": "gauge",
  "title": "Conversion Rate",
  "metrics": ["conversion_rate"],
  "min": 0,
  "max": 100
}
```

### 11. **Scatter Plot** - Relationship Analysis
**Best for:** Correlations, outlier detection
**Example:** Cost vs Conversions
```json
{
  "type": "scatter",
  "title": "Cost vs Conversions",
  "xMetric": "cost",
  "yMetric": "conversions"
}
```

### 12. **Funnel Chart** - Conversion Stages
**Best for:** Funnel analysis, drop-off visualization
**Example:** Add to cart → Checkout → Purchase
```json
{
  "type": "funnel_chart",
  "title": "Conversion Funnel",
  "stages": ["add_to_cart", "checkout", "purchase"],
  "metrics": ["users"]
}
```

### 13. **Radar Chart** - Multi-Metric Comparison
**Best for:** Comparing multiple metrics at once
**Example:** Campaign performance across metrics
```json
{
  "type": "radar_chart",
  "title": "Campaign Health",
  "metrics": ["ctr", "conversion_rate", "roas"]
}
```

### **Advanced Charts (19 additional types)**

For specialized visualizations, the platform also supports:
- **BubbleChart** - 3-dimensional scatter (X, Y, size)
- **ComboChart** - Mixed chart types (line + bar)
- **StackedBarChart** - Stacked categories
- **StackedColumnChart** - Vertical stacks
- **WaterfallChart** - Cumulative changes
- **BoxplotChart** - Statistical distributions
- **BulletChart** - Goal vs actual
- **CandlestickChart** - Financial data
- **CalendarHeatmap** - Year-round patterns
- **GeoMapChart** - Geographic data
- **SunburstChart** - Hierarchical pie
- **ThemeRiverChart** - Flowing trends
- **TreeChart** - Hierarchical structure
- **TimelineChart** - Event timeline
- **GraphChart** - Network relationships
- **ParallelChart** - Multi-dimensional comparison
- **PictorialBarChart** - Visual bar charts
- **PivotTableChart** - Interactive pivot table

**Total:** 32 chart types

### **12 Control Components (Filters & Interactivity)**

- **date_range_filter** - Date selection with comparison mode
- **list_filter** - Multi-select filtering
- **checkbox_filter** - Boolean toggles
- **slider_filter** - Numeric range
- **dimension_control** - Dynamic dimension switching
- **input_box_filter** - Text search
- Plus 6 more specialized controls

## 🔌 9 Backend API Endpoints

### 1. `/dashboards/create` - Create New Dashboard
```typescript
POST /api/dashboards/create
Body: {
  title: string,
  datasource: string (BigQuery table),
  rows: Array<RowConfiguration>
}
Returns: { dashboard_id, dashboard_url, workspace_id }
```

### 2. `/dashboards/[id]` - Get/Update/Delete Dashboard
```typescript
GET /api/dashboards/[id]          // Retrieve dashboard config
PUT /api/dashboards/[id]          // Update dashboard (add/remove rows)
DELETE /api/dashboards/[id]       // Delete dashboard
```

### 3. `/dashboards/fields` - Available Metrics & Dimensions
```typescript
GET /api/dashboards/fields?platform=gsc
Returns: {
  dimensions: ["date", "query", "page", ...],
  metrics: ["clicks", "impressions", "ctr", ...]
}
```

### 4. `/data/query` - Execute Data Query
```typescript
POST /api/data/query
Body: {
  sql: string,      // BigQuery SQL
  limit: number
}
Returns: Array<{column: value}>
```

### 5. `/metadata/platforms` - List Available Platforms
```typescript
GET /api/metadata/platforms
Returns: ["gsc", "google_ads", "analytics", "bigquery", "business_profile"]
```

### 6. `/metadata/[platform]` - Platform Metadata
```typescript
GET /api/metadata/gsc
Returns: {
  name: "Google Search Console",
  dimensions: [...],
  metrics: [...],
  scopes: [...]
}
```

### 7. `/datasets/register` - Register Dataset
```typescript
POST /api/datasets/register
Body: {
  name: string,
  platform: string,
  table: string
}
Returns: { dataset_id }
```

### 8. `/datasets/[id]/query` - Query Dataset
```typescript
POST /api/datasets/[id]/query
Body: { query: string }
Returns: Array<Row>
```

### 9. `/datasets/[id]/insert` - Insert Data
```typescript
POST /api/datasets/[id]/insert
Body: { rows: Array<Row> }
Returns: { inserted_count }
```

## 📈 Available Metrics by Platform

### Search Console (GSC)
**Dimensions:** date, query, page, device, country, search_appearance
**Metrics:** clicks, impressions, ctr, position, average_position

### Google Ads
**Dimensions:** campaign, ad_group, keyword, device, location, match_type
**Metrics:** cost, conversions, conversion_value, clicks, impressions, ctr, cpc, roas

### Analytics (GA4)
**Dimensions:** date, source, medium, campaign, page, country, device, browser
**Metrics:** activeUsers, sessions, screenPageViews, conversions, totalRevenue, bounceRate, engagementRate

### BigQuery
- Any custom SQL query combining any platform data
- 100+ dimensions, 200+ metrics across all Google APIs

## 🚀 Common Dashboard Patterns

### Pattern 1: Executive Dashboard
**Components:**
- Scorecard row: 4 KPIs (Clicks, Spend, Conversions, ROAS)
- Line chart: Trends over time
- 2x bar charts: Top campaigns, top keywords
- Pie chart: Traffic by source

### Pattern 2: Performance Comparison
**Components:**
- Date range selector
- 4 scorecards: Current metrics
- Table: Detailed breakdown
- Bar chart: Performance comparison

### Pattern 3: Funnel Analysis
**Components:**
- Funnel chart: Conversion stages
- 3 scorecards: Stage-specific metrics
- Table: Drop-off by device/location
- Heatmap: Performance matrix

### Pattern 4: Budget Optimization
**Components:**
- Scatter plot: Cost vs conversions
- Table: Campaign ROAS ranking
- Bar chart: Cost by campaign
- Gauge: Budget utilization

## 💡 Chart Selection Guide

| Question | Chart Type |
|----------|-----------|
| "What's our total?" | Scorecard |
| "How did it trend?" | Line Chart |
| "Which is highest?" | Bar Chart |
| "What changed over time?" | Area Chart |
| "What are the parts?" | Pie Chart |
| "Show me details" | Table |
| "How do sizes compare?" | Treemap |
| "How does flow?" | Sankey |
| "Find patterns?" | Heatmap |
| "vs Target?" | Gauge |
| "Correlation?" | Scatter Plot |
| "Conversion steps?" | Funnel Chart |
| "Multi-metric view?" | Radar Chart |

## 📝 Example Dashboard Creation

```typescript
// 1. Get available fields for GSC
GET /api/dashboards/fields?platform=gsc
// Returns: dimensions and metrics available

// 2. Create dashboard
POST /api/dashboards/create
{
  title: "GSC Performance",
  datasource: "gsc_data_table",
  rows: [
    {
      columns: [
        {
          width: "3/4",
          component: {
            type: "title",
            title: "Google Search Console"
          }
        },
        {
          width: "1/4",
          component: {
            type: "date_filter"
          }
        }
      ]
    },
    {
      columns: [
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Total Clicks",
            metrics: ["clicks"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Impressions",
            metrics: ["impressions"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Avg Position",
            metrics: ["average_position"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "CTR",
            metrics: ["ctr"]
          }
        }
      ]
    },
    {
      columns: [
        {
          width: "1/2",
          component: {
            type: "time_series",
            title: "Clicks Over Time",
            dimension: "date",
            metrics: ["clicks"]
          }
        },
        {
          width: "1/2",
          component: {
            type: "bar_chart",
            title: "Clicks by Device",
            dimension: "device",
            metrics: ["clicks"]
          }
        }
      ]
    }
  ]
}

// Returns: dashboard_id and dashboard_url
```

## 🔐 Security & Auth

All dashboard operations use OAuth 2.0:
- User credentials passed with each request
- No shared access tokens
- Multi-tenant isolation
- Audit trail of all access

## 📚 Reference

**Files:**
- Frontend: wpp-analytics-platform/frontend/
- Backend API: wpp-analytics-platform/frontend/src/app/api/
- Documentation: wpp-analytics-platform/README.md

**Key Files:**
- API routes: src/app/api/dashboards/
- Components: src/components/
- Charts: Recharts library

## 🎯 Next Steps

1. Choose chart type(s) for your data
2. Get available metrics/dimensions via API
3. Create dashboard with /api/dashboards/create
4. Configure rows and components
5. Share dashboard with team
6. Export to PDF or Excel

## ✨ Features

✅ **32 Chart Types + 12 Controls** - Comprehensive visualization
✅ **Drag-and-drop Builder** - No coding needed
✅ **BigQuery Integration** - Access all data
✅ **Export Options** - PDF, Excel, PNG
✅ **Dark Mode** - Eye-friendly interface
✅ **Sharing** - Share dashboards with team
✅ **OAuth Auth** - Secure access control
✅ **Real-time Updates** - Fresh data on load
