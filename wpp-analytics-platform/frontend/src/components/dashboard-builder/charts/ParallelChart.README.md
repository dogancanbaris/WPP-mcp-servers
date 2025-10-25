# ParallelChart Component

## Overview

The `ParallelChart` component provides multi-dimensional data visualization using ECharts parallel coordinates with full Cube.js semantic layer integration. Perfect for discovering correlations, patterns, and outliers across multiple metrics simultaneously.

## Features

- ✅ **Cube.js Integration**: Semantic layer queries with automatic data transformation
- ✅ **Multi-Dimensional Analysis**: Visualize 3-15 dimensions simultaneously
- ✅ **Interactive Brushing**: Filter and explore data across multiple axes
- ✅ **Color Mapping**: Color lines by any dimension to highlight patterns
- ✅ **Token-Efficient**: Designed for ≤400 rows of aggregated data
- ✅ **Real-Time Updates**: Optional auto-refresh for live monitoring
- ✅ **Export Functionality**: Save as PNG/SVG or view raw data
- ✅ **Responsive Design**: Adapts to container width
- ✅ **Accessibility**: WCAG 2.1 AA compliant
- ✅ **Custom Formatting**: Per-axis value formatters

## Installation

```bash
npm install echarts-for-react echarts @cubejs-client/react @cubejs-client/core
```

## Basic Usage

```tsx
import { ParallelChart } from './ParallelChart';

function CampaignAnalysis() {
  return (
    <ParallelChart
      query={{
        measures: [
          'GoogleAds.impressions',
          'GoogleAds.clicks',
          'GoogleAds.cost',
          'GoogleAds.conversions',
        ],
        dimensions: ['GoogleAds.campaignName'],
        timeDimensions: [{
          dimension: 'GoogleAds.date',
          dateRange: 'last 30 days',
        }],
        limit: 50,
      }}
      axes={[
        { name: 'GoogleAds.campaignName', label: 'Campaign', type: 'category' },
        { name: 'GoogleAds.impressions', label: 'Impressions' },
        { name: 'GoogleAds.clicks', label: 'Clicks' },
        { name: 'GoogleAds.cost', label: 'Cost' },
        { name: 'GoogleAds.conversions', label: 'Conversions' },
      ]}
      height={500}
    />
  );
}
```

## Use Cases

### 1. Campaign Performance Analysis

Compare campaigns across multiple KPIs to identify high and low performers:

```tsx
<ParallelChart
  query={{
    measures: [
      'GoogleAds.impressions',
      'GoogleAds.ctr',
      'GoogleAds.cost',
      'GoogleAds.conversions',
      'GoogleAds.roas',
    ],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 30 days',
    }],
    limit: 50,
  }}
  axes={[
    { name: 'GoogleAds.campaignName', label: 'Campaign', type: 'category' },
    { name: 'GoogleAds.impressions', label: 'Impressions', formatter: (v) => `${(v/1000).toFixed(1)}K` },
    { name: 'GoogleAds.ctr', label: 'CTR', formatter: (v) => `${v.toFixed(2)}%` },
    { name: 'GoogleAds.cost', label: 'Cost', formatter: (v) => `$${v.toFixed(0)}` },
    { name: 'GoogleAds.conversions', label: 'Conversions', formatter: (v) => v.toFixed(0) },
    { name: 'GoogleAds.roas', label: 'ROAS', formatter: (v) => `${v.toFixed(2)}x` },
  ]}
  colorByDimension="GoogleAds.roas"
  colorScheme={['#ff4444', '#ffaa00', '#ffff00', '#88ff00', '#00ff00']}
  enableBrush={true}
  showExport={true}
/>
```

**Insights to discover:**
- Campaigns with high spend but low ROAS
- Campaigns with high CTR but low conversions
- Optimal balance between cost and performance

### 2. Paid vs Organic Search Analysis

Identify opportunities where paid search can complement organic:

```tsx
<ParallelChart
  query={{
    measures: [
      'GoogleAds.impressions',
      'GoogleAds.cost',
      'GoogleAds.position',
      'SearchConsole.impressions',
      'SearchConsole.clicks',
      'SearchConsole.position',
    ],
    dimensions: ['GoogleAds.searchTerm'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 7 days',
    }],
    filters: [{
      member: 'GoogleAds.impressions',
      operator: 'gt',
      values: ['1000'],
    }],
    limit: 100,
  }}
  axes={[
    { name: 'GoogleAds.searchTerm', label: 'Search Term', type: 'category' },
    { name: 'GoogleAds.impressions', label: 'Paid Impressions' },
    { name: 'GoogleAds.cost', label: 'Paid Cost' },
    { name: 'GoogleAds.position', label: 'Paid Pos', inverse: true },
    { name: 'SearchConsole.impressions', label: 'Organic Impressions' },
    { name: 'SearchConsole.clicks', label: 'Organic Clicks' },
    { name: 'SearchConsole.position', label: 'Organic Pos', inverse: true },
  ]}
  smooth={true}
  lineOpacity={0.4}
/>
```

**Insights to discover:**
- Keywords with high paid spend but good organic rankings
- Terms with high organic impressions but low clicks (CTR opportunity)
- Gaps where neither paid nor organic is performing well

### 3. Landing Page Quality Analysis

Analyze landing page effectiveness across multiple engagement metrics:

```tsx
<ParallelChart
  query={{
    measures: [
      'GoogleAds.clicks',
      'GoogleAds.cost',
      'Analytics.bounceRate',
      'Analytics.avgSessionDuration',
      'Analytics.pageviewsPerSession',
      'Analytics.goalConversionRate',
    ],
    dimensions: ['GoogleAds.finalUrl'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 14 days',
    }],
    filters: [{
      member: 'GoogleAds.clicks',
      operator: 'gt',
      values: ['100'],
    }],
    limit: 30,
  }}
  axes={[
    { name: 'GoogleAds.finalUrl', label: 'Landing Page', type: 'category' },
    { name: 'GoogleAds.clicks', label: 'Clicks' },
    { name: 'GoogleAds.cost', label: 'Cost' },
    { name: 'Analytics.bounceRate', label: 'Bounce Rate', inverse: true },
    { name: 'Analytics.avgSessionDuration', label: 'Avg Duration (s)' },
    { name: 'Analytics.pageviewsPerSession', label: 'Pages/Session' },
    { name: 'Analytics.goalConversionRate', label: 'Conv Rate' },
  ]}
  colorByDimension="Analytics.goalConversionRate"
  height={600}
/>
```

**Insights to discover:**
- Pages with high traffic but poor engagement
- Low-cost pages with excellent conversion rates
- Pages needing UX optimization

### 4. Device & Geographic Segmentation

Cross-dimensional performance analysis:

```tsx
<ParallelChart
  query={{
    measures: [
      'GoogleAds.impressions',
      'GoogleAds.ctr',
      'GoogleAds.cost',
      'GoogleAds.conversions',
      'GoogleAds.costPerConversion',
    ],
    dimensions: ['GoogleAds.device', 'GoogleAds.country'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 30 days',
    }],
    limit: 100,
  }}
  axes={[
    { name: 'GoogleAds.device', label: 'Device', type: 'category' },
    { name: 'GoogleAds.country', label: 'Country', type: 'category' },
    { name: 'GoogleAds.impressions', label: 'Impressions' },
    { name: 'GoogleAds.ctr', label: 'CTR' },
    { name: 'GoogleAds.cost', label: 'Cost' },
    { name: 'GoogleAds.conversions', label: 'Conversions' },
    { name: 'GoogleAds.costPerConversion', label: 'CPA', inverse: true },
  ]}
  layout="horizontal"
/>
```

**Insights to discover:**
- Device types performing better in specific countries
- Geographic expansion opportunities
- Budget reallocation opportunities

### 5. Quality Score Impact Analysis

Correlate quality metrics with performance:

```tsx
<ParallelChart
  query={{
    measures: [
      'GoogleAds.qualityScore',
      'GoogleAds.impressions',
      'GoogleAds.ctr',
      'GoogleAds.cpc',
      'GoogleAds.conversionRate',
      'GoogleAds.costPerConversion',
    ],
    dimensions: ['GoogleAds.adGroupName'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 30 days',
    }],
    filters: [{
      member: 'GoogleAds.impressions',
      operator: 'gt',
      values: ['500'],
    }],
    limit: 40,
  }}
  axes={[
    { name: 'GoogleAds.adGroupName', label: 'Ad Group', type: 'category' },
    { name: 'GoogleAds.qualityScore', label: 'Quality Score', min: 1, max: 10 },
    { name: 'GoogleAds.impressions', label: 'Impressions' },
    { name: 'GoogleAds.ctr', label: 'CTR' },
    { name: 'GoogleAds.cpc', label: 'CPC' },
    { name: 'GoogleAds.conversionRate', label: 'Conv Rate' },
    { name: 'GoogleAds.costPerConversion', label: 'CPA', inverse: true },
  ]}
  colorByDimension="GoogleAds.qualityScore"
  colorScheme={['#ff4444', '#ffaa00', '#ffff00', '#88ff00', '#00ff00']}
/>
```

**Insights to discover:**
- Quality Score's impact on CPC and CPA
- Low Quality Score ad groups needing optimization
- High-performing ads despite lower Quality Scores

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `query` | `Query` | **required** | Cube.js query configuration |
| `axes` | `ParallelAxis[]` | **required** | Parallel axes configuration |
| `title` | `string` | - | Chart title |
| `description` | `string` | - | Chart description |
| `height` | `number` | `500` | Chart height in pixels |
| `smooth` | `boolean` | `false` | Enable smooth lines |
| `lineOpacity` | `number` | `0.4` | Line opacity (0-1) |
| `colorScheme` | `string[]` | ECharts default | Color palette for lines |
| `colorByDimension` | `string` | - | Dimension/measure to color by |
| `enableBrush` | `boolean` | `true` | Enable interactive brushing |
| `layout` | `'horizontal'` \| `'vertical'` | `'horizontal'` | Axis layout direction |
| `transformData` | `function` | - | Custom data transformer |
| `refreshInterval` | `number` | - | Auto-refresh interval (ms) |
| `loadingVariant` | `'default'` \| `'minimal'` | `'default'` | Loading skeleton style |
| `showExport` | `boolean` | `false` | Show export buttons |
| `customOptions` | `Partial<EChartsOption>` | - | Custom ECharts options |
| `onLineClick` | `function` | - | Line click handler |
| `onBrushSelect` | `function` | - | Brush selection handler |

### ParallelAxis Configuration

```typescript
interface ParallelAxis {
  name: string;              // Dimension/measure name from Cube.js
  label: string;             // Display label
  type?: 'value' | 'category'; // Axis type
  min?: number | 'dataMin';  // Min value (numeric axes)
  max?: number | 'dataMax';  // Max value (numeric axes)
  inverse?: boolean;         // Inverse axis direction
  formatter?: (value: number | string) => string; // Value formatter
}
```

### Built-in Formatters

```typescript
import { ParallelChartFormatters } from './ParallelChart';

// Number formatting (1000 → 1K, 1000000 → 1M)
ParallelChartFormatters.number(1500); // "1.5K"

// Currency formatting
ParallelChartFormatters.currency(1234.56); // "$1,234.56"

// Percentage formatting
ParallelChartFormatters.percent(12.345); // "12.35%"
```

## Advanced Features

### Custom Data Transformation

Apply custom calculations before visualization:

```tsx
<ParallelChart
  query={{ /* base query */ }}
  axes={[
    { name: 'campaignName', label: 'Campaign', type: 'category' },
    { name: 'efficiencyScore', label: 'Efficiency Score' },
    { name: 'costEfficiency', label: 'Cost Efficiency' },
  ]}
  transformData={(resultSet) => {
    return resultSet.tablePivot().map(row => {
      const ctr = (row.clicks / row.impressions) * 100;
      const roas = row.conversionValue / row.cost;
      const efficiencyScore = Math.min(100, ctr * 0.3 + roas * 20);

      return {
        ...row,
        efficiencyScore,
        costEfficiency: (row.conversions / row.cost) * 100,
      };
    });
  }}
/>
```

### Real-Time Updates

Enable auto-refresh for live monitoring:

```tsx
<ParallelChart
  query={{
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'today',
    }],
    limit: 20,
  }}
  axes={[/* ... */]}
  refreshInterval={5 * 60 * 1000} // Refresh every 5 minutes
/>
```

### Interactive Event Handling

Respond to user interactions:

```tsx
<ParallelChart
  query={{ /* ... */ }}
  axes={[/* ... */]}
  onLineClick={(dataIndex, data) => {
    console.log('Clicked line:', data);
    // Navigate to detail view, show modal, etc.
  }}
  onBrushSelect={(selectedIndices) => {
    console.log('Selected lines:', selectedIndices);
    // Filter other charts, export selection, etc.
  }}
/>
```

### Custom Color Mapping

Color lines based on performance:

```tsx
<ParallelChart
  query={{ /* ... */ }}
  axes={[/* ... */]}
  colorByDimension="GoogleAds.roas"
  colorScheme={[
    '#d73027', // Red (low ROAS)
    '#fc8d59',
    '#fee08b',
    '#d9ef8b',
    '#91cf60',
    '#1a9850', // Green (high ROAS)
  ]}
/>
```

## Performance Optimization

### Token-Efficient Queries

Always aggregate data in Cube.js, not in the browser:

```tsx
// ❌ BAD: Returns 50,000 rows
const query = {
  dimensions: ['GoogleAds.searchTerm'],
  measures: ['GoogleAds.clicks'],
  // No limit or aggregation
};

// ✅ GOOD: Returns top 100 aggregated rows
const query = {
  dimensions: ['GoogleAds.searchTerm'],
  measures: ['GoogleAds.clicks'],
  order: { 'GoogleAds.clicks': 'desc' },
  limit: 100,
};
```

### Cube.js Pre-Aggregations

Configure pre-aggregations for faster queries:

```javascript
// In Cube.js data model
cube('GoogleAds', {
  // ...
  preAggregations: {
    campaignMetrics: {
      measures: [impressions, clicks, cost, conversions],
      dimensions: [campaignName, device, country],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour',
      },
    },
  },
});
```

### Progressive Rendering

For large datasets, ECharts automatically enables progressive rendering:

```tsx
<ParallelChart
  query={{ /* ... */ }}
  axes={[/* ... */]}
  customOptions={{
    series: [{
      progressive: 500,        // Render 500 lines at a time
      progressiveThreshold: 500, // Enable for >500 lines
    }],
  }}
/>
```

## Accessibility

The component follows WCAG 2.1 AA standards:

- Keyboard navigation support
- Screen reader compatible tooltips
- Sufficient color contrast
- Focus indicators
- Semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Examples

See `ParallelChart.examples.tsx` for 9 complete use cases:

1. Campaign Performance Analysis
2. Paid vs Organic Search
3. Landing Page Quality
4. Device & Geographic Segmentation
5. Quality Score Correlation
6. Hourly Performance Patterns
7. Keyword Match Type Analysis
8. Custom Data Transformation
9. Real-Time Monitoring

## Troubleshooting

### Lines overlap too much

Reduce line opacity and enable smoothing:

```tsx
<ParallelChart
  lineOpacity={0.2}
  smooth={true}
/>
```

### Too many categories on axis

Limit data or use filters:

```tsx
query={{
  dimensions: ['GoogleAds.campaignName'],
  limit: 30, // Reduce number of lines
}}
```

### Colors not meaningful

Use `colorByDimension` to highlight a key metric:

```tsx
<ParallelChart
  colorByDimension="GoogleAds.roas"
  colorScheme={['#ff0000', '#00ff00']} // Red to green
/>
```

### Axis values hard to read

Apply custom formatters:

```tsx
axes={[
  {
    name: 'GoogleAds.cost',
    label: 'Cost',
    formatter: (value) => `$${(value / 1000).toFixed(1)}K`,
  },
]}
```

## Related Components

- `ScatterChart` - Two-dimensional correlation analysis
- `RadarChart` - Multi-metric comparison for few items
- `HeatmapChart` - Time-series multi-dimensional data
- `TableChart` - Detailed tabular data with sorting

## License

MIT

## Contributing

See the main project's contributing guidelines.
