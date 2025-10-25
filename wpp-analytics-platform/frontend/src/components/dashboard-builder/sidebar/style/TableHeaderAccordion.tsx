import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/dashboard-builder/shared';

interface TableHeaderConfig {
  fontSize: string;
  fontWeight: string;
  textColor: string;
  backgroundColor: string;
  alignment: 'left' | 'center' | 'right';
}

interface TableHeaderAccordionProps {
  config: TableHeaderConfig;
  onChange: (config: TableHeaderConfig) => void;
}

export const TableHeaderAccordion: React.FC<TableHeaderAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateConfig = (updates: Partial<TableHeaderConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <AccordionItem value="table-header">
      <AccordionTrigger>Table Header</AccordionTrigger>
      <AccordionContent className="space-y-4">
        {/* Font Size */}
        <div className="space-y-2">
          <Label htmlFor="header-font-size">Font size</Label>
          <Select value={config.fontSize} onValueChange={(fontSize) => updateConfig({ fontSize })}>
            <SelectTrigger id="header-font-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10px</SelectItem>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <Label htmlFor="header-font-weight">Font weight</Label>
          <Select value={config.fontWeight} onValueChange={(fontWeight) => updateConfig({ fontWeight })}>
            <SelectTrigger id="header-font-weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400">Normal</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semi-bold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
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

        {/* Alignment */}
        <div className="space-y-2">
          <Label>Text alignment</Label>
          <div className="flex gap-1">
            <button
              className={`flex-1 px-3 py-2 rounded border ${
                config.alignment === 'left' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => updateConfig({ alignment: 'left' })}
            >
              ←
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded border ${
                config.alignment === 'center' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => updateConfig({ alignment: 'center' })}
            >
              ■
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded border ${
                config.alignment === 'right' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => updateConfig({ alignment: 'right' })}
            >
              →
            </button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
