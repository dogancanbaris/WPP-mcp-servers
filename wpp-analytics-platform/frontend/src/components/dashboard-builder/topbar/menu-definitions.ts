/**
 * Complete menu definitions matching Looker Studio exactly
 * Based on COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md Part 1
 */

import {
  FilePlus,
  Copy,
  Edit3,
  FolderInput,
  Download,
  Mail,
  History,
  Layout,
  Settings,
  Undo,
  Redo,
  Scissors,
  Clipboard,
  CopyPlus,
  Trash2,
  SquareCheckBig,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Ruler,
  AlignCenterVertical,
  Eye,
  Maximize,
  BarChart3,
  SlidersHorizontal,
  Type,
  Image,
  Code,
  Database,
  DatabaseZap,
  Package,
  Users,
  BookOpen,
  Keyboard,
  Video,
  AlertCircle,
  MessageSquare,
  Sparkles,
  BringToFront,
  SendToBack,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignRight,
  LayoutGrid,
  Group,
  Ungroup,
  TrendingUp,
  LineChart,
  PieChart,
  Table,
  Hash,
  Calendar,
  List,
  Check,
  LucideIcon,
} from 'lucide-react';

export type MenuItemSeparator = {
  type: 'separator';
};

export type MenuItemBase = {
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  description?: string;
  disabled?: boolean;
  checked?: boolean;
  variant?: 'default' | 'destructive';
  action?: () => void;
};

export type MenuItemWithSubmenu = MenuItemBase & {
  submenu: MenuItem[];
};

export type MenuItemCheckbox = MenuItemBase & {
  type: 'checkbox';
  checked: boolean;
};

export type MenuItem =
  | MenuItemBase
  | MenuItemWithSubmenu
  | MenuItemCheckbox
  | MenuItemSeparator;

// ============================================================================
// FILE MENU
// ============================================================================
// Note: Actions are connected in EditorTopbar.tsx using useFileActions hook
export const createFileMenuItems = (actions: {
  onNew: () => void;
  onMakeCopy: () => void;
  onRename: () => void;
  onMoveToFolder: () => void;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
  onScheduleEmail: () => void;
  onPageSetup: () => void;
  onDashboardSettings: () => void;
  onVersionHistory: () => void;
}): MenuItem[] => [
  {
    label: 'New',
    icon: FilePlus,
    shortcut: 'Ctrl+N',
    description: 'Create a new dashboard',
    action: actions.onNew,
  },
  {
    label: 'Make a copy',
    icon: Copy,
    description: 'Duplicate this dashboard',
    action: actions.onMakeCopy,
  },
  { type: 'separator' },
  {
    label: 'Rename',
    icon: Edit3,
    description: 'Rename this dashboard',
    action: actions.onRename,
  },
  {
    label: 'Move to folder',
    icon: FolderInput,
    description: 'Organize in folders',
    action: actions.onMoveToFolder,
  },
  { type: 'separator' },
  {
    label: 'Download',
    icon: Download,
    submenu: [
      { label: 'PDF', action: actions.onDownloadPDF },
      { label: 'CSV (current page)', action: actions.onDownloadCSV },
      {
        label: 'Google Sheets',
        action: () => console.log('Export Sheets'),
        disabled: true,
      },
    ],
  },
  {
    label: 'Schedule email delivery',
    icon: Mail,
    description: 'Send dashboard on schedule',
    action: actions.onScheduleEmail,
  },
  { type: 'separator' },
  {
    label: 'Version history',
    icon: History,
    shortcut: 'Ctrl+Alt+Shift+H',
    description: 'View and restore previous versions',
    action: actions.onVersionHistory,
  },
  {
    label: 'Make a template',
    icon: Layout,
    description: 'Save as reusable template',
    action: () => console.log('Make template'),
  },
  { type: 'separator' },
  {
    label: 'Report settings',
    icon: Settings,
    description: 'Configure dashboard settings',
    action: actions.onDashboardSettings,
  },
];

// ============================================================================
// EDIT MENU
// ============================================================================
// Note: Actions are connected in EditorTopbar.tsx using useEditActions hook
export const createEditMenuItems = (actions: {
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasClipboardContent: boolean;
}): MenuItem[] => [
  {
    label: 'Undo',
    icon: Undo,
    shortcut: 'Ctrl+Z',
    action: actions.onUndo,
    disabled: !actions.canUndo,
  },
  {
    label: 'Redo',
    icon: Redo,
    shortcut: 'Ctrl+Y',
    action: actions.onRedo,
    disabled: !actions.canRedo,
  },
  { type: 'separator' },
  {
    label: 'Cut',
    icon: Scissors,
    shortcut: 'Ctrl+X',
    action: actions.onCut,
  },
  {
    label: 'Copy',
    icon: Copy,
    shortcut: 'Ctrl+C',
    action: actions.onCopy,
  },
  {
    label: 'Paste',
    icon: Clipboard,
    shortcut: 'Ctrl+V',
    action: actions.onPaste,
    disabled: !actions.hasClipboardContent,
  },
  {
    label: 'Duplicate',
    icon: CopyPlus,
    shortcut: 'Ctrl+D',
    action: actions.onDuplicate,
  },
  { type: 'separator' },
  {
    label: 'Delete',
    icon: Trash2,
    shortcut: 'Delete',
    action: actions.onDelete,
    variant: 'destructive',
  },
  { type: 'separator' },
  {
    label: 'Select all',
    icon: SquareCheckBig,
    shortcut: 'Ctrl+A',
    action: actions.onSelectAll,
  },
  {
    label: 'Deselect all',
    icon: Square,
    shortcut: 'Ctrl+Shift+A',
    action: actions.onDeselectAll,
  },
];

// ============================================================================
// VIEW MENU
// ============================================================================
export const getViewMenuItems = (viewActions: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onToggleGuides: () => void;
  onFullscreen: () => void;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
}): MenuItem[] => [
  {
    label: 'Zoom in',
    icon: ZoomIn,
    shortcut: 'Ctrl++',
    action: viewActions.onZoomIn,
  },
  {
    label: 'Zoom out',
    icon: ZoomOut,
    shortcut: 'Ctrl+-',
    action: viewActions.onZoomOut,
  },
  {
    label: 'Fit to screen',
    icon: Maximize2,
    shortcut: 'Ctrl+0',
    action: viewActions.onZoomFit,
  },
  { type: 'separator' },
  {
    label: 'Show grid',
    icon: Grid3x3,
    type: 'checkbox',
    checked: viewActions.showGrid,
    action: viewActions.onToggleGrid,
  },
  {
    label: 'Show rulers',
    icon: Ruler,
    type: 'checkbox',
    checked: viewActions.showRulers,
    action: viewActions.onToggleRulers,
  },
  {
    label: 'Show guides',
    icon: AlignCenterVertical,
    type: 'checkbox',
    checked: viewActions.showGuides,
    action: viewActions.onToggleGuides,
  },
  { type: 'separator' },
  {
    label: 'View mode',
    icon: Eye,
    shortcut: 'Ctrl+Shift+P',
    action: () => console.log('View mode'),
  },
  {
    label: 'Full screen',
    icon: Maximize,
    shortcut: 'F11',
    action: viewActions.onFullscreen,
  },
];

// ============================================================================
// INSERT MENU
// ============================================================================
// Note: Actions are connected in EditorTopbar.tsx using useInsertActions hook
export const getInsertMenuItems = (insertActions: {
  onInsertChart: (type?: string) => void;
  onInsertControl: (type: string) => void;
  onInsertContent: (type: string) => void;
  onInsertPage?: () => void;
}): MenuItem[] => [
  {
    label: 'Page',
    icon: FilePlus,
    shortcut: 'Ctrl+Shift+P',
    description: 'Add new page to dashboard',
    action: insertActions.onInsertPage || (() => console.log('Add page')),
  },
  { type: 'separator' },
  {
    label: 'Chart',
    icon: BarChart3,
    shortcut: 'Ctrl+M',
    submenu: [
      { label: 'Time Series', action: () => insertActions.onInsertChart('time_series') },
      { label: 'Bar Chart', action: () => insertActions.onInsertChart('bar_chart') },
      { label: 'Line Chart', action: () => insertActions.onInsertChart('line_chart') },
      { label: 'Pie Chart', action: () => insertActions.onInsertChart('pie_chart') },
      { label: 'Table', action: () => insertActions.onInsertChart('table') },
      { label: 'Scorecard', action: () => insertActions.onInsertChart('scorecard') },
      { type: 'separator' },
      { label: 'More charts...', action: () => insertActions.onInsertChart() },
    ],
  },
  {
    label: 'Control',
    icon: SlidersHorizontal,
    submenu: [
      {
        label: 'Date range control',
        action: () => insertActions.onInsertControl('date_filter'),
      },
      { label: 'Drop-down list', action: () => insertActions.onInsertControl('dropdown') },
      { label: 'Fixed-size list', action: () => insertActions.onInsertControl('list') },
      { label: 'Input box', action: () => insertActions.onInsertControl('input') },
      { label: 'Checkbox', action: () => insertActions.onInsertControl('checkbox') },
      { label: 'Slider', action: () => insertActions.onInsertControl('slider') },
      { type: 'separator' },
      { label: 'More controls...', action: () => insertActions.onInsertControl('picker') },
    ],
  },
  { type: 'separator' },
  {
    label: 'Text',
    icon: Type,
    description: 'Add text box with formatting',
    action: () => insertActions.onInsertContent('text'),
  },
  {
    label: 'Image',
    icon: Image,
    description: 'Add image or logo',
    action: () => insertActions.onInsertContent('image'),
  },
  {
    label: 'Shape',
    icon: Square,
    submenu: [
      { label: 'Rectangle', action: () => insertActions.onInsertContent('rectangle') },
      { label: 'Circle', action: () => insertActions.onInsertContent('circle') },
      { label: 'Line', action: () => insertActions.onInsertContent('line') },
    ],
  },
  { type: 'separator' },
  {
    label: 'Embedded content',
    icon: Code,
    description: 'Embed video, docs, website',
    action: () => insertActions.onInsertContent('embed'),
  },
];

// ============================================================================
// PAGE MENU
// ============================================================================
export const PAGE_MENU_ITEMS: MenuItem[] = [
  {
    label: 'New page',
    icon: FilePlus,
    action: () => console.log('New page'),
  },
  {
    label: 'Duplicate page',
    icon: Copy,
    action: () => console.log('Duplicate page'),
  },
  {
    label: 'Delete page',
    icon: Trash2,
    action: () => console.log('Delete page'),
    variant: 'destructive',
  },
  { type: 'separator' },
  {
    label: 'Rename page',
    icon: Edit3,
    action: () => console.log('Rename page'),
  },
  {
    label: 'Reorder pages',
    icon: LayoutGrid,
    action: () => console.log('Reorder pages'),
  },
  { type: 'separator' },
  {
    label: 'Page settings',
    icon: Settings,
    action: () => console.log('Page settings'),
  },
];

// ============================================================================
// ARRANGE MENU
// ============================================================================
// Note: Actions are connected in EditorTopbar.tsx using useArrangeActions hook
export const getArrangeMenuItems = (arrangeActions: {
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignMiddle: () => void;
  onAlignBottom: () => void;
  onDistributeHorizontally: () => void;
  onDistributeVertically: () => void;
  onGroup: () => void;
  onUngroup: () => void;
}): MenuItem[] => [
  {
    label: 'Bring to front',
    icon: BringToFront,
    shortcut: 'Ctrl+]',
    action: arrangeActions.onBringToFront,
  },
  {
    label: 'Send to back',
    icon: SendToBack,
    shortcut: 'Ctrl+[',
    action: arrangeActions.onSendToBack,
  },
  {
    label: 'Bring forward',
    icon: ChevronUp,
    action: arrangeActions.onMoveForward,
  },
  {
    label: 'Send backward',
    icon: ChevronDown,
    action: arrangeActions.onMoveBackward,
  },
  { type: 'separator' },
  {
    label: 'Align',
    icon: AlignLeft,
    submenu: [
      { label: 'Left', icon: AlignLeft, action: arrangeActions.onAlignLeft },
      {
        label: 'Center horizontally',
        icon: AlignCenterHorizontal,
        action: arrangeActions.onAlignCenter,
      },
      {
        label: 'Right',
        icon: AlignRight,
        action: arrangeActions.onAlignRight,
      },
      { type: 'separator' },
      { label: 'Top', icon: AlignStartVertical, action: arrangeActions.onAlignTop },
      {
        label: 'Center vertically',
        icon: AlignCenterVertical,
        action: arrangeActions.onAlignMiddle,
      },
      {
        label: 'Bottom',
        icon: AlignEndVertical,
        action: arrangeActions.onAlignBottom,
      },
    ],
  },
  {
    label: 'Distribute',
    icon: LayoutGrid,
    submenu: [
      {
        label: 'Horizontally',
        action: arrangeActions.onDistributeHorizontally,
      },
      { label: 'Vertically', action: arrangeActions.onDistributeVertically },
    ],
  },
  { type: 'separator' },
  {
    label: 'Group',
    icon: Group,
    shortcut: 'Ctrl+G',
    action: arrangeActions.onGroup,
  },
  {
    label: 'Ungroup',
    icon: Ungroup,
    shortcut: 'Ctrl+Shift+G',
    action: arrangeActions.onUngroup,
  },
];

// ============================================================================
// RESOURCE MENU
// ============================================================================
export const RESOURCE_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Manage added data sources',
    icon: Database,
    action: () => console.log('Manage data sources'),
  },
  {
    label: 'Add a data source',
    icon: DatabaseZap,
    action: () => console.log('Add data source'),
  },
  { type: 'separator' },
  {
    label: 'Manage reusable components',
    icon: Package,
    action: () => console.log('Component library'),
  },
  { type: 'separator' },
  {
    label: 'Community visualizations',
    icon: Users,
    action: () => console.log('Community viz'),
  },
];

// ============================================================================
// HELP MENU
// ============================================================================
// Note: Actions are connected in EditorTopbar.tsx
export const createHelpMenuItems = (actions: {
  onReportIssue: () => void;
  onSendFeedback: () => void;
  onWhatsNew: () => void;
  onKeyboardShortcuts: () => void;
}): MenuItem[] => [
  {
    label: 'Documentation',
    icon: BookOpen,
    action: () => window.open('/docs', '_blank'),
  },
  {
    label: 'Keyboard shortcuts',
    icon: Keyboard,
    shortcut: 'Ctrl+/',
    action: actions.onKeyboardShortcuts,
  },
  {
    label: 'Video tutorials',
    icon: Video,
    action: () => window.open('/tutorials', '_blank'),
  },
  { type: 'separator' },
  {
    label: 'Report an issue',
    icon: AlertCircle,
    action: actions.onReportIssue,
  },
  {
    label: 'Send feedback',
    icon: MessageSquare,
    action: actions.onSendFeedback,
  },
  { type: 'separator' },
  {
    label: "What's new",
    icon: Sparkles,
    action: actions.onWhatsNew,
  },
];
