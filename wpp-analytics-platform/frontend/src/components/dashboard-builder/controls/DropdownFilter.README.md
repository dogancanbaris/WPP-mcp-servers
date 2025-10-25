# DropdownFilter - Quick Start Guide

**A production-ready dropdown filter component with Cube.js integration for the WPP Analytics Platform.**

## 🚀 Quick Start (30 seconds)

```tsx
import { DropdownFilter } from "@/components/dashboard-builder/controls"

function MyDashboard() {
  const [campaign, setCampaign] = React.useState<string | null>(null)

  return (
    <DropdownFilter
      id="campaign"
      label="Campaign Name"
      dimension="GoogleAds.campaignName"
      value={campaign || undefined}
      onChange={(value) => setCampaign(value as string | null)}
    />
  )
}
```

**That's it!** The component will:
- ✅ Fetch campaign names from Cube.js automatically
- ✅ Display them in a searchable dropdown
- ✅ Handle loading and error states
- ✅ Be fully accessible (WCAG 2.1 AA)
- ✅ Work on mobile and desktop

---

## 📋 Common Use Cases

### 1. Single-Select (Most Common)

```tsx
<DropdownFilter
  id="status"
  label="Order Status"
  dimension="Orders.status"
  mode="single"
  value={status}
  onChange={(value) => setStatus(value)}
/>
```

### 2. Multi-Select

```tsx
<DropdownFilter
  id="countries"
  label="Countries"
  dimension="Orders.country"
  mode="multi"
  value={countries}
  onChange={(value) => setCountries(value || [])}
/>
```

### 3. Global Dashboard Filters

```tsx
const { filters, addFilter } = useDashboardFilters()

<DropdownFilter
  dimension="GoogleAds.campaignName"
  onChange={(value) => {
    if (value) {
      addFilter({
        member: "GoogleAds.campaignName",
        operator: "equals",
        values: [value]
      })
    }
  }}
/>

// All charts receive the filters
<BarChart filters={filters} />
<LineChart filters={filters} />
```

### 4. Cascading Filters

```tsx
// Parent filter
<DropdownFilter
  dimension="GoogleAds.accountName"
  onChange={(value) => {
    setAccount(value)
    setCampaign(null) // Reset dependent filter
  }}
/>

// Child filter (filtered by parent)
<DropdownFilter
  dimension="GoogleAds.campaignName"
  preFilters={account ? [{
    member: "GoogleAds.accountName",
    operator: "equals",
    values: [account]
  }] : undefined}
/>
```

---

## 🎯 Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier |
| `label` | `string` | ✅ | Display label |
| `dimension` | `string` | ✅ | Cube.js dimension (e.g., "Orders.status") |
| `mode` | `"single" \| "multi"` | ❌ | Selection mode (default: "single") |
| `value` | `string \| string[]` | ❌ | Selected value(s) |
| `onChange` | `(value) => void` | ❌ | Selection change handler |
| `placeholder` | `string` | ❌ | Placeholder text |
| `limit` | `number` | ❌ | Max values to fetch (default: 1000) |
| `enableSearch` | `boolean` | ❌ | Enable search (default: true) |
| `preFilters` | `Array<Filter>` | ❌ | Pre-filter dimension values |
| `showCount` | `boolean` | ❌ | Show count in multi-select (default: true) |

---

## 💡 Real-World Examples

### Google Ads Dashboard

```tsx
function GoogleAdsDashboard() {
  const { filters, addFilter, removeFilter } = useDashboardFilters()

  return (
    <>
      {/* Campaign Filter */}
      <DropdownFilter
        id="campaign"
        label="Campaign"
        dimension="GoogleAds.campaignName"
        onChange={(value) => {
          if (value) {
            addFilter({
              member: "GoogleAds.campaignName",
              operator: "equals",
              values: [value]
            })
          } else {
            removeFilter("GoogleAds.campaignName")
          }
        }}
      />

      {/* Device Filter */}
      <DropdownFilter
        id="device"
        label="Device"
        dimension="GoogleAds.device"
        mode="multi"
        onChange={(value) => {
          if (value && value.length > 0) {
            addFilter({
              member: "GoogleAds.device",
              operator: "in",
              values: value
            })
          } else {
            removeFilter("GoogleAds.device")
          }
        }}
      />

      {/* Charts (automatically filtered) */}
      <BarChart
        dimension="GoogleAds.adGroupName"
        metrics={["GoogleAds.impressions", "GoogleAds.clicks"]}
        filters={filters}
      />
    </>
  )
}
```

### Search Console Dashboard

```tsx
function SearchConsoleDashboard() {
  const { filters, addFilter, removeFilter } = useDashboardFilters()

  return (
    <>
      <DropdownFilter
        id="country"
        label="Country"
        dimension="SearchConsole.country"
        mode="multi"
        onChange={(value) => {
          if (value && value.length > 0) {
            addFilter({
              member: "SearchConsole.country",
              operator: "in",
              values: value
            })
          } else {
            removeFilter("SearchConsole.country")
          }
        }}
      />

      <DropdownFilter
        id="device"
        label="Device"
        dimension="SearchConsole.device"
        mode="multi"
        onChange={(value) => {
          if (value && value.length > 0) {
            addFilter({
              member: "SearchConsole.device",
              operator: "in",
              values: value
            })
          } else {
            removeFilter("SearchConsole.device")
          }
        }}
      />
    </>
  )
}
```

---

## ⚡ Performance Tips

### 1. Limit Dimension Values

```tsx
// ✅ GOOD: Reasonable limit
<DropdownFilter dimension="GoogleAds.keyword" limit={500} />

// ❌ BAD: Too many values
<DropdownFilter dimension="GoogleAds.keyword" limit={50000} />
```

### 2. Use Pre-Filters

```tsx
// ✅ GOOD: Pre-filter to reduce data
<DropdownFilter
  dimension="GoogleAds.campaignName"
  preFilters={[{
    member: "GoogleAds.impressions",
    operator: "gt",
    values: ["1000"]
  }]}
/>
```

### 3. Disable Search When Not Needed

```tsx
// ✅ GOOD: Simple dropdown for few values
<DropdownFilter
  dimension="GoogleAds.device" // Only 3 values
  enableSearch={false}
/>
```

---

## 🔧 Troubleshooting

### Issue: "Dimension values not loading"

**Solution:**
```tsx
// ❌ Wrong format
<DropdownFilter dimension="campaignName" />

// ✅ Correct format
<DropdownFilter dimension="GoogleAds.campaignName" />
```

### Issue: "Too slow with many values"

**Solution:**
```tsx
<DropdownFilter
  dimension="GoogleAds.keyword"
  limit={200} // Reduce limit
  preFilters={[{ // Add pre-filter
    member: "GoogleAds.impressions",
    operator: "gt",
    values: ["100"]
  }]}
/>
```

### Issue: "Filters not applying to charts"

**Solution:**
```tsx
// ❌ Missing filters prop
<BarChart dimension="..." metrics={[...]} />

// ✅ Pass filters
const { filters } = useDashboardFilters()
<BarChart dimension="..." metrics={[...]} filters={filters} />
```

---

## 📚 Complete Documentation

For detailed documentation, see:
- **Full Docs**: `/DropdownFilter.md`
- **Examples**: `/DropdownFilter.example.tsx`
- **Tests**: `/DropdownFilter.test.tsx`

---

## 🎨 Customization

### Custom Trigger

```tsx
<DropdownFilter
  renderTrigger={(selected) => (
    <div className="flex items-center gap-2">
      <Badge>{selected.length}</Badge>
      <span>selected</span>
    </div>
  )}
/>
```

### Custom Items

```tsx
<DropdownFilter
  renderItem={(value) => (
    <div className="flex justify-between w-full">
      <span className="font-medium">{value}</span>
      <Badge variant="outline">Custom</Badge>
    </div>
  )}
/>
```

---

## 🔗 Integration with Other Components

### With DateRangeFilter

```tsx
const { filters, addFilter } = useDashboardFilters()

<DateRangeFilter
  onChange={(range) => {
    // Add date filter
  }}
/>

<DropdownFilter
  dimension="Orders.status"
  preFilters={filters} // Dimension values filtered by date
/>
```

### With Charts

```tsx
const { filters } = useDashboardFilters()

<DropdownFilter dimension="..." onChange={...} />
<DropdownFilter dimension="..." onChange={...} />

<BarChart filters={filters} />
<LineChart filters={filters} />
<Table filters={filters} />
```

---

## 🚨 Common Mistakes

### ❌ Don't: Use wrong dimension format

```tsx
<DropdownFilter dimension="status" /> // Missing cube name
```

### ✅ Do: Use correct Cube.js format

```tsx
<DropdownFilter dimension="Orders.status" />
```

---

### ❌ Don't: Fetch too many values

```tsx
<DropdownFilter dimension="GoogleAds.keyword" limit={100000} />
```

### ✅ Do: Use reasonable limits

```tsx
<DropdownFilter dimension="GoogleAds.keyword" limit={500} />
```

---

### ❌ Don't: Forget to pass filters to charts

```tsx
<BarChart dimension="..." metrics={[...]} /> // Won't apply filters
```

### ✅ Do: Pass filters prop

```tsx
const { filters } = useDashboardFilters()
<BarChart dimension="..." metrics={[...]} filters={filters} />
```

---

## 🎯 Best Practices

1. **Use single-select for mutually exclusive options** (status, type, etc.)
2. **Use multi-select for additive filters** (countries, devices, etc.)
3. **Provide clear, descriptive labels**
4. **Use pre-filters to reduce data** (especially for large dimensions)
5. **Disable search for dimensions with <10 values**
6. **Set reasonable limits** (100-1000 depending on use case)
7. **Test with real data** (including edge cases)

---

## 📊 Supported Cube.js Dimensions

The component works with any Cube.js dimension:

- **Google Ads**: `GoogleAds.campaignName`, `GoogleAds.device`, `GoogleAds.network`
- **Search Console**: `SearchConsole.country`, `SearchConsole.device`, `SearchConsole.query`
- **Analytics**: `Analytics.pagePath`, `Analytics.source`, `Analytics.medium`
- **Orders**: `Orders.status`, `Orders.country`, `Orders.product`
- **Custom**: Any dimension in your Cube.js schema

---

## 🔐 Security & Privacy

- ✅ No data stored in component state beyond selection
- ✅ Values fetched fresh from Cube.js (respects data permissions)
- ✅ Sanitizes special characters in display
- ✅ XSS protection via React
- ✅ Multi-tenant safe (respects Cube.js security context)

---

## ⌨️ Keyboard Shortcuts

- **Tab** - Focus next element
- **Space / Enter** - Open/close dropdown
- **Arrow Up/Down** - Navigate options
- **Escape** - Close dropdown
- **Type to search** - Filter options (when search enabled)

---

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📱 Mobile Support

- ✅ Touch-friendly tap targets (44x44px minimum)
- ✅ Responsive width (adapts to screen size)
- ✅ Scrollable dropdown list
- ✅ Virtual keyboard support

---

## ♿ Accessibility

- ✅ WCAG 2.1 AA compliant
- ✅ Screen reader announcements
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels and roles
- ✅ High contrast mode support

---

**Built with React 19, Cube.js, Radix UI, and Tailwind CSS**
**Part of the WPP Analytics Platform**
