import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  DataSourceControl,
  DataSourceControlExample,
  commonDataSources,
  createDataSource,
  type DataSourceOption,
} from './DataSourceControl';

describe('DataSourceControl', () => {
  const mockSources: DataSourceOption[] = [
    {
      id: 'gsc-1',
      name: 'Search Console Main',
      type: 'gsc',
      description: 'Main property search data',
    },
    {
      id: 'ads-1',
      name: 'Google Ads Campaign',
      type: 'ads',
      description: 'Paid search campaigns',
    },
    {
      id: 'analytics-1',
      name: 'GA4 Property',
      type: 'analytics',
      description: 'Analytics data',
    },
  ];

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Data Source')).toBeInTheDocument();
      expect(screen.getByText('Search Console Main')).toBeInTheDocument();
    });

    it('should render without label when showLabel is false', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
          showLabel={false}
        />
      );

      expect(screen.queryByText('Data Source')).not.toBeInTheDocument();
    });

    it('should render custom label', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
          label="Select Platform"
        />
      );

      expect(screen.getByText('Select Platform')).toBeInTheDocument();
    });

    it('should render placeholder when no value selected', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value=""
          onChange={handleChange}
          placeholder="Choose a source"
        />
      );

      expect(screen.getByText('Choose a source')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      const handleChange = vi.fn();

      const { container } = render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
          size="sm"
        />
      );

      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toHaveClass('h-8');
    });

    it('should render default size', () => {
      const handleChange = vi.fn();

      const { container } = render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
          size="default"
        />
      );

      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toHaveClass('h-10');
    });

    it('should render large size', () => {
      const handleChange = vi.fn();

      const { container } = render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
          size="lg"
        />
      );

      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toHaveClass('h-12');
    });
  });

  describe('Data Source Display', () => {
    it('should display selected source name', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="ads-1"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Google Ads Campaign')).toBeInTheDocument();
    });

    it('should display source type badge', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('gsc')).toBeInTheDocument();
    });

    it('should display description as helper text', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Main property search data')).toBeInTheDocument();
    });

    it('should display all sources in dropdown', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      expect(screen.getByText('Search Console Main')).toBeInTheDocument();
      expect(screen.getByText('Google Ads Campaign')).toBeInTheDocument();
      expect(screen.getByText('GA4 Property')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when a source is selected', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      const option = screen.getByText('Google Ads Campaign');
      fireEvent.click(option);

      expect(handleChange).toHaveBeenCalledWith('ads-1');
    });

    it('should not call onChange when disabled', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
          disabled
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();

      fireEvent.click(trigger);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const handleChange = vi.fn();

      const { container } = render(
        <DataSourceControl
          sources={mockSources}
          value="gsc-1"
          onChange={handleChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sources array', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={[]}
          value=""
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Select data source')).toBeInTheDocument();
    });

    it('should handle invalid selected value', () => {
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={mockSources}
          value="invalid-id"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Select data source')).toBeInTheDocument();
    });

    it('should handle sources without descriptions', () => {
      const sourcesWithoutDesc: DataSourceOption[] = [
        { id: 'gsc-1', name: 'Search Console', type: 'gsc' },
      ];
      const handleChange = vi.fn();

      render(
        <DataSourceControl
          sources={sourcesWithoutDesc}
          value="gsc-1"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Search Console')).toBeInTheDocument();
      // Description should not be rendered
      expect(screen.queryByText('Main property search data')).not.toBeInTheDocument();
    });
  });
});

describe('createDataSource Utility', () => {
  it('should create a data source with all fields', () => {
    const source = createDataSource(
      'test-id',
      'Test Source',
      'gsc',
      'Test description'
    );

    expect(source).toEqual({
      id: 'test-id',
      name: 'Test Source',
      type: 'gsc',
      description: 'Test description',
      icon: undefined,
    });
  });

  it('should create a data source without optional fields', () => {
    const source = createDataSource('test-id', 'Test Source', 'ads');

    expect(source).toEqual({
      id: 'test-id',
      name: 'Test Source',
      type: 'ads',
      description: undefined,
      icon: undefined,
    });
  });
});

describe('commonDataSources', () => {
  it('should contain GSC data source', () => {
    const gscSource = commonDataSources.find((s) => s.type === 'gsc');
    expect(gscSource).toBeDefined();
    expect(gscSource?.name).toBe('Google Search Console');
  });

  it('should contain Ads data source', () => {
    const adsSource = commonDataSources.find((s) => s.type === 'ads');
    expect(adsSource).toBeDefined();
    expect(adsSource?.name).toBe('Google Ads');
  });

  it('should contain Analytics data source', () => {
    const analyticsSource = commonDataSources.find((s) => s.type === 'analytics');
    expect(analyticsSource).toBeDefined();
    expect(analyticsSource?.name).toBe('Google Analytics 4');
  });

  it('should contain BigQuery data source', () => {
    const bigquerySource = commonDataSources.find((s) => s.type === 'bigquery');
    expect(bigquerySource).toBeDefined();
    expect(bigquerySource?.name).toBe('BigQuery');
  });

  it('should have all sources with descriptions', () => {
    commonDataSources.forEach((source) => {
      expect(source.description).toBeDefined();
      expect(source.description).not.toBe('');
    });
  });
});

describe('DataSourceControlExample', () => {
  it('should render without crashing', () => {
    render(<DataSourceControlExample />);
    expect(screen.getByText('Data Source Control Examples')).toBeInTheDocument();
  });

  it('should render multiple size variants', () => {
    render(<DataSourceControlExample />);

    expect(screen.getByText('Small Size')).toBeInTheDocument();
    expect(screen.getByText('Large Size')).toBeInTheDocument();
  });

  it('should show selected value', () => {
    render(<DataSourceControlExample />);

    // Default selection should be gsc-default
    expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    expect(screen.getByText(/gsc-default/)).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('should have proper ARIA labels', () => {
    const handleChange = vi.fn();

    render(
      <DataSourceControl
        sources={mockSources}
        value="gsc-1"
        onChange={handleChange}
        label="Data Source"
      />
    );

    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });

  it('should be keyboard navigable', () => {
    const handleChange = vi.fn();

    render(
      <DataSourceControl
        sources={mockSources}
        value="gsc-1"
        onChange={handleChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    trigger.focus();
    expect(trigger).toHaveFocus();
  });
});

describe('Type Safety', () => {
  it('should accept valid DataSourceType values', () => {
    const validTypes: Array<'gsc' | 'ads' | 'analytics' | 'bigquery'> = [
      'gsc',
      'ads',
      'analytics',
      'bigquery',
    ];

    validTypes.forEach((type) => {
      const source = createDataSource('test', 'Test', type);
      expect(source.type).toBe(type);
    });
  });
});
