import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDashboardStore } from '@/store/dashboardStore';
import type { CanvasComponent } from '@/types/dashboard-builder';
import { getComponentBehavior } from './component-behavior';
import { useDataSources } from '@/hooks/useDataSources';

interface MultiSelectPanelProps {
  selectedItems: CanvasComponent[];
}

export const MultiSelectPanel: React.FC<MultiSelectPanelProps> = ({ selectedItems }) => {
  const deselectAll = useDashboardStore((s) => s.deselectAll);
  const bulkUpdate = useDashboardStore((s) => s.bulkUpdateComponents);
  const bulkSetLock = useDashboardStore((s) => s.bulkSetLock);
  const { dataSources } = useDataSources();

  const componentIds = useMemo(
    () => selectedItems.map((item) => item.component.id).filter(Boolean),
    [selectedItems]
  );

  const summary = useMemo(() => {
    const counts = new Map<string, number>();
    selectedItems.forEach((item) => {
      const behavior = getComponentBehavior(item.component.type);
      counts.set(behavior.category, (counts.get(behavior.category) || 0) + 1);
    });
    return Array.from(counts.entries());
  }, [selectedItems]);

  const allDataCapable = useMemo(() => {
    return selectedItems.every((item) => {
      const behavior = getComponentBehavior(item.component.type);
      return behavior.setupVariant === 'data';
    });
  }, [selectedItems]);

  const sharedDatasource = useMemo(() => {
    if (!allDataCapable) return '';
    const datasources = selectedItems
      .map((item) => item.component.dataset_id || item.component.datasource)
      .filter(Boolean);
    if (datasources.length === 0) return '';
    return datasources.every((ds) => ds === datasources[0]) ? (datasources[0] as string) : '';
  }, [selectedItems, allDataCapable]);

  const areAllLocked = selectedItems.every((item) => item.component.locked);

  if (selectedItems.length < 2) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-background space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Multi-select</p>
            <p className="text-lg font-semibold text-foreground">{selectedItems.length} components selected</p>
          </div>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Clear selection
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.map(([category, count]) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category} • {count}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {allDataCapable && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Data source</p>
              {sharedDatasource === '' && (
                <span className="text-xs text-muted-foreground">Mixed</span>
              )}
            </div>
            <Select
              value={sharedDatasource || ''}
              onValueChange={(value) => {
                const source = dataSources.find((ds) => ds.id === value);
                bulkUpdate(componentIds, {
                  dataset_id: value,
                  datasource: source?.table || source?.name || value,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Locking</p>
          <div className="flex gap-2">
            <Button
              variant={areAllLocked ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => bulkSetLock(componentIds, true)}
            >
              Lock
            </Button>
            <Button
              variant={!areAllLocked ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => bulkSetLock(componentIds, false)}
            >
              Unlock
            </Button>
          </div>
        </div>

        {!allDataCapable && (
          <Alert>
            <AlertDescription className="text-xs text-muted-foreground">
              Data source changes are only available when all selected components are data visuals.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
