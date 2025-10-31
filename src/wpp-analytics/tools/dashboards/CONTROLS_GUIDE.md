# Dashboard Controls Guide

## Overview

Page-level controls are special components that emit filters affecting ALL components on the same page. They enable interactive exploration without requiring code changes.

## Control Types

### 1. date_range_filter

**Purpose:** Filter time-series data by date range with optional comparison mode.

**Use When:**
- Dashboard displays time-series data (most dashboards)
- Users need to adjust time periods dynamically
- You want to show period-over-period comparisons

**Properties:**
```json
{
  "type": "date_range_filter",
  "title": "Period",
  "defaultRange": "last30Days",
  "showComparison": true,
  "dimension": "date"
}
```

**Available Ranges:**
- `last7Days` - Last 7 days
- `last30Days` - Last 30 days
- `last90Days` - Last 90 days
- `thisMonth` - Current calendar month
- `lastMonth` - Previous calendar month
- `thisYear` - Calendar year to date
- `lastYear` - Previous calendar year

**Comparison Modes:**
- `WoW` - Week over week
- `MoM` - Month over month
- `YoY` - Year over year

**When showComparison: true:**
- Scorecards show % change badges
- Line charts show dashed comparison line
- Bar charts show grouped current vs previous
- Tables include change % columns

---

### 2. checkbox_filter

**Purpose:** Filter by a boolean/flag dimension.

**Use When:**
- Need to toggle between enabled/disabled states
- Want to show "Active Only" type filters
- Filtering by boolean conditions

**Properties:**
```json
{
  "type": "checkbox_filter",
  "title": "Active Campaigns",
  "dimension": "is_active",
  "label": "Show Active Only"
}
```

**Common Use Cases:**
- Active/Inactive campaigns
- Verified/Unverified accounts
- Enabled/Disabled features
- Approved/Unapproved content

---

### 3. list_filter

**Purpose:** Multi-select filtering from dimension values.

**Use When:**
- Users need to select multiple specific values
- Dimension has manageable number of values
- Want searchable dropdowns

**Properties:**
```json
{
  "type": "list_filter",
  "title": "Countries",
  "dimension": "country",
  "searchable": true,
  "maxSelections": 10
}
```

**Best For:**
- Geographic filtering (countries, regions)
- Device filtering (desktop, mobile, tablet)
- Campaign selection
- Source/channel filtering
- Account filtering

**searchable:** true/false
- `true`: Shows search box for quick filtering
- `false`: Static dropdown list

---

### 4. dimension_control

**Purpose:** Switch the breakdown dimension across all charts.

**Use When:**
- Multiple charts use same base metrics
- Want to explore data by different groupings
- Building exploratory dashboards

**Properties:**
```json
{
  "type": "dimension_control",
  "title": "View By",
  "options": ["country", "device", "campaign"],
  "default": "country"
}
```

**Use Case Example:**
```
User views dashboard showing "Revenue by Country"
Switches dimension_control to "Device"
All charts instantly regroup to show "Revenue by Device"
```

---

### 5. slider_filter

**Purpose:** Numeric range filtering.

**Use When:**
- Need to filter by numeric ranges
- Values have natural min/max boundaries
- Want to explore data within thresholds

**Properties:**
```json
{
  "type": "slider_filter",
  "title": "Cost Range",
  "dimension": "cost",
  "min": 0,
  "max": 10000,
  "step": 100,
  "unit": "$"
}
```

**Common Use Cases:**
- Cost filtering ($0 - $10,000)
- Impression filtering (1000 - 1M)
- Click filtering (10 - 10,000)
- Conversion filtering (1 - 100)

---

## When to Use Controls vs Component Filters

### Use Page-Level Controls When:

✓ Dashboard will be used interactively
✓ Users need dynamic filtering
✓ Date range should be adjustable
✓ Multiple charts respond to same filter
✓ Building exploratory dashboards

### Use Component-Level Filters When:

✓ Dashboard is static/report-style
✓ Specific date range is required
✓ Each chart needs independent filtering
✓ Dashboard is for automated reporting
✓ Filters are view-specific, not dashboard-wide

---

## Control Placement Strategy

### Header Pattern (Recommended)
```json
{
  "columns": [
    {
      "width": "3/4",
      "component": { "type": "title", "title": "Dashboard Name" }
    },
    {
      "width": "1/4",
      "component": {
        "type": "date_range_filter",
        "defaultRange": "last30Days"
      }
    }
  ]
}
```

### Filter Row Pattern
```json
{
  "columns": [
    {
      "width": "1/2",
      "component": {
        "type": "list_filter",
        "title": "Campaigns",
        "dimension": "campaign_name",
        "searchable": true
      }
    },
    {
      "width": "1/2",
      "component": {
        "type": "list_filter",
        "title": "Status",
        "dimension": "campaign_status"
      }
    }
  ]
}
```

### Exploration Pattern
```json
{
  "columns": [
    {
      "width": "1/3",
      "component": {
        "type": "dimension_control",
        "title": "Group By",
        "options": ["country", "device", "campaign"]
      }
    },
    {
      "width": "1/3",
      "component": {
        "type": "checkbox_filter",
        "title": "Active Only",
        "dimension": "is_active"
      }
    },
    {
      "width": "1/3",
      "component": {
        "type": "slider_filter",
        "title": "Min Cost",
        "dimension": "cost",
        "min": 0,
        "max": 10000
      }
    }
  ]
}
```

---

## Component-Level Overrides

Individual components can opt-out of page filters using `usePageFilters: false`:

```json
{
  "type": "scorecard",
  "title": "Year-to-Date Total",
  "metrics": ["revenue"],
  "usePageFilters": false
}
```

**Use Sparingly For:**
- Context metrics (YTD while viewing current month)
- Comparative metrics (previous period totals)
- Reference figures (goals, benchmarks)

---

## Comparison Mode Deep Dive

### Enable Comparison:
```json
{
  "type": "date_range_filter",
  "showComparison": true,
  "defaultRange": "last30Days"
}
```

### What Each Chart Type Shows:

**Scorecards:**
- Primary: Current period value
- Badge: % change with direction indicator (↑ ↓)

**Line Charts:**
- Solid line: Current period
- Dashed line: Previous period
- Legend distinguishes the two

**Bar Charts:**
- Grouped bars: Current vs Previous
- Side-by-side comparison
- Color differentiation

**Tables:**
- Current metrics columns
- Previous period columns
- % change column

### Best Practices for Comparison:
1. Use with time-series dashboards
2. Ensure all charts support comparison display
3. Test visual clarity with comparison enabled
4. Provide clear period labels
5. Use for trend analysis dashboards

---

## Real-World Examples

### Example 1: SEO Agency Dashboard

```json
{
  "title": "SEO Performance Dashboard",
  "datasource": "gsc_performance",
  "rows": [
    {
      "columns": [
        {
          "width": "3/4",
          "component": { "type": "title", "title": "SEO Performance" }
        },
        {
          "width": "1/4",
          "component": {
            "type": "date_range_filter",
            "defaultRange": "last30Days",
            "showComparison": true
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "Clicks",
            "metrics": ["clicks"]
          }
        },
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "Impressions",
            "metrics": ["impressions"]
          }
        },
        {
          "width": "1/3",
          "component": {
            "type": "scorecard",
            "title": "Avg. Position",
            "metrics": ["avgPosition"]
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/1",
          "component": {
            "type": "time_series",
            "title": "Daily Performance",
            "dimension": "date",
            "metrics": ["clicks", "impressions"]
          }
        }
      ]
    }
  ]
}
```

### Example 2: Multi-Filter Ads Dashboard

```json
{
  "title": "Google Ads Performance",
  "datasource": "google_ads",
  "rows": [
    {
      "columns": [
        {
          "width": "2/3",
          "component": { "type": "title", "title": "Campaign Analytics" }
        },
        {
          "width": "1/3",
          "component": {
            "type": "date_range_filter",
            "defaultRange": "last30Days",
            "showComparison": true
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/2",
          "component": {
            "type": "list_filter",
            "title": "Campaigns",
            "dimension": "campaign_name",
            "searchable": true
          }
        },
        {
          "width": "1/2",
          "component": {
            "type": "list_filter",
            "title": "Status",
            "dimension": "campaign_status"
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Clicks",
            "metrics": ["clicks"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Cost",
            "metrics": ["cost"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Conversions",
            "metrics": ["conversions"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "ROAS",
            "metrics": ["roas"]
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/1",
          "component": {
            "type": "table",
            "title": "Campaign Breakdown",
            "dimension": "campaign_name",
            "metrics": ["clicks", "cost", "conversions", "roas"]
          }
        }
      ]
    }
  ]
}
```

### Example 3: Exploratory Analytics Dashboard

```json
{
  "title": "Web Analytics Explorer",
  "datasource": "ga4_events",
  "rows": [
    {
      "columns": [
        {
          "width": "1/1",
          "component": { "type": "title", "title": "Traffic Analysis" }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/2",
          "component": {
            "type": "date_range_filter",
            "title": "Date Range",
            "defaultRange": "last30Days"
          }
        },
        {
          "width": "1/2",
          "component": {
            "type": "dimension_control",
            "title": "Group By",
            "options": ["country", "device", "source"],
            "default": "country"
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/2",
          "component": {
            "type": "bar_chart",
            "title": "Sessions",
            "metrics": ["sessions"]
          }
        },
        {
          "width": "1/2",
          "component": {
            "type": "bar_chart",
            "title": "Conversions",
            "metrics": ["conversions"]
          }
        }
      ]
    }
  ]
}
```

---

## Validation Checklist

Before deploying a control-enabled dashboard:

- [ ] Date controls have sensible `defaultRange` values
- [ ] List filters have `searchable: true` if options exceed 10
- [ ] No more than 3-4 controls per dashboard
- [ ] Controls placed in header or first dedicated row
- [ ] All components can handle the expected filters
- [ ] Comparison mode works visually (if enabled)
- [ ] Component overrides (`usePageFilters: false`) are justified
- [ ] Filter dimensions exist in datasource
- [ ] Default values are realistic
- [ ] Charts update smoothly when filters change

---

## Performance Tips

1. **Limit Controls:** 2-3 controls maximum to avoid confusion
2. **Cache Defaults:** Use `defaultRange`, `default` to avoid loading all data
3. **Searchable Filters:** Use `searchable: true` for 10+ options
4. **Component Limit:** 10-15 components per dashboard
5. **Simple Dimensions:** Filter by indexed dimensions for speed
6. **Test Filters:** Verify charts respond correctly to filter combinations

---

## Common Mistakes

### Mistake 1: Too Many Controls
```json
// AVOID: Filter fatigue
{
  "columns": [
    { "width": "1/6", "component": { "type": "date_range_filter" } },
    { "width": "1/6", "component": { "type": "list_filter", "dimension": "country" } },
    { "width": "1/6", "component": { "type": "list_filter", "dimension": "device" } },
    { "width": "1/6", "component": { "type": "list_filter", "dimension": "source" } },
    { "width": "1/6", "component": { "type": "slider_filter", "dimension": "cost" } },
    { "width": "1/6", "component": { "type": "checkbox_filter", "dimension": "is_active" } }
  ]
}
```

### Mistake 2: Conflicting Filters
```json
// AVOID: Conflicting control behaviors
{
  "type": "date_range_filter",
  "dimension": "custom_date"  // Non-standard dimension
}
```

### Mistake 3: No Defaults
```json
// AVOID: Requires user action to see data
{
  "type": "date_range_filter"
  // Missing: "defaultRange"
}

// PREFER:
{
  "type": "date_range_filter",
  "defaultRange": "last30Days"  // Shows data immediately
}
```

### Mistake 4: Ignoring Comparison Setup
```json
// AVOID: Comparison mode without suitable charts
{
  "type": "date_range_filter",
  "showComparison": true
}
// But all charts are static/pie charts that don't support comparison
```

---

## Debugging Control Issues

### Controls Not Filtering:
1. Check dimension names match datasource fields
2. Verify components don't have `usePageFilters: false`
3. Ensure datasource is configured correctly
4. Check browser console for errors

### Comparison Not Showing:
1. Verify `showComparison: true` on date_range_filter
2. Confirm charts support comparison display
3. Check that comparison period has data
4. Ensure all date ranges are valid

### Performance Issues:
1. Reduce number of components
2. Remove unnecessary controls
3. Use indexed dimensions for filters
4. Limit list_filter options with `maxSelections`

---

## Next Steps

1. Review examples above matching your use case
2. Create dashboard with 1-2 controls first
3. Test filters and comparison mode
4. Add more controls incrementally
5. Monitor performance and adjust as needed

