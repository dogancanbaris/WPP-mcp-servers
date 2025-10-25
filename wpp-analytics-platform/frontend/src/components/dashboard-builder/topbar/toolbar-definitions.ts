/**
 * Toolbar button definitions for Row 2
 * Based on COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md Part 1.3
 *
 * All icon-only buttons MUST have tooltips defined
 * Separators are used to group related functionality
 */

import {
  Undo,
  Redo,
  FilePlus,
  DatabaseZap,
  Blend,
  BarChart3,
  Wand2,
  SlidersHorizontal,
  AlignLeft,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignRight,
  Share2,
  Eye,
  MoreVertical,
  HelpCircle,
  Pause,
  TrendingUp,
  LineChart,
  PieChart,
  Table,
  Hash,
  Paintbrush,
  PaintbrushVertical,
  Lock,
  Unlock,
  Calendar,
  ChevronDown,
  List,
  Check,
  LayoutGrid,
  Link2,
  Code,
  Mail,
  Clock,
  Users,
  RefreshCw,
  Settings,
  Printer,
  User,
  LogOut,
  LucideIcon,
} from 'lucide-react';

export type ToolbarSeparator = {
  type: 'separator';
};

export type ToolbarButton = {
  id: string;
  icon?: LucideIcon;
  label?: string;
  tooltip: string;
  action?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'icon' | 'sm';
  active?: boolean;
};

export type ToolbarDropdown = {
  id: string;
  icon?: LucideIcon;
  label?: string;
  tooltip: string;
  type: 'dropdown';
  variant?: 'default' | 'ghost' | 'outline';
  disabled?: boolean;
  items: DropdownItem[];
};

export type ToolbarAvatar = {
  id: string;
  type: 'avatar';
  image?: string;
  fallback?: string;
  tooltip: string;
  dropdown: DropdownItem[];
};

export type DropdownItem =
  | {
      label: string;
      icon?: LucideIcon;
      action: () => void;
      disabled?: boolean;
    }
  | { type: 'separator' };

export type ToolbarItem =
  | ToolbarButton
  | ToolbarDropdown
  | ToolbarAvatar
  | ToolbarSeparator;

// ============================================================================
// LEFT SECTION - History & Data Management
// ============================================================================
export const TOOLBAR_LEFT: ToolbarItem[] = [
  {
    id: 'undo',
    icon: Undo,
    tooltip: 'Undo (Ctrl+Z)',
    action: () => console.log('Undo'),
    size: 'icon',
    variant: 'outline',
  },
  {
    id: 'redo',
    icon: Redo,
    tooltip: 'Redo (Ctrl+Y)',
    action: () => console.log('Redo'),
    size: 'icon',
    variant: 'outline',
  },
  { type: 'separator' },
  {
    id: 'add-page',
    icon: FilePlus,
    label: 'Add page',
    tooltip: 'Add a new page to dashboard',
    action: () => console.log('Add page'),
    size: 'sm',
    variant: 'outline',
  },
  {
    id: 'add-data',
    icon: DatabaseZap,
    label: 'Add data',
    tooltip: 'Connect to a new data source',
    action: () => console.log('Add data source'),
    size: 'sm',
    variant: 'outline',
  },
  {
    id: 'blend',
    icon: Blend,
    label: 'Blend',
    tooltip: 'Blend multiple data sources together',
    action: () => console.log('Blend data'),
    size: 'sm',
    variant: 'outline',
  },
];

// ============================================================================
// CENTER SECTION - Charts, Controls & Layout
// ============================================================================
export const TOOLBAR_CENTER: ToolbarItem[] = [
  {
    id: 'add-chart',
    icon: BarChart3,
    label: 'Add a chart',
    tooltip: 'Insert visualization (Ctrl+M)',
    type: 'dropdown',
    variant: 'outline',
    items: [
      {
        label: 'Time Series',
        icon: TrendingUp,
        action: () => console.log('Add time series'),
      },
      {
        label: 'Bar Chart',
        icon: BarChart3,
        action: () => console.log('Add bar chart'),
      },
      {
        label: 'Line Chart',
        icon: LineChart,
        action: () => console.log('Add line chart'),
      },
      {
        label: 'Pie Chart',
        icon: PieChart,
        action: () => console.log('Add pie chart'),
      },
      { label: 'Table', icon: Table, action: () => console.log('Add table') },
      {
        label: 'Scorecard',
        icon: Hash,
        action: () => console.log('Add scorecard'),
      },
      { type: 'separator' },
      {
        label: 'All charts...',
        action: () => console.log('Open chart picker'),
      },
    ],
  },
  {
    id: 'more-tools',
    icon: Wand2,
    tooltip: 'Additional tools - Copy/paste styles, lock positions',
    type: 'dropdown',
    variant: 'outline',
    items: [
      { label: 'Copy style', icon: Paintbrush, action: () => console.log('Copy style') },
      {
        label: 'Paste style',
        icon: PaintbrushVertical,
        action: () => console.log('Paste style'),
      },
      { type: 'separator' },
      { label: 'Lock position', icon: Lock, action: () => console.log('Lock') },
      {
        label: 'Unlock position',
        icon: Unlock,
        action: () => console.log('Unlock'),
      },
    ],
  },
  {
    id: 'add-control',
    icon: SlidersHorizontal,
    label: 'Add a control',
    tooltip: 'Insert interactive controls - Date ranges, filters, inputs',
    type: 'dropdown',
    variant: 'outline',
    items: [
      {
        label: 'Date range',
        icon: Calendar,
        action: () => console.log('Add date filter'),
      },
      {
        label: 'Drop-down list',
        icon: ChevronDown,
        action: () => console.log('Add dropdown'),
      },
      {
        label: 'Fixed-size list',
        icon: List,
        action: () => console.log('Add list'),
      },
      {
        label: 'Input box',
        icon: Calendar,
        action: () => console.log('Add input'),
      },
      { label: 'Checkbox', icon: Check, action: () => console.log('Add checkbox') },
      {
        label: 'Slider',
        icon: SlidersHorizontal,
        action: () => console.log('Add slider'),
      },
      { type: 'separator' },
      {
        label: 'All controls...',
        action: () => console.log('Open control picker'),
      },
    ],
  },
  { type: 'separator' },
  {
    id: 'align',
    icon: AlignLeft,
    tooltip: 'Align and distribute selected components',
    type: 'dropdown',
    variant: 'outline',
    items: [
      {
        label: 'Align left',
        icon: AlignLeft,
        action: () => console.log('Align left'),
      },
      {
        label: 'Align center',
        icon: AlignCenterHorizontal,
        action: () => console.log('Align center-h'),
      },
      {
        label: 'Align right',
        icon: AlignRight,
        action: () => console.log('Align right'),
      },
      { type: 'separator' },
      { label: 'Align top', icon: AlignStartVertical, action: () => console.log('Align top') },
      {
        label: 'Align middle',
        icon: AlignCenterVertical,
        action: () => console.log('Align center-v'),
      },
      {
        label: 'Align bottom',
        icon: AlignEndVertical, action: () => console.log('Align bottom'),
      },
      { type: 'separator' },
      {
        label: 'Distribute horizontally',
        icon: LayoutGrid,
        action: () => console.log('Distribute h'),
      },
      {
        label: 'Distribute vertically',
        icon: LayoutGrid,
        action: () => console.log('Distribute v'),
      },
    ],
  },
  { type: 'separator' },
  {
    id: 'filters',
    icon: SlidersHorizontal,
    label: 'Filters',
    tooltip: 'Toggle global filters panel (Ctrl+Shift+F)',
    action: () => console.log('Toggle filters'),
    size: 'sm',
    variant: 'outline',
  },
  {
    id: 'theme',
    label: 'Theme and layout',
    tooltip: 'Customize theme colors, fonts, and layout settings',
    action: () => console.log('Theme editor'),
    size: 'sm',
    variant: 'outline',
  },
];

// ============================================================================
// RIGHT SECTION - Share, View & Settings
// ============================================================================
export const TOOLBAR_RIGHT: ToolbarItem[] = [
  {
    id: 'reset',
    label: 'Reset',
    tooltip: 'Discard changes and reset to last saved version',
    action: () => console.log('Reset'),
    variant: 'ghost',
    size: 'sm',
  },
  { type: 'separator' },
  {
    id: 'share',
    icon: Share2,
    label: 'Share',
    tooltip: 'Share dashboard - Get link, embed, email, or schedule',
    type: 'dropdown',
    variant: 'default',
    items: [
      { label: 'Get link', icon: Link2, action: () => console.log('Copy link') },
      {
        label: 'Embed report',
        icon: Code,
        action: () => console.log('Embed code'),
      },
      { label: 'Email', icon: Mail, action: () => console.log('Email') },
      { type: 'separator' },
      {
        label: 'Schedule delivery',
        icon: Clock,
        action: () => console.log('Schedule'),
      },
      { type: 'separator' },
      {
        label: 'Manage access',
        icon: Users,
        action: () => console.log('Manage access'),
      },
    ],
  },
  {
    id: 'view',
    icon: Eye,
    label: 'View',
    tooltip: 'Switch to view mode (Ctrl+Shift+V)',
    action: () => console.log('View mode'),
    variant: 'default',
    size: 'sm',
  },
  {
    id: 'more',
    icon: MoreVertical,
    tooltip: 'More options - Refresh data, settings, print',
    type: 'dropdown',
    variant: 'ghost',
    items: [
      {
        label: 'Refresh data',
        icon: RefreshCw,
        action: () => console.log('Refresh'),
      },
      {
        label: 'Report settings',
        icon: Settings,
        action: () => console.log('Settings'),
      },
      { type: 'separator' },
      { label: 'Print', icon: Printer, action: () => console.log('Print') },
    ],
  },
  {
    id: 'help',
    icon: HelpCircle,
    tooltip: 'Help and documentation',
    type: 'dropdown',
    variant: 'ghost',
    items: [
      {
        label: 'Documentation',
        action: () => window.open('/docs', '_blank'),
      },
      {
        label: 'Keyboard shortcuts',
        action: () => console.log('Shortcuts'),
      },
      { label: 'Report issue', action: () => console.log('Report issue') },
    ],
  },
  { type: 'separator' },
  {
    id: 'profile',
    type: 'avatar',
    tooltip: 'Account settings and preferences',
    fallback: 'U',
    dropdown: [
      { label: 'Account', icon: User, action: () => console.log('Account') },
      {
        label: 'Settings',
        icon: Settings,
        action: () => console.log('User settings'),
      },
      { type: 'separator' },
      { label: 'Logout', icon: LogOut, action: () => console.log('Logout') },
    ],
  },
  {
    id: 'pause-updates',
    icon: Pause,
    label: 'Pause updates',
    tooltip: 'Pause automatic data refresh',
    action: () => console.log('Pause updates'),
    variant: 'ghost',
    size: 'sm',
  },
];
