'use client';

/**
 * Scorecard Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Simple fetch pattern, no Cube.js
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { useFilterStore } from '@/store/filterStore';

export interface ScorecardProps extends Partial<ComponentConfig> {}

export const Scorecard: React.FC<ScorecardProps> = (props) => {
  // Apply global theme
  const theme = DASHBOARD_THEME.scorecard;

  const {
    dataset_id,
    metrics = [],
    dateRange,
    title = 'KPI Scorecard',
    showTitle = true,
    ...rest
  } = props;

  const firstMetric = metrics[0];

  // Get metric color from theme or use default
  const metricColors: Record<string, string> = {
    'impressions': DASHBOARD_THEME.colors.wppBlue,
    'clicks': DASHBOARD_THEME.colors.wppGreen,
    'position': DASHBOARD_THEME.colors.wppYellow,
    'ctr': DASHBOARD_THEME.colors.wppRed
  };
  const chartColor = metricColors[firstMetric] || DASHBOARD_THEME.colors.wppBlue;

  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange; // Global overrides prop

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['scorecard', dataset_id, metrics, effectiveDateRange], // Key includes effective date!
    queryFn: async () => {
      const params = new URLSearchParams({
        metrics: metrics.join(','),
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0
  });

  // Styling from global theme
  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: theme.borderRadius,
    padding: theme.padding,
    minHeight: theme.minHeight,
    maxHeight: theme.maxHeight,
    display: theme.display,
    flexDirection: theme.flexDirection,
    justifyContent: theme.justifyContent,
    alignItems: theme.alignItems,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.titleFontSize,
    fontWeight: theme.titleFontWeight,
    color: theme.titleColor,
    marginBottom: theme.titleMarginBottom,
    textAlign: 'center',
    width: '100%'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: theme.valueFontSize,
    fontWeight: theme.valueFontWeight,
    color: chartColor,
    lineHeight: theme.valueLineHeight,
    textAlign: 'center'
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Extract value
  const value = data?.data?.[0]?.[firstMetric] || 0;

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <div style={valueStyle}>{formatMetricValue(value, firstMetric, [])}</div>
      {/* Cache info removed per global theme settings */}
    </div>
  );
};
