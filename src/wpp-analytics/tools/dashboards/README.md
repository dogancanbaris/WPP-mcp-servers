# Dashboard Tools Documentation

This directory contains MCP tools and comprehensive documentation for creating and managing dashboards in the WPP Analytics Platform.

## Quick Navigation

### For Agents Using create_dashboard Tool

1. **Start here:** Read the `create_dashboard` tool description for overview
2. **Quick setup:** Check `QUICK_REFERENCE.md` for template and patterns
3. **Control types:** See `CONTROL_TYPES_REFERENCE.md` for each control option
4. **Deep dive:** Use `CONTROLS_GUIDE.md` for detailed examples and best practices
5. **Examples:** Copy from real-world dashboard examples in guides

### Files Overview

#### Tool Files
- `create-dashboard.tool.ts` - Main MCP tool (see description for comprehensive guide)
- `create-dashboard.tool.ts` - Update dashboard MCP tool
- `list-dashboards.tool.ts` - List available dashboards
- `get-dashboard.tool.ts` - Retrieve dashboard configuration
- `schemas.ts` - Zod validation schemas
- `types.ts` - TypeScript type definitions
- `templates.ts` - Dashboard templates
- `helpers.ts` - Utility functions

#### Documentation Files
- `QUICK_REFERENCE.md` - One-page cheat sheet for controls
- `CONTROL_TYPES_REFERENCE.md` - Detailed docs for each control type
- `CONTROLS_GUIDE.md` - Comprehensive controls guide with examples
- `README.md` - This file

## Key Documentation

### QUICK_REFERENCE.md
**Best for:** Quick lookups, template structure, common patterns

Contains:
- 5 control types with code snippets
- Dashboard layout template
- Common patterns (KPI, multi-filter, exploratory)
- Testing checklist
- Width reference table

### CONTROL_TYPES_REFERENCE.md
**Best for:** Understanding specific control types in detail

Contains:
- Detailed schema for each control type
- Properties with explanations
- Real-world code examples
- Visual output examples
- Common use cases
- Decision tree for choosing controls

### CONTROLS_GUIDE.md
**Best for:** Comprehensive understanding and troubleshooting

Contains:
- Overview and control types
- When to use page vs component filters
- Control placement strategies
- Component-level overrides
- Comparison mode explanation
- Real-world examples (3 different dashboards)
- Validation checklist
- Performance tips
- Common mistakes
- Debugging guide

---

## What Are Dashboard Controls?

Controls are special components that emit filters affecting ALL components on the same page. They enable interactive exploration without requiring code changes.

### 5 Types of Controls

1. **date_range_filter** - Select time periods with optional comparison
2. **list_filter** - Multi-select from dimension values
3. **checkbox_filter** - Boolean toggle filtering
4. **dimension_control** - Switch chart grouping dynamically
5. **slider_filter** - Numeric range filtering

### Key Principle

Controls are just components placed in dashboard rows. They automatically filter all other components on the same page (unless those components have `usePageFilters: false`).

```json
{
  "rows": [
    {
      "columns": [
        {
          "width": "1/4",
          "component": {
            "type": "date_range_filter",  // This filters everything below
            "defaultRange": "last30Days"
          }
        }
      ]
    },
    {
      "columns": [
        {
          "width": "1/1",
          "component": {
            "type": "time_series",  // Automatically filtered by date_range_filter
            "metrics": ["clicks", "impressions"]
          }
        }
      ]
    }
  ]
}
```

---

## Common Dashboard Patterns

### Pattern 1: KPI Dashboard
- 1x date_range_filter in header
- 4-6x scorecard KPIs
- 1-2x time_series charts

**Use when:** Executives need quick snapshot of key metrics

### Pattern 2: Multi-Filter Dashboard
- 1x date_range_filter in header (with comparison)
- 2x list_filter (campaigns, status)
- 4x scorecard KPIs
- 2x charts (trends and breakdown)

**Use when:** Practitioners need to filter and compare data

### Pattern 3: Exploratory Dashboard
- 1x date_range_filter
- 1x dimension_control (group by)
- 1x checkbox_filter (active/inactive)
- 2-3x charts (respond to filters)

**Use when:** Users need to explore data dynamically

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
        "dimension": "campaign_name"
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

---

## Control Decision Tree

```
Need to filter by what?

├─ DATE or TIME PERIOD?
│  └─ Use: date_range_filter
│     Properties: defaultRange, showComparison
│
├─ MULTIPLE SPECIFIC VALUES?
│  └─ Use: list_filter
│     Properties: dimension, searchable
│
├─ TRUE/FALSE or BOOLEAN?
│  └─ Use: checkbox_filter
│     Properties: dimension, label
│
├─ NUMERIC RANGE?
│  └─ Use: slider_filter
│     Properties: min, max, step, unit
│
└─ SWITCH WHAT DIMENSION GROUPS DATA?
   └─ Use: dimension_control
      Properties: options, default
```

---

## Best Practices

### DO

✓ Place controls in first row (after title)
✓ Use date_range_filter on most dashboards
✓ Set sensible defaultRange/default values
✓ Combine 2-3 controls maximum
✓ Test comparison mode if enabled
✓ Provide searchable dropdowns for 10+ options
✓ Use component overrides sparingly
✓ Document what each control does

### DON'T

✗ Create dashboards with 5+ controls
✗ Use controls on static/report dashboards
✗ Forget to set default values
✗ Use list_filter without search if 10+ items
✗ Override page filters on every component
✗ Create controls for fields not in datasource
✗ Mix conflicting filter types
✗ Make controls too wide (harder to use)

---

## Comparison Mode

When `showComparison: true` on date_range_filter:

```
Scorecards show:
┌──────────────┐
│ Clicks       │
│ 1,234        │
│ ↑ 15.3%      │  ← vs previous period
└──────────────┘

Line Charts show:
     ╱╲
   ╱    ╲ ─ ─ ─  ← Dashed line = comparison period
 ╱        ╲

Bar Charts show:
 ▌ ▌     ← Grouped bars (current vs previous)
 ▌▌▌

Tables show:
Clicks | Prev Clicks | Change
1,234  | 1,070       | +15.3%
```

Perfect for trend analysis and period-over-period comparisons.

---

## Component-Level Overrides

Individual components can opt-out of page filters:

```json
{
  "type": "scorecard",
  "title": "Year-to-Date Total",
  "metrics": ["revenue"],
  "usePageFilters": false  // Ignores page date filter
}
```

**Use sparingly for:**
- Context metrics (YTD while viewing current month)
- Reference figures (previous year totals)
- Benchmark comparisons (goals vs actual)

---

## Examples

### Example 1: SEO Dashboard
```json
{
  "title": "SEO Performance Dashboard",
  "datasource": "gsc_performance_7days",
  "rows": [
    {
      "columns": [
        { "width": "3/4", "component": { "type": "title", "title": "SEO Overview" } },
        { "width": "1/4", "component": { "type": "date_range_filter", "defaultRange": "last30Days" } }
      ]
    },
    {
      "columns": [
        { "width": "1/3", "component": { "type": "scorecard", "title": "Clicks", "metrics": ["clicks"] } },
        { "width": "1/3", "component": { "type": "scorecard", "title": "Impressions", "metrics": ["impressions"] } },
        { "width": "1/3", "component": { "type": "scorecard", "title": "CTR", "metrics": ["ctr"] } }
      ]
    },
    {
      "columns": [
        { "width": "1/1", "component": { "type": "time_series", "title": "Trend", "dimension": "date", "metrics": ["clicks", "impressions"] } }
      ]
    }
  ]
}
```

See `CONTROLS_GUIDE.md` and `QUICK_REFERENCE.md` for more examples.

---

## Testing Checklist

Before deploying a dashboard:

- [ ] Date ranges have sensible defaults
- [ ] Changing date updates all charts
- [ ] Comparison mode works (if enabled)
- [ ] List filters are searchable if needed
- [ ] All charts respond to filters
- [ ] No charts show empty data
- [ ] Performance is acceptable
- [ ] Controls are easy to understand
- [ ] Component overrides are justified
- [ ] Mobile view works

---

## Debugging

### Controls Not Filtering
1. Check dimension names match datasource fields
2. Verify components don't have `usePageFilters: false`
3. Ensure datasource is configured correctly
4. Check browser console for errors

### Comparison Not Showing
1. Verify `showComparison: true` is set
2. Confirm charts support comparison display
3. Check that comparison period has data
4. Ensure all dates are valid

### Performance Issues
1. Reduce number of components
2. Remove unnecessary controls
3. Use indexed dimensions for filtering
4. Limit options in list_filter

---

## Related Tools

- `create_dashboard` - Create new dashboards
- `update_dashboard` - Modify existing dashboards
- `list_dashboards` - List all dashboards
- `get_dashboard` - Retrieve dashboard details
- `list_templates` - View available templates

---

## Further Reading

- `QUICK_REFERENCE.md` - One-page cheat sheet
- `CONTROL_TYPES_REFERENCE.md` - Detailed control documentation
- `CONTROLS_GUIDE.md` - Comprehensive guide with examples
- Tool description in `create-dashboard.tool.ts` - MCP tool documentation

---

## Version History

- **v1.0** (Current) - Initial comprehensive controls documentation
  - Added 5 control types
  - Added decision framework
  - Added real-world examples
  - Added comparison mode documentation
  - Added best practices and patterns

---

## Questions?

Refer to:
1. `QUICK_REFERENCE.md` for templates
2. `CONTROL_TYPES_REFERENCE.md` for control details
3. `CONTROLS_GUIDE.md` for examples and troubleshooting
4. Tool description in `create-dashboard.tool.ts` for full documentation

