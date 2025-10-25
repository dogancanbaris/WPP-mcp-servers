import React from 'react';
import { WaterfallChart } from './WaterfallChart';

/**
 * WaterfallChart Examples
 *
 * Demonstrates various use cases for the WaterfallChart component with Cube.js integration.
 */

export const WaterfallChartExamples: React.FC = () => {
  return (
    <div className="space-y-12 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Waterfall Chart Examples</h2>
        <p className="text-gray-600 mb-8">
          Visualize sequential changes from starting value through additions/subtractions to ending value.
        </p>
      </div>

      {/* Example 1: Revenue Waterfall */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">1. Revenue Waterfall</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows Q1 revenue starting point, monthly changes, and Q2 ending total.
        </p>

        <WaterfallChart
          query={{
            measures: ['Revenue.amount'],
            dimensions: ['Revenue.month'],
            timeDimensions: [{
              dimension: 'Revenue.date',
              dateRange: 'last 6 months',
              granularity: 'month'
            }],
            order: { 'Revenue.date': 'asc' }
          }}
          title="Q1 to Q2 Revenue Changes"
          startLabel="Q1 Start"
          endLabel="Q2 End"
          valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}
        />

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <pre className="text-xs overflow-x-auto">
{`<WaterfallChart
  query={{
    measures: ['Revenue.amount'],
    dimensions: ['Revenue.month'],
    timeDimensions: [{
      dimension: 'Revenue.date',
      dateRange: 'last 6 months',
      granularity: 'month'
    }],
    order: { 'Revenue.date': 'asc' }
  }}
  title="Q1 to Q2 Revenue Changes"
  startLabel="Q1 Start"
  endLabel="Q2 End"
  valueFormat={(val) => \`$\${(val / 1000000).toFixed(1)}M\`}
/>`}
          </pre>
        </div>
      </section>

      {/* Example 2: Campaign Budget Allocation */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">2. Campaign Budget Allocation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tracks how monthly budget is allocated across different campaigns.
        </p>

        <WaterfallChart
          query={{
            measures: ['GoogleAds.budgetAmount'],
            dimensions: ['GoogleAds.campaignName'],
            filters: [{
              member: 'GoogleAds.status',
              operator: 'equals',
              values: ['ENABLED']
            }],
            order: { 'GoogleAds.budgetAmount': 'desc' },
            limit: 10
          }}
          title="Monthly Budget Allocation"
          startLabel="Total Budget"
          endLabel="Remaining"
          valueFormat={(val) => `$${val.toLocaleString()}`}
          positiveColor="#059669"
          negativeColor="#dc2626"
          totalColor="#2563eb"
        />

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <pre className="text-xs overflow-x-auto">
{`<WaterfallChart
  query={{
    measures: ['GoogleAds.budgetAmount'],
    dimensions: ['GoogleAds.campaignName'],
    filters: [{
      member: 'GoogleAds.status',
      operator: 'equals',
      values: ['ENABLED']
    }],
    order: { 'GoogleAds.budgetAmount': 'desc' },
    limit: 10
  }}
  title="Monthly Budget Allocation"
  startLabel="Total Budget"
  endLabel="Remaining"
  positiveColor="#059669"
  negativeColor="#dc2626"
  totalColor="#2563eb"
/>`}
          </pre>
        </div>
      </section>

      {/* Example 3: Conversion Funnel Analysis */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">3. Conversion Funnel Drop-offs</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows user drop-offs at each stage of the conversion funnel.
        </p>

        <WaterfallChart
          query={{
            measures: ['Analytics.users'],
            dimensions: ['Analytics.funnelStep'],
            timeDimensions: [{
              dimension: 'Analytics.date',
              dateRange: 'last 30 days'
            }],
            order: { 'Analytics.funnelStepOrder': 'asc' }
          }}
          title="Conversion Funnel Analysis"
          startLabel="Landing Page"
          endLabel="Conversions"
          valueFormat={(val) => val.toLocaleString()}
          positiveColor="#10b981"
          negativeColor="#f59e0b"
          height={500}
        />

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <pre className="text-xs overflow-x-auto">
{`<WaterfallChart
  query={{
    measures: ['Analytics.users'],
    dimensions: ['Analytics.funnelStep'],
    timeDimensions: [{
      dimension: 'Analytics.date',
      dateRange: 'last 30 days'
    }],
    order: { 'Analytics.funnelStepOrder': 'asc' }
  }}
  title="Conversion Funnel Analysis"
  startLabel="Landing Page"
  endLabel="Conversions"
  height={500}
/>`}
          </pre>
        </div>
      </section>

      {/* Example 4: Traffic Source Changes */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">4. Traffic Source Changes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Compares traffic sources month-over-month to identify growth/decline.
        </p>

        <WaterfallChart
          query={{
            measures: ['SearchConsole.clicks'],
            dimensions: ['SearchConsole.sourceType'],
            timeDimensions: [{
              dimension: 'SearchConsole.date',
              dateRange: ['2025-09-01', '2025-10-31'],
              granularity: 'month'
            }],
            order: { 'SearchConsole.clicks': 'desc' }
          }}
          title="Traffic Source Changes (Sep → Oct)"
          startLabel="September"
          endLabel="October"
          valueFormat={(val) => `${(val / 1000).toFixed(1)}K clicks`}
          showLabels={true}
        />

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <pre className="text-xs overflow-x-auto">
{`<WaterfallChart
  query={{
    measures: ['SearchConsole.clicks'],
    dimensions: ['SearchConsole.sourceType'],
    timeDimensions: [{
      dimension: 'SearchConsole.date',
      dateRange: ['2025-09-01', '2025-10-31'],
      granularity: 'month'
    }],
    order: { 'SearchConsole.clicks': 'desc' }
  }}
  title="Traffic Source Changes (Sep → Oct)"
  startLabel="September"
  endLabel="October"
  valueFormat={(val) => \`\${(val / 1000).toFixed(1)}K clicks\`}
/>`}
          </pre>
        </div>
      </section>

      {/* Example 5: ROI Breakdown */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">5. Marketing ROI Breakdown</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows contribution of each marketing channel to overall ROI.
        </p>

        <WaterfallChart
          query={{
            measures: ['Marketing.roi'],
            dimensions: ['Marketing.channel'],
            filters: [{
              member: 'Marketing.date',
              operator: 'inDateRange',
              values: ['last quarter']
            }],
            order: { 'Marketing.roi': 'desc' },
            limit: 8
          }}
          title="Q3 Marketing ROI by Channel"
          startLabel="Baseline"
          endLabel="Total ROI"
          valueFormat={(val) => `${(val * 100).toFixed(1)}%`}
          height={450}
        />

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <pre className="text-xs overflow-x-auto">
{`<WaterfallChart
  query={{
    measures: ['Marketing.roi'],
    dimensions: ['Marketing.channel'],
    filters: [{
      member: 'Marketing.date',
      operator: 'inDateRange',
      values: ['last quarter']
    }],
    order: { 'Marketing.roi': 'desc' },
    limit: 8
  }}
  title="Q3 Marketing ROI by Channel"
  startLabel="Baseline"
  endLabel="Total ROI"
  valueFormat={(val) => \`\${(val * 100).toFixed(1)}%\`}
/>`}
          </pre>
        </div>
      </section>

      {/* Example 6: Cost Per Acquisition Changes */}
      <section className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">6. CPA Optimization Tracking</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tracks weekly changes in Cost Per Acquisition after optimization efforts.
        </p>

        <WaterfallChart
          query={{
            measures: ['GoogleAds.costPerConversion'],
            dimensions: ['GoogleAds.week'],
            timeDimensions: [{
              dimension: 'GoogleAds.date',
              dateRange: 'last 8 weeks',
              granularity: 'week'
            }],
            order: { 'GoogleAds.date': 'asc' }
          }}
          title="Weekly CPA Changes"
          startLabel="Week 1"
          endLabel="Week 8"
          valueFormat={(val) => `$${val.toFixed(2)}`}
          positiveColor="#ef4444"
          negativeColor="#10b981"
          totalColor="#6366f1"
        />

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <pre className="text-xs overflow-x-auto">
{`<WaterfallChart
  query={{
    measures: ['GoogleAds.costPerConversion'],
    dimensions: ['GoogleAds.week'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 8 weeks',
      granularity: 'week'
    }],
    order: { 'GoogleAds.date': 'asc' }
  }}
  title="Weekly CPA Changes"
  startLabel="Week 1"
  endLabel="Week 8"
  // Note: Inverted colors (red=increase is bad, green=decrease is good)
  positiveColor="#ef4444"
  negativeColor="#10b981"
/>`}
          </pre>
        </div>
      </section>

      {/* Technical Notes */}
      <section className="border-t-2 border-gray-300 pt-6">
        <h3 className="text-xl font-semibold mb-4">Technical Implementation Notes</h3>

        <div className="space-y-4 text-sm">
          <div className="p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Uses stacked bars with invisible "helper" series to position visible bars correctly</li>
              <li>Helper bars start from 0 and reach the starting point of each change</li>
              <li>Visible bars stack on top, showing only the change amount</li>
              <li>Running cumulative total tracks position for next change</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded">
            <h4 className="font-semibold mb-2">Data Requirements</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>First data point becomes the "starting" value</li>
              <li>Subsequent points are treated as changes (+/-)</li>
              <li>Last point is calculated as the cumulative total</li>
              <li>Ensure data is ordered correctly using Cube.js order parameter</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded">
            <h4 className="font-semibold mb-2">Best Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Limit to 5-12 data points for readability</li>
              <li>Use meaningful start/end labels that describe the metric</li>
              <li>Format values consistently (currency, percentage, etc.)</li>
              <li>Consider color psychology (green=good, red=bad for your use case)</li>
              <li>For CPA/cost metrics, invert colors (decrease=green is better)</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 rounded">
            <h4 className="font-semibold mb-2">Common Use Cases</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Revenue/profit bridges (showing components of change)</li>
              <li>Budget allocation and spending tracking</li>
              <li>Conversion funnel drop-off visualization</li>
              <li>Period-over-period metric changes</li>
              <li>Cost optimization tracking (CPA, CPC, etc.)</li>
              <li>Traffic source contribution analysis</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WaterfallChartExamples;
