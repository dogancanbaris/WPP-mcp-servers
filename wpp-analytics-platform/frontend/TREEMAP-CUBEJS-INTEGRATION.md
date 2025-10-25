# TreemapChart - Cube.js Integration Documentation

## Overview

The TreemapChart component is now fully connected to Cube.js semantic layer, enabling real-time hierarchical data visualization from BigQuery through the WPP Analytics Platform.

**File:** `/frontend/src/components/dashboard-builder/charts/TreemapChart.tsx`

---

## Key Features

### 1. Cube.js Integration
- **Direct Query Execution**: Uses `useCubeQuery` hook from `@cubejs-client/react`
- **Token-Efficient**: Aggregates data in Cube.js before rendering
- **Real-Time**: Automatic query refresh when props change
- **Error Handling**: Loading, error, and empty states

### 2. Hierarchical Data Support
- **Single Dimension**: Flat treemap (e.g., clicks by device)
- **Two Dimensions**: Hierarchical structure (e.g., country > device)
- **Automatic Hierarchy Building**: Calculates parent values as sum of children

### 3. Metric Formatting
- **Auto-formatting**: Number, percent, currency, duration formats
- **Compact Notation**: 1.2K, 3.5M for large numbers
- **Configurable Decimals**: Control precision per metric
- **Rich Text Labels**: Styled name and value display

### 4. Responsive & Interactive
- **Zoom Navigation**: Click to zoom into nodes
- **Breadcrumbs**: Navigate back up hierarchy
- **Tooltips**: Hover for detailed metric values
- **Color Schemes**: Customizable color palettes

---

## Architecture

### Data Flow
```
BigQuery → Cube.js Semantic Layer → useCubeQuery Hook → TreemapChart → ECharts
```

### Component Structure
```typescript
TreemapChart
├── Props (ComponentConfig)
│   ├── datasource: string (e.g., 'gsc_performance_7days')
│   ├── dimension: string (primary grouping)
│   ├── breakdownDimension: string | null (optional hierarchy)
│   ├── metrics: string[] (first metric used for size)
│   └── metricsConfig: MetricStyleConfig[] (formatting)
│
├── useCubeQuery()
│   ├── Query Config
│   │   ├── measures: [metrics]
│   │   ├── dimensions: [dimension, breakdownDimension]
│   │   └── filters: [FilterConfig[]]
│   └── Returns
│       ├── resultSet: CubeQueryResult
│       ├── isLoading: boolean
│       └── error: Error | null
│
├── buildTreemapData()
│   ├── Single Dimension → Flat structure
│   └── Two Dimensions → Hierarchical structure
│
└── ReactECharts
    └── option: EChartsOption (treemap config)
```

---

## Usage Examples

### Example 1: Single Dimension - Device Distribution
```tsx
<TreemapChart
  datasource="gsc_performance_7days"
  dimension="GscPerformance.device"
  metrics={['GscPerformance.clicks']}
  title="Clicks by Device Type"
  metricsConfig={[{
    id: 'GscPerformance.clicks',
    format: 'number',
    decimals: 0,
    compact: true
  }]}
/>
```

**Cube.js Query Generated:**
```javascript
{
  measures: ['GscPerformance.clicks'],
  dimensions: ['GscPerformance.device']
}
```

**Result Structure:**
```javascript
[
  { name: 'MOBILE', value: 45000 },
  { name: 'DESKTOP', value: 38000 },
  { name: 'TABLET', value: 7000 }
]
```

---

### Example 2: Hierarchical - Country > Device
```tsx
<TreemapChart
  datasource="gsc_performance_7days"
  dimension="GscPerformance.country"
  breakdownDimension="GscPerformance.device"
  metrics={['GscPerformance.impressions']}
  title="Impressions by Country and Device"
  metricsConfig={[{
    id: 'GscPerformance.impressions',
    format: 'number',
    decimals: 0,
    compact: true
  }]}
/>
```

**Cube.js Query Generated:**
```javascript
{
  measures: ['GscPerformance.impressions'],
  dimensions: ['GscPerformance.country', 'GscPerformance.device']
}
```

**Result Structure:**
```javascript
[
  {
    name: 'United States',
    value: 150000, // Sum of children
    children: [
      { name: 'MOBILE', value: 85000 },
      { name: 'DESKTOP', value: 55000 },
      { name: 'TABLET', value: 10000 }
    ]
  },
  {
    name: 'United Kingdom',
    value: 75000,
    children: [
      { name: 'MOBILE', value: 45000 },
      { name: 'DESKTOP', value: 28000 },
      { name: 'TABLET', value: 2000 }
    ]
  }
]
```

---

### Example 3: With Filters - Mobile Only
```tsx
<TreemapChart
  datasource="gsc_performance_7days"
  dimension="GscPerformance.page"
  metrics={['GscPerformance.clicks']}
  filters={[
    {
      field: 'GscPerformance.device',
      operator: 'equals',
      values: ['MOBILE']
    }
  ]}
  title="Top Pages - Mobile Traffic"
/>
```

**Cube.js Query Generated:**
```javascript
{
  measures: ['GscPerformance.clicks'],
  dimensions: ['GscPerformance.page'],
  filters: [
    {
      member: 'GscPerformance.device',
      operator: 'equals',
      values: ['MOBILE']
    }
  ]
}
```

---

### Example 4: Percentage Metric (CTR)
```tsx
<TreemapChart
  datasource="gsc_queries"
  dimension="GscQueries.query"
  metrics={['GscQueries.ctr']}
  title="CTR by Search Query"
  metricsConfig={[{
    id: 'GscQueries.ctr',
    format: 'percent',
    decimals: 2,
    compact: false
  }]}
/>
```

**Display Format:**
- Value: 0.0532 → "5.32%"
- Tooltip: "5.32%"
- Label: "5.32%"

---

### Example 5: Google Ads Spend
```tsx
<TreemapChart
  datasource="google_ads_campaigns"
  dimension="GoogleAdsCampaigns.campaignName"
  metrics={['GoogleAdsCampaigns.cost']}
  title="Ad Spend by Campaign"
  metricsConfig={[{
    id: 'GoogleAdsCampaigns.cost',
    format: 'currency',
    decimals: 2,
    compact: true
  }]}
/>
```

**Display Format:**
- Value: 45832.67 → "$45.8K"
- Tooltip: "$45,832.67"
- Label: "$45.8K"

---

## Cube.js Data Models Required

### Google Search Console
```javascript
// model/GscPerformance.js
cube('GscPerformance', {
  sql: `SELECT * FROM \`project.dataset.gsc_performance\``,

  dimensions: {
    query: { sql: 'query', type: 'string' },
    page: { sql: 'page', type: 'string' },
    country: { sql: 'country', type: 'string' },
    device: { sql: 'device', type: 'string' },
    date: { sql: 'date', type: 'time' }
  },

  measures: {
    clicks: { sql: 'clicks', type: 'sum' },
    impressions: { sql: 'impressions', type: 'sum' },
    ctr: {
      sql: `SAFE_DIVIDE(SUM(clicks), SUM(impressions))`,
      type: 'number'
    },
    position: { sql: 'position', type: 'avg' }
  }
});
```

### Google Ads
```javascript
// model/GoogleAdsCampaigns.js
cube('GoogleAdsCampaigns', {
  sql: `SELECT * FROM \`project.dataset.google_ads_campaigns\``,

  dimensions: {
    campaignId: { sql: 'campaign_id', type: 'string', primaryKey: true },
    campaignName: { sql: 'campaign_name', type: 'string' },
    adGroupName: { sql: 'ad_group_name', type: 'string' },
    date: { sql: 'date', type: 'time' }
  },

  measures: {
    impressions: { sql: 'impressions', type: 'sum' },
    clicks: { sql: 'clicks', type: 'sum' },
    cost: { sql: 'cost', type: 'sum' },
    conversions: { sql: 'conversions', type: 'sum' },
    costPerConversion: {
      sql: `SAFE_DIVIDE(SUM(cost), SUM(conversions))`,
      type: 'number'
    }
  }
});
```

---

## Metric Formatting Options

### Format Types
```typescript
type MetricFormat = 'auto' | 'number' | 'percent' | 'currency' | 'duration';
```

### Format Examples
| Input Value | Format | Decimals | Compact | Output |
|------------|--------|----------|---------|--------|
| 1234567 | number | 0 | true | 1.2M |
| 1234567 | number | 0 | false | 1,234,567 |
| 0.0532 | percent | 2 | false | 5.32% |
| 45832.67 | currency | 2 | true | $45.8K |
| 45832.67 | currency | 2 | false | $45,832.67 |
| 3665 | duration | 0 | false | 1h 1m 5s |

---

## Performance Optimization

### Token-Efficient Queries
```typescript
// ❌ BAD: Load all raw data
{
  dimensions: ['GscPerformance.query'],
  measures: ['GscPerformance.clicks']
  // Returns 50,000+ rows
}

// ✅ GOOD: Aggregate and limit
{
  dimensions: ['GscPerformance.query'],
  measures: ['GscPerformance.clicks'],
  order: { 'GscPerformance.clicks': 'desc' },
  limit: 100  // Top 100 only
}
```

### Pre-Aggregations
```javascript
// Configure in Cube.js model for faster queries
preAggregations: {
  main: {
    measures: [clicks, impressions, cost],
    dimensions: [country, device],
    timeDimension: date,
    granularity: 'day',
    refreshKey: {
      every: '1 hour'
    }
  }
}
```

---

## Integration with Dashboard Builder

### Component Registration
```typescript
// src/components/dashboard-builder/ChartWrapper.tsx
case 'treemap':
  return <TreemapChart {...component} />;
```

### Available in Dashboard Builder
1. Drag "Treemap" component from sidebar
2. Configure data source (e.g., "GSC Performance")
3. Select primary dimension (e.g., "Device")
4. Optional: Select breakdown dimension (e.g., "Country")
5. Select metric (e.g., "Clicks")
6. Customize colors, title, formatting

---

## Environment Setup

### Required Environment Variables
```bash
# .env.local
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=your_cube_jwt_token
```

### Cube.js Server Configuration
```javascript
// cube.js
module.exports = {
  dbType: 'bigquery',
  externalDbType: 'bigquery',
  dbConfig: {
    projectId: process.env.BIGQUERY_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
};
```

---

## Testing

### Test Page
**Location:** `/frontend/src/app/test-treemap/page.tsx`

**Run Test:**
```bash
npm run dev
# Visit: http://localhost:3000/test-treemap
```

### Test Cases
1. Single dimension treemap
2. Hierarchical (2-level) treemap
3. Filtered data
4. Percentage format
5. Currency format
6. Empty state handling

---

## Troubleshooting

### Issue: "Cannot find module '@/lib/cubejs/client'"
**Solution:** Ensure Cube.js client is configured
```typescript
// src/lib/cubejs/client.ts
import cubejs from '@cubejs-client/core';

export const cubeApi = cubejs(
  process.env.NEXT_PUBLIC_CUBEJS_API_SECRET!,
  { apiUrl: process.env.NEXT_PUBLIC_CUBEJS_API_URL! }
);
```

### Issue: "No data displayed"
**Solution:** Check:
1. Cube.js server is running
2. Data model exists for datasource
3. Dimension/metric names match Cube.js schema
4. Query returns data (check browser DevTools → Network)

### Issue: "Chart renders but empty"
**Solution:** Verify:
1. `dimension` prop is not null
2. `metrics` array has at least one item
3. `resultSet.tablePivot()` returns data
4. Metric values are numeric (not null/undefined)

---

## Related Files

### Core Files
- `/frontend/src/components/dashboard-builder/charts/TreemapChart.tsx` - Main component
- `/frontend/src/lib/cubejs/client.ts` - Cube.js API client
- `/frontend/src/lib/cubejs/query-builder.ts` - Query builder utilities
- `/frontend/src/lib/cubejs/datasource-mapper.ts` - Datasource to cube mapping
- `/frontend/src/lib/utils/metric-formatter.ts` - Metric formatting logic

### Type Definitions
- `/frontend/src/types/dashboard-builder.ts` - ComponentConfig interface

### Test Files
- `/frontend/src/app/test-treemap/page.tsx` - Integration test page

---

## Next Steps

### Planned Enhancements
1. **Date Range Support**: Add time dimension filtering
2. **Drill-Down Export**: Export hierarchy to CSV
3. **Custom Tooltips**: Rich formatting with multiple metrics
4. **Animation**: Smooth transitions on data updates
5. **Accessibility**: Keyboard navigation for treemap nodes

### Integration Roadmap
- [ ] Connect to Metabase for embedded dashboards
- [ ] Add real-time WebSocket updates
- [ ] Implement dashboard sharing/export
- [ ] Multi-tenant row-level security (RLS)

---

## Support

For questions or issues:
- Check WPP MCP documentation: `/docs/architecture/`
- Review Cube.js docs: https://cube.dev/docs
- Test locally: `npm run dev` and visit `/test-treemap`

**Last Updated:** 2025-10-22
**Component Version:** 1.0.0
**Cube.js Version:** ^0.35.0
