---
name: BigQuery Aggregator
description: Generate aggregated BigQuery SQL queries that return 50-400 rows (not millions) for token-efficient WPP MCP analysis
---

# BigQuery Aggregator Skill

## Purpose

Generate SMART, AGGREGATED BigQuery SQL queries for analyzing WPP client data. The goal is to return **50-400 rows** of aggregated data to Claude's context, NOT millions of raw rows.

## Critical Rules

### ❌ NEVER DO THIS:
```sql
-- BAD: Returns millions of rows, wastes tokens, expensive
SELECT * FROM `project.gsc_data`
WHERE date >= '2024-01-01'
```

### ✅ ALWAYS DO THIS:
```sql
-- GOOD: Returns 50 aggregated rows, efficient, cheap
SELECT
  query,
  SUM(clicks) as total_clicks,
  SUM(impressions) as total_impressions,
  AVG(position) as avg_position,
  AVG(ctr) as avg_ctr
FROM `project.gsc_data`
WHERE date >= '2024-01-01'
  AND property = 'sc-domain:client.com'
GROUP BY query
ORDER BY total_clicks DESC
LIMIT 50
```

## Aggregation Patterns

### Pattern 1: Top N Analysis
**Use:** "Show me top 50 queries/pages/campaigns"
```sql
SELECT
  {dimension},
  SUM({metric}) as total,
  AVG({metric}) as average
FROM {table}
WHERE {filters}
GROUP BY {dimension}
ORDER BY total DESC
LIMIT {N}  -- Usually 50-100
```
**Returns:** N rows (50-100)

### Pattern 2: Time Series
**Use:** "Show me trend over last 12 months"
```sql
SELECT
  DATE_TRUNC(date, MONTH) as month,
  SUM({metric}) as total
FROM {table}
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
GROUP BY month
ORDER BY month
```
**Returns:** 12 rows (one per month)

### Pattern 3: Cross-Dimension Matrix
**Use:** "Show me query performance by page"
```sql
SELECT
  query,
  page,
  SUM(clicks) as clicks,
  AVG(position) as avg_pos
FROM `project.gsc_data`
WHERE query IN (
  SELECT query FROM ... TOP 50 ...
)
GROUP BY query, page
ORDER BY clicks DESC
LIMIT 200  -- Cap at 200 for matrix
```
**Returns:** ~200 rows (manageable)

### Pattern 4: Performance Buckets
**Use:** "Categorize keywords by position"
```sql
SELECT
  CASE
    WHEN position <= 3 THEN 'Top 3'
    WHEN position <= 10 THEN 'Page 1'
    WHEN position <= 20 THEN 'Page 2'
    ELSE 'Page 3+'
  END as position_bucket,
  COUNT(DISTINCT query) as keyword_count,
  SUM(clicks) as total_clicks
FROM `project.gsc_data`
WHERE date >= '2024-10-01'
GROUP BY position_bucket
ORDER BY total_clicks DESC
```
**Returns:** 4 rows (one per bucket)

## Row Count Guidelines

### Target Row Counts:
- **Simple analysis:** 50-100 rows
- **Medium complexity:** 100-300 rows
- **Complex multi-dimension:** 200-400 rows
- **NEVER exceed:** 500 rows in single query

### Strategy:
- Multiple small queries > One huge query
- Each query: 50-200 rows
- Total across all queries: 200-400 rows
- Always use LIMIT as safety net

## Query Templates

### GSC: Top Queries
```sql
SELECT
  query,
  SUM(clicks) as total_clicks,
  SUM(impressions) as total_impressions,
  AVG(position) as avg_position,
  AVG(ctr) as avg_ctr
FROM `project.client_gsc_data`
WHERE date >= '{start_date}'
  AND property = '{property_url}'
GROUP BY query
ORDER BY total_clicks DESC
LIMIT 50
```

### GSC: Top Landing Pages
```sql
SELECT
  page,
  SUM(clicks) as total_clicks,
  SUM(impressions) as total_impressions,
  AVG(position) as avg_position
FROM `project.client_gsc_data`
WHERE date >= '{start_date}'
  AND property = '{property_url}'
GROUP BY page
ORDER BY total_clicks DESC
LIMIT 50
```

### GSC: Content Gap Analysis (Low Position Keywords)
```sql
WITH top_pages AS (
  SELECT page
  FROM `project.client_gsc_data`
  WHERE date >= '{start_date}'
  GROUP BY page
  ORDER BY SUM(clicks) DESC
  LIMIT 20
)
SELECT
  gsc.query,
  gsc.page,
  AVG(gsc.position) as avg_position,
  SUM(gsc.impressions) as total_impressions,
  SUM(gsc.clicks) as total_clicks
FROM `project.client_gsc_data` gsc
INNER JOIN top_pages tp ON gsc.page = tp.page
WHERE gsc.date >= '{start_date}'
  AND gsc.position BETWEEN 11 AND 30  -- Page 2-3 (optimization opportunity)
GROUP BY gsc.query, gsc.page
HAVING SUM(gsc.impressions) > 100  -- Meaningful volume
ORDER BY avg_position DESC, total_impressions DESC
LIMIT 100
```

### Google Ads: Campaign Performance
```sql
SELECT
  campaign_name,
  SUM(cost_micros)/1000000 as total_cost,
  SUM(clicks) as total_clicks,
  SUM(conversions) as total_conversions,
  AVG(cost_micros/1000000) / NULLIF(SUM(conversions), 0) as cost_per_conversion,
  (SUM(conversion_value_micros)/1000000) / NULLIF(SUM(cost_micros)/1000000, 0) as roas
FROM `project.client_ads_data`
WHERE date >= '{start_date}'
GROUP BY campaign_name
ORDER BY total_cost DESC
LIMIT 50
```

### GA4: Conversion Funnel
```sql
SELECT
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_pseudo_id) as unique_users
FROM `project.client_ga4_events`
WHERE event_date >= '{start_date}'
  AND event_name IN ('page_view', 'add_to_cart', 'begin_checkout', 'purchase')
GROUP BY event_name
ORDER BY
  CASE event_name
    WHEN 'page_view' THEN 1
    WHEN 'add_to_cart' THEN 2
    WHEN 'begin_checkout' THEN 3
    WHEN 'purchase' THEN 4
  END
```

## MCP Tool Integration

Use the existing `run_bigquery_query` tool from WPP MCP:

```typescript
// Call via MCP
const result = await mcp.call('run_bigquery_query', {
  projectId: 'your-project',
  query: generatedSQL,
  maxResults: 500  // Safety limit
});

// Result will be ~50-400 rows
// Analyze directly in Claude's context
```

## Cost Optimization

### BigQuery Pricing:
- First 1 TB/month scanned: FREE
- After: $5 per TB

### Query Optimization:
- Use WHERE to filter BEFORE aggregation
- Use partitioned tables (by date)
- Specify columns (not SELECT *)
- Use LIMIT always

### Example Savings:
- ❌ Bad: Scan 10GB → $0.05
- ✅ Good: Scan 100MB with WHERE → $0.00 (under free tier)

## When to Use This Skill

Activate this skill when user asks:
- "Analyze [platform] data for last [time period]"
- "Show me top N [queries/pages/campaigns]"
- "Find optimization opportunities in [data]"
- "What are the trends for [metric]"
- "Compare performance across [dimensions]"

## Output Format

Always structure queries to return:
1. **Row count estimate:** "This will return ~75 rows"
2. **The SQL query:** Formatted and commented
3. **What it answers:** "This shows top 50 queries by clicks"
4. **Token efficiency note:** "75 rows = ~200 tokens (efficient!)"

## Examples in Project

See these files for context:
- `API-EXPANSION-PLAN.md` (BigQuery section with SQL examples)
- `src/bigquery/tools.ts` (run_bigquery_query implementation)
- User workflow description (shows exact aggregation approach)

## Remember

**Goal:** Get insights to Claude efficiently
**Method:** Aggregate in BigQuery, analyze in Claude
**Result:** 50-400 rows of gold, not 2M rows of noise
