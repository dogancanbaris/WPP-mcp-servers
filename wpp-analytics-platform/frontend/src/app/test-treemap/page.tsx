'use client';

import { TreemapChart } from '@/components/dashboard-builder/charts/TreemapChart';

/**
 * Test page for TreemapChart with Cube.js integration
 */
export default function TestTreemapPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">TreemapChart - Cube.js Integration Tests</h1>

      {/* Test 1: Single Dimension - Device Distribution */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Test 1: Device Distribution (Single Dimension)</h2>
        <TreemapChart
          datasource="gsc_performance_7days"
          dimension="GscPerformance.device"
          metrics={['GscPerformance.clicks']}
          title="Clicks by Device Type"
          showTitle={true}
          backgroundColor="#ffffff"
          showBorder={true}
          borderRadius={8}
          metricsConfig={[
            {
              id: 'GscPerformance.clicks',
              name: 'Clicks',
              format: 'number',
              decimals: 0,
              compact: true,
              alignment: 'left',
              textColor: '#111827',
              fontWeight: '600',
              showComparison: false,
              showBars: false
            }
          ]}
        />
      </div>

      {/* Test 2: Hierarchical - Country > Device */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Test 2: Country &gt; Device Hierarchy</h2>
        <TreemapChart
          datasource="gsc_performance_7days"
          dimension="GscPerformance.country"
          breakdownDimension="GscPerformance.device"
          metrics={['GscPerformance.impressions']}
          title="Impressions by Country and Device"
          showTitle={true}
          backgroundColor="#f9fafb"
          showBorder={true}
          borderRadius={8}
          chartColors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
          metricsConfig={[
            {
              id: 'GscPerformance.impressions',
              name: 'Impressions',
              format: 'number',
              decimals: 0,
              compact: true,
              alignment: 'left',
              textColor: '#111827',
              fontWeight: '600',
              showComparison: false,
              showBars: false
            }
          ]}
        />
      </div>

      {/* Test 3: With Filters - Mobile Only */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Test 3: Top Pages (Mobile Only)</h2>
        <TreemapChart
          datasource="gsc_performance_7days"
          dimension="GscPerformance.page"
          metrics={['GscPerformance.clicks']}
          filters={[
            {
              field: 'GscPerformance.device',
              operator: 'equals',
              values: ['MOBILE']
            }
          ]}
          title="Top Pages - Mobile Traffic"
          showTitle={true}
          backgroundColor="#ffffff"
          showBorder={true}
          borderRadius={8}
          chartColors={['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308']}
          metricsConfig={[
            {
              id: 'GscPerformance.clicks',
              name: 'Clicks',
              format: 'number',
              decimals: 0,
              compact: true,
              alignment: 'left',
              textColor: '#111827',
              fontWeight: '600',
              showComparison: false,
              showBars: false
            }
          ]}
        />
      </div>

      {/* Test 4: CTR Percentage Display */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Test 4: CTR by Query (Percentage Format)</h2>
        <TreemapChart
          datasource="gsc_queries"
          dimension="GscQueries.query"
          metrics={['GscQueries.ctr']}
          title="Click-Through Rate by Search Query"
          showTitle={true}
          backgroundColor="#ffffff"
          showBorder={true}
          borderRadius={8}
          chartColors={['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']}
          metricsConfig={[
            {
              id: 'GscQueries.ctr',
              name: 'CTR',
              format: 'percent',
              decimals: 2,
              compact: false,
              alignment: 'left',
              textColor: '#111827',
              fontWeight: '600',
              showComparison: false,
              showBars: false
            }
          ]}
        />
      </div>

      {/* Test 5: Empty State - No Configuration */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Test 5: Empty State (No Dimension/Metric)</h2>
        <TreemapChart
          title="Unconfigured Treemap"
          showTitle={true}
        />
      </div>

      {/* Test 6: Google Ads - Campaign Performance */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Test 6: Google Ads Campaign Spend</h2>
        <TreemapChart
          datasource="google_ads_campaigns"
          dimension="GoogleAdsCampaigns.campaignName"
          metrics={['GoogleAdsCampaigns.cost']}
          title="Ad Spend by Campaign"
          showTitle={true}
          backgroundColor="#ffffff"
          showBorder={true}
          borderRadius={8}
          chartColors={['#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#059669']}
          metricsConfig={[
            {
              id: 'GoogleAdsCampaigns.cost',
              name: 'Cost',
              format: 'currency',
              decimals: 2,
              compact: true,
              alignment: 'left',
              textColor: '#111827',
              fontWeight: '600',
              showComparison: false,
              showBars: false
            }
          ]}
        />
      </div>
    </div>
  );
}
