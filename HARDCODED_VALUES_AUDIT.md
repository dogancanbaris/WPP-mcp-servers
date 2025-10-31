# HARDCODED VALUES AUDIT - CRITICAL FINDINGS

**Date:** October 30, 2025
**Scope:** ALL 32 chart components
**Issue:** Charts with hardcoded dimensions/metrics defeat platform purpose

---

## 🚨 CRITICAL ISSUES FOUND

### Charts with Hardcoded Dimension Arrays

1. **BoxplotChart.tsx:43** - `dimensions = [dimension]`
2. **CalendarHeatmap.tsx:42** - `dimensions = ['date']`
3. **GraphChart.tsx:42** - `dimensions = ['node']`
4. **StackedBarChart.tsx:48** - `dimensions = ['category']` ⚠️ CAUSES 500 ERRORS
5. **StackedColumnChart.tsx:49** - `dimensions = ['category']` ⚠️ CAUSES 500 ERRORS

### Charts with Hardcoded Dimension Strings

1. **BoxplotChart.tsx:42** - `dimension = 'category'`
2. **CandlestickChart.tsx:43** - `dimension = 'date'`
3. **PictorialBarChart.tsx:46** - `dimension = 'category'`
4. **TimeSeriesChart.tsx:36** - `dimension = 'date'`

### Additional Issues

- **HeatmapChart** - Likely has hardcoded `category` somewhere (causes 500 error)

---

## ⚠️ WHY THIS IS CRITICAL

**Impact on Agents:**
When an agent creates a dashboard with:
```json
{
  "type": "stacked_bar",
  "dimension": "country",  // Agent specifies country
  "metrics": ["clicks", "impressions"]
}
```

**What Happens:**
```typescript
// In StackedBarChart.tsx:
dimensions = ['category'],  // IGNORES agent input!
dimension = dimensions[0] || 'category',  // Uses 'category' not 'country'!
```

**Result:**
- API request: `dimensions=category` (not 'country')
- BigQuery error: Column 'category' doesn't exist
- 500 error
- Chart shows "Failed to load chart data"

**Agent can't use the chart at all!**

---

## ✅ CORRECT PATTERN

**BAD (Current):**
```typescript
export const Chart: React.FC<Props> = ({
  dimension = 'category',  // HARDCODED!
  dimensions = ['category'],  // HARDCODED!
  metrics,
  ...
}) => {
```

**GOOD (Should Be):**
```typescript
export const Chart: React.FC<Props> = ({
  dimension,  // Accept from props
  dimensions,  // Accept from props
  metrics = [],  // Empty array fallback OK
  ...
}) => {
```

---

## 📋 CHARTS THAT NEED FIXING

### Priority 1: Breaking Charts (Cause 500 Errors)

1. **StackedBarChart.tsx**
   - Line 48: `dimensions = ['category']` → `dimensions`
   - Line 49: `dimension = dimensions[0] || 'category'` → `dimension`

2. **StackedColumnChart.tsx**
   - Line 49: `dimensions = ['category']` → `dimensions`
   - Line 50: `dimension = dimensions[0] || 'category'` → `dimension`

3. **GraphChart.tsx**
   - Line 42: `dimensions = ['node']` → `dimensions`

4. **HeatmapChart** (need to check secondaryDimension)

### Priority 2: Constraining Charts (Limit Flexibility)

5. **BoxplotChart.tsx**
   - Line 42: `dimension = 'category'` → `dimension`
   - Line 43: `dimensions = [dimension]` → `dimensions`

6. **CalendarHeatmap.tsx**
   - Line 42: `dimensions = ['date']` → `dimensions`

7. **CandlestickChart.tsx**
   - Line 43: `dimension = 'date'` → `dimension`

8. **PictorialBarChart.tsx**
   - Line 46: `dimension = 'category'` → `dimension`

9. **TimeSeriesChart.tsx**
   - Line 36: `dimension = 'date'` → `dimension` (may be OK since time-series always needs date)

---

## 🎯 FIXING APPROACH

### For Each Chart:

**Step 1: Remove Hardcoded Defaults**
```typescript
// BEFORE:
dimension = 'category',
dimensions = ['category'],

// AFTER:
dimension,
dimensions,
```

**Step 2: Add Validation (if needed)**
```typescript
// Inside component, validate if critical:
if (!dimension) {
  console.warn('[ChartName] dimension is required');
  return <EmptyState message="dimension required" />;
}
```

**Step 3: Update Props Interface (if needed)**
```typescript
// Make dimension required if chart can't work without it:
export interface ChartProps extends Partial<ComponentConfig> {
  dimension: string;  // Required, not optional
}
```

### Special Cases:

**TimeSeriesChart:**
- Time-series charts ALWAYS need date dimension
- OK to keep `dimension = 'date'` as smart default
- But should still accept override if needed

**CalendarHeatmap:**
- Calendar charts ALWAYS need date dimension
- OK to keep `dimensions = ['date']` as smart default

---

## 🔧 IMPLEMENTATION PLAN

1. Fix Priority 1 charts (4 charts) - Breaking functionality
2. Fix Priority 2 charts (5 charts) - Limiting flexibility
3. Review TimeSeriesChart and CalendarHeatmap - Decide if defaults acceptable
4. Test ALL fixes with dashboard
5. Document which charts require specific dimension types

---

## ✅ EXPECTED OUTCOME

After fixes, ALL charts will:
- Accept dimension/metrics from agent config
- NOT override with hardcoded values
- Work as true "empty canvases"
- Be flexible for any data source

**Agents will be able to specify ANY valid dimension/metric combination!**
