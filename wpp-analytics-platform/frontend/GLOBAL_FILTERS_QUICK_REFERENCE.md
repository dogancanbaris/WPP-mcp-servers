# Global Filters - Developer Quick Reference

## For Chart Developers

### How to add global filters to ANY chart component

**1. Import the hook:**
```typescript
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
```

**2. Call the hook in your component:**
```typescript
const { filters: globalFilters } = useGlobalFilters({
  dateDimension: 'date', // or 'query_date', 'campaign_date', etc.
});
```

**3. Add filters to your React Query key:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['my-chart', dataset_id, metrics, globalFilters], // ✅ Include globalFilters
  queryFn: async () => {
    const params = new URLSearchParams({
      metrics: metrics.join(','),
      ...(globalFilters.length > 0 && { filters: JSON.stringify(globalFilters) })
    });

    const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);
    return response.json();
  }
});
```

**That's it!** Your chart now responds to global filters.

---

## Available Filter Options

```typescript
interface UseGlobalFiltersOptions {
  // Map 'date' dimension to chart-specific dimension
  dateDimension?: string; // Default: 'date'

  // Disable global filters for this chart
  disabled?: boolean; // Default: false

  // Only apply specific filter types
  includeTypes?: Array<'dateRange' | 'dimension' | 'measure'>;

  // Exclude specific filter types
  excludeTypes?: Array<'dateRange' | 'dimension' | 'measure'>;

  // Custom filter transformation
  transformFilters?: (filters: DatasetFilter[]) => DatasetFilter[];
}
```

---

## Examples

### Example 1: Basic chart (date filters only)
```typescript
const { filters: globalFilters } = useGlobalFilters({
  dateDimension: 'date',
});
```

### Example 2: Chart with custom date dimension
```typescript
const { filters: globalFilters } = useGlobalFilters({
  dateDimension: 'query_date', // Maps to SearchConsole.query_date
});
```

### Example 3: Date filters only (no dimension/measure filters)
```typescript
const { filters: globalFilters } = useGlobalFilters({
  includeTypes: ['dateRange'], // Only date range filters
});
```

### Example 4: Everything except measure filters
```typescript
const { filters: globalFilters } = useGlobalFilters({
  excludeTypes: ['measure'], // No measure filters
});
```

### Example 5: Disabled (chart ignores global filters)
```typescript
const { filters: globalFilters } = useGlobalFilters({
  disabled: true, // Always returns []
});
```

### Example 6: Custom transformation
```typescript
const { filters: globalFilters } = useGlobalFilters({
  transformFilters: (filters) => {
    // Custom logic: only apply if more than 2 filters
    return filters.length > 2 ? filters : [];
  },
});
```

---

## Hook Return Values

```typescript
interface UseGlobalFiltersReturn {
  filters: DatasetFilter[];        // Transformed filters ready for API
  globalFilters: GlobalFilter[];   // Raw global filters from store
  activeFilterCount: number;       // Number of active filters
  applyToQuery: (query) => Query; // Helper to merge filters into query object
  hasFilters: boolean;             // Quick check if any filters active
  filterSummary: string;           // Human-readable summary
}
```

---

## Preset Date Filters

Available presets that auto-update daily:

- `today` - Current day
- `yesterday` - Previous day
- `last7Days` - Last 7 days (rolling window)
- `last30Days` - Last 30 days (rolling window)
- `last90Days` - Last 90 days (rolling window)
- `thisMonth` - Current month to date
- `lastMonth` - Previous month (full month)
- `thisYear` - Current year to date
- `lastYear` - Previous year (full year)
- `custom` - User-specified date range

**These presets evaluate dynamically!** When a user selects "Last 7 Days", it always means the actual last 7 days, not a hardcoded date range.

---

## Daily Auto-Refresh

Charts automatically refresh at midnight IF:
1. Dashboard has active preset date filters (not 'custom')
2. `useDataRefresh()` hook is active in the page

**Already enabled in:** `/app/dashboard/[id]/builder/page.tsx`

---

## Migration

Old dashboards with static dates are automatically migrated:

```typescript
// Old format (still works):
{ startDate: '2024-10-01', endDate: '2024-10-31' }

// Migrated to:
{ preset: 'custom', customStartDate: '2024-10-01', customEndDate: '2024-10-31' }
```

Migration happens automatically on dashboard load via `filter-migration.ts`.

---

## API Contract

### Query Parameter Format

```typescript
// Frontend sends:
?filters=[{"member":"date","operator":"inDateRange","values":["2024-10-20","2024-10-27"]}]

// Backend receives:
filters: [
  {
    member: 'date',
    operator: 'inDateRange',
    values: ['2024-10-20', '2024-10-27']
  }
]
```

### Filter Structure

```typescript
interface DatasetFilter {
  member: string;   // Dimension or measure name
  operator: string; // 'inDateRange', 'equals', 'contains', etc.
  values: (string | number)[]; // Filter values
}
```

---

## Common Issues

### Issue 1: Chart not responding to filters

**Check:**
- Is `globalFilters` in the React Query `queryKey`?
- Is the API endpoint receiving the `filters` parameter?
- Is `dateDimension` correct for your chart?

### Issue 2: Date filter not working

**Check:**
- Does your dataset have a date dimension?
- Is `dateDimension` mapping correct? (e.g., 'date' vs 'query_date')
- Is the backend API handling `inDateRange` operator?

### Issue 3: Filters duplicating

**Check:**
- Are you calling `useGlobalFilters()` multiple times?
- Is `transformFilters` adding extra filters?

### Issue 4: Auto-refresh not working

**Check:**
- Is `useDataRefresh()` called in the page component?
- Are filters using presets (not 'custom')?
- Check browser console at midnight for refresh logs

---

## Best Practices

1. **Always include filters in query key**: Ensures proper cache invalidation
2. **Use appropriate dateDimension**: Match your dataset's date field
3. **Test with different presets**: Verify all presets work correctly
4. **Handle empty filters**: Check `globalFilters.length > 0` before sending to API
5. **Document custom transformations**: If using `transformFilters`, add comments

---

## Related Files

- `/src/hooks/useGlobalFilters.ts` - Main hook
- `/src/hooks/useDataRefresh.ts` - Auto-refresh hook
- `/src/store/filterStore.ts` - Global filter state
- `/src/lib/migrations/filter-migration.ts` - Migration utilities

---

**Updated:** 2024-10-27
**Version:** 1.0
