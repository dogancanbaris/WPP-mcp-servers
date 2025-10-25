/**
 * PieChart Component - Usage Examples
 *
 * Demonstrates various Cube.js integration patterns for the PieChart component.
 * These examples show real-world use cases from the WPP Analytics Platform.
 *
 * @see PieChart.tsx
 * @see COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md Section 2.3.1
 */

import { PieChart } from './PieChart';

// ============================================================================
// Example 1: Basic Pie Chart - Google Ads Device Distribution
// ============================================================================

export const DeviceDistributionPie = () => (
  <PieChart
    title="Traffic by Device"
    datasource="GoogleAds"
    dimension="GoogleAds.device"
    metrics={['GoogleAds.clicks']}
    dateRange="last 30 days"
    showLegend={true}
    pieRadius="55%"
    chartColors={['#4285F4', '#34A853', '#FBBC04']} // Google brand colors
  />
);

// Cube.js Query Generated:
// {
//   measures: ['GoogleAds.clicks'],
//   dimensions: ['GoogleAds.device'],
//   timeDimensions: [{
//     dimension: 'GoogleAds.date',
//     dateRange: 'last 30 days'
//   }],
//   order: { 'GoogleAds.clicks': 'desc' },
//   limit: 10
// }

// ============================================================================
// Example 2: Donut Chart - Search Console Traffic Source
// ============================================================================

export const TrafficSourceDonut = () => (
  <PieChart
    title="Organic Search Traffic Sources"
    datasource="SearchConsole"
    dimension="SearchConsole.searchType"
    metrics={['SearchConsole.clicks']}
    dateRange="last 7 days"
    // Donut configuration
    pieRadius={['40%', '70%']} // Inner/outer radius = donut hole
    pieCenter={['50%', '50%']}
    showLabel={false} // Hide labels for cleaner donut
    showLegend={true}
    chartColors={['#5470c6', '#91cc75', '#fac858', '#ee6666']}
  />
);

// ============================================================================
// Example 3: Rose Chart - Campaign Budget Allocation
// ============================================================================

export const CampaignBudgetRose = () => (
  <PieChart
    title="Campaign Budget Distribution"
    datasource="GoogleAds"
    dimension="GoogleAds.campaignName"
    metrics={['GoogleAds.cost']}
    filters={[
      {
        field: 'GoogleAds.campaignStatus',
        operator: 'equals',
        values: ['ENABLED']
      }
    ]}
    dateRange="this month"
    // Rose chart configuration
    roseType="radius" // Radius varies by value
    pieRadius="70%"
    showLabel={true}
    labelPosition="outside"
    labelFormatter="{b}: ${c}"
    metricsConfig={[
      {
        metricId: 'GoogleAds.cost',
        format: 'currency',
        currencyCode: 'USD',
        decimals: 0
      }
    ]}
  />
);

// ============================================================================
// Example 4: Pie Chart with Filters - Top Landing Pages
// ============================================================================

export const TopLandingPagesPie = () => (
  <PieChart
    title="Top 10 Landing Pages by Clicks"
    datasource="SearchConsole"
    dimension="SearchConsole.page"
    metrics={['SearchConsole.clicks']}
    filters={[
      {
        field: 'SearchConsole.country',
        operator: 'equals',
        values: ['USA']
      },
      {
        field: 'SearchConsole.clicks',
        operator: 'gt',
        values: ['100']
      }
    ]}
    dateRange="last 30 days"
    pieRadius="60%"
    showLabel={true}
    labelPosition="outside"
    labelFormatter="{b}\n{d}%"
    showLabelLine={true}
    labelLineLength={20}
    labelLineLength2={15}
  />
);

// ============================================================================
// Example 5: Selectable Pie Chart - Interactive Campaign Analysis
// ============================================================================

export const InteractiveCampaignPie = () => (
  <PieChart
    title="Click Distribution by Campaign (Click to Select)"
    datasource="GoogleAds"
    dimension="GoogleAds.campaignName"
    metrics={['GoogleAds.clicks']}
    dateRange="yesterday"
    // Interactive selection
    selectedMode="multiple" // Allow selecting multiple slices
    selectedOffset={15} // Offset distance when selected
    pieRadius="55%"
    showLabel={true}
    labelPosition="outside"
    showLegend={true}
  />
);

// ============================================================================
// Example 6: Conversion by Channel - Analytics Data
// ============================================================================

export const ConversionByChannelPie = () => (
  <PieChart
    title="Conversions by Channel"
    datasource="Analytics"
    dimension="Analytics.channelGrouping"
    metrics={['Analytics.conversions']}
    filters={[
      {
        field: 'Analytics.conversions',
        operator: 'gt',
        values: ['0']
      }
    ]}
    dateRange="last 90 days"
    pieRadius={['35%', '65%']} // Donut style
    showLabel={true}
    labelPosition="inside"
    labelFormatter="{d}%"
    chartColors={[
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40'
    ]}
    metricsConfig={[
      {
        metricId: 'Analytics.conversions',
        format: 'number',
        decimals: 0
      }
    ]}
  />
);

// ============================================================================
// Example 7: Custom Styled Pie Chart - Brand Colors
// ============================================================================

export const BrandedPieChart = () => (
  <PieChart
    title="Q4 Performance by Product Line"
    datasource="GoogleAds"
    dimension="GoogleAds.adGroupName"
    metrics={['GoogleAds.revenue']}
    dateRange="2024-10-01 to 2024-12-31"
    // Custom styling
    backgroundColor="#f8f9fa"
    showBorder={true}
    borderColor="#dee2e6"
    borderWidth={2}
    borderRadius={12}
    showShadow={true}
    shadowColor="rgba(0, 0, 0, 0.1)"
    shadowBlur={20}
    padding={24}
    // Title styling
    showTitle={true}
    titleFontFamily="Inter"
    titleFontSize="18"
    titleFontWeight="700"
    titleColor="#1a202c"
    titleAlignment="center"
    // Chart styling
    pieRadius="65%"
    startAngle={180} // Start from left
    chartColors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
    showLegend={true}
  />
);

// ============================================================================
// Example 8: Multi-Dimensional Pie - Device + Country
// ============================================================================

export const MultiDimensionalPie = () => (
  <PieChart
    title="Mobile Traffic by Country"
    datasource="Analytics"
    dimension="Analytics.country"
    metrics={['Analytics.sessions']}
    filters={[
      {
        field: 'Analytics.deviceCategory',
        operator: 'equals',
        values: ['mobile']
      }
    ]}
    dateRange="last 30 days"
    pieRadius="60%"
    showLabel={true}
    labelPosition="outside"
    labelFormatter="{b}: {c} sessions"
  />
);

// ============================================================================
// Example 9: Pie Chart with Date Range Comparison
// ============================================================================

export const DateComparisonPie = () => (
  <PieChart
    title="Current Week vs Last Week - Traffic Sources"
    datasource="SearchConsole"
    dimension="SearchConsole.searchType"
    metrics={['SearchConsole.impressions']}
    dateRange="this week"
    pieRadius={['45%', '75%']}
    showLabel={true}
    labelPosition="outside"
    labelFormatter="{b}\n{d}%"
    metricsConfig={[
      {
        metricId: 'SearchConsole.impressions',
        format: 'number',
        notation: 'compact' // 1.2K, 3.4M
      }
    ]}
  />
);

// ============================================================================
// Example 10: Real-Time Pie Chart
// ============================================================================

export const RealTimeCampaignPie = () => (
  <PieChart
    title="Live Campaign Performance (Last Hour)"
    datasource="GoogleAds"
    dimension="GoogleAds.campaignName"
    metrics={['GoogleAds.impressions']}
    dateRange="last 1 hour"
    pieRadius="60%"
    showLabel={true}
    labelPosition="outside"
    // Refresh handled by parent component's useEffect
  />
);

// ============================================================================
// Cube.js Data Transformation Notes
// ============================================================================

/**
 * How PieChart transforms Cube.js data to ECharts format:
 *
 * INPUT (from Cube.js resultSet.tablePivot()):
 * [
 *   { 'GoogleAds.device': 'Desktop', 'GoogleAds.clicks': 1234 },
 *   { 'GoogleAds.device': 'Mobile', 'GoogleAds.clicks': 5678 },
 *   { 'GoogleAds.device': 'Tablet', 'GoogleAds.clicks': 890 }
 * ]
 *
 * OUTPUT (ECharts series data):
 * [
 *   { name: 'Desktop', value: 1234, itemStyle: { color: '#5470c6' } },
 *   { name: 'Mobile', value: 5678, itemStyle: { color: '#91cc75' } },
 *   { name: 'Tablet', value: 890, itemStyle: { color: '#fac858' } }
 * ]
 *
 * The component automatically:
 * 1. Extracts dimension value as 'name'
 * 2. Extracts first metric as 'value'
 * 3. Assigns colors from chartColors array
 * 4. Calculates percentages for tooltip
 * 5. Sorts by metric value (DESC) via Cube.js order clause
 * 6. Limits to top 10 items for readability
 */

// ============================================================================
// Performance Optimization Tips
// ============================================================================

/**
 * 1. Token Efficiency:
 *    - Always use limit: 10 (default in component)
 *    - Aggregate in Cube.js, not in React
 *    - Use pre-aggregations for frequently accessed data
 *
 * 2. Query Optimization:
 *    - Define proper indexes in Cube.js schema
 *    - Use dimensions with low cardinality
 *    - Apply filters to reduce data volume
 *
 * 3. Rendering Performance:
 *    - Limit pie slices to 10 or fewer
 *    - Use donut charts to reduce visual clutter
 *    - Disable labels if too many slices overlap
 *
 * 4. Real-Time Updates:
 *    - Use refreshKey in Cube.js pre-aggregations
 *    - Implement polling in parent component
 *    - Use WebSocket for live data (future)
 */
