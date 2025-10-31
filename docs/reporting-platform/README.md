# Reporting Platform Documentation

Complete documentation for the WPP Analytics Platform - the dashboard builder and visualization layer.

## 📚 Contents

### [SPEC.md](./SPEC.md)
Technical specification for the reporting platform:
- Complete technology stack (Next.js 15, React 19, ECharts + Recharts)
- 32 chart types + 12 controls and their configurations
- BigQuery integration details
- Data flow architecture (direct BigQuery, no semantic layer)

### [COMPLETE-GUIDE.md](./COMPLETE-GUIDE.md)
Comprehensive user and developer guide:
- Platform overview and quick start
- Architecture and component breakdown
- MCP server integration (65 tools across 7 Google APIs)
- Dashboard builder usage with examples
- Use cases and workflows (5+ detailed scenarios)
- Troubleshooting and FAQ

## 🎯 Quick Start

### For Practitioners (Using Dashboards)
1. Open http://localhost:3000
2. Sign in with Google OAuth
3. Click "Create Dashboard"
4. Select a template (Blank, GSC Standard, or Ads Performance)
5. Add charts from available data sources
6. Configure metrics, dimensions, and filters
7. Save and share with team

### For Developers (Building Features)
1. Review [SPEC.md](./SPEC.md) for architecture
2. Study chart integration examples in [COMPLETE-GUIDE.md](./COMPLETE-GUIDE.md)
3. Understand data flow: Platform APIs → BigQuery → Frontend Charts (direct, no semantic layer)
4. Reference the 32 chart types + 12 controls and configuration options
5. Follow component patterns for new features

## 📊 Core Concepts

### Technology Stack
- **Frontend**: Next.js 15 + React 19 + Shadcn/ui
- **Visualization**: ECharts 5.5 (primary) + Recharts 3.3 (secondary)
- **Data**: BigQuery for central data warehouse (direct queries, no semantic layer)
- **Authentication**: Supabase with OAuth
- **State Management**: Zustand for client state

### 32 Chart Types (Basic 13 + Advanced 19)
1. **Scorecard** - Single metric KPI
2. **Time Series** - Line chart over time
3. **Area Chart** - Filled area visualization
4. **Bar Chart** - Vertical bar comparisons
5. **Pie Chart** - Part-to-whole distribution
6. **Gauge** - Meter/gauge visualization
7. **Table** - Sortable/filterable data grid
8. **Treemap** - Hierarchical rectangles
9. **Funnel Chart** - Conversion funnel
10. **Heatmap** - Color-coded grid
11. **Sankey** - Flow diagram
12. **Scatter Chart** - X/Y scatter plot
13. **Radar Chart** - Spider/radar diagram

### 9 Backend API Endpoints
```
GET  /dashboards                  - List user's dashboards
POST /dashboards                  - Create new dashboard
GET  /dashboards/:id              - Get dashboard details
PUT  /dashboards/:id              - Update dashboard
DELETE /dashboards/:id            - Delete dashboard
POST /dashboards/:id/share        - Share dashboard
GET  /dashboards/fields           - Available metrics/dimensions
POST /data/query                  - Execute data query
GET  /metadata/platforms          - List connected platforms
```

## 🔐 Authentication & Security

- **OAuth 2.0**: Users sign in with Google account
- **Row Level Security (RLS)**: Users only see their own dashboards
- **Sharing**: Dashboard-level permissions (View/Edit)
- **Public Links**: Optional public dashboard sharing

## 💾 Data Sources

| Source | Metrics | Dimensions | Availability |
|--------|---------|-----------|--------------|
| Google Ads | clicks, impressions, cost, conversions, ROAS | campaign, keyword, device, location, hour | Real-time via API |
| Search Console | clicks, impressions, CTR, position | query, page, country, device | 1-2 day delay |
| Google Analytics | sessions, users, conversions, revenue | page, source, medium, campaign, device | Real-time via API |
| BigQuery | Custom metrics | Custom dimensions | Via SQL queries |

## 🎨 Dashboard Customization

### Per-Chart Configuration
- Chart type selection
- Metric and dimension selection
- Color customization (brand colors supported)
- Label and legend visibility
- Axis ranges and formatting

### Dashboard-Level Settings
- Date range filter (quick options or custom)
- Dimension filters (search, multi-select, range slider)
- Responsive layout (auto-fits screen size)
- Dark mode support
- Export to PDF/Excel

## 📚 Use Cases

1. **Weekly Performance Review** - Campaign metrics over time
2. **Keyword Opportunity Discovery** - Search query analysis
3. **Budget Reallocation** - Campaign performance comparison
4. **Cross-Platform Analysis** - Paid vs organic breakdown
5. **Technical SEO Audit** - Core Web Vitals and indexing
6. **Automated Reporting** - Client report templates

See [COMPLETE-GUIDE.md](./COMPLETE-GUIDE.md) for detailed workflows.

## 🔗 Related Documentation

- [MCP Tools Reference](../api-reference/TOOLS.md)
- [OAuth Authentication](../oauth/README.md)
- [Developer Guide](../guides/DEVELOPER-GUIDE.md)
