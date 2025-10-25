# TableChart Component - Usage Guide

## Quick Start

### Basic Usage

```tsx
import { TableChart } from '@/components/dashboard-builder/charts/TableChart';

export default function MyDashboard() {
  return (
    <TableChart
      dimension="GoogleAds.campaignName"
      metrics={['GoogleAds.cost', 'GoogleAds.clicks']}
      title="Campaign Performance"
    />
  );
}
```

### With All Options

```tsx
<TableChart
  // Data Configuration
  dimension="GoogleAds.campaignName"
  breakdownDimension="GoogleAds.adGroupName"
  metrics={[
    'GoogleAds.impressions',
    'GoogleAds.clicks',
    'GoogleAds.cost',
    'GoogleAds.conversions'
  ]}
  filters={[
    {
      field: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['2025-09-22', '2025-10-22']
    },
    {
      field: 'GoogleAds.status',
      operator: 'equals',
      values: ['ENABLED']
    }
  ]}

  // Title Styling
  title="Campaign Performance Table"
  showTitle={true}
  titleFontFamily="roboto"
  titleFontSize="18"
  titleFontWeight="700"
  titleColor="#1a1a1a"
  titleBackgroundColor="#f0f0f0"
  titleAlignment="center"

  // Container Styling
  backgroundColor="#ffffff"
  showBorder={true}
  borderColor="#e5e5e5"
  borderWidth={1}
  borderRadius={12}
  showShadow={true}
  shadowColor="#00000015"
  shadowBlur={20}
  padding={24}

  // Table Styling
  tableStyle={{ layout: 'auto' }}
  tableHeaderStyle={{
    backgroundColor: '#f8fafc',
    textColor: '#334155',
    fontSize: '13px',
    fontWeight: '600'
  }}
  tableBodyStyle={{
    evenRowColor: '#ffffff',
    oddRowColor: '#f9fafb'
  }}

  // Metric Formatting
  metricsConfig={[
    {
      id: 'GoogleAds.cost',
      name: 'Cost',
      format: 'currency',
      decimals: 2,
      compact: false,
      alignment: 'right',
      textColor: '#dc2626',
      fontWeight: '600',
      showComparison: false,
      showBars: false
    },
    {
      id: 'GoogleAds.clicks',
      name: 'Clicks',
      format: 'number',
      decimals: 0,
      compact: true,
      alignment: 'right',
      textColor: '#059669',
      fontWeight: '500',
      showComparison: false,
      showBars: true,
      barColor: '#10b981'
    }
  ]}
/>
```

## Common Use Cases

### 1. Google Ads Campaign Table

```tsx
<TableChart
  dimension="GoogleAds.campaignName"
  metrics={[
    'GoogleAds.impressions',
    'GoogleAds.clicks',
    'GoogleAds.cost',
    'GoogleAds.conversions',
    'GoogleAds.ctr',
    'GoogleAds.cpa'
  ]}
  filters={[
    {
      field: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['last 30 days']
    }
  ]}
  title="Top Campaigns - Last 30 Days"
  metricsConfig={[
    {
      id: 'GoogleAds.cost',
      format: 'currency',
      decimals: 2,
      showBars: true,
      barColor: '#ef4444'
    },
    {
      id: 'GoogleAds.ctr',
      format: 'percent',
      decimals: 2
    },
    {
      id: 'GoogleAds.cpa',
      format: 'currency',
      decimals: 2
    }
  ]}
/>
```

### 2. Search Console Query Performance

```tsx
<TableChart
  dimension="GSC.query"
  metrics={[
    'GSC.impressions',
    'GSC.clicks',
    'GSC.position',
    'GSC.ctr'
  ]}
  filters={[
    {
      field: 'GSC.impressions',
      operator: 'gt',
      values: ['100']
    }
  ]}
  title="Top Search Queries"
  metricsConfig={[
    {
      id: 'GSC.position',
      format: 'number',
      decimals: 1,
      showBars: true,
      barColor: '#3b82f6'
    },
    {
      id: 'GSC.ctr',
      format: 'percent',
      decimals: 2
    }
  ]}
/>
```

### 3. Analytics Landing Page Performance

```tsx
<TableChart
  dimension="Analytics.landingPage"
  metrics={[
    'Analytics.sessions',
    'Analytics.bounceRate',
    'Analytics.avgSessionDuration',
    'Analytics.conversions'
  ]}
  filters={[
    {
      field: 'Analytics.date',
      operator: 'inDateRange',
      values: ['last 7 days']
    }
  ]}
  title="Landing Page Performance"
  metricsConfig={[
    {
      id: 'Analytics.bounceRate',
      format: 'percent',
      decimals: 1,
      textColor: '#ef4444'
    },
    {
      id: 'Analytics.avgSessionDuration',
      format: 'duration',
      decimals: 0
    }
  ]}
/>
```

### 4. Multi-Platform Comparison

```tsx
<TableChart
  dimension="HolisticSearch.searchTerm"
  metrics={[
    'HolisticSearch.totalPaidClicks',
    'HolisticSearch.totalOrganicClicks',
    'HolisticSearch.totalCost',
    'HolisticSearch.avgOrganicPosition',
    'HolisticSearch.costPerConversion'
  ]}
  filters={[
    {
      field: 'HolisticSearch.totalCost',
      operator: 'gt',
      values: ['0']
    }
  ]}
  title="Holistic Search Performance"
  metricsConfig={[
    {
      id: 'HolisticSearch.totalPaidClicks',
      name: 'Paid Clicks',
      format: 'number',
      compact: true,
      showBars: true,
      barColor: '#8b5cf6'
    },
    {
      id: 'HolisticSearch.totalOrganicClicks',
      name: 'Organic Clicks',
      format: 'number',
      compact: true,
      showBars: true,
      barColor: '#10b981'
    },
    {
      id: 'HolisticSearch.totalCost',
      name: 'Total Spend',
      format: 'currency',
      decimals: 2
    }
  ]}
/>
```

## Props Reference

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dimension` | `string \| null` | `null` | Primary dimension (e.g., 'GoogleAds.campaignName') |
| `breakdownDimension` | `string \| null` | `null` | Secondary dimension for breakdown |
| `metrics` | `string[]` | `[]` | Array of metrics to display |
| `filters` | `FilterConfig[]` | `[]` | Query filters |

### Title Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Data Table'` | Table title |
| `showTitle` | `boolean` | `true` | Show/hide title |
| `titleFontFamily` | `string` | `'roboto'` | Title font family |
| `titleFontSize` | `string` | `'16'` | Title font size (px) |
| `titleFontWeight` | `string` | `'600'` | Title font weight |
| `titleColor` | `string` | `'#111827'` | Title text color |
| `titleBackgroundColor` | `string` | `'transparent'` | Title background |
| `titleAlignment` | `'left' \| 'center' \| 'right'` | `'left'` | Title alignment |

### Container Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `'#ffffff'` | Container background |
| `showBorder` | `boolean` | `true` | Show border |
| `borderColor` | `string` | `'#e0e0e0'` | Border color |
| `borderWidth` | `number` | `1` | Border width (px) |
| `borderRadius` | `number` | `8` | Border radius (px) |
| `showShadow` | `boolean` | `false` | Show shadow |
| `shadowColor` | `string` | `'#000000'` | Shadow color |
| `shadowBlur` | `number` | `10` | Shadow blur (px) |
| `padding` | `number` | `16` | Container padding (px) |

### Table Style Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tableStyle` | `TableStyleConfig` | `{}` | Table layout config |
| `tableHeaderStyle` | `TableHeaderStyleConfig` | See below | Header styling |
| `tableBodyStyle` | `TableBodyStyleConfig` | See below | Body styling |

**Default tableHeaderStyle:**
```typescript
{
  backgroundColor: '#f9fafb',
  textColor: '#111827',
  fontSize: '12px',
  fontWeight: '600'
}
```

**Default tableBodyStyle:**
```typescript
{
  evenRowColor: '#ffffff',
  oddRowColor: '#f9fafb'
}
```

### Metric Formatting Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metricsConfig` | `MetricStyleConfig[]` | `[]` | Per-metric formatting config |

**MetricStyleConfig interface:**
```typescript
{
  id: string;                    // Metric identifier
  name: string;                  // Display name
  format: 'auto' | 'number' | 'percent' | 'currency' | 'duration';
  decimals: number;              // Decimal places
  compact: boolean;              // Use compact notation (1K, 1M)
  alignment: 'left' | 'center' | 'right';
  textColor: string;             // Text color
  fontWeight: string;            // Font weight
  showComparison: boolean;       // Show comparison (future)
  compareVs?: 'previous' | 'custom' | 'target';
  showBars: boolean;             // Show inline bar chart
  barColor?: string;             // Bar color
}
```

## User Interactions

### Sorting

1. **Click column header** to sort ascending
2. **Click again** to sort descending
3. **Click again** to remove sort

Visual indicators:
- Gray double chevron (↕) = No sort
- Blue up chevron (↑) = Ascending
- Blue down chevron (↓) = Descending

### Pagination

Controls:
- **<< button**: First page
- **< button**: Previous page
- **Page numbers**: Direct navigation (shows 5 pages)
- **> button**: Next page
- **>> button**: Last page
- **Rows per page dropdown**: Change page size (5/10/25/50/100)

Status display shows: "Showing X to Y of Z rows"

## Styling Examples

### Dark Theme Table

```tsx
<TableChart
  backgroundColor="#1e293b"
  borderColor="#334155"
  tableHeaderStyle={{
    backgroundColor: '#334155',
    textColor: '#e2e8f0',
    fontSize: '12px',
    fontWeight: '600'
  }}
  tableBodyStyle={{
    evenRowColor: '#1e293b',
    oddRowColor: '#0f172a'
  }}
  titleColor="#e2e8f0"
  // ... other props
/>
```

### Minimal Table

```tsx
<TableChart
  showTitle={false}
  showBorder={false}
  showShadow={false}
  padding={0}
  tableHeaderStyle={{
    backgroundColor: 'transparent',
    textColor: '#6b7280',
    fontSize: '11px',
    fontWeight: '500'
  }}
  tableBodyStyle={{
    evenRowColor: 'transparent',
    oddRowColor: 'transparent'
  }}
  // ... other props
/>
```

### Bold Metrics Table

```tsx
<TableChart
  metricsConfig={[
    {
      id: 'GoogleAds.cost',
      format: 'currency',
      decimals: 2,
      alignment: 'right',
      textColor: '#dc2626',
      fontWeight: '700',
      showBars: true,
      barColor: '#fca5a5'
    }
  ]}
  // ... other props
/>
```

## Integration with Dashboard Builder

The TableChart component is fully integrated with the dashboard builder:

1. **Drag & Drop**: Available in component palette
2. **Property Panel**: Configure all props via UI
3. **Live Preview**: See changes in real-time
4. **Export**: Include in PDF/image exports
5. **Responsive**: Adapts to column width

## Best Practices

### 1. Limit Metrics
✅ **Good**: 3-6 metrics per table
❌ **Bad**: 15+ metrics (horizontal scroll nightmare)

### 2. Use Appropriate Formats
```tsx
// Currency for money
{ id: 'cost', format: 'currency', decimals: 2 }

// Percent for rates
{ id: 'ctr', format: 'percent', decimals: 2 }

// Compact for large numbers
{ id: 'impressions', format: 'number', compact: true }
```

### 3. Add Filters for Performance
```tsx
// Reduce dataset size with filters
filters={[
  { field: 'impressions', operator: 'gt', values: ['100'] },
  { field: 'date', operator: 'inDateRange', values: ['last 30 days'] }
]}
```

### 4. Use Inline Bars Sparingly
```tsx
// Only for 1-2 key metrics
metricsConfig={[
  { id: 'conversions', showBars: true, barColor: '#10b981' }
]}
```

### 5. Semantic Dimension Names
```tsx
// ✅ Use semantic layer fields
dimension="GoogleAds.campaignName"

// ❌ Don't use raw table columns
dimension="campaign_name_raw_column"
```

## Troubleshooting

### Table Shows "Configure dimension and metric"
**Solution**: Set both `dimension` and at least one `metric`:
```tsx
<TableChart
  dimension="GoogleAds.campaignName"
  metrics={['GoogleAds.cost']}
/>
```

### Sorting Not Working
**Check**: Ensure data is being returned from Cube.js. Open browser console and verify `resultSet` has data.

### Pagination Showing Wrong Numbers
**Issue**: This happens if data changes while on a later page.
**Solution**: Component auto-resets to page 1 when data changes.

### Metrics Not Formatting
**Check**: Ensure metric IDs match exactly:
```tsx
// ✅ Correct
metrics={['GoogleAds.cost']}
metricsConfig={[{ id: 'GoogleAds.cost', format: 'currency' }]}

// ❌ Wrong (ID mismatch)
metrics={['GoogleAds.cost']}
metricsConfig={[{ id: 'cost', format: 'currency' }]}
```

### Table Too Wide
**Solution**: Reduce number of metrics or use compact formatting:
```tsx
metricsConfig={[
  { id: 'impressions', compact: true } // Shows 1K instead of 1,000
]}
```

## Performance Tips

1. **Client-side pagination**: Works for up to 1000 rows
2. **Server-side pagination**: For larger datasets, modify query config
3. **Memoization**: Component automatically optimizes re-renders
4. **Lazy loading**: Only renders visible rows

## Accessibility

- **Keyboard navigation**: Tab through headers and pagination
- **Screen readers**: Announces sort state and pagination
- **Focus indicators**: Clear visual focus states
- **ARIA labels**: Proper semantic HTML

## Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No IE11 support (uses modern ES2020 features)

## Questions?

Check the architecture documentation: `TABLECHART-ARCHITECTURE.md`
