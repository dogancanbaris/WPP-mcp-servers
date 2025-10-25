import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/dashboard-builder/shared';

interface HeaderFooterConfig {
  showHeader: boolean;
  headerText: string;
  headerFontSize: string;
  headerColor: string;
  headerAlignment: 'left' | 'center' | 'right';
  showFooter: boolean;
  footerText: string;
  footerFontSize: string;
  footerColor: string;
  footerAlignment: 'left' | 'center' | 'right';
}

interface HeaderFooterAccordionProps {
  config: HeaderFooterConfig;
  onChange: (config: HeaderFooterConfig) => void;
}

export const HeaderFooterAccordion: React.FC<HeaderFooterAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateConfig = (updates: Partial<HeaderFooterConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <AccordionItem value="header-footer">
      <AccordionTrigger>Header & Footer</AccordionTrigger>
      <AccordionContent className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="font-semibold text-sm">Header</div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-header">Show header</Label>
            <Toggle
              id="show-header"
              pressed={config.showHeader}
              onPressedChange={(showHeader) => updateConfig({ showHeader })}
            />
          </div>

          {config.showHeader && (
            <>
              <div className="space-y-2">
                <Label htmlFor="header-text">Header text</Label>
                <Input
                  id="header-text"
                  value={config.headerText}
                  onChange={(e) => updateConfig({ headerText: e.target.value })}
                  placeholder="Enter header text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header-font-size">Font size</Label>
                <Select value={config.headerFontSize} onValueChange={(headerFontSize) => updateConfig({ headerFontSize })}>
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

              <div className="space-y-2">
                <Label>Text color</Label>
                <ColorPicker
                  value={config.headerColor}
                  onChange={(headerColor) => updateConfig({ headerColor })}
                />
              </div>

              <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="flex gap-1">
                  <button
                    className={`flex-1 px-3 py-2 rounded border text-sm ${
                      config.headerAlignment === 'left' ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => updateConfig({ headerAlignment: 'left' })}
                  >
                    ←
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 rounded border text-sm ${
                      config.headerAlignment === 'center' ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => updateConfig({ headerAlignment: 'center' })}
                  >
                    ■
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 rounded border text-sm ${
                      config.headerAlignment === 'right' ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => updateConfig({ headerAlignment: 'right' })}
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="font-semibold text-sm">Footer</div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-footer">Show footer</Label>
            <Toggle
              id="show-footer"
              pressed={config.showFooter}
              onPressedChange={(showFooter) => updateConfig({ showFooter })}
            />
          </div>

          {config.showFooter && (
            <>
              <div className="space-y-2">
                <Label htmlFor="footer-text">Footer text</Label>
                <Input
                  id="footer-text"
                  value={config.footerText}
                  onChange={(e) => updateConfig({ footerText: e.target.value })}
                  placeholder="Enter footer text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-font-size">Font size</Label>
                <Select value={config.footerFontSize} onValueChange={(footerFontSize) => updateConfig({ footerFontSize })}>
                  <SelectTrigger id="footer-font-size">
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

              <div className="space-y-2">
                <Label>Text color</Label>
                <ColorPicker
                  value={config.footerColor}
                  onChange={(footerColor) => updateConfig({ footerColor })}
                />
              </div>

              <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="flex gap-1">
                  <button
                    className={`flex-1 px-3 py-2 rounded border text-sm ${
                      config.footerAlignment === 'left' ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => updateConfig({ footerAlignment: 'left' })}
                  >
                    ←
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 rounded border text-sm ${
                      config.footerAlignment === 'center' ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => updateConfig({ footerAlignment: 'center' })}
                  >
                    ■
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 rounded border text-sm ${
                      config.footerAlignment === 'right' ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}
                    onClick={() => updateConfig({ footerAlignment: 'right' })}
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
