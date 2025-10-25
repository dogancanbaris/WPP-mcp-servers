# PresetFilter Component

## Overview

The `PresetFilter` component allows users to save, load, and quickly apply filter combinations in WPP Analytics Platform dashboards. It provides a complete preset management system with favorites, usage tracking, and localStorage persistence.

## Features

- **Save Current Filters**: Capture current dashboard filter state as a named preset
- **Quick Apply**: One-click application of saved filter combinations
- **Favorites System**: Mark frequently-used presets as favorites for easy access
- **Usage Tracking**: Automatically tracks how often each preset is applied
- **Local Storage**: Persists presets across browser sessions
- **Import/Export**: Share presets with team members (via custom implementation)
- **Full CRUD**: Create, read, update, and delete presets
- **Smart Sorting**: Presets sorted by favorites, usage count, and recency
- **Responsive UI**: Works on mobile and desktop

## Installation

```tsx
import { PresetFilter, useFilterPresets } from '@/components/dashboard-builder/controls';
```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { PresetFilter, FilterCombination } from './PresetFilter';

function MyDashboard() {
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

  const handleApplyPreset = (preset) => {
    setCurrentFilters(preset.filters);
    // Trigger dashboard refresh with new filters
  };

  return (
    <PresetFilter
      currentFilters={currentFilters}
      onApplyPreset={handleApplyPreset}
      storageKey="my-dashboard-presets"
    />
  );
}
```

## Props

### PresetFilterProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentFilters` | `FilterCombination` | **Required** | Current active filter state |
| `onApplyPreset` | `(preset: FilterPreset) => void` | **Required** | Callback when preset is applied |
| `storageKey` | `string` | `'wpp-filter-presets'` | localStorage key for persistence |
| `showFavoritesOnly` | `boolean` | `false` | Show only favorite presets by default |
| `allowEdit` | `boolean` | `true` | Allow editing preset names/descriptions |
| `allowDelete` | `boolean` | `true` | Allow deleting presets |
| `maxPresets` | `number` | `50` | Maximum number of presets allowed |
| `className` | `string` | `''` | Custom CSS classes |

## Type Definitions

### FilterCombination

```typescript
interface FilterCombination {
  dimensions?: string[];
  metrics?: string[];
  filters?: Array<{
    field: string;
    operator: string;
    value: string | string[];
  }>;
  dateRange?: {
    type: 'preset' | 'custom';
    preset?: string;
    startDate?: string;
    endDate?: string;
  };
  dataSource?: string;
  [key: string]: unknown; // Allow custom properties
}
```

### FilterPreset

```typescript
interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: FilterCombination;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}
```

## Hook API: useFilterPresets

For programmatic control of presets:

```tsx
const {
  presets,
  savePreset,
  applyPreset,
  deletePreset,
  toggleFavorite,
  updatePreset,
} = useFilterPresets('my-storage-key');

// Save a new preset
savePreset('High ROI Campaigns', {
  filters: [{ field: 'GoogleAds.roas', operator: 'greaterThan', value: '300' }],
  dateRange: { type: 'preset', preset: 'last_30_days' }
});

// Apply a preset
const preset = presets.find(p => p.name === 'High ROI Campaigns');
if (preset) {
  const filters = applyPreset(preset);
  // Use filters in your dashboard
}

// Toggle favorite
toggleFavorite(preset.id);

// Delete a preset
deletePreset(preset.id);

// Update a preset
updatePreset(preset.id, { name: 'Updated Name', description: 'New description' });
```

## Advanced Examples

### Multi-Platform Dashboard

Different presets for each marketing platform:

```tsx
function MultiPlatformDashboard() {
  const [platform, setPlatform] = useState<'google-ads' | 'gsc' | 'analytics'>('google-ads');

  const storageKeys = {
    'google-ads': 'google-ads-presets',
    'gsc': 'gsc-presets',
    'analytics': 'analytics-presets',
  };

  return (
    <PresetFilter
      currentFilters={currentFilters}
      onApplyPreset={handleApply}
      storageKey={storageKeys[platform]}
    />
  );
}
```

### Read-Only Mode

For viewing shared presets without modification:

```tsx
<PresetFilter
  currentFilters={currentFilters}
  onApplyPreset={handleApply}
  allowEdit={false}
  allowDelete={false}
/>
```

### Team Sharing (Import/Export)

Share presets with team members:

```tsx
function ExportPresets() {
  const handleExport = () => {
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

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imported = JSON.parse(e.target.result);
        const existing = JSON.parse(localStorage.getItem('team-presets') || '[]');
        localStorage.setItem('team-presets', JSON.stringify([...existing, ...imported]));
        window.location.reload();
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <button onClick={handleExport}>Export Presets</button>
      <input type="file" accept=".json" onChange={handleImport} />
    </>
  );
}
```

## Integration with Cube.js

The PresetFilter integrates seamlessly with Cube.js queries:

```tsx
import { useCubeQuery } from '@cubejs-client/react';

function CubeJsIntegration() {
  const [currentFilters, setCurrentFilters] = useState<FilterCombination>({
    dimensions: ['GoogleAds.campaignName'],
    filters: [],
    dateRange: { type: 'preset', preset: 'last_30_days' }
  });

  // Convert to Cube.js query
  const cubeQuery = {
    measures: currentFilters.metrics || ['GoogleAds.clicks'],
    dimensions: currentFilters.dimensions || [],
    filters: (currentFilters.filters || []).map(f => ({
      member: f.field,
      operator: f.operator,
      values: Array.isArray(f.value) ? f.value : [f.value]
    })),
    timeDimensions: currentFilters.dateRange ? [{
      dimension: 'GoogleAds.date',
      dateRange: currentFilters.dateRange.preset ||
                 [currentFilters.dateRange.startDate, currentFilters.dateRange.endDate]
    }] : []
  };

  const { resultSet, isLoading } = useCubeQuery(cubeQuery);

  const handleApplyPreset = (preset: FilterPreset) => {
    setCurrentFilters(preset.filters);
    // Cube.js query will automatically refetch
  };

  return (
    <div>
      <PresetFilter
        currentFilters={currentFilters}
        onApplyPreset={handleApplyPreset}
      />
      {isLoading ? 'Loading...' : <Chart data={resultSet} />}
    </div>
  );
}
```

## Complete Dashboard Example

Full integration with dashboard builder:

```tsx
import { PresetFilter, useFilterPresets } from './controls';

function CompleteDashboard() {
  const [currentFilters, setCurrentFilters] = useState<FilterCombination>({
    dataSource: 'GoogleAds',
    dimensions: ['GoogleAds.campaignName'],
    metrics: ['GoogleAds.cost', 'GoogleAds.conversions'],
    filters: [
      { field: 'GoogleAds.status', operator: 'equals', value: 'ENABLED' }
    ],
    dateRange: { type: 'preset', preset: 'last_30_days' }
  });

  const handleApplyPreset = (preset: FilterPreset) => {
    setCurrentFilters(preset.filters);
    // Trigger dashboard refresh
    fetchDashboardData(preset.filters);
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Sidebar with PresetFilter */}
      <aside className="col-span-1">
        <PresetFilter
          currentFilters={currentFilters}
          onApplyPreset={handleApplyPreset}
          storageKey="main-dashboard-presets"
        />
      </aside>

      {/* Main dashboard area */}
      <main className="col-span-3">
        <DashboardCharts filters={currentFilters} />
      </main>
    </div>
  );
}
```

## Storage Management

### Clear All Presets

```tsx
localStorage.removeItem('wpp-filter-presets');
```

### Check Storage Size

```tsx
const presets = localStorage.getItem('wpp-filter-presets');
const sizeKB = new Blob([presets || '']).size / 1024;
console.log(`Presets size: ${sizeKB.toFixed(2)} KB`);
```

### Migrate Storage Key

```tsx
const oldPresets = localStorage.getItem('old-storage-key');
if (oldPresets) {
  localStorage.setItem('new-storage-key', oldPresets);
  localStorage.removeItem('old-storage-key');
}
```

## Accessibility

The PresetFilter component is fully accessible:

- Keyboard navigation support
- ARIA labels for all interactive elements
- Screen reader friendly
- Focus management in dialogs
- High contrast mode support

## Performance

- **Lazy Loading**: Presets loaded from localStorage only once on mount
- **Debounced Saves**: Writes to localStorage are batched
- **Memoization**: Hook returns memoized callbacks to prevent re-renders
- **Small Bundle**: ~15KB gzipped (including UI components)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires localStorage support (available in all modern browsers).

## Best Practices

1. **Unique Storage Keys**: Use unique storage keys per dashboard to avoid conflicts
2. **Descriptive Names**: Encourage users to use descriptive preset names
3. **Limit Presets**: Set reasonable `maxPresets` limit (default 50)
4. **Regular Cleanup**: Prompt users to delete unused presets
5. **Version Control**: Include version field in FilterCombination for migrations
6. **Error Handling**: Wrap localStorage operations in try-catch blocks

## Troubleshooting

### Presets Not Persisting

Check if localStorage is available and not full:

```tsx
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage unavailable:', e);
}
```

### Presets Not Appearing

Verify storage key matches:

```tsx
console.log(localStorage.getItem('wpp-filter-presets'));
```

### Import/Export Issues

Ensure JSON is valid:

```tsx
try {
  JSON.parse(importedData);
} catch (e) {
  console.error('Invalid JSON:', e);
}
```

## Related Components

- **CheckboxFilter**: Boolean dimension filters
- **SliderFilter**: Numeric range filters
- **DateRangeFilter**: Date range selection
- **DimensionControl**: Dimension value picker

## License

MIT - Part of WPP Analytics Platform

## Support

For issues or questions, contact the WPP Analytics Platform team.
