# DateRangeFilter Quick Start Guide

## 5-Minute Integration Guide

### Step 1: Import the Component

```tsx
import { DateRangeFilter, DateRangeFilterValue, toCubeTimeDimension } from '@/components/dashboard-builder/controls';
```

### Step 2: Set Up State

```tsx
const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
  range: {
    type: 'preset',
    preset: 'last30days',
  },
  comparison: { enabled: false },
});
```

### Step 3: Add to Your Component

```tsx
<DateRangeFilter
  value={dateRange}
  onChange={setDateRange}
/>
```

### Step 4: Use with Cube.js

```tsx
const timeDimension = toCubeTimeDimension(dateRange, 'Orders.createdAt', 'day');

const { resultSet } = useCubeQuery({
  measures: ['Orders.count'],
  timeDimensions: timeDimension ? [timeDimension] : [],
});
```

## Common Patterns

### Pattern 1: Dashboard-Wide Filter

```tsx
// In your dashboard layout
function DashboardLayout() {
  const [globalDateFilter, setGlobalDateFilter] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last30days' },
    comparison: { enabled: false },
  });

  return (
    <div>
      <header>
        <DateRangeFilter
          value={globalDateFilter}
          onChange={setGlobalDateFilter}
          onApply={(timeDimension) => {
            // Apply to all charts
            updateAllCharts(timeDimension);
          }}
        />
      </header>
      <main>
        {/* Your charts use globalDateFilter */}
      </main>
    </div>
  );
}
```

### Pattern 2: With Comparison

```tsx
import { toCubeTimeDimensionWithComparison } from '@/components/dashboard-builder/controls';

function ComparisonChart() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last7days' },
    comparison: { enabled: true },
  });

  const queries = toCubeTimeDimensionWithComparison(dateRange, 'Orders.createdAt', 'day');

  // Fetch both datasets
  const { resultSet: current } = useCubeQuery({
    measures: ['Orders.count'],
    timeDimensions: queries?.primary ? [queries.primary] : [],
  });

  const { resultSet: previous } = useCubeQuery({
    measures: ['Orders.count'],
    timeDimensions: queries?.comparison ? [queries.comparison] : [],
  });

  return (
    <div>
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        showComparison={true}
      />
      <LineChart current={current} previous={previous} />
    </div>
  );
}
```

### Pattern 3: Multi-Platform Dashboard

```tsx
function MultiPlatformDashboard() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last28days' },
    comparison: { enabled: false },
  });

  // Create timeDimensions for each platform
  const googleAdsTime = toCubeTimeDimension(dateRange, 'GoogleAds.date', 'day');
  const gscTime = toCubeTimeDimension(dateRange, 'SearchConsole.date', 'day');
  const analyticsTime = toCubeTimeDimension(dateRange, 'Analytics.date', 'day');

  return (
    <div>
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      <GoogleAdsChart timeDimension={googleAdsTime} />
      <SearchConsoleChart timeDimension={gscTime} />
      <AnalyticsChart timeDimension={analyticsTime} />
    </div>
  );
}
```

## Props Cheat Sheet

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `DateRangeFilterValue` | Yes | - | Current filter state |
| `onChange` | `(value) => void` | Yes | - | Update handler |
| `onApply` | `(timeDimension) => void` | No | - | Apply button handler |
| `showComparison` | `boolean` | No | `false` | Show comparison toggle |
| `dimension` | `string` | No | `'createdAt'` | Cube.js dimension name |
| `granularity` | `'day' \| 'week' \| ...` | No | `'day'` | Time granularity |
| `className` | `string` | No | - | Additional CSS classes |
| `disabled` | `boolean` | No | `false` | Disable control |

## Available Presets

| Preset | Description | Days |
|--------|-------------|------|
| `today` | Current day | 1 |
| `yesterday` | Previous day | 1 |
| `last7days` | Last 7 days | 7 |
| `last14days` | Last 14 days | 14 |
| `last28days` | Last 28 days | 28 |
| `last30days` | Last 30 days | 30 |
| `last90days` | Last 90 days | 90 |
| `thisWeek` | Current week (Mon-Sun) | 7 |
| `lastWeek` | Previous week | 7 |
| `thisMonth` | Current month | ~30 |
| `lastMonth` | Previous month | ~30 |
| `thisQuarter` | Current quarter | ~90 |
| `lastQuarter` | Previous quarter | ~90 |
| `thisYear` | Current year | ~365 |
| `lastYear` | Previous year | ~365 |
| `custom` | User-selected range | Variable |

## Granularity Guide

Choose granularity based on date range:

| Date Range | Recommended Granularity | Result Rows |
|------------|-------------------------|-------------|
| 1-7 days | `hour` | 24-168 |
| 7-30 days | `day` | 7-30 |
| 30-90 days | `day` or `week` | 30-90 or 4-13 |
| 90+ days | `week` or `month` | 13-52 or 3-12 |
| 1+ year | `month` or `quarter` | 12-48 or 4-16 |

## Helper Functions

### toCubeTimeDimension

Convert filter value to Cube.js format:

```tsx
const timeDimension = toCubeTimeDimension(
  dateRange,           // DateRangeFilterValue
  'Orders.createdAt',  // dimension name
  'day'                // granularity
);

// Returns:
// {
//   dimension: 'Orders.createdAt',
//   dateRange: ['2025-09-22', '2025-10-22'],
//   granularity: 'day'
// }
```

### toCubeTimeDimensionWithComparison

Get both primary and comparison queries:

```tsx
const queries = toCubeTimeDimensionWithComparison(
  dateRange,
  'Orders.createdAt',
  'day'
);

// Returns:
// {
//   primary: { dimension: '...', dateRange: [...], granularity: 'day' },
//   comparison: { dimension: '...', dateRange: [...], granularity: 'day' }
// }
```

## Styling Examples

### Custom Width

```tsx
<DateRangeFilter
  value={dateRange}
  onChange={setDateRange}
  className="max-w-sm"
/>
```

### In a Sidebar

```tsx
<aside className="w-64 border-r p-4">
  <DateRangeFilter
    value={dateRange}
    onChange={setDateRange}
    className="w-full"
  />
</aside>
```

### In a Modal

```tsx
<Dialog>
  <DialogContent>
    <DialogTitle>Filter Dashboard</DialogTitle>
    <DateRangeFilter
      value={dateRange}
      onChange={setDateRange}
      onApply={(td) => {
        applyFilter(td);
        closeModal();
      }}
    />
  </DialogContent>
</Dialog>
```

## TypeScript Types

```tsx
// Main filter value
interface DateRangeFilterValue {
  range: DateRange;
  comparison: DateRangeComparison;
}

// Date range
interface DateRange {
  type: 'preset' | 'custom';
  preset?: DatePresetValue;
  startDate?: Date;
  endDate?: Date;
}

// Comparison settings
interface DateRangeComparison {
  enabled: boolean;
  comparisonStartDate?: Date;
  comparisonEndDate?: Date;
}

// Cube.js time dimension
interface CubeTimeDimension {
  dimension: string;
  dateRange?: [string, string] | string;
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
```

## Troubleshooting

### Issue: Calendar doesn't open

**Solution**: Ensure `@radix-ui/react-popover` is installed:
```bash
npm install @radix-ui/react-popover
```

### Issue: Dates show as "Invalid Date"

**Solution**: Check that `date-fns` is installed:
```bash
npm install date-fns
```

### Issue: TypeScript errors on DateRangeFilterValue

**Solution**: Import the type:
```tsx
import type { DateRangeFilterValue } from '@/components/dashboard-builder/controls';
```

### Issue: Comparison not working

**Solution**: Enable comparison mode:
```tsx
<DateRangeFilter
  value={dateRange}
  onChange={setDateRange}
  showComparison={true}  // Add this
/>
```

## Performance Tips

1. **Use memo for expensive calculations**:
```tsx
const timeDimension = useMemo(() =>
  toCubeTimeDimension(dateRange, 'Orders.createdAt', 'day'),
  [dateRange]
);
```

2. **Debounce onChange for custom ranges**:
```tsx
const debouncedOnChange = useMemo(
  () => debounce(setDateRange, 300),
  []
);
```

3. **Use appropriate granularity**:
```tsx
// Bad: Returns 720 rows for 30 days
granularity="hour"

// Good: Returns 30 rows
granularity="day"
```

## Next Steps

- Read full documentation: `DATERANGEFILTER-DOCUMENTATION.md`
- See examples: `DateRangeFilter.example.tsx`
- Run tests: `DateRangeFilter.test.tsx`

---

**Need Help?** Check the example file for 6+ complete working examples.
