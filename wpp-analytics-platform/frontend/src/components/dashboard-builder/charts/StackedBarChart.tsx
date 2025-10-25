import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { formatValue } from '../../../utils/formatters';

export interface StackedBarChartProps {
  data: Array<{
    category: string;
    [key: string]: string | number;
  }>;
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  title?: string;
  subtitle?: string;
  height?: number | string;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showValues?: boolean;
  valueFormat?: 'number' | 'currency' | 'percent' | 'decimal';
  isPercentStacked?: boolean;
  gridLeft?: number | string;
  gridRight?: number | string;
  gridTop?: number | string;
  gridBottom?: number | string;
  colors?: string[];
  animation?: boolean;
  animationDuration?: number;
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis';
    formatter?: string | ((params: any) => string);
  };
  xAxisLabel?: {
    show?: boolean;
    rotate?: number;
    formatter?: string | ((value: any) => string);
  };
  yAxisLabel?: {
    show?: boolean;
    formatter?: string | ((value: any) => string);
  };
}

const DEFAULT_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#d4ec59'
];

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  series,
  title,
  subtitle,
  height = 400,
  showLegend = true,
  legendPosition = 'top',
  showValues = false,
  valueFormat = 'number',
  isPercentStacked = false,
  gridLeft = '10%',
  gridRight = '10%',
  gridTop = 80,
  gridBottom = 60,
  colors = DEFAULT_COLORS,
  animation = true,
  animationDuration = 1000,
  tooltip,
  xAxisLabel,
  yAxisLabel,
}) => {
  const option: EChartsOption = useMemo(() => {
    // Calculate totals for percentage mode
    const totals = isPercentStacked
      ? data.map(item => {
          return series.reduce((sum, s) => {
            const value = Number(item[s.key]) || 0;
            return sum + value;
          }, 0);
        })
      : [];

    // Transform data for ECharts series
    const chartSeries = series.map((s, index) => {
      const seriesData = data.map((item, dataIndex) => {
        const value = Number(item[s.key]) || 0;
        if (isPercentStacked && totals[dataIndex] > 0) {
          return (value / totals[dataIndex]) * 100;
        }
        return value;
      });

      return {
        name: s.name,
        type: 'bar',
        stack: 'total',
        data: seriesData,
        itemStyle: {
          color: s.color || colors[index % colors.length],
        },
        emphasis: {
          focus: 'series',
        },
        label: showValues
          ? {
              show: true,
              position: 'inside',
              formatter: (params: any) => {
                const value = params.value;
                if (isPercentStacked) {
                  return value > 5 ? `${value.toFixed(1)}%` : '';
                }
                return value > 0 ? formatValue(value, valueFormat) : '';
              },
            }
          : undefined,
      };
    });

    return {
      title: title
        ? {
            text: title,
            subtext: subtitle,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 600,
            },
            subtextStyle: {
              fontSize: 12,
              color: '#666',
            },
          }
        : undefined,
      tooltip: {
        show: tooltip?.show !== false,
        trigger: tooltip?.trigger || 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter:
          tooltip?.formatter ||
          ((params: any) => {
            if (!Array.isArray(params)) return '';

            const categoryName = params[0]?.axisValue || '';
            let tooltipContent = `<strong>${categoryName}</strong><br/>`;

            let total = 0;
            params.forEach((param: any) => {
              const originalIndex = data.findIndex(d => d.category === categoryName);
              const seriesKey = series[param.seriesIndex].key;
              const originalValue = Number(data[originalIndex]?.[seriesKey]) || 0;
              total += originalValue;

              const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;

              if (isPercentStacked) {
                tooltipContent += `${marker}${param.seriesName}: ${formatValue(originalValue, valueFormat)} (${param.value.toFixed(1)}%)<br/>`;
              } else {
                tooltipContent += `${marker}${param.seriesName}: ${formatValue(originalValue, valueFormat)}<br/>`;
              }
            });

            if (isPercentStacked) {
              tooltipContent += `<br/><strong>Total: ${formatValue(total, valueFormat)}</strong>`;
            } else {
              tooltipContent += `<strong>Total: ${formatValue(total, valueFormat)}</strong>`;
            }

            return tooltipContent;
          }),
      },
      legend: showLegend
        ? {
            data: series.map(s => s.name),
            [legendPosition]: legendPosition === 'top' || legendPosition === 'bottom' ? 'center' : 10,
            top: legendPosition === 'top' ? 30 : legendPosition === 'bottom' ? 'auto' : 'middle',
            bottom: legendPosition === 'bottom' ? 10 : 'auto',
            orient: legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal',
            type: 'scroll',
          }
        : undefined,
      grid: {
        left: gridLeft,
        right: gridRight,
        top: gridTop,
        bottom: gridBottom,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: isPercentStacked ? 100 : undefined,
        axisLabel: {
          show: xAxisLabel?.show !== false,
          formatter: xAxisLabel?.formatter || (isPercentStacked ? '{value}%' : '{value}'),
        },
      },
      yAxis: {
        type: 'category',
        data: data.map(item => item.category),
        axisLabel: {
          show: yAxisLabel?.show !== false,
          rotate: yAxisLabel?.rotate || 0,
          formatter: yAxisLabel?.formatter,
        },
      },
      series: chartSeries,
      animation,
      animationDuration,
    };
  }, [
    data,
    series,
    title,
    subtitle,
    showLegend,
    legendPosition,
    showValues,
    valueFormat,
    isPercentStacked,
    gridLeft,
    gridRight,
    gridTop,
    gridBottom,
    colors,
    animation,
    animationDuration,
    tooltip,
    xAxisLabel,
    yAxisLabel,
  ]);

  return (
    <ReactECharts
      option={option}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default StackedBarChart;
