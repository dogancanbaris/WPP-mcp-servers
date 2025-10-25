/**
 * Scorecard Component Examples
 *
 * Demonstrates various configurations of the Scorecard component
 * with Cube.js integration and comparison features.
 */

import { Scorecard } from '../Scorecard';

/**
 * Example 1: Basic Scorecard - Total Impressions
 *
 * Shows a simple KPI without comparison
 */
export const BasicScorecard = () => (
  <Scorecard
    title="Total Impressions"
    metrics={['GSC.impressions']}
    dateRange={{
      dimension: 'GSC.date',
      dateRange: 'last 7 days'
    }}
    metricsConfig={[{
      id: 'GSC.impressions',
      name: 'GSC.impressions',
      format: 'number',
      compact: true,
      decimals: 0,
      showComparison: false
    }]}
  />
);

/**
 * Example 2: Scorecard with Previous Period Comparison
 *
 * Displays KPI with automatic trend calculation vs previous 7 days
 */
export const ScorecardWithComparison = () => (
  <Scorecard
    title="Total Clicks"
    metrics={['GSC.clicks']}
    dateRange={{
      dimension: 'GSC.date',
      dateRange: 'last 7 days'
    }}
    metricsConfig={[{
      id: 'GSC.clicks',
      name: 'GSC.clicks',
      format: 'number',
      compact: true,
      decimals: 0,
      showComparison: true,
      compareVs: 'previous' // Compares to previous 7 days
    }]}
    chartColors={['#5470c6']}
  />
);

/**
 * Example 3: CTR Scorecard with Percentage Format
 *
 * Shows CTR metric formatted as percentage with comparison
 */
export const CTRScorecard = () => (
  <Scorecard
    title="Click-Through Rate"
    metrics={['GSC.ctr']}
    dateRange={{
      dimension: 'GSC.date',
      dateRange: 'last 30 days'
    }}
    metricsConfig={[{
      id: 'GSC.ctr',
      name: 'GSC.ctr',
      format: 'percent',
      decimals: 2,
      showComparison: true,
      compareVs: 'previous'
    }]}
    chartColors={['#91cc75']}
  />
);

/**
 * Example 4: Average Position Scorecard
 *
 * Displays average position (lower is better, so negative trend is green)
 */
export const PositionScorecard = () => (
  <Scorecard
    title="Average Position"
    metrics={['GSC.position']}
    dateRange={{
      dimension: 'GSC.date',
      dateRange: 'last 7 days'
    }}
    metricsConfig={[{
      id: 'GSC.position',
      name: 'GSC.position',
      format: 'number',
      decimals: 1,
      showComparison: true,
      compareVs: 'previous'
    }]}
    chartColors={['#fac858']}
  />
);

/**
 * Example 5: Filtered Scorecard - Mobile Clicks
 *
 * Shows clicks filtered by device type
 */
export const FilteredScorecard = () => (
  <Scorecard
    title="Mobile Clicks"
    metrics={['GSC.clicks']}
    dateRange={{
      dimension: 'GSC.date',
      dateRange: 'last 7 days'
    }}
    filters={[{
      field: 'GSC.device',
      operator: 'equals',
      values: ['MOBILE']
    }]}
    metricsConfig={[{
      id: 'GSC.clicks',
      name: 'GSC.clicks',
      format: 'number',
      compact: true,
      decimals: 0,
      showComparison: true,
      compareVs: 'previous'
    }]}
  />
);

/**
 * Example 6: Custom Styled Scorecard
 *
 * Demonstrates custom styling options
 */
export const CustomStyledScorecard = () => (
  <Scorecard
    title="Total Revenue"
    showTitle={true}
    titleFontSize="16"
    titleFontWeight="600"
    titleColor="#1a1a1a"
    backgroundColor="#f8f9fa"
    showBorder={true}
    borderColor="#dee2e6"
    borderWidth={2}
    borderRadius={12}
    showShadow={true}
    shadowColor="#00000020"
    shadowBlur={15}
    padding={24}
    metrics={['GoogleAds.cost']}
    dateRange={{
      dimension: 'GoogleAds.date',
      dateRange: 'last 30 days'
    }}
    metricsConfig={[{
      id: 'GoogleAds.cost',
      name: 'GoogleAds.cost',
      format: 'currency',
      compact: true,
      decimals: 0,
      showComparison: true,
      compareVs: 'previous'
    }]}
    chartColors={['#ee6666']}
  />
);

/**
 * Example 7: Multi-Metric Dashboard (4 Scorecards)
 *
 * Complete KPI dashboard with 4 key metrics
 */
export const ScorecardDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
    {/* Impressions */}
    <Scorecard
      title="Impressions"
      metrics={['GSC.impressions']}
      dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
      metricsConfig={[{
        id: 'GSC.impressions',
        name: 'GSC.impressions',
        format: 'number',
        compact: true,
        showComparison: true,
        compareVs: 'previous'
      }]}
      chartColors={['#5470c6']}
    />

    {/* Clicks */}
    <Scorecard
      title="Clicks"
      metrics={['GSC.clicks']}
      dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
      metricsConfig={[{
        id: 'GSC.clicks',
        name: 'GSC.clicks',
        format: 'number',
        compact: true,
        showComparison: true,
        compareVs: 'previous'
      }]}
      chartColors={['#91cc75']}
    />

    {/* CTR */}
    <Scorecard
      title="CTR"
      metrics={['GSC.ctr']}
      dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
      metricsConfig={[{
        id: 'GSC.ctr',
        name: 'GSC.ctr',
        format: 'percent',
        decimals: 2,
        showComparison: true,
        compareVs: 'previous'
      }]}
      chartColors={['#fac858']}
    />

    {/* Position */}
    <Scorecard
      title="Avg Position"
      metrics={['GSC.position']}
      dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
      metricsConfig={[{
        id: 'GSC.position',
        name: 'GSC.position',
        format: 'number',
        decimals: 1,
        showComparison: true,
        compareVs: 'previous'
      }]}
      chartColors={['#ee6666']}
    />
  </div>
);

/**
 * Example 8: Cube.js Query Structure
 *
 * This is what the component generates internally:
 *
 * Main Query:
 * {
 *   measures: ['GSC.clicks'],
 *   timeDimensions: [{
 *     dimension: 'GSC.date',
 *     dateRange: 'last 7 days'
 *   }],
 *   filters: []
 * }
 *
 * Comparison Query (when showComparison=true):
 * {
 *   measures: ['GSC.clicks'],
 *   timeDimensions: [{
 *     dimension: 'GSC.date',
 *     dateRange: 'from 14 days ago to 7 days ago'  // Previous period
 *   }],
 *   filters: []
 * }
 *
 * Expected Response:
 * Main: [{ 'GSC.clicks': 1500 }]
 * Comparison: [{ 'GSC.clicks': 1200 }]
 *
 * Calculated Trend: +25% (green, trending up)
 */

/**
 * Example 9: Error Handling States
 *
 * The component handles these states automatically:
 * - Empty state: No metrics configured
 * - Loading state: Queries in progress (shows spinner)
 * - Error state: Query failed (shows error message)
 * - Success state: Data loaded (shows KPI with trend)
 */
export const ScorecardStates = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
    {/* Empty State */}
    <Scorecard
      title="Empty Scorecard"
      metrics={[]}
    />

    {/* With Data */}
    <Scorecard
      title="With Data"
      metrics={['GSC.clicks']}
      dateRange={{ dimension: 'GSC.date', dateRange: 'last 7 days' }}
      metricsConfig={[{
        id: 'GSC.clicks',
        name: 'GSC.clicks',
        format: 'number',
        showComparison: true,
        compareVs: 'previous'
      }]}
    />
  </div>
);

/**
 * Integration Notes:
 *
 * 1. Cube.js Connection:
 *    - Uses @cubejs-client/react's useCubeQuery hook
 *    - Connects to Cube.js API via cubeApi client
 *    - Automatically handles query caching and updates
 *
 * 2. Token Efficiency:
 *    - Returns single aggregated value (1 row)
 *    - Comparison query also returns 1 row
 *    - Total: 2 rows for complete scorecard
 *
 * 3. Comparison Logic:
 *    - "last 7 days" → compares to "from 14 days ago to 7 days ago"
 *    - "last 30 days" → compares to "from 60 days ago to 30 days ago"
 *    - Custom [start, end] → calculates previous period of same length
 *
 * 4. Trend Calculation:
 *    - Formula: ((current - previous) / previous) * 100
 *    - Positive: Green with up arrow
 *    - Negative: Red with down arrow
 *    - Zero: Gray with minus icon
 *
 * 5. Performance:
 *    - Parallel queries (main + comparison)
 *    - Shows loading state until both complete
 *    - Uses React.useMemo for optimized re-renders
 */
