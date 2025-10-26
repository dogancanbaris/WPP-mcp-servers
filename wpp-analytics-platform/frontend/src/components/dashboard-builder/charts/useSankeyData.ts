/**
 * useSankeyData Hook
 *
 * Custom hook for managing Sankey chart data with dataset API integration.
 * Provides data transformation, filtering, and state management utilities.
 */

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DatasetQuery, SankeyData, SankeyNode, SankeyLink } from './SankeyChart.types';

/**
 * Dataset result row type
 */
interface DatasetResultRow {
  [key: string]: string | number | null;
}

/**
 * Hook options
 */
interface UseSankeyDataOptions {
  /** Dataset API query */
  query: DatasetQuery;

  /** Dataset ID */
  datasetId: string;

  /** Flow level dimension names */
  flowLevels: string[];

  /** Value measure name */
  valueMeasure: string;

  /** Minimum link value to include */
  minLinkValue?: number;

  /** Custom node colors by level */
  levelColors?: Record<number, string>;

  /** Default color palette */
  colors?: string[];

  /** Enable automatic data refresh */
  autoRefresh?: boolean;

  /** Refresh interval (ms) */
  refreshInterval?: number;
}

/**
 * Hook return type
 */
interface UseSankeyDataReturn {
  /** Transformed Sankey data */
  data: SankeyData;

  /** Loading state */
  isLoading: boolean;

  /** Error object */
  error: Error | null;

  /** Raw dataset result */
  resultData: DatasetResultRow[] | null;

  /** Manually refresh data */
  refetch: () => void;

  /** Total number of nodes */
  nodeCount: number;

  /** Total number of links */
  linkCount: number;

  /** Total flow value */
  totalValue: number;

  /** Filter data by level and value */
  filterByLevel: (level: number, value: string) => SankeyData;

  /** Get top N flows */
  getTopFlows: (n: number) => SankeyLink[];

  /** Get nodes at specific level */
  getNodesAtLevel: (level: number) => SankeyNode[];

  /** Calculate node value (total flow through node) */
  getNodeValue: (nodeName: string) => number;

  /** Get all paths from source to target */
  getPaths: (source: string, target: string) => string[][];
}

/**
 * Default colors
 */
const DEFAULT_COLORS = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
  '#d4ec59',
];

/**
 * Transform dataset result to Sankey data format
 */
function transformToSankeyData(
  resultData: DatasetResultRow[] | null,
  flowLevels: string[],
  valueMeasure: string,
  minLinkValue: number,
  levelColors?: Record<number, string>,
  colors: string[] = DEFAULT_COLORS
): SankeyData {
  if (!resultData) {
    return { nodes: [], links: [] };
  }

  const nodes = new Map<string, SankeyNode>();
  const links: SankeyLink[] = [];
  const linkMap = new Map<string, number>();

  // Get raw data
  const data = resultData;

  // Process each row
  data.forEach((row) => {
    // Extract flow level values
    const levelValues = flowLevels.map((level) => {
      const value = row[level] || row[`${Object.keys(row)[0].split('.')[0]}.${level}`];
      return value ? String(value) : 'Unknown';
    });

    // Get measure value
    const measureValue = Number(row[valueMeasure]) || 0;

    // Skip if below minimum
    if (measureValue < minLinkValue) {
      return;
    }

    // Create nodes
    levelValues.forEach((value, levelIndex) => {
      const nodeKey = `${value}_L${levelIndex}`;
      if (!nodes.has(nodeKey)) {
        nodes.set(nodeKey, {
          name: nodeKey,
          itemStyle: {
            color: levelColors?.[levelIndex] || colors[levelIndex % colors.length],
          },
          label: {
            fontSize: 12,
            fontWeight: 'normal',
          },
          depth: levelIndex,
        });
      }
    });

    // Create links
    for (let i = 0; i < levelValues.length - 1; i++) {
      const sourceKey = `${levelValues[i]}_L${i}`;
      const targetKey = `${levelValues[i + 1]}_L${i + 1}`;
      const linkKey = `${sourceKey}->${targetKey}`;

      const currentValue = linkMap.get(linkKey) || 0;
      linkMap.set(linkKey, currentValue + measureValue);
    }
  });

  // Convert link map to array
  linkMap.forEach((value, key) => {
    const [source, target] = key.split('->');
    if (value >= minLinkValue) {
      links.push({ source, target, value });
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    links,
  };
}

/**
 * Calculate total value flowing through a node
 */
function calculateNodeValue(nodeName: string, links: SankeyLink[]): number {
  return links
    .filter((link) => link.source === nodeName || link.target === nodeName)
    .reduce((sum, link) => sum + link.value, 0);
}

/**
 * Find all paths from source to target
 */
function findPaths(
  source: string,
  target: string,
  links: SankeyLink[],
  visited: Set<string> = new Set(),
  currentPath: string[] = []
): string[][] {
  if (source === target) {
    return [[...currentPath, target]];
  }

  if (visited.has(source)) {
    return [];
  }

  visited.add(source);
  const paths: string[][] = [];

  const outgoingLinks = links.filter((link) => link.source === source);
  for (const link of outgoingLinks) {
    const subPaths = findPaths(
      link.target,
      target,
      links,
      new Set(visited),
      [...currentPath, source]
    );
    paths.push(...subPaths);
  }

  return paths;
}

/**
 * Main hook
 */
export function useSankeyData(options: UseSankeyDataOptions): UseSankeyDataReturn {
  const {
    query,
    datasetId,
    flowLevels,
    valueMeasure,
    minLinkValue = 0,
    levelColors,
    colors = DEFAULT_COLORS,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  // Dataset API query
  const { data: resultData, isLoading, error, refetch } = useQuery({
    queryKey: ['sankey-data', datasetId, query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.metrics) params.append('metrics', query.metrics.join(','));
      if (query.dimensions) params.append('dimensions', query.dimensions.join(','));
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await fetch(`/api/datasets/${datasetId}/query?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dataset');
      return response.json();
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Transform data
  const data = useMemo(
    () =>
      transformToSankeyData(
        resultData,
        flowLevels,
        valueMeasure,
        minLinkValue,
        levelColors,
        colors
      ),
    [resultData, flowLevels, valueMeasure, minLinkValue, levelColors, colors]
  );

  // Calculate statistics
  const nodeCount = useMemo(() => data.nodes.length, [data.nodes]);
  const linkCount = useMemo(() => data.links.length, [data.links]);
  const totalValue = useMemo(
    () => data.links.reduce((sum, link) => sum + link.value, 0),
    [data.links]
  );

  // Filter by level and value
  const filterByLevel = useCallback(
    (level: number, value: string): SankeyData => {
      const nodeKey = `${value}_L${level}`;

      // Find connected nodes and links
      const connectedLinks = data.links.filter(
        (link) => link.source === nodeKey || link.target === nodeKey
      );

      const connectedNodeNames = new Set<string>();
      connectedLinks.forEach((link) => {
        connectedNodeNames.add(link.source);
        connectedNodeNames.add(link.target);
      });

      const filteredNodes = data.nodes.filter((node) =>
        connectedNodeNames.has(node.name)
      );

      return {
        nodes: filteredNodes,
        links: connectedLinks,
      };
    },
    [data]
  );

  // Get top N flows
  const getTopFlows = useCallback(
    (n: number): SankeyLink[] => {
      return [...data.links].sort((a, b) => b.value - a.value).slice(0, n);
    },
    [data.links]
  );

  // Get nodes at specific level
  const getNodesAtLevel = useCallback(
    (level: number): SankeyNode[] => {
      return data.nodes.filter((node) => node.depth === level);
    },
    [data.nodes]
  );

  // Get node value
  const getNodeValue = useCallback(
    (nodeName: string): number => {
      return calculateNodeValue(nodeName, data.links);
    },
    [data.links]
  );

  // Get paths
  const getPaths = useCallback(
    (source: string, target: string): string[][] => {
      return findPaths(source, target, data.links);
    },
    [data.links]
  );

  return {
    data,
    isLoading,
    error: error as Error | null,
    resultData: resultData || null,
    refetch,
    nodeCount,
    linkCount,
    totalValue,
    filterByLevel,
    getTopFlows,
    getNodesAtLevel,
    getNodeValue,
    getPaths,
  };
}

/**
 * Hook for managing Sankey chart state
 */
export function useSankeyState() {
  const [selectedNode, setSelectedNode] = useState<{
    name: string;
    level: number;
  } | null>(null);

  const [selectedLink, setSelectedLink] = useState<{
    source: string;
    target: string;
    value: number;
  } | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({});

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setSelectedLink(null);
  }, []);

  const addFilter = useCallback((dimension: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [dimension]: value,
    }));
  }, []);

  const removeFilter = useCallback((dimension: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[dimension];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    selectedNode,
    setSelectedNode,
    selectedLink,
    setSelectedLink,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    clearSelection,
  };
}

/**
 * Hook for Sankey chart interactions
 */
export function useSankeyInteractions() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<{
    source: string;
    target: string;
  } | null>(null);

  const handleNodeHover = useCallback((nodeName: string | null) => {
    setHoveredNode(nodeName);
  }, []);

  const handleLinkHover = useCallback(
    (source: string | null, target: string | null) => {
      if (source && target) {
        setHoveredLink({ source, target });
      } else {
        setHoveredLink(null);
      }
    },
    []
  );

  return {
    hoveredNode,
    hoveredLink,
    handleNodeHover,
    handleLinkHover,
  };
}

/**
 * Export all hooks
 */
export { UseSankeyDataOptions, UseSankeyDataReturn };
