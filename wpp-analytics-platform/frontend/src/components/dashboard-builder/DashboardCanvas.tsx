'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragCancelEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Modifier } from '@dnd-kit/modifiers';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDashboardStore, useCurrentPage } from '@/store/dashboardStore';
import { Row } from './Row';
import { cn } from '@/lib/utils';
import { ColumnWidth, RowConfig } from '@/types/dashboard-builder';

interface DashboardCanvasProps {
  dashboardId: string;
  onSelectComponent: (componentId?: string) => void;
  showGrid?: boolean;
  viewMode?: 'edit' | 'view';
}

const DEFAULT_LAYOUTS: { name: string; layout: ColumnWidth[]; icon: string }[] = [
  { name: 'Single Column', layout: ['1/1'], icon: '▬' },
  { name: 'Two Columns', layout: ['1/2', '1/2'], icon: '▬ ▬' },
  { name: 'Three Columns', layout: ['1/3', '1/3', '1/3'], icon: '▬▬▬' },
  { name: '1/3 + 2/3', layout: ['1/3', '2/3'], icon: '▬ ▬▬' },
  { name: '2/3 + 1/3', layout: ['2/3', '1/3'], icon: '▬▬ ▬' },
  { name: '1/4 + 3/4', layout: ['1/4', '3/4'], icon: '▬▬▬' },
];

type DragItemType = 'row' | 'column' | 'component';

type DragItemData = {
  type?: DragItemType | 'component-drop' | 'column-dropzone';
  rowId?: string;
  columnId?: string;
  componentId?: string;
};

const rowSnapToCursor: Modifier = (args) => {
  const data = (args.active?.data.current || {}) as DragItemData;

  if (data.type === 'row') {
    const centered = snapCenterToCursor(args);
    if (centered.transform) {
      const rect = centered.overlayNodeRect ?? args.overlayNodeRect ?? args.active.rect.current.translated ?? args.active.rect.current;
      const width = rect?.width ?? 0;

      if (width > 0) {
        centered.transform = {
          ...centered.transform,
          x: centered.transform.x + width / 2
        };
      }
    }
    return centered;
  }

  return args;
};

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  dashboardId,
  onSelectComponent,
  showGrid = false,
  viewMode = 'edit',
}) => {
  const {
    config,
    zoom,
    addRow,
    removeRow,
    reorderRows,
    reorderColumns,
    addComponent,
    removeComponent,
    moveComponent
  } = useDashboardStore();
  const currentPage = useCurrentPage();
  const [activeDrag, setActiveDrag] = React.useState<{
    id: string;
    type: DragItemType | 'unknown';
    rowId?: string;
    columnId?: string;
    componentId?: string;
    overColumnId?: string;
  } | null>(null);
  const [showLayoutPicker, setShowLayoutPicker] = React.useState(false);

  // Use current page's rows, or fall back to legacy config.rows for backwards compatibility
  const rows = currentPage?.rows || config.rows || [];

  const findColumnId = React.useCallback((identifier?: string) => {
    if (!identifier) return undefined;

    for (const row of rows) {
      for (const column of row.columns) {
        if (column.id === identifier || column.component?.id === identifier) {
          return column.id;
        }
      }
    }

    return undefined;
  }, [rows]);

  const findRowIdForColumn = React.useCallback((columnId?: string) => {
    if (!columnId) return undefined;

    for (const row of rows) {
      if (row.columns.some((column) => column.id === columnId)) {
        return row.id;
      }
    }

    return undefined;
  }, [rows]);

  const getTargetColumnId = React.useCallback((over: DragEndEvent['over'] | DragOverEvent['over']) => {
    if (!over) return undefined;

    const overData = (over.data?.current || {}) as DragItemData;

    if (overData.columnId) {
      return overData.columnId;
    }

    if (typeof over.id === 'string') {
      return findColumnId(over.id);
    }

    return undefined;
  }, [findColumnId]);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = (event.active.data.current || {}) as DragItemData;

    setActiveDrag({
      id: event.active.id as string,
      type: data.type ?? 'unknown',
      rowId: data.rowId,
      columnId: data.columnId,
      componentId: data.componentId,
      overColumnId: undefined
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = (active.data.current || {}) as DragItemData;
    const overData = (over?.data.current || {}) as DragItemData;

    switch (activeData.type) {
      case 'row': {
        if (over && active.id !== over.id) {
          const oldIndex = rows.findIndex((row: RowConfig) => row.id === active.id);
          const newIndex = rows.findIndex((row: RowConfig) => row.id === over.id);

          if (oldIndex !== -1 && newIndex !== -1) {
            reorderRows(oldIndex, newIndex);
          }
        }
        break;
      }
      case 'column': {
        if (!over) break;

        const targetColumnId = getTargetColumnId(over);

        if (!activeData.rowId || !activeData.columnId || !targetColumnId) {
          break;
        }

        const sourceRow = rows.find((row) => row.id === activeData.rowId);
        if (!sourceRow) break;

        const destinationRowId = overData.rowId || findRowIdForColumn(targetColumnId);
        if (destinationRowId && destinationRowId !== activeData.rowId) {
          break;
        }

        const oldIndex = sourceRow.columns.findIndex((col) => col.id === activeData.columnId);
        const newIndex = sourceRow.columns.findIndex((col) => col.id === targetColumnId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderColumns(activeData.rowId, oldIndex, newIndex);
        }
        break;
      }
      case 'component': {
        if (!over) break;

        const targetColumnId = getTargetColumnId(over);
        const componentId = activeData.componentId || (typeof active.id === 'string' ? active.id : undefined);
        const sourceColumnId = activeData.columnId;

        if (!componentId || !targetColumnId || !sourceColumnId) {
          break;
        }

        if (targetColumnId !== sourceColumnId) {
          moveComponent(componentId, targetColumnId);
        }
        break;
      }
      default:
        break;
    }

    setActiveDrag(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const targetColumnId = getTargetColumnId(event.over);

    setActiveDrag((current) =>
      current
        ? {
            ...current,
            overColumnId: targetColumnId
          }
        : current
    );
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveDrag(null);
  };

  const handleAddRow = (layout: ColumnWidth[]) => {
    addRow(layout);
    setShowLayoutPicker(false);
  };

  // Calculate canvas scale based on zoom
  const scale = zoom / 100;

  const activeRow = React.useMemo(() => {
    if (!activeDrag || activeDrag.type !== 'row') {
      return undefined;
    }

    return rows.find((row) => row.id === activeDrag.id || row.id === activeDrag.rowId);
  }, [activeDrag, rows]);

  const activeColumn = React.useMemo(() => {
    if (!activeDrag || activeDrag.type !== 'column') {
      return undefined;
    }

    for (const row of rows) {
      const column = row.columns.find((col) => col.id === (activeDrag.columnId ?? activeDrag.id));
      if (column) {
        return { column, row };
      }
    }

    return undefined;
  }, [activeDrag, rows]);

  const activeComponent = React.useMemo(() => {
    if (!activeDrag || activeDrag.type !== 'component') {
      return undefined;
    }

    for (const row of rows) {
      for (const column of row.columns) {
        if (column.component?.id === (activeDrag.componentId ?? activeDrag.id)) {
          return column.component;
        }
      }
    }

    return undefined;
  }, [activeDrag, rows]);

  return (
    <div className="relative w-full h-full flex flex-col dashboard-canvas">
      {/* Canvas Container with Zoom and Grid Overlay */}
      <div
        className={cn(
          "flex-1 overflow-auto p-6 transition-colors",
          showGrid && "grid-overlay"
        )}
        style={{
          backgroundColor: 'rgba(var(--muted-rgb, 248 249 250) / 0.3)',
        }}
      >
        <div
          data-canvas
          className="mx-auto smooth-zoom origin-top"
          style={{
            transform: `scale(${scale})`,
            width: '100%',
            maxWidth: '1400px',
            transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            modifiers={[rowSnapToCursor]}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={rows.map((row: RowConfig) => row.id)}
              strategy={verticalListSortingStrategy}
            >
              {/* Render Rows */}
              {rows.length === 0 ? (
                // Empty State - Professional design
                <div className="empty-state fade-in">
                  <div className="empty-state-icon">
                    <Plus className="w-full h-full" />
                  </div>
                  <h3 className="empty-state-title">
                    Start building your dashboard
                  </h3>
                  <p className="empty-state-description mb-6">
                    Add your first row to begin creating your layout. Choose from various column configurations to organize your components.
                  </p>
                  <Button
                    onClick={() => setShowLayoutPicker(true)}
                    size="lg"
                    className="shadow-elevation-2 hover:shadow-elevation-3 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Row
                  </Button>
                </div>
              ) : (
                // Rows List - Smooth fade-in animation
                <div className="space-y-4 fade-in">
                  {rows.map((row: RowConfig, index: number) => (
                    <Row
                      key={row.id}
                      id={row.id}
                      columns={row.columns}
                      onDelete={() => removeRow(row.id)}
                      onAddColumn={() => {
                        // This will be handled by the Row component internally
                      }}
                      onUpdateColumn={(columnId, updates) => {
                        // When Row adds a component, it passes the full component config
                        if (updates.component) {
                          addComponent(columnId, updates.component.type);
                        } else if (updates.component === undefined) {
                          // Component removed - handled in onRemoveColumn
                        } else {
                          // Other updates (width, etc.) - could add updateColumn action to store
                        }
                      }}
                      onRemoveColumn={(columnId) => {
                        // Find component in this column and remove it
                        const column = row.columns.find(c => c.id === columnId);
                        if (column?.component) {
                          removeComponent(column.component.id);
                        }
                      }}
                      isEditing={viewMode === 'edit'}
                    />
                  ))}
                </div>
              )}
            </SortableContext>

            {/* Drag Overlay - Professional styling */}
            <DragOverlay>
              {activeDrag ? (
                <div className="min-w-[200px] rounded-lg border border-primary bg-surface p-4 shadow-elevation-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-primary">
                        {activeDrag.type === 'row' && 'Moving row'}
                        {activeDrag.type === 'column' && 'Reordering column'}
                        {activeDrag.type === 'component' && 'Moving component'}
                        {!['row', 'column', 'component'].includes(activeDrag.type) && 'Reordering'}
                      </p>
                      {activeDrag.type === 'row' && activeRow && (
                        <p className="text-xs text-muted-foreground">
                          {activeRow.columns.length} column{activeRow.columns.length === 1 ? '' : 's'} in this row
                        </p>
                      )}
                      {activeDrag.type === 'column' && activeColumn && (
                        <p className="text-xs text-muted-foreground">
                          Width: {activeColumn.column.width.replace('/', ' / ')} · Row has {activeColumn.row.columns.length} column{activeColumn.row.columns.length === 1 ? '' : 's'}
                        </p>
                      )}
                      {activeDrag.type === 'component' && activeComponent && (
                        <p className="text-xs text-muted-foreground">
                          {activeComponent.title || activeComponent.type.replace(/_/g, ' ')}
                        </p>
                      )}
                      {activeDrag.overColumnId && (
                        <p className="text-xs text-muted-foreground">
                          Target column: {activeDrag.overColumnId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Add Row Button (when rows exist) - Professional styling */}
          {rows.length > 0 && viewMode === 'edit' && (
            <div className="mt-6 flex justify-center fade-in">
              <Button
                variant="outline"
                onClick={() => setShowLayoutPicker(true)}
                className="w-full max-w-md shadow-elevation-1 hover:shadow-elevation-2 transition-all border-professional"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Layout Picker Modal - Professional design */}
      {showLayoutPicker && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal fade-in"
          onClick={() => setShowLayoutPicker(false)}
        >
          <div
            className="bg-surface rounded-lg modal-shadow p-6 max-w-2xl w-full mx-4 slide-in-top"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2">Choose Row Layout</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select a column configuration for your new row
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_LAYOUTS.map((layoutOption) => (
                <button
                  key={layoutOption.name}
                  onClick={() => handleAddRow(layoutOption.layout)}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left',
                    'border-professional transition-all',
                    'hover:border-primary hover:bg-accent hover:shadow-elevation-2',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    'card-hover'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-mono text-primary">
                      {layoutOption.icon}
                    </span>
                    <span className="font-medium">{layoutOption.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {layoutOption.layout.join(' + ')}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowLayoutPicker(false)}
                className="hover:bg-muted transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
