import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/dashboard-builder/shared';
import { Plus, Trash2 } from 'lucide-react';

interface FormattingRule {
  id: string;
  metric: string;
  condition: 'greater' | 'less' | 'equal' | 'between';
  value: number;
  value2?: number;
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: string;
}

interface ConditionalFormattingConfig {
  rules: FormattingRule[];
}

interface ConditionalFormattingAccordionProps {
  config: ConditionalFormattingConfig;
  metrics: Array<{ id: string; name: string }>;
  onChange: (config: ConditionalFormattingConfig) => void;
}

export const ConditionalFormattingAccordion: React.FC<ConditionalFormattingAccordionProps> = ({
  config,
  metrics,
  onChange,
}) => {
  const addRule = () => {
    const newRule: FormattingRule = {
      id: `rule-${Date.now()}`,
      metric: metrics[0]?.id || '',
      condition: 'greater',
      value: 0,
      backgroundColor: '#ffffff',
      textColor: '#000000',
    };
    onChange({ rules: [...config.rules, newRule] });
  };

  const removeRule = (ruleId: string) => {
    onChange({ rules: config.rules.filter(r => r.id !== ruleId) });
  };

  const updateRule = (ruleId: string, updates: Partial<FormattingRule>) => {
    onChange({
      rules: config.rules.map(r =>
        r.id === ruleId ? { ...r, ...updates } : r
      ),
    });
  };

  return (
    <AccordionItem value="conditional-formatting">
      <AccordionTrigger>Conditional Formatting</AccordionTrigger>
      <AccordionContent className="space-y-4">
        {config.rules.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No formatting rules. Add rules to highlight cells based on values.
          </p>
        )}

        {config.rules.map((rule, idx) => (
          <div key={rule.id} className="p-3 border rounded space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Rule #{idx + 1}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Metric Selection */}
            <div className="space-y-2">
              <Label>Apply to metric</Label>
              <Select value={rule.metric} onValueChange={(metric) => updateRule(rule.id, { metric })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={rule.condition} onValueChange={(condition) => updateRule(rule.id, { condition: condition as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greater">Greater than</SelectItem>
                  <SelectItem value="less">Less than</SelectItem>
                  <SelectItem value="equal">Equal to</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value(s) */}
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                type="number"
                value={rule.value}
                onChange={(e) => updateRule(rule.id, { value: Number(e.target.value) })}
              />
              {rule.condition === 'between' && (
                <Input
                  type="number"
                  value={rule.value2 || 0}
                  onChange={(e) => updateRule(rule.id, { value2: Number(e.target.value) })}
                  placeholder="Upper bound"
                />
              )}
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label>Background color</Label>
              <ColorPicker
                value={rule.backgroundColor || '#ffffff'}
                onChange={(backgroundColor) => updateRule(rule.id, { backgroundColor })}
              />
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label>Text color</Label>
              <ColorPicker
                value={rule.textColor || '#000000'}
                onChange={(textColor) => updateRule(rule.id, { textColor })}
              />
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <Label>Font weight</Label>
              <Select value={rule.fontWeight || '400'} onValueChange={(fontWeight) => updateRule(rule.id, { fontWeight })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">Normal</SelectItem>
                  <SelectItem value="600">Semi-bold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        <Button onClick={addRule} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Formatting Rule
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
};
