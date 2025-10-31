'use client';

/**
 * Table Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Data table with sorting and pagination using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 * Features: Backend sorting, pagination, professional defaults
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { formatColumnHeader } from '@/lib/utils/label-formatter';
import { useState, useMemo } from 'react';
import { useCascadedFilters } from '@/hooks/useCascadedFilters';
import { useCurrentPageId } from '@/store/dashboardStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getChartDefaults, resolveSortField } from '@/lib/defaults/chart-defaults';

export interface TableChartProps extends Partial<ComponentConfig> {}

type SortDirection = 'asc' | 'desc' | null;

export const TableChart: React.FC<TableChartProps> = (props) => {
  const {
    // Component ID
    id: componentId,

    // Data props
    dataset_id,
    dimension = null,
    metrics = [],
    dateRange,

    // Display props
    title = 'Data Table',
    showTitle = true,
    titleFontFamily = 'roboto',
    titleFontSize = '16',
    titleFontWeight = '600',
    titleColor = '#111827',
    titleBackgroundColor = 'transparent',
    titleAlignment = 'left',

    // Background & Border
    backgroundColor = '#ffffff',
    showBorder = true,
    borderColor = '#e0e0e0',
    borderWidth = 1,
    borderRadius = 8,
    padding = 16,

    // Table styles
    tableHeaderStyle = {
      backgroundColor: '#f9fafb',
      textColor: '#111827',
      fontSize: '12px',
      fontWeight: '600'
    },
    tableBodyStyle = {
      evenRowColor: '#ffffff',
      oddRowColor: '#f9fafb'
    }
  } = props;

  // Apply professional defaults
  const defaults = getChartDefaults('table');
  const pageSize = props.pageSize || defaults.pageSize || 100;
  const showPagination = props.showPagination !== false; // Default true

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  // Sorting state (backend-driven)
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'ASC' | 'DESC' }>({
    column: metrics[0] || dimension || '',
    direction: 'DESC'
  });

  const currentPageId = useCurrentPageId();

  // Use cascaded filters (Global → Page → Component)
  const { filters: cascadedFilters } = useCascadedFilters({
    pageId: currentPageId || undefined,
    componentId,
    componentConfig: props,
    dateDimension: dimension || 'date',
  });

  // Fetch from dataset API with backend sorting and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['table', dataset_id, dimension, metrics, cascadedFilters, sortConfig, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(dimension && { dimensions: dimension }),
        metrics: metrics.join(','),
        ...(cascadedFilters.length > 0 && { filters: JSON.stringify(cascadedFilters) }),
        sortBy: sortConfig.column,
        sortDirection: sortConfig.direction,
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
        includeTotalCount: 'true',
        chartType: 'table'
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0
  });

  // Extract data with comparison support
  const currentData = data?.data?.current || data?.data || [];
  const comparisonData = data?.data?.comparison || [];
  const hasComparison = comparisonData.length > 0;

  // Merge current and comparison data by dimension/index
  const mergedData = useMemo(() => {
    if (!hasComparison) {
      return currentData;
    }

    return currentData.map((currentRow: any, index: number) => {
      const compRow = comparisonData[index] || {};
      const merged: any = { ...currentRow };

      // Add comparison values and calculate changes
      metrics.forEach((metric) => {
        const currentVal = Number(currentRow[metric]) || 0;
        const compVal = Number(compRow[metric]) || 0;
        const change = compVal !== 0 ? ((currentVal - compVal) / compVal) * 100 : 0;

        merged[`${metric}_prev`] = compVal;
        merged[`${metric}_change`] = change;
      });

      return merged;
    });
  }, [currentData, comparisonData, metrics, hasComparison]);

  // Backend sorting (no client-side sorting needed)
  // Data is already sorted by backend based on sortConfig
  const sortedData = mergedData;

  // Handle column click for sorting (triggers backend re-fetch)
  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'DESC' ? 'ASC' : 'DESC'
    }));
    setCurrentPage(0); // Reset to first page when sorting changes
  };

  // Pagination calculations
  const totalCount = data?.metadata?.totalCount || 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalCount);

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    boxShadow: showBorder ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: titleFontFamily,
    fontSize: `${titleFontSize}px`,
    fontWeight: titleFontWeight,
    color: titleColor,
    backgroundColor: titleBackgroundColor,
    textAlign: titleAlignment as any,
    marginBottom: '12px'
  };

  if (isLoading) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle} className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <p className="text-sm text-red-600">Failed to load table data</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div style={containerStyle} className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Build columns with comparison support
  const buildColumns = () => {
    const cols: any[] = [];

    // Dimension column
    if (dimension) {
      cols.push({ key: dimension, header: formatColumnHeader(dimension), isDimension: true });
    }

    // Metric columns with comparison
    metrics.forEach((metric) => {
      // Current metric value
      cols.push({
        key: metric,
        header: formatColumnHeader(metric),
        isMetric: true
      });

      // Comparison columns if available
      if (hasComparison) {
        cols.push({
          key: `${metric}_change`,
          header: formatColumnHeader(`${metric}_change`),
          isChange: true,
          metricKey: metric
        });
      }
    });

    return cols;
  };

  const columns = buildColumns();

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}

      <div className="overflow-auto max-h-[500px]">
        <table className="w-full border-collapse">
          <thead style={{ backgroundColor: tableHeaderStyle.backgroundColor }}>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                  style={{
                    color: tableHeaderStyle.textColor,
                    fontSize: tableHeaderStyle.fontSize,
                    fontWeight: tableHeaderStyle.fontWeight
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className={sortConfig.column === col.key ? 'font-semibold' : ''}>
                      {col.header}
                    </span>
                    {sortConfig.column === col.key ? (
                      sortConfig.direction === 'ASC' ?
                        <ChevronUp className="w-4 h-4 text-blue-600" /> :
                        <ChevronDown className="w-4 h-4 text-blue-600" />
                    ) : <ChevronsUpDown className="w-4 h-4 opacity-30" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row: any, index: number) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? tableBodyStyle.evenRowColor : tableBodyStyle.oddRowColor
                }}
                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2 text-sm">
                    {col.isDimension ? (
                      // Dimension value
                      <span title={row[col.key]}>
                        {standardizeDimensionValue(row[col.key], dimension || '')}
                      </span>
                    ) : col.isChange ? (
                      // Change badge
                      <Badge
                        variant={row[col.key] >= 0 ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {row[col.key] >= 0 ? '+' : ''}{row[col.key].toFixed(1)}%
                      </Badge>
                    ) : (
                      // Metric value
                      formatMetricValue(row[col.key], col.key, [], 'gsc')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-gray-200 bg-gray-50">
          <div className="text-sm font-medium text-gray-700">
            Showing <span className="font-semibold text-gray-900">{startRow}-{endRow}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span> rows
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 font-medium"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-gray-700 px-2">
              Page <span className="font-semibold text-gray-900">{currentPage + 1}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 font-medium"
              disabled={currentPage >= totalPages - 1 || !data?.metadata?.hasMore}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
