/**
 * Style Cascade Utilities
 *
 * Implements a 3-level style hierarchy similar to CSS:
 * Global Theme → Page Styles → Component Styles
 *
 * Each level can override specific properties from parent levels,
 * creating a natural cascade where styles inherit and override.
 *
 * @example Basic cascade
 * ```typescript
 * const globalTheme = { backgroundColor: '#FFFFFF' };
 * const pageStyles = { backgroundColor: '#F5F5F5' }; // Override for page
 * const componentConfig = { backgroundColor: '#E0E0E0' }; // Override for component
 *
 * const merged = getMergedStyles(globalTheme, pageStyles, componentConfig);
 * // Result: { backgroundColor: '#E0E0E0' } - component wins
 * ```
 *
 * @example Partial overrides
 * ```typescript
 * const globalTheme = { backgroundColor: '#FFFFFF', textColor: '#000000' };
 * const pageStyles = { backgroundColor: '#F5F5F5' }; // Only override background
 *
 * const merged = getMergedStyles(globalTheme, pageStyles);
 * // Result: { backgroundColor: '#F5F5F5', textColor: '#000000' }
 * // textColor inherited from global, backgroundColor overridden by page
 * ```
 */

import type { ComponentConfig, DashboardLayout } from '@/types/dashboard-builder';

/**
 * Global theme configuration (dashboard-level)
 */
export interface DashboardTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

/**
 * Page-level style overrides
 * Inherits from global theme but can override specific properties
 */
export interface PageStyles {
  backgroundColor?: string;
  padding?: number;
  gap?: number;
  textColor?: string;
  borderColor?: string;
}

/**
 * Merged style result after applying all cascade levels
 * Contains the final computed styles for a component
 */
export interface MergedStyles {
  backgroundColor?: string;
  padding?: number;
  gap?: number;
  textColor?: string;
  borderColor?: string;
  primaryColor?: string;
}

/**
 * Merges styles from 3 levels (global theme → page styles → component styles)
 *
 * Uses CSS-like cascade: each level inherits from parent and can override specific properties.
 * Later levels take precedence over earlier ones for the same property.
 *
 * @param globalTheme - Dashboard-level theme (base styles)
 * @param pageStyles - Page-level style overrides
 * @param componentConfig - Component configuration with inline styles
 * @returns Merged style object for this specific component
 *
 * @example Component override
 * ```typescript
 * const theme = { backgroundColor: '#FFF', textColor: '#000' };
 * const page = { backgroundColor: '#F5F5F5' };
 * const component = { backgroundColor: '#E0E0E0', padding: 16 };
 *
 * getMergedStyles(theme, page, component);
 * // Returns: {
 * //   backgroundColor: '#E0E0E0',  // from component
 * //   textColor: '#000',            // from theme
 * //   padding: 16                   // from component
 * // }
 * ```
 *
 * @example Inheritance chain
 * ```typescript
 * const theme = { backgroundColor: '#FFF', textColor: '#000', primaryColor: '#0066FF' };
 * const page = { padding: 24, gap: 16 }; // No overrides, just additions
 *
 * getMergedStyles(theme, page);
 * // Returns: {
 * //   backgroundColor: '#FFF',  // inherited from theme
 * //   textColor: '#000',        // inherited from theme
 * //   primaryColor: '#0066FF',  // inherited from theme
 * //   padding: 24,              // from page
 * //   gap: 16                   // from page
 * // }
 * ```
 */
export function getMergedStyles(
  globalTheme?: DashboardTheme,
  pageStyles?: PageStyles,
  componentConfig?: ComponentConfig
): MergedStyles {
  // Level 1: Start with global theme defaults
  const base: MergedStyles = {
    backgroundColor: globalTheme?.backgroundColor,
    textColor: globalTheme?.textColor,
    borderColor: globalTheme?.borderColor,
    primaryColor: globalTheme?.primaryColor,
  };

  // Level 2: Apply page styles (override specific properties)
  const withPageStyles: MergedStyles = {
    ...base,
    ...pageStyles, // Spread operator handles property override
  };

  // Level 3: Apply component styles (override specific properties)
  // Component styles are stored in various properties of ComponentConfig
  const final: MergedStyles = {
    ...withPageStyles,
    // Extract style properties from componentConfig
    ...(componentConfig?.backgroundColor && { backgroundColor: componentConfig.backgroundColor }),
    ...(componentConfig?.padding !== undefined && { padding: componentConfig.padding }),
    ...(componentConfig?.color && { textColor: componentConfig.color }),
    ...(componentConfig?.borderColor && { borderColor: componentConfig.borderColor }),
  };

  return final;
}

/**
 * Converts merged styles to CSS variable object for React inline styles
 *
 * Transforms style properties into CSS custom properties (variables) that can be
 * used in React's style prop or CSS stylesheets.
 *
 * @param styles - Merged style object
 * @returns Object compatible with React style prop
 *
 * @example Basic usage
 * ```typescript
 * const styles = { backgroundColor: '#F5F5F5', padding: 16, gap: 8 };
 * const cssVars = toCSSVariables(styles);
 *
 * // Use in React component:
 * <div style={cssVars}>...</div>
 * // Renders: <div style="--page-bg: #F5F5F5; --page-padding: 16px; --page-gap: 8px">
 * ```
 *
 * @example With inherited styles
 * ```typescript
 * const styles = { textColor: '#000000' };
 * const cssVars = toCSSVariables(styles);
 *
 * // Missing properties default to 'inherit':
 * // { '--page-bg': 'inherit', '--page-text-color': '#000000', ... }
 * ```
 */
export function toCSSVariables(styles: MergedStyles): Record<string, string | number> {
  return {
    '--page-bg': styles.backgroundColor || 'inherit',
    '--page-padding': styles.padding ? `${styles.padding}px` : 'inherit',
    '--page-gap': styles.gap ? `${styles.gap}px` : 'inherit',
    '--page-text-color': styles.textColor || 'inherit',
    '--page-border-color': styles.borderColor || 'inherit',
    '--page-primary-color': styles.primaryColor || 'inherit',
  };
}

/**
 * Determines where a specific style property is coming from (for UI indicators)
 *
 * Useful for displaying badges or indicators in the UI to show users where
 * a style is defined (e.g., "Inherited from theme" or "Page override").
 *
 * @param propertyName - Style property to check (e.g., 'backgroundColor')
 * @param globalTheme - Global theme object
 * @param pageStyles - Page styles object
 * @param componentConfig - Component configuration object
 * @returns 'global' | 'page' | 'component' | 'none'
 *
 * @example Component override detection
 * ```typescript
 * const theme = { backgroundColor: '#FFF' };
 * const page = { backgroundColor: '#F5F5F5' };
 * const component = { backgroundColor: '#E0E0E0' };
 *
 * getStyleSource('backgroundColor', theme, page, component);
 * // Returns: 'component' (component has the final override)
 * ```
 *
 * @example Page override detection
 * ```typescript
 * const theme = { backgroundColor: '#FFF' };
 * const page = { backgroundColor: '#F5F5F5' };
 *
 * getStyleSource('backgroundColor', theme, page);
 * // Returns: 'page' (page overrides, no component override)
 * ```
 *
 * @example Global inheritance
 * ```typescript
 * const theme = { backgroundColor: '#FFF' };
 *
 * getStyleSource('backgroundColor', theme);
 * // Returns: 'global' (only defined in theme)
 * ```
 */
export function getStyleSource(
  propertyName: keyof MergedStyles,
  globalTheme?: DashboardTheme,
  pageStyles?: PageStyles,
  componentConfig?: ComponentConfig
): 'global' | 'page' | 'component' | 'none' {
  // Map MergedStyles property names to ComponentConfig property names
  const componentPropertyMap: Record<string, string> = {
    backgroundColor: 'backgroundColor',
    padding: 'padding',
    textColor: 'color',
    borderColor: 'borderColor',
  };

  const componentProp = componentPropertyMap[propertyName];

  // Check component first (highest specificity)
  if (componentConfig && componentProp && componentConfig[componentProp as keyof ComponentConfig] !== undefined) {
    return 'component';
  }

  // Check page (medium specificity)
  if (pageStyles && propertyName in pageStyles && pageStyles[propertyName] !== undefined) {
    return 'page';
  }

  // Check global (lowest specificity)
  if (globalTheme && propertyName in globalTheme && globalTheme[propertyName] !== undefined) {
    return 'global';
  }

  return 'none';
}

/**
 * Extracts global theme from dashboard layout
 *
 * Helper function to get the theme configuration from a DashboardLayout object.
 *
 * @param layout - Dashboard layout configuration
 * @returns Dashboard theme object or undefined
 *
 * @example
 * ```typescript
 * const layout: DashboardLayout = {
 *   theme: {
 *     primaryColor: '#0066FF',
 *     backgroundColor: '#FFFFFF',
 *     textColor: '#000000',
 *     borderColor: '#E0E0E0'
 *   },
 *   // ... other layout props
 * };
 *
 * const theme = extractGlobalTheme(layout);
 * // Returns: { primaryColor: '#0066FF', ... }
 * ```
 */
export function extractGlobalTheme(layout?: DashboardLayout): DashboardTheme | undefined {
  return layout?.theme;
}

/**
 * Extracts page styles from dashboard layout's globalStyles
 *
 * Helper function to get page-level styles from a DashboardLayout object.
 * Note: Currently uses globalStyles as page styles for backward compatibility.
 *
 * @param layout - Dashboard layout configuration
 * @returns Page styles object or undefined
 *
 * @example
 * ```typescript
 * const layout: DashboardLayout = {
 *   globalStyles: {
 *     backgroundColor: '#F5F5F5',
 *     padding: 24,
 *     gap: 16
 *   },
 *   // ... other layout props
 * };
 *
 * const pageStyles = extractPageStyles(layout);
 * // Returns: { backgroundColor: '#F5F5F5', padding: 24, gap: 16 }
 * ```
 */
export function extractPageStyles(layout?: DashboardLayout): PageStyles | undefined {
  return layout?.globalStyles;
}

/**
 * Complete style cascade helper that extracts and merges all levels
 *
 * Convenience function that combines extraction and merging in one call.
 *
 * @param layout - Dashboard layout configuration
 * @param componentConfig - Component configuration
 * @returns Merged styles for the component
 *
 * @example
 * ```typescript
 * const layout: DashboardLayout = {
 *   theme: { backgroundColor: '#FFF', primaryColor: '#0066FF' },
 *   globalStyles: { padding: 24 },
 *   // ... rows, etc.
 * };
 *
 * const component: ComponentConfig = {
 *   id: 'comp-1',
 *   type: 'scorecard',
 *   backgroundColor: '#F5F5F5'
 * };
 *
 * const finalStyles = applyCascade(layout, component);
 * // Returns: {
 * //   backgroundColor: '#F5F5F5',  // from component
 * //   primaryColor: '#0066FF',     // from theme
 * //   padding: 24                  // from globalStyles
 * // }
 * ```
 */
export function applyCascade(
  layout?: DashboardLayout,
  componentConfig?: ComponentConfig
): MergedStyles {
  const theme = extractGlobalTheme(layout);
  const pageStyles = extractPageStyles(layout);

  return getMergedStyles(theme, pageStyles, componentConfig);
}
