/**
 * Global Filter Store Tests
 *
 * Unit tests for the filter store functionality
 */

import { renderHook, act } from '@testing-library/react';
import {
  useFilterStore,
  DateRangeFilter,
  DimensionFilter,
  MeasureFilter,
  validateFilter,
  DATE_RANGE_PRESETS,
} from '@/store/filterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useFilterStore());
    act(() => {
      result.current.clearAllFilters();
    });
  });

  describe('Filter Management', () => {
    test('adds a date range filter', () => {
      const { result } = renderHook(() => useFilterStore());

      const filter: DateRangeFilter = {
        id: 'test-1',
        type: 'dateRange',
        label: 'Last 30 Days',
        dimension: 'date',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        granularity: 'day',
        enabled: true,
      };

      act(() => {
        result.current.addFilter(filter);
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0]).toEqual(filter);
    });

    test('adds a dimension filter', () => {
      const { result } = renderHook(() => useFilterStore());

      const filter: DimensionFilter = {
        id: 'test-2',
        type: 'dimension',
        label: 'Top Campaigns',
        dimension: 'GoogleAds.campaignName',
        operator: 'inList',
        values: ['Campaign A', 'Campaign B'],
        enabled: true,
      };

      act(() => {
        result.current.addFilter(filter);
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0]).toEqual(filter);
    });

    test('adds a measure filter', () => {
      const { result } = renderHook(() => useFilterStore());

      const filter: MeasureFilter = {
        id: 'test-3',
        type: 'measure',
        label: 'High Cost',
        measure: 'GoogleAds.cost',
        operator: 'gt',
        value: 1000,
        enabled: true,
      };

      act(() => {
        result.current.addFilter(filter);
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0]).toEqual(filter);
    });

    test('updates a filter', () => {
      const { result } = renderHook(() => useFilterStore());

      const filter: DateRangeFilter = {
        id: 'test-1',
        type: 'dateRange',
        label: 'Last 30 Days',
        dimension: 'date',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        granularity: 'day',
        enabled: true,
      };

      act(() => {
        result.current.addFilter(filter);
      });

      act(() => {
        result.current.updateFilter('test-1', {
          startDate: '2025-02-01',
          endDate: '2025-02-28',
        });
      });

      const updatedFilter = result.current.filters[0] as DateRangeFilter;
      expect(updatedFilter.startDate).toBe('2025-02-01');
      expect(updatedFilter.endDate).toBe('2025-02-28');
    });

    test('removes a filter', () => {
      const { result } = renderHook(() => useFilterStore());

      const filter1: DateRangeFilter = {
        id: 'test-1',
        type: 'dateRange',
        label: 'Last 30 Days',
        dimension: 'date',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        granularity: 'day',
        enabled: true,
      };

      const filter2: DimensionFilter = {
        id: 'test-2',
        type: 'dimension',
        label: 'Test',
        dimension: 'GoogleAds.campaignName',
        operator: 'equals',
        values: ['Test'],
        enabled: true,
      };

      act(() => {
        result.current.addFilter(filter1);
        result.current.addFilter(filter2);
      });

      expect(result.current.filters).toHaveLength(2);

      act(() => {
        result.current.removeFilter('test-1');
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0].id).toBe('test-2');
    });

    test('toggles filter enabled state', () => {
      const { result } = renderHook(() => useFilterStore());

      const filter: DateRangeFilter = {
        id: 'test-1',
        type: 'dateRange',
        label: 'Last 30 Days',
        dimension: 'date',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        granularity: 'day',
        enabled: true,
      };

      act(() => {
        result.current.addFilter(filter);
      });

      expect(result.current.filters[0].enabled).toBe(true);

      act(() => {
        result.current.toggleFilter('test-1');
      });

      expect(result.current.filters[0].enabled).toBe(false);

      act(() => {
        result.current.toggleFilter('test-1');
      });

      expect(result.current.filters[0].enabled).toBe(true);
    });

    test('clears all filters', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.addDimensionFilter(
          'GoogleAds.campaignName',
          'equals',
          ['Test']
        );
        result.current.addMeasureFilter('GoogleAds.cost', 'gt', 100);
      });

      expect(result.current.filters).toHaveLength(2);

      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.filters).toHaveLength(0);
    });
  });

  describe('Date Range Presets', () => {
    test('sets date range from preset', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setDateRangePreset('last7Days');
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0].type).toBe('dateRange');
      expect(result.current.activePreset).toBe('last7Days');
    });

    test('replaces existing date range filter', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setDateRangePreset('last7Days');
      });

      expect(result.current.filters).toHaveLength(1);

      act(() => {
        result.current.setDateRangePreset('last30Days');
      });

      // Should still be 1 filter, not 2
      expect(result.current.filters).toHaveLength(1);
      expect(result.current.activePreset).toBe('last30Days');
    });

    test('sets custom date range', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setCustomDateRange('2025-01-01', '2025-01-31');
      });

      expect(result.current.filters).toHaveLength(1);
      const filter = result.current.filters[0] as DateRangeFilter;
      expect(filter.type).toBe('dateRange');
      expect(filter.startDate).toBe('2025-01-01');
      expect(filter.endDate).toBe('2025-01-31');
      expect(result.current.activePreset).toBe('custom');
    });
  });

  describe('Helper Methods', () => {
    test('adds dimension filter with helper', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.addDimensionFilter(
          'GoogleAds.campaignName',
          'equals',
          ['Test Campaign'],
          'Test Label'
        );
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0].type).toBe('dimension');
      expect((result.current.filters[0] as DimensionFilter).dimension).toBe(
        'GoogleAds.campaignName'
      );
      expect((result.current.filters[0] as DimensionFilter).values).toEqual([
        'Test Campaign',
      ]);
    });

    test('adds measure filter with helper', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.addMeasureFilter(
          'GoogleAds.cost',
          'gt',
          1000,
          'High Cost'
        );
      });

      expect(result.current.filters).toHaveLength(1);
      expect(result.current.filters[0].type).toBe('measure');
      expect((result.current.filters[0] as MeasureFilter).measure).toBe(
        'GoogleAds.cost'
      );
      expect((result.current.filters[0] as MeasureFilter).value).toBe(1000);
    });
  });

  describe('Filter Queries', () => {
    test('getActiveFilters returns only enabled filters', () => {
      const { result } = renderHook(() => useFilterStore());

      const filter1: DateRangeFilter = {
        id: 'test-1',
        type: 'dateRange',
        label: 'Last 30 Days',
        dimension: 'date',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        granularity: 'day',
        enabled: true,
      };

      const filter2: DimensionFilter = {
        id: 'test-2',
        type: 'dimension',
        label: 'Test',
        dimension: 'GoogleAds.campaignName',
        operator: 'equals',
        values: ['Test'],
        enabled: false, // Disabled
      };

      act(() => {
        result.current.addFilter(filter1);
        result.current.addFilter(filter2);
      });

      const activeFilters = result.current.getActiveFilters();
      expect(activeFilters).toHaveLength(1);
      expect(activeFilters[0].id).toBe('test-1');
    });

    test('getCubeJSFilters converts to Cube.js format', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setCustomDateRange('2025-01-01', '2025-01-31');
        result.current.addDimensionFilter(
          'GoogleAds.campaignName',
          'equals',
          ['Campaign A']
        );
        result.current.addMeasureFilter('GoogleAds.cost', 'gt', 1000);
      });

      const cubeFilters = result.current.getCubeJSFilters();

      expect(cubeFilters).toHaveLength(3);

      // Date range filter
      expect(cubeFilters[0]).toEqual({
        member: 'date',
        operator: 'inDateRange',
        values: ['2025-01-01', '2025-01-31'],
      });

      // Dimension filter
      expect(cubeFilters[1]).toEqual({
        member: 'GoogleAds.campaignName',
        operator: 'equals',
        values: ['Campaign A'],
      });

      // Measure filter
      expect(cubeFilters[2]).toEqual({
        member: 'GoogleAds.cost',
        operator: 'gt',
        values: ['1000'],
      });
    });

    test('getFilterSummary returns correct summary', () => {
      const { result } = renderHook(() => useFilterStore());

      // No filters
      expect(result.current.getFilterSummary()).toBe('No filters applied');

      // One filter
      act(() => {
        result.current.setDateRangePreset('last7Days');
      });
      expect(result.current.getFilterSummary()).toContain('Last 7 Days');

      // Multiple filters
      act(() => {
        result.current.addDimensionFilter(
          'GoogleAds.campaignName',
          'equals',
          ['Test']
        );
      });
      expect(result.current.getFilterSummary()).toBe('2 filters active');
    });
  });

  describe('UI State', () => {
    test('toggles filter bar visibility', () => {
      const { result } = renderHook(() => useFilterStore());

      expect(result.current.isFilterBarVisible).toBe(true);

      act(() => {
        result.current.toggleFilterBar();
      });

      expect(result.current.isFilterBarVisible).toBe(false);

      act(() => {
        result.current.toggleFilterBar();
      });

      expect(result.current.isFilterBarVisible).toBe(true);
    });

    test('sets filter bar visibility', () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setFilterBarVisible(false);
      });

      expect(result.current.isFilterBarVisible).toBe(false);

      act(() => {
        result.current.setFilterBarVisible(true);
      });

      expect(result.current.isFilterBarVisible).toBe(true);
    });
  });
});

describe('validateFilter', () => {
  test('validates date range filter', () => {
    const validFilter: DateRangeFilter = {
      id: 'test-1',
      type: 'dateRange',
      label: 'Test',
      dimension: 'date',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      enabled: true,
    };

    expect(validateFilter(validFilter)).toEqual({ valid: true });

    // Missing start date
    const invalidFilter1: DateRangeFilter = {
      ...validFilter,
      startDate: '',
    };
    const result1 = validateFilter(invalidFilter1);
    expect(result1.valid).toBe(false);
    expect(result1.error).toBe('Start and end dates are required');

    // Start date after end date
    const invalidFilter2: DateRangeFilter = {
      ...validFilter,
      startDate: '2025-02-01',
      endDate: '2025-01-01',
    };
    const result2 = validateFilter(invalidFilter2);
    expect(result2.valid).toBe(false);
    expect(result2.error).toBe('Start date must be before end date');
  });

  test('validates dimension filter', () => {
    const validFilter: DimensionFilter = {
      id: 'test-1',
      type: 'dimension',
      label: 'Test',
      dimension: 'GoogleAds.campaignName',
      operator: 'equals',
      values: ['Test'],
      enabled: true,
    };

    expect(validateFilter(validFilter)).toEqual({ valid: true });

    // Missing dimension
    const invalidFilter1: DimensionFilter = {
      ...validFilter,
      dimension: '',
    };
    const result1 = validateFilter(invalidFilter1);
    expect(result1.valid).toBe(false);
    expect(result1.error).toBe('Dimension is required');

    // Empty values
    const invalidFilter2: DimensionFilter = {
      ...validFilter,
      values: [],
    };
    const result2 = validateFilter(invalidFilter2);
    expect(result2.valid).toBe(false);
    expect(result2.error).toBe('At least one value is required');
  });

  test('validates measure filter', () => {
    const validFilter: MeasureFilter = {
      id: 'test-1',
      type: 'measure',
      label: 'Test',
      measure: 'GoogleAds.cost',
      operator: 'gt',
      value: 1000,
      enabled: true,
    };

    expect(validateFilter(validFilter)).toEqual({ valid: true });

    // Missing measure
    const invalidFilter1: MeasureFilter = {
      ...validFilter,
      measure: '',
    };
    const result1 = validateFilter(invalidFilter1);
    expect(result1.valid).toBe(false);
    expect(result1.error).toBe('Measure is required');

    // Missing value
    const invalidFilter2: MeasureFilter = {
      ...validFilter,
      value: null as any,
    };
    const result2 = validateFilter(invalidFilter2);
    expect(result2.valid).toBe(false);
    expect(result2.error).toBe('Value is required');
  });
});

describe('DATE_RANGE_PRESETS', () => {
  test('today preset returns current date', () => {
    const { startDate, endDate } = DATE_RANGE_PRESETS.today.getValue();
    const today = new Date().toISOString().split('T')[0];

    expect(startDate).toBe(today);
    expect(endDate).toBe(today);
  });

  test('last7Days preset returns correct range', () => {
    const { startDate, endDate } = DATE_RANGE_PRESETS.last7Days.getValue();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    expect(end.toDateString()).toBe(today.toDateString());

    const daysDiff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(daysDiff).toBe(7);
  });

  test('thisMonth preset returns current month', () => {
    const { startDate, endDate } = DATE_RANGE_PRESETS.thisMonth.getValue();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    expect(start.getMonth()).toBe(now.getMonth());
    expect(start.getDate()).toBe(1); // First day of month
    expect(end.toDateString()).toBe(now.toDateString()); // Today
  });
});
