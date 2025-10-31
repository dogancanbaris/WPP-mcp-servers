# Dashboard Component Quick Reference

## CORE CHARTS (Most Common)

### KPI Display
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `scorecard` | Single KPI value | `metrics: ["metric"]` |

### Trends Over Time
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `time_series` | Line chart over time | `metrics: ["m1", "m2"]`, `dimension: "date"` |
| `area_chart` | Filled area trend | `metrics: ["metric"]`, `dimension: "date"` |
| `line_chart` | Simple line graph | `metrics: ["metric"]`, `dimension: "date"` |

### Data Tables
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `table` | Sortable data table | `metrics: ["m1"]`, `dimension: "category"` |

### Category Distributions
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `pie_chart` | Part-to-whole breakdown | `metrics: ["metric"]`, `dimension: "category"` |
| `bar_chart` | Category comparison | `metrics: ["metric"]`, `dimension: "category"` |
| `treemap_chart` | Hierarchical breakdown | `metrics: ["metric"]`, `dimension: "category"` |

### Stacked Charts
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `stacked_bar_chart` | Stacked horizontal bars | `metrics: ["m1", "m2"]`, `dimension: "category"` |
| `stacked_column_chart` | Stacked vertical columns | `metrics: ["m1", "m2"]`, `dimension: "category"` |

---

## ANALYSIS CHARTS

### Correlations
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `scatter_chart` | XY correlation | `metrics: ["x", "y"]`, `dimension: "label"` |
| `bubble_chart` | 3D scatter (size) | `metrics: ["x", "y", "size"]`, `dimension: "label"` |

### Multi-Dimensional
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `radar_chart` | Multi-axis comparison | `metrics: ["m1", "m2", "m3"]`, `dimension: "category"` |
| `parallel_chart` | Parallel coordinates | `metrics: ["m1", "m2", "m3"]`, `dimension: "label"` |
| `heatmap_chart` | Color intensity grid | `metrics: ["metric"]`, `dimensions: ["x", "y"]` |

### Flows & Funnels
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `funnel_chart` | Conversion stages | `metrics: ["metric"]`, `dimension: "stage"` |
| `sankey_chart` | Flow between categories | `dimensions: ["source", "target"]`, `metrics: ["value"]` |
| `waterfall_chart` | Incremental changes | `metrics: ["metric"]`, `dimension: "category"` |

---

## SPECIALIZED CHARTS

### Performance Indicators
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `gauge_chart` | Semi-circle gauge | `metrics: ["metric"]` |
| `bullet_chart` | Target vs actual | `metrics: ["actual"]`, `target: number` |

### Time-Based
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `calendar_heatmap` | Calendar grid | `metrics: ["metric"]`, `dimension: "date"` |
| `timeline_chart` | Event timeline | `dimensions: ["event", "date"]`, `metrics: ["value"]` |

### Financial
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `candlestick_chart` | OHLC chart | `metrics: ["open", "high", "low", "close"]`, `dimension: "date"` |

### Hierarchical
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `sunburst_chart` | Radial hierarchy | `dimensions: ["parent", "child"]`, `metrics: ["value"]` |
| `tree_chart` | Tree structure | `dimensions: ["parent", "child"]`, `metrics: ["value"]` |
| `graph_chart` | Network graph | `dimensions: ["source", "target"]`, `metrics: ["weight"]` |

### Geographic
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `geomap_chart` | Geographic map | `dimensions: ["region", "country"]`, `metrics: ["metric"]` |

### Mixed/Other
| Component | Purpose | Required Props |
|-----------|---------|----------------|
| `combo_chart` | Line + bar combined | `metrics: ["m1", "m2"]`, `dimension: "date"` |
| `boxplot_chart` | Statistical distribution | `metrics: ["metric"]`, `dimension: "category"` |
| `pictorial_bar_chart` | Icon-based bars | `metrics: ["metric"]`, `dimension: "category"` |
| `theme_river_chart` | Stacked stream | `metrics: ["m1", "m2"]`, `dimension: "date"` |
| `pivot_table_chart` | Pivot table | `dimensions: ["row", "col"]`, `metrics: ["metric"]` |

---

## CONTROL COMPONENTS

### Essential Controls
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `date_range_filter` | Date picker | `defaultPreset`, `showComparison` |

### Filtering Controls
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `checkbox_filter` | Boolean toggle | `dimension`, `label`, `defaultValue` |
| `list_filter` | Multi-select | `dimension`, `searchable` |
| `dropdown_filter` | Single-select | `dimension`, `options` |
| `slider_filter` | Numeric range | `field`, `min`, `max` |
| `input_box_filter` | Text search | `field`, `operator` |

### Dynamic Controls
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `dimension_control` | Dimension switcher | `options`, `defaultValue` |
| `advanced_filter` | Complex filter builder | `availableFields` |
| `preset_filter` | Saved presets | `presets` |

### Action Controls
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `button_control` | Action button | `action`, `label` |

---

## TYPICAL DASHBOARD LAYOUTS

### Simple 3-Row Dashboard
```
Row 1: [Title (2/3)] [date_range_filter (1/3)]
Row 2: [Scorecard 1] [Scorecard 2] [Scorecard 3] [Scorecard 4]
Row 3: [time_series (full width)]
```

### Detailed 5-Row Dashboard
```
Row 1: [Title (2/3)] [date_range_filter (1/3)]
Row 2: [SC1] [SC2] [SC3] [SC4]
Row 3: [time_series (full width)]
Row 4: [table (1/2)] [pie_chart (1/2)]
Row 5: [bar_chart (1/2)] [treemap_chart (1/2)]
```

### Analysis Dashboard
```
Row 1: [date_range_filter (1/3)] [list_filter (1/3)] [dimension_control (1/3)]
Row 2: [SC1] [SC2] [SC3] [SC4]
Row 3: [scatter_chart (1/2)] [heatmap_chart (1/2)]
Row 4: [table (full width)]
```

---

## COMPONENT SELECTION GUIDE

### When to use what?

**Need to show a single metric:**
→ `scorecard`

**Need trend over time:**
→ `time_series` or `area_chart`

**Need detailed data:**
→ `table`

**Need category breakdown:**
→ `pie_chart` (few categories) or `bar_chart` (many categories)

**Need to show relationship between 2 metrics:**
→ `scatter_chart` or `bubble_chart`

**Need to compare multiple metrics across categories:**
→ `radar_chart` or `parallel_chart`

**Need to show conversion funnel:**
→ `funnel_chart`

**Need to show user flow:**
→ `sankey_chart`

**Need to show performance vs target:**
→ `gauge_chart` or `bullet_chart`

**Need to show geographic data:**
→ `geomap_chart`

**Need to show hierarchical data:**
→ `treemap_chart`, `sunburst_chart`, or `tree_chart`

**Need to show time patterns:**
→ `calendar_heatmap`

**Need comparison mode:**
→ Any chart + `date_range_filter` with `showComparison: true`

---

## FILTER SYSTEM CHEATSHEET

### Three Levels (Priority: Component > Page > Global)

1. **Global Filters** (dashboard-wide)
2. **Page Filters** (from controls like date_range_filter)
3. **Component Filters** (individual overrides)

### Opt-out of filters:
```json
{
  "type": "scorecard",
  "usePageFilters": false,
  "useGlobalFilters": false
}
```

### Component-specific filter:
```json
{
  "type": "table",
  "componentFilters": [
    {"field": "device", "operator": "=", "values": ["mobile"]}
  ]
}
```

---

## COMPARISON MODE

Enable in `date_range_filter`:
```json
{
  "type": "date_range_filter",
  "showComparison": true
}
```

**Effects:**
- **Scorecards:** Show % change badge (↑ 17.6%)
- **Time series:** Dashed line for previous period
- **Tables:** Add Δ% columns

---

## COMMON PATTERNS

### Standard SEO Dashboard
```
- date_range_filter (with comparison)
- 4 scorecards (clicks, impressions, ctr, position)
- time_series (clicks + impressions over time)
- table (top pages)
- pie_chart (device split)
```

### E-commerce Dashboard
```
- date_range_filter
- 4 scorecards (revenue, orders, conversion_rate, aov)
- time_series (revenue trend)
- funnel_chart (checkout funnel)
- table (top products)
```

### Traffic Analysis
```
- date_range_filter + list_filter (device)
- 3 scorecards (users, sessions, bounce_rate)
- time_series (traffic trend)
- geomap_chart (traffic by country)
- table (top landing pages)
```

### Conversion Optimization
```
- date_range_filter
- funnel_chart (conversion stages)
- table (conversion by page)
- scatter_chart (traffic vs conversion)
- heatmap_chart (time-based patterns)
```

---

## WIDTH REFERENCE

| Width | Value | Use Case |
|-------|-------|----------|
| `1/1` | 100% | Full-width charts, tables |
| `1/2` | 50% | Side-by-side charts |
| `1/3` | 33% | Three across (controls) |
| `2/3` | 67% | Title sections |
| `1/4` | 25% | Scorecards (4 across) |
| `3/4` | 75% | Asymmetric layouts |

---

## BEST PRACTICES

1. **Always include date_range_filter** (first row)
2. **Use showComparison: true** for trend analysis
3. **Limit scorecards to 4-6** per dashboard
4. **Place controls in first row** for visibility
5. **Keep pages to 4-8 components** for performance
6. **Use tables for detail**, charts for trends
7. **Consider multi-page** when >10 components
8. **Name metrics clearly** in titles
9. **Use appropriate chart types** for data
10. **Test comparison mode** on all charts

---

## ERROR TROUBLESHOOTING

### "No rows provided"
→ Add `rows: [...]` array to input

### "Each page must have at least one row"
→ Ensure every page in `pages` array has `rows` property

### Chart not displaying
→ Check `metrics` and `dimension` are correct field names
→ Verify `dataset_id` is set (auto-injected)

### Filters not working
→ Ensure control emits to correct page
→ Check component hasn't opted out with `usePageFilters: false`

### Comparison not showing
→ Set `showComparison: true` in date_range_filter
→ Verify date range is valid

---

## COMPONENT COUNT

- **Total Components:** 43
- **Chart Types:** 33
- **Control Types:** 10
- **Core Charts:** 18
- **Advanced Charts:** 15
- **Essential Controls:** 3-4
- **Optional Controls:** 6-7
