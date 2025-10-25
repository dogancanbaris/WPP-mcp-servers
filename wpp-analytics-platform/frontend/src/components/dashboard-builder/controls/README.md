# Dashboard Builder Controls

Reusable control components for the WPP Analytics Platform dashboard builder interface. These controls provide consistent UI patterns for common configuration tasks across the dashboard builder.

## Overview

The controls directory contains specialized input components that are used throughout the dashboard builder for data configuration, visualization settings, and user interactions. Each control is:

- **Type-safe**: Full TypeScript support with exported types
- **Accessible**: WCAG 2.1 AA compliant
- **Tested**: Comprehensive unit tests and Storybook stories
- **Responsive**: Works on all screen sizes (mobile to 4K)
- **Themeable**: Integrates with shadcn/ui design system

## Available Controls

### DataSourceControl

A dropdown control for switching between different data sources (GSC, Google Ads, Analytics, BigQuery).

**Features:**
- Visual icons for each data source type
- Type-safe data source selection
- Responsive sizing options (sm, default, lg)
- Optional descriptions for each source
- Customizable styling
- Disabled state support

**Quick Start:**

```tsx
import { DataSourceControl, commonDataSources } from '@/components/dashboard-builder/controls';

function MyComponent() {
  const [source, setSource] = useState('gsc-default');

  return (
    <DataSourceControl
      sources={commonDataSources}
      value={source}
      onChange={setSource}
    />
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sources` | `DataSourceOption[]` | *required* | Array of available data sources |
| `value` | `string` | *required* | Currently selected data source ID |
| `onChange` | `(id: string) => void` | *required* | Callback when selection changes |
| `label` | `string` | `"Data Source"` | Label text for the control |
| `showLabel` | `boolean` | `true` | Whether to display the label |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Size variant of the control |
| `disabled` | `boolean` | `false` | Whether the control is disabled |
| `placeholder` | `string` | `"Select data source"` | Placeholder text when no source selected |
| `className` | `string` | - | Additional CSS classes |

**Example with Custom Sources:**

```tsx
import { DataSourceControl, createDataSource } from '@/components/dashboard-builder/controls';

const customSources = [
  createDataSource(
    'gsc-main',
    'Main Website',
    'gsc',
    'Organic search data for main site'
  ),
  createDataSource(
    'ads-brand',
    'Brand Campaign',
    'ads',
    'Branded keyword campaigns'
  ),
  createDataSource(
    'ga4-prod',
    'Production Property',
    'analytics',
    'Primary GA4 property'
  ),
];

<DataSourceControl
  sources={customSources}
  value={selectedSource}
  onChange={setSelectedSource}
  label="Choose Data Source"
  size="lg"
/>
```

**Data Source Types:**

The control supports four data source types:

1. **`gsc`** - Google Search Console
   - Icon: Search icon
   - Color: Green
   - Use for: Organic search performance data

2. **`ads`** - Google Ads
   - Icon: TrendingUp icon
   - Color: Blue
   - Use for: Paid search campaign data

3. **`analytics`** - Google Analytics 4
   - Icon: BarChart3 icon
   - Color: Orange
   - Use for: User behavior and engagement data

4. **`bigquery`** - BigQuery
   - Icon: Database icon
   - Color: Purple
   - Use for: Custom aggregated warehouse queries

**Pre-configured Sources:**

Use `commonDataSources` for standard WPP data sources:

```tsx
import { commonDataSources } from '@/components/dashboard-builder/controls';

// Contains:
// - Google Search Console (gsc-default)
// - Google Ads (ads-default)
// - Google Analytics 4 (analytics-default)
// - BigQuery (bigquery-default)
```

**Size Variants:**

```tsx
// Small (h-8, text-xs) - Compact forms
<DataSourceControl size="sm" {...props} />

// Default (h-10, text-sm) - Standard forms
<DataSourceControl size="default" {...props} />

// Large (h-12, text-base) - Prominent forms
<DataSourceControl size="lg" {...props} />
```

**Advanced Usage - Form Integration:**

```tsx
function DashboardForm() {
  const [primary, setPrimary] = useState('gsc-default');
  const [secondary, setSecondary] = useState('');
  const [blendEnabled, setBlendEnabled] = useState(false);

  return (
    <form>
      <DataSourceControl
        sources={commonDataSources}
        value={primary}
        onChange={setPrimary}
        label="Primary Data Source"
      />

      <Switch
        checked={blendEnabled}
        onCheckedChange={setBlendEnabled}
      />

      {blendEnabled && (
        <DataSourceControl
          sources={commonDataSources.filter(s => s.id !== primary)}
          value={secondary}
          onChange={setSecondary}
          label="Secondary Data Source"
        />
      )}
    </form>
  );
}
```

## TypeScript Types

All controls export their prop types for type-safe usage:

```tsx
import type {
  DataSourceControlProps,
  DataSourceOption,
  DataSourceType,
} from '@/components/dashboard-builder/controls';

// Define your own data sources
const mySource: DataSourceOption = {
  id: 'custom-1',
  name: 'Custom Source',
  type: 'gsc',
  description: 'My custom data source',
};

// Type-safe change handler
const handleChange = (sourceId: string) => {
  console.log('Selected:', sourceId);
};
```

## Testing

Each control comes with comprehensive unit tests:

```bash
# Run tests for all controls
npm test -- controls

# Run tests for specific control
npm test -- DataSourceControl.test

# Run with coverage
npm test -- --coverage controls
```

**Test Coverage:**
- Basic rendering with all prop combinations
- User interactions (click, keyboard navigation)
- Size variants
- Edge cases (empty arrays, invalid values)
- Accessibility (ARIA labels, keyboard navigation)
- Type safety

## Storybook

Interactive documentation and visual testing via Storybook:

```bash
# Start Storybook
npm run storybook
```

**Available Stories:**

- **Default** - Standard usage
- **Size Variants** - sm, default, lg
- **Custom Sources** - Using createDataSource utility
- **Form Layout** - Integration with forms
- **Dashboard Builder Scenario** - Real-world usage
- **Error State** - Handling invalid selections
- **Loading State** - Async data loading

Navigate to: `Dashboard Builder > Controls > DataSourceControl`

## Styling

Controls use the shadcn/ui design system and Tailwind CSS:

```tsx
// Custom styling via className
<DataSourceControl
  className="my-custom-class"
  {...props}
/>

// Inline with other form elements
<div className="grid grid-cols-2 gap-4">
  <DataSourceControl {...props} />
  <OtherControl {...props} />
</div>
```

## Accessibility

All controls follow WCAG 2.1 AA guidelines:

- Proper ARIA labels and roles
- Keyboard navigation support (Tab, Enter, Escape, Arrow keys)
- Screen reader compatible
- Focus indicators
- Sufficient color contrast (4.5:1 minimum)
- Error states announced to assistive technologies

**Keyboard Shortcuts:**

- `Tab` - Focus control
- `Enter` / `Space` - Open dropdown
- `↑` / `↓` - Navigate options
- `Enter` - Select option
- `Escape` - Close dropdown

## Performance

Controls are optimized for performance:

- Memoized components where appropriate
- Efficient re-renders (only when props change)
- Lazy loading for large option lists
- Virtualized dropdowns for 100+ options (future enhancement)

## Integration with Dashboard Builder

Controls integrate seamlessly with the dashboard builder's component configuration:

```tsx
// In ChartSetup component
import { DataSourceControl } from '@/components/dashboard-builder/controls';

function ChartSetup({ config, onUpdate }) {
  const handleSourceChange = (sourceId: string) => {
    onUpdate({ datasource: sourceId });
  };

  return (
    <DataSourceControl
      sources={availableDataSources}
      value={config.datasource}
      onChange={handleSourceChange}
    />
  );
}
```

## Best Practices

### ✅ Do

- Use `commonDataSources` for standard WPP data sources
- Provide descriptive labels and helper text
- Handle empty states gracefully
- Use appropriate size variants for context
- Validate selected values
- Show loading states during async operations

### ❌ Don't

- Hardcode data source IDs in components
- Ignore accessibility requirements
- Skip error handling
- Use inline styles instead of className
- Mutate props directly

## Future Controls

Planned controls for future releases:

- **MetricControl** - Select and configure metrics
- **DimensionControl** - Choose dimensions for grouping
- **FilterControl** - Build complex filter expressions
- **DateRangeControl** - Pick date ranges with presets
- **AggregationControl** - Select aggregation methods
- **SortControl** - Configure sorting rules
- **LimitControl** - Set row limits with slider
- **BlendControl** - Configure data blending

## Contributing

When adding new controls:

1. Create component in `controls/` directory
2. Export from `controls/index.ts`
3. Add comprehensive TypeScript types
4. Write unit tests (aim for >90% coverage)
5. Create Storybook stories
6. Update this README
7. Add examples to component JSDoc

**File Structure:**

```
controls/
├── README.md                        # This file
├── index.ts                         # Barrel exports
├── DataSourceControl.tsx            # Component
├── DataSourceControl.test.tsx       # Unit tests
└── DataSourceControl.stories.tsx    # Storybook stories
```

## API Reference

### createDataSource()

Utility function to create data source options.

```tsx
createDataSource(
  id: string,
  name: string,
  type: DataSourceType,
  description?: string,
  icon?: React.ReactNode
): DataSourceOption
```

**Example:**

```tsx
const customSource = createDataSource(
  'gsc-blog',
  'Blog - Search Console',
  'gsc',
  'Organic search data for blog subdomain',
  <CustomIcon />
);
```

### commonDataSources

Pre-configured array of standard WPP data sources.

```tsx
const commonDataSources: DataSourceOption[]
```

**Contents:**
- Google Search Console (gsc-default)
- Google Ads (ads-default)
- Google Analytics 4 (analytics-default)
- BigQuery (bigquery-default)

## Troubleshooting

**Issue: Dropdown not opening**
- Check that `disabled` prop is not true
- Ensure parent container allows overflow
- Verify z-index is not conflicting

**Issue: Icons not displaying**
- Ensure lucide-react is installed
- Check icon import paths
- Verify icon size classes are applied

**Issue: TypeScript errors**
- Update to latest version of controls
- Check that all required props are provided
- Verify data source types match `DataSourceType`

**Issue: Styling not applying**
- Ensure Tailwind CSS is configured
- Check that shadcn/ui is properly set up
- Verify className merge is working (cn utility)

## Support

For issues or questions:

- **Documentation**: This README and JSDoc comments
- **Examples**: Storybook stories
- **Tests**: Unit test files show usage patterns
- **GitHub**: Open an issue in the repository

## License

Part of the WPP Analytics Platform. All rights reserved.
