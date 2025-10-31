'use client';

/**
 * Word Cloud Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Text frequency visualization using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Uses echarts-wordcloud extension
 */

import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import 'echarts-wordcloud';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { useCurrentPageId } from '@/store/dashboardStore';
import { getChartDefaults } from '@/lib/defaults/chart-defaults';

export interface WordCloudChartProps extends Partial<ComponentConfig> {
  sizeRange?: [number, number];
  rotationRange?: [number, number];
  shape?: 'circle' | 'cardioid' | 'diamond' | 'triangle' | 'star';
}

export const WordCloudChart: React.FC<WordCloudChartProps> = (props) => {
  const {
    // Component ID
    id: componentId,

    // Data props
    dataset_id,
    dimension = null,
    metrics = [],
    dateRange,

    // Display props
    title = 'Word Cloud',
    showTitle = true,
    titleFontFamily = 'roboto',
    titleFontSize = '16',
    titleFontWeight = '600',
    titleColor = '#111827',
    titleBackgroundColor = 'transparent',
    titleAlignment = 'left',

    // Background & Border
    backgroundColor = '#ffffff',
    showBorder = true,
    borderColor = '#e0e0e0',
    borderWidth = 1,
    borderRadius = 8,
    padding = 16,

    // Word Cloud specific
    sizeRange = [12, 60],
    rotationRange = [-90, 90],
    shape = 'circle',

    // Professional defaults
    sortBy,
    sortDirection,
    limit,

    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('word_cloud');
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimension || 'date',
  });

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['wordcloud', dataset_id, dimension, metrics, cascadedFilters, finalLimit],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(dimension && { dimensions: dimension }),
        metrics: metrics.join(','),
        ...(cascadedFilters.length > 0 && { filters: JSON.stringify(cascadedFilters) }),
        limit: finalLimit?.toString() || '100',
        chartType: 'word_cloud',
        sortBy: metrics[0],
        sortDirection: 'DESC'
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0 && !!dimension
  });

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    boxShadow: showBorder ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: titleFontFamily,
    fontSize: `${titleFontSize}px`,
    fontWeight: titleFontWeight,
    color: titleColor,
    backgroundColor: titleBackgroundColor,
    textAlign: titleAlignment as any,
    marginBottom: '12px'
  };

  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <p className="text-sm text-red-600">Failed to load data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const currentData = data?.data?.current || data?.data || [];

  if (currentData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Transform to word cloud format
  const wordCloudData = currentData.map((row: any) => ({
    name: formatChartLabel(row[dimension || '']),
    value: Number(row[metrics[0]]) || 0
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      formatter: (params: any) => {
        return `${params.name}: ${params.value}`;
      }
    },
    series: [{
      type: 'wordCloud',
      shape,
      sizeRange,
      rotationRange,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          // Random colors for words
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 255)
          ].join(',') + ')';
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          textShadowBlur: 10,
          textShadowColor: '#333'
        }
      },
      data: wordCloudData,
      width: '100%',
      height: '100%',
      gridSize: 8,
      drawOutOfBound: false
    }]
  };

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}
      <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />
    </div>
  );
};
