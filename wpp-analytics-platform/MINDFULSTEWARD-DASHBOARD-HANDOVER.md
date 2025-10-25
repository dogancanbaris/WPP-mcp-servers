# MindfulSteward Dashboard - Complete Build Handover

**Dashboard Goal:** Professional 6-row SEO performance dashboard using NEW dataset architecture (no Cube.js)
**Data Source:** MindfulSteward GSC data (90 days) via BigQuery
**Status:** Infrastructure complete, ready to build full dashboard
**Token Budget:** 354k remaining (plenty for completion)

---

## 🎨 EXACT DASHBOARD LAYOUT (ASCII Specification)

```
┌─────────────────────────────────────────────────────────────────┐
│ ROW 1: HEADER (2 columns - 3/4 + 1/4)                          │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 MindfulSteward Organic Search   │ 📅 Last 3 Months           │
│    Performance Report              │                            │
│    (WPP Blue #191D63 background)   │    (WPP Blue background)   │
│    (White text, 28px, bold)        │    (White text, right)     │
│    Width: 3/4                      │    Width: 1/4              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ROW 2: DESCRIPTION (1 column - full width)                     │
├─────────────────────────────────────────────────────────────────┤
│ 📄 About This Report                                            │
│                                                                 │
│ This dashboard provides comprehensive SEO performance for       │
│ MindfulSteward.com over the past 3 months. Data from Google    │
│ Search Console includes:                                        │
│  • Search impressions and clicks across all pages              │
│  • Average position in search results                          │
│  • Click-through rates by query, page, device, geography       │
│  • Performance trends and top-performing content               │
│                                                                 │
│ (Light gray background #f8f9fa, dark text #5f6368)             │
│ Width: 1/1                                                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────────────┐
│ ROW 3: SCORECARDS (4 columns - 1/4 each)          │
├──────────┼──────────┼──────────┼──────────────────┤
│ Total    │ Total    │ Avg      │ Click-Through    │
│ Impressi │ Clicks   │ Position │ Rate             │
│ ons      │          │          │                  │
│ 954,034  │ 6,268    │ 20.5     │ 0.66%            │
│ +12.3%↗  │ +8.7%↗   │ -2.4%↘   │ +0.5%↗           │
│          │          │ (lower=  │                  │
│          │          │  better) │                  │
│ Width:1/4│ Width:1/4│ Width:1/4│ Width: 1/4       │
└──────────┴──────────┴──────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ROW 4: TIME SERIES CHART (1 column - full width)               │
├─────────────────────────────────────────────────────────────────┤
│ Performance Trend - Last 3 Months                               │
│                                                                 │
│    ┌─ Clicks ━━━  Impressions ━━━                              │
│10K │        ╱╲      ╱╲                                          │
│    │   ╱╲  ╱  ╲    ╱  ╲    ╱╲                                   │
│ 5K │  ╱  ╲╱    ╲  ╱    ╲  ╱  ╲                                  │
│    │ ╱          ╲╱      ╲╱      ╲                               │
│  0 └────────────────────────────────────                        │
│     Jul 25    Aug 25    Sep 25    Oct 23                        │
│                                                                 │
│ (87 days daily data, 2 metrics, legend, WPP colors)            │
│ Width: 1/1                                                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────────┐
│ ROW 5: TABLES (2 columns - 1/2 each)                            │
├──────────────────────────────┼──────────────────────────────────┤
│ Top Landing Pages            │ Top Search Queries               │
│ ────────────────────────────│──────────────────────────────────│
│ Page              Clicks CTR │ Query              Clicks    Pos │
│ /meditation-...   1,703  2.4%│ meditation guru    114      2.7  │
│ /mindfulness...     488  0.5%│ meditation tools   110      4.3  │
│ /connect-high...    370  0.6%│ types of medit..   70       9.6  │
│ /affirmations...    328  0.8%│ meditation teach   53       2.3  │
│ /top-10-child...    313  1.2%│ different types    27       8.1  │
│ /helpful-tools...   304  1.9%│ famous meditati    27       2.9  │
│ /youtube-honest...  157  0.4%│ tantric meditat    27       8.6  │
│ /andrew-huberman... 149  0.7%│ top 10 meditati    27       2.0  │
│ /celebrities...     143  1.4%│ tantra meditati    26      10.3  │
│ /jason-stephenson  130  0.4%│ meditation teach   24       6.8  │
│                              │                                  │
│ (Sortable, clickable, 10 rows)│ (Sortable, 10 rows)             │
│ Width: 1/2                   │ Width: 1/2                       │
└──────────────────────────────┴──────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────────┐
│ ROW 6: PIE CHARTS (2 columns - 1/2 each)                        │
├──────────────────────────────┼──────────────────────────────────┤
│ Traffic by Device            │ Traffic by Country               │
│                              │                                  │
│       ████                   │       ████                       │
│     ████  ██                 │     ████  ██                     │
│       ██                     │       ██  ██                     │
│                              │          ██                      │
│                              │                                  │
│ Mobile   63.4%               │ USA      32.3%                   │
│ Desktop  34.2%               │ India    11.5%                   │
│ Tablet    2.4%               │ UK        7.8%                   │
│                              │ Canada    7.5%                   │
│                              │ Australia 6.0%                   │
│                              │ Other    34.9%                   │
│                              │                                  │
│ (3 slices, WPP colors)       │ (6 slices, WPP colors)           │
│ Width: 1/2                   │ Width: 1/2                       │
└──────────────────────────────┴──────────────────────────────────┘
```

**Total: 6 rows, 10 components (2 titles + 4 scorecards + 1 time series + 2 tables + 2 pies)**

---

## 🏗️ NEW ARCHITECTURE (How to Build This)

### The System (Post-Cube.js):

```
DATA FLOW:
1. MCP Server → Pull GSC data → BigQuery (data stored)
2. Platform API → Register dataset → Supabase (metadata stored)
3. Platform API → Create dashboard → Links to dataset_id
4. Charts render → Query dataset API → Cached results returned
```

**Key Difference from Old System:**
- ❌ NO Cube.js server
- ❌ NO direct BigQuery queries from frontend
- ✅ Dataset abstraction layer
- ✅ Intelligent caching (Supabase)
- ✅ Backend handles ALL data logic

---

## 📊 CURRENT STATE (What's Already Done)

### ✅ Infrastructure Complete:

**1. Dataset Registered:**
- Dataset ID: `172bb891-5558-4a65-9b7d-d2ee6882284e`
- Table: `mcp-servers-475317.wpp_marketing.gsc_mindfulsteward_90days`
- Platform: GSC
- Schema: 9 columns detected (date, query, page, device, country, clicks, impressions, ctr, position)

**2. Data in BigQuery:**
- 9 rows currently (Oct 17-19, by device)
- Need to add: Full 87 days with all dimensions
- Have pulled: Daily data, top queries, top pages, device/country breakdowns

**3. Test Dashboard Created:**
- Dashboard ID: `c76c5a07-68ec-4320-b3cb-3e8ad2a07af7`
- Has: 2 scorecards (clicks, impressions)
- Status: ✅ Working with REAL data from cache!

**4. Backend APIs Working:**
- ✅ `POST /api/datasets/register` - Register BigQuery tables
- ✅ `GET /api/datasets/[id]/query` - Query with caching
- ✅ `GET /api/metadata/platforms` - List platforms
- ✅ Platform metadata loaded (gsc.json)

**5. Frontend Components Ready:**
- ✅ Scorecard.tsx - Dataset-based
- ✅ TimeSeriesChart.tsx - Dataset-based
- ✅ TableChart.tsx - Dataset-based
- ✅ PieChart.tsx - Dataset-based

---

## 🔧 HOW TO BUILD THE COMPLETE DASHBOARD

### Step 1: Insert Full Dataset to BigQuery

**What We Have:**
- Daily aggregated data (87 days): ✅ Already pulled via MCP
- Top 10 queries: ✅ Already pulled
- Top 10 pages: ✅ Already pulled
- Device breakdown: ✅ Already pulled (9 rows in BigQuery)
- Country breakdown: ✅ Already pulled

**What We Need to Do:**
Pull GSC data with different dimension combinations and INSERT into BigQuery:

```typescript
// Query 1: Daily time series (for Row 4)
await mcp.query_search_analytics({
  property: 'sc-domain:themindfulsteward.com',
  startDate: '2025-07-25',
  endDate: '2025-10-23',
  dimensions: ['date'],
  rowLimit: 100
});
// → 87 rows, INSERT with (date, clicks, impressions, ctr, position)

// Query 2: Top queries (for Row 5 right table)
await mcp.query_search_analytics({
  property: 'sc-domain:themindfulsteward.com',
  startDate: '2025-07-25',
  endDate: '2025-10-23',
  dimensions: ['query'],
  rowLimit: 10
});
// → 10 rows, INSERT with (query, clicks, impressions, position)

// Query 3: Top pages (for Row 5 left table)
await mcp.query_search_analytics({
  property: 'sc-domain:themindfulsteward.com',
  startDate: '2025-07-25',
  endDate: '2025-10-23',
  dimensions: ['page'],
  rowLimit: 10
});
// → 10 rows, INSERT with (page, clicks, impressions, ctr)

// Query 4: Device breakdown (for Row 6 left pie) - ALREADY DONE ✅

// Query 5: Country breakdown (for Row 6 middle pie)
await mcp.query_search_analytics({
  property: 'sc-domain:themindfulsteward.com',
  startDate: '2025-07-25',
  endDate: '2025-10-23',
  dimensions: ['country'],
  rowLimit: 10
});
// → 10 rows, INSERT with (country, clicks)
```

**Note:** Since BigQuery table has fixed schema, we INSERT with NULLs for unused dimensions:
- Daily data: `(date, NULL, NULL, NULL, NULL, clicks, impressions, ctr, position)`
- Query data: `(NULL, query, NULL, NULL, NULL, clicks, impressions, NULL, position)`
- Page data: `(NULL, NULL, page, NULL, NULL, clicks, impressions, ctr, NULL)`
- Device data: `(date, NULL, NULL, device, NULL, clicks, impressions, ctr, position)` ✅ Already done
- Country data: `(NULL, NULL, NULL, NULL, country, clicks, impressions, NULL, NULL)`

**Total rows to insert:** ~120 rows (87 + 10 + 10 + 3 + 10)

### Step 2: Create Dashboard Configuration

**Use Supabase SQL or API:**

```sql
INSERT INTO dashboards (name, description, workspace_id, config)
VALUES (
  'MindfulSteward Organic Search Performance',
  'Comprehensive 90-day SEO dashboard with new dataset architecture',
  '945907d8-7e88-45c4-8fde-9db35d5f5ce2',
  '{
    "title": "MindfulSteward Organic Search Performance",
    "rows": [
      {
        "id": "row-1",
        "columns": [
          {
            "id": "col-1-1",
            "width": "3/4",
            "component": {
              "id": "header-title",
              "type": "title",
              "title": "🔍 MindfulSteward Organic Search Performance Report",
              "titleColor": "#ffffff",
              "titleBackgroundColor": "#191D63",
              "titleFontSize": "28",
              "titleFontWeight": "700",
              "titleAlignment": "left",
              "padding": 20,
              "borderRadius": 8
            }
          },
          {
            "id": "col-1-2",
            "width": "1/4",
            "component": {
              "id": "header-date",
              "type": "title",
              "title": "📅 Last 3 Months",
              "titleColor": "#ffffff",
              "titleBackgroundColor": "#191D63",
              "titleFontSize": "16",
              "titleFontWeight": "600",
              "titleAlignment": "right",
              "padding": 20,
              "borderRadius": 8
            }
          }
        ]
      },
      {
        "id": "row-2",
        "columns": [
          {
            "id": "col-2-1",
            "width": "1/1",
            "component": {
              "id": "description",
              "type": "title",
              "title": "📄 About This Report\\n\\nThis dashboard provides comprehensive SEO performance for MindfulSteward.com over the past 3 months. Data from Google Search Console includes:\\n • Search impressions and clicks across all pages\\n • Average position in search results\\n • Click-through rates by query, page, device, geography\\n • Performance trends and top-performing content",
              "titleColor": "#5f6368",
              "titleBackgroundColor": "#f8f9fa",
              "titleFontSize": "14",
              "titleFontWeight": "400",
              "titleAlignment": "left",
              "padding": 24,
              "borderRadius": 8
            }
          }
        ]
      },
      {
        "id": "row-3",
        "columns": [
          {
            "id": "col-3-1",
            "width": "1/4",
            "component": {
              "id": "scorecard-impressions",
              "type": "scorecard",
              "title": "Total Impressions",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "metrics": ["impressions"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16,
              "chartColors": ["#191D63"]
            }
          },
          {
            "id": "col-3-2",
            "width": "1/4",
            "component": {
              "id": "scorecard-clicks",
              "type": "scorecard",
              "title": "Total Clicks",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "metrics": ["clicks"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16,
              "chartColors": ["#1E8E3E"]
            }
          },
          {
            "id": "col-3-3",
            "width": "1/4",
            "component": {
              "id": "scorecard-position",
              "type": "scorecard",
              "title": "Avg Position",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "metrics": ["position"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16,
              "chartColors": ["#fac858"]
            }
          },
          {
            "id": "col-3-4",
            "width": "1/4",
            "component": {
              "id": "scorecard-ctr",
              "type": "scorecard",
              "title": "Click-Through Rate",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "metrics": ["ctr"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16,
              "chartColors": ["#ee6666"]
            }
          }
        ]
      },
      {
        "id": "row-4",
        "columns": [
          {
            "id": "col-4-1",
            "width": "1/1",
            "component": {
              "id": "timeseries-performance",
              "type": "time_series",
              "title": "Performance Trend - Last 3 Months",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "dimension": "date",
              "metrics": ["clicks", "impressions"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "showLegend": true,
              "chartColors": ["#191D63", "#1E8E3E"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 20,
              "titleFontSize": "18",
              "titleFontWeight": "600"
            }
          }
        ]
      },
      {
        "id": "row-5",
        "columns": [
          {
            "id": "col-5-1",
            "width": "1/2",
            "component": {
              "id": "table-pages",
              "type": "table",
              "title": "Top Landing Pages",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "dimension": "page",
              "metrics": ["clicks", "impressions", "ctr"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16,
              "titleFontSize": "16",
              "titleFontWeight": "600"
            }
          },
          {
            "id": "col-5-2",
            "width": "1/2",
            "component": {
              "id": "table-queries",
              "type": "table",
              "title": "Top Search Queries",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "dimension": "query",
              "metrics": ["clicks", "impressions", "position"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16,
              "titleFontSize": "16",
              "titleFontWeight": "600"
            }
          }
        ]
      },
      {
        "id": "row-6",
        "columns": [
          {
            "id": "col-6-1",
            "width": "1/2",
            "component": {
              "id": "pie-device",
              "type": "pie_chart",
              "title": "Traffic by Device",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "dimension": "device",
              "metrics": ["clicks"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "showLegend": true,
              "chartColors": ["#191D63", "#1E8E3E", "#fac858"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16
            }
          },
          {
            "id": "col-6-2",
            "width": "1/2",
            "component": {
              "id": "pie-country",
              "type": "pie_chart",
              "title": "Traffic by Country",
              "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
              "dimension": "country",
              "metrics": ["clicks"],
              "dateRange": ["2025-07-25", "2025-10-23"],
              "showLegend": true,
              "chartColors": ["#191D63", "#1E8E3E", "#fac858", "#ee6666", "#73c0de"],
              "backgroundColor": "#ffffff",
              "showBorder": true,
              "borderRadius": 8,
              "padding": 16
            }
          },
        ]
      }
    ],
    "theme": {
      "primaryColor": "#191D63",
      "backgroundColor": "#ffffff",
      "textColor": "#111827",
      "borderColor": "#e5e7eb"
    }
  }'::jsonb
)
RETURNING id;
```

---

## 🎯 NEW ARCHITECTURE SPECIFICS (Critical for Building)

### Component Configuration (NEW FORMAT):

**OLD (Cube.js - DEPRECATED):**
```json
{
  "type": "scorecard",
  "datasource": "GscPerformance7days",
  "metrics": ["GscPerformance7days.impressions"],
  "dateRange": {
    "dimension": "GscPerformance7days.date",
    "dateRange": "last 90 days"
  }
}
```

**NEW (Dataset-Based - USE THIS):**
```json
{
  "type": "scorecard",
  "dataset_id": "172bb891-5558-4a65-9b7d-d2ee6882284e",
  "metrics": ["impressions"],
  "dateRange": ["2025-07-25", "2025-10-23"]
}
```

**Key Differences:**
- ❌ NO `datasource` property
- ❌ NO cube name prefix (no `GscPerformance7days.clicks`)
- ✅ `dataset_id` links to registered dataset
- ✅ Simple metric names (`clicks`, not `GscPerformance7days.clicks`)
- ✅ DateRange is simple array `[start, end]`

### How Charts Fetch Data:

**Scorecard Component:**
```typescript
// Component receives props:
{
  dataset_id: "172bb891-5558-4a65-9b7d-d2ee6882284e",
  metrics: ["clicks"],
  dateRange: ["2025-07-25", "2025-10-23"]
}

// Component builds URL:
GET /api/datasets/172bb891-5558-4a65-9b7d-d2ee6882284e/query
  ?metrics=clicks
  &dateRange=["2025-07-25","2025-10-23"]

// Backend:
1. Checks dataset_cache for query_hash
2. If cached & fresh: Returns cached data
3. If stale: Queries BigQuery, caches result, returns

// Response:
{
  "data": [{ "clicks": 6268 }],
  "cached": true
}

// Component renders: "6,268"
```

**TimeSeriesChart Component:**
```typescript
// Props:
{
  dataset_id: "172bb891-5558-4a65-9b7d-d2ee6882284e",
  dimension: "date",
  metrics: ["clicks", "impressions"],
  dateRange: ["2025-07-25", "2025-10-23"]
}

// Fetches:
GET /api/datasets/{id}/query
  ?dimensions=date
  &metrics=clicks,impressions
  &dateRange=["2025-07-25","2025-10-23"]

// Gets back:
{
  "data": [
    { "date": "2025-07-25", "clicks": 68, "impressions": 13520 },
    { "date": "2025-07-26", "clicks": 61, "impressions": 15921 },
    ...87 rows
  ]
}

// Renders line chart with 87 data points
```

**TableChart Component:**
```typescript
// Props:
{
  dataset_id: "...",
  dimension: "query",
  metrics: ["clicks", "impressions", "position"]
}

// Fetches:
GET /api/datasets/{id}/query
  ?dimensions=query
  &metrics=clicks,impressions,position

// Gets top 10 queries with metrics, renders table
```

**PieChart Component:**
```typescript
// Props:
{
  dataset_id: "...",
  dimension: "device",
  metrics: ["clicks"]
}

// Fetches:
GET /api/datasets/{id}/query
  ?dimensions=device
  &metrics=clicks

// Gets: [
//   { "device": "MOBILE", "clicks": 3975 },
//   { "device": "DESKTOP", "clicks": 2144 },
//   { "device": "TABLET", "clicks": 149 }
// ]

// Renders pie chart with 3 slices
```

---

## 📋 STEP-BY-STEP BUILD PROCESS

### Phase 1: Data Preparation (20 min)

**Task:** Pull and insert all dimension combinations

```bash
# 1. Pull daily data (already have from earlier)
# 2. Pull top 10 queries (already have)
# 3. Pull top 10 pages (already have)
# 4. Pull country breakdown (already have)

# 5. Create batched INSERT statements
# 6. Execute via: mcp.run_bigquery_query(`INSERT INTO ...`)
```

**Result:** ~120 rows in `gsc_mindfulsteward_90days` table

### Phase 2: Dashboard Creation (10 min)

**Task:** Insert dashboard config into Supabase

**Method 1: SQL (Direct)**
```sql
INSERT INTO dashboards (...) VALUES (...) RETURNING id;
```

**Method 2: Script (Programmatic)**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data } = await supabase
  .from('dashboards')
  .insert([{ name: '...', config: {...} }])
  .select()
  .single();

console.log('Dashboard ID:', data.id);
```

**Result:** Dashboard ID (UUID)

### Phase 3: Testing (10 min)

**Task:** Navigate and verify

```bash
# 1. Navigate to: http://localhost:3000/dashboard/{ID}/builder
# 2. Check dev server logs for:
#    - [Dataset Query] Cache HIT/MISS
#    - [BigQuery] Query completed
# 3. Verify all 11 components render
# 4. Check no console errors
# 5. Take screenshot
```

**Expected Result:** All 6 rows visible, all charts showing REAL data

---

## 🔑 KEY TECHNICAL DETAILS

### Dataset API Query Parameters:

**Format:**
```
GET /api/datasets/{dataset_id}/query
  ?metrics=comma,separated,metrics
  &dimensions=comma,separated,dimensions
  &dateRange=["YYYY-MM-DD","YYYY-MM-DD"]
  &limit=1000
```

**Examples:**
```
# Scorecard (no dimensions, just aggregated total)
?metrics=clicks

# Time series (date dimension)
?metrics=clicks,impressions&dimensions=date

# Table (dimension + metrics)
?metrics=clicks,impressions,ctr&dimensions=query

# Pie chart (dimension breakdown)
?metrics=clicks&dimensions=device
```

### Component Props Mapping:

**Every chart component expects:**
```typescript
{
  dataset_id: string,        // UUID of registered dataset
  metrics: string[],         // ['clicks', 'impressions']
  dimension?: string,        // 'date', 'query', 'page', etc. (optional for scorecards)
  dateRange?: [string, string], // ['2025-07-25', '2025-10-23']

  // Plus all styling props:
  title, backgroundColor, showBorder, etc.
}
```

### Caching Behavior:

**First Request:**
```
Component → API → Check cache (MISS)
  ↓
Query BigQuery (cost: ~$0.001)
  ↓
Store in dataset_cache
  ↓
Return data
```

**Subsequent Requests (within refresh_interval):**
```
Component → API → Check cache (HIT)
  ↓
Return cached data (cost: $0)
```

**Cache expires:** After `refresh_interval_days` (default: 1 day)

---

## 🚀 READY TO EXECUTE

**What's Already Working:**
1. ✅ Dataset registered (ID: `172bb891-5558-4a65-9b7d-d2ee6882284e`)
2. ✅ Sample data in BigQuery (9 rows)
3. ✅ Dataset query API working with caching
4. ✅ All 4 chart components ready
5. ✅ Test dashboard showing 2 scorecards with REAL data

**What's Needed:**
1. Insert full 90-day data (all dimensions)
2. Create complete 6-row dashboard config
3. Insert into Supabase
4. Navigate and verify
5. Screenshot

**Estimated Time:** 40 minutes

**Token Budget:** 354k remaining (plenty!)

---

## 📝 IMPORTANT DATA WE ALREADY HAVE

### From Earlier MCP Queries:

**Daily Time Series (87 days):**
- Date range: 2025-07-25 to 2025-10-23
- Total: 6,268 clicks, 954,034 impressions
- Avg CTR: 0.66%, Avg Position: 20.5

**Top 10 Queries:**
1. meditation guru - 114 clicks, position 2.7
2. meditation tools - 110 clicks, position 4.3
3. types of meditation - 70 clicks, position 9.6
4. meditation teachers - 53 clicks, position 2.3
5. different types of meditation - 27 clicks, position 8.1
6. famous meditation teachers - 27 clicks, position 2.9
7. tantric meditation - 27 clicks, position 8.6
8. top 10 meditation gurus - 27 clicks, position 2.0
9. tantra meditation - 26 clicks, position 10.3
10. meditation teacher - 24 clicks, position 6.8

**Top 10 Pages:**
1. /16-of-the-most-respected-mindfulness-teachers/ - 1,703 clicks, 2.35% CTR
2. /23-meditation-techniques/ - 488 clicks, 0.49% CTR
3. /connect-with-your-higher-self/ - 370 clicks, 0.57% CTR
4. /how-to-use-affirmations/ - 328 clicks, 0.81% CTR
5. /top-10-meditations-for-children/ - 313 clicks, 1.18% CTR
6. /helpful-tools-for-beginner-meditators/ - 304 clicks, 1.90% CTR
7. /top-ten-youtube-meditations-honest-guys/ - 157 clicks, 0.41% CTR
8. /andrew-hubermans-morning-routine/ - 149 clicks, 0.72% CTR
9. /celebrities-who-meditate/ - 143 clicks, 1.40% CTR
10. /jason-stephenson-meditations/ - 130 clicks, 0.42% CTR

**Device Breakdown:**
- MOBILE: 3,975 clicks (63.4%)
- DESKTOP: 2,144 clicks (34.2%)
- TABLET: 149 clicks (2.4%)

**Country Breakdown:**
1. USA: 2,025 clicks (32.3%)
2. India: 724 clicks (11.5%)
3. UK: 487 clicks (7.8%)
4. Canada: 473 clicks (7.5%)
5. Australia: 373 clicks (6.0%)
6. Others: ~2,186 clicks (34.9%)

---

## 🎯 EXECUTION CHECKLIST

When you build this dashboard:

- [ ] Insert daily time series data (87 rows)
- [ ] Insert top 10 queries data
- [ ] Insert top 10 pages data
- [ ] Insert country breakdown data (device already done)
- [ ] Create dashboard with exact 6-row config above
- [ ] Navigate to dashboard URL
- [ ] Verify Row 1: Header shows (blue backgrounds, white text)
- [ ] Verify Row 2: Description shows (gray background)
- [ ] Verify Row 3: 4 scorecards show real numbers
- [ ] Verify Row 4: Time series chart renders 87-day trend
- [ ] Verify Row 5: 2 tables show top 10 each
- [ ] Verify Row 6: 3 pie charts show distributions
- [ ] Check browser console (no errors)
- [ ] Check server logs (queries cached)
- [ ] Take full-page screenshot

---

## 📸 SUCCESS CRITERIA

**Screenshot should show:**
- Professional WPP-branded header
- All 11 components visible
- REAL data in every chart (no "Setup Required", no placeholders)
- Clean, Looker Studio-quality interface
- No errors or warnings

**This proves:** Agents can build complex dashboards using the new dataset architecture with simple API calls and declarative configs.

---

**Ready to build:** Everything is prepared. Just execute the steps above and the complete dashboard will render with real MindfulSteward data!
