# Global Filters Implementation - Verification Checklist

## Code Changes Verification

### 1. useGlobalFilters.ts ✅
- [x] Import `DATE_RANGE_PRESETS` from filterStore
- [x] Added `getDateRangeFromFilter()` function
- [x] Updated `DatasetFilter.field` → `DatasetFilter.member`
- [x] Added `Query` interface
- [x] Updated `filters` useMemo to use `getDateRangeFromFilter()`
- [x] Handles preset evaluation dynamically
- [x] Backwards compatible with old structure

### 2. Scorecard.tsx ✅
- [x] Replaced `useFilterStore` with `useGlobalFilters`
- [x] Updated query key to include `globalFilters`
- [x] Updated query params to use `filters` (JSON)
- [x] Removed `effectiveDateRange` logic
- [x] Uses `dateDimension: 'date'`

### 3. TimeSeriesChart.tsx ✅
- [x] Replaced `useFilterStore` with `useGlobalFilters`
- [x] Updated query key to include `globalFilters`
- [x] Updated query params to use `filters` (JSON)
- [x] Removed `effectiveDateRange` logic
- [x] Uses `dateDimension: dimension || 'date'`

### 4. TableChart.tsx ✅
- [x] Replaced `useFilterStore` with `useGlobalFilters`
- [x] Updated query key to include `globalFilters`
- [x] Updated query params to use `filters` (JSON)
- [x] Removed `effectiveDateRange` logic
- [x] Uses `dateDimension: dimension || 'date'`

### 5. PieChart.tsx ✅
- [x] Replaced `useFilterStore` with `useGlobalFilters`
- [x] Updated query key to include `globalFilters`
- [x] Updated query params to use `filters` (JSON)
- [x] Removed `effectiveDateRange` logic
- [x] Uses `dateDimension: dimension || 'date'`

### 6. useDataRefresh.ts ✅ (NEW)
- [x] Created hook file
- [x] Checks for midnight every minute
- [x] Detects preset date filters
- [x] Invalidates React Query cache
- [x] Logs refresh events to console
- [x] Cleanup on unmount

### 7. builder/page.tsx ✅
- [x] Import `useDataRefresh`
- [x] Call `useDataRefresh()` in component
- [x] Added comment explaining purpose
- [x] Hook runs on every render (proper for intervals)

### 8. filter-migration.ts ✅ (NEW)
- [x] Created migration utility file
- [x] `migrateOldDateFilter()` function
- [x] `migrateDashboardFilters()` function
- [x] `needsFilterMigration()` checker
- [x] Detects preset matches (with tolerance)
- [x] Converts to custom if no match
- [x] Removes old fields after migration

## Functional Testing

### Basic Filter Functionality
- [ ] Chart responds to "Today" preset
- [ ] Chart responds to "Yesterday" preset
- [ ] Chart responds to "Last 7 Days" preset
- [ ] Chart responds to "Last 30 Days" preset
- [ ] Chart responds to "Last 90 Days" preset
- [ ] Chart responds to "This Month" preset
- [ ] Chart responds to "Last Month" preset
- [ ] Chart responds to custom date range
- [ ] All 4 charts update simultaneously when filter changes

### Dynamic Preset Evaluation
- [ ] "Today" shows correct current date
- [ ] "Last 7 Days" shows rolling 7-day window
- [ ] "Last 30 Days" shows rolling 30-day window
- [ ] Changing date on system updates presets correctly
- [ ] Query key changes when date changes (triggers refetch)

### Auto-Refresh Mechanism
- [ ] Set system clock to 23:59, wait for midnight
- [ ] Console logs refresh message at 00:00
- [ ] All charts refetch data
- [ ] New data reflects updated date range
- [ ] Only refreshes if preset filters active (not custom)
- [ ] No refresh if no date filters active

### Backwards Compatibility
- [ ] Load old dashboard with static dates
- [ ] No errors in console
- [ ] Filters still work
- [ ] Migration converts to preset if match found
- [ ] Migration converts to custom if no match
- [ ] Old field names removed after migration

### Chart-Specific Tests

#### Scorecard
- [ ] Shows correct aggregated metric
- [ ] Updates when filter changes
- [ ] Loading state works
- [ ] Error state works

#### TimeSeriesChart
- [ ] Shows correct time series data
- [ ] X-axis shows correct date range
- [ ] Dual axis works (if applicable)
- [ ] Legend shows/hides correctly
- [ ] Tooltip shows correct dates

#### TableChart
- [ ] Shows correct filtered data
- [ ] Sorting works after filter change
- [ ] Pagination works (if applicable)
- [ ] Row count updates

#### PieChart
- [ ] Shows correct distribution
- [ ] Top 10 limit works
- [ ] Legend shows correct values
- [ ] Tooltip works

## TypeScript Compilation
- [ ] `npm run type-check` passes (or `tsc --noEmit`)
- [ ] No type errors in IDE
- [ ] All imports resolve correctly
- [ ] No `any` types except where necessary

## Performance
- [ ] No unnecessary re-renders
- [ ] Query deduplication works
- [ ] Cache invalidation only on filter change
- [ ] Auto-refresh doesn't cause memory leaks
- [ ] Interval cleanup works on unmount

## Edge Cases

### Date Handling
- [ ] Timezone handling correct
- [ ] Leap year dates work
- [ ] Month boundaries work
- [ ] Year boundaries work

### Filter Combinations
- [ ] Date + dimension filters work together
- [ ] Date + measure filters work together
- [ ] Multiple dimension filters work
- [ ] Excluding filter types works

### Error Scenarios
- [ ] API error shows error state
- [ ] Invalid date range handled
- [ ] Missing dataset_id handled
- [ ] Empty metrics array handled

### Migration Edge Cases
- [ ] Empty filters array
- [ ] Malformed old filter
- [ ] Already migrated filter (no double migration)
- [ ] Mixed old and new filters

## Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Documentation
- [x] GLOBAL_FILTERS_MIGRATION_SUMMARY.md created
- [x] GLOBAL_FILTERS_QUICK_REFERENCE.md created
- [x] Code comments added
- [x] Function JSDoc comments added
- [ ] Update ROADMAP.md if needed
- [ ] Update main README if needed

## Integration Points

### API Compatibility
- [ ] Backend accepts `filters` parameter
- [ ] Backend handles `inDateRange` operator
- [ ] Backend handles JSON filter format
- [ ] Backend returns correct filtered data

### State Management
- [ ] filterStore properly exports new fields
- [ ] zustand persistence works
- [ ] State updates trigger re-renders
- [ ] No stale closures

### React Query
- [ ] Query keys include all dependencies
- [ ] Cache invalidation works correctly
- [ ] Stale data refetches
- [ ] Background refetch works

## Clean Up
- [x] No unused imports
- [x] No console.logs (except auto-refresh)
- [x] No commented code
- [x] Proper error handling
- [x] TypeScript strict mode

## Final Checks
- [ ] All charts load without errors
- [ ] Global filter UI shows/hides correctly
- [ ] Filter bar integration works
- [ ] Settings sidebar works
- [ ] Dashboard save/load works
- [ ] Export functionality works (if applicable)

## Rollback Plan
If issues found:
1. Revert chart files to use `useFilterStore`
2. Remove `useDataRefresh()` call
3. Keep migration file for future use
4. Document issues in GitHub/Linear

## Sign-Off
- [ ] Code review completed
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Ready for production

---

**Testing Date:** ___________
**Tested By:** ___________
**Status:** ___________
