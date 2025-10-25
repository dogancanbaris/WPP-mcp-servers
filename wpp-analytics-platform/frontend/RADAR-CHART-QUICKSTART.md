# RadarChart - Quick Start Guide

Get up and running with the RadarChart component in **5 minutes**.

## 1. Prerequisites ✅

```bash
# Verify dependencies are installed
cd /frontend
npm list @cubejs-client/react @cubejs-client/core echarts-for-react

# Expected output:
# ├── @cubejs-client/core@X.X.X
# ├── @cubejs-client/react@X.X.X
# └── echarts-for-react@X.X.X
```

## 2. Environment Setup 🔧

Create or update `/frontend/.env.local`:

```env
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=your-secret-key-here
```

**Get your API secret**:
- Check Cube.js server config: `cube/cube.js`
- Or generate new: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 3. Create Your First Radar Chart 📊

**File**: `/frontend/src/app/dashboard/page.tsx`

```tsx
import { RadarChart } from '@/components/dashboard-builder/charts/RadarChart';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      <RadarChart
        datasource="gsc_performance"
        dimension="GSCPerformance.query"
        metrics={["GSCPerformance.clicks"]}
        title="Top Search Queries"

        dateRange={{
          start: "2024-09-22",
          end: "2024-10-22"
        }}
      />
    </div>
  );
}
```

## 4. Run the App 🚀

```bash
cd /frontend
npm run dev
```

Visit: http://localhost:3000/dashboard

**Expected Result**:
- Loading spinner appears (1-3 seconds)
- Radar chart renders with your data
- Chart shows top 8 search queries with click counts
- Tooltips work on hover

## 5. Common Recipes 🍳

### Recipe A: Multi-Metric Comparison

```tsx
<RadarChart
  datasource="gsc_performance"
  dimension="GSCPerformance.query"
  metrics={[
    "GSCPerformance.clicks",
    "GSCPerformance.impressions",
    "GSCPerformance.ctr"
  ]}
  title="Query Performance Overview"
  showLegend={true}
  chartColors={['#5470c6', '#91cc75', '#fac858']}
/>
```

### Recipe B: Device Breakdown

```tsx
<RadarChart
  datasource="gsc_performance"
  dimension="GSCPerformance.query"
  breakdownDimension="GSCPerformance.device"
  metrics={["GSCPerformance.clicks"]}
  title="Clicks by Device"
  showLegend={true}
/>
```

### Recipe C: Google Ads Campaigns

```tsx
<RadarChart
  datasource="google_ads"
  dimension="GoogleAds.campaignName"
  metrics={["GoogleAds.cost", "GoogleAds.conversions"]}
  title="Campaign Performance"

  metricsConfig={[
    {
      id: "GoogleAds.cost",
      name: "Cost",
      format: "currency",
      decimals: 0,
      compact: true,
      alignment: "right",
      textColor: "#111",
      fontWeight: "600",
      showComparison: false,
      showBars: false
    }
  ]}

  chartColors={['#3b82f6', '#10b981']}
/>
```

### Recipe D: With Filters

```tsx
<RadarChart
  datasource="gsc_performance"
  dimension="GSCPerformance.query"
  metrics={["GSCPerformance.clicks"]}
  title="High-Impression Queries"

  filters={[
    {
      field: "GSCPerformance.impressions",
      operator: "gt",
      values: ["1000"]
    }
  ]}
/>
```

### Recipe E: Custom Styling

```tsx
<RadarChart
  datasource="gsc_performance"
  dimension="GSCPerformance.query"
  metrics={["GSCPerformance.clicks"]}
  title="Premium Dashboard Card"

  // Title styling
  titleFontSize="20"
  titleFontWeight="700"
  titleColor="#1f2937"
  titleAlignment="center"

  // Card styling
  backgroundColor="#ffffff"
  showBorder={true}
  borderColor="#e5e7eb"
  borderRadius={16}
  showShadow={true}
  shadowColor="#00000020"
  shadowBlur={24}
  padding={32}

  chartColors={['#3b82f6', '#10b981', '#f59e0b']}
/>
```

## 6. Troubleshooting 🔍

### Issue: "Cannot find module '@/lib/cubejs/client'"

**Solution**: Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Chart shows loading forever

**Debug Steps**:

1. **Check Cube.js server is running**:
   ```bash
   curl http://localhost:4000/cubejs-api/v1/meta
   ```

2. **Verify environment variables**:
   ```bash
   echo $NEXT_PUBLIC_CUBEJS_API_URL
   echo $NEXT_PUBLIC_CUBEJS_API_SECRET
   ```

3. **Check browser console** for errors:
   - Open DevTools (F12)
   - Look for network errors
   - Check console messages

4. **Test query directly**:
   ```bash
   curl -X POST http://localhost:4000/cubejs-api/v1/load \
     -H "Authorization: Bearer YOUR_SECRET" \
     -H "Content-Type: application/json" \
     -d '{
       "query": {
         "measures": ["GSCPerformance.clicks"],
         "dimensions": ["GSCPerformance.query"]
       }
     }'
   ```

### Issue: "Invalid Cube.js query"

**Solution**: Verify measure/dimension names match your Cube.js model:

```javascript
// cube/GSCPerformance.js
cube('GSCPerformance', {
  // Dimension name must match exactly
  dimensions: {
    query: { ... }  // Use: "GSCPerformance.query"
  },

  // Measure name must match exactly
  measures: {
    clicks: { ... }  // Use: "GSCPerformance.clicks"
  }
});
```

### Issue: Chart is empty

**Debug**:

```tsx
// Add this temporarily to your component
<RadarChart
  {...props}
  // Log data for debugging
  onDataLoad={(data) => console.log('Chart data:', data)}
/>
```

Then check browser console for the logged data.

## 7. Next Steps 🎯

### Learn More

- **Full Documentation**: `RadarChart.README.md`
- **Examples**: `RadarChart.example.tsx`
- **Test Guide**: `RadarChart.test.md`
- **Architecture**: `RADAR-CHART-ARCHITECTURE.md`

### Common Enhancements

1. **Add export functionality**:
   ```tsx
   const exportChart = () => {
     // Export as PNG/SVG
   };
   ```

2. **Implement auto-refresh**:
   ```tsx
   useEffect(() => {
     const interval = setInterval(refetch, 5 * 60 * 1000);
     return () => clearInterval(interval);
   }, [refetch]);
   ```

3. **Add drill-down**:
   ```tsx
   const handleClick = (params) => {
     // Navigate to detail view
     router.push(`/query/${params.name}`);
   };
   ```

## 8. Cube.js Model Setup 📋

If you don't have a Cube.js model yet, create one:

**File**: `/cube/GSCPerformance.js`

```javascript
cube('GSCPerformance', {
  sql: `SELECT * FROM \`project.dataset.gsc_performance\``,

  dimensions: {
    query: {
      sql: 'query',
      type: 'string'
    },
    device: {
      sql: 'device',
      type: 'string'
    },
    date: {
      sql: 'date',
      type: 'time'
    }
  },

  measures: {
    clicks: {
      sql: 'clicks',
      type: 'sum'
    },
    impressions: {
      sql: 'impressions',
      type: 'sum'
    },
    ctr: {
      sql: `SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100`,
      type: 'number'
    },
    position: {
      sql: 'position',
      type: 'avg'
    }
  },

  preAggregations: {
    main: {
      measures: [clicks, impressions],
      dimensions: [query, device],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
    }
  }
});
```

**Restart Cube.js**:
```bash
# In cube directory
npm run dev
```

## 9. Integration with Dashboard Builder 🏗️

Use RadarChart in the dashboard builder:

```typescript
import { DashboardLayout } from '@/types/dashboard-builder';

const dashboard: DashboardLayout = {
  id: 'my-dashboard',
  name: 'Marketing Analytics',
  rows: [
    {
      id: 'row-1',
      columns: [
        {
          id: 'col-1',
          width: '1/2',
          component: {
            id: 'radar-1',
            type: 'radar',
            datasource: 'gsc_performance',
            dimension: 'GSCPerformance.query',
            metrics: ['GSCPerformance.clicks'],
            title: 'Top Queries',
            showLegend: true,
            chartColors: ['#5470c6']
          }
        },
        {
          id: 'col-2',
          width: '1/2',
          component: {
            id: 'radar-2',
            type: 'radar',
            datasource: 'google_ads',
            dimension: 'GoogleAds.campaignName',
            metrics: ['GoogleAds.cost', 'GoogleAds.conversions'],
            title: 'Campaign Performance'
          }
        }
      ]
    }
  ]
};
```

## 10. Performance Tips ⚡

### Use Pre-Aggregations

Add to your Cube.js model for **100x faster queries**:

```javascript
preAggregations: {
  topQueries: {
    measures: [clicks, impressions, ctr],
    dimensions: [query],
    timeDimension: date,
    granularity: 'day',
    refreshKey: {
      every: '1 hour'
    }
  }
}
```

### Limit Data

The component already limits to 50 rows, but you can reduce further:

```tsx
<RadarChart
  {...props}
  // Only show top 5 instead of 8
  filters={[...filters, { field: "...", operator: "limit", values: ["5"] }]}
/>
```

### Use Indexes

In BigQuery, partition and cluster your tables:

```sql
CREATE TABLE `project.dataset.gsc_performance`
PARTITION BY DATE(date)
CLUSTER BY query, device
AS SELECT ...
```

## 11. Real-World Example 🌍

Complete dashboard page with multiple charts:

```tsx
// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { RadarChart } from '@/components/dashboard-builder/charts/RadarChart';

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    start: "2024-09-22",
    end: "2024-10-22"
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Marketing Analytics</h1>

        {/* Date Range Picker */}
        <div className="mb-6">
          {/* Add your date picker component */}
        </div>

        {/* Grid of Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Console Performance */}
          <RadarChart
            datasource="gsc_performance"
            dimension="GSCPerformance.query"
            metrics={[
              "GSCPerformance.clicks",
              "GSCPerformance.impressions",
              "GSCPerformance.ctr"
            ]}
            title="Search Query Performance"
            dateRange={dateRange}
            showLegend={true}
            backgroundColor="#ffffff"
            showShadow={true}
          />

          {/* Device Breakdown */}
          <RadarChart
            datasource="gsc_performance"
            dimension="GSCPerformance.query"
            breakdownDimension="GSCPerformance.device"
            metrics={["GSCPerformance.clicks"]}
            title="Performance by Device"
            dateRange={dateRange}
            showLegend={true}
            backgroundColor="#ffffff"
            showShadow={true}
          />

          {/* Google Ads Campaigns */}
          <RadarChart
            datasource="google_ads"
            dimension="GoogleAds.campaignName"
            metrics={["GoogleAds.cost", "GoogleAds.conversions"]}
            title="Campaign ROI"
            dateRange={dateRange}
            metricsConfig={[
              {
                id: "GoogleAds.cost",
                format: "currency",
                decimals: 0,
                compact: true
              }
            ]}
            showLegend={true}
            backgroundColor="#ffffff"
            showShadow={true}
          />

          {/* Landing Pages */}
          <RadarChart
            datasource="ga4_analytics"
            dimension="GA4.landingPage"
            metrics={["GA4.sessions", "GA4.bounceRate"]}
            title="Landing Page Performance"
            dateRange={dateRange}
            metricsConfig={[
              {
                id: "GA4.bounceRate",
                format: "percent",
                decimals: 1
              }
            ]}
            showLegend={true}
            backgroundColor="#ffffff"
            showShadow={true}
          />
        </div>
      </div>
    </div>
  );
}
```

## 12. Testing Checklist ✓

Before going to production:

- [ ] Chart loads without errors
- [ ] Data displays correctly
- [ ] Tooltips show formatted values
- [ ] Legend toggles work
- [ ] Date range filtering works
- [ ] Filters apply correctly
- [ ] Responsive at mobile/tablet/desktop
- [ ] Loading spinner appears
- [ ] Error states handle gracefully
- [ ] Performance < 2 seconds load time

## 13. Production Checklist 🚢

Before deploying:

- [ ] Environment variables set in production
- [ ] Cube.js pre-aggregations configured
- [ ] BigQuery tables partitioned/clustered
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] CORS configured for production domain
- [ ] CDN configured for static assets
- [ ] Security headers configured
- [ ] API rate limiting configured
- [ ] User analytics tracking added

## 14. Support & Help 💬

### Documentation
- `RadarChart.README.md` - Full API reference
- `RadarChart.example.tsx` - Usage examples
- `RadarChart.test.md` - Testing guide
- `RADAR-CHART-ARCHITECTURE.md` - Architecture details

### External Resources
- **Cube.js Docs**: https://cube.dev/docs
- **ECharts Docs**: https://echarts.apache.org/en/option.html#series-radar
- **Next.js Docs**: https://nextjs.org/docs

### Get Help
- Check browser console for errors
- Review Cube.js server logs
- Test queries directly via curl
- Verify environment variables
- Check network tab in DevTools

---

**That's it!** You now have a fully functional RadarChart connected to Cube.js. 🎉

**Next**: Explore other chart types (BarChart, LineChart, PieChart) with the same integration patterns.
