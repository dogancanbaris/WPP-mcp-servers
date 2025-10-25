# Chart Integration Patterns - Quick Reference

## When to Use Each Pattern

### Pattern 1: TIME SERIES (TimeSeriesChart)
**Use for:** Trends over time, continuous date-based data

```typescript
// ✅ Time dimension
{
  measures: ['GoogleAds.clicks'],
  timeDimensions: [{
    dimension: 'GoogleAds.date',
    granularity: 'day',
    dateRange: 'last 30 days'
  }]
}

// Use Cases:
- Daily clicks trend
- Monthly revenue growth
- Hourly conversion patterns
- Year-over-year comparison
```

### Pattern 2: CATEGORY COMPARISON (BarChart)
**Use for:** Discrete categories, ranking, distribution

```typescript
// ✅ Category dimension
{
  measures: ['GoogleAds.clicks', 'GoogleAds.conversions'],
  dimensions: ['GoogleAds.campaignName'],
  filters: [
    {member: 'GoogleAds.date', operator: 'inDateRange', values: ['2025-01-01', '2025-01-31']}
  ],
  order: {'GoogleAds.clicks': 'desc'},
  limit: 20
}

// Use Cases:
- Top 20 campaigns by spend
- Device type comparison (Desktop, Mobile, Tablet)
- Landing page performance ranking
- Keyword effectiveness
```

### Pattern 3: SINGLE AGGREGATE (GaugeChart)
**Use for:** Single KPI value, progress to goal

```typescript
// ✅ No dimensions (aggregate all)
{
  measures: ['GoogleAds.conversions'],
  filters: [
    {member: 'date', operator: 'inDateRange', values: ['2025-01-01', '2025-01-31']}
  ],
  limit: 1
}

// Use Cases:
- Total monthly conversions
- Current CTR vs target
- Budget utilization gauge
- Quality Score average
```

## Query Structure Decision Tree

```
START
  |
  ├─ Need to show trends over time?
  │  └─ YES → Use timeDimensions (TimeSeriesChart)
  │
  ├─ Need to compare categories?
  │  └─ YES → Use dimensions (BarChart, PieChart)
  │
  ├─ Need single aggregate value?
  │  └─ YES → No dimensions (GaugeChart, Scorecard)
  │
  └─ Need hierarchical data?
     └─ YES → Use nested dimensions (Sunburst, Treemap)
```

## Common Mistakes to Avoid

### ❌ WRONG: Using timeDimensions for categories
```typescript
// This will break for non-date dimensions!
{
  measures: ['GoogleAds.clicks'],
  timeDimensions: [{
    dimension: 'GoogleAds.campaignName',  // ❌ Not a date!
    granularity: 'day'
  }]
}
```

### ✅ CORRECT: Use dimensions for categories
```typescript
{
  measures: ['GoogleAds.clicks'],
  dimensions: ['GoogleAds.campaignName']  // ✅ Category dimension
}
```

### ❌ WRONG: Loading 50,000 rows into frontend
```typescript
{
  measures: ['GoogleAds.clicks'],
  dimensions: ['GoogleAds.keyword']
  // No limit = Returns ALL keywords (50k+)
  // Frontend crashes!
}
```

### ✅ CORRECT: Limit results + rank
```typescript
{
  measures: ['GoogleAds.clicks'],
  dimensions: ['GoogleAds.keyword'],
  order: {'GoogleAds.clicks': 'desc'},
  limit: 20  // ✅ Top 20 only
}
```

## Filter Patterns

### Date Range Filtering
```typescript
// For time-based queries
timeDimensions: [{
  dimension: 'GoogleAds.date',
  granularity: 'day',
  dateRange: ['2025-01-01', '2025-01-31']  // Or 'last 30 days'
}]

// For category-based queries
filters: [{
  member: 'GoogleAds.date',
  operator: 'inDateRange',
  values: ['2025-01-01', '2025-01-31']
}]
```

### Category Filtering
```typescript
filters: [
  {
    member: 'GoogleAds.device',
    operator: 'equals',
    values: ['MOBILE']
  },
  {
    member: 'GoogleAds.campaignStatus',
    operator: 'equals',
    values: ['ENABLED']
  }
]
```

## Measure vs Dimension

### Measures (Numbers to Aggregate)
- Sum: `GoogleAds.clicks`, `GoogleAds.cost`
- Count: `GoogleAds.campaignCount`
- Average: `GoogleAds.avgCtr`
- Min/Max: `GoogleAds.maxPosition`

### Dimensions (Categories to Group By)
- Time: `GoogleAds.date`, `Analytics.dateHour`
- Category: `GoogleAds.campaignName`, `GSC.page`, `GoogleAds.device`
- Text: `GoogleAds.keyword`, `GSC.query`
- Enum: `GoogleAds.status`, `GoogleAds.adType`

## Performance Optimization

### Token-Efficient Queries
```typescript
// ❌ BAD: Returns 100MB of data
{
  measures: ['clicks'],
  dimensions: ['keyword', 'date', 'campaign', 'adGroup', 'device']
  // Result: 500,000 rows × 6 columns = 3M tokens!
}

// ✅ GOOD: Returns manageable data
{
  measures: ['clicks', 'conversions'],
  dimensions: ['campaignName'],
  order: {'clicks': 'desc'},
  limit: 20
  // Result: 20 rows × 3 columns = ~500 tokens
}
```

### Pre-Aggregation Strategy
```javascript
// In Cube.js data model
preAggregations: {
  dailyCampaignMetrics: {
    measures: [clicks, cost, conversions],
    dimensions: [campaignName],
    timeDimension: date,
    granularity: 'day',
    refreshKey: {
      every: '1 hour'
    }
    // Creates rollup table in BigQuery
    // Queries become 100x faster!
  }
}
```

## Chart Type Selection Guide

| Need | Chart Type | Pattern |
|------|------------|---------|
| Trend over time | TimeSeriesChart | timeDimensions |
| Compare categories | BarChart | dimensions + order |
| Part-to-whole | PieChart | dimensions |
| Single KPI | GaugeChart | measures only |
| Ranking | BarChart (horizontal) | dimensions + order + limit |
| Correlation | ScatterChart | 2 measures as x,y |
| Distribution | HistogramChart | dimensions + bins |
| Hierarchical | SunburstChart | nested dimensions |
| Multi-metric KPIs | ScorecardGrid | measures only |
| Geographic | MapChart | geo dimension |

## Integration Checklist

When adding Cube.js to a new chart:

- [ ] Import `useCubeQuery` from '@cubejs-client/react'
- [ ] Import `cubeApi` from '@/lib/cubejs/client'
- [ ] Define `queryConfig` with proper structure
- [ ] Use `shouldQuery` flag to skip empty queries
- [ ] Handle loading state (`isLoading`)
- [ ] Handle error state (`error`)
- [ ] Handle empty state (no data)
- [ ] Transform data: `resultSet?.chartPivot()` or `resultSet?.tablePivot()`
- [ ] Apply metric formatting
- [ ] Test with real data
- [ ] Verify performance (<2s load time)

---

**Last Updated:** 2025-10-22
**Verified Patterns:** TimeSeriesChart, BarChart, GaugeChart
