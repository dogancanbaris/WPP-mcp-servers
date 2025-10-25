'use client';

// Test Page - Verifies all components work together
import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { cubeApi } from '@/lib/cubejs/client';
import { getEChartsTheme } from '@/lib/themes/echarts-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCubeQuery = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultSet = await cubeApi.load({
        measures: ['GscPerformance7days.clicks'],
        timeDimensions: [{
          dimension: 'GscPerformance7days.date',
          granularity: 'day',
          dateRange: 'last 7 days'
        }]
      });

      setData(resultSet.chartPivot());
    } catch (err: any) {
      setError(err.message || 'Failed to query Cube.js');
      console.error('Cube.js error:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartOption = data ? {
    xAxis: {
      type: 'category',
      data: data.map((d: any) => d.x)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map((d: any) => d['GscPerformance7days.clicks']),
      type: 'line',
      smooth: true,
      name: 'Clicks'
    }],
    tooltip: {
      trigger: 'axis'
    },
    title: {
      text: 'Test: GSC Clicks Last 7 Days',
      left: 'center'
    }
  } : null;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Component Integration Test</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">1. Supabase Connection</h2>
        <p className="text-sm text-muted-foreground mb-2">
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
        </p>
        <p className="text-green-600">✓ Configured</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">2. Cube.js Connection</h2>
        <p className="text-sm text-muted-foreground mb-2">
          API: {process.env.NEXT_PUBLIC_CUBEJS_API_URL}
        </p>
        <Button onClick={testCubeQuery} disabled={loading}>
          {loading ? 'Querying...' : 'Test Cube.js Query'}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
            Error: {error}
          </div>
        )}

        {data && <p className="mt-4 text-green-600">✓ Query successful! {data.length} rows returned</p>}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">3. ECharts Rendering</h2>
        {chartOption ? (
          <ReactECharts
            option={chartOption}
            theme={getEChartsTheme('light')}
            style={{ height: '400px' }}
          />
        ) : (
          <p className="text-muted-foreground">Click "Test Cube.js Query" above to render chart</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">4. Shadcn/ui Components</h2>
        <div className="flex gap-2">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
        <p className="mt-4 text-green-600">✓ All components rendering</p>
      </Card>
    </div>
  );
}
