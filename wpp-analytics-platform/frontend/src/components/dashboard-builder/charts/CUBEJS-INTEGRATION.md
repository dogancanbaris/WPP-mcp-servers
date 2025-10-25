# Cube.js Integration Guide for PieChart Component

## Overview

The `PieChart` component is fully integrated with Cube.js semantic layer, enabling real-time analytics visualization with token-efficient data loading from BigQuery.

## Architecture

```
Marketing Data (BigQuery) → Cube.js Semantic Layer → PieChart Component → ECharts Visualization
```

### Key Benefits

1. **Token Efficiency**: Aggregates data in Cube.js/BigQuery, returns only 100-400 rows
2. **Real-Time**: Live data updates via Cube.js refresh keys
3. **Type Safety**: Full TypeScript support
4. **Performance**: Pre-aggregations for sub-second query response
5. **Multi-Tenant**: Automatic tenant filtering via security context

## Basic Usage

```tsx
import { PieChart } from './PieChart';

function MyDashboard() {
  return (
    <PieChart
      title="Traffic by Device"
      datasource="GoogleAds"
      dimension="GoogleAds.device"
      metrics={['GoogleAds.clicks']}
      dateRange="last 30 days"
    />
  );
}
```

## Cube.js Query Flow

### 1. Component Props → Cube.js Query

The component automatically converts props to Cube.js query format:

```typescript
// Component Props
<PieChart
  datasource="GoogleAds"
  dimension="GoogleAds.device"
  metrics={['GoogleAds.clicks']}
  filters={[
    { field: 'GoogleAds.campaignStatus', operator: 'equals', values: ['ENABLED'] }
  ]}
  dateRange="last 30 days"
/>

// Generated Cube.js Query
{
  measures: ['GoogleAds.clicks'],
  dimensions: ['GoogleAds.device'],
  filters: [
    { member: 'GoogleAds.campaignStatus', operator: 'equals', values: ['ENABLED'] }
  ],
  timeDimensions: [{
    dimension: 'GoogleAds.date',
    dateRange: 'last 30 days'
  }],
  order: { 'GoogleAds.clicks': 'desc' },
  limit: 10
}
```

### 2. Cube.js → BigQuery SQL

Cube.js translates to optimized SQL:

```sql
SELECT
  device,
  SUM(clicks) as total_clicks
FROM `project.dataset.google_ads_data`
WHERE
  campaign_status = 'ENABLED'
  AND date >= CURRENT_DATE() - INTERVAL 30 DAY
GROUP BY device
ORDER BY total_clicks DESC
LIMIT 10
```

### 3. BigQuery Result → Cube.js Response

```json
{
  "data": [
    { "GoogleAds.device": "Mobile", "GoogleAds.clicks": 5678 },
    { "GoogleAds.device": "Desktop", "GoogleAds.clicks": 1234 },
    { "GoogleAds.device": "Tablet", "GoogleAds.clicks": 890 }
  ]
}
```

### 4. Cube.js Response → ECharts Data

The component transforms Cube.js data to ECharts format:

```typescript
// chartData from resultSet.tablePivot()
[
  { 'GoogleAds.device': 'Mobile', 'GoogleAds.clicks': 5678 },
  { 'GoogleAds.device': 'Desktop', 'GoogleAds.clicks': 1234 },
  { 'GoogleAds.device': 'Tablet', 'GoogleAds.clicks': 890 }
]

// Transformed to ECharts series data
{
  series: [{
    type: 'pie',
    data: [
      { name: 'Mobile', value: 5678, itemStyle: { color: '#5470c6' } },
      { name: 'Desktop', value: 1234, itemStyle: { color: '#91cc75' } },
      { name: 'Tablet', value: 890, itemStyle: { color: '#fac858' } }
    ]
  }]
}
```

## Cube.js Data Model Setup

### Define the Cube

Create a Cube.js data model for your data source:

```javascript
// model/GoogleAds.js
cube('GoogleAds', {
  sql: `SELECT * FROM \`mcp-servers-475317.wpp_analytics.google_ads_data\``,

  dimensions: {
    device: {
      sql: 'device',
      type: 'string'
    },
    campaignName: {
      sql: 'campaign_name',
      type: 'string'
    },
    date: {
      sql: 'date',
      type: 'time'
    }
  },

  measures: {
    clicks: {
      sql: 'clicks',
      type: 'sum'
    },
    impressions: {
      sql: 'impressions',
      type: 'sum'
    },
    cost: {
      sql: 'cost',
      type: 'sum',
      format: 'currency'
    }
  },

  preAggregations: {
    devicePerformance: {
      measures: [clicks, impressions, cost],
      dimensions: [device, campaignName],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
    }
  }
});
```

## Component Props Reference

### Data Configuration

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `datasource` | `string` | ✅ | Cube.js cube name (e.g., 'GoogleAds') |
| `dimension` | `string` | ✅ | Category dimension (e.g., 'GoogleAds.device') |
| `metrics` | `string[]` | ✅ | Metric to measure (e.g., ['GoogleAds.clicks']) |
| `filters` | `FilterConfig[]` | ❌ | Filter conditions |
| `dateRange` | `string \| DateRangeConfig` | ❌ | Time range (e.g., 'last 30 days') |
| `breakdownDimension` | `string` | ❌ | Secondary dimension (future use) |

### Pie Chart Specific

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pieRadius` | `string \| [string, string]` | `'55%'` | Radius ('50%' or ['40%', '70%'] for donut) |
| `pieCenter` | `[string, string]` | `['50%', '50%']` | Center position |
| `showLabel` | `boolean` | `true` | Show slice labels |
| `labelPosition` | `'outside' \| 'inside' \| 'center'` | `'outside'` | Label position |
| `labelFormatter` | `string` | `'{b}: {d}%'` | Label format template |
| `showLabelLine` | `boolean` | `true` | Show label connector lines |
| `roseType` | `false \| 'radius' \| 'area'` | `false` | Rose chart mode |
| `startAngle` | `number` | `90` | Starting angle (0-360) |
| `selectedMode` | `false \| 'single' \| 'multiple'` | `false` | Interactive selection |

## Advanced Patterns

### 1. Multi-Platform Data Blending

Combine data from multiple sources:

```javascript
// Cube.js model
cube('HolisticSearch', {
  sql: `
    SELECT
      s.query,
      s.clicks as organic_clicks,
      s.position as organic_position,
      a.clicks as paid_clicks,
      a.cost as paid_cost
    FROM \`gsc_data\` s
    LEFT JOIN \`ads_data\` a ON s.query = a.search_term
  `,

  dimensions: {
    query: { sql: 'query', type: 'string' }
  },

  measures: {
    totalClicks: {
      sql: 'organic_clicks + paid_clicks',
      type: 'sum'
    }
  }
});
```

```tsx
<PieChart
  datasource="HolisticSearch"
  dimension="HolisticSearch.query"
  metrics={['HolisticSearch.totalClicks']}
  title="Top Queries (Organic + Paid)"
/>
```

### 2. Real-Time Updates

Implement polling for live data:

```tsx
import { useEffect } from 'react';

function LiveDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <PieChart
      key={refreshKey}
      datasource="GoogleAds"
      dimension="GoogleAds.campaignName"
      metrics={['GoogleAds.clicks']}
      dateRange="last 1 hour"
      title="Live Campaign Performance"
    />
  );
}
```

### 3. Dynamic Date Ranges

Allow users to change date ranges:

```tsx
function InteractiveDashboard() {
  const [dateRange, setDateRange] = useState('last 7 days');

  return (
    <>
      <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last 7 days">Last 7 Days</option>
        <option value="last 30 days">Last 30 Days</option>
      </select>

      <PieChart
        datasource="GoogleAds"
        dimension="GoogleAds.device"
        metrics={['GoogleAds.clicks']}
        dateRange={dateRange}
      />
    </>
  );
}
```

### 4. Custom Filters

Apply dynamic filters:

```tsx
function FilteredPieChart() {
  const [selectedCountries, setSelectedCountries] = useState(['USA', 'UK']);

  return (
    <PieChart
      datasource="SearchConsole"
      dimension="SearchConsole.page"
      metrics={['SearchConsole.clicks']}
      filters={[
        {
          field: 'SearchConsole.country',
          operator: 'equals',
          values: selectedCountries
        }
      ]}
    />
  );
}
```

## Performance Optimization

### 1. Pre-Aggregations

Define pre-aggregations in Cube.js for faster queries:

```javascript
cube('GoogleAds', {
  // ... dimensions and measures

  preAggregations: {
    main: {
      measures: [clicks, impressions, cost],
      dimensions: [device, campaignName],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      },
      // Creates a rollup table in BigQuery
      // Queries become 100x faster
    }
  }
});
```

### 2. Query Limits

The component automatically limits results to 10 for readability. Adjust if needed:

```typescript
// In PieChart.tsx
limit: 10 // Default - pie charts with >10 slices are hard to read
```

### 3. Token Efficiency

Always aggregate in Cube.js/BigQuery:

```typescript
// ❌ BAD: Load 50,000 rows into React
const query = {
  dimensions: ['GoogleAds.searchTerm'],
  measures: ['GoogleAds.clicks']
  // Returns 50,000 rows → crashes browser
};

// ✅ GOOD: Aggregate in Cube.js, return 10 rows
const query = {
  dimensions: ['GoogleAds.searchTerm'],
  measures: ['GoogleAds.clicks'],
  order: { 'GoogleAds.clicks': 'desc' },
  limit: 10  // Top 10 only
};
```

## Multi-Tenant Security

### Automatic Tenant Filtering

Cube.js applies tenant filters automatically:

```javascript
// Cube.js security context
cube('GoogleAds', {
  sql: `
    SELECT * FROM google_ads_data
    WHERE tenant_id = \${SECURITY_CONTEXT.tenant_id}
  `,
  // Each tenant only sees their data
});
```

### Row-Level Security

Implement RLS in Cube.js:

```javascript
cube('GoogleAds', {
  sql: `
    SELECT * FROM google_ads_data
    WHERE department = \${SECURITY_CONTEXT.department}
  `,
});
```

## Error Handling

The component handles three states:

1. **Loading**: Shows spinner while fetching data
2. **Error**: Displays error message
3. **Success**: Renders chart with data

```tsx
{shouldQuery && isLoading && (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
)}

{shouldQuery && error && (
  <div className="text-center text-red-500">
    <p className="text-sm">Error loading data</p>
    <p className="text-xs mt-2">{error.toString()}</p>
  </div>
)}

{shouldQuery && !isLoading && !error && (
  <ReactECharts option={chartOption} />
)}
```

## Testing

### Unit Tests

```typescript
import { render } from '@testing-library/react';
import { PieChart } from './PieChart';

describe('PieChart', () => {
  it('renders with Cube.js data', async () => {
    const { findByText } = render(
      <PieChart
        datasource="GoogleAds"
        dimension="GoogleAds.device"
        metrics={['GoogleAds.clicks']}
      />
    );

    expect(await findByText(/Traffic by Device/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

Test with real Cube.js queries:

```typescript
import { CubeProvider } from '@cubejs-client/react';
import { cubeApi } from '@/lib/cubejs/client';

describe('PieChart Cube.js Integration', () => {
  it('fetches and displays real data', async () => {
    const { findByText } = render(
      <CubeProvider cubeApi={cubeApi}>
        <PieChart
          datasource="GoogleAds"
          dimension="GoogleAds.device"
          metrics={['GoogleAds.clicks']}
        />
      </CubeProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Mobile/i)).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Issue: "Cannot read property 'tablePivot' of undefined"

**Cause**: Cube.js query returned no data

**Solution**: Check if dimensions/measures exist in Cube.js schema

```typescript
// Verify in Cube.js Playground
{
  measures: ['GoogleAds.clicks'],
  dimensions: ['GoogleAds.device']
}
```

### Issue: Chart shows "Error loading data"

**Cause**: Invalid Cube.js query or connection issue

**Solution**: Check browser console for detailed error

```typescript
console.error('Cube.js error:', error);
```

### Issue: Chart is empty but no error

**Cause**: Query returned zero results

**Solution**: Adjust filters or date range

```typescript
<PieChart
  dateRange="last 90 days" // Wider range
  filters={[]} // Remove restrictive filters
/>
```

## Resources

- [Cube.js Documentation](https://cube.dev/docs)
- [ECharts Pie Chart Options](https://echarts.apache.org/en/option.html#series-pie)
- [PieChart Examples](./PieChart.examples.tsx)
- [Component Specifications](../../../COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md)

## Related Components

- `BarChart.tsx` - Bar chart with Cube.js integration
- `LineChart.tsx` - Time series with Cube.js integration
- `DonutChart.tsx` - Donut variant (use `pieRadius={['40%', '70%']}`)
- `RoseChart.tsx` - Rose chart (use `roseType="radius"`)
