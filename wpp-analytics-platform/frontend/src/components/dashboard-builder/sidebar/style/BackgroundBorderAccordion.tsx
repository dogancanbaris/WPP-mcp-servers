import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/dashboard-builder/shared';
import { Toggle } from '@/components/ui/toggle';

interface BackgroundBorderConfig {
  backgroundColor: string;
  showBorder: boolean;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  showShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  padding: number;
}

interface BackgroundBorderAccordionProps {
  config: BackgroundBorderConfig;
  onChange: (config: BackgroundBorderConfig) => void;
}

export const BackgroundBorderAccordion: React.FC<BackgroundBorderAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateConfig = (updates: Partial<BackgroundBorderConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <AccordionItem value="background-border">
      <AccordionTrigger>Background & Border</AccordionTrigger>
      <AccordionContent className="space-y-4">
        {/* Background Color */}
        <div className="space-y-2">
          <Label>Background color</Label>
          <ColorPicker
            value={config.backgroundColor}
            onChange={(backgroundColor) => updateConfig({ backgroundColor })}
          />
        </div>

        {/* Show Border */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-border">Show border</Label>
          <Toggle
            id="show-border"
            pressed={config.showBorder}
            onPressedChange={(showBorder) => updateConfig({ showBorder })}
          />
        </div>

        {config.showBorder && (
          <>
            {/* Border Color */}
            <div className="space-y-2">
              <Label>Border color</Label>
              <ColorPicker
                value={config.borderColor}
                onChange={(borderColor) => updateConfig({ borderColor })}
              />
            </div>

            {/* Border Width */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border width</Label>
                <span className="text-sm text-muted-foreground">{config.borderWidth}px</span>
              </div>
              <Slider
                value={[config.borderWidth]}
                onValueChange={([borderWidth]) => updateConfig({ borderWidth })}
                min={1}
                max={10}
                step={1}
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border radius</Label>
                <span className="text-sm text-muted-foreground">{config.borderRadius}px</span>
              </div>
              <Slider
                value={[config.borderRadius]}
                onValueChange={([borderRadius]) => updateConfig({ borderRadius })}
                min={0}
                max={20}
                step={1}
              />
            </div>
          </>
        )}

        {/* Show Shadow */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-shadow">Show shadow</Label>
          <Toggle
            id="show-shadow"
            pressed={config.showShadow}
            onPressedChange={(showShadow) => updateConfig({ showShadow })}
          />
        </div>

        {config.showShadow && (
          <>
            {/* Shadow Color */}
            <div className="space-y-2">
              <Label>Shadow color</Label>
              <ColorPicker
                value={config.shadowColor}
                onChange={(shadowColor) => updateConfig({ shadowColor })}
              />
            </div>

            {/* Shadow Blur */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Shadow blur</Label>
                <span className="text-sm text-muted-foreground">{config.shadowBlur}px</span>
              </div>
              <Slider
                value={[config.shadowBlur]}
                onValueChange={([shadowBlur]) => updateConfig({ shadowBlur })}
                min={0}
                max={30}
                step={1}
              />
            </div>
          </>
        )}

        {/* Padding */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Chart padding</Label>
            <span className="text-sm text-muted-foreground">{config.padding}px</span>
          </div>
          <Slider
            value={[config.padding]}
            onValueChange={([padding]) => updateConfig({ padding })}
            min={0}
            max={40}
            step={4}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
