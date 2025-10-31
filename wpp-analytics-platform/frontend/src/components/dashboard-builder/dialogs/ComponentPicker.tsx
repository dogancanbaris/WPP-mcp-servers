'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ComponentType } from '@/types/dashboard-builder';
import {
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Hash,
  Activity,
  Network,
  Pyramid,
  Box,
} from 'lucide-react';

interface ComponentPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: ComponentType) => void;
}

interface ComponentOption {
  type: ComponentType;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'basic' | 'advanced' | 'specialized';
}

const COMPONENT_OPTIONS: ComponentOption[] = [
  // ===== BASIC CHARTS =====
  {
    type: 'time_series',
    name: 'Time Series',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'Line chart showing trends over time',
    category: 'basic',
  },
  {
    type: 'bar_chart',
    name: 'Bar Chart',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Compare values across categories',
    category: 'basic',
  },
  {
    type: 'horizontal_bar',
    name: 'Horizontal Bar',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Compare values horizontally',
    category: 'basic',
  },
  {
    type: 'line_chart',
    name: 'Line Chart',
    icon: <LineChart className="w-6 h-6" />,
    description: 'Connect data points with lines',
    category: 'basic',
  },
  {
    type: 'pie_chart',
    name: 'Pie Chart',
    icon: <PieChart className="w-6 h-6" />,
    description: 'Show proportions of a whole',
    category: 'basic',
  },
  {
    type: 'donut_chart',
    name: 'Donut Chart',
    icon: <PieChart className="w-6 h-6" />,
    description: 'Ring-shaped pie chart',
    category: 'basic',
  },
  {
    type: 'area_chart',
    name: 'Area Chart',
    icon: <Activity className="w-6 h-6" />,
    description: 'Filled line chart showing volume',
    category: 'basic',
  },

  // ===== STACKED CHARTS =====
  {
    type: 'stacked_bar',
    name: 'Stacked Bar',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Stacked bar chart',
    category: 'advanced',
  },
  {
    type: 'stacked_column',
    name: 'Stacked Column',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Stacked column chart',
    category: 'advanced',
  },

  // ===== HIERARCHICAL =====
  {
    type: 'treemap',
    name: 'Treemap',
    icon: <Box className="w-6 h-6" />,
    description: 'Hierarchical data with nested rectangles',
    category: 'advanced',
  },
  {
    type: 'sunburst',
    name: 'Sunburst',
    icon: <Box className="w-6 h-6" />,
    description: 'Radial hierarchical visualization',
    category: 'advanced',
  },
  {
    type: 'tree',
    name: 'Tree',
    icon: <Box className="w-6 h-6" />,
    description: 'Hierarchical tree structure',
    category: 'advanced',
  },

  // ===== DATA DISPLAY =====
  {
    type: 'table',
    name: 'Table',
    icon: <Table className="w-6 h-6" />,
    description: 'Display data in rows and columns',
    category: 'basic',
  },
  {
    type: 'scorecard',
    name: 'Scorecard',
    icon: <Hash className="w-6 h-6" />,
    description: 'Show a single metric prominently',
    category: 'basic',
  },

  // ===== ADVANCED VISUALIZATION =====
  {
    type: 'heatmap',
    name: 'Heatmap',
    icon: <Box className="w-6 h-6" />,
    description: 'Color-coded data intensity map',
    category: 'advanced',
  },
  {
    type: 'scatter_chart',
    name: 'Scatter Plot',
    icon: <Activity className="w-6 h-6" />,
    description: 'Two-dimensional scatter plot',
    category: 'advanced',
  },
  {
    type: 'bubble_chart',
    name: 'Bubble Chart',
    icon: <Activity className="w-6 h-6" />,
    description: 'Bubble chart with three dimensions',
    category: 'advanced',
  },
  {
    type: 'waterfall',
    name: 'Waterfall',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Show cumulative effect of values',
    category: 'advanced',
  },

  // ===== SPECIALIZED =====
  {
    type: 'funnel_chart',
    name: 'Funnel',
    icon: <Pyramid className="w-6 h-6" />,
    description: 'Conversion rates through stages',
    category: 'specialized',
  },
  {
    type: 'sankey',
    name: 'Sankey Diagram',
    icon: <Network className="w-6 h-6" />,
    description: 'Flow and relationships between entities',
    category: 'specialized',
  },
  {
    type: 'word_cloud',
    name: 'Word Cloud',
    icon: <Activity className="w-6 h-6" />,
    description: 'Text frequency visualization',
    category: 'specialized',
  },
];

export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'advanced' | 'specialized'>('all');

  const filteredComponents = selectedCategory === 'all'
    ? COMPONENT_OPTIONS
    : COMPONENT_OPTIONS.filter((c) => c.category === selectedCategory);

  const handleSelect = (type: ComponentType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Component</DialogTitle>
          <DialogDescription>
            Choose a chart or visualization to add to your dashboard
          </DialogDescription>
        </DialogHeader>

        {/* Category Filters */}
        <div className="flex gap-2 border-b pb-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('basic')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              selectedCategory === 'basic'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Basic
          </button>
          <button
            onClick={() => setSelectedCategory('advanced')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              selectedCategory === 'advanced'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Advanced
          </button>
          <button
            onClick={() => setSelectedCategory('specialized')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              selectedCategory === 'specialized'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Specialized
          </button>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-3 gap-3 overflow-y-auto flex-1 py-4">
          {filteredComponents.map((component) => (
            <button
              key={component.type}
              onClick={() => handleSelect(component.type)}
              className={cn(
                'flex flex-col items-center gap-3 p-4 text-center',
                'rounded-lg border-2 border-gray-200',
                'hover:border-blue-500 hover:bg-blue-50',
                'transition-all duration-200',
                'group'
              )}
            >
              {/* Icon */}
              <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                {component.icon}
              </div>

              {/* Name */}
              <div>
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">
                  {component.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-600">
                  {component.description}
                </p>
              </div>

              {/* Category Badge */}
              <span className={cn(
                'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
                component.category === 'basic' && 'bg-green-100 text-green-700',
                component.category === 'advanced' && 'bg-blue-100 text-blue-700',
                component.category === 'specialized' && 'bg-purple-100 text-purple-700'
              )}>
                {component.category}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
