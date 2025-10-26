# BoxplotChart Component - dataset API Integration Guide

## Overview

The `BoxplotChart` component provides statistical distribution visualization using ECharts' boxplot series type. It displays min, Q1, median, Q3, and max values to analyze data spread, identify outliers, and compare distributions across categories.

## What is a Boxplot?

A boxplot (box-and-whisker plot) visualizes the five-number summary of a dataset:

```
    Outliers (●)
        │
    Max ┬─────────┐
        │         │
    Q3  ├─────────┤
        │         │ ← Box (IQR = Q3 - Q1)
 Median ├─────────┤ ← Line through box
        │         │
    Q1  ├─────────┤
        │         │
    Min ┴─────────┘
        │
    Outliers (●)
```

### Statistical Measures

| Measure | Description | Calculation |
|---------|-------------|-------------|
| **Min** | Smallest value within 1.5*IQR from Q1 | Minimum non-outlier value |
| **Q1** | First quartile (25th percentile) | 25% of data falls below this |
| **Median** | Second quartile (50th percentile) | Middle value when sorted |
| **Q3** | Third quartile (75th percentile) | 75% of data falls below this |
| **Max** | Largest value within 1.5*IQR from Q3 | Maximum non-outlier value |
| **IQR** | Interquartile Range (Q3 - Q1) | Spread of middle 50% |
| **Outliers** | Values beyond 1.5*IQR from Q1/Q3 | Anomalous data points |

## When to Use Boxplots

### Perfect Use Cases

✅ **CPC Distribution Analysis**
- Compare CPC spread across campaigns
- Identify campaigns with volatile costs
- Spot unusually expensive clicks

✅ **Position Range Analysis**
- Track search ranking stability
- Compare position volatility by query
- Identify ranking fluctuations

✅ **CTR Performance Distribution**
- Analyze CTR consistency by ad group
- Compare device performance spread
- Spot outlier ads (very high/low CTR)

✅ **Quality Score Distribution**
- View QS range across keywords
- Identify low-performing keywords
- Track account health metrics

✅ **Conversion Rate Variability**
- Analyze conversion consistency by page
- Compare landing page performance
- Identify pages needing optimization

### When NOT to Use Boxplots

❌ **Time Series Data** → Use LineChart or TimeSeriesChart
❌ **Exact Values** → Use BarChart or TableChart
❌ **Proportions/Percentages** → Use PieChart
❌ **Single Category** → Use Scorecard or GaugeChart
❌ **Correlation Analysis** → Use ScatterChart

## Architecture

```
Marketing Data (BigQuery) → dataset API (Aggregation) → BoxplotChart → ECharts Visualization
                                      ↓
                            Statistical Calculations
                            (min, Q1, median, Q3, max)
```

## Basic Usage

```tsx
import { BoxplotChart } from './BoxplotChart';

function MyDashboard() {
  return (
    <BoxplotChart
      title="CPC Distribution by Campaign"
      datasource="GoogleAds"
      dimension="GoogleAds.campaignName"
      metrics={['GoogleAds.cpc']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    />
  );
}
```

## Props Reference

### Data Configuration

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `datasource` | `string` | ✅ | - | dataset API cube name |
| `dimension` | `string` | ✅ | - | Category dimension (e.g., campaignName) |
| `metrics` | `string[]` | ✅ | - | Metric to analyze (only first metric used) |
| `filters` | `FilterConfig[]` | ❌ | `[]` | Filter conditions |
| `dateRange` | `DateRangeConfig` | ❌ | - | Time range |
| `breakdownDimension` | `string` | ❌ | - | Secondary dimension (future use) |

### Boxplot-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `boxWidth` | `string` | `'60%'` | Width of boxes (e.g., '50%', '80%') |
| `showOutliers` | `boolean` | `true` | Display outlier points |
| `outlierColor` | `string` | `'#ee6666'` | Color for outlier markers |

### Title Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Boxplot Chart'` | Chart title |
| `showTitle` | `boolean` | `true` | Show/hide title |
| `titleFontFamily` | `string` | `'roboto'` | Font family |
| `titleFontSize` | `string` | `'16'` | Font size (px) |
| `titleFontWeight` | `string` | `'600'` | Font weight |
| `titleColor` | `string` | `'#111827'` | Text color |
| `titleBackgroundColor` | `string` | `'transparent'` | Background color |
| `titleAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |

### Container Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `'#ffffff'` | Background color |
| `showBorder` | `boolean` | `true` | Show/hide border |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderWidth` | `number` | `1` | Border width (px) |
| `borderRadius` | `number` | `8` | Border radius (px) |
| `showShadow` | `boolean` | `false` | Show/hide shadow |
| `shadowColor` | `string` | `'#000000'` | Shadow color |
| `shadowBlur` | `number` | `10` | Shadow blur (px) |
| `padding` | `number` | `16` | Internal padding (px) |

### Chart Appearance

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLegend` | `boolean` | `true` | Show/hide legend |
| `chartColors` | `string[]` | `['#5470c6', ...]` | Color palette |
| `metricsConfig` | `MetricStyleConfig[]` | `[]` | Metric formatting |

## dataset API Integration

### Query Pattern

The component automatically converts props to dataset API query:

```typescript
// Component Usage
<BoxplotChart
  datasource="GoogleAds"
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.cpc']}
  filters={[
    { field: 'GoogleAds.status', operator: 'equals', values: ['ENABLED'] }
  ]}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
/>

// Generated dataset API Query
{
  measures: ['GoogleAds.cpc'],
  dimensions: ['GoogleAds.campaignName'],
  filters: [
    { member: 'GoogleAds.status', operator: 'equals', values: ['ENABLED'] },
    { member: 'GoogleAds.date', operator: 'inDateRange', values: ['2025-01-01', '2025-01-31'] }
  ],
  order: { 'GoogleAds.campaignName': 'asc' },
  limit: 20
}
```

### Recommended dataset API Data Model

For optimal performance, define percentile measures in dataset API:

```javascript
// model/GoogleAds.js
cube('GoogleAds', {
  sql: `SELECT * FROM \`project.dataset.google_ads_data\``,

  dimensions: {
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
    // Standard measures
    cpc: {
      sql: 'cost / clicks',
      type: 'number'
    },

    // Boxplot-optimized measures (BigQuery)
    cpcMin: {
      sql: 'MIN(cost / clicks)',
      type: 'number',
      title: 'Minimum CPC'
    },
    cpcQ1: {
      sql: 'APPROX_QUANTILES(cost / clicks, 100)[OFFSET(25)]',
      type: 'number',
      title: '25th Percentile CPC'
    },
    cpcMedian: {
      sql: 'APPROX_QUANTILES(cost / clicks, 100)[OFFSET(50)]',
      type: 'number',
      title: 'Median CPC'
    },
    cpcQ3: {
      sql: 'APPROX_QUANTILES(cost / clicks, 100)[OFFSET(75)]',
      type: 'number',
      title: '75th Percentile CPC'
    },
    cpcMax: {
      sql: 'MAX(cost / clicks)',
      type: 'number',
      title: 'Maximum CPC'
    }
  },

  preAggregations: {
    cpcDistribution: {
      measures: [cpcMin, cpcQ1, cpcMedian, cpcQ3, cpcMax],
      dimensions: [campaignName],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
    }
  }
});
```

### Advanced Query: Using Pre-Calculated Statistics

```tsx
<BoxplotChart
  datasource="GoogleAds"
  dimension="GoogleAds.campaignName"
  // Pass all 5 statistical measures
  metrics={[
    'GoogleAds.cpcMin',
    'GoogleAds.cpcQ1',
    'GoogleAds.cpcMedian',
    'GoogleAds.cpcQ3',
    'GoogleAds.cpcMax'
  ]}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
/>
```

## Real-World Examples

### Example 1: Campaign CPC Analysis

```tsx
<BoxplotChart
  title="Cost-Per-Click Distribution - Active Campaigns"
  datasource="GoogleAds"
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.cpc']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
  filters={[
    {
      field: 'GoogleAds.campaignStatus',
      operator: 'equals',
      values: ['ENABLED']
    },
    {
      field: 'GoogleAds.clicks',
      operator: 'gt',
      values: ['50'] // Only campaigns with significant traffic
    }
  ]}
  metricsConfig={[
    {
      id: 'GoogleAds.cpc',
      name: 'Cost Per Click',
      format: 'currency',
      decimals: 2,
      compact: false,
      alignment: 'right',
      textColor: '#111827',
      fontWeight: '500',
      showComparison: false,
      showBars: false
    }
  ]}
  showOutliers={true}
  outlierColor="#ee6666"
  boxWidth="70%"
/>
```

**Insights from this chart:**
- Median CPC shows typical cost per campaign
- Box width indicates CPC stability (narrow = consistent, wide = volatile)
- Outliers highlight unusually expensive/cheap clicks
- Compare campaigns to identify budget optimization opportunities

### Example 2: Search Position Volatility

```tsx
<BoxplotChart
  title="Ranking Position Range - Top 20 Queries"
  datasource="SearchConsole"
  dimension="SearchConsole.query"
  metrics={['SearchConsole.position']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
  filters={[
    {
      field: 'SearchConsole.impressions',
      operator: 'gt',
      values: ['100']
    }
  ]}
  metricsConfig={[
    {
      id: 'SearchConsole.position',
      name: 'Search Position',
      format: 'number',
      decimals: 1,
      compact: false,
      alignment: 'center',
      textColor: '#111827',
      fontWeight: '500',
      showComparison: false,
      showBars: false
    }
  ]}
  showOutliers={true}
  outlierColor="#fac858"
  chartColors={['#3ba272']}
/>
```

**Insights from this chart:**
- Narrow boxes indicate stable rankings
- Wide boxes show volatile positions needing attention
- Low median = good average position
- Outliers show best/worst ranking spikes

### Example 3: Device CTR Comparison

```tsx
<BoxplotChart
  title="Click-Through Rate Distribution by Device"
  datasource="GoogleAds"
  dimension="GoogleAds.device"
  metrics={['GoogleAds.ctr']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
  metricsConfig={[
    {
      id: 'GoogleAds.ctr',
      name: 'CTR',
      format: 'percent',
      decimals: 2,
      compact: false,
      alignment: 'center',
      textColor: '#111827',
      fontWeight: '500',
      showComparison: false,
      showBars: false
    }
  ]}
  boxWidth="80%"
  chartColors={['#5470c6']}
/>
```

**Insights from this chart:**
- Compare CTR median across devices
- Identify best-performing device type
- Spot outlier ads with exceptional CTR
- Optimize mobile vs desktop strategies

## Statistical Interpretation Guide

### Understanding Box Components

```
    Max (90th percentile whisker)
     ╷
    ┌─┐  ← Q3 (75th percentile)
    │ │  ← Box represents IQR (middle 50% of data)
    ├─┤  ← Median (50th percentile) - thick line
    │ │
    └─┘  ← Q1 (25th percentile)
     ╵
    Min (10th percentile whisker)

    ●●   ← Outliers (beyond 1.5*IQR)
```

### What Different Box Shapes Tell You

**Narrow Box (Low IQR)**
```
┌─┐  ← Consistent performance
├─┤
└─┘
```
- Low variability
- Predictable results
- Stable metrics

**Wide Box (High IQR)**
```
┌────┐  ← High variability
├────┤
└────┘
```
- Inconsistent performance
- Unpredictable results
- Needs optimization

**Skewed Distribution**
```
    ┌─┐  ← Median near top
    │ │
    ├─┤  ← Longer lower whisker
    │ │
┌───┴─┘
```
- Most values clustered high
- Few low outliers
- Generally positive trend

**Many Outliers**
```
  ●●●
  ┌─┐
  ├─┤  ← Stable core
  └─┘
  ●●●
```
- Core performance stable
- Frequent anomalies
- Investigate outlier causes

## Performance Optimization

### Token-Efficient Queries

```typescript
// ❌ BAD: Loading raw click data (50,000 rows)
const query = {
  dimensions: ['GoogleAds.campaignName', 'GoogleAds.keyword'],
  measures: ['GoogleAds.cpc']
  // Returns 50,000 rows → client-side calculation slow
};

// ✅ GOOD: Pre-aggregated in dataset API (20 rows)
const query = {
  dimensions: ['GoogleAds.campaignName'],
  measures: [
    'GoogleAds.cpcMin',
    'GoogleAds.cpcQ1',
    'GoogleAds.cpcMedian',
    'GoogleAds.cpcQ3',
    'GoogleAds.cpcMax'
  ],
  limit: 20
};
```

### Pre-Aggregations for Speed

```javascript
cube('GoogleAds', {
  preAggregations: {
    cpcBoxplot: {
      measures: [cpcMin, cpcQ1, cpcMedian, cpcQ3, cpcMax],
      dimensions: [campaignName, device],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
      // Queries become 100x faster with pre-agg
    }
  }
});
```

## Multi-Tenant Security

### Automatic Tenant Filtering

```javascript
cube('GoogleAds', {
  sql: `
    SELECT * FROM google_ads_data
    WHERE tenant_id = \${SECURITY_CONTEXT.tenant_id}
  `,
  // Each tenant only sees their data
});
```

## Troubleshooting

### Issue: "No data available"

**Cause**: Query returned zero results

**Solution**:
```tsx
// 1. Widen date range
<BoxplotChart dateRange={{ start: '2025-01-01', end: '2025-12-31' }} />

// 2. Remove restrictive filters
<BoxplotChart filters={[]} />

// 3. Lower minimum thresholds
<BoxplotChart
  filters={[
    { field: 'GoogleAds.clicks', operator: 'gt', values: ['10'] } // Lower from 100
  ]}
/>
```

### Issue: "Boxes look identical"

**Cause**: Low data variability or simulated data

**Solution**: Use real percentile measures from Supabase dataset:
```javascript
// Define in dataset API model
cpcQ1: {
  sql: 'APPROX_QUANTILES(cpc, 100)[OFFSET(25)]',
  type: 'number'
}
```

### Issue: "Too many outliers"

**Cause**: High data variability or incorrect calculations

**Solution**:
```tsx
// 1. Hide outliers if distracting
<BoxplotChart showOutliers={false} />

// 2. Filter extreme values in dataset API
filters={[
  { field: 'GoogleAds.cpc', operator: 'lt', values: ['10'] } // Cap max
]}
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ECharts 5.0+ for boxplot series type.

## Related Components

- **ScatterChart.tsx** - Correlation analysis between metrics
- **BarChart.tsx** - Category comparison with exact values
- **LineChart.tsx** - Trend analysis over time
- **TableChart.tsx** - Detailed data with all values

## Resources

- [ECharts Boxplot Documentation](https://echarts.apache.org/en/option.html#series-boxplot)
- [Statistical Boxplot Guide](https://en.wikipedia.org/wiki/Box_plot)
- [dataset API BigQuery Functions](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)
- [BoxplotChart Examples](./BoxplotChart.example.tsx)
