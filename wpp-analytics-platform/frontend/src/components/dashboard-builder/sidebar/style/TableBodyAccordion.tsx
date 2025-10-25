import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/dashboard-builder/shared';

interface TableBodyConfig {
  fontSize: string;
  textColor: string;
  backgroundColor: string;
  alternateRowColor: string;
  borderColor: string;
  rowPadding: string;
}

interface TableBodyAccordionProps {
  config: TableBodyConfig;
  onChange: (config: TableBodyConfig) => void;
}

export const TableBodyAccordion: React.FC<TableBodyAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateConfig = (updates: Partial<TableBodyConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <AccordionItem value="table-body">
      <AccordionTrigger>Table Body & Rows</AccordionTrigger>
      <AccordionContent className="space-y-4">
        {/* Font Size */}
        <div className="space-y-2">
          <Label htmlFor="body-font-size">Font size</Label>
          <Select value={config.fontSize} onValueChange={(fontSize) => updateConfig({ fontSize })}>
            <SelectTrigger id="body-font-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10px</SelectItem>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Text color</Label>
          <ColorPicker
            value={config.textColor}
            onChange={(textColor) => updateConfig({ textColor })}
          />
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label>Background color</Label>
          <ColorPicker
            value={config.backgroundColor}
            onChange={(backgroundColor) => updateConfig({ backgroundColor })}
          />
        </div>

        {/* Alternate Row Color */}
        <div className="space-y-2">
          <Label>Alternate row color</Label>
          <ColorPicker
            value={config.alternateRowColor}
            onChange={(alternateRowColor) => updateConfig({ alternateRowColor })}
          />
        </div>

        {/* Border Color */}
        <div className="space-y-2">
          <Label>Border color</Label>
          <ColorPicker
            value={config.borderColor}
            onChange={(borderColor) => updateConfig({ borderColor })}
          />
        </div>

        {/* Row Padding */}
        <div className="space-y-2">
          <Label htmlFor="row-padding">Row padding</Label>
          <Select value={config.rowPadding} onValueChange={(rowPadding) => updateConfig({ rowPadding })}>
            <SelectTrigger id="row-padding">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">Small (4px)</SelectItem>
              <SelectItem value="8">Medium (8px)</SelectItem>
              <SelectItem value="12">Large (12px)</SelectItem>
              <SelectItem value="16">Extra Large (16px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
