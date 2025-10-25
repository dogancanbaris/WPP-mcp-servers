'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3, LineChart, PieChart, AreaChart, ScatterChart,
  Activity, Radar, Filter, Table, Hash, Gauge, TreePine, Clock,
  Calendar, Search, Type, Image, Box, Layers, Network, TrendingUp,
  GitBranch, Sparkles, Binary, CircleDot, BoxSelect, Boxes,
  BarChart4, Columns3, Grid3x3, MapPin, Globe, Target, Percent,
  Code2, CalendarRange, Sliders, FileText, Heading, List, Video, FileCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentType } from '@/types/dashboard-builder';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComponentPickerProps {
  onSelect: (type: ComponentType) => void;
  onClose: () => void;
}

interface ComponentOption {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: 'chart' | 'control' | 'content';
  tags: string[];
}

const componentOptions: ComponentOption[] = [
  // ===========================
  // CHARTS (31 total)
  // ===========================

  // Basic Charts
  {
    type: 'bar_chart',
    label: 'Bar Chart',
    icon: <BarChart3 className="w-8 h-8" />,
    description: 'Compare values across categories',
    category: 'chart',
    tags: ['bar', 'compare', 'categories', 'vertical']
  },
  {
    type: 'horizontal_bar',
    label: 'Horizontal Bar',
    icon: <BarChart4 className="w-8 h-8" />,
    description: 'Horizontal bar chart for long labels',
    category: 'chart',
    tags: ['bar', 'horizontal', 'compare', 'categories']
  },
  {
    type: 'line_chart',
    label: 'Line Chart',
    icon: <LineChart className="w-8 h-8" />,
    description: 'Show trends over time',
    category: 'chart',
    tags: ['line', 'trend', 'time', 'temporal']
  },
  {
    type: 'area_chart',
    label: 'Area Chart',
    icon: <AreaChart className="w-8 h-8" />,
    description: 'Display cumulative totals over time',
    category: 'chart',
    tags: ['area', 'cumulative', 'totals', 'filled', 'stacked']
  },

  // Circular Charts
  {
    type: 'pie_chart',
    label: 'Pie Chart',
    icon: <PieChart className="w-8 h-8" />,
    description: 'Show parts of a whole',
    category: 'chart',
    tags: ['pie', 'percentage', 'whole', 'circular']
  },
  {
    type: 'donut_chart',
    label: 'Donut Chart',
    icon: <CircleDot className="w-8 h-8" />,
    description: 'Pie chart with center hollow',
    category: 'chart',
    tags: ['donut', 'pie', 'percentage', 'circular', 'hollow']
  },
  {
    type: 'gauge',
    label: 'Gauge Chart',
    icon: <Gauge className="w-8 h-8" />,
    description: 'Display progress toward a goal',
    category: 'chart',
    tags: ['gauge', 'progress', 'goal', 'circular', 'meter']
  },

  // Scatter & Correlation
  {
    type: 'scatter_chart',
    label: 'Scatter Chart',
    icon: <ScatterChart className="w-8 h-8" />,
    description: 'Show correlations between variables',
    category: 'chart',
    tags: ['scatter', 'correlation', 'variables', 'plot']
  },
  {
    type: 'bubble_chart',
    label: 'Bubble Chart',
    icon: <Sparkles className="w-8 h-8" />,
    description: '3D scatter plot with sized bubbles',
    category: 'chart',
    tags: ['bubble', '3d', 'scatter', 'size', 'volume', 'correlation']
  },

  // Heatmaps
  {
    type: 'heatmap',
    label: 'Heatmap',
    icon: <Activity className="w-8 h-8" />,
    description: 'Visualize data density and patterns',
    category: 'chart',
    tags: ['heatmap', 'density', 'patterns', 'color']
  },
  {
    type: 'calendar_heatmap',
    label: 'Calendar Heatmap',
    icon: <Calendar className="w-8 h-8" />,
    description: 'GitHub-style calendar showing daily activity',
    category: 'chart',
    tags: ['calendar', 'heatmap', 'daily', 'activity', 'github', 'contributions']
  },

  // Multi-Dimensional
  {
    type: 'radar',
    label: 'Radar Chart',
    icon: <Radar className="w-8 h-8" />,
    description: 'Compare multiple variables on axes',
    category: 'chart',
    tags: ['radar', 'multiple', 'variables', 'spider', 'polar']
  },
  {
    type: 'polar_chart',
    label: 'Polar Chart',
    icon: <Target className="w-8 h-8" />,
    description: 'Circular bar chart with radial axes',
    category: 'chart',
    tags: ['polar', 'circular', 'radial', 'bar']
  },
  {
    type: 'parallel_coordinates',
    label: 'Parallel Coordinates',
    icon: <Columns3 className="w-8 h-8" />,
    description: 'Multi-dimensional data visualization',
    category: 'chart',
    tags: ['parallel', 'coordinates', 'multidimensional', 'axes']
  },

  // Hierarchical & Nested
  {
    type: 'treemap',
    label: 'Treemap',
    icon: <TreePine className="w-8 h-8" />,
    description: 'Show hierarchical data as nested rectangles',
    category: 'chart',
    tags: ['treemap', 'hierarchical', 'nested', 'rectangular']
  },
  {
    type: 'sunburst',
    label: 'Sunburst Chart',
    icon: <CircleDot className="w-8 h-8" />,
    description: 'Circular hierarchical visualization',
    category: 'chart',
    tags: ['sunburst', 'hierarchical', 'circular', 'nested', 'radial']
  },
  {
    type: 'sankey',
    label: 'Sankey Diagram',
    icon: <GitBranch className="w-8 h-8" />,
    description: 'Show flow between categories',
    category: 'chart',
    tags: ['sankey', 'flow', 'alluvial', 'transfer', 'funnel']
  },

  // Specialized Charts
  {
    type: 'funnel',
    label: 'Funnel Chart',
    icon: <Filter className="w-8 h-8" />,
    description: 'Show conversion rates and stages',
    category: 'chart',
    tags: ['funnel', 'conversion', 'stages', 'pipeline']
  },
  {
    type: 'waterfall',
    label: 'Waterfall Chart',
    icon: <TrendingUp className="w-8 h-8" />,
    description: 'Show cumulative effect of sequential values',
    category: 'chart',
    tags: ['waterfall', 'cumulative', 'sequential', 'bridge']
  },
  {
    type: 'candlestick',
    label: 'Candlestick Chart',
    icon: <BarChart4 className="w-8 h-8" />,
    description: 'Financial data with open/close/high/low',
    category: 'chart',
    tags: ['candlestick', 'financial', 'stock', 'ohlc', 'trading']
  },
  {
    type: 'boxplot',
    label: 'Box Plot',
    icon: <BoxSelect className="w-8 h-8" />,
    description: 'Statistical distribution visualization',
    category: 'chart',
    tags: ['boxplot', 'statistical', 'distribution', 'quartile', 'outliers']
  },
  {
    type: 'violin_plot',
    label: 'Violin Plot',
    icon: <Activity className="w-8 h-8" />,
    description: 'Distribution with density curve',
    category: 'chart',
    tags: ['violin', 'distribution', 'density', 'statistical']
  },

  // Time-Based
  {
    type: 'time_series',
    label: 'Time Series',
    icon: <Clock className="w-8 h-8" />,
    description: 'Analyze time-based patterns with zoom',
    category: 'chart',
    tags: ['time', 'series', 'temporal', 'patterns', 'chronological']
  },
  {
    type: 'gantt',
    label: 'Gantt Chart',
    icon: <CalendarRange className="w-8 h-8" />,
    description: 'Project timeline and task scheduling',
    category: 'chart',
    tags: ['gantt', 'timeline', 'schedule', 'project', 'tasks']
  },

  // Network & Relationships
  {
    type: 'graph',
    label: 'Network Graph',
    icon: <Network className="w-8 h-8" />,
    description: 'Visualize relationships and networks',
    category: 'chart',
    tags: ['graph', 'network', 'nodes', 'edges', 'relationships', 'connections']
  },
  {
    type: 'chord_diagram',
    label: 'Chord Diagram',
    icon: <CircleDot className="w-8 h-8" />,
    description: 'Show relationships between entities',
    category: 'chart',
    tags: ['chord', 'circular', 'relationships', 'flow', 'connections']
  },

  // Geographic
  {
    type: 'choropleth',
    label: 'Choropleth Map',
    icon: <MapPin className="w-8 h-8" />,
    description: 'Geographic data visualization',
    category: 'chart',
    tags: ['map', 'geographic', 'choropleth', 'regions', 'geo']
  },
  {
    type: 'geo_bubble',
    label: 'Geo Bubble Map',
    icon: <Globe className="w-8 h-8" />,
    description: 'Bubbles on geographic map',
    category: 'chart',
    tags: ['map', 'geographic', 'bubble', 'location', 'geo']
  },

  // Data Tables & Metrics
  {
    type: 'table',
    label: 'Data Table',
    icon: <Table className="w-8 h-8" />,
    description: 'Display data in rows and columns',
    category: 'chart',
    tags: ['table', 'rows', 'columns', 'data', 'grid']
  },
  {
    type: 'scorecard',
    label: 'Scorecard',
    icon: <Hash className="w-8 h-8" />,
    description: 'Show key metrics and KPIs',
    category: 'chart',
    tags: ['scorecard', 'kpi', 'metric', 'single', 'value']
  },
  {
    type: 'pivot_table',
    label: 'Pivot Table',
    icon: <Grid3x3 className="w-8 h-8" />,
    description: 'Interactive multi-dimensional data table',
    category: 'chart',
    tags: ['pivot', 'table', 'multidimensional', 'aggregate', 'cross-tab']
  },

  // ===========================
  // CONTROLS (11 total)
  // ===========================

  {
    type: 'date_picker',
    label: 'Date Picker',
    icon: <Calendar className="w-8 h-8" />,
    description: 'Select a single date',
    category: 'control',
    tags: ['date', 'picker', 'calendar', 'input', 'filter']
  },
  {
    type: 'date_range_picker',
    label: 'Date Range Picker',
    icon: <CalendarRange className="w-8 h-8" />,
    description: 'Select start and end dates',
    category: 'control',
    tags: ['date', 'range', 'calendar', 'period', 'filter']
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: <List className="w-8 h-8" />,
    description: 'Single-select dropdown menu',
    category: 'control',
    tags: ['dropdown', 'select', 'menu', 'filter', 'single']
  },
  {
    type: 'multi_select',
    label: 'Multi-Select',
    icon: <BoxSelect className="w-8 h-8" />,
    description: 'Multiple selection dropdown',
    category: 'control',
    tags: ['multi', 'select', 'dropdown', 'multiple', 'filter']
  },
  {
    type: 'slider',
    label: 'Slider',
    icon: <Sliders className="w-8 h-8" />,
    description: 'Numeric range slider',
    category: 'control',
    tags: ['slider', 'range', 'numeric', 'filter', 'input']
  },
  {
    type: 'text_input',
    label: 'Text Input',
    icon: <Type className="w-8 h-8" />,
    description: 'Free-form text input field',
    category: 'control',
    tags: ['text', 'input', 'search', 'filter', 'field']
  },
  {
    type: 'number_input',
    label: 'Number Input',
    icon: <Binary className="w-8 h-8" />,
    description: 'Numeric input field',
    category: 'control',
    tags: ['number', 'input', 'numeric', 'filter', 'field']
  },
  {
    type: 'toggle',
    label: 'Toggle Switch',
    icon: <Boxes className="w-8 h-8" />,
    description: 'Boolean on/off switch',
    category: 'control',
    tags: ['toggle', 'switch', 'boolean', 'checkbox', 'filter']
  },
  {
    type: 'radio_group',
    label: 'Radio Group',
    icon: <CircleDot className="w-8 h-8" />,
    description: 'Single selection from options',
    category: 'control',
    tags: ['radio', 'group', 'select', 'single', 'option']
  },
  {
    type: 'checkbox_group',
    label: 'Checkbox Group',
    icon: <BoxSelect className="w-8 h-8" />,
    description: 'Multiple selection checkboxes',
    category: 'control',
    tags: ['checkbox', 'group', 'multiple', 'select', 'filter']
  },
  {
    type: 'search_box',
    label: 'Search Box',
    icon: <Search className="w-8 h-8" />,
    description: 'Search input with autocomplete',
    category: 'control',
    tags: ['search', 'autocomplete', 'filter', 'find', 'query']
  },

  // ===========================
  // CONTENT (6 total)
  // ===========================

  {
    type: 'text_block',
    label: 'Text Block',
    icon: <FileText className="w-8 h-8" />,
    description: 'Rich text content block',
    category: 'content',
    tags: ['text', 'content', 'paragraph', 'rich', 'markdown']
  },
  {
    type: 'heading',
    label: 'Heading',
    icon: <Heading className="w-8 h-8" />,
    description: 'Section title or heading',
    category: 'content',
    tags: ['heading', 'title', 'h1', 'h2', 'h3', 'header']
  },
  {
    type: 'image',
    label: 'Image',
    icon: <Image className="w-8 h-8" />,
    description: 'Static image or logo',
    category: 'content',
    tags: ['image', 'picture', 'photo', 'logo', 'visual']
  },
  {
    type: 'video',
    label: 'Video',
    icon: <Video className="w-8 h-8" />,
    description: 'Embedded video player',
    category: 'content',
    tags: ['video', 'player', 'media', 'embed', 'youtube']
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: <Code2 className="w-8 h-8" />,
    description: 'Horizontal line separator',
    category: 'content',
    tags: ['divider', 'separator', 'line', 'hr', 'spacer']
  },
  {
    type: 'iframe',
    label: 'iFrame',
    icon: <FileCode className="w-8 h-8" />,
    description: 'Embed external content',
    category: 'content',
    tags: ['iframe', 'embed', 'external', 'widget', 'third-party']
  }
];

// Component card for displaying each option
const ComponentCard: React.FC<{
  option: ComponentOption;
  onClick: () => void;
}> = ({ option, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-4 text-center",
        "rounded-lg border-2 border-gray-200 dark:border-gray-700",
        "hover:border-blue-500 dark:hover:border-blue-500",
        "hover:bg-blue-50 dark:hover:bg-blue-950/50",
        "transition-all duration-200",
        "group"
      )}
    >
      {/* Icon */}
      <div className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {option.icon}
      </div>

      {/* Label */}
      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
        {option.label}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {option.description}
      </p>
    </button>
  );
};

export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  onSelect,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('charts');

  // Filter components based on search and active tab
  const filteredComponents = useMemo(() => {
    let filtered = componentOptions;

    // Filter by category
    if (activeTab === 'charts') {
      filtered = filtered.filter(opt => opt.category === 'chart');
    } else if (activeTab === 'controls') {
      filtered = filtered.filter(opt => opt.category === 'control');
    } else if (activeTab === 'content') {
      filtered = filtered.filter(opt => opt.category === 'content');
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(opt =>
        opt.label.toLowerCase().includes(searchLower) ||
        opt.description.toLowerCase().includes(searchLower) ||
        opt.tags.some(tag => tag.includes(searchLower))
      );
    }

    return filtered;
  }, [search, activeTab]);

  const chartCount = componentOptions.filter(opt => opt.category === 'chart').length;
  const controlCount = componentOptions.filter(opt => opt.category === 'control').length;
  const contentCount = componentOptions.filter(opt => opt.category === 'content').length;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Add Component</DialogTitle>
          <DialogDescription>
            Choose a chart, control, or content element to add to your dashboard
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Charts
              <span className="ml-1 text-xs opacity-60">({chartCount})</span>
            </TabsTrigger>
            <TabsTrigger value="controls" className="gap-2">
              <Layers className="w-4 h-4" />
              Controls
              <span className="ml-1 text-xs opacity-60">({controlCount})</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Box className="w-4 h-4" />
              Content
              <span className="ml-1 text-xs opacity-60">({contentCount})</span>
            </TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="mt-4">
            {filteredComponents.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {filteredComponents.map((option) => (
                  <ComponentCard
                    key={option.type}
                    option={option}
                    onClick={() => onSelect(option.type)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No charts found matching "{search}"</p>
              </div>
            )}
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="mt-4">
            {filteredComponents.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {filteredComponents.map((option) => (
                  <ComponentCard
                    key={option.type}
                    option={option}
                    onClick={() => onSelect(option.type)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No controls found matching "{search}"</p>
              </div>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-4">
            {filteredComponents.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {filteredComponents.map((option) => (
                  <ComponentCard
                    key={option.type}
                    option={option}
                    onClick={() => onSelect(option.type)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No content elements found matching "{search}"</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};