'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useDashboardStore } from '@/store/dashboardStore';
import { MenuButton } from './MenuButton';
import { ToolbarSection } from './ToolbarButton';
import { cn } from '@/lib/utils';
import {
  createFileMenuItems,
  createEditMenuItems,
  getViewMenuItems,
  getInsertMenuItems,
  PAGE_MENU_ITEMS,
  getArrangeMenuItems,
  RESOURCE_MENU_ITEMS,
  HELP_MENU_ITEMS,
} from './menu-definitions';
import {
  TOOLBAR_LEFT,
  TOOLBAR_CENTER,
  TOOLBAR_RIGHT,
} from './toolbar-definitions';
import { VersionHistory } from '../VersionHistory';
import { GlobalFilters } from '../GlobalFilters';
import { ThemeEditor } from '../ThemeEditor';
import { LayoutPicker } from '../canvas/LayoutPicker';
import { ComponentPicker } from '../dialogs/ComponentPicker';
import { ShareDialog } from '../dialogs/ShareDialog';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useFilterStore } from '@/store/filterStore';
import { useViewActions } from '../actions/view-actions';
import { useEditActions } from '../actions/edit-actions';
import { useFileActions } from '../actions/file-actions';
import { useInsertActions } from '../actions/insert-actions';
import { useArrangeActions } from '../actions/arrange-actions';
import type { ColumnWidth, ComponentType } from '@/types/dashboard-builder';
import { refreshAllDashboardData } from '@/lib/utils/refresh-data';
import { toast } from '@/lib/toast';

interface EditorTopbarProps {
  dashboardId: string;
}

/**
 * Complete two-row topbar matching Looker Studio exactly
 *
 * Row 1 (40px): Logo + Report Title + Menu Bar (File, Edit, View, Insert, Page, Arrange, Resource, Help)
 * Row 2 (48px): Tool Bar (Undo/Redo + Tools + Actions)
 *
 * Based on COMPREHENSIVE-COMPONENT-SPECIFICATIONS.md Part 1
 */
export const EditorTopbar: React.FC<EditorTopbarProps> = ({ dashboardId }) => {
  const { config, setTitle, addRow, addComponent, zoom, setZoom, save, viewMode, setViewMode } = useDashboardStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(config.title);

  // Feature dialog states
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isLayoutPickerOpen, setIsLayoutPickerOpen] = useState(false);
  const [isComponentPickerOpen, setIsComponentPickerOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Global filters store
  const { isFilterBarVisible, toggleFilterBar } = useFilterStore();

  // Action hooks
  const fileActions = useFileActions();
  const editActions = useEditActions();
  const viewActions = useViewActions();
  const insertActions = useInsertActions();
  const arrangeActions = useArrangeActions();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => handleSave(),
    onUndo: editActions.onUndo,
    onRedo: editActions.onRedo,
  });

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== config.title) {
      setTitle(titleValue.trim());
    } else {
      setTitleValue(config.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitleValue(config.title);
      setIsEditingTitle(false);
    }
  };

  // Toolbar actions
  const handleAddRow = (layout: ColumnWidth[]) => {
    addRow(layout);
  };

  const handleAddComponent = (type: ComponentType) => {
    // Find first empty column or add to first column of first row
    let targetColumnId: string | null = null;

    for (const row of config.rows) {
      for (const col of row.columns) {
        if (!col.component) {
          targetColumnId = col.id;
          break;
        }
      }
      if (targetColumnId) break;
    }

    if (targetColumnId) {
      addComponent(targetColumnId, type);
    } else if (config.rows.length > 0) {
      // Use first column of first row if no empty columns
      addComponent(config.rows[0].columns[0].id, type);
    } else {
      // Create a new row first if no rows exist
      addRow(['1/1']);
      // The component will be added after the row is created
      setTimeout(() => {
        const newRow = useDashboardStore.getState().config.rows[0];
        if (newRow) {
          addComponent(newRow.columns[0].id, type);
        }
      }, 0);
    }
  };

  const handleSave = () => {
    if (dashboardId) {
      save(dashboardId, true); // Force save
    }
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleToggleViewMode = () => {
    const newMode = viewMode === 'edit' ? 'view' : 'edit';
    setViewMode(newMode);
    console.log(`Switched to ${newMode} mode`);
  };

  const handleAIAgent = () => {
    console.log('AI Assistant coming soon');
  };

  // Create connected menu items
  const fileMenuItems = createFileMenuItems({
    ...fileActions,
    onVersionHistory: () => setIsVersionHistoryOpen(true),
  });

  const editMenuItems = createEditMenuItems(editActions);

  const connectedHelpMenu = HELP_MENU_ITEMS.map((item) => {
    if ('label' in item && item.label === 'Keyboard shortcuts') {
      return {
        ...item,
        action: () => console.log('Keyboard shortcuts - dialog temporarily disabled'),
      };
    }
    return item;
  });

  // Connect toolbar buttons
  const connectedToolbarLeft = TOOLBAR_LEFT.map((item) => {
    if ('id' in item) {
      switch (item.id) {
        case 'undo':
          return {
            ...item,
            action: editActions.onUndo,
            disabled: !useDashboardStore.getState().canUndo,
          };
        case 'redo':
          return {
            ...item,
            action: editActions.onRedo,
            disabled: !useDashboardStore.getState().canRedo,
          };
        case 'add-page':
          return {
            ...item,
            action: () => console.log('Add page - multi-page dashboards coming soon'),
          };
        case 'add-data':
          return {
            ...item,
            action: () => console.log('Add data source - data source manager coming soon'),
          };
        case 'blend':
          return {
            ...item,
            action: () => console.log('Blend data - data blending coming soon'),
          };
      }
    }
    return item;
  });

  const connectedToolbarCenter = TOOLBAR_CENTER.map((item) => {
    if ('id' in item) {
      switch (item.id) {
        case 'add-chart':
          if ('type' in item && item.type === 'dropdown') {
            return {
              ...item,
              items: item.items.map((dropdownItem) => {
                if ('label' in dropdownItem) {
                  if (dropdownItem.label === 'All charts...') {
                    return {
                      ...dropdownItem,
                      action: () => setIsComponentPickerOpen(true),
                    };
                  }
                  // Quick chart actions
                  return {
                    ...dropdownItem,
                    action: () => {
                      const typeMap: Record<string, ComponentType> = {
                        'Time Series': 'time_series',
                        'Bar Chart': 'bar_chart',
                        'Line Chart': 'line_chart',
                        'Pie Chart': 'pie_chart',
                        'Table': 'table',
                        'Scorecard': 'scorecard',
                      };
                      const type = typeMap[dropdownItem.label];
                      if (type) {
                        handleAddComponent(type);
                      }
                    },
                  };
                }
                return dropdownItem;
              }),
            };
          }
          return item;
        case 'filters':
          return {
            ...item,
            action: () => toggleFilterBar(),
            active: isFilterBarVisible,
          };
        case 'theme':
          return {
            ...item,
            action: () => setIsThemeEditorOpen(true),
          };
      }
    }
    return item;
  });

  const connectedToolbarRight = TOOLBAR_RIGHT.map((item) => {
    if ('id' in item) {
      switch (item.id) {
        case 'reset':
          return {
            ...item,
            action: () => {
              if (confirm('Reset dashboard to last saved version? Unsaved changes will be lost.')) {
                window.location.reload();
              }
            },
          };
        case 'share':
          if ('type' in item && item.type === 'dropdown') {
            return {
              ...item,
              items: item.items.map((dropdownItem) => {
                if ('label' in dropdownItem) {
                  if (dropdownItem.label === 'Get link') {
                    return {
                      ...dropdownItem,
                      action: () => setIsShareDialogOpen(true),
                    };
                  }
                  return {
                    ...dropdownItem,
                    action: () => console.log(`${dropdownItem.label} - coming soon`),
                  };
                }
                return dropdownItem;
              }),
            };
          }
          return item;
        case 'view':
          return {
            ...item,
            action: handleToggleViewMode,
            label: viewMode === 'edit' ? 'View' : 'Edit',
          };
        case 'more':
          if ('type' in item && item.type === 'dropdown') {
            return {
              ...item,
              items: item.items.map((menuItem) => {
                if ('label' in menuItem && menuItem.label === 'Refresh data') {
                  return {
                    ...menuItem,
                    action: async () => {
                      toast.info('Refreshing data...');
                      const result = await refreshAllDashboardData();
                      if (result.success) {
                        toast.success('Data refreshed from BigQuery');
                      } else {
                        toast.error('Failed to refresh data');
                      }
                    },
                  };
                }
                return menuItem;
              }),
            };
          }
          return item;
        case 'help':
          if ('type' in item && item.type === 'dropdown') {
            return {
              ...item,
              items: item.items.map((menuItem) => {
                if ('label' in menuItem && menuItem.label === 'Keyboard shortcuts') {
                  return {
                    ...menuItem,
                    action: () => console.log('Keyboard shortcuts - dialog temporarily disabled'),
                  };
                }
                return menuItem;
              }),
            };
          }
          return item;
        case 'pause-updates':
          return {
            ...item,
            action: () => console.log('Pause auto-refresh - coming soon'),
          };
      }
    }
    return item;
  });

  return (
    <div className="topbar flex flex-col w-full bg-background border-b shrink-0 z-50">
      {/* ROW 1: MENU BAR */}
      <div className="flex items-center h-10 border-b px-4 gap-2 bg-background">
        <div className="flex items-center shrink-0">
          <Image
            src="/wpp-logo.svg"
            alt="WPP Analytics"
            width={120}
            height={40}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>

        <div className="flex items-center">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className={cn(
                'h-8 px-3 text-sm font-medium',
                'border border-primary rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                'min-w-[200px] max-w-[400px]',
                'transition-all'
              )}
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className={cn(
                'h-8 px-3 text-sm font-medium',
                'hover:bg-muted rounded-md',
                'transition-colors'
              )}
            >
              {config.title}
            </button>
          )}
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        <div className="flex items-center gap-1">
          <MenuButton label="File" items={fileMenuItems} />
          <MenuButton label="Edit" items={editMenuItems} />
          <MenuButton label="View" items={getViewMenuItems(viewActions)} />
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        <div className="flex items-center gap-1">
          <MenuButton label="Insert" items={getInsertMenuItems(insertActions)} />
          <MenuButton label="Page" items={PAGE_MENU_ITEMS} />
          <MenuButton label="Arrange" items={getArrangeMenuItems(arrangeActions)} />
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        <div className="flex items-center gap-1">
          <MenuButton label="Resource" items={RESOURCE_MENU_ITEMS} />
          <MenuButton label="Help" items={connectedHelpMenu} />
        </div>
      </div>

      {/* ROW 2: TOOLBAR */}
      <div className="flex items-center h-12 px-4 justify-between bg-muted/30 border-t">
        <ToolbarSection items={connectedToolbarLeft} />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLayoutPickerOpen(true)}
            className={cn(
              'h-9 px-3 py-1.5 text-sm font-medium',
              'border border-input bg-background rounded-md',
              'hover:bg-accent hover:text-accent-foreground hover:border-accent',
              'transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
            )}
          >
            + Add Row
          </button>
          <ToolbarSection items={connectedToolbarCenter} />
        </div>

        <ToolbarSection items={connectedToolbarRight} />
      </div>

      {/* Dialogs */}
      <VersionHistory
        dashboardId={dashboardId}
        open={isVersionHistoryOpen}
        onOpenChange={setIsVersionHistoryOpen}
      />

      {isThemeEditorOpen && (
        <ThemeEditor onClose={() => setIsThemeEditorOpen(false)} />
      )}

      <LayoutPicker
        open={isLayoutPickerOpen}
        onClose={() => setIsLayoutPickerOpen(false)}
        onSelect={handleAddRow}
      />

      <ComponentPicker
        open={isComponentPickerOpen}
        onClose={() => setIsComponentPickerOpen(false)}
        onSelect={handleAddComponent}
      />

      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        dashboardId={dashboardId}
        dashboardTitle={config.title}
      />
    </div>
  );
};
