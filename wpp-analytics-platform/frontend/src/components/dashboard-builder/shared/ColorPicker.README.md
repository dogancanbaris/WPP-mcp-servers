# ColorPicker Component

A professional color picker component used throughout the WPP Analytics Dashboard Builder for consistent color selection in Setup and Style tabs.

## Features

- **Color Swatch Button**: Visual preview of the current color
- **Hex Code Input**: Editable text input for precise color values
- **Interactive Picker**: Full-featured color picker using `react-colorful`
- **Recent Colors**: Automatically tracks the last 8 colors used
- **Preset Palette**: Quick access to common brand and utility colors
- **Smart Validation**: Automatically formats and validates hex codes

## Usage

### Basic Example

```tsx
import { ColorPicker } from '@/components/dashboard-builder/shared';

function ChartStylePanel() {
  const [textColor, setTextColor] = useState('#1A73E8');

  return (
    <ColorPicker
      label="Text Color"
      value={textColor}
      onChange={setTextColor}
    />
  );
}
```

### With Custom Presets

```tsx
const BRAND_COLORS = [
  '#1A73E8', // Primary Blue
  '#EA4335', // Red
  '#FBBC04', // Yellow
  '#34A853', // Green
  '#000000', // Black
  '#FFFFFF', // White
];

<ColorPicker
  label="Background Color"
  value={backgroundColor}
  onChange={setBackgroundColor}
  presets={BRAND_COLORS}
/>
```

### Multiple Color Pickers

```tsx
<div className="space-y-4">
  <ColorPicker
    label="Text Color"
    value={textColor}
    onChange={setTextColor}
  />

  <ColorPicker
    label="Background Color"
    value={bgColor}
    onChange={setBgColor}
  />

  <ColorPicker
    label="Border Color"
    value={borderColor}
    onChange={setBorderColor}
  />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **Required** | Label text displayed above the color picker |
| `value` | `string` | **Required** | Current color value in hex format (e.g., "#1A73E8") |
| `onChange` | `(color: string) => void` | **Required** | Callback fired when color changes |
| `showAlpha` | `boolean` | `false` | Whether to show alpha channel controls (reserved for future) |
| `presets` | `string[]` | DEFAULT_PRESETS | Array of preset color hex values |
| `className` | `string` | `undefined` | Additional CSS classes for the root element |

## Default Preset Colors

The component includes 24 carefully selected preset colors:

**Basic Colors** (8):
- Black, White, Red, Green, Blue, Yellow, Magenta, Cyan

**Google Brand Colors** (8):
- Google Blue (#1A73E8)
- Google Red (#EA4335)
- Google Yellow (#FBBC04)
- Google Green (#34A853)
- Purple, Orange, Gray, Dark Blue

**Modern UI Colors** (8):
- Tailwind primary shades for common UI needs

## Behavior

### Color Format Validation

The component automatically handles various hex input formats:

```tsx
// All of these are valid and will be normalized:
"#1A73E8"  // Standard 6-digit hex (preferred)
"#1a73e8"  // Lowercase (converted to uppercase)
"1A73E8"   // Missing # (automatically added)
"#1AE"     // 3-digit shorthand (expanded to #11AAEE)
```

### Recent Colors History

- Automatically tracks the last 8 colors selected
- Colors are added to history when the user completes a selection
- Clicking a preset or recent color immediately applies it
- History persists during the component's lifetime

### Click Outside to Close

The color picker popover automatically closes when clicking outside the picker area, providing intuitive UX.

## Integration Points

### ChartSetup Tab

Used for selecting data-related colors:

```tsx
<ColorPicker
  label="Series Color"
  value={seriesConfig.color}
  onChange={(color) => updateSeries({ color })}
/>
```

### ChartStyle Tab

Used for all visual styling options:

```tsx
<AccordionSection title="Text Style">
  <ColorPicker
    label="Title Color"
    value={style.titleColor}
    onChange={(color) => updateStyle({ titleColor: color })}
  />

  <ColorPicker
    label="Label Color"
    value={style.labelColor}
    onChange={(color) => updateStyle({ labelColor: color })}
  />
</AccordionSection>
```

### Sidebar Sections

Used in accordion sections throughout the settings sidebar:

```tsx
<AccordionSection title="Chart Background">
  <ColorPicker
    label="Background Color"
    value={chartStyle.backgroundColor}
    onChange={(color) => updateChartStyle({ backgroundColor: color })}
  />
</AccordionSection>
```

## Visual Design

The ColorPicker follows the Looker Studio-inspired design pattern:

```
┌─ Color Picker ──────────────┐
│                             │
│  Background color:          │
│  ┌─────┐                    │
│  │ ⚫  │  #1A73E8            │
│  └─────┘   ^Hex code        │
│    ^Click to open picker    │
│                             │
│  [When opened:]             │
│  ┌───────────────────────┐  │
│  │ [Color gradient]      │  │
│  │                       │  │
│  │ Hex: #1A73E8          │  │
│  │                       │  │
│  │ Recent: [⚫][🔵][🟢]  │  │
│  │                       │  │
│  │ Presets:              │  │
│  │ [⚫][⚪][🔴][🟢][🔵]   │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation supported
- Focus states clearly visible
- Color values shown in hex for screen readers
- Proper semantic HTML structure

## Performance

- Lightweight with minimal re-renders
- Uses React.memo internally for optimization
- Efficient click-outside detection
- Lazy rendering of popover (only when open)

## TypeScript Support

Full TypeScript support with proper type definitions:

```tsx
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  showAlpha?: boolean;
  presets?: string[];
  className?: string;
}
```

## Testing

Example test cases:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';

test('renders color picker with label', () => {
  render(
    <ColorPicker
      label="Text Color"
      value="#1A73E8"
      onChange={() => {}}
    />
  );

  expect(screen.getByText('Text Color')).toBeInTheDocument();
});

test('opens popover on swatch click', () => {
  render(
    <ColorPicker
      label="Text Color"
      value="#1A73E8"
      onChange={() => {}}
    />
  );

  const swatch = screen.getByLabelText('Open color picker');
  fireEvent.click(swatch);

  expect(screen.getByText('Recent')).toBeInTheDocument();
  expect(screen.getByText('Presets')).toBeInTheDocument();
});
```

## Related Components

- **Input**: Used for hex code text input
- **AccordionSection**: Common container for color pickers in sidebars
- **BadgePill**: May be used alongside for color indicators

## File Location

```
/frontend/src/components/dashboard-builder/shared/ColorPicker.tsx
```

## Dependencies

- `react-colorful` (v5.6.1): Core color picker functionality
- `@/components/ui/input`: Text input component
- `@/lib/utils`: Utility functions (cn for classnames)

## Notes

- The `showAlpha` prop is reserved for future RGBA support
- Recent colors persist only during component lifetime (not localStorage)
- Color validation is strict to prevent invalid values
- All colors are normalized to uppercase hex format

## Future Enhancements

Potential future improvements:

1. **LocalStorage persistence**: Save recent colors across sessions
2. **Alpha channel support**: Add transparency controls
3. **Color space conversions**: Support RGB, HSL input formats
4. **Eyedropper API**: Native browser color picker integration
5. **Color harmony suggestions**: Complementary/analogous color recommendations
