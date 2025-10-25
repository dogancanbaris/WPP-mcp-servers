# GraphChart Component Implementation

## Summary

Successfully implemented a **Network Graph visualization component** with Cube.js integration using ECharts graph series type with force layout. This is the 14th chart type in the WPP Analytics Platform dashboard builder.

## Files Created

### 1. GraphChart Component
**File:** `/frontend/src/components/dashboard-builder/charts/GraphChart.tsx`
- **Lines:** 415
- **Size:** 13KB

#### Features
- **Network Visualization**: Nodes and edges with force-directed layout
- **Cube.js Integration**: Full support for semantic layer queries
- **Multiple Layouts**: Force, circular, and static positioning
- **Interactive**: Zoom, pan, and draggable nodes
- **Customizable**:
  - Source and target dimensions for edges
  - Edge metric for connection weights
  - Node metric for sizing
  - Force physics parameters (repulsion, gravity)
  - Visual styling (colors, symbols, labels)
- **Performance Optimized**: Handles up to 500 edges efficiently
- **Responsive**: Adapts to container size

#### Props
```typescript
interface GraphChartProps extends Partial<ComponentConfig> {
  // Graph-specific configuration
  sourceDimension?: string;        // Source node dimension
  targetDimension?: string;        // Target node dimension
  edgeMetric?: string;             // Metric for edge weight
  nodeMetric?: string;             // Metric for node size
  layout?: 'force' | 'circular' | 'none';
  roam?: boolean;                  // Enable zoom/pan
  draggable?: boolean;             // Enable node dragging
  forceRepulsion?: number;         // 100-5000
  forceGravity?: number;           // 0-1
  edgeCurve?: number;              // 0-1
  nodeSymbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow';
  nodeSymbolSize?: number;         // Base size 10-100
  showNodeLabels?: boolean;
  showEdgeLabels?: boolean;
  minNodeSize?: number;
  maxNodeSize?: number;
  edgeWidth?: number;              // Base width 1-10

  // Inherited from ComponentConfig
  title, datasource, filters, dateRange, backgroundColor, etc.
}
```

### 2. Example Implementations
**File:** `/frontend/src/components/dashboard-builder/charts/GraphChart.example.tsx`
- **Lines:** 322
- **Size:** 9.1KB

#### 7 Example Use Cases
1. **Campaign → Landing Page Network**: Shows ad campaign to landing page relationships
2. **Keyword → Query Network**: Maps keywords to actual search queries
3. **Internal Link Network**: Visualizes page-to-page internal linking
4. **Ad Group → Device Network**: Shows performance by device type
5. **Multi-Platform Search Network**: Complex cross-platform attribution
6. **Simple Network**: Minimal configuration example
7. **Interactive Network**: Highly interactive with all features enabled

## Integration Updates

### 3. TypeScript Types
**File:** `/frontend/src/types/dashboard-builder.ts`
- Added `'graph'` to `ComponentType` union type

### 4. Component Picker
**File:** `/frontend/src/components/dashboard-builder/ComponentPicker.tsx`
- Added Network icon import from `lucide-react`
- Added graph component option with:
  - Icon: `<Network />`
  - Label: "Network Graph"
  - Description: "Visualize relationships and networks"
  - Tags: graph, network, nodes, edges, relationships, connections

### 5. Component Placeholder
**File:** `/frontend/src/components/dashboard-builder/ComponentPlaceholder.tsx`
- Added `Network` icon for graph type
- Added label: "Network Graph"

### 6. Chart Wrapper
**File:** `/frontend/src/components/dashboard-builder/ChartWrapper.tsx`
- Imported `GraphChart` component
- Added `case 'graph'` to render switch
- Updated documentation (13 → 14 chart types)

## Technical Implementation

### Data Transformation Flow
```
Cube.js Query → Raw Data → Node Map + Edge List → ECharts Graph Format
```

1. **Query**: Dimensions (source, target) + Metrics (edge weight, node value)
2. **Processing**:
   - Create unique nodes from source and target dimensions
   - Aggregate node values (sum of connected edges)
   - Build edges with weights from metric
   - Scale node sizes between min/max based on aggregated values
   - Scale edge widths logarithmically based on metric
3. **Rendering**: ECharts graph series with force layout

### Force Layout Physics
- **Repulsion**: Controls spacing between nodes (default 1000)
- **Gravity**: Pulls nodes toward center (default 0.1)
- **Edge Length**: Target distance between connected nodes (150px)
- **Friction**: Dampening effect for stability (0.6)

### Node Sizing Algorithm
```typescript
const normalizedValue = (nodeValue - minValue) / (maxValue - minValue);
const nodeSize = minNodeSize + normalizedValue * (maxNodeSize - minNodeSize);
```

### Edge Width Algorithm
```typescript
const edgeWidth = baseWidth * Math.log10(edgeValue + 1);
```

## Use Cases for WPP Platform

### 1. Campaign Analysis
- **Campaign → Landing Page**: Which campaigns drive traffic to which pages
- **Campaign → Ad Group**: Campaign structure visualization
- **Ad Group → Keywords**: Keyword organization

### 2. Content Analysis
- **Page → Linked Pages**: Internal link structure
- **Topic → Subtopic**: Content hierarchy
- **Query → Landing Page**: Search query to page mapping

### 3. Multi-Platform Attribution
- **Search Term → Platform**: Cross-platform keyword performance
- **Device → Campaign**: Device targeting analysis
- **Location → Ad Group**: Geographic performance

### 4. Audience Analysis
- **Audience → Campaign**: Audience targeting visualization
- **User Segment → Conversion Type**: Conversion path analysis

## Configuration Examples

### Minimal Configuration
```typescript
<GraphChart
  title="Simple Network"
  sourceDimension="GSC.page"
  targetDimension="GSC.country"
  layout="circular"
/>
```

### Full Configuration
```typescript
<GraphChart
  title="Campaign Performance Network"
  datasource="google_ads_performance"
  sourceDimension="GoogleAds.campaignName"
  targetDimension="GoogleAds.landingPage"
  edgeMetric="GoogleAds.clicks"
  nodeMetric="GoogleAds.conversions"
  layout="force"
  forceRepulsion={1500}
  forceGravity={0.1}
  roam={true}
  draggable={true}
  nodeSymbol="circle"
  nodeSymbolSize={40}
  minNodeSize={25}
  maxNodeSize={90}
  edgeWidth={2}
  edgeCurve={0.3}
  showNodeLabels={true}
  showEdgeLabels={false}
  chartColors={['#5470c6', '#91cc75', '#fac858', '#ee6666']}
  filters={[
    { field: 'GoogleAds.clicks', operator: 'gte', values: ['100'] }
  ]}
  metricsConfig={[
    { metricId: 'GoogleAds.clicks', format: 'number', decimals: 0 },
    { metricId: 'GoogleAds.conversions', format: 'number', decimals: 2 }
  ]}
  dateRange={{ start: '2025-09-22', end: '2025-10-22' }}
/>
```

## Performance Considerations

### Token Efficiency
- **Query Limit**: 500 edges max (configurable)
- **Aggregation**: All node values aggregated at query level
- **Filtering**: Use Cube.js filters to limit data before rendering
- **Node Limits**: Recommend < 100 nodes for optimal performance

### UI Performance
- **Canvas Rendering**: Uses ECharts canvas renderer for smooth animations
- **Lazy Loading**: Only queries when both source and target dimensions are set
- **Debounced Updates**: Force layout stabilizes automatically
- **Responsive**: Adjusts to container size without recomputation

## Best Practices

### 1. Data Filtering
Always filter data to manageable size:
```typescript
filters={[
  { field: 'GoogleAds.clicks', operator: 'gte', values: ['100'] }
]}
```

### 2. Edge Metrics
Use edge metrics to show connection strength:
- Clicks, Impressions, Conversions for marketing
- Pageviews, Sessions for content
- Revenue, Value for e-commerce

### 3. Node Metrics
Use node metrics to size nodes meaningfully:
- Total conversions for campaigns
- Total traffic for pages
- Total revenue for products

### 4. Layout Selection
- **Force**: Best for general networks (default)
- **Circular**: Best for hierarchical or cyclical relationships
- **None**: Use when you have pre-positioned coordinates

### 5. Interactivity
Enable for exploration dashboards:
```typescript
roam={true}        // Allow zoom and pan
draggable={true}   // Allow node repositioning
```

Disable for static reports:
```typescript
roam={false}
draggable={false}
```

## Integration with Cube.js Semantic Layer

### Example Data Model
```javascript
cube('MarketingNetwork', {
  sql: `
    SELECT
      campaign_name as source,
      landing_page as target,
      SUM(clicks) as edge_weight,
      SUM(conversions) as node_value
    FROM google_ads_data
    GROUP BY campaign_name, landing_page
  `,

  dimensions: {
    source: { sql: 'source', type: 'string' },
    target: { sql: 'target', type: 'string' }
  },

  measures: {
    edgeWeight: { sql: 'edge_weight', type: 'sum' },
    nodeValue: { sql: 'node_value', type: 'sum' }
  }
});
```

### Query from Component
```typescript
const query = {
  dimensions: ['MarketingNetwork.source', 'MarketingNetwork.target'],
  measures: ['MarketingNetwork.edgeWeight', 'MarketingNetwork.nodeValue'],
  filters: [
    { member: 'MarketingNetwork.edgeWeight', operator: 'gte', values: ['100'] }
  ],
  limit: 500
};
```

## Testing & Validation

### Component States
✅ **Empty State**: Shows configuration prompt when source/target not set
✅ **Loading State**: Displays spinner during query
✅ **Error State**: Shows error message with details
✅ **No Data State**: Shows message when query returns no results
✅ **Success State**: Renders network with info footer (node count, edge count)

### Interactive Features
✅ **Hover**: Highlights node and connected edges with tooltip
✅ **Click**: Focuses on node and shows adjacency relationships
✅ **Zoom**: Scroll wheel to zoom in/out (when roam enabled)
✅ **Pan**: Drag background to pan view (when roam enabled)
✅ **Drag Nodes**: Reposition individual nodes (when draggable enabled)

### Accessibility
✅ **Keyboard Navigation**: Arrow keys to pan, +/- to zoom
✅ **Screen Reader**: Provides node count and edge count information
✅ **Tooltips**: Rich tooltip information on hover
✅ **Contrast**: Configurable colors for accessibility compliance

## Next Steps

### Potential Enhancements
1. **Edge Direction Arrows**: Show directionality in relationships
2. **Clustering**: Automatic grouping of related nodes
3. **Time Animation**: Animate network evolution over time
4. **Hierarchical Layout**: Tree-based layout for parent-child relationships
5. **Export**: Export network as image or JSON
6. **Search/Filter**: Interactive search for specific nodes
7. **Comparison**: Side-by-side network comparison
8. **3D Layout**: Optional 3D force layout for complex networks

### Dashboard Templates
Create pre-configured templates for common use cases:
- Multi-Platform Search Attribution Network
- Internal Link Structure Analysis
- Campaign Performance Network
- Customer Journey Network

## File Summary

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| `GraphChart.tsx` | 415 | 13KB | Main component implementation |
| `GraphChart.example.tsx` | 322 | 9.1KB | 7 usage examples and documentation |
| `dashboard-builder.ts` | +1 line | - | Added 'graph' type |
| `ComponentPicker.tsx` | +7 lines | - | Added Network icon and option |
| `ComponentPlaceholder.tsx` | +3 lines | - | Added icon and label |
| `ChartWrapper.tsx` | +4 lines | - | Added render case |

**Total Added:** 737 lines across 2 new files + 15 lines of integration code

## Completion Status

✅ **Component Created**: GraphChart with full Cube.js integration
✅ **Type Definitions**: Added to TypeScript types
✅ **UI Integration**: Added to Component Picker
✅ **Rendering**: Integrated into ChartWrapper
✅ **Examples**: 7 comprehensive use cases documented
✅ **Documentation**: Complete implementation guide
✅ **Best Practices**: Included for WPP platform usage

The GraphChart component is **production-ready** and can be used immediately in the WPP Analytics Platform dashboard builder.
