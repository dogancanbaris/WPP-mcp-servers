# Complete Component Specifications - Every Detail for Agents

**Purpose**: Comprehensive specifications for building EVERY component
**For**: WPP custom agents (frontend-developer, backend-api-specialist, database-analytics-architect)
**Reference Screenshots**:
- `/home/dogancanbaris/projects/MCP Servers/Looker Top menu section.png`
- `/home/dogancanbaris/projects/MCP Servers/screencapture-lookerstudio-google-reporting-2fb28e2a-4fa3-425f-87df-436282c4da41-page-w8g4D-edit-2025-10-22-08_18_20.png`
- `/home/dogancanbaris/projects/MCP Servers/screencapture-lookerstudio-google-reporting-2fb28e2a-4fa3-425f-87df-436282c4da41-page-w8g4D-edit-2025-10-22-08_18_40.png`

---

# PART 1: TOPBAR - COMPLETE SPECIFICATION

## 1.1 TOPBAR STRUCTURE (Two Rows!)

### Visual Reference
See: `Looker Top menu section.png` - Shows exact layout

### Layout Architecture
```tsx
<div className="topbar">
  {/* ROW 1: Menu Bar */}
  <div className="h-10 border-b flex items-center px-3 gap-1">
    <Logo />
    <ReportTitle />
    <MenuBar /> {/* File, Edit, View, Insert, Page, Arrange, Resource, Help */}
  </div>

  {/* ROW 2: Tool Bar */}
  <div className="h-12 border-b flex items-center justify-between px-3">
    <ToolbarLeft />    {/* Undo, Redo, Cursor, Add page, Add data, Blend */}
    <ToolbarCenter />  {/* Add chart, Tools, Add control, Alignment */}
    <ToolbarRight />   {/* Reset, Share, View, More, Help, Profile, Pause */}
  </div>
</div>
```

---

## 1.2 ROW 1: MENU BAR - Every Menu Item Specified

### FILE MENU

**Visual**: Text button "File" → Dropdown on click
**Icon**: None (text only)
**Items** (from Looker behavior research):

```tsx
const FILE_MENU_ITEMS = [
  {
    label: 'New',
    icon: <FilePlus />,
    shortcut: 'Ctrl+N',
    action: () => createNewDashboard(),
    description: 'Create a new dashboard'
  },
  {
    label: 'Make a copy',
    icon: <Copy />,
    action: () => duplicateDashboard(),
    description: 'Duplicate this dashboard'
  },
  { type: 'separator' },
  {
    label: 'Rename',
    icon: <Edit3 />,
    action: () => openRenameDialog(),
    description: 'Rename this dashboard'
  },
  {
    label: 'Move to folder',
    icon: <FolderInput />,
    action: () => openMoveDialog(),
    description: 'Organize in folders'
  },
  { type: 'separator' },
  {
    label: 'Download',
    icon: <Download />,
    submenu: [
      { label: 'PDF', action: () => exportPDF() },
      { label: 'CSV (current page)', action: () => exportCSV() },
      { label: 'Google Sheets', action: () => exportSheets(), disabled: true }
    ]
  },
  {
    label: 'Schedule email delivery',
    icon: <Mail />,
    action: () => openScheduleDialog(),
    description: 'Send dashboard on schedule'
  },
  { type: 'separator' },
  {
    label: 'Version history',
    icon: <History />,
    shortcut: 'Ctrl+Alt+Shift+H',
    action: () => openVersionHistory(),
    description: 'View and restore previous versions'
  },
  {
    label: 'Make a template',
    icon: <Layout />,
    action: () => saveAsTemplate(),
    description: 'Save as reusable template'
  },
  { type: 'separator' },
  {
    label: 'Report settings',
    icon: <Settings />,
    action: () => openSettings(),
    description: 'Configure dashboard settings'
  }
];
```

**Implementation**:
- shadcn DropdownMenu
- Lucide React icons
- Keyboard shortcuts shown on right
- Separators between logical groups
- Disabled items grayed out
- Submenu arrows (>)

### EDIT MENU

```tsx
const EDIT_MENU_ITEMS = [
  {
    label: 'Undo',
    icon: <Undo />,
    shortcut: 'Ctrl+Z',
    action: () => dashboardStore.undo(),
    disabled: !canUndo
  },
  {
    label: 'Redo',
    icon: <Redo />,
    shortcut: 'Ctrl+Y',
    action: () => dashboardStore.redo(),
    disabled: !canRedo
  },
  { type: 'separator' },
  {
    label: 'Cut',
    icon: <Scissors />,
    shortcut: 'Ctrl+X',
    action: () => cutSelectedComponent(),
    disabled: !hasSelection
  },
  {
    label: 'Copy',
    icon: <Copy />,
    shortcut: 'Ctrl+C',
    action: () => copySelectedComponent(),
    disabled: !hasSelection
  },
  {
    label: 'Paste',
    icon: <Clipboard />,
    shortcut: 'Ctrl+V',
    action: () => pasteComponent(),
    disabled: !hasClipboard
  },
  {
    label: 'Duplicate',
    icon: <CopyPlus />,
    shortcut: 'Ctrl+D',
    action: () => duplicateSelectedComponent(),
    disabled: !hasSelection
  },
  { type: 'separator' },
  {
    label: 'Delete',
    icon: <Trash2 />,
    shortcut: 'Delete',
    action: () => deleteSelectedComponent(),
    disabled: !hasSelection,
    variant: 'destructive'
  },
  { type: 'separator' },
  {
    label: 'Select all',
    icon: <SquareCheckBig />,
    shortcut: 'Ctrl+A',
    action: () => selectAllComponents()
  },
  {
    label: 'Deselect all',
    icon: <Square />,
    shortcut: 'Ctrl+Shift+A',
    action: () => deselectAll()
  }
];
```

### VIEW MENU

```tsx
const VIEW_MENU_ITEMS = [
  {
    label: 'Zoom in',
    icon: <ZoomIn />,
    shortcut: 'Ctrl++',
    action: () => increaseZoom()
  },
  {
    label: 'Zoom out',
    icon: <ZoomOut />,
    shortcut: 'Ctrl+-',
    action: () => decreaseZoom()
  },
  {
    label: 'Fit to screen',
    icon: <Maximize2 />,
    shortcut: 'Ctrl+0',
    action: () => setZoom(100)
  },
  { type: 'separator' },
  {
    label: 'Show grid',
    icon: <Grid3x3 />,
    checked: showGrid,
    action: () => toggleGrid(),
    type: 'checkbox'
  },
  {
    label: 'Show rulers',
    icon: <Ruler />,
    checked: showRulers,
    action: () => toggleRulers(),
    type: 'checkbox'
  },
  {
    label: 'Show guides',
    icon: <AlignCenterVertical />,
    checked: showGuides,
    action: () => toggleGuides(),
    type: 'checkbox'
  },
  { type: 'separator' },
  {
    label: 'View mode',
    icon: <Eye />,
    shortcut: 'Ctrl+Shift+P',
    action: () => toggleViewMode()
  },
  {
    label: 'Full screen',
    icon: <Maximize />,
    shortcut: 'F11',
    action: () => enterFullScreen()
  }
];
```

### INSERT MENU

```tsx
const INSERT_MENU_ITEMS = [
  {
    label: 'Page',
    icon: <FilePlus />,
    action: () => addPage(),
    description: 'Add new page to dashboard'
  },
  { type: 'separator' },
  {
    label: 'Chart',
    icon: <BarChart3 />,
    shortcut: 'Ctrl+M',
    submenu: [
      { label: 'Time Series', action: () => addChart('time_series') },
      { label: 'Bar Chart', action: () => addChart('bar_chart') },
      { label: 'Line Chart', action: () => addChart('line_chart') },
      { label: 'Pie Chart', action: () => addChart('pie_chart') },
      { label: 'Table', action: () => addChart('table') },
      { label: 'Scorecard', action: () => addChart('scorecard') },
      { type: 'separator' },
      { label: 'More charts...', action: () => openChartPicker() }
    ]
  },
  {
    label: 'Control',
    icon: <SlidersHorizontal />,
    submenu: [
      { label: 'Date range control', action: () => addControl('date_filter') },
      { label: 'Drop-down list', action: () => addControl('dropdown_filter') },
      { label: 'Fixed-size list', action: () => addControl('list_filter') },
      { label: 'Input box', action: () => addControl('input_filter') },
      { label: 'Checkbox', action: () => addControl('checkbox_filter') },
      { label: 'Slider', action: () => addControl('slider_filter') },
      { type: 'separator' },
      { label: 'More controls...', action: () => openControlPicker() }
    ]
  },
  { type: 'separator' },
  {
    label: 'Text',
    icon: <Type />,
    action: () => addContent('text'),
    description: 'Add text box with formatting'
  },
  {
    label: 'Image',
    icon: <Image />,
    action: () => addContent('image'),
    description: 'Add image or logo'
  },
  {
    label: 'Shape',
    icon: <Square />,
    submenu: [
      { label: 'Rectangle', action: () => addShape('rectangle') },
      { label: 'Circle', action: () => addShape('circle') },
      { label: 'Line', action: () => addShape('line') }
    ]
  },
  { type: 'separator' },
  {
    label: 'Embedded content',
    icon: <Code />,
    action: () => addEmbedded(),
    description: 'Embed video, docs, website'
  }
];
```

### PAGE MENU

```tsx
const PAGE_MENU_ITEMS = [
  {
    label: 'New page',
    icon: <FilePlus />,
    action: () => addPage()
  },
  {
    label: 'Duplicate page',
    icon: <Copy />,
    action: () => duplicatePage()
  },
  {
    label: 'Delete page',
    icon: <Trash2 />,
    action: () => deletePage(),
    variant: 'destructive'
  },
  { type: 'separator' },
  {
    label: 'Rename page',
    icon: <Edit3 />,
    action: () => renamePage()
  },
  {
    label: 'Reorder pages',
    icon: <ArrowUpDown />,
    action: () => openPageReorderDialog()
  },
  { type: 'separator' },
  {
    label: 'Page settings',
    icon: <Settings />,
    action: () => openPageSettings()
  }
];
```

### ARRANGE MENU

```tsx
const ARRANGE_MENU_ITEMS = [
  {
    label: 'Bring to front',
    icon: <BringToFront />,
    shortcut: 'Ctrl+]',
    action: () => bringToFront(),
    disabled: !hasSelection
  },
  {
    label: 'Send to back',
    icon: <SendToBack />,
    shortcut: 'Ctrl+[',
    action: () => sendToBack(),
    disabled: !hasSelection
  },
  {
    label: 'Bring forward',
    icon: <ChevronUp />,
    action: () => bringForward(),
    disabled: !hasSelection
  },
  {
    label: 'Send backward',
    icon: <ChevronDown />,
    action: () => sendBackward(),
    disabled: !hasSelection
  },
  { type: 'separator' },
  {
    label: 'Align',
    icon: <AlignLeft />,
    submenu: [
      { label: 'Left', icon: <AlignLeft />, action: () => align('left') },
      { label: 'Center horizontally', icon: <AlignCenterHorizontal />, action: () => align('center-h') },
      { label: 'Right', icon: <AlignRight />, action: () => align('right') },
      { type: 'separator' },
      { label: 'Top', icon: <AlignTop />, action: () => align('top') },
      { label: 'Center vertically', icon: <AlignCenterVertical />, action: () => align('center-v') },
      { label: 'Bottom', icon: <AlignBottom />, action: () => align('bottom') }
    ]
  },
  {
    label: 'Distribute',
    icon: <LayoutGrid />,
    submenu: [
      { label: 'Horizontally', action: () => distribute('horizontal') },
      { label: 'Vertically', action: () => distribute('vertical') }
    ]
  },
  { type: 'separator' },
  {
    label: 'Group',
    icon: <Group />,
    shortcut: 'Ctrl+G',
    action: () => groupSelection(),
    disabled: !hasMultipleSelected
  },
  {
    label: 'Ungroup',
    icon: <Ungroup />,
    shortcut: 'Ctrl+Shift+G',
    action: () => ungroupSelection(),
    disabled: !hasGroupSelected
  }
];
```

### RESOURCE MENU

```tsx
const RESOURCE_MENU_ITEMS = [
  {
    label: 'Manage added data sources',
    icon: <Database />,
    action: () => openDataSourceManager()
  },
  {
    label: 'Add a data source',
    icon: <DatabaseZap />,
    action: () => openDataSourceWizard()
  },
  { type: 'separator' },
  {
    label: 'Manage reusable components',
    icon: <Package />,
    action: () => openComponentLibrary()
  },
  { type: 'separator' },
  {
    label: 'Community visualizations',
    icon: <Users />,
    action: () => openCommunityViz()
  }
];
```

### HELP MENU

```tsx
const HELP_MENU_ITEMS = [
  {
    label: 'Documentation',
    icon: <BookOpen />,
    action: () => window.open('/docs', '_blank')
  },
  {
    label: 'Keyboard shortcuts',
    icon: <Keyboard />,
    shortcut: 'Ctrl+/',
    action: () => openShortcutsDialog()
  },
  {
    label: 'Video tutorials',
    icon: <Video />,
    action: () => window.open('/tutorials', '_blank')
  },
  { type: 'separator' },
  {
    label: 'Report an issue',
    icon: <AlertCircle />,
    action: () => openIssueDialog()
  },
  {
    label: 'Send feedback',
    icon: <MessageSquare />,
    action: () => openFeedbackDialog()
  },
  { type: 'separator' },
  {
    label: 'What\'s new',
    icon: <Sparkles />,
    action: () => openWhatsNew()
  }
];
```

---

## 1.3 ROW 2: TOOLBAR - Every Button Specified

### LEFT SECTION

```tsx
const TOOLBAR_LEFT = [
  {
    id: 'undo',
    icon: <Undo />,
    tooltip: 'Undo (Ctrl+Z)',
    action: () => dashboardStore.undo(),
    disabled: !canUndo,
    size: 'icon' // 32x32px button
  },
  {
    id: 'redo',
    icon: <Redo />,
    tooltip: 'Redo (Ctrl+Y)',
    action: () => dashboardStore.redo(),
    disabled: !canRedo,
    size: 'icon'
  },
  { type: 'separator' }, // Vertical line
  {
    id: 'cursor',
    icon: <MousePointer />,
    tooltip: 'Select tool (V)',
    action: () => setTool('select'),
    variant: tool === 'select' ? 'default' : 'ghost',
    size: 'icon'
  },
  { type: 'separator' },
  {
    id: 'add-page',
    icon: <FilePlus />,
    label: 'Add page',
    tooltip: 'Add a new page',
    action: () => addPage(),
    size: 'sm' // Button with text
  },
  {
    id: 'add-data',
    icon: <DatabaseZap />,
    label: 'Add data',
    tooltip: 'Add a data source',
    action: () => openDataSourceWizard(),
    size: 'sm'
  },
  {
    id: 'blend',
    icon: <Blend />,
    label: 'Blend',
    tooltip: 'Blend data sources',
    action: () => openBlendWizard(),
    size: 'sm'
  }
];
```

### CENTER SECTION

```tsx
const TOOLBAR_CENTER = [
  {
    id: 'add-chart',
    icon: <BarChart3 />,
    label: 'Add a chart',
    tooltip: 'Insert chart (Ctrl+M)',
    type: 'dropdown',
    items: [
      // Quick access to popular charts
      { label: 'Time Series', icon: <TrendingUp />, action: () => addChart('time_series') },
      { label: 'Bar Chart', icon: <BarChart3 />, action: () => addChart('bar_chart') },
      { label: 'Line Chart', icon: <LineChart />, action: () => addChart('line_chart') },
      { label: 'Pie Chart', icon: <PieChart />, action: () => addChart('pie_chart') },
      { label: 'Table', icon: <Table />, action: () => addChart('table') },
      { label: 'Scorecard', icon: <Hash />, action: () => addChart('scorecard') },
      { type: 'separator' },
      { label: 'All charts...', action: () => openFullChartPicker() }
    ]
  },
  {
    id: 'more-tools',
    icon: <Wand2 />,
    tooltip: 'More tools',
    type: 'dropdown',
    items: [
      { label: 'Copy style', icon: <Paintbrush />, action: () => copyStyle() },
      { label: 'Paste style', icon: <PaintbrushVertical />, action: () => pasteStyle() },
      { type: 'separator' },
      { label: 'Lock position', icon: <Lock />, action: () => lockPosition() },
      { label: 'Unlock position', icon: <Unlock />, action: () => unlockPosition() }
    ]
  },
  {
    id: 'add-control',
    icon: <SlidersHorizontal />,
    label: 'Add a control',
    tooltip: 'Insert control',
    type: 'dropdown',
    items: [
      { label: 'Date range', icon: <Calendar />, action: () => addControl('date_filter') },
      { label: 'Drop-down list', icon: <ChevronDown />, action: () => addControl('dropdown_filter') },
      { label: 'Fixed-size list', icon: <List />, action: () => addControl('list_filter') },
      { label: 'Input box', icon: <Input />, action: () => addControl('input_filter') },
      { label: 'Checkbox', icon: <Check />, action: () => addControl('checkbox_filter') },
      { label: 'Slider', icon: <SlidersHorizontal />, action: () => addControl('slider_filter') },
      { type: 'separator' },
      { label: 'All controls...', action: () => openFullControlPicker() }
    ]
  },
  { type: 'separator' },
  {
    id: 'align',
    icon: <AlignLeft />,
    tooltip: 'Align selected components',
    type: 'dropdown',
    disabled: !hasMultipleSelected,
    items: [
      { label: 'Align left', icon: <AlignLeft />, action: () => align('left') },
      { label: 'Align center', icon: <AlignCenterHorizontal />, action: () => align('center-h') },
      { label: 'Align right', icon: <AlignRight />, action: () => align('right') },
      { type: 'separator' },
      { label: 'Align top', icon: <AlignTop />, action: () => align('top') },
      { label: 'Align middle', icon: <AlignCenterVertical />, action: () => align('center-v') },
      { label: 'Align bottom', icon: <AlignBottom />, action: () => align('bottom') },
      { type: 'separator' },
      { label: 'Distribute horizontally', icon: <LayoutGrid />, action: () => distribute('h') },
      { label: 'Distribute vertically', icon: <LayoutGrid />, action: () => distribute('v') }
    ]
  },
  {
    id: 'theme',
    label: 'Theme and layout',
    tooltip: 'Customize theme',
    action: () => openThemeEditor(),
    size: 'sm'
  }
];
```

### RIGHT SECTION

```tsx
const TOOLBAR_RIGHT = [
  {
    id: 'reset',
    label: 'Reset',
    tooltip: 'Reset to last saved version',
    action: () => confirmReset(),
    variant: 'ghost'
  },
  { type: 'separator' },
  {
    id: 'share',
    icon: <Share2 />,
    label: 'Share',
    tooltip: 'Share dashboard',
    type: 'dropdown',
    variant: 'default',
    items: [
      { label: 'Get link', icon: <Link2 />, action: () => copyShareLink() },
      { label: 'Embed report', icon: <Code />, action: () => openEmbedDialog() },
      { label: 'Email', icon: <Mail />, action: () => openEmailDialog() },
      { type: 'separator' },
      { label: 'Schedule delivery', icon: <Clock />, action: () => openScheduleDialog() },
      { type: 'separator' },
      { label: 'Manage access', icon: <Users />, action: () => openAccessDialog() }
    ]
  },
  {
    id: 'view',
    icon: <Eye />,
    label: 'View',
    tooltip: 'View mode',
    action: () => enterViewMode(),
    variant: 'default'
  },
  {
    id: 'more',
    icon: <MoreVertical />,
    tooltip: 'More options',
    type: 'dropdown',
    variant: 'ghost',
    items: [
      { label: 'Refresh data', icon: <RefreshCw />, action: () => refreshData() },
      { label: 'Report settings', icon: <Settings />, action: () => openSettings() },
      { type: 'separator' },
      { label: 'Print', icon: <Printer />, action: () => print() }
    ]
  },
  {
    id: 'help',
    icon: <HelpCircle />,
    tooltip: 'Help',
    type: 'dropdown',
    variant: 'ghost',
    items: [
      { label: 'Documentation', action: () => window.open('/docs') },
      { label: 'Keyboard shortcuts', action: () => openShortcuts() },
      { label: 'Report issue', action: () => openIssue() }
    ]
  },
  { type: 'separator' },
  {
    id: 'profile',
    type: 'avatar',
    image: user.avatar,
    tooltip: user.name,
    dropdown: [
      { label: 'Account', icon: <User />, action: () => navigate('/account') },
      { label: 'Settings', icon: <Settings />, action: () => navigate('/settings') },
      { type: 'separator' },
      { label: 'Logout', icon: <LogOut />, action: () => logout() }
    ]
  },
  {
    id: 'pause-updates',
    icon: <Pause />,
    label: 'Pause updates',
    tooltip: 'Pause auto-refresh',
    action: () => togglePauseUpdates(),
    variant: pauseUpdates ? 'default' : 'ghost'
  }
];
```

---

## 1.4 TOPBAR IMPLEMENTATION REQUIREMENTS

### Component Structure

**File**: `/frontend/src/components/dashboard-builder/topbar/EditorTopbar.tsx`

```tsx
<div className="topbar flex flex-col w-full bg-background border-b">
  {/* ROW 1: Menu Bar - Height 40px */}
  <div className="flex items-center h-10 border-b px-3 gap-1">
    <WPPLogo className="h-6 w-6" />
    <span className="text-sm font-semibold ml-2">WPP Analytics</span>
    <div className="h-6 w-px bg-border mx-2" /> {/* Separator */}

    <MenuButton menu="File" items={FILE_MENU_ITEMS} />
    <MenuButton menu="Edit" items={EDIT_MENU_ITEMS} />
    <MenuButton menu="View" items={VIEW_MENU_ITEMS} />
    <MenuButton menu="Insert" items={INSERT_MENU_ITEMS} />
    <MenuButton menu="Page" items={PAGE_MENU_ITEMS} />
    <MenuButton menu="Arrange" items={ARRANGE_MENU_ITEMS} />
    <MenuButton menu="Resource" items={RESOURCE_MENU_ITEMS} />
    <MenuButton menu="Help" items={HELP_MENU_ITEMS} />
  </div>

  {/* ROW 2: Tool Bar - Height 48px */}
  <div className="flex items-center h-12 px-3 justify-between">
    <ToolbarSection items={TOOLBAR_LEFT} />
    <ToolbarSection items={TOOLBAR_CENTER} />
    <ToolbarSection items={TOOLBAR_RIGHT} />
  </div>
</div>
```

### Button Styling (Match Looker Exactly)

**Menu buttons** (Row 1):
- No icon, text only
- Font: 13px, regular weight
- Color: #5f6368 (gray)
- Hover: #202124 (dark gray)
- Padding: 4px 8px
- No border, no background

**Tool buttons** (Row 2):
- Icon size: 20px
- Button size: 32x32px (icon only) or auto (with label)
- Border: 1px solid #dadce0 (light gray)
- Border radius: 4px
- Background: white
- Hover: #f1f3f4 (light gray bg)
- Active: #e8eaed (darker gray bg)
- Gap between buttons: 4px

**Dropdowns**:
- Chevron down icon (12px) next to label
- Popover on click
- Max height: 400px, scrollable
- Box shadow: 0 2px 6px rgba(0,0,0,0.1)

---

---

# PART 2: COMPLETE ECHART SPECIFICATIONS - ALL CHART TYPES

## 2.0 OVERVIEW: CHART ARCHITECTURE

### ECharts Integration Strategy

**Library**: Apache ECharts v5.4.2+
**React Wrapper**: echarts-for-react v3.0.2
**License**: Apache 2.0 (Compatible with commercial use)

### Component Hierarchy

```
<ChartContainer>
  ├── <ChartConfigPanel> (Sidebar configuration)
  ├── <EChartsReact> (Main chart rendering)
  │   └── ECharts option object
  └── <ChartDataSource> (Cube.js query integration)
```

### Common Props Interface

**EVERY chart component inherits this base interface:**

```typescript
interface BaseChartProps {
  // Data binding
  dataSource: string; // Cube.js data source ID
  query: CubeQuery; // Cube.js query object

  // Layout
  x: number; // Position in pixels
  y: number;
  width: number;
  height: number;
  zIndex: number;

  // Interaction
  selected: boolean;
  locked: boolean;

  // Chart-specific
  chartType: ChartType; // Enum of all chart types
  chartConfig: Record<string, any>; // Chart-specific options

  // Events
  onDataClick?: (params: any) => void;
  onBrush?: (params: any) => void;
  onResize?: (size: {width: number, height: number}) => void;
}

// Chart type enum
enum ChartType {
  // Line charts (5 variants)
  LINE = 'line',
  SMOOTH_LINE = 'smooth_line',
  STACKED_LINE = 'stacked_line',
  STEP_LINE = 'step_line',
  AREA_LINE = 'area_line',

  // Bar charts (6 variants)
  BAR = 'bar',
  STACKED_BAR = 'stacked_bar',
  GROUPED_BAR = 'grouped_bar',
  WATERFALL = 'waterfall',
  PICTORIAL_BAR = 'pictorial_bar',
  HORIZONTAL_BAR = 'horizontal_bar',

  // Pie charts (4 variants)
  PIE = 'pie',
  DONUT = 'donut',
  ROSE = 'rose',
  SUNBURST = 'sunburst',

  // Scatter & Bubble
  SCATTER = 'scatter',
  BUBBLE = 'bubble',

  // Financial
  CANDLESTICK = 'candlestick',

  // Radar & Polar
  RADAR = 'radar',
  POLAR = 'polar',

  // Statistical
  BOXPLOT = 'boxplot',

  // Heatmap & Calendar
  HEATMAP = 'heatmap',
  CALENDAR_HEATMAP = 'calendar_heatmap',

  // Hierarchical
  TREE = 'tree',
  TREEMAP = 'treemap',

  // Relationship
  GRAPH = 'graph',
  SANKEY = 'sankey',
  CHORD = 'chord',

  // Progress & KPI
  FUNNEL = 'funnel',
  GAUGE = 'gauge',
  SCORECARD = 'scorecard',

  // Multi-dimensional
  PARALLEL = 'parallel',

  // Temporal
  THEMERIVER = 'themeRiver',

  // Table
  TABLE = 'table',
  PIVOT_TABLE = 'pivot_table',

  // 3D (ECharts GL)
  LINE_3D = 'line3D',
  BAR_3D = 'bar3D',
  SCATTER_3D = 'scatter3D',
  SURFACE = 'surface'
}
```

---

## 2.1 LINE CHARTS (5 Variants)

### 2.1.1 Basic Line Chart

**When to Use**:
- Time series data (daily clicks, revenue trends)
- Continuous data comparison
- Showing trends over time

**ECharts Series Type**: `'line'`

**Data Format** (from Cube.js):
```typescript
interface LineChartData {
  xAxis: string[]; // ['2024-01-01', '2024-01-02', ...]
  series: {
    name: string;
    data: number[]; // [820, 932, 901, ...]
  }[];
}
```

**Component Props**:
```typescript
interface LineChartProps extends BaseChartProps {
  chartConfig: {
    // Line styling
    smooth: boolean; // Smooth curve vs sharp angles
    showPoints: boolean; // Show data point markers
    pointSize: number; // 4-20px
    lineWidth: number; // 1-5px

    // Area fill
    areaStyle: boolean; // Fill area under line
    areaOpacity: number; // 0-1

    // Axes
    xAxis: AxisConfig;
    yAxis: AxisConfig;

    // Legend
    showLegend: boolean;
    legendPosition: 'top' | 'bottom' | 'left' | 'right';

    // Grid
    gridPadding: {top: number, right: number, bottom: number, left: number};

    // Interaction
    enableZoom: boolean;
    enableBrush: boolean;
  };
}

interface AxisConfig {
  type: 'category' | 'value' | 'time' | 'log';
  name: string;
  min?: number | 'dataMin';
  max?: number | 'dataMax';
  axisLabel: {
    show: boolean;
    rotate: number; // -90 to 90
    formatter: string | ((value: any) => string);
  };
  splitLine: {
    show: boolean;
    lineStyle: {
      type: 'solid' | 'dashed' | 'dotted';
      color: string;
    };
  };
}
```

**ECharts Option Example**:
```typescript
const lineChartOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['Clicks', 'Impressions', 'Conversions'],
    top: 10
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Clicks',
      type: 'line',
      stack: undefined, // No stacking
      smooth: false,
      lineStyle: {
        width: 2
      },
      showSymbol: true,
      symbolSize: 6,
      data: [820, 932, 901, 934, 1290, 1330, 1320]
    },
    {
      name: 'Impressions',
      type: 'line',
      smooth: false,
      data: [1200, 1500, 1400, 1600, 2100, 2300, 2200]
    },
    {
      name: 'Conversions',
      type: 'line',
      smooth: false,
      data: [50, 60, 55, 58, 75, 80, 78]
    }
  ]
};
```

**Cube.js Query Pattern**:
```typescript
const cubeQuery = {
  measures: ['GoogleAds.clicks', 'GoogleAds.impressions', 'GoogleAds.conversions'],
  timeDimensions: [{
    dimension: 'GoogleAds.date',
    granularity: 'day',
    dateRange: 'Last 30 days'
  }],
  order: {
    'GoogleAds.date': 'asc'
  }
};
```

**Data Transformation** (Cube.js → ECharts):
```typescript
function transformLineChartData(cubeData: any): LineChartData {
  const xAxis = cubeData.map((row: any) => row['GoogleAds.date']);
  const series = [
    {
      name: 'Clicks',
      data: cubeData.map((row: any) => row['GoogleAds.clicks'])
    },
    {
      name: 'Impressions',
      data: cubeData.map((row: any) => row['GoogleAds.impressions'])
    },
    {
      name: 'Conversions',
      data: cubeData.map((row: any) => row['GoogleAds.conversions'])
    }
  ];

  return {xAxis, series};
}
```

**Component Implementation**:
```tsx
// File: /frontend/src/components/charts/LineChart.tsx

import React, {useMemo} from 'react';
import ReactECharts from 'echarts-for-react';
import {useCubeQuery} from '@cubejs-client/react';
import {BaseChartProps, LineChartProps} from './types';

export const LineChart: React.FC<LineChartProps> = ({
  dataSource,
  query,
  chartConfig,
  width,
  height,
  onDataClick
}) => {
  // Fetch data from Cube.js
  const {resultSet, isLoading} = useCubeQuery(query);

  // Transform data
  const chartData = useMemo(() => {
    if (!resultSet) return null;
    return transformLineChartData(resultSet.tablePivot());
  }, [resultSet]);

  // Build ECharts option
  const option = useMemo(() => {
    if (!chartData) return {};

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {type: 'cross'}
      },
      legend: {
        show: chartConfig.showLegend,
        top: chartConfig.legendPosition === 'top' ? 10 : undefined,
        bottom: chartConfig.legendPosition === 'bottom' ? 10 : undefined,
        left: chartConfig.legendPosition === 'left' ? 10 : undefined,
        right: chartConfig.legendPosition === 'right' ? 10 : undefined,
        data: chartData.series.map(s => s.name)
      },
      grid: {
        top: chartConfig.gridPadding.top,
        right: chartConfig.gridPadding.right,
        bottom: chartConfig.gridPadding.bottom,
        left: chartConfig.gridPadding.left,
        containLabel: true
      },
      xAxis: {
        type: chartConfig.xAxis.type,
        name: chartConfig.xAxis.name,
        data: chartData.xAxis,
        boundaryGap: false,
        axisLabel: chartConfig.xAxis.axisLabel,
        splitLine: chartConfig.xAxis.splitLine
      },
      yAxis: {
        type: chartConfig.yAxis.type,
        name: chartConfig.yAxis.name,
        min: chartConfig.yAxis.min,
        max: chartConfig.yAxis.max,
        axisLabel: chartConfig.yAxis.axisLabel,
        splitLine: chartConfig.yAxis.splitLine
      },
      dataZoom: chartConfig.enableZoom ? [
        {type: 'inside', start: 0, end: 100},
        {start: 0, end: 100, height: 20, bottom: 10}
      ] : undefined,
      brush: chartConfig.enableBrush ? {
        toolbox: ['rect', 'polygon', 'clear'],
        xAxisIndex: 0
      } : undefined,
      series: chartData.series.map(s => ({
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: chartConfig.smooth,
        showSymbol: chartConfig.showPoints,
        symbolSize: chartConfig.pointSize,
        lineStyle: {
          width: chartConfig.lineWidth
        },
        areaStyle: chartConfig.areaStyle ? {
          opacity: chartConfig.areaOpacity
        } : undefined
      }))
    };
  }, [chartData, chartConfig]);

  if (isLoading) {
    return <div className="flex items-center justify-center" style={{width, height}}>
      <span className="text-muted-foreground">Loading chart...</span>
    </div>;
  }

  return (
    <ReactECharts
      option={option}
      style={{width, height}}
      onEvents={{
        click: onDataClick
      }}
    />
  );
};
```

---

### 2.1.2 Smooth Line Chart

**When to Use**:
- When you want softer, more aesthetic curves
- Marketing presentations
- Less emphasis on exact point-to-point changes

**Key Difference**: Sets `smooth: true` in series config

**ECharts Option Modification**:
```typescript
series: [{
  type: 'line',
  smooth: true, // Bezier curve smoothing
  smoothMonotone: 'x', // Preserve monotonicity
  data: [...]
}]
```

---

### 2.1.3 Stacked Line Chart

**When to Use**:
- Showing cumulative totals
- Part-to-whole relationships over time
- Multiple metrics that sum to a total

**Key Configuration**:
```typescript
series: [
  {
    name: 'Organic',
    type: 'line',
    stack: 'Total', // Same stack name = stacked
    areaStyle: {}, // Fill area
    emphasis: {
      focus: 'series'
    },
    data: [120, 132, 101, 134, 90, 230, 210]
  },
  {
    name: 'Paid',
    type: 'line',
    stack: 'Total', // Stack on top of 'Organic'
    areaStyle: {},
    data: [220, 182, 191, 234, 290, 330, 310]
  }
]
```

**Visual**: Each series stacks on top of previous, showing total and composition

---

### 2.1.4 Step Line Chart

**When to Use**:
- Data changes in discrete steps
- Showing constant values between changes
- Pricing tiers, inventory levels

**Key Configuration**:
```typescript
series: [{
  type: 'line',
  step: 'start', // 'start' | 'middle' | 'end'
  data: [...]
}]
```

**Step Types**:
- `'start'`: Step occurs at start of interval
- `'middle'`: Step at middle point
- `'end'`: Step at end point

---

### 2.1.5 Area Line Chart

**When to Use**:
- Emphasizing magnitude of change
- Showing volume/quantity
- Highlighting differences between series

**Key Configuration**:
```typescript
series: [{
  type: 'line',
  areaStyle: {
    color: {
      type: 'linear',
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        {offset: 0, color: 'rgba(58,77,233,0.8)'},
        {offset: 1, color: 'rgba(58,77,233,0.1)'}
      ]
    }
  },
  data: [...]
}]
```

---

## 2.2 BAR CHARTS (6 Variants)

### 2.2.1 Basic Bar Chart

**When to Use**:
- Comparing discrete categories
- Ranking data
- Showing distribution

**ECharts Series Type**: `'bar'`

**Props Interface**:
```typescript
interface BarChartProps extends BaseChartProps {
  chartConfig: {
    orientation: 'vertical' | 'horizontal';
    barWidth: number | string; // 10 or '50%'
    barGap: string; // '10%' between bars
    barCategoryGap: string; // '20%' between categories

    // Styling
    borderRadius: [number, number, number, number]; // [top-left, top-right, bottom-right, bottom-left]
    gradient: boolean;
    gradientColors: [string, string];

    // Labels
    showLabel: boolean;
    labelPosition: 'top' | 'inside' | 'bottom';
    labelFormatter: string | ((params: any) => string);

    // Axes (same as line chart)
    xAxis: AxisConfig;
    yAxis: AxisConfig;
  };
}
```

**ECharts Option**:
```typescript
const barChartOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['Clicks', 'Conversions']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Clicks',
      type: 'bar',
      barWidth: '40%',
      data: [320, 302, 301, 334],
      itemStyle: {
        borderRadius: [4, 4, 0, 0], // Rounded top corners
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            {offset: 0, color: '#3b82f6'},
            {offset: 1, color: '#1d4ed8'}
          ]
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}' // Show value
      }
    },
    {
      name: 'Conversions',
      type: 'bar',
      barWidth: '40%',
      data: [120, 132, 101, 134],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: '#10b981'
      }
    }
  ]
};
```

**Cube.js Query**:
```typescript
const cubeQuery = {
  measures: ['GoogleAds.clicks', 'GoogleAds.conversions'],
  dimensions: ['GoogleAds.campaignName'],
  order: {
    'GoogleAds.clicks': 'desc'
  },
  limit: 10
};
```

---

### 2.2.2 Stacked Bar Chart

**When to Use**:
- Part-to-whole comparison across categories
- Showing composition
- Budget allocation by campaign

**Key Configuration**:
```typescript
series: [
  {
    name: 'Desktop',
    type: 'bar',
    stack: 'total', // All with same stack name = stacked
    data: [320, 302, 301, 334]
  },
  {
    name: 'Mobile',
    type: 'bar',
    stack: 'total',
    data: [120, 132, 101, 134]
  },
  {
    name: 'Tablet',
    type: 'bar',
    stack: 'total',
    data: [50, 42, 61, 54]
  }
]
```

**Label showing percentage**:
```typescript
label: {
  show: true,
  formatter: (params) => {
    const total = params.value; // Would need to calculate actual total
    const percentage = ((params.value / total) * 100).toFixed(1);
    return `${percentage}%`;
  }
}
```

---

### 2.2.3 Grouped Bar Chart

**When to Use**:
- Direct comparison between groups
- A/B test results
- Year-over-year comparison

**Key Configuration**:
```typescript
series: [
  {
    name: '2023',
    type: 'bar',
    // NO stack property = grouped
    barGap: '10%', // Gap between bars in same category
    data: [320, 302, 301, 334]
  },
  {
    name: '2024',
    type: 'bar',
    data: [420, 402, 401, 434]
  }
]
```

---

### 2.2.4 Waterfall Chart

**When to Use**:
- Showing sequential changes
- Budget breakdown (starting → additions → subtractions → ending)
- Conversion funnel with drop-offs

**Implementation**:
```typescript
// Waterfall requires custom data processing
const waterfallData = [
  {name: 'Starting Budget', value: 10000, itemStyle: {color: '#3b82f6'}},
  {name: 'Campaign A Spend', value: -2000, itemStyle: {color: '#ef4444'}},
  {name: 'Campaign B Spend', value: -3000, itemStyle: {color: '#ef4444'}},
  {name: 'Remaining', value: 5000, itemStyle: {color: '#10b981'}}
];

// Transform to stacked bars with invisible helper series
series: [
  {
    name: 'Helper', // Invisible
    type: 'bar',
    stack: 'total',
    itemStyle: {
      borderColor: 'transparent',
      color: 'transparent'
    },
    data: [0, 10000, 8000, 0] // Cumulative positioning
  },
  {
    name: 'Value',
    type: 'bar',
    stack: 'total',
    label: {
      show: true,
      position: 'inside'
    },
    data: waterfallData
  }
]
```

---

### 2.2.5 Pictorial Bar Chart

**When to Use**:
- Infographics
- Custom branding (use logo as bar shape)
- Engaging visualizations

**ECharts Series Type**: `'pictorialBar'`

**Key Configuration**:
```typescript
series: [{
  type: 'pictorialBar',
  symbol: 'path://M0,10 L10,0 L20,10 L10,20 Z', // SVG path or built-in: 'circle', 'rect', 'triangle'
  symbolRepeat: true, // Repeat symbol to fill bar
  symbolSize: ['80%', 20], // Width and height
  symbolMargin: 5,
  data: [320, 302, 301, 334]
}]
```

**Using Image**:
```typescript
series: [{
  type: 'pictorialBar',
  symbol: 'image://https://example.com/icon.png',
  symbolRepeat: true,
  symbolSize: [30, 30],
  data: [...]
}]
```

---

### 2.2.6 Horizontal Bar Chart

**When to Use**:
- Long category names
- Ranking (top 10 keywords)
- Better readability for many categories

**Key Configuration**:
```typescript
// Just swap xAxis and yAxis types!
xAxis: {
  type: 'value' // Now value axis
},
yAxis: {
  type: 'category', // Now category axis
  data: ['Campaign A', 'Campaign B', ...],
  inverse: true // Highest value at top
}
```

---

## 2.3 PIE CHARTS (4 Variants)

### 2.3.1 Basic Pie Chart

**When to Use**:
- Part-to-whole relationships
- Market share
- Traffic source breakdown

**ECharts Series Type**: `'pie'`

**Props Interface**:
```typescript
interface PieChartProps extends BaseChartProps {
  chartConfig: {
    radius: string | [string, string]; // '50%' or ['40%', '70%'] for donut
    center: [string, string]; // ['50%', '50%']

    // Labels
    showLabel: boolean;
    labelPosition: 'outside' | 'inside' | 'center';
    labelFormatter: string | ((params: any) => string);
    labelLine: {
      show: boolean;
      length: number;
      length2: number;
    };

    // Styling
    roseType: false | 'radius' | 'area'; // Rose chart
    startAngle: number; // 0-360, default 90

    // Interaction
    selectedMode: false | 'single' | 'multiple';
    selectedOffset: number; // Offset distance when selected
  };
}
```

**ECharts Option**:
```typescript
const pieChartOption: EChartsOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)' // {a}=series name, {b}=data name, {c}=value, {d}=percentage
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['Direct', 'Email', 'Search Engine', 'Video Ads']
  },
  series: [
    {
      name: 'Traffic Source',
      type: 'pie',
      radius: '55%',
      center: ['50%', '50%'],
      data: [
        {value: 335, name: 'Direct'},
        {value: 310, name: 'Email'},
        {value: 234, name: 'Search Engine'},
        {value: 135, name: 'Video Ads'}
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: true,
        formatter: '{b}: {d}%' // Name: Percentage
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10
      }
    }
  ]
};
```

**Cube.js Query**:
```typescript
const cubeQuery = {
  measures: ['GoogleAds.clicks'],
  dimensions: ['GoogleAds.device'],
  order: {
    'GoogleAds.clicks': 'desc'
  }
};
```

**Data Transformation**:
```typescript
function transformPieChartData(cubeData: any) {
  return cubeData.map((row: any) => ({
    name: row['GoogleAds.device'],
    value: row['GoogleAds.clicks']
  }));
}
```

---

### 2.3.2 Donut Chart

**When to Use**:
- Same as pie, but with center space for:
  - Total value
  - Icon/logo
  - Additional metric

**Key Configuration**:
```typescript
series: [{
  type: 'pie',
  radius: ['40%', '70%'], // Inner and outer radius = donut hole
  center: ['50%', '50%'],
  label: {
    show: false // Often hide labels for cleaner look
  },
  emphasis: {
    label: {
      show: true,
      fontSize: 18,
      fontWeight: 'bold'
    }
  },
  data: [...]
}]
```

**Adding Center Label** (Total):
```typescript
// Use graphic component
graphic: [{
  type: 'text',
  left: 'center',
  top: 'center',
  style: {
    text: 'Total\n1,234',
    textAlign: 'center',
    fill: '#333',
    fontSize: 18,
    fontWeight: 'bold'
  }
}]
```

---

### 2.3.3 Rose Chart (Nightingale Chart)

**When to Use**:
- When values have large differences
- More accurate comparison than pie
- Aesthetic, magazine-style charts

**Key Configuration**:
```typescript
series: [{
  type: 'pie',
  roseType: 'radius', // 'radius' or 'area'
  // radius = radius proportional to value
  // area = area proportional to value (less common)
  radius: ['10%', '70%'],
  center: ['50%', '50%'],
  data: [...]
}]
```

---

### 2.3.4 Sunburst Chart

**When to Use**:
- Hierarchical data
- Multi-level category breakdown
- Campaign → Ad Group → Keyword structure

**ECharts Series Type**: `'sunburst'`

**Data Format**:
```typescript
interface SunburstData {
  name: string;
  value?: number;
  children?: SunburstData[];
  itemStyle?: any;
  label?: any;
}
```

**Example Data**:
```typescript
const sunburstData = [
  {
    name: 'Campaign A',
    children: [
      {
        name: 'Ad Group 1',
        children: [
          {name: 'Keyword 1', value: 100},
          {name: 'Keyword 2', value: 150}
        ]
      },
      {
        name: 'Ad Group 2',
        children: [
          {name: 'Keyword 3', value: 200},
          {name: 'Keyword 4', value: 120}
        ]
      }
    ]
  },
  {
    name: 'Campaign B',
    children: [
      {
        name: 'Ad Group 3',
        children: [
          {name: 'Keyword 5', value: 80},
          {name: 'Keyword 6', value: 90}
        ]
      }
    ]
  }
];
```

**ECharts Option**:
```typescript
const sunburstOption: EChartsOption = {
  tooltip: {
    formatter: (params: any) => {
      return `${params.name}: ${params.value}`;
    }
  },
  series: [{
    type: 'sunburst',
    data: sunburstData,
    radius: ['15%', '90%'],
    sort: null, // Don't sort, preserve order
    emphasis: {
      focus: 'ancestor' // Highlight path to root
    },
    levels: [
      {},
      {
        r0: '15%',
        r: '35%',
        itemStyle: {
          borderWidth: 2
        },
        label: {
          rotate: 'tangential'
        }
      },
      {
        r0: '35%',
        r: '70%',
        label: {
          align: 'right'
        }
      },
      {
        r0: '70%',
        r: '72%',
        label: {
          position: 'outside',
          padding: 3,
          silent: false
        },
        itemStyle: {
          borderWidth: 3
        }
      }
    ]
  }]
};
```

**Cube.js Query** (Hierarchical):
```typescript
const cubeQuery = {
  measures: ['GoogleAds.clicks'],
  dimensions: [
    'GoogleAds.campaignName',
    'GoogleAds.adGroupName',
    'GoogleAds.keyword'
  ],
  order: {
    'GoogleAds.clicks': 'desc'
  }
};

// Then transform flat data to tree structure
function transformToSunburst(flatData: any[]): SunburstData[] {
  // Group by campaign
  const campaigns = new Map();

  flatData.forEach(row => {
    const campaign = row['GoogleAds.campaignName'];
    const adGroup = row['GoogleAds.adGroupName'];
    const keyword = row['GoogleAds.keyword'];
    const clicks = row['GoogleAds.clicks'];

    if (!campaigns.has(campaign)) {
      campaigns.set(campaign, {
        name: campaign,
        children: new Map()
      });
    }

    const campaignNode = campaigns.get(campaign);

    if (!campaignNode.children.has(adGroup)) {
      campaignNode.children.set(adGroup, {
        name: adGroup,
        children: []
      });
    }

    const adGroupNode = campaignNode.children.get(adGroup);
    adGroupNode.children.push({
      name: keyword,
      value: clicks
    });
  });

  // Convert Maps to arrays
  return Array.from(campaigns.values()).map(campaign => ({
    name: campaign.name,
    children: Array.from(campaign.children.values())
  }));
}
```

---

## 2.4 SCATTER & BUBBLE CHARTS

### 2.4.1 Scatter Chart

**When to Use**:
- Correlation analysis (CPC vs CTR)
- Distribution patterns
- Outlier detection

**ECharts Series Type**: `'scatter'`

**Props Interface**:
```typescript
interface ScatterChartProps extends BaseChartProps {
  chartConfig: {
    symbolSize: number | ((value: number[]) => number);
    symbol: 'circle' | 'rect' | 'triangle' | 'diamond' | string; // SVG path

    // Regression line
    showRegressionLine: boolean;
    regressionType: 'linear' | 'polynomial' | 'exponential';

    // Visual map (color by value)
    visualMap: {
      show: boolean;
      dimension: number; // Which dimension to map (0=x, 1=y, 2=size, etc)
      min: number;
      max: number;
      inRange: {
        color: string[];
      };
    };
  };
}
```

**ECharts Option**:
```typescript
const scatterOption: EChartsOption = {
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `CPC: $${params.value[0]}<br/>CTR: ${params.value[1]}%<br/>Campaign: ${params.name}`;
    }
  },
  xAxis: {
    type: 'value',
    name: 'CPC ($)',
    nameLocation: 'middle',
    nameGap: 30
  },
  yAxis: {
    type: 'value',
    name: 'CTR (%)',
    nameLocation: 'middle',
    nameGap: 40
  },
  visualMap: {
    show: true,
    dimension: 2, // Color by 3rd dimension (e.g., conversions)
    min: 0,
    max: 100,
    inRange: {
      color: ['#50a3ba', '#eac736', '#d94e5d']
    },
    text: ['High', 'Low'],
    calculable: true
  },
  series: [{
    type: 'scatter',
    symbolSize: 10,
    data: [
      {
        name: 'Campaign A',
        value: [2.50, 3.5, 45] // [CPC, CTR, Conversions for color]
      },
      {
        name: 'Campaign B',
        value: [1.80, 4.2, 67]
      },
      {
        name: 'Campaign C',
        value: [3.20, 2.8, 23]
      }
      // ... more data points
    ],
    emphasis: {
      focus: 'self',
      itemStyle: {
        borderColor: '#333',
        borderWidth: 2
      }
    }
  }]
};
```

**Adding Regression Line**:
```typescript
// Calculate linear regression
function linearRegression(data: number[][]): {slope: number, intercept: number} {
  // ... math implementation
}

// Add line series
series: [
  {
    type: 'scatter',
    data: scatterData
  },
  {
    type: 'line',
    name: 'Trend',
    data: regressionLineData, // [[x1, y1], [x2, y2]]
    lineStyle: {
      type: 'dashed',
      color: '#333'
    },
    showSymbol: false,
    tooltip: {show: false}
  }
]
```

---

### 2.4.2 Bubble Chart

**When to Use**:
- 3-dimensional data (x, y, size)
- Budget allocation (Spend vs ROAS, size = impressions)
- Portfolio analysis

**Key Difference**: Symbol size varies by data value

**ECharts Configuration**:
```typescript
series: [{
  type: 'scatter',
  symbolSize: (value: number[]) => {
    // value[2] is the 3rd dimension (e.g., impressions)
    // Scale it appropriately
    return Math.sqrt(value[2]) / 10; // Adjust divisor for visual size
  },
  data: [
    ['Campaign A', 2000, 15000, 50000], // [name, spend, ROAS, impressions]
    ['Campaign B', 3000, 12000, 80000]
  ],
  label: {
    show: true,
    formatter: (params: any) => params.data[0] // Show campaign name
  }
}]
```

---

## 2.5 FINANCIAL CHARTS

### 2.5.1 Candlestick Chart

**When to Use**:
- Stock/crypto price data (if applicable)
- Bid price tracking
- OHLC (Open, High, Low, Close) data

**ECharts Series Type**: `'candlestick'`

**Data Format**:
```typescript
// Each data point: [open, close, low, high]
const candlestickData = [
  [20, 34, 10, 38],  // Day 1: open=20, close=34, low=10, high=38
  [40, 35, 30, 50],  // Day 2
  [31, 38, 33, 44]   // Day 3
];
```

**ECharts Option**:
```typescript
const candlestickOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    },
    formatter: (params: any) => {
      const data = params[0].data;
      return `
        Open: ${data[0]}<br/>
        Close: ${data[1]}<br/>
        Low: ${data[2]}<br/>
        High: ${data[3]}
      `;
    }
  },
  xAxis: {
    type: 'category',
    data: ['2024-01-01', '2024-01-02', '2024-01-03'],
    scale: true
  },
  yAxis: {
    type: 'value',
    scale: true
  },
  dataZoom: [
    {
      type: 'inside',
      start: 50,
      end: 100
    },
    {
      show: true,
      type: 'slider',
      bottom: 10,
      start: 50,
      end: 100
    }
  ],
  series: [{
    type: 'candlestick',
    data: candlestickData,
    itemStyle: {
      color: '#ec0000', // Bullish (close > open)
      color0: '#00da3c', // Bearish (close < open)
      borderColor: '#8A0000',
      borderColor0: '#008F28'
    }
  }]
};
```

**With Moving Averages**:
```typescript
function calculateMA(dayCount: number, data: number[][]): number[] {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < dayCount - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += data[i - j][1]; // Close price
    }
    result.push(sum / dayCount);
  }
  return result;
}

series: [
  {
    type: 'candlestick',
    data: candlestickData
  },
  {
    name: 'MA5',
    type: 'line',
    data: calculateMA(5, candlestickData),
    smooth: true,
    lineStyle: {
      opacity: 0.5
    }
  },
  {
    name: 'MA10',
    type: 'line',
    data: calculateMA(10, candlestickData),
    smooth: true
  }
]
```

---

*[Document continues with remaining chart types...]*

**Due to length constraints, I'll now create the complete file. The pattern continues for:**

- 2.6 RADAR & POLAR CHARTS
- 2.7 STATISTICAL CHARTS (Boxplot)
- 2.8 HEATMAP & CALENDAR CHARTS
- 2.9 HIERARCHICAL CHARTS (Tree, Treemap - already covered Sunburst)
- 2.10 RELATIONSHIP CHARTS (Graph, Sankey, Chord)
- 2.11 PROGRESS & KPI CHARTS (Funnel, Gauge, Scorecard)
- 2.12 MULTI-DIMENSIONAL (Parallel Coordinates)
- 2.13 TEMPORAL (ThemeRiver)
- 2.14 TABLES (Table, Pivot Table)
- 2.15 3D CHARTS (Line3D, Bar3D, Scatter3D, Surface)

Then PART 3-7 covering controls, content elements, sidebar, backend, and agent tools.

Let me continue building the complete document...