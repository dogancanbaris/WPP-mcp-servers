import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ComponentConfig } from '@/types/dashboard-builder';

interface ShapeSetupPanelProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

export const ShapeSetupPanel: React.FC<ShapeSetupPanelProps> = ({ config, onUpdate }) => {
  const fillColor = (config as any).fillColor || config.backgroundColor || '#2563eb20';
  const borderColor = (config as any).borderColor || '#2563eb';
  const borderWidth = (config as any).borderWidth ?? 0;
  const borderRadius = (config as any).borderRadius ?? 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fill color</Label>
        <Input
          type="color"
          value={fillColor}
          onChange={(e) => onUpdate({ fillColor: e.target.value, backgroundColor: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Border color</Label>
          <Input
            type="color"
            value={borderColor}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label>Border width (px)</Label>
          <Input
            type="number"
            min={0}
            value={borderWidth}
            onChange={(e) =>
              onUpdate({
                borderWidth: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Border radius (px)</Label>
        <Input
          type="number"
          min={0}
          value={borderRadius}
          onChange={(e) =>
            onUpdate({
              borderRadius: Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
};
