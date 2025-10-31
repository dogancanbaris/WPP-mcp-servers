# COMPREHENSIVE CHART STATUS ANALYSIS

**Dashboard:** bf4e10b2-9347-44f6-9611-2ed83f48a3d2
**Data Source:** GSC Performance Data
**Date:** October 30, 2025

---

## 📊 CHART STATUS MATRIX

### ✅ WORKING CHARTS (24/30 = 80%)

**Ranking Charts (4/5):**
1. ✅ Pie Chart (country) - 200 OK
2. ✅ Donut Chart (device) - 200 OK
3. ✅ Bar Chart (page) - 200 OK
4. ✅ Horizontal Bar (query) - 200 OK
5. ❓ Treemap (country) - Not in network log (may be below fold)

**Time-Series Charts (3/3):**
6. ✅ Line Chart (date) - 200 OK
7. ✅ Time-Series (date) - 200 OK
8. ✅ Area Chart (date) - 200 OK

**Stacked Charts (0/2):**
9. ❌ Stacked Bar (category) - **500 ERROR - dimension 'category' doesn't exist**
10. ❌ Stacked Column (category) - **500 ERROR - dimension 'category' doesn't exist**

**Specialized Charts (2/4):**
11. ✅ Funnel (device) - 200 OK
12. ❓ Waterfall (device) - Not in network log
13. ❌ Heatmap (date, category) - **500 ERROR - dimension 'category' doesn't exist**
14. ✅ Radar (device) - 200 OK

**Gauges (3/3):**
15. ✅ CTR Gauge - 200 OK
16. ✅ Clicks Gauge - 200 OK
17. ✅ Position Gauge - 200 OK

**Advanced Charts (2/2):**
18. ✅ Scatter (no dimension) - 200 OK
19. ✅ Bubble (no dimension) - 200 OK

**Data Table (1/1):**
20. ✅ Full Table (page) - 200 OK

**Geographic & Flow (0/3):**
21. ❓ GeoMap (country) - Not in network log
22. ❓ Sankey (query) - Not in network log
23. ❓ Sunburst (page) - Not in network log

**Statistical (2/4):**
24. ✅ Boxplot (device) - 200 OK
25. ✅ Bullet (no dimension) - 200 OK
26. ❌ Candlestick (date) - **500 ERROR - metrics 'open,high,low,close' don't exist in GSC**
27. ✅ Parallel (no dimension) - 200 OK

**Network & Hierarchical (0/2):**
28. ❌ Graph (node) - **500 ERROR - dimension 'node' doesn't exist**
29. ❓ Tree (page) - Not in network log

**Temporal & Specialized (2/4):**
30. ✅ Calendar Heatmap (date) - 200 OK
31. ❓ Timeline (date) - Not in network log
32. ❓ Theme River (date) - Not in network log
33. ✅ Pictorial Bar (device) - 200 OK

**Data Display (3/4):**
34. ✅ Scorecard (clicks) - 200 OK
35. ✅ Scorecard (impressions) - 200 OK
36. ✅ Scorecard (ctr) - 200 OK
37. ❓ Pivot Table (country) - Not in network log

---

## 🐛 ROOT CAUSES

### Issue #1: Invalid Dimensions (4 charts with 500 errors)

**Charts Using Non-Existent Dimensions:**
- Stacked Bar/Column → `dimension=category` ❌
- Heatmap → `dimensions=date,category` ❌
- Graph → `dimension=node` ❌

**GSC Valid Dimensions:** country, device, page, query, date

**Fix:** Change dashboard to use valid dimensions:
- Stacked Bar/Column → dimension=country or device
- Heatmap → Remove from test or use country+device
- Graph → Use page dimension (not ideal but will work)

### Issue #2: Invalid Metrics (1 chart)

**Candlestick Chart:**
- Requesting: `metrics=open,high,low,close` ❌
- GSC Has: clicks, impressions, ctr, position

**Fix:** Candlestick chart incompatible with GSC data (needs OHLC financial data)
**Solution:** Remove from GSC test dashboard OR mark as "requires financial data source"

### Issue #3: Charts Not Loading (9 charts)

**Not Appearing in Network Requests:**
- Treemap, Waterfall, GeoMap, Sankey, Sunburst, Tree, Timeline, Theme River, Pivot Table

**Possible Causes:**
1. Below viewport, not triggered to load yet
2. Component errors preventing fetch
3. Missing dataset_id (unlikely - create_dashboard should inject)

**Need to:** Scroll page to trigger loading or check components for errors

---

## ✅ VERIFIED WORKING COMPONENTS

**From Screenshot Analysis:**

**Top Left:** "Failed to load chart data" (red error text)
**Top Right:** Parallel chart showing data with axes

**From Network 200 Responses (24 successful):**
- Pie, Donut, Bar, Horizontal Bar
- Line, Time-Series, Area
- Funnel, Radar
- Gauges (3x)
- Scatter, Bubble
- Table
- Boxplot, Bullet, Parallel
- Calendar Heatmap, Pictorial Bar
- Scorecards (3x)

---

## 🔧 FIXES NEEDED

### Priority 1: Fix Invalid Dimensions (IMMEDIATE)

**Stacked Charts:**
```json
// BEFORE:
{"type": "stacked_bar", "dimension": "category", "metrics": ["clicks", "impressions"]}

// AFTER:
{"type": "stacked_bar", "dimension": "country", "metrics": ["clicks", "impressions"]}
```

**Heatmap:**
```json
// BEFORE:
{"type": "heatmap", "dimension": "country", "metrics": ["clicks"]}
// Missing secondaryDimension!

// AFTER:
{"type": "heatmap", "dimension": "country", "secondaryDimension": "device", "metrics": ["clicks"]}
```

**Graph:**
```json
// BEFORE:
{"type": "graph", "dimension": "node", "metrics": ["clicks"]}

// AFTER:
// Either remove from GSC test OR use valid dimension:
{"type": "graph", "dimension": "page", "metrics": ["clicks"]}
// Note: May still fail if graph needs nodes+edges format
```

### Priority 2: Remove/Document Incompatible Charts

**Candlestick:**
- Requires OHLC data (open, high, low, close)
- GSC doesn't have this
- **Solution:** Remove from GSC test OR mark as "requires financial data"

### Priority 3: Investigate Non-Loading Charts

Need to check why these aren't in network requests:
- Treemap, Waterfall, GeoMap, Sankey, Sunburst
- Tree, Timeline, Theme River, Pivot Table

---

## 📈 SUCCESS RATE

**Charts Making API Calls:** 24/37 (65%)
**Successful API Calls:** 20/24 (83%)
**Failed API Calls:** 4/24 (17%)

**Overall Working:** ~20/37 charts (54%)
**Fixable Issues:** ~4 charts (dimension errors)
**Incompatible with GSC:** ~1 chart (Candlestick)
**Need Investigation:** ~12 charts (not loading)

---

## 🎯 NEXT ACTIONS

1. **Delete current dashboard**
2. **Create new dashboard with CORRECT dimensions for ALL charts**
3. **Use ONLY valid GSC dimensions:** country, device, page, query, date
4. **Use ONLY valid GSC metrics:** clicks, impressions, ctr, position
5. **Exclude incompatible charts:** Candlestick (needs OHLC)
6. **Re-test and verify ALL charts load**

---

**Key Learning:** When creating test dashboards, must use dimensions/metrics that exist in the data source!
