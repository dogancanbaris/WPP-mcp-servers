# Global Filters - Quick Integration Guide

## 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/frontend
npm install zustand date-fns
```

### Step 2: Verify UI Components (1 minute)

Check if you have these shadcn/ui components:

```bash
ls src/components/ui/
```

Required components:
- button.tsx
- badge.tsx
- card.tsx
- dialog.tsx
- select.tsx
- input.tsx
- label.tsx
- calendar.tsx
- popover.tsx
- separator.tsx

If missing, install:

```bash
npx shadcn-ui@latest add button badge card dialog select input label calendar popover separator
```

### Step 3: Add to Dashboard (2 minutes)

```typescript
// app/dashboard/page.tsx or your dashboard file
import { GlobalFilters } from '@/components/dashboard-builder/GlobalFilters';

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Add filter bar at top */}
      <GlobalFilters showAddButton />

      {/* Your existing charts */}
      <div className="grid grid-cols-2 gap-6">
        <CampaignChart />
        <SearchChart />
      </div>
    </div>
  );
}
```

### Step 4: Update Charts (per chart)

```typescript
// Before
import { useCubeQuery } from '@cubejs-client/react';

export const CampaignChart = () => {
  const query = {
    measures: ['GoogleAds.impressions'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [{ dimension: 'GoogleAds.date', granularity: 'day' }],
  };

  const { resultSet } = useCubeQuery(query);
  // ...
};

// After
import { useCubeQuery } from '@cubejs-client/react';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const CampaignChart = () => {
  const { applyToQuery } = useGlobalFilters({
    dateDimension: 'GoogleAds.date',
  });

  const baseQuery = {
    measures: ['GoogleAds.impressions'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [{ dimension: 'GoogleAds.date', granularity: 'day' }],
  };

  const query = applyToQuery(baseQuery);
  const { resultSet } = useCubeQuery(query);
  // ...
};
```

That's it! Your charts now respond to global filters.

## Common Chart Patterns

### Google Ads Chart

```typescript
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const GoogleAdsChart = () => {
  const { applyToQuery } = useGlobalFilters({
    dateDimension: 'GoogleAds.date',
  });

  const query = applyToQuery({
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [{ dimension: 'GoogleAds.date', granularity: 'day' }],
  });

  const { resultSet } = useCubeQuery(query);
  // ...
};
```

### Search Console Chart

```typescript
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const SearchConsoleChart = () => {
  const { applyToQuery } = useGlobalFilters({
    dateDimension: 'SearchConsole.date',
  });

  const query = applyToQuery({
    measures: ['SearchConsole.clicks', 'SearchConsole.impressions'],
    dimensions: ['SearchConsole.query'],
    timeDimensions: [{ dimension: 'SearchConsole.date', granularity: 'day' }],
  });

  const { resultSet } = useCubeQuery(query);
  // ...
};
```

### Analytics Chart

```typescript
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const AnalyticsChart = () => {
  const { applyToQuery } = useGlobalFilters({
    dateDimension: 'Analytics.date',
  });

  const query = applyToQuery({
    measures: ['Analytics.sessions', 'Analytics.bounceRate'],
    dimensions: ['Analytics.sessionSource'],
    timeDimensions: [{ dimension: 'Analytics.date', granularity: 'day' }],
  });

  const { resultSet } = useCubeQuery(query);
  // ...
};
```

### Date Range Only (Ignore Other Filters)

```typescript
import { useDateRangeFilter } from '@/hooks/useGlobalFilters';

export const TimeSeriesChart = () => {
  const { applyToQuery } = useDateRangeFilter('GoogleAds.date');

  const query = applyToQuery({
    measures: ['GoogleAds.impressions'],
    timeDimensions: [{ dimension: 'GoogleAds.date', granularity: 'day' }],
  });

  const { resultSet } = useCubeQuery(query);
  // ...
};
```

### Fixed Date Range (No Global Filters)

```typescript
import { useGlobalFilters } from '@/hooks/useGlobalFilters';

export const OverviewChart = () => {
  const { applyToQuery } = useGlobalFilters({ disabled: true });

  const query = {
    measures: ['GoogleAds.cost'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 30 days', // Fixed
    }],
  };

  const { resultSet } = useCubeQuery(query);
  // ...
};
```

## Programmatic Filter Control

### Add Filters Programmatically

```typescript
import { useFilterStore } from '@/store/filterStore';

export const QuickFilters = () => {
  const { setDateRangePreset, addDimensionFilter, addMeasureFilter } = useFilterStore();

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
        Top Campaigns
      </button>

      <button onClick={() => addMeasureFilter(
        'GoogleAds.cost',
        'gt',
        1000,
        'High Spend'
      )}>
        Cost > $1,000
      </button>
    </div>
  );
};
```

## Showing Filter Status

### In Chart Header

```typescript
import { CompactFilterBar } from '@/components/dashboard-builder/GlobalFilters';

export const CampaignChart = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Campaign Performance</CardTitle>
          <CompactFilterBar />
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
      </CardContent>
    </Card>
  );
};
```

### Filter Badge

```typescript
import { useFilterBadge } from '@/hooks/useGlobalFilters';
import { Badge } from '@/components/ui/badge';

export const DashboardHeader = () => {
  const { count, summary } = useFilterBadge();

  return (
    <div className="flex items-center gap-2">
      <h1>Dashboard</h1>
      {count > 0 && (
        <Badge variant="secondary">
          {count} {count === 1 ? 'filter' : 'filters'}
        </Badge>
      )}
    </div>
  );
};
```

## Advanced Patterns

### Custom Filter Transformation

```typescript
const { applyToQuery } = useGlobalFilters({
  dateDimension: 'GoogleAds.date',
  transformFilters: (filters) => [
    ...filters,
    // Add required filter for this chart
    {
      member: 'GoogleAds.status',
      operator: 'equals',
      values: ['ENABLED'],
    },
  ],
});
```

### Type-Specific Filters

```typescript
// Only date range filters
const { applyToQuery } = useGlobalFilters({
  includeTypes: ['dateRange'],
});

// Only dimension filters
const { applyToQuery } = useGlobalFilters({
  includeTypes: ['dimension'],
});

// Exclude measure filters
const { applyToQuery } = useGlobalFilters({
  excludeTypes: ['measure'],
});
```

## Troubleshooting

### Filters Not Applying

**Check 1**: Is `applyToQuery()` called?

```typescript
// Wrong
const query = { ... };
const { resultSet } = useCubeQuery(query);

// Right
const { applyToQuery } = useGlobalFilters();
const query = applyToQuery({ ... });
const { resultSet } = useCubeQuery(query);
```

**Check 2**: Is correct date dimension specified?

```typescript
// Wrong - generic 'date'
const { applyToQuery } = useGlobalFilters({ dateDimension: 'date' });

// Right - specific dimension
const { applyToQuery } = useGlobalFilters({ dateDimension: 'GoogleAds.date' });
```

**Check 3**: Are filters enabled?

```typescript
// Check in UI or programmatically
const { getActiveFilters } = useFilterStore();
console.log('Active filters:', getActiveFilters());
```

### TypeScript Errors

If you get type errors for Cube.js types:

```bash
npm install --save-dev @cubejs-client/core @cubejs-client/react
```

### Import Errors

If imports fail, check your `tsconfig.json` has path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing

### Manual Testing Checklist

1. Click "Add Filter" button
2. Select "Date Range" → Choose "Last 7 Days" → Apply
3. Verify all charts update with new date range
4. Add dimension filter: Campaign Name equals "Test"
5. Verify charts show only "Test" campaign
6. Click eye icon on filter chip to disable
7. Verify charts show all campaigns again
8. Click X on filter chip to remove
9. Verify filter is removed
10. Click "Clear All" to reset

### Automated Testing

```bash
npm test src/__tests__/filterStore.test.ts
```

## Performance Tips

1. **Use date range filters**: Reduces data scanned by 90%+
2. **Limit dimension values**: Top 100-400 values max
3. **Enable pre-aggregations**: In Cube.js data model
4. **Disable for overview charts**: Use `disabled: true` option

## Next Steps

1. Review full documentation: `GLOBAL-FILTERS-README.md`
2. Check examples: `src/examples/GlobalFiltersExample.tsx`
3. Run tests: `npm test src/__tests__/filterStore.test.ts`
4. Integrate with your charts (see patterns above)

## Support

For questions:
- Check examples in `/frontend/src/examples/GlobalFiltersExample.tsx`
- Review full docs in `/frontend/GLOBAL-FILTERS-README.md`
- Contact WPP platform team

---

**Total integration time: ~15 minutes for full dashboard**
- 5 minutes: Setup dependencies
- 5 minutes: Add filter bar
- 5 minutes: Update 3-4 charts
