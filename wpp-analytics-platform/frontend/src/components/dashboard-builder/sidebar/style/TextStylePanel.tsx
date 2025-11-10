import { ComponentConfig } from '@/types/dashboard-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const FONT_WEIGHTS = ['300', '400', '500', '600', '700'];
const ALIGNMENTS: Array<{ label: string; value: ComponentConfig['alignment'] }> = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  { label: 'Justify', value: 'justify' },
];

interface TextStylePanelProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

export const TextStylePanel: React.FC<TextStylePanelProps> = ({ config, onUpdate }) => {
  const handleInputChange = (key: keyof ComponentConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onUpdate({ [key]: value });
  };

  const handleAlignmentChange = (value: ComponentConfig['alignment']) => {
    onUpdate({ alignment: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Font Family</Label>
          <Input
            value={config.fontFamily || 'Roboto'}
            onChange={handleInputChange('fontFamily')}
            placeholder="e.g., Roboto"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Font Size</Label>
          <Input
            type="number"
            min={8}
            max={96}
            value={config.fontSize || '16'}
            onChange={handleInputChange('fontSize')}
            placeholder="16"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Font Weight</Label>
          <Select
            value={config.fontWeight || '400'}
            onValueChange={(value) => onUpdate({ fontWeight: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHTS.map((weight) => (
                <SelectItem key={weight} value={weight}>
                  {weight}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Alignment</Label>
          <Select
            value={config.alignment || 'left'}
            onValueChange={(value) => handleAlignmentChange(value as ComponentConfig['alignment'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALIGNMENTS.map((option) => (
                <SelectItem key={option.value} value={option.value || 'left'}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Text Color</Label>
          <Input
            type="color"
            value={config.color || '#111827'}
            onChange={handleInputChange('color')}
            className={cn('h-9 cursor-pointer')}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Background</Label>
          <Input
            type="color"
            value={config.backgroundColor || '#ffffff'}
            onChange={handleInputChange('backgroundColor')}
            className={cn('h-9 cursor-pointer')}
          />
        </div>
      </div>
    </div>
  );
};
