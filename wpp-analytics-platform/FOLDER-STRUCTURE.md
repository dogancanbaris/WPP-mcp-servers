# Dashboard Builder - Modular Folder Structure

**Purpose**: Define clean, organized folder structure for all new components

---

## Frontend Structure

```
frontend/src/
├── app/
│   └── dashboard/
│       └── [id]/
│           └── builder/
│               └── page.tsx (Main entry point - minimal, delegates to components)
│
├── components/
│   └── dashboard-builder/
│       ├── index.ts (Barrel exports)
│       │
│       ├── topbar/
│       │   ├── EditorTopbar.tsx (Main topbar container)
│       │   ├── EditorMenu.tsx (File, Edit, View, etc. menus)
│       │   ├── QuickTools.tsx (Undo, Redo, Add Row, Add Chart)
│       │   ├── ActionButtons.tsx (Agent, Share, Save, Profile)
│       │   └── index.ts
│       │
│       ├── sidebar/
│       │   ├── SettingsSidebar.tsx (Main sidebar container)
│       │   ├── setup/
│       │   │   ├── ChartSetup.tsx (Main Setup tab)
│       │   │   ├── ChartTypeSelector.tsx
│       │   │   ├── DataSourceSelector.tsx
│       │   │   ├── DimensionSelector.tsx
│       │   │   ├── MetricSelector.tsx (With drag/sort/compare)
│       │   │   ├── MetricRow.tsx (Single metric config)
│       │   │   ├── FilterSection.tsx
│       │   │   ├── DateRangePicker.tsx
│       │   │   └── index.ts
│       │   ├── style/
│       │   │   ├── ChartStyle.tsx (Main Style tab with accordions)
│       │   │   ├── TitleStyleAccordion.tsx
│       │   │   ├── TableStyleAccordion.tsx
│       │   │   ├── MetricStyleAccordion.tsx
│       │   │   ├── BackgroundBorderAccordion.tsx
│       │   │   ├── HeaderFooterAccordion.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       │
│       ├── canvas/
│       │   ├── DashboardCanvas.tsx (Main canvas with dnd-kit)
│       │   ├── Row.tsx
│       │   ├── Column.tsx
│       │   ├── AddRowButton.tsx
│       │   ├── LayoutPicker.tsx
│       │   ├── ComponentPicker.tsx
│       │   └── index.ts
│       │
│       ├── charts/
│       │   ├── ChartWrapper.tsx (Smart router)
│       │   ├── TimeSeriesChart.tsx
│       │   ├── BarChart.tsx
│       │   ├── LineChart.tsx
│       │   ├── PieChart.tsx
│       │   ├── TableChart.tsx
│       │   ├── Scorecard.tsx
│       │   ├── GaugeChart.tsx
│       │   ├── TreemapChart.tsx
│       │   ├── AreaChart.tsx
│       │   ├── ScatterChart.tsx
│       │   ├── HeatmapChart.tsx
│       │   ├── FunnelChart.tsx
│       │   ├── RadarChart.tsx
│       │   └── index.ts
│       │
│       ├── shared/
│       │   ├── ColorPicker.tsx
│       │   ├── ComponentPlaceholder.tsx
│       │   ├── AccordionSection.tsx (Reusable accordion)
│       │   ├── BadgePill.tsx (DIM/METRIC badges)
│       │   ├── DragHandle.tsx (Reusable drag handle)
│       │   └── index.ts
│       │
│       └── README.md (Component documentation)
│
├── store/
│   ├── dashboardStore.ts (Main Zustand store)
│   └── slices/
│       ├── configSlice.ts (Dashboard config state)
│       ├── historySlice.ts (Undo/redo logic)
│       ├── selectionSlice.ts (Selected component)
│       └── index.ts
│
├── types/
│   ├── dashboard.ts (Core types)
│   ├── dashboard-builder.ts (Builder-specific types)
│   ├── chart-config.ts (Chart configuration types)
│   └── index.ts
│
└── lib/
    ├── api/
    │   ├── dashboards.ts (API client for dashboard endpoints)
    │   └── fields.ts (API client for field metadata)
    └── utils/
        └── chart-helpers.ts (Chart rendering utilities)
```

## Backend Structure

```
cube-backend/
├── schema/
│   ├── GscPerformance7days.js (Existing)
│   ├── GoogleAds.js (Future)
│   ├── Analytics.js (Future)
│   └── AvailableFields.js (NEW - Field metadata)
│
└── README.md (Dataset API schema documentation)

backend/ (NEW folder for custom APIs)
├── api/
│   ├── dashboards/
│   │   ├── route.ts (GET /api/dashboards, POST /api/dashboards)
│   │   └── [id]/
│   │       └── route.ts (GET /PUT /DELETE /api/dashboards/:id)
│   └── fields/
│       └── route.ts (GET /api/dashboards/fields)
│
└── lib/
    ├── supabase.ts (Supabase client)
    └── validation.ts (Zod schemas for dashboards)
```

## MCP Tools Structure

```
src/wpp-analytics/tools/
├── dashboards.ts (Dashboard creation tools)
├── templates.ts (Dashboard templates)
└── index.ts (Export all tools)
```

---

## Naming Conventions

### Components:
- PascalCase: `EditorTopbar.tsx`
- Descriptive: `MetricStyleAccordion.tsx` (not `Accordion3.tsx`)
- One component per file
- Barrel exports via index.ts

### Types:
- Interfaces: `ComponentConfig`, `RowConfig`
- Types: `ColumnWidth`, `ComponentType`
- One concerns per file (dashboard.ts, chart-config.ts)

### API Routes:
- RESTful: `/api/dashboards` (collection), `/api/dashboards/:id` (item)
- Nested: `/api/dashboards/fields` (related resource)

### Store:
- Slice pattern: One slice per concern
- Actions: Verbs - `addRow`, `removeRow`, `updateComponent`

---

## Import Paths (Use Aliases)

```typescript
// Components
import { EditorTopbar } from '@/components/dashboard-builder/topbar';
import { ChartSetup } from '@/components/dashboard-builder/sidebar/setup';

// Types
import { DashboardConfig } from '@/types/dashboard';

// Store
import { useDashboardStore } from '@/store/dashboardStore';

// Utils
import { cn } from '@/lib/utils';

// API
import { loadDashboard } from '@/lib/api/dashboards';
```

---

## File Size Guidelines

- Components: < 300 lines (split if larger)
- Accordions: Each in own file
- Sections: Modular and reusable
- No God files

---

This structure ensures:
✅ Clean organization
✅ Easy to find files
✅ Reusable components
✅ Scalable as we add features
✅ Agent-friendly (clear paths)
