import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ColorPicker } from '@/components/dashboard-builder/shared';
import { Accordion } from '@/components/ui/accordion';

interface MetricStyle {
  id: string;
  name: string;
  format: 'auto' | 'number' | 'percent' | 'currency' | 'duration';
  decimals: number;
  compact: boolean;
  alignment: 'left' | 'center' | 'right';
  textColor: string;
  fontWeight: string;
  showComparison: boolean;
  compareVs?: 'previous' | 'custom' | 'target';
  showBars: boolean;
  barColor?: string;
}

interface MetricStyleConfig {
  metrics: MetricStyle[];
}

interface MetricStyleAccordionProps {
  config: MetricStyleConfig;
  onChange: (config: MetricStyleConfig) => void;
}

export const MetricStyleAccordion: React.FC<MetricStyleAccordionProps> = ({
  config,
  onChange,
}) => {
  const updateMetric = (metricId: string, updates: Partial<MetricStyle>) => {
    onChange({
      metrics: config.metrics.map(m =>
        m.id === metricId ? { ...m, ...updates } : m
      ),
    });
  };

  return (
    <AccordionItem value="metrics">
      <AccordionTrigger>Metric Styles</AccordionTrigger>
      <AccordionContent>
        {config.metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No metrics configured. Add metrics in the Setup tab.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {config.metrics.map((metric, idx) => (
              <AccordionItem key={metric.id} value={metric.id}>
                <AccordionTrigger className="text-sm">
                  Metric #{idx + 1}: {metric.name}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {/* Number Format */}
                  <div className="space-y-2">
                    <Label>Number format</Label>
                    <RadioGroup value={metric.format} onValueChange={(format) => updateMetric(metric.id, { format: format as any })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id={`${metric.id}-auto`} />
                        <Label htmlFor={`${metric.id}-auto`} className="font-normal">Auto (1,234)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="number" id={`${metric.id}-number`} />
                        <Label htmlFor={`${metric.id}-number`} className="font-normal">Number (1,234)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percent" id={`${metric.id}-percent`} />
                        <Label htmlFor={`${metric.id}-percent`} className="font-normal">Percent (12.34%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="currency" id={`${metric.id}-currency`} />
                        <Label htmlFor={`${metric.id}-currency`} className="font-normal">Currency ($1,234)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="duration" id={`${metric.id}-duration`} />
                        <Label htmlFor={`${metric.id}-duration`} className="font-normal">Duration (1:23:45)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Decimal Places */}
                  <div className="space-y-2">
                    <Label htmlFor={`${metric.id}-decimals`}>Decimal places</Label>
                    <Select value={String(metric.decimals)} onValueChange={(decimals) => updateMetric(metric.id, { decimals: Number(decimals) })}>
                      <SelectTrigger id={`${metric.id}-decimals`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 decimals</SelectItem>
                        <SelectItem value="1">1 decimal</SelectItem>
                        <SelectItem value="2">2 decimals</SelectItem>
                        <SelectItem value="3">3 decimals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Compact Numbers */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${metric.id}-compact`}>Compact numbers (1.2K)</Label>
                    <Toggle
                      id={`${metric.id}-compact`}
                      pressed={metric.compact}
                      onPressedChange={(compact) => updateMetric(metric.id, { compact })}
                    />
                  </div>

                  {/* Alignment */}
                  <div className="space-y-2">
                    <Label>Alignment</Label>
                    <div className="flex gap-1">
                      <button
                        className={`flex-1 px-3 py-2 rounded border text-sm ${
                          metric.alignment === 'left' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                        onClick={() => updateMetric(metric.id, { alignment: 'left' })}
                      >
                        ←
                      </button>
                      <button
                        className={`flex-1 px-3 py-2 rounded border text-sm ${
                          metric.alignment === 'center' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                        onClick={() => updateMetric(metric.id, { alignment: 'center' })}
                      >
                        ■
                      </button>
                      <button
                        className={`flex-1 px-3 py-2 rounded border text-sm ${
                          metric.alignment === 'right' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                        onClick={() => updateMetric(metric.id, { alignment: 'right' })}
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label>Text color</Label>
                    <ColorPicker
                      value={metric.textColor}
                      onChange={(textColor) => updateMetric(metric.id, { textColor })}
                    />
                  </div>

                  {/* Font Weight */}
                  <div className="space-y-2">
                    <Label htmlFor={`${metric.id}-weight`}>Font weight</Label>
                    <Select value={metric.fontWeight} onValueChange={(fontWeight) => updateMetric(metric.id, { fontWeight })}>
                      <SelectTrigger id={`${metric.id}-weight`}>
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

                  {/* Show Comparison */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${metric.id}-comparison`}>Show comparison</Label>
                    <Toggle
                      id={`${metric.id}-comparison`}
                      pressed={metric.showComparison}
                      onPressedChange={(showComparison) => updateMetric(metric.id, { showComparison })}
                    />
                  </div>

                  {metric.showComparison && (
                    <div className="space-y-2 pl-4">
                      <Label htmlFor={`${metric.id}-comparevs`}>Compare vs</Label>
                      <Select value={metric.compareVs || 'previous'} onValueChange={(compareVs) => updateMetric(metric.id, { compareVs: compareVs as any })}>
                        <SelectTrigger id={`${metric.id}-comparevs`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="previous">Previous period</SelectItem>
                          <SelectItem value="custom">Custom date</SelectItem>
                          <SelectItem value="target">Target value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Show Bars in Cell */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${metric.id}-bars`}>Show bars in cell</Label>
                    <Toggle
                      id={`${metric.id}-bars`}
                      pressed={metric.showBars}
                      onPressedChange={(showBars) => updateMetric(metric.id, { showBars })}
                    />
                  </div>

                  {metric.showBars && (
                    <div className="space-y-2 pl-4">
                      <Label>Bar color</Label>
                      <ColorPicker
                        value={metric.barColor || '#3b82f6'}
                        onChange={(barColor) => updateMetric(metric.id, { barColor })}
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
