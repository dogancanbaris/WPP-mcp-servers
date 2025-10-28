import React from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paintbrush } from 'lucide-react';

interface PageStylePanelProps {
  pageId: string;
}

export function PageStylePanel({ pageId }: PageStylePanelProps) {
  const { config, setPageStyles } = useDashboardStore();
  const page = config?.pages?.find(p => p.id === pageId);
  const pageStyles = page?.pageStyles || {};

  const updateStyle = (key: string, value: any) => {
    setPageStyles(pageId, {
      ...pageStyles,
      [key]: value,
    });
  };

  const resetToGlobal = () => {
    setPageStyles(pageId, {});
  };

  return (
    <div className="page-style-panel space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Paintbrush size={16} />
          Page Styles
        </Label>
        <Button variant="ghost" size="sm" onClick={resetToGlobal}>
          Reset
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="bg-color" className="text-xs">Background Color</Label>
          <Input
            id="bg-color"
            type="color"
            value={pageStyles.backgroundColor || '#FFFFFF'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="h-10"
          />
        </div>

        <div>
          <Label htmlFor="padding" className="text-xs">Padding (px)</Label>
          <Input
            id="padding"
            type="number"
            value={pageStyles.padding || 24}
            onChange={(e) => updateStyle('padding', parseInt(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="gap" className="text-xs">Gap (px)</Label>
          <Input
            id="gap"
            type="number"
            value={pageStyles.gap || 16}
            onChange={(e) => updateStyle('gap', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
