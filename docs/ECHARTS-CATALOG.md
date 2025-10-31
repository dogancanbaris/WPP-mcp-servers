# ECharts Complete Catalog - Chart Types & Migration Status

**Last Updated:** 2025-10-31
**ECharts Version:** 5.6.0
**Total Types Available:** 22

---

## Overview

ECharts provides a **rendering engine** with 22 built-in chart types. We build **React wrapper components** around these types to integrate with our agentic dashboard system.

### What ECharts Provides:
- ✅ Chart rendering engine (canvas/SVG)
- ✅ 22 series types (`series.type = 'bar'`, `'line'`, `'pie'`, etc.)
- ✅ Configuration API (option objects)
- ❌ NOT React components (we build these)
- ❌ NOT downloadable component source code

### What WE Build:
**React Wrapper Pattern:**
```typescript
export const ChartName: React.FC = (props) => {
  // 1. Fetch data from dataset API
  // 2. Transform to ECharts format
  // 3. Build option object
  // 4. Render with ReactECharts

  const option = {
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: values }]
  };

  return <ReactECharts option={option} />;
};
```

---

## Complete ECharts Series Types (22 total)

### ✅ **Currently Implemented (11 types using ECharts)**

| Type | Our Component | Status | Notes |
|------|---------------|--------|-------|
| `bar` | StackedBarChart | ✅ Working | Horizontal bars, ECharts-based |
| `bar` | StackedColumnChart | ✅ Working | Vertical bars, ECharts-based |
| `pie` | PieChart | ✅ Working | Pie/Donut charts |
| `funnel` | FunnelChart | ✅ Working | Conversion funnels |
| `heatmap` | HeatmapChart | ✅ Working | Matrix heatmaps |
| `sankey` | SankeyChart | ✅ Working | Flow diagrams |
| `treemap` | TreemapChart | ✅ Working | Hierarchical rectangles |
| `sunburst` | SunburstChart | ✅ Working | Radial hierarchy |
| `tree` | TreeChart | ✅ Working | Tree diagrams |
| `line` | TimeSeriesChart | ✅ Working | Time-series with zoom |
| `wordCloud` | WordCloudChart | ✅ Working | Word frequency (extension) |

### ⚠️ **Using Recharts (Need Migration - 6 types)**

| Type Needed | Current Component | Library | Issue |
|-------------|-------------------|---------|-------|
| `bar` | BarChart | Recharts | ❌ BROKEN - only 1 bar renders |
| `line` | LineChart | Recharts | ⚠️ Works but inconsistent API |
| `line` (area) | AreaChart | Recharts | ⚠️ Works but inconsistent API |
| `scatter` | ScatterChart | Recharts | ⚠️ Works but inconsistent API |
| `scatter` (bubble) | BubbleChart | Recharts | ⚠️ Works but inconsistent API |
| `bar` (waterfall) | WaterfallChart | Recharts | ⚠️ Works but inconsistent API |

**Migration Priority:**
1. BarChart (BROKEN)
2. LineChart
3. AreaChart
4. ScatterChart
5. BubbleChart
6. WaterfallChart

### ❌ **ECharts Types NOT Implemented (11 types)**

Available but not built yet:

| Type | Description | Use Case | Difficulty |
|------|-------------|----------|------------|
| `boxplot` | Box-and-whisker | Statistical distribution | Medium |
| `candlestick` | OHLC candlestick | Financial data | Medium |
| `effectScatter` | Animated scatter | Emphasis/attention | Easy |
| `gauge` | Gauge/meter | KPI meters | Easy |
| `graph` | Network graph | Relationships | Complex |
| `lines` | Multi-line paths | Migration flows | Medium |
| `map` | Geographic map | Country/region data | Complex |
| `parallel` | Parallel coordinates | Multi-dimensional | Complex |
| `pictorialBar` | Custom symbol bars | Creative visuals | Medium |
| `radar` | Radar/spider | Multi-metric comparison | Easy |
| `themeRiver` | Theme river | Topic trends | Medium |

**Note:** We deliberately removed some of these (gauge, radar, candlestick) during library refinement as not useful for SEO/marketing dashboards.

---

## ECharts Configuration Patterns

### Pattern 1: Basic Bar Chart (Vertical)
```typescript
const option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', ...]  // Category names
  },
  yAxis: {
    type: 'value'  // Numeric scale
  },
  series: [{
    type: 'bar',
    data: [120, 200, 150, ...]  // Values matching categories
  }]
};
```

### Pattern 2: Horizontal Bar Chart
```typescript
const option = {
  xAxis: {
    type: 'value'  // Numeric scale
  },
  yAxis: {
    type: 'category',
    data: ['Item 1', 'Item 2', ...]  // Categories on Y-axis
  },
  series: [{
    type: 'bar',
    data: [320, 240, 180, ...]
  }]
};
```

### Pattern 3: Pie Chart
```typescript
const option = {
  series: [{
    type: 'pie',
    radius: '70%',
    data: [
      { name: 'USA', value: 358 },
      { name: 'UK', value: 156 }
    ]
  }]
};
```

### Pattern 4: Line Chart
```typescript
const option = {
  xAxis: {
    type: 'category',
    data: ['2025-01-01', '2025-01-02', ...]
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    type: 'line',
    smooth: true,
    data: [820, 932, 901, ...]
  }]
};
```

### Pattern 5: Scatter Chart
```typescript
const option = {
  xAxis: { type: 'value' },
  yAxis: { type: 'value' },
  series: [{
    type: 'scatter',
    data: [
      [10.0, 8.04],
      [8.07, 6.95],
      ...
    ]
  }]
};
```

---

## Our React Wrapper Standard Pattern

```typescript
'use client';

import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import type { EChartsOption } from 'echarts';

export interface ChartNameProps extends Partial<ComponentConfig> {
  // Chart-specific props
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
}

export const ChartName: React.FC<ChartNameProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimension,
    title = 'Chart Name',
    showTitle = true,
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  const currentPageId = useCurrentPageId();

  // Apply professional defaults
  const defaults = getChartDefaults('chart_type');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimension);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  // Use cascaded filters
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: 'date',
  });

  // Fetch data
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'chart',
    datasetId: dataset_id || '',
    metrics,
    dimensions: dimension ? [dimension] : undefined,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!dimension && !!currentPageId,
    chartType: 'chart_type',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit !== null ? finalLimit : undefined,
  });

  // Loading/Error states
  if (isLoading) return <Loader2 />;
  if (error) return <ErrorDisplay />;

  // Extract data
  const currentData = data?.data?.current || data?.data || [];
  if (currentData.length === 0) return <NoData />;

  // Transform to ECharts format
  const categories = currentData.map(row => formatChartLabel(row[dimension]));
  const seriesData = currentData.map(row => row[metrics[0]]);

  // Build ECharts option
  const option: EChartsOption = {
    backgroundColor: '#ffffff',
    title: showTitle ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      bottom: 0,
      formatter: (name) => formatChartLabel(name)
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#666', fontSize: 11, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#666', fontSize: 11 }
    },
    series: [{
      type: 'bar',  // ECharts series type
      data: seriesData,
      name: formatChartLabel(metrics[0])
    }]
  };

  return <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />;
};
```

---

## Complete ECharts Series Type Reference

### Basic Charts (6 types)
- `bar` - Vertical or horizontal bars
- `line` - Line charts (smooth, stepped, area)
- `pie` - Pie and donut charts
- `scatter` - XY scatter plots
- `effectScatter` - Animated scatter with ripple effects
- `radar` - Radar/spider charts

### Advanced Analytics (5 types)
- `heatmap` - 2D matrix heat maps
- `boxplot` - Box-and-whisker plots
- `candlestick` - Financial OHLC charts
- `parallel` - Parallel coordinates
- `themeRiver` - Theme river charts

### Hierarchical (4 types)
- `tree` - Tree/dendogram
- `treemap` - Nested rectangles
- `sunburst` - Radial hierarchy
- `graph` - Network/force-directed graphs

### Specialized (5 types)
- `funnel` - Conversion funnels
- `sankey` - Flow diagrams
- `gauge` - Gauge meters
- `pictorialBar` - Custom symbol bars
- `lines` - Multi-segment lines/paths

### Geographic (1 type)
- `map` - Geographic choropleth maps

### Extensions (1 type)
- `wordCloud` - Word cloud (via echarts-wordcloud package)

### Custom (1 type)
- `custom` - Fully custom rendering with renderItem function

**Total:** 23 types (22 built-in + 1 extension)

---

## Migration Checklist

### Phase 1: Catalog & Documentation ✅
- [x] List all ECharts types
- [x] Document configuration patterns
- [x] Create standard React wrapper template

### Phase 2: Migrate Recharts Charts (6 charts)
- [ ] BarChart (bar → ECharts bar)
- [ ] LineChart (line → ECharts line)
- [ ] AreaChart (area → ECharts line with areaStyle)
- [ ] ScatterChart (scatter → ECharts scatter)
- [ ] BubbleChart (bubble → ECharts scatter with symbolSize)
- [ ] WaterfallChart (waterfall → ECharts bar with custom positioning)

### Phase 3: Testing
- [ ] Test all 20 charts with pure ECharts
- [ ] Verify capitalization works globally
- [ ] Test all dimension/metric combinations
- [ ] Create test dashboards for each chart type

---

## Key Insights

1. **ECharts is a LIBRARY, not components** - We create our own React wrappers
2. **Already installed** - echarts@5.6.0 via npm ✅
3. **22 types available** - Can add more charts anytime
4. **Consistent API** - All use same option object pattern
5. **Perfect for agents** - Predictable configuration structure

---

## Resources

- **ECharts API:** https://echarts.apache.org/en/option.html
- **Examples:** https://echarts.apache.org/examples/en/index.html
- **Handbook:** https://echarts.apache.org/handbook/en/get-started/
- **Context7 Docs:** `/apache/echarts-doc` (1973 code snippets)
- **Our Implementations:** `/frontend/src/components/dashboard-builder/charts/`

---

## Next Steps

1. Use this catalog to migrate remaining 6 Recharts charts
2. Follow standard React wrapper pattern
3. Achieve 100% ECharts consistency
4. Document patterns for future chart additions
