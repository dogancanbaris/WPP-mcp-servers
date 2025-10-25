# DateRangeFilter Component Documentation

## Overview

The `DateRangeFilter` is a comprehensive, interactive calendar control designed for dashboard-wide date filtering with seamless Cube.js integration. It provides quick date presets, custom range selection, and comparison mode for period-over-period analysis.

## File Location

```
/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/controls/DateRangeFilter.tsx
```

## Key Features

### 1. Quick Date Presets

Pre-configured date ranges organized by category:

**Relative Dates:**
- Today
- Yesterday
- Last 7 days
- Last 14 days
- Last 28 days
- Last 30 days
- Last 90 days

**Periods:**
- This week
- Last week
- This month
- Last month
- This quarter
- Last quarter
- This year
- Last year

**Custom:**
- Custom range (opens calendar)

### 2. Interactive Calendar

- Dual-month calendar view
- Range selection with click-and-drag
- Visual feedback for selected dates
- Responsive design

### 3. Comparison Mode

- Compare to previous period
- Automatic calculation of comparison dates
- Visual indication of comparison range
- Toggleable on/off

### 4. Cube.js Integration

Direct conversion to Cube.js query format:
```typescript
{
  dimension: 'Orders.createdAt',
  dateRange: ['2025-09-22', '2025-10-22'],
  granularity: 'day'
}
```

## API Reference

### DateRangeFilter Props

```typescript
interface DateRangeFilterProps {
  // Current filter value
  value: DateRangeFilterValue;

  // Callback when value changes
  onChange: (value: DateRangeFilterValue) => void;

  // Optional: Callback when "Apply" button is clicked
  onApply?: (timeDimension: CubeTimeDimension) => void;

  // Show comparison mode toggle
  showComparison?: boolean;

  // Cube.js dimension name (e.g., 'Orders.createdAt')
  dimension?: string;

  // Time granularity for Cube.js
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

  // Additional CSS classes
  className?: string;

  // Disable the control
  disabled?: boolean;
}
```

### DateRangeFilterValue Type

```typescript
interface DateRangeFilterValue {
  range: DateRange;
  comparison: DateRangeComparison;
}

interface DateRange {
  type: 'preset' | 'custom';
  preset?: DatePresetValue;
  startDate?: Date;
  endDate?: Date;
}

interface DateRangeComparison {
  enabled: boolean;
  comparisonStartDate?: Date;
  comparisonEndDate?: Date;
}
```

### Helper Functions

#### toCubeTimeDimension

Converts DateRangeFilterValue to Cube.js timeDimension format:

```typescript
function toCubeTimeDimension(
  value: DateRangeFilterValue,
  dimension: string,
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
): CubeTimeDimension | null
```

#### toCubeTimeDimensionWithComparison

Generates both primary and comparison queries:

```typescript
function toCubeTimeDimensionWithComparison(
  value: DateRangeFilterValue,
  dimension: string,
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
): { primary: CubeTimeDimension; comparison?: CubeTimeDimension } | null
```

## Usage Examples

### Example 1: Basic Usage

```tsx
import { DateRangeFilter, DateRangeFilterValue } from '@/components/dashboard-builder/controls';

function MyDashboard() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: {
      type: 'preset',
      preset: 'last30days',
    },
    comparison: { enabled: false },
  });

  return (
    <DateRangeFilter
      value={dateRange}
      onChange={setDateRange}
    />
  );
}
```

### Example 2: With Cube.js Integration

```tsx
import { useCubeQuery } from '@cubejs-client/react';
import { DateRangeFilter, toCubeTimeDimension } from '@/components/dashboard-builder/controls';

function CampaignPerformance() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last30days' },
    comparison: { enabled: false },
  });

  // Convert to Cube.js format
  const timeDimension = toCubeTimeDimension(
    dateRange,
    'GoogleAds.date',
    'day'
  );

  // Use in Cube.js query
  const { resultSet, isLoading } = useCubeQuery({
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: timeDimension ? [timeDimension] : [],
    order: { 'GoogleAds.cost': 'desc' },
    limit: 100,
  });

  return (
    <div>
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        dimension="GoogleAds.date"
        granularity="day"
      />
      {/* Render chart with resultSet */}
    </div>
  );
}
```

### Example 3: Dashboard-Wide Filter with Apply Button

```tsx
import { DateRangeFilter, CubeTimeDimension } from '@/components/dashboard-builder/controls';

function DashboardFilters() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'thisMonth' },
    comparison: { enabled: false },
  });

  const handleApply = (timeDimension: CubeTimeDimension) => {
    // Apply to all dashboard components
    updateDashboardContext({ dateFilter: timeDimension });

    // Or dispatch to global state
    dispatch(setGlobalDateFilter(timeDimension));
  };

  return (
    <DateRangeFilter
      value={dateRange}
      onChange={setDateRange}
      onApply={handleApply}
      dimension="createdAt"
      granularity="day"
    />
  );
}
```

### Example 4: Comparison Mode

```tsx
import { DateRangeFilter, toCubeTimeDimensionWithComparison } from '@/components/dashboard-builder/controls';

function TrendAnalysis() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last7days' },
    comparison: { enabled: true },
  });

  // Get both primary and comparison queries
  const queries = toCubeTimeDimensionWithComparison(
    dateRange,
    'Orders.createdAt',
    'day'
  );

  const { resultSet: primaryData } = useCubeQuery({
    measures: ['Orders.count', 'Orders.totalRevenue'],
    timeDimensions: queries?.primary ? [queries.primary] : [],
  });

  const { resultSet: comparisonData } = useCubeQuery({
    measures: ['Orders.count', 'Orders.totalRevenue'],
    timeDimensions: queries?.comparison ? [queries.comparison] : [],
  });

  return (
    <div>
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        showComparison={true}
      />
      {/* Render charts with both datasets */}
    </div>
  );
}
```

### Example 5: Multi-Platform Search Dashboard

```tsx
function MultiPlatformSearchDashboard() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last28days' },
    comparison: { enabled: true },
  });

  // Generate queries for each platform
  const googleAdsQuery = toCubeTimeDimensionWithComparison(
    dateRange,
    'GoogleAds.date',
    'day'
  );

  const searchConsoleQuery = toCubeTimeDimensionWithComparison(
    dateRange,
    'SearchConsole.date',
    'day'
  );

  const analyticsQuery = toCubeTimeDimensionWithComparison(
    dateRange,
    'Analytics.date',
    'day'
  );

  return (
    <div className="space-y-6">
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        showComparison={true}
      />

      <GoogleAdsChart query={googleAdsQuery} />
      <SearchConsoleChart query={searchConsoleQuery} />
      <AnalyticsChart query={analyticsQuery} />
    </div>
  );
}
```

## Integration with Dashboard Context

### Pattern: Global Filter State

```tsx
// Context definition
interface DashboardContextType {
  dateFilter: DateRangeFilterValue;
  setDateFilter: (value: DateRangeFilterValue) => void;
  appliedTimeDimension: CubeTimeDimension | null;
}

// Provider component
function DashboardProvider({ children }) {
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last30days' },
    comparison: { enabled: false },
  });

  const appliedTimeDimension = useMemo(() => {
    return toCubeTimeDimension(dateFilter, 'createdAt', 'day');
  }, [dateFilter]);

  return (
    <DashboardContext.Provider value={{ dateFilter, setDateFilter, appliedTimeDimension }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Usage in components
function ChartComponent() {
  const { appliedTimeDimension } = useDashboardContext();

  const { resultSet } = useCubeQuery({
    measures: ['Orders.count'],
    timeDimensions: appliedTimeDimension ? [appliedTimeDimension] : [],
  });

  // Render chart
}
```

## Styling & Theming

The component uses Tailwind CSS and shadcn/ui components for consistent styling:

- Supports dark mode via `dark:` classes
- Responsive design (mobile-first)
- Accessible keyboard navigation
- Focus states and ARIA attributes

### Customization

```tsx
<DateRangeFilter
  value={dateRange}
  onChange={setDateRange}
  className="max-w-md" // Add custom classes
/>
```

## Token Efficiency for WPP Platform

The DateRangeFilter is designed with token efficiency in mind:

1. **Aggregated Queries**: Always returns date ranges, not individual timestamps
2. **Pre-Aggregations**: Works with Cube.js pre-aggregations for fast queries
3. **Limited Date Ranges**: Sensible defaults (30 days, 90 days) prevent massive datasets
4. **Granularity Control**: Adjust time granularity to reduce row count

### Best Practices

```tsx
// Good: Returns ~30-90 rows (daily granularity for 30-90 days)
const timeDimension = toCubeTimeDimension(dateRange, 'Orders.createdAt', 'day');

// Better: Returns ~4-13 rows (weekly granularity for 30-90 days)
const timeDimension = toCubeTimeDimension(dateRange, 'Orders.createdAt', 'week');

// Avoid: Returns 720+ rows (hourly for 30 days)
const timeDimension = toCubeTimeDimension(dateRange, 'Orders.createdAt', 'hour');
```

## Testing

Run tests:
```bash
npm test DateRangeFilter.test.tsx
```

Test coverage includes:
- Preset to Cube.js conversion
- Custom range handling
- Comparison period calculation
- Edge cases (same day, different granularities)

## Accessibility

The component follows WCAG 2.1 AA standards:

- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- Screen reader support (ARIA labels)
- Focus indicators
- Sufficient color contrast
- Semantic HTML

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `react`: 19.1.0
- `react-day-picker`: 9.11.1
- `date-fns`: 4.1.0
- `lucide-react`: 0.546.0
- `@radix-ui/react-popover`: 1.1.15
- `@radix-ui/react-select`: 2.2.6

## Performance Considerations

1. **Memoization**: Uses `useMemo` for expensive calculations
2. **Debouncing**: Calendar changes are debounced to prevent excessive renders
3. **Lazy Loading**: Calendar component loads on-demand (not initially)
4. **Small Bundle Size**: ~15KB gzipped (including dependencies)

## Migration from Existing DateRangePicker

If you have an existing DateRangePicker in `/sidebar/setup/DateRangePicker.tsx`:

### Differences:

| Old DateRangePicker | New DateRangeFilter |
|---------------------|---------------------|
| Chart-specific | Dashboard-wide |
| No comparison mode | Comparison mode included |
| Manual Cube.js conversion | Helper functions provided |
| Single month calendar | Dual-month calendar |
| Limited presets | 15+ presets |

### Migration Example:

```tsx
// Old
import { DateRangePicker } from '@/components/dashboard-builder/sidebar/setup/DateRangePicker';

<DateRangePicker value={dateRange} onChange={setDateRange} />

// New
import { DateRangeFilter, toCubeTimeDimension } from '@/components/dashboard-builder/controls';

<DateRangeFilter
  value={dateRange}
  onChange={setDateRange}
  dimension="Orders.createdAt"
  granularity="day"
  showComparison={true}
/>
```

## Future Enhancements

Planned features for future versions:

1. **Saved Filters**: Save commonly used date ranges
2. **Relative Date Builder**: "2 weeks ago to yesterday"
3. **Fiscal Calendar**: Support for custom fiscal years
4. **Rolling Windows**: "Rolling 30 days" (auto-updates)
5. **Multi-Range**: Select multiple non-contiguous ranges
6. **Timezone Support**: User-specific timezone handling
7. **Keyboard Shortcuts**: Quick access to common presets (e.g., Ctrl+1 for "Today")

## Support & Contribution

For issues or feature requests, please refer to:
- Example file: `DateRangeFilter.example.tsx`
- Test file: `DateRangeFilter.test.tsx`
- Main documentation: This file

## Related Components

- `DateRangePicker` (sidebar/setup) - Chart-specific date selection
- `Calendar` (ui/calendar) - Underlying calendar component
- `Popover` (ui/popover) - Dropdown container
- `Select` (ui/select) - Preset selector

---

**Version**: 1.0.0
**Last Updated**: 2025-10-22
**Component Type**: Control / Filter
**Category**: Dashboard Builder
