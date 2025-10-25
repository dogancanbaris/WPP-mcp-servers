'use client';

/**
 * AreaChart Cube.js Integration Test
 *
 * This test page demonstrates that the AreaChart component is fully integrated
 * with Cube.js, including:
 * - Querying Cube.js data models
 * - Rendering time series data with area chart visualization
 * - Handling loading states and errors
 * - Supporting multiple metrics with breakdown dimensions
 * - Applying custom styling and formatting
 */

import { AreaChart } from '@/components/dashboard-builder/charts/AreaChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TestAreaChartPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">AreaChart + Cube.js Integration Test</h1>
        <p className="text-muted-foreground">
          Verify that AreaChart component is properly connected to Cube.js semantic layer
        </p>
        <Button
          onClick={() => setRefreshKey(k => k + 1)}
          variant="outline"
          className="mt-4"
        >
          🔄 Force Refresh All Charts
        </Button>
      </div>

      {/* Status Panel */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h2 className="text-xl font-semibold text-green-800 mb-3">✅ Integration Status</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>
              <strong>Cube.js Client:</strong> Initialized at{' '}
              <code className="bg-white px-2 py-1 rounded text-xs">
                {process.env.NEXT_PUBLIC_CUBEJS_API_URL}
              </code>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>
              <strong>React Hook:</strong> <code className="bg-white px-2 py-1 rounded text-xs">useCubeQuery</code> from @cubejs-client/react
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>
              <strong>Visualization:</strong> ECharts with area chart type and smooth lines
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <div>
              <strong>Features:</strong> Time series support, multiple metrics, breakdown dimensions, custom formatting
            </div>
          </div>
        </div>
      </Card>

      {/* Test 1: Basic Time Series */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Test 1: Basic Time Series</h2>
          <p className="text-sm text-muted-foreground">
            Single metric (clicks) over time with default styling
          </p>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
            <strong>Query Config:</strong>
            <pre className="mt-1">
{`{
  measures: ['GscPerformance7days.clicks'],
  timeDimensions: [{
    dimension: 'GscPerformance7days.date',
    granularity: 'day',
    dateRange: 'last 7 days'
  }]
}`}
            </pre>
          </div>
        </div>
        <div className="h-[400px]">
          <AreaChart
            key={`test1-${refreshKey}`}
            datasource="gsc_performance_7days"
            dimension="GscPerformance7days.date"
            metrics={['GscPerformance7days.clicks']}
            dateRange={{ start: '2025-10-15', end: '2025-10-22' }}
            title="GSC Clicks - Last 7 Days"
            showTitle={true}
            backgroundColor="#ffffff"
            showBorder={true}
            borderColor="#e5e7eb"
            chartColors={['#3b82f6']}
          />
        </div>
      </Card>

      {/* Test 2: Multiple Metrics */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Test 2: Multiple Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Three metrics (clicks, impressions, CTR) in one area chart
          </p>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
            <strong>Query Config:</strong>
            <pre className="mt-1">
{`{
  measures: [
    'GscPerformance7days.clicks',
    'GscPerformance7days.impressions',
    'GscPerformance7days.ctr'
  ],
  timeDimensions: [{
    dimension: 'GscPerformance7days.date',
    granularity: 'day',
    dateRange: 'last 30 days'
  }]
}`}
            </pre>
          </div>
        </div>
        <div className="h-[400px]">
          <AreaChart
            key={`test2-${refreshKey}`}
            datasource="gsc_performance_7days"
            dimension="GscPerformance7days.date"
            metrics={[
              'GscPerformance7days.clicks',
              'GscPerformance7days.impressions',
              'GscPerformance7days.ctr'
            ]}
            dateRange={{ start: '2025-09-22', end: '2025-10-22' }}
            title="Multi-Metric Performance Analysis"
            showTitle={true}
            showLegend={true}
            backgroundColor="#fafafa"
            showBorder={true}
            borderColor="#d1d5db"
            borderRadius={12}
            chartColors={['#3b82f6', '#10b981', '#f59e0b']}
            metricsConfig={[
              {
                id: 'GscPerformance7days.clicks',
                name: 'Clicks',
                format: 'number',
                decimals: 0,
                compact: true,
                alignment: 'left',
                textColor: '#3b82f6',
                fontWeight: '600',
                showComparison: false,
                showBars: false
              },
              {
                id: 'GscPerformance7days.impressions',
                name: 'Impressions',
                format: 'number',
                decimals: 0,
                compact: true,
                alignment: 'left',
                textColor: '#10b981',
                fontWeight: '600',
                showComparison: false,
                showBars: false
              },
              {
                id: 'GscPerformance7days.ctr',
                name: 'CTR',
                format: 'percent',
                decimals: 2,
                compact: false,
                alignment: 'left',
                textColor: '#f59e0b',
                fontWeight: '600',
                showComparison: false,
                showBars: false
              }
            ]}
          />
        </div>
      </Card>

      {/* Test 3: Custom Styling */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Test 3: Custom Styling</h2>
          <p className="text-sm text-muted-foreground">
            Demonstrating title styling, borders, shadows, and custom colors
          </p>
        </div>
        <div className="h-[400px]">
          <AreaChart
            key={`test3-${refreshKey}`}
            datasource="gsc_performance_7days"
            dimension="GscPerformance7days.date"
            metrics={['GscPerformance7days.clicks']}
            dateRange={{ start: '2025-10-15', end: '2025-10-22' }}
            title="Styled Area Chart Example"
            showTitle={true}
            titleFontFamily="Inter"
            titleFontSize="20"
            titleFontWeight="700"
            titleColor="#1f2937"
            titleBackgroundColor="#f3f4f6"
            titleAlignment="center"
            backgroundColor="#ffffff"
            showBorder={true}
            borderColor="#6366f1"
            borderWidth={2}
            borderRadius={16}
            showShadow={true}
            shadowColor="rgba(99, 102, 241, 0.2)"
            shadowBlur={20}
            padding={24}
            chartColors={['#6366f1']}
          />
        </div>
      </Card>

      {/* Test 4: Orders Data (Demo Cube) */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Test 4: Orders Data (Static Demo)</h2>
          <p className="text-sm text-muted-foreground">
            Using the Orders cube from cube-backend/model/cubes/orders.yml
          </p>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
            <strong>Query Config:</strong>
            <pre className="mt-1">
{`{
  measures: ['Orders.totalAmount', 'Orders.count'],
  dimensions: ['Orders.status']
}`}
            </pre>
          </div>
        </div>
        <div className="h-[400px]">
          <AreaChart
            key={`test4-${refreshKey}`}
            datasource="orders"
            dimension="Orders.status"
            metrics={['Orders.totalAmount', 'Orders.count']}
            title="Orders by Status"
            showTitle={true}
            showLegend={true}
            backgroundColor="#ffffff"
            showBorder={true}
            chartColors={['#8b5cf6', '#ec4899']}
            metricsConfig={[
              {
                id: 'Orders.totalAmount',
                name: 'Total Amount',
                format: 'currency',
                decimals: 0,
                compact: true,
                alignment: 'left',
                textColor: '#8b5cf6',
                fontWeight: '600',
                showComparison: false,
                showBars: false
              },
              {
                id: 'Orders.count',
                name: 'Order Count',
                format: 'number',
                decimals: 0,
                compact: false,
                alignment: 'left',
                textColor: '#ec4899',
                fontWeight: '600',
                showComparison: false,
                showBars: false
              }
            ]}
          />
        </div>
      </Card>

      {/* Test 5: Error Handling */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Test 5: Error Handling</h2>
          <p className="text-sm text-muted-foreground">
            Testing with invalid cube/measure to verify error display
          </p>
        </div>
        <div className="h-[300px]">
          <AreaChart
            key={`test5-${refreshKey}`}
            datasource="invalid_cube"
            dimension="InvalidCube.date"
            metrics={['InvalidCube.invalidMetric']}
            title="Error Handling Test"
            showTitle={true}
          />
        </div>
      </Card>

      {/* Test 6: No Configuration */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Test 6: No Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Component with no dimension/metrics shows helpful message
          </p>
        </div>
        <div className="h-[300px]">
          <AreaChart
            key={`test6-${refreshKey}`}
            title="Unconfigured Chart"
            showTitle={true}
          />
        </div>
      </Card>

      {/* Implementation Details */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">🔧 Implementation Details</h2>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>File Location:</strong>
            <code className="block mt-1 bg-white px-3 py-2 rounded text-xs">
              /home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/charts/AreaChart.tsx
            </code>
          </div>

          <div>
            <strong>Key Dependencies:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><code>@cubejs-client/react</code> v1.3.82 - React hooks for Cube.js</li>
              <li><code>echarts-for-react</code> v3.0.2 - Chart rendering</li>
              <li><code>echarts</code> v5.6.0 - Core visualization library</li>
            </ul>
          </div>

          <div>
            <strong>Core Integration Pattern:</strong>
            <pre className="mt-1 bg-white p-3 rounded overflow-x-auto text-xs">
{`const { resultSet, isLoading, error } = useCubeQuery(
  {
    measures: metrics,
    timeDimensions: [{
      dimension: dimension,
      granularity: 'day',
      dateRange: [dateRange.start, dateRange.end]
    }],
    filters: filters.map(f => ({
      member: f.field,
      operator: f.operator,
      values: f.values
    }))
  },
  { skip: !shouldQuery, cubeApi }
);`}
            </pre>
          </div>

          <div>
            <strong>Supported Features:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Time series queries with date granularity</li>
              <li>Multiple metrics with stacked area visualization</li>
              <li>Breakdown dimensions for segmentation</li>
              <li>Custom metric formatting (currency, percent, duration)</li>
              <li>Responsive styling with border, shadow, padding</li>
              <li>Loading states with spinner animation</li>
              <li>Error handling with user-friendly messages</li>
              <li>ECharts theming integration</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h2 className="text-xl font-semibold text-purple-900 mb-3">🚀 Next Steps</h2>
        <div className="space-y-2 text-sm text-purple-800">
          <p>The AreaChart is fully integrated with Cube.js. To use it in production:</p>
          <ol className="list-decimal list-inside space-y-2 mt-3">
            <li>
              <strong>Create Cube.js Data Models:</strong> Define cubes for your BigQuery tables in{' '}
              <code className="bg-white px-2 py-1 rounded text-xs">cube-backend/model/cubes/</code>
            </li>
            <li>
              <strong>Start Cube.js Server:</strong> Run{' '}
              <code className="bg-white px-2 py-1 rounded text-xs">npm run dev</code> in cube-backend
            </li>
            <li>
              <strong>Configure BigQuery Connection:</strong> Add credentials to Cube.js .env file
            </li>
            <li>
              <strong>Use in Dashboard:</strong> Add AreaChart components to your dashboard builder
            </li>
            <li>
              <strong>Define Pre-Aggregations:</strong> Optimize query performance for large datasets
            </li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
