/**
 * ThemeRiverChart - Cube.js Integration Examples
 *
 * This file demonstrates how to use the ThemeRiverChart component with real
 * Cube.js data. Theme river charts are stacked streamgraphs that show the
 * evolution of categories over time in a flowing, organic manner.
 *
 * Key Characteristics:
 * - Displays temporal data as a "river" with flowing "streams"
 * - Each stream represents a category (device, query, campaign, etc.)
 * - Stream width shows the metric value (clicks, impressions, etc.)
 * - Central baseline creates symmetric, organic flow
 * - Best for showing trends and relative proportions over time
 */

import { ThemeRiverChart } from './ThemeRiverChart';

/**
 * Example 1: Device Performance Over Time
 * Shows how clicks distribute across devices (mobile, desktop, tablet) over time
 */
export const DevicePerformanceRiverExample = () => {
  return (
    <ThemeRiverChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.date"
      breakdownDimension="GscPerformance7days.device"
      metrics={["GscPerformance7days.clicks"]}
      title="Device Performance Flow - Last 30 Days"
      dateRange={{
        start: "2025-09-22",
        end: "2025-10-22"
      }}
      chartColors={[
        '#5470c6', // Mobile - Blue
        '#91cc75', // Desktop - Green
        '#fac858', // Tablet - Yellow
      ]}
    />
  );
};

/**
 * Example 2: Top Search Queries Evolution
 * Visualizes how top search queries gain or lose traffic over time
 * Note: Filtered to top 10 queries for readability
 */
export const TopQueriesRiverExample = () => {
  return (
    <ThemeRiverChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.date"
      breakdownDimension="GscPerformance7days.query"
      metrics={["GscPerformance7days.impressions"]}
      title="Top 10 Search Queries - Impression Flow"
      filters={[
        {
          field: "GscPerformance7days.impressions",
          operator: "gt",
          values: ["1000"] // Only show queries with significant traffic
        }
      ]}
      dateRange={{
        start: "2025-09-01",
        end: "2025-10-22"
      }}
      metricsConfig={[
        {
          id: "GscPerformance7days.impressions",
          name: "Impressions",
          format: "number",
          decimals: 0,
          compact: true,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '600',
          showComparison: false,
          showBars: false
        }
      ]}
    />
  );
};

/**
 * Example 3: Country Distribution Over Time
 * Shows geographic distribution changes in traffic
 */
export const CountryDistributionRiverExample = () => {
  return (
    <ThemeRiverChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.date"
      breakdownDimension="GscPerformance7days.country"
      metrics={["GscPerformance7days.clicks"]}
      title="Traffic Distribution by Country"
      filters={[
        {
          field: "GscPerformance7days.clicks",
          operator: "gt",
          values: ["50"] // Top countries only
        }
      ]}
      dateRange={{
        start: "2025-08-22",
        end: "2025-10-22"
      }}
      chartColors={[
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#d4ec59'
      ]}
    />
  );
};

/**
 * Example 4: Campaign Performance (Google Ads Integration)
 * Shows how different campaign types perform over time
 * Note: Assumes Google Ads data is available in Cube.js
 */
export const CampaignPerformanceRiverExample = () => {
  return (
    <ThemeRiverChart
      datasource="GoogleAds"
      dimension="GoogleAds.date"
      breakdownDimension="GoogleAds.campaignType"
      metrics={["GoogleAds.impressions"]}
      title="Campaign Performance by Type"
      dateRange={{
        start: "2025-09-01",
        end: "2025-10-22"
      }}
      metricsConfig={[
        {
          id: "GoogleAds.impressions",
          name: "Impressions",
          format: "number",
          decimals: 0,
          compact: true,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '600',
          showComparison: false,
          showBars: false
        }
      ]}
      chartColors={[
        '#3ba272', // Search - Green (high performance)
        '#5470c6', // Display - Blue
        '#fac858', // Shopping - Yellow
        '#ee6666', // Video - Red
      ]}
    />
  );
};

/**
 * Example 5: Page Performance Over Time
 * Shows which landing pages drive traffic over time
 */
export const PagePerformanceRiverExample = () => {
  return (
    <ThemeRiverChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.date"
      breakdownDimension="GscPerformance7days.page"
      metrics={["GscPerformance7days.clicks"]}
      title="Top Landing Pages - Traffic Flow"
      filters={[
        {
          field: "GscPerformance7days.clicks",
          operator: "gt",
          values: ["100"] // Only pages with significant traffic
        }
      ]}
      dateRange={{
        start: "2025-09-22",
        end: "2025-10-22"
      }}
    />
  );
};

/**
 * Example 6: Conversion Funnel by Source (Analytics Integration)
 * Shows how conversion sources evolve over time
 * Note: Assumes GA4 data is available in Cube.js
 */
export const ConversionSourceRiverExample = () => {
  return (
    <ThemeRiverChart
      datasource="Analytics"
      dimension="Analytics.date"
      breakdownDimension="Analytics.sessionSource"
      metrics={["Analytics.conversions"]}
      title="Conversions by Traffic Source"
      dateRange={{
        start: "2025-09-01",
        end: "2025-10-22"
      }}
      metricsConfig={[
        {
          id: "Analytics.conversions",
          name: "Conversions",
          format: "number",
          decimals: 0,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '600',
          showComparison: false,
          showBars: false
        }
      ]}
      chartColors={[
        '#3ba272', // Organic - Green
        '#5470c6', // Direct - Blue
        '#fac858', // Referral - Yellow
        '#ee6666', // Social - Red
        '#73c0de', // Email - Light Blue
        '#9a60b4', // Paid - Purple
      ]}
    />
  );
};

/**
 * Example 7: With Custom Styling
 * Demonstrates full customization of appearance
 */
export const StyledThemeRiverExample = () => {
  return (
    <ThemeRiverChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.date"
      breakdownDimension="GscPerformance7days.device"
      metrics={["GscPerformance7days.clicks"]}
      title="Custom Styled Theme River"
      showTitle={true}
      titleFontFamily="Inter"
      titleFontSize="20"
      titleFontWeight="700"
      titleColor="#1f2937"
      titleAlignment="center"
      backgroundColor="#f9fafb"
      showBorder={true}
      borderColor="#d1d5db"
      borderWidth={2}
      borderRadius={16}
      showShadow={true}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowBlur={20}
      padding={24}
      showLegend={true}
      dateRange={{
        start: "2025-09-22",
        end: "2025-10-22"
      }}
    />
  );
};

/**
 * Usage in Dashboard Builder
 *
 * The ThemeRiverChart component is designed to work with the dashboard builder's
 * configuration system. Here's how it integrates:
 *
 * 1. User selects "Theme River" chart type
 * 2. Dashboard builder passes configuration props:
 *    - datasource: Selected cube (e.g., "GscPerformance7days")
 *    - dimension: MUST be a time/date dimension
 *    - breakdownDimension: Category dimension (device, query, etc.)
 *    - metrics: Array with ONE measure
 *    - filters: Optional filter conditions
 *    - dateRange: Time window to visualize
 *    - metricsConfig: Formatting rules
 *
 * 3. Component queries Cube.js:
 *    - Builds query with timeDimensions + dimensions + measures
 *    - Fetches aggregated data (typically 90-300 rows)
 *    - Transforms to theme river format: [date, value, category]
 *
 * 4. ECharts renders theme river:
 *    - singleAxis: Timeline (x-axis)
 *    - themeRiver series: Flowing streams
 *    - Color mapping: Categories get unique colors
 *    - Tooltip: Shows date + all category values
 *
 * Performance Considerations:
 * - Theme river works best with 3-10 categories (streams)
 * - Optimal time range: 30-90 days
 * - For high-cardinality breakdowns (query, page), add filters
 * - Use TOP N filters to limit categories: clicks > 100
 * - Pre-aggregations in Cube.js improve query speed
 */

/**
 * Cube.js Query Example
 *
 * When configured as in Example 1, the component generates:
 *
 * {
 *   "measures": ["GscPerformance7days.clicks"],
 *   "timeDimensions": [{
 *     "dimension": "GscPerformance7days.date",
 *     "granularity": "day",
 *     "dateRange": ["2025-09-22", "2025-10-22"]
 *   }],
 *   "dimensions": ["GscPerformance7days.device"],
 *   "order": {
 *     "GscPerformance7days.date": "asc"
 *   }
 * }
 *
 * This returns aggregated data like:
 * [
 *   { "GscPerformance7days.date": "2025-09-22", "GscPerformance7days.device": "MOBILE", "GscPerformance7days.clicks": 1234 },
 *   { "GscPerformance7days.date": "2025-09-22", "GscPerformance7days.device": "DESKTOP", "GscPerformance7days.clicks": 2345 },
 *   { "GscPerformance7days.date": "2025-09-23", "GscPerformance7days.device": "MOBILE", "GscPerformance7days.clicks": 1456 },
 *   { "GscPerformance7days.date": "2025-09-23", "GscPerformance7days.device": "DESKTOP", "GscPerformance7days.clicks": 2567 },
 *   ...
 * ]
 *
 * Component transforms this to ECharts theme river format:
 * [
 *   ["2025-09-22", 1234, "MOBILE"],
 *   ["2025-09-22", 2345, "DESKTOP"],
 *   ["2025-09-23", 1456, "MOBILE"],
 *   ["2025-09-23", 2567, "DESKTOP"],
 *   ...
 * ]
 *
 * ECharts renders this as flowing streams where:
 * - X-axis: Timeline from 2025-09-22 to 2025-10-22
 * - Stream width: Proportional to clicks value
 * - Stream color: Unique color per device
 * - Flow: Smooth transitions between dates
 */

/**
 * Best Practices
 *
 * 1. Dimension Selection:
 *    - Primary dimension MUST be date/time
 *    - Breakdown dimension should have 3-10 unique values
 *    - Good breakdown: device, country (top N), campaignType
 *    - Avoid: query, page without filters (too many values)
 *
 * 2. Metric Selection:
 *    - Use only ONE metric (first metric used)
 *    - Works well: clicks, impressions, conversions, sessions
 *    - Avoid: percentages (CTR, bounce rate) - use absolute values
 *    - Configure format: number with compact notation
 *
 * 3. Time Range:
 *    - Optimal: 30-90 days of data
 *    - Too short (<14 days): Not enough flow to visualize
 *    - Too long (>180 days): Axis labels become crowded
 *    - Use day granularity for most cases
 *
 * 4. Filtering:
 *    - For high-cardinality breakdowns, add TOP N filter
 *    - Example: clicks > 100 (keeps significant categories)
 *    - Limit to 3-10 streams for readability
 *    - More than 10 streams = cluttered visualization
 *
 * 5. Color Schemes:
 *    - Use distinct colors for each category
 *    - Good contrast between adjacent streams
 *    - Consider semantic colors (green=good, red=warning)
 *    - Provide 8-10 colors for variety
 *
 * 6. Performance:
 *    - Aim for 90-300 data points total (30 days × 3-10 categories)
 *    - Use Cube.js pre-aggregations for speed
 *    - Query with ORDER BY date ASC for chronological flow
 *    - Avoid cartesian explosions with proper filtering
 *
 * 7. Interpretation:
 *    - Stream width = metric value (wider = more)
 *    - Stream position = relative proportion at that time
 *    - Bumps/valleys = changes in that category
 *    - Crossing streams = shifts in relative importance
 *    - Best for spotting trends, not precise values
 */

/**
 * When to Use Theme River vs Other Charts
 *
 * Use Theme River When:
 * ✅ Showing evolution of multiple categories over time
 * ✅ Emphasizing flow and trends (not exact values)
 * ✅ Displaying relative proportions changing over time
 * ✅ Data has natural narrative (rise and fall)
 * ✅ 3-10 categories with temporal data
 * ✅ Highlighting shifts in composition
 *
 * Use Other Charts When:
 * ❌ Need exact values → Use Line Chart or Time Series
 * ❌ Only 1-2 categories → Use Area Chart
 * ❌ No time dimension → Use Bar Chart or Pie Chart
 * ❌ Need to compare exact values → Use Stacked Bar Chart
 * ❌ More than 10 categories → Use Heatmap
 * ❌ Showing totals (not proportions) → Use Stacked Area Chart
 */

/**
 * Common Use Cases by Industry
 *
 * Digital Marketing:
 * - Device performance trends (mobile, desktop, tablet)
 * - Search query momentum (rising/falling queries)
 * - Campaign type distribution over time
 * - Geographic traffic shifts
 * - Traffic source evolution
 *
 * E-commerce:
 * - Product category sales trends
 * - Traffic by landing page over time
 * - Conversion source evolution
 * - Customer segment growth
 *
 * Content Publishing:
 * - Content topic performance
 * - Reader device preferences
 * - Geographic audience shifts
 * - Traffic source changes
 *
 * SaaS / Apps:
 * - Feature usage over time
 * - User segment growth
 * - Platform distribution (iOS, Android, Web)
 * - Acquisition channel trends
 */

/**
 * Troubleshooting
 *
 * Issue: "Theme River requires time dimension"
 * Solution: Ensure primary dimension is a date field (e.g., "GscPerformance7days.date")
 *
 * Issue: Too many streams (cluttered)
 * Solution: Add filters to limit breakdown dimension to top 5-10 values
 *
 * Issue: No data shown
 * Solution: Check dateRange matches data availability, verify filters aren't too restrictive
 *
 * Issue: Jagged flow (not smooth)
 * Solution: Ensure data has no gaps, use consistent granularity (day)
 *
 * Issue: Axis labels overlap
 * Solution: Reduce time range or let ECharts auto-format (already implemented)
 *
 * Issue: Colors look similar
 * Solution: Provide custom chartColors array with distinct colors
 *
 * Issue: Slow loading
 * Solution: Use pre-aggregations in Cube.js, reduce time range, add filters
 */
