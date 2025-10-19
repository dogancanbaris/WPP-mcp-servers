---
name: Metabase Dashboard Builder
description: Create Metabase dashboards with BigQuery-connected charts for WPP practitioners, enabling full data viewing/export without loading into Claude context
---

# Metabase Dashboard Builder Skill

## Purpose

Create persistent, shareable Metabase dashboards that connect DIRECTLY to BigQuery. This enables:
- Full data access without context window limits
- Sharing with clients/team
- Export to Excel/CSV
- Scheduled email reports
- Interactive filtering

## Key Concept

**MCP creates the dashboard** → **Metabase queries BigQuery directly** → **No MCP overhead for viewing**

This is Path 2 of the WPP workflow (Path 1 = in-chat analysis via bigquery-aggregator)

## When to Use

Use Metabase dashboards when:
- User needs ALL data (not just top N)
- Report will be viewed multiple times
- Need to share with client/team
- Want export functionality
- Recurring weekly/monthly reports

Use in-chat analysis when:
- Quick one-time question
- Top N analysis (50-200 rows)
- Immediate insights needed

## Metabase API Integration

### Available via WPP MCP (when implemented):
```typescript
// These tools will be available:
create_metabase_dashboard(name, description)
create_metabase_question(name, sql, database_id)
create_metabase_card(question_id, visualization_type, settings)
add_card_to_dashboard(dashboard_id, card_id, row, col, size)
list_metabase_dashboards()
```

### Dashboard Creation Workflow:

1. **Create Dashboard Container:**
```javascript
const dashboard = await mcp.call('create_metabase_dashboard', {
  name: "Client ABC - Weekly SEO Performance",
  description: "Top queries, pages, trends, and optimization opportunities"
});
```

2. **Create Questions (SQL Queries):**
```javascript
// Question 1: Top Queries
const q1 = await mcp.call('create_metabase_question', {
  name: "Top 50 Queries",
  database_id: bigquery_db_id,
  query: `
    SELECT
      query,
      SUM(clicks) as clicks,
      SUM(impressions) as impressions,
      AVG(position) as avg_position
    FROM client_gsc_data
    WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
    GROUP BY query
    ORDER BY clicks DESC
    LIMIT 50
  `
});

// Question 2: Traffic Trend
const q2 = await mcp.call('create_metabase_question', {
  name: "Traffic Trend",
  database_id: bigquery_db_id,
  query: `
    SELECT
      DATE_TRUNC(date, WEEK) as week,
      SUM(clicks) as weekly_clicks
    FROM client_gsc_data
    WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    GROUP BY week
    ORDER BY week
  `
});
```

3. **Create Cards (Visualizations):**
```javascript
// Card 1: Bar chart for top queries
const card1 = await mcp.call('create_metabase_card', {
  question_id: q1.id,
  visualization_type: "bar",
  settings: {
    x_axis: "query",
    y_axis: "clicks",
    color: "#509EE3"
  }
});

// Card 2: Line chart for trend
const card2 = await mcp.call('create_metabase_card', {
  question_id: q2.id,
  visualization_type: "line",
  settings: {
    x_axis: "week",
    y_axis: "weekly_clicks",
    goal_line: 1000  // Target
  }
});
```

4. **Add Cards to Dashboard:**
```javascript
await mcp.call('add_card_to_dashboard', {
  dashboard_id: dashboard.id,
  card_id: card1.id,
  row: 0,
  col: 0,
  sizeX: 6,  // Half width
  sizeY: 4   // Standard height
});

await mcp.call('add_card_to_dashboard', {
  dashboard_id: dashboard.id,
  card_id: card2.id,
  row: 0,
  col: 6,
  sizeX: 6,
  sizeY: 4
});
```

## Dashboard Templates

### Template 1: Weekly SEO Performance
**Use Case:** Regular client SEO reviews

**Cards:**
1. Metric Cards (top row)
   - Total Clicks (this week)
   - Total Impressions
   - Avg Position
   - CTR

2. Traffic Trend (line chart)
   - Last 12 weeks

3. Top 20 Queries (bar chart + table)
   - With export button

4. Top 20 Pages (table with sorting)
   - Clicks, impressions, position

5. Position Distribution (pie chart)
   - Top 3, Page 1, Page 2, Page 3+

**SQL Queries:** 5 questions, each returns 1-50 rows

### Template 2: Google Ads Campaign Review
**Cards:**
1. Spend Overview (metrics)
2. Campaign Performance (table, sortable)
3. Spend Trend (line chart)
4. ROAS by Campaign (bar chart)
5. Top Keywords (table with Quality Score)

### Template 3: Cross-Platform Overview
**Cards:**
1. Paid vs Organic Traffic (comparison)
2. Conversion Sources (stacked bar)
3. ROI Analysis (calculated metric)
4. Channel Performance Matrix (heatmap)

## Best Practices

### Dashboard Design:
- **Top row:** Key metrics (cards)
- **Second row:** Main chart (trend or comparison)
- **Third row:** Detailed tables (with export)
- **Max 8 cards:** Don't overwhelm

### SQL Best Practices:
- All queries should aggregate (never raw data to Metabase)
- Use parameters for date ranges (Metabase supports {{date_from}} {{date_to}})
- Include LIMIT even in dashboard queries (safety)
- Use clear column names (not abbreviations)

### Data Refresh:
- Metabase caches query results
- Set refresh schedule (daily for reports)
- Users can click "Refresh" for latest data

## Integration with WPP Workflow

When practitioner says:
> "Create dashboard for client ABC's SEO performance"

This skill:
1. Asks clarifying questions:
   - Which data sources? (GSC, Ads, GA4)
   - Time range? (default: last 90 days)
   - Key metrics to highlight?

2. Generates dashboard with:
   - Appropriate SQL queries (aggregated!)
   - Chart types matching data
   - Filters and parameters
   - Export-friendly tables

3. Returns:
   - Metabase dashboard URL
   - "Dashboard connects directly to BigQuery - view anytime without MCP"

## Cost Consideration

**Metabase Options:**
- **Open Source:** FREE (self-hosted)
- **Cloud:** $85/month for 5 users, $40/user after
- **Enterprise:** Custom pricing

**Recommendation for WPP:** Start with open source (free), migrate to cloud if needed

## Example Complete Flow

```
Practitioner: "Create weekly GSC dashboard for keepersdigital.com"

Skill executes:
1. create_metabase_dashboard("Keepers Digital - Weekly SEO")
2. create 5 questions (top queries, pages, trend, gaps, opportunities)
3. create 5 cards (2 charts, 2 tables, 1 metrics)
4. add cards to dashboard in grid layout
5. configure filters (date range, device type)

Returns:
"✅ Dashboard created: https://metabase.wpp.com/dashboard/123

 Includes:
 - Top 50 queries (bar chart + exportable table)
 - Traffic trend (last 12 weeks)
 - Content gap opportunities (100 low-position keywords)
 - Key metrics overview

 Dashboard queries BigQuery directly - view/export anytime.
 Data refreshes daily at 6am."
```

## References

- API-EXPANSION-PLAN.md (Metabase section - pages 810-840)
- User workflow description (Metabase as presentation layer)
- BigQuery tools: `src/bigquery/tools.ts`

## Remember

Metabase dashboards are for **persistence and sharing**, not real-time Claude analysis. For quick insights, use bigquery-aggregator skill instead.
