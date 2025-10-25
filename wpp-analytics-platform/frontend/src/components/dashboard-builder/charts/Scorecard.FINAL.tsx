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

export interface ScorecardProps extends Partial<ComponentConfig> {}

export const Scorecard: React.FC<ScorecardProps> = ({
  // Data props
  dataset_id,
  metrics = [],
  dateRange,

  // Display props
  title = 'KPI Scorecard',
  showTitle = true,
  titleFontFamily = 'roboto',
  titleFontSize = '14',
  titleFontWeight = '500',
  titleColor = '#666666',
  titleBackgroundColor = 'transparent',
  titleAlignment = 'left',

  // Background & Border
  backgroundColor = '#ffffff',
  showBorder = true,
  borderColor = '#e0e0e0',
  borderWidth = 1,
  borderRadius = 8,
  padding = 20,

  // Chart appearance
  chartColors = ['#5470c6'],

  ...rest
}) => {
  const firstMetric = metrics[0];

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['scorecard', dataset_id, metrics, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        metrics: metrics.join(','),
        ...(dateRange && { dateRange: JSON.stringify(dateRange) })
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0
  });

  // Styling
  const containerStyle: React.CSSProperties = {
    backgroundColor,
    border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    minHeight: '150px',
    boxShadow: showBorder ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: titleFontFamily,
    fontSize: `${titleFontSize}px`,
    fontWeight: titleFontWeight,
    color: titleColor,
    backgroundColor: titleBackgroundColor,
    textAlign: titleAlignment as any,
    marginBottom: '8px'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: chartColors[0],
    lineHeight: '1.2'
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
      {data?.cached && (
        <p className="text-xs text-muted-foreground mt-2">
          Cached {new Date(data.cachedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
