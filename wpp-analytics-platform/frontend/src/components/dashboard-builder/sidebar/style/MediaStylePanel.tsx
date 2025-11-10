import { ComponentConfig } from '@/types/dashboard-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface MediaStylePanelProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

export const MediaStylePanel: React.FC<MediaStylePanelProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Border Radius</Label>
          <Input
            type="number"
            min={0}
            max={64}
            value={config.borderRadius ?? 8}
            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Padding</Label>
          <Input
            type="number"
            min={0}
            max={64}
            value={config.padding ?? 0}
            onChange={(e) => onUpdate({ padding: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Border Color</Label>
          <Input
            type="color"
            value={config.borderColor || '#E5E7EB'}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="h-9 cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Background</Label>
          <Input
            type="color"
            value={config.backgroundColor || '#FFFFFF'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="h-9 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Shadow</p>
          <p className="text-[11px] text-muted-foreground/80">Add subtle drop shadow</p>
        </div>
        <Switch
          checked={!!config.showShadow}
          onCheckedChange={(checked) =>
            onUpdate({
              showShadow: checked,
              shadowColor: config.shadowColor || '#00000015',
              shadowBlur: config.shadowBlur ?? 12,
            })
          }
        />
      </div>
    </div>
  );
};
