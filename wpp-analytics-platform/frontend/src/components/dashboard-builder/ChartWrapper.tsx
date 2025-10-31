import React from 'react';
import { ComponentConfig } from '@/types/dashboard-builder';

// Chart Components - Basic
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { PieChart } from './charts/PieChart';
import { AreaChart } from './charts/AreaChart';

// Chart Components - Advanced
import { ScatterChart } from './charts/ScatterChart';
import { BubbleChart } from './charts/BubbleChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { FunnelChart } from './charts/FunnelChart';
import { TreemapChart } from './charts/TreemapChart';
import { SunburstChart } from './charts/SunburstChart';
import { SankeyChart } from './charts/SankeyChart';
import { WaterfallChart } from './charts/WaterfallChart';
import { GeoMapChart } from './charts/GeoMapChart';
import { TreeChart } from './charts/TreeChart';
import { WordCloudChart } from './charts/WordCloudChart';

// Chart Components - Stacked
import { StackedColumnChart } from './charts/StackedColumnChart';
import { StackedBarChart } from './charts/StackedBarChart';

// Chart Components - Data Display
import { TableChart } from './charts/TableChart';
import { Scorecard } from './charts/Scorecard';

// Control Components
import { DateRangeFilter } from './controls/DateRangeFilter';
import { DateRangeFilterWrapper } from './controls/DateRangeFilterWrapper';
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
 * Supports 36 component types across 3 categories:
 *
 * CHARTS (20 types):
 * - Basic: time_series, bar_chart, line_chart, pie_chart, donut_chart, area_chart,
 *          horizontal_bar
 * - Advanced: scatter_chart, bubble_chart, heatmap, funnel, treemap, sunburst,
 *             sankey, waterfall, geomap, stacked_bar, stacked_column, tree, word_cloud
 * - Data Display: table, scorecard
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
    dimension: config.dimension,
    dataset_id: (config as any).dataset_id
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

      case 'donut_chart':
        // Donut chart = Pie chart with hollow center
        return <PieChart {...config} pieRadius={['40%', '70%']} />;

      case 'horizontal_bar':
        // Horizontal bar chart = Bar chart with horizontal orientation
        return <BarChart {...config} orientation="horizontal" />;

      case 'area_chart':
        return <AreaChart {...config} />;

      // ===== ADVANCED CHARTS =====
      case 'scatter_chart':
        return <ScatterChart {...config} />;

      case 'bubble_chart':
        return <BubbleChart {...config} />;

      case 'heatmap':
        return <HeatmapChart {...config} />;

      case 'funnel':
        return <FunnelChart {...config} />;

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

      case 'geomap':
        return <GeoMapChart
          {...config}
          type="choropleth"
          mapType="world"
          data={[]}
        />;

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

      case 'tree':
      case 'word_cloud':
        return <WordCloudChart {...config} />;

      case 'tree':
        return <TreeChart {...config} />;

      // ===== DATA DISPLAY =====
      case 'table':
        return <TableChart {...config} />;

      case 'scorecard':
        return <Scorecard {...config} />;

      // ===== CONTROL COMPONENTS =====
      case 'date_range_filter':
        return <DateRangeFilterWrapper {...config} />;

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
                Supported: 20 charts + 11 controls + 6 content elements
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
