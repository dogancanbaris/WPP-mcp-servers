import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/dashboard-builder/shared';
import { Accordion } from '@/components/ui/accordion';

interface DimensionStyle {
  id: string;
  name: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: string;
  fontWeight: string;
  textColor: string;
}

interface DimensionStyleConfig {
  dimensions: DimensionStyle[];
}

interface DimensionStyleAccordionProps {
  config: DimensionStyleConfig;
  onChange: (config: DimensionStyleConfig) => void;
}

export const DimensionStyleAccordion: React.FC<DimensionStyleAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateDimension = (dimensionId: string, updates: Partial<DimensionStyle>) => {
    onChange({
      dimensions: config.dimensions.map(d =>
        d.id === dimensionId ? { ...d, ...updates } : d
      ),
    });
  };

  return (
    <AccordionItem value="dimensions">
      <AccordionTrigger>Dimension Styles</AccordionTrigger>
      <AccordionContent>
        {config.dimensions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No dimensions configured. Add dimensions in the Setup tab.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {config.dimensions.map((dimension, idx) => (
              <AccordionItem key={dimension.id} value={dimension.id}>
                <AccordionTrigger className="text-sm">
                  Dimension #{idx + 1}: {dimension.name}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {/* Alignment */}
                  <div className="space-y-2">
                    <Label>Alignment</Label>
                    <div className="flex gap-1">
                      <button
                        className={`flex-1 px-3 py-2 rounded border text-sm ${
                          dimension.alignment === 'left' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                        onClick={() => updateDimension(dimension.id, { alignment: 'left' })}
                      >
                        ←
                      </button>
                      <button
                        className={`flex-1 px-3 py-2 rounded border text-sm ${
                          dimension.alignment === 'center' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                        onClick={() => updateDimension(dimension.id, { alignment: 'center' })}
                      >
                        ■
                      </button>
                      <button
                        className={`flex-1 px-3 py-2 rounded border text-sm ${
                          dimension.alignment === 'right' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                        onClick={() => updateDimension(dimension.id, { alignment: 'right' })}
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <Label htmlFor={`dim-font-${dimension.id}`}>Font size</Label>
                    <Select value={dimension.fontSize} onValueChange={(fontSize) => updateDimension(dimension.id, { fontSize })}>
                      <SelectTrigger id={`dim-font-${dimension.id}`}>
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

                  {/* Font Weight */}
                  <div className="space-y-2">
                    <Label htmlFor={`dim-weight-${dimension.id}`}>Font weight</Label>
                    <Select value={dimension.fontWeight} onValueChange={(fontWeight) => updateDimension(dimension.id, { fontWeight })}>
                      <SelectTrigger id={`dim-weight-${dimension.id}`}>
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
                      value={dimension.textColor}
                      onChange={(textColor) => updateDimension(dimension.id, { textColor })}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
