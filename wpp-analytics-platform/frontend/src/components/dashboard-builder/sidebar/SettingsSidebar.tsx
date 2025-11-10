import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChartSetup } from './setup/ChartSetup';
import { ChartStyle } from './style/ChartStyle';
import { ComponentFilterAccordion } from '@/components/dashboard-builder/ComponentFilterAccordion';
import { ComponentConfig } from '@/types/dashboard-builder';
import { PagePanel } from './page/PagePanel';
import { useCurrentPageId, usePages, useDashboardStore } from '@/store/dashboardStore';
import { MultiSelectPanel } from './MultiSelectPanel';

interface SettingsSidebarProps {
  selectedComponent?: ComponentConfig;
  onUpdateComponent: (id: string, updates: Partial<ComponentConfig>) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  selectedComponent,
  onUpdateComponent,
}) => {
  const currentPageId = useCurrentPageId();
  const pages = usePages();
  const currentPage = useMemo(
    () => pages?.find((p) => p.id === currentPageId),
    [pages, currentPageId]
  );
  const sidebarScope = useDashboardStore((s) => s.sidebarScope);
  const sidebarActiveTab = useDashboardStore((s) => s.sidebarActiveTab);
  const selectedCanvasSet = useDashboardStore((s) => s.selectedCanvasIds);

  const selectedCanvasComponents = useMemo(() => {
    if (!currentPage?.components || !selectedCanvasSet?.size) return [];
    const ids = Array.from(selectedCanvasSet);
    return currentPage.components.filter(
      (canvasComp) => ids.includes(canvasComp.id) || ids.includes(canvasComp.component.id)
    );
  }, [currentPage?.components, selectedCanvasSet]);

  const effectiveSelectedComponent =
    selectedComponent || selectedCanvasComponents[0]?.component || undefined;
  const isMultiSelect = selectedCanvasComponents.length > 1;

  const [scope, setScope] = useState<'page' | 'component'>(
    effectiveSelectedComponent ? 'component' : 'page'
  );
  const [activeTab, setActiveTab] = useState<'setup' | 'style'>('setup');

  useEffect(() => {
    setScope(effectiveSelectedComponent ? 'component' : 'page');
  }, [effectiveSelectedComponent]);

  useEffect(() => {
    if (!effectiveSelectedComponent && scope !== 'page') {
      setScope('page');
    }
  }, [currentPageId, scope, effectiveSelectedComponent]);

  useEffect(() => {
    if (sidebarScope === 'page') {
      setScope('page');
    } else if (sidebarScope === 'component' && effectiveSelectedComponent) {
      setScope('component');
    }
  }, [sidebarScope, effectiveSelectedComponent]);

  useEffect(() => {
    if (scope === 'component' && sidebarActiveTab) {
      setActiveTab(sidebarActiveTab);
    }
  }, [sidebarActiveTab, scope]);

  const formattedType = effectiveSelectedComponent?.type
    ? effectiveSelectedComponent.type
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '';

  return (
    <aside className="w-80 border-l bg-surface dashboard-sidebar h-full fade-in flex flex-col">
      <div className="p-3 border-b bg-background space-y-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          Settings
        </p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <Button
            variant={scope === 'page' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setScope('page')}
          >
            Page{currentPage ? `: ${currentPage.name}` : ''}
          </Button>
          <Button
            variant={scope === 'component' ? 'default' : 'outline'}
            size="sm"
            onClick={() => effectiveSelectedComponent && setScope('component')}
            disabled={!effectiveSelectedComponent && !isMultiSelect}
          >
            Component
            {isMultiSelect
              ? `: ${selectedCanvasComponents.length} selected`
              : effectiveSelectedComponent
              ? `: ${effectiveSelectedComponent.title || formattedType}`
              : ''}
          </Button>
        </div>
      </div>

      {scope === 'page' && (
        <div className="flex-1 overflow-y-auto">
          <PagePanel />
        </div>
      )}

      {scope === 'component' && (
        <div className="flex-1 overflow-y-auto">
          {isMultiSelect ? (
            <MultiSelectPanel selectedItems={selectedCanvasComponents} />
          ) : effectiveSelectedComponent ? (
            <>
              <div className="px-4 py-3 border-b bg-background space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Component</p>
                <p className="text-sm font-semibold text-foreground">
                  {effectiveSelectedComponent.title || formattedType || 'Untitled Component'}
                </p>
                {(effectiveSelectedComponent.dataset_id || effectiveSelectedComponent.datasource) && (
                  <p className="text-xs text-muted-foreground">
                    Source • {effectiveSelectedComponent.datasource || effectiveSelectedComponent.dataset_id}
                  </p>
                )}
              </div>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'setup' | 'style')}
                className="w-full px-4 py-4"
              >
                <TabsList className="grid w-full grid-cols-2 bg-muted/40 rounded-md">
                  <TabsTrigger value="setup" className="text-xs">
                    Setup
                  </TabsTrigger>
                  <TabsTrigger value="style" className="text-xs">
                    Style
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="setup" className="mt-4 space-y-6">
                  <ChartSetup
                    config={effectiveSelectedComponent}
                    onUpdate={(updates) => onUpdateComponent(effectiveSelectedComponent.id, updates)}
                  />
                  <ComponentFilterAccordion
                    componentConfig={effectiveSelectedComponent}
                    onUpdate={(updates) => onUpdateComponent(effectiveSelectedComponent.id, updates)}
                  />
                </TabsContent>

                <TabsContent value="style" className="mt-4 space-y-6">
                  <ChartStyle
                    config={effectiveSelectedComponent}
                    onUpdate={(updates) => onUpdateComponent(effectiveSelectedComponent.id, updates)}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="p-4 text-xs text-muted-foreground">
              Select a component to edit its settings.
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
