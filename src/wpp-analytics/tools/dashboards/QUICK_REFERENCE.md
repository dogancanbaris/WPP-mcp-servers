# Dashboard Controls - Quick Reference

## 5 Control Types at a Glance

### 1. Date Range Filter
```json
{
  "type": "date_range_filter",
  "title": "Period",
  "defaultRange": "last30Days",
  "showComparison": true
}
```
**Use:** Time-series dashboards, trend analysis

### 2. List Filter
```json
{
  "type": "list_filter",
  "title": "Countries",
  "dimension": "country",
  "searchable": true
}
```
**Use:** Multi-select from dimension values

### 3. Checkbox Filter
```json
{
  "type": "checkbox_filter",
  "title": "Active Only",
  "dimension": "is_active",
  "label": "Show Active Campaigns"
}
```
**Use:** Boolean/flag filtering

### 4. Dimension Control
```json
{
  "type": "dimension_control",
  "title": "Group By",
  "options": ["country", "device", "campaign"],
  "default": "country"
}
```
**Use:** Switch chart grouping

### 5. Slider Filter
```json
{
  "type": "slider_filter",
  "title": "Cost Range",
  "dimension": "cost",
  "min": 0,
  "max": 10000,
  "step": 100
}
```
**Use:** Numeric range filtering

---

## Dashboard Layout Template

```json
{
  "title": "Dashboard Name",
  "datasource": "table_name",
  "rows": [
    {
      "columns": [
        {
          "width": "3/4",
          "component": {
            "type": "title",
            "title": "Dashboard Title"
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "date_range_filter",
            "defaultRange": "last30Days"
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
            "title": "Filter 1",
            "dimension": "field_1"
          }
        },
        {
          "width": "1/2",
          "component": {
            "type": "list_filter",
            "title": "Filter 2",
            "dimension": "field_2"
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
            "title": "Metric 1",
            "metrics": ["metric_1"]
          }
        },
        {
          "width": "1/4",
          "component": {
            "type": "scorecard",
            "title": "Metric 2",
            "metrics": ["metric_2"]
          }
        },
        {
          "width": "1/2",
          "component": {
            "type": "time_series",
            "title": "Trend",
            "dimension": "date",
            "metrics": ["metric_1", "metric_2"]
          }
        }
      ]
    }
  ]
}
```

---

## Key Points

- **Controls go in ROWS** - Just like charts, controls are components placed in column/width slots
- **Page-level** - All components on the page respect page controls (unless overridden)
- **Default values matter** - Always set `defaultRange` or `default` to show data immediately
- **Comparison is optional** - Use `showComparison: true` on date filters for period comparison
- **Limit controls** - 2-3 maximum per dashboard to avoid filter fatigue
- **Override sparingly** - Add `usePageFilters: false` to components that need different data

---

## Common Patterns

### KPI Dashboard
- 1x date_range_filter
- 4-6x scorecards
- 1-2x time_series charts

### Multi-filter Dashboard
- 1x date_range_filter
- 2x list_filter (campaigns, status)
- 4x scorecards (KPIs)
- 2x charts (trends, breakdown)

### Exploratory Dashboard
- 1x date_range_filter
- 1x dimension_control (group by)
- 1x checkbox_filter (active/inactive)
- 2-3x charts (respond to filters)

---

## Testing Checklist

- [ ] Date range filters show data immediately
- [ ] Changing date range updates all charts
- [ ] Comparison mode shows period-over-period
- [ ] List filters are searchable if 10+ options
- [ ] Dimension control switches all chart breakdowns
- [ ] Scorecards respond to page filters
- [ ] Time-series charts update with selections
- [ ] No chart shows empty when filters applied
- [ ] Performance is acceptable (fast filter response)

---

## Width Cheat Sheet

| Value | Width | Use Case |
|-------|-------|----------|
| 1/1 | Full width | Full-width charts/tables |
| 1/2 | Half width | 2 items per row |
| 1/3 | 33% width | 3 items per row |
| 2/3 | 66% width | Title + control |
| 1/4 | 25% width | 4 scorecards |
| 3/4 | 75% width | Title + filter |

---

## Need More Detail?

See `CONTROLS_GUIDE.md` for:
- Deep dive into each control type
- Real-world examples
- Performance optimization
- Debugging tips
- Common mistakes

