# Dashboard Control Types - Complete Reference

## 1. Date Range Filter

The most common control type - allows users to select time periods with optional comparison.

### Schema
```typescript
{
  type: 'date_range_filter',
  title?: string,           // Control label (optional)
  defaultRange?: string,    // Default selected range
  showComparison?: boolean, // Show period comparison
  dimension?: string        // Usually 'date'
}
```

### Available Ranges
- `last7Days` - Previous 7 calendar days
- `last30Days` - Previous 30 calendar days
- `last90Days` - Previous 90 calendar days
- `thisMonth` - Current calendar month (1st to today)
- `lastMonth` - Previous calendar month (full month)
- `thisYear` - Calendar year to date
- `lastYear` - Previous full calendar year

### Properties Explained

**title** - Label shown above the control
```json
{ "type": "date_range_filter", "title": "Date Range" }
```

**defaultRange** - Which range is selected when dashboard loads
```json
{ "type": "date_range_filter", "defaultRange": "last30Days" }
```
IMPORTANT: Always set this to show data immediately!

**showComparison** - Enable period-over-period comparison
```json
{ "type": "date_range_filter", "showComparison": true }
```

When enabled:
- User sees 2 date pickers: current period and comparison period
- Charts automatically display comparison data
- Scorecards show % change badges
- Line charts show dashed comparison line
- Tables include change % columns

**dimension** - The date field to filter
```json
{ "type": "date_range_filter", "dimension": "date" }
```
Usually "date" for standard dashboards.

### Real Examples

**Basic - SEO Dashboard**
```json
{
  "type": "date_range_filter",
  "defaultRange": "last30Days"
}
```

**With Comparison - Ads Dashboard**
```json
{
  "type": "date_range_filter",
  "title": "Period",
  "defaultRange": "last30Days",
  "showComparison": true,
  "dimension": "date"
}
```

**Full Configuration**
```json
{
  "type": "date_range_filter",
  "title": "Analysis Period",
  "defaultRange": "thisMonth",
  "showComparison": true,
  "dimension": "event_date"
}
```

### Visual Output

```
[Date Range Picker UI]
┌─────────────────────────────────────────┐
│ Period                                  │
│ [Last 7 Days ▼] [vs Previous Period ✓] │
│ (Shows current + comparison period)     │
└─────────────────────────────────────────┘

Result in Scorecards:
┌──────────────┐
│ Clicks       │
│ 1,234        │
│ ↑ 15.3%      │  ← Automatic comparison
└──────────────┘

Result in Time Series:
┌────────────────────┐
│ Performance Trend  │
│      ╱╲            │
│    ╱    ╲ ─ ─ ─   │  ← Dashed = previous period
│  ╱        ╲        │
└────────────────────┘
```

---

## 2. List Filter

Multi-select dropdown for filtering by dimension values.

### Schema
```typescript
{
  type: 'list_filter',
  title: string,             // Control label (required)
  dimension: string,         // Field to filter
  searchable?: boolean,      // Enable search box
  maxSelections?: number     // Max items user can select
}
```

### Properties Explained

**title** - Label shown above the control
```json
{ "type": "list_filter", "title": "Countries" }
```

**dimension** - The field to filter by
```json
{ "type": "list_filter", "dimension": "country" }
```
Must match a field in your BigQuery datasource.

**searchable** - Show search box when true
```json
{ "type": "list_filter", "searchable": true }
```
Use when dimension has 10+ possible values.

**maxSelections** - Limit how many items can be selected
```json
{ "type": "list_filter", "maxSelections": 5 }
```

### Real Examples

**Simple - Campaign Selection**
```json
{
  "type": "list_filter",
  "title": "Campaigns",
  "dimension": "campaign_name"
}
```

**With Search - Country Selection**
```json
{
  "type": "list_filter",
  "title": "Countries",
  "dimension": "country",
  "searchable": true
}
```

**With Limits - Top Devices**
```json
{
  "type": "list_filter",
  "title": "Device Type",
  "dimension": "device",
  "maxSelections": 3
}
```

### Visual Output

```
[List Filter UI]
┌──────────────────────────┐
│ Countries                │
│ ┌────────────────────┐   │
│ │ ▢ United States    │   │
│ │ ▢ United Kingdom   │   │
│ │ ▢ Canada           │   │
│ │ ▢ Australia        │   │
│ │ ▢ Germany          │   │
│ └────────────────────┘   │
│ Selected: 0/unlimited    │
└──────────────────────────┘

With Search Enabled:
┌──────────────────────────┐
│ Countries                │
│ [Search: ____]           │
│ ┌────────────────────┐   │
│ │ ▢ United States    │   │
│ │ ▢ United Kingdom   │   │
│ │ ▢ Canada           │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

### Common Use Cases
- Country/Region selection
- Campaign/Account selection
- Device/Browser selection
- Source/Channel selection
- Status/Category selection

---

## 3. Checkbox Filter

Boolean toggle for filtering by true/false/both.

### Schema
```typescript
{
  type: 'checkbox_filter',
  title: string,      // Control label (required)
  dimension: string,  // Boolean field to filter
  label?: string      // Checkbox label text
}
```

### Properties Explained

**title** - Label shown above the control
```json
{ "type": "checkbox_filter", "title": "Campaign Status" }
```

**dimension** - The boolean field to filter
```json
{ "type": "checkbox_filter", "dimension": "is_active" }
```
Field should contain true/false or 1/0 values.

**label** - Text shown next to the checkbox
```json
{ "type": "checkbox_filter", "label": "Show Active Only" }
```

### Real Examples

**Active Campaigns**
```json
{
  "type": "checkbox_filter",
  "title": "Activity",
  "dimension": "is_active",
  "label": "Active Campaigns Only"
}
```

**Verified Accounts**
```json
{
  "type": "checkbox_filter",
  "title": "Verification",
  "dimension": "is_verified",
  "label": "Verified Accounts"
}
```

**Enabled Features**
```json
{
  "type": "checkbox_filter",
  "title": "Features",
  "dimension": "feature_enabled",
  "label": "Show Enabled Features"
}
```

### Visual Output

```
[Checkbox Filter UI]
┌──────────────────────────┐
│ Campaign Status          │
│ ☑ Show Active Only       │
└──────────────────────────┘

Unchecked:
┌──────────────────────────┐
│ Campaign Status          │
│ ☐ Show Active Only       │
│ (Shows all campaigns)    │
└──────────────────────────┘
```

### Common Use Cases
- Active/Inactive toggle
- Verified/Unverified toggle
- Enabled/Disabled toggle
- Approved/Unapproved toggle
- Published/Draft toggle

---

## 4. Dimension Control

Switch the breakdown dimension across all charts.

### Schema
```typescript
{
  type: 'dimension_control',
  title: string,         // Control label (required)
  options: string[],     // Available dimensions
  default?: string       // Default selected dimension
}
```

### Properties Explained

**title** - Label shown above the control
```json
{ "type": "dimension_control", "title": "Group By" }
```

**options** - List of available dimensions to group by
```json
{ "type": "dimension_control", "options": ["country", "device", "source"] }
```
All charts on the page must support these dimensions.

**default** - Which dimension is selected initially
```json
{ "type": "dimension_control", "default": "country" }
```

### Real Examples

**Geographic vs Device vs Source**
```json
{
  "type": "dimension_control",
  "title": "View By",
  "options": ["country", "device", "source"],
  "default": "country"
}
```

**Campaign vs Ad Group vs Keyword**
```json
{
  "type": "dimension_control",
  "title": "Breakdown",
  "options": ["campaign", "ad_group", "keyword"],
  "default": "campaign"
}
```

**Traffic Source Breakdown**
```json
{
  "type": "dimension_control",
  "title": "Group By",
  "options": ["utm_source", "utm_medium", "utm_campaign"],
  "default": "utm_source"
}
```

### Visual Output

```
[Dimension Control UI]
┌──────────────────────────┐
│ View By                  │
│ ◉ Country                │
│ ○ Device                 │
│ ○ Source                 │
└──────────────────────────┘

Or as Dropdown:
┌──────────────────────────┐
│ View By                  │
│ [Country ▼]              │
│  ├─ Country              │
│  ├─ Device               │
│  └─ Source               │
└──────────────────────────┘

User Selects "Device":
All charts instantly regroup:
┌────────────────────────┐
│ Revenue by Device      │  ← Was "by Country"
│ Desktop    ███░░░░░░░░ │
│ Mobile     █░░░░░░░░░░ │
│ Tablet     ██░░░░░░░░░ │
└────────────────────────┘
```

### Common Use Cases
- Geographic exploration (country → state → city)
- Device analysis (device → browser → OS)
- Traffic source analysis (source → medium → campaign)
- Product analysis (category → product → variant)
- Time breakdowns (day → week → month)

### Important Notes
- All charts must support the dimensions listed
- Switching dimension updates ALL charts instantly
- Great for exploratory dashboards
- Limited to dimensions that exist in datasource

---

## 5. Slider Filter

Numeric range filtering with min/max selection.

### Schema
```typescript
{
  type: 'slider_filter',
  title: string,      // Control label (required)
  dimension: string,  // Field to filter
  min: number,        // Minimum possible value
  max: number,        // Maximum possible value
  step?: number,      // Increment step (default: 1)
  unit?: string       // Unit label (e.g., "$", "€")
}
```

### Properties Explained

**title** - Label shown above the control
```json
{ "type": "slider_filter", "title": "Cost Range" }
```

**dimension** - The numeric field to filter
```json
{ "type": "slider_filter", "dimension": "cost" }
```

**min/max** - The range boundaries
```json
{
  "type": "slider_filter",
  "min": 0,
  "max": 10000
}
```

**step** - How much value changes with each slider tick
```json
{ "type": "slider_filter", "step": 100 }
```
Use larger steps for big ranges (e.g., cost: 100 for $0-$10k)

**unit** - Currency or unit label
```json
{ "type": "slider_filter", "unit": "$" }
```

### Real Examples

**Cost Range - Dollars**
```json
{
  "type": "slider_filter",
  "title": "Cost Range",
  "dimension": "cost",
  "min": 0,
  "max": 50000,
  "step": 500,
  "unit": "$"
}
```

**Impressions Range**
```json
{
  "type": "slider_filter",
  "title": "Min Impressions",
  "dimension": "impressions",
  "min": 0,
  "max": 1000000,
  "step": 10000
}
```

**Conversion Rate Range - Percentage**
```json
{
  "type": "slider_filter",
  "title": "Conversion Rate Range",
  "dimension": "conversion_rate",
  "min": 0,
  "max": 100,
  "step": 1,
  "unit": "%"
}
```

### Visual Output

```
[Slider Filter UI]
┌──────────────────────────┐
│ Cost Range               │
│ ◄─────●────────────────► │
│ $0              $25,000  │
│ Selected: $5,000-$20,000 │
└──────────────────────────┘

With Specific Range:
┌──────────────────────────┐
│ Cost Range               │
│ ◄─────┬─────┬─────●────► │
│ $0    $5k   $10k  $25k   │
│ Selected: $10,000-$25,000│
└──────────────────────────┘
```

### Common Use Cases
- Cost filtering (display > $1000, cost < $10k)
- Impression filtering (min 1000, max 100k)
- Click filtering (min 10, max 10k)
- Conversion filtering (min 1, max 1000)
- Engagement filtering (min views, max shares)
- Performance filtering (min CTR, max CPC)

### Tips
- Use larger steps for large ranges
- Include unit labels for clarity
- Consider what "default range" makes sense
- Test with real data to set appropriate min/max

---

## Control Placement Patterns

### Pattern 1: Header Row
```json
{
  "columns": [
    { "width": "3/4", "component": { "type": "title", "title": "Dashboard" } },
    { "width": "1/4", "component": { "type": "date_range_filter" } }
  ]
}
```
**Best for:** Single control, prominent placement

### Pattern 2: Filter Row
```json
{
  "columns": [
    { "width": "1/2", "component": { "type": "list_filter", "title": "A" } },
    { "width": "1/2", "component": { "type": "list_filter", "title": "B" } }
  ]
}
```
**Best for:** 2-3 complementary filters

### Pattern 3: Full Exploration
```json
{
  "columns": [
    { "width": "1/3", "component": { "type": "date_range_filter" } },
    { "width": "1/3", "component": { "type": "dimension_control" } },
    { "width": "1/3", "component": { "type": "list_filter", "title": "Filter" } }
  ]
}
```
**Best for:** Exploratory dashboards with multiple filter types

---

## Decision Tree: Which Control to Use?

```
Need to filter?
│
├─ By DATE? ──────────────► date_range_filter
│
├─ By BOOLEAN (true/false)?──► checkbox_filter
│
├─ By MULTIPLE VALUES? ───► list_filter
│                         (use searchable: true if 10+ options)
│
├─ By NUMERIC RANGE? ─────► slider_filter
│
└─ SWITCH GROUPING? ──────► dimension_control
```

---

## Summary Table

| Control | Best For | Example | Dimensions |
|---------|----------|---------|------------|
| date_range_filter | Time-series, trends | "Last 30 Days" | date |
| list_filter | Multi-select values | "Select Countries" | any categorical |
| checkbox_filter | Boolean toggles | "Active Only" | boolean fields |
| dimension_control | Switch grouping | "Group by Country/Device" | available dimensions |
| slider_filter | Numeric ranges | "Cost $0-$10k" | numeric fields |

---

## Common Combinations

### Combo 1: Basic Analytics (Recommended)
- 1x date_range_filter
- 1x list_filter (primary category)

### Combo 2: Multi-Filter Analysis
- 1x date_range_filter (with comparison)
- 2x list_filter (complementary filters)

### Combo 3: Exploratory Dashboard
- 1x date_range_filter
- 1x dimension_control
- 1x list_filter (optional refinement)

### Combo 4: Performance Dashboard
- 1x date_range_filter (with comparison)
- 1x slider_filter (performance threshold)
- 1x checkbox_filter (quality gate)

---

## Validation Checklist

For each control, verify:

- [ ] Title is clear and descriptive
- [ ] Default value is set
- [ ] Dimension field exists in datasource
- [ ] All affected charts support the filter
- [ ] Options/ranges are realistic
- [ ] Search enabled if 10+ list options
- [ ] Performance is acceptable
- [ ] UI looks correct in target screen size
- [ ] Documentation explains the control's purpose

