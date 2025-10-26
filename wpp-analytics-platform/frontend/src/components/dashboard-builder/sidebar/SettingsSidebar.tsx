import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartSetup } from './setup/ChartSetup';
import { ChartStyle } from './style/ChartStyle';
import { FiltersTab } from './filters/FiltersTab';
import { ComponentConfig } from '@/types/dashboard-builder';
import { FileQuestion, Filter, Palette, Keyboard, Settings } from 'lucide-react';
import { GlobalFilters } from '../GlobalFilters';
import { ThemeEditor } from '../ThemeEditor';
import { KeyboardShortcutsDialog } from '../KeyboardShortcutsDialog';
import { useKeyboardShortcuts, createDefaultShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useDashboardStore } from '@/store/dashboardStore';

interface SettingsSidebarProps {
  selectedComponent?: ComponentConfig;
  onUpdateComponent: (id: string, updates: Partial<ComponentConfig>) => void;
}

/**
 * NoSelectionMessage Component
 *
 * Displays when no component is selected in the dashboard builder
 */
const NoSelectionMessage: React.FC<{
  onOpenFilters: () => void;
  onOpenTheme: () => void;
  onOpenShortcuts: () => void;
}> = ({ onOpenFilters, onOpenTheme, onOpenShortcuts }) => {
  return (
    <div className="w-80 h-full border-l bg-surface dashboard-sidebar flex flex-col items-center justify-center p-6 fade-in">
      {/* Icon and Title - Professional empty state */}
      <div className="empty-state-icon mb-6">
        <FileQuestion className="w-full h-full" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">No Component Selected</h3>
      <p className="text-sm text-muted-foreground text-center mb-8 max-w-[240px]">
        Select a chart or component to configure its properties
      </p>

      {/* Quick Actions Card - Professional styling */}
      <Card className="w-full p-4 mb-6 card-shadow hover:shadow-elevation-3 transition-all">
        <h4 className="text-sm font-semibold mb-3 text-foreground">Quick Actions</h4>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-professional transition-all hover:shadow-elevation-1"
            onClick={onOpenFilters}
          >
            <Filter className="h-4 w-4" />
            Global Filters
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-professional transition-all hover:shadow-elevation-1"
            onClick={onOpenTheme}
          >
            <Palette className="h-4 w-4" />
            Theme Editor
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-professional transition-all hover:shadow-elevation-1"
            onClick={onOpenShortcuts}
          >
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </Button>
        </div>
      </Card>

      {/* Getting Started Tips */}
      <div className="w-full">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Getting Started</h4>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• Click + to add new components</li>
          <li>• Drag rows to reorder layout</li>
          <li>• Use Ctrl+Z to undo changes</li>
          <li>• Select components to edit properties</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * SettingsSidebar Component
 *
 * Right-side settings panel that appears when a component is selected.
 * Provides complete component configuration with 4 tabs:
 * - Setup: Data source, metrics, dimensions
 * - Style: Visual styling, theming, custom CSS
 * - Filters: Component-level filtering (date range, dimensions, metrics)
 * - Tools: Dashboard-level settings, global filters, theme editor
 *
 * Features:
 * - Fixed 320px width sidebar
 * - Four-tab interface (Setup | Style | Filters | Tools)
 * - Dark mode compatible
 * - Shows component name and type
 * - Dual agent capabilities (UI + MCP JSON)
 * - No selection state with helpful message
 *
 * @param selectedComponent - Currently selected component configuration
 * @param onUpdateComponent - Callback to update component properties
 */
export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  selectedComponent,
  onUpdateComponent
}) => {
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Create shortcuts array first
  const shortcutConfigs = useMemo(() => createDefaultShortcuts({
    onSave: () => console.log('Save dashboard'),
    onUndo: () => useDashboardStore.getState().undo(),
    onRedo: () => useDashboardStore.getState().redo(),
    onHelp: () => setIsShortcutsOpen(true),
  }), []);

  // Use the hook correctly
  const {
    customizeShortcut,
    resetShortcut,
    resetAllShortcuts,
    getShortcutsWithBindings,
  } = useKeyboardShortcuts(shortcutConfigs);

  // Get shortcuts with bindings for the dialog
  const shortcuts = getShortcutsWithBindings();

  // Show "No Selection" message when nothing is selected
  if (!selectedComponent) {
    return (
      <>
        <NoSelectionMessage
          onOpenFilters={() => setIsFiltersDialogOpen(true)}
          onOpenTheme={() => setIsThemeEditorOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Feature Dialogs */}
        {isFiltersDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto">
              <GlobalFilters showAddButton={true} />
              <div className="flex justify-end p-4 border-t">
                <Button onClick={() => setIsFiltersDialogOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {isThemeEditorOpen && (
          <ThemeEditor onClose={() => setIsThemeEditorOpen(false)} />
        )}

        <KeyboardShortcutsDialog
          open={isShortcutsOpen}
          onOpenChange={setIsShortcutsOpen}
          shortcuts={shortcuts}
          onCustomizeShortcut={customizeShortcut}
          onResetShortcut={resetShortcut}
          onResetAllShortcuts={resetAllShortcuts}
        />
      </>
    );
  }

  // Format component type for display (e.g., "bar-chart" -> "Bar Chart")
  const formattedType = selectedComponent.type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="w-80 border-l bg-surface dashboard-sidebar overflow-y-auto h-full fade-in">
      {/* Header Section - Professional styling */}
      <div className="p-4 border-b shadow-elevation-1">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {selectedComponent.title || 'Untitled Component'}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {formattedType}
          </p>
        </div>
      </div>

      {/* Tabs Section - Professional transitions */}
      <div className="p-4">
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 transition-colors">
            <TabsTrigger value="setup" className="transition-all text-xs">Setup</TabsTrigger>
            <TabsTrigger value="style" className="transition-all text-xs">Style</TabsTrigger>
            <TabsTrigger value="filters" className="transition-all text-xs">Filters</TabsTrigger>
            <TabsTrigger value="dashboard" className="transition-all text-xs">Tools</TabsTrigger>
          </TabsList>

          {/* Setup Tab Content */}
          <TabsContent value="setup" className="mt-4 space-y-4">
            <ChartSetup
              config={selectedComponent}
              onUpdate={(updates) => onUpdateComponent(selectedComponent.id, updates)}
            />
          </TabsContent>

          {/* Style Tab Content */}
          <TabsContent value="style" className="mt-4 space-y-4">
            <ChartStyle
              config={selectedComponent}
              onUpdate={(updates) => onUpdateComponent(selectedComponent.id, updates)}
            />
          </TabsContent>

          {/* Filters Tab Content - NEW */}
          <TabsContent value="filters" className="mt-4 space-y-4">
            <FiltersTab
              config={selectedComponent}
              onUpdate={(updates) => onUpdateComponent(selectedComponent.id, updates)}
            />
          </TabsContent>

          {/* Dashboard Tools Tab Content - Professional styling */}
          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <Card className="card-shadow transition-all hover:shadow-elevation-3">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Dashboard Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-professional transition-all hover:shadow-elevation-1"
                  onClick={() => setIsFiltersDialogOpen(true)}
                >
                  <Filter className="h-4 w-4" />
                  Global Filters
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-professional transition-all hover:shadow-elevation-1"
                  onClick={() => setIsThemeEditorOpen(true)}
                >
                  <Palette className="h-4 w-4" />
                  Theme Editor
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-professional transition-all hover:shadow-elevation-1"
                  onClick={() => setIsShortcutsOpen(true)}
                >
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Feature Dialogs - Professional modals */}
      {isFiltersDialogOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 fade-in">
          <div className="bg-surface rounded-lg modal-shadow max-w-4xl w-full max-h-[80vh] overflow-auto slide-in-top">
            <GlobalFilters showAddButton={true} />
            <div className="flex justify-end p-4 border-t">
              <Button onClick={() => setIsFiltersDialogOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isThemeEditorOpen && (
        <ThemeEditor onClose={() => setIsThemeEditorOpen(false)} />
      )}

      <KeyboardShortcutsDialog
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
        shortcuts={shortcuts}
        onCustomizeShortcut={customizeShortcut}
        onResetShortcut={resetShortcut}
        onResetAllShortcuts={resetAllShortcuts}
      />
    </div>
  );
};
