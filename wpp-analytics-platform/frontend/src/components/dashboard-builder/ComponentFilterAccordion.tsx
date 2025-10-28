/**
 * ComponentFilterAccordion Component
 *
 * Accordion panel in the SettingsSidebar that allows configuring component-level filter overrides.
 * Components can opt out of global/page filters or define their own custom filters.
 *
 * Filter Hierarchy: Global → Page → Component
 * This component manages the "Component" level (highest priority).
 */

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import type { ComponentConfig, FilterConfig } from '@/types/dashboard-builder';

interface ComponentFilterAccordionProps {
  /**
   * Current component configuration
   */
  componentConfig: ComponentConfig;

  /**
   * Callback to update component configuration
   */
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

/**
 * Component-level filter configuration accordion
 *
 * Allows users to:
 * - Opt out of global filters (useGlobalFilters = false)
 * - Opt out of page filters (usePageFilters = false)
 * - Define component-specific filters that override all parent filters
 *
 * @example
 * // In SettingsSidebar when a component is selected
 * <ComponentFilterAccordion
 *   componentConfig={selectedComponent}
 *   onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
 * />
 */
export function ComponentFilterAccordion({
  componentConfig,
  onUpdate,
}: ComponentFilterAccordionProps) {
  const hasComponentFilters =
    componentConfig.componentFilters &&
    componentConfig.componentFilters.length > 0;
  const usesGlobalFilters = componentConfig.useGlobalFilters !== false;
  const usesPageFilters = componentConfig.usePageFilters !== false;

  /**
   * Add a new component-specific filter
   */
  const addComponentFilter = () => {
    const newFilter: FilterConfig = {
      id: crypto.randomUUID(),
      field: '',
      operator: 'equals',
      values: [],
      enabled: true,
    };

    const existingFilters = componentConfig.componentFilters || [];
    onUpdate({
      componentFilters: [...existingFilters, newFilter],
    });
  };

  /**
   * Remove a component filter
   */
  const removeComponentFilter = (filterId: string) => {
    const existingFilters = componentConfig.componentFilters || [];
    onUpdate({
      componentFilters: existingFilters.filter(f => f.id !== filterId),
    });
  };

  /**
   * Update a specific component filter
   */
  const updateComponentFilter = (filterId: string, updates: Partial<FilterConfig>) => {
    const existingFilters = componentConfig.componentFilters || [];
    onUpdate({
      componentFilters: existingFilters.map(f =>
        f.id === filterId ? { ...f, ...updates } : f
      ),
    });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="filters">
        <AccordionTrigger className="text-sm">
          <div className="flex items-center justify-between w-full pr-4">
            <span>Filter Settings</span>
            {hasComponentFilters && (
              <Badge variant="secondary" className="ml-2">
                Custom
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Global Filters Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-global-filters"
                checked={usesGlobalFilters}
                onCheckedChange={(checked) =>
                  onUpdate({ useGlobalFilters: checked as boolean })
                }
              />
              <Label htmlFor="use-global-filters" className="text-sm cursor-pointer">
                Use Global Filters
              </Label>
            </div>

            {/* Page Filters Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-page-filters"
                checked={usesPageFilters}
                onCheckedChange={(checked) =>
                  onUpdate({ usePageFilters: checked as boolean })
                }
              />
              <Label htmlFor="use-page-filters" className="text-sm cursor-pointer">
                Use Page Filters
              </Label>
            </div>

            {/* Component Filters Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Component Filters</Label>
                <span className="text-xs text-muted-foreground">
                  {componentConfig.componentFilters?.length || 0} filter
                  {componentConfig.componentFilters?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Component Filter List */}
              {hasComponentFilters && (
                <div className="space-y-2 mb-3">
                  {componentConfig.componentFilters?.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-start gap-2 p-2 border rounded bg-muted/50"
                    >
                      <div className="flex-1 space-y-2">
                        {/* Filter Field */}
                        <input
                          type="text"
                          value={filter.field || ''}
                          onChange={(e) =>
                            updateComponentFilter(filter.id, { field: e.target.value })
                          }
                          placeholder="Field (e.g., country)"
                          className="w-full text-xs px-2 py-1 border rounded bg-background"
                        />

                        {/* Filter Operator */}
                        <select
                          value={filter.operator || 'equals'}
                          onChange={(e) =>
                            updateComponentFilter(filter.id, { operator: e.target.value })
                          }
                          className="w-full text-xs px-2 py-1 border rounded bg-background"
                        >
                          <option value="equals">Equals</option>
                          <option value="notEquals">Not Equals</option>
                          <option value="contains">Contains</option>
                          <option value="notContains">Not Contains</option>
                          <option value="inList">In List</option>
                          <option value="notInList">Not In List</option>
                        </select>

                        {/* Filter Values */}
                        <input
                          type="text"
                          value={filter.values?.join(', ') || ''}
                          onChange={(e) =>
                            updateComponentFilter(filter.id, {
                              values: e.target.value.split(',').map(v => v.trim()).filter(Boolean),
                            })
                          }
                          placeholder="Values (comma-separated)"
                          className="w-full text-xs px-2 py-1 border rounded bg-background"
                        />
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComponentFilter(filter.id)}
                        className="shrink-0 h-8 w-8"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Component Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={addComponentFilter}
                className="w-full"
              >
                <Plus size={14} className="mr-2" />
                Add Component Filter
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p className="font-medium">Filter Priority:</p>
              <p>Component filters override page and global filters</p>
              <p>Unchecking options will ignore those filter levels</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
