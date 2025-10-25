/**
 * HeatmapChart - Cube.js Integration Examples
 *
 * This file demonstrates how to use the HeatmapChart component with real
 * Cube.js data from the GSC Performance data model.
 */

import { HeatmapChart } from './HeatmapChart';

/**
 * Example 1: Device Performance by Country
 * Shows clicks distribution across different devices and countries
 */
export const DeviceCountryHeatmapExample = () => {
  return (
    <HeatmapChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.device"
      breakdownDimension="GscPerformance7days.country"
      metrics={["GscPerformance7days.clicks"]}
      title="Clicks by Device and Country"
      chartColors={[
        '#f7fbff',
        '#deebf7',
        '#c6dbef',
        '#9ecae1',
        '#6baed6',
        '#4292c6',
        '#2171b5',
        '#08519c',
        '#08306b'
      ]}
    />
  );
};

/**
 * Example 2: Country Performance by Query
 * Shows impressions across top queries and countries
 * Note: Limited to top 10 queries to keep visualization readable
 */
export const CountryQueryHeatmapExample = () => {
  return (
    <HeatmapChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.country"
      breakdownDimension="GscPerformance7days.query"
      metrics={["GscPerformance7days.impressions"]}
      title="Impressions by Country and Search Query"
      filters={[
        {
          field: "GscPerformance7days.impressions",
          operator: "gt",
          values: ["100"]
        }
      ]}
      showLegend={false}
    />
  );
};

/**
 * Example 3: CTR Distribution by Device and Country
 * Shows click-through rate patterns (percentage format)
 */
export const CtrDeviceCountryHeatmapExample = () => {
  return (
    <HeatmapChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.device"
      breakdownDimension="GscPerformance7days.country"
      metrics={["GscPerformance7days.avgCtr"]}
      title="Average CTR by Device and Country"
      metricsConfig={[
        {
          id: "GscPerformance7days.avgCtr",
          name: "Average CTR",
          format: "percent",
          decimals: 2,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '600',
          showComparison: false,
          showBars: false
        }
      ]}
      chartColors={[
        '#fff5f0',
        '#fee0d2',
        '#fcbba1',
        '#fc9272',
        '#fb6a4a',
        '#ef3b2c',
        '#cb181d',
        '#a50f15',
        '#67000d'
      ]}
    />
  );
};

/**
 * Example 4: Position Analysis by Device
 * Shows average search position across devices and top pages
 * Note: Lower values are better for position
 */
export const PositionDevicePageHeatmapExample = () => {
  return (
    <HeatmapChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.device"
      breakdownDimension="GscPerformance7days.page"
      metrics={["GscPerformance7days.avgPosition"]}
      title="Average Position by Device and Landing Page"
      filters={[
        {
          field: "GscPerformance7days.clicks",
          operator: "gt",
          values: ["10"]
        }
      ]}
      metricsConfig={[
        {
          id: "GscPerformance7days.avgPosition",
          name: "Average Position",
          format: "number",
          decimals: 1,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '600',
          showComparison: false,
          showBars: false
        }
      ]}
      chartColors={[
        '#a50026', // Worst position (red)
        '#d73027',
        '#f46d43',
        '#fdae61',
        '#fee090',
        '#ffffbf',
        '#e0f3f8',
        '#abd9e9',
        '#74add1',
        '#4575b4',
        '#313695'  // Best position (blue)
      ]}
    />
  );
};

/**
 * Example 5: With Custom Styling
 * Demonstrates full customization of appearance
 */
export const StyledHeatmapExample = () => {
  return (
    <HeatmapChart
      datasource="GscPerformance7days"
      dimension="GscPerformance7days.device"
      breakdownDimension="GscPerformance7days.country"
      metrics={["GscPerformance7days.clicks"]}
      title="Custom Styled Heatmap"
      showTitle={true}
      titleFontFamily="Inter"
      titleFontSize="18"
      titleFontWeight="700"
      titleColor="#1f2937"
      titleAlignment="center"
      backgroundColor="#f9fafb"
      showBorder={true}
      borderColor="#d1d5db"
      borderWidth={2}
      borderRadius={12}
      showShadow={true}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowBlur={20}
      padding={24}
    />
  );
};

/**
 * Usage in Dashboard Builder
 *
 * The HeatmapChart component is designed to work with the dashboard builder's
 * configuration system. Here's how it integrates:
 *
 * 1. User selects "Heatmap" chart type
 * 2. Dashboard builder passes configuration props:
 *    - datasource: Selected cube (e.g., "GscPerformance7days")
 *    - dimension: X-axis dimension
 *    - breakdownDimension: Y-axis dimension
 *    - metrics: Array with one measure
 *    - filters: Optional filter conditions
 *    - dateRange: Optional time filter
 *    - metricsConfig: Formatting rules
 *
 * 3. Component queries Cube.js:
 *    - Builds query with measures + 2 dimensions
 *    - Fetches aggregated data (typically 10-400 rows)
 *    - Transforms to matrix format for ECharts
 *
 * 4. ECharts renders heatmap:
 *    - X-axis: dimension values
 *    - Y-axis: breakdownDimension values
 *    - Color intensity: metric value
 *    - Tooltip: Formatted metric value
 *
 * Performance Considerations:
 * - Heatmaps work best with 3-20 categories per axis
 * - For high-cardinality dimensions (query, page), add filters
 * - Use TOP N filters to limit data: impressions > 100
 * - Pre-aggregations in Cube.js improve query speed
 */

/**
 * Cube.js Query Example
 *
 * When configured as in Example 1, the component generates:
 *
 * {
 *   "measures": ["GscPerformance7days.clicks"],
 *   "dimensions": [
 *     "GscPerformance7days.device",
 *     "GscPerformance7days.country"
 *   ],
 *   "timeDimensions": [{
 *     "dimension": "GscPerformance7days.date",
 *     "dateRange": { start: "2025-10-15", end: "2025-10-22" }
 *   }]
 * }
 *
 * This returns aggregated data like:
 * [
 *   { "GscPerformance7days.device": "MOBILE", "GscPerformance7days.country": "USA", "GscPerformance7days.clicks": 1523 },
 *   { "GscPerformance7days.device": "MOBILE", "GscPerformance7days.country": "UK", "GscPerformance7days.clicks": 876 },
 *   { "GscPerformance7days.device": "DESKTOP", "GscPerformance7days.country": "USA", "GscPerformance7days.clicks": 2134 },
 *   ...
 * ]
 *
 * Component transforms this to ECharts matrix format:
 * [
 *   [0, 0, 1523],  // MOBILE, USA, 1523 clicks
 *   [0, 1, 876],   // MOBILE, UK, 876 clicks
 *   [1, 0, 2134],  // DESKTOP, USA, 2134 clicks
 *   ...
 * ]
 */

/**
 * Best Practices
 *
 * 1. Dimension Selection:
 *    - Choose low-to-medium cardinality dimensions (3-20 unique values)
 *    - Good: device, country (top N), date ranges
 *    - Avoid: query, page without filters (too many values)
 *
 * 2. Metric Selection:
 *    - Use only one metric (first metric used)
 *    - Works well: clicks, impressions, avgCtr, avgPosition
 *    - Configure format: number, percent, currency
 *
 * 3. Filtering:
 *    - For high-cardinality dimensions, add TOP N filter
 *    - Example: impressions > 100 (keeps top performers)
 *    - Use date ranges to control data volume
 *
 * 4. Color Schemes:
 *    - Sequential: Single color gradient (0 to max)
 *    - Diverging: Two colors (low/high, good/bad)
 *    - Reversed: For metrics where lower is better (position)
 *
 * 5. Performance:
 *    - Aim for 10-400 data points total
 *    - Use Cube.js pre-aggregations for speed
 *    - Avoid cartesian explosions (query x page = 50k rows)
 */
