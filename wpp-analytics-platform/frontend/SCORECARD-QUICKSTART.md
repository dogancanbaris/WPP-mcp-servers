# Scorecard Component - Quick Start Guide

**5-Minute Setup Guide**

---

## Installation

Already installed! Component is ready to use.

**Location:** `/frontend/src/components/dashboard-builder/charts/Scorecard.tsx`

---

## Basic Usage (Copy & Paste)

### 1. Simple KPI (No Comparison)

```tsx
import { Scorecard } from '@/components/dashboard-builder/charts/Scorecard';

export default function MyDashboard() {
  return (
    <Scorecard
      title="Total Clicks"
      metrics={['GSC.clicks']}
      dateRange={{
        dimension: 'GSC.date',
        dateRange: 'last 7 days'
      }}
      metricsConfig={[{
        id: 'GSC.clicks',
        format: 'number',
        compact: true,
        showComparison: false
      }]}
    />
  );
}
```

**Result:**
```
┌────────────────┐
│ Total Clicks   │
│                │
│    1,500       │
└────────────────┘
```

---

### 2. KPI with Trend (Most Common)

```tsx
<Scorecard
  title="Total Clicks"
  metrics={['GSC.clicks']}
  dateRange={{
    dimension: 'GSC.date',
    dateRange: 'last 7 days'
  }}
  metricsConfig={[{
    id: 'GSC.clicks',
    format: 'number',
    compact: true,
    showComparison: true,        // ← Enable comparison
    compareVs: 'previous'        // ← Compare to previous period
  }]}
/>
```

**Result:**
```
┌────────────────┐
│ Total Clicks   │
│                │
│    1,500       │
│ ↑ +25% prev    │
└────────────────┘
```

---

### 3. Complete Dashboard (4 KPIs)

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
  {/* Impressions */}
  <Scorecard
    title="Impressions"
    metrics={['GSC.impressions']}
    dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
    metricsConfig={[{
      id: 'GSC.impressions',
      format: 'number',
      compact: true,
      showComparison: true,
      compareVs: 'previous'
    }]}
    chartColors={['#5470c6']}
  />

  {/* Clicks */}
  <Scorecard
    title="Clicks"
    metrics={['GSC.clicks']}
    dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
    metricsConfig={[{
      id: 'GSC.clicks',
      format: 'number',
      compact: true,
      showComparison: true,
      compareVs: 'previous'
    }]}
    chartColors={['#91cc75']}
  />

  {/* CTR */}
  <Scorecard
    title="CTR"
    metrics={['GSC.ctr']}
    dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
    metricsConfig={[{
      id: 'GSC.ctr',
      format: 'percent',
      decimals: 2,
      showComparison: true,
      compareVs: 'previous'
    }]}
    chartColors={['#fac858']}
  />

  {/* Position */}
  <Scorecard
    title="Avg Position"
    metrics={['GSC.position']}
    dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
    metricsConfig={[{
      id: 'GSC.position',
      format: 'number',
      decimals: 1,
      showComparison: true,
      compareVs: 'previous'
    }]}
    chartColors={['#ee6666']}
  />
</div>
```

**Result:**
```
┌────────────┬────────────┬────────────┬────────────┐
│Impressions │  Clicks    │    CTR     │  Position  │
│  52.3K     │   1,500    │   2.87%    │    15.2    │
│↑ +12% prev │↑ +25% prev │↑ +8% prev  │↓ -3% prev  │
└────────────┴────────────┴────────────┴────────────┘
```

---

## Common Patterns

### Currency Format

```tsx
<Scorecard
  title="Total Spend"
  metrics={['GoogleAds.cost']}
  metricsConfig={[{
    id: 'GoogleAds.cost',
    format: 'currency',      // ← Shows as $1,234
    decimals: 0,
    showComparison: true
  }]}
/>
```

### Percentage Format

```tsx
<Scorecard
  title="Click-Through Rate"
  metrics={['GSC.ctr']}
  metricsConfig={[{
    id: 'GSC.ctr',
    format: 'percent',       // ← Shows as 12.5%
    decimals: 2,
    showComparison: true
  }]}
/>
```

### With Filters

```tsx
<Scorecard
  title="Mobile Clicks"
  metrics={['GSC.clicks']}
  filters={[{
    field: 'GSC.device',
    operator: 'equals',
    values: ['MOBILE']
  }]}
  metricsConfig={[{
    id: 'GSC.clicks',
    format: 'number',
    showComparison: true
  }]}
/>
```

---

## Configuration Options

### Date Ranges

```tsx
// Predefined ranges
dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
dateRange={{ dimension: 'GSC.date', dateRange: 'last 30 days' }}
dateRange={{ dimension: 'GSC.date', dateRange: 'last 90 days' }}

// Custom ranges
dateRange={{ dimension: 'GSC.date', dateRange: ['2025-10-01', '2025-10-15'] }}
```

### Metric Formats

```tsx
format: 'number'     // 1,234
format: 'currency'   // $1,234
format: 'percent'    // 12.5%
format: 'duration'   // 01:23:45
```

### Number Formatting

```tsx
compact: true        // Shows 1.2K instead of 1,200
compact: false       // Shows 1,200
decimals: 0          // No decimals (1,234)
decimals: 2          // Two decimals (1,234.56)
```

### Colors

```tsx
chartColors={['#5470c6']}  // Blue
chartColors={['#91cc75']}  // Green
chartColors={['#fac858']}  // Yellow
chartColors={['#ee6666']}  // Red
```

---

## What Happens Behind the Scenes

When you write this:
```tsx
<Scorecard
  metrics={['GSC.clicks']}
  dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
  metricsConfig={[{ showComparison: true }]}
/>
```

**Component automatically:**
1. Creates main query: `"last 7 days"`
2. Creates comparison query: `"from 14 days ago to 7 days ago"`
3. Executes both queries in parallel
4. Calculates trend: `((current - previous) / previous) * 100`
5. Shows result with colored indicator

**You get:**
```
Total Clicks
1,500
↑ +25% vs previous period
```

---

## Troubleshooting

### Issue: Component shows empty state

**Check:**
- [ ] Are metrics provided? `metrics={['GSC.clicks']}`
- [ ] Is Cube.js server running?
- [ ] Does the measure exist in Cube schema?

### Issue: Loading spinner never stops

**Check:**
- [ ] Is Cube.js API accessible?
- [ ] Are there network errors in console?
- [ ] Is the date range valid?

### Issue: Trend shows wrong percentage

**Check:**
- [ ] Is `showComparison: true` set?
- [ ] Is there data for comparison period?
- [ ] Are filters applied to both queries?

---

## Cube.js Setup (Required)

### 1. Define Data Model

```javascript
// /model/GSC.js
cube('GSC', {
  sql: `SELECT * FROM \`project.dataset.gsc_performance\``,

  dimensions: {
    date: {
      sql: 'date',
      type: 'time'
    }
  },

  measures: {
    clicks: {
      sql: 'clicks',
      type: 'sum'
    },
    impressions: {
      sql: 'impressions',
      type: 'sum'
    },
    ctr: {
      sql: `SAFE_DIVIDE(${clicks}, ${impressions}) * 100`,
      type: 'number'
    }
  }
});
```

### 2. Start Cube.js Server

```bash
npm run cubejs
```

### 3. Use Scorecard

```tsx
<Scorecard metrics={['GSC.clicks']} />
```

Done! 🎉

---

## Performance Tips

### ✅ DO: Use Aggregated Measures

```tsx
// GOOD: Returns 1 row
<Scorecard metrics={['GSC.clicks']} />
```

### ❌ DON'T: Load Raw Data

```tsx
// BAD: Returns 1000s of rows
<Table dimensions={['GSC.date', 'GSC.query']} />
```

### ✅ DO: Enable Pre-Aggregations

```javascript
// In Cube schema
preAggregations: {
  dailyMetrics: {
    measures: [clicks, impressions],
    timeDimension: date,
    granularity: 'day'
  }
}
```

**Result:** 10x faster queries

---

## Need More Examples?

See `/frontend/src/components/dashboard-builder/charts/__examples__/Scorecard.example.tsx`

**Includes:**
- 9 complete examples
- Different layouts
- Custom styling
- Error handling
- Multi-metric dashboards

---

## Full Documentation

- **Integration Guide:** `SCORECARD-CUBE-INTEGRATION.md`
- **Architecture:** `SCORECARD-ARCHITECTURE.md`
- **Summary:** `SCORECARD-IMPLEMENTATION-SUMMARY.md`

---

## Quick Reference Card

```tsx
// MINIMUM VIABLE SCORECARD
<Scorecard
  title="My KPI"
  metrics={['YourCube.yourMeasure']}
/>

// RECOMMENDED SCORECARD (with comparison)
<Scorecard
  title="My KPI"
  metrics={['YourCube.yourMeasure']}
  dateRange={{ dimension: 'YourCube.date', dateRange: 'last 7 days' }}
  metricsConfig={[{
    id: 'YourCube.yourMeasure',
    format: 'number',
    compact: true,
    showComparison: true,
    compareVs: 'previous'
  }]}
/>
```

---

**Ready to use!** Copy any example and customize for your needs.

**Questions?** See full documentation in SCORECARD-CUBE-INTEGRATION.md
