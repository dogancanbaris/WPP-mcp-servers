# ComboChart Quick Reference

## Visual Configuration Guide

### Chart Type Selection Matrix

| Metric Type | Recommended Chart Type | Y-Axis | Example |
|-------------|------------------------|--------|---------|
| Volume (clicks, impressions) | `bar` | left | 1,234 clicks |
| Cost (spend, revenue) | `bar` | left | $1,234.56 |
| Count (conversions, sessions) | `bar` | left | 45 conversions |
| Rate (CTR, conversion rate) | `line` | right | 2.34% |
| Position (search rank) | `line` | right | 5.2 position |
| Score (quality score) | `line` | right | 7.5 score |
| Ratio (ROAS) | `line` | right | 3.45x |

## Common Patterns

### Pattern 1: Single Bar + Single Line
```
Chart: [████] [████] [████] ──▲──
Type:  [bar ] [bar ] [bar ] [line]
```

**Configuration**:
```tsx
seriesTypes={['bar', 'line']}
yAxisAssignment={['left', 'right']}
```

**Use Case**: Clicks + CTR, Cost + ROAS, Impressions + Position

---

### Pattern 2: Multiple Bars + Single Line
```
Chart: [██][██] [██][██] [██][██] ──▲──
Type:  [b1][b2] [b1][b2] [b1][b2] [line]
```

**Configuration**:
```tsx
seriesTypes={['bar', 'bar', 'line']}
yAxisAssignment={['left', 'left', 'right']}
stackBars={false} // Side-by-side
```

**Use Case**: Cost + Conversions + CPA, Paid + Organic + ROAS

---

### Pattern 3: Stacked Bars + Line
```
Chart: [████] [████] [████] ──▲──
       [████] [████] [████]
Type:  [bar ] [bar ] [line]
       stacked stacked
```

**Configuration**:
```tsx
seriesTypes={['bar', 'bar', 'line']}
yAxisAssignment={['left', 'left', 'right']}
stackBars={true} // Stacked
```

**Use Case**: Desktop + Mobile traffic + Conversion rate, Cost segments + ROAS

---

### Pattern 4: Bar + Multiple Lines
```
Chart: [████] [████] [████] ──▲── ──▲──
Type:  [bar ] [bar ] [bar ] [ln1] [ln2]
```

**Configuration**:
```tsx
seriesTypes={['bar', 'line', 'line']}
yAxisAssignment={['left', 'right', 'right']}
```

**Use Case**: Clicks + CTR + Conversion Rate, Cost + Quality Score + Position

---

### Pattern 5: Three Bars + Two Lines
```
Chart: [█][█][█] [█][█][█] ──▲── ──▲──
Type:  [b1][b2][b3] [ln1] [ln2]
```

**Configuration**:
```tsx
seriesTypes={['bar', 'bar', 'bar', 'line', 'line']}
yAxisAssignment={['left', 'left', 'left', 'right', 'right']}
```

**Use Case**: Impressions + Clicks + Cost + CTR + Conversion Rate

## Y-Axis Assignment Rules

### Left Axis (Primary)
- Volume metrics (clicks, impressions)
- Cost metrics (spend, revenue)
- Count metrics (conversions, sessions)
- Large absolute values

### Right Axis (Secondary)
- Rate metrics (CTR, conversion rate, bounce rate)
- Position metrics (average position)
- Score metrics (quality score)
- Ratio metrics (ROAS)
- Small relative values

### Auto-Detection
Component automatically creates dual axes when:
- Value range difference > 10x
- Example: 10,000 clicks vs 2.5% CTR

## Series Type Guidelines

### Use Bars For:
- Discrete categories
- Absolute quantities
- Comparing magnitudes
- Part-to-whole (stacked)
- Budget tracking

### Use Lines For:
- Trends over time
- Rates and percentages
- Continuous data
- Efficiency metrics
- Quality indicators

## Configuration Shortcuts

### Time-Series (Last 30 Days)
```tsx
dimension="GoogleAds.date"
dateRange={{ start: '2025-09-23', end: '2025-10-22' }}
```

### Top 20 Categories
```tsx
dimension="GoogleAds.campaignName"
dateRange={{ start: '2025-10-01', end: '2025-10-22' }}
// Automatically orders by first metric and limits to 20
```

### Smooth Trend Lines
```tsx
smoothLines={true}
// Use for trends, not precise values
```

### Show Exact Values
```tsx
showDataLabels={true}
// Only use with <15 data points
```

## Color Recommendations

### Default Palette (WPP Brand)
```tsx
chartColors={[
  '#5470c6', // Blue (primary metric)
  '#91cc75', // Green (secondary metric)
  '#fac858', // Yellow (tertiary metric)
  '#ee6666', // Red (warning/negative metric)
  '#73c0de', // Cyan (additional metric)
  '#3ba272'  // Dark green (additional metric)
]}
```

### Performance Colors
```tsx
// Good = Green, Bad = Red
chartColors={['#91cc75', '#ee6666']}
// Example: Conversions (green) + Cost (red)
```

### Multi-Platform Colors
```tsx
chartColors={[
  '#5470c6', // Paid (blue)
  '#91cc75', // Organic (green)
  '#fac858'  // ROAS (yellow)
]}
```

## Metric Formatting Quick Reference

```tsx
metricsConfig={[
  // Numbers
  { metricId: 'GoogleAds.clicks', format: 'number', decimals: 0 },
  { metricId: 'GoogleAds.impressions', format: 'number', decimals: 0 },

  // Currency
  { metricId: 'GoogleAds.cost', format: 'currency', decimals: 2 },
  { metricId: 'GoogleAds.revenue', format: 'currency', decimals: 0 },

  // Percentages
  { metricId: 'GoogleAds.ctr', format: 'percent', decimals: 2 },
  { metricId: 'GoogleAds.conversionRate', format: 'percent', decimals: 2 },

  // Decimals
  { metricId: 'GSC.position', format: 'number', decimals: 1 },
  { metricId: 'GoogleAds.qualityScore', format: 'number', decimals: 2 },

  // Ratios
  { metricId: 'GoogleAds.roas', format: 'number', decimals: 2 }
]}
```

## Copy-Paste Templates

### Template 1: Paid Search Overview
```tsx
<ComboChart
  title="Paid Search Performance"
  dimension="GoogleAds.date"
  metrics={['GoogleAds.clicks', 'GoogleAds.cost', 'GoogleAds.ctr']}
  seriesTypes={['bar', 'bar', 'line']}
  yAxisAssignment={['left', 'left', 'right']}
  dateRange={{ start: '2025-10-01', end: '2025-10-22' }}
  metricsConfig={[
    { metricId: 'GoogleAds.clicks', format: 'number', decimals: 0 },
    { metricId: 'GoogleAds.cost', format: 'currency', decimals: 2 },
    { metricId: 'GoogleAds.ctr', format: 'percent', decimals: 2 }
  ]}
  chartColors={['#5470c6', '#91cc75', '#ee6666']}
/>
```

### Template 2: Campaign Comparison
```tsx
<ComboChart
  title="Top Campaigns - Cost vs ROAS"
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.cost', 'GoogleAds.roas']}
  seriesTypes={['bar', 'line']}
  yAxisAssignment={['left', 'right']}
  dateRange={{ start: '2025-10-01', end: '2025-10-22' }}
  metricsConfig={[
    { metricId: 'GoogleAds.cost', format: 'currency', decimals: 0 },
    { metricId: 'GoogleAds.roas', format: 'number', decimals: 2 }
  ]}
  chartColors={['#5470c6', '#91cc75']}
/>
```

### Template 3: GSC Performance
```tsx
<ComboChart
  title="Search Console - Impressions & Position"
  dimension="GSC.date"
  metrics={['GSC.impressions', 'GSC.clicks', 'GSC.position']}
  seriesTypes={['bar', 'bar', 'line']}
  yAxisAssignment={['left', 'left', 'right']}
  smoothLines={true}
  dateRange={{ start: '2025-10-01', end: '2025-10-22' }}
  metricsConfig={[
    { metricId: 'GSC.impressions', format: 'number', decimals: 0 },
    { metricId: 'GSC.clicks', format: 'number', decimals: 0 },
    { metricId: 'GSC.position', format: 'number', decimals: 1 }
  ]}
  chartColors={['#5470c6', '#91cc75', '#ee6666']}
/>
```

### Template 4: Multi-Platform
```tsx
<ComboChart
  title="Paid + Organic Performance"
  dimension="HolisticSearch.searchTerm"
  metrics={[
    'HolisticSearch.totalPaidClicks',
    'HolisticSearch.totalOrganicClicks',
    'HolisticSearch.roas'
  ]}
  seriesTypes={['bar', 'bar', 'line']}
  yAxisAssignment={['left', 'left', 'right']}
  dateRange={{ start: '2025-10-01', end: '2025-10-22' }}
  metricsConfig={[
    { metricId: 'HolisticSearch.totalPaidClicks', format: 'number', decimals: 0 },
    { metricId: 'HolisticSearch.totalOrganicClicks', format: 'number', decimals: 0 },
    { metricId: 'HolisticSearch.roas', format: 'percent', decimals: 1 }
  ]}
  chartColors={['#5470c6', '#91cc75', '#ee6666']}
/>
```

## Decision Tree

```
START: What metrics do you want to visualize?

├─ 2 metrics
│  ├─ Both volume metrics? → Pattern 1 (bars, same axis)
│  └─ Volume + Rate? → Pattern 1 (bar + line, dual axes)
│
├─ 3 metrics
│  ├─ 2 volume + 1 rate? → Pattern 2 (2 bars + 1 line)
│  ├─ 2 volume stacked? → Pattern 3 (stacked bars + line)
│  └─ 1 volume + 2 rates? → Pattern 4 (1 bar + 2 lines)
│
└─ 4+ metrics
   ├─ Multiple volumes? → Pattern 5 (3+ bars + lines)
   └─ Complex analysis? → Consider splitting into 2 charts
```

## Common Mistakes

### ❌ Wrong: Same axis for different scales
```tsx
metrics={['GoogleAds.impressions', 'GoogleAds.ctr']}
yAxisAssignment={['left', 'left']} // BAD: CTR will be invisible
```

### ✅ Right: Dual axes for different scales
```tsx
metrics={['GoogleAds.impressions', 'GoogleAds.ctr']}
yAxisAssignment={['left', 'right']} // GOOD: Both visible
```

---

### ❌ Wrong: Too many data labels
```tsx
showDataLabels={true}
// With 30+ data points = cluttered
```

### ✅ Right: Tooltips for many points
```tsx
showDataLabels={false}
// Use tooltips for values
```

---

### ❌ Wrong: Mixing data sources
```tsx
dimension="GoogleAds.date"
metrics={['GoogleAds.clicks', 'GSC.clicks']} // BAD: Different sources
```

### ✅ Right: Same data source
```tsx
dimension="GoogleAds.date"
metrics={['GoogleAds.clicks', 'GoogleAds.ctr']} // GOOD: Same source
```

## Performance Tips

1. **Limit categories**: Max 20 items for categorical data
2. **Use pre-aggregations**: Configure in Cube.js for speed
3. **Aggregate in query**: Don't load raw data
4. **Optimize date range**: Shorter ranges = faster queries
5. **Cache results**: Cube.js caches for 1 hour by default

## Responsive Breakpoints

- **Desktop (1920px)**: Show all metrics, full width bars
- **Laptop (1366px)**: Show all metrics, slightly narrower bars
- **Tablet (768px)**: Consider hiding tertiary metrics, stack legend
- **Mobile (375px)**: Show max 2 metrics, vertical layout

## Print this page for quick reference!
