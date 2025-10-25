# AreaChart + Cube.js Integration

## 🎉 Status: COMPLETE & WORKING

The AreaChart component is fully integrated with Cube.js and ready to use.

---

## Quick Links

📖 **[Full Integration Guide](./AREACHART-CUBEJS-INTEGRATION.md)** - Complete technical documentation

📊 **[Visual Guide](./AREACHART-INTEGRATION-VISUAL.md)** - Data flow diagrams

📋 **[Executive Summary](./INTEGRATION-SUMMARY.md)** - Quick reference

---

## TL;DR

```tsx
import { AreaChart } from '@/components/dashboard-builder/charts/AreaChart';

<AreaChart
  dimension="GscPerformance7days.date"
  metrics={['GscPerformance7days.clicks']}
  dateRange={{ start: '2025-10-15', end: '2025-10-22' }}
  title="Daily Clicks"
/>
```

**That's it!** The component queries Cube.js, which fetches from BigQuery, and renders a beautiful area chart.

---

## Start Servers

```bash
# Terminal 1: Cube.js
cd cube-backend
npm run dev
# → http://localhost:4000

# Terminal 2: Frontend
cd frontend
npm run dev
# → http://localhost:3000
```

---

## Test It

Visit: **http://localhost:3000/test-area-chart**

You'll see:
- ✅ 6 comprehensive test scenarios
- ✅ Live data from Cube.js
- ✅ Beautiful area charts with animations
- ✅ Error handling demonstrations
- ✅ Multiple metrics examples
- ✅ Custom styling options

---

## File Structure

```
/frontend/
├── src/
│   ├── components/
│   │   └── dashboard-builder/
│   │       └── charts/
│   │           └── AreaChart.tsx ← Main component
│   ├── lib/
│   │   ├── cubejs/
│   │   │   └── client.ts ← Cube.js client
│   │   ├── utils/
│   │   │   └── metric-formatter.ts ← Formatting
│   │   └── themes/
│   │       └── echarts-theme.ts ← Chart theme
│   ├── types/
│   │   └── dashboard-builder.ts ← TypeScript types
│   └── app/
│       └── test-area-chart/
│           └── page.tsx ← Test page
├── .env.local ← Frontend config
├── AREACHART-CUBEJS-INTEGRATION.md ← Full docs
├── AREACHART-INTEGRATION-VISUAL.md ← Diagrams
├── INTEGRATION-SUMMARY.md ← Summary
└── README-AREACHART.md ← This file

/cube-backend/
├── schema/
│   └── GscPerformance7days.js ← Data model
├── .env ← Backend config
└── cube.js ← Cube config
```

---

## How It Works

```
User Props → Query Builder → useCubeQuery() → Cube.js API
    ↓
BigQuery ← SQL Generation ← Semantic Layer
    ↓
Response → ECharts → Beautiful Chart 🎨
```

---

## Props

### Essential
- `dimension` - X-axis (e.g., `"GscPerformance7days.date"`)
- `metrics` - Y-axis measures (e.g., `["GscPerformance7days.clicks"]`)

### Optional
- `datasource` - Cube name (default: `"gsc_performance_7days"`)
- `breakdownDimension` - Series segmentation
- `dateRange` - Time range filter
- `filters` - WHERE conditions
- `title` - Chart title
- `chartColors` - Series colors
- `metricsConfig` - Formatting rules

See [full props list](./AREACHART-CUBEJS-INTEGRATION.md#component-props).

---

## Examples

### Single Metric
```tsx
<AreaChart
  dimension="GscPerformance7days.date"
  metrics={['GscPerformance7days.clicks']}
  dateRange={{ start: '2025-10-15', end: '2025-10-22' }}
/>
```

### Multiple Metrics
```tsx
<AreaChart
  dimension="GscPerformance7days.date"
  metrics={[
    'GscPerformance7days.clicks',
    'GscPerformance7days.impressions'
  ]}
  showLegend={true}
  chartColors={['#3b82f6', '#10b981']}
/>
```

### With Breakdown
```tsx
<AreaChart
  dimension="GscPerformance7days.date"
  breakdownDimension="GscPerformance7days.device"
  metrics={['GscPerformance7days.clicks']}
  title="Clicks by Device"
/>
```

---

## Available Data

### GscPerformance7days Cube

**Measures:**
- `clicks` - Total clicks
- `impressions` - Total impressions
- `avgCtr` - Average CTR (%)
- `avgPosition` - Average position

**Dimensions:**
- `date` - Time dimension
- `query` - Search query
- `page` - Landing page
- `device` - Device type (DESKTOP, MOBILE, TABLET)
- `country` - Country code

---

## Troubleshooting

### "Cannot connect to Cube.js"
→ Start Cube.js backend: `cd cube-backend && npm run dev`

### "Chart shows no data"
→ Check BigQuery table has data
→ Verify credentials in `/cube-backend/.env`

### Build errors
→ Run `npm run build` from `/frontend/`
→ Check for TypeScript errors

---

## Documentation

| File | Purpose |
|------|---------|
| **AREACHART-CUBEJS-INTEGRATION.md** | Complete technical guide with examples |
| **AREACHART-INTEGRATION-VISUAL.md** | Data flow diagrams and visuals |
| **INTEGRATION-SUMMARY.md** | Executive summary with quick reference |
| **README-AREACHART.md** | This file (getting started) |

---

## Next Steps

1. **View the test page:** `http://localhost:3000/test-area-chart`
2. **Read full guide:** [AREACHART-CUBEJS-INTEGRATION.md](./AREACHART-CUBEJS-INTEGRATION.md)
3. **Use in your dashboards:** Import and configure AreaChart
4. **Create more cubes:** Add Google Ads, Analytics, etc.

---

## Questions?

See the comprehensive guides:
- Technical details → [AREACHART-CUBEJS-INTEGRATION.md](./AREACHART-CUBEJS-INTEGRATION.md)
- Visual explanations → [AREACHART-INTEGRATION-VISUAL.md](./AREACHART-INTEGRATION-VISUAL.md)
- Quick reference → [INTEGRATION-SUMMARY.md](./INTEGRATION-SUMMARY.md)

---

**✅ Everything is working. Start building dashboards!**
