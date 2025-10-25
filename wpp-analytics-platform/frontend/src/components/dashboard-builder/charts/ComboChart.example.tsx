/**
 * ComboChart Examples - Real-World Use Cases
 *
 * Demonstrates mixing bar and line series for comprehensive data visualization
 */
'use client';

import React from 'react';
import { ComboChart } from './ComboChart';

/**
 * EXAMPLE 1: Google Ads - Volume vs Rate Metrics
 *
 * Shows clicks (bars) and CTR (line) over time
 * Perfect for seeing both absolute performance and efficiency
 */
export function GoogleAdsClicksAndCTR() {
  return (
    <ComboChart
      title="Clicks vs CTR - Last 30 Days"
      dimension="GoogleAds.date"
      metrics={[
        'GoogleAds.clicks',
        'GoogleAds.ctr'
      ]}
      seriesTypes={['bar', 'line']}
      yAxisAssignment={['left', 'right']}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GoogleAds.clicks', format: 'number', decimals: 0 },
        { metricId: 'GoogleAds.ctr', format: 'percent', decimals: 2 }
      ]}
      showLegend={true}
      chartColors={['#5470c6', '#91cc75']}
    />
  );
}

/**
 * EXAMPLE 2: Search Console - Impressions, Clicks, and Position
 *
 * Shows volume metrics (impressions, clicks) as bars
 * Shows position as line (lower is better)
 */
export function GSCPerformanceOverview() {
  return (
    <ComboChart
      title="GSC Performance Overview"
      dimension="GSC.date"
      metrics={[
        'GSC.impressions',
        'GSC.clicks',
        'GSC.position'
      ]}
      seriesTypes={['bar', 'bar', 'line']}
      yAxisAssignment={['left', 'left', 'right']}
      stackBars={false}
      smoothLines={true}
      dateRange={{
        start: '2025-09-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GSC.impressions', format: 'number', decimals: 0 },
        { metricId: 'GSC.clicks', format: 'number', decimals: 0 },
        { metricId: 'GSC.position', format: 'number', decimals: 1 }
      ]}
      chartColors={['#5470c6', '#91cc75', '#ee6666']}
    />
  );
}

/**
 * EXAMPLE 3: Campaign Performance - Cost, Conversions, and CPA
 *
 * Shows cost and conversions as stacked bars
 * Shows CPA as line overlay
 */
export function CampaignCostAndCPA() {
  return (
    <ComboChart
      title="Top Campaigns - Cost, Conversions & CPA"
      dimension="GoogleAds.campaignName"
      metrics={[
        'GoogleAds.cost',
        'GoogleAds.conversions',
        'GoogleAds.costPerConversion'
      ]}
      seriesTypes={['bar', 'bar', 'line']}
      yAxisAssignment={['left', 'left', 'right']}
      stackBars={true}
      smoothLines={false}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GoogleAds.cost', format: 'currency', decimals: 2 },
        { metricId: 'GoogleAds.conversions', format: 'number', decimals: 0 },
        { metricId: 'GoogleAds.costPerConversion', format: 'currency', decimals: 2 }
      ]}
      chartColors={['#5470c6', '#91cc75', '#fac858']}
    />
  );
}

/**
 * EXAMPLE 4: Multi-Platform Search Analysis
 *
 * Combines paid clicks (bar), organic clicks (bar), and ROAS (line)
 * Shows holistic search performance
 */
export function HolisticSearchPerformance() {
  return (
    <ComboChart
      title="Paid + Organic Search Performance"
      dimension="HolisticSearch.searchTerm"
      metrics={[
        'HolisticSearch.totalPaidClicks',
        'HolisticSearch.totalOrganicClicks',
        'HolisticSearch.roas'
      ]}
      seriesTypes={['bar', 'bar', 'line']}
      yAxisAssignment={['left', 'left', 'right']}
      stackBars={false}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'HolisticSearch.totalPaidClicks', format: 'number', decimals: 0 },
        { metricId: 'HolisticSearch.totalOrganicClicks', format: 'number', decimals: 0 },
        { metricId: 'HolisticSearch.roas', format: 'percent', decimals: 1 }
      ]}
      chartColors={['#5470c6', '#91cc75', '#ee6666']}
    />
  );
}

/**
 * EXAMPLE 5: Daily Budget Pacing
 *
 * Shows daily spend (bar) vs budget utilization (line)
 * Helps identify pacing issues
 */
export function BudgetPacingAnalysis() {
  return (
    <ComboChart
      title="Budget Pacing - Daily Spend vs Utilization"
      dimension="GoogleAds.date"
      metrics={[
        'GoogleAds.cost',
        'GoogleAds.budgetUtilization'
      ]}
      seriesTypes={['bar', 'line']}
      yAxisAssignment={['left', 'right']}
      smoothLines={true}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GoogleAds.cost', format: 'currency', decimals: 2 },
        { metricId: 'GoogleAds.budgetUtilization', format: 'percent', decimals: 1 }
      ]}
      chartColors={['#5470c6', '#ee6666']}
    />
  );
}

/**
 * EXAMPLE 6: Quality Score Trends
 *
 * Shows impressions (bar) and avg quality score (line)
 * Tracks quality improvements over time
 */
export function QualityScoreTrends() {
  return (
    <ComboChart
      title="Impressions vs Quality Score Over Time"
      dimension="GoogleAds.date"
      metrics={[
        'GoogleAds.impressions',
        'GoogleAds.avgQualityScore'
      ]}
      seriesTypes={['bar', 'line']}
      yAxisAssignment={['left', 'right']}
      smoothLines={true}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GoogleAds.impressions', format: 'number', decimals: 0 },
        { metricId: 'GoogleAds.avgQualityScore', format: 'number', decimals: 2 }
      ]}
      chartColors={['#5470c6', '#91cc75']}
      showDataLabels={false}
    />
  );
}

/**
 * EXAMPLE 7: Device Performance Comparison
 *
 * Shows conversions (bars) by device with conversion rate (line)
 */
export function DevicePerformance() {
  return (
    <ComboChart
      title="Conversions by Device Type"
      dimension="GoogleAds.device"
      metrics={[
        'GoogleAds.conversions',
        'GoogleAds.conversionRate'
      ]}
      seriesTypes={['bar', 'line']}
      yAxisAssignment={['left', 'right']}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GoogleAds.conversions', format: 'number', decimals: 0 },
        { metricId: 'GoogleAds.conversionRate', format: 'percent', decimals: 2 }
      ]}
      chartColors={['#5470c6', '#91cc75']}
    />
  );
}

/**
 * EXAMPLE 8: Landing Page Performance
 *
 * Shows sessions (bar), bounce rate (line), and conversions (bar)
 * Three-metric combo for comprehensive page analysis
 */
export function LandingPagePerformance() {
  return (
    <ComboChart
      title="Top Landing Pages - Sessions, Bounce Rate & Conversions"
      dimension="Analytics.landingPage"
      metrics={[
        'Analytics.sessions',
        'Analytics.bounceRate',
        'Analytics.conversions'
      ]}
      seriesTypes={['bar', 'line', 'bar']}
      yAxisAssignment={['left', 'right', 'left']}
      stackBars={false}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'Analytics.sessions', format: 'number', decimals: 0 },
        { metricId: 'Analytics.bounceRate', format: 'percent', decimals: 1 },
        { metricId: 'Analytics.conversions', format: 'number', decimals: 0 }
      ]}
      chartColors={['#5470c6', '#ee6666', '#91cc75']}
    />
  );
}

/**
 * EXAMPLE 9: Ad Group Performance with Labels
 *
 * Shows cost (bar) and ROAS (line) with data labels enabled
 */
export function AdGroupPerformanceWithLabels() {
  return (
    <ComboChart
      title="Top Ad Groups - Cost vs ROAS"
      dimension="GoogleAds.adGroupName"
      metrics={[
        'GoogleAds.cost',
        'GoogleAds.roas'
      ]}
      seriesTypes={['bar', 'line']}
      yAxisAssignment={['left', 'right']}
      smoothLines={false}
      showDataLabels={true}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GoogleAds.cost', format: 'currency', decimals: 0 },
        { metricId: 'GoogleAds.roas', format: 'number', decimals: 2 }
      ]}
      chartColors={['#5470c6', '#91cc75']}
    />
  );
}

/**
 * EXAMPLE 10: Hour-of-Day Performance
 *
 * Shows clicks (bar) and conversion rate (line) by hour
 * Identifies optimal bidding times
 */
export function HourOfDayPerformance() {
  return (
    <ComboChart
      title="Performance by Hour of Day"
      dimension="GoogleAds.hour"
      metrics={[
        'GoogleAds.clicks',
        'GoogleAds.conversionRate'
      ]}
      seriesTypes={['bar', 'line']}
      yAxisAssignment={['left', 'right']}
      smoothLines={true}
      dateRange={{
        start: '2025-10-01',
        end: '2025-10-22'
      }}
      metricsConfig={[
        { metricId: 'GoogleAds.clicks', format: 'number', decimals: 0 },
        { metricId: 'GoogleAds.conversionRate', format: 'percent', decimals: 2 }
      ]}
      chartColors={['#5470c6', '#ee6666']}
    />
  );
}

/**
 * Example Dashboard showcasing all combo chart patterns
 */
export function ComboChartShowcase() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">ComboChart Examples</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example 1 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <GoogleAdsClicksAndCTR />
        </div>

        {/* Example 2 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <GSCPerformanceOverview />
        </div>

        {/* Example 3 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <CampaignCostAndCPA />
        </div>

        {/* Example 4 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <HolisticSearchPerformance />
        </div>

        {/* Example 5 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <BudgetPacingAnalysis />
        </div>

        {/* Example 6 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <QualityScoreTrends />
        </div>

        {/* Example 7 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <DevicePerformance />
        </div>

        {/* Example 8 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <LandingPagePerformance />
        </div>

        {/* Example 9 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <AdGroupPerformanceWithLabels />
        </div>

        {/* Example 10 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <HourOfDayPerformance />
        </div>
      </div>
    </div>
  );
}

/**
 * CONFIGURATION GUIDE:
 *
 * seriesTypes: ['bar', 'line', 'bar']
 * - Defines chart type for each metric in order
 * - 'bar' for volume/absolute metrics (clicks, cost, conversions)
 * - 'line' for rate/ratio metrics (CTR, conversion rate, position)
 *
 * yAxisAssignment: ['left', 'right', 'left']
 * - Maps each metric to left or right y-axis
 * - Use dual axes when value scales differ significantly (clicks vs CTR)
 * - Left axis typically for primary metrics
 * - Right axis for secondary/rate metrics
 *
 * smoothLines: true/false
 * - true: Smooth bezier curves (better for trends)
 * - false: Angular lines (better for precise values)
 *
 * stackBars: true/false
 * - true: Stack bar series (for part-to-whole relationships)
 * - false: Side-by-side bars (for comparisons)
 *
 * showDataLabels: true/false
 * - true: Display values on bars/points
 * - false: Clean appearance (use tooltips for values)
 *
 * barWidth: '40%', '50%', '60%', etc.
 * - Controls bar thickness
 * - Narrower for more categories
 * - Wider for fewer categories
 */
