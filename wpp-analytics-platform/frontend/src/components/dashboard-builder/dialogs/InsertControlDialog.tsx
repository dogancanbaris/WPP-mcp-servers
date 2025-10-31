'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronDown,
  List,
  Type,
  CheckSquare,
  Sliders,
  Filter,
  Plus,
  X,
} from 'lucide-react';

interface InsertControlDialogProps {
  open: boolean;
  controlType?: string;
  onClose: () => void;
  onInsert: (config: ControlConfig) => void;
}

export interface ControlConfig {
  type: 'date_filter' | 'dropdown' | 'list' | 'input_box' | 'checkbox' | 'slider';
  label?: string;

  // Date Range Control
  defaultRange?: string;
  allowCustom?: boolean;
  dateFormat?: string;
  showPresets?: boolean;

  // Dropdown Control
  options?: string[];
  defaultSelection?: string;
  allowMultiSelect?: boolean;
  searchEnabled?: boolean;
  placeholder?: string;

  // List Control
  items?: string[];
  maxHeight?: number;
  allowSearch?: boolean;
  showCheckboxes?: boolean;

  // Input Box Control
  inputType?: 'text' | 'number' | 'email' | 'url';
  defaultValue?: string;
  validationPattern?: string;

  // Checkbox Control
  defaultChecked?: boolean;
  helpText?: string;

  // Slider Control
  minValue?: number;
  maxValue?: number;
  stepValue?: number;
  sliderDefaultValue?: number;
  showValueLabel?: boolean;
  unitLabel?: string;
}

const CONTROL_TYPES = [
  {
    type: 'date_filter',
    name: 'Date Range',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Filter data by date range',
  },
  {
    type: 'dropdown',
    name: 'Dropdown',
    icon: <ChevronDown className="w-5 h-5" />,
    description: 'Select from a list of options',
  },
  {
    type: 'list',
    name: 'Fixed-Size List',
    icon: <List className="w-5 h-5" />,
    description: 'Scrollable list with checkboxes',
  },
  {
    type: 'input_box',
    name: 'Input Box',
    icon: <Type className="w-5 h-5" />,
    description: 'Text or number input field',
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    icon: <CheckSquare className="w-5 h-5" />,
    description: 'Single checkbox with label',
  },
  {
    type: 'slider',
    name: 'Slider',
    icon: <Sliders className="w-5 h-5" />,
    description: 'Range slider for numeric values',
  },
] as const;

export const InsertControlDialog: React.FC<InsertControlDialogProps> = ({
  open,
  controlType = 'date_filter',
  onClose,
  onInsert,
}) => {
  const [activeTab, setActiveTab] = useState(controlType);

  // Date Range Control State
  const [dateConfig, setDateConfig] = useState({
    defaultRange: 'last30Days',
    allowCustom: true,
    dateFormat: 'MM/DD/YYYY',
    showPresets: true,
  });

  // Dropdown Control State
  const [dropdownConfig, setDropdownConfig] = useState({
    options: ['Option 1', 'Option 2', 'Option 3'],
    defaultSelection: 'Option 1',
    allowMultiSelect: false,
    searchEnabled: false,
    placeholder: 'Select an option',
  });

  // List Control State
  const [listConfig, setListConfig] = useState({
    items: ['Item 1', 'Item 2', 'Item 3'],
    maxHeight: 200,
    allowSearch: false,
    showCheckboxes: true,
  });

  // Input Box Control State
  const [inputConfig, setInputConfig] = useState({
    placeholder: 'Enter value',
    defaultValue: '',
    inputType: 'text' as const,
    validationPattern: '',
  });

  // Checkbox Control State
  const [checkboxConfig, setCheckboxConfig] = useState({
    label: 'Enable this option',
    defaultChecked: false,
    helpText: '',
  });

  // Slider Control State
  const [sliderConfig, setSliderConfig] = useState({
    minValue: 0,
    maxValue: 100,
    stepValue: 1,
    sliderDefaultValue: 50,
    showValueLabel: true,
    unitLabel: '',
  });

  // Helper to add item to list
  const addOption = (type: 'dropdown' | 'list') => {
    if (type === 'dropdown') {
      setDropdownConfig(prev => ({
        ...prev,
        options: [...prev.options, `Option ${prev.options.length + 1}`],
      }));
    } else {
      setListConfig(prev => ({
        ...prev,
        items: [...prev.items, `Item ${prev.items.length + 1}`],
      }));
    }
  };

  const removeOption = (type: 'dropdown' | 'list', index: number) => {
    if (type === 'dropdown') {
      setDropdownConfig(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    } else {
      setListConfig(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (type: 'dropdown' | 'list', index: number, value: string) => {
    if (type === 'dropdown') {
      setDropdownConfig(prev => ({
        ...prev,
        options: prev.options.map((opt, i) => i === index ? value : opt),
      }));
    } else {
      setListConfig(prev => ({
        ...prev,
        items: prev.items.map((item, i) => i === index ? value : item),
      }));
    }
  };

  const handleInsert = () => {
    let config: ControlConfig;

    switch (activeTab) {
      case 'date_filter':
        config = { type: 'date_filter', ...dateConfig };
        break;
      case 'dropdown':
        config = { type: 'dropdown', ...dropdownConfig };
        break;
      case 'list':
        config = { type: 'list', ...listConfig };
        break;
      case 'input_box':
        config = { type: 'input_box', ...inputConfig };
        break;
      case 'checkbox':
        config = { type: 'checkbox', ...checkboxConfig };
        break;
      case 'slider':
        config = { type: 'slider', ...sliderConfig };
        break;
      default:
        return;
    }

    onInsert(config);
    onClose();
  };

  // Get preview for current config
  const renderPreview = () => {
    switch (activeTab) {
      case 'date_filter':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Last 30 days</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
              </div>
              {dateConfig.showPresets && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Shows quick presets: Today, Last 7 days, etc.
                </div>
              )}
            </div>
          </div>
        );

      case 'dropdown':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="border rounded-md p-2 bg-muted/30 flex items-center justify-between">
              <span className="text-sm">{dropdownConfig.placeholder}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            {dropdownConfig.allowMultiSelect && (
              <Badge variant="outline" className="text-xs">Multi-select enabled</Badge>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div
              className="border rounded-md p-2 bg-muted/30 overflow-y-auto"
              style={{ maxHeight: `${listConfig.maxHeight}px` }}
            >
              {listConfig.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 py-1">
                  {listConfig.showCheckboxes && (
                    <div className="w-3 h-3 border rounded" />
                  )}
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'input_box':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <Input
              type={inputConfig.inputType}
              placeholder={inputConfig.placeholder}
              defaultValue={inputConfig.defaultValue}
              disabled
              className="bg-muted/30"
            />
            {inputConfig.validationPattern && (
              <div className="text-xs text-muted-foreground">
                Pattern: {inputConfig.validationPattern}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 border rounded mt-0.5" />
              <div>
                <div className="text-sm">{checkboxConfig.label}</div>
                {checkboxConfig.helpText && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {checkboxConfig.helpText}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min: {sliderConfig.minValue}</span>
                {sliderConfig.showValueLabel && (
                  <span className="font-medium">
                    {sliderConfig.sliderDefaultValue}{sliderConfig.unitLabel}
                  </span>
                )}
                <span className="text-muted-foreground">Max: {sliderConfig.maxValue}</span>
              </div>
              <Slider
                disabled
                value={[sliderConfig.sliderDefaultValue]}
                min={sliderConfig.minValue}
                max={sliderConfig.maxValue}
                step={sliderConfig.stepValue}
                className="opacity-60"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Insert Control</DialogTitle>
          <DialogDescription>
            Add interactive controls to filter and manipulate dashboard data
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="date_filter" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Date
              </TabsTrigger>
              <TabsTrigger value="dropdown" className="text-xs">
                <ChevronDown className="w-3 h-3 mr-1" />
                Dropdown
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs">
                <List className="w-3 h-3 mr-1" />
                List
              </TabsTrigger>
              <TabsTrigger value="input_box" className="text-xs">
                <Type className="w-3 h-3 mr-1" />
                Input
              </TabsTrigger>
              <TabsTrigger value="checkbox" className="text-xs">
                <CheckSquare className="w-3 h-3 mr-1" />
                Checkbox
              </TabsTrigger>
              <TabsTrigger value="slider" className="text-xs">
                <Sliders className="w-3 h-3 mr-1" />
                Slider
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            {/* Date Range Control */}
            <TabsContent value="date_filter" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-range">Default Range</Label>
                  <Select
                    value={dateConfig.defaultRange}
                    onValueChange={(value) => setDateConfig({ ...dateConfig, defaultRange: value })}
                  >
                    <SelectTrigger id="default-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7Days">Last 7 days</SelectItem>
                      <SelectItem value="last30Days">Last 30 days</SelectItem>
                      <SelectItem value="last90Days">Last 90 days</SelectItem>
                      <SelectItem value="thisMonth">This month</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="allTime">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={dateConfig.dateFormat}
                    onValueChange={(value) => setDateConfig({ ...dateConfig, dateFormat: value })}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-custom"
                    checked={dateConfig.allowCustom}
                    onCheckedChange={(checked) =>
                      setDateConfig({ ...dateConfig, allowCustom: checked as boolean })
                    }
                  />
                  <Label htmlFor="allow-custom" className="cursor-pointer">
                    Allow custom date selection
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-presets"
                    checked={dateConfig.showPresets}
                    onCheckedChange={(checked) =>
                      setDateConfig({ ...dateConfig, showPresets: checked as boolean })
                    }
                  />
                  <Label htmlFor="show-presets" className="cursor-pointer">
                    Show preset options (Today, Yesterday, etc.)
                  </Label>
                </div>

                <Separator />
                {renderPreview()}
              </div>
            </TabsContent>

            {/* Dropdown Control */}
            <TabsContent value="dropdown" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addOption('dropdown')}
                      className="h-7"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto border rounded-md p-2">
                    {dropdownConfig.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption('dropdown', idx, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeOption('dropdown', idx)}
                          className="h-8 w-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-selection">Default Selection</Label>
                  <Select
                    value={dropdownConfig.defaultSelection}
                    onValueChange={(value) =>
                      setDropdownConfig({ ...dropdownConfig, defaultSelection: value })
                    }
                  >
                    <SelectTrigger id="default-selection">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownConfig.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placeholder">Placeholder Text</Label>
                  <Input
                    id="placeholder"
                    value={dropdownConfig.placeholder}
                    onChange={(e) =>
                      setDropdownConfig({ ...dropdownConfig, placeholder: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multi-select"
                    checked={dropdownConfig.allowMultiSelect}
                    onCheckedChange={(checked) =>
                      setDropdownConfig({ ...dropdownConfig, allowMultiSelect: checked as boolean })
                    }
                  />
                  <Label htmlFor="multi-select" className="cursor-pointer">
                    Allow multi-select
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-enabled"
                    checked={dropdownConfig.searchEnabled}
                    onCheckedChange={(checked) =>
                      setDropdownConfig({ ...dropdownConfig, searchEnabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="search-enabled" className="cursor-pointer">
                    Enable search
                  </Label>
                </div>

                <Separator />
                {renderPreview()}
              </div>
            </TabsContent>

            {/* List Control */}
            <TabsContent value="list" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>List Items</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addOption('list')}
                      className="h-7"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto border rounded-md p-2">
                    {listConfig.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateOption('list', idx, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeOption('list', idx)}
                          className="h-8 w-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-height">Max Height (px)</Label>
                  <Input
                    id="max-height"
                    type="number"
                    value={listConfig.maxHeight}
                    onChange={(e) =>
                      setListConfig({ ...listConfig, maxHeight: parseInt(e.target.value) || 200 })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="list-search"
                    checked={listConfig.allowSearch}
                    onCheckedChange={(checked) =>
                      setListConfig({ ...listConfig, allowSearch: checked as boolean })
                    }
                  />
                  <Label htmlFor="list-search" className="cursor-pointer">
                    Allow search
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-checkboxes"
                    checked={listConfig.showCheckboxes}
                    onCheckedChange={(checked) =>
                      setListConfig({ ...listConfig, showCheckboxes: checked as boolean })
                    }
                  />
                  <Label htmlFor="show-checkboxes" className="cursor-pointer">
                    Show checkboxes
                  </Label>
                </div>

                <Separator />
                {renderPreview()}
              </div>
            </TabsContent>

            {/* Input Box Control */}
            <TabsContent value="input_box" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-placeholder">Placeholder Text</Label>
                  <Input
                    id="input-placeholder"
                    value={inputConfig.placeholder}
                    onChange={(e) =>
                      setInputConfig({ ...inputConfig, placeholder: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-default">Default Value</Label>
                  <Input
                    id="input-default"
                    value={inputConfig.defaultValue}
                    onChange={(e) =>
                      setInputConfig({ ...inputConfig, defaultValue: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-type">Input Type</Label>
                  <Select
                    value={inputConfig.inputType}
                    onValueChange={(value: 'text' | 'number' | 'email' | 'url') =>
                      setInputConfig({ ...inputConfig, inputType: value })
                    }
                  >
                    <SelectTrigger id="input-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validation-pattern">Validation Pattern (regex - optional)</Label>
                  <Input
                    id="validation-pattern"
                    value={inputConfig.validationPattern}
                    onChange={(e) =>
                      setInputConfig({ ...inputConfig, validationPattern: e.target.value })
                    }
                    placeholder="e.g., ^[A-Z]{3}$"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a regex pattern for validation
                  </p>
                </div>

                <Separator />
                {renderPreview()}
              </div>
            </TabsContent>

            {/* Checkbox Control */}
            <TabsContent value="checkbox" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkbox-label">Label Text</Label>
                  <Input
                    id="checkbox-label"
                    value={checkboxConfig.label}
                    onChange={(e) =>
                      setCheckboxConfig({ ...checkboxConfig, label: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="help-text">Help Text (optional)</Label>
                  <Input
                    id="help-text"
                    value={checkboxConfig.helpText}
                    onChange={(e) =>
                      setCheckboxConfig({ ...checkboxConfig, helpText: e.target.value })
                    }
                    placeholder="Additional context or help text"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="default-checked"
                    checked={checkboxConfig.defaultChecked}
                    onCheckedChange={(checked) =>
                      setCheckboxConfig({ ...checkboxConfig, defaultChecked: checked as boolean })
                    }
                  />
                  <Label htmlFor="default-checked" className="cursor-pointer">
                    Default checked
                  </Label>
                </div>

                <Separator />
                {renderPreview()}
              </div>
            </TabsContent>

            {/* Slider Control */}
            <TabsContent value="slider" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-value">Min Value</Label>
                    <Input
                      id="min-value"
                      type="number"
                      value={sliderConfig.minValue}
                      onChange={(e) =>
                        setSliderConfig({ ...sliderConfig, minValue: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-value">Max Value</Label>
                    <Input
                      id="max-value"
                      type="number"
                      value={sliderConfig.maxValue}
                      onChange={(e) =>
                        setSliderConfig({ ...sliderConfig, maxValue: parseInt(e.target.value) || 100 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="step-value">Step Value</Label>
                    <Input
                      id="step-value"
                      type="number"
                      value={sliderConfig.stepValue}
                      onChange={(e) =>
                        setSliderConfig({ ...sliderConfig, stepValue: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slider-default">Default Value</Label>
                    <Input
                      id="slider-default"
                      type="number"
                      value={sliderConfig.sliderDefaultValue}
                      onChange={(e) =>
                        setSliderConfig({ ...sliderConfig, sliderDefaultValue: parseInt(e.target.value) || 50 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit-label">Unit Label (optional)</Label>
                  <Input
                    id="unit-label"
                    value={sliderConfig.unitLabel}
                    onChange={(e) =>
                      setSliderConfig({ ...sliderConfig, unitLabel: e.target.value })
                    }
                    placeholder="e.g., %, $, px"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-value-label"
                    checked={sliderConfig.showValueLabel}
                    onCheckedChange={(checked) =>
                      setSliderConfig({ ...sliderConfig, showValueLabel: checked as boolean })
                    }
                  />
                  <Label htmlFor="show-value-label" className="cursor-pointer">
                    Show value label
                  </Label>
                </div>

                <Separator />
                {renderPreview()}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} className="bg-primary hover:bg-primary/90">
            Insert Control
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
