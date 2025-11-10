import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ComponentConfig } from '@/types/dashboard-builder';

interface TextContentSetupProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
];

const ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export const TextContentSetup: React.FC<TextContentSetupProps> = ({ config, onUpdate }) => {
  const textValue = config.text || config.title || '';
  const fontSize = String(config.fontSize ?? config.titleFontSize ?? 16);
  const fontFamily = config.fontFamily || config.titleFontFamily || 'Inter';
  const fontWeight = config.fontWeight || config.titleFontWeight || '400';
  const alignment = config.alignment || config.titleAlignment || 'left';
  const color = config.color || config.titleColor || '#111827';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text</Label>
        <Textarea
          rows={5}
          value={textValue}
          onChange={(e) =>
            onUpdate({
              text: e.target.value,
              title: e.target.value,
            })
          }
          placeholder="Enter text content..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Font family</Label>
          <Input
            value={fontFamily}
            onChange={(e) =>
              onUpdate({
                fontFamily: e.target.value,
                titleFontFamily: e.target.value,
              })
            }
            placeholder="Inter, Roboto, ..."
          />
        </div>
        <div className="space-y-2">
          <Label>Font size (px)</Label>
          <Input
            type="number"
            min={8}
            max={96}
            value={fontSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              onUpdate({
                fontSize: value,
                titleFontSize: value,
              });
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Font weight</Label>
          <Select
            value={fontWeight}
            onValueChange={(value) =>
              onUpdate({
                fontWeight: value,
                titleFontWeight: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHTS.map((weight) => (
                <SelectItem key={weight.value} value={weight.value}>
                  {weight.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Alignment</Label>
          <Select
            value={alignment}
            onValueChange={(value) =>
              onUpdate({
                alignment: value,
                titleAlignment: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALIGNMENTS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Text color</Label>
        <Input
          type="color"
          value={color}
          onChange={(e) =>
            onUpdate({
              color: e.target.value,
              titleColor: e.target.value,
            })
          }
          className="h-10"
        />
      </div>
    </div>
  );
};
