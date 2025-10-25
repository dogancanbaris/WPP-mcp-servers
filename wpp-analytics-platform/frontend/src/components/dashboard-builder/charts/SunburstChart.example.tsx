'use client';

/**
 * SunburstChart Usage Examples
 *
 * Demonstrates various configurations for hierarchical data visualization
 */

import { SunburstChart } from './SunburstChart';

/**
 * Example 1: Google Ads Campaign Hierarchy
 * Campaign → Ad Group → Keyword breakdown
 */
export function GoogleAdsCampaignHierarchy() {
  return (
    <SunburstChart
      datasource="google_ads_performance"
      dimension="GoogleAds.campaignName"
      breakdownDimension="GoogleAds.adGroupName"
      tertiaryDimension="GoogleAds.keyword"
      metrics={['GoogleAds.clicks']}
      dateRange="Last 30 days"
      title="Campaign Performance Hierarchy"
      showTitle={true}
      sunburstRadius={['20%', '90%']}
      sunburstCenter={['50%', '50%']}
      highlightPolicy="ancestor"
      nodeClick="rootToNode"
      showBreadcrumb={true}
      chartColors={[
        '#5470c6', '#91cc75', '#fac858', '#ee6666',
        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.clicks',
          format: 'number',
          decimals: 0,
          compact: true
        }
      ]}
    />
  );
}

/**
 * Example 2: Cost Breakdown by Campaign Structure
 * Shows spend across campaign hierarchy
 */
export function CostBreakdownHierarchy() {
  return (
    <SunburstChart
      datasource="google_ads_performance"
      dimension="GoogleAds.campaignName"
      breakdownDimension="GoogleAds.adGroupName"
      tertiaryDimension="GoogleAds.keyword"
      metrics={['GoogleAds.cost']}
      dateRange="Last 7 days"
      title="Spend Distribution by Campaign Hierarchy"
      showTitle={true}
      sunburstRadius={['15%', '85%']}
      sunburstCenter={['50%', '50%']}
      highlightPolicy="descendant"
      nodeClick="rootToNode"
      chartColors={[
        '#ff6b6b', '#f06595', '#cc5de8', '#845ef7',
        '#5c7cfa', '#339af0', '#22b8cf', '#20c997'
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.cost',
          format: 'currency',
          decimals: 2,
          compact: true
        }
      ]}
      filters={[
        {
          field: 'GoogleAds.status',
          operator: 'equals',
          values: ['ENABLED']
        }
      ]}
    />
  );
}

/**
 * Example 3: Two-Level Hierarchy (Device → Location)
 * Demonstrates 2-level hierarchy without tertiary dimension
 */
export function DeviceLocationBreakdown() {
  return (
    <SunburstChart
      datasource="google_ads_performance"
      dimension="GoogleAds.device"
      breakdownDimension="GoogleAds.location"
      metrics={['GoogleAds.impressions']}
      dateRange="Last 14 days"
      title="Impressions by Device & Location"
      showTitle={true}
      sunburstRadius={['25%', '80%']}
      sunburstCenter={['50%', '50%']}
      highlightPolicy="self"
      nodeClick="rootToNode"
      chartColors={['#1e88e5', '#43a047', '#fb8c00', '#e53935']}
      metricsConfig={[
        {
          id: 'GoogleAds.impressions',
          format: 'number',
          decimals: 0,
          compact: true
        }
      ]}
    />
  );
}

/**
 * Example 4: Conversion Funnel Hierarchy
 * Campaign → Ad Group → Conversion Type
 */
export function ConversionFunnelHierarchy() {
  return (
    <SunburstChart
      datasource="google_ads_conversions"
      dimension="GoogleAds.campaignName"
      breakdownDimension="GoogleAds.adGroupName"
      tertiaryDimension="GoogleAds.conversionName"
      metrics={['GoogleAds.conversions']}
      dateRange="Last 30 days"
      title="Conversion Distribution by Campaign"
      showTitle={true}
      sunburstRadius={['15%', '90%']}
      sunburstCenter={['50%', '50%']}
      highlightPolicy="ancestor"
      nodeClick="rootToNode"
      showBreadcrumb={true}
      backgroundColor="#fafafa"
      showBorder={true}
      borderColor="#e0e0e0"
      borderRadius={12}
      padding={20}
      chartColors={[
        '#10b981', '#059669', '#047857', '#065f46',
        '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.conversions',
          format: 'number',
          decimals: 1,
          compact: false
        }
      ]}
    />
  );
}

/**
 * Example 5: ROAS Hierarchy Analysis
 * Shows return on ad spend across campaign structure
 */
export function ROASHierarchyAnalysis() {
  return (
    <SunburstChart
      datasource="google_ads_performance"
      dimension="GoogleAds.campaignName"
      breakdownDimension="GoogleAds.adGroupName"
      metrics={['GoogleAds.conversionValue']}
      dateRange="Last 60 days"
      title="Revenue Distribution by Campaign & Ad Group"
      showTitle={true}
      titleFontSize="18"
      titleFontWeight="700"
      titleColor="#1f2937"
      sunburstRadius={['20%', '85%']}
      sunburstCenter={['50%', '52%']}
      highlightPolicy="ancestor"
      nodeClick="rootToNode"
      showBreadcrumb={true}
      backgroundColor="#ffffff"
      showBorder={true}
      borderColor="#d1d5db"
      borderWidth={2}
      borderRadius={16}
      showShadow={true}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowBlur={20}
      padding={24}
      chartColors={[
        '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
        '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.conversionValue',
          format: 'currency',
          decimals: 0,
          compact: true
        }
      ]}
      filters={[
        {
          field: 'GoogleAds.conversionValue',
          operator: 'gt',
          values: ['0']
        }
      ]}
    />
  );
}

/**
 * Example 6: Custom Level Styling
 * Advanced configuration with custom level styling
 */
export function CustomStyledSunburst() {
  const customLevels = [
    {
      // Root - invisible
      itemStyle: { borderWidth: 0 }
    },
    {
      // Level 1: Campaigns (large bold text)
      r0: '20%',
      r: '40%',
      itemStyle: {
        borderWidth: 3,
        borderColor: '#ffffff',
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)'
      },
      label: {
        rotate: 'tangential',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    {
      // Level 2: Ad Groups (medium text)
      r0: '40%',
      r: '70%',
      itemStyle: {
        borderWidth: 2,
        borderColor: '#ffffff'
      },
      label: {
        align: 'right',
        fontSize: 12,
        color: '#ffffff'
      }
    },
    {
      // Level 3: Keywords (small text, outside)
      r0: '70%',
      r: '88%',
      itemStyle: {
        borderWidth: 4,
        borderColor: '#ffffff',
        borderRadius: 2
      },
      label: {
        position: 'outside',
        padding: 4,
        fontSize: 10,
        color: '#4b5563'
      }
    }
  ];

  return (
    <SunburstChart
      datasource="google_ads_performance"
      dimension="GoogleAds.campaignName"
      breakdownDimension="GoogleAds.adGroupName"
      tertiaryDimension="GoogleAds.keyword"
      metrics={['GoogleAds.clicks']}
      dateRange="Last 30 days"
      title="Custom Styled Hierarchy"
      showTitle={true}
      sunburstRadius={['20%', '88%']}
      sunburstCenter={['50%', '50%']}
      levels={customLevels}
      highlightPolicy="ancestor"
      nodeClick="rootToNode"
      showBreadcrumb={true}
      chartColors={[
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.clicks',
          format: 'number',
          decimals: 0,
          compact: true
        }
      ]}
    />
  );
}

/**
 * Example 7: Minimal Sunburst
 * Clean, simple configuration for dashboards
 */
export function MinimalSunburst() {
  return (
    <SunburstChart
      datasource="google_ads_performance"
      dimension="GoogleAds.campaignName"
      breakdownDimension="GoogleAds.adGroupName"
      metrics={['GoogleAds.impressions']}
      dateRange="Last 7 days"
      title=""
      showTitle={false}
      sunburstRadius={['10%', '95%']}
      sunburstCenter={['50%', '50%']}
      highlightPolicy="self"
      nodeClick={false}
      showBreadcrumb={false}
      backgroundColor="transparent"
      showBorder={false}
      padding={0}
      chartColors={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']}
      metricsConfig={[
        {
          id: 'GoogleAds.impressions',
          format: 'number',
          decimals: 0,
          compact: true
        }
      ]}
    />
  );
}

/**
 * Demo Dashboard: Multiple Sunburst Views
 */
export function SunburstDashboardDemo() {
  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      <div className="h-[500px]">
        <GoogleAdsCampaignHierarchy />
      </div>
      <div className="h-[500px]">
        <CostBreakdownHierarchy />
      </div>
      <div className="h-[500px]">
        <ConversionFunnelHierarchy />
      </div>
      <div className="h-[500px]">
        <ROASHierarchyAnalysis />
      </div>
    </div>
  );
}
