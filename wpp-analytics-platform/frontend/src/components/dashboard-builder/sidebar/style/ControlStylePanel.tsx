import { ComponentConfig } from '@/types/dashboard-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface ControlStylePanelProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

export const ControlStylePanel: React.FC<ControlStylePanelProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Label Font Size</Label>
          <Input
            type="number"
            min={10}
            max={32}
            value={config.fontSize ?? '14'}
            onChange={(e) => onUpdate({ fontSize: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Label Color</Label>
          <Input
            type="color"
            value={config.color || '#475569'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-9 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Background</Label>
          <Input
            type="color"
            value={config.backgroundColor || '#FFFFFF'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value, showBorder: true })}
            className="h-9 cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Border Color</Label>
          <Input
            type="color"
            value={config.borderColor || '#CBD5F5'}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="h-9 cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Padding</Label>
        <Input
          type="number"
          min={0}
          max={32}
          value={config.padding ?? 8}
          onChange={(e) => onUpdate({ padding: Number(e.target.value) })}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Show Label</p>
          <p className="text-[11px] text-muted-foreground/80">Toggle control label visibility</p>
        </div>
        <Switch
          checked={config.showTitle ?? true}
          onCheckedChange={(checked) => onUpdate({ showTitle: checked })}
        />
      </div>
    </div>
  );
};
