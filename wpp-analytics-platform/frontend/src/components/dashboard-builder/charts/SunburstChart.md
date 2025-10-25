# SunburstChart Component

## Overview

The **SunburstChart** component visualizes hierarchical data using concentric radial layers. Perfect for displaying multi-level category breakdowns like Campaign → Ad Group → Keyword structures in Google Ads data.

Built with **Apache ECharts** and fully integrated with **Cube.js** semantic layer for real-time data queries.

## When to Use

✅ **Use SunburstChart when:**
- Visualizing 2-3 level hierarchies (e.g., Campaign → Ad Group → Keyword)
- Showing proportional relationships across organizational levels
- Enabling drill-down exploration of nested data
- Displaying budget allocation or performance distribution
- Analyzing part-to-whole relationships at multiple levels

❌ **Don't use SunburstChart when:**
- Data is flat (use PieChart instead)
- More than 3 hierarchy levels (becomes unreadable)
- Data has no clear parent-child relationships
- Exact value comparison is critical (use BarChart instead)
- Very few data points (sunburst is overkill)

## Features

### Core Capabilities
- **Hierarchical Data Transformation**: Automatically converts flat Cube.js data to tree structure
- **Interactive Drill-Down**: Click segments to zoom into sub-levels
- **Breadcrumb Navigation**: Navigate back through hierarchy levels
- **Smart Color Distribution**: Automatic color assignment across levels
- **Token-Efficient**: Handles 100-400 rows efficiently (aggregated in Cube.js)
- **Responsive Sizing**: Adapts to container dimensions
- **Custom Level Styling**: Fine-tune appearance per hierarchy level

### Visual Features
- Configurable radius (inner/outer bounds)
- Adjustable center positioning
- Customizable label rotation and positioning
- Emphasis effects (highlight ancestors/descendants)
- Border styling per level
- Font size/weight control per level

### Data Integration
- Real-time Cube.js queries
- Support for 1-3 hierarchical dimensions
- Single metric visualization (size by value)
- Date range filtering
- Custom filter support
- Automatic error handling

## Installation

```bash
npm install echarts echarts-for-react @cubejs-client/react
```

## Basic Usage

```tsx
import { SunburstChart } from '@/components/dashboard-builder/charts/SunburstChart';

function CampaignHierarchy() {
  return (
    <SunburstChart
      datasource="google_ads_performance"
      dimension="GoogleAds.campaignName"
      breakdownDimension="GoogleAds.adGroupName"
      tertiaryDimension="GoogleAds.keyword"
      metrics={['GoogleAds.clicks']}
      dateRange="Last 30 days"
      title="Campaign Performance Hierarchy"
    />
  );
}
```

## Props API

### Data Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasource` | `string` | `'google_ads_performance'` | Cube.js data source name |
| `dimension` | `string \| null` | `null` | **Required.** Primary level (e.g., campaign) |
| `breakdownDimension` | `string \| null` | `null` | Secondary level (e.g., ad group) |
| `tertiaryDimension` | `string \| null` | `null` | Tertiary level (e.g., keyword) |
| `metrics` | `string[]` | `[]` | **Required.** Single metric for sizing segments |
| `filters` | `Filter[]` | `[]` | Cube.js filter objects |
| `dateRange` | `string` | `undefined` | Date range for time dimension |

### Sunburst Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sunburstRadius` | `[string, string]` | `['15%', '90%']` | Inner and outer radius |
| `sunburstCenter` | `[string, string]` | `['50%', '50%']` | Center position [x, y] |
| `sort` | `'desc' \| 'asc' \| null` | `null` | Sort segments by value |
| `highlightPolicy` | `'descendant' \| 'ancestor' \| 'self'` | `'ancestor'` | Hover emphasis behavior |
| `nodeClick` | `'rootToNode' \| 'link' \| false` | `'rootToNode'` | Click behavior |
| `showBreadcrumb` | `boolean` | `true` | Show breadcrumb navigation |
| `levels` | `any[]` | `undefined` | Custom level configurations |

### Title & Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Hierarchical Performance'` | Chart title |
| `showTitle` | `boolean` | `true` | Display title |
| `titleFontFamily` | `string` | `'roboto'` | Title font family |
| `titleFontSize` | `string` | `'16'` | Title font size (px) |
| `titleFontWeight` | `string` | `'600'` | Title font weight |
| `titleColor` | `string` | `'#111827'` | Title text color |
| `titleBackgroundColor` | `string` | `'transparent'` | Title background |
| `titleAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Title alignment |

### Container Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `'#ffffff'` | Container background |
| `showBorder` | `boolean` | `true` | Show border |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderWidth` | `number` | `1` | Border width (px) |
| `borderRadius` | `number` | `8` | Border radius (px) |
| `showShadow` | `boolean` | `false` | Show shadow |
| `shadowColor` | `string` | `'#000000'` | Shadow color |
| `shadowBlur` | `number` | `10` | Shadow blur (px) |
| `padding` | `number` | `16` | Container padding (px) |

### Metrics & Colors

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metricsConfig` | `MetricConfig[]` | `[]` | Metric formatting config |
| `chartColors` | `string[]` | ECharts default | Color palette for segments |
| `showLegend` | `boolean` | `false` | Show legend (usually off) |

## Data Transformation

### Input: Flat Cube.js Data

```javascript
[
  { 'GoogleAds.campaignName': 'Campaign A', 'GoogleAds.adGroupName': 'Ad Group 1', 'GoogleAds.keyword': 'keyword 1', 'GoogleAds.clicks': 100 },
  { 'GoogleAds.campaignName': 'Campaign A', 'GoogleAds.adGroupName': 'Ad Group 1', 'GoogleAds.keyword': 'keyword 2', 'GoogleAds.clicks': 150 },
  { 'GoogleAds.campaignName': 'Campaign A', 'GoogleAds.adGroupName': 'Ad Group 2', 'GoogleAds.keyword': 'keyword 3', 'GoogleAds.clicks': 200 },
  { 'GoogleAds.campaignName': 'Campaign B', 'GoogleAds.adGroupName': 'Ad Group 3', 'GoogleAds.keyword': 'keyword 4', 'GoogleAds.clicks': 80 }
]
```

### Output: Hierarchical Tree Structure

```javascript
[
  {
    name: 'Campaign A',
    children: [
      {
        name: 'Ad Group 1',
        children: [
          { name: 'keyword 1', value: 100 },
          { name: 'keyword 2', value: 150 }
        ]
      },
      {
        name: 'Ad Group 2',
        children: [
          { name: 'keyword 3', value: 200 }
        ]
      }
    ]
  },
  {
    name: 'Campaign B',
    children: [
      {
        name: 'Ad Group 3',
        children: [
          { name: 'keyword 4', value: 80 }
        ]
      }
    ]
  }
]
```

## Examples

### 1. Campaign → Ad Group → Keyword

```tsx
<SunburstChart
  datasource="google_ads_performance"
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.keyword"
  metrics={['GoogleAds.clicks']}
  dateRange="Last 30 days"
  title="Campaign Performance Hierarchy"
  sunburstRadius={['20%', '90%']}
  highlightPolicy="ancestor"
  nodeClick="rootToNode"
  showBreadcrumb={true}
/>
```

### 2. Cost Distribution

```tsx
<SunburstChart
  datasource="google_ads_performance"
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.keyword"
  metrics={['GoogleAds.cost']}
  dateRange="Last 7 days"
  title="Spend Distribution"
  chartColors={['#ff6b6b', '#f06595', '#cc5de8', '#845ef7']}
  metricsConfig={[
    { id: 'GoogleAds.cost', format: 'currency', decimals: 2, compact: true }
  ]}
/>
```

### 3. Two-Level Hierarchy (Device → Location)

```tsx
<SunburstChart
  datasource="google_ads_performance"
  dimension="GoogleAds.device"
  breakdownDimension="GoogleAds.location"
  metrics={['GoogleAds.impressions']}
  dateRange="Last 14 days"
  title="Impressions by Device & Location"
  sunburstRadius={['25%', '80%']}
  chartColors={['#1e88e5', '#43a047', '#fb8c00', '#e53935']}
/>
```

### 4. Custom Level Styling

```tsx
const customLevels = [
  { itemStyle: { borderWidth: 0 } }, // Root - invisible
  {
    // Level 1: Campaigns
    r0: '20%',
    r: '40%',
    itemStyle: { borderWidth: 3, borderColor: '#ffffff' },
    label: { rotate: 'tangential', fontSize: 14, fontWeight: 'bold' }
  },
  {
    // Level 2: Ad Groups
    r0: '40%',
    r: '70%',
    itemStyle: { borderWidth: 2, borderColor: '#ffffff' },
    label: { align: 'right', fontSize: 12 }
  },
  {
    // Level 3: Keywords
    r0: '70%',
    r: '88%',
    itemStyle: { borderWidth: 4, borderColor: '#ffffff' },
    label: { position: 'outside', fontSize: 10 }
  }
];

<SunburstChart
  datasource="google_ads_performance"
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.keyword"
  metrics={['GoogleAds.clicks']}
  levels={customLevels}
  sunburstRadius={['20%', '88%']}
/>
```

## Cube.js Query Pattern

```javascript
// Automatic query generated by component
{
  measures: ['GoogleAds.clicks'],
  dimensions: [
    'GoogleAds.campaignName',
    'GoogleAds.adGroupName',
    'GoogleAds.keyword'
  ],
  timeDimensions: [{
    dimension: 'GoogleAds.date',
    dateRange: 'Last 30 days'
  }],
  order: {
    'GoogleAds.clicks': 'desc'
  },
  limit: 400 // Token-efficient limit
}
```

## Metric Formatting

```tsx
<SunburstChart
  datasource="google_ads_performance"
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  metrics={['GoogleAds.cost']}
  metricsConfig={[
    {
      id: 'GoogleAds.cost',
      format: 'currency',    // 'number' | 'currency' | 'percent' | 'duration'
      decimals: 2,           // Number of decimal places
      compact: true          // Use compact notation (1.2K vs 1200)
    }
  ]}
/>
```

## Interaction Behaviors

### Highlight Policies

- **`ancestor`** (default): Highlights path from clicked segment to root
- **`descendant`**: Highlights clicked segment and all children
- **`self`**: Only highlights clicked segment

### Click Behaviors

- **`rootToNode`** (default): Zoom to clicked segment
- **`link`**: Open link (if configured)
- **`false`**: Disable click interaction

## Performance Optimization

### Token Efficiency
```tsx
// ✅ GOOD: Aggregated in Cube.js, limited results
<SunburstChart
  datasource="google_ads_performance"
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  metrics={['GoogleAds.clicks']}
  // Component limits to 400 rows automatically
/>

// ❌ BAD: Would load raw data (handled by component limits)
// Component automatically applies limit: 400 for safety
```

### Pre-Aggregations

Configure in Cube.js for faster queries:

```javascript
// In Cube.js data model
cube('GoogleAds', {
  // ... dimensions and measures

  preAggregations: {
    campaignHierarchy: {
      measures: ['clicks', 'cost', 'conversions'],
      dimensions: ['campaignName', 'adGroupName', 'keyword'],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
    }
  }
});
```

## Styling Reference

### Default Level Styling

```javascript
[
  { itemStyle: { borderWidth: 0 } }, // Root
  { r0: '15%', r: '35%', label: { rotate: 'tangential', fontSize: 12, fontWeight: 'bold' } },
  { r0: '35%', r: '70%', label: { align: 'right', fontSize: 11 } },
  { r0: '70%', r: '90%', label: { position: 'outside', fontSize: 10 } }
]
```

### Custom Color Schemes

```tsx
// Gradient color scheme
chartColors={[
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6'
]}

// Blue shades
chartColors={[
  '#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb',
  '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'
]}

// Professional palette
chartColors={[
  '#5470c6', '#91cc75', '#fac858', '#ee6666',
  '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
]}
```

## Accessibility

- Tooltips provide context for each segment
- Keyboard navigation support (via ECharts)
- ARIA labels automatically applied
- High contrast colors recommended
- Test with screen readers

## Troubleshooting

### Chart Not Displaying

1. Check that `dimension` and `metrics` are provided
2. Verify Cube.js data source exists
3. Check browser console for errors
4. Ensure data is not empty

### Hierarchy Not Forming

1. Verify `breakdownDimension` is provided for 2+ levels
2. Check that dimensions have parent-child relationships
3. Ensure data contains all hierarchy levels
4. Review Cube.js query results in DevTools

### Performance Issues

1. Reduce date range to limit data volume
2. Add filters to narrow results
3. Configure Cube.js pre-aggregations
4. Check network tab for slow queries

### Labels Overlapping

1. Reduce `labelLineLength` and `labelLineLength2`
2. Adjust `sunburstRadius` to increase spacing
3. Set smaller `fontSize` in custom levels
4. Consider hiding labels for innermost level

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires Canvas API support (standard in all modern browsers).

## Related Components

- **PieChart**: Simple part-to-whole (no hierarchy)
- **TreemapChart**: Rectangular hierarchical layout
- **SankeyChart**: Flow-based hierarchical relationships

## References

- [Apache ECharts Sunburst Documentation](https://echarts.apache.org/en/option.html#series-sunburst)
- [Cube.js React SDK](https://cube.dev/docs/frontend-introduction)
- [WPP Analytics Platform Spec](../../../COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md)

## Version History

- **v1.0.0** (2025-01-22): Initial implementation
  - 3-level hierarchy support
  - Cube.js integration
  - Custom level styling
  - Interactive drill-down
  - Token-efficient data loading
