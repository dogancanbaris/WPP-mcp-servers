'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDashboardStore } from '@/store/dashboardStore';
import { MenuButton } from './MenuButton';
import { ToolbarSection } from './ToolbarButton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  createFileMenuItems,
  createEditMenuItems,
  getViewMenuItems,
  getInsertMenuItems,
  getPageMenuItems,
  getArrangeMenuItems,
  RESOURCE_MENU_ITEMS,
  createHelpMenuItems,
} from './menu-definitions';
import {
  TOOLBAR_LEFT,
  TOOLBAR_CENTER,
  TOOLBAR_RIGHT,
} from './toolbar-definitions';
import { VersionHistory } from '../VersionHistory';
import { ThemeEditor } from '../ThemeEditor';
import { LayoutPicker } from '../canvas/LayoutPicker';
import { ComponentPicker } from '../dialogs/ComponentPicker';
import { ShareDialog } from '../dialogs/ShareDialog';
import dynamic from 'next/dynamic';
const DataSourcesDialog = dynamic(() => import('../dialogs/DataSourcesDialog'), { ssr: false });
const BlendDataDialog = dynamic(() => import('../dialogs/BlendDataDialog'), { ssr: false });
import { KeyboardShortcutsDialog } from '../KeyboardShortcutsDialog';
import { ReportIssueDialog } from '../dialogs/ReportIssueDialog';
import { FeedbackDialog } from '../dialogs/FeedbackDialog';
import { ChangelogDialog } from '../dialogs/ChangelogDialog';
import { InsertTextDialog } from '../dialogs/InsertTextDialog';
import { InsertImageDialog } from '../dialogs/InsertImageDialog';
import { InsertShapeDialog } from '../dialogs/InsertShapeDialog';
import { InsertEmbedDialog } from '../dialogs/InsertEmbedDialog';
import { InsertControlDialog } from '../dialogs/InsertControlDialog';
import { NewDashboardDialog } from '../dialogs/NewDashboardDialog';
const DashboardSettingsDialog = dynamic(
  () => import('../dialogs/DashboardSettingsDialog').then((m) => m.DashboardSettingsDialog),
  { ssr: false }
);
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useViewActions } from '../actions/view-actions';
import { useEditActions } from '../actions/edit-actions';
import { useFileActions } from '../actions/file-actions';
import { useInsertActions } from '../actions/insert-actions';
import { useArrangeActions } from '../actions/arrange-actions';
import type { ComponentConfig, ColumnWidth, ComponentType, BlendConfig } from '@/types/dashboard-builder';
import { refreshAllDashboardData } from '@/lib/utils/refresh-data';
import { toast } from '@/lib/toast';
import { useDataSources } from '@/hooks/useDataSources';
import { getComponentBehavior } from '../sidebar/component-behavior';
import { getPrimaryBlendDatasetInfo } from '@/lib/data/blend-utils';

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
  const { config, setTitle, addRow, addComponent, addPage, save, viewMode, setViewMode } = useDashboardStore();
  const canUndo = useDashboardStore((s) => s.canUndo);
  const canRedo = useDashboardStore((s) => s.canRedo);
  const currentPageId = useDashboardStore((s) => s.currentPageId);
  const selectedComponentId = useDashboardStore((s) => s.selectedComponentId);
  const selectedComponentIdsSet = useDashboardStore((s) => s.selectedComponentIds);
  const setSidebar = useDashboardStore((s) => s.setSidebar);
  const copyStyle = useDashboardStore((s) => s.copyStyle);
  const pasteStyle = useDashboardStore((s) => s.pasteStyle);
  const toggleLock = useDashboardStore((s) => s.toggleLock);
  const pauseUpdates = useDashboardStore((s) => s.pauseUpdates);
  const setPauseUpdates = useDashboardStore((s) => s.setPauseUpdates);
  const bulkUpdateComponents = useDashboardStore((s) => s.bulkUpdateComponents);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(config.title);

  // Feature dialog states
  const [isNewDashboardOpen, setIsNewDashboardOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isLayoutPickerOpen, setIsLayoutPickerOpen] = useState(false);
  const [isComponentPickerOpen, setIsComponentPickerOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isBlendDialogOpen, setIsBlendDialogOpen] = useState(false);
  const [blendDialogTargets, setBlendDialogTargets] = useState<string[]>([]);
  const [blendDialogInitialConfig, setBlendDialogInitialConfig] = useState<BlendConfig | undefined>(undefined);
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false);

  // Help menu dialog states
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const { dataSources, loading: dataSourcesLoading } = useDataSources();


  // Action hooks - Pass callback to open new dashboard dialog
  const fileActions = useFileActions(() => setIsNewDashboardOpen(true));
  const editActions = useEditActions();
  const viewActions = useViewActions();
  const insertActions = useInsertActions();
  const arrangeActions = useArrangeActions();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => handleSave(),
    onUndo: editActions.onUndo,
    onRedo: editActions.onRedo,
    onCut: editActions.onCut,
    onCopy: editActions.onCopy,
    onPaste: editActions.onPaste,
    onDuplicate: editActions.onDuplicate,
    onDelete: editActions.onDelete,
    onSelectAll: editActions.onSelectAll,
    onDeselectAll: editActions.onDeselectAll,
    onAddChart: () => setIsComponentPickerOpen(true),
  });

  const selectedComponentIds = useMemo(() => Array.from(selectedComponentIdsSet), [selectedComponentIdsSet]);

  const selectedComponents = useMemo<ComponentConfig[]>(() => {
    if (!selectedComponentIds || selectedComponentIds.length === 0) {
      return [];
    }

    const idSet = new Set(selectedComponentIds);
    const matches: ComponentConfig[] = [];
    const pushComponent = (component?: ComponentConfig) => {
      if (component && idSet.has(component.id)) {
        matches.push(component);
      }
    };

    if (config.pages && config.pages.length > 0) {
      const page =
        (currentPageId && config.pages.find((p) => p.id === currentPageId)) ||
        config.pages[0];
      if (page) {
        page.components?.forEach((canvasComponent) =>
          pushComponent(canvasComponent.component)
        );
        page.rows.forEach((row) =>
          row.columns.forEach((column) => pushComponent(column.component))
        );
      }
    } else {
      config.rows.forEach((row) =>
        row.columns.forEach((column) => pushComponent(column.component))
      );
    }

    return matches;
  }, [config, currentPageId, selectedComponentIds]);

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

  const handleToggleViewMode = () => {
    const newMode = viewMode === 'edit' ? 'view' : 'edit';
    setViewMode(newMode);
    console.log(`Switched to ${newMode} mode`);
  };

  const handleOpenBlendDialog = () => {
    if (dataSourcesLoading) {
      toast.info('Loading data sources…');
      return;
    }
    if (dataSources.length < 2) {
      toast.error('Connect at least two data sources before blending');
      return;
    }
    if (!selectedComponents.length) {
      toast.error('Select at least one component to configure a blend');
      return;
    }
    const unsupported = selectedComponents.filter(
      (component) => !getComponentBehavior(component.type).supportsBlending
    );
    if (unsupported.length > 0) {
      toast.error('Selected component does not support blending');
      return;
    }
    const firstBlendConfig = selectedComponents[0].blendConfig;
    const normalizedFirstConfig = firstBlendConfig ? JSON.stringify(firstBlendConfig) : null;
    const sameBlend =
      normalizedFirstConfig !== null &&
      selectedComponents.every(
        (component) => JSON.stringify(component.blendConfig) === normalizedFirstConfig
      );

    setBlendDialogInitialConfig(sameBlend ? firstBlendConfig : undefined);
    setBlendDialogTargets(selectedComponents.map((component) => component.id));
    setIsBlendDialogOpen(true);
  };

  const handleBlendDialogClose = () => {
    setIsBlendDialogOpen(false);
    setBlendDialogTargets([]);
    setBlendDialogInitialConfig(undefined);
  };

  const handleBlendDialogSave = (blendConfig: BlendConfig) => {
    if (!blendDialogTargets.length) {
      handleBlendDialogClose();
      return;
    }
    const primaryInfo = getPrimaryBlendDatasetInfo(blendConfig, dataSources);
    bulkUpdateComponents(blendDialogTargets, {
      blendConfig,
      dataset_id: primaryInfo?.datasetId,
      datasource: primaryInfo?.label || 'Blended Source',
    });
    toast.success(
      blendDialogTargets.length === 1
        ? 'Blend configuration updated'
        : `Blend applied to ${blendDialogTargets.length} components`
    );
    handleBlendDialogClose();
  };

  // Create connected menu items
  const fileMenuItems = createFileMenuItems({
    ...fileActions,
    onVersionHistory: () => setIsVersionHistoryOpen(true),
  });

  const editMenuItems = createEditMenuItems(editActions);

  const helpMenuItems = createHelpMenuItems({
    onReportIssue: () => setIsReportIssueOpen(true),
    onSendFeedback: () => setIsFeedbackOpen(true),
    onWhatsNew: () => setIsChangelogOpen(true),
    onKeyboardShortcuts: () => setIsKeyboardShortcutsOpen(true),
  });

  // Enhance insert actions so Chart menu uses the top-level ComponentPicker
  const enhancedInsertActions = {
    ...insertActions,
    onInsertChart: (type?: string) => {
      if (!type) {
        setIsComponentPickerOpen(true);
        return;
      }
      handleAddComponent(type as ComponentType);
    },
  };

  // Connect toolbar buttons
  const connectedToolbarLeft = TOOLBAR_LEFT.map((item) => {
    if ('id' in item) {
      switch (item.id) {
        case 'undo':
          return {
            ...item,
            action: editActions.onUndo,
            disabled: !canUndo,
          };
        case 'redo':
          return {
            ...item,
            action: editActions.onRedo,
            disabled: !canRedo,
          };
        case 'add-page':
          return {
            ...item,
            action: () => addPage(),
          };
        case 'add-data':
          return {
            ...item,
            action: () => setIsDataSourcesOpen(true),
          };
        case 'blend':
          return {
            ...item,
            action: handleOpenBlendDialog,
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
        case 'add-control':
          if ('type' in item && item.type === 'dropdown') {
            return {
              ...item,
              items: item.items.map((dropdownItem) => {
                if ('label' in dropdownItem) {
                  const mapping: Record<string, string> = {
                    'Date range': 'date_filter',
                    'Drop-down list': 'dropdown',
                    'Fixed-size list': 'list',
                    'Input box': 'input_box',
                    'Checkbox': 'checkbox',
                    'Slider': 'slider',
                    'All controls...': 'picker',
                  };
                  const controlType = mapping[dropdownItem.label];
                  if (controlType) {
                    return {
                      ...dropdownItem,
                      action: () => insertActions.onInsertControl(controlType),
                    };
                  }
                }
                return dropdownItem;
              }),
            };
          }
          return item;
        case 'more-tools':
          if ('type' in item && item.type === 'dropdown') {
            return {
              ...item,
              items: item.items.map((dropdownItem) => {
                if ('label' in dropdownItem) {
                  if (dropdownItem.label === 'Copy style') {
                    return {
                      ...dropdownItem,
                      action: () => {
                        if (!selectedComponentId) return toast.error('No component selected');
                        copyStyle(selectedComponentId);
                        toast.success('Style copied');
                      },
                    };
                  }
                  if (dropdownItem.label === 'Paste style') {
                    return {
                      ...dropdownItem,
                      action: () => {
                        if (!selectedComponentId) return toast.error('No component selected');
                        pasteStyle(selectedComponentId);
                        toast.success('Style pasted');
                      },
                    };
                  }
                  if (dropdownItem.label === 'Lock position') {
                    return {
                      ...dropdownItem,
                      action: () => {
                        if (!selectedComponentId) return toast.error('No component selected');
                        toggleLock(selectedComponentId);
                        toast.success('Component locked');
                      },
                    };
                  }
                  if (dropdownItem.label === 'Unlock position') {
                    return {
                      ...dropdownItem,
                      action: () => {
                        if (!selectedComponentId) return toast.error('No component selected');
                        toggleLock(selectedComponentId);
                        toast.success('Component unlocked');
                      },
                    };
                  }
                }
                return dropdownItem;
              }),
            };
          }
          return item;
        case 'filters':
          return {
            ...item,
            action: () => {
              // Focus filters tab; prefer component if selected, else page
              if (selectedComponentId) setSidebar('component', 'filters');
              else setSidebar('page', 'filters');
            },
          };
        case 'theme':
          return {
            ...item,
            action: () => setIsThemeEditorOpen(true),
          };
        case 'align':
          if ('type' in item && item.type === 'dropdown') {
            return {
              ...item,
              items: item.items.map((dropdownItem) => {
                if ('label' in dropdownItem) {
                  const map: Record<string, () => void> = {
                    'Align left': arrangeActions.onAlignLeft,
                    'Align center': arrangeActions.onAlignCenter,
                    'Align right': arrangeActions.onAlignRight,
                    'Align top': arrangeActions.onAlignTop,
                    'Align middle': arrangeActions.onAlignMiddle,
                    'Align bottom': arrangeActions.onAlignBottom,
                    'Distribute horizontally': arrangeActions.onDistributeHorizontally,
                    'Distribute vertically': arrangeActions.onDistributeVertically,
                  };
                  const fn = map[dropdownItem.label];
                  if (fn) {
                    return { ...dropdownItem, action: fn };
                  }
                }
                return dropdownItem;
              }),
            };
          }
          return item;
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
                if ('label' in menuItem) {
                  if (menuItem.label === 'Refresh data') {
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
                  if (menuItem.label === 'Report settings') {
                    return { ...menuItem, action: () => setIsDashboardSettingsOpen(true) };
                  }
                  if (menuItem.label === 'Print') {
                    return { ...menuItem, action: () => window.print() };
                  }
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
                if ('label' in menuItem) {
                  if (menuItem.label === 'Keyboard shortcuts') {
                    return {
                      ...menuItem,
                      action: () => setIsKeyboardShortcutsOpen(true),
                    };
                  }
                  if (menuItem.label === 'Report issue') {
                    return {
                      ...menuItem,
                      action: () => setIsReportIssueOpen(true),
                    };
                  }
                }
                return menuItem;
              }),
            };
          }
          return item;
        case 'pause-updates':
          return {
            ...item,
            label: pauseUpdates ? 'Resume updates' : 'Pause updates',
            action: () => setPauseUpdates(!pauseUpdates),
          };
      }
    }
    return item;
  });

  return (
    <div className="topbar flex flex-col w-full shrink-0 z-50">
      {/* ROW 1: MENU BAR - Professional Spacing */}
      <div className="topbar-row-1 flex items-center px-4 lg:px-6 gap-2 bg-white border-b">
        <Link href="/dashboard" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src="/wpp-logo.svg"
            alt="WPP Analytics"
            width={120}
            height={40}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        <Separator orientation="vertical" className="mx-2 h-4" />

        <div className="flex items-center">
          {isEditingTitle ? (
            <input
              type="text"
              data-title-input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="h-9 px-3 text-base font-semibold border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px] max-w-[400px]"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="dashboard-title-button"
            >
              {config.title}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 menu-group">
          <MenuButton label="File" items={fileMenuItems} />
          <MenuButton label="Edit" items={editMenuItems} />
          <MenuButton label="View" items={getViewMenuItems({ ...viewActions, onViewMode: handleToggleViewMode })} />
        </div>

        <Separator orientation="vertical" className="mx-2 h-4" />

        <div className="flex items-center gap-1 menu-group">
          <MenuButton label="Insert" items={getInsertMenuItems(enhancedInsertActions)} />
          <MenuButton
            label="Page"
            items={getPageMenuItems({
              currentPageId,
              hasMultiplePages: (config.pages?.length || 0) > 1,
              addPage,
              duplicatePage: useDashboardStore.getState().duplicatePage,
              removePage: useDashboardStore.getState().removePage,
              updatePage: useDashboardStore.getState().updatePage,
              reorderPages: useDashboardStore.getState().reorderPages,
            })}
          />
          <MenuButton label="Arrange" items={getArrangeMenuItems(arrangeActions)} />
        </div>

        <Separator orientation="vertical" className="mx-2 h-4" />

        <div className="flex items-center gap-1 menu-group">
          <MenuButton label="Resource" items={RESOURCE_MENU_ITEMS} />
          <MenuButton label="Help" items={helpMenuItems} />
        </div>
      </div>

      {/* ROW 2: TOOLBAR - Professional Spacing */}
      <div className="topbar-row-2 flex items-center px-4 lg:px-6 justify-between border-t">
        <ToolbarSection items={connectedToolbarLeft} />

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsLayoutPickerOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            + Add Row
          </Button>
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

      <DataSourcesDialog
        open={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
      />

      <BlendDataDialog
        open={isBlendDialogOpen}
        onClose={handleBlendDialogClose}
        dataSources={dataSources}
        value={blendDialogInitialConfig}
        onSave={handleBlendDialogSave}
      />

      <KeyboardShortcutsDialog
        open={isKeyboardShortcutsOpen}
        onOpenChange={setIsKeyboardShortcutsOpen}
      />

      <ReportIssueDialog
        open={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
      />

      <FeedbackDialog
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <ChangelogDialog
        open={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      {/* New Dashboard Dialog */}
      <NewDashboardDialog
        open={isNewDashboardOpen}
        onClose={() => setIsNewDashboardOpen(false)}
      />

      {/* Content Dialogs */}
      <InsertTextDialog
        open={insertActions.contentDialogState.open && insertActions.contentDialogState.contentType === 'text'}
        onClose={insertActions.closeContentDialog}
        onInsert={insertActions.handleContentInsert}
      />

      <InsertImageDialog
        open={insertActions.contentDialogState.open && insertActions.contentDialogState.contentType === 'image'}
        onClose={insertActions.closeContentDialog}
        onInsert={insertActions.handleContentInsert}
      />

      <InsertShapeDialog
        open={insertActions.contentDialogState.open && ['rectangle', 'circle', 'line'].includes(insertActions.contentDialogState.contentType)}
        onClose={insertActions.closeContentDialog}
        onInsert={insertActions.handleContentInsert}
      />

      <InsertEmbedDialog
        open={insertActions.contentDialogState.open && insertActions.contentDialogState.contentType === 'embed'}
        onClose={insertActions.closeContentDialog}
        onInsert={insertActions.handleContentInsert}
      />

      <InsertControlDialog
        open={insertActions.controlDialogState.open}
        controlType={insertActions.controlDialogState.controlType}
        onClose={() => insertActions.setControlDialogState({ open: false, controlType: '' })}
        onInsert={insertActions.handleControlInsert}
      />

      {/* Report settings */}
      <DashboardSettingsDialog
        open={isDashboardSettingsOpen}
        onClose={() => setIsDashboardSettingsOpen(false)}
        dashboardId={dashboardId}
        onSave={() => setIsDashboardSettingsOpen(false)}
      />
    </div>
  );
};
