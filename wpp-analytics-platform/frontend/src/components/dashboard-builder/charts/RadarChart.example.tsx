/**
 * RadarChart Component - Usage Examples
 *
 * This file demonstrates various ways to use the RadarChart component
 * connected to Cube.js semantic layer.
 */

import { RadarChart } from './RadarChart';

/**
 * Example 1: Basic Radar Chart - Single Metric Comparison
 *
 * Shows clicks across different search queries
 */
export function BasicRadarExample() {
  return (
    <RadarChart
      // Data configuration
      datasource="gsc_performance"
      dimension="GSCPerformance.query"
      metrics={["GSCPerformance.clicks"]}

      // Title
      title="Search Query Performance"
      showTitle={true}

      // Date range (last 30 days)
      dateRange={{
        start: "2024-09-22",
        end: "2024-10-22"
      }}

      // Styling
      showLegend={true}
      chartColors={['#5470c6']}
    />
  );
}

/**
 * Example 2: Multi-Metric Radar Chart
 *
 * Compares multiple metrics (clicks, impressions, CTR) across queries
 */
export function MultiMetricRadarExample() {
  return (
    <RadarChart
      datasource="gsc_performance"
      dimension="GSCPerformance.query"
      metrics={[
        "GSCPerformance.clicks",
        "GSCPerformance.impressions",
        "GSCPerformance.ctr"
      ]}

      title="Multi-Metric Query Analysis"

      // Custom metric formatting
      metricsConfig={[
        {
          id: "GSCPerformance.clicks",
          name: "Clicks",
          format: "number",
          decimals: 0,
          compact: true,
          alignment: "right",
          textColor: "#111",
          fontWeight: "600",
          showComparison: false,
          showBars: false
        },
        {
          id: "GSCPerformance.ctr",
          name: "CTR",
          format: "percent",
          decimals: 2,
          compact: false,
          alignment: "right",
          textColor: "#111",
          fontWeight: "600",
          showComparison: false,
          showBars: false
        }
      ]}

      showLegend={true}
      chartColors={['#5470c6', '#91cc75', '#fac858']}
    />
  );
}

/**
 * Example 3: Breakdown Radar Chart
 *
 * Compares clicks across queries, broken down by device type
 */
export function BreakdownRadarExample() {
  return (
    <RadarChart
      datasource="gsc_performance"
      dimension="GSCPerformance.query"
      breakdownDimension="GSCPerformance.device"
      metrics={["GSCPerformance.clicks"]}

      title="Query Performance by Device"

      // Filters
      filters={[
        {
          field: "GSCPerformance.impressions",
          operator: "gt",
          values: ["1000"]
        }
      ]}

      showLegend={true}
      chartColors={['#5470c6', '#91cc75', '#fac858']}
    />
  );
}

/**
 * Example 4: Google Ads Campaign Performance Radar
 *
 * Multi-dimensional analysis of campaign metrics
 */
export function GoogleAdsCampaignRadarExample() {
  return (
    <RadarChart
      datasource="google_ads"
      dimension="GoogleAds.campaignName"
      metrics={[
        "GoogleAds.impressions",
        "GoogleAds.clicks",
        "GoogleAds.cost",
        "GoogleAds.conversions",
        "GoogleAds.ctr"
      ]}

      title="Campaign Performance Radar"

      dateRange={{
        start: "2024-09-01",
        end: "2024-10-22"
      }}

      metricsConfig={[
        {
          id: "GoogleAds.cost",
          name: "Cost",
          format: "currency",
          decimals: 2,
          compact: true,
          alignment: "right",
          textColor: "#111",
          fontWeight: "600",
          showComparison: false,
          showBars: false
        },
        {
          id: "GoogleAds.ctr",
          name: "CTR",
          format: "percent",
          decimals: 2,
          compact: false,
          alignment: "right",
          textColor: "#111",
          fontWeight: "600",
          showComparison: false,
          showBars: false
        }
      ]}

      // Custom styling
      backgroundColor="#f9fafb"
      showBorder={true}
      borderColor="#e5e7eb"
      borderRadius={12}
      showShadow={true}
      shadowColor="#00000015"
      shadowBlur={20}
      padding={24}

      showLegend={true}
      chartColors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
    />
  );
}

/**
 * Example 5: Analytics Page Performance Radar
 *
 * Compare page metrics (sessions, bounce rate, avg time) across landing pages
 */
export function AnalyticsPageRadarExample() {
  return (
    <RadarChart
      datasource="ga4_analytics"
      dimension="GA4.landingPage"
      metrics={[
        "GA4.sessions",
        "GA4.bounceRate",
        "GA4.avgSessionDuration",
        "GA4.conversions"
      ]}

      title="Landing Page Performance Analysis"

      filters={[
        {
          field: "GA4.sessions",
          operator: "gt",
          values: ["100"]
        }
      ]}

      metricsConfig={[
        {
          id: "GA4.bounceRate",
          name: "Bounce Rate",
          format: "percent",
          decimals: 1,
          compact: false,
          alignment: "right",
          textColor: "#111",
          fontWeight: "600",
          showComparison: false,
          showBars: false
        },
        {
          id: "GA4.avgSessionDuration",
          name: "Avg Session Duration",
          format: "duration",
          decimals: 0,
          compact: false,
          alignment: "right",
          textColor: "#111",
          fontWeight: "600",
          showComparison: false,
          showBars: false
        }
      ]}

      showLegend={true}
      chartColors={['#5470c6', '#91cc75', '#fac858', '#ee6666']}
    />
  );
}

/**
 * Example 6: Real-time Data with Auto-refresh
 *
 * Shows today's data with periodic updates
 */
export function RealTimeRadarExample() {
  // In a real implementation, you would add useEffect for auto-refresh
  const today = new Date().toISOString().split('T')[0];

  return (
    <RadarChart
      datasource="gsc_performance"
      dimension="GSCPerformance.query"
      metrics={["GSCPerformance.clicks", "GSCPerformance.impressions"]}

      title="Today's Search Performance (Live)"

      dateRange={{
        start: today,
        end: today
      }}

      showLegend={true}

      // Minimal styling for dashboard widget
      backgroundColor="transparent"
      showBorder={false}
      padding={8}
    />
  );
}

/**
 * Example 7: Competitive Analysis Radar
 *
 * Compare your site vs competitors across multiple dimensions
 */
export function CompetitiveRadarExample() {
  return (
    <RadarChart
      datasource="competitive_analysis"
      dimension="CompetitiveMetrics.metric"
      breakdownDimension="CompetitiveMetrics.domain"
      metrics={["CompetitiveMetrics.score"]}

      title="Competitive Position Analysis"

      // Custom color scheme for brands
      chartColors={[
        '#0066cc', // Your brand
        '#ff6b6b', // Competitor 1
        '#4ecdc4', // Competitor 2
        '#ffd93d', // Competitor 3
        '#6c5ce7'  // Competitor 4
      ]}

      showLegend={true}

      // Premium card styling
      backgroundColor="#ffffff"
      showBorder={true}
      borderColor="#e5e7eb"
      borderRadius={16}
      showShadow={true}
      shadowColor="#00000020"
      shadowBlur={24}
      padding={32}

      titleFontSize="20"
      titleFontWeight="700"
      titleColor="#1f2937"
    />
  );
}
