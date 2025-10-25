# SankeyChart Component

A powerful, production-ready Sankey diagram component with full Cube.js integration for visualizing flow data in the WPP Analytics Platform.

## 🎯 Overview

The SankeyChart component visualizes multi-level flows using ECharts' Sankey diagram. Perfect for analyzing user journeys, conversion funnels, traffic sources, and any data that flows from source to target through intermediate steps.

## 📊 Use Cases

### Marketing Analytics
- **Traffic Source → Landing Page → Conversion**: Track how different traffic sources convert
- **Campaign → Ad Group → Keyword → Conversion**: Analyze Google Ads performance hierarchy
- **Channel → Search Term → Landing Page → Outcome**: Multi-platform search analysis

### User Journey Analysis
- **Device → Page Type → Action**: Understand device-specific behavior patterns
- **Entry Point → Page Sequence → Exit Point**: Map user navigation flows
- **Feature → Interaction → Outcome**: Track feature engagement paths

### E-commerce
- **Region → Product Category → Purchase**: Geographic sales patterns
- **Product → Cart → Checkout → Purchase**: Conversion funnel analysis
- **Customer Segment → Product → Revenue**: Segmented revenue attribution

## 🚀 Quick Start

### Basic Usage

```tsx
import { SankeyChart } from './components/dashboard-builder/charts/SankeyChart';

function MyDashboard() {
  return (
    <SankeyChart
      query={{
        measures: ['TrafficSource.sessions'],
        dimensions: [
          'TrafficSource.source',
          'TrafficSource.landingPage',
          'TrafficSource.conversionType'
        ],
        timeDimensions: [{
          dimension: 'TrafficSource.date',
          dateRange: 'last 30 days'
        }]
      }}
      flowLevels={['source', 'landingPage', 'conversionType']}
      valueMeasure="TrafficSource.sessions"
      height={600}
    />
  );
}
```

## 📖 API Reference

### Props

#### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `Query` | ✅ | Cube.js query configuration |
| `flowLevels` | `string[]` | ✅ | Dimension names representing flow levels (in order) |
| `valueMeasure` | `string` | ✅ | Measure to use for flow values (e.g., 'sessions', 'revenue') |

#### Display Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | `600` | Chart height in pixels |
| `width` | `string \| number` | `'100%'` | Chart width (responsive by default) |
| `colors` | `string[]` | Default palette | Custom color palette for nodes |
| `orient` | `'horizontal' \| 'vertical'` | `'horizontal'` | Flow orientation |

#### Layout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeAlign` | `'left' \| 'right' \| 'justify'` | `'justify'` | Node alignment strategy |
| `nodeGap` | `number` | `8` | Vertical gap between nodes (px) |
| `nodeWidth` | `number` | `20` | Width of node rectangles (px) |
| `draggable` | `boolean` | `true` | Enable node dragging for manual layout |
| `layoutIterations` | `number` | `32` | Layout optimization iterations |

#### Formatting Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `valueFormatter` | `(value: number) => string` | Auto format | Custom value formatter |
| `minLinkValue` | `number` | `0` | Minimum link value to display (filters small flows) |
| `showLinkLabels` | `boolean` | `false` | Display values on flow links |
| `levelColors` | `Record<number, string>` | `undefined` | Custom colors by level index |

#### Interaction Props

| Prop | Type | Description |
|------|------|-------------|
| `onNodeClick` | `(nodeName: string, level: number) => void` | Node click handler |
| `onLinkClick` | `(source: string, target: string, value: number) => void` | Link click handler |

#### State Props

| Prop | Type | Description |
|------|------|-------------|
| `loading` | `boolean` | External loading state |
| `loadingComponent` | `ReactNode` | Custom loading component |
| `errorComponent` | `(error: Error) => ReactNode` | Custom error component |
| `animationDuration` | `number` | Animation duration in ms (default: 1000) |

## 💡 Usage Examples

### Example 1: Google Ads Campaign Flow

```tsx
<SankeyChart
  query={{
    measures: ['GoogleAds.conversions'],
    dimensions: [
      'GoogleAds.campaignName',
      'GoogleAds.adGroupName',
      'GoogleAds.keyword',
      'GoogleAds.conversionAction'
    ],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 7 days'
    }],
    filters: [{
      member: 'GoogleAds.conversions',
      operator: 'gt',
      values: ['0']
    }],
    order: {
      'GoogleAds.conversions': 'desc'
    },
    limit: 500
  }}
  flowLevels={['campaignName', 'adGroupName', 'keyword', 'conversionAction']}
  valueMeasure="GoogleAds.conversions"
  height={800}
  colors={['#4285F4', '#34A853', '#FBBC04', '#EA4335']}
  levelColors={{
    0: '#4285F4', // Campaign
    1: '#34A853', // Ad Group
    2: '#FBBC04', // Keyword
    3: '#EA4335'  // Conversion
  }}
  valueFormatter={(value) => `${value} conv`}
  minLinkValue={1}
  showLinkLabels={true}
  onNodeClick={(name, level) => {
    console.log(`Clicked ${name} at level ${level}`);
  }}
/>
```

### Example 2: Multi-Platform Search Analysis

```tsx
<SankeyChart
  query={{
    measures: ['HolisticSearch.totalClicks'],
    dimensions: [
      'HolisticSearch.channel',      // Paid vs Organic
      'HolisticSearch.searchTerm',   // Search query
      'HolisticSearch.landingPage',  // Destination
      'HolisticSearch.outcome'       // Conversion or bounce
    ],
    timeDimensions: [{
      dimension: 'HolisticSearch.date',
      dateRange: 'last 30 days'
    }]
  }}
  flowLevels={['channel', 'searchTerm', 'landingPage', 'outcome']}
  valueMeasure="HolisticSearch.totalClicks"
  height={700}
  nodeWidth={25}
  nodeGap={10}
  valueFormatter={(value) => `${(value / 1000).toFixed(1)}K clicks`}
/>
```

### Example 3: Device Journey Analysis

```tsx
<SankeyChart
  query={{
    measures: ['Analytics.sessions'],
    dimensions: [
      'Analytics.deviceCategory',
      'Analytics.pageType',
      'Analytics.eventAction'
    ],
    timeDimensions: [{
      dimension: 'Analytics.date',
      dateRange: 'this month'
    }]
  }}
  flowLevels={['deviceCategory', 'pageType', 'eventAction']}
  valueMeasure="Analytics.sessions"
  height={600}
  orient="horizontal"
  nodeAlign="left"
  colors={['#667eea', '#764ba2', '#f093fb']}
/>
```

### Example 4: Vertical Orientation

```tsx
<SankeyChart
  query={{
    measures: ['TrafficSource.sessions'],
    dimensions: [
      'TrafficSource.source',
      'TrafficSource.medium',
      'TrafficSource.campaign'
    ],
    timeDimensions: [{
      dimension: 'TrafficSource.date',
      dateRange: 'last 7 days'
    }]
  }}
  flowLevels={['source', 'medium', 'campaign']}
  valueMeasure="TrafficSource.sessions"
  height={1000}
  orient="vertical"
  nodeAlign="justify"
  nodeWidth={50}
  nodeGap={20}
/>
```

### Example 5: Custom Loading & Error States

```tsx
<SankeyChart
  query={{...}}
  flowLevels={['source', 'page', 'conversion']}
  valueMeasure="TrafficSource.sessions"
  loadingComponent={
    <div style={{
      height: '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '64px' }}>🔄</div>
        <h3>Analyzing flow patterns...</h3>
      </div>
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

### Example 6: Interactive Click Handlers

```tsx
function InteractiveSankey() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [drillDownLevel, setDrillDownLevel] = useState(0);

  return (
    <SankeyChart
      query={{
        measures: ['GoogleAds.clicks'],
        dimensions: [
          'GoogleAds.campaignName',
          'GoogleAds.adGroupName',
          'GoogleAds.keyword'
        ],
        timeDimensions: [{
          dimension: 'GoogleAds.date',
          dateRange: 'last 30 days'
        }],
        ...(selectedNode && {
          filters: [{
            member: `GoogleAds.${['campaignName', 'adGroupName'][drillDownLevel]}`,
            operator: 'equals',
            values: [selectedNode]
          }]
        })
      }}
      flowLevels={['campaignName', 'adGroupName', 'keyword']}
      valueMeasure="GoogleAds.clicks"
      height={600}
      onNodeClick={(nodeName, level) => {
        setSelectedNode(nodeName);
        setDrillDownLevel(level);
        console.log(`Drilling down: ${nodeName} (Level ${level})`);
      }}
      onLinkClick={(source, target, value) => {
        console.log(`Flow: ${source} → ${target} = ${value}`);
      }}
    />
  );
}
```

## 🎨 Styling & Theming

### Custom Color Schemes

```tsx
// Brand colors
const brandColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

// Level-specific colors
const levelColors = {
  0: '#FF6B6B',  // Source level
  1: '#4ECDC4',  // Middle level
  2: '#45B7D1',  // Target level
};

<SankeyChart
  query={{...}}
  flowLevels={['source', 'middle', 'target']}
  valueMeasure="value"
  colors={brandColors}
  levelColors={levelColors}
/>
```

### Responsive Layouts

```tsx
// Mobile-friendly configuration
<SankeyChart
  query={{...}}
  flowLevels={['source', 'target']}
  valueMeasure="value"
  height={400}
  width="100%"
  nodeWidth={15}
  nodeGap={6}
  orient="vertical"  // Better for mobile
/>

// Desktop configuration
<SankeyChart
  query={{...}}
  flowLevels={['source', 'middle', 'target']}
  valueMeasure="value"
  height={700}
  width="100%"
  nodeWidth={25}
  nodeGap={12}
  orient="horizontal"
/>
```

## ⚡ Performance Optimization

### Token-Efficient Queries

```tsx
// ❌ BAD: Loads 50,000 rows
<SankeyChart
  query={{
    measures: ['TrafficSource.sessions'],
    dimensions: ['TrafficSource.source', 'TrafficSource.page']
    // No limit = all data loaded
  }}
  {...}
/>

// ✅ GOOD: Aggregates in Cube.js, returns top 100
<SankeyChart
  query={{
    measures: ['TrafficSource.sessions'],
    dimensions: ['TrafficSource.source', 'TrafficSource.page'],
    order: { 'TrafficSource.sessions': 'desc' },
    limit: 100  // Top 100 only
  }}
  minLinkValue={10}  // Filter out noise
  {...}
/>
```

### Pre-Aggregations

```javascript
// Configure in Cube.js data model for instant queries
cube('TrafficSource', {
  preAggregations: {
    trafficFlow: {
      measures: [sessions, conversions],
      dimensions: [source, landingPage, conversionType],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour'
      }
    }
  }
});
```

### Filter Small Flows

```tsx
<SankeyChart
  query={{...}}
  flowLevels={['source', 'page', 'conversion']}
  valueMeasure="TrafficSource.sessions"
  minLinkValue={50}  // Hide flows < 50 sessions
  // Reduces visual clutter and improves rendering speed
/>
```

## 🔧 Integration with Cube.js

### Basic Cube.js Setup

```javascript
// cubeModel/TrafficSource.js
cube('TrafficSource', {
  sql: `SELECT * FROM \`project.dataset.traffic_data\``,

  dimensions: {
    source: { sql: 'source', type: 'string' },
    landingPage: { sql: 'landing_page', type: 'string' },
    conversionType: { sql: 'conversion_type', type: 'string' }
  },

  measures: {
    sessions: { sql: 'session_id', type: 'count' },
    conversions: {
      sql: 'conversion_id',
      type: 'count',
      filters: [{ sql: `conversion_id IS NOT NULL` }]
    }
  }
});
```

### Multi-Platform Blending

```javascript
// Combine Google Ads + Search Console
cube('HolisticSearch', {
  sql: `
    SELECT
      'Paid' as channel,
      a.search_term,
      a.landing_page,
      a.clicks
    FROM \`ads_data\` a
    UNION ALL
    SELECT
      'Organic' as channel,
      s.query as search_term,
      s.page as landing_page,
      s.clicks
    FROM \`gsc_data\` s
  `,

  dimensions: {
    channel: { sql: 'channel', type: 'string' },
    searchTerm: { sql: 'search_term', type: 'string' },
    landingPage: { sql: 'landing_page', type: 'string' }
  },

  measures: {
    totalClicks: { sql: 'clicks', type: 'sum' }
  }
});
```

## 🐛 Troubleshooting

### Issue: Empty Chart

**Problem**: Chart shows "No Flow Data"

**Solutions**:
1. Check that `flowLevels` match your dimension names exactly
2. Verify `valueMeasure` exists in query results
3. Check if `minLinkValue` is filtering out all data
4. Ensure Cube.js query returns data

```tsx
// Debug query results
const { resultSet } = useCubeQuery(query);
console.log('Raw data:', resultSet?.tablePivot());
```

### Issue: Performance Problems

**Problem**: Chart is slow to render

**Solutions**:
1. Reduce data with `limit` and `minLinkValue`
2. Use Cube.js pre-aggregations
3. Decrease `layoutIterations` (try 16 instead of 32)
4. Simplify to fewer flow levels

### Issue: Labels Overlapping

**Problem**: Node labels overlap and are unreadable

**Solutions**:
1. Increase chart height
2. Adjust `nodeGap` and `nodeWidth`
3. Try different `nodeAlign` setting
4. Use `orient="vertical"` for tall layouts
5. Enable `draggable` for manual adjustment

## 🔒 Security & Multi-Tenancy

### Tenant Filtering

```tsx
// Automatic tenant filtering via Cube.js security context
cube('TrafficSource', {
  sql: `
    SELECT * FROM traffic_data
    WHERE tenant_id = \${SECURITY_CONTEXT.tenant_id}
  `
});

// React component stays simple
<SankeyChart
  query={{
    measures: ['TrafficSource.sessions'],
    dimensions: ['TrafficSource.source', 'TrafficSource.page']
    // tenant_id filter applied automatically
  }}
  {...}
/>
```

## 📊 Real-World Patterns

### Pattern 1: Dashboard Integration

```tsx
function MarketingDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Paid Flow */}
      <Card title="Paid Traffic Flow">
        <SankeyChart
          query={paidTrafficQuery}
          flowLevels={['campaign', 'adGroup', 'conversion']}
          valueMeasure="GoogleAds.clicks"
          height={400}
        />
      </Card>

      {/* Organic Flow */}
      <Card title="Organic Traffic Flow">
        <SankeyChart
          query={organicTrafficQuery}
          flowLevels={['query', 'page', 'device']}
          valueMeasure="SearchConsole.clicks"
          height={400}
        />
      </Card>
    </div>
  );
}
```

### Pattern 2: Drill-Down Navigation

```tsx
function DrillDownSankey() {
  const [filters, setFilters] = useState({});
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  const handleNodeClick = (nodeName: string, level: number) => {
    const dimensionName = flowLevels[level];

    // Add filter
    setFilters({
      ...filters,
      [dimensionName]: nodeName
    });

    // Update breadcrumbs
    setBreadcrumbs([...breadcrumbs, nodeName]);
  };

  return (
    <>
      <Breadcrumb items={breadcrumbs} onReset={() => {
        setFilters({});
        setBreadcrumbs([]);
      }} />

      <SankeyChart
        query={{
          measures: ['GoogleAds.clicks'],
          dimensions: flowLevels,
          filters: Object.entries(filters).map(([member, value]) => ({
            member,
            operator: 'equals',
            values: [value]
          }))
        }}
        flowLevels={flowLevels}
        valueMeasure="GoogleAds.clicks"
        onNodeClick={handleNodeClick}
      />
    </>
  );
}
```

## 📚 Additional Resources

- **ECharts Sankey Documentation**: https://echarts.apache.org/en/option.html#series-sankey
- **Cube.js Query Format**: https://cube.dev/docs/query-format
- **WPP Platform Docs**: `/frontend/docs/architecture/CLAUDE.md`

## 🎯 Best Practices

1. **Always aggregate in Cube.js** - Return ≤400 rows, not 50,000
2. **Use pre-aggregations** - For instant query performance
3. **Filter noise** - Set `minLinkValue` to hide insignificant flows
4. **Optimize layout** - Adjust `nodeGap`, `nodeWidth`, `layoutIterations`
5. **Handle states** - Provide custom loading/error components
6. **Mobile-first** - Test vertical orientation for small screens
7. **Multi-tenant** - Trust Cube.js security context for filtering

## 📝 License

Part of the WPP Analytics Platform - Internal Use Only
