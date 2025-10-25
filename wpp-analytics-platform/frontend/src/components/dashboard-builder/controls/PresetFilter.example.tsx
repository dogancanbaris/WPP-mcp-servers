import React, { useState } from 'react';
import { PresetFilter, FilterCombination, FilterPreset, useFilterPresets } from './PresetFilter';

/**
 * PresetFilter Examples
 *
 * Demonstrates various usage patterns for the PresetFilter component.
 */

// Example 1: Basic Usage
export const BasicPresetFilterExample: React.FC = () => {
  const [currentFilters, setCurrentFilters] = useState<FilterCombination>({
    dimensions: ['GoogleAds.campaignName'],
    filters: [
      {
        field: 'GoogleAds.status',
        operator: 'equals',
        value: 'ENABLED',
      },
    ],
    dateRange: {
      type: 'preset',
      preset: 'last_30_days',
    },
  });

  const handleApplyPreset = (preset: FilterPreset) => {
    console.log('Applying preset:', preset);
    setCurrentFilters(preset.filters);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Basic Preset Filter</h2>
      <PresetFilter
        currentFilters={currentFilters}
        onApplyPreset={handleApplyPreset}
        storageKey="example-basic-presets"
      />
    </div>
  );
};

// Example 2: With Custom Storage and Limits
export const CustomConfigExample: React.FC = () => {
  const [currentFilters] = useState<FilterCombination>({
    metrics: ['GoogleAds.clicks', 'GoogleAds.impressions', 'GoogleAds.cost'],
    dimensions: ['GoogleAds.campaignName', 'GoogleAds.adGroupName'],
    filters: [
      {
        field: 'GoogleAds.cost',
        operator: 'greaterThan',
        value: '1000',
      },
      {
        field: 'GoogleAds.conversions',
        operator: 'greaterThan',
        value: '10',
      },
    ],
    dateRange: {
      type: 'custom',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Custom Configuration</h2>
      <PresetFilter
        currentFilters={currentFilters}
        onApplyPreset={(preset) => console.log('Applied:', preset)}
        storageKey="custom-dashboard-presets"
        showFavoritesOnly={false}
        allowEdit={true}
        allowDelete={true}
        maxPresets={25}
      />
    </div>
  );
};

// Example 3: Read-Only Mode
export const ReadOnlyExample: React.FC = () => {
  const [currentFilters] = useState<FilterCombination>({
    dimensions: ['GSC.query', 'GSC.page'],
    filters: [
      {
        field: 'GSC.position',
        operator: 'lessThan',
        value: '10',
      },
    ],
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Read-Only Preset Filter</h2>
      <PresetFilter
        currentFilters={currentFilters}
        onApplyPreset={(preset) => console.log('Applied:', preset)}
        storageKey="readonly-presets"
        allowEdit={false}
        allowDelete={false}
      />
    </div>
  );
};

// Example 4: Using the Hook
export const HookExample: React.FC = () => {
  const {
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    toggleFavorite,
  } = useFilterPresets('hook-example-presets');

  const [currentFilters, setCurrentFilters] = useState<FilterCombination>({
    dimensions: ['GoogleAds.campaignName'],
    dateRange: {
      type: 'preset',
      preset: 'last_7_days',
    },
  });

  const handleSaveNew = () => {
    const newPreset = savePreset(
      'My Custom Preset',
      currentFilters,
      'This is a custom preset created via the hook'
    );
    console.log('Saved new preset:', newPreset);
  };

  const handleApply = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      const filters = applyPreset(preset);
      setCurrentFilters(filters);
      console.log('Applied preset:', preset.name);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Using the useFilterPresets Hook</h2>

      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Current Filters:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(currentFilters, null, 2)}
        </pre>
      </div>

      <button
        onClick={handleSaveNew}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Current as Preset
      </button>

      <div className="space-y-2">
        <h3 className="font-semibold">Saved Presets ({presets.length}):</h3>
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex items-center justify-between p-3 border rounded"
          >
            <div>
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-gray-600">{preset.description}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleFavorite(preset.id)}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
              >
                {preset.isFavorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button
                onClick={() => handleApply(preset.id)}
                className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                onClick={() => deletePreset(preset.id)}
                className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 5: Multi-Platform Analytics Dashboard
export const MultiPlatformExample: React.FC = () => {
  const [platform, setPlatform] = useState<'google-ads' | 'gsc' | 'analytics'>('google-ads');
  const [currentFilters, setCurrentFilters] = useState<FilterCombination>({
    dataSource: 'GoogleAds',
    dimensions: ['GoogleAds.campaignName'],
    metrics: ['GoogleAds.clicks', 'GoogleAds.impressions', 'GoogleAds.cost'],
    filters: [],
    dateRange: {
      type: 'preset',
      preset: 'last_30_days',
    },
  });

  const platformStorageKeys = {
    'google-ads': 'google-ads-presets',
    'gsc': 'gsc-presets',
    'analytics': 'analytics-presets',
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    setCurrentFilters(preset.filters);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Multi-Platform Dashboard</h2>

      {/* Platform Selector */}
      <div className="flex gap-2">
        {(['google-ads', 'gsc', 'analytics'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`px-4 py-2 rounded ${
              platform === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {p === 'google-ads' && 'Google Ads'}
            {p === 'gsc' && 'Search Console'}
            {p === 'analytics' && 'Analytics'}
          </button>
        ))}
      </div>

      {/* Platform-Specific Preset Filter */}
      <PresetFilter
        currentFilters={currentFilters}
        onApplyPreset={handleApplyPreset}
        storageKey={platformStorageKeys[platform]}
        showFavoritesOnly={false}
        maxPresets={30}
      />

      {/* Current Selection Display */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Current Configuration:</h3>
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">Platform:</span> {platform}
          </div>
          <div>
            <span className="font-medium">Data Source:</span>{' '}
            {currentFilters.dataSource}
          </div>
          <div>
            <span className="font-medium">Dimensions:</span>{' '}
            {currentFilters.dimensions?.join(', ') || 'None'}
          </div>
          <div>
            <span className="font-medium">Metrics:</span>{' '}
            {currentFilters.metrics?.join(', ') || 'None'}
          </div>
          <div>
            <span className="font-medium">Filters:</span>{' '}
            {currentFilters.filters?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 6: Team Collaboration (with Import/Export)
export const TeamCollaborationExample: React.FC = () => {
  const [currentFilters] = useState<FilterCombination>({
    dimensions: ['GoogleAds.campaignName'],
    dateRange: { type: 'preset', preset: 'last_30_days' },
  });

  const handleExportPresets = () => {
    const presets = localStorage.getItem('team-presets');
    if (presets) {
      const blob = new Blob([presets], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filter-presets-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);
          const existing = localStorage.getItem('team-presets');
          const existingPresets = existing ? JSON.parse(existing) : [];
          const merged = [...existingPresets, ...imported];
          localStorage.setItem('team-presets', JSON.stringify(merged));
          window.location.reload();
        } catch (error) {
          console.error('Failed to import presets:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Team Collaboration</h2>

      <div className="flex gap-2">
        <button
          onClick={handleExportPresets}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export Presets
        </button>
        <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
          Import Presets
          <input
            type="file"
            accept=".json"
            onChange={handleImportPresets}
            className="hidden"
          />
        </label>
      </div>

      <PresetFilter
        currentFilters={currentFilters}
        onApplyPreset={(preset) => console.log('Applied:', preset)}
        storageKey="team-presets"
      />
    </div>
  );
};

// Example 7: Complete Integration Demo
export const CompleteIntegrationExample: React.FC = () => {
  const [currentFilters, setCurrentFilters] = useState<FilterCombination>({
    dataSource: 'GoogleAds',
    dimensions: ['GoogleAds.campaignName'],
    metrics: ['GoogleAds.cost', 'GoogleAds.conversions'],
    filters: [
      {
        field: 'GoogleAds.status',
        operator: 'equals',
        value: 'ENABLED',
      },
    ],
    dateRange: {
      type: 'preset',
      preset: 'last_30_days',
    },
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleApplyPreset = async (preset: FilterPreset) => {
    console.log('Applying preset:', preset.name);
    setCurrentFilters(preset.filters);

    // Simulate fetching data with new filters
    setLoading(true);
    setTimeout(() => {
      // Mock data fetch
      setChartData([
        { campaign: 'Campaign A', cost: 1500, conversions: 45 },
        { campaign: 'Campaign B', cost: 2300, conversions: 67 },
        { campaign: 'Campaign C', cost: 890, conversions: 23 },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Complete Dashboard Integration</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Preset Filter */}
        <div className="lg:col-span-1">
          <PresetFilter
            currentFilters={currentFilters}
            onApplyPreset={handleApplyPreset}
            storageKey="complete-integration-presets"
          />
        </div>

        {/* Right: Chart Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-white border rounded-lg">
            <h3 className="font-semibold mb-3">Current Filters</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Data Source:</span>
                <span className="font-medium">{currentFilters.dataSource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">
                  {currentFilters.dimensions?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Metrics:</span>
                <span className="font-medium">
                  {currentFilters.metrics?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Field Filters:</span>
                <span className="font-medium">
                  {currentFilters.filters?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date Range:</span>
                <span className="font-medium">
                  {currentFilters.dateRange?.type === 'preset'
                    ? currentFilters.dateRange.preset
                    : 'Custom'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <h3 className="font-semibold mb-3">Chart Preview</h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading data...
              </div>
            ) : chartData.length > 0 ? (
              <div className="space-y-2">
                {chartData.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{row.campaign}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">
                        Cost: ${row.cost.toLocaleString()}
                      </span>
                      <span className="text-green-600">
                        Conv: {row.conversions}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  BasicPresetFilterExample,
  CustomConfigExample,
  ReadOnlyExample,
  HookExample,
  MultiPlatformExample,
  TeamCollaborationExample,
  CompleteIntegrationExample,
};
