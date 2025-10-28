/**
 * Style Cascade Usage Examples
 *
 * This file demonstrates how to use the style cascade utilities in React components.
 */

import React from 'react';
import {
  getMergedStyles,
  toCSSVariables,
  getStyleSource,
  applyCascade,
  type DashboardTheme,
  type PageStyles,
} from './style-cascade';
import type { ComponentConfig, DashboardLayout } from '@/types/dashboard-builder';

// ============================================================================
// Example 1: Basic Cascade with Manual Merging
// ============================================================================

export function Example1_BasicCascade() {
  // Level 1: Global theme
  const globalTheme: DashboardTheme = {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    primaryColor: '#0066FF',
  };

  // Level 2: Page styles (override background)
  const pageStyles: PageStyles = {
    backgroundColor: '#F5F5F5',
    padding: 24,
    gap: 16,
  };

  // Level 3: Component config (override background again)
  const componentConfig: ComponentConfig = {
    id: 'scorecard-1',
    type: 'scorecard',
    backgroundColor: '#E0E0E0',
    padding: 16,
  };

  // Merge all levels
  const mergedStyles = getMergedStyles(globalTheme, pageStyles, componentConfig);

  // Convert to CSS variables for React
  const cssVars = toCSSVariables(mergedStyles);

  return (
    <div style={cssVars}>
      <h3>Basic Cascade Example</h3>
      <pre>{JSON.stringify(mergedStyles, null, 2)}</pre>
      {/* Result:
        {
          "backgroundColor": "#E0E0E0",  // Component wins
          "textColor": "#000000",        // Inherited from theme
          "primaryColor": "#0066FF",     // Inherited from theme
          "padding": 16,                 // Component wins
          "gap": 16                      // Inherited from page
        }
      */}
    </div>
  );
}

// ============================================================================
// Example 2: Using applyCascade Helper
// ============================================================================

export function Example2_ApplyCascadeHelper() {
  // Dashboard layout with theme and global styles
  const layout: DashboardLayout = {
    id: 'dashboard-1',
    name: 'Sales Dashboard',
    theme: {
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A1A',
      primaryColor: '#0066FF',
      borderColor: '#E0E0E0',
    },
    globalStyles: {
      padding: 32,
      gap: 24,
    },
    rows: [], // Rows would be here
  };

  // Component with specific overrides
  const component: ComponentConfig = {
    id: 'revenue-card',
    type: 'scorecard',
    title: 'Total Revenue',
    backgroundColor: '#F0F8FF', // Light blue background
    padding: 20,
  };

  // Apply full cascade in one call
  const styles = applyCascade(layout, component);
  const cssVars = toCSSVariables(styles);

  return (
    <div style={cssVars} className="revenue-component">
      <h3>{component.title}</h3>
      <div>Styles applied from 3 levels</div>
    </div>
  );
}

// ============================================================================
// Example 3: Style Source Indicators
// ============================================================================

export function Example3_StyleSourceIndicators() {
  const globalTheme: DashboardTheme = {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  };

  const pageStyles: PageStyles = {
    padding: 24,
    gap: 16,
  };

  const component: ComponentConfig = {
    id: 'chart-1',
    type: 'bar_chart',
    backgroundColor: '#F5F5F5',
  };

  // Check where each style comes from
  const bgSource = getStyleSource('backgroundColor', globalTheme, pageStyles, component);
  const paddingSource = getStyleSource('padding', globalTheme, pageStyles, component);
  const textColorSource = getStyleSource('textColor', globalTheme, pageStyles, component);
  const gapSource = getStyleSource('gap', globalTheme, pageStyles, component);

  return (
    <div>
      <h3>Style Source Indicators</h3>
      <ul>
        <li>
          backgroundColor: <Badge source={bgSource} /> ({bgSource})
        </li>
        <li>
          padding: <Badge source={paddingSource} /> ({paddingSource})
        </li>
        <li>
          textColor: <Badge source={textColorSource} /> ({textColorSource})
        </li>
        <li>
          gap: <Badge source={gapSource} /> ({gapSource})
        </li>
      </ul>
    </div>
  );
}

// Helper component for displaying style source
function Badge({ source }: { source: 'global' | 'page' | 'component' | 'none' }) {
  const colors = {
    global: '#90EE90',
    page: '#87CEEB',
    component: '#FFB6C1',
    none: '#D3D3D3',
  };

  const labels = {
    global: 'Global Theme',
    page: 'Page Override',
    component: 'Component Override',
    none: 'Not Set',
  };

  return (
    <span
      style={{
        backgroundColor: colors[source],
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      {labels[source]}
    </span>
  );
}

// ============================================================================
// Example 4: Partial Overrides (CSS-like Inheritance)
// ============================================================================

export function Example4_PartialOverrides() {
  // Global theme defines all base colors
  const theme: DashboardTheme = {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#0066FF',
    borderColor: '#E0E0E0',
  };

  // Page only overrides background, inherits rest
  const pageStyles: PageStyles = {
    backgroundColor: '#F9FAFB', // Light gray page background
  };

  // Component overrides nothing, inherits everything
  const component: ComponentConfig = {
    id: 'inherited-component',
    type: 'table',
    title: 'Sales Data',
  };

  const styles = getMergedStyles(theme, pageStyles, component);

  return (
    <div>
      <h3>Partial Overrides Example</h3>
      <p>Page only overrides background, inherits all other colors from theme</p>
      <pre>{JSON.stringify(styles, null, 2)}</pre>
      {/* Result:
        {
          "backgroundColor": "#F9FAFB",  // Overridden by page
          "textColor": "#1A1A1A",       // Inherited from theme
          "primaryColor": "#0066FF",    // Inherited from theme
          "borderColor": "#E0E0E0"      // Inherited from theme
        }
      */}
    </div>
  );
}

// ============================================================================
// Example 5: Real-World Dashboard Component
// ============================================================================

interface DashboardComponentProps {
  layout: DashboardLayout;
  component: ComponentConfig;
  children: React.ReactNode;
}

export function Example5_RealWorldComponent({
  layout,
  component,
  children,
}: DashboardComponentProps) {
  // Apply full cascade
  const styles = applyCascade(layout, component);
  const cssVars = toCSSVariables(styles);

  // Get style source for debugging/UI indicators
  const theme = layout.theme;
  const pageStyles = layout.globalStyles;

  const bgSource = getStyleSource('backgroundColor', theme, pageStyles, component);

  return (
    <div
      className="dashboard-component"
      style={{
        ...cssVars,
        // Use CSS variables in styles
        backgroundColor: 'var(--page-bg)',
        padding: 'var(--page-padding)',
        gap: 'var(--page-gap)',
        color: 'var(--page-text-color)',
        borderColor: 'var(--page-border-color)',
      }}
      data-style-source={bgSource}
    >
      {/* Optional: Show style source badge in dev mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-badge">
          <Badge source={bgSource} />
        </div>
      )}

      {children}
    </div>
  );
}

// ============================================================================
// Example 6: Dynamic Style Override with Controls
// ============================================================================

export function Example6_DynamicOverride() {
  const [overrideLevel, setOverrideLevel] = React.useState<'global' | 'page' | 'component'>(
    'global'
  );

  const theme: DashboardTheme = {
    backgroundColor: '#FFFFFF',
  };

  const pageStyles: PageStyles = {
    backgroundColor: overrideLevel === 'page' ? '#F5F5F5' : undefined,
  };

  const component: ComponentConfig = {
    id: 'dynamic-1',
    type: 'scorecard',
    backgroundColor: overrideLevel === 'component' ? '#E0E0E0' : undefined,
  };

  const styles = getMergedStyles(theme, pageStyles, component);
  const cssVars = toCSSVariables(styles);

  return (
    <div>
      <h3>Dynamic Style Override</h3>

      <div>
        <button onClick={() => setOverrideLevel('global')}>Global</button>
        <button onClick={() => setOverrideLevel('page')}>Page Override</button>
        <button onClick={() => setOverrideLevel('component')}>Component Override</button>
      </div>

      <div style={cssVars}>
        <p>Current background: {styles.backgroundColor}</p>
        <p>Override level: {overrideLevel}</p>
      </div>
    </div>
  );
}
