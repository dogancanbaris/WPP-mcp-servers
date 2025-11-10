import { ComponentConfig } from '@/types/dashboard-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ShapeStylePanelProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

export const ShapeStylePanel: React.FC<ShapeStylePanelProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Fill Color</Label>
        <Input
          type="color"
          value={config.backgroundColor || '#2563EB'}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="h-9 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Border Color</Label>
          <Input
            type="color"
            value={config.borderColor || '#1E3A8A'}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="h-9 cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Border Width</Label>
          <Input
            type="number"
            min={0}
            max={16}
            value={config.borderWidth ?? 2}
            onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Corner Radius</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={config.borderRadius ?? 4}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
        />
      </div>
    </div>
  );
};
