import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChartSetup } from './setup/ChartSetup';
import { ChartStyle } from './style/ChartStyle';
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

  const [activeTab, setActiveTab] = useState<'setup' | 'style'>('setup');

  // Sync active tab from store if provided
  useEffect(() => {
    if (sidebarActiveTab) {
      setActiveTab(sidebarActiveTab);
    }
  }, [sidebarActiveTab]);

  const formattedType = effectiveSelectedComponent?.type
    ? effectiveSelectedComponent.type
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '';

  return (
    <aside className="w-80 border-l bg-surface dashboard-sidebar h-full fade-in flex flex-col">
      {/* Simple Header - Looker Studio Style */}
      <div className="px-4 py-3 border-b bg-background">
        <h3 className="text-sm font-semibold text-foreground">
          {isMultiSelect
            ? `${selectedCanvasComponents.length} components selected`
            : effectiveSelectedComponent
            ? effectiveSelectedComponent.title || formattedType || 'Untitled Component'
            : currentPage?.name || 'Page Settings'}
        </h3>
        {effectiveSelectedComponent && (effectiveSelectedComponent.dataset_id || effectiveSelectedComponent.datasource) && (
          <p className="text-xs text-muted-foreground mt-1">
            {effectiveSelectedComponent.datasource || effectiveSelectedComponent.dataset_id}
          </p>
        )}
      </div>

      {/* Main Content - Always Show Setup/Style Tabs (Looker Studio Pattern) */}
      <div className="flex-1 overflow-y-auto">
        {isMultiSelect ? (
          <MultiSelectPanel selectedItems={selectedCanvasComponents} />
        ) : (
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
              {effectiveSelectedComponent ? (
                <ChartSetup
                  config={effectiveSelectedComponent}
                  onUpdate={(updates) => onUpdateComponent(effectiveSelectedComponent.id, updates)}
                />
              ) : (
                <PagePanel />
              )}
            </TabsContent>

            <TabsContent value="style" className="mt-4 space-y-6">
              {effectiveSelectedComponent ? (
                <ChartStyle
                  config={effectiveSelectedComponent}
                  onUpdate={(updates) => onUpdateComponent(effectiveSelectedComponent.id, updates)}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Page-level styling options will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </aside>
  );
};
