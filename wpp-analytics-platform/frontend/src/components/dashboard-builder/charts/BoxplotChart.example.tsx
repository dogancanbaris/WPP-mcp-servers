/**
 * BoxplotChart Examples - Cube.js Integration Use Cases
 *
 * This file demonstrates various statistical analysis scenarios using
 * the BoxplotChart component with real marketing data.
 */
'use client';

import { BoxplotChart } from './BoxplotChart';

/**
 * Example 1: CPC Distribution Across Campaigns
 *
 * BUSINESS QUESTION:
 * "How does Cost-Per-Click vary across my campaigns? Are there campaigns
 * with unusually high or low CPCs?"
 *
 * INSIGHTS PROVIDED:
 * - Median CPC per campaign (typical spend per click)
 * - CPC spread (Q1 to Q3 shows where 50% of values fall)
 * - Outlier clicks (unusually expensive or cheap clicks)
 * - Campaign budget efficiency comparison
 */
export function CPCDistributionExample() {
  return (
    <BoxplotChart
      title="CPC Distribution by Campaign"
      datasource="GoogleAds"
      dimension="GoogleAds.campaignName"
      metrics={['GoogleAds.cpc']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
      filters={[
        {
          field: 'GoogleAds.campaignStatus',
          operator: 'equals',
          values: ['ENABLED']
        }
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.cpc',
          name: 'Cost Per Click',
          format: 'currency',
          decimals: 2,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '500',
          showComparison: false,
          showBars: false
        }
      ]}
      showOutliers={true}
      outlierColor="#ee6666"
      boxWidth="70%"
    />
  );
}

/**
 * Example 2: Organic Position Ranges by Query
 *
 * BUSINESS QUESTION:
 * "What's the typical position range for my top search queries?
 * Are positions stable or volatile?"
 *
 * INSIGHTS PROVIDED:
 * - Position stability (narrow box = stable rankings)
 * - Ranking volatility (wide box = fluctuating positions)
 * - Median position (typical rank)
 * - Best and worst positions achieved
 */
export function PositionRangeExample() {
  return (
    <BoxplotChart
      title="Position Range - Top 10 Queries"
      datasource="SearchConsole"
      dimension="SearchConsole.query"
      metrics={['SearchConsole.position']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
      filters={[
        {
          field: 'SearchConsole.country',
          operator: 'equals',
          values: ['USA']
        }
      ]}
      metricsConfig={[
        {
          id: 'SearchConsole.position',
          name: 'Search Position',
          format: 'number',
          decimals: 1,
          compact: false,
          alignment: 'center',
          textColor: '#111827',
          fontWeight: '500',
          showComparison: false,
          showBars: false
        }
      ]}
      showOutliers={true}
      outlierColor="#fac858"
      boxWidth="60%"
      chartColors={['#3ba272', '#91cc75', '#fac858', '#ee6666']}
    />
  );
}

/**
 * Example 3: CTR Distribution by Device Type
 *
 * BUSINESS QUESTION:
 * "How does Click-Through Rate vary across different devices?
 * Are mobile users more likely to click?"
 *
 * INSIGHTS PROVIDED:
 * - Median CTR by device (typical user behavior)
 * - CTR consistency (box width shows variability)
 * - Device performance comparison
 * - Outlier ads (exceptionally high/low CTR)
 */
export function CTRByDeviceExample() {
  return (
    <BoxplotChart
      title="CTR Distribution - Desktop vs Mobile vs Tablet"
      datasource="GoogleAds"
      dimension="GoogleAds.device"
      metrics={['GoogleAds.ctr']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
      metricsConfig={[
        {
          id: 'GoogleAds.ctr',
          name: 'Click-Through Rate',
          format: 'percent',
          decimals: 2,
          compact: false,
          alignment: 'center',
          textColor: '#111827',
          fontWeight: '500',
          showComparison: false,
          showBars: false
        }
      ]}
      showOutliers={true}
      outlierColor="#73c0de"
      boxWidth="75%"
      chartColors={['#5470c6']}
    />
  );
}

/**
 * Example 4: Conversion Rate Spread by Landing Page
 *
 * BUSINESS QUESTION:
 * "Which landing pages have consistent conversion rates vs volatile performance?"
 *
 * INSIGHTS PROVIDED:
 * - Median conversion rate per page
 * - Performance consistency (narrow = reliable, wide = unpredictable)
 * - Best/worst conversion sessions
 * - Pages needing optimization (low median + high outliers)
 */
export function ConversionRateByPageExample() {
  return (
    <BoxplotChart
      title="Conversion Rate Distribution - Top Landing Pages"
      datasource="Analytics"
      dimension="Analytics.landingPage"
      metrics={['Analytics.conversionRate']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
      filters={[
        {
          field: 'Analytics.sessions',
          operator: 'gt',
          values: ['100'] // Only pages with significant traffic
        }
      ]}
      metricsConfig={[
        {
          id: 'Analytics.conversionRate',
          name: 'Conversion Rate',
          format: 'percent',
          decimals: 2,
          compact: false,
          alignment: 'center',
          textColor: '#111827',
          fontWeight: '500',
          showComparison: false,
          showBars: false
        }
      ]}
      showOutliers={true}
      outlierColor="#ee6666"
      boxWidth="65%"
      chartColors={['#91cc75']}
    />
  );
}

/**
 * Example 5: Quality Score Distribution by Ad Group
 *
 * BUSINESS QUESTION:
 * "What's the quality score range across my ad groups?
 * Which groups need optimization?"
 *
 * INSIGHTS PROVIDED:
 * - Median quality score (typical keyword quality)
 * - Quality consistency across keywords
 * - Underperforming keywords (outliers below Q1)
 * - Ad groups needing attention
 */
export function QualityScoreExample() {
  return (
    <BoxplotChart
      title="Quality Score Distribution by Ad Group"
      datasource="GoogleAds"
      dimension="GoogleAds.adGroupName"
      metrics={['GoogleAds.qualityScore']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
      filters={[
        {
          field: 'GoogleAds.impressions',
          operator: 'gt',
          values: ['50'] // Only ad groups with activity
        }
      ]}
      metricsConfig={[
        {
          id: 'GoogleAds.qualityScore',
          name: 'Quality Score',
          format: 'number',
          decimals: 1,
          compact: false,
          alignment: 'center',
          textColor: '#111827',
          fontWeight: '500',
          showComparison: false,
          showBars: false
        }
      ]}
      showOutliers={true}
      outlierColor="#ee6666"
      boxWidth="70%"
      chartColors={['#fac858']}
    />
  );
}

/**
 * Example 6: Session Duration by Traffic Source
 *
 * BUSINESS QUESTION:
 * "How long do users spend on my site by traffic source?
 * Which sources bring the most engaged visitors?"
 *
 * INSIGHTS PROVIDED:
 * - Median engagement time per source
 * - Engagement consistency
 * - Outlier sessions (very long/short)
 * - Best traffic sources for engagement
 */
export function SessionDurationExample() {
  return (
    <BoxplotChart
      title="Session Duration by Traffic Source"
      datasource="Analytics"
      dimension="Analytics.source"
      metrics={['Analytics.avgSessionDuration']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}
      filters={[
        {
          field: 'Analytics.sessions',
          operator: 'gt',
          values: ['50']
        }
      ]}
      metricsConfig={[
        {
          id: 'Analytics.avgSessionDuration',
          name: 'Session Duration',
          format: 'duration',
          decimals: 0,
          compact: false,
          alignment: 'center',
          textColor: '#111827',
          fontWeight: '500',
          showComparison: false,
          showBars: false
        }
      ]}
      showOutliers={true}
      outlierColor="#73c0de"
      boxWidth="65%"
      chartColors={['#3ba272']}
    />
  );
}

/**
 * Example 7: Multi-Metric Comparison Dashboard
 *
 * Shows multiple boxplot charts side-by-side for comprehensive analysis
 */
export function ComprehensiveDashboard() {
  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* CPC Analysis */}
      <div className="col-span-1">
        <CPCDistributionExample />
      </div>

      {/* CTR Analysis */}
      <div className="col-span-1">
        <CTRByDeviceExample />
      </div>

      {/* Position Analysis */}
      <div className="col-span-1">
        <PositionRangeExample />
      </div>

      {/* Conversion Analysis */}
      <div className="col-span-1">
        <ConversionRateByPageExample />
      </div>
    </div>
  );
}

/**
 * Example 8: Custom Styling
 *
 * Demonstrates advanced styling options
 */
export function CustomStyledExample() {
  return (
    <BoxplotChart
      title="Premium Campaign Performance Analysis"
      datasource="GoogleAds"
      dimension="GoogleAds.campaignName"
      metrics={['GoogleAds.roas']}
      dateRange={{ start: '2025-01-01', end: '2025-01-31' }}

      // Custom title styling
      showTitle={true}
      titleFontFamily="Inter"
      titleFontSize="20"
      titleFontWeight="700"
      titleColor="#1f2937"
      titleBackgroundColor="#f3f4f6"
      titleAlignment="center"

      // Custom container styling
      backgroundColor="#ffffff"
      showBorder={true}
      borderColor="#d1d5db"
      borderWidth={2}
      borderRadius={12}
      showShadow={true}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowBlur={20}
      padding={24}

      // Custom metric formatting
      metricsConfig={[
        {
          id: 'GoogleAds.roas',
          name: 'Return on Ad Spend',
          format: 'number',
          decimals: 2,
          compact: false,
          alignment: 'center',
          textColor: '#059669',
          fontWeight: '600',
          showComparison: true,
          compareVs: 'target',
          showBars: false
        }
      ]}

      // Custom chart styling
      showOutliers={true}
      outlierColor="#dc2626"
      boxWidth="80%"
      chartColors={['#059669']}
      showLegend={true}
    />
  );
}

/**
 * CUBE.JS DATA MODEL RECOMMENDATIONS
 *
 * For optimal boxplot performance, define percentile measures in Cube.js:
 *
 * cube('GoogleAds', {
 *   measures: {
 *     cpcMin: {
 *       sql: 'MIN(cpc)',
 *       type: 'number'
 *     },
 *     cpcMax: {
 *       sql: 'MAX(cpc)',
 *       type: 'number'
 *     },
 *     cpcMedian: {
 *       sql: 'APPROX_QUANTILES(cpc, 100)[OFFSET(50)]',
 *       type: 'number'
 *     },
 *     cpcQ1: {
 *       sql: 'APPROX_QUANTILES(cpc, 100)[OFFSET(25)]',
 *       type: 'number'
 *     },
 *     cpcQ3: {
 *       sql: 'APPROX_QUANTILES(cpc, 100)[OFFSET(75)]',
 *       type: 'number'
 *     }
 *   }
 * });
 *
 * Then query:
 * {
 *   measures: [
 *     'GoogleAds.cpcMin',
 *     'GoogleAds.cpcQ1',
 *     'GoogleAds.cpcMedian',
 *     'GoogleAds.cpcQ3',
 *     'GoogleAds.cpcMax'
 *   ],
 *   dimensions: ['GoogleAds.campaignName']
 * }
 */
