'use client';

/**
 * Geographic Map Chart Component - Dataset-Based
 *
 * NEW ARCHITECTURE:
 * - Queries registered dataset via /api/datasets/[id]/query
 * - Backend handles caching, BigQuery connection
 * - Multi-page support with cascaded filters
 *
 * Supports two visualization types:
 * 1. Choropleth Map: Color-coded regions based on data values
 * 2. Bubble Map: Scatter points sized by metric values
 *
 * Features:
 * - World, continent, and country-level maps
 * - Custom GeoJSON support
 * - Interactive tooltips and zoom
 * - Responsive design
 * - Data-driven color scales
 */

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Loader2 } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';
import { formatChartLabel } from '@/lib/utils/label-formatter';
import { usePageData } from '@/hooks/usePageData';
import { useCurrentPageId } from '@/store/dashboardStore';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';
import { formatChartLabel } from '@/lib/utils/label-formatter';

export interface GeoMapDataPoint {
  /** Region/city name (must match GeoJSON feature name) */
  name: string;
  /** Metric value */
  value: number;
  /** Geographic coordinates [longitude, latitude] - required for bubble maps */
  coords?: [number, number];
  /** Additional metadata for tooltips */
  metadata?: Record<string, any>;
}

export interface GeoMapChartProps extends Partial<ComponentConfig> {
  /** Chart type: choropleth (color regions) or bubble (scatter points) */
  type?: 'choropleth' | 'bubble';

  /**
   * Map type or custom GeoJSON
   * Built-in: 'world', 'USA', 'China', etc.
   * Custom: GeoJSON object or URL
   */
  mapType?: string | object;

  /** Color scheme for choropleth maps */
  colorScheme?: string[];

  /** Minimum bubble size (for bubble maps) */
  minBubbleSize?: number;

  /** Maximum bubble size (for bubble maps) */
  maxBubbleSize?: number;

  /** Value formatter function */
  valueFormatter?: (value: number) => string;

  /** Enable data zoom controls */
  enableZoom?: boolean;

  /** Show visual map (color legend) */
  showVisualMap?: boolean;

  /** Visual map position */
  visualMapPosition?: 'left' | 'right' | 'top' | 'bottom';

  /** Custom tooltip formatter */
  tooltipFormatter?: (params: any) => string;

  /** Height of the chart container */
  chartHeight?: string | number;

  /** Additional ECharts options */
  additionalOptions?: echarts.EChartsOption;

  /** Callback when region is clicked */
  onRegionClick?: (data: GeoMapDataPoint) => void;

  /** Custom GeoJSON registration name */
  geoJsonName?: string;
}

export const GeoMapChart: React.FC<GeoMapChartProps> = (props) => {
  const theme = DASHBOARD_THEME.charts;

  const {
    id: componentId,
    dataset_id,
    metrics = [],
    dimensions = [],
    title = 'Geographic Map',
    showTitle = true,
    type = 'choropleth',
    mapType = 'world',
    colorScheme = ['#e0f3db', '#a8ddb5', '#43a2ca', '#0868ac'],
    minBubbleSize = 4,
    maxBubbleSize = 40,
    valueFormatter = (value: number) => value.toLocaleString(),
    enableZoom = true,
    showVisualMap = true,
    visualMapPosition = 'left',
    tooltipFormatter,
    chartHeight = '600px',
    additionalOptions = {},
    onRegionClick,
    geoJsonName = 'customMap',
    style,
    // Professional defaults (optional overrides)
    sortBy,
    sortDirection,
    limit,
    ...rest
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('geomap');
  const finalSortBy = sortBy || resolveSortField(defaults.sortBy, metrics, dimensions?.[0]);
  const finalSortDirection = sortDirection || defaults.sortDirection;
  const finalLimit = limit !== undefined ? limit : defaults.limit;

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const [mapRegistered, setMapRegistered] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimensions[0] || 'date',
  });

  // Use page-aware data fetching
  const { data: apiData, isLoading, error: apiError } = usePageData({
    pageId: currentPageId || 'default',
    componentId: componentId || 'geomap',
    datasetId: dataset_id || '',
    metrics,
    dimensions,
    filters: cascadedFilters,
    enabled: !!dataset_id && dimensions.length > 0 && !!currentPageId,
    chartType: 'geomap',
    sortBy: finalSortBy,
    sortDirection: finalSortDirection,
    limit: finalLimit,
  });

  // Transform API data to GeoMapDataPoint format
  const data: GeoMapDataPoint[] = React.useMemo(() => {
    if (!apiData?.data) return [];

    const locationDimension = dimensions[0] || 'country';
    const metricName = metrics[0];

    return apiData.data.map((row: any) => ({
      name: row[locationDimension],
      value: row[metricName] || 0,
      metadata: row
    }));
  }, [apiData, dimensions, metrics]);

  // Styling from global theme
  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || theme.backgroundColor,
    border: `${theme.borderWidth} solid ${theme.borderColor}`,
    borderRadius: style?.borderRadius || theme.borderRadius,
    padding: theme.padding,
    boxShadow: theme.boxShadow,
    opacity: DASHBOARD_THEME.global.opacity,
    color: style?.textColor
  };

  /**
   * Register GeoJSON map data with ECharts
   */
  useEffect(() => {
    const registerMap = async () => {
      try {
        // If mapType is a string, try to use built-in maps
        if (typeof mapType === 'string') {
          // Check if it's a built-in map type (world, USA, etc.)
          const builtInMaps = ['world', 'usa', 'china', 'europe', 'africa', 'asia'];
          const normalizedMapType = mapType.toLowerCase();

          if (builtInMaps.includes(normalizedMapType)) {
            // For built-in maps, we need to load GeoJSON separately
            // In production, these would be loaded from a CDN or bundled
            console.warn(`Built-in map "${mapType}" requires GeoJSON data to be loaded separately`);
            setMapLoadError(`Map data for "${mapType}" not loaded. Please provide GeoJSON.`);
            return;
          }

          // Assume it's already registered or will be registered externally
          setMapRegistered(true);
          return;
        }

        // If mapType is an object, register it as custom GeoJSON
        if (typeof mapType === 'object') {
          echarts.registerMap(geoJsonName, mapType as any);
          setMapRegistered(true);
          return;
        }

        setMapLoadError('Invalid map type provided');
      } catch (err) {
        console.error('Error registering map:', err);
        setMapLoadError(err instanceof Error ? err.message : 'Failed to load map data');
      }
    };

    registerMap();
  }, [mapType, geoJsonName]);

  /**
   * Initialize and configure ECharts instance
   */
  useEffect(() => {
    if (!chartRef.current || !mapRegistered) return;

    // Initialize chart instance
    const chartInstance = echarts.init(chartRef.current, undefined, {
      renderer: 'canvas',
      useDirtyRect: true, // Performance optimization
    });
    chartInstanceRef.current = chartInstance;

    // Get map name
    const mapName = typeof mapType === 'string' ? mapType : geoJsonName;

    // Calculate data range for visual mapping
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Build base options (title rendered separately via showTitle)
    const baseOptions: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937',
        },
        formatter: tooltipFormatter || ((params: any) => {
          const dataPoint = data.find(d => d.name === params.name);
          if (!dataPoint) return params.name;

          let html = `<div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
            <div style="color: #6b7280;">Value: ${valueFormatter(dataPoint.value)}</div>`;

          // Add metadata if available
          if (dataPoint.metadata) {
            Object.entries(dataPoint.metadata).forEach(([key, value]) => {
              html += `<div style="color: #6b7280;">${key}: ${value}</div>`;
            });
          }

          html += '</div>';
          return html;
        }),
      },
      ...(enableZoom && {
        toolbox: {
          show: true,
          left: 'right',
          top: 20,
          feature: {
            dataZoom: {
              yAxisIndex: false,
            },
            restore: {},
            saveAsImage: {
              pixelRatio: 2,
              name: `geo-map-${Date.now()}`,
            },
          },
        },
      }),
    };

    // Build choropleth map options
    if (type === 'choropleth') {
      const options: echarts.EChartsOption = {
        ...baseOptions,
        visualMap: showVisualMap ? {
          min: minValue,
          max: maxValue,
          text: ['High', 'Low'],
          realtime: false,
          calculable: true,
          inRange: {
            color: colorScheme,
          },
          left: visualMapPosition === 'left' ? 20 : undefined,
          right: visualMapPosition === 'right' ? 20 : undefined,
          top: visualMapPosition === 'top' ? 60 : undefined,
          bottom: visualMapPosition === 'bottom' ? 20 : undefined,
          textStyle: {
            color: '#1f2937',
          },
        } : undefined,
        series: [
          {
            name: title || 'Geographic Data',
            type: 'map',
            map: mapName,
            roam: enableZoom,
            emphasis: {
              label: {
                show: true,
              },
              itemStyle: {
                areaColor: '#fef3c7',
                borderColor: '#f59e0b',
                borderWidth: 2,
              },
            },
            select: {
              label: {
                show: true,
                color: '#1f2937',
              },
              itemStyle: {
                areaColor: '#fde68a',
                borderColor: '#d97706',
              },
            },
            itemStyle: {
              borderColor: '#e5e7eb',
              borderWidth: 0.5,
            },
            data: data.map(item => ({
              name: item.name,
              value: item.value,
            })),
          },
        ],
        ...additionalOptions,
      };

      chartInstance.setOption(options);
    }

    // Build bubble map options
    if (type === 'bubble') {
      const options: echarts.EChartsOption = {
        ...baseOptions,
        geo: {
          map: mapName,
          roam: enableZoom,
          itemStyle: {
            areaColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: 0.5,
          },
          emphasis: {
            itemStyle: {
              areaColor: '#e5e7eb',
            },
          },
        },
        visualMap: showVisualMap ? {
          min: minValue,
          max: maxValue,
          text: ['High', 'Low'],
          realtime: false,
          calculable: true,
          inRange: {
            symbolSize: [minBubbleSize, maxBubbleSize],
            color: colorScheme,
          },
          left: visualMapPosition === 'left' ? 20 : undefined,
          right: visualMapPosition === 'right' ? 20 : undefined,
          top: visualMapPosition === 'top' ? 60 : undefined,
          bottom: visualMapPosition === 'bottom' ? 20 : undefined,
          textStyle: {
            color: '#1f2937',
          },
        } : undefined,
        series: [
          {
            name: title || 'Geographic Data',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbolSize: (val: number[]) => {
              const value = val[2]; // Value is at index 2
              const normalized = (value - minValue) / (maxValue - minValue || 1);
              return minBubbleSize + normalized * (maxBubbleSize - minBubbleSize);
            },
            emphasis: {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
            data: data
              .filter(item => item.coords)
              .map(item => ({
                name: item.name,
                value: [...item.coords!, item.value],
                itemStyle: {
                  opacity: 0.8,
                },
              })),
          },
        ],
        ...additionalOptions,
      };

      chartInstance.setOption(options);
    }

    // Handle click events
    if (onRegionClick) {
      chartInstance.on('click', (params: any) => {
        const clickedData = data.find(d => d.name === params.name);
        if (clickedData) {
          onRegionClick(clickedData);
        }
      });
    }

    // Handle resize
    const handleResize = () => {
      chartInstance.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.dispose();
      chartInstanceRef.current = null;
    };
  }, [
    data,
    type,
    mapType,
    mapRegistered,
    colorScheme,
    minBubbleSize,
    maxBubbleSize,
    valueFormatter,
    enableZoom,
    showVisualMap,
    visualMapPosition,
    tooltipFormatter,
    additionalOptions,
    onRegionClick,
    geoJsonName,
  ]);

  /**
   * Handle loading state
   */
  useEffect(() => {
    if (chartInstanceRef.current) {
      if (isLoading) {
        chartInstanceRef.current.showLoading('default', {
          text: 'Loading map data...',
          color: '#3b82f6',
          textColor: '#1f2937',
          maskColor: 'rgba(255, 255, 255, 0.8)',
        });
      } else {
        chartInstanceRef.current.hideLoading();
      }
    }
  }, [isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (apiError || mapLoadError) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <p className="text-sm text-red-600">Failed to load map data</p>
        <p className="text-xs text-muted-foreground">{apiError?.message || mapLoadError}</p>
      </div>
    );
  }

  // Empty state
  if (!isLoading && data.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No geographic data available</p>
      </div>
    );
  }

  // Map loading state (before GeoJSON is registered)
  if (!mapRegistered) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground ml-2">Loading map data...</p>
      </div>
    );
  }

  /**
   * Render chart
   */
  return (
    <div style={containerStyle}>
      {showTitle && (
        <div style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          {title}
        </div>
      )}
      <div
        ref={chartRef}
        style={{
          height: typeof chartHeight === 'number' ? `${chartHeight}px` : chartHeight,
          width: '100%',
          minHeight: '400px',
        }}
      />
    </div>
  );
};

/**
 * Utility function to load GeoJSON from URL
 */
export const loadGeoJSON = async (url: string): Promise<object> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Common GeoJSON data sources
 */
export const GeoJSONSources = {
  // World map with country boundaries
  WORLD: 'https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json',

  // USA with state boundaries
  USA: 'https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/usa.json',

  // China with province boundaries
  CHINA: 'https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/china.json',

  // Alternative: Natural Earth datasets (more detailed)
  NATURAL_EARTH_110M: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
  NATURAL_EARTH_50M: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
  NATURAL_EARTH_10M: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson',
};

/**
 * Helper to convert standard country names to GeoJSON feature names
 */
export const normalizeCountryName = (name: string): string => {
  const mappings: Record<string, string> = {
    'United States': 'United States of America',
    'USA': 'United States of America',
    'UK': 'United Kingdom',
    'Russia': 'Russian Federation',
    'South Korea': 'Republic of Korea',
    'North Korea': 'Democratic People\'s Republic of Korea',
    // Add more mappings as needed
  };

  return mappings[name] || name;
};
