import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

/**
 * Geographic Map Chart Component
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
 *
 * @example
 * // Choropleth map showing revenue by country
 * <GeoMapChart
 *   type="choropleth"
 *   mapType="world"
 *   data={[
 *     { name: 'United States', value: 125000 },
 *     { name: 'China', value: 98000 },
 *     { name: 'Germany', value: 67000 }
 *   ]}
 *   title="Revenue by Country"
 * />
 *
 * @example
 * // Bubble map showing user activity by city
 * <GeoMapChart
 *   type="bubble"
 *   mapType="USA"
 *   data={[
 *     { name: 'New York', value: 50000, coords: [-74.006, 40.7128] },
 *     { name: 'Los Angeles', value: 38000, coords: [-118.2437, 34.0522] },
 *     { name: 'Chicago', value: 27000, coords: [-87.6298, 41.8781] }
 *   ]}
 *   title="User Activity by City"
 * />
 */

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

export interface GeoMapChartProps {
  /** Chart type: choropleth (color regions) or bubble (scatter points) */
  type: 'choropleth' | 'bubble';

  /**
   * Map type or custom GeoJSON
   * Built-in: 'world', 'USA', 'China', etc.
   * Custom: GeoJSON object or URL
   */
  mapType: string | object;

  /** Geographic data points */
  data: GeoMapDataPoint[];

  /** Chart title */
  title?: string;

  /** Chart subtitle */
  subtitle?: string;

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
  height?: string | number;

  /** Width of the chart container */
  width?: string | number;

  /** Loading state */
  loading?: boolean;

  /** Empty state message */
  emptyMessage?: string;

  /** Error state */
  error?: string;

  /** Additional ECharts options */
  additionalOptions?: echarts.EChartsOption;

  /** Callback when region is clicked */
  onRegionClick?: (data: GeoMapDataPoint) => void;

  /** Custom GeoJSON registration name */
  geoJsonName?: string;
}

const GeoMapChart: React.FC<GeoMapChartProps> = ({
  type,
  mapType,
  data,
  title,
  subtitle,
  colorScheme = ['#e0f3db', '#a8ddb5', '#43a2ca', '#0868ac'],
  minBubbleSize = 4,
  maxBubbleSize = 40,
  valueFormatter = (value: number) => value.toLocaleString(),
  enableZoom = true,
  showVisualMap = true,
  visualMapPosition = 'left',
  tooltipFormatter,
  height = 600,
  width = '100%',
  loading = false,
  emptyMessage = 'No geographic data available',
  error,
  additionalOptions = {},
  onRegionClick,
  geoJsonName = 'customMap',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const [mapRegistered, setMapRegistered] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

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

    // Build base options
    const baseOptions: echarts.EChartsOption = {
      title: {
        text: title,
        subtext: subtitle,
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 18,
          fontWeight: 600,
          color: '#1f2937',
        },
        subtextStyle: {
          fontSize: 14,
          color: '#6b7280',
        },
      },
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
    title,
    subtitle,
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
      if (loading) {
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
  }, [loading]);

  /**
   * Render error state
   */
  if (error || mapLoadError) {
    return (
      <div
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <svg
            style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#ef4444' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p style={{ color: '#991b1b', fontWeight: 500 }}>
            {error || mapLoadError}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!loading && data.length === 0) {
    return (
      <div
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <svg
            style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p style={{ color: '#6b7280', fontWeight: 500 }}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  /**
   * Render map loading state (before GeoJSON is registered)
   */
  if (!mapRegistered) {
    return (
      <div
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: '#6b7280', fontWeight: 500 }}>Loading map data...</p>
        </div>
      </div>
    );
  }

  /**
   * Render chart
   */
  return (
    <div
      ref={chartRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: '400px',
      }}
    />
  );
};

export default GeoMapChart;

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
