# Theme Customization System

## Overview

A comprehensive theme customization system for the WPP Analytics Platform dashboard builder, featuring color palettes, typography, spacing presets, and persistent theme management.

## Features

- **6 Predefined Themes**: WPP Default, Dark Mode, Ocean Breeze, Forest Green, Sunset Orange, Purple Haze
- **6 Color Palettes**: Complete sets with primary, secondary, accent, and 8-color chart palettes
- **8 Font Families**: System, Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Source Sans Pro
- **3 Spacing Presets**: Compact, Comfortable, Spacious
- **Save/Load System**: LocalStorage-based persistence
- **Import/Export**: JSON-based theme sharing
- **Live Preview**: Real-time theme application
- **CSS Custom Properties**: Easy integration with existing components

## File Structure

```
/frontend/src/
├── lib/
│   └── themes.ts                 # Core theme system and manager
└── components/
    └── dashboard-builder/
        ├── ThemeEditor.tsx       # Main theme editor component
        └── ThemeEditorExample.tsx # Usage examples
```

## Quick Start

### 1. Apply Theme on App Mount

```tsx
import { ThemeManager } from './lib/themes';

function App() {
  useEffect(() => {
    const theme = ThemeManager.getActiveTheme();
    ThemeManager.applyThemeToDom(theme);
  }, []);

  return <YourApp />;
}
```

### 2. Add Theme Editor to Dashboard

```tsx
import { ThemeEditor } from './components/dashboard-builder/ThemeEditor';

function Dashboard() {
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  return (
    <>
      <button onClick={() => setShowThemeEditor(true)}>
        Customize Theme
      </button>

      {showThemeEditor && (
        <ThemeEditor
          onThemeChange={(theme) => console.log('Theme updated:', theme)}
          onClose={() => setShowThemeEditor(false)}
        />
      )}
    </>
  );
}
```

### 3. Use CSS Variables in Components

```tsx
function Card() {
  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--color-border)'
    }}>
      <h3 style={{ color: 'var(--color-primary)' }}>
        Campaign Stats
      </h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Performance metrics
      </p>
    </div>
  );
}
```

## API Reference

### ThemeManager

#### Methods

##### `getAllThemes(): Theme[]`
Get all available themes (default + custom).

```typescript
const themes = ThemeManager.getAllThemes();
// Returns: [{ id: 'wpp-default', name: 'WPP Default', ... }, ...]
```

##### `getTheme(themeId: string): Theme | null`
Get a specific theme by ID.

```typescript
const theme = ThemeManager.getTheme('dark-mode');
```

##### `getActiveTheme(): Theme`
Get the currently active theme (returns default if none set).

```typescript
const currentTheme = ThemeManager.getActiveTheme();
```

##### `setActiveTheme(themeId: string): void`
Set and apply a theme as active.

```typescript
ThemeManager.setActiveTheme('ocean-breeze');
```

##### `saveTheme(theme: Theme): void`
Save a custom theme to localStorage.

```typescript
ThemeManager.saveTheme({
  id: 'my-theme',
  name: 'My Custom Theme',
  description: 'Brand-specific theme',
  colors: { ... },
  typography: { ... },
  spacing: { ... },
  borderRadius: { ... },
  shadows: { ... }
});
```

##### `deleteTheme(themeId: string): void`
Delete a custom theme (cannot delete default themes).

```typescript
ThemeManager.deleteTheme('custom-1234567890');
```

##### `applyThemeToDom(theme: Theme): void`
Apply theme to DOM as CSS custom properties.

```typescript
ThemeManager.applyThemeToDom(theme);
// Sets CSS variables: --color-primary, --spacing-md, etc.
```

##### `exportTheme(theme: Theme): string`
Export theme as JSON string.

```typescript
const json = ThemeManager.exportTheme(theme);
// Download or share the JSON
```

##### `importTheme(jsonString: string): Theme`
Import theme from JSON string.

```typescript
const theme = ThemeManager.importTheme(jsonString);
ThemeManager.saveTheme(theme);
```

##### `duplicateTheme(theme: Theme, newName: string): Theme`
Create a copy of a theme with a new name.

```typescript
const copy = ThemeManager.duplicateTheme(theme, 'My Theme Copy');
```

##### `generateThemeId(): string`
Generate a unique theme ID.

```typescript
const id = ThemeManager.generateThemeId();
// Returns: 'custom-1634567890123-abc123xyz'
```

## Theme Structure

### Complete Theme Object

```typescript
interface Theme {
  id: string;                      // Unique identifier
  name: string;                    // Display name
  description: string;             // Theme description
  colors: ColorPalette;            // Color definitions
  typography: TypographyScale;     // Font settings
  spacing: SpacingScale;           // Spacing values
  borderRadius: BorderRadiusScale; // Corner radius
  shadows: ShadowScale;            // Box shadows
  createdAt?: string;              // ISO timestamp
  updatedAt?: string;              // ISO timestamp
  isCustom?: boolean;              // Custom vs default
}
```

### Color Palette

```typescript
interface ColorPalette {
  // Primary brand colors
  primary: string;           // Main brand color
  primaryHover: string;      // Hover state
  primaryActive: string;     // Active/pressed state

  // Secondary colors
  secondary: string;         // Secondary actions
  secondaryHover: string;    // Secondary hover
  accent: string;            // Accent highlights

  // Surface colors
  background: string;        // Page background
  surface: string;           // Card/panel background
  surfaceHover: string;      // Hover state
  border: string;            // Border color

  // Text colors
  text: string;              // Primary text
  textSecondary: string;     // Secondary text
  textMuted: string;         // Muted/disabled text

  // Semantic colors
  success: string;           // Success states
  warning: string;           // Warning states
  error: string;             // Error states
  info: string;              // Info states

  // Chart colors
  chart: string[];           // 8-color palette for charts
}
```

### Typography Scale

```typescript
interface TypographyScale {
  fontFamily: string;        // Body font
  headingFamily?: string;    // Heading font (optional)

  sizes: {
    xs: string;              // 0.75rem (12px)
    sm: string;              // 0.875rem (14px)
    base: string;            // 1rem (16px)
    lg: string;              // 1.125rem (18px)
    xl: string;              // 1.25rem (20px)
    '2xl': string;           // 1.5rem (24px)
    '3xl': string;           // 1.875rem (30px)
    '4xl': string;           // 2.25rem (36px)
  };

  weights: {
    normal: number;          // 400
    medium: number;          // 500
    semibold: number;        // 600
    bold: number;            // 700
  };

  lineHeights: {
    tight: number;           // 1.25
    normal: number;          // 1.5
    relaxed: number;         // 1.75
  };
}
```

### Spacing Scale

```typescript
interface SpacingScale {
  xs: string;                // Extra small
  sm: string;                // Small
  md: string;                // Medium (base)
  lg: string;                // Large
  xl: string;                // Extra large
  '2xl': string;             // 2x large
  '3xl': string;             // 3x large
  '4xl': string;             // 4x large
}

// Presets available:
// - compact: Tight spacing for dense layouts
// - comfortable: Balanced spacing (default)
// - spacious: Generous spacing for relaxed layouts
```

## Predefined Themes

### 1. WPP Default
Professional theme with WPP brand colors.
- Primary: #0066CC (blue)
- Chart: Blue-green spectrum
- Best for: Corporate dashboards

### 2. Dark Mode
Modern dark theme for reduced eye strain.
- Primary: #3B82F6 (lighter blue)
- Background: #0F172A (navy)
- Best for: Extended viewing sessions

### 3. Ocean Breeze
Calming blue-cyan palette.
- Primary: #0891B2 (cyan)
- Chart: Oceanic blues
- Best for: Analytics dashboards

### 4. Forest Green
Natural green palette.
- Primary: #059669 (green)
- Chart: Green spectrum
- Best for: Sustainability reports

### 5. Sunset Orange
Warm orange palette.
- Primary: #EA580C (orange)
- Chart: Warm spectrum
- Best for: Energy/engagement metrics

### 6. Purple Haze
Modern purple palette.
- Primary: #7C3AED (purple)
- Chart: Purple-pink spectrum
- Best for: Creative/design dashboards

## CSS Custom Properties

After applying a theme, these CSS variables are available:

### Colors
```css
--color-primary
--color-primary-hover
--color-primary-active
--color-secondary
--color-secondary-hover
--color-accent
--color-background
--color-surface
--color-surface-hover
--color-border
--color-text
--color-text-secondary
--color-text-muted
--color-success
--color-warning
--color-error
--color-info
```

### Typography
```css
--font-family
--font-family-heading
```

### Spacing
```css
--spacing-xs
--spacing-sm
--spacing-md
--spacing-lg
--spacing-xl
```

### Border Radius
```css
--radius-sm
--radius-md
--radius-lg
--radius-xl
```

### Shadows
```css
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

## Usage Examples

### Example 1: Theme Switcher Dropdown

```tsx
import { ThemeManager } from './lib/themes';

export const ThemeSwitcher = () => {
  const [themes] = useState(ThemeManager.getAllThemes());
  const [active, setActive] = useState(ThemeManager.getActiveTheme());

  const handleChange = (themeId: string) => {
    const theme = ThemeManager.getTheme(themeId);
    if (theme) {
      ThemeManager.setActiveTheme(themeId);
      ThemeManager.applyThemeToDom(theme);
      setActive(theme);
    }
  };

  return (
    <select value={active.id} onChange={(e) => handleChange(e.target.value)}>
      {themes.map(theme => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  );
};
```

### Example 2: Create Custom Theme Programmatically

```tsx
import { Theme, ThemeManager, COLOR_PALETTES } from './lib/themes';

const createBrandTheme = () => {
  const theme: Theme = {
    id: ThemeManager.generateThemeId(),
    name: 'Nike Brand Theme',
    description: 'Nike brand guidelines',
    colors: {
      ...COLOR_PALETTES['wpp-default'],
      primary: '#111111',      // Nike black
      accent: '#FF6B35',       // Nike orange
      chart: ['#111111', '#FF6B35', '#4ECDC4', '#FFE66D', ...],
    },
    typography: {
      fontFamily: '"Futura", sans-serif',
      headingFamily: '"Futura", sans-serif',
      sizes: { /* ... */ },
      weights: { /* ... */ },
      lineHeights: { /* ... */ },
    },
    spacing: SPACING_PRESETS.comfortable,
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: { /* ... */ },
  };

  ThemeManager.saveTheme(theme);
  ThemeManager.setActiveTheme(theme.id);
};
```

### Example 3: Export/Import Themes

```tsx
// Export
const exportTheme = () => {
  const theme = ThemeManager.getActiveTheme();
  const json = ThemeManager.exportTheme(theme);

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.name}-theme.json`;
  a.click();
};

// Import
const importTheme = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const json = e.target?.result as string;
    const theme = ThemeManager.importTheme(json);
    ThemeManager.saveTheme(theme);
    ThemeManager.setActiveTheme(theme.id);
  };
  reader.readAsText(file);
};
```

### Example 4: Themed Chart Component

```tsx
import { ThemeManager } from './lib/themes';

const ThemedBarChart = ({ data }) => {
  const theme = ThemeManager.getActiveTheme();

  return (
    <BarChart
      data={data}
      colors={theme.colors.chart}
      style={{
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
      }}
    />
  );
};
```

### Example 5: Dark Mode Toggle

```tsx
const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    const themeId = isDark ? 'wpp-default' : 'dark-mode';
    const theme = ThemeManager.getTheme(themeId);

    if (theme) {
      ThemeManager.setActiveTheme(themeId);
      ThemeManager.applyThemeToDom(theme);
      setIsDark(!isDark);
    }
  };

  return (
    <button onClick={toggleDarkMode}>
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
};
```

## Advanced Usage

### Multi-Tenant Themes

Store different themes per client/tenant:

```typescript
interface TenantThemes {
  [tenantId: string]: string; // Maps tenant to theme ID
}

const TENANT_THEMES_KEY = 'wpp-tenant-themes';

const setTenantTheme = (tenantId: string, themeId: string) => {
  const tenantThemes: TenantThemes = JSON.parse(
    localStorage.getItem(TENANT_THEMES_KEY) || '{}'
  );
  tenantThemes[tenantId] = themeId;
  localStorage.setItem(TENANT_THEMES_KEY, JSON.stringify(tenantThemes));
};

const getTenantTheme = (tenantId: string): Theme => {
  const tenantThemes: TenantThemes = JSON.parse(
    localStorage.getItem(TENANT_THEMES_KEY) || '{}'
  );
  const themeId = tenantThemes[tenantId];
  return ThemeManager.getTheme(themeId) || ThemeManager.getActiveTheme();
};
```

### Theme Versioning

Track theme versions for migration:

```typescript
interface VersionedTheme extends Theme {
  version: string; // semver: '1.0.0'
}

const migrateTheme = (theme: any): Theme => {
  if (!theme.version || theme.version < '2.0.0') {
    // Migrate old theme structure
    return {
      ...theme,
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      version: '2.0.0',
    };
  }
  return theme;
};
```

### Real-Time Theme Sync

Sync theme changes across tabs:

```typescript
window.addEventListener('storage', (e) => {
  if (e.key === 'wpp-active-theme' && e.newValue) {
    const theme = ThemeManager.getTheme(e.newValue);
    if (theme) {
      ThemeManager.applyThemeToDom(theme);
    }
  }
});
```

## Best Practices

### 1. Apply Theme on Mount
Always apply the saved theme when your app loads:

```tsx
useEffect(() => {
  ThemeManager.applyThemeToDom(ThemeManager.getActiveTheme());
}, []);
```

### 2. Use CSS Variables
Prefer CSS variables over inline theme values:

```tsx
// Good
<div style={{ color: 'var(--color-primary)' }} />

// Avoid
<div style={{ color: theme.colors.primary }} />
```

### 3. Validate Imported Themes
Always validate theme structure when importing:

```typescript
const validateTheme = (theme: any): boolean => {
  return !!(
    theme.id &&
    theme.name &&
    theme.colors &&
    theme.typography &&
    theme.spacing
  );
};
```

### 4. Provide Fallbacks
Ensure fallbacks for missing themes:

```typescript
const theme = ThemeManager.getTheme(themeId) ||
              ThemeManager.getActiveTheme() ||
              DEFAULT_THEMES['wpp-default'];
```

### 5. Semantic Color Usage
Use semantic color names in components:

```tsx
// Good - semantic meaning
<Alert style={{ color: 'var(--color-error)' }} />

// Avoid - specific color reference
<Alert style={{ color: '#EF4444' }} />
```

## Troubleshooting

### Theme Not Applying
Ensure `applyThemeToDom` is called:

```typescript
const theme = ThemeManager.getActiveTheme();
ThemeManager.applyThemeToDom(theme); // Required!
```

### LocalStorage Full
Handle quota exceeded errors:

```typescript
try {
  ThemeManager.saveTheme(theme);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Clear old themes or notify user
    alert('Storage full. Please delete some custom themes.');
  }
}
```

### CSS Variables Not Working
Check browser support (IE11 not supported):

```javascript
if (!CSS.supports('color', 'var(--test)')) {
  console.warn('CSS custom properties not supported');
  // Fallback to inline styles
}
```

## Performance Considerations

- **Theme switching**: < 50ms (only CSS variable updates)
- **Storage size**: ~5KB per theme (LocalStorage limit: 5MB)
- **Max custom themes**: ~1000 themes (storage permitting)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (11.1+)
- IE11: Not supported (CSS custom properties)

## Future Enhancements

Potential additions for v2.0:

1. **Animation Presets**: Transition speeds, easing functions
2. **Icon Packs**: Different icon styles per theme
3. **Theme Templates**: Industry-specific starting points
4. **Accessibility Mode**: High contrast, larger text
5. **Server-Side Storage**: Sync themes across devices
6. **Theme Marketplace**: Share/download community themes
7. **Smart Contrast**: Auto-adjust text colors for accessibility
8. **Gradient Support**: Linear/radial gradient definitions

## Contributing

To add a new predefined theme:

1. Add palette to `COLOR_PALETTES` in `themes.ts`
2. Create theme object in `DEFAULT_THEMES`
3. Test all color combinations for accessibility
4. Document in this README

## License

Part of WPP Analytics Platform - Internal use only.

## Support

For issues or questions:
- GitHub Issues: [wpp-analytics-platform/issues]
- Internal Slack: #wpp-frontend-dev
- Documentation: This file
