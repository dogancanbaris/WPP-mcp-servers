/**
 * Global Filters Usage Examples
 *
 * Demonstrates how to integrate global filters with charts and dashboards.
 */

import React from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { GlobalFilters, CompactFilterBar } from '@/components/dashboard-builder/GlobalFilters';
import { useGlobalFilters, useDateRangeFilter } from '@/hooks/useGlobalFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Example 1: Dashboard with Global Filters
 */
export const DashboardWithGlobalFilters: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Global Filter Bar */}
      <GlobalFilters showAddButton />

      {/* Charts that automatically use global filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CampaignPerformanceChart />
        <SearchAnalyticsChart />
        <ConversionFunnelChart />
        <DevicePerformanceChart />
      </div>
    </div>
  );
};

/**
 * Example 2: Chart with Automatic Global Filters
 */
export const CampaignPerformanceChart: React.FC = () => {
  const { applyToQuery, hasFilters, filterSummary } = useGlobalFilters({
    dateDimension: 'GoogleAds.date',
  });

  // Base query
  const baseQuery = {
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
    dimensions: ['GoogleAds.campaignName'],
    timeDimensions: [
      {
        dimension: 'GoogleAds.date',
        granularity: 'day',
      },
    ],
    order: {
      'GoogleAds.cost': 'desc',
    },
    limit: 10,
  };

  // Apply global filters
  const query = applyToQuery(baseQuery);

  const { resultSet, isLoading, error } = useCubeQuery(query);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-destructive">Error: {error.toString()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = resultSet?.chartPivot() || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Campaign Performance</CardTitle>
          <CompactFilterBar />
        </div>
        {hasFilters && (
          <p className="text-sm text-muted-foreground mt-1">
            Filtered: {filterSummary}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="GoogleAds.impressions"
              stroke="#8884d8"
              name="Impressions"
            />
            <Line
              type="monotone"
              dataKey="GoogleAds.clicks"
              stroke="#82ca9d"
              name="Clicks"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Example 3: Chart with Date Range Filter Only
 */
export const SearchAnalyticsChart: React.FC = () => {
  const { applyToQuery } = useDateRangeFilter('SearchConsole.date');

  const baseQuery = {
    measures: ['SearchConsole.clicks', 'SearchConsole.impressions', 'SearchConsole.ctr'],
    dimensions: ['SearchConsole.page'],
    timeDimensions: [
      {
        dimension: 'SearchConsole.date',
        granularity: 'day',
      },
    ],
    order: {
      'SearchConsole.clicks': 'desc',
    },
    limit: 20,
  };

  const query = applyToQuery(baseQuery);
  const { resultSet, isLoading } = useCubeQuery(query);

  if (isLoading) {
    return <Card><CardContent className="h-64">Loading...</CardContent></Card>;
  }

  const chartData = resultSet?.chartPivot() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="SearchConsole.clicks"
              stroke="#8884d8"
              name="Clicks"
            />
            <Line
              type="monotone"
              dataKey="SearchConsole.impressions"
              stroke="#82ca9d"
              name="Impressions"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Example 4: Chart with Custom Filter Transformation
 */
export const ConversionFunnelChart: React.FC = () => {
  const { applyToQuery } = useGlobalFilters({
    dateDimension: 'Analytics.date',
    // Custom transformation: Add a required dimension filter
    transformFilters: (filters) => [
      ...filters,
      {
        member: 'Analytics.deviceCategory',
        operator: 'notEquals',
        values: ['tablet'], // Exclude tablets for this chart
      },
    ],
  });

  const baseQuery = {
    measures: [
      'Analytics.sessions',
      'Analytics.bounceRate',
      'Analytics.conversions',
    ],
    dimensions: ['Analytics.sessionSource'],
    timeDimensions: [
      {
        dimension: 'Analytics.date',
        granularity: 'day',
      },
    ],
  };

  const query = applyToQuery(baseQuery);
  const { resultSet, isLoading } = useCubeQuery(query);

  if (isLoading) {
    return <Card><CardContent className="h-64">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel (Desktop & Mobile)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart implementation */}
        <div className="h-64">Funnel chart here...</div>
      </CardContent>
    </Card>
  );
};

/**
 * Example 5: Chart that Ignores Global Filters
 */
export const DevicePerformanceChart: React.FC = () => {
  // This chart doesn't use global filters
  const { filters } = useGlobalFilters({ disabled: true });

  const query = {
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks'],
    dimensions: ['GoogleAds.device'],
    timeDimensions: [
      {
        dimension: 'GoogleAds.date',
        dateRange: 'last 30 days', // Fixed date range
      },
    ],
  };

  const { resultSet, isLoading } = useCubeQuery(query);

  if (isLoading) {
    return <Card><CardContent className="h-64">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Performance (Last 30 Days)</CardTitle>
        <p className="text-sm text-muted-foreground">
          This chart uses a fixed date range and ignores global filters
        </p>
      </CardHeader>
      <CardContent>
        {/* Chart implementation */}
        <div className="h-64">Device chart here...</div>
      </CardContent>
    </Card>
  );
};

/**
 * Example 6: Programmatic Filter Management
 */
export const ProgrammaticFilterExample: React.FC = () => {
  const { useFilterStore } = require('@/store/filterStore');
  const {
    addDimensionFilter,
    addMeasureFilter,
    setDateRangePreset,
    clearAllFilters,
  } = useFilterStore();

  const handleSetTopCampaigns = () => {
    // Add dimension filter for top campaigns
    addDimensionFilter(
      'GoogleAds.campaignName',
      'inList',
      ['Campaign A', 'Campaign B', 'Campaign C'],
      'Top 3 Campaigns'
    );
  };

  const handleSetHighSpendFilter = () => {
    // Add measure filter for high spend
    addMeasureFilter(
      'GoogleAds.cost',
      'gt',
      1000,
      'Cost > $1,000'
    );
  };

  const handleSetLast7Days = () => {
    setDateRangePreset('last7Days');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Filter Presets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <button
          onClick={handleSetTopCampaigns}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Show Top 3 Campaigns
        </button>
        <button
          onClick={handleSetHighSpendFilter}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Show High Spend (&gt;$1,000)
        </button>
        <button
          onClick={handleSetLast7Days}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Last 7 Days
        </button>
        <button
          onClick={clearAllFilters}
          className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded"
        >
          Clear All Filters
        </button>
      </CardContent>
    </Card>
  );
};

/**
 * Example 7: Filter State Access
 */
export const FilterStateExample: React.FC = () => {
  const { useFilterStore } = require('@/store/filterStore');
  const { filters, getActiveFilters, getCubeJSFilters, getFilterSummary } = useFilterStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter State Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Summary</h4>
          <p>{getFilterSummary()}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">All Filters ({filters.length})</h4>
          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Active Filters ({getActiveFilters().length})</h4>
          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
            {JSON.stringify(getActiveFilters(), null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Cube.js Format</h4>
          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
            {JSON.stringify(getCubeJSFilters(), null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWithGlobalFilters;
