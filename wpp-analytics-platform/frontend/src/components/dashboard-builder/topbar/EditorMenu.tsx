'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  File,
  Edit,
  Eye,
  Plus,
  Layers,
  HelpCircle,
  FileText,
  FolderOpen,
  Save,
  Download,
  Printer,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  CheckSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Ruler,
  LayoutGrid,
  Image,
  AlignLeft,
  BookOpen,
  Keyboard,
  AlertCircle,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

export const EditorMenu: React.FC = () => {
  const { undo, redo, canUndo, canRedo, addRow } = useDashboardStore();

  const handleNewDashboard = () => {
    // TODO: Implement new dashboard creation
    console.log('New dashboard');
  };

  const handleOpen = () => {
    // TODO: Implement dashboard opening
    console.log('Open dashboard');
  };

  const handleSaveAs = () => {
    // TODO: Implement save as
    console.log('Save as');
  };

  const handleExport = (format: 'pdf' | 'png' | 'csv') => {
    // TODO: Implement export
    console.log('Export as', format);
  };

  const handlePrint = () => {
    // TODO: Implement print
    window.print();
  };

  const handleCut = () => {
    // TODO: Implement cut
    console.log('Cut');
  };

  const handleCopy = () => {
    // TODO: Implement copy
    console.log('Copy');
  };

  const handlePaste = () => {
    // TODO: Implement paste
    console.log('Paste');
  };

  const handleDelete = () => {
    // TODO: Implement delete
    console.log('Delete');
  };

  const handleSelectAll = () => {
    // TODO: Implement select all
    console.log('Select all');
  };

  const handleZoomIn = () => {
    // TODO: Implement zoom in
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    // TODO: Implement zoom out
    console.log('Zoom out');
  };

  const handleFitToScreen = () => {
    // TODO: Implement fit to screen
    console.log('Fit to screen');
  };

  const handleToggleGrid = () => {
    // TODO: Implement toggle grid
    console.log('Toggle grid');
  };

  const handleToggleRulers = () => {
    // TODO: Implement toggle rulers
    console.log('Toggle rulers');
  };

  const handleInsertRow = () => {
    // Open layout picker for row
    addRow(['1/1']); // Default to single column
  };

  const handleInsertChart = () => {
    // TODO: Open chart picker
    console.log('Insert chart');
  };

  const handleInsertControl = () => {
    // TODO: Open control picker
    console.log('Insert control');
  };

  const handleInsertText = () => {
    // TODO: Insert text component
    console.log('Insert text');
  };

  const handleInsertImage = () => {
    // TODO: Insert image component
    console.log('Insert image');
  };

  const handleBringForward = () => {
    // TODO: Implement bring forward
    console.log('Bring forward');
  };

  const handleSendBackward = () => {
    // TODO: Implement send backward
    console.log('Send backward');
  };

  const handleAlign = (alignment: string) => {
    // TODO: Implement alignment
    console.log('Align', alignment);
  };

  const handleDistribute = (distribution: string) => {
    // TODO: Implement distribution
    console.log('Distribute', distribution);
  };

  const handleDocumentation = () => {
    window.open('https://docs.wpp-analytics.com', '_blank');
  };

  const handleKeyboardShortcuts = () => {
    // TODO: Show keyboard shortcuts modal
    console.log('Keyboard shortcuts');
  };

  const handleReportIssue = () => {
    window.open('https://github.com/wpp/analytics/issues', '_blank');
  };

  return (
    <div className="flex items-center gap-1">
      {/* File Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            File
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleNewDashboard}>
            <FileText className="h-4 w-4 mr-2" />
            New
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+N</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpen}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Open
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+O</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSaveAs}>
            <Save className="h-4 w-4 mr-2" />
            Save As...
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+S</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('png')}>
            <Download className="h-4 w-4 mr-2" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+P</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Edit
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={undo} disabled={!canUndo}>
            <Edit className="h-4 w-4 mr-2" />
            Undo
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+Z</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={redo} disabled={!canRedo}>
            <Edit className="h-4 w-4 mr-2" />
            Redo
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+Z</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCut}>
            <Scissors className="h-4 w-4 mr-2" />
            Cut
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+X</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePaste}>
            <Clipboard className="h-4 w-4 mr-2" />
            Paste
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
            <span className="ml-auto text-xs text-muted-foreground">Del</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSelectAll}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+A</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoom In
            <span className="ml-auto text-xs text-muted-foreground">Ctrl++</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4 mr-2" />
            Zoom Out
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+-</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFitToScreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Fit to Screen
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+0</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleGrid}>
            <Grid3x3 className="h-4 w-4 mr-2" />
            Show Grid
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+G</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleRulers}>
            <Ruler className="h-4 w-4 mr-2" />
            Show Rulers
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+R</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Insert Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Insert
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleInsertRow}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Row
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleInsertChart}>
            <Plus className="h-4 w-4 mr-2" />
            Chart
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleInsertControl}>
            <Plus className="h-4 w-4 mr-2" />
            Control
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleInsertText}>
            <FileText className="h-4 w-4 mr-2" />
            Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleInsertImage}>
            <Image className="h-4 w-4 mr-2" />
            Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Arrange Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Arrange
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleBringForward}>
            <Layers className="h-4 w-4 mr-2" />
            Bring Forward
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+]</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendBackward}>
            <Layers className="h-4 w-4 mr-2" />
            Send Backward
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+[</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAlign('left')}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Align Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAlign('center')}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Align Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAlign('right')}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Align Right
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDistribute('horizontal')}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Distribute Horizontally
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDistribute('vertical')}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Distribute Vertically
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleDocumentation}>
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleKeyboardShortcuts}>
            <Keyboard className="h-4 w-4 mr-2" />
            Keyboard Shortcuts
            <span className="ml-auto text-xs text-muted-foreground">?</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReportIssue}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Report Issue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
