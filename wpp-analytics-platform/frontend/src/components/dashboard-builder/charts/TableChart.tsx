'use client';

/**
 * Table Chart - Dataset-Based (NEW ARCHITECTURE)
 *
 * Data table with sorting and pagination using registered datasets.
 * Queries: GET /api/datasets/[id]/query with caching
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { formatMetricValue } from '@/lib/utils/metric-formatter';
import { standardizeDimensionValue } from '@/lib/utils/data-formatter';
import { useState, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';

export interface TableChartProps extends Partial<ComponentConfig> {}

type SortDirection = 'asc' | 'desc' | null;

export const TableChart: React.FC<TableChartProps> = ({
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
}) => {
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: SortDirection }>({
    column: '',
    direction: null
  });

  // Subscribe to global date range filter
  const globalDateRange = useFilterStore(state => state.activeDateRange);
  const effectiveDateRange = globalDateRange || dateRange;

  // Fetch from dataset API (with caching)
  const { data, isLoading, error } = useQuery({
    queryKey: ['table', dataset_id, dimension, metrics, effectiveDateRange], // Global date in key
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(dimension && { dimensions: dimension }),
        metrics: metrics.join(','),
        ...(effectiveDateRange && { dateRange: JSON.stringify(effectiveDateRange) }),
        limit: '100'
      });

      const response = await fetch(`/api/datasets/${dataset_id}/query?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!dataset_id && metrics.length > 0
  });

  const rawTableData = data?.data || [];

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) {
      return rawTableData;
    }

    return [...rawTableData].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [rawTableData, sortConfig]);

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' :
                prev.column === column && prev.direction === 'desc' ? null : 'asc'
    }));
  };

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

  const columns = dimension ? [dimension, ...metrics] : metrics;

  return (
    <div style={containerStyle}>
      {showTitle && <div style={titleStyle}>{title}</div>}

      <div className="overflow-auto max-h-[500px]">
        <table className="w-full border-collapse">
          <thead style={{ backgroundColor: tableHeaderStyle.backgroundColor }}>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                  style={{
                    color: tableHeaderStyle.textColor,
                    fontSize: tableHeaderStyle.fontSize,
                    fontWeight: tableHeaderStyle.fontWeight
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.charAt(0).toUpperCase() + col.slice(1)}</span>
                    {sortConfig.column === col ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
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
                  <td key={col} className="px-4 py-2 text-sm">
                    {col === dimension ? (
                      // Standardize and truncate dimension values
                      <span title={row[col]}>
                        {standardizeDimensionValue(row[col], dimension || '')}
                      </span>
                    ) : (
                      formatMetricValue(row[col], col, [], 'gsc')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
