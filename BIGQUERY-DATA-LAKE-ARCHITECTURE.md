# BigQuery Data Lake Architecture - Complete Implementation Plan

**Status:** Approved Architecture
**Created:** 2025-10-27
**Scope:** All 10+ marketing platforms
**Implementation:** Phase 1 (GSC + GA4), Future phases (all platforms)

---

## 🎯 Executive Summary

### The Core Problem

Dashboards currently show **static snapshots** of data. Opening a dashboard created 30 days ago shows THE SAME data from 30 days ago, not current data.

**User Requirement:**
> "When practitioner opens their report whether today or in 30 days or 90 days or 2 years, their dashboard shows the updated data"

### The Solution

**BigQuery as Central Hot Storage** with:
1. **Shared tables** (one per platform) with workspace_id isolation
2. **On-demand OAuth pulls** when practitioner creates first dashboard
3. **Daily automatic refresh** for active properties
4. **Dynamic preset evaluation** (queries evaluate "Last 30 Days" at runtime)
5. **Smart deduplication** (same property + workspace = share data)

### How It Works (Like Looker Studio)

```
Dashboard stores: QUERY DEFINITION
  ↓
User opens dashboard: EXECUTES QUERY NOW
  ↓
BigQuery has: FRESH DATA (updated daily)
  ↓
User sees: CURRENT DATA (not old snapshot)
```

### Cost

- **Start:** ~$20/month (10 properties)
- **Scale:** ~$500/month (1,000 properties)
- **Enterprise:** ~$5,000/month (10,000 properties)

**Not $50,000/month** (avoided by using shared tables!)

---

## 📊 Platform Coverage

### Phase 1: Implement Now (You Have Data)
1. ✅ **Google Search Console** - Organic search
2. ✅ **Google Analytics 4** - Website analytics

### Phase 2: Future Platforms (Planned)
3. ⏳ **Google Ads** - Paid search (via MCC or OAuth)
4. ⏳ **Google Business Profile** - Local SEO
5. ⏳ **Bing Ads** - Microsoft paid search
6. ⏳ **Bing Webmaster Tools** - Microsoft organic
7. ⏳ **Amazon Ads** - Amazon advertising
8. ⏳ **Amazon Vendor Central** - Amazon sales
9. ⏳ **Meta Ads** - Facebook/Instagram
10. ⏳ **TikTok Ads** - TikTok advertising

---

## 🏗️ Architecture Overview

### Shared Table Model

```
ONE TABLE PER PLATFORM (not per user!)

gsc_performance_shared
├── Workspace A → client1.com (500K rows)
├── Workspace A → client2.com (300K rows)
├── Workspace B → client3.com (800K rows)
├── Workspace C → client1.com (450K rows) ← Different workspace, might be duplicate
└── ... (scales to millions of rows)

FILTERING:
SELECT * FROM gsc_performance_shared
WHERE workspace_id = 'workspace_A'  ← User only sees their data
AND property = 'sc-domain:client1.com'
AND date >= CURRENT_DATE - 30
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Practitioner Creates Dashboard                         │
│  "Show me GSC performance for client1.com"             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Platform Checks BigQuery                               │
│  Does gsc_performance_shared have client1.com data?     │
└────────────┬────────────────────────┬───────────────────┘
             │ YES                    │ NO
             │                        │
             ▼                        ▼
     ┌───────────────┐        ┌──────────────────┐
     │ Reuse Existing│        │ OAuth Consent    │
     │ Data          │        │ → Pull Data      │
     │ (instant)     │        │ (30-60 sec)      │
     └───────┬───────┘        └────────┬─────────┘
             │                         │
             └─────────┬───────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ Dashboard Ready             │
         │ Points to: shared table     │
         │ Filters: workspace_id       │
         └──────────────┬──────────────┘
                        │
                        ▼
         ┌─────────────────────────────┐
         │ Daily Refresh (2 AM UTC)    │
         │ → Pull yesterday's data     │
         │ → MERGE into shared table   │
         │ → ALL dashboards updated    │
         └─────────────────────────────┘
```

---

## 📋 Complete Metric & Dimension Lists

### Google Search Console (4 metrics, 5 dimensions)

**Metrics (Store ALL):**
| ID | Name | Type | Aggregation | Why Essential |
|----|------|------|-------------|---------------|
| clicks | Clicks | INT64 | SUM | Core performance |
| impressions | Impressions | INT64 | SUM | Visibility metric |
| ctr | CTR | FLOAT64 | AVG | Efficiency |
| position | Avg Position | FLOAT64 | AVG | Ranking success |

**Dimensions (Store ALL):**
| ID | Name | Type | Cardinality | Filter Support |
|----|------|------|-------------|----------------|
| date | Date | DATE | Medium | Date range |
| query | Search Query | STRING | High (10K-1M) | Search, equals |
| page | Landing Page | STRING | High (100-100K) | Search, equals |
| device | Device Type | STRING | Low (3) | Multiselect |
| country | Country | STRING | Medium (50-200) | Multiselect |

**Total:** 4 metrics + 5 dimensions = 9 fields

---

### Google Ads (20 metrics, 12 dimensions)

**Core Metrics (20):**

| Category | Metric | Type | Why Essential |
|----------|--------|------|---------------|
| **Performance** | clicks | INT64 | Click volume |
| | impressions | INT64 | Reach |
| | ctr | FLOAT64 | Efficiency |
| | cost_micros | INT64 | Spend |
| **Conversions** | conversions | FLOAT64 | Goal completions |
| | conversion_value | FLOAT64 | Revenue |
| | all_conversions | FLOAT64 | All conversion types |
| | all_conversions_value | FLOAT64 | Total value |
| **Efficiency** | cost_per_conversion | FLOAT64 | CPA |
| | conversion_rate | FLOAT64 | Conv / clicks |
| | roas | FLOAT64 | Return on ad spend |
| **Auction** | average_cpc | INT64 | Avg cost/click |
| | average_cpm | INT64 | Avg cost/1K impr |
| **Imp. Share** | search_impression_share | FLOAT64 | Market share |
| | search_lost_is_budget | FLOAT64 | Budget opportunity |
| | search_lost_is_rank | FLOAT64 | Rank opportunity |
| | search_top_impression_share | FLOAT64 | Top position % |
| | search_absolute_top_is | FLOAT64 | #1 position % |
| **Engagement** | engagement_rate | FLOAT64 | Interaction % |
| | interactions | INT64 | User actions |

**Core Dimensions (12):**

| Dimension | Type | Cardinality | Why Essential |
|-----------|------|-------------|---------------|
| date | DATE | Medium | Temporal |
| campaign_name | STRING | Low-Med (10-1K) | Primary grouping |
| campaign_id | INT64 | Low-Med | Stable ID |
| campaign_type | STRING | Low (6) | Search/Display/Video/PMax |
| ad_group_name | STRING | Med (100-10K) | Secondary grouping |
| ad_group_id | INT64 | Med | Stable ID |
| keyword_text | STRING | High (1K-100K) | Keyword analysis |
| match_type | STRING | Low (3) | EXACT/PHRASE/BROAD |
| device | STRING | Low (4) | Device targeting |
| network | STRING | Low (3) | SEARCH/DISPLAY/YOUTUBE |
| campaign_status | STRING | Low (3) | Active filtering |
| ad_group_status | STRING | Low (3) | Active filtering |

**Omitted (Available via ad-hoc pull if needed):**
- Quality score components (changes hourly)
- Ad creative details (headlines, descriptions)
- Auction insights data
- Placement-level data
- Hour-of-day breakdown

**Total:** 20 metrics + 12 dimensions = 32 fields

---

### Google Analytics 4 (25 metrics, 20 dimensions)

**Core Metrics (25):**

| Category | Metric | Type | Why Essential |
|----------|--------|------|---------------|
| **Users** | active_users | INT64 | Current users |
| | total_users | INT64 | Total reach |
| | new_users | INT64 | Acquisition |
| **Sessions** | sessions | INT64 | Visit count |
| | engaged_sessions | INT64 | Quality visits |
| | engagement_rate | FLOAT64 | Quality % |
| | sessions_per_user | FLOAT64 | Return rate |
| **Engagement** | screen_page_views | INT64 | Page views |
| | screen_page_views_per_session | FLOAT64 | Pages/session |
| | average_session_duration | FLOAT64 | Time on site |
| | bounce_rate | FLOAT64 | Single-page % |
| | event_count | INT64 | Total events |
| **Ecommerce** | ecommerce_purchases | INT64 | Transactions |
| | total_revenue | FLOAT64 | Revenue |
| | purchase_revenue | FLOAT64 | Purchase rev |
| | transactions | INT64 | Order count |
| | average_purchase_revenue | FLOAT64 | AOV |
| | items_viewed | INT64 | Product views |
| | items_added_to_cart | INT64 | Cart adds |
| | cart_to_view_rate | FLOAT64 | Cart conversion |
| **Conversions** | conversions | INT64 | Goal completions |
| | key_events | INT64 | Important events |
| | event_value | FLOAT64 | Event value |
| **Advertising** | advertiser_ad_cost | FLOAT64 | Ad spend |
| | advertiser_ad_clicks | INT64 | Ad clicks |

**Core Dimensions (20):**

| Category | Dimension | Type | Cardinality | Why Essential |
|----------|-----------|------|-------------|---------------|
| **Time** | date | DATE | Med | Temporal |
| **Source** | session_source | STRING | Med (100-1K) | Traffic source |
| | session_medium | STRING | Low (10-50) | Traffic type |
| | session_campaign | STRING | Med (50-500) | Campaign tracking |
| | session_default_channel_group | STRING | Low (10-15) | Channel grouping |
| | first_user_source | STRING | Med | Acquisition source |
| | first_user_medium | STRING | Low | Acquisition type |
| | first_user_campaign | STRING | Med | Acquisition campaign |
| **Content** | page_path | STRING | High (100-100K) | Page analysis |
| | page_title | STRING | High | Content analysis |
| | landing_page | STRING | High | Entry analysis |
| | exit_page | STRING | High | Exit analysis |
| **Tech** | device_category | STRING | Low (3) | Device type |
| | browser | STRING | Low (10-20) | Browser analysis |
| | operating_system | STRING | Low (10-20) | OS analysis |
| | platform | STRING | Low (3) | Platform type |
| **Geo** | country | STRING | Med (50-200) | Geographic |
| | city | STRING | High (1K-10K) | Local analysis |
| | region | STRING | Med (100-500) | Regional |
| **Events** | event_name | STRING | Med (50-500) | Event analysis |

**Omitted (Event-level too large):**
- User properties (custom dimensions)
- Item-level ecommerce (product details)
- Custom event parameters
- Session ID (privacy)

**Total:** 25 metrics + 20 dimensions = 45 fields

---

### Future Platforms (Minimal Viable Metrics)

**Bing Ads:** ~18 metrics, ~10 dimensions (similar to Google Ads)
**Amazon Ads:** ~15 metrics, ~8 dimensions (sales, ACOS, ROAS focus)
**Meta Ads:** ~20 metrics, ~12 dimensions (engagement + conversion focus)
**TikTok Ads:** ~18 metrics, ~10 dimensions (video metrics + engagement)
**Bing Webmaster:** ~4 metrics, ~5 dimensions (same as GSC)
**Amazon Vendor Central:** ~12 metrics, ~6 dimensions (sales + inventory)

---

## 🗄️ Shared Table Schemas

### Table 1: gsc_performance_shared

```sql
CREATE TABLE `mcp-servers-475317.wpp_marketing.gsc_performance_shared`
(
  -- Partition key (REQUIRED for performance)
  date DATE NOT NULL,

  -- Dimensions (ALL 5 - complete filter flexibility)
  query STRING,
  page STRING,
  device STRING,  -- MOBILE, DESKTOP, TABLET
  country STRING, -- ISO code: US, CA, GB, etc.

  -- Metrics (ALL 4)
  clicks INT64,
  impressions INT64,
  ctr FLOAT64,
  position FLOAT64,

  -- Multi-tenant isolation (CRITICAL)
  workspace_id STRING NOT NULL,
  property STRING NOT NULL,  -- sc-domain:example.com
  oauth_user_id STRING,      -- Which Google account granted access

  -- Deduplication tracking
  property_fingerprint STRING,  -- MD5(property + dimensions)
  is_primary_copy BOOL DEFAULT TRUE,
  shared_with_workspaces ARRAY<STRING>,

  -- Metadata
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  data_source STRING DEFAULT 'api',  -- 'bulk_export' or 'api' or 'transfer'
  search_type STRING DEFAULT 'web'   -- web, image, video
)
PARTITION BY date
CLUSTER BY workspace_id, property, device, country
OPTIONS(
  partition_expiration_days = 365,  -- Auto-delete after 12 months (moves to warm)
  require_partition_filter = TRUE,  -- Force date filtering (cost optimization)
  description = "Shared GSC performance data - all workspaces, hot storage (last 12 months)"
);

-- Indexes for fast lookups
CREATE INDEX idx_property_workspace
ON gsc_performance_shared(property, workspace_id);

CREATE INDEX idx_active_properties
ON gsc_performance_shared(property, date DESC)
WHERE date >= CURRENT_DATE - 30;

-- Row-level security policy
CREATE ROW ACCESS POLICY workspace_isolation
ON gsc_performance_shared
GRANT TO ("allAuthenticatedUsers")
FILTER USING (
  workspace_id = SESSION_USER()
  OR workspace_id IN (
    SELECT workspace_id FROM shared_access
    WHERE user_id = SESSION_USER()
  )
);
```

**Storage Estimate:**
- 1,000 properties × 500K rows/year = 500M rows
- 200 bytes/row = 100GB
- **Cost: $2/month**

---

### Table 2: ads_performance_shared

```sql
CREATE TABLE `mcp-servers-475317.wpp_marketing.ads_performance_shared`
(
  -- Partition key
  date DATE NOT NULL,

  -- Campaign Hierarchy (12 dimensions)
  campaign_id INT64 NOT NULL,
  campaign_name STRING,
  campaign_type STRING,  -- SEARCH, DISPLAY, VIDEO, PERFORMANCE_MAX, SHOPPING, DEMAND_GEN
  campaign_status STRING,  -- ENABLED, PAUSED, REMOVED
  ad_group_id INT64,
  ad_group_name STRING,
  ad_group_status STRING,
  keyword_text STRING,
  match_type STRING,  -- EXACT, PHRASE, BROAD
  device STRING,  -- MOBILE, DESKTOP, TABLET, CONNECTED_TV
  network STRING,  -- SEARCH, DISPLAY, YOUTUBE
  ad_network_type STRING,  -- SEARCH_PARTNERS, CONTENT, YOUTUBE_SEARCH, YOUTUBE_WATCH

  -- Performance Metrics (20)
  clicks INT64,
  impressions INT64,
  ctr FLOAT64,
  cost_micros INT64,  -- Cost in micros (divide by 1M for dollars)

  -- Conversion Metrics
  conversions FLOAT64,
  conversion_value FLOAT64,
  all_conversions FLOAT64,
  all_conversions_value FLOAT64,

  -- Efficiency Metrics
  cost_per_conversion FLOAT64,
  conversion_rate FLOAT64,
  roas FLOAT64,
  average_cpc INT64,  -- In micros
  average_cpm INT64,  -- In micros

  -- Impression Share Metrics
  search_impression_share FLOAT64,
  search_lost_is_budget FLOAT64,
  search_lost_is_rank FLOAT64,
  search_top_impression_share FLOAT64,
  search_absolute_top_is FLOAT64,

  -- Engagement
  engagement_rate FLOAT64,
  interactions INT64,

  -- Multi-tenant
  workspace_id STRING NOT NULL,
  customer_id STRING NOT NULL,  -- Google Ads customer ID
  oauth_user_id STRING,

  -- Deduplication
  property_fingerprint STRING,
  is_primary_copy BOOL DEFAULT TRUE,

  -- Metadata
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  data_source STRING DEFAULT 'api'
)
PARTITION BY date
CLUSTER BY workspace_id, customer_id, campaign_id, device
OPTIONS(
  partition_expiration_days = 365,
  require_partition_filter = TRUE,
  description = "Shared Google Ads performance - all workspaces"
);
```

**Storage Estimate:**
- 1,000 accounts × 200K rows/year = 200M rows
- 400 bytes/row = 80GB
- **Cost: $1.60/month**

---

### Table 3: ga4_sessions_shared

```sql
CREATE TABLE `mcp-servers-475317.wpp_marketing.ga4_sessions_shared`
(
  -- Partition key
  date DATE NOT NULL,

  -- Traffic Source Dimensions (8)
  session_source STRING,
  session_medium STRING,
  session_campaign STRING,
  session_default_channel_group STRING,
  first_user_source STRING,
  first_user_medium STRING,
  first_user_campaign STRING,
  session_manual_ad_content STRING,

  -- Content Dimensions (4)
  page_path STRING,
  page_title STRING,
  landing_page STRING,
  exit_page STRING,

  -- Technology Dimensions (4)
  device_category STRING,
  browser STRING,
  operating_system STRING,
  platform STRING,

  -- Geography Dimensions (3)
  country STRING,
  city STRING,
  region STRING,

  -- Event Dimension (1)
  event_name STRING,

  -- User & Session Metrics (7)
  active_users INT64,
  total_users INT64,
  new_users INT64,
  sessions INT64,
  engaged_sessions INT64,
  engagement_rate FLOAT64,
  sessions_per_user FLOAT64,

  -- Engagement Metrics (4)
  screen_page_views INT64,
  screen_page_views_per_session FLOAT64,
  average_session_duration FLOAT64,
  bounce_rate FLOAT64,
  event_count INT64,

  -- Ecommerce Metrics (9)
  ecommerce_purchases INT64,
  total_revenue FLOAT64,
  purchase_revenue FLOAT64,
  transactions INT64,
  average_purchase_revenue FLOAT64,
  items_viewed INT64,
  items_added_to_cart INT64,
  cart_to_view_rate FLOAT64,
  items_purchased INT64,

  -- Conversion Metrics (3)
  conversions INT64,
  key_events INT64,
  event_value FLOAT64,

  -- Advertising Metrics (2)
  advertiser_ad_cost FLOAT64,
  advertiser_ad_clicks INT64,

  -- Multi-tenant
  workspace_id STRING NOT NULL,
  property_id STRING NOT NULL,  -- GA4 property ID
  oauth_user_id STRING,

  -- Deduplication
  property_fingerprint STRING,
  is_primary_copy BOOL DEFAULT TRUE,

  -- Metadata
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  data_source STRING DEFAULT 'api'
)
PARTITION BY date
CLUSTER BY workspace_id, property_id, device_category, session_source
OPTIONS(
  partition_expiration_days = 365,
  require_partition_filter = TRUE,
  description = "Shared GA4 session data - all workspaces"
);
```

**Storage Estimate:**
- 1,000 properties × 300K rows/year = 300M rows
- 500 bytes/row = 150GB
- **Cost: $3/month**

**TOTAL STORAGE (3 platforms): ~$7/month for 1,000 properties**

---

## 🔄 Data Collection Strategy

### Method 1: On-Demand Pull (Dashboard Creation)

**When:** Practitioner creates first dashboard for a property

**Process:**
```typescript
// Platform dashboard creation API
POST /api/dashboards/create
{
  "name": "Client Performance",
  "platform": "gsc",
  "property": "sc-domain:client1.com",
  "metrics": ["clicks", "impressions"],
  "datePreset": "last30Days"
}

// Backend logic:
async function createDashboard(req) {
  const { platform, property, workspace_id, oauth_token } = req;

  // 1. Check if data exists
  const dataExists = await checkPropertyData(platform, property);

  if (!dataExists) {
    // 2. Trigger initial pull (last 12 months)
    console.log(`[Data Pull] New property ${property}, pulling 12 months...`);

    const result = await mcp__wpp_digital_marketing__push_platform_data_to_bigquery({
      platform,
      property,
      dateRange: [
        getDate(-365), // 12 months ago
        getDate(-1)     // Yesterday
      ],
      dimensions: PLATFORM_DIMENSIONS[platform], // ALL dimensions
      __oauthToken: oauth_token
    });

    // 3. Insert with workspace_id
    await bigquery.query(`
      UPDATE ${result.table}
      SET workspace_id = '${workspace_id}',
          oauth_user_id = '${oauth_token.user_id}',
          property_fingerprint = MD5('${property}'),
          is_primary_copy = TRUE
    `);

    // 4. Register in active properties
    await registerActiveProperty(property, workspace_id);

    console.log(`[Data Pull] Complete: ${result.rows_inserted} rows`);
  } else {
    console.log(`[Data Reuse] Property ${property} already in BigQuery`);
  }

  // 5. Create dashboard (points to shared table)
  const dashboard = await createDashboardRecord({
    name: req.name,
    dataset_id: `${platform}_performance_shared`,
    workspace_id,
    filters: [{ preset: req.datePreset }]
  });

  return dashboard;
}
```

**User Experience:**
- First dashboard: 30-60 seconds (initial pull)
- Subsequent dashboards (same property): instant (data exists)
- Loading indicator: "Pulling 12 months of data from Google Search Console..."

---

### Method 2: Daily Incremental Refresh

**When:** Every day at 2 AM UTC

**Process:**
```typescript
// Cloud Scheduler triggers Cloud Function
export async function dailyDataRefresh() {
  // 1. Get all active properties (used in last 30 days)
  const activeProperties = await supabase
    .from('datasets')
    .select('platform_metadata, workspace_id')
    .gte('last_queried_at', getDate(-30))
    .eq('refresh_interval_days', 1);

  console.log(`[Daily Refresh] Found ${activeProperties.length} active properties`);

  const yesterday = getDate(-1);

  // 2. Pull yesterday's data for each
  for (const prop of activeProperties) {
    const { platform, property } = prop.platform_metadata;

    try {
      const result = await mcp__wpp_digital_marketing__push_platform_data_to_bigquery({
        platform,
        property,
        dateRange: [yesterday, yesterday], // Just yesterday
        dimensions: PLATFORM_DIMENSIONS[platform],
        __oauthToken: await getStoredToken(prop.workspace_id, property)
      });

      // 3. MERGE into shared table (upsert)
      await bigquery.query(`
        MERGE ${platform}_performance_shared AS target
        USING temp_${result.table} AS source
        ON target.date = source.date
        AND target.property = source.property
        AND target.workspace_id = source.workspace_id
        AND target.query = source.query
        AND target.page = source.page
        AND target.device = source.device
        AND target.country = source.country
        WHEN MATCHED THEN UPDATE SET
          clicks = source.clicks,
          impressions = source.impressions,
          ctr = source.ctr,
          position = source.position
        WHEN NOT MATCHED THEN INSERT (...)
      `);

      console.log(`[Refresh] ${property}: ${result.rows_inserted} rows`);

    } catch (error) {
      console.error(`[Refresh] Failed: ${property}`, error);
      // Mark for manual review
      await markPropertyRefreshFailed(property);
    }
  }

  // 4. Invalidate React Query cache
  await notifyPlatform('cache.invalidate', { scope: 'all' });

  console.log(`[Daily Refresh] Complete`);
}
```

**Runs:** Daily at 2 AM UTC
**Duration:** ~5-15 minutes for 1,000 properties
**Cost:** FREE (within API quotas)

---

### Method 3: Native Platform Exports (When Available)

**Google Search Console - Bulk Export:**
```
ONE-TIME SETUP (Manual):
1. Search Console → Settings → Bulk Data Export
2. Project: mcp-servers-475317
3. Dataset: wpp_marketing_raw
4. Click "Start Export"

AUTOMATIC DAILY:
- Google exports to: searchdata_site_impression
- Google exports to: searchdata_url_impression
- Google exports to: ExportLog

VIEW CREATION:
CREATE OR REPLACE VIEW gsc_performance_shared AS
SELECT
  data_date as date,
  query,
  url as page,
  device,
  country,
  clicks,
  impressions,
  ctr,
  position,
  'bulk-export-workspace' as workspace_id,
  site_url as property,
  NULL as oauth_user_id,
  MD5(site_url) as property_fingerprint,
  TRUE as is_primary_copy,
  [] as shared_with_workspaces,
  CURRENT_TIMESTAMP() as imported_at,
  'bulk_export' as data_source,
  'web' as search_type
FROM `wpp_marketing_raw.searchdata_site_impression`
WHERE data_date >= CURRENT_DATE - 365;
```

**Benefits:**
- Unlimited rows (no 50K API limit)
- FREE
- Fully automated by Google
- Zero code maintenance

**Drawback:**
- Only works for properties YOU own (not practitioner-owned)

**Decision:** Use for WPP-managed properties, use API for practitioner properties

---

## 🔍 Smart Deduplication Logic

### Scenario 1: Same Workspace, Same Property

```
Practitioner A (workspace_WPP_Canada):
  → Creates dashboard for client1.com
  → Data pulled to BigQuery with workspace_WPP_Canada

Practitioner A (same workspace):
  → Creates ANOTHER dashboard for client1.com
  → Check: Data exists for workspace_WPP_Canada + client1.com?
  → YES! Reuse existing data
  → Dashboard ready instantly (0 seconds)
```

**SQL Check:**
```sql
SELECT COUNT(*) FROM gsc_performance_shared
WHERE property = 'sc-domain:client1.com'
AND workspace_id = 'workspace_WPP_Canada'
AND date >= CURRENT_DATE - 365;

-- If > 0: DATA EXISTS, reuse
-- If = 0: PULL NEW DATA
```

---

### Scenario 2: Different Workspace, Same Property

```
Practitioner A (workspace_WPP_Canada):
  → Has client1.com data

Practitioner B (workspace_WPP_UK):
  → Wants client1.com dashboard
  → Check: Data exists for workspace_WPP_UK + client1.com?
  → NO!
  → Check: Does ANY workspace have client1.com?
  → YES! workspace_WPP_Canada has it

  → DECISION POINT:

  Option A: Share (if same organization)
    → workspace_WPP_UK inherits workspace_WPP_Canada data
    → NO duplicate pull needed

  Option B: Separate (if different clients with same domain)
    → workspace_WPP_UK pulls with THEIR OAuth
    → Might see different data (different access rights)
    → DUPLICATE in BigQuery (intentional)
```

**Implementation:**
```typescript
async function checkDataAvailability(property, workspace_id, oauth_user_id) {
  // 1. Check own workspace
  const ownData = await bigquery.query(`
    SELECT * FROM gsc_performance_shared
    WHERE property = '${property}'
    AND workspace_id = '${workspace_id}'
    LIMIT 1
  `);

  if (ownData.length > 0) {
    return { exists: true, source: 'own_workspace', needsPull: false };
  }

  // 2. Check if other workspaces have it
  const otherData = await bigquery.query(`
    SELECT workspace_id, oauth_user_id, is_primary_copy
    FROM gsc_performance_shared
    WHERE property = '${property}'
    LIMIT 1
  `);

  if (otherData.length > 0) {
    // 3. Check if same OAuth user (person moved workspaces)
    if (otherData[0].oauth_user_id === oauth_user_id) {
      // Same person! Copy their data to new workspace
      await copyDataToWorkspace(property, otherData[0].workspace_id, workspace_id);
      return { exists: true, source: 'user_migration', needsPull: false };
    }

    // 4. Check if workspaces are in same organization (share policy)
    const canShare = await checkSharePolicy(workspace_id, otherData[0].workspace_id);

    if (canShare) {
      // Share existing data
      await addSharedWorkspace(property, otherData[0].workspace_id, workspace_id);
      return { exists: true, source: 'shared_org', needsPull: false };
    }

    // 5. Different organization = might have different access
    // Recommend pull, but show existing data as option
    return {
      exists: true,
      source: 'different_org',
      needsPull: true,  // Recommended
      canReuse: true     // Optional (if admin approves)
    };
  }

  // 6. Brand new property
  return { exists: false, needsPull: true };
}
```

---

### Scenario 3: Inactive Property Reactivation

```
Day 0: Practitioner creates dashboard for client1.com
  → Data pulled (12 months)
  → Daily refresh starts

Day 100: Dashboard last opened
  → Still refreshing daily

Day 130: Last daily refresh (30 days since last query)
  → Property marked "inactive"
  → Daily refresh paused (cost savings)

Day 200: Practitioner opens dashboard again
  → Detect: last_refreshed = Day 130 (70 days ago)
  → Trigger: Pull last 70 days
  → MERGE into existing data
  → Takes 10 seconds
  → Mark active again
  → Resume daily refresh
```

**SQL Detection:**
```sql
-- Check data freshness
SELECT
  MAX(date) as latest_date,
  DATE_DIFF(CURRENT_DATE, MAX(date), DAY) as days_stale
FROM gsc_performance_shared
WHERE property = 'sc-domain:client1.com'
AND workspace_id = 'workspace_A';

-- If days_stale > 7: Show warning "Data is 14 days old, refresh?"
-- If days_stale > 30: Auto-refresh on dashboard open
```

---

## 🎯 Smart Property Discovery

### For MCC-Based Platforms (Paid Ads)

**Google Ads MCC:**
```typescript
// ONE-TIME: Admin connects WPP MCC account
// BigQuery Data Transfer setup:

Setup:
  Source: Google Ads
  MCC ID: 123-456-7890 (WPP Master MCC)
  Schedule: Daily 2 AM
  Destination: wpp_marketing_raw.p_ads_*

Result:
  → Automatically pulls ALL sub-accounts (10,000+)
  → Creates: p_ads_CampaignBasicStats_*, p_ads_Keywords_*, etc.
  → Cost: $2.50 per account ID = $25,000/month (if 10K accounts)

Optimization:
  → Only enable for ACTIVE accounts (used in last 90 days)
  → Selective pull via API for others
  → Cost: $2.50 × 1,000 active = $2,500/month
```

**Amazon Ads MCC:** Similar pattern
**Bing Ads MCC:** Similar pattern

**For practitioner ad-hoc accounts NOT in MCC:**
- Use OAuth on-demand pull
- Store in shared table

---

### For Property-Based Platforms (Organic)

**GSC, GA4, Business Profile:**
```typescript
// Practitioner creates dashboard

Flow:
1. Platform: "We need access to sc-domain:client1.com"
2. OAuth popup: "Grant WPP Analytics access to Search Console?"
3. Practitioner: Clicks "Allow"
4. Platform: Receives OAuth token with property access
5. Platform: Pulls 12 months to BigQuery
6. Platform: Stores OAuth token (for daily refresh)
7. Dashboard: Ready

Daily Refresh:
  → Uses stored OAuth token
  → Pulls yesterday only
  → If token expires: Email practitioner to re-authorize
```

---

## 📅 Daily Refresh Implementation

### Cloud Scheduler Configuration

```yaml
# config/cloud-scheduler.yaml

- name: gsc-active-properties-refresh
  schedule: "0 2 * * *"  # 2 AM UTC daily
  timezone: UTC
  target:
    type: cloud-function
    function: refresh-platform-data
    params:
      platform: gsc
      mode: incremental  # Yesterday only
      scope: active      # Last 30 days activity

- name: ga4-active-properties-refresh
  schedule: "0 3 * * *"  # 3 AM UTC daily
  function: refresh-platform-data
  params:
    platform: ga4
    mode: incremental
    scope: active

- name: ads-active-properties-refresh
  schedule: "0 4 * * *"  # 4 AM UTC daily
  function: refresh-platform-data
  params:
    platform: google_ads
    mode: incremental
    scope: active
```

### Cloud Function Implementation

```typescript
// functions/refresh-platform-data/index.ts

import { pushPlatformDataToBigQueryTool } from '@/mcp-tools';
import { createClient } from '@supabase/supabase-js';
import { BigQuery } from '@google-cloud/bigquery';

export const refreshPlatformData = async (event: any) => {
  const { platform, mode, scope } = event.data;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const bigquery = new BigQuery({ projectId: 'mcp-servers-475317' });

  // 1. Get active properties
  const cutoffDate = scope === 'active'
    ? new Date(Date.now() - 30*24*60*60*1000)  // 30 days
    : new Date(0);  // All time

  const { data: activeProps } = await supabase
    .from('property_registry')
    .select('property, workspace_id, oauth_token_encrypted, platform_metadata')
    .eq('platform', platform)
    .gte('last_queried_at', cutoffDate.toISOString())
    .order('last_queried_at', { ascending: false });

  console.log(`[Refresh ${platform}] Found ${activeProps.length} active properties`);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const results = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  // 2. Refresh each property
  for (const prop of activeProps) {
    try {
      // Decrypt OAuth token
      const oauthToken = await decryptToken(prop.oauth_token_encrypted);

      // Check token expiry
      if (isTokenExpired(oauthToken)) {
        console.warn(`[Refresh] Token expired for ${prop.property}, skipping`);
        await notifyPractitionerReauth(prop.workspace_id, prop.property);
        results.skipped++;
        continue;
      }

      // Pull yesterday's data
      const pullResult = await pushPlatformDataToBigQueryTool.handler({
        platform,
        property: prop.property,
        dateRange: [yesterdayStr, yesterdayStr],
        dimensions: getPlatformDimensions(platform),
        __oauthToken: oauthToken
      });

      if (pullResult.success) {
        // MERGE into shared table
        await mergeIntoSharedTable(
          platform,
          pullResult.table,
          prop.workspace_id,
          prop.property
        );

        // Update last refresh timestamp
        await supabase
          .from('property_registry')
          .update({
            last_refreshed_at: new Date().toISOString(),
            last_refresh_rows: pullResult.rows_inserted
          })
          .eq('property', prop.property)
          .eq('workspace_id', prop.workspace_id);

        results.success++;
        console.log(`[Refresh] ✅ ${prop.property}: ${pullResult.rows_inserted} rows`);
      }

    } catch (error) {
      console.error(`[Refresh] ❌ ${prop.property}:`, error.message);
      results.failed++;

      // Log failure for monitoring
      await logRefreshFailure(prop.property, error);
    }
  }

  console.log(`[Refresh ${platform}] Summary:`, results);

  return results;
};

// Helper: MERGE temp data into shared table
async function mergeIntoSharedTable(platform, tempTable, workspace_id, property) {
  const sharedTable = `${platform}_performance_shared`;

  const mergeQuery = `
    MERGE \`wpp_marketing.${sharedTable}\` AS target
    USING \`${tempTable}\` AS source
    ON target.date = source.date
    AND target.property = source.property
    AND target.workspace_id = source.workspace_id
    AND target.query = source.query
    AND target.page = source.page
    AND target.device = source.device
    AND target.country = source.country
    WHEN MATCHED THEN UPDATE SET
      clicks = source.clicks,
      impressions = source.impressions,
      ctr = source.ctr,
      position = source.position,
      imported_at = CURRENT_TIMESTAMP()
    WHEN NOT MATCHED THEN INSERT (
      date, query, page, device, country,
      clicks, impressions, ctr, position,
      workspace_id, property, oauth_user_id,
      property_fingerprint, is_primary_copy,
      imported_at, data_source
    ) VALUES (
      source.date, source.query, source.page, source.device, source.country,
      source.clicks, source.impressions, source.ctr, source.position,
      '${workspace_id}', source.property, NULL,
      MD5(source.property), TRUE,
      CURRENT_TIMESTAMP(), 'api'
    );
  `;

  await bigquery.query(mergeQuery);
}
```

---

## 📐 Property Registry System

### Supabase Table: property_registry

```sql
CREATE TABLE property_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Property identification
  platform TEXT NOT NULL,  -- 'gsc', 'ga4', 'google_ads', etc.
  property TEXT NOT NULL,  -- Property identifier
  property_name TEXT,      -- Human-readable name

  -- Workspace association
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  created_by_user_id UUID REFERENCES auth.users(id),

  -- OAuth
  oauth_user_id TEXT,  -- Google user ID who granted access
  oauth_token_encrypted TEXT,  -- Encrypted refresh token
  oauth_scopes JSONB,  -- Granted scopes
  oauth_granted_at TIMESTAMPTZ,
  oauth_expires_at TIMESTAMPTZ,

  -- Data sync status
  initial_pull_complete BOOL DEFAULT FALSE,
  last_pull_date DATE,
  last_queried_at TIMESTAMPTZ,  -- When dashboard last opened
  last_refreshed_at TIMESTAMPTZ,  -- When data last updated
  refresh_status TEXT DEFAULT 'active',  -- 'active', 'paused', 'failed', 'expired'
  refresh_interval_days INT DEFAULT 1,

  -- Deduplication
  property_fingerprint TEXT,  -- MD5 for quick lookup
  is_primary_copy BOOL DEFAULT TRUE,
  shared_with_workspaces TEXT[],

  -- Metadata
  platform_metadata JSONB,  -- Platform-specific config
  data_stats JSONB,  -- { row_count, date_range, last_row_count }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(workspace_id, property, platform)
);

-- Indexes
CREATE INDEX idx_active_properties
ON property_registry(platform, last_queried_at DESC)
WHERE refresh_status = 'active';

CREATE INDEX idx_property_lookup
ON property_registry(property_fingerprint, platform);

-- RLS Policy
ALTER TABLE property_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own workspace properties"
ON property_registry FOR SELECT
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE user_id = auth.uid()
));
```

---

## 🔄 Complete Data Flow (End-to-End)

### Flow 1: New Property (First Dashboard)

```
┌──────────────────────────────────────────────────────────┐
│ Practitioner: "Create GSC dashboard for client1.com"    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Platform Backend:                                        │
│ 1. Check property_registry:                             │
│    WHERE property = 'sc-domain:client1.com'             │
│    AND workspace_id = 'workspace_A'                     │
│ 2. Result: NOT FOUND                                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Check if OTHER workspace has it:                         │
│ SELECT * FROM property_registry                          │
│ WHERE property = 'sc-domain:client1.com'                │
│ Result: NOT FOUND (brand new property)                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ OAuth Consent Flow:                                      │
│ 1. Show popup: "Grant access to client1.com"           │
│ 2. Practitioner clicks "Allow"                          │
│ 3. Receive OAuth token with GSC access                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Initial Data Pull (12 months):                          │
│ MCP Tool: push_platform_data_to_bigquery({              │
│   platform: 'gsc',                                       │
│   property: 'sc-domain:client1.com',                    │
│   dateRange: ['2024-10-27', '2025-10-26'],             │
│   dimensions: ['date','query','page','device','country']│
│ })                                                       │
│ Duration: 30-60 seconds                                 │
│ Rows: ~180K                                             │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Insert into Shared Table:                               │
│ - Add workspace_id = 'workspace_A'                      │
│ - Add oauth_user_id = practitioner Google ID            │
│ - Add property_fingerprint = MD5(property)              │
│ - Mark is_primary_copy = TRUE                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Register in property_registry:                          │
│ INSERT INTO property_registry (                          │
│   platform, property, workspace_id,                     │
│   oauth_token_encrypted,                                 │
│   initial_pull_complete, refresh_status                 │
│ ) VALUES (                                              │
│   'gsc', 'sc-domain:client1.com', 'workspace_A',       │
│   encrypt(oauth_token),                                  │
│   TRUE, 'active'                                        │
│ )                                                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Create Dashboard Record:                                │
│ {                                                        │
│   name: "Client1 Performance",                          │
│   dataset_id: "gsc_performance_shared",                 │
│   workspace_id: "workspace_A",                          │
│   components: [{                                        │
│     type: "scorecard",                                  │
│     metrics: ["clicks"],                                │
│     filters: [{ preset: "last30Days" }]                │
│   }]                                                    │
│ }                                                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Dashboard Ready! ✅                                      │
│ Data in BigQuery, queries will be fast                  │
└──────────────────────────────────────────────────────────┘
```

### Flow 2: Existing Property (Data Reuse)

```
┌──────────────────────────────────────────────────────────┐
│ Practitioner B: "Create GSC dashboard for client1.com"  │
│ (Same workspace as Practitioner A)                      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Platform Backend:                                        │
│ Check property_registry WHERE property = client1.com     │
│ AND workspace_id = 'workspace_A'                        │
│ Result: FOUND! ✅                                        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Data Already Exists!                                     │
│ - Skip OAuth (already have access)                      │
│ - Skip data pull (already in BigQuery)                  │
│ - Create dashboard instantly                            │
│ Duration: <1 second                                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Dashboard Ready! ✅                                      │
│ Reused existing data (no duplicate)                     │
└──────────────────────────────────────────────────────────┘
```

### Flow 3: Daily Refresh (Automatic)

```
┌──────────────────────────────────────────────────────────┐
│ Cloud Scheduler: 2 AM UTC Daily                         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Query property_registry:                                │
│ SELECT * WHERE platform = 'gsc'                         │
│ AND last_queried_at >= NOW() - INTERVAL '30 days'      │
│ AND refresh_status = 'active'                           │
│ Result: 847 properties need refresh                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ For Each Property (Parallel, batches of 10):            │
│ 1. Pull yesterday's data (API call)                     │
│ 2. MERGE into shared table                              │
│ 3. Update last_refreshed_at                             │
│ Duration: 8-12 minutes for 847 properties               │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Invalidate Frontend Cache:                              │
│ POST /api/cache/invalidate { scope: 'all' }            │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ All Dashboards Now Have Fresh Data! ✅                  │
│ Next time practitioner opens → sees yesterday's data    │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Final Answer to Your Question

> "Will BigQuery data lake build over time as practitioners use system?"

**YES - EXACTLY!**

**Month 1:**
- 10 practitioners create dashboards
- 15 unique properties pulled
- BigQuery: 2.7M rows
- Cost: $18/month

**Month 12:**
- 1,000 practitioners
- 1,500 unique properties
- BigQuery: 270M rows
- Cost: $480/month

**Month 24:**
- 10,000 practitioners
- 8,000 unique properties (with dedup!)
- BigQuery: 1.44B rows
- Cost: $2,100/month

**The lake grows organically - you only pay for what practitioners actually use!**

---

**Ready to proceed with full detailed plan including:**
- All 10 platform schemas
- Complete implementation steps
- Code for all components
- Migration from current system
- Linear ticket creation
- Documentation updates

**Shall I create it?**