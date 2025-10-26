# Dashboard Builder - Settings Sidebar

## Overview

The Settings Sidebar is a right-side panel that appears when a chart component is selected in the dashboard builder. It provides two tabs for configuring component properties:

1. **Setup Tab** - Configure data source, dimensions, metrics, and filters
2. **Style Tab** - Customize visual appearance (colors, borders, spacing)

## Components

### SettingsSidebar

Main container component that manages the sidebar UI and tab switching.

**Location**: `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/SettingsSidebar.tsx`

**Features**:
- Fixed 320px width
- Shows "No Selection" message when nothing is selected
- Displays component name and type
- Two-tab interface (Setup | Style)
- Dark mode compatible

**Usage**:

```tsx
import { SettingsSidebar } from '@/components/dashboard-builder';
import { ComponentConfig } from '@/types/dashboard-builder';
import { useState } from 'react';

function DashboardBuilder() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig>();

  const handleUpdateComponent = (id: string, updates: Partial<ComponentConfig>) => {
    // Update component in your state/store
    console.log('Updating component:', id, updates);
  };

  return (
    <div className="flex h-screen">
      {/* Canvas area */}
      <div className="flex-1">
        {/* Your dashboard canvas */}
      </div>

      {/* Settings Sidebar */}
      <SettingsSidebar
        selectedComponent={selectedComponent}
        onUpdateComponent={handleUpdateComponent}
      />
    </div>
  );
}
```

### ChartSetup

Setup tab content for configuring chart data and query parameters.

**Location**: `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/ChartSetup.tsx`

**Features**:
- Data source dropdown (GSC, Google Ads, Analytics, Combined)
- Dimension selector with green "DIM" badges
- Metrics multi-select with blue "METRIC" badges (Looker Studio style)
- "+ Add metric" button
- Date range picker (last 7/30/90 days, this month, etc.)
- Real-time updates

**Available Dimensions** (from Supabase dataset):
- Date
- Query
- Page
- Device
- Country

**Available Metrics** (from Supabase dataset):
- Clicks
- Impressions
- CTR (Click-through rate)
- Position (Average ranking)

**Usage**:

```tsx
import { ChartSetup } from '@/components/dashboard-builder';

<ChartSetup
  config={componentConfig}
  onUpdate={(updates) => {
    // Updates applied automatically
    handleUpdateComponent(componentConfig.id, updates);
  }}
/>
```

### ChartStyle

Style tab content for customizing chart visual appearance.

**Location**: `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/ChartStyle.tsx`

**Features**:
- Title text input
- Background color picker (react-colorful)
- Border color picker
- Border width slider (0-10px)
- Border radius slider (0-20px, square to rounded)
- Padding slider (0-50px)
- Live preview of style changes
- "Reset to defaults" button

**Usage**:

```tsx
import { ChartStyle } from '@/components/dashboard-builder';

<ChartStyle
  config={componentConfig}
  onUpdate={(updates) => {
    handleUpdateComponent(componentConfig.id, updates);
  }}
/>
```

## Data Flow

```
User clicks chart
  → ChartWrapper fires onClick
    → Parent sets selectedComponent state
      → SettingsSidebar receives selectedComponent
        → User edits in ChartSetup/ChartStyle
          → onUpdate callback fires
            → Parent updates component config
              → Chart re-renders with new config
```

## Example: Complete Integration

```tsx
'use client';

import { useState } from 'react';
import {
  SettingsSidebar,
  ChartWrapper,
  ComponentConfig
} from '@/components/dashboard-builder';

export default function DashboardBuilderPage() {
  const [components, setComponents] = useState<ComponentConfig[]>([
    {
      id: 'chart-1',
      type: 'bar-chart',
      title: 'Campaign Performance',
      datasource: 'gsc_data',
      dimensions: ['date'],
      metrics: ['clicks', 'impressions'],
      dateRange: 'last_30_days'
    }
  ]);

  const [selectedId, setSelectedId] = useState<string>();

  const handleUpdateComponent = (id: string, updates: Partial<ComponentConfig>) => {
    setComponents(prev =>
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const selectedComponent = components.find(c => c.id === selectedId);

  return (
    <div className="flex h-screen">
      {/* Canvas */}
      <div className="flex-1 p-6 overflow-auto">
        {components.map(config => (
          <ChartWrapper
            key={config.id}
            config={config}
            isSelected={config.id === selectedId}
            onClick={() => setSelectedId(config.id)}
          />
        ))}
      </div>

      {/* Settings Sidebar */}
      <SettingsSidebar
        selectedComponent={selectedComponent}
        onUpdateComponent={handleUpdateComponent}
      />
    </div>
  );
}
```

## Styling

All components use shadcn/ui components and support dark mode automatically via Tailwind CSS classes:

- `bg-background` - Adapts to light/dark theme
- `text-foreground` - Text color that adapts
- `border` - Border color that adapts
- `text-muted-foreground` - Secondary text color

## Dependencies

- **shadcn/ui**: All UI components (Tabs, Select, Input, Slider, Badge, etc.)
- **react-colorful**: Color picker (already installed in package.json)
- **lucide-react**: Icons (FileQuestion, X, Plus, Palette)
- **Tailwind CSS**: Styling framework

## Type Definitions

All types are defined in `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/types/dashboard-builder.ts`:

```typescript
interface ComponentConfig {
  id: string;
  type: ComponentType;
  title: string;
  datasource?: string;
  metrics?: string[];
  dimensions?: string[];
  filters?: any[];
  dateRange?: string;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
  };
}
```

## Future Enhancements

1. **ChartSetup**:
   - Filter builder UI
   - Custom date range picker (calendar)
   - Sort order controls
   - Limit/pagination settings
   - Advanced aggregation options

2. **ChartStyle**:
   - Chart-specific style options (bar color, line thickness, etc.)
   - Font family/size controls
   - Axis configuration
   - Legend position
   - Tooltip customization

3. **General**:
   - Keyboard shortcuts (Cmd+S to save, Cmd+Z to undo)
   - Copy/paste component settings
   - Style presets/themes
   - Export/import component configs

## Testing

See `__tests__/SettingsSidebar.test.tsx` for component tests and usage examples.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All modern browsers with ES2020 support.
