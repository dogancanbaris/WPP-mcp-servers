---
name: Query Optimizer
description: Optimize BigQuery SQL queries for cost and speed - ensure proper aggregation, indexing, and token efficiency for WPP MCP
---

# Query Optimizer Skill

## Purpose

Optimize BigQuery queries to:
- Minimize cost (data scanned)
- Maximize speed
- Return optimal row counts (50-400)
- Use BigQuery efficiently

## BigQuery Cost Model

**Pricing:** $5 per TB scanned (first 1 TB/month FREE)

### Cost Examples:
- ❌ Bad: `SELECT * FROM table` → Scans 10 GB → $0.05
- ✅ Good: `SELECT col1, col2 FROM table WHERE date >= '2025-10-01'` → Scans 100 MB → $0.00 (free tier)

At WPP scale (1,000 practitioners):
- Bad queries: $50,000/month
- Optimized queries: $0-500/month

**Optimization matters!**

## Optimization Rules

### Rule 1: Always Use WHERE for Date Filtering
```sql
-- BAD (scans all data):
SELECT * FROM gsc_data

-- GOOD (scans only needed dates):
SELECT * FROM gsc_data
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
```
**Savings:** 90%+ reduction in data scanned

### Rule 2: Use Partitioned Tables
```sql
-- Tables should be partitioned by date
-- BigQuery only scans relevant partitions

-- Query leverages partitioning:
WHERE date BETWEEN '2025-10-01' AND '2025-10-31'
-- Only scans October partition, not entire table
```

### Rule 3: Specify Columns (Never SELECT *)
```sql
-- BAD (scans all columns):
SELECT * FROM gsc_data WHERE ...

-- GOOD (scans only needed columns):
SELECT query, clicks, position FROM gsc_data WHERE ...
```
**Savings:** 50-80% depending on column count

### Rule 4: Aggregate Early
```sql
-- BAD (scans lots, then aggregates):
SELECT query, AVG(position)
FROM gsc_data
WHERE date >= '2025-01-01'
GROUP BY query

-- GOOD (filter first, then aggregate):
SELECT query, AVG(position)
FROM gsc_data
WHERE date >= '2025-10-01'  -- Smaller date range first
  AND property = 'sc-domain:client.com'  -- Filter to one property
GROUP BY query
HAVING SUM(impressions) > 100  -- Only meaningful queries
LIMIT 50
```

### Rule 5: Use LIMIT Aggressively
```sql
-- Always cap results:
LIMIT 50   -- For top N analysis
LIMIT 100  -- For opportunity lists
LIMIT 500  -- Maximum ever
```

## Optimization Checklist

For any BigQuery query, verify:

- [ ] Has WHERE clause filtering date range?
- [ ] Filters to specific property/account?
- [ ] Specifies columns (not SELECT *)?
- [ ] Uses GROUP BY for aggregation?
- [ ] Has LIMIT clause?
- [ ] Uses partitioned table correctly?
- [ ] Estimated rows < 500?

## Cost Estimation

```
Estimated bytes scanned:
= Table size × (date range / total date range) × (columns selected / total columns)

Example:
- Table: 100 GB total
- Date range: 30 days of 365 days = 8.2%
- Columns: 5 of 20 = 25%
- Estimated: 100 GB × 0.082 × 0.25 = 2.05 GB
- Cost: $0.01 (under free tier if first query of month)
```

## Before/After Examples

### Example 1: GSC Top Queries

**Before (unoptimized):**
```sql
SELECT * FROM gsc_data
ORDER BY clicks DESC
LIMIT 50
```
- Scans: Entire table (50 GB)
- Cost: $0.25
- Time: 30 seconds

**After (optimized):**
```sql
SELECT
  query,
  SUM(clicks) as total_clicks,
  AVG(position) as avg_position
FROM gsc_data
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  AND property = 'sc-domain:client.com'
GROUP BY query
ORDER BY total_clicks DESC
LIMIT 50
```
- Scans: 90 days × 1 property (1.2 GB)
- Cost: $0.00 (free tier)
- Time: 3 seconds

**Improvement:** 40x cheaper, 10x faster!

## When to Use

Auto-activate when:
- About to run BigQuery query
- Query looks unoptimized (no WHERE, no LIMIT, SELECT *)

Suggest optimizations:
- "This query will scan {X GB}. I can optimize it to scan {Y GB} instead."
- Show before/after
- Explain cost savings

## Integration

Works with:
- **bigquery-aggregator:** Ensures queries are optimal
- **cross-platform-analyzer:** Optimizes join queries
- **All BigQuery operations**

## Remember

At WPP scale, query optimization isn't optional - it's required for cost control!
