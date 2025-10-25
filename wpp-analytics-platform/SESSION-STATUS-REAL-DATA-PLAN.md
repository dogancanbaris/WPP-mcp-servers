# Session Status: Real Data Integration for MindfulSteward Dashboard

**Date:** 2025-10-23
**Session End Token Usage:** ~310k/1M
**Status:** OAuth configured, ready to pull real data after MCP server restart

---

## ✅ COMPLETED

### 1. OAuth Token Refresh (DONE ✅)
- **Created:** `refresh-oauth-token.cjs` script
- **Executed:** Successfully refreshed access token
- **New Token:** Saved to `/home/dogancanbaris/projects/MCP Servers/config/gsc-tokens.json`
- **Expires:** 2025-10-23T22:02:17 (6 hours validity)

### 2. MCP Server OAuth Injection (DONE ✅)
- **Modified:** `src/shared/oauth-client-factory.ts` lines 145-163
- **Change:** `extractOAuthToken()` now loads token from file if `__oauthToken` not provided
- **Temporary Hack:** Until OMA connected, reads from `config/gsc-tokens.json`
- **Rebuilt:** `npm run build` completed successfully
- **Compiled:** Changes visible in `dist/shared/oauth-client-factory.js` lines 124-142

###3. Fixed TitleComponent Bug (DONE ✅)
- **Modified:** `frontend/src/components/dashboard-builder/ChartWrapper.tsx` lines 331-340
- **Fixed:** Maps `config.title` → `text` prop for TitleComponent
- **Result:** Dell dashboard now shows proper blue headers instead of "Add title here..."

### 4. Fixed Column Rendering Bug (DONE ✅)
- **Modified:** `frontend/src/components/dashboard-builder/Column.tsx` line 87
- **Fixed:** Renders `<ChartWrapper>` instead of `<ComponentPlaceholder>`
- **Result:** Actual charts render instead of placeholder badges

---

## ⚠️ REQUIRES RESTART

**Action Needed:** Restart Claude Code to reload MCP server with new OAuth code

**After Restart, MCP Tools Will Work:**
- `list_properties` - List all GSC properties you have access to
- `query_search_analytics` - Pull GSC data
- `run_bigquery_query` - Insert data into BigQuery
- All tools will automatically use token from `config/gsc-tokens.json`

---

## 📋 REMAINING TASKS

### Phase 1: Remove Mock Data Code

**Delete Files:**
1. `frontend/src/lib/demo/dell-mock-data.ts`

**Revert Demo Mode Code in Charts:**
1. `frontend/src/components/dashboard-builder/charts/Scorecard.tsx`
   - Remove line 10: `import { isDemoMode, getMockMetric } from '@/lib/demo/dell-mock-data';`
   - Remove lines 132-154: Demo mode check + console logs
   - Remove lines 156-187: Demo mode render block

2. `frontend/src/components/dashboard-builder/charts/TimeSeriesChart.tsx`
   - Remove line 12: `import { isDemoMode, getMockTimeSeries } from '@/lib/demo/dell-mock-data';`
   - Remove lines 59-132: Entire demo mode block

3. `frontend/src/components/dashboard-builder/charts/TableChart.tsx`
   - Remove line 9: `import { isDemoMode, getMockTableData } from '@/lib/demo/dell-mock-data';`
   - Remove lines 70, 80-82: Demo mode variables

4. `frontend/src/components/dashboard-builder/charts/PieChart.tsx`
   - Remove line 31: `import { isDemoMode, getMockPieData } from '@/lib/demo/dell-mock-data';`
   - Remove lines 103-106: Demo mode variables
   - Remove line 142: `mockPieData ||` from chartData assignment

**Remove Debug Logging:**
1. `frontend/src/components/dashboard-builder/ChartWrapper.tsx` - Remove lines 103-109
2. `frontend/src/components/dashboard-builder/charts/Scorecard.tsx` - Remove console.log statements

---

### Phase 2: Pull MindfulSteward GSC Data

**Step 1:** List properties to find MindfulSteward property URL
```javascript
await mcp__wpp-digital-marketing__list_properties();
```

**Step 2:** Query 90 days of data
```javascript
await mcp__wpp-digital-marketing__query_search_analytics({
  property: 'sc-domain:mindfulsteward.com', // or actual property URL
  startDate: '2025-07-25',
  endDate: '2025-10-23',
  dimensions: ['date', 'query', 'page', 'device', 'country'],
  rowLimit: 25000
});
```

**Data Structure Expected:**
```
{
  rows: [
    {
      keys: ['2025-07-25', 'mindfulness meditation', '/blog/meditation', 'MOBILE', 'US'],
      clicks: 45,
      impressions: 1230,
      ctr: 0.0366,
      position: 8.2
    },
    // ... up to 25,000 rows
  ]
}
```

---

### Phase 3: Load into BigQuery

**Step 3:** Create BigQuery table
```sql
CREATE OR REPLACE TABLE `mcp-servers-475317.wpp_marketing.gsc_mindfulsteward_90days` (
  date DATE,
  query STRING,
  page STRING,
  device STRING,
  country STRING,
  clicks INT64,
  impressions INT64,
  ctr FLOAT64,
  position FLOAT64
);
```

**Step 4:** Insert rows (batch INSERT)
Parse GSC response and build INSERT statement for all rows.

---

### Phase 4: Configure Cube.js

**Step 5:** Create schema file
**File:** `cube-backend/schema/GscMindfulsteward90days.js`

```javascript
cube(`GscMindfulsteward90days`, {
  sql: `SELECT * FROM \`mcp-servers-475317.wpp_marketing.gsc_mindfulsteward_90days\``,

  measures: {
    clicks: {
      sql: `clicks`,
      type: `sum`,
      title: `Total Clicks`
    },
    impressions: {
      sql: `impressions`,
      type: `sum`,
      title: `Total Impressions`
    },
    avgCtr: {
      sql: `ctr`,
      type: `avg`,
      title: `Average CTR`,
      format: `percent`
    },
    avgPosition: {
      sql: `position`,
      type: `avg`,
      title: `Average Position`
    }
  },

  dimensions: {
    date: {
      sql: `CAST(date AS TIMESTAMP)`,
      type: `time`
    },
    query: {
      sql: `query`,
      type: `string`
    },
    page: {
      sql: `page`,
      type: `string`
    },
    device: {
      sql: `device`,
      type: `string`
    },
    country: {
      sql: `country`,
      type: `string`
    }
  }
});
```

**Step 6:** Start Cube.js server
```bash
cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/cube-backend
npm run dev
```

Expected output: `🚀 Cube.js server is listening on 4000`

**Step 7:** Update frontend .env
```
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=<from cube-backend/.env>
```

---

### Phase 5: Create MindfulSteward Dashboard

**Step 8:** Create dashboard in Supabase (via script or MCP tool)

**Dashboard Config:**
```javascript
{
  title: 'MindfulSteward Organic Search Performance',
  rows: [
    // Row 1: Header
    { columns: [
      { width: '3/4', component: {
        type: 'title',
        title: '🔍 MindfulSteward Organic Search Performance',
        titleColor: '#ffffff',
        titleBackgroundColor: '#191D63', // WPP Blue
        titleFontSize: '28',
        titleFontWeight: '700',
        padding: 20,
        borderRadius: 8
      }},
      { width: '1/4', component: {
        type: 'title',
        title: '📅 Last 3 Months',
        titleColor: '#ffffff',
        titleBackgroundColor: '#191D63',
        titleFontSize: '16',
        titleFontWeight: '600',
        titleAlignment: 'right',
        padding: 20,
        borderRadius: 8
      }}
    ]},

    // Row 2: Description
    { columns: [{ width: '1/1', component: {
      type: 'title',
      title: '📄 About This Report\n\nThis dashboard provides comprehensive SEO performance for MindfulSteward...',
      titleColor: '#5f6368',
      titleBackgroundColor: '#f8f9fa',
      titleFontSize: '14',
      padding: 24,
      borderRadius: 8
    }}]},

    // Row 3: 4 Scorecards
    { columns: [
      { width: '1/4', component: {
        type: 'scorecard',
        title: 'Total Impressions',
        metrics: ['GscMindfulsteward90days.impressions'],
        dateRange: {
          dimension: 'GscMindfulsteward90days.date',
          dateRange: 'last 90 days'
        },
        backgroundColor: '#ffffff',
        showBorder: true,
        borderRadius: 8,
        padding: 16
      }},
      { width: '1/4', component: {
        type: 'scorecard',
        title: 'Total Clicks',
        metrics: ['GscMindfulsteward90days.clicks'],
        dateRange: {
          dimension: 'GscMindfulsteward90days.date',
          dateRange: 'last 90 days'
        }
      }},
      { width: '1/4', component: {
        type: 'scorecard',
        title: 'Avg Position',
        metrics: ['GscMindfulsteward90days.avgPosition'],
        dateRange: {
          dimension: 'GscMindfulsteward90days.date',
          dateRange: 'last 90 days'
        }
      }},
      { width: '1/4', component: {
        type: 'scorecard',
        title: 'CTR',
        metrics: ['GscMindfulsteward90days.avgCtr'],
        dateRange: {
          dimension: 'GscMindfulsteward90days.date',
          dateRange: 'last 90 days'
        }
      }}
    ]},

    // Row 4: Time Series
    { columns: [{ width: '1/1', component: {
      type: 'time_series',
      title: 'Performance Trend - Last 3 Months',
      dimension: 'GscMindfulsteward90days.date',
      metrics: ['GscMindfulsteward90days.clicks', 'GscMindfulsteward90days.impressions'],
      dateRange: {
        dimension: 'GscMindfulsteward90days.date',
        granularity: 'day',
        dateRange: 'last 90 days'
      },
      showLegend: true,
      chartColors: ['#191D63', '#1E8E3E']
    }}]},

    // Row 5: Tables
    { columns: [
      { width: '1/2', component: {
        type: 'table',
        title: 'Top Landing Pages',
        dimension: 'GscMindfulsteward90days.page',
        metrics: ['GscMindfulsteward90days.clicks', 'GscMindfulsteward90days.impressions', 'GscMindfulsteward90days.avgCtr']
      }},
      { width: '1/2', component: {
        type: 'table',
        title: 'Top Search Queries',
        dimension: 'GscMindfulsteward90days.query',
        metrics: ['GscMindfulsteward90days.clicks', 'GscMindfulsteward90days.impressions', 'GscMindfulsteward90days.avgPosition']
      }}
    ]},

    // Row 6: Pie Charts
    { columns: [
      { width: '1/3', component: {
        type: 'pie_chart',
        title: 'Traffic by Device',
        dimension: 'GscMindfulsteward90days.device',
        metrics: ['GscMindfulsteward90days.clicks']
      }},
      { width: '1/3', component: {
        type: 'pie_chart',
        title: 'Traffic by Country',
        dimension: 'GscMindfulsteward90days.country',
        metrics: ['GscMindfulsteward90days.clicks']
      }},
      { width: '1/3', component: {
        type: 'pie_chart',
        title: 'Content Category',
        dimension: 'GscMindfulsteward90days.page',
        metrics: ['GscMindfulsteward90days.clicks']
      }}
    ]}
  ]
}
```

---

## 🔧 FILES MODIFIED THIS SESSION

### Modified (OAuth Injection):
1. `src/shared/oauth-client-factory.ts` - Lines 145-163
2. Rebuilt to: `dist/shared/oauth-client-factory.js` - Lines 124-142

### Modified (Bug Fixes - KEEP THESE):
1. `frontend/src/components/dashboard-builder/ChartWrapper.tsx` - Lines 331-340 (TitleComponent prop mapping)
2. `frontend/src/components/dashboard-builder/Column.tsx` - Line 87 (Render ChartWrapper instead of placeholder)

### Created (Utilities):
1. `refresh-oauth-token.cjs` - OAuth token refresh script

### Created (Mock Data - TO BE DELETED):
1. `frontend/src/lib/demo/dell-mock-data.ts` - DELETE THIS

### Modified (Demo Mode - TO BE REVERTED):
1. `frontend/src/components/dashboard-builder/charts/Scorecard.tsx` - Lines 10, 132-187
2. `frontend/src/components/dashboard-builder/charts/TimeSeriesChart.tsx` - Lines 12, 59-132
3. `frontend/src/components/dashboard-builder/charts/TableChart.tsx` - Lines 9, 70, 80-82
4. `frontend/src/components/dashboard-builder/charts/PieChart.tsx` - Lines 31, 103-106, 142

### Created (Debug Logging - TO BE REMOVED):
1. ChartWrapper.tsx - Lines 103-109
2. Scorecard.tsx - Console.log statements

---

## 🚀 NEXT SESSION STEPS

### IMMEDIATE (After Claude Code Restart):

**Step 1:** Test OAuth works
```javascript
mcp__wpp-digital-marketing__list_properties()
```
Should return list of properties including MindfulSteward

**Step 2:** Find Mind fulSteward property URL
Look for property like:
- `sc-domain:mindfulsteward.com`
- `sc-https://mindfulsteward.com/`
- `sc-https://www.mindfulsteward.com/`

**Step 3:** Pull 90 days of GSC data
```javascript
mcp__wpp-digital-marketing__query_search_analytics({
  property: '<mindfulsteward_property_url>',
  startDate: '2025-07-25',
  endDate: '2025-10-23',
  dimensions: ['date', 'query', 'page', 'device', 'country'],
  rowLimit: 25000
})
```

**Step 4:** Create BigQuery table and insert data
Use `run_bigquery_query` for both CREATE TABLE and INSERT

**Step 5:** Create Cube.js schema
Copy `GscPerformance7days.js` to `GscMindfulsteward90days.js` and update table reference

**Step 6:** Start Cube.js backend
```bash
cd cube-backend && npm run dev
```

**Step 7:** Create MindfulSteward dashboard with proper Cube.js queries

**Step 8:** Verify all charts render with REAL data

**Step 9:** Take screenshot for leadership

---

## 🐛 Known Issues Still To Fix

### Issue: Scorecards Rendered But Not Visible
**Evidence from today:**
- Console logs show: "Demo mode ACTIVE", "willRender: true"
- DOM inspection found value "9,255,898" exists
- Element has proper height (150px container)
- BUT positioned at `top: -737px` (ABOVE viewport)

**Root Cause:** Likely CSS issue with row/column layout positioning

**Fix:** Once mock data removed and real Cube.js data flows, need to check if this CSS issue persists

---

## 📊 Architecture Confirmed

### Data Flow (Proper Way):
```
Google Search Console API
  ↓ (MCP Tool with OAuth)
BigQuery Table
  ↓ (Cube.js semantic layer)
Frontend Components
  ↓ (ECharts/Recharts)
Beautiful Visualizations
```

### Cube.js Query Format (Frontend):
```javascript
// Scorecard
{
  measures: ['GscMindfulsteward90days.impressions'],
  timeDimensions: [{
    dimension: 'GscMindfulsteward90days.date',
    dateRange: 'last 90 days'
  }]
}

// Time Series
{
  measures: ['GscMindfulsteward90days.clicks', 'GscMindfulsteward90days.impressions'],
  timeDimensions: [{
    dimension: 'GscMindfulsteward90days.date',
    granularity: 'day',
    dateRange: 'last 90 days'
  }]
}

// Table
{
  dimensions: ['GscMindfulsteward90days.query'],
  measures: ['GscMindfulsteward90days.clicks'],
  order: { 'GscMindfulsteward90days.clicks': 'desc' },
  limit: 10
}

// Pie Chart
{
  dimensions: ['GscMindfulsteward90days.device'],
  measures: ['GscMindfulsteward90days.clicks']
}
```

---

## ✅ What's Ready

- ✅ OAuth token refreshed and injected
- ✅ MCP server compiled with OAuth hack
- ✅ Cube.js schema template exists
- ✅ Frontend components work (title bug fixed)
- ✅ Chart rendering bug fixed (ChartWrapper in Column)
- ✅ BigQuery project exists: `mcp-servers-475317`
- ✅ Cube.js backend exists and configured

---

## 🎯 Expected Timeline

- Remove mock data: 10 min
- Pull GSC data: 5 min
- Load to BigQuery: 10 min
- Configure Cube.js: 5 min
- Create dashboard: 10 min
- Test & screenshot: 10 min

**Total: ~50 minutes to real data dashboard**

---

## 📝 Notes for Next Session

1. **Restart Claude Code first** - MCP server needs reload
2. **Test `list_properties` immediately** - Verify OAuth works
3. **Once data is in BigQuery,** all components should "just work" via Cube.js
4. **No frontend calculations** - Cube.js handles all aggregation
5. **Same beautiful layout** - Just swap datasource from mock to real
