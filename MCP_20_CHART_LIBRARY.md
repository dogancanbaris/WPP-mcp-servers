# MCP 20-Chart Library Reference

**Last Updated:** October 30, 2025
**Status:** Production Ready
**Version:** 1.0

---

## Quick Reference: The 20 Charts

### Basic Charts (4)
```json
{
  "type": "pie_chart",      // Parts of a whole
  "type": "donut_chart",    // Pie variant with center
  "type": "bar_chart",      // Vertical bar comparisons
  "type": "horizontal_bar"  // Rotated bars for clarity
}
```

### Stacked Charts (2)
```json
{
  "type": "stacked_bar",    // Composition over categories
  "type": "stacked_column"  // Synonym for stacked_bar
}
```

### Time-Series Charts (3)
```json
{
  "type": "line_chart",     // Classic trend lines
  "type": "area_chart",     // Filled line chart
  "type": "time_series"     // Advanced time-indexed chart
}
```

### Advanced Charts (4)
```json
{
  "type": "scatter_chart",  // Correlation analysis
  "type": "bubble_chart",   // 3D scatter (x, y, size)
  "type": "heatmap",        // Matrix with color intensity
  "type": "waterfall"       // Sequential composition
}
```

### Hierarchical Charts (3)
```json
{
  "type": "treemap",        // Rectangular hierarchy
  "type": "sunburst",       // Radial hierarchy
  "type": "tree"            // Tree/dendogram
}
```

### Specialized Charts (4)
```json
{
  "type": "sankey",         // Flow diagrams
  "type": "funnel",         // Conversion stages
  "type": "geomap",         // Geographic visualization
  "type": "word_cloud"      // Text frequency
}
```

### Data Display (2)
```json
{
  "type": "table",          // Data grid
  "type": "scorecard"       // Single metric KPI
}
```

---

## Chart Selection Guide

### What Chart Should I Use?

**For categorical comparisons:**
- bar_chart ✓ (most common)
- horizontal_bar ✓ (long category names)
- pie_chart ✓ (small number of categories)

**For trends over time:**
- line_chart ✓ (most common)
- area_chart ✓ (cumulative trends)
- time_series ✓ (advanced features)

**For showing composition:**
- stacked_bar ✓ (composition by category)
- pie_chart ✓ (parts of whole)
- treemap ✓ (hierarchical parts)

**For relationships & patterns:**
- scatter_chart ✓ (correlation)
- bubble_chart ✓ (3 dimensions)
- heatmap ✓ (matrix patterns)

**For process flows:**
- sankey ✓ (flows and paths)
- funnel ✓ (conversion stages)
- waterfall ✓ (sequential changes)

**For hierarchical data:**
- treemap ✓ (space-efficient)
- sunburst ✓ (interactive drill-down)
- tree ✓ (traditional dendogram)

**For geographic data:**
- geomap ✓ (maps with overlays)

**For detailed data:**
- table ✓ (sortable, paginated)
- scorecard ✓ (single metric)

---

## Common Use Cases

### SEO/Search Analytics
- line_chart (traffic trends)
- bar_chart (top pages/keywords)
- pie_chart (device breakdown)
- table (detailed metrics)

### Campaign Performance
- line_chart (daily performance)
- bar_chart (campaign comparison)
- scatter_chart (cost vs. conversion)
- funnel (lead flow stages)

### E-Commerce
- line_chart (revenue trends)
- stacked_bar (revenue by product)
- pie_chart (top categories)
- table (product performance)

### Executive Dashboards
- scorecard (KPIs)
- line_chart (trends)
- bar_chart (comparisons)
- sankey (customer journey)

### Regional Analysis
- geomap (sales by region)
- bar_chart (regional comparison)
- pie_chart (region share)
- table (detailed data)

---

## Chart Examples

### Example 1: Traffic Dashboard
```json
{
  "pages": [{
    "name": "Overview",
    "rows": [
      {
        "columns": [
          {
            "width": "1/3",
            "component": {
              "type": "scorecard",
              "title": "Total Traffic",
              "metrics": ["users"]
            }
          },
          {
            "width": "1/3",
            "component": {
              "type": "scorecard",
              "title": "Sessions",
              "metrics": ["sessions"]
            }
          },
          {
            "width": "1/3",
            "component": {
              "type": "scorecard",
              "title": "Bounce Rate",
              "metrics": ["bounce_rate"]
            }
          }
        ]
      },
      {
        "columns": [
          {
            "width": "1/1",
            "component": {
              "type": "line_chart",
              "title": "Traffic Over Time",
              "dimension": "date",
              "metrics": ["users"]
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
              "title": "Top Pages",
              "dimension": "page",
              "metrics": ["pageviews"]
            }
          },
          {
            "width": "1/2",
            "component": {
              "type": "pie_chart",
              "title": "Device Split",
              "dimension": "device",
              "metrics": ["users"]
            }
          }
        ]
      }
    ]
  }]
}
```

### Example 2: Campaign Analysis
```json
{
  "pages": [{
    "name": "Campaign Performance",
    "rows": [
      {
        "columns": [
          {
            "width": "1/2",
            "component": {
              "type": "line_chart",
              "title": "Daily Cost & Conversions",
              "dimension": "date",
              "metrics": ["cost", "conversions"]
            }
          },
          {
            "width": "1/2",
            "component": {
              "type": "scatter_chart",
              "title": "Cost vs. Conversions",
              "dimension": "campaign",
              "metrics": ["cost", "conversions"]
            }
          }
        ]
      },
      {
        "columns": [
          {
            "width": "1/1",
            "component": {
              "type": "bar_chart",
              "title": "Campaign Performance",
              "dimension": "campaign",
              "metrics": ["clicks", "cost", "conversions"]
            }
          }
        ]
      }
    ]
  }]
}
```

### Example 3: Funnel Analysis
```json
{
  "pages": [{
    "name": "Conversion Funnel",
    "rows": [
      {
        "columns": [
          {
            "width": "1/1",
            "component": {
              "type": "funnel",
              "title": "Sales Funnel",
              "dimension": "stage",
              "metrics": ["count"]
            }
          }
        ]
      }
    ]
  }]
}
```

---

## Chart Configuration

### Basic Setup
Every chart needs:
- `type`: One of the 20 chart types
- `title`: Display name
- `dimension`: Field to group by (optional)
- `metrics`: Array of metric fields (required)

### Optional Configuration
- `sortBy`: Field to sort by
- `sortDirection`: "ASC" or "DESC"
- `limit`: Top N results (10-20 for most charts)
- `legendPosition`: "top", "bottom", "left", "right"
- `showLegend`: true/false
- `showTitle`: true/false

### Professional Defaults (No Config Needed)
Charts automatically apply sensible defaults:
- Pie/Donut: Top 10 items by metric
- Bar Charts: Top 20 items by metric
- Time-Series: All data points chronologically
- Tables: 100 rows per page with sorting

---

## Removed Charts (Why They're Gone)

| Chart | Reason |
|-------|--------|
| gauge | Replaced by scorecard (simpler) |
| radar_chart | Heatmap better for multi-dimensional |
| candlestick | Finance-specific (out of scope) |
| bullet | Niche KPI (scorecard works) |
| parallel_coordinates | Poor performance, heatmap alternative |
| boxplot | Statistical (limited business use) |
| calendar_heatmap | Specialized (heatmap alternative) |
| theme_river | Niche (stacked chart alternative) |
| pictorial_bar | Decorative (bar chart sufficient) |
| pivot_table | Table with dimensions replaces it |
| combo_chart | Multiple metrics + stacking replaces it |
| timeline/gantt | Project management (scope creep) |
| graph/chord | Network analysis (scope creep) |

---

## Testing Your Charts

### Validate Chart Type
```typescript
// In TypeScript, valid types include:
type ValidCharts =
  | 'pie_chart' | 'donut_chart' | 'bar_chart' | 'horizontal_bar'
  | 'stacked_bar' | 'stacked_column'
  | 'line_chart' | 'area_chart' | 'time_series'
  | 'scatter_chart' | 'bubble_chart' | 'heatmap' | 'waterfall'
  | 'treemap' | 'sunburst' | 'tree'
  | 'sankey' | 'funnel' | 'geomap' | 'word_cloud'
  | 'table' | 'scorecard';
```

### Quick Validation Checklist
- [ ] Chart type is in the 20-chart library
- [ ] Dimension field exists in your data
- [ ] Metrics array has at least one field
- [ ] Title is descriptive
- [ ] Data has enough rows for the chart type

---

## Performance Tips

### Chart Performance by Complexity
**Fast (< 100ms):**
- scorecard, bar_chart, pie_chart, line_chart

**Medium (100-500ms):**
- scatter_chart, heatmap, table, waterfall

**Slower (500ms+):**
- treemap, sunburst, sankey (with large datasets)

### Optimization Tips
1. Use `limit` parameter to show top N items
2. For large datasets, use table instead of scatter
3. Time-series charts work best with daily data
4. Heatmap works for matrix data (100+ items)
5. Word cloud needs 50+ items for best results

---

## Support & Resources

**For Chart Issues:**
1. Check chart type is in the 20-chart library
2. Verify dimension and metrics exist in data
3. Check data has minimum rows (10+ for charts)
4. Review professional defaults (may override your config)

**For Dashboard Help:**
- See create_dashboard MCP tool documentation
- Review CHARTS (20 types) section
- Check example dashboards in this guide

**For MCP Integration:**
- Use create_dashboard tool to build dashboards
- Reference this chart library for valid types
- Validate using schemas.ts enum

---

## Summary

The 20-chart library provides everything needed for analytics dashboards:
- 4 basic charts for everyday analysis
- 2 stacked charts for composition
- 3 time-series charts for trends
- 4 advanced charts for patterns
- 3 hierarchical charts for drill-down
- 4 specialized charts for flows
- 2 data displays for details

**No configuration needed** - charts work with professional defaults automatically.

Choose your chart by use case, set dimension and metrics, and let the platform handle the rest!

---

*For the complete MCP tool documentation, see create_dashboard and update_dashboard tools.*
