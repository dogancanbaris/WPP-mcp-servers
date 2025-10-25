# DataSourceControl Integration Guide

Quick guide for integrating the DataSourceControl component into the WPP Analytics Platform.

## Installation

The component is already part of the dashboard-builder controls package. No additional installation needed.

```tsx
import { DataSourceControl, commonDataSources } from '@/components/dashboard-builder/controls';
```

## Quick Start (3 Steps)

### Step 1: Import Component

```tsx
import { DataSourceControl, commonDataSources } from '@/components/dashboard-builder/controls';
import { useState } from 'react';
```

### Step 2: Add State

```tsx
const [selectedSource, setSelectedSource] = useState('gsc-default');
```

### Step 3: Render Component

```tsx
<DataSourceControl
  sources={commonDataSources}
  value={selectedSource}
  onChange={setSelectedSource}
/>
```

That's it! You now have a working data source selector.

## Integration Points

### 1. ChartSetup Component

Replace or enhance the existing DataSourceSelector in ChartSetup:

```tsx
// src/components/dashboard-builder/sidebar/setup/ChartSetup.tsx

import { DataSourceControl } from '@/components/dashboard-builder/controls';

export const ChartSetup: React.FC<ChartSetupProps> = ({ config, onUpdate }) => {
  const handleSourceChange = (sourceId: string) => {
    onUpdate({ datasource: sourceId });
  };

  return (
    <div className="space-y-6">
      {/* Replace existing DataSourceSelector */}
      <DataSourceControl
        sources={dataSources} // from your API call
        value={config.datasource}
        onChange={handleSourceChange}
        label="Data Source"
      />

      {/* Other controls... */}
    </div>
  );
};
```

### 2. Dashboard-Level Filter

Add as a global filter in the dashboard topbar:

```tsx
// src/components/dashboard-builder/topbar/QuickTools.tsx

import { DataSourceControl, commonDataSources } from '@/components/dashboard-builder/controls';

export const QuickTools: React.FC = () => {
  const { globalDataSource, setGlobalDataSource } = useDashboardContext();

  return (
    <div className="flex items-center gap-4">
      {/* Other quick tools */}

      <DataSourceControl
        sources={commonDataSources}
        value={globalDataSource}
        onChange={setGlobalDataSource}
        size="sm"
        showLabel={false}
      />
    </div>
  );
};
```

### 3. Chart Configuration Modal

Use in a modal dialog for chart configuration:

```tsx
// src/components/dashboard-builder/modals/ChartConfigModal.tsx

import { DataSourceControl, commonDataSources } from '@/components/dashboard-builder/controls';

export const ChartConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ChartConfig>({
    dataSource: '',
    chartType: 'line_chart',
    // ...
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Chart</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DataSourceControl
            sources={commonDataSources}
            value={config.dataSource}
            onChange={(id) => setConfig({ ...config, dataSource: id })}
          />

          {/* Other form fields */}
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

## API Integration

### Connect to Backend

Fetch available data sources from your API:

```tsx
import { useEffect, useState } from 'react';
import { DataSourceControl, type DataSourceOption } from '@/components/dashboard-builder/controls';

function MyComponent() {
  const [sources, setSources] = useState<DataSourceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    async function fetchSources() {
      try {
        const response = await fetch('/api/data-sources');
        const data = await response.json();

        // Transform API response to DataSourceOption format
        const options: DataSourceOption[] = data.sources.map((source: any) => ({
          id: source.id,
          name: source.name,
          type: source.type, // 'gsc' | 'ads' | 'analytics' | 'bigquery'
          description: source.description,
        }));

        setSources(options);

        // Set default selection
        if (options.length > 0) {
          setSelected(options[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch data sources:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
  }, []);

  if (loading) {
    return <div>Loading data sources...</div>;
  }

  return (
    <DataSourceControl
      sources={sources}
      value={selected}
      onChange={setSelected}
    />
  );
}
```

### Save to Dashboard Config

When the user changes the data source, save to dashboard configuration:

```tsx
const handleSourceChange = async (sourceId: string) => {
  // Update local state
  setSelectedSource(sourceId);

  // Update dashboard config
  await fetch(`/api/dashboards/${dashboardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        ...dashboardConfig,
        dataSource: sourceId,
      },
    }),
  });

  // Trigger data refresh
  refetchChartData();
};
```

## Cube.js Integration

When integrated with Cube.js semantic layer:

```tsx
import { useCubeQuery } from '@cubejs-client/react';
import { DataSourceControl } from '@/components/dashboard-builder/controls';

function CubeIntegrationExample() {
  const [dataSource, setDataSource] = useState('gsc-default');

  // Map data source to Cube.js cube name
  const cubeMap = {
    'gsc-default': 'GoogleSearchConsole',
    'ads-default': 'GoogleAds',
    'analytics-default': 'GoogleAnalytics',
    'bigquery-default': 'CustomData',
  };

  const cubeName = cubeMap[dataSource] || 'GoogleSearchConsole';

  // Query Cube.js with selected data source
  const { resultSet, isLoading } = useCubeQuery({
    measures: [`${cubeName}.clicks`, `${cubeName}.impressions`],
    dimensions: [`${cubeName}.date`],
    timeDimensions: [{
      dimension: `${cubeName}.date`,
      dateRange: 'last 30 days',
    }],
  });

  return (
    <div>
      <DataSourceControl
        sources={commonDataSources}
        value={dataSource}
        onChange={setDataSource}
        label="Data Source"
      />

      {isLoading ? (
        <div>Loading data...</div>
      ) : (
        <Chart data={resultSet?.chartPivot()} />
      )}
    </div>
  );
}
```

## Context Provider Pattern

For app-wide data source management:

```tsx
// contexts/DataSourceContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface DataSourceContextType {
  globalDataSource: string;
  setGlobalDataSource: (id: string) => void;
  availableSources: DataSourceOption[];
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [globalDataSource, setGlobalDataSource] = useState('gsc-default');
  const [availableSources] = useState(commonDataSources);

  return (
    <DataSourceContext.Provider value={{
      globalDataSource,
      setGlobalDataSource,
      availableSources
    }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within DataSourceProvider');
  }
  return context;
}

// Usage in components:
function MyChart() {
  const { globalDataSource, availableSources } = useDataSource();

  return (
    <DataSourceControl
      sources={availableSources}
      value={globalDataSource}
      onChange={setGlobalDataSource}
    />
  );
}
```

## Multi-Tenant Support

Filter data sources by tenant:

```tsx
import { useSession } from 'next-auth/react';
import { DataSourceControl, type DataSourceOption } from '@/components/dashboard-builder/controls';

function TenantAwareDataSources() {
  const { data: session } = useSession();
  const tenantId = session?.user?.tenantId;

  const [sources, setSources] = useState<DataSourceOption[]>([]);

  useEffect(() => {
    async function fetchTenantSources() {
      const response = await fetch(`/api/tenants/${tenantId}/data-sources`);
      const data = await response.json();
      setSources(data.sources);
    }

    if (tenantId) {
      fetchTenantSources();
    }
  }, [tenantId]);

  return (
    <DataSourceControl
      sources={sources}
      value={selectedSource}
      onChange={setSelectedSource}
      label="Your Data Sources"
    />
  );
}
```

## Performance Optimization

### Memoize Sources

```tsx
import { useMemo } from 'react';

function OptimizedComponent() {
  const [selected, setSelected] = useState('gsc-default');

  // Memoize sources to prevent unnecessary re-renders
  const sources = useMemo(() => {
    return commonDataSources.filter(/* your filter logic */);
  }, [/* dependencies */]);

  return (
    <DataSourceControl
      sources={sources}
      value={selected}
      onChange={setSelected}
    />
  );
}
```

### Lazy Load Options

For large lists of data sources:

```tsx
function LazyLoadExample() {
  const [sources, setSources] = useState<DataSourceOption[]>([]);
  const [page, setPage] = useState(1);

  const loadMore = async () => {
    const newSources = await fetchDataSources(page);
    setSources([...sources, ...newSources]);
    setPage(page + 1);
  };

  return (
    <div>
      <DataSourceControl
        sources={sources}
        value={selected}
        onChange={setSelected}
      />

      <Button onClick={loadMore}>Load More Sources</Button>
    </div>
  );
}
```

## Validation

Add validation for required data source selection:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  dataSource: z.string().min(1, 'Please select a data source'),
});

function ValidatedForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log('Valid data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DataSourceControl
        sources={commonDataSources}
        value={watch('dataSource')}
        onChange={(id) => setValue('dataSource', id)}
      />

      {errors.dataSource && (
        <p className="text-sm text-red-600 mt-1">
          {errors.dataSource.message}
        </p>
      )}

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Testing Your Integration

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DataSourceControl, commonDataSources } from '@/components/dashboard-builder/controls';

describe('DataSource Integration', () => {
  it('should integrate with parent component', () => {
    const handleChange = jest.fn();

    render(
      <DataSourceControl
        sources={commonDataSources}
        value="gsc-default"
        onChange={handleChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const option = screen.getByText('Google Ads');
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('ads-default');
  });
});
```

## Troubleshooting

**Issue: Sources not displaying**
- Verify `sources` prop is an array of DataSourceOption objects
- Check that each source has required fields: id, name, type

**Issue: onChange not firing**
- Ensure onChange callback is passed as a prop
- Check that component is not disabled

**Issue: Selected value not updating**
- Make sure the `value` prop matches a valid source ID
- Verify parent component state is updating correctly

**Issue: Styling conflicts**
- Ensure Tailwind CSS is configured
- Check that shadcn/ui components are properly set up
- Verify no CSS conflicts with parent styles

## Next Steps

1. **Add to ChartSetup** - Replace existing data source selector
2. **Create Context** - Add global data source management
3. **Connect API** - Fetch available sources from backend
4. **Add Validation** - Ensure data source is selected
5. **Test Integration** - Write integration tests

## Support

For questions or issues:
- Check the README.md in the controls directory
- View Storybook examples: `npm run storybook`
- Run tests: `npm test -- DataSourceControl`
- Review examples in `DataSourceControl.examples.tsx`
