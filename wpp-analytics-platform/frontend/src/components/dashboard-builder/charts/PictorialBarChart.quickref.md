# PictorialBarChart - Quick Reference Card

## Import
```typescript
import { PictorialBarChart } from '@/components/dashboard-builder/charts';
```

## Basic Usage
```tsx
<PictorialBarChart
  title="Sessions by Device"
  dimension="GoogleAnalytics.deviceCategory"
  metrics={['GoogleAnalytics.sessions']}
  symbolType="roundRect"
/>
```

## Symbol Types
```
circle     → Users, sessions, counts
roundRect  → Standard metrics
triangle   → Growth, trends
diamond    → Premium metrics
star       → Ratings, quality
pin        → Geographic data
arrow      → Traffic flows
rect       → Traditional bars
```

## Orientations
```tsx
orientation="vertical"    // Default - short labels
orientation="horizontal"  // Better for long labels
```

## Common Patterns

### Device Analysis
```tsx
dimension="GoogleAnalytics.deviceCategory"
metrics={['GoogleAnalytics.sessions']}
symbolType="roundRect"
```

### Geographic
```tsx
dimension="GoogleAnalytics.country"
metrics={['GoogleAnalytics.sessions']}
symbolType="pin"
```

### Campaign Performance
```tsx
dimension="GoogleAds.campaignName"
metrics={['GoogleAds.conversions']}
symbolType="star"
```

### Quality Scores
```tsx
dimension="GoogleAds.qualityScore"
metrics={['GoogleAds.keywords']}
symbolType="star"
chartColors={['#fbbf24', '#f59e0b', '#d97706']}
```

## Symbol Customization
```tsx
symbolType="circle"           // Shape
symbolRepeat={true}           // Repeat to fill
symbolMargin="5%"             // Gap between
symbolSize={['100%', '80%']}  // [width, height]
symbolClip={true}             // Clip at value
```

## Styling
```tsx
// Container
backgroundColor="#ffffff"
borderRadius={8}
padding={16}

// Title
titleFontSize="16"
titleFontWeight="600"
titleColor="#111827"

// Colors
chartColors={['#5470c6', '#91cc75', '#fac858']}
```

## Multi-Metric
```tsx
metrics={['GSC.clicks', 'GSC.impressions']}
showLegend={true}
// Each metric gets different symbol automatically
```

## Files
- **Component**: `PictorialBarChart.tsx` (348 lines)
- **Examples**: `PictorialBarChart.example.tsx` (388 lines)
- **Docs**: `PictorialBarChart.md` (453 lines)
- **Stories**: `PictorialBarChart.stories.tsx` (315 lines)
- **Summary**: `PICTORIAL-BAR-CHART-IMPLEMENTATION.md`

## Run Storybook
```bash
npm run storybook
# Navigate to Dashboard/Charts/PictorialBarChart
```

## Key Features
✅ 8 symbol types
✅ Vertical/horizontal
✅ Cube.js integration
✅ Real-time data
✅ Responsive
✅ Accessible (WCAG 2.1 AA)
✅ Token-efficient queries

## Performance
- Limits to top 20 categories
- Canvas renderer for quality
- Staggered animations (50ms)
- Returns 50-400 rows max

## When to Use
✅ Infographic-style visualizations
✅ Storytelling with data
✅ Device/platform comparisons
✅ Geographic distributions
✅ Quality/rating metrics
✅ User count visualizations

## When NOT to Use
❌ Time-series data (use TimeSeriesChart)
❌ Continuous data (use LineChart)
❌ Relationships (use SankeyChart)
❌ Part-to-whole (use PieChart)
