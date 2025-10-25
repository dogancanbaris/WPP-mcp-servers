# ParallelChart - Quick Start Guide

## 5-Minute Integration

### Step 1: Install Dependencies (30 seconds)

```bash
npm install echarts echarts-for-react @cubejs-client/react @cubejs-client/core
```

### Step 2: Import Component (10 seconds)

```tsx
import { ParallelChart, ParallelChartFormatters } from './components/dashboard-builder/charts/ParallelChart';
```

### Step 3: Define Your Query (2 minutes)

```tsx
const query = {
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
  limit: 50, // Top 50 campaigns
};
```

### Step 4: Configure Axes (2 minutes)

```tsx
const axes = [
  {
    name: 'GoogleAds.campaignName',
    label: 'Campaign',
    type: 'category',
  },
  {
    name: 'GoogleAds.impressions',
    label: 'Impressions',
    formatter: ParallelChartFormatters.number,
  },
  {
    name: 'GoogleAds.clicks',
    label: 'Clicks',
    formatter: ParallelChartFormatters.number,
  },
  {
    name: 'GoogleAds.cost',
    label: 'Cost',
    formatter: ParallelChartFormatters.currency,
  },
  {
    name: 'GoogleAds.conversions',
    label: 'Conversions',
    formatter: ParallelChartFormatters.number,
  },
];
```

### Step 5: Render Component (30 seconds)

```tsx
function MyDashboard() {
  return (
    <ParallelChart
      query={query}
      axes={axes}
      title="Campaign Performance"
      height={600}
    />
  );
}
```

## That's It! 🎉

You now have a fully functional multi-dimensional parallel coordinates chart with:
- ✅ Live data from Cube.js
- ✅ Interactive brushing
- ✅ Formatted axes
- ✅ Responsive design
- ✅ Loading & error states

## Common Enhancements

### Add Color Mapping

```tsx
<ParallelChart
  query={query}
  axes={axes}
  colorByDimension="GoogleAds.conversions"
  colorScheme={['#ff4444', '#00ff00']}
/>
```

### Enable Export

```tsx
<ParallelChart
  query={query}
  axes={axes}
  showExport={true}
/>
```

### Real-Time Updates

```tsx
<ParallelChart
  query={query}
  axes={axes}
  refreshInterval={5 * 60 * 1000} // 5 minutes
/>
```

### Handle Clicks

```tsx
<ParallelChart
  query={query}
  axes={axes}
  onLineClick={(index, data) => {
    console.log('Campaign clicked:', data['GoogleAds.campaignName']);
    // Navigate to detail view
  }}
/>
```

## Ready-to-Use Examples

### 1. Campaign Performance (Copy-Paste Ready)

```tsx
import React from 'react';
import { ParallelChart, ParallelChartFormatters } from './ParallelChart';

export const CampaignPerformance = () => (
  <ParallelChart
    query={{
      measures: [
        'GoogleAds.impressions',
        'GoogleAds.clicks',
        'GoogleAds.cost',
        'GoogleAds.conversions',
        'GoogleAds.roas',
      ],
      dimensions: ['GoogleAds.campaignName'],
      timeDimensions: [{
        dimension: 'GoogleAds.date',
        dateRange: 'last 30 days',
      }],
      order: { 'GoogleAds.cost': 'desc' },
      limit: 50,
    }}
    axes={[
      { name: 'GoogleAds.campaignName', label: 'Campaign', type: 'category' },
      { name: 'GoogleAds.impressions', label: 'Impressions', formatter: ParallelChartFormatters.number },
      { name: 'GoogleAds.clicks', label: 'Clicks', formatter: ParallelChartFormatters.number },
      { name: 'GoogleAds.cost', label: 'Cost', formatter: ParallelChartFormatters.currency },
      { name: 'GoogleAds.conversions', label: 'Conversions', formatter: ParallelChartFormatters.number },
      { name: 'GoogleAds.roas', label: 'ROAS', formatter: (v) => `${v.toFixed(2)}x` },
    ]}
    title="Campaign Performance Analysis"
    height={600}
    colorByDimension="GoogleAds.roas"
    colorScheme={['#ff4444', '#ffaa00', '#88ff00', '#00ff00']}
    enableBrush={true}
    showExport={true}
  />
);
```

### 2. Device Performance (Copy-Paste Ready)

```tsx
export const DevicePerformance = () => (
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
      { name: 'GoogleAds.impressions', label: 'Impressions', formatter: ParallelChartFormatters.number },
      { name: 'GoogleAds.ctr', label: 'CTR', formatter: ParallelChartFormatters.percent },
      { name: 'GoogleAds.cost', label: 'Cost', formatter: ParallelChartFormatters.currency },
      { name: 'GoogleAds.conversions', label: 'Conversions', formatter: ParallelChartFormatters.number },
      { name: 'GoogleAds.costPerConversion', label: 'CPA', formatter: ParallelChartFormatters.currency, inverse: true },
    ]}
    title="Device & Geographic Performance"
    height={550}
    smooth={true}
  />
);
```

### 3. Search Term Analysis (Copy-Paste Ready)

```tsx
export const SearchTermAnalysis = () => (
  <ParallelChart
    query={{
      measures: [
        'GoogleAds.impressions',
        'GoogleAds.clicks',
        'GoogleAds.cost',
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
      { name: 'GoogleAds.impressions', label: 'Paid Impr', formatter: ParallelChartFormatters.number },
      { name: 'GoogleAds.clicks', label: 'Paid Clicks', formatter: ParallelChartFormatters.number },
      { name: 'GoogleAds.cost', label: 'Cost', formatter: ParallelChartFormatters.currency },
      { name: 'SearchConsole.impressions', label: 'Organic Impr', formatter: ParallelChartFormatters.number },
      { name: 'SearchConsole.clicks', label: 'Organic Clicks', formatter: ParallelChartFormatters.number },
      { name: 'SearchConsole.position', label: 'Position', inverse: true },
    ]}
    title="Paid vs Organic Search Performance"
    height={600}
    lineOpacity={0.4}
  />
);
```

## Troubleshooting

### "Query is too slow"
**Solution:** Add `limit: 50` to your query

### "Too many lines overlap"
**Solution:** Reduce `lineOpacity` to 0.2-0.3

### "Categories don't fit on axis"
**Solution:** Reduce data with filters or lower limit

### "Can't see patterns"
**Solution:** Use `colorByDimension` to highlight key metric

## Next Steps

1. ✅ Copy one of the examples above
2. ✅ Replace measure/dimension names with your Cube.js schema
3. ✅ Adjust colors and formatting to match your brand
4. ✅ Test with sample data
5. ✅ Deploy to production

## Full Documentation

- **README.md** - Complete API reference and use cases
- **INTEGRATION.md** - Cube.js semantic layer setup
- **examples.tsx** - 9 complete working examples
- **SUMMARY.md** - Implementation overview

## Need Help?

Check the examples file for 9 complete use cases:
```tsx
import Examples from './ParallelChart.examples';

// See: CampaignPerformanceParallel
// See: SearchPerformanceParallel
// See: LandingPagePerformanceParallel
// ... and 6 more
```

---

**Time to first chart:** 5 minutes ⚡

**Lines of code needed:** ~30 lines 📝

**Customization options:** 20+ props 🎨

**Built-in examples:** 9 complete dashboards 📊
