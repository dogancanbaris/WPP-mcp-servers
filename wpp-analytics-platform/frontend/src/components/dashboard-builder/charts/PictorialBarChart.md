# PictorialBarChart Component

## Overview

The PictorialBarChart is an advanced visualization component that creates bars composed of repeated symbols or images. This provides a more engaging, infographic-style visualization compared to traditional bar charts, making it perfect for storytelling with data.

## Features

- **Multiple Symbol Types**: circle, roundRect, triangle, diamond, star, pin, arrow, rect
- **Symbol Repetition**: Create bars from repeated symbols for visual impact
- **Dual Orientation**: Vertical or horizontal bar layouts
- **Cube.js Integration**: Real-time data from BigQuery via semantic layer
- **Custom Styling**: Full control over colors, sizing, spacing, and appearance
- **Responsive Design**: Adapts to container size and screen resolution
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML and ARIA labels

## Installation

The component is already part of the dashboard builder chart library:

```tsx
import { PictorialBarChart } from '@/components/dashboard-builder/charts';
```

## Basic Usage

### Simple Vertical Bar Chart

```tsx
<PictorialBarChart
  title="User Sessions by Device"
  datasource="google_analytics_sessions"
  dimension="GoogleAnalytics.deviceCategory"
  metrics={['GoogleAnalytics.sessions']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
  symbolType="roundRect"
  orientation="vertical"
/>
```

### Horizontal Bar Chart (Better for Long Labels)

```tsx
<PictorialBarChart
  title="Top Landing Pages by Clicks"
  datasource="gsc_performance"
  dimension="GSC.page"
  metrics={['GSC.clicks']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
  symbolType="diamond"
  orientation="horizontal"
/>
```

## Symbol Types Guide

### When to Use Each Symbol

| Symbol | Best For | Example Use Cases |
|--------|----------|-------------------|
| `circle` | Users, sessions, generic counts | User sessions, page views |
| `roundRect` | Standard bars with polish | Revenue, conversions, general metrics |
| `triangle` | Growth, trends, directional data | Revenue growth, traffic increases |
| `diamond` | Highlights, premium metrics | High-value conversions, VIP users |
| `star` | Ratings, quality, favorites | Quality scores, review ratings |
| `pin` | Geographic, location data | Regional traffic, store locations |
| `arrow` | Traffic sources, flows | Referral sources, navigation paths |
| `rect` | Traditional, clean bars | Budget allocation, time spent |

## Props API

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasource` | `string` | `'gsc_performance_7days'` | Cube.js datasource name |
| `dimension` | `string` | `null` | Category dimension (e.g., 'GoogleAds.campaignName') |
| `breakdownDimension` | `string` | `null` | Optional second dimension for grouping |
| `metrics` | `string[]` | `[]` | Array of metric names to display |
| `filters` | `Filter[]` | `[]` | Additional query filters |
| `dateRange` | `{start: string, end: string}` | `undefined` | Date range filter |

### Title Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Pictorial Bar Chart'` | Chart title |
| `showTitle` | `boolean` | `true` | Show/hide title |
| `titleFontFamily` | `string` | `'roboto'` | Font family for title |
| `titleFontSize` | `string` | `'16'` | Font size in pixels |
| `titleFontWeight` | `string` | `'600'` | Font weight (400-900) |
| `titleColor` | `string` | `'#111827'` | Title text color |
| `titleBackgroundColor` | `string` | `'transparent'` | Title background color |
| `titleAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Title alignment |

### Container Style Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `'#ffffff'` | Container background color |
| `showBorder` | `boolean` | `true` | Show container border |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderWidth` | `number` | `1` | Border width in pixels |
| `borderRadius` | `number` | `8` | Border radius in pixels |
| `showShadow` | `boolean` | `false` | Show box shadow |
| `shadowColor` | `string` | `'#000000'` | Shadow color |
| `shadowBlur` | `number` | `10` | Shadow blur radius |
| `padding` | `number` | `16` | Internal padding in pixels |

### Chart Appearance Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLegend` | `boolean` | `true` | Show/hide legend |
| `chartColors` | `string[]` | `['#5470c6', '#91cc75', ...]` | Color palette for series |
| `metricsConfig` | `MetricConfig[]` | `[]` | Metric formatting configuration |

### Pictorial Bar Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `symbolType` | `SymbolType` | `'roundRect'` | Symbol shape: circle, rect, roundRect, triangle, diamond, pin, arrow, star |
| `symbolRepeat` | `boolean` | `true` | Whether to repeat symbols to fill bar |
| `symbolMargin` | `number \| string` | `'5%'` | Gap between repeated symbols (pixels or percentage) |
| `symbolSize` | `number \| string \| [number, number]` | `['100%', '80%']` | Symbol size (width, height) |
| `symbolClip` | `boolean` | `true` | Clip symbols at exact value boundary |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Bar orientation |

## Advanced Examples

### Multiple Metrics with Different Symbols

```tsx
<PictorialBarChart
  title="Campaign Performance Comparison"
  datasource="google_ads_campaigns"
  dimension="GoogleAds.campaignName"
  metrics={[
    'GoogleAds.clicks',
    'GoogleAds.conversions'
  ]}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

  // Each metric gets a different symbol automatically
  symbolRepeat={true}
  symbolMargin="5%"
  symbolSize={['100%', '75%']}

  showLegend={true}
  chartColors={['#5470c6', '#91cc75']}

  metricsConfig={[
    {
      name: 'GoogleAds.clicks',
      format: 'number',
      decimalPlaces: 0
    },
    {
      name: 'GoogleAds.conversions',
      format: 'number',
      decimalPlaces: 1
    }
  ]}
/>
```

### Star Rating Visualization

```tsx
<PictorialBarChart
  title="Quality Score Distribution"
  datasource="google_ads_keywords"
  dimension="GoogleAds.qualityScore"
  metrics={['GoogleAds.keywords']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

  symbolType="star"
  symbolRepeat={true}
  symbolMargin="5%"
  symbolSize={['100%', '80%']}

  chartColors={['#fbbf24', '#f59e0b', '#d97706', '#b45309']}
/>
```

### Geographic Data with Pin Symbols

```tsx
<PictorialBarChart
  title="Sessions by Region"
  datasource="google_analytics_geo"
  dimension="GoogleAnalytics.country"
  metrics={['GoogleAnalytics.sessions']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

  symbolType="pin"
  symbolRepeat={true}
  symbolMargin="6%"
  symbolSize={['100%', '75%']}

  chartColors={['#ee6666']}
/>
```

### Custom Styled Container

```tsx
<PictorialBarChart
  title="Premium Metric Dashboard"
  showTitle={true}
  titleFontFamily="inter"
  titleFontSize="18"
  titleFontWeight="700"
  titleColor="#1f2937"
  titleAlignment="center"

  datasource="google_ads_campaigns"
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.conversions']}
  dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

  symbolType="diamond"
  symbolRepeat={true}

  backgroundColor="#f9fafb"
  showBorder={true}
  borderColor="#d1d5db"
  borderWidth={2}
  borderRadius={12}
  showShadow={true}
  shadowColor="rgba(0, 0, 0, 0.1)"
  shadowBlur={15}
  padding={20}
/>
```

## Cube.js Query Structure

The component automatically builds optimized Cube.js queries:

```javascript
{
  measures: ['GoogleAds.clicks', 'GoogleAds.conversions'],
  dimensions: ['GoogleAds.campaignName'],
  filters: [
    {
      member: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['2025-01-01', '2025-01-31']
    }
  ],
  order: {
    'GoogleAds.clicks': 'desc'
  },
  limit: 20
}
```

### Key Query Features:

- **Category Dimensions**: Uses non-time dimensions (campaigns, devices, pages)
- **Date Filtering**: Date range applied via filters, not timeDimensions
- **Auto-Ordering**: Sorts by first metric descending (ranking)
- **Token-Efficient**: Limits to top 20 for readability and performance

## Performance Optimization

### Best Practices

1. **Limit Categories**: Keep to 20 or fewer categories
2. **Use Symbol Repeat**: Creates more engaging visuals
3. **Symbol Clipping**: Enable `symbolClip` for consistent scale
4. **Canvas Renderer**: Used by default for better symbol quality
5. **Pre-Aggregations**: Define in Cube.js for faster queries

### Query Optimization

```javascript
// In your Cube.js schema
cube('GoogleAds', {
  preAggregations: {
    campaignMetrics: {
      measures: ['clicks', 'conversions', 'cost'],
      dimensions: ['campaignName'],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
    }
  }
});
```

## Accessibility

The component follows WCAG 2.1 AA guidelines:

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support via ECharts
- **Color Contrast**: Ensures sufficient contrast ratios
- **Tooltips**: Detailed information on hover/focus

### Accessibility Example

```tsx
<PictorialBarChart
  title="Sessions by Device (Accessible)"
  // Clear, descriptive title for screen readers

  datasource="google_analytics_sessions"
  dimension="GoogleAnalytics.deviceCategory"
  metrics={['GoogleAnalytics.sessions']}

  // High contrast colors for visibility
  chartColors={['#1d4ed8', '#059669', '#dc2626']}

  // Large symbols for visibility
  symbolSize={['100%', '90%']}

  // Clear labeling
  metricsConfig={[
    {
      name: 'GoogleAnalytics.sessions',
      format: 'number',
      decimalPlaces: 0,
      label: 'User Sessions'
    }
  ]}
/>
```

## Common Use Cases

### 1. Device Performance

```tsx
<PictorialBarChart
  title="User Engagement by Device"
  datasource="google_analytics_sessions"
  dimension="GoogleAnalytics.deviceCategory"
  metrics={['GoogleAnalytics.sessions']}
  symbolType="roundRect"
/>
```

### 2. User Types

```tsx
<PictorialBarChart
  title="New vs Returning Users"
  datasource="google_analytics_users"
  dimension="GoogleAnalytics.userType"
  metrics={['GoogleAnalytics.activeUsers']}
  symbolType="circle"
/>
```

### 3. Campaign ROI

```tsx
<PictorialBarChart
  title="Top Campaigns by ROAS"
  datasource="google_ads_campaigns"
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.roas']}
  symbolType="star"
/>
```

### 4. Traffic Sources

```tsx
<PictorialBarChart
  title="Traffic by Source/Medium"
  datasource="google_analytics_traffic"
  dimension="GoogleAnalytics.sourceMedium"
  metrics={['GoogleAnalytics.sessions']}
  symbolType="arrow"
  orientation="horizontal"
/>
```

### 5. Geographic Analysis

```tsx
<PictorialBarChart
  title="Sessions by Country"
  datasource="google_analytics_geo"
  dimension="GoogleAnalytics.country"
  metrics={['GoogleAnalytics.sessions']}
  symbolType="pin"
/>
```

## Troubleshooting

### Common Issues

**Problem**: Symbols too small to see
```tsx
// Solution: Increase symbolSize
symbolSize={['120%', '100%']}
```

**Problem**: Too many bars, chart is crowded
```tsx
// Solution: Add limit to query or use horizontal orientation
filters={[
  { field: 'GoogleAds.clicks', operator: 'gt', values: ['100'] }
]}
```

**Problem**: Symbols overlap
```tsx
// Solution: Increase symbolMargin
symbolMargin="10%"
```

**Problem**: Colors not distinctive enough
```tsx
// Solution: Use high-contrast color palette
chartColors={['#1d4ed8', '#dc2626', '#059669', '#f59e0b']}
```

## Integration with Dashboard Builder

The PictorialBarChart integrates seamlessly with the dashboard builder:

1. **Drag & Drop**: Available in chart palette
2. **Configuration Panel**: All props accessible via UI
3. **Live Preview**: See changes in real-time
4. **Responsive Grid**: Adapts to grid layout
5. **Export**: Supports PNG, SVG, PDF export

## Related Components

- **BarChart**: Traditional bar chart (no symbols)
- **BubbleChart**: For 3-dimensional data
- **ScatterChart**: For correlation analysis
- **FunnelChart**: For conversion funnels

## Version History

- **v1.0.0** (2025-10-22): Initial release with full Cube.js integration

## Support

For issues or questions:
- Documentation: `/docs/architecture/PROJECT-BACKBONE.md`
- Examples: `PictorialBarChart.example.tsx`
- GitHub Issues: [Report a bug](https://github.com/wpp-analytics/issues)
