import React, { useState, useMemo } from 'react';
import { ComponentConfig, Filter } from '@/types/dashboard-builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Calendar, Filter as FilterIcon } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface FiltersTabProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
  availableDimensions?: string[];
  availableMetrics?: string[];
}

interface DimensionFilter {
  id: string;
  dimension: string;
  operator: string;
  value: string | string[];
}

interface MetricFilter {
  id: string;
  metric: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_or_equal' | 'less_or_equal' | 'between';
  value: number | [number, number];
}

interface DateRangeFilter {
  type: 'preset' | 'custom';
  preset?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'this_year' | 'all_time';
  startDate?: string;
  endDate?: string;
}

/**
 * FiltersTab Component - Complete Filter Management
 *
 * Provides comprehensive filtering with:
 * - Dimension filters (multi-select, text matching, numeric)
 * - Metric filters (numeric comparisons)
 * - Date range filters (presets + custom)
 * - Live preview
 * - Agent MCP compatibility
 *
 * Dual-Agent Capabilities:
 * - Practitioners: UI-based filter creation
 * - Agents: JSON-based filter configuration via API
 *
 * @param config - Current component configuration
 * @param onUpdate - Callback to update component properties
 * @param availableDimensions - List of available dimension fields
 * @param availableMetrics - List of available metric fields
 */
export const FiltersTab: React.FC<FiltersTabProps> = ({
  config,
  onUpdate,
  availableDimensions = ['date', 'device', 'country', 'campaign', 'keyword'],
  availableMetrics = ['clicks', 'impressions', 'ctr', 'conversions', 'cost'],
}) => {
  // Initialize from config or defaults
  const [dimensionFilters, setDimensionFilters] = useState<DimensionFilter[]>(
    (config.filters || []).filter(f => !f.metric).map((f, idx) => ({
      id: `dim-${idx}`,
      dimension: f.field,
      operator: f.operator || 'equals',
      value: f.values || [],
    }))
  );

  const [metricFilters, setMetricFilters] = useState<MetricFilter[]>([]);

  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    type: 'preset',
    preset: 'last_30_days',
  });

  /**
   * Add new dimension filter
   */
  const addDimensionFilter = () => {
    const newFilter: DimensionFilter = {
      id: `dim-${Date.now()}`,
      dimension: availableDimensions[0],
      operator: 'equals',
      value: '',
    };
    setDimensionFilters([...dimensionFilters, newFilter]);
  };

  /**
   * Update dimension filter
   */
  const updateDimensionFilter = (id: string, updates: Partial<DimensionFilter>) => {
    setDimensionFilters(
      dimensionFilters.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  };

  /**
   * Remove dimension filter
   */
  const removeDimensionFilter = (id: string) => {
    setDimensionFilters(dimensionFilters.filter(f => f.id !== id));
  };

  /**
   * Add new metric filter
   */
  const addMetricFilter = () => {
    const newFilter: MetricFilter = {
      id: `metric-${Date.now()}`,
      metric: availableMetrics[0],
      operator: 'greater_than',
      value: 0,
    };
    setMetricFilters([...metricFilters, newFilter]);
  };

  /**
   * Update metric filter
   */
  const updateMetricFilter = (id: string, updates: Partial<MetricFilter>) => {
    setMetricFilters(
      metricFilters.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  };

  /**
   * Remove metric filter
   */
  const removeMetricFilter = (id: string) => {
    setMetricFilters(metricFilters.filter(f => f.id !== id));
  };

  /**
   * Apply all filters to component
   * Converts UI state to component config format
   */
  const applyFilters = () => {
    // Convert dimension filters to component filter format
    const filters: Filter[] = dimensionFilters.map(f => ({
      field: f.dimension,
      operator: f.operator,
      values: Array.isArray(f.value) ? f.value : [f.value],
    }));

    // Add metric filters
    metricFilters.forEach(mf => {
      filters.push({
        field: mf.metric,
        operator: mf.operator,
        values: Array.isArray(mf.value) ? mf.value.map(String) : [String(mf.value)],
        metric: true,
      });
    });

    // Update component config
    onUpdate({
      filters,
      dateRange: dateRange.type === 'preset'
        ? dateRange.preset
        : {
            start: dateRange.startDate || '',
            end: dateRange.endDate || '',
          },
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    setDimensionFilters([]);
    setMetricFilters([]);
    setDateRange({ type: 'preset', preset: 'all_time' });
    onUpdate({
      filters: [],
      dateRange: 'all_time',
    });
  };

  // Memoize filter count for UI feedback
  const totalFilterCount = useMemo(
    () => dimensionFilters.length + metricFilters.length + (dateRange.preset !== 'all_time' ? 1 : 0),
    [dimensionFilters, metricFilters, dateRange]
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Filter Summary Card */}
      {totalFilterCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-blue-900 font-medium">
              {totalFilterCount} filter{totalFilterCount !== 1 ? 's' : ''} active
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scrollable Filters Area */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Date Range Section */}
        <Accordion type="single" collapsible defaultValue="date-range">
          <AccordionItem value="date-range">
            <AccordionTrigger className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Date Range</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {/* Preset Options */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'last_7_days', label: 'Last 7 days' },
                    { value: 'last_30_days', label: 'Last 30 days' },
                    { value: 'last_90_days', label: 'Last 90 days' },
                    { value: 'this_month', label: 'This month' },
                    { value: 'this_year', label: 'This year' },
                    { value: 'all_time', label: 'All time' },
                  ].map(preset => (
                    <Button
                      key={preset.value}
                      size="sm"
                      variant={dateRange.preset === preset.value ? 'default' : 'outline'}
                      onClick={() => setDateRange({ type: 'preset', preset: preset.value as any })}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="border-t pt-3 space-y-2">
                <Label className="text-xs font-semibold">Custom Range</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <Input
                      type="date"
                      value={dateRange.startDate || ''}
                      onChange={(e) => setDateRange({
                        type: 'custom',
                        startDate: e.target.value,
                        endDate: dateRange.endDate,
                      })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <Input
                      type="date"
                      value={dateRange.endDate || ''}
                      onChange={(e) => setDateRange({
                        type: 'custom',
                        startDate: dateRange.startDate,
                        endDate: e.target.value,
                      })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Dimension Filters Section */}
        <Accordion type="single" collapsible defaultValue="dimension-filters">
          <AccordionItem value="dimension-filters">
            <AccordionTrigger className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Dimension Filters</span>
                {dimensionFilters.length > 0 && (
                  <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-medium">
                    {dimensionFilters.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {dimensionFilters.length === 0 ? (
                <p className="text-xs text-muted-foreground">No dimension filters added yet</p>
              ) : (
                dimensionFilters.map(filter => (
                  <Card key={filter.id} className="p-3">
                    <div className="space-y-2">
                      {/* Dimension Selector */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Dimension</Label>
                        <Select value={filter.dimension} onValueChange={(value) => updateDimensionFilter(filter.id, { dimension: value })}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDimensions.map(dim => (
                              <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator Selector */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Operator</Label>
                        <Select value={filter.operator} onValueChange={(value) => updateDimensionFilter(filter.id, { operator: value })}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="starts_with">Starts With</SelectItem>
                            <SelectItem value="ends_with">Ends With</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value Input */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Value</Label>
                        <Input
                          type="text"
                          value={Array.isArray(filter.value) ? filter.value.join(',') : filter.value}
                          onChange={(e) => updateDimensionFilter(filter.id, { value: e.target.value })}
                          placeholder="Enter value..."
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDimensionFilter(filter.id)}
                        className="w-full text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove Filter
                      </Button>
                    </div>
                  </Card>
                ))
              )}

              {/* Add Dimension Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={addDimensionFilter}
                className="w-full text-xs h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Dimension Filter
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Metric Filters Section */}
        <Accordion type="single" collapsible>
          <AccordionItem value="metric-filters">
            <AccordionTrigger className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Metric Filters</span>
                {metricFilters.length > 0 && (
                  <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-medium">
                    {metricFilters.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              {metricFilters.length === 0 ? (
                <p className="text-xs text-muted-foreground">No metric filters added yet</p>
              ) : (
                metricFilters.map(filter => (
                  <Card key={filter.id} className="p-3">
                    <div className="space-y-2">
                      {/* Metric Selector */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Metric</Label>
                        <Select value={filter.metric} onValueChange={(value) => updateMetricFilter(filter.id, { metric: value })}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMetrics.map(metric => (
                              <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator Selector */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Operator</Label>
                        <Select value={filter.operator} onValueChange={(value) => updateMetricFilter(filter.id, { operator: value as any })}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">=</SelectItem>
                            <SelectItem value="not_equals">≠</SelectItem>
                            <SelectItem value="greater_than">&gt;</SelectItem>
                            <SelectItem value="less_than">&lt;</SelectItem>
                            <SelectItem value="greater_or_equal">≥</SelectItem>
                            <SelectItem value="less_or_equal">≤</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value Input(s) */}
                      {filter.operator === 'between' ? (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Min Value</Label>
                          <Input
                            type="number"
                            value={Array.isArray(filter.value) ? filter.value[0] : 0}
                            onChange={(e) => updateMetricFilter(filter.id, {
                              value: [Number(e.target.value), Array.isArray(filter.value) ? filter.value[1] : 0]
                            })}
                            className="h-8 text-xs"
                          />
                          <Label className="text-xs text-muted-foreground">Max Value</Label>
                          <Input
                            type="number"
                            value={Array.isArray(filter.value) ? filter.value[1] : 100}
                            onChange={(e) => updateMetricFilter(filter.id, {
                              value: [Array.isArray(filter.value) ? filter.value[0] : 0, Number(e.target.value)]
                            })}
                            className="h-8 text-xs"
                          />
                        </div>
                      ) : (
                        <div>
                          <Label className="text-xs text-muted-foreground">Value</Label>
                          <Input
                            type="number"
                            value={Array.isArray(filter.value) ? filter.value[0] : filter.value}
                            onChange={(e) => updateMetricFilter(filter.id, { value: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMetricFilter(filter.id)}
                        className="w-full text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove Filter
                      </Button>
                    </div>
                  </Card>
                ))
              )}

              {/* Add Metric Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={addMetricFilter}
                className="w-full text-xs h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Metric Filter
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="border-t pt-4 space-y-2 bg-background">
        <Button
          onClick={applyFilters}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Apply Filters
        </Button>
        {totalFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
};
