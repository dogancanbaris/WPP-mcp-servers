/**
 * ScatterChart Usage Examples
 *
 * This file demonstrates various ways to use the ScatterChart component
 * with Cube.js data integration.
 */

import { ScatterChart } from './ScatterChart';

// ============================================================================
// Example 1: Basic Scatter Plot (Single Series)
// ============================================================================
export function Example1_BasicScatterPlot() {
  return (
    <ScatterChart
      title="Campaign Performance: Impressions vs Clicks"
      metrics={[
        'GoogleAds.impressions',  // X-axis
        'GoogleAds.clicks'         // Y-axis
      ]}
      filters={[
        {
          field: 'GoogleAds.date',
          operator: 'inDateRange',
          values: ['last 30 days']
        }
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.impressions',
          format: 'number',
          compact: true,
          decimals: 1
        },
        {
          id: 'GoogleAds.clicks',
          format: 'number',
          compact: false,
          decimals: 0
        }
      ]}
      showLegend={false}
    />
  );
}

// ============================================================================
// Example 2: Grouped Scatter Plot (Multiple Series by Campaign)
// ============================================================================
export function Example2_GroupedByDimension() {
  return (
    <ScatterChart
      title="Multi-Campaign Performance Analysis"
      metrics={[
        'GoogleAds.impressions',
        'GoogleAds.clicks'
      ]}
      breakdownDimension="GoogleAds.campaignName"
      filters={[
        {
          field: 'GoogleAds.date',
          operator: 'inDateRange',
          values: ['last 7 days']
        },
        {
          field: 'GoogleAds.status',
          operator: 'equals',
          values: ['ENABLED']
        }
      ]}
      showLegend={true}
      chartColors={['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']}
    />
  );
}

// ============================================================================
// Example 3: Cost Efficiency Analysis
// ============================================================================
export function Example3_CostEfficiency() {
  return (
    <ScatterChart
      title="Cost vs Conversions by Ad Group"
      metrics={[
        'GoogleAds.cost',
        'GoogleAds.conversions'
      ]}
      breakdownDimension="GoogleAds.adGroupName"
      filters={[
        {
          field: 'GoogleAds.campaignId',
          operator: 'equals',
          values: ['123456789']
        },
        {
          field: 'GoogleAds.conversions',
          operator: 'gt',
          values: ['0']
        }
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.cost',
          format: 'currency',
          decimals: 2
        },
        {
          id: 'GoogleAds.conversions',
          format: 'number',
          decimals: 0
        }
      ]}
      backgroundColor="#f9fafb"
      borderRadius={12}
      showShadow={true}
    />
  );
}

// ============================================================================
// Example 4: Search Console Performance (Organic Position vs CTR)
// ============================================================================
export function Example4_OrganicPerformance() {
  return (
    <ScatterChart
      title="Organic Position vs Click-Through Rate"
      metrics={[
        'GSCPerformance.averagePosition',
        'GSCPerformance.ctr'
      ]}
      breakdownDimension="GSCPerformance.device"
      filters={[
        {
          field: 'GSCPerformance.date',
          operator: 'inDateRange',
          values: ['last 90 days']
        },
        {
          field: 'GSCPerformance.clicks',
          operator: 'gte',
          values: ['10']
        }
      ]}
      metricsConfig={[
        {
          id: 'GSCPerformance.averagePosition',
          format: 'number',
          decimals: 1
        },
        {
          id: 'GSCPerformance.ctr',
          format: 'percent',
          decimals: 2
        }
      ]}
      showLegend={true}
      chartColors={['#3b82f6', '#10b981', '#f59e0b']} // Blue, Green, Amber for Desktop, Mobile, Tablet
    />
  );
}

// ============================================================================
// Example 5: Quality Score Analysis
// ============================================================================
export function Example5_QualityScore() {
  return (
    <ScatterChart
      title="Quality Score vs CTR Correlation"
      metrics={[
        'GoogleAds.qualityScore',
        'GoogleAds.ctr'
      ]}
      breakdownDimension="GoogleAds.campaignType"
      filters={[
        {
          field: 'GoogleAds.qualityScore',
          operator: 'gt',
          values: ['0']
        },
        {
          field: 'GoogleAds.impressions',
          operator: 'gte',
          values: ['1000']
        }
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.qualityScore',
          format: 'number',
          decimals: 1
        },
        {
          id: 'GoogleAds.ctr',
          format: 'percent',
          decimals: 2
        }
      ]}
    />
  );
}

// ============================================================================
// Example 6: Conversion Rate vs Average CPC
// ============================================================================
export function Example6_ConversionEfficiency() {
  return (
    <ScatterChart
      title="Conversion Rate vs Cost Per Click"
      metrics={[
        'GoogleAds.conversionRate',
        'GoogleAds.avgCpc'
      ]}
      breakdownDimension="GoogleAds.campaignName"
      filters={[
        {
          field: 'GoogleAds.conversions',
          operator: 'gt',
          values: ['0']
        }
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.conversionRate',
          format: 'percent',
          decimals: 2
        },
        {
          id: 'GoogleAds.avgCpc',
          format: 'currency',
          decimals: 2
        }
      ]}
      showLegend={true}
    />
  );
}

// ============================================================================
// Example 7: Styled Container
// ============================================================================
export function Example7_StyledContainer() {
  return (
    <ScatterChart
      title="Premium Campaign Analysis"
      metrics={[
        'GoogleAds.impressions',
        'GoogleAds.clicks'
      ]}
      breakdownDimension="GoogleAds.campaignName"

      // Title styling
      titleFontFamily="Inter"
      titleFontSize="18"
      titleFontWeight="700"
      titleColor="#1f2937"
      titleAlignment="center"

      // Container styling
      backgroundColor="#ffffff"
      showBorder={true}
      borderColor="#d1d5db"
      borderWidth={2}
      borderRadius={16}
      showShadow={true}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowBlur={20}
      padding={24}

      // Chart styling
      chartColors={['#8b5cf6', '#ec4899', '#f59e0b', '#10b981']}
      showLegend={true}
    />
  );
}

// ============================================================================
// Example 8: Multi-Platform Search Comparison
// ============================================================================
export function Example8_MultiPlatformSearch() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Paid Search */}
      <ScatterChart
        title="Paid Search: Impressions vs Clicks"
        metrics={[
          'GoogleAds.impressions',
          'GoogleAds.clicks'
        ]}
        breakdownDimension="GoogleAds.campaignType"
        filters={[
          {
            field: 'GoogleAds.date',
            operator: 'inDateRange',
            values: ['last 30 days']
          }
        ]}
        chartColors={['#dc2626', '#ea580c', '#d97706']}
      />

      {/* Organic Search */}
      <ScatterChart
        title="Organic Search: Position vs CTR"
        metrics={[
          'GSCPerformance.averagePosition',
          'GSCPerformance.ctr'
        ]}
        breakdownDimension="GSCPerformance.device"
        filters={[
          {
            field: 'GSCPerformance.date',
            operator: 'inDateRange',
            values: ['last 30 days']
          }
        ]}
        chartColors={['#2563eb', '#7c3aed', '#db2777']}
      />
    </div>
  );
}

// ============================================================================
// Example 9: Full Dashboard with 4 Scatter Plots
// ============================================================================
export function Example9_FullDashboard() {
  const dateFilter = {
    field: 'GoogleAds.date',
    operator: 'inDateRange',
    values: ['last 30 days']
  };

  const enabledFilter = {
    field: 'GoogleAds.status',
    operator: 'equals',
    values: ['ENABLED']
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Traffic Volume */}
      <ScatterChart
        title="Traffic Volume: Impressions vs Clicks"
        metrics={['GoogleAds.impressions', 'GoogleAds.clicks']}
        breakdownDimension="GoogleAds.campaignType"
        filters={[dateFilter, enabledFilter]}
        metricsConfig={[
          { id: 'GoogleAds.impressions', format: 'number', compact: true },
          { id: 'GoogleAds.clicks', format: 'number', compact: true }
        ]}
      />

      {/* Cost Efficiency */}
      <ScatterChart
        title="Cost Efficiency: Spend vs Conversions"
        metrics={['GoogleAds.cost', 'GoogleAds.conversions']}
        breakdownDimension="GoogleAds.campaignName"
        filters={[dateFilter, enabledFilter]}
        metricsConfig={[
          { id: 'GoogleAds.cost', format: 'currency', decimals: 0 },
          { id: 'GoogleAds.conversions', format: 'number', decimals: 0 }
        ]}
      />

      {/* Quality Analysis */}
      <ScatterChart
        title="Quality: CTR vs Quality Score"
        metrics={['GoogleAds.ctr', 'GoogleAds.qualityScore']}
        breakdownDimension="GoogleAds.adGroupName"
        filters={[dateFilter, enabledFilter]}
        metricsConfig={[
          { id: 'GoogleAds.ctr', format: 'percent', decimals: 2 },
          { id: 'GoogleAds.qualityScore', format: 'number', decimals: 1 }
        ]}
      />

      {/* Conversion Efficiency */}
      <ScatterChart
        title="Efficiency: Conversion Rate vs CPC"
        metrics={['GoogleAds.conversionRate', 'GoogleAds.avgCpc']}
        breakdownDimension="GoogleAds.campaignName"
        filters={[dateFilter, enabledFilter]}
        metricsConfig={[
          { id: 'GoogleAds.conversionRate', format: 'percent', decimals: 2 },
          { id: 'GoogleAds.avgCpc', format: 'currency', decimals: 2 }
        ]}
      />
    </div>
  );
}

// ============================================================================
// Example 10: Dynamic Configuration (User-Controlled)
// ============================================================================
export function Example10_DynamicConfig() {
  // In a real app, these would be state variables controlled by UI
  const selectedMetrics = ['GoogleAds.impressions', 'GoogleAds.clicks'];
  const selectedBreakdown = 'GoogleAds.campaignName';
  const selectedDateRange = 'last 30 days';

  return (
    <ScatterChart
      title="Custom Analysis"
      metrics={selectedMetrics}
      breakdownDimension={selectedBreakdown}
      filters={[
        {
          field: 'GoogleAds.date',
          operator: 'inDateRange',
          values: [selectedDateRange]
        }
      ]}
      showLegend={true}
    />
  );
}
