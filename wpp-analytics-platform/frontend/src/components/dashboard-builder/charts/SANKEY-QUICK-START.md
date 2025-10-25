# SankeyChart - Quick Start Guide

Get started with SankeyChart in 5 minutes! 🚀

## 1. Basic Import

```tsx
import { SankeyChart } from '@/components/dashboard-builder/charts';
```

## 2. Minimal Example (3 lines!)

```tsx
<SankeyChart
  query={{
    measures: ['TrafficSource.sessions'],
    dimensions: ['TrafficSource.source', 'TrafficSource.landingPage', 'TrafficSource.conversionType'],
    timeDimensions: [{ dimension: 'TrafficSource.date', dateRange: 'last 30 days' }]
  }}
  flowLevels={['source', 'landingPage', 'conversionType']}
  valueMeasure="TrafficSource.sessions"
/>
```

**That's it!** You have a working flow chart showing:
- Traffic Source → Landing Page → Conversion Type
- Last 30 days of data
- Interactive nodes and links
- Automatic colors and layout

## 3. Common Use Cases

### Google Ads Campaign Flow
```tsx
<SankeyChart
  query={{
    measures: ['GoogleAds.conversions'],
    dimensions: ['GoogleAds.campaignName', 'GoogleAds.adGroupName', 'GoogleAds.keyword'],
    timeDimensions: [{ dimension: 'GoogleAds.date', dateRange: 'last 7 days' }]
  }}
  flowLevels={['campaignName', 'adGroupName', 'keyword']}
  valueMeasure="GoogleAds.conversions"
  height={800}
  showLinkLabels={true}
/>
```

### Search Console Query Flow
```tsx
<SankeyChart
  query={{
    measures: ['SearchConsole.clicks'],
    dimensions: ['SearchConsole.query', 'SearchConsole.page', 'SearchConsole.device'],
    timeDimensions: [{ dimension: 'SearchConsole.date', dateRange: 'last 28 days' }]
  }}
  flowLevels={['query', 'page', 'device']}
  valueMeasure="SearchConsole.clicks"
  height={600}
  minLinkValue={10}  // Hide flows < 10 clicks
/>
```

### Device Journey
```tsx
<SankeyChart
  query={{
    measures: ['Analytics.sessions'],
    dimensions: ['Analytics.deviceCategory', 'Analytics.pageType', 'Analytics.eventAction'],
    timeDimensions: [{ dimension: 'Analytics.date', dateRange: 'this month' }]
  }}
  flowLevels={['deviceCategory', 'pageType', 'eventAction']}
  valueMeasure="Analytics.sessions"
  height={600}
/>
```

## 4. Add Interactivity

```tsx
function MyDashboard() {
  const handleNodeClick = (nodeName: string, level: number) => {
    console.log(`Clicked: ${nodeName} at level ${level}`);
    // Add your logic here
  };

  return (
    <SankeyChart
      query={...}
      flowLevels={['source', 'page', 'conversion']}
      valueMeasure="sessions"
      onNodeClick={handleNodeClick}
      onLinkClick={(source, target, value) => {
        console.log(`Flow: ${source} → ${target} = ${value}`);
      }}
    />
  );
}
```

## 5. Customize Appearance

```tsx
<SankeyChart
  query={...}
  flowLevels={['level1', 'level2', 'level3']}
  valueMeasure="value"

  // Size
  height={700}
  width="100%"

  // Colors
  colors={['#4285F4', '#34A853', '#FBBC04', '#EA4335']}
  levelColors={{
    0: '#4285F4',  // Level 1 color
    1: '#34A853',  // Level 2 color
    2: '#FBBC04',  // Level 3 color
  }}

  // Layout
  orient="horizontal"  // or "vertical"
  nodeAlign="justify"  // or "left" or "right"
  nodeWidth={25}
  nodeGap={12}

  // Labels
  showLinkLabels={true}
  valueFormatter={(value) => `${value.toLocaleString()} conv`}

  // Performance
  minLinkValue={5}  // Filter small flows
/>
```

## 6. Use Presets

```tsx
import { SankeyChart, SANKEY_PRESETS } from '@/components/dashboard-builder/charts';

// Apply a preset configuration
<SankeyChart
  query={...}
  flowLevels={['campaign', 'adGroup', 'keyword', 'conversion']}
  valueMeasure="conversions"
  {...SANKEY_PRESETS.campaignHierarchy.config}
/>

// Available presets:
// - trafficFlow
// - campaignHierarchy
// - deviceJourney
// - geographicSales
// - multiPlatform
// - mobileVertical
// - compact
```

## 7. Use Custom Hooks

```tsx
import { useSankeyData, useSankeyState } from '@/components/dashboard-builder/charts';

function AdvancedDashboard() {
  // Get data and statistics
  const { data, totalValue, nodeCount, linkCount, getTopFlows } = useSankeyData({
    query: myQuery,
    flowLevels: ['level1', 'level2', 'level3'],
    valueMeasure: 'value',
    minLinkValue: 10
  });

  // Manage state
  const { selectedNode, setSelectedNode, filters, addFilter } = useSankeyState();

  // Get top 5 flows
  const topFlows = getTopFlows(5);

  return (
    <div>
      <h2>Total Value: {totalValue}</h2>
      <h3>Nodes: {nodeCount} | Links: {linkCount}</h3>

      <SankeyChart
        query={myQuery}
        flowLevels={['level1', 'level2', 'level3']}
        valueMeasure="value"
        onNodeClick={(name, level) => {
          setSelectedNode({ name, level });
          addFilter(`dimension${level}`, name);
        }}
      />

      <div>
        <h3>Top Flows:</h3>
        {topFlows.map(flow => (
          <div key={`${flow.source}-${flow.target}`}>
            {flow.source} → {flow.target}: {flow.value}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 8. Handle Loading & Errors

```tsx
<SankeyChart
  query={...}
  flowLevels={['source', 'page', 'conversion']}
  valueMeasure="sessions"

  loadingComponent={
    <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h3>Loading flow data...</h3>
    </div>
  }

  errorComponent={(error) => (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <h3>Error: {error.message}</h3>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  )}
/>
```

## 9. Cube.js Data Model

Make sure your Cube.js schema is set up:

```javascript
// cube/TrafficSource.js
cube('TrafficSource', {
  sql: `SELECT * FROM \`project.dataset.traffic_data\``,

  dimensions: {
    source: { sql: 'source', type: 'string' },
    landingPage: { sql: 'landing_page', type: 'string' },
    conversionType: { sql: 'conversion_type', type: 'string' }
  },

  measures: {
    sessions: {
      sql: 'session_id',
      type: 'count'
    }
  }
});
```

## 10. Performance Tips

### ✅ DO THIS
```tsx
<SankeyChart
  query={{
    measures: ['TrafficSource.sessions'],
    dimensions: ['TrafficSource.source', 'TrafficSource.page'],
    timeDimensions: [{ dimension: 'TrafficSource.date', dateRange: 'last 30 days' }],
    order: { 'TrafficSource.sessions': 'desc' },
    limit: 100  // ✅ Return top 100 only
  }}
  minLinkValue={10}  // ✅ Filter small flows
  {...}
/>
```

### ❌ DON'T DO THIS
```tsx
<SankeyChart
  query={{
    measures: ['TrafficSource.sessions'],
    dimensions: ['TrafficSource.source', 'TrafficSource.page']
    // ❌ No limit = loads all data (slow + tokens!)
  }}
  {...}
/>
```

## 📚 Next Steps

- **Full Documentation:** See `SankeyChart.README.md`
- **More Examples:** Check `SankeyChart.examples.tsx`
- **Advanced Patterns:** Review `SankeyChart.advanced-example.tsx`
- **API Reference:** See `SankeyChart.types.ts`
- **Tests:** Look at `SankeyChart.test.tsx`

## 🆘 Common Issues

### Issue: Chart shows "No Flow Data"
**Solution:**
- Verify `flowLevels` match your dimension names exactly
- Check that `valueMeasure` exists in query results
- Lower `minLinkValue` if filtering out all data

### Issue: Chart is slow
**Solution:**
- Add `limit: 100` to your query
- Increase `minLinkValue` to filter noise
- Use Cube.js pre-aggregations

### Issue: Labels overlap
**Solution:**
- Increase chart `height`
- Adjust `nodeGap` and `nodeWidth`
- Try different `nodeAlign` setting
- Use `orient="vertical"` for tall layouts

## 🎉 You're Ready!

Start visualizing your flow data with SankeyChart!

Need help? Check the full documentation or examples.
