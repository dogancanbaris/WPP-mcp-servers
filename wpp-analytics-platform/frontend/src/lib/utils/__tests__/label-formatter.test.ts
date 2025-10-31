/**
 * Tests for label-formatter utility
 */

import { formatChartLabel, formatChartLabels, formatColumnHeader } from '../label-formatter';

describe('formatChartLabel', () => {
  it('should capitalize simple words', () => {
    expect(formatChartLabel('clicks')).toBe('Clicks');
    expect(formatChartLabel('impressions')).toBe('Impressions');
  });

  it('should handle acronyms correctly', () => {
    expect(formatChartLabel('ctr')).toBe('CTR');
    expect(formatChartLabel('cpc')).toBe('CPC');
    expect(formatChartLabel('roas')).toBe('ROAS');
    expect(formatChartLabel('roi')).toBe('ROI');
  });

  it('should convert snake_case to proper case', () => {
    expect(formatChartLabel('cost_per_click')).toBe('Cost Per Click');
    expect(formatChartLabel('session_duration')).toBe('Session Duration');
    expect(formatChartLabel('bounce_rate')).toBe('Bounce Rate');
  });

  it('should convert camelCase to proper case', () => {
    expect(formatChartLabel('totalRevenue')).toBe('Total Revenue');
    expect(formatChartLabel('averageOrderValue')).toBe('Average Order Value');
    expect(formatChartLabel('newUsers')).toBe('New Users');
  });

  it('should handle mixed cases with acronyms', () => {
    expect(formatChartLabel('ctr_percentage')).toBe('CTR Percentage');
    expect(formatChartLabel('total_roas')).toBe('Total ROAS');
  });

  it('should handle empty strings', () => {
    expect(formatChartLabel('')).toBe('');
  });

  it('should handle single words', () => {
    expect(formatChartLabel('revenue')).toBe('Revenue');
  });
});

describe('formatChartLabels', () => {
  it('should format multiple labels', () => {
    const labels = ['clicks', 'ctr', 'cost_per_click'];
    const expected = ['Clicks', 'CTR', 'Cost Per Click'];
    expect(formatChartLabels(labels)).toEqual(expected);
  });
});

describe('formatColumnHeader', () => {
  it('should format regular columns', () => {
    expect(formatColumnHeader('clicks')).toBe('Clicks');
    expect(formatColumnHeader('revenue')).toBe('Revenue');
  });

  it('should format _prev columns', () => {
    expect(formatColumnHeader('clicks_prev')).toBe('Clicks (Previous)');
    expect(formatColumnHeader('ctr_prev')).toBe('CTR (Previous)');
  });

  it('should format _change columns', () => {
    expect(formatColumnHeader('clicks_change')).toBe('Clicks Δ');
    expect(formatColumnHeader('ctr_change')).toBe('CTR Δ');
  });
});
