# Global Filter System Documentation

## Overview

The Global Filter System provides dashboard-wide filtering capabilities that automatically apply to all charts in the WPP Analytics Platform. It's built with Zustand for state management and integrates seamlessly with Dataset API queries.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Global Filter Store                       │
│                    (Zustand + Persist)                       │
│  - Date Range Filters                                        │
│  - Dimension Filters (campaigns, pages, countries, etc.)     │
│  - Measure Filters (cost > X, clicks > Y, etc.)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─────────────┬─────────────┬──────────
                       │             │             │
                  ┌────▼────┐   ┌───▼────┐   ┌───▼────┐
                  │ Chart 1 │   │ Chart 2│   │ Chart 3│
                  │ (Ads)   │   │ (GSC)  │   │ (GA4)  │
                  └─────────┘   └────────┘   └────────┘
```

## Key Features

### 1. Three Filter Types

#### Date Range Filters
- Preset ranges (Today, Last 7 Days, Last 30 Days, etc.)
- Custom date range picker
- Automatic granularity support (day, week, month, quarter, year)

#### Dimension Filters
- Filter by campaign names, ad groups, pages, countries, etc.
- Multiple operators: equals, contains, starts with, in list, etc.
- Multi-value support

#### Measure Filters
- Filter by metrics (cost, clicks, conversions, etc.)
- Numeric comparisons: >, >=, <, <=, =, !=
- Useful for "high performers" or "low performers" views

### 2. UI Components

#### GlobalFilters
Full filter management interface with:
- Add/remove filters
- Enable/disable individual filters
- Filter chips with visual feedback
- Organized by filter type
- Clear all functionality

#### CompactFilterBar
Minimal filter indicator for chart headers showing filter count and summary.

### 3. Automatic Integration

Charts automatically receive filtered data without manual configuration:

```typescript
const { applyToQuery } = useGlobalFilters({ dateDimension: 'GoogleAds.date' });
const query = applyToQuery(baseQuery);
const { resultSet } = useCubeQuery(query);
```

### 4. Persistent State

Filters are saved to localStorage and restored on page reload.

## Files Created

### Core Files
1. **`/frontend/src/store/filterStore.ts`**
   - Zustand store with persist middleware
   - Filter CRUD operations
   - Dataset API query generation
   - 450+ lines

2. **`/frontend/src/components/dashboard-builder/GlobalFilters.tsx`**
   - Main UI component
   - Add filter dialog with forms
   - Filter chips with toggle/remove
   - Compact filter bar variant
   - 750+ lines

3. **`/frontend/src/hooks/useGlobalFilters.ts`**
   - React hook for chart integration
   - Automatic query transformation
   - Specialized hooks (date range only, dimension only, etc.)
   - 220+ lines

4. **`/frontend/src/examples/GlobalFiltersExample.tsx`**
   - 7 complete usage examples
   - Integration patterns
   - Edge cases (custom transforms, disabled filters)
   - 350+ lines

5. **`/frontend/GLOBAL-FILTERS-README.md`** (this file)
   - Complete documentation
   - API reference
   - Usage patterns

## Installation

### 1. Install Dependencies

```bash
cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/frontend
npm install zustand date-fns
```

### 2. Ensure UI Components Exist

The system requires these shadcn/ui components:
- Button
- Badge
- Card
- Dialog
- Select
- Input
- Label
- Calendar
- Popover
- Separator

Install missing components:
```bash
npx shadcn-ui@latest add button badge card dialog select input label calendar popover separator
```

### 3. Import in Your Dashboard

```typescript
import { GlobalFilters } from '@/components/dashboard-builder/GlobalFilters';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

function Dashboard() {
  return (
    <>
      <GlobalFilters showAddButton />
      {/* Your charts */}
    </>
  );
}
```

## Usage Patterns

### Pattern 1: Basic Dashboard Setup

```typescript
import React from 'react';
import { GlobalFilters } from '@/components/dashboard-builder/GlobalFilters';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Filter bar at top */}
      <GlobalFilters showAddButton />

      {/* All charts automatically filtered */}
      <div className="grid grid-cols-2 gap-6">
        <CampaignChart />
        <SearchChart />
        <ConversionChart />
      </div>
    </div>
  );
};
```

### Pattern 2: Chart with Automatic Filters

```typescript
import { useCubeQuery } from '@cubejs-client/react';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const CampaignChart: React.FC = () => {
  const { applyToQuery } = useGlobalFilters({
    dateDimension: 'GoogleAds.date',
  });

  const baseQuery = {
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [{ dimension: 'GoogleAds.date', granularity: 'day' }],
  };

  // Global filters automatically applied
  const query = applyToQuery(baseQuery);
  const { resultSet, isLoading } = useCubeQuery(query);

  // Render chart...
};
```

### Pattern 3: Date Range Only

```typescript
import { useDateRangeFilter } from '@/hooks/useGlobalFilters';

export const TimeSeriesChart: React.FC = () => {
  // Only apply date range filters, ignore dimension/measure filters
  const { applyToQuery } = useDateRangeFilter('SearchConsole.date');

  const query = applyToQuery({
    measures: ['SearchConsole.clicks'],
    dimensions: ['SearchConsole.query'],
    timeDimensions: [{ dimension: 'SearchConsole.date', granularity: 'day' }],
  });

  const { resultSet } = useCubeQuery(query);
  // ...
};
```

### Pattern 4: Exclude Global Filters

```typescript
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const OverviewChart: React.FC = () => {
  // This chart ignores global filters (always shows all data)
  const { applyToQuery } = useGlobalFilters({ disabled: true });

  const query = {
    measures: ['GoogleAds.cost'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 30 days', // Fixed range
    }],
  };

  const { resultSet } = useCubeQuery(query);
  // ...
};
```

### Pattern 5: Custom Filter Transformation

```typescript
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const CustomChart: React.FC = () => {
  const { applyToQuery } = useGlobalFilters({
    dateDimension: 'Analytics.date',
    transformFilters: (filters) => [
      ...filters,
      // Add required filter for this chart
      {
        member: 'Analytics.sessionSource',
        operator: 'notEquals',
        values: ['(direct)'],
      },
    ],
  });

  const query = applyToQuery(baseQuery);
  const { resultSet } = useCubeQuery(query);
  // ...
};
```

### Pattern 6: Programmatic Filter Management

```typescript
import { useFilterStore } from '@/store/filterStore';

export const QuickFilters: React.FC = () => {
  const {
    addDimensionFilter,
    addMeasureFilter,
    setDateRangePreset,
    clearAllFilters,
  } = useFilterStore();

  return (
    <div>
      <button onClick={() => setDateRangePreset('last7Days')}>
        Last 7 Days
      </button>

      <button onClick={() => addDimensionFilter(
        'GoogleAds.campaignName',
        'inList',
        ['Campaign A', 'Campaign B'],
        'Top Campaigns'
      )}>
        Top Campaigns Only
      </button>

      <button onClick={() => addMeasureFilter(
        'GoogleAds.cost',
        'gt',
        1000,
        'High Spend'
      )}>
        Cost > $1,000
      </button>

      <button onClick={clearAllFilters}>
        Clear All
      </button>
    </div>
  );
};
```

### Pattern 7: Filter State Display

```typescript
import { useFilterStore } from '@/store/filterStore';

export const FilterDebug: React.FC = () => {
  const {
    filters,
    getActiveFilters,
    getCubeJSFilters,
    getFilterSummary,
  } = useFilterStore();

  return (
    <div>
      <p>Summary: {getFilterSummary()}</p>
      <p>Total: {filters.length}</p>
      <p>Active: {getActiveFilters().length}</p>
      <pre>{JSON.stringify(getCubeJSFilters(), null, 2)}</pre>
    </div>
  );
};
```

## API Reference

### Store: `useFilterStore`

#### State Properties

```typescript
{
  filters: GlobalFilter[];           // All filters
  activePreset: string | null;       // Active date preset
  isFilterBarVisible: boolean;       // Filter bar visibility
}
```

#### Actions

```typescript
// Filter Management
addFilter(filter: GlobalFilter): void;
updateFilter(id: string, updates: Partial<GlobalFilter>): void;
removeFilter(id: string): void;
toggleFilter(id: string): void;
clearAllFilters(): void;

// Date Range Specific
setDateRangePreset(preset: keyof typeof DATE_RANGE_PRESETS): void;
setCustomDateRange(startDate: string, endDate: string): void;

// Dimension Filter Helpers
addDimensionFilter(
  dimension: string,
  operator: FilterOperator,
  values: string[],
  label?: string
): void;

// Measure Filter Helpers
addMeasureFilter(
  measure: string,
  operator: FilterOperator,
  value: number,
  label?: string
): void;

// UI Actions
toggleFilterBar(): void;
setFilterBarVisible(visible: boolean): void;

// Query Generation
getActiveFilters(): GlobalFilter[];
getCubeJSFilters(): any[];
getFilterSummary(): string;
```

### Hook: `useGlobalFilters`

```typescript
const {
  filters,              // CubeFilter[] - Dataset API format
  globalFilters,        // GlobalFilter[] - Raw filters
  activeFilterCount,    // number
  applyToQuery,         // (query: Query) => Query
  hasFilters,           // boolean
  filterSummary,        // string
} = useGlobalFilters(options);
```

#### Options

```typescript
interface UseGlobalFiltersOptions {
  dateDimension?: string;           // Default: 'date'
  disabled?: boolean;               // Default: false
  includeTypes?: Array<'dateRange' | 'dimension' | 'measure'>;
  excludeTypes?: Array<'dateRange' | 'dimension' | 'measure'>;
  transformFilters?: (filters: CubeFilter[]) => CubeFilter[];
}
```

### Specialized Hooks

```typescript
// Date range only
useDateRangeFilter(dateDimension?: string);

// Dimension filters only
useDimensionFilters();

// Measure filters only
useMeasureFilters();

// Filter badge props
useFilterBadge();
```

## Filter Types

### DateRangeFilter

```typescript
{
  id: string;
  type: 'dateRange';
  label: string;
  dimension: string;       // e.g., 'GoogleAds.date'
  startDate: string;       // ISO 8601 format
  endDate: string;
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  enabled: boolean;
}
```

### DimensionFilter

```typescript
{
  id: string;
  type: 'dimension';
  label: string;
  dimension: string;       // e.g., 'GoogleAds.campaignName'
  operator: FilterOperator;
  values: string[];
  enabled: boolean;
}
```

### MeasureFilter

```typescript
{
  id: string;
  type: 'measure';
  label: string;
  measure: string;         // e.g., 'GoogleAds.cost'
  operator: FilterOperator;
  value: number;
  enabled: boolean;
}
```

## Filter Operators

```typescript
type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'       // Greater than
  | 'gte'      // Greater than or equal
  | 'lt'       // Less than
  | 'lte'      // Less than or equal
  | 'inDateRange'
  | 'beforeDate'
  | 'afterDate'
  | 'inList'
  | 'notInList';
```

## Date Range Presets

Available presets:
- `today` - Current day
- `yesterday` - Previous day
- `last7Days` - Last 7 days
- `last30Days` - Last 30 days (default)
- `last90Days` - Last 90 days
- `thisMonth` - Current month to date
- `lastMonth` - Previous full month
- `thisYear` - Current year to date
- `lastYear` - Previous full year
- `custom` - User-defined range

## Performance Considerations

### Token Efficiency

Global filters REDUCE token consumption by:
1. Pre-filtering data at the query level (in BigQuery via Dataset API)
2. Returning only filtered rows (not full dataset)
3. Avoiding multiple roundtrips to filter in frontend

Example:
```typescript
// WITHOUT filters: Returns 50,000 rows → 2M tokens
const query = {
  dimensions: ['GoogleAds.searchTerm'],
  measures: ['GoogleAds.clicks'],
};

// WITH global date filter: Returns 500 rows → 20k tokens
// Filter applied in BigQuery, only filtered results returned
```

### Query Caching

Dataset API caches filtered queries:
- Same filters = cached response (< 100ms)
- Pre-aggregations speed up common filter combinations
- Filter changes trigger new query but don't reload full dataset

### Optimal Usage

1. **Use date range filters**: Reduces data scanned by 90%+
2. **Combine with pre-aggregations**: Near-instant query responses
3. **Limit dimension cardinality**: Filter to top 100-400 values
4. **Enable filters strategically**: Disable filters for overview charts

## Multi-Tenant Considerations

### Automatic Tenant Filtering

In multi-tenant environments, combine global filters with tenant context:

```typescript
import { useTenantContext } from '@/hooks/useTenantContext';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const TenantAwareChart: React.FC = () => {
  const { tenantId } = useTenantContext();
  const { applyToQuery } = useGlobalFilters({
    transformFilters: (filters) => [
      ...filters,
      // Add tenant filter automatically
      {
        member: 'GoogleAds.tenantId',
        operator: 'equals',
        values: [tenantId],
      },
    ],
  });

  // Query now filtered by both global filters AND tenant
  const query = applyToQuery(baseQuery);
  // ...
};
```

## Integration with Dataset API Semantic Layer

### Data Model Example

```javascript
// cube-config/GoogleAds.js
cube('GoogleAds', {
  sql: `SELECT * FROM \`project.dataset.google_ads_data\``,

  dimensions: {
    date: { sql: 'date', type: 'time' },
    campaignName: { sql: 'campaign_name', type: 'string' },
    device: { sql: 'device', type: 'string' },
  },

  measures: {
    impressions: { sql: 'impressions', type: 'sum' },
    clicks: { sql: 'clicks', type: 'sum' },
    cost: { sql: 'cost', type: 'sum' },
  },

  preAggregations: {
    main: {
      measures: [impressions, clicks, cost],
      dimensions: [campaignName, device],
      timeDimension: date,
      granularity: 'day',
      refreshKey: { every: '1 hour' },
    },
  },
});
```

### Query Transformation

Global filters automatically transform to Dataset API format:

```typescript
// Global filter in store
{
  type: 'dateRange',
  dimension: 'date',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  enabled: true
}

// Transforms to Dataset API query
{
  filters: [
    {
      member: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['2025-01-01', '2025-01-31']
    }
  ]
}

// Executes as SQL
WHERE date BETWEEN '2025-01-01' AND '2025-01-31'
```

## Troubleshooting

### Filters Not Applying

**Problem**: Charts show unfiltered data

**Solution**:
1. Check `useGlobalFilters({ disabled: false })` - ensure not disabled
2. Verify `applyToQuery()` is called before `useCubeQuery()`
3. Check browser console for filter transformation errors
4. Use `<FilterDebug />` component to inspect active filters

### Date Dimension Mismatch

**Problem**: Date filter not working for specific chart

**Solution**:
```typescript
// Specify correct date dimension for each data source
const { applyToQuery } = useGlobalFilters({
  dateDimension: 'GoogleAds.date',  // Not just 'date'
});
```

### Performance Issues

**Problem**: Queries slow after adding filters

**Solution**:
1. Add Dataset API pre-aggregations for filtered dimensions
2. Ensure BigQuery tables are partitioned by date
3. Limit filter values to top 100-400 items
4. Use measure filters sparingly (expensive in BigQuery)

### Filters Not Persisting

**Problem**: Filters reset on page reload

**Solution**:
1. Check localStorage is enabled in browser
2. Verify Zustand persist middleware is active
3. Clear localStorage if corrupted: `localStorage.removeItem('wpp-filter-storage')`

## Advanced Features

### Custom Filter Validation

```typescript
import { validateFilter } from '@/store/filterStore';

const filter: DateRangeFilter = { /* ... */ };
const { valid, error } = validateFilter(filter);

if (!valid) {
  console.error(error);
}
```

### Filter Export/Import

```typescript
import { useFilterStore } from '@/store/filterStore';

// Export filters
const { filters } = useFilterStore();
const exported = JSON.stringify(filters);

// Import filters
const imported = JSON.parse(exported);
const { addFilter, clearAllFilters } = useFilterStore();
clearAllFilters();
imported.forEach(addFilter);
```

### URL Sync (Future Enhancement)

```typescript
// Planned: Sync filters to URL query params
// ?filters=eyJkYXRlUmFuZ2UiOi...
// Enables shareable filtered dashboard URLs
```

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useFilterStore } from '@/store/filterStore';

test('adds dimension filter', () => {
  const { result } = renderHook(() => useFilterStore());

  act(() => {
    result.current.addDimensionFilter(
      'GoogleAds.campaignName',
      'equals',
      ['Test Campaign']
    );
  });

  expect(result.current.filters).toHaveLength(1);
  expect(result.current.filters[0].type).toBe('dimension');
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalFilters } from '@/components/dashboard-builder/GlobalFilters';

test('adds filter via UI', async () => {
  render(<GlobalFilters />);

  // Click "Add Filter"
  await userEvent.click(screen.getByText('Add Filter'));

  // Select filter type
  await userEvent.click(screen.getByLabelText('Filter Type'));
  await userEvent.click(screen.getByText('Dimension Filter'));

  // Fill form
  // ...

  // Apply
  await userEvent.click(screen.getByText('Apply Filter'));

  // Verify filter chip appears
  expect(screen.getByRole('button', { name: /remove filter/i })).toBeInTheDocument();
});
```

## Migration Guide

### From Prop-Based Filters

**Before:**
```typescript
<Chart filters={[{ dimension: 'date', value: '2025-01' }]} />
```

**After:**
```typescript
// In dashboard
<GlobalFilters />

// Chart automatically filtered
const { applyToQuery } = useGlobalFilters();
<Chart />
```

### From Local State

**Before:**
```typescript
const [dateRange, setDateRange] = useState({ start: '...', end: '...' });
<Chart dateRange={dateRange} />
```

**After:**
```typescript
// Remove local state, use global filters
const { applyToQuery } = useDateRangeFilter('GoogleAds.date');
```

## Roadmap

### Planned Features

1. **URL Sync**: Shareable filtered dashboard URLs
2. **Saved Filter Sets**: Save/load common filter combinations
3. **Filter Templates**: Pre-configured filters for common use cases
4. **Filter Suggestions**: AI-powered filter recommendations
5. **Cross-Dashboard Filters**: Filters persist across dashboard navigation
6. **Filter Analytics**: Track most-used filters
7. **Scheduled Filters**: Auto-apply filters based on time/day

## Support

For issues or questions:
1. Check examples in `/frontend/src/examples/GlobalFiltersExample.tsx`
2. Review this documentation
3. Inspect filter state with `<FilterDebug />` component
4. Contact WPP platform team

## License

Part of WPP Analytics Platform - Internal Use Only
