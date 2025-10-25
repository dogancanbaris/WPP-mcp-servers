'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Undo,
  Redo,
  MousePointer,
  Plus,
  BarChart3,
  SlidersHorizontal,
  Zap,
  Calendar,
  Filter,
  LayoutGrid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { ColumnWidth, ComponentType } from '@/types/dashboard-builder';

interface LayoutOption {
  id: string;
  name: string;
  columns: ColumnWidth[];
  icon: React.ReactNode;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: '1-col', name: '1 Column', columns: ['1/1'], icon: <div className="w-12 h-8 bg-primary/20 rounded" /> },
  { id: '2-col', name: '2 Columns', columns: ['1/2', '1/2'], icon: <div className="flex gap-1"><div className="w-6 h-8 bg-primary/20 rounded" /><div className="w-6 h-8 bg-primary/20 rounded" /></div> },
  { id: '3-col', name: '3 Columns', columns: ['1/3', '1/3', '1/3'], icon: <div className="flex gap-1"><div className="w-4 h-8 bg-primary/20 rounded" /><div className="w-4 h-8 bg-primary/20 rounded" /><div className="w-4 h-8 bg-primary/20 rounded" /></div> },
  { id: '1-3-2-3', name: '1/3 - 2/3', columns: ['1/3', '2/3'], icon: <div className="flex gap-1"><div className="w-4 h-8 bg-primary/20 rounded" /><div className="w-8 h-8 bg-primary/20 rounded" /></div> },
  { id: '2-3-1-3', name: '2/3 - 1/3', columns: ['2/3', '1/3'], icon: <div className="flex gap-1"><div className="w-8 h-8 bg-primary/20 rounded" /><div className="w-4 h-8 bg-primary/20 rounded" /></div> },
  { id: '1-4-3-4', name: '1/4 - 3/4', columns: ['1/4', '3/4'], icon: <div className="flex gap-1"><div className="w-3 h-8 bg-primary/20 rounded" /><div className="w-9 h-8 bg-primary/20 rounded" /></div> },
  { id: '3-4-1-4', name: '3/4 - 1/4', columns: ['3/4', '1/4'], icon: <div className="flex gap-1"><div className="w-9 h-8 bg-primary/20 rounded" /><div className="w-3 h-8 bg-primary/20 rounded" /></div> },
  { id: '4-col', name: '4 Columns', columns: ['1/4', '1/4', '1/4', '1/4'], icon: <div className="flex gap-1"><div className="w-3 h-8 bg-primary/20 rounded" /><div className="w-3 h-8 bg-primary/20 rounded" /><div className="w-3 h-8 bg-primary/20 rounded" /><div className="w-3 h-8 bg-primary/20 rounded" /></div> },
];

const CHART_TYPES: { id: ComponentType; name: string; icon: React.ReactNode }[] = [
  { id: 'table', name: 'Table', icon: <LayoutGrid className="h-5 w-5" /> },
  { id: 'time_series', name: 'Time Series', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'bar_chart', name: 'Bar Chart', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'line_chart', name: 'Line Chart', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'pie_chart', name: 'Pie Chart', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'scorecard', name: 'Scorecard', icon: <BarChart3 className="h-5 w-5" /> },
];

export const QuickTools: React.FC = () => {
  const { undo, redo, canUndo, canRedo, addRow } = useDashboardStore();
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [cursorMode, setCursorMode] = useState<'select' | 'pan'>('select');

  const handleAddRow = (layout: ColumnWidth[]) => {
    addRow(layout);
    setShowLayoutPicker(false);
  };

  const handleAddChart = (type: ComponentType) => {
    // TODO: Implement chart addition
    console.log('Add chart:', type);
  };

  const handleAddControl = (type: 'date' | 'filter') => {
    // TODO: Implement control addition
    console.log('Add control:', type);
  };

  const handleQuickAction = (action: string) => {
    // TODO: Implement quick actions (align, distribute)
    console.log('Quick action:', action);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Undo */}
        <Button
          size="sm"
          variant="ghost"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>

        {/* Redo */}
        <Button
          size="sm"
          variant="ghost"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Cursor Mode */}
        <Button
          size="sm"
          variant={cursorMode === 'select' ? 'secondary' : 'ghost'}
          onClick={() => setCursorMode('select')}
          title="Select Tool (V)"
          className="h-8 w-8 p-0"
        >
          <MousePointer className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Add Row */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowLayoutPicker(true)}
          title="Add Row"
          className="h-8 px-2 text-xs gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>

        {/* Add Chart Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              title="Add Chart"
              className="h-8 px-2 text-xs gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Add Chart
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            {CHART_TYPES.map((chart) => (
              <DropdownMenuItem key={chart.id} onClick={() => handleAddChart(chart.id)}>
                {chart.icon}
                <span className="ml-2">{chart.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Control Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              title="Add Control"
              className="h-8 px-2 text-xs gap-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Add Control
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={() => handleAddControl('date')}>
              <Calendar className="h-4 w-4 mr-2" />
              Date Picker
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddControl('filter')}>
              <Filter className="h-4 w-4 mr-2" />
              Filter Control
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              title="Quick Actions"
              className="h-8 px-2 text-xs gap-1"
            >
              <Zap className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuItem onClick={() => handleQuickAction('align-left')}>
              <AlignLeft className="h-4 w-4 mr-2" />
              Align Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('align-center')}>
              <AlignCenter className="h-4 w-4 mr-2" />
              Align Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('align-right')}>
              <AlignRight className="h-4 w-4 mr-2" />
              Align Right
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('align-justify')}>
              <AlignJustify className="h-4 w-4 mr-2" />
              Justify
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleQuickAction('distribute-horizontal')}>
              <AlignJustify className="h-4 w-4 mr-2" />
              Distribute Horizontally
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('distribute-vertical')}>
              <AlignJustify className="h-4 w-4 mr-2" />
              Distribute Vertically
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Layout Picker Dialog */}
      <Dialog open={showLayoutPicker} onOpenChange={setShowLayoutPicker}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose Row Layout</DialogTitle>
            <DialogDescription>
              Select a layout for your new row. You can adjust column widths later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleAddRow(layout.columns)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-colors"
              >
                {layout.icon}
                <span className="text-sm font-medium">{layout.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
