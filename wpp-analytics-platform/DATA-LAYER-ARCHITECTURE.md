# WPP Analytics Platform - Data Layer Architecture

**Version:** 2.0 (Shared BigQuery Data Lake)
**Updated:** October 27, 2025
**Status:** Production Architecture (Approved)

> **Breaking Change:** Migrated from per-dashboard tables to shared BigQuery tables with workspace_id isolation.
> See BIGQUERY-DATA-LAKE-ARCHITECTURE.md for complete implementation details.

---

## 🎯 Core Principle

**Dashboards store QUERIES, not DATA.**

Like Looker Studio, dashboards execute queries against live BigQuery tables every time they're opened. This ensures data is always current, even for dashboards created years ago.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Marketing Platforms (GSC, Ads, GA4, etc.)               │
│ - Google Search Console                                 │
│ - Google Ads (via MCC)                                  │
│ - Google Analytics 4                                    │
│ - Bing, Amazon, Meta, TikTok (future)                  │
└────────────────────┬────────────────────────────────────┘
                     │ OAuth / API
                     ▼
┌─────────────────────────────────────────────────────────┐
│ BigQuery Data Lake (Hot Storage - Last 12 Months)      │
│                                                          │
│ Shared Tables (ONE per platform):                       │
│ ├── gsc_performance_shared    (all workspaces)         │
│ ├── ads_performance_shared    (all workspaces)         │
│ └── ga4_sessions_shared       (all workspaces)         │
│                                                          │
│ Isolation: workspace_id column + RLS policies           │
│ Partitioned: BY date (365-day expiration)              │
│ Clustered: BY workspace_id, property, dimensions        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Dataset API (/api/datasets/[id]/query)                  │
│ - Validates metrics/dimensions                          │
│ - Applies global filters (date, dimension, measure)     │
│ - Executes BigQuery SQL                                 │
│ - Returns aggregated results                            │
│ - Caches for 1-4 hours                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (Next.js + React Query + Recharts/ECharts)    │
│ - Fetches via /api/datasets/[id]/query                 │
│ - Subscribes to global filters (useGlobalFilters)       │
│ - Renders 33 chart types                                │
│ - Caches queries client-side                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Collection: On-Demand + Daily Refresh

### On-Demand Pull (Dashboard Creation)

**When:** Practitioner creates first dashboard for a property

**Process:**
1. Check if data exists in BigQuery for (workspace_id + property)
2. If NOT found: Trigger OAuth consent
3. Pull last 12 months from platform API
4. Insert into shared table with workspace_id
5. Register in property_registry (OAuth token stored)
6. Create dashboard (points to shared table)

**Duration:** 30-60 seconds (one-time)

**Deduplication:**
- If same workspace + property exists → Reuse data (instant)
- If different workspace + property exists → Check if shareable
- If different OAuth access → Might need separate pull

### Daily Refresh (Automated)

**When:** Every day at 2 AM UTC

**Process:**
1. Query property_registry for active properties (queried in last 30 days)
2. For each property: Pull yesterday's data only (incremental)
3. MERGE into shared table (upsert - update existing, insert new)
4. Update last_refreshed_at timestamp
5. Invalidate frontend cache

**Duration:** 5-15 minutes for 1,000 properties

**Inactive Properties:**
- If not queried in 30 days → pause daily refresh (cost savings)
- On next dashboard open → pull missing days, resume refresh

---

## 📊 Shared Table Design

### Example: gsc_performance_shared

```sql
CREATE TABLE `mcp-servers-475317.wpp_marketing.gsc_performance_shared`
(
  date DATE NOT NULL,                 -- Partition key
  query STRING,                       -- Search term
  page STRING,                        -- Landing page
  device STRING,                      -- MOBILE, DESKTOP, TABLET
  country STRING,                     -- US, GB, CA, etc.
  clicks INT64,
  impressions INT64,
  ctr FLOAT64,
  position FLOAT64,
  workspace_id STRING NOT NULL,       -- Tenant isolation
  property STRING NOT NULL,           -- sc-domain:example.com
  oauth_user_id STRING,
  imported_at TIMESTAMP,
  data_source STRING                  -- 'api' or 'bulk_export'
)
PARTITION BY date
CLUSTER BY workspace_id, property, device, country
OPTIONS(partition_expiration_days = 365);
```

**Key Features:**
- **Shared:** All workspaces in ONE table
- **Isolated:** workspace_id + RLS policies
- **Partitioned:** Auto-delete after 12 months
- **Clustered:** Fast filtered queries
- **Complete:** ALL dimensions for flexible filtering

---

## 🔍 Query Pattern

### Dashboard Opens → Executes Live Query

```typescript
// Dashboard component (Scorecard)
const { filters: globalFilters } = useGlobalFilters();

const { data } = useQuery({
  queryKey: ['scorecard', dataset_id, metrics, globalFilters],
  queryFn: async () => {
    // Evaluate preset filter dynamically
    const dateFilter = globalFilters.find(f => f.type === 'dateRange');
    const { startDate, endDate } = getDateRangeFromFilter(dateFilter);
    // Today: "last30Days" = 2025-09-28 to 2025-10-27
    // In 30 days: "last30Days" = 2025-10-28 to 2025-11-26

    const params = new URLSearchParams({
      metrics: metrics.join(','),
      filters: JSON.stringify([
        { member: 'date', operator: 'inDateRange', values: [startDate, endDate] },
        { member: 'workspace_id', operator: 'equals', values: [workspace_id] },
        ...globalFilters
      ])
    });

    return fetch(`/api/datasets/${dataset_id}/query?${params}`);
  }
});
```

**Backend SQL Generated:**
```sql
SELECT
  SUM(clicks) as clicks_total,
  SUM(impressions) as impressions_total
FROM `mcp-servers-475317.wpp_marketing.gsc_performance_shared`
WHERE date BETWEEN '2025-09-28' AND '2025-10-27'  -- Calculated TODAY
AND workspace_id = 'workspace_A'
AND property = 'sc-domain:themindfulsteward.com'
-- User can also filter:
AND device = 'MOBILE'  -- ✅ Works because we store device dimension
AND country IN ('US', 'CA')  -- ✅ Works because we store country dimension
```

**Query Time:** 200ms (cached) or 2s (fresh from BigQuery)

---

## 💰 Cost Model

### Storage Costs (12-Month Hot Storage)

**Calculation:**
- Properties: 1,000 active
- Rows per property/year: 180K (GSC average)
- Total rows: 180M
- Row size: 200 bytes
- **Total storage:** 36GB = **$0.72/month**

**Scaling:**
- 10,000 properties = $7.20/month
- 100,000 properties = $72/month

**Not linear!** Many practitioners share same properties (agencies managing client accounts).

### Query Costs

**Calculation:**
- Dashboard opens: 1,000/day
- Queries per open: 20 (5 charts × 4 queries with different filters)
- Total queries: 20,000/day
- Cache hit rate: 80% (after first load)
- Uncached queries: 4,000/day
- Data scanned per query: 5KB (with clustering)
- **Cost:** 4,000 × $0.005 = **$20/day = $600/month**

**Optimization:**
- Materialized views: Reduce to $360/month
- Longer cache TTL: Reduce to $250/month
- **Optimized: $250-360/month**

### Total Operating Cost

**Conservative:**
- Storage: $72/month (10K properties)
- Queries: $600/month (1K daily opens)
- **Total: $672/month**

**Optimized:**
- Storage: $72/month
- Queries: $250/month
- **Total: $322/month**

**For 10,000 practitioners!**

---

## 🔐 Multi-Tenant Security

### Row-Level Security (RLS)

**BigQuery RLS Policy:**
```sql
CREATE ROW ACCESS POLICY workspace_isolation
ON gsc_performance_shared
GRANT TO ("allAuthenticatedUsers")
FILTER USING (
  workspace_id = SESSION_USER()
  OR workspace_id IN (
    SELECT shared_workspace_id
    FROM workspace_sharing
    WHERE user_workspace_id = SESSION_USER()
  )
);
```

**Result:** Users can ONLY see their workspace data, even querying directly in BigQuery Console.

### OAuth Token Storage

**Encryption:**
- Tokens encrypted with AES-256
- Stored in Supabase (encrypted column)
- Decrypted only for daily refresh
- Never exposed to frontend

**Rotation:**
- Auto-refresh when token expires
- Email practitioner if refresh fails
- Re-authorization flow in platform

---

## 📈 Growth Model

### Month 1: Pilot (10 practitioners)
- Properties: 15
- Dashboards: 25
- BigQuery rows: 2.7M
- Cost: $18/month

### Month 6: Early Adoption (100 practitioners)
- Properties: 150 (many shared)
- Dashboards: 300
- BigQuery rows: 27M
- Cost: $85/month

### Month 12: Full Rollout (1,000 practitioners)
- Properties: 1,200 (heavy sharing)
- Dashboards: 3,500
- BigQuery rows: 216M
- Cost: $380/month

### Month 24: Enterprise Scale (10,000 practitioners)
- Properties: 8,000 (agencies share clients)
- Dashboards: 40,000
- BigQuery rows: 1.44B
- Cost: $2,100/month

**Growth is organic - you scale costs with actual usage!**

---

## 🎯 Key Benefits of This Architecture

✅ **Truly Live Dashboards** - Data always current, like Looker Studio
✅ **Cost-Effective** - Shared tables, not per-user duplication
✅ **Organic Growth** - Lake builds as practitioners use system
✅ **Smart Deduplication** - Same property + workspace = reuse data
✅ **Complete Filter Support** - All dimensions stored for full flexibility
✅ **Easy Extensibility** - Add metrics via ALTER TABLE anytime
✅ **Automatic Daily Refresh** - Practitioners don't manage anything
✅ **Secure Multi-Tenancy** - RLS + workspace_id isolation

---

**Documentation Updates Complete!**

✅ ROADMAP.md - Phase 4.7 updated with BigQuery Data Lake
✅ BIGQUERY-DATA-LAKE-ARCHITECTURE.md - Complete architecture created
✅ DATA-LAYER-ARCHITECTURE.md - Updated with shared table model

**Next: I'll explain exactly how we'll implement #2 (the actual trial run)**