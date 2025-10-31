# BigQuery Partitioning & Clustering - Universal Solution

## PROBLEM SUMMARY

**Current State:**
- ✅ `gsc_performance_shared`: Partitioned + Clustered (but missing `require_partition_filter`)
- ❌ `gsc_complete_themindfulsteward`: NOT partitioned/clustered → **$1.47/day waste**
- ❌ Table creation code has NO partitioning configuration
- ❌ Future tables will have same problem

**Cost Impact:**
- Current: $0.20/day (251 queries × 0.94 GB scans)
- At scale (1000 users × 10 queries/day): **$58/day = $21,170/year** 🚨

---

## SOLUTION: Dynamic Partitioning & Clustering

### Platform-Specific Clustering Strategy

Each marketing platform has different optimal clustering columns based on:
1. Workspace isolation (always first)
2. Property/account identifier
3. Most frequently filtered dimensions

**GSC (Google Search Console):**
```sql
PARTITION BY date
CLUSTER BY workspace_id, property, device, country
```

**Google Ads:**
```sql
PARTITION BY date
CLUSTER BY workspace_id, customer_id, campaign_id, device
```

**GA4 (Analytics):**
```sql
PARTITION BY date
CLUSTER BY workspace_id, property_id, device_category, session_source
```

### Dynamic Clustering Logic

```typescript
function getClusteringFields(platform: string): string[] {
  const baseFields = ['workspace_id']; // Always first for multi-tenant

  const platformFields = {
    gsc: ['property', 'device', 'country'],
    google_ads: ['customer_id', 'campaign_id', 'device'],
    analytics: ['property_id', 'device_category', 'session_source']
  };

  return [...baseFields, ...platformFields[platform]];
}
```

---

## FILES TO MODIFY

### 1. Core BigQuery Client (`src/bigquery/client.ts`)

**Add method:** `createPartitionedTable()`
- Accepts: `datasetId`, `tableId`, `schema`, `platform`
- Automatically applies: partitioning + clustering + options
- Used by: All platform data ingestion tools

### 2. Platform Data Ingestion (`src/wpp-analytics/tools/push-data-to-bigquery.ts`)

**Update:** `createBigQueryTable()` function (lines 438-471)
- Replace basic `createTable()` call
- Add partitioning/clustering configuration
- Make `require_partition_filter = TRUE`

### 3. BigQuery Tools (`src/bigquery/tools.ts`)

**Update:** `create_bigquery_dataset` tool
- Ensure all dataset tables use partitioning
- Document partitioning requirements

---

## IMPLEMENTATION PHASES

### Phase 1: Create Shared BigQuery Utility (NEW FILE)

**File:** `src/shared/bigquery-table-config.ts`

**Purpose:** Central configuration for all platform table schemas

**Exports:**
- `getPlatformSchema(platform)` - Returns full schema with types
- `getPartitionConfig(platform)` - Returns partitioning config
- `getClusteringConfig(platform)` - Returns clustering fields
- `getTableOptions(platform)` - Returns table options

### Phase 2: Update BigQuery Client

**File:** `src/bigquery/client.ts`

**Add methods:**
1. `createPartitionedTable()` - Uses configs from Phase 1
2. `migrateToPartitioned()` - Recreates table with partitioning
3. `verifyPartitioning()` - Checks if table is properly configured

### Phase 3: Update Data Ingestion Tools

**Files:**
- `src/wpp-analytics/tools/push-data-to-bigquery.ts`
- Any future platform-specific ingestion tools

**Changes:**
- Use new `createPartitionedTable()` method
- Remove hardcoded schemas
- Add platform-specific validation

### Phase 4: Migrate Existing Tables

**Script:** `scripts/migrate-bigquery-tables.py`

**Actions:**
1. For each non-partitioned table:
   - Create new partitioned version
   - Copy data: `CREATE TABLE new PARTITION BY date AS SELECT * FROM old`
   - Verify data integrity
   - Drop old, rename new

2. For partitioned tables missing `require_partition_filter`:
   - Run: `ALTER TABLE SET OPTIONS (require_partition_filter = TRUE)`

---

## DETAILED SCHEMA REQUIREMENTS

### Common to All Platforms:

```typescript
{
  // Always partition by date
  timePartitioning: {
    type: 'DAY',
    field: 'date',
    expirationMs: '31536000000', // 365 days
    requirePartitionFilter: true  // CRITICAL!
  },

  // Platform-specific clustering
  clustering: {
    fields: getClusteringFields(platform)
  },

  // Standard options
  labels: {
    platform: platform,
    workspace_enabled: 'true',
    cost_optimized: 'true'
  },

  description: `${platform} performance data - partitioned by date, clustered for efficiency`
}
```

### Platform Schemas:

**GSC Schema:**
- date (DATE) - NOT NULL - PARTITION KEY
- query, page, device, country (STRING) - NULLABLE
- clicks, impressions (INT64) - NULLABLE
- ctr, position (FLOAT64) - NULLABLE
- workspace_id, property (STRING) - NOT NULL
- oauth_user_id, data_source, search_type (STRING) - NULLABLE
- imported_at (TIMESTAMP) - DEFAULT NOW()

**Google Ads Schema:** (when implemented)
- date (DATE) - NOT NULL - PARTITION KEY
- campaign_id, ad_group_id (INT64) - NOT NULL
- campaign_name, campaign_type, campaign_status (STRING)
- device, network (STRING)
- clicks, impressions, cost_micros (INT64)
- conversions, conversion_value, roas (FLOAT64)
- workspace_id, customer_id (STRING) - NOT NULL
- imported_at (TIMESTAMP)

**GA4 Schema:** (when implemented)
- date (DATE) - NOT NULL - PARTITION KEY
- session_source, session_medium, device_category (STRING)
- active_users, sessions (INT64)
- engagement_rate, bounce_rate (FLOAT64)
- total_revenue, conversions (FLOAT64)
- workspace_id, property_id (STRING) - NOT NULL
- imported_at (TIMESTAMP)

---

## EXPECTED RESULTS

### Cost Savings:

**Current:**
- 251 queries × 128 MB avg = 32 GB/day
- Cost: $0.20/day
- At scale: **$21,170/year**

**After Fix:**
- 251 queries × 2 MB avg = 0.5 GB/day
- Cost: $0.003/day
- At scale: **$400/year**

**Annual Savings: $20,770** (98% reduction!)

### Performance Improvements:

- Query time: 5-10 seconds → 0.5-2 seconds
- Data scanned: 1 GB → 5 MB (per query)
- Concurrent query capacity: 10x improvement

---

## ROLLOUT STRATEGY

1. **Week 1:** Implement shared utility + update table creation code
2. **Week 2:** Test with new tables (don't migrate existing yet)
3. **Week 3:** Migrate critical tables (`gsc_performance_shared` first)
4. **Week 4:** Migrate all remaining tables, verify cost reduction

---

## VALIDATION

**Before deployment:**
- Run test queries on partitioned vs non-partitioned
- Verify `require_partition_filter` blocks non-date queries
- Check bytes scanned in query plan

**After deployment:**
- Monitor query costs daily for 1 week
- Verify 95%+ reduction in bytes scanned
- Check that all queries use partition filters

---

## RISKS & MITIGATION

**Risk 1:** Queries without date range fail
**Mitigation:** Update frontend to always include date range (default: last 30 days)

**Risk 2:** Data migration fails
**Mitigation:** Keep backup tables for 7 days before deleting

**Risk 3:** Clustering doesn't match query patterns
**Mitigation:** Monitor query stats, adjust clustering if needed

---

This plan ensures ALL future tables (any platform, any dimensions) get proper partitioning/clustering automatically.
