# SunburstChart Quick Start Guide

## 5-Minute Setup

### 1. Basic Import

```tsx
import { SunburstChart } from '@/components/dashboard-builder/charts';
```

### 2. Minimal Configuration

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.clicks']}
/>
```

This will show a single-level sunburst (just campaigns).

### 3. Three-Level Hierarchy (Campaign → Ad Group → Keyword)

```tsx
<SunburstChart
  datasource="google_ads_performance"
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.keyword"
  metrics={['GoogleAds.clicks']}
  dateRange="Last 30 days"
  title="Campaign Performance Hierarchy"
/>
```

### 4. Common Use Cases

#### A. Cost Distribution

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.keyword"
  metrics={['GoogleAds.cost']}
  dateRange="Last 7 days"
  title="Spend Distribution"
  metricsConfig={[
    { id: 'GoogleAds.cost', format: 'currency', decimals: 2, compact: true }
  ]}
/>
```

#### B. Device → Location Breakdown

```tsx
<SunburstChart
  dimension="GoogleAds.device"
  breakdownDimension="GoogleAds.location"
  metrics={['GoogleAds.impressions']}
  title="Impressions by Device & Location"
  chartColors={['#1e88e5', '#43a047', '#fb8c00']}
/>
```

#### C. Conversion Funnel

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.conversionName"
  metrics={['GoogleAds.conversions']}
  title="Conversion Distribution"
  highlightPolicy="ancestor"
  showBreadcrumb={true}
/>
```

### 5. Customization

#### Change Size and Position

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.clicks']}
  sunburstRadius={['20%', '85%']}  // [inner, outer]
  sunburstCenter={['50%', '50%']}  // [x, y]
/>
```

#### Custom Colors

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.clicks']}
  chartColors={[
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6'
  ]}
/>
```

#### Styling

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.clicks']}
  backgroundColor="#fafafa"
  showBorder={true}
  borderColor="#e0e0e0"
  borderRadius={12}
  showShadow={true}
  padding={20}
/>
```

### 6. Interaction Options

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  metrics={['GoogleAds.clicks']}

  // Highlight behavior
  highlightPolicy="ancestor"  // 'ancestor' | 'descendant' | 'self'

  // Click behavior
  nodeClick="rootToNode"  // 'rootToNode' | 'link' | false

  // Show navigation
  showBreadcrumb={true}
/>
```

### 7. Filtering

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  metrics={['GoogleAds.clicks']}
  dateRange="Last 30 days"
  filters={[
    {
      field: 'GoogleAds.status',
      operator: 'equals',
      values: ['ENABLED']
    },
    {
      field: 'GoogleAds.clicks',
      operator: 'gt',
      values: ['100']
    }
  ]}
/>
```

## Common Patterns

### Pattern 1: Executive Dashboard (Clean, Minimal)

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  metrics={['GoogleAds.cost']}
  title=""
  showTitle={false}
  sunburstRadius={['10%', '95%']}
  backgroundColor="transparent"
  showBorder={false}
  chartColors={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']}
/>
```

### Pattern 2: Detailed Analysis (Full Features)

```tsx
<SunburstChart
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.keyword"
  metrics={['GoogleAds.clicks']}
  title="Campaign Performance Deep Dive"
  showTitle={true}
  titleFontSize="18"
  titleFontWeight="700"
  sunburstRadius={['20%', '88%']}
  highlightPolicy="ancestor"
  nodeClick="rootToNode"
  showBreadcrumb={true}
  backgroundColor="#ffffff"
  showBorder={true}
  borderColor="#d1d5db"
  borderWidth={2}
  borderRadius={16}
  showShadow={true}
  shadowBlur={20}
  padding={24}
/>
```

### Pattern 3: Custom Level Styling (Advanced)

```tsx
const customLevels = [
  { itemStyle: { borderWidth: 0 } },  // Root
  {
    r0: '20%', r: '40%',
    itemStyle: { borderWidth: 3, borderColor: '#fff' },
    label: { fontSize: 14, fontWeight: 'bold' }
  },
  {
    r0: '40%', r: '70%',
    itemStyle: { borderWidth: 2, borderColor: '#fff' },
    label: { fontSize: 12 }
  },
  {
    r0: '70%', r: '88%',
    itemStyle: { borderWidth: 4, borderColor: '#fff' },
    label: { fontSize: 10, position: 'outside' }
  }
];

<SunburstChart
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  tertiaryDimension="GoogleAds.keyword"
  metrics={['GoogleAds.clicks']}
  levels={customLevels}
/>
```

## Props Reference (Most Used)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dimension` | `string` | `null` | **Required.** Primary level |
| `breakdownDimension` | `string` | `null` | Secondary level (optional) |
| `tertiaryDimension` | `string` | `null` | Tertiary level (optional) |
| `metrics` | `string[]` | `[]` | **Required.** Metric array |
| `dateRange` | `string` | - | Date range filter |
| `filters` | `FilterConfig[]` | `[]` | Additional filters |
| `sunburstRadius` | `[string, string]` | `['15%', '90%']` | Inner/outer radius |
| `sunburstCenter` | `[string, string]` | `['50%', '50%']` | Center position |
| `highlightPolicy` | `'ancestor' \| 'descendant' \| 'self'` | `'ancestor'` | Hover behavior |
| `nodeClick` | `'rootToNode' \| 'link' \| false` | `'rootToNode'` | Click behavior |
| `showBreadcrumb` | `boolean` | `true` | Show breadcrumbs |
| `chartColors` | `string[]` | ECharts default | Color palette |

## Troubleshooting

### Chart is empty
- Check that `dimension` is provided
- Verify `metrics` array has at least one metric
- Check Cube.js data source configuration

### Hierarchy not forming
- Ensure `breakdownDimension` is provided for 2 levels
- Verify data has parent-child relationships
- Check that all dimension fields exist in data

### Performance issues
- Reduce date range
- Add filters to limit data
- Configure Cube.js pre-aggregations

### Labels overlapping
- Increase `sunburstRadius` spacing
- Use custom `levels` with smaller font sizes
- Set `showBreadcrumb={false}` for cleaner look

## Next Steps

1. Read full documentation: [SunburstChart.md](./SunburstChart.md)
2. See examples: [SunburstChart.example.tsx](./SunburstChart.example.tsx)
3. Run tests: [SunburstChart.test.tsx](./SunburstChart.test.tsx)
4. Check spec: [COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md](../../../COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md)
