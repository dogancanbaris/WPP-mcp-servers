# Chart Defaults System - Usage Examples

## Quick Reference Guide

This guide shows how to use the updated chart components with professional defaults.

---

## 1. Using Charts with Defaults (Zero Configuration)

Charts now work professionally out-of-the-box:

```tsx
// Bar Chart - automatically shows Top 20 by metric
<BarChart
  dataset_id="my-dataset"
  metrics={['clicks', 'impressions']}
  dimension="page"
/>

// Time Series - automatically chronological
<TimeSeriesChart
  dataset_id="my-dataset"
  metrics={['sessions']}
  dimension="date"
/>

// Funnel - automatically preserves sequence
<FunnelChart
  dataset_id="my-dataset"
  metrics={['conversions']}
  dimension="stage"
/>
```

---

## 2. Overriding Defaults

You can override any default:

```tsx
// Show Top 50 instead of Top 20
<BarChart
  dataset_id="my-dataset"
  metrics={['revenue']}
  dimension="product"
  limit={50}
/>

// Sort alphabetically instead of by value
<BarChart
  dataset_id="my-dataset"
  metrics={['sales']}
  dimension="category"
  sortBy="category"
  sortDirection="ASC"
/>

// Show all data (no limit)
<BarChart
  dataset_id="my-dataset"
  metrics={['clicks']}
  dimension="keyword"
  limit={null}
/>
```

---

## 3. Dynamic Sorting Examples

### Sort by Different Metrics

```tsx
// Sort by second metric
<BarChart
  dataset_id="my-dataset"
  metrics={['clicks', 'impressions']}
  dimension="device"
  sortBy="impressions"  // Uses second metric
  sortDirection="DESC"
/>

// Sort by dimension name
<BarChart
  dataset_id="my-dataset"
  metrics={['revenue']}
  dimension="region"
  sortBy="region"  // Alphabetical
  sortDirection="ASC"
/>
```

---

## 4. Chart-Specific Defaults

### Ranking Charts (Top N)
```tsx
// Bar Chart: Top 20 by default
<BarChart {...props} />
// Default: sortBy="metric", sortDirection="DESC", limit=20

// Treemap: Top 20 by default
<TreemapChart {...props} />
// Default: sortBy="metric", sortDirection="DESC", limit=20

// Stacked Bar: Top 15 by default
<StackedBarChart {...props} />
// Default: sortBy="metric", sortDirection="DESC", limit=15
```

### Time-Series Charts (Chronological)
```tsx
// Line Chart: All data, chronological
<LineChart {...props} />
// Default: sortBy="date", sortDirection="ASC", limit=null

// Area Chart: All data, chronological
<AreaChart {...props} />
// Default: sortBy="date", sortDirection="ASC", limit=null

// Time Series: All data, chronological
<TimeSeriesChart {...props} />
// Default: sortBy="date", sortDirection="ASC", limit=null
```

### Sequential Charts (Preserve Order)
```tsx
// Funnel: All steps in order
<FunnelChart {...props} />
// Default: sortBy="dimension", sortDirection="ASC", limit=null
```

### Categorical Charts (Alphabetical)
```tsx
// Heatmap: Alphabetical
<HeatmapChart {...props} />
// Default: sortBy="dimension", sortDirection="ASC", limit=null

// Radar: Alphabetical
<RadarChart {...props} />
// Default: sortBy="dimension", sortDirection="ASC", limit=null
```

---

## 5. Programmatic Defaults

If you need to apply defaults programmatically:

```tsx
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';

function MyComponent() {
  // Get defaults for a chart type
  const defaults = getChartDefaults('bar_chart');
  // Returns: { sortBy: 'metric', sortDirection: 'DESC', limit: 20 }

  // Resolve sortBy to actual field name
  const sortField = resolveSortField(
    defaults.sortBy,
    ['clicks', 'impressions'],
    'page'
  );
  // Returns: 'clicks' (first metric)

  return (
    <BarChart
      dataset_id="my-dataset"
      metrics={['clicks', 'impressions']}
      dimension="page"
      sortBy={sortField}
      sortDirection={defaults.sortDirection}
      limit={defaults.limit}
    />
  );
}
```

---

## 6. Common Use Cases

### E-commerce Dashboard
```tsx
// Top Products by Revenue
<BarChart
  dataset_id="sales"
  metrics={['revenue']}
  dimension="product_name"
  limit={10}  // Top 10 only
  title="Top 10 Products"
/>

// Sales Trend (Last 30 Days)
<TimeSeriesChart
  dataset_id="sales"
  metrics={['revenue', 'orders']}
  dimension="date"
  // No limit needed - shows all days
/>

// Regional Performance Heatmap
<HeatmapChart
  dataset_id="sales"
  metrics={['revenue']}
  xAxisDimension="date"
  yAxisDimension="region"
  // Automatically alphabetical by region
/>
```

### Marketing Analytics
```tsx
// Top Performing Keywords
<BarChart
  dataset_id="search-ads"
  metrics={['clicks', 'conversions']}
  dimension="keyword"
  sortBy="conversions"  // Sort by conversions, not clicks
  limit={20}
/>

// Campaign Funnel
<FunnelChart
  dataset_id="campaigns"
  metrics={['users']}
  dimension="stage"
  // Preserves stage order automatically
/>

// Device Performance Radar
<RadarChart
  dataset_id="analytics"
  metrics={['sessions', 'bounceRate', 'avgSessionDuration']}
  dimension="deviceCategory"
  // Alphabetical: Desktop, Mobile, Tablet
/>
```

### SEO Dashboard
```tsx
// Top Pages by Traffic
<TreemapChart
  dataset_id="gsc"
  metrics={['clicks']}
  dimensions={['page']}
  limit={25}  // Show top 25
/>

// Keyword Ranking Trends
<LineChart
  dataset_id="rankings"
  metrics={['avgPosition']}
  dimension="date"
  sortDirection="ASC"  // Oldest to newest
/>

// CTR by Position
<BarChart
  dataset_id="gsc"
  metrics={['ctr']}
  dimension="position"
  sortBy="position"  // Sort by position, not CTR
  sortDirection="ASC"
  limit={10}  // Top 10 positions
/>
```

---

## 7. Advanced: Conditional Defaults

```tsx
function SmartChart({ chartType, ...props }) {
  const defaults = getChartDefaults(chartType);

  // Apply different limits based on screen size
  const isMobile = window.innerWidth < 768;
  const limit = isMobile
    ? Math.floor(defaults.limit * 0.5)  // Show half on mobile
    : defaults.limit;

  return (
    <BarChart
      {...props}
      limit={limit}
      sortBy={defaults.sortBy}
      sortDirection={defaults.sortDirection}
    />
  );
}
```

---

## 8. Debugging Tips

### Check Applied Defaults
```tsx
import { getChartDefaults } from '@/lib/defaults/chart-defaults';

const defaults = getChartDefaults('bar_chart');
console.log('Defaults:', defaults);
// Logs: { sortBy: 'metric', sortDirection: 'DESC', limit: 20, ... }
```

### Verify API Calls
Open browser DevTools → Network tab → Filter by "query"
Check query string parameters:
```
?chartType=bar_chart&sortBy=clicks&sortDirection=DESC&limit=20
```

### Hook Debugging
The `usePageData` hook logs all parameters:
```
[usePageData] Fetching: {
  chartType: 'bar_chart',
  sortBy: 'clicks',
  sortDirection: 'DESC',
  limit: 20
}
```

---

## 9. Props Reference

### All Charts Support
```typescript
interface ChartProps {
  // Required
  dataset_id: string;
  metrics: string[];
  dimension?: string;

  // Professional Defaults (NEW)
  sortBy?: string;           // 'metric' | 'dimension' | 'date' | field name
  sortDirection?: 'ASC' | 'DESC';
  limit?: number | null;     // null = no limit

  // Display
  title?: string;
  showTitle?: boolean;
  showLegend?: boolean;

  // ... chart-specific props
}
```

---

## 10. Migration Guide (For Existing Charts)

### Before (Old Way)
```tsx
// Manual sorting and limiting
<BarChart
  dataset_id="my-dataset"
  metrics={['clicks']}
  dimension="page"
  // Had to manually handle sorting in parent component
/>
```

### After (New Way)
```tsx
// Automatic professional defaults
<BarChart
  dataset_id="my-dataset"
  metrics={['clicks']}
  dimension="page"
  // Automatically shows Top 20 by clicks DESC
/>

// Or override as needed
<BarChart
  dataset_id="my-dataset"
  metrics={['clicks']}
  dimension="page"
  sortBy="page"
  sortDirection="ASC"
  limit={50}
/>
```

---

## Chart Type Reference

| Chart Type | Default sortBy | Default Direction | Default Limit |
|------------|---------------|-------------------|---------------|
| bar_chart | metric | DESC | 20 |
| line_chart | date | ASC | null |
| time_series | date | ASC | null |
| area_chart | date | ASC | null |
| stacked_bar | metric | DESC | 15 |
| stacked_column | metric | DESC | 15 |
| treemap | metric | DESC | 20 |
| funnel_chart | dimension | ASC | null |
| heatmap | dimension | ASC | null |
| radar | dimension | ASC | null |
| table | metric | DESC | 100 |
| pie_chart | metric | DESC | 10 |

---

## Need Help?

- Check `/lib/defaults/chart-defaults.ts` for complete defaults
- See `TableChart.tsx` for reference implementation
- Review `CHART_DEFAULTS_MIGRATION_COMPLETE.md` for technical details
