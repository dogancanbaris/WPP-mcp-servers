/**
 * DateRangeFilter Tests
 *
 * Test suite for the DateRangeFilter component covering:
 * - Preset selection
 * - Custom range selection
 * - Comparison mode
 * - Cube.js conversion helpers
 * - Edge cases
 */

import { describe, it, expect } from '@jest/globals';
import {
  toCubeTimeDimension,
  toCubeTimeDimensionWithComparison,
  DateRangeFilterValue,
} from './DateRangeFilter';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

describe('DateRangeFilter Helpers', () => {
  describe('toCubeTimeDimension', () => {
    it('should convert preset to Cube.js timeDimension', () => {
      const value: DateRangeFilterValue = {
        range: {
          type: 'preset',
          preset: 'last7days',
        },
        comparison: { enabled: false },
      };

      const result = toCubeTimeDimension(value, 'Orders.createdAt', 'day');

      expect(result).toBeDefined();
      expect(result?.dimension).toBe('Orders.createdAt');
      expect(result?.granularity).toBe('day');
      expect(Array.isArray(result?.dateRange)).toBe(true);
    });

    it('should convert custom range to Cube.js timeDimension', () => {
      const startDate = startOfDay(subDays(new Date(), 7));
      const endDate = endOfDay(new Date());

      const value: DateRangeFilterValue = {
        range: {
          type: 'custom',
          preset: 'custom',
          startDate,
          endDate,
        },
        comparison: { enabled: false },
      };

      const result = toCubeTimeDimension(value, 'Orders.createdAt', 'week');

      expect(result).toBeDefined();
      expect(result?.dimension).toBe('Orders.createdAt');
      expect(result?.granularity).toBe('week');
      expect(result?.dateRange).toEqual([
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
      ]);
    });

    it('should return null for invalid range', () => {
      const value: DateRangeFilterValue = {
        range: {
          type: 'custom',
          preset: 'custom',
        },
        comparison: { enabled: false },
      };

      const result = toCubeTimeDimension(value, 'Orders.createdAt', 'day');

      expect(result).toBeNull();
    });
  });

  describe('toCubeTimeDimensionWithComparison', () => {
    it('should generate primary query without comparison', () => {
      const value: DateRangeFilterValue = {
        range: {
          type: 'preset',
          preset: 'last30days',
        },
        comparison: { enabled: false },
      };

      const result = toCubeTimeDimensionWithComparison(
        value,
        'GoogleAds.date',
        'day'
      );

      expect(result).toBeDefined();
      expect(result?.primary).toBeDefined();
      expect(result?.comparison).toBeUndefined();
    });

    it('should generate both primary and comparison queries', () => {
      const startDate = startOfDay(subDays(new Date(), 7));
      const endDate = endOfDay(new Date());

      const value: DateRangeFilterValue = {
        range: {
          type: 'custom',
          preset: 'custom',
          startDate,
          endDate,
        },
        comparison: { enabled: true },
      };

      const result = toCubeTimeDimensionWithComparison(
        value,
        'GoogleAds.date',
        'day'
      );

      expect(result).toBeDefined();
      expect(result?.primary).toBeDefined();
      expect(result?.comparison).toBeDefined();
      expect(result?.primary.dimension).toBe('GoogleAds.date');
      expect(result?.comparison?.dimension).toBe('GoogleAds.date');
    });

    it('should calculate correct comparison period', () => {
      const startDate = new Date('2025-10-15');
      const endDate = new Date('2025-10-21'); // 7 days

      const value: DateRangeFilterValue = {
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: startOfDay(startDate),
          endDate: endOfDay(endDate),
        },
        comparison: { enabled: true },
      };

      const result = toCubeTimeDimensionWithComparison(
        value,
        'Orders.createdAt',
        'day'
      );

      expect(result?.comparison).toBeDefined();

      // Comparison should be 7 days before startDate
      const comparisonRange = result?.comparison?.dateRange as [string, string];
      expect(comparisonRange[0]).toBe('2025-10-08');
      expect(comparisonRange[1]).toBe('2025-10-14');
    });
  });

  describe('Edge Cases', () => {
    it('should handle same start and end date', () => {
      const today = startOfDay(new Date());

      const value: DateRangeFilterValue = {
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: today,
          endDate: today,
        },
        comparison: { enabled: false },
      };

      const result = toCubeTimeDimension(value, 'Orders.createdAt', 'hour');

      expect(result).toBeDefined();
      expect(result?.dateRange).toEqual([
        format(today, 'yyyy-MM-dd'),
        format(today, 'yyyy-MM-dd'),
      ]);
    });

    it('should handle different granularities', () => {
      const value: DateRangeFilterValue = {
        range: {
          type: 'preset',
          preset: 'last90days',
        },
        comparison: { enabled: false },
      };

      const granularities: Array<'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'> = [
        'hour',
        'day',
        'week',
        'month',
        'quarter',
        'year',
      ];

      granularities.forEach((granularity) => {
        const result = toCubeTimeDimension(value, 'Orders.createdAt', granularity);
        expect(result?.granularity).toBe(granularity);
      });
    });
  });
});

// Component tests (would require testing library setup)
// describe('DateRangeFilter Component', () => {
//   it('should render preset selector', () => {
//     // Implementation with @testing-library/react
//   });
//
//   it('should open calendar on button click', () => {
//     // Implementation
//   });
//
//   it('should enable comparison mode', () => {
//     // Implementation
//   });
// });
