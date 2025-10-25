import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, X } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  type: 'dimension' | 'metric';
  dataType?: string;
}

interface DimensionSelectorProps {
  availableFields: Field[];
  selectedDimensions: string[];
  onDimensionsChange: (dimensions: string[]) => void;
  drillDownEnabled: boolean;
  onDrillDownToggle: (enabled: boolean) => void;
}

export function DimensionSelector({
  availableFields,
  selectedDimensions,
  onDimensionsChange,
  drillDownEnabled,
  onDrillDownToggle,
}: DimensionSelectorProps) {
  const [showAdditional, setShowAdditional] = useState(false);

  const dimensionFields = availableFields.filter((f) => f.type === 'dimension');
  const primaryDimension = selectedDimensions[0] || '';
  const additionalDimensions = selectedDimensions.slice(1);

  const handlePrimaryChange = (value: string) => {
    onDimensionsChange([value, ...additionalDimensions]);
  };

  const handleAddDimension = (value: string) => {
    if (value && !selectedDimensions.includes(value)) {
      onDimensionsChange([...selectedDimensions, value]);
    }
  };

  const handleRemoveDimension = (index: number) => {
    const newDimensions = [...selectedDimensions];
    newDimensions.splice(index, 1);
    onDimensionsChange(newDimensions);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#5F6368]">Dimension</label>

      {/* Primary Dimension */}
      <Select value={primaryDimension} onValueChange={handlePrimaryChange}>
        <SelectTrigger className="w-full h-9 border-[#DADCE0] hover:border-[#80868B] transition-colors">
          <SelectValue placeholder="Select primary dimension">
            {primaryDimension && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1E8E3E] border border-[#C8E6C9] text-[11px] font-medium">
                <span className="font-semibold">ABC</span>
                {dimensionFields.find(f => f.id === primaryDimension)?.name}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {dimensionFields.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1E8E3E] border border-[#C8E6C9] text-[10px] font-semibold">
                  ABC
                </span>
                <div className="flex flex-col">
                  <span className="text-xs">{field.name}</span>
                  {field.dataType && (
                    <span className="text-[10px] text-[#80868B]">{field.dataType}</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Additional Dimensions */}
      {additionalDimensions.length > 0 && (
        <div className="space-y-2 pl-3 border-l-2 border-[#AECBFA]">
          {additionalDimensions.map((dimId, index) => {
            const field = dimensionFields.find((f) => f.id === dimId);
            return (
              <div key={dimId} className="flex items-center gap-2 p-2 border border-[#DADCE0] rounded bg-white hover:bg-[#F8F9FA] transition-colors">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1E8E3E] border border-[#C8E6C9] text-[11px] font-medium flex-1 truncate">
                  <span className="font-semibold">ABC</span>
                  {field?.name || dimId}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-[#EA4335] hover:text-[#C5221F] hover:bg-[#FCE8E6]"
                  onClick={() => handleRemoveDimension(index + 1)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Dimension Button */}
      {!showAdditional && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 border-[#DADCE0] text-[#1967D2] hover:bg-[#F8F9FA] hover:border-[#1967D2] text-xs font-medium"
          onClick={() => setShowAdditional(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add dimension
        </Button>
      )}

      {showAdditional && (
        <Select
          value=""
          onValueChange={(value) => {
            handleAddDimension(value);
            setShowAdditional(false);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose dimension to add" />
          </SelectTrigger>
          <SelectContent>
            {dimensionFields
              .filter((f) => !selectedDimensions.includes(f.id))
              .map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}

      {/* Drill Down Toggle */}
      {selectedDimensions.length > 1 && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#DADCE0]">
          <input
            type="checkbox"
            id="drill-down"
            checked={drillDownEnabled}
            onChange={(e) => onDrillDownToggle(e.target.checked)}
            className="rounded border-[#DADCE0] text-[#4285F4] focus:ring-[#4285F4]"
          />
          <label htmlFor="drill-down" className="text-xs text-[#5F6368] cursor-pointer flex-1">
            Enable drill down
          </label>
          <ChevronDown className="h-3.5 w-3.5 text-[#80868B]" />
        </div>
      )}
    </div>
  );
}
