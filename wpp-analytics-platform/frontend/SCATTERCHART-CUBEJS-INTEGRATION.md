# ScatterChart Cube.js Integration

## Overview

The ScatterChart component has been successfully connected to Cube.js for real-time data visualization. This document explains how it works, how to use it, and provides examples.

## Key Features

### 1. **Cube.js Data Integration**
- Uses `useCubeQuery` hook from `@cubejs-client/react`
- Automatically fetches and transforms data from Cube.js semantic layer
- Supports up to 5,000 data points for detailed scatter analysis

### 2. **Proper Scatter Plot Implementation**
- **X-Axis**: First metric (e.g., `GoogleAds.impressions`)
- **Y-Axis**: Second metric (e.g., `GoogleAds.clicks`)
- **Breakdown Dimension**: Optional grouping (e.g., `GoogleAds.campaignName`)

### 3. **Data Transformation**
- Converts Cube.js `tablePivot()` format into ECharts scatter data
- Handles both single-series and multi-series (grouped) data
- Automatic metric name extraction for axis labels

### 4. **Smart Formatting**
- Applies metric-specific formatting (currency, percent, compact numbers)
- Dynamic tooltip formatting based on metric configuration
- Axis label formatting for better readability

## How It Works

### Query Configuration

```typescript
const queryConfig = {
  measures: [
    'GoogleAds.impressions',  // X-axis
    'GoogleAds.clicks'         // Y-axis
  ],
  dimensions: ['GoogleAds.campaignName'], // Optional breakdown
  filters: [
    {
      member: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['last 30 days']
    }
  ],
  limit: 5000 // Allow many data points
};
```

### Data Transformation Flow

```
Cube.js API Response
    ↓
resultSet.tablePivot()
    ↓
[
  { 'GoogleAds.campaignName': 'Campaign A', 'GoogleAds.impressions': 10000, 'GoogleAds.clicks': 500 },
  { 'GoogleAds.campaignName': 'Campaign B', 'GoogleAds.impressions': 5000, 'GoogleAds.clicks': 300 }
]
    ↓
prepareScatterData()
    ↓
{
  series: [
    {
      name: 'Campaign A',
      data: [[10000, 500]],
      color: '#5470c6'
    },
    {
      name: 'Campaign B',
      data: [[5000, 300]],
      color: '#91cc75'
    }
  ],
  xAxisName: 'impressions',
  yAxisName: 'clicks'
}
    ↓
ECharts scatter visualization
```

## Usage Examples

### Example 1: Simple Scatter Plot (No Grouping)

```tsx
<ScatterChart
  title="Impressions vs Clicks"
  metrics={[
    'GoogleAds.impressions',
    'GoogleAds.clicks'
  ]}
  filters={[
    {
      field: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['last 30 days']
    }
  ]}
  metricsConfig={[
    {
      id: 'GoogleAds.impressions',
      format: 'number',
      compact: true,
      decimals: 1
    },
    {
      id: 'GoogleAds.clicks',
      format: 'number',
      compact: false,
      decimals: 0
    }
  ]}
/>
```

**Result**: Single scatter plot showing all data points in one color.

### Example 2: Grouped Scatter Plot

```tsx
<ScatterChart
  title="Campaign Performance: Impressions vs Clicks"
  metrics={[
    'GoogleAds.impressions',
    'GoogleAds.clicks'
  ]}
  breakdownDimension="GoogleAds.campaignName"
  filters={[
    {
      field: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['last 7 days']
    }
  ]}
  showLegend={true}
  chartColors={['#5470c6', '#91cc75', '#fac858', '#ee6666']}
/>
```

**Result**: Multiple scatter series, one per campaign, with legend showing each campaign name.

### Example 3: Cost vs Conversions Analysis

```tsx
<ScatterChart
  title="Cost Efficiency Analysis"
  metrics={[
    'GoogleAds.cost',
    'GoogleAds.conversions'
  ]}
  breakdownDimension="GoogleAds.adGroupName"
  filters={[
    {
      field: 'GoogleAds.campaignId',
      operator: 'equals',
      values: ['123456789']
    }
  ]}
  metricsConfig={[
    {
      id: 'GoogleAds.cost',
      format: 'currency',
      decimals: 2
    },
    {
      id: 'GoogleAds.conversions',
      format: 'number',
      decimals: 0
    }
  ]}
  backgroundColor="#f9fafb"
  borderRadius={12}
  showShadow={true}
/>
```

**Result**: Scatter plot showing cost vs conversions for each ad group, with currency formatting on X-axis.

### Example 4: Multi-Platform Search Analysis

```tsx
<ScatterChart
  title="Organic Position vs Click-Through Rate"
  metrics={[
    'GSCPerformance.averagePosition',
    'GSCPerformance.ctr'
  ]}
  breakdownDimension="GSCPerformance.device"
  filters={[
    {
      field: 'GSCPerformance.clicks',
      operator: 'gte',
      values: ['10'] // Only keywords with 10+ clicks
    }
  ]}
  metricsConfig={[
    {
      id: 'GSCPerformance.averagePosition',
      format: 'number',
      decimals: 1
    },
    {
      id: 'GSCPerformance.ctr',
      format: 'percent',
      decimals: 2
    }
  ]}
  showLegend={true}
/>
```

**Result**: Scatter plot showing position vs CTR, grouped by device type (Desktop, Mobile, Tablet).

## Cube.js Data Model Requirements

### Minimum Requirements

For the ScatterChart to work, your Cube.js data model must define:

1. **At least 2 measures** (for X and Y coordinates)
2. **Optional dimensions** (for grouping/breakdown)

### Example Cube.js Model

```javascript
// model/GoogleAds.js
cube('GoogleAds', {
  sql: `SELECT * FROM \`project.dataset.google_ads_data\``,

  dimensions: {
    campaignId: {
      sql: 'campaign_id',
      type: 'string',
      primaryKey: true
    },
    campaignName: {
      sql: 'campaign_name',
      type: 'string'
    },
    adGroupName: {
      sql: 'ad_group_name',
      type: 'string'
    },
    date: {
      sql: 'date',
      type: 'time'
    }
  },

  measures: {
    impressions: {
      sql: 'impressions',
      type: 'sum',
      format: 'number'
    },
    clicks: {
      sql: 'clicks',
      type: 'sum',
      format: 'number'
    },
    cost: {
      sql: 'cost',
      type: 'sum',
      format: 'currency'
    },
    conversions: {
      sql: 'conversions',
      type: 'sum',
      format: 'number'
    },
    ctr: {
      sql: `SAFE_DIVIDE(${clicks}, ${impressions}) * 100`,
      type: 'number',
      format: 'percent'
    }
  }
});
```

## Configuration Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metrics` | `string[]` | `[]` | **Required**: Array of 2+ metric IDs from Cube.js |
| `breakdownDimension` | `string \| null` | `null` | Optional dimension for grouping data points |
| `filters` | `Filter[]` | `[]` | Cube.js filters to apply |
| `metricsConfig` | `MetricStyleConfig[]` | `[]` | Formatting configuration for metrics |
| `title` | `string` | `'Scatter Plot'` | Chart title |
| `showLegend` | `boolean` | `true` | Show/hide legend (auto-hidden if single series) |
| `chartColors` | `string[]` | `[...]` | Color palette for series |
| `backgroundColor` | `string` | `'#ffffff'` | Container background color |
| `borderRadius` | `number` | `8` | Container border radius (px) |
| `showBorder` | `boolean` | `true` | Show container border |
| `showShadow` | `boolean` | `false` | Show container shadow |

### MetricStyleConfig

```typescript
interface MetricStyleConfig {
  id: string;              // Metric ID (e.g., 'GoogleAds.clicks')
  format?: 'number' | 'currency' | 'percent' | 'duration';
  decimals?: number;       // Decimal places
  compact?: boolean;       // Use K, M, B suffixes
  textColor?: string;      // Text color
  fontWeight?: string;     // Font weight
  alignment?: 'left' | 'center' | 'right';
}
```

### Filter

```typescript
interface Filter {
  field: string;           // Cube.js member (e.g., 'GoogleAds.date')
  operator: string;        // e.g., 'equals', 'contains', 'inDateRange', 'gte'
  values: string[];        // Filter values
}
```

## Common Use Cases

### 1. Performance Correlation Analysis
**Question**: Do higher impressions lead to more clicks?

```tsx
<ScatterChart
  metrics={['GoogleAds.impressions', 'GoogleAds.clicks']}
  breakdownDimension="GoogleAds.campaignType"
/>
```

### 2. Cost Efficiency Identification
**Question**: Which campaigns have high cost but low conversions?

```tsx
<ScatterChart
  metrics={['GoogleAds.cost', 'GoogleAds.conversions']}
  breakdownDimension="GoogleAds.campaignName"
/>
```

### 3. Quality Score vs Performance
**Question**: Does higher quality score correlate with better CTR?

```tsx
<ScatterChart
  metrics={['GoogleAds.qualityScore', 'GoogleAds.ctr']}
  breakdownDimension="GoogleAds.adGroupName"
/>
```

### 4. Search Visibility Analysis
**Question**: How does organic position affect CTR across devices?

```tsx
<ScatterChart
  metrics={['GSCPerformance.averagePosition', 'GSCPerformance.ctr']}
  breakdownDimension="GSCPerformance.device"
/>
```

## Performance Considerations

### Data Limits
- **Default**: 5,000 data points
- **Reason**: Scatter plots can handle more data than tables without performance issues
- **Override**: Can be increased in query config if needed

### Aggregation Strategy
```javascript
// ❌ BAD: Load raw click-level data (millions of rows)
const { resultSet } = useCubeQuery({
  measures: ['GoogleAds.impressions', 'GoogleAds.clicks']
  // No aggregation → 1 million rows
});

// ✅ GOOD: Aggregate by campaign (100 rows)
const { resultSet } = useCubeQuery({
  measures: ['GoogleAds.impressions', 'GoogleAds.clicks'],
  dimensions: ['GoogleAds.campaignName']
  // Aggregated → 100 rows
});
```

### Pre-Aggregations
For frequently accessed scatter plots, configure Cube.js pre-aggregations:

```javascript
// In Cube.js model
preAggregations: {
  campaignMetrics: {
    measures: [impressions, clicks, cost, conversions],
    dimensions: [campaignName, adGroupName],
    timeDimension: date,
    granularity: 'day',
    refreshKey: {
      every: '1 hour'
    }
  }
}
```

## Troubleshooting

### Issue 1: No Data Points Shown

**Cause**: Less than 2 metrics configured

**Solution**: Select at least 2 metrics in the configuration

```tsx
// ❌ Wrong
<ScatterChart metrics={['GoogleAds.clicks']} />

// ✅ Correct
<ScatterChart metrics={['GoogleAds.impressions', 'GoogleAds.clicks']} />
```

### Issue 2: All Points Are Zero

**Cause**: Metrics not defined as measures in Cube.js model

**Solution**: Ensure metrics are defined in your Cube.js model:

```javascript
measures: {
  clicks: {
    sql: 'clicks',
    type: 'sum'  // Must be a measure, not dimension
  }
}
```

### Issue 3: Points Not Grouped Correctly

**Cause**: Breakdown dimension not matching data structure

**Solution**: Verify dimension exists in Cube.js model:

```javascript
dimensions: {
  campaignName: {
    sql: 'campaign_name',
    type: 'string'  // Must be a dimension
  }
}
```

### Issue 4: Slow Loading

**Cause**: Too many data points or no pre-aggregations

**Solution**:
1. Reduce limit in query config
2. Add filters to reduce data volume
3. Configure pre-aggregations in Cube.js

## Advanced Features

### Dynamic Axis Scaling

The chart automatically scales axes based on data range:

```typescript
// Example: Cost ranges from $100 to $10,000
// X-axis automatically shows: $100, $2,000, $4,000, $6,000, $8,000, $10,000
```

### Interactive Tooltips

Tooltips show formatted values on hover:

```
● Campaign A
impressions: 12.5K
clicks: 1,234
```

### Emphasis on Hover

Hovering over a data point:
- Scales point up by 50%
- Changes opacity to 100%
- Focuses on series (dims others)

### Multi-Series Legend

When using breakdown dimension:
- Shows all series in legend
- Click to toggle series visibility
- Auto-hides if only one series

## Real-World Example: Campaign Optimization Dashboard

```tsx
import { ScatterChart } from '@/components/dashboard-builder/charts/ScatterChart';

export function CampaignOptimizationDashboard() {
  const dateRange = 'last 30 days';
  const campaignFilter = {
    field: 'GoogleAds.status',
    operator: 'equals',
    values: ['ENABLED']
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Top Left: Impressions vs Clicks */}
      <ScatterChart
        title="Traffic Volume Analysis"
        metrics={['GoogleAds.impressions', 'GoogleAds.clicks']}
        breakdownDimension="GoogleAds.campaignType"
        filters={[campaignFilter]}
        metricsConfig={[
          { id: 'GoogleAds.impressions', format: 'number', compact: true },
          { id: 'GoogleAds.clicks', format: 'number', compact: true }
        ]}
      />

      {/* Top Right: Cost vs Conversions */}
      <ScatterChart
        title="Cost Efficiency"
        metrics={['GoogleAds.cost', 'GoogleAds.conversions']}
        breakdownDimension="GoogleAds.campaignName"
        filters={[campaignFilter]}
        metricsConfig={[
          { id: 'GoogleAds.cost', format: 'currency', decimals: 0 },
          { id: 'GoogleAds.conversions', format: 'number', decimals: 0 }
        ]}
      />

      {/* Bottom Left: CTR vs Quality Score */}
      <ScatterChart
        title="Quality Analysis"
        metrics={['GoogleAds.ctr', 'GoogleAds.qualityScore']}
        breakdownDimension="GoogleAds.adGroupName"
        filters={[campaignFilter]}
        metricsConfig={[
          { id: 'GoogleAds.ctr', format: 'percent', decimals: 2 },
          { id: 'GoogleAds.qualityScore', format: 'number', decimals: 1 }
        ]}
      />

      {/* Bottom Right: Conversion Rate vs Avg CPC */}
      <ScatterChart
        title="Conversion Efficiency"
        metrics={['GoogleAds.conversionRate', 'GoogleAds.avgCpc']}
        breakdownDimension="GoogleAds.campaignName"
        filters={[campaignFilter]}
        metricsConfig={[
          { id: 'GoogleAds.conversionRate', format: 'percent', decimals: 2 },
          { id: 'GoogleAds.avgCpc', format: 'currency', decimals: 2 }
        ]}
      />
    </div>
  );
}
```

## Next Steps

1. **Create Cube.js Models**: Define your data models in `/cube/model/` directory
2. **Configure Environment**: Set `NEXT_PUBLIC_CUBEJS_API_URL` and `NEXT_PUBLIC_CUBEJS_API_SECRET`
3. **Test Queries**: Use Cube.js Playground to test queries before using in components
4. **Optimize**: Add pre-aggregations for frequently accessed data

## Related Files

- **Component**: `/frontend/src/components/dashboard-builder/charts/ScatterChart.tsx`
- **Cube.js Client**: `/frontend/src/lib/cubejs/client.ts`
- **Metric Formatter**: `/frontend/src/lib/utils/metric-formatter.ts`
- **Types**: `/frontend/src/types/dashboard-builder.ts`

## Support

For issues or questions about ScatterChart Cube.js integration:

1. Check Cube.js documentation: https://cube.dev/docs
2. Verify your data model definitions
3. Test queries in Cube.js Playground
4. Review browser console for errors
