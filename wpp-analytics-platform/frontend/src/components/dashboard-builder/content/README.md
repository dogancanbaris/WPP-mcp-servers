# Content Components

Rich content components for building dashboard layouts with text, images, videos, and other non-chart elements.

## Components

### TitleComponent

A fully customizable, editable rich text heading component with support for H1-H6 semantic levels.

**Features:**
- Inline editing with contentEditable
- H1-H6 semantic heading levels
- Font styling: size, weight, color, family
- Text alignment: left, center, right, justify
- Background and border customization
- Keyboard shortcuts (Enter to save, Esc to cancel)
- Click outside to save
- Placeholder text for empty state
- Preset configurations for common use cases

**Basic Usage:**

```tsx
import { TitleComponent } from '@/components/dashboard-builder/content';

function MyDashboard() {
  return (
    <TitleComponent
      text="Dashboard Overview"
      headingLevel="h1"
      fontSize="32"
      fontWeight="700"
      color="#1A73E8"
      alignment="center"
      editable={true}
      onTextChange={(newText) => console.log(newText)}
    />
  );
}
```

**With Background & Border:**

```tsx
<TitleComponent
  text="Campaign Performance"
  headingLevel="h2"
  fontSize="24"
  fontWeight="600"
  color="#FFFFFF"
  backgroundColor="#1A73E8"
  borderRadius={8}
  padding={16}
  alignment="center"
/>
```

**Using Presets:**

```tsx
import { TitleComponent, TitlePresets } from '@/components/dashboard-builder/content';

// Page header
<TitleComponent
  text="Analytics Dashboard"
  {...TitlePresets.pageHeader}
/>

// Section title
<TitleComponent
  text="Performance Metrics"
  {...TitlePresets.sectionTitle}
/>

// Highlighted hero
<TitleComponent
  text="Welcome to Analytics"
  {...TitlePresets.centeredHero}
/>
```

**Available Presets:**

- `pageHeader` - H1, 32px, bold, left-aligned
- `sectionTitle` - H2, 24px, semibold, left-aligned
- `subsectionTitle` - H3, 18px, semibold, left-aligned
- `cardTitle` - H4, 16px, semibold, left-aligned
- `centeredHero` - H1, 48px, extrabold, center-aligned with padding
- `highlight` - H2, 28px, bold, white text on blue background

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `'Add title here...'` | The heading text content |
| `onTextChange` | `(text: string) => void` | - | Callback when text is changed |
| `headingLevel` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h2'` | Semantic heading level |
| `fontFamily` | `string` | `'Inter, system-ui, sans-serif'` | Font family CSS value |
| `fontSize` | `string` | `'24'` | Font size in pixels |
| `fontWeight` | `string` | `'600'` | Font weight (300-900) |
| `color` | `string` | `'#1F2937'` | Text color (hex) |
| `alignment` | `'left' \| 'center' \| 'right' \| 'justify'` | `'left'` | Text alignment |
| `editable` | `boolean` | `true` | Enable inline editing |
| `placeholder` | `string` | `'Click to edit title...'` | Placeholder text when empty |
| `backgroundColor` | `string` | `'transparent'` | Background color (hex) |
| `showBorder` | `boolean` | `false` | Show border around title |
| `borderColor` | `string` | `'#E5E7EB'` | Border color (hex) |
| `borderWidth` | `number` | `1` | Border width in pixels |
| `borderRadius` | `number` | `0` | Border radius in pixels |
| `showShadow` | `boolean` | `false` | Show drop shadow |
| `shadowColor` | `string` | `'#000000'` | Shadow color (hex) |
| `shadowBlur` | `number` | `10` | Shadow blur radius |
| `padding` | `number` | `0` | Internal padding in pixels |

**Keyboard Shortcuts:**

- `Enter` - Save changes and exit edit mode
- `Escape` - Cancel changes and revert to original text
- Click outside - Save changes automatically

**Examples:**

See `TitleComponent.example.tsx` for comprehensive examples including:
- All heading levels (H1-H6)
- Text alignment variations
- Font weight options
- Color variations
- Background and border styling
- Editable titles with callbacks
- Preset usage
- Font family options
- Real-world dashboard layouts
- Responsive font sizes

## Future Content Components

The following components are planned for future releases:

### TextComponent
- Rich text editor (bold, italic, underline, lists)
- Markdown support
- Multi-paragraph content
- Link support

### ImageComponent
- Image upload/URL
- Responsive sizing
- Alt text and captions
- Lazy loading
- Crop and fit options

### VideoComponent
- Video embed (YouTube, Vimeo)
- Video upload
- Autoplay and controls
- Responsive player

### IframeComponent
- External content embedding
- Configurable dimensions
- Security options

### SpacerComponent
- Flexible vertical/horizontal spacing
- Visual dividers
- Section breaks

### DividerComponent
- Horizontal rules
- Custom colors and styles
- Text dividers with labels

## Integration with Dashboard Builder

Content components integrate seamlessly with the dashboard builder:

1. **ComponentPicker** - Add content components to dashboard
2. **SettingsSidebar** - Configure content properties
3. **ChartWrapper** - Wrap content in standard container
4. **DashboardCanvas** - Drag and drop positioning

**Example Integration:**

```tsx
import { DashboardCanvas } from '@/components/dashboard-builder';
import { TitleComponent } from '@/components/dashboard-builder/content';

const dashboardLayout = {
  id: 'dashboard-1',
  name: 'My Dashboard',
  rows: [
    {
      id: 'row-1',
      columns: [
        {
          id: 'col-1',
          width: '1/1',
          component: {
            id: 'title-1',
            type: 'title',
            text: 'Marketing Analytics',
            headingLevel: 'h1',
            fontSize: '32',
            fontWeight: '700',
            color: '#1A73E8',
            alignment: 'center',
          }
        }
      ]
    }
  ]
};

<DashboardCanvas layout={dashboardLayout} />
```

## Styling Guidelines

Content components follow these styling conventions:

1. **Typography** - Use system fonts for fast loading
2. **Colors** - Support light and dark themes
3. **Spacing** - Consistent padding and margins
4. **Responsive** - Mobile-first design
5. **Accessibility** - WCAG 2.1 AA compliant
6. **Performance** - Lightweight and fast rendering

## Accessibility

All content components are built with accessibility in mind:

- Semantic HTML (H1-H6 for headings)
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus indicators

## Performance

Content components are optimized for performance:

- Minimal re-renders
- Efficient event handlers
- Lazy loading where applicable
- CSS-in-JS for scoped styles
- No external dependencies (except color picker)

## Testing

Each component includes:

- Unit tests (Jest + React Testing Library)
- Visual regression tests (Storybook)
- Accessibility tests (axe-core)
- Example files for manual testing

Run tests:

```bash
npm test src/components/dashboard-builder/content
```

## Contributing

When adding new content components:

1. Follow the existing component structure
2. Extend `ComponentConfig` type with new props
3. Create comprehensive example file
4. Add to ComponentPicker with icon
5. Update this README
6. Write tests
7. Add Storybook stories
