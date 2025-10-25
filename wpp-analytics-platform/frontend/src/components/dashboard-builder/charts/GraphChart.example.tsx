'use client';

import { GraphChart } from './GraphChart';

/**
 * GraphChart Examples
 *
 * Network visualization component using ECharts graph series with force layout
 * Perfect for visualizing relationships between entities in marketing data
 */

// Example 1: Campaign to Landing Page Network
export const CampaignLandingPageNetwork = () => {
  return (
    <GraphChart
      title="Campaign → Landing Page Network"
      datasource="google_ads_performance"
      sourceDimension="GoogleAds.campaignName"
      targetDimension="GoogleAds.landingPage"
      edgeMetric="GoogleAds.clicks"
      nodeMetric="GoogleAds.conversions"
      layout="force"
      forceRepulsion={1500}
      forceGravity={0.1}
      nodeSymbol="circle"
      nodeSymbolSize={40}
      minNodeSize={25}
      maxNodeSize={90}
      edgeWidth={2}
      edgeCurve={0.3}
      showNodeLabels={true}
      showEdgeLabels={false}
      roam={true}
      draggable={true}
      chartColors={[
        '#5470c6', '#91cc75', '#fac858', '#ee6666',
        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
      ]}
      metricsConfig={[
        { metricId: 'GoogleAds.clicks', format: 'number', decimals: 0 },
        { metricId: 'GoogleAds.conversions', format: 'number', decimals: 2 }
      ]}
      filters={[
        {
          field: 'GoogleAds.clicks',
          operator: 'gte',
          values: ['100'] // Only show edges with 100+ clicks
        }
      ]}
      dateRange={{
        start: '2025-09-22',
        end: '2025-10-22'
      }}
    />
  );
};

// Example 2: Keyword to Search Query Network
export const KeywordQueryNetwork = () => {
  return (
    <GraphChart
      title="Keyword → Search Query Relationships"
      datasource="gsc_search_analytics"
      sourceDimension="GSC.keyword"
      targetDimension="GSC.query"
      edgeMetric="GSC.impressions"
      nodeMetric="GSC.clicks"
      layout="force"
      forceRepulsion={2000}
      forceGravity={0.05}
      nodeSymbol="circle"
      minNodeSize={20}
      maxNodeSize={70}
      edgeWidth={1.5}
      edgeCurve={0.2}
      showNodeLabels={true}
      showEdgeLabels={false}
      roam={true}
      draggable={true}
      backgroundColor="#fafafa"
      borderRadius={12}
      filters={[
        {
          field: 'GSC.impressions',
          operator: 'gte',
          values: ['500']
        }
      ]}
      metricsConfig={[
        { metricId: 'GSC.impressions', format: 'number', decimals: 0, prefix: '', suffix: ' views' },
        { metricId: 'GSC.clicks', format: 'number', decimals: 0 }
      ]}
    />
  );
};

// Example 3: Page to Page Link Network (Internal Linking)
export const InternalLinkNetwork = () => {
  return (
    <GraphChart
      title="Internal Link Structure"
      datasource="site_analytics"
      sourceDimension="Analytics.sourcePage"
      targetDimension="Analytics.destinationPage"
      edgeMetric="Analytics.pageviews"
      nodeMetric="Analytics.sessions"
      layout="circular"
      nodeSymbol="roundRect"
      nodeSymbolSize={35}
      minNodeSize={25}
      maxNodeSize={80}
      edgeWidth={2}
      edgeCurve={0.1}
      showNodeLabels={true}
      showEdgeLabels={false}
      roam={true}
      draggable={false} // Lock nodes in circular layout
      chartColors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
      filters={[
        {
          field: 'Analytics.pageviews',
          operator: 'gte',
          values: ['50']
        }
      ]}
    />
  );
};

// Example 4: Ad Group to Device Network
export const AdGroupDeviceNetwork = () => {
  return (
    <GraphChart
      title="Ad Group Performance by Device"
      datasource="google_ads_performance"
      sourceDimension="GoogleAds.adGroupName"
      targetDimension="GoogleAds.device"
      edgeMetric="GoogleAds.cost"
      nodeMetric="GoogleAds.conversions"
      layout="force"
      forceRepulsion={1200}
      forceGravity={0.15}
      nodeSymbol="diamond"
      minNodeSize={30}
      maxNodeSize={85}
      edgeWidth={3}
      edgeCurve={0.25}
      showNodeLabels={true}
      showEdgeLabels={true} // Show cost on edges
      roam={true}
      draggable={true}
      metricsConfig={[
        { metricId: 'GoogleAds.cost', format: 'currency', decimals: 2, prefix: '$' },
        { metricId: 'GoogleAds.conversions', format: 'number', decimals: 1 }
      ]}
      chartColors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731']}
    />
  );
};

// Example 5: Multi-Platform Search Network (Complex)
export const MultiPlatformSearchNetwork = () => {
  return (
    <GraphChart
      title="Cross-Platform Search Performance Network"
      datasource="holistic_search"
      sourceDimension="HolisticSearch.searchTerm"
      targetDimension="HolisticSearch.platform"
      edgeMetric="HolisticSearch.totalClicks"
      nodeMetric="HolisticSearch.totalConversions"
      layout="force"
      forceRepulsion={2500}
      forceGravity={0.08}
      nodeSymbol="circle"
      nodeSymbolSize={45}
      minNodeSize={30}
      maxNodeSize={100}
      edgeWidth={2.5}
      edgeCurve={0.3}
      showNodeLabels={true}
      showEdgeLabels={false}
      roam={true}
      draggable={true}
      showLegend={false}
      backgroundColor="#ffffff"
      showBorder={true}
      borderColor="#d1d5db"
      borderWidth={2}
      borderRadius={16}
      showShadow={true}
      shadowColor="#00000020"
      shadowBlur={15}
      padding={20}
      chartColors={[
        '#3b82f6', // Blue - Paid search
        '#10b981', // Green - Organic
        '#f59e0b', // Amber - Social
        '#ef4444', // Red - Direct
        '#8b5cf6', // Purple - Referral
        '#06b6d4'  // Cyan - Email
      ]}
      filters={[
        {
          field: 'HolisticSearch.totalClicks',
          operator: 'gte',
          values: ['200']
        }
      ]}
      metricsConfig={[
        {
          metricId: 'HolisticSearch.totalClicks',
          format: 'number',
          decimals: 0,
          suffix: ' clicks'
        },
        {
          metricId: 'HolisticSearch.totalConversions',
          format: 'number',
          decimals: 1,
          suffix: ' conv.'
        }
      ]}
      dateRange={{
        start: '2025-09-22',
        end: '2025-10-22'
      }}
    />
  );
};

// Example 6: Minimal Configuration
export const SimpleGraphNetwork = () => {
  return (
    <GraphChart
      title="Simple Network"
      datasource="gsc_performance_7days"
      sourceDimension="GSC.page"
      targetDimension="GSC.country"
      layout="circular"
      roam={false}
      draggable={false}
    />
  );
};

// Example 7: Highly Interactive Network
export const InteractiveGraphNetwork = () => {
  return (
    <GraphChart
      title="Interactive Network Exploration"
      datasource="google_ads_performance"
      sourceDimension="GoogleAds.campaignName"
      targetDimension="GoogleAds.adGroupName"
      edgeMetric="GoogleAds.impressions"
      nodeMetric="GoogleAds.clicks"
      layout="force"
      forceRepulsion={1800}
      forceGravity={0.12}
      nodeSymbol="pin"
      minNodeSize={25}
      maxNodeSize={75}
      edgeWidth={1.5}
      edgeCurve={0.2}
      showNodeLabels={true}
      showEdgeLabels={false}
      roam={true} // Enable zoom and pan
      draggable={true} // Enable node dragging
      chartColors={['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe']}
      metricsConfig={[
        { metricId: 'GoogleAds.impressions', format: 'abbreviate', decimals: 1 },
        { metricId: 'GoogleAds.clicks', format: 'abbreviate', decimals: 1 }
      ]}
    />
  );
};

/**
 * Usage Notes:
 *
 * 1. Required Props:
 *    - sourceDimension: Dimension for source nodes
 *    - targetDimension: Dimension for target nodes
 *
 * 2. Optional Props:
 *    - edgeMetric: Metric to determine edge width/weight
 *    - nodeMetric: Metric to determine node size
 *    - layout: 'force' (default) | 'circular' | 'none'
 *    - forceRepulsion: 100-5000 (higher = more spread out)
 *    - forceGravity: 0-1 (higher = more centered)
 *
 * 3. Layout Types:
 *    - force: Dynamic physics-based layout (best for general use)
 *    - circular: Nodes arranged in a circle (good for hierarchies)
 *    - none: Static layout (requires pre-positioned nodes)
 *
 * 4. Performance Tips:
 *    - Use filters to limit data points (< 500 edges recommended)
 *    - Disable labels for large networks (> 100 nodes)
 *    - Use edgeMetric filter to show only significant connections
 *
 * 5. Use Cases:
 *    - Campaign → Landing Page relationships
 *    - Keyword → Query mapping
 *    - Internal link structure analysis
 *    - Multi-platform attribution paths
 *    - Ad group → Device performance
 *    - Content topic clustering
 *    - User journey flow networks
 *
 * 6. Interactivity:
 *    - roam: Enable zoom (scroll) and pan (drag background)
 *    - draggable: Allow users to reposition nodes
 *    - Hover: Shows connections and tooltip details
 *    - Click: Focuses on node and its neighbors
 *
 * 7. Styling:
 *    - nodeSymbol: Visual style of nodes
 *    - chartColors: Colors assigned to nodes (cycles through array)
 *    - edgeCurve: Amount of curve in connecting lines (0 = straight)
 *    - Node sizes automatically scale based on nodeMetric value
 *    - Edge widths scale logarithmically based on edgeMetric value
 */
