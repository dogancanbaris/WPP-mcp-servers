/**
 * Global Dashboard Theme Configuration
 *
 * Centralized styling for all dashboard components.
 * Ensures consistent, professional appearance across all dashboards.
 */

export const DASHBOARD_THEME = {
  // Header Section
  header: {
    backgroundColor: '#ffffff', // WHITE background
    textColor: '#191D63', // WPP Blue text
    fontSize: '34px', // Large and prominent
    fontWeight: '800', // Extra bold
    height: 'auto',
    minHeight: '60px',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center' as const, // Centered
    lineHeight: '1.2' // Tight line height
  },

  // Date Indicator
  dateIndicator: {
    backgroundColor: '#ffffff',
    textColor: '#191D63',
    fontSize: '15px', // Slightly smaller
    fontWeight: '600',
    textAlign: 'right' as const,
    padding: '12px', // Reduced from 16px
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },

  // Description/Executive Summary
  description: {
    backgroundColor: '#f8f9fa',
    textColor: '#5f6368',
    fontSize: '13px',
    fontWeight: '400',
    lineHeight: '1.5', // Tighter line height
    padding: '14px', // Reduced from 20px
    borderRadius: '8px',
    height: 'auto', // Auto-adjust based on content
    maxHeight: '200px'
  },

  // Scorecard KPIs
  scorecard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: '1px',
    borderRadius: '8px',
    padding: '14px', // Slightly more padding for readability
    height: 'auto',
    minHeight: '90px', // Larger for better readability
    maxHeight: '115px', // Increased
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',

    // Title styling
    titleFontSize: '12px', // Slightly larger
    titleFontWeight: '500',
    titleColor: '#666666',
    titleMarginBottom: '8px', // Bit more space

    // Value styling
    valueFontSize: '36px', // Larger for prominence
    valueFontWeight: '700',
    valueLineHeight: '1.0',

    // Feature flags
    showCacheInfo: false, // Don't show "Cached {time}"
    showTrend: false, // Will add later for % change

    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },

  // Charts
  charts: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: '1px',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',

    // Time Series specific
    timeSeries: {
      height: '400px',
      backgroundColor: '#ffffff', // NOT black!
      dualAxis: true, // Enable for different scales (clicks vs impressions)
      gridColor: '#f0f0f0',
      axisColor: '#666666',
      legendPosition: 'bottom' as const
    },

    // Table specific
    table: {
      height: 'auto',
      maxHeight: '380px',
      headerBg: '#f9fafb',
      evenRowBg: '#ffffff',
      oddRowBg: '#f9fafb'
    },

    // Pie specific
    pie: {
      height: '320px',
      radius: '60%',
      labelFontSize: '11px'
    }
  },

  // Row Configuration
  rows: {
    gap: '16px', // Space between rows
    autoHeight: true, // All rows auto-adjust
    defaultPadding: '0'
  },

  // Global Settings
  global: {
    opacity: 1.0, // 100% opacity, no translucency
    backdropFilter: 'none',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    backgroundColor: '#ffffff',
    textColor: '#111827'
  },

  // WPP Brand Colors
  colors: {
    wppBlue: '#191D63',
    wppGreen: '#1E8E3E',
    wppYellow: '#fac858',
    wppRed: '#ee6666',
    wppCyan: '#73c0de',
    wppPurple: '#9a60b4'
  }
};

/**
 * Get component-specific theme
 */
export function getComponentTheme(componentType: string): any {
  switch (componentType) {
    case 'scorecard':
      return DASHBOARD_THEME.scorecard;
    case 'time_series':
      return DASHBOARD_THEME.charts.timeSeries;
    case 'table':
      return DASHBOARD_THEME.charts.table;
    case 'pie_chart':
      return DASHBOARD_THEME.charts.pie;
    case 'title':
      return componentType === 'header' ? DASHBOARD_THEME.header : DASHBOARD_THEME.description;
    default:
      return DASHBOARD_THEME.charts;
  }
}
