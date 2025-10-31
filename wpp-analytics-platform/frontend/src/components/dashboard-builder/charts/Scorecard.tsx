'use client';

/**
 * Scorecard Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Simple fetch pattern, dataset API
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { Badge } from '@/components/ui/badge';
import { getChartDefaults } from '@/lib/defaults/chart-defaults';

export interface ScorecardProps extends Partial<ComponentConfig> {}

export const Scorecard: React.FC<ScorecardProps> = (props) => {
  // Apply global theme
  const theme = DASHBOARD_THEME.scorecard;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dateRange,
    title = 'KPI Scorecard',
    showTitle = true,
    ...rest
  } = props;

  const firstMetric = metrics[0];
  const currentPageId = useCurrentPageId();

  // Apply professional defaults (Scorecard is single aggregated value, no sorting needed)
  const defaults = getChartDefaults('scorecard');

  // Get metric color from theme or use default
  const metricColors: Record<string, string> = {
    'impressions': DASHBOARD_THEME.colors.wppBlue,
    'clicks': DASHBOARD_THEME.colors.wppGreen,
    'position': DASHBOARD_THEME.colors.wppYellow,
    'ctr': DASHBOARD_THEME.colors.wppRed
  };
  const chartColor = metricColors[firstMetric] || DASHBOARD_THEME.colors.wppBlue;

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: 'date',
  });

  // Use page-aware data fetching (only loads when page is active)
  const { data, isLoading, error } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'scorecard',
    datasetId: dataset_id || '',
    metrics,
    filters: cascadedFilters,
    enabled: !!dataset_id && metrics.length > 0 && !!currentPageId,
    chartType: 'scorecard', // Single aggregated value
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

  // Extract value with comparison support
  const currentValue = data?.data?.current?.[0]?.[firstMetric] || data?.data?.[0]?.[firstMetric] || 0;
  const delta = data?.data?.deltas?.find((d: any) => d.metric === firstMetric);

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <div style={valueStyle}>{formatMetricValue(currentValue, firstMetric, [])}</div>

      {/* Comparison Badge */}
      {delta && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge
            variant={delta.percentChange >= 0 ? 'default' : 'destructive'}
            className="text-xs font-medium"
          >
            {delta.percentChange >= 0 ? '↑' : '↓'} {Math.abs(delta.percentChange).toFixed(1)}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            vs {formatMetricValue(delta.comparisonValue, firstMetric, [])}
          </span>
        </div>
      )}
      {/* Cache info removed per global theme settings */}
    </div>
  );
};
