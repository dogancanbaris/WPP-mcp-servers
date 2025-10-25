import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TableStyleConfig {
  showRowNumbers: boolean;
  showBorder: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  alternateRowColors: boolean;
  hoverHighlight: boolean;
  sortable: boolean;
  pagination: boolean;
  pageSize: number;
}

interface TableStyleAccordionProps {
  config: TableStyleConfig;
  onChange: (config: TableStyleConfig) => void;
}

export const TableStyleAccordion: React.FC<TableStyleAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateConfig = (updates: Partial<TableStyleConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <AccordionItem value="table">
      <AccordionTrigger>Table Options</AccordionTrigger>
      <AccordionContent className="space-y-4">
        {/* Display Density */}
        <div className="space-y-2">
          <Label>Display density</Label>
          <RadioGroup value={config.density} onValueChange={(density) => updateConfig({ density: density as any })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact" className="font-normal">Compact</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable" className="font-normal">Comfortable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spacious" id="spacious" />
              <Label htmlFor="spacious" className="font-normal">Spacious</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Show Row Numbers */}
        <div className="flex items-center justify-between">
          <Label htmlFor="row-numbers">Show row numbers</Label>
          <Toggle
            id="row-numbers"
            pressed={config.showRowNumbers}
            onPressedChange={(showRowNumbers) => updateConfig({ showRowNumbers })}
          />
        </div>

        {/* Show Border */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-border">Show table border</Label>
          <Toggle
            id="show-border"
            pressed={config.showBorder}
            onPressedChange={(showBorder) => updateConfig({ showBorder })}
          />
        </div>

        {/* Alternate Row Colors */}
        <div className="flex items-center justify-between">
          <Label htmlFor="alternate-rows">Alternate row colors</Label>
          <Toggle
            id="alternate-rows"
            pressed={config.alternateRowColors}
            onPressedChange={(alternateRowColors) => updateConfig({ alternateRowColors })}
          />
        </div>

        {/* Hover Highlight */}
        <div className="flex items-center justify-between">
          <Label htmlFor="hover-highlight">Highlight on hover</Label>
          <Toggle
            id="hover-highlight"
            pressed={config.hoverHighlight}
            onPressedChange={(hoverHighlight) => updateConfig({ hoverHighlight })}
          />
        </div>

        {/* Sortable Columns */}
        <div className="flex items-center justify-between">
          <Label htmlFor="sortable">Sortable columns</Label>
          <Toggle
            id="sortable"
            pressed={config.sortable}
            onPressedChange={(sortable) => updateConfig({ sortable })}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Label htmlFor="pagination">Enable pagination</Label>
          <Toggle
            id="pagination"
            pressed={config.pagination}
            onPressedChange={(pagination) => updateConfig({ pagination })}
          />
        </div>

        {config.pagination && (
          <div className="space-y-2">
            <Label htmlFor="page-size">Rows per page</Label>
            <Select value={String(config.pageSize)} onValueChange={(pageSize) => updateConfig({ pageSize: Number(pageSize) })}>
              <SelectTrigger id="page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
