import React from 'react';
import { ComponentConfig } from '@/types/dashboard-builder';

// Chart Components - Basic
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { PieChart } from './charts/PieChart';
import { AreaChart } from './charts/AreaChart';
import { ComboChart } from './charts/ComboChart';

// Chart Components - Advanced
import { ScatterChart } from './charts/ScatterChart';
import { BubbleChart } from './charts/BubbleChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { CalendarHeatmap } from './charts/CalendarHeatmap';
import { RadarChart } from './charts/RadarChart';
import { FunnelChart } from './charts/FunnelChart';
import { GaugeChart } from './charts/GaugeChart';
import { TreemapChart } from './charts/TreemapChart';
import { SunburstChart } from './charts/SunburstChart';
import { SankeyChart } from './charts/SankeyChart';
import { WaterfallChart } from './charts/WaterfallChart';
import { ParallelChart } from './charts/ParallelChart';
import { BoxplotChart } from './charts/BoxplotChart';
import { BulletChart } from './charts/BulletChart';
import { CandlestickChart } from './charts/CandlestickChart';
import GeoMapChart from './charts/GeoMapChart';
import { PictorialBarChart } from './charts/PictorialBarChart';
import { StackedBarChart } from './charts/StackedBarChart';
import { StackedColumnChart } from './charts/StackedColumnChart';
import { ThemeRiverChart } from './charts/ThemeRiverChart';
import { TreeChart } from './charts/TreeChart';

// Chart Components - Data Display
import { TableChart } from './charts/TableChart';
import PivotTableChart from './charts/PivotTableChart';
import { Scorecard } from './charts/Scorecard';

// Chart Components - Specialized
import { GraphChart } from './charts/GraphChart';
import { TimelineChart } from './charts/TimelineChart';

// Control Components
import { DateRangeFilter } from './controls/DateRangeFilter';
import { CheckboxFilter } from './controls/CheckboxFilter';
import { DimensionControl } from './controls/DimensionControl';
import { SliderFilter } from './controls/SliderFilter';
import { PresetFilter } from './controls/PresetFilter';
import { DataSourceControl } from './controls/DataSourceControl';
import { DropdownFilter } from './controls/DropdownFilter';
import { AdvancedFilter } from './controls/AdvancedFilter';
import { ButtonControl } from './controls/ButtonControl';
import { InputBoxFilter } from './controls/InputBoxFilter';
import { ListFilter } from './controls/ListFilter';

// Content Components
import { TitleComponent } from './content/TitleComponent';
import { LineComponent } from './content/LineComponent';
import { TextComponent } from './content/TextComponent';
import { ImageComponent } from './content/ImageComponent';
import { CircleComponent } from './content/CircleComponent';
import { RectangleComponent } from './content/RectangleComponent';

interface ChartWrapperProps {
  config: ComponentConfig;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * ChartWrapper Component
 *
 * Universal wrapper that renders ANY dashboard component based on configuration type.
 * Supports 49 component types across 3 categories:
 *
 * CHARTS (32 types):
 * - Basic: time_series, bar_chart, line_chart, pie_chart, area_chart, combo_chart
 * - Advanced: scatter_chart, bubble_chart, heatmap, calendar_heatmap, radar, funnel,
 *             gauge, treemap, sunburst, sankey, waterfall, parallel, boxplot, bullet,
 *             candlestick, geomap, pictorial_bar, stacked_bar, stacked_column,
 *             theme_river, tree
 * - Data Display: table, pivot_table, scorecard
 * - Specialized: graph, timeline
 *
 * CONTROLS (11 types):
 * - Filters: date_range_filter, checkbox_filter, slider_filter, preset_filter,
 *            dropdown_filter, advanced_filter, input_box_filter, list_filter
 * - Configuration: dimension_control, data_source_control, button_control
 *
 * CONTENT (6 types):
 * - Elements: title, line, text, image, circle, rectangle
 *
 * @param config - Component configuration including type and visualization settings
 * @param onClick - Optional click handler for component selection
 * @param isSelected - Whether this component is currently selected
 */
export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  config,
  onClick,
  isSelected = false
}) => {
  console.log('[ChartWrapper] Rendering component:', {
    type: config.type,
    id: config.id,
    title: config.title,
    metrics: config.metrics,
    dimension: config.dimension
  });

  /**
   * Renders the appropriate chart component based on config.type
   * Supports 48+ component types including charts, controls, and content elements
   */
  const renderChart = () => {
    switch (config.type) {
      // ===== BASIC CHARTS =====
      case 'time_series':
        return <TimeSeriesChart {...config} />;

      case 'bar_chart':
        return <BarChart {...config} />;

      case 'line_chart':
        return <LineChart {...config} />;

      case 'pie_chart':
        return <PieChart {...config} />;

      case 'area_chart':
        return <AreaChart {...config} />;

      case 'combo_chart':
        return <ComboChart {...config} />;

      // ===== ADVANCED CHARTS =====
      case 'scatter_chart':
        return <ScatterChart {...config} />;

      case 'bubble_chart':
        return <BubbleChart {...config} />;

      case 'heatmap':
        return <HeatmapChart {...config} />;

      case 'calendar_heatmap':
        return <CalendarHeatmap {...config} />;

      case 'radar':
        return <RadarChart {...config} />;

      case 'funnel':
        return <FunnelChart {...config} />;

      case 'gauge':
        return <GaugeChart {...config} />;

      case 'treemap':
        return <TreemapChart {...config} />;

      case 'sunburst':
        return <SunburstChart {...config} />;

      case 'sankey':
        return <SankeyChart
          {...config}
          query={{ measures: config.metrics || [], dimensions: config.dimension ? [config.dimension] : [] }}
          flowLevels={config.dimension ? [config.dimension] : []}
          valueMeasure={config.metrics?.[0] || ''}
        />;

      case 'waterfall':
        return <WaterfallChart
          {...config}
          query={{ measures: config.metrics || [], dimensions: config.dimension ? [config.dimension] : [] }}
        />;

      case 'parallel':
        return <ParallelChart
          {...config}
          query={{ measures: config.metrics || [], dimensions: config.dimension ? [config.dimension] : [] }}
          axes={config.metrics?.map(m => ({ name: m, label: m, type: 'value' as const })) || []}
        />;

      case 'boxplot':
        return <BoxplotChart {...config} />;

      case 'bullet':
        return <BulletChart
          {...config}
          query={{ measures: config.metrics || [], dimensions: config.dimension ? [config.dimension] : [] }}
          measure={config.metrics?.[0] || ''}
        />;

      case 'candlestick':
        return <CandlestickChart {...config} />;

      case 'geomap':
        return <GeoMapChart
          {...config}
          type="choropleth"
          mapType="world"
          data={[]}
        />;

      case 'pictorial_bar':
        return <PictorialBarChart {...config} />;

      case 'stacked_bar':
        return <StackedBarChart
          {...config}
          data={[]}
          series={config.metrics?.map(m => ({ key: m, name: m })) || []}
        />;

      case 'stacked_column':
        return <StackedColumnChart
          {...config}
          data={[]}
          series={config.metrics?.map(m => ({ key: m, name: m })) || []}
        />;

      case 'theme_river':
        return <ThemeRiverChart {...config} />;

      case 'tree':
        return <TreeChart {...config} />;

      // ===== DATA DISPLAY =====
      case 'table':
        return <TableChart {...config} />;

      case 'pivot_table':
        return <PivotTableChart
          {...config}
          query={{ measures: config.metrics || [], dimensions: config.dimension ? [config.dimension] : [] }}
        />;

      case 'scorecard':
        return <Scorecard {...config} />;

      // ===== SPECIALIZED CHARTS =====
      case 'graph':
        return <GraphChart {...config} />;

      case 'timeline':
        return <TimelineChart {...config} />;

      // ===== CONTROL COMPONENTS =====
      case 'date_range_filter':
        return <DateRangeFilter
          {...(config as any)}
          value={{
            range: { type: 'preset', preset: 'last7days' },
            comparison: { enabled: false }
          }}
          onChange={() => {}}
        />;

      case 'checkbox_filter':
        return <CheckboxFilter
          {...(config as any)}
          label={config.title || ''}
          value={false}
          onChange={() => {}}
        />;

      case 'dimension_control':
        return <DimensionControl
          {...config}
          value={''}
          onChange={() => {}}
        />;

      case 'slider_filter':
        return <SliderFilter
          {...config}
          label={config.title || ''}
          filterId={config.id}
          min={0}
          max={100}
          onChange={() => {}}
        />;

      case 'preset_filter':
        return <PresetFilter
          {...config}
          currentFilters={[] as any}
          onApplyPreset={() => {}}
        />;

      case 'data_source_control':
        return <DataSourceControl
          {...config}
          sources={[]}
          value={''}
          onChange={() => {}}
        />;

      case 'dropdown_filter':
        return <DropdownFilter
          {...(config as any)}
          label={config.title || ''}
        />;

      case 'advanced_filter':
        return <AdvancedFilter
          {...config}
          value={[] as any}
          onChange={() => {}}
          availableFields={[]}
        />;

      case 'button_control':
        return <ButtonControl
          {...config}
          label={config.title || 'Button'}
          action={'' as any}
          onAction={() => {}}
        />;

      case 'input_box_filter':
        return <InputBoxFilter
          {...config}
          field={''}
          onChange={() => {}}
        />;

      case 'list_filter':
        return <ListFilter
          {...(config as any)}
          options={[]}
          selectedValues={[]}
          onSelectionChange={() => {}}
        />;

      // ===== CONTENT COMPONENTS =====
      case 'title':
        return <TitleComponent
          {...config}
          text={config.title || config.text || 'Add title here...'}
          color={config.titleColor || config.color}
          fontSize={config.titleFontSize || config.fontSize}
          fontWeight={config.titleFontWeight || config.fontWeight}
          fontFamily={config.titleFontFamily || config.fontFamily}
          alignment={config.titleAlignment || config.alignment}
          backgroundColor={config.titleBackgroundColor || config.backgroundColor}
        />;

      case 'line':
        return <LineComponent {...config} />;

      case 'text':
        return <TextComponent {...(config as any)} text={config.text || config.title || ''} />;

      case 'image':
        return <ImageComponent
          config={config as any}
          onChange={() => {}}
        />;

      case 'circle':
        return <CircleComponent {...config} />;

      case 'rectangle':
        return <RectangleComponent {...config} />;

      // ===== FALLBACK =====
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center p-4">
              <p className="text-gray-500 font-medium">Unknown Component Type</p>
              <p className="text-gray-400 text-sm mt-1">{config.type}</p>
              <p className="text-gray-400 text-xs mt-2">
                Supported: 32 charts + 11 controls + 6 content elements
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative
        w-full
        h-full
        cursor-pointer
        transition-all
        duration-200
        rounded-lg
        ${isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
          : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'
        }
      `.trim().replace(/\s+/g, ' ')}
      role="button"
      tabIndex={0}
      aria-label={`Chart component: ${config.title || config.type}`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {renderChart()}

      {/* Selection indicator badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
          Selected
        </div>
      )}
    </div>
  );
};
