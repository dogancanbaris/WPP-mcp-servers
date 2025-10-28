'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  dashboardId,
  onSelectComponent,
  showGrid = false,
  viewMode = 'edit',
}) => {
  const { config, zoom, addRow, removeRow, reorderRows, addComponent, updateComponent, removeComponent } = useDashboardStore();
  const currentPage = useCurrentPage();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [showLayoutPicker, setShowLayoutPicker] = React.useState(false);

  // Use current page's rows, or fall back to legacy config.rows for backwards compatibility
  const rows = currentPage?.rows || config.rows || [];

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((row: RowConfig) => row.id === active.id);
      const newIndex = rows.findIndex((row: RowConfig) => row.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderRows(oldIndex, newIndex);
      }
    }

    setActiveId(null);
  };

  const handleAddRow = (layout: ColumnWidth[]) => {
    addRow(layout);
    setShowLayoutPicker(false);
  };

  // Calculate canvas scale based on zoom
  const scale = zoom / 100;

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
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
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
              {activeId ? (
                <div className="opacity-60 bg-surface border-2 border-primary rounded-lg p-4 shadow-elevation-5">
                  <div className="text-sm font-medium text-primary flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Reordering row...
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
