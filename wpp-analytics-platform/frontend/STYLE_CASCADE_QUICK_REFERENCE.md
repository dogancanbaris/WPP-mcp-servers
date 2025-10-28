# Style Cascade - Quick Reference

## Import
```typescript
import {
  getMergedStyles,
  toCSSVariables,
  getStyleSource,
  applyCascade,
  type DashboardTheme,
  type PageStyles,
  type MergedStyles,
} from '@/lib/utils/style-cascade';
```

## Basic Usage

### 1. Manual 3-Level Merge
```typescript
const theme: DashboardTheme = {
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
};

const pageStyles: PageStyles = {
  backgroundColor: '#F5F5F5',
  padding: 24,
};

const component: ComponentConfig = {
  id: 'comp-1',
  type: 'scorecard',
  padding: 16,
};

// Merge all levels
const merged = getMergedStyles(theme, pageStyles, component);
// Result: { backgroundColor: '#F5F5F5', textColor: '#000000', padding: 16 }
```

### 2. Quick Cascade (Recommended)
```typescript
// Automatically extracts theme + page styles from layout
const styles = applyCascade(dashboardLayout, componentConfig);
const cssVars = toCSSVariables(styles);

<div style={cssVars}>...</div>
```

## Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getMergedStyles(theme, page, component)` | Merge 3 levels | `MergedStyles` |
| `toCSSVariables(styles)` | Convert to CSS vars | `Record<string, string\|number>` |
| `getStyleSource(prop, theme, page, comp)` | Find style source | `'global'\|'page'\|'component'\|'none'` |
| `extractGlobalTheme(layout)` | Get theme from layout | `DashboardTheme?` |
| `extractPageStyles(layout)` | Get page styles from layout | `PageStyles?` |
| `applyCascade(layout, component)` | Complete cascade | `MergedStyles` |

## Types

### DashboardTheme (Global Level)
```typescript
interface DashboardTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}
```

### PageStyles (Page Level)
```typescript
interface PageStyles {
  backgroundColor?: string;
  padding?: number;
  gap?: number;
  textColor?: string;
  borderColor?: string;
}
```

### MergedStyles (Final Result)
```typescript
interface MergedStyles {
  backgroundColor?: string;
  padding?: number;
  gap?: number;
  textColor?: string;
  borderColor?: string;
  primaryColor?: string;
}
```

## Cascade Priority

**Component > Page > Global** (same as CSS specificity)

```
Global:    backgroundColor: '#FFFFFF'
  ↓ Page overrides
Page:      backgroundColor: '#F5F5F5'
  ↓ Component overrides
Component: backgroundColor: '#E0E0E0'

Winner: '#E0E0E0' (component wins)
```

## CSS Variables Output

```typescript
toCSSVariables({ backgroundColor: '#F5F5F5', padding: 16 })
// Returns:
{
  '--page-bg': '#F5F5F5',
  '--page-padding': '16px',
  '--page-gap': 'inherit',
  '--page-text-color': 'inherit',
  '--page-border-color': 'inherit',
  '--page-primary-color': 'inherit'
}
```

## Style Source Detection

```typescript
const source = getStyleSource('backgroundColor', theme, pageStyles, component);

switch(source) {
  case 'global': return 'From Theme';
  case 'page': return 'Page Override';
  case 'component': return 'Component Override';
  case 'none': return 'Not Set';
}
```

## Common Patterns

### Pattern: Apply cascade to component
```typescript
function DashboardComponent({ layout, config }) {
  const styles = applyCascade(layout, config);
  const cssVars = toCSSVariables(styles);

  return <div style={cssVars}>...</div>;
}
```

### Pattern: Show style source badge
```typescript
function StyleBadge({ propertyName }) {
  const source = getStyleSource(propertyName, theme, page, component);

  return <span className={`badge-${source}`}>{source}</span>;
}
```

### Pattern: Partial override
```typescript
// Only override what changes, inherit the rest
const theme = { bg: '#FFF', text: '#000', primary: '#00F' };
const page = { bg: '#F5F5F5' };  // Only override bg

const merged = getMergedStyles(theme, page);
// Result: { bg: '#F5F5F5', text: '#000', primary: '#00F' }
```

## File Locations

| File | Path |
|------|------|
| Main utilities | `src/lib/utils/style-cascade.ts` |
| Tests | `src/lib/utils/__tests__/style-cascade.test.ts` |
| Examples | `src/lib/utils/style-cascade.example.tsx` |
| Full docs | `STYLE_CASCADE_IMPLEMENTATION.md` |

## Examples

See `src/lib/utils/style-cascade.example.tsx` for 6 comprehensive examples:
1. Basic Cascade
2. applyCascade Helper
3. Style Source Indicators
4. Partial Overrides
5. Real-World Component
6. Dynamic Override

## Testing

```bash
npm test -- style-cascade.test.ts
```

## Integration Checklist

- [ ] Import utilities in dashboard components
- [ ] Update dashboard store to use cascade
- [ ] Add style source indicators in UI
- [ ] Apply CSS variables in component styles
- [ ] Test cascade behavior with different configs
- [ ] Document usage in component README

---

**Quick Start**: Use `applyCascade(layout, component)` for most cases. It handles everything automatically.
