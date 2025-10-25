/**
 * PictorialBarChart - Usage Examples
 *
 * This file demonstrates various pictorial bar chart configurations
 * for different WPP analytics use cases.
 */
'use client';

import { PictorialBarChart } from './PictorialBarChart';

/**
 * EXAMPLE 1: User Sessions by Device (Vertical Roundrect)
 * Perfect for comparing session counts across devices
 */
export const DeviceSessionsExample = () => (
  <PictorialBarChart
    title="User Sessions by Device Type"
    datasource="google_analytics_sessions"
    dimension="GoogleAnalytics.deviceCategory"
    metrics={['GoogleAnalytics.sessions']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolType="roundRect"
    symbolRepeat={true}
    symbolMargin="5%"
    symbolSize={['100%', '80%']}
    orientation="vertical"
    showLegend={false}
    chartColors={['#5470c6', '#91cc75', '#fac858']}
  />
);

/**
 * EXAMPLE 2: User Count by User Type (Circle Symbols)
 * Using circle symbols to represent individual users
 */
export const UserTypeExample = () => (
  <PictorialBarChart
    title="Active Users: New vs Returning"
    datasource="google_analytics_users"
    dimension="GoogleAnalytics.userType"
    metrics={['GoogleAnalytics.activeUsers']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolType="circle"
    symbolRepeat={true}
    symbolMargin={2}
    symbolSize={20}
    orientation="vertical"
    showLegend={false}
    chartColors={['#ee6666', '#73c0de']}
  />
);

/**
 * EXAMPLE 3: Conversion Rate by Campaign (Star Symbols)
 * Using stars to highlight top-performing campaigns
 */
export const CampaignConversionsExample = () => (
  <PictorialBarChart
    title="Top Campaigns by Conversions"
    datasource="google_ads_campaigns"
    dimension="GoogleAds.campaignName"
    metrics={['GoogleAds.conversions']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolType="star"
    symbolRepeat={true}
    symbolMargin="10%"
    symbolSize={['100%', '90%']}
    orientation="vertical"
    showLegend={false}
    chartColors={['#fac858']}
  />
);

/**
 * EXAMPLE 4: Horizontal Pictorial Bar (Diamond Symbols)
 * Better for long category names
 */
export const LandingPageClicksExample = () => (
  <PictorialBarChart
    title="Top Landing Pages by Clicks"
    datasource="gsc_performance"
    dimension="GSC.page"
    metrics={['GSC.clicks']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolType="diamond"
    symbolRepeat={true}
    symbolMargin="5%"
    symbolSize={['80%', '100%']}
    orientation="horizontal"
    showLegend={false}
    chartColors={['#91cc75']}
  />
);

/**
 * EXAMPLE 5: Multiple Metrics (Different Symbols Per Metric)
 * Compare clicks and impressions with different symbols
 */
export const MultiMetricExample = () => (
  <PictorialBarChart
    title="Clicks vs Impressions by Query"
    datasource="gsc_performance"
    dimension="GSC.query"
    metrics={['GSC.clicks', 'GSC.impressions']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolRepeat={true}
    symbolMargin="5%"
    symbolSize={['100%', '70%']}
    orientation="vertical"
    showLegend={true}
    chartColors={['#5470c6', '#91cc75']}
  />
);

/**
 * EXAMPLE 6: Triangle Symbols (Upward Trend Visualization)
 * Perfect for growth metrics
 */
export const GrowthMetricsExample = () => (
  <PictorialBarChart
    title="Monthly Revenue Growth"
    datasource="google_ads_revenue"
    dimension="GoogleAds.month"
    metrics={['GoogleAds.conversionValue']}
    dateRange={{ start: '2025-01-01', end: '2025-12-31' }}
    symbolType="triangle"
    symbolRepeat={true}
    symbolMargin="8%"
    symbolSize={['100%', '85%']}
    orientation="vertical"
    showLegend={false}
    chartColors={['#3ba272']}
  />
);

/**
 * EXAMPLE 7: Pin Symbols (Location/Targeting Data)
 * Great for geographic or targeting comparisons
 */
export const GeographicPerformanceExample = () => (
  <PictorialBarChart
    title="Sessions by Geographic Region"
    datasource="google_analytics_geo"
    dimension="GoogleAnalytics.country"
    metrics={['GoogleAnalytics.sessions']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolType="pin"
    symbolRepeat={true}
    symbolMargin="6%"
    symbolSize={['100%', '75%']}
    orientation="vertical"
    showLegend={false}
    chartColors={['#ee6666']}
  />
);

/**
 * EXAMPLE 8: Arrow Symbols (Directional Metrics)
 * Useful for traffic sources or navigation flows
 */
export const TrafficSourceExample = () => (
  <PictorialBarChart
    title="Sessions by Traffic Source"
    datasource="google_analytics_traffic"
    dimension="GoogleAnalytics.sourceMedium"
    metrics={['GoogleAnalytics.sessions']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolType="arrow"
    symbolRepeat={true}
    symbolMargin="10%"
    symbolSize={['100%', '80%']}
    orientation="horizontal"
    showLegend={false}
    chartColors={['#73c0de']}
  />
);

/**
 * EXAMPLE 9: Large Symbol Size (Non-Repeating)
 * Single large symbol per bar for simple comparisons
 */
export const SimplifiedComparisonExample = () => (
  <PictorialBarChart
    title="Ad Spend by Ad Group"
    datasource="google_ads_adgroups"
    dimension="GoogleAds.adGroupName"
    metrics={['GoogleAds.cost']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
    symbolType="roundRect"
    symbolRepeat={false}
    symbolSize={[60, 40]}
    symbolClip={true}
    orientation="vertical"
    showLegend={false}
    chartColors={['#5470c6', '#91cc75', '#fac858', '#ee6666']}
    metricsConfig={[
      {
        name: 'GoogleAds.cost',
        format: 'currency',
        decimalPlaces: 2
      }
    ]}
  />
);

/**
 * EXAMPLE 10: Styled Container Example
 * Full styling with borders, shadows, and custom colors
 */
export const StyledContainerExample = () => (
  <PictorialBarChart
    title="Quality Score Distribution"
    showTitle={true}
    titleFontFamily="inter"
    titleFontSize="18"
    titleFontWeight="700"
    titleColor="#1f2937"
    titleAlignment="center"

    datasource="google_ads_keywords"
    dimension="GoogleAds.qualityScore"
    metrics={['GoogleAds.keywords']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

    symbolType="star"
    symbolRepeat={true}
    symbolMargin="5%"
    symbolSize={['100%', '80%']}
    orientation="vertical"

    backgroundColor="#f9fafb"
    showBorder={true}
    borderColor="#d1d5db"
    borderWidth={2}
    borderRadius={12}
    showShadow={true}
    shadowColor="rgba(0, 0, 0, 0.1)"
    shadowBlur={15}
    padding={20}

    showLegend={false}
    chartColors={['#fbbf24', '#f59e0b', '#d97706', '#b45309']}
  />
);

/**
 * EXAMPLE 11: Compact View (Minimal Padding)
 * For dashboard grid layouts with limited space
 */
export const CompactViewExample = () => (
  <PictorialBarChart
    title="Quick Stats"
    showTitle={true}
    titleFontSize="14"

    datasource="gsc_performance"
    dimension="GSC.device"
    metrics={['GSC.clicks']}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

    symbolType="circle"
    symbolRepeat={true}
    symbolMargin={1}
    symbolSize={16}
    orientation="vertical"

    showBorder={false}
    padding={8}
    showLegend={false}
    chartColors={['#5470c6']}
  />
);

/**
 * EXAMPLE 12: Multi-Series with Custom Formatting
 * Complex example with multiple metrics and custom formatting
 */
export const ComplexMultiSeriesExample = () => (
  <PictorialBarChart
    title="Campaign Performance Metrics"
    showTitle={true}
    titleFontFamily="inter"
    titleFontSize="16"
    titleFontWeight="600"

    datasource="google_ads_campaigns"
    dimension="GoogleAds.campaignName"
    metrics={[
      'GoogleAds.clicks',
      'GoogleAds.impressions',
      'GoogleAds.conversions'
    ]}
    dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

    symbolRepeat={true}
    symbolMargin="5%"
    symbolSize={['100%', '75%']}
    orientation="vertical"

    showLegend={true}
    chartColors={['#5470c6', '#91cc75', '#fac858']}

    metricsConfig={[
      {
        name: 'GoogleAds.clicks',
        format: 'number',
        decimalPlaces: 0
      },
      {
        name: 'GoogleAds.impressions',
        format: 'number',
        decimalPlaces: 0,
        abbreviate: true
      },
      {
        name: 'GoogleAds.conversions',
        format: 'number',
        decimalPlaces: 1
      }
    ]}
  />
);

/**
 * DASHBOARD INTEGRATION EXAMPLE
 * How to use multiple pictorial bar charts in a dashboard
 */
export const DashboardExample = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
    {/* Device Breakdown */}
    <div className="col-span-1">
      <DeviceSessionsExample />
    </div>

    {/* User Types */}
    <div className="col-span-1">
      <UserTypeExample />
    </div>

    {/* Top Campaigns */}
    <div className="col-span-1">
      <CampaignConversionsExample />
    </div>

    {/* Landing Pages - Spans 2 columns */}
    <div className="col-span-1 md:col-span-2">
      <LandingPageClicksExample />
    </div>

    {/* Geographic Performance */}
    <div className="col-span-1">
      <GeographicPerformanceExample />
    </div>
  </div>
);

/**
 * USAGE NOTES:
 *
 * 1. Symbol Selection Guide:
 *    - circle: Users, sessions, generic counts
 *    - roundRect: Standard bars with rounded edges
 *    - triangle: Growth, trends, directional data
 *    - diamond: Highlights, premium metrics
 *    - star: Ratings, quality scores, favorites
 *    - pin: Geographic, location-based data
 *    - arrow: Traffic sources, navigation flows
 *    - rect: Standard blocks, traditional bars
 *
 * 2. Orientation Tips:
 *    - vertical: Better for short category names (devices, months)
 *    - horizontal: Better for long names (URLs, campaign names)
 *
 * 3. Symbol Repeat:
 *    - true: Multiple symbols = more engaging, better for counts
 *    - false: Single symbol per bar = cleaner, simpler
 *
 * 4. Performance Considerations:
 *    - Limit to 20 categories for readability
 *    - Use symbolClip: true for consistent scale
 *    - Canvas renderer (default) for better symbol quality
 *
 * 5. Accessibility:
 *    - Always include meaningful titles
 *    - Use tooltip formatters for detailed info
 *    - Ensure color contrast for visibility
 *    - Consider colorblind-friendly palettes
 */
