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
- Recharts for all visualizations (NOT Cube.js - old docs were wrong)
- Shadcn/ui components + Tailwind CSS
- Dark mode, export, sharing capabilities
- Drag-and-drop dashboard builder

**Backend API:** wpp-analytics-platform/frontend/src/app/api/
- 9 endpoints for dashboard management and data queries
- BigQuery integration for unified data source
- OAuth-authenticated requests (user's credentials)

**Data Flow:**
```
Platform Data (GSC, Ads, Analytics)
  ↓
BigQuery (central hub for blending)
  ↓
Backend API (calculates metrics, aggregates)
  ↓
Frontend Recharts (13 chart types)
  ↓
Dashboard Display
```

## 📊 9 Backend API Endpoints

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
  table: string,
  description: string
}
Returns: { dataset_id }
```

### 8. `/datasets/[id]/query` - Query Dataset
```typescript
POST /api/datasets/[id]/query
Body: { filters, limit }
Returns: Array<data>
```

### 9. `/datasets/[id]/insert` - Insert Data to Dataset
```typescript
POST /api/datasets/[id]/insert
Body: Array<{row_data}>
Returns: { inserted_count }
```

## 📈 13 Chart Types Available

### 1. **Scorecard** - Single Metric KPI
```typescript
{
  type: "scorecard",
  title: "Total Clicks",
  metrics: ["clicks"],
  format: "number"
}
```
Use for: Top-level KPIs, metrics summaries, critical numbers

### 2. **Time Series (Line Chart)** - Trend Over Time
```typescript
{
  type: "time_series",
  title: "Performance Trend",
  dimension: "date",
  metrics: ["clicks", "impressions"]
}
```
Use for: Daily/weekly trends, performance monitoring, forecasting

### 3. **Area Chart** - Stacked Area Visualization
```typescript
{
  type: "area_chart",
  title: "Revenue Growth",
  dimension: "date",
  metrics: ["revenue", "cost"]
}
```
Use for: Composition over time, cumulative trends

### 4. **Bar Chart** - Categorical Comparison
```typescript
{
  type: "bar_chart",
  title: "Top Campaigns",
  dimension: "campaign",
  metrics: ["clicks", "spend"],
  orientation: "vertical"
}
```
Use for: Top N comparisons, category rankings

### 5. **Horizontal Bar Chart** - Ranked List
```typescript
{
  type: "bar_chart",
  title: "Top Pages by Traffic",
  dimension: "page",
  metrics: ["clicks"],
  orientation: "horizontal"
}
```
Use for: Readable rankings, long labels

### 6. **Pie Chart** - Proportion Distribution
```typescript
{
  type: "pie_chart",
  title: "Traffic by Source",
  dimension: "source",
  metrics: ["sessions"]
}
```
Use for: Market share, channel mix, percentage breakdown

### 7. **Gauge Chart** - Progress Indicator
```typescript
{
  type: "gauge",
  title: "CTR Performance",
  metrics: ["ctr"],
  min: 0,
  max: 10
}
```
Use for: Goal progress, performance vs target

### 8. **Data Table** - Detailed Records
```typescript
{
  type: "table",
  title: "All Keywords",
  dimensions: ["query", "page", "device"],
  metrics: ["clicks", "impressions", "ctr", "position"],
  sortable: true,
  filterable: true
}
```
Use for: Detailed breakdowns, raw data inspection

### 9. **Treemap** - Hierarchical Visualization
```typescript
{
  type: "treemap",
  title: "Pages by Traffic Impact",
  dimension: "page",
  metrics: ["clicks"]
}
```
Use for: Part-to-whole relationships, hierarchies

### 10. **Funnel Chart** - Conversion Stages
```typescript
{
  type: "funnel_chart",
  title: "Purchase Funnel",
  stages: ["view", "add_to_cart", "checkout", "purchase"],
  metrics: ["count"]
}
```
Use for: Multi-step conversions, drop-off analysis

### 11. **Heatmap** - Intensity Grid
```typescript
{
  type: "heatmap",
  title: "Device × Time Performance",
  dimensions: ["device", "dayofweek"],
  metrics: ["ctr"]
}
```
Use for: Pattern detection, performance matrix

### 12. **Sankey Diagram** - Flow Visualization
```typescript
{
  type: "sankey",
  title: "User Journey",
  source: "source",
  target: "page",
  metrics: ["sessions"]
}
```
Use for: Multi-step flows, attribution paths

### 13. **Radar Chart** - Multi-Dimensional Comparison
```typescript
{
  type: "radar_chart",
  title: "Campaign Performance Comparison",
  dimensions: ["campaign"],
  metrics: ["ctr", "conversion_rate", "roas", "quality_score"]
}
```
Use for: Multi-metric comparison, balanced scorecards

## 📊 Available Metrics by Platform

### Google Search Console Metrics
- **clicks** - Total clicks on your URLs
- **impressions** - Total impressions in search results
- **ctr** - Click-through rate (clicks / impressions)
- **position** - Average ranking position

### Google Ads Metrics
- **cost** - Total campaign spend
- **conversions** - Total conversion actions
- **conversion_value** - Total revenue from conversions
- **clicks** - Ad clicks
- **impressions** - Ad impressions
- **ctr** - Click-through rate
- **cpc** - Cost per click
- **roas** - Return on ad spend (revenue / cost)

### Google Analytics Metrics
- **activeUsers** - Users active in session
- **sessions** - Total sessions
- **screenPageViews** - Total page views
- **conversions** - Goal completions
- **totalRevenue** - Total e-commerce revenue
- **engagementRate** - Session engagement rate
- **bounceRate** - Single-page sessions

### Available Dimensions (All Platforms)
- **date** - Day (for time series)
- **query** - Search query (GSC)
- **page** - Landing page
- **device** - desktop, mobile, tablet
- **country** - Geographic location
- **campaign** - Ad campaign name
- **source** - Traffic source (organic, paid, direct)
- **medium** - Traffic medium (cpc, organic, referral)
- **region** - US state or country region

## 🛠️ Agent-Ready Features

### Agents Can Modify Dashboards Exactly Like Practitioners

**Create Dashboard via MCP Tools:**
```typescript
mcp__wpp-digital-marketing__create_dashboard({
  title: "Q4 SEO Performance",
  datasource: "gsc_performance_7days",
  rows: [
    {
      columns: [
        {
          width: "1/3",
          component: {
            type: "scorecard",
            title: "Total Clicks",
            metrics: ["clicks"]
          }
        }
      ]
    }
  ]
})
```

**Push Platform Data to BigQuery:**
```typescript
mcp__wpp-digital-marketing__push_platform_data_to_bigquery({
  platform: "gsc",
  property: "sc-domain:example.com",
  dateRange: ["2025-10-01", "2025-10-25"],
  dimensions: ["date", "query", "page", "device", "country"]
})
```

**Query BigQuery Directly:**
```typescript
mcp__wpp-digital-marketing__run_bigquery_query({
  sql: "SELECT page, SUM(clicks) as total_clicks FROM gsc_data GROUP BY page ORDER BY total_clicks DESC"
})
```

**Analyze Data for Insights:**
```typescript
mcp__wpp-digital-marketing__analyze_gsc_data_for_insights({
  bigqueryTable: "project.dataset.gsc_performance",
  dateRange: ["2025-10-01", "2025-10-25"]
})
```

**Get Dashboard Templates:**
```typescript
mcp__wpp-digital-marketing__list_dashboard_templates()
// Returns: SEO Overview, Campaign Performance, Analytics Overview, Blank Dashboard
```

## 🎨 Dashboard Builder Pattern

### 1. Create Dashboard with Template
Start with a pre-built template (SEO, Ads, Analytics) for quick setup

### 2. Customize Rows & Columns
Each row contains columns with flexible widths:
- "1/1" - Full width
- "1/2" - Half width (2 columns side-by-side)
- "1/3" - One third (3 columns)
- "2/3" - Two thirds
- "1/4" - Quarter
- "3/4" - Three quarters

### 3. Add Visualizations
For each column, specify:
- Chart type (13 options available)
- Title
- Dimensions to group by
- Metrics to measure
- Filters and sorting

### 4. Connect to Data
Specify BigQuery table containing the data:
- Built-in tables: gsc_performance_7days, google_ads_campaign_stats, analytics_overview
- Custom tables: Any BigQuery table you've registered

### 5. Save & Share
Dashboard saved with unique ID, shareable via URL, exportable as PDF/image

## 🔄 Common Dashboard Patterns

### SEO Performance Dashboard
```
Header (Title + Date Filter)
  ↓
4 KPI Scorecards (Clicks, Impressions, CTR, Avg Position)
  ↓
Time Series Chart (Trend Over Time)
  ↓
2 Bar Charts (Top Pages, Top Queries)
  ↓
Data Table (All Keywords Detail)
```

### Google Ads Dashboard
```
Header (Title + Date Filter)
  ↓
6 KPI Scorecards (Spend, Conversions, ROAS, Clicks, CTR, CPC)
  ↓
2 Area Charts (Spend & Conversion Trend)
  ↓
Data Table (Campaign Breakdown)
```

### Analytics Dashboard
```
Header (Title + Date Filter)
  ↓
4 KPI Scorecards (Users, Sessions, Bounce Rate, Avg Duration)
  ↓
Area Chart (User Trend)
  ↓
Pie Chart (Traffic by Source)
  ↓
2 Visualizations (Top Pages, Device Breakdown)
```

## 🔐 Data Access Control

- **OAuth Required**: Every query uses user's OAuth credentials
- **Platform Permissions**: User must have access to GSC property, Ads account, or Analytics property
- **BigQuery Access**: User must have BigQuery dataset permissions
- **Agent Authorization**: Agents operate under practitioner's credentials; no elevation needed
- **No Service Accounts**: All queries are user-authenticated

## 🔧 Code References

**Main Frontend:**
- wpp-analytics-platform/frontend/ - Next.js app
- src/wpp-analytics/README.md - Dashboard MCP tools (464 lines)

**Backend API:**
- wpp-analytics-platform/frontend/src/app/api/ - 9 endpoints

**MCP Tools for Dashboards:**
- `mcp__wpp-digital-marketing__create_dashboard` - Create new dashboard
- `mcp__wpp-digital-marketing__update_dashboard_layout` - Modify existing dashboard
- `mcp__wpp-digital-marketing__list_dashboard_templates` - Get templates
- `mcp__wpp-digital-marketing__create_dashboard_from_table` - Auto-create from data
- `mcp__wpp-digital-marketing__push_platform_data_to_bigquery` - Pull platform data
- `mcp__wpp-digital-marketing__run_bigquery_query` - Query data warehouse
- `mcp__wpp-digital-marketing__analyze_gsc_data_for_insights` - Generate summaries

## 📚 Documentation References

- PLATFORM-COMPLETE-GUIDE.md - Complete platform guide (consolidated to docs/reporting-platform/)
- WPP-ANALYTICS-PLATFORM-SPEC.md - Technical specification
- wpp-analytics-platform/README.md - Platform overview

## 🎯 Typical Workflow

1. **Identify Data Needed** - Which platform? Which metrics?
2. **Push Data to BigQuery** - Use `push_platform_data_to_bigquery`
3. **Choose Template** - SEO, Ads, or Analytics base
4. **Customize Visualizations** - Select chart types for your needs
5. **Add Filters** - Date range, device, country, etc.
6. **Save Dashboard** - Unique ID generated
7. **Share/Export** - Distribute to stakeholders or export as PDF

## ✨ Why This Architecture

✅ **Data Blending** - All platforms in BigQuery for unified analysis
✅ **Flexible Visualizations** - 13 chart types cover 95% of use cases
✅ **Agent-Ready** - Agents can create/modify dashboards programmatically
✅ **Fast Performance** - Recharts optimized for large datasets
✅ **Dark Mode** - Professional appearance, reduced eye strain
✅ **Shareable** - Dashboard URLs for team collaboration
✅ **Exportable** - PNG/PDF downloads for presentations
