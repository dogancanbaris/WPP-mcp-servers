import { useEffect, RefObject } from 'react';
import type ReactECharts from 'echarts-for-react';

/**
 * useChartResize Hook
 *
 * Automatically resizes ECharts instance when container size changes.
 * Uses ResizeObserver for optimal performance.
 *
 * @param chartRef - Ref to ReactECharts component
 * @param containerSize - Optional container dimensions to trigger resize
 */
export function useChartResize(
  chartRef: RefObject<ReactECharts | null>,
  containerSize?: { width: number; height: number }
) {
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      const instance = chartRef.current.getEchartsInstance();
      if (!instance) return;

      // Create ResizeObserver to watch container
      const resizeObserver = new ResizeObserver(() => {
        // Call ECharts resize to update dimensions
        instance.resize({
          animation: {
            duration: 200,
            easing: 'cubicOut',
          },
        });
      });

      // Get the DOM element that contains the chart
      const container = chartRef.current.ele;
      if (container) {
        resizeObserver.observe(container);
      }

      // Cleanup on unmount
      return () => {
        resizeObserver.disconnect();
      };
    } catch (error) {
      console.warn('[useChartResize] Failed to setup resize observer:', error);
    }
  }, [chartRef, containerSize]); // Re-run if containerSize changes
}
