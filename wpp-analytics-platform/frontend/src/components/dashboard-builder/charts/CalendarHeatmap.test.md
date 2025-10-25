# CalendarHeatmap Component - Test & Documentation

## Overview

The CalendarHeatmap component provides a GitHub-style calendar visualization that displays data as a grid of days × weeks with color intensity representing metric values. It uses ECharts' calendar coordinate system for optimal performance and visual clarity.

## Component Architecture

```
CalendarHeatmap
├── Cube.js Integration (useCubeQuery)
├── Data Transformation Layer
├── ECharts Calendar Renderer
├── State Management (Loading/Error/Empty)
└── Style Configuration System
```

## Key Features

### 1. GitHub-Style Visualization
- Year-long grid view (52 weeks × 7 days)
- Color intensity mapping (5 levels by default)
- Week starts on Sunday (configurable)
- Month labels at top
- Day of week labels on left

### 2. Cube.js Integration
- Real-time data queries
- Date dimension with daily granularity
- Single metric display
- Filter support
- Custom date ranges

### 3. Interactive Elements
- Hover tooltips with formatted values
- Date + metric display
- Emphasis effect on hover
- Visual map legend

### 4. Responsive Design
- Auto-sizing cells based on container
- Mobile-friendly layouts
- Adaptive font sizes
- Configurable padding/spacing

## Props Reference

### Data Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasource` | string | `'gsc_performance_365days'` | Cube.js data model name |
| `dimension` | string \| null | `null` | Date dimension (must be date field) |
| `metrics` | string[] | `[]` | Single metric to display (only first used) |
| `filters` | FilterConfig[] | `[]` | Array of filter conditions |
| `dateRange` | DateRangeConfig | current year | Start and end dates |

### Title Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | `'Calendar Heatmap'` | Chart title |
| `showTitle` | boolean | `true` | Show/hide title |
| `titleFontFamily` | string | `'roboto'` | Font family |
| `titleFontSize` | string | `'16'` | Font size (px) |
| `titleFontWeight` | string | `'600'` | Font weight |
| `titleColor` | string | `'#111827'` | Text color |
| `titleBackgroundColor` | string | `'transparent'` | Background color |
| `titleAlignment` | string | `'left'` | Text alignment |

### Style Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | string | `'#ffffff'` | Container background |
| `showBorder` | boolean | `true` | Show border |
| `borderColor` | string | `'#e0e0e0'` | Border color |
| `borderWidth` | number | `1` | Border width (px) |
| `borderRadius` | number | `8` | Corner radius (px) |
| `showShadow` | boolean | `false` | Enable shadow |
| `shadowColor` | string | `'#000000'` | Shadow color |
| `shadowBlur` | number | `10` | Shadow blur radius |
| `padding` | number | `16` | Internal padding (px) |

### Chart Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metricsConfig` | MetricStyleConfig[] | `[]` | Metric formatting config |
| `showLegend` | boolean | `false` | Show visual map legend |
| `chartColors` | string[] | GitHub colors | Color scale (5 colors) |

## Usage Examples

### Basic Usage

```tsx
import { CalendarHeatmap } from '@/components/dashboard-builder/charts/CalendarHeatmap';

function MyDashboard() {
  return (
    <CalendarHeatmap
      title="Daily Clicks"
      dimension="gsc_performance.date"
      metrics={['gsc_performance.clicks']}
      dateRange={{
        start: '2025-01-01',
        end: '2025-12-31'
      }}
    />
  );
}
```

### With Filters

```tsx
<CalendarHeatmap
  title="Filtered Calendar"
  dimension="google_ads.date"
  metrics={['google_ads.conversions']}
  filters={[
    {
      field: 'google_ads.campaign_name',
      operator: 'equals',
      values: ['Brand Campaign']
    }
  ]}
  dateRange={{
    start: '2025-01-01',
    end: '2025-12-31'
  }}
/>
```

### Custom Color Scheme

```tsx
<CalendarHeatmap
  title="Custom Colors"
  dimension="gsc_performance.date"
  metrics={['gsc_performance.impressions']}
  chartColors={[
    '#fef3c7', // No data
    '#fde68a', // Low
    '#fcd34d', // Medium
    '#fbbf24', // High
    '#f59e0b'  // Very high
  ]}
/>
```

### Dark Mode

```tsx
<CalendarHeatmap
  title="Dark Theme"
  dimension="gsc_performance.date"
  metrics={['gsc_performance.clicks']}
  backgroundColor="#111827"
  titleColor="#f3f4f6"
  borderColor="#374151"
  chartColors={[
    '#1f2937',
    '#374151',
    '#4b5563',
    '#6b7280',
    '#9ca3af'
  ]}
/>
```

## Data Requirements

### 1. Date Dimension Format
The dimension MUST be a date field with daily granularity:
```javascript
// Cube.js data model
cube('GSCPerformance', {
  dimensions: {
    date: {
      sql: 'date',
      type: 'time'
    }
  }
});
```

### 2. Query Structure
The component generates this Cube.js query:
```javascript
{
  measures: ['gsc_performance.clicks'],
  timeDimensions: [{
    dimension: 'gsc_performance.date',
    granularity: 'day',
    dateRange: ['2025-01-01', '2025-12-31']
  }],
  filters: []
}
```

### 3. Expected Response Format
```javascript
[
  { 'gsc_performance.date.day': '2025-01-01', 'gsc_performance.clicks': 150 },
  { 'gsc_performance.date.day': '2025-01-02', 'gsc_performance.clicks': 230 },
  { 'gsc_performance.date.day': '2025-01-03', 'gsc_performance.clicks': 189 },
  // ... 365 days
]
```

## Visual Mapping Strategy

The component uses a 5-level color scale:

```javascript
// Default GitHub-style colors
const levels = [
  { range: [0, 0], label: 'No data', color: '#ebedf0' },
  { range: [1, max * 0.25], label: 'Low', color: '#9be9a8' },
  { range: [max * 0.25, max * 0.5], label: 'Medium', color: '#40c463' },
  { range: [max * 0.5, max * 0.75], label: 'High', color: '#30a14e' },
  { range: [max * 0.75, max], label: 'Very High', color: '#216e39' }
];
```

### Customizing Color Levels

Pass 5 colors via `chartColors` prop:
```tsx
chartColors={[
  '#baseColor',    // No data (0)
  '#lightColor',   // Low (1 - 25%)
  '#mediumColor',  // Medium (25% - 50%)
  '#darkColor',    // High (50% - 75%)
  '#darkestColor'  // Very High (75% - 100%)
]}
```

## Performance Considerations

### 1. Data Volume
- Optimized for 365 days (1 year)
- Efficient rendering with canvas
- Pre-aggregated data from Cube.js

### 2. Token Efficiency
```
Query: 1 metric × 365 days = 365 rows
Token usage: ~1,000 tokens (very efficient)
```

### 3. Rendering Performance
- ECharts canvas renderer
- Hardware acceleration
- Smooth hover interactions
- Minimal re-renders

## Integration Patterns

### Pattern 1: Year Selector
```tsx
function YearlyCalendar() {
  const [year, setYear] = useState(2025);

  return (
    <>
      <select value={year} onChange={e => setYear(Number(e.target.value))}>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
      </select>

      <CalendarHeatmap
        title={`Performance ${year}`}
        dimension="gsc_performance.date"
        metrics={['gsc_performance.clicks']}
        dateRange={{
          start: `${year}-01-01`,
          end: `${year}-12-31`
        }}
      />
    </>
  );
}
```

### Pattern 2: Metric Switcher
```tsx
function MetricSwitcherCalendar() {
  const [metric, setMetric] = useState('clicks');

  const metricMap = {
    clicks: 'gsc_performance.clicks',
    impressions: 'gsc_performance.impressions',
    ctr: 'gsc_performance.ctr'
  };

  return (
    <>
      <select value={metric} onChange={e => setMetric(e.target.value)}>
        <option value="clicks">Clicks</option>
        <option value="impressions">Impressions</option>
        <option value="ctr">CTR</option>
      </select>

      <CalendarHeatmap
        title={`Daily ${metric.toUpperCase()}`}
        dimension="gsc_performance.date"
        metrics={[metricMap[metric]]}
        dateRange={{
          start: '2025-01-01',
          end: '2025-12-31'
        }}
      />
    </>
  );
}
```

### Pattern 3: Multi-Year Comparison
```tsx
function ComparisonView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[2024, 2025].map(year => (
        <CalendarHeatmap
          key={year}
          title={`${year} Performance`}
          dimension="gsc_performance.date"
          metrics={['gsc_performance.clicks']}
          dateRange={{
            start: `${year}-01-01`,
            end: `${year}-12-31`
          }}
        />
      ))}
    </div>
  );
}
```

## Common Use Cases

### 1. Search Console Performance
```tsx
<CalendarHeatmap
  title="Daily Organic Clicks"
  datasource="gsc_performance"
  dimension="gsc_performance.date"
  metrics={['gsc_performance.clicks']}
/>
```

### 2. Google Ads Activity
```tsx
<CalendarHeatmap
  title="Daily Ad Spend"
  datasource="google_ads"
  dimension="google_ads.date"
  metrics={['google_ads.cost']}
  metricsConfig={[{
    id: 'google_ads.cost',
    name: 'Cost',
    format: 'currency',
    decimals: 2
  }]}
/>
```

### 3. Website Traffic
```tsx
<CalendarHeatmap
  title="Daily Sessions"
  datasource="google_analytics"
  dimension="google_analytics.date"
  metrics={['google_analytics.sessions']}
/>
```

### 4. Content Publishing
```tsx
<CalendarHeatmap
  title="Content Published"
  datasource="content_management"
  dimension="content.publish_date"
  metrics={['content.published_count']}
/>
```

### 5. Conversion Tracking
```tsx
<CalendarHeatmap
  title="Daily Conversions"
  datasource="google_ads"
  dimension="google_ads.date"
  metrics={['google_ads.conversions']}
  chartColors={[
    '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444'
  ]}
/>
```

## Troubleshooting

### Issue: Calendar shows no data
**Cause:** Dimension is not a date field or query returns empty results
**Solution:**
1. Verify dimension is a date field in Cube.js model
2. Check date range matches available data
3. Review filters - they may be too restrictive

### Issue: Colors don't show variation
**Cause:** All values are similar or metric has very small range
**Solution:**
1. Choose metric with wider value distribution
2. Adjust color scale thresholds
3. Use log scale for skewed distributions

### Issue: Layout breaks on mobile
**Cause:** Container too small for calendar grid
**Solution:**
1. Set minimum height: `minHeight: '400px'`
2. Use responsive padding
3. Consider compact view for small screens

### Issue: Tooltip shows incorrect format
**Cause:** Missing or incorrect metricsConfig
**Solution:**
```tsx
metricsConfig={[{
  id: 'your_metric_id',
  name: 'Display Name',
  format: 'number', // or 'percent', 'currency'
  decimals: 2
}]}
```

## ECharts Calendar Configuration

The component uses ECharts' calendar coordinate system:

```javascript
calendar: {
  range: '2025',           // Year to display
  cellSize: ['auto', 'auto'], // Responsive sizing
  splitLine: {             // Grid lines
    show: true,
    lineStyle: {
      color: '#e5e7eb',
      width: 1
    }
  },
  itemStyle: {
    borderWidth: 3,        // Gap between cells
    borderColor: '#ffffff'
  },
  yearLabel: { show: true, fontSize: 24 },
  monthLabel: { show: true, fontSize: 12 },
  dayLabel: { show: true, fontSize: 11 }
}
```

## Best Practices

### 1. Date Ranges
- Use full year ranges for best visual effect
- Align to calendar year (Jan 1 - Dec 31)
- Consider fiscal year if relevant

### 2. Metrics
- Choose metrics with daily variability
- Avoid cumulative metrics (use incremental)
- Ensure sufficient data coverage

### 3. Colors
- Use color scales that make sense for your metric
- Consider colorblind-friendly palettes
- Test contrast ratios for accessibility

### 4. Performance
- Limit to single year per calendar
- Use pre-aggregations in Cube.js
- Enable caching for repeated queries

### 5. User Experience
- Always show tooltips for precise values
- Include visual map legend
- Provide context with title

## Accessibility

The component includes:
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support (via ECharts)
- Screen reader compatible tooltips
- High contrast mode support

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Dependencies

```json
{
  "@cubejs-client/core": "^1.3.82",
  "@cubejs-client/react": "^1.3.82",
  "echarts": "^5.6.0",
  "echarts-for-react": "^3.0.2",
  "react": "19.1.0",
  "lucide-react": "^0.546.0"
}
```

## Related Components

- **HeatmapChart**: 2D categorical heatmap (X vs Y dimensions)
- **TimeSeriesChart**: Line chart for time-based data
- **TableChart**: Tabular data display

## Future Enhancements

1. **Multi-Metric Support**: Display multiple metrics via color blending
2. **Week Start Configuration**: Allow Monday/Sunday preference
3. **Custom Granularity**: Support weekly/monthly views
4. **Export to PNG**: Download calendar as image
5. **Pattern Detection**: Highlight anomalies automatically
6. **Comparison Mode**: Show delta vs previous year
7. **Drill-Down**: Click date to see detailed breakdown
8. **Annotations**: Mark important dates/events

## References

- [ECharts Calendar Documentation](https://echarts.apache.org/en/option.html#calendar)
- [Cube.js Time Dimensions](https://cube.dev/docs/schema/reference/types-and-formats#time-dimensions)
- [GitHub Contribution Graph](https://github.com)
