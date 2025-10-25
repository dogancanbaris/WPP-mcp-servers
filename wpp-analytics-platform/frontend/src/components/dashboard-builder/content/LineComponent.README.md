# LineComponent

A flexible, accessible divider/separator component for the WPP Analytics Platform dashboard builder.

## Features

- ✅ **Dual Orientation**: Horizontal and vertical lines
- ✅ **Custom Styling**: Thickness, color, style (solid/dashed/dotted)
- ✅ **Flexible Length**: Percentage, pixels, viewport units
- ✅ **Opacity Control**: 0-1 transparency range
- ✅ **Custom Spacing**: Configurable margins
- ✅ **Accessible**: ARIA attributes for screen readers
- ✅ **Pre-configured Variants**: Common use cases out of the box
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Performance**: Lightweight, no external dependencies

## Installation

The component is located at:
```
/frontend/src/components/dashboard-builder/content/LineComponent.tsx
```

## Basic Usage

### Default Horizontal Divider

```tsx
import { LineComponent } from './LineComponent';

function MyComponent() {
  return (
    <div>
      <p>Content above</p>
      <LineComponent />
      <p>Content below</p>
    </div>
  );
}
```

### Vertical Separator

```tsx
<div style={{ display: 'flex', alignItems: 'center' }}>
  <span>Left content</span>
  <LineComponent orientation="vertical" length="60px" />
  <span>Right content</span>
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Line orientation |
| `thickness` | `number` | `1` | Thickness in pixels |
| `color` | `string` | `'#e5e7eb'` | CSS color value |
| `style` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | Border style |
| `length` | `string \| number` | `'100%'` | Line length (width for horizontal, height for vertical) |
| `margin` | `string` | `'16px 0'` (horizontal)<br/>`'0 16px'` (vertical) | CSS margin value |
| `opacity` | `number` | `1` | Opacity (0-1) |
| `className` | `string` | `''` | Additional CSS classes |
| `ariaLabel` | `string` | `'Divider'` | Accessibility label |

## Advanced Examples

### Custom Styled Divider

```tsx
<LineComponent
  thickness={3}
  color="#3b82f6"
  style="dashed"
  length="75%"
  margin="32px auto"
  opacity={0.8}
/>
```

### Dashboard Section Divider

```tsx
<LineComponent
  thickness={2}
  color="#10b981"
  margin="48px 0"
  ariaLabel="Section separator"
/>
```

### Multi-Column Separator

```tsx
<div style={{ display: 'flex', gap: '24px' }}>
  <div>Column 1</div>
  <LineComponent
    orientation="vertical"
    length="200px"
    thickness={2}
    color="#6366f1"
    style="dashed"
  />
  <div>Column 2</div>
</div>
```

## Pre-configured Variants

### LineDivider

Horizontal divider (shorthand for `LineComponent` with `orientation="horizontal"`).

```tsx
import { LineDivider } from './LineComponent';

<LineDivider thickness={2} color="#3b82f6" />
```

### LineSeparator

Vertical separator (shorthand for `LineComponent` with `orientation="vertical"`).

```tsx
import { LineSeparator } from './LineComponent';

<LineSeparator length="100px" thickness={2} />
```

### SectionDivider

Thicker line with more spacing, ideal for separating major sections.

```tsx
import { SectionDivider } from './LineComponent';

<SectionDivider />
// Equivalent to:
<LineComponent thickness={2} margin="32px 0" />
```

### SubtleDivider

Lighter, less prominent divider for subtle separation.

```tsx
import { SubtleDivider } from './LineComponent';

<SubtleDivider />
// Equivalent to:
<LineComponent color="#f3f4f6" opacity={0.6} margin="8px 0" />
```

### AccentDivider

Brand-colored divider for emphasis.

```tsx
import { AccentDivider } from './LineComponent';

<AccentDivider />
// Equivalent to:
<LineComponent color="#3b82f6" thickness={2} />
```

## Real-World Examples

### Dashboard Card Layout

```tsx
import { SectionDivider, SubtleDivider } from './LineComponent';

function DashboardCard() {
  return (
    <div className="card">
      {/* Header */}
      <div>
        <h3>Campaign Performance</h3>
        <p>Last 30 days</p>
      </div>

      <SectionDivider />

      {/* KPIs */}
      <div className="kpi-grid">
        <KPICard title="Impressions" value="1.2M" />
        <KPICard title="Clicks" value="45.2K" />
        <KPICard title="CTR" value="3.77%" />
        <KPICard title="Cost" value="$8,520" />
      </div>

      <SubtleDivider />

      {/* Chart */}
      <LineChart data={data} />

      <SubtleDivider />

      {/* Actions */}
      <div className="actions">
        <button>Export</button>
        <button>View Details</button>
      </div>
    </div>
  );
}
```

### Multi-Column Analytics Dashboard

```tsx
import { LineSeparator } from './LineComponent';

function AnalyticsDashboard() {
  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Paid Search Column */}
      <div style={{ flex: 1 }}>
        <h3>Paid Search</h3>
        <MetricsList metrics={paidSearchMetrics} />
      </div>

      <LineSeparator length="300px" thickness={2} color="#3b82f6" />

      {/* Organic Search Column */}
      <div style={{ flex: 1 }}>
        <h3>Organic Search</h3>
        <MetricsList metrics={organicMetrics} />
      </div>

      <LineSeparator length="300px" thickness={2} color="#10b981" />

      {/* Social Column */}
      <div style={{ flex: 1 }}>
        <h3>Social Media</h3>
        <MetricsList metrics={socialMetrics} />
      </div>
    </div>
  );
}
```

### Nested Content Hierarchy

```tsx
import { SectionDivider, SubtleDivider, LineDivider } from './LineComponent';

function ContentHierarchy() {
  return (
    <article>
      <h1>Main Title</h1>
      <SectionDivider />

      <section>
        <h2>Section 1</h2>
        <LineDivider />

        <h3>Subsection 1.1</h3>
        <p>Content...</p>
        <SubtleDivider />

        <h3>Subsection 1.2</h3>
        <p>Content...</p>
      </section>

      <SectionDivider />

      <section>
        <h2>Section 2</h2>
        <LineDivider />

        <h3>Subsection 2.1</h3>
        <p>Content...</p>
      </section>
    </article>
  );
}
```

## Styling Options

### Line Styles

```tsx
// Solid (default)
<LineComponent style="solid" />

// Dashed
<LineComponent style="dashed" />

// Dotted
<LineComponent style="dotted" thickness={3} />
```

### Color Variations

```tsx
// Hex color
<LineComponent color="#3b82f6" />

// RGB
<LineComponent color="rgb(59, 130, 246)" />

// RGBA (with alpha)
<LineComponent color="rgba(59, 130, 246, 0.5)" />

// Named color
<LineComponent color="blue" />

// CSS variable
<LineComponent color="var(--brand-primary)" />
```

### Length Options

```tsx
// Percentage
<LineComponent length="100%" />
<LineComponent length="50%" />

// Pixels
<LineComponent length="300px" />
<LineComponent length={200} /> // Numeric value (converted to px)

// Viewport units
<LineComponent length="80vw" />
<LineComponent orientation="vertical" length="50vh" />

// Calc
<LineComponent length="calc(100% - 40px)" />
```

### Opacity Control

```tsx
// Full opacity (default)
<LineComponent opacity={1} />

// Semi-transparent
<LineComponent opacity={0.5} />

// Subtle
<LineComponent opacity={0.25} />

// Invisible (for spacing)
<LineComponent opacity={0} />
```

## Accessibility

The component includes full ARIA support:

```tsx
<LineComponent
  role="separator"              // Automatically applied
  aria-orientation="horizontal" // Based on orientation prop
  aria-label="Section divider"  // Custom label
/>
```

### Screen Reader Considerations

- Always provide meaningful `ariaLabel` for important dividers
- Use semantic HTML structure alongside dividers
- Ensure sufficient color contrast (WCAG 2.1 AA)

```tsx
// Good: Descriptive label
<LineComponent ariaLabel="End of campaign metrics section" />

// Good: Context-specific
<LineComponent ariaLabel="Separator between paid and organic results" />

// Avoid: Generic labels for important dividers
<LineComponent ariaLabel="Divider" /> // Too generic
```

## Performance Considerations

### Token-Efficient Rendering

LineComponent uses inline styles for maximum flexibility without additional CSS overhead:

```tsx
// Each line component is ~100 bytes
<LineComponent />

// Pre-configured variants are equally efficient
<SectionDivider />
<AccentDivider />
```

### Responsive Design

```tsx
// Mobile-friendly: Adjust on smaller screens
const isMobile = window.innerWidth < 768;

<LineComponent
  thickness={isMobile ? 1 : 2}
  margin={isMobile ? '16px 0' : '32px 0'}
/>

// Or use CSS media queries
<LineComponent
  className="hide-on-mobile"
  style={{ display: isMobile ? 'none' : 'block' }}
/>
```

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { LineComponent } from './LineComponent';

test('renders horizontal line by default', () => {
  render(<LineComponent />);
  const line = screen.getByRole('separator');

  expect(line).toBeInTheDocument();
  expect(line).toHaveAttribute('aria-orientation', 'horizontal');
});

test('applies custom styles', () => {
  render(<LineComponent thickness={5} color="#ff0000" />);
  const line = screen.getByRole('separator');

  expect(line).toHaveStyle({
    height: '5px',
    borderTop: '5px solid #ff0000',
  });
});
```

### Visual Regression Testing

Use Storybook to test visual consistency:

```bash
# Run Storybook
npm run storybook

# Navigate to LineComponent stories
# Test all variants and edge cases
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Migration Guide

### From `<hr>` tag

```tsx
// Before
<hr style={{ border: '1px solid #ccc', margin: '20px 0' }} />

// After
<LineComponent thickness={1} color="#ccc" margin="20px 0" />
```

### From Custom CSS Divider

```tsx
// Before
<div className="custom-divider" style={{
  borderTop: '2px dashed #3b82f6',
  margin: '32px 0'
}} />

// After
<LineComponent thickness={2} style="dashed" color="#3b82f6" margin="32px 0" />
```

## Troubleshooting

### Line Not Visible

**Problem**: Line doesn't appear on the page.

**Solutions**:
```tsx
// 1. Check if color matches background
<LineComponent color="#000000" /> // Use contrasting color

// 2. Increase thickness
<LineComponent thickness={2} />

// 3. Check opacity
<LineComponent opacity={1} />

// 4. Verify parent container isn't hiding overflow
<div style={{ overflow: 'visible' }}>
  <LineComponent />
</div>
```

### Vertical Line Not Showing Height

**Problem**: Vertical line appears very short or not at all.

**Solutions**:
```tsx
// 1. Explicitly set length
<LineComponent orientation="vertical" length="200px" />

// 2. Ensure parent has height
<div style={{ height: '300px', display: 'flex' }}>
  <LineComponent orientation="vertical" />
</div>

// 3. Use viewport height
<LineComponent orientation="vertical" length="50vh" />
```

### Line Overflows Container

**Problem**: Line extends beyond its container.

**Solutions**:
```tsx
// 1. Set explicit length
<LineComponent length="100%" /> // Instead of fixed pixels

// 2. Add container overflow
<div style={{ overflow: 'hidden' }}>
  <LineComponent />
</div>

// 3. Use calc for precise sizing
<LineComponent length="calc(100% - 40px)" />
```

## Best Practices

1. **Use Pre-configured Variants**: Prefer `SectionDivider`, `AccentDivider`, etc. for consistency
2. **Consistent Spacing**: Use standard margin values (8px, 16px, 24px, 32px, 48px)
3. **Accessible Labels**: Provide meaningful `ariaLabel` for important dividers
4. **Color Contrast**: Ensure lines have sufficient contrast (WCAG AA: 3:1 for large UI)
5. **Responsive Design**: Adjust thickness and spacing on mobile devices
6. **Semantic HTML**: Use alongside proper heading hierarchy
7. **Performance**: Reuse variants instead of creating unique configurations

## Related Components

- **CardComponent**: Container with built-in dividers
- **SectionComponent**: Layout component with divider support
- **GridComponent**: Multi-column layouts with separators

## Contributing

When adding features to LineComponent:

1. Update TypeScript types
2. Add unit tests
3. Create Storybook story
4. Update this README
5. Test accessibility with screen readers

## License

Part of the WPP Analytics Platform - Internal use only.

## Support

For questions or issues:
- Check Storybook examples
- Review unit tests for usage patterns
- Consult the dashboard-builder documentation
- Contact the frontend team

---

**Last Updated**: 2025-10-22
**Version**: 1.0.0
**Component**: LineComponent
**Location**: `/frontend/src/components/dashboard-builder/content/`
