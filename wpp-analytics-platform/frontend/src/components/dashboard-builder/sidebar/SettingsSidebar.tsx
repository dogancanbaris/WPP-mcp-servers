import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChartSetup } from './setup/ChartSetup';
import { ChartStyle } from './style/ChartStyle';
import { FiltersTab } from './filters/FiltersTab';
import { ComponentConfig } from '@/types/dashboard-builder';
import { GlobalPanel } from './global/GlobalPanel';
import { PagePanel } from './page/PagePanel';
import { useCurrentPageId, usePages } from '@/store/dashboardStore';

interface SettingsSidebarProps {
  selectedComponent?: ComponentConfig;
  onUpdateComponent: (id: string, updates: Partial<ComponentConfig>) => void;
}

// SettingsSidebar — Unified scope (Global | Page | Component)
export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  selectedComponent,
  onUpdateComponent
}) => {
  const currentPageId = useCurrentPageId();
  const pages = usePages();
  const currentPage = useMemo(() => pages?.find(p => p.id === currentPageId), [pages, currentPageId]);

  const [scope, setScope] = useState<'global'|'page'|'component'>(selectedComponent ? 'component' : 'page');

  // Auto-switch based on selection changes
  useEffect(() => {
    if (selectedComponent) setScope('component');
    else setScope('page');
  }, [selectedComponent]);

  // Auto-switch to Page scope when page changes and no component is selected
  useEffect(() => {
    if (!selectedComponent && scope !== 'page') {
      setScope('page');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId]);

  // Format component type for display (e.g., "bar-chart" -> "Bar Chart")
  const formattedType = selectedComponent?.type
    ? selectedComponent.type.split('-').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ')
    : '';

  return (
    <div className="w-80 border-l bg-surface dashboard-sidebar overflow-y-auto h-full fade-in">
      {/* Scope Selector */}
      <div className="p-3 border-b bg-background">
        <div className="grid grid-cols-3 gap-1 text-xs">
          <Button variant={scope==='global'?'default':'outline'} size="sm" onClick={()=>setScope('global')}>Global</Button>
          <Button variant={scope==='page'?'default':'outline'} size="sm" onClick={()=>setScope('page')}>
            Page{currentPage ? `: ${currentPage.name}`:''}
          </Button>
          <Button variant={scope==='component'?'default':'outline'} size="sm" onClick={()=> selectedComponent && setScope('component')} disabled={!selectedComponent}>
            Component{selectedComponent ? `: ${selectedComponent.title || formattedType}`:''}
          </Button>
        </div>
      </div>

      {/* Scope Panels */}
      {scope === 'global' && <GlobalPanel />}
      {scope === 'page' && <PagePanel />}
      {scope === 'component' && selectedComponent && (
        <div className="p-4">
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 transition-colors">
              <TabsTrigger value="setup" className="transition-all text-xs">Setup</TabsTrigger>
              <TabsTrigger value="style" className="transition-all text-xs">Style</TabsTrigger>
              <TabsTrigger value="filters" className="transition-all text-xs">Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="mt-4 space-y-4">
              <ChartSetup
                config={selectedComponent}
                onUpdate={(updates) => onUpdateComponent(selectedComponent.id, updates)}
              />
            </TabsContent>

            <TabsContent value="style" className="mt-4 space-y-4">
              <ChartStyle
                config={selectedComponent}
                onUpdate={(updates) => onUpdateComponent(selectedComponent.id, updates)}
              />
            </TabsContent>

            <TabsContent value="filters" className="mt-4 space-y-4">
              <FiltersTab
                config={selectedComponent}
                onUpdate={(updates) => onUpdateComponent(selectedComponent.id, updates)}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
