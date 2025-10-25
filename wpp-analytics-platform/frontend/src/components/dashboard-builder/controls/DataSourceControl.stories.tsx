import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  DataSourceControl,
  DataSourceControlProps,
  commonDataSources,
  createDataSource,
  DataSourceOption,
} from './DataSourceControl';
import { Search, TrendingUp, BarChart3, Database } from 'lucide-react';

const meta: Meta<typeof DataSourceControl> = {
  title: 'Dashboard Builder/Controls/DataSourceControl',
  component: DataSourceControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A dropdown control for switching between different data sources (GSC, Google Ads, Analytics, BigQuery)
in the WPP Analytics Platform. Provides a consistent interface for data source selection across the dashboard builder.

## Features
- Visual icons for each data source type
- Type-safe data source selection
- Responsive sizing options (sm, default, lg)
- Optional descriptions for each source
- Customizable styling
- Disabled state support

## Usage
\`\`\`tsx
import { DataSourceControl, commonDataSources } from '@/components/dashboard-builder/controls';

function MyComponent() {
  const [source, setSource] = useState('gsc-default');

  return (
    <DataSourceControl
      sources={commonDataSources}
      value={source}
      onChange={setSource}
    />
  );
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    sources: {
      description: 'Array of available data source options',
      control: 'object',
    },
    value: {
      description: 'Currently selected data source ID',
      control: 'text',
    },
    onChange: {
      description: 'Callback function when selection changes',
      action: 'changed',
    },
    label: {
      description: 'Label text for the control',
      control: 'text',
    },
    showLabel: {
      description: 'Whether to display the label',
      control: 'boolean',
    },
    size: {
      description: 'Size variant of the control',
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    disabled: {
      description: 'Whether the control is disabled',
      control: 'boolean',
    },
    placeholder: {
      description: 'Placeholder text when no source is selected',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataSourceControl>;

// Interactive wrapper for stateful stories
const ControlledWrapper = (args: DataSourceControlProps) => {
  const [value, setValue] = useState(args.value);

  return (
    <div className="max-w-md">
      <DataSourceControl {...args} value={value} onChange={setValue} />
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <strong>Selected ID:</strong> <code>{value}</code>
      </div>
    </div>
  );
};

// Default story
export const Default: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    sources: commonDataSources,
    value: 'gsc-default',
    label: 'Data Source',
    showLabel: true,
    size: 'default',
    disabled: false,
    placeholder: 'Select data source',
  },
};

// Small size variant
export const SmallSize: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    ...Default.args,
    size: 'sm',
    label: 'Compact Data Source',
  },
};

// Large size variant
export const LargeSize: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    ...Default.args,
    size: 'lg',
    label: 'Large Data Source',
  },
};

// Without label
export const NoLabel: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    ...Default.args,
    showLabel: false,
  },
};

// Disabled state
export const Disabled: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    ...Default.args,
    disabled: true,
    label: 'Disabled Data Source',
  },
};

// With custom sources
export const CustomSources: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    sources: [
      createDataSource(
        'gsc-site-1',
        'Main Website - GSC',
        'gsc',
        'Organic search data for main site'
      ),
      createDataSource(
        'gsc-site-2',
        'Blog - GSC',
        'gsc',
        'Organic search data for blog'
      ),
      createDataSource(
        'ads-brand',
        'Brand Campaign',
        'ads',
        'Branded keyword campaigns'
      ),
      createDataSource(
        'ads-generic',
        'Generic Campaign',
        'ads',
        'Non-branded keyword campaigns'
      ),
      createDataSource(
        'ga4-main',
        'GA4 Main Property',
        'analytics',
        'Primary Analytics property'
      ),
    ],
    value: 'gsc-site-1',
    label: 'Select Property',
  },
};

// Empty state
export const EmptyState: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    ...Default.args,
    value: '',
    placeholder: 'Choose your data source',
  },
};

// Only GSC sources
export const GSCOnly: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    sources: [
      createDataSource(
        'gsc-1',
        'Primary Website',
        'gsc',
        'Main website organic search data'
      ),
      createDataSource(
        'gsc-2',
        'Blog Domain',
        'gsc',
        'Blog subdomain organic search data'
      ),
      createDataSource(
        'gsc-3',
        'Mobile Site',
        'gsc',
        'Mobile-specific organic search data'
      ),
    ],
    value: 'gsc-1',
    label: 'Search Console Property',
  },
};

// Only Ads sources
export const AdsOnly: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    sources: [
      createDataSource(
        'ads-1',
        'Brand Campaigns',
        'ads',
        'Branded keyword campaigns'
      ),
      createDataSource(
        'ads-2',
        'Generic Campaigns',
        'ads',
        'Non-branded keyword campaigns'
      ),
      createDataSource(
        'ads-3',
        'Competitor Campaigns',
        'ads',
        'Competitor bidding campaigns'
      ),
    ],
    value: 'ads-1',
    label: 'Google Ads Account',
  },
};

// Only Analytics sources
export const AnalyticsOnly: Story = {
  render: (args) => <ControlledWrapper {...args} />,
  args: {
    sources: [
      createDataSource(
        'analytics-1',
        'Main Property',
        'analytics',
        'Primary GA4 property'
      ),
      createDataSource(
        'analytics-2',
        'App Property',
        'analytics',
        'Mobile app GA4 property'
      ),
    ],
    value: 'analytics-1',
    label: 'Analytics Property',
  },
};

// Multi-source comparison
export const AllSizeComparison: Story = {
  render: () => {
    const [small, setSmall] = useState('gsc-default');
    const [medium, setMedium] = useState('ads-default');
    const [large, setLarge] = useState('analytics-default');

    return (
      <div className="space-y-6 max-w-2xl">
        <h3 className="text-lg font-semibold">Size Comparison</h3>

        <DataSourceControl
          sources={commonDataSources}
          value={small}
          onChange={setSmall}
          size="sm"
          label="Small (sm)"
        />

        <DataSourceControl
          sources={commonDataSources}
          value={medium}
          onChange={setMedium}
          size="default"
          label="Default"
        />

        <DataSourceControl
          sources={commonDataSources}
          value={large}
          onChange={setLarge}
          size="lg"
          label="Large (lg)"
        />
      </div>
    );
  },
};

// Multiple controls in a form
export const FormLayout: Story = {
  render: () => {
    const [primary, setPrimary] = useState('gsc-default');
    const [secondary, setSecondary] = useState('');
    const [blend, setBlend] = useState(false);

    return (
      <div className="max-w-2xl space-y-6 p-6 bg-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold mb-4">Data Source Configuration</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure primary and secondary data sources for your dashboard
          </p>
        </div>

        <DataSourceControl
          sources={commonDataSources}
          value={primary}
          onChange={setPrimary}
          label="Primary Data Source"
        />

        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="blend-toggle"
            checked={blend}
            onChange={(e) => setBlend(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="blend-toggle" className="text-sm font-medium text-gray-700">
            Blend data from multiple sources
          </label>
        </div>

        {blend && (
          <DataSourceControl
            sources={commonDataSources.filter((s) => s.id !== primary)}
            value={secondary}
            onChange={setSecondary}
            label="Secondary Data Source"
            placeholder="Select secondary source"
          />
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration</h4>
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(
              {
                primarySource: primary,
                secondarySource: blend ? secondary : null,
                blendEnabled: blend,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    );
  },
};

// Real-world dashboard builder scenario
export const DashboardBuilderScenario: Story = {
  render: () => {
    const [dataSource, setDataSource] = useState('gsc-default');
    const [chartType, setChartType] = useState('line_chart');

    return (
      <div className="max-w-3xl space-y-6 p-6 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold mb-2">Chart Configuration</h3>
          <p className="text-sm text-gray-600">
            Configure your chart data source and visualization type
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border">
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
              <option value="line_chart">Line Chart</option>
              <option value="bar_chart">Bar Chart</option>
              <option value="pie_chart">Pie Chart</option>
              <option value="table">Table</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Configuration</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Data Source:</strong>{' '}
              {commonDataSources.find((s) => s.id === dataSource)?.name}
            </p>
            <p>
              <strong>Chart Type:</strong> {chartType.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// Error state
export const ErrorState: Story = {
  render: () => {
    const [value, setValue] = useState('invalid-id');

    return (
      <div className="max-w-md space-y-4">
        <DataSourceControl
          sources={commonDataSources}
          value={value}
          onChange={setValue}
          label="Data Source"
        />

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <strong>Error:</strong> Invalid data source selected. Please choose a valid source.
        </div>
      </div>
    );
  },
};

// Loading state simulation
export const LoadingState: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState('gsc-default');

    React.useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);

    if (loading) {
      return (
        <div className="max-w-md space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Data Source</label>
          <div className="h-10 bg-gray-200 animate-pulse rounded-md" />
          <p className="text-sm text-gray-500">Loading data sources...</p>
        </div>
      );
    }

    return (
      <div className="max-w-md">
        <DataSourceControl
          sources={commonDataSources}
          value={value}
          onChange={setValue}
          label="Data Source"
        />
      </div>
    );
  },
};
