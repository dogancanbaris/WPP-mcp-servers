# ParallelChart - Cube.js Semantic Layer Integration Guide

## Overview

This guide demonstrates how to integrate the `ParallelChart` component with the Cube.js semantic layer for the WPP Analytics Platform. It covers BigQuery data modeling, semantic layer configuration, and React component integration.

## Architecture

```
Marketing Platforms → BigQuery → Cube.js Semantic Layer → ParallelChart Component
                      (data lake)  (business logic)      (visualization)
```

## Step 1: BigQuery Data Model

### Google Ads Data Table

```sql
-- BigQuery table structure
CREATE TABLE `project.dataset.google_ads_performance` (
  date DATE,
  campaign_id STRING,
  campaign_name STRING,
  ad_group_id STRING,
  ad_group_name STRING,
  device STRING,
  country STRING,
  search_term STRING,
  match_type STRING,
  impressions INT64,
  clicks INT64,
  cost FLOAT64,
  conversions FLOAT64,
  conversion_value FLOAT64,
  quality_score INT64,
  ad_strength STRING,
  final_url STRING,
  position FLOAT64
);
```

### Search Console Data Table

```sql
CREATE TABLE `project.dataset.gsc_search_analytics` (
  date DATE,
  site_url STRING,
  query STRING,
  page STRING,
  country STRING,
  device STRING,
  impressions INT64,
  clicks INT64,
  position FLOAT64
);
```

### Analytics Data Table

```sql
CREATE TABLE `project.dataset.ga4_events` (
  date DATE,
  landing_page STRING,
  device_category STRING,
  country STRING,
  sessions INT64,
  bounce_rate FLOAT64,
  avg_session_duration FLOAT64,
  pageviews_per_session FLOAT64,
  goal_conversions INT64,
  goal_conversion_rate FLOAT64,
  transactions INT64
);
```

## Step 2: Cube.js Semantic Layer

### Google Ads Cube

```javascript
// model/GoogleAds.js
cube('GoogleAds', {
  sql: `SELECT * FROM \`project.dataset.google_ads_performance\``,

  joins: {
    SearchConsole: {
      sql: `${CUBE}.search_term = ${SearchConsole}.query AND ${CUBE}.date = ${SearchConsole}.date`,
      relationship: 'hasOne',
    },
    Analytics: {
      sql: `${CUBE}.final_url = ${Analytics}.landing_page AND ${CUBE}.date = ${Analytics}.date`,
      relationship: 'hasOne',
    },
  },

  dimensions: {
    campaignId: {
      sql: 'campaign_id',
      type: 'string',
      primaryKey: true,
    },
    campaignName: {
      sql: 'campaign_name',
      type: 'string',
    },
    adGroupName: {
      sql: 'ad_group_name',
      type: 'string',
    },
    device: {
      sql: 'device',
      type: 'string',
    },
    country: {
      sql: 'country',
      type: 'string',
    },
    searchTerm: {
      sql: 'search_term',
      type: 'string',
    },
    matchType: {
      sql: 'match_type',
      type: 'string',
    },
    adStrength: {
      sql: 'ad_strength',
      type: 'string',
    },
    finalUrl: {
      sql: 'final_url',
      type: 'string',
    },
    date: {
      sql: 'date',
      type: 'time',
    },
  },

  measures: {
    impressions: {
      sql: 'impressions',
      type: 'sum',
    },
    clicks: {
      sql: 'clicks',
      type: 'sum',
    },
    cost: {
      sql: 'cost',
      type: 'sum',
      format: 'currency',
    },
    conversions: {
      sql: 'conversions',
      type: 'sum',
    },
    conversionValue: {
      sql: 'conversion_value',
      type: 'sum',
      format: 'currency',
    },
    qualityScore: {
      sql: 'quality_score',
      type: 'avg',
    },
    position: {
      sql: 'position',
      type: 'avg',
    },

    // Calculated measures
    ctr: {
      sql: `SAFE_DIVIDE(${clicks}, ${impressions}) * 100`,
      type: 'number',
      format: 'percent',
    },
    cpc: {
      sql: `SAFE_DIVIDE(${cost}, ${clicks})`,
      type: 'number',
      format: 'currency',
    },
    conversionRate: {
      sql: `SAFE_DIVIDE(${conversions}, ${clicks}) * 100`,
      type: 'number',
      format: 'percent',
    },
    costPerConversion: {
      sql: `SAFE_DIVIDE(${cost}, ${conversions})`,
      type: 'number',
      format: 'currency',
    },
    roas: {
      sql: `SAFE_DIVIDE(${conversionValue}, ${cost})`,
      type: 'number',
    },
  },

  preAggregations: {
    // Daily campaign performance rollup
    dailyCampaign: {
      measures: [impressions, clicks, cost, conversions, conversionValue],
      dimensions: [campaignName, device, country],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '1 hour',
      },
    },

    // Search term performance (for parallel analysis)
    searchTerms: {
      measures: [impressions, clicks, cost, conversions],
      dimensions: [searchTerm, matchType, campaignName],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '2 hours',
      },
    },
  },
});
```

### Search Console Cube

```javascript
// model/SearchConsole.js
cube('SearchConsole', {
  sql: `SELECT * FROM \`project.dataset.gsc_search_analytics\``,

  dimensions: {
    query: {
      sql: 'query',
      type: 'string',
      primaryKey: true,
    },
    page: {
      sql: 'page',
      type: 'string',
    },
    country: {
      sql: 'country',
      type: 'string',
    },
    device: {
      sql: 'device',
      type: 'string',
    },
    date: {
      sql: 'date',
      type: 'time',
    },
  },

  measures: {
    impressions: {
      sql: 'impressions',
      type: 'sum',
    },
    clicks: {
      sql: 'clicks',
      type: 'sum',
    },
    position: {
      sql: 'position',
      type: 'avg',
    },
    ctr: {
      sql: `SAFE_DIVIDE(${clicks}, ${impressions}) * 100`,
      type: 'number',
      format: 'percent',
    },
  },

  preAggregations: {
    queryPerformance: {
      measures: [impressions, clicks, position],
      dimensions: [query, device, country],
      timeDimension: date,
      granularity: 'day',
      refreshKey: {
        every: '6 hours',
      },
    },
  },
});
```

### Analytics Cube

```javascript
// model/Analytics.js
cube('Analytics', {
  sql: `SELECT * FROM \`project.dataset.ga4_events\``,

  dimensions: {
    landingPage: {
      sql: 'landing_page',
      type: 'string',
      primaryKey: true,
    },
    deviceCategory: {
      sql: 'device_category',
      type: 'string',
    },
    country: {
      sql: 'country',
      type: 'string',
    },
    date: {
      sql: 'date',
      type: 'time',
    },
  },

  measures: {
    sessions: {
      sql: 'sessions',
      type: 'sum',
    },
    bounceRate: {
      sql: 'bounce_rate',
      type: 'avg',
      format: 'percent',
    },
    avgSessionDuration: {
      sql: 'avg_session_duration',
      type: 'avg',
    },
    pageviewsPerSession: {
      sql: 'pageviews_per_session',
      type: 'avg',
    },
    goalConversions: {
      sql: 'goal_conversions',
      type: 'sum',
    },
    goalConversionRate: {
      sql: 'goal_conversion_rate',
      type: 'avg',
      format: 'percent',
    },
    transactions: {
      sql: 'transactions',
      type: 'sum',
    },
    transactionsPerSession: {
      sql: `SAFE_DIVIDE(${transactions}, ${sessions})`,
      type: 'number',
    },
  },
});
```

## Step 3: React Component Integration

### Basic Campaign Performance

```tsx
import React from 'react';
import { ParallelChart, ParallelChartFormatters } from './ParallelChart';
import type { Query } from '@cubejs-client/core';

export const CampaignPerformanceDashboard: React.FC = () => {
  const query: Query = {
    measures: [
      'GoogleAds.impressions',
      'GoogleAds.clicks',
      'GoogleAds.ctr',
      'GoogleAds.cost',
      'GoogleAds.conversions',
      'GoogleAds.costPerConversion',
      'GoogleAds.roas',
    ],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [
      {
        dimension: 'GoogleAds.date',
        dateRange: 'last 30 days',
      },
    ],
    order: {
      'GoogleAds.cost': 'desc',
    },
    limit: 50, // Token-efficient: top 50 campaigns only
  };

  return (
    <ParallelChart
      query={query}
      title="Campaign Performance - Multi-Dimensional View"
      description="Identify optimization opportunities across key metrics"
      axes={[
        {
          name: 'GoogleAds.campaignName',
          label: 'Campaign',
          type: 'category',
        },
        {
          name: 'GoogleAds.impressions',
          label: 'Impressions',
          formatter: ParallelChartFormatters.number,
        },
        {
          name: 'GoogleAds.clicks',
          label: 'Clicks',
          formatter: ParallelChartFormatters.number,
        },
        {
          name: 'GoogleAds.ctr',
          label: 'CTR',
          formatter: ParallelChartFormatters.percent,
        },
        {
          name: 'GoogleAds.cost',
          label: 'Cost',
          formatter: ParallelChartFormatters.currency,
        },
        {
          name: 'GoogleAds.conversions',
          label: 'Conversions',
          formatter: ParallelChartFormatters.number,
        },
        {
          name: 'GoogleAds.costPerConversion',
          label: 'CPA',
          formatter: ParallelChartFormatters.currency,
          inverse: true, // Lower is better
        },
        {
          name: 'GoogleAds.roas',
          label: 'ROAS',
          formatter: (value) => `${value.toFixed(2)}x`,
        },
      ]}
      height={600}
      lineOpacity={0.3}
      enableBrush={true}
      showExport={true}
      colorByDimension="GoogleAds.roas"
      colorScheme={['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850']}
    />
  );
};
```

### Multi-Platform Search Analysis (Join Query)

```tsx
export const MultiPlatformSearchAnalysis: React.FC = () => {
  const query: Query = {
    measures: [
      // Paid metrics
      'GoogleAds.impressions',
      'GoogleAds.clicks',
      'GoogleAds.cost',
      'GoogleAds.position',
      // Organic metrics
      'SearchConsole.impressions',
      'SearchConsole.clicks',
      'SearchConsole.position',
    ],
    dimensions: ['GoogleAds.searchTerm'],
    timeDimensions: [
      {
        dimension: 'GoogleAds.date',
        dateRange: 'last 7 days',
      },
    ],
    filters: [
      {
        member: 'GoogleAds.impressions',
        operator: 'gt',
        values: ['1000'],
      },
    ],
    limit: 100,
  };

  return (
    <ParallelChart
      query={query}
      title="Paid vs Organic Search Performance"
      description="Cross-platform keyword analysis"
      axes={[
        {
          name: 'GoogleAds.searchTerm',
          label: 'Search Term',
          type: 'category',
        },
        {
          name: 'GoogleAds.impressions',
          label: 'Paid Impr',
          formatter: ParallelChartFormatters.number,
        },
        {
          name: 'GoogleAds.cost',
          label: 'Paid Cost',
          formatter: ParallelChartFormatters.currency,
        },
        {
          name: 'GoogleAds.position',
          label: 'Paid Pos',
          inverse: true,
          formatter: (value) => `#${value.toFixed(1)}`,
        },
        {
          name: 'SearchConsole.impressions',
          label: 'Organic Impr',
          formatter: ParallelChartFormatters.number,
        },
        {
          name: 'SearchConsole.clicks',
          label: 'Organic Clicks',
          formatter: ParallelChartFormatters.number,
        },
        {
          name: 'SearchConsole.position',
          label: 'Organic Pos',
          inverse: true,
          formatter: (value) => `#${value.toFixed(1)}`,
        },
      ]}
      height={600}
      smooth={true}
      lineOpacity={0.4}
      onLineClick={(index, data) => {
        console.log('Selected search term:', data['GoogleAds.searchTerm']);
        // Navigate to detail view or show drill-down
      }}
    />
  );
};
```

### Landing Page Full Funnel (3-Way Join)

```tsx
export const LandingPageFunnelAnalysis: React.FC = () => {
  const query: Query = {
    measures: [
      // Ads metrics
      'GoogleAds.clicks',
      'GoogleAds.cost',
      // Analytics metrics
      'Analytics.bounceRate',
      'Analytics.avgSessionDuration',
      'Analytics.pageviewsPerSession',
      'Analytics.goalConversionRate',
      'Analytics.transactionsPerSession',
    ],
    dimensions: ['GoogleAds.finalUrl'],
    timeDimensions: [
      {
        dimension: 'GoogleAds.date',
        dateRange: 'last 14 days',
      },
    ],
    filters: [
      {
        member: 'GoogleAds.clicks',
        operator: 'gt',
        values: ['100'],
      },
    ],
    limit: 30,
  };

  return (
    <ParallelChart
      query={query}
      title="Landing Page Performance - Full Funnel"
      description="Traffic acquisition to conversion analysis"
      axes={[
        {
          name: 'GoogleAds.finalUrl',
          label: 'Landing Page',
          type: 'category',
        },
        {
          name: 'GoogleAds.clicks',
          label: 'Clicks',
          formatter: ParallelChartFormatters.number,
        },
        {
          name: 'GoogleAds.cost',
          label: 'Cost',
          formatter: ParallelChartFormatters.currency,
        },
        {
          name: 'Analytics.bounceRate',
          label: 'Bounce Rate',
          inverse: true,
          formatter: ParallelChartFormatters.percent,
        },
        {
          name: 'Analytics.avgSessionDuration',
          label: 'Avg Duration',
          formatter: (value) => `${value.toFixed(0)}s`,
        },
        {
          name: 'Analytics.pageviewsPerSession',
          label: 'Pages/Session',
          formatter: (value) => value.toFixed(2),
        },
        {
          name: 'Analytics.goalConversionRate',
          label: 'Goal Conv Rate',
          formatter: ParallelChartFormatters.percent,
        },
        {
          name: 'Analytics.transactionsPerSession',
          label: 'Trans/Session',
          formatter: (value) => value.toFixed(3),
        },
      ]}
      height={650}
      lineOpacity={0.35}
      colorByDimension="Analytics.goalConversionRate"
      showExport={true}
    />
  );
};
```

## Step 4: Dashboard Integration

### Complete Dashboard with Multiple Parallel Charts

```tsx
import React, { useState } from 'react';
import { CubeProvider } from '@cubejs-client/react';
import cubejs from '@cubejs-client/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

const cubejsApi = cubejs(process.env.REACT_APP_CUBEJS_TOKEN!, {
  apiUrl: process.env.REACT_APP_CUBEJS_API_URL!,
});

export const MultiDimensionalDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('last 30 days');

  return (
    <CubeProvider cubejsApi={cubejsApi}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Multi-Dimensional Analytics</h1>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="landing-pages">Landing Pages</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <CampaignPerformanceDashboard dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="keywords">
            <MultiPlatformSearchAnalysis dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="landing-pages">
            <LandingPageFunnelAnalysis dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="segments">
            <DeviceGeoPerformance dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </CubeProvider>
  );
};
```

## Step 5: Performance Optimization

### Token-Efficient Queries

Always aggregate in Cube.js, limit results:

```tsx
// ❌ BAD: Returns 50,000 rows
const badQuery: Query = {
  dimensions: ['GoogleAds.searchTerm'],
  measures: ['GoogleAds.clicks'],
  // No limit, no aggregation
};

// ✅ GOOD: Returns top 100 rows
const goodQuery: Query = {
  dimensions: ['GoogleAds.searchTerm'],
  measures: ['GoogleAds.clicks'],
  order: { 'GoogleAds.clicks': 'desc' },
  limit: 100,
};
```

### Pre-Aggregations for Speed

Configure in Cube.js for instant queries:

```javascript
preAggregations: {
  parallelAnalysis: {
    measures: [
      impressions,
      clicks,
      cost,
      conversions,
      conversionValue,
    ],
    dimensions: [
      campaignName,
      device,
      country,
      searchTerm,
    ],
    timeDimension: date,
    granularity: 'day',
    refreshKey: {
      every: '1 hour',
    },
    // Creates BigQuery rollup table for instant queries
  },
}
```

## Step 6: Security & Multi-Tenancy

### Row-Level Security in Cube.js

```javascript
cube('GoogleAds', {
  sql: `
    SELECT * FROM google_ads_performance
    WHERE brand_id = \${SECURITY_CONTEXT.brand_id}
  `,
  // Each brand only sees their data
});
```

### Department-Specific Dashboards

```tsx
export const DepartmentDashboard: React.FC<{ department: string }> = ({ department }) => {
  const query: Query = {
    measures: ['GoogleAds.cost', 'GoogleAds.conversions'],
    dimensions: ['GoogleAds.campaignName'],
    filters: [
      {
        member: 'GoogleAds.department',
        operator: 'equals',
        values: [department],
      },
    ],
    limit: 50,
  };

  return <ParallelChart query={query} axes={[/* ... */]} />;
};
```

## Step 7: Real-Time Monitoring

### Auto-Refreshing Dashboard

```tsx
export const RealTimeMonitoring: React.FC = () => {
  const query: Query = {
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'today',
    }],
    limit: 20,
  };

  return (
    <ParallelChart
      query={query}
      axes={[/* ... */]}
      refreshInterval={5 * 60 * 1000} // Refresh every 5 minutes
      title="Real-Time Campaign Performance"
      description="Last updated: {timestamp}"
    />
  );
};
```

## Troubleshooting

### Query Too Slow

1. Check pre-aggregations are configured
2. Reduce limit from 100 to 50
3. Add more specific filters
4. Use date range picker to limit time range

### Too Many Categories

```tsx
// Limit categorical axes to top N
query={{
  dimensions: ['GoogleAds.campaignName'],
  order: { 'GoogleAds.cost': 'desc' },
  limit: 30, // Top 30 only
}}
```

### Lines Overlap

```tsx
<ParallelChart
  lineOpacity={0.2} // Reduce opacity
  smooth={true}     // Enable smoothing
/>
```

## Resources

- [Cube.js Documentation](https://cube.dev/docs)
- [ECharts Parallel Coordinates](https://echarts.apache.org/en/option.html#series-parallel)
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)
- [WPP Platform Architecture](/docs/architecture/CLAUDE.md)

## Next Steps

1. Create Cube.js data models for your BigQuery tables
2. Configure pre-aggregations for performance
3. Build React components with ParallelChart
4. Test with sample data (≤100 rows)
5. Deploy to production with monitoring
