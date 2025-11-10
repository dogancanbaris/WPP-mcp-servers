import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Plus, X, Filter } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  type: 'dimension' | 'metric';
  dataType?: string;
}

interface ChartFilter {
  id: string;
  fieldId: string;
  fieldName: string;
  operator: string;
  value: string;
}

interface FilterSectionProps {
  availableFields: Field[];
  filters: ChartFilter[];
  onFiltersChange: (filters: ChartFilter[]) => void;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'greaterOrEqual', label: 'Greater or equal' },
  { value: 'lessOrEqual', label: 'Less or equal' },
  { value: 'isNull', label: 'Is null' },
  { value: 'isNotNull', label: 'Is not null' },
];

export function FilterSection({
  availableFields,
  filters,
  onFiltersChange,
}: FilterSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<ChartFilter>>({
    fieldId: '',
    operator: 'equals',
    value: '',
  });

  const handleAddFilter = () => {
    if (newFilter.fieldId) {
      const field = availableFields.find((f) => f.id === newFilter.fieldId);
      if (field) {
        const filter: ChartFilter = {
          id: `filter-${Date.now()}`,
          fieldId: newFilter.fieldId,
          fieldName: field.name,
          operator: newFilter.operator || 'equals',
          value: newFilter.value || '',
        };
        onFiltersChange([...filters, filter]);
        setNewFilter({ fieldId: '', operator: 'equals', value: '' });
        setDialogOpen(false);
      }
    }
  };

  const handleRemoveFilter = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id));
  };

  const getOperatorLabel = (operator: string) => {
    return OPERATORS.find((op) => op.value === operator)?.label || operator;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Filters</label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add filter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Filter</DialogTitle>
              <DialogDescription>
                Filter the data displayed in this chart
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Field Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Field</label>
                {availableFields.length === 0 ? (
                  <div className="p-3 border border-dashed rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      No fields available. Select a data source in the Setup tab first.
                    </p>
                  </div>
                ) : (
                  <Select
                    value={newFilter.fieldId || ''}
                    onValueChange={(value) =>
                      setNewFilter({ ...newFilter, fieldId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            <span>{field.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Operator Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Operator</label>
                <Select
                  value={newFilter.operator || 'equals'}
                  onValueChange={(value) =>
                    setNewFilter({ ...newFilter, operator: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input */}
              {newFilter.operator !== 'isNull' &&
                newFilter.operator !== 'isNotNull' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input
                      value={newFilter.value || ''}
                      onChange={(e) =>
                        setNewFilter({ ...newFilter, value: e.target.value })
                      }
                      placeholder="Enter value"
                    />
                  </div>
                )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFilter} disabled={!newFilter.fieldId}>
                Add Filter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Chips */}
      {filters.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-1.5">
              {/* Component Scope Badge */}
              <Badge
                variant="outline"
                className="h-6 px-2 text-xs font-medium bg-purple-500/10 text-purple-700 border-purple-500/20"
              >
                Component
              </Badge>

              {/* Filter Badge */}
              <Badge
                variant="secondary"
                className="flex items-center gap-2 pl-3 pr-2 py-1"
              >
                <Filter className="h-3 w-3" />
                <span className="text-xs">
                  {filter.fieldName} {getOperatorLabel(filter.operator)}{' '}
                  {filter.value && `"${filter.value}"`}
                </span>
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No filters applied</p>
      )}
    </div>
  );
}
