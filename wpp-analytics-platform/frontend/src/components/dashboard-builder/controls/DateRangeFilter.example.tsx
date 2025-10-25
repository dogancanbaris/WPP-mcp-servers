"use client";

import React, { useState } from 'react';
import {
  DateRangeFilter,
  DateRangeFilterValue,
  toCubeTimeDimension,
  toCubeTimeDimensionWithComparison,
  CubeTimeDimension,
} from './DateRangeFilter';
import { Card } from '@/components/ui/card';

/**
 * DateRangeFilter Examples
 *
 * This file demonstrates various use cases for the DateRangeFilter component:
 * 1. Basic usage with presets
 * 2. Custom range selection
 * 3. Comparison mode
 * 4. Integration with Cube.js
 * 5. Dashboard-wide filter application
 */

// Example 1: Basic Usage
export function BasicDateRangeExample() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: {
      type: 'preset',
      preset: 'last30days',
    },
    comparison: { enabled: false },
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Basic Date Range Selection</h3>
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
      />
      <div className="mt-4 p-4 bg-muted rounded-md">
        <pre className="text-xs">
          {JSON.stringify(dateRange, null, 2)}
        </pre>
      </div>
    </Card>
  );
}

// Example 2: With Comparison Mode
export function ComparisonModeExample() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: {
      type: 'preset',
      preset: 'last7days',
    },
    comparison: { enabled: true },
  });

  const cubeQuery = toCubeTimeDimensionWithComparison(
    dateRange,
    'Orders.createdAt',
    'day'
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">With Comparison Mode</h3>
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        showComparison={true}
      />
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium">Generated Cube.js Query:</div>
        <div className="p-4 bg-muted rounded-md">
          <pre className="text-xs">
            {JSON.stringify(cubeQuery, null, 2)}
          </pre>
        </div>
      </div>
    </Card>
  );
}

// Example 3: Dashboard Integration with Apply Button
export function DashboardIntegrationExample() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: {
      type: 'preset',
      preset: 'thisMonth',
    },
    comparison: { enabled: false },
  });

  const [appliedFilter, setAppliedFilter] = useState<CubeTimeDimension | null>(null);

  const handleApply = (timeDimension: CubeTimeDimension) => {
    setAppliedFilter(timeDimension);
    console.log('Applying filter to dashboard:', timeDimension);
    // In real usage, this would update dashboard context
    // or trigger a global filter state update
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Dashboard Integration</h3>
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        onApply={handleApply}
        dimension="GoogleAds.date"
        granularity="day"
      />
      {appliedFilter && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm font-medium text-green-900 mb-2">
            Active Filter:
          </div>
          <pre className="text-xs text-green-800">
            {JSON.stringify(appliedFilter, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}

// Example 4: Complete Cube.js Integration
export function CubeJsIntegrationExample() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: {
      type: 'preset',
      preset: 'last30days',
    },
    comparison: { enabled: false },
  });

  // Convert to Cube.js query format
  const cubeTimeDimension = toCubeTimeDimension(
    dateRange,
    'GoogleAds.date',
    'day'
  );

  // Example: Complete Cube.js query
  const cubeQuery = cubeTimeDimension
    ? {
        measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
        dimensions: ['GoogleAds.campaignName'],
        timeDimensions: [cubeTimeDimension],
        order: {
          'GoogleAds.cost': 'desc',
        },
        limit: 100,
      }
    : null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Cube.js Integration</h3>
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        dimension="GoogleAds.date"
        granularity="day"
      />
      <div className="mt-4 space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Complete Cube.js Query:</div>
          <div className="p-4 bg-muted rounded-md">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(cubeQuery, null, 2)}
            </pre>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          This query can be used with useCubeQuery() hook:
          <code className="block mt-2 p-2 bg-gray-900 text-gray-100 rounded">
            {`const { resultSet } = useCubeQuery(${JSON.stringify(cubeQuery, null, 2)});`}
          </code>
        </div>
      </div>
    </Card>
  );
}

// Example 5: Multi-Platform Search Dashboard
export function MultiPlatformSearchExample() {
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: {
      type: 'preset',
      preset: 'last28days',
    },
    comparison: { enabled: true },
  });

  const [activeGranularity, setActiveGranularity] = useState<'day' | 'week' | 'month'>('day');

  const cubeQueries = {
    googleAds: toCubeTimeDimensionWithComparison(
      dateRange,
      'GoogleAds.date',
      activeGranularity
    ),
    searchConsole: toCubeTimeDimensionWithComparison(
      dateRange,
      'SearchConsole.date',
      activeGranularity
    ),
    analytics: toCubeTimeDimensionWithComparison(
      dateRange,
      'Analytics.date',
      activeGranularity
    ),
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Multi-Platform Search Dashboard</h3>

      <div className="space-y-4">
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          showComparison={true}
          dimension="date"
          granularity={activeGranularity}
        />

        <div className="flex gap-2">
          <span className="text-sm font-medium">Granularity:</span>
          {(['day', 'week', 'month'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setActiveGranularity(g)}
              className={`px-3 py-1 text-xs rounded ${
                activeGranularity === g
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Generated Queries for Each Platform:</div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-xs font-semibold text-blue-900 mb-1">Google Ads Query:</div>
            <pre className="text-xs text-blue-800">
              {JSON.stringify(cubeQueries.googleAds, null, 2)}
            </pre>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-xs font-semibold text-green-900 mb-1">Search Console Query:</div>
            <pre className="text-xs text-green-800">
              {JSON.stringify(cubeQueries.searchConsole, null, 2)}
            </pre>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <div className="text-xs font-semibold text-purple-900 mb-1">Analytics Query:</div>
            <pre className="text-xs text-purple-800">
              {JSON.stringify(cubeQueries.analytics, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Example 6: All Examples Gallery
export default function DateRangeFilterExamples() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">DateRangeFilter Component</h1>
        <p className="text-muted-foreground">
          Interactive calendar control for dashboard-wide date filtering with Cube.js integration
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BasicDateRangeExample />
        <ComparisonModeExample />
        <DashboardIntegrationExample />
        <CubeJsIntegrationExample />
      </div>

      <div className="col-span-full">
        <MultiPlatformSearchExample />
      </div>
    </div>
  );
}
