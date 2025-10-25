# DropdownFilter Component

A powerful, production-ready filter control component that fetches dimension values from Cube.js and applies global filters to dashboard charts.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
- [Cube.js Integration](#cubejs-integration)
- [Advanced Examples](#advanced-examples)
- [Performance Optimization](#performance-optimization)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)

## Features

✅ **Single & Multi-Select Modes** - Support for both selection types
✅ **Cube.js Integration** - Automatically fetches dimension values from semantic layer
✅ **Search Functionality** - Filter through large dimension value lists
✅ **Token-Efficient** - Only fetches unique dimension values (100-1000 rows max)
✅ **Global Filters** - Apply filters across all dashboard charts
✅ **Cascading Filters** - Pre-filter dimension values based on other selections
✅ **Custom Rendering** - Customize trigger and item display
✅ **Responsive Design** - Mobile-friendly with touch support
✅ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation
✅ **TypeScript** - Full type safety

## Installation

The component is already integrated into the dashboard-builder. No additional installation required.

```tsx
import { DropdownFilter, useDashboardFilters } from "@/components/dashboard-builder/controls/DropdownFilter"
```

## Basic Usage

### Single-Select (Simple)

Best for dimensions with fewer than 20 values:

```tsx
import { DropdownFilter } from "@/components/dashboard-builder/controls/DropdownFilter"

export function MyDashboard() {
  const [status, setStatus] = React.useState<string | null>(null)

  return (
    <DropdownFilter
      id="order-status"
      label="Order Status"
      dimension="Orders.status"
      mode="single"
      enableSearch={false}
      value={status || undefined}
      onChange={(value) => setStatus(value as string | null)}
      placeholder="Select status"
    />
  )
}
```

### Single-Select with Search

Best for dimensions with 20-1000 values:

```tsx
<DropdownFilter
  id="campaign-name"
  label="Campaign Name"
  dimension="GoogleAds.campaignName"
  mode="single"
  enableSearch={true}
  value={campaign || undefined}
  onChange={(value) => setCampaign(value as string | null)}
  placeholder="Search campaigns..."
  limit={500}
/>
```

### Multi-Select

Select multiple values with checkboxes:

```tsx
<DropdownFilter
  id="countries"
  label="Countries"
  dimension="Orders.country"
  mode="multi"
  enableSearch={true}
  value={countries}
  onChange={(value) => setCountries((value as string[]) || [])}
  placeholder="Select countries..."
  showCount={true}
/>
```

## API Reference

### DropdownFilterProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **Required** | Unique identifier for the filter |
| `label` | `string` | **Required** | Display label for the filter |
| `dimension` | `string` | **Required** | Cube.js dimension (e.g., "Orders.status") |
| `mode` | `"single" \| "multi"` | `"single"` | Selection mode |
| `value` | `string \| string[]` | `undefined` | Selected value(s) |
| `onChange` | `(value: string \| string[] \| null) => void` | `undefined` | Callback when selection changes |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `operator` | `"equals" \| "notEquals" \| "contains" \| "notContains" \| "in" \| "notIn"` | Auto | Filter operator |
| `limit` | `number` | `1000` | Max dimension values to fetch |
| `preFilters` | `Array<{member, operator, values}>` | `undefined` | Pre-filters for cascading |
| `showCount` | `boolean` | `true` | Show count in multi-select |
| `enableSearch` | `boolean` | `true` | Enable search functionality |
| `renderTrigger` | `(selected: string[]) => ReactNode` | `undefined` | Custom trigger renderer |
| `renderItem` | `(value: string) => ReactNode` | `undefined` | Custom item renderer |
| `className` | `string` | `undefined` | Custom CSS classes |

### useDashboardFilters Hook

Manages global dashboard filters:

```tsx
const {
  filters,        // Current filter array
  addFilter,      // Add/update a filter
  removeFilter,   // Remove a filter
  clearFilters    // Clear all filters
} = useDashboardFilters()
```

**Filter Object Structure:**
```typescript
{
  member: string      // e.g., "GoogleAds.campaignName"
  operator: string    // e.g., "equals", "in", "contains"
  values: string[]    // Array of selected values
}
```

## Cube.js Integration

### How It Works

1. **Query Construction**: Component builds a Cube.js query to fetch unique dimension values
2. **Data Fetching**: Uses `useCubeQuery` hook from `@cubejs-client/react`
3. **Value Extraction**: Parses `tablePivot()` results and extracts unique values
4. **Search/Filter**: Client-side filtering for performance
5. **Selection**: Applies selected values as Cube.js filters

### Query Pattern

```typescript
// Component internally builds this query:
{
  dimensions: ["GoogleAds.campaignName"],
  limit: 1000,
  order: {
    "GoogleAds.campaignName": "asc"
  },
  filters: preFilters // Optional pre-filters
}
```

### Token Efficiency

The component is designed for token efficiency:

- **Only fetches dimensions** - No measures, minimal data transfer
- **Unique values only** - Deduplicates on client side
- **Limited results** - Default 1000 limit prevents massive data loads
- **Client-side search** - No repeated queries for search

**Example:**
```
Campaign dimension with 50,000 rows → Returns 200 unique campaign names
Token usage: ~500 tokens (vs 50,000+ if fetching all rows)
```

## Advanced Examples

### Global Dashboard Filters

Apply filters to all charts:

```tsx
export function Dashboard() {
  const { filters, addFilter, removeFilter, clearFilters } = useDashboardFilters()

  const handleCampaignChange = (value: string | string[] | null) => {
    if (value) {
      addFilter({
        member: "GoogleAds.campaignName",
        operator: "equals",
        values: [value as string]
      })
    } else {
      removeFilter("GoogleAds.campaignName")
    }
  }

  return (
    <div>
      {/* Filter Controls */}
      <DropdownFilter
        dimension="GoogleAds.campaignName"
        onChange={handleCampaignChange}
        // ... other props
      />

      {/* Charts receive filters */}
      <LineChart
        dimension="GoogleAds.date"
        metrics={["GoogleAds.impressions", "GoogleAds.clicks"]}
        filters={filters} // Apply global filters
      />
    </div>
  )
}
```

### Cascading Filters

Filter dimension values based on other selections:

```tsx
export function CascadingFilters() {
  const [account, setAccount] = React.useState<string | null>(null)
  const [campaign, setCampaign] = React.useState<string | null>(null)

  return (
    <>
      {/* Account Filter */}
      <DropdownFilter
        dimension="GoogleAds.accountName"
        onChange={(value) => {
          setAccount(value as string | null)
          setCampaign(null) // Reset dependent filter
        }}
      />

      {/* Campaign Filter (filtered by account) */}
      <DropdownFilter
        dimension="GoogleAds.campaignName"
        value={campaign || undefined}
        onChange={(value) => setCampaign(value as string | null)}
        preFilters={account ? [{
          member: "GoogleAds.accountName",
          operator: "equals",
          values: [account]
        }] : undefined}
        placeholder={account ? "Select campaign..." : "Select account first"}
      />
    </>
  )
}
```

### Custom Rendering

Customize how values are displayed:

```tsx
<DropdownFilter
  dimension="GoogleAds.campaignName"
  mode="multi"
  renderTrigger={(selected) => (
    <div className="flex items-center gap-2">
      <Badge>{selected.length}</Badge>
      <span>campaigns selected</span>
    </div>
  )}
  renderItem={(value) => (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium">{value}</span>
      <Badge variant="outline">Campaign</Badge>
    </div>
  )}
/>
```

### Date Range Pre-Filtering

Filter dimension values by date range:

```tsx
<DropdownFilter
  dimension="GoogleAds.campaignName"
  preFilters={[
    {
      member: "GoogleAds.date",
      operator: "inDateRange",
      values: ["2024-01-01", "2024-12-31"]
    },
    {
      member: "GoogleAds.status",
      operator: "equals",
      values: ["ENABLED"]
    }
  ]}
  placeholder="Active campaigns in 2024..."
/>
```

## Performance Optimization

### 1. Limit Dimension Values

```tsx
// ✅ GOOD: Limit to reasonable number
<DropdownFilter
  dimension="GoogleAds.keyword"
  limit={500} // Top 500 keywords only
/>

// ❌ BAD: Fetching all values
<DropdownFilter
  dimension="GoogleAds.keyword"
  limit={50000} // Too many, will be slow
/>
```

### 2. Use Pre-Filters

```tsx
// ✅ GOOD: Pre-filter to reduce data
<DropdownFilter
  dimension="GoogleAds.campaignName"
  preFilters={[{
    member: "GoogleAds.impressions",
    operator: "gt",
    values: ["1000"] // Only campaigns with >1000 impressions
  }]}
/>
```

### 3. Disable Search When Not Needed

```tsx
// ✅ GOOD: Simple select for few values
<DropdownFilter
  dimension="GoogleAds.device" // Only 3 values: mobile, desktop, tablet
  enableSearch={false}
/>
```

### 4. Use Single-Select for Exclusive Choices

```tsx
// ✅ GOOD: Single-select for mutually exclusive options
<DropdownFilter
  dimension="GoogleAds.status"
  mode="single" // User can only select one status
/>

// ❌ BAD: Multi-select for mutually exclusive options
<DropdownFilter
  dimension="GoogleAds.status"
  mode="multi" // Confusing - status should be exclusive
/>
```

## Accessibility

The component is fully accessible and follows WCAG 2.1 AA guidelines:

### Keyboard Navigation

- **Tab** - Focus next element
- **Shift + Tab** - Focus previous element
- **Space / Enter** - Open/close dropdown
- **Arrow Up/Down** - Navigate options
- **Escape** - Close dropdown
- **Type to search** - Filter options (when search enabled)

### Screen Readers

- Proper ARIA labels and roles
- Announces selection changes
- Clear focus indicators
- Loading and error states announced

### Focus Management

```tsx
// Component automatically manages focus
<DropdownFilter
  id="campaign" // Required for proper labeling
  label="Campaign Name" // Visible label for screen readers
/>
```

## Best Practices

### 1. Choose the Right Mode

```tsx
// Single-select: For mutually exclusive options
<DropdownFilter dimension="Orders.status" mode="single" />

// Multi-select: For additive filters
<DropdownFilter dimension="Orders.country" mode="multi" />
```

### 2. Provide Clear Labels

```tsx
// ✅ GOOD: Clear, descriptive label
<DropdownFilter label="Campaign Name" />

// ❌ BAD: Vague label
<DropdownFilter label="Filter" />
```

### 3. Use Placeholders Effectively

```tsx
// ✅ GOOD: Helpful placeholder
<DropdownFilter placeholder="Search campaigns by name..." />

// ❌ BAD: Redundant placeholder
<DropdownFilter label="Campaign" placeholder="Campaign" />
```

### 4. Handle Loading States

```tsx
// Component handles loading automatically, but you can add context:
<div className="space-y-2">
  <DropdownFilter dimension="GoogleAds.campaignName" />
  <p className="text-xs text-muted-foreground">
    Loading campaigns from your Google Ads account...
  </p>
</div>
```

### 5. Integrate with Dashboard State

```tsx
// ✅ GOOD: Centralized filter management
const { filters, addFilter } = useDashboardFilters()

// All charts receive the same filters
<LineChart filters={filters} />
<BarChart filters={filters} />
<Table filters={filters} />

// ❌ BAD: Each component manages its own filters
<LineChart filters={lineFilters} />
<BarChart filters={barFilters} /> // Inconsistent!
```

### 6. Validate Dimension Names

```tsx
// ✅ GOOD: Use correct Cube.js dimension format
<DropdownFilter dimension="GoogleAds.campaignName" />

// ❌ BAD: Invalid format
<DropdownFilter dimension="campaign_name" />
```

### 7. Test with Real Data

```tsx
// Always test with:
// - Large datasets (1000+ values)
// - Special characters in values
// - Empty/null values
// - Very long value names
```

## Integration with Charts

### Applying Filters to Charts

```tsx
export function DashboardWithFilters() {
  const { filters } = useDashboardFilters()

  return (
    <>
      {/* Filter Controls */}
      <DropdownFilter
        dimension="GoogleAds.campaignName"
        onChange={(value) => {
          // Filter is added to global state
        }}
      />

      {/* Charts automatically receive filters */}
      <BarChart
        dimension="GoogleAds.adGroupName"
        metrics={["GoogleAds.impressions"]}
        filters={filters} // Pass global filters
      />
    </>
  )
}
```

### Chart Component Integration

Inside your chart components:

```tsx
import { useCubeQuery } from "@cubejs-client/react"

export function MyChart({ filters }: { filters: any[] }) {
  const query = {
    dimensions: ["GoogleAds.campaignName"],
    measures: ["GoogleAds.impressions"],
    filters: filters // Apply global filters
  }

  const { resultSet } = useCubeQuery(query)
  // ... render chart
}
```

## Troubleshooting

### Issue: Dimension values not loading

**Solution:**
1. Check Cube.js dimension name format: `"CubeName.dimensionName"`
2. Verify dimension exists in your Cube.js schema
3. Check Cube.js API connection

```tsx
// ✅ Correct format
<DropdownFilter dimension="GoogleAds.campaignName" />

// ❌ Incorrect format
<DropdownFilter dimension="campaignName" />
```

### Issue: Too many values (slow performance)

**Solution:**
1. Reduce `limit` prop
2. Add `preFilters` to narrow results
3. Consider pagination (future enhancement)

```tsx
<DropdownFilter
  dimension="GoogleAds.keyword"
  limit={200} // Reduce from default 1000
  preFilters={[{
    member: "GoogleAds.impressions",
    operator: "gt",
    values: ["100"] // Only keywords with >100 impressions
  }]}
/>
```

### Issue: Filters not applying to charts

**Solution:**
1. Ensure charts receive `filters` prop
2. Check filter object structure
3. Verify `useDashboardFilters` hook is used

```tsx
// ✅ Correct usage
const { filters } = useDashboardFilters()
<MyChart filters={filters} />

// ❌ Missing filters prop
<MyChart /> // Won't apply filters!
```

## TypeScript Support

Full TypeScript types are exported:

```typescript
import {
  DropdownFilterProps,
  useDashboardFilters
} from "@/components/dashboard-builder/controls/DropdownFilter"

// Custom component with filters
interface MyComponentProps {
  filters: ReturnType<typeof useDashboardFilters>['filters']
}
```

## Related Components

- **DateRangeFilter** - Date range selection for time-based filtering
- **SearchFilter** - Free-text search across dimensions
- **RangeFilter** - Numeric range filtering (e.g., cost, impressions)

## Support & Feedback

For issues or feature requests, see:
- **Examples**: `/src/components/dashboard-builder/controls/DropdownFilter.example.tsx`
- **Tests**: `/src/components/dashboard-builder/__tests__/DropdownFilter.test.tsx`
- **Cube.js Docs**: https://cube.dev/docs

---

**Built with:**
- React 19
- Cube.js Client
- Radix UI
- Tailwind CSS
- TypeScript
