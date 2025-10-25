/**
 * Global Filters Component
 *
 * Professional slide-in panel for managing dashboard-wide filters.
 * Uses shadcn Sheet component with Accordion sections.
 */

import React, { useState } from 'react';
import {
  useFilterStore,
  GlobalFilter,
  DateRangeFilter,
  DimensionFilter,
  MeasureFilter,
  DATE_RANGE_PRESETS,
  FilterOperator,
  formatDateForDisplay,
  getOperatorLabel,
} from '@/store/filterStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import {
  Filter,
  X,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GlobalFiltersProps {
  className?: string;
  showAddButton?: boolean;
}

/**
 * Main GlobalFilters Component
 */
export const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  className,
  showAddButton = true,
}) => {
  const {
    filters,
    isFilterBarVisible,
    filterScope,
    setFilterBarVisible,
    setFilterScope,
    removeFilter,
    toggleFilter,
    clearAllFilters,
    getFilterSummary,
  } = useFilterStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const activeFilters = filters.filter((f) => f.enabled);
  const dateRangeFilters = filters.filter((f) => f.type === 'dateRange');
  const dimensionFilters = filters.filter((f) => f.type === 'dimension');
  const measureFilters = filters.filter((f) => f.type === 'measure');

  return (
    <>
      {/* Trigger Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterBarVisible(true)}
              className={cn('gap-2', className)}
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filters</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Global filters apply to all dashboard charts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Slide-in Sheet Panel */}
      <Sheet open={isFilterBarVisible} onOpenChange={setFilterBarVisible}>
        <SheetContent side="top" className="h-auto max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <SheetTitle>Global Filters</SheetTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Global filters apply to all dashboard charts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Filter Scope Selector */}
            <div className="flex items-center gap-3 py-2">
              <Label className="text-sm font-medium text-muted-foreground">Apply to:</Label>
              <ToggleGroup
                type="single"
                value={filterScope}
                onValueChange={(value) => value && setFilterScope(value as 'all-pages' | 'current-page')}
                className="bg-muted/50"
              >
                <ToggleGroupItem value="all-pages" className="text-xs">
                  All Pages
                </ToggleGroupItem>
                <ToggleGroupItem value="current-page" className="text-xs">
                  Current Page
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <SheetDescription className="flex items-center justify-between">
              <span>{getFilterSummary()}</span>
              <div className="flex items-center gap-2">
                {showAddButton && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Filter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <AddFilterDialog onClose={() => setIsAddDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
                {filters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </SheetDescription>
          </SheetHeader>

          <div className="p-4">
            {filters.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Filter className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No filters applied
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Add Filter" to filter your dashboard data
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="multiple" defaultValue={['date-range', 'dimensions', 'measures']} className="space-y-2">
                {/* Date Range Section */}
                {dateRangeFilters.length > 0 && (
                  <AccordionItem value="date-range" className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Date Range</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {dateRangeFilters.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {dateRangeFilters.map((filter) => (
                          <FilterChip
                            key={filter.id}
                            filter={filter}
                            onRemove={() => removeFilter(filter.id)}
                            onToggle={() => toggleFilter(filter.id)}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Dimensions Section */}
                {dimensionFilters.length > 0 && (
                  <AccordionItem value="dimensions" className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Dimensions</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {dimensionFilters.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {dimensionFilters.map((filter) => (
                          <FilterChip
                            key={filter.id}
                            filter={filter}
                            onRemove={() => removeFilter(filter.id)}
                            onToggle={() => toggleFilter(filter.id)}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Measures Section */}
                {measureFilters.length > 0 && (
                  <AccordionItem value="measures" className="border rounded-lg px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Measures</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {measureFilters.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {measureFilters.map((filter) => (
                          <FilterChip
                            key={filter.id}
                            filter={filter}
                            onRemove={() => removeFilter(filter.id)}
                            onToggle={() => toggleFilter(filter.id)}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

/**
 * Filter Chip Component - Clean badge design
 */
interface FilterChipProps {
  filter: GlobalFilter;
  onRemove: () => void;
  onToggle: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({
  filter,
  onRemove,
  onToggle,
}) => {
  const getFilterDisplayText = () => {
    if (filter.type === 'dateRange') {
      return `${formatDateForDisplay(filter.startDate)} - ${formatDateForDisplay(filter.endDate)}`;
    } else if (filter.type === 'dimension') {
      const valueText =
        filter.values.length > 2
          ? `${filter.values.slice(0, 2).join(', ')}... (+${filter.values.length - 2})`
          : filter.values.join(', ');
      return `${filter.dimension}: ${valueText}`;
    } else if (filter.type === 'measure') {
      return `${filter.measure} ${getOperatorLabel(filter.operator)} ${filter.value}`;
    }
    return filter.label;
  };

  const getScopeBadgeColor = () => {
    if (filter.scope === 'all-pages') {
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    } else if (filter.scope === 'current-page') {
      return 'bg-green-500/10 text-green-700 border-green-500/20';
    }
    return 'bg-blue-500/10 text-blue-700 border-blue-500/20'; // default to all-pages
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Scope Badge */}
      <Badge
        variant="outline"
        className={cn('h-6 px-2 text-xs font-medium', getScopeBadgeColor())}
      >
        {filter.scope === 'current-page' ? 'Page' : 'Global'}
      </Badge>

      {/* Filter Badge */}
      <Badge
        variant={filter.enabled ? 'default' : 'outline'}
        className={cn(
          'gap-2 pl-3 pr-1.5 py-1.5 text-sm font-normal transition-all',
          !filter.enabled && 'opacity-50 text-muted-foreground'
        )}
      >
        <span className="max-w-[300px] truncate">{getFilterDisplayText()}</span>
        <div className="flex items-center gap-0.5 ml-1 border-l pl-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="hover:bg-background/20 rounded p-0.5 transition-colors"
                >
                  {filter.enabled ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{filter.enabled ? 'Disable filter' : 'Enable filter'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="hover:bg-background/20 rounded p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove filter</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Badge>
    </div>
  );
};

/**
 * Add Filter Dialog
 */
interface AddFilterDialogProps {
  onClose: () => void;
}

const AddFilterDialog: React.FC<AddFilterDialogProps> = ({ onClose }) => {
  const [filterType, setFilterType] = useState<'dateRange' | 'dimension' | 'measure'>('dateRange');

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Filter</DialogTitle>
        <DialogDescription>
          Add a filter that will apply to all charts in this dashboard
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filter Type</Label>
          <Select
            value={filterType}
            onValueChange={(value: any) => setFilterType(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateRange">Date Range</SelectItem>
              <SelectItem value="dimension">Dimension Filter</SelectItem>
              <SelectItem value="measure">Measure Filter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4">
          {filterType === 'dateRange' && <DateRangeFilterForm onClose={onClose} />}
          {filterType === 'dimension' && <DimensionFilterForm onClose={onClose} />}
          {filterType === 'measure' && <MeasureFilterForm onClose={onClose} />}
        </div>
      </div>
    </>
  );
};

/**
 * Date Range Filter Form
 */
const DateRangeFilterForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setDateRangePreset, setCustomDateRange, activePreset } = useFilterStore();
  const [preset, setPreset] = useState(activePreset || 'last30Days');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleApply = () => {
    if (preset === 'custom') {
      if (startDate && endDate) {
        setCustomDateRange(
          format(startDate, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );
        onClose();
      }
    } else {
      setDateRangePreset(preset as keyof typeof DATE_RANGE_PRESETS);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Preset Range</Label>
        <Select value={preset} onValueChange={setPreset}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGE_PRESETS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          disabled={preset === 'custom' && (!startDate || !endDate)}
        >
          Apply Filter
        </Button>
      </DialogFooter>
    </div>
  );
};

/**
 * Dimension Filter Form
 */
const DimensionFilterForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addDimensionFilter } = useFilterStore();
  const [dimension, setDimension] = useState('');
  const [operator, setOperator] = useState<FilterOperator>('equals');
  const [values, setValues] = useState<string>('');
  const [label, setLabel] = useState('');

  const dimensionOptions = [
    'GoogleAds.campaignName',
    'GoogleAds.adGroupName',
    'GoogleAds.device',
    'SearchConsole.query',
    'SearchConsole.page',
    'SearchConsole.country',
    'Analytics.sessionSource',
    'Analytics.sessionMedium',
    'Analytics.deviceCategory',
  ];

  const operatorOptions: FilterOperator[] = [
    'equals',
    'notEquals',
    'contains',
    'notContains',
    'startsWith',
    'endsWith',
    'inList',
    'notInList',
  ];

  const handleApply = () => {
    if (dimension && values) {
      const valueArray = values.split(',').map((v) => v.trim());
      addDimensionFilter(dimension, operator, valueArray, label || undefined);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Dimension</Label>
        <Select value={dimension} onValueChange={setDimension}>
          <SelectTrigger>
            <SelectValue placeholder="Select dimension" />
          </SelectTrigger>
          <SelectContent>
            {dimensionOptions.map((dim) => (
              <SelectItem key={dim} value={dim}>
                {dim}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Operator</Label>
        <Select
          value={operator}
          onValueChange={(value: FilterOperator) => setOperator(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operatorOptions.map((op) => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Values (comma-separated)</Label>
        <Input
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="e.g., Campaign 1, Campaign 2"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Label (optional)</Label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Top Campaigns"
          className="text-sm"
        />
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleApply} disabled={!dimension || !values}>
          Apply Filter
        </Button>
      </DialogFooter>
    </div>
  );
};

/**
 * Measure Filter Form
 */
const MeasureFilterForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addMeasureFilter } = useFilterStore();
  const [measure, setMeasure] = useState('');
  const [operator, setOperator] = useState<FilterOperator>('gt');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');

  const measureOptions = [
    'GoogleAds.impressions',
    'GoogleAds.clicks',
    'GoogleAds.cost',
    'GoogleAds.conversions',
    'GoogleAds.ctr',
    'SearchConsole.clicks',
    'SearchConsole.impressions',
    'SearchConsole.position',
    'Analytics.sessions',
    'Analytics.bounceRate',
  ];

  const operatorOptions: FilterOperator[] = ['gt', 'gte', 'lt', 'lte', 'equals', 'notEquals'];

  const handleApply = () => {
    if (measure && value) {
      addMeasureFilter(measure, operator, parseFloat(value), label || undefined);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Measure</Label>
        <Select value={measure} onValueChange={setMeasure}>
          <SelectTrigger>
            <SelectValue placeholder="Select measure" />
          </SelectTrigger>
          <SelectContent>
            {measureOptions.map((meas) => (
              <SelectItem key={meas} value={meas}>
                {meas}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Operator</Label>
        <Select
          value={operator}
          onValueChange={(value: FilterOperator) => setOperator(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operatorOptions.map((op) => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Value</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., 1000"
          step="any"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Label (optional)</Label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., High Cost Campaigns"
          className="text-sm"
        />
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleApply} disabled={!measure || !value}>
          Apply Filter
        </Button>
      </DialogFooter>
    </div>
  );
};

/**
 * Compact Filter Bar (for use in chart headers)
 */
interface CompactFilterBarProps {
  className?: string;
}

export const CompactFilterBar: React.FC<CompactFilterBarProps> = ({
  className,
}) => {
  const { getFilterSummary, setFilterBarVisible } = useFilterStore();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterBarVisible(true)}
            className={cn('gap-2', className)}
          >
            <Filter className="h-4 w-4" />
            <span className="text-xs">{getFilterSummary()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open global filters panel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GlobalFilters;
