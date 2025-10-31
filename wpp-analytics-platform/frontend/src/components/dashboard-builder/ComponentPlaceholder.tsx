'use client';

import React from 'react';
import {
  BarChart3, LineChart, PieChart, AreaChart, ScatterChart,
  Activity, Filter, Table, Hash, TreePine,
  Clock, MousePointer, Workflow, Type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentType, ComponentConfig } from '@/types/dashboard-builder';

interface ComponentPlaceholderProps {
  type: ComponentType;
  config?: ComponentConfig;
  onClick?: () => void;
}

const componentIcons: Partial<Record<ComponentType, React.ReactNode>> = {
  // Basic charts
  'bar_chart': <BarChart3 className="w-8 h-8" />,
  'horizontal_bar': <BarChart3 className="w-8 h-8 rotate-90" />,
  'line_chart': <LineChart className="w-8 h-8" />,
  'pie_chart': <PieChart className="w-8 h-8" />,
  'donut_chart': <PieChart className="w-8 h-8" />,
  'area_chart': <AreaChart className="w-8 h-8" />,
  'scatter_chart': <ScatterChart className="w-8 h-8" />,
  'bubble_chart': <Workflow className="w-8 h-8" />,
  // Heatmaps
  'heatmap': <Activity className="w-8 h-8" />,
  // Advanced
  'funnel': <Filter className="w-8 h-8" />,
  'table': <Table className="w-8 h-8" />,
  'scorecard': <Hash className="w-8 h-8" />,
  'treemap': <TreePine className="w-8 h-8" />,
  'sunburst': <TreePine className="w-8 h-8" />,
  'time_series': <Clock className="w-8 h-8" />,
  'title': <Type className="w-8 h-8" />,
};

const componentLabels: Partial<Record<ComponentType, string>> = {
  // Basic charts
  'bar_chart': 'Bar Chart',
  'horizontal_bar': 'Horizontal Bar',
  'line_chart': 'Line Chart',
  'pie_chart': 'Pie Chart',
  'donut_chart': 'Donut Chart',
  'area_chart': 'Area Chart',
  'scatter_chart': 'Scatter Chart',
  'bubble_chart': 'Bubble Chart',
  // Heatmaps
  'heatmap': 'Heatmap',
  // Advanced
  'funnel': 'Funnel Chart',
  'table': 'Table',
  'scorecard': 'Scorecard',
  'treemap': 'Treemap',
  'sunburst': 'Sunburst',
  'time_series': 'Time Series',
  'title': 'Title',
};

export const ComponentPlaceholder: React.FC<ComponentPlaceholderProps> = ({
  type,
  config,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full h-full min-h-[200px] flex flex-col items-center justify-center",
        "bg-white dark:bg-gray-950 rounded-md",
        "border border-gray-200 dark:border-gray-800",
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
      )}
    >
      {/* Icon */}
      <div className="text-gray-400 dark:text-gray-600 mb-3">
        {componentIcons[type] || <Activity className="w-8 h-8" />}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {config?.title || componentLabels[type] || type}
      </h3>

      {/* Component Type Label */}
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {componentLabels[type] || type}
      </span>

      {/* Configuration Status */}
      {config?.datasource ? (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Configured
          </span>
        </div>
      ) : (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Setup Required
          </span>
        </div>
      )}

      {/* Click Hint */}
      {onClick && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <MousePointer className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
};