/**
 * Type definitions for SankeyChart component
 * Provides comprehensive type safety for Sankey diagram configurations
 */

import { Query } from '@cubejs-client/core';

/**
 * Sankey node configuration
 */
export interface SankeyNode {
  /** Unique node identifier (auto-generated with level suffix) */
  name: string;

  /** Node styling */
  itemStyle?: {
    /** Node fill color */
    color?: string;
    /** Node border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Shadow blur radius */
    shadowBlur?: number;
    /** Shadow color */
    shadowColor?: string;
  };

  /** Label configuration */
  label?: {
    /** Font size */
    fontSize?: number;
    /** Font weight */
    fontWeight?: string | number;
    /** Label color */
    color?: string;
    /** Label position */
    position?: 'left' | 'right' | 'top' | 'bottom' | 'inside';
  };

  /** Node depth (level) in the flow */
  depth?: number;

  /** Total value flowing through this node */
  value?: number;
}

/**
 * Sankey link (edge) configuration
 */
export interface SankeyLink {
  /** Source node name */
  source: string;

  /** Target node name */
  target: string;

  /** Flow value */
  value: number;

  /** Link styling */
  lineStyle?: {
    /** Link color */
    color?: string | 'source' | 'target' | 'gradient';
    /** Link opacity */
    opacity?: number;
    /** Curveness (0-1) */
    curveness?: number;
  };

  /** Link label configuration */
  label?: {
    /** Show label */
    show?: boolean;
    /** Label formatter */
    formatter?: string | ((params: any) => string);
  };
}

/**
 * Sankey data structure
 */
export interface SankeyData {
  /** Array of nodes */
  nodes: SankeyNode[];

  /** Array of links between nodes */
  links: SankeyLink[];
}

/**
 * Value formatter function type
 */
export type ValueFormatter = (value: number) => string;

/**
 * Node click handler type
 */
export type NodeClickHandler = (nodeName: string, level: number) => void;

/**
 * Link click handler type
 */
export type LinkClickHandler = (source: string, target: string, value: number) => void;

/**
 * Chart orientation
 */
export type ChartOrientation = 'horizontal' | 'vertical';

/**
 * Node alignment strategy
 */
export type NodeAlignment = 'left' | 'right' | 'justify';

/**
 * Loading state component type
 */
export type LoadingComponent = React.ReactNode;

/**
 * Error component type
 */
export type ErrorComponent = (error: Error) => React.ReactNode;

/**
 * Level color mapping
 */
export type LevelColorMap = Record<number, string>;

/**
 * Main SankeyChart props interface
 */
export interface SankeyChartProps {
  // ============================================================================
  // Required Props
  // ============================================================================

  /** Cube.js query configuration */
  query: Query;

  /** Array of dimension names representing flow levels (in order) */
  flowLevels: string[];

  /** Measure to use for flow values (e.g., 'sessions', 'revenue') */
  valueMeasure: string;

  // ============================================================================
  // Display Props
  // ============================================================================

  /** Chart height in pixels */
  height?: number;

  /** Chart width (responsive by default) */
  width?: string | number;

  /** Custom color palette for nodes */
  colors?: string[];

  /** Chart orientation */
  orient?: ChartOrientation;

  // ============================================================================
  // Layout Props
  // ============================================================================

  /** Node alignment strategy */
  nodeAlign?: NodeAlignment;

  /** Gap between nodes (pixels) */
  nodeGap?: number;

  /** Width of node rectangles (pixels) */
  nodeWidth?: number;

  /** Enable draggable nodes for manual layout adjustment */
  draggable?: boolean;

  /** Number of layout iterations for optimization (higher = better layout, slower) */
  layoutIterations?: number;

  // ============================================================================
  // Formatting Props
  // ============================================================================

  /** Custom value formatter function */
  valueFormatter?: ValueFormatter;

  /** Minimum link value to display (filters out small flows) */
  minLinkValue?: number;

  /** Show labels on flow links */
  showLinkLabels?: boolean;

  /** Custom node colors by level index */
  levelColors?: LevelColorMap;

  // ============================================================================
  // Animation Props
  // ============================================================================

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Animation easing function */
  animationEasing?: string;

  // ============================================================================
  // State Props
  // ============================================================================

  /** External loading state override */
  loading?: boolean;

  /** Custom loading component */
  loadingComponent?: LoadingComponent;

  /** Custom error component */
  errorComponent?: ErrorComponent;

  // ============================================================================
  // Interaction Props
  // ============================================================================

  /** Node click event handler */
  onNodeClick?: NodeClickHandler;

  /** Link click event handler */
  onLinkClick?: LinkClickHandler;

  // ============================================================================
  // Advanced Props
  // ============================================================================

  /** Custom tooltip formatter */
  tooltipFormatter?: (params: any) => string;

  /** Enable chart animations */
  enableAnimation?: boolean;

  /** Chart theme (light/dark) */
  theme?: 'light' | 'dark';

  /** Custom CSS class name */
  className?: string;

  /** Custom inline styles */
  style?: React.CSSProperties;
}

/**
 * Common Cube.js query patterns for Sankey charts
 */
export interface SankeyQueryPatterns {
  /** Traffic source flow query */
  trafficSourceFlow: Query;

  /** Campaign hierarchy flow query */
  campaignFlow: Query;

  /** Device journey flow query */
  deviceJourneyFlow: Query;

  /** Geographic sales flow query */
  geographicFlow: Query;

  /** Multi-platform search flow query */
  multiPlatformFlow: Query;
}

/**
 * Sankey chart configuration presets
 */
export interface SankeyPreset {
  /** Preset name */
  name: string;

  /** Preset description */
  description: string;

  /** Preset configuration */
  config: Partial<SankeyChartProps>;
}

/**
 * Common presets for different use cases
 */
export const SANKEY_PRESETS: Record<string, SankeyPreset> = {
  // Marketing Analytics
  trafficFlow: {
    name: 'Traffic Flow',
    description: 'Traffic source to conversion flow',
    config: {
      height: 600,
      nodeAlign: 'justify',
      nodeGap: 8,
      nodeWidth: 20,
      orient: 'horizontal',
      showLinkLabels: false,
      draggable: true,
      layoutIterations: 32,
      animationDuration: 1000,
    },
  },

  // Google Ads
  campaignHierarchy: {
    name: 'Campaign Hierarchy',
    description: 'Campaign → Ad Group → Keyword → Conversion',
    config: {
      height: 800,
      nodeAlign: 'justify',
      nodeGap: 12,
      nodeWidth: 25,
      orient: 'horizontal',
      showLinkLabels: true,
      colors: ['#4285F4', '#34A853', '#FBBC04', '#EA4335'],
      levelColors: {
        0: '#4285F4',
        1: '#34A853',
        2: '#FBBC04',
        3: '#EA4335',
      },
      minLinkValue: 1,
      draggable: true,
      layoutIterations: 64,
      animationDuration: 1500,
    },
  },

  // User Journey
  deviceJourney: {
    name: 'Device Journey',
    description: 'Device → Page Type → Action',
    config: {
      height: 600,
      nodeAlign: 'left',
      nodeGap: 10,
      nodeWidth: 20,
      orient: 'horizontal',
      showLinkLabels: false,
      colors: ['#667eea', '#764ba2', '#f093fb'],
      draggable: true,
      layoutIterations: 32,
      animationDuration: 1000,
    },
  },

  // E-commerce
  geographicSales: {
    name: 'Geographic Sales',
    description: 'Region → Product Category → Purchase',
    config: {
      height: 700,
      nodeAlign: 'justify',
      nodeGap: 10,
      nodeWidth: 25,
      orient: 'horizontal',
      showLinkLabels: false,
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      minLinkValue: 1000,
      draggable: true,
      layoutIterations: 64,
      animationDuration: 1000,
    },
  },

  // Multi-Platform
  multiPlatform: {
    name: 'Multi-Platform Flow',
    description: 'Channel → Search Term → Landing Page → Outcome',
    config: {
      height: 900,
      nodeAlign: 'justify',
      nodeGap: 12,
      nodeWidth: 30,
      orient: 'horizontal',
      showLinkLabels: true,
      colors: ['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#5F6368'],
      draggable: true,
      layoutIterations: 64,
      animationDuration: 1500,
    },
  },

  // Mobile-Optimized
  mobileVertical: {
    name: 'Mobile Vertical',
    description: 'Optimized for mobile devices (vertical)',
    config: {
      height: 800,
      nodeAlign: 'justify',
      nodeGap: 15,
      nodeWidth: 40,
      orient: 'vertical',
      showLinkLabels: false,
      draggable: false,
      layoutIterations: 32,
      animationDuration: 800,
    },
  },

  // Compact Dashboard
  compact: {
    name: 'Compact Dashboard',
    description: 'Smaller version for dashboard cards',
    config: {
      height: 400,
      nodeAlign: 'justify',
      nodeGap: 6,
      nodeWidth: 15,
      orient: 'horizontal',
      showLinkLabels: false,
      draggable: false,
      layoutIterations: 16,
      animationDuration: 600,
    },
  },
};

/**
 * Helper type for extracting dimension values from Cube.js results
 */
export interface CubeDimensionValue {
  [key: string]: string | number | null;
}

/**
 * Helper type for Cube.js result row
 */
export interface CubeResultRow {
  [key: string]: string | number | null;
}

/**
 * Sankey chart state
 */
export interface SankeyChartState {
  /** Current data */
  data: SankeyData;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Selected node */
  selectedNode: string | null;

  /** Selected link */
  selectedLink: { source: string; target: string } | null;
}

/**
 * Export all types
 */
export type {
  Query,
  SankeyNode,
  SankeyLink,
  SankeyData,
  ValueFormatter,
  NodeClickHandler,
  LinkClickHandler,
  ChartOrientation,
  NodeAlignment,
  LoadingComponent,
  ErrorComponent,
  LevelColorMap,
  SankeyChartProps,
  SankeyQueryPatterns,
  SankeyPreset,
  CubeDimensionValue,
  CubeResultRow,
  SankeyChartState,
};
