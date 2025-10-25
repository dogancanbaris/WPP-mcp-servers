/**
 * CandlestickChart Usage Examples
 *
 * This file demonstrates various use cases for the CandlestickChart component
 * with Cube.js integration for real marketing data.
 */

import { CandlestickChart } from './CandlestickChart';

// ============================================================================
// EXAMPLE 1: Google Ads CPC Trends with Daily Range
// ============================================================================

/**
 * USE CASE: Track daily CPC fluctuations with open/close/low/high values
 *
 * SCENARIO:
 * - Show how CPC changes throughout each day
 * - Identify volatility patterns
 * - Spot unusual bid price movements
 *
 * CUBE.JS DATA MODEL NEEDED:
 * ```javascript
 * cube('GoogleAds', {
 *   measures: {
 *     avgCpcOpen: {
 *       sql: `MIN(cost_micros / 1000000.0 / NULLIF(clicks, 0))`,
 *       type: 'number',
 *       description: 'Opening CPC for the day'
 *     },
 *     avgCpcClose: {
 *       sql: `MAX(cost_micros / 1000000.0 / NULLIF(clicks, 0))`,
 *       type: 'number',
 *       description: 'Closing CPC for the day'
 *     },
 *     minCpc: {
 *       sql: `MIN(cost_micros / 1000000.0 / NULLIF(clicks, 0))`,
 *       type: 'number',
 *       description: 'Lowest CPC recorded'
 *     },
 *     maxCpc: {
 *       sql: `MAX(cost_micros / 1000000.0 / NULLIF(clicks, 0))`,
 *       type: 'number',
 *       description: 'Highest CPC recorded'
 *     }
 *   }
 * });
 * ```
 */
export function Example1_GoogleAdsCPCTrends() {
  return (
    <CandlestickChart
      dimension="GoogleAds.date"
      openMetric="GoogleAds.avgCpcOpen"
      closeMetric="GoogleAds.avgCpcClose"
      lowMetric="GoogleAds.minCpc"
      highMetric="GoogleAds.maxCpc"
      dateRange={{
        start: '2025-01-01',
        end: '2025-01-31'
      }}
      title="Daily CPC Fluctuation - January 2025"
      showMA5={true}
      showMA10={true}
      ma5Color="#3b82f6"
      ma10Color="#f97316"
      metricsConfig={[
        {
          id: 'GoogleAds.avgCpcOpen',
          name: 'Open CPC',
          format: 'currency',
          decimals: 2,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '400',
          showComparison: false,
          showBars: false
        },
        {
          id: 'GoogleAds.avgCpcClose',
          name: 'Close CPC',
          format: 'currency',
          decimals: 2,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '400',
          showComparison: false,
          showBars: false
        }
      ]}
    />
  );
}

// ============================================================================
// EXAMPLE 2: Campaign Position Tracking (Search Rank as Price)
// ============================================================================

/**
 * USE CASE: Track average search position range per day
 *
 * SCENARIO:
 * - Monitor organic search position volatility
 * - Identify ranking fluctuations
 * - Detect algorithm updates or competitor actions
 *
 * CREATIVE USE: Using candlestick for non-financial data!
 * - "Open" = First position recorded that day
 * - "Close" = Last position recorded that day
 * - "Low" = Best position (numerically lowest)
 * - "High" = Worst position (numerically highest)
 *
 * CUBE.JS DATA MODEL:
 * ```javascript
 * cube('GSCPerformance', {
 *   measures: {
 *     firstPosition: {
 *       sql: `FIRST_VALUE(position) OVER (PARTITION BY date ORDER BY timestamp)`,
 *       type: 'number'
 *     },
 *     lastPosition: {
 *       sql: `LAST_VALUE(position) OVER (PARTITION BY date ORDER BY timestamp)`,
 *       type: 'number'
 *     },
 *     bestPosition: {
 *       sql: `MIN(position)`,
 *       type: 'number'
 *     },
 *     worstPosition: {
 *       sql: `MAX(position)`,
 *       type: 'number'
 *     }
 *   }
 * });
 * ```
 */
export function Example2_SearchPositionTracking() {
  return (
    <CandlestickChart
      dimension="GSCPerformance.date"
      openMetric="GSCPerformance.firstPosition"
      closeMetric="GSCPerformance.lastPosition"
      lowMetric="GSCPerformance.bestPosition"
      highMetric="GSCPerformance.worstPosition"
      dateRange={{
        start: '2025-01-01',
        end: '2025-03-31'
      }}
      filters={[
        {
          field: 'GSCPerformance.query',
          operator: 'equals',
          values: ['digital marketing services']
        }
      ]}
      title="Search Position Range - Target Keyword"
      showMA5={true}
      showMA10={false}
      ma5Color="#10b981"
      chartColors={['#10b981', '#ef4444']} // Green for improvement, red for decline
      metricsConfig={[
        {
          id: 'GSCPerformance.firstPosition',
          name: 'First Position',
          format: 'number',
          decimals: 1,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '400',
          showComparison: false,
          showBars: false
        }
      ]}
    />
  );
}

// ============================================================================
// EXAMPLE 3: Multiple Campaign Comparison (Side-by-Side)
// ============================================================================

/**
 * USE CASE: Compare bid price volatility across campaigns
 *
 * SCENARIO:
 * - Dashboard with 3 candlestick charts side-by-side
 * - Each showing a different campaign's bid behavior
 * - Identify which campaigns have stable vs volatile bidding
 */
export function Example3_MultipleCampaignComparison() {
  const campaigns = ['Campaign A', 'Campaign B', 'Campaign C'];

  return (
    <div className="grid grid-cols-3 gap-4">
      {campaigns.map(campaign => (
        <CandlestickChart
          key={campaign}
          dimension="GoogleAds.date"
          metrics={[
            'GoogleAds.avgCpcOpen',
            'GoogleAds.avgCpcClose',
            'GoogleAds.minCpc',
            'GoogleAds.maxCpc'
          ]}
          filters={[
            {
              field: 'GoogleAds.campaignName',
              operator: 'equals',
              values: [campaign]
            }
          ]}
          dateRange={{
            start: '2025-01-01',
            end: '2025-01-31'
          }}
          title={`${campaign} - Bid Volatility`}
          showMA5={true}
          showMA10={false}
          backgroundColor="#ffffff"
          borderRadius={12}
          padding={16}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: With Custom Styling and No Moving Averages
// ============================================================================

/**
 * USE CASE: Clean, minimalist view for executive dashboards
 */
export function Example4_MinimalistStyling() {
  return (
    <CandlestickChart
      dimension="GoogleAds.date"
      metrics={[
        'GoogleAds.avgCpcOpen',
        'GoogleAds.avgCpcClose',
        'GoogleAds.minCpc',
        'GoogleAds.maxCpc'
      ]}
      dateRange={{
        start: '2025-01-01',
        end: '2025-03-31'
      }}
      title="Q1 2025 CPC Trends"
      showTitle={true}
      titleFontSize="20"
      titleFontWeight="700"
      titleColor="#1f2937"
      titleAlignment="center"
      backgroundColor="#f9fafb"
      showBorder={false}
      borderRadius={16}
      showShadow={true}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowBlur={20}
      padding={24}
      showMA5={false}
      showMA10={false}
      showLegend={false}
      chartColors={['#dc2626', '#16a34a']} // Red/Green for clarity
    />
  );
}

// ============================================================================
// EXAMPLE 5: CPM Tracking for Display Campaigns
// ============================================================================

/**
 * USE CASE: Monitor CPM (Cost Per Mille) fluctuations
 *
 * SCENARIO:
 * - Track display advertising costs
 * - Identify peak pricing times
 * - Optimize bid adjustments based on historical volatility
 */
export function Example5_DisplayCPMTracking() {
  return (
    <CandlestickChart
      dimension="GoogleAds.date"
      openMetric="GoogleAds.avgCpmOpen"
      closeMetric="GoogleAds.avgCpmClose"
      lowMetric="GoogleAds.minCpm"
      highMetric="GoogleAds.maxCpm"
      filters={[
        {
          field: 'GoogleAds.campaignType',
          operator: 'equals',
          values: ['DISPLAY']
        }
      ]}
      dateRange={{
        start: '2025-01-01',
        end: '2025-01-31'
      }}
      title="Display Campaign CPM - January 2025"
      showMA5={true}
      showMA10={true}
      ma5Color="#8b5cf6"
      ma10Color="#ec4899"
      metricsConfig={[
        {
          id: 'GoogleAds.avgCpmOpen',
          name: 'Open CPM',
          format: 'currency',
          decimals: 2,
          compact: false,
          alignment: 'right',
          textColor: '#111827',
          fontWeight: '400',
          showComparison: false,
          showBars: false
        }
      ]}
    />
  );
}

// ============================================================================
// EXAMPLE 6: Using Generic Metrics Array (Alternative Syntax)
// ============================================================================

/**
 * USE CASE: Quick setup without explicit open/close/low/high props
 *
 * CONVENTION: metrics array order is [open, close, low, high]
 */
export function Example6_GenericMetricsArray() {
  return (
    <CandlestickChart
      dimension="GoogleAds.date"
      metrics={[
        'GoogleAds.avgCpcOpen',   // Index 0 = Open
        'GoogleAds.avgCpcClose',  // Index 1 = Close
        'GoogleAds.minCpc',       // Index 2 = Low
        'GoogleAds.maxCpc'        // Index 3 = High
      ]}
      dateRange={{
        start: '2025-01-01',
        end: '2025-01-31'
      }}
      title="Daily CPC Range"
      showMA5={true}
      showMA10={true}
    />
  );
}

// ============================================================================
// TIPS & BEST PRACTICES
// ============================================================================

/**
 * PERFORMANCE OPTIMIZATION:
 * - Limit date range to 90 days max for readability
 * - Use dataZoom slider for longer periods
 * - Moving averages add minimal overhead
 *
 * DATA REQUIREMENTS:
 * - MUST have a date/time dimension
 * - MUST have 4 metrics in [open, close, low, high] order
 * - Values should be numeric
 * - Missing values default to 0
 *
 * VISUAL CUSTOMIZATION:
 * - chartColors[0] = Bearish color (close < open) - default red
 * - chartColors[1] = Bullish color (close > open) - default green
 * - ma5Color = 5-day moving average line color
 * - ma10Color = 10-day moving average line color
 *
 * CUBE.JS QUERY OPTIMIZATION:
 * - Use pre-aggregations for daily OHLC calculations
 * - Index on date column for fast filtering
 * - Consider rollup tables for historical data
 *
 * WHEN NOT TO USE:
 * - Non-temporal data (use Bar chart instead)
 * - Fewer than 4 metrics available
 * - Data doesn't have open/close/high/low structure
 * - Simple line chart would suffice
 *
 * ALTERNATIVE CHART TYPES:
 * - Simple trend: Use LineChart or TimeSeriesChart
 * - Range only: Use AreaChart with min/max bands
 * - Multiple metrics: Use multi-line LineChart
 */

// ============================================================================
// REAL-WORLD DASHBOARD INTEGRATION
// ============================================================================

/**
 * EXAMPLE: Full dashboard with context
 */
export function Example7_RealWorldDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Bid Management Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Primary Chart: CPC Trends with Moving Averages */}
        <div className="col-span-2">
          <CandlestickChart
            dimension="GoogleAds.date"
            openMetric="GoogleAds.avgCpcOpen"
            closeMetric="GoogleAds.avgCpcClose"
            lowMetric="GoogleAds.minCpc"
            highMetric="GoogleAds.maxCpc"
            dateRange={{
              start: '2025-01-01',
              end: '2025-03-31'
            }}
            title="Q1 2025 - Average CPC Trends"
            showMA5={true}
            showMA10={true}
            backgroundColor="#ffffff"
            showBorder={true}
            borderRadius={12}
            padding={20}
            showShadow={true}
          />
        </div>

        {/* Secondary Charts: Campaign Breakdown */}
        <CandlestickChart
          dimension="GoogleAds.date"
          metrics={[
            'GoogleAds.avgCpcOpen',
            'GoogleAds.avgCpcClose',
            'GoogleAds.minCpc',
            'GoogleAds.maxCpc'
          ]}
          filters={[
            {
              field: 'GoogleAds.campaignType',
              operator: 'equals',
              values: ['SEARCH']
            }
          ]}
          dateRange={{
            start: '2025-01-01',
            end: '2025-03-31'
          }}
          title="Search Campaigns"
          showMA5={true}
          showMA10={false}
        />

        <CandlestickChart
          dimension="GoogleAds.date"
          metrics={[
            'GoogleAds.avgCpmOpen',
            'GoogleAds.avgCpmClose',
            'GoogleAds.minCpm',
            'GoogleAds.maxCpm'
          ]}
          filters={[
            {
              field: 'GoogleAds.campaignType',
              operator: 'equals',
              values: ['DISPLAY']
            }
          ]}
          dateRange={{
            start: '2025-01-01',
            end: '2025-03-31'
          }}
          title="Display Campaigns (CPM)"
          showMA5={true}
          showMA10={false}
        />
      </div>
    </div>
  );
}
