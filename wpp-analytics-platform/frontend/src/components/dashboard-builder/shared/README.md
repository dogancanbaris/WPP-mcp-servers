# Dashboard Builder - Shared Components

Reusable utility components used across the WPP Analytics Platform dashboard builder.

## Components

### BadgePill
Visual badges for dimensions, metrics, and filters with color-coded styling.

```tsx
import { BadgePill, DimensionBadge, MetricBadge, FilterBadge } from './shared';

// Generic usage
<BadgePill type="dimension">Date</BadgePill>
<BadgePill type="metric">Clicks</BadgePill>
<BadgePill type="filter">Country = US</BadgePill>

// Preset components
<DimensionBadge>Campaign Name</DimensionBadge>
<MetricBadge size="lg">Revenue</MetricBadge>
<FilterBadge size="sm">Status: Active</FilterBadge>
```

**Props:**
- `type`: 'dimension' | 'metric' | 'filter'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: Additional CSS classes

**Color Scheme:**
- Dimension: Green (bg-green-100, text-green-800)
- Metric: Blue (bg-blue-100, text-blue-800)
- Filter: Yellow (bg-yellow-100, text-yellow-800)

---

### DragHandle
Drag-and-drop handle with consistent visual feedback.

```tsx
import { DragHandle, InlineDragHandle, LargeDragHandle } from './shared';

// Standard usage
<DragHandle />

// With drag state
<DragHandle isDragging={isDragging} />

// Disabled state
<DragHandle isDisabled={true} />

// Size variants
<InlineDragHandle />  // size: 14px
<LargeDragHandle />   // size: 20px
```

**Props:**
- `size`: Icon size in pixels (default: 16)
- `isDragging`: Visual feedback when dragging
- `isDisabled`: Disable drag functionality
- `className`: Additional CSS classes

---

### AccordionSection
Collapsible sections with smooth animations and keyboard accessibility.

```tsx
import { AccordionSection, CompactAccordionSection } from './shared';

<AccordionSection
  title="Dimensions"
  icon={<LayersIcon />}
  badge={<Badge>3</Badge>}
  defaultOpen={true}
  onToggle={(isOpen) => console.log(isOpen)}
>
  <DimensionList />
</AccordionSection>

// Compact variant for nested sections
<CompactAccordionSection title="Advanced Options">
  <AdvancedSettings />
</CompactAccordionSection>
```

**Props:**
- `title`: Section title
- `icon`: Optional leading icon
- `badge`: Optional badge component
- `defaultOpen`: Initial state (default: false)
- `onToggle`: Callback when toggled
- `className`, `headerClassName`, `contentClassName`: Styling overrides

---

### EmptyState
Empty state displays with icon, text, and optional action button.

```tsx
import { EmptyState, CompactEmptyState, LargeEmptyState } from './shared';

<EmptyState
  icon={<DatabaseIcon />}
  title="No data sources"
  description="Connect a data source to start building your dashboard"
  action={{
    label: "Add Data Source",
    onClick: handleAddSource,
    variant: 'primary'
  }}
/>

// Size variants
<CompactEmptyState {...props} />  // size: 'sm'
<LargeEmptyState {...props} />    // size: 'lg'
```

**Props:**
- `icon`: React node for icon
- `title`: Headline text
- `description`: Supporting text
- `action`: Optional button config
  - `label`: Button text
  - `onClick`: Click handler
  - `variant`: 'primary' | 'secondary'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

---

### LoadingSpinner
Loading indicators for async operations with multiple variants.

```tsx
import {
  LoadingSpinner,
  InlineLoadingSpinner,
  LoadingOverlay,
  Skeleton,
  TextSkeleton,
  CardSkeleton
} from './shared';

// Standard spinner
<LoadingSpinner size="md" text="Loading data..." />

// Full screen overlay
<LoadingSpinner fullScreen text="Building dashboard..." />

// Inline spinner for buttons
<InlineLoadingSpinner />

// Loading overlay for sections
<div className="relative">
  <LoadingOverlay text="Fetching metrics..." />
  <Content />
</div>

// Skeleton loaders
<Skeleton className="h-8 w-full" count={3} />
<TextSkeleton lines={4} />
<CardSkeleton />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: Optional loading text
- `fullScreen`: Display as full-screen overlay
- `className`: Additional CSS classes

---

### Tooltip
Contextual tooltips with configurable positioning and delay.

```tsx
import { Tooltip, InfoTooltip } from './shared';

// Standard tooltip
<Tooltip content="Click to edit" position="top">
  <button>Edit</button>
</Tooltip>

// Multi-line tooltip
<Tooltip
  content={
    <div>
      <strong>Campaign Status</strong>
      <p>Active campaigns receive traffic</p>
    </div>
  }
  position="right"
  delay={500}
>
  <InfoIcon />
</Tooltip>

// Info tooltip with question mark icon
<InfoTooltip content="This metric shows total clicks" />
```

**Props:**
- `content`: String or React node
- `position`: 'top' | 'bottom' | 'left' | 'right' (default: 'top')
- `delay`: Hover delay in ms (default: 200)
- `className`: Additional CSS classes

---

## Usage Patterns

### Combining Components

```tsx
// Row with drag handle, badges, and tooltip
<div className="flex items-center gap-2 p-2 border rounded">
  <DragHandle />
  <DimensionBadge>Date</DimensionBadge>
  <span className="flex-1">Campaign Start Date</span>
  <InfoTooltip content="The date when campaign started" />
</div>

// Accordion with empty state
<AccordionSection title="Filters" defaultOpen={true}>
  {filters.length > 0 ? (
    <FilterList filters={filters} />
  ) : (
    <CompactEmptyState
      icon={<FilterIcon />}
      title="No filters applied"
      description="Add filters to refine your data"
      action={{ label: "Add Filter", onClick: handleAddFilter }}
    />
  )}
</AccordionSection>

// Loading state with skeleton
{isLoading ? (
  <CardSkeleton />
) : (
  <MetricCard data={data} />
)}
```

### Consistent Styling

All components use:
- Tailwind CSS for styling
- `cn()` utility for class merging
- Consistent color palette (gray, blue, green, yellow)
- Smooth transitions and animations
- Keyboard accessibility
- ARIA attributes

### Token Efficiency

These components are designed to be lightweight:
- Minimal bundle size (< 15 KB total)
- Tree-shakeable exports
- No heavy dependencies
- Optimized re-renders with React.memo where appropriate

## File Structure

```
shared/
├── BadgePill.tsx          # Visual badges for DIM/METRIC/FILTER
├── DragHandle.tsx         # Drag-and-drop handles
├── AccordionSection.tsx   # Collapsible sections
├── EmptyState.tsx         # Empty state displays
├── LoadingSpinner.tsx     # Loading indicators & skeletons
├── Tooltip.tsx            # Contextual tooltips
├── index.ts               # Barrel exports
└── README.md              # This file
```

## Integration

Import from the shared barrel export:

```tsx
import {
  BadgePill,
  DragHandle,
  AccordionSection,
  EmptyState,
  LoadingSpinner,
  Tooltip
} from '@/components/dashboard-builder/shared';
```

## Testing

All components support:
- Unit testing with React Testing Library
- Visual regression testing with Storybook
- Accessibility testing with axe-core
- Type checking with TypeScript

## Contributing

When adding new shared components:
1. Follow existing patterns and conventions
2. Add TypeScript interfaces
3. Include JSDoc comments
4. Export from `index.ts`
5. Update this README
6. Add usage examples

---

**Built for WPP Analytics Platform Dashboard Builder**
