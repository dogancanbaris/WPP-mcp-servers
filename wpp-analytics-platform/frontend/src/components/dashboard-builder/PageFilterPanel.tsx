/**
 * PageFilterPanel Component
 *
 * Collapsible panel in the settings sidebar for configuring page-level filters.
 * Page filters override global filters for all components on that page.
 *
 * Filter Hierarchy: Global → Page → Component
 * This panel manages the "Page" level in that hierarchy.
 */

import React, { useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import type { FilterConfig } from '@/types/dashboard-builder';

interface PageFilterPanelProps {
  /**
   * ID of the page to manage filters for
   */
  pageId: string;
}

/**
 * Page-level filter management panel
 *
 * Allows users to:
 * - Add page-specific filters that override global filters
 * - Remove page filters
 * - See how many filters are active on this page
 *
 * @example
 * // In a page settings sidebar
 * <PageFilterPanel pageId={currentPageId} />
 */
export function PageFilterPanel({ pageId }: PageFilterPanelProps) {
  const { config, setPageFilters } = useDashboardStore();
  const page = config?.pages?.find(p => p.id === pageId);
  const pageFilters = page?.filters || [];

  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Add a new empty filter to the page
   * User will configure field, operator, and values in the UI
   */
  const addFilter = () => {
    const newFilter: FilterConfig = {
      id: crypto.randomUUID(),
      field: '',
      operator: 'equals',
      values: [],
      enabled: true,
    };
    setPageFilters(pageId, [...pageFilters, newFilter]);

    // Auto-expand panel when adding first filter
    if (pageFilters.length === 0) {
      setIsExpanded(true);
    }
  };

  /**
   * Remove a filter from the page
   */
  const removeFilter = (filterId: string) => {
    setPageFilters(
      pageId,
      pageFilters.filter(f => f.id !== filterId)
    );
  };

  /**
   * Update a specific filter's properties
   */
  const updateFilter = (filterId: string, updates: Partial<FilterConfig>) => {
    setPageFilters(
      pageId,
      pageFilters.map(f => f.id === filterId ? { ...f, ...updates } : f)
    );
  };

  return (
    <div className="page-filter-panel border rounded-lg p-4 space-y-3">
      {/* Panel Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Label className="flex items-center gap-2 cursor-pointer">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Filter size={16} />
          <span className="font-medium">Page Filters</span>
        </Label>
        <span className="text-sm text-muted-foreground">
          {pageFilters.length} filter{pageFilters.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Panel Content */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {pageFilters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No page-level filters. Page inherits global filters.
            </p>
          ) : (
            <div className="space-y-2">
              {pageFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-start gap-2 p-3 border rounded bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    {/* Filter Field */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Field:</span>
                      <input
                        type="text"
                        value={filter.field || ''}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                        placeholder="e.g., country, device"
                        className="flex-1 text-sm px-2 py-1 border rounded bg-background"
                      />
                    </div>

                    {/* Filter Operator */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Operator:</span>
                      <select
                        value={filter.operator || 'equals'}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                        className="flex-1 text-sm px-2 py-1 border rounded bg-background"
                      >
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="notContains">Not Contains</option>
                        <option value="inList">In List</option>
                        <option value="notInList">Not In List</option>
                        <option value="gt">Greater Than</option>
                        <option value="gte">Greater Than or Equal</option>
                        <option value="lt">Less Than</option>
                        <option value="lte">Less Than or Equal</option>
                      </select>
                    </div>

                    {/* Filter Values */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Values:</span>
                      <input
                        type="text"
                        value={filter.values?.join(', ') || ''}
                        onChange={(e) => updateFilter(filter.id, {
                          values: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                        })}
                        placeholder="e.g., US, UK, CA (comma-separated)"
                        className="flex-1 text-sm px-2 py-1 border rounded bg-background"
                      />
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={filter.enabled !== false}
                        onChange={(e) => updateFilter(filter.id, { enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-muted-foreground">Enabled</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter(filter.id)}
                    className="shrink-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addFilter}
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            Add Page Filter
          </Button>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            Page filters override global filters for all components on this page.
            Components can further override these with component-specific filters.
          </p>
        </div>
      )}
    </div>
  );
}
