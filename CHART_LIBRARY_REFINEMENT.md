# CHART LIBRARY REFINEMENT PLAN

**Date:** October 30, 2025
**Objective:** Keep only useful, professional charts. Remove bloat.

---

## 📊 YOUR REQUIREMENTS (from ECharts site)

### Charts You Want to KEEP:
1. ✅ Basic line chart - **WE HAVE: line_chart**
2. ❓ Stacked line chart - **NEED TO CHECK: might be area_chart with stack, or combo_chart**
3. ✅ Basic bar - **WE HAVE: bar_chart**
4. ✅ Stacked horizontal bar - **WE HAVE: stacked_bar**
5. ❓ "Referer of a website" - **NEED TO IDENTIFY** (likely a special Sankey/Graph example)
6. ✅ Bubble chart - **WE HAVE: bubble_chart**
7. ✅ Geo graph (map) - **WE HAVE: geomap**
8. ✅ Heatmap on cartesian - **WE HAVE: heatmap**
9. ✅ Radial tree - **WE HAVE: sunburst** (radial hierarchy)
10. ✅ From left to right tree - **WE HAVE: tree**
11. ✅ Treemap - **WE HAVE: treemap**
12. ❓ "Drink Flavors" - **NEED TO IDENTIFY** (might be a Pie chart example or custom visual)
13. ✅ Sankey (Specify ItemStyle for Each Node) - **WE HAVE: sankey**
14. ✅ Funnel Chart - **WE HAVE: funnel**
15. ❌ **Word cloud - WE DON'T HAVE** (need to add!)

### Additional Charts to Consider:
- ✅ Pie chart - **ESSENTIAL** (we have pie_chart)
- ✅ Donut chart - **USEFUL** (we have donut_chart)
- ✅ Table - **ESSENTIAL** (we have table)
- ✅ Scorecard - **ESSENTIAL** (we have scorecard)
- ✅ Time-series - **USEFUL** (we have time_series)
- ✅ Area chart - **USEFUL** (we have area_chart)
- ✅ Scatter - **USEFUL** (we have scatter_chart)

---

## ❌ CHARTS TO REMOVE

### Confirmed Removals (from your list):
1. ❌ candlestick (financial OHLC - not needed)
2. ❌ gauge (single value meter - not useful)
3. ❌ timeline (event timeline - not needed)
4. ❌ graph (network nodes - not useful)
5. ❌ radar (spider chart - not needed)
6. ❌ bullet (KPI bullet - not useful)
7. ❌ parallel (parallel coordinates - too complex)
8. ❌ boxplot (statistical distribution - not needed)
9. ❌ calendar_heatmap (calendar view - not useful)
10. ❌ theme_river (temporal flow - not needed)

### Additional Removals to Consider:
11. ❌ pictorial_bar (decorative bars - rarely useful)
12. ❌ pivot_table (complex, could keep if useful for you)
13. ❌ combo_chart (bar+line mix - might keep as "stacked line")

**Total to Remove:** 10-13 charts

---

## ✅ FINAL REFINED CHART LIST (18-20 Charts)

### Essential Charts (8)
1. ✅ **pie_chart** - Part-to-whole relationships
2. ✅ **donut_chart** - Hollow pie chart
3. ✅ **bar_chart** - Basic vertical bar
4. ✅ **horizontal_bar** - Horizontal bar (could merge with bar_chart via orientation)
5. ✅ **table** - Data table
6. ✅ **scorecard** - KPI cards
7. ✅ **line_chart** - Basic line chart
8. ✅ **area_chart** - Filled area chart

### Advanced Visualizations (7)
9. ✅ **stacked_bar** - Stacked horizontal bars
10. ✅ **stacked_column** - Stacked vertical bars
11. ✅ **treemap** - Hierarchical rectangles
12. ✅ **sunburst** - Radial tree hierarchy
13. ✅ **tree** - Left-to-right tree
14. ✅ **sankey** - Flow diagram
15. ✅ **funnel** - Conversion funnel

### Data Analysis (5)
16. ✅ **time_series** - Multi-metric over time
17. ✅ **bubble_chart** - 3D scatter (x, y, size)
18. ✅ **scatter_chart** - 2D scatter
19. ✅ **heatmap** - 2D matrix heatmap
20. ✅ **geomap** - Geographic visualization

### To Add (1)
21. ❌ **word_cloud** - Text frequency visualization (NEED TO ADD)

**Total: 21 charts** (down from 32, reduction of 11 charts)

---

## 🔍 UNCLEAR ITEMS - NEED YOUR INPUT

### "Referer of a website"
**Possible interpretations:**
- **Option A:** Sankey diagram showing website → referrer flow
- **Option B:** Special graph/network showing referral paths
- **Option C:** Funnel showing referrer conversion
- **Which chart type did you see this as?**

### "Drink Flavors"
**Possible interpretations:**
- **Option A:** Pie chart with flavor breakdown
- **Option B:** Treemap with flavor categories
- **Option C:** Custom pictorial chart with drink icons
- **What was the chart type?**

### "Stacked line chart"
**We likely have this as:**
- **Option A:** area_chart (filled stacked areas)
- **Option B:** combo_chart (bar + line combination)
- **Option C:** time_series with stacking option
- **Which one matches what you saw?**

---

## 🛠️ CLEANUP PLAN

### Step 1: Remove Unwanted Charts (10 charts)

**Files to Delete/Deprecate:**
1. `CandlestickChart.tsx`
2. `GaugeChart.tsx`
3. `TimelineChart.tsx`
4. `GraphChart.tsx`
5. `RadarChart.tsx`
6. `BulletChart.tsx`
7. `ParallelChart.tsx`
8. `BoxplotChart.tsx`
9. `CalendarHeatmap.tsx`
10. `ThemeRiverChart.tsx`

**Update Files:**
- `ChartWrapper.tsx` - Remove case statements
- `chart-defaults.ts` - Remove configurations
- `CHART_CATEGORIES` - Update lists

### Step 2: Add Word Cloud

**New File:** `WordCloud.tsx`
**Uses:** ECharts word cloud extension
**Configuration:** chart-defaults.ts entry
**Mapping:** ChartWrapper.tsx case statement

### Step 3: Clarify Unclear Items

Based on your answers about "Referer" and "Drink Flavors", determine if we need:
- Special Sankey configuration
- Custom pie chart styling
- Or if existing charts cover these use cases

---

## 📋 BEFORE YOU PROCEED

**Please answer:**

1. **"Referer of a website"** - What chart type was this? (Sankey/Graph/Funnel?)

2. **"Drink Flavors"** - What chart type was this? (Pie/Treemap/Custom?)

3. **Stacked line chart** - Do you want:
   - a) Stacked area chart (filled)
   - b) Multiple lines overlaid
   - c) Something else?

4. **Pivot Table** - Keep or remove?

5. **Pictorial Bar** - Keep or remove?

6. **Combo Chart** (bar+line) - Keep or remove?

---

## ✅ BENEFITS OF CLEANUP

**After removing 10-13 unused charts:**
- Faster test dashboard loading
- Easier for agents to choose charts
- Less maintenance burden
- Clearer documentation
- Smaller bundle size

**Keeping only 18-21 focused, useful charts that cover 95% of use cases!**
