# DateRangeFilter Component - Testing Guide

## Quick Test Checklist

### 1. Open Dashboard Builder
1. Navigate to any dashboard
2. Look for DateRangeFilter control (usually in sidebar or top controls)
3. Click the date range button to open popover

### 2. Verify Compact Layout
**Expected:**
- Popover width: approximately 700px
- Single calendar month (not two)
- Right sidebar: 200px wide
- All content visible without scrolling

**Test:**
- Open popover on different screen sizes
- Check if layout is responsive
- Verify no horizontal scroll

### 3. Test Preset Selection
**Expected Presets:**
- QUICK SELECT: Last 7 days, Last 14 days, Last 30 days, Last 90 days
- PERIODS: Last month, Last quarter, Last year

**Test Each Preset:**
1. Click "Last 7 days"
   - Should select date range from 7 days ago to yesterday
   - Button should highlight

2. Click "Last 30 days"
   - Should select date range from 30 days ago to yesterday
   - Button should highlight

3. Click "Last month"
   - Should select entire previous month
   - Button should highlight

**Verify:**
- Only 7 presets visible (no "Today", "This week", etc.)
- Selected preset highlights with bg-accent
- Date range updates in trigger button

### 4. Test Comparison Toggle (CRITICAL)

**Initial State:**
- Toggle should be OFF
- No comparison selector visible

**Enable Comparison:**
1. Click the Compare toggle (should turn ON)
2. Verify:
   - Comparison selector appears below toggle
   - Default selection: "Previous Period"
   - Comparison dates display below selector
   - Example: "vs Jan 1 - Jan 30, 2024"

**Change Comparison Type:**
1. Click dropdown, select "Week over Week"
2. Verify comparison dates update
3. Try "Month over Month" - dates should update
4. Try "Year over Year" - dates should update

**Disable Comparison:**
1. Click toggle OFF
2. Verify:
   - Comparison selector disappears
   - Comparison dates disappear
   - Toggle is OFF

### 5. Test Custom Date Selection
1. Click directly on calendar
2. Select start date
3. Select end date
4. Verify date range updates in trigger button
5. If comparison is ON, verify comparison dates update

### 6. Test Apply Button
1. Select a date range
2. Enable comparison
3. Click "Apply" button
4. Verify:
   - Popover closes
   - Dashboard charts refresh
   - Date range persists in trigger button
   - Comparison badge appears (if enabled)

### 7. Test Clear Button
1. With date range selected
2. Click "Clear" button (top right, small X)
3. Verify:
   - Resets to default (Last 30 days)
   - Comparison disabled
   - Charts refresh

---

## Expected Behavior by Feature

### Comparison Toggle States

| State | Toggle | Selector Visible | Apply Behavior |
|-------|--------|------------------|----------------|
| OFF | Unchecked | No | Single date range filter |
| ON | Checked | Yes | Date range + comparison filter |

### Comparison Types

| Type | Description | Calculation |
|------|-------------|-------------|
| Previous Period | Equal duration before start | End = Start - 1 day, Start = End - duration |
| Week over Week | Same period 7 days earlier | Start/End = -7 days |
| Month over Month | Same period 1 month earlier | Start/End = -1 month |
| Year over Year | Same period 1 year earlier | Start/End = -1 year |

### Preset Date Calculations

| Preset | Start Date | End Date |
|--------|------------|----------|
| Last 7 days | Today - 7 days | Yesterday |
| Last 14 days | Today - 14 days | Yesterday |
| Last 30 days | Today - 30 days | Yesterday |
| Last 90 days | Today - 90 days | Yesterday |
| Last month | 1st of previous month | Last day of previous month |
| Last quarter | 1st of previous quarter | Last day of previous quarter |
| Last year | Jan 1 of previous year | Dec 31 of previous year |

---

## Common Issues & Solutions

### Issue 1: Toggle doesn't change
**Symptom:** Clicking toggle has no effect
**Solution:** Check browser console for errors. This was fixed in handleComparisonToggle.

### Issue 2: Selector doesn't appear
**Symptom:** Toggle is ON but selector not visible
**Solution:** Verify `value.comparison.enabled` is true in state.

### Issue 3: Comparison dates wrong
**Symptom:** Dates don't match expected comparison type
**Solution:** Check `comparisonDateRange` calculation logic (lines 350-392).

### Issue 4: Presets not working
**Symptom:** Clicking preset doesn't update range
**Solution:** Check `handlePresetChange` function (lines 394-422).

### Issue 5: Apply doesn't refresh charts
**Symptom:** Charts don't update after clicking Apply
**Solution:** Check `handleApply` function calls `queryClient.invalidateQueries`.

---

## State Debugging

### Check Current State
Open React DevTools and inspect DateRangeFilter component:

```typescript
// Expected state structure:
{
  range: {
    type: 'preset' | 'custom',
    preset: 'last30Days',
    startDate: Date,
    endDate: Date
  },
  comparison: {
    enabled: false | true,
    type: 'previous_period' | 'previous_week' | 'previous_month' | 'previous_year',
    comparisonStartDate: Date,
    comparisonEndDate: Date
  }
}
```

### Verify onChange Calls
Add console.log to handleComparisonToggle:
```typescript
const handleComparisonToggle = (enabled: boolean) => {
  console.log('Toggle:', enabled);
  onChange({
    ...value,
    comparison: {
      ...value.comparison,
      enabled,
      type: enabled ? (value.comparison.type || 'previous_period') : value.comparison.type,
      ...(enabled && comparisonDateRange ? comparisonDateRange : {}),
    },
  });
};
```

---

## Performance Testing

### Metrics to Check
1. **Initial Render:** < 100ms
2. **Toggle Response:** < 50ms (instant)
3. **Preset Selection:** < 50ms
4. **Apply Action:** < 200ms (including chart refresh)

### Tools
- Chrome DevTools Performance tab
- React DevTools Profiler
- Network tab (verify no unnecessary requests)

---

## Accessibility Testing

### Keyboard Navigation
1. Tab to date range button
2. Enter to open popover
3. Tab through presets
4. Space to select preset
5. Tab to comparison toggle
6. Space to toggle ON/OFF
7. Tab to comparison selector
8. Arrow keys to navigate options
9. Tab to Apply button
10. Enter to apply

### Screen Reader
- Toggle should announce "Compare, switch, off" / "Compare, switch, on"
- Presets should announce label on focus
- Comparison selector should announce selected option

---

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Should work |
| Firefox | 88+ | Should work |
| Safari | 14+ | Should work |
| Edge | 90+ | Should work |

### Known Issues by Browser
- **Safari < 14:** Switch component may render differently
- **Firefox < 88:** Calendar animations may be choppy

---

## Integration Testing

### With Dashboard Store
```typescript
// Verify filter is saved to page
currentPageId: string
updatePageFilter(currentPageId, filterConfig)

// Check pageFilters in store
{
  [pageId]: {
    filters: [
      {
        id: 'date-control-default',
        field: 'date',
        operator: 'inDateRange',
        values: ['2024-01-01', '2024-01-31'],
        enabled: true,
        comparisonEnabled: true,
        comparisonValues: ['2023-12-01', '2023-12-31'],
        comparisonType: 'previous_period'
      }
    ]
  }
}
```

### With Charts
1. Select date range with comparison
2. Click Apply
3. Verify charts:
   - Display main data for selected range
   - Display comparison data (if chart supports it)
   - Show comparison indicators (arrows, percentages)
   - Legend shows both periods

---

## Regression Testing

### Verify No Breaking Changes
- [ ] Existing dashboards load correctly
- [ ] Default date range (Last 30 days) still works
- [ ] Charts without comparison still work
- [ ] Global date range filter still works
- [ ] Multi-page dashboards respect date filters
- [ ] Export functionality still works
- [ ] Mobile layout still responsive

---

## Success Metrics

### User Experience
- Time to select date range: < 5 seconds
- Confusion rate: < 5% (users should understand UI immediately)
- Error rate: < 1% (failed filter applications)

### Technical
- Component render time: < 100ms
- State update time: < 50ms
- Zero console errors
- Zero memory leaks

---

## Reporting Issues

If you find a bug, report with:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser and version**
5. **Screenshot or video**
6. **Console errors** (if any)
7. **Component state** (from React DevTools)

Example:
```
Bug: Comparison toggle doesn't work

Steps:
1. Open dashboard
2. Click date range control
3. Click comparison toggle

Expected: Toggle turns ON, selector appears
Actual: Toggle stays OFF, no selector

Browser: Chrome 120
Console: No errors
State: value.comparison.enabled = false (never changes)
```

---

**Last Updated:** 2025-10-29
**Component Version:** v2.0 (with fixes)
**Status:** Ready for QA Testing
