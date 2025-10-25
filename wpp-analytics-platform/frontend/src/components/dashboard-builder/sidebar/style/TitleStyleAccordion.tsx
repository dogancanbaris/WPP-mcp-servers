import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { ColorPicker } from '@/components/dashboard-builder/shared';

interface TitleStyleConfig {
  text: string;
  show: boolean;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

interface TitleStyleAccordionProps {
  config: TitleStyleConfig;
  onChange: (config: TitleStyleConfig) => void;
}

export const TitleStyleAccordion: React.FC<TitleStyleAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateConfig = (updates: Partial<TitleStyleConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <AccordionItem value="title">
      <AccordionTrigger>Chart Title</AccordionTrigger>
      <AccordionContent className="space-y-4">
        {/* Show Title Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-title">Show title</Label>
          <Toggle
            id="show-title"
            pressed={config.show}
            onPressedChange={(show) => updateConfig({ show })}
          />
        </div>

        {config.show && (
          <>
            {/* Title Text */}
            <div className="space-y-2">
              <Label htmlFor="title-text">Title text</Label>
              <Input
                id="title-text"
                value={config.text}
                onChange={(e) => updateConfig({ text: e.target.value })}
                placeholder="Enter chart title"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label htmlFor="font-size">Font size</Label>
              <Select value={config.fontSize} onValueChange={(fontSize) => updateConfig({ fontSize })}>
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10px</SelectItem>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                  <SelectItem value="24">24px</SelectItem>
                  <SelectItem value="32">32px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <Label htmlFor="font-family">Font family</Label>
              <Select value={config.fontFamily} onValueChange={(fontFamily) => updateConfig({ fontFamily })}>
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="georgia">Georgia</SelectItem>
                  <SelectItem value="times">Times New Roman</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <Label htmlFor="font-weight">Font weight</Label>
              <Select value={config.fontWeight} onValueChange={(fontWeight) => updateConfig({ fontWeight })}>
                <SelectTrigger id="font-weight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light</SelectItem>
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
                value={config.color}
                onChange={(color) => updateConfig({ color })}
              />
            </div>

            {/* Alignment */}
            <div className="space-y-2">
              <Label>Alignment</Label>
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
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
