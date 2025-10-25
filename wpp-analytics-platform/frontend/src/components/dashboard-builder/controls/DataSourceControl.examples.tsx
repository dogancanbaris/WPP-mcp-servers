/**
 * DataSourceControl Usage Examples
 *
 * This file demonstrates various real-world usage patterns for the DataSourceControl component
 * in the WPP Analytics Platform dashboard builder.
 */

import React, { useState } from 'react';
import {
  DataSourceControl,
  commonDataSources,
  createDataSource,
  type DataSourceOption,
} from './DataSourceControl';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * Example 1: Basic Usage
 * Simplest form - just select a data source
 */
export function BasicUsageExample() {
  const [source, setSource] = useState('gsc-default');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Usage</CardTitle>
        <CardDescription>Simple data source selection</CardDescription>
      </CardHeader>
      <CardContent>
        <DataSourceControl
          sources={commonDataSources}
          value={source}
          onChange={setSource}
        />

        <div className="mt-4 text-sm text-gray-600">
          Selected: <code className="bg-gray-100 px-2 py-1 rounded">{source}</code>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Multi-Property Setup
 * Choose from multiple GSC properties
 */
export function MultiPropertyExample() {
  const [selectedProperty, setSelectedProperty] = useState('gsc-main');

  const gscProperties: DataSourceOption[] = [
    createDataSource(
      'gsc-main',
      'Main Website',
      'gsc',
      'https://example.com - Primary website organic search data'
    ),
    createDataSource(
      'gsc-blog',
      'Blog Subdomain',
      'gsc',
      'https://blog.example.com - Blog content organic search data'
    ),
    createDataSource(
      'gsc-shop',
      'E-commerce Site',
      'gsc',
      'https://shop.example.com - Product pages organic search data'
    ),
    createDataSource(
      'gsc-mobile',
      'Mobile App Deep Links',
      'gsc',
      'android-app://com.example.app - App indexing data'
    ),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Property Selection</CardTitle>
        <CardDescription>Choose from multiple Search Console properties</CardDescription>
      </CardHeader>
      <CardContent>
        <DataSourceControl
          sources={gscProperties}
          value={selectedProperty}
          onChange={setSelectedProperty}
          label="Search Console Property"
        />
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Data Blending
 * Select primary and secondary sources for data blending
 */
export function DataBlendingExample() {
  const [primarySource, setPrimarySource] = useState('gsc-default');
  const [secondarySource, setSecondarySource] = useState('');
  const [blendEnabled, setBlendEnabled] = useState(false);

  // Filter out the primary source from secondary options
  const secondarySources = commonDataSources.filter((s) => s.id !== primarySource);

  const handleBlendToggle = (enabled: boolean) => {
    setBlendEnabled(enabled);
    if (!enabled) {
      setSecondarySource('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Blending</CardTitle>
        <CardDescription>Combine data from multiple sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataSourceControl
          sources={commonDataSources}
          value={primarySource}
          onChange={setPrimarySource}
          label="Primary Data Source"
        />

        <div className="flex items-center gap-3 py-2 border-t border-b">
          <Switch
            id="blend-toggle"
            checked={blendEnabled}
            onCheckedChange={handleBlendToggle}
          />
          <label htmlFor="blend-toggle" className="text-sm font-medium text-gray-700">
            Blend data from multiple sources
          </label>
        </div>

        {blendEnabled && (
          <DataSourceControl
            sources={secondarySources}
            value={secondarySource}
            onChange={setSecondarySource}
            label="Secondary Data Source"
            placeholder="Select secondary source to blend"
          />
        )}

        {blendEnabled && primarySource && secondarySource && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <strong>Blend Configuration:</strong>
            <ul className="mt-2 space-y-1 text-blue-800">
              <li>Primary: {commonDataSources.find((s) => s.id === primarySource)?.name}</li>
              <li>Secondary: {commonDataSources.find((s) => s.id === secondarySource)?.name}</li>
              <li>Join Key: Will be configured in next step</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Dashboard Configuration
 * Full dashboard setup with data source and chart type
 */
export function DashboardConfigExample() {
  const [dataSource, setDataSource] = useState('gsc-default');
  const [chartType, setChartType] = useState('time_series');
  const [dateRange, setDateRange] = useState('last_30_days');

  const chartTypes = [
    { value: 'time_series', label: 'Time Series' },
    { value: 'table', label: 'Table' },
    { value: 'pie_chart', label: 'Pie Chart' },
    { value: 'bar_chart', label: 'Bar Chart' },
  ];

  const dateRanges = [
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'last_90_days', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Configuration</CardTitle>
        <CardDescription>Complete chart setup with data source</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DataSourceControl
          sources={commonDataSources}
          value={dataSource}
          onChange={setDataSource}
          label="Data Source"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
          >
            {chartTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <Button className="w-full">Create Chart</Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Campaign Comparison
 * Compare data across different ad accounts or properties
 */
export function CampaignComparisonExample() {
  const [sourceA, setSourceA] = useState('');
  const [sourceB, setSourceB] = useState('');

  const adAccounts: DataSourceOption[] = [
    createDataSource('ads-brand', 'Brand Campaign Account', 'ads', 'Branded keywords and trademarks'),
    createDataSource('ads-generic', 'Generic Campaign Account', 'ads', 'Non-branded keywords'),
    createDataSource('ads-competitor', 'Competitor Campaign Account', 'ads', 'Competitor bidding'),
    createDataSource('ads-shopping', 'Shopping Campaign Account', 'ads', 'Product listing ads'),
  ];

  const canCompare = sourceA && sourceB && sourceA !== sourceB;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Comparison</CardTitle>
        <CardDescription>Compare performance across different campaigns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataSourceControl
            sources={adAccounts}
            value={sourceA}
            onChange={setSourceA}
            label="Campaign A"
            placeholder="Select first campaign"
          />

          <DataSourceControl
            sources={adAccounts}
            value={sourceB}
            onChange={setSourceB}
            label="Campaign B"
            placeholder="Select second campaign"
          />
        </div>

        {canCompare && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            Ready to compare:
            <br />
            <strong>{adAccounts.find((s) => s.id === sourceA)?.name}</strong> vs{' '}
            <strong>{adAccounts.find((s) => s.id === sourceB)?.name}</strong>
          </div>
        )}

        <Button disabled={!canCompare} className="w-full">
          Compare Campaigns
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 6: Size Variants
 * Demonstrate different size options
 */
export function SizeVariantsExample() {
  const [sm, setSm] = useState('gsc-default');
  const [md, setMd] = useState('ads-default');
  const [lg, setLg] = useState('analytics-default');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Size Variants</CardTitle>
        <CardDescription>Different control sizes for various contexts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-xs text-gray-500 mb-2">Small - Use in compact toolbars</p>
          <DataSourceControl
            sources={commonDataSources}
            value={sm}
            onChange={setSm}
            size="sm"
            label="Small Size"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Default - Standard forms</p>
          <DataSourceControl
            sources={commonDataSources}
            value={md}
            onChange={setMd}
            size="default"
            label="Default Size"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Large - Prominent forms</p>
          <DataSourceControl
            sources={commonDataSources}
            value={lg}
            onChange={setLg}
            size="lg"
            label="Large Size"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 7: Conditional Rendering
 * Show/hide based on user permissions or data availability
 */
export function ConditionalRenderingExample() {
  const [source, setSource] = useState('gsc-default');
  const [hasAdsAccess, setHasAdsAccess] = useState(true);
  const [hasAnalyticsAccess, setHasAnalyticsAccess] = useState(true);

  // Filter sources based on access permissions
  const availableSources = commonDataSources.filter((s) => {
    if (s.type === 'ads' && !hasAdsAccess) return false;
    if (s.type === 'analytics' && !hasAnalyticsAccess) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditional Rendering</CardTitle>
        <CardDescription>Filter sources based on user permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Switch
              id="ads-access"
              checked={hasAdsAccess}
              onCheckedChange={setHasAdsAccess}
            />
            <label htmlFor="ads-access" className="text-sm text-gray-700">
              Has Google Ads Access
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="analytics-access"
              checked={hasAnalyticsAccess}
              onCheckedChange={setHasAnalyticsAccess}
            />
            <label htmlFor="analytics-access" className="text-sm text-gray-700">
              Has Analytics Access
            </label>
          </div>
        </div>

        <DataSourceControl
          sources={availableSources}
          value={availableSources.some((s) => s.id === source) ? source : ''}
          onChange={setSource}
          label="Available Data Sources"
        />

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          {availableSources.length} of {commonDataSources.length} sources available
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 8: All Examples Together
 * Gallery view of all examples
 */
export function AllExamplesGallery() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50 min-h-screen">
      <BasicUsageExample />
      <MultiPropertyExample />
      <DataBlendingExample />
      <DashboardConfigExample />
      <CampaignComparisonExample />
      <SizeVariantsExample />
      <ConditionalRenderingExample />
    </div>
  );
}

export default AllExamplesGallery;
