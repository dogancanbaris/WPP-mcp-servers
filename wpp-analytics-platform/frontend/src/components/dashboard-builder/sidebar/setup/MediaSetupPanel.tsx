import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ComponentConfig } from '@/types/dashboard-builder';

interface MediaSetupPanelProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

const OBJECT_FIT_OPTIONS = ['cover', 'contain', 'fill', 'none', 'scale-down'] as const;

export const MediaSetupPanel: React.FC<MediaSetupPanelProps> = ({ config, onUpdate }) => {
  const objectFit = (config as any).objectFit || 'cover';
  const width = (config as any).width;
  const height = (config as any).height;
  const src = (config as any).src || (config as any).url || '';
  const alt = (config as any).alt || '';
  const link = (config as any).link || '';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={src}
          onChange={(e) => onUpdate({ src: e.target.value, url: e.target.value })}
          placeholder="https://example.com/image.png"
        />
      </div>

      <div className="space-y-2">
        <Label>Alt text</Label>
        <Input
          value={alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Describe the image"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Width (px)</Label>
          <Input
            type="number"
            min={0}
            value={width ?? ''}
            onChange={(e) =>
              onUpdate({
                width: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Height (px)</Label>
          <Input
            type="number"
            min={0}
            value={height ?? ''}
            onChange={(e) =>
              onUpdate({
                height: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Object fit</Label>
        <Select
          value={objectFit}
          onValueChange={(value) => onUpdate({ objectFit: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OBJECT_FIT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Link (optional)</Label>
        <Input
          value={link}
          onChange={(e) => onUpdate({ link: e.target.value || undefined })}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};
