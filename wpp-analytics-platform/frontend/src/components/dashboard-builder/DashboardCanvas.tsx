'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDashboardStore, useCurrentPage } from '@/store/dashboardStore';
import { CanvasContainer } from './CanvasContainer';
import { CanvasComponent } from './CanvasComponent';
import { AlignmentGuides } from './AlignmentGuides';
import { SelectionBox } from './SelectionBox';
import { rowColumnToAbsolute } from '@/lib/utils/layout-converter';
import { cn } from '@/lib/utils';
import type { ComponentType, CanvasComponent as CanvasComponentType } from '@/types/dashboard-builder';

interface DashboardCanvasProps {
  dashboardId: string;
  onSelectComponent: (componentId?: string) => void;
  showGrid?: boolean;
  viewMode?: 'edit' | 'view';
}

/**
 * Dashboard Canvas Component (Canvas Mode)
 *
 * Renders dashboard in canvas mode with absolute positioning
 * - Uses CanvasContainer for the canvas area
 * - Renders CanvasComponent for each component
 * - Supports both canvas mode (components array) and legacy mode (rows array)
 */
export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  dashboardId,
  onSelectComponent,
  showGrid = true,
  viewMode = 'edit',
}) => {
  const {
    config,
    zoom,
    selectedComponentId,
    selectedComponentIds,
    canvasWidth,
    setCanvasWidth,
    moveComponentAbsolute,
    resizeComponent,
    removeComponent,
    selectComponent,
    selectMultiple,
    deselectAll,
    toggleLock,
    convertToCanvas,
    bringToFront,
    sendToBack,
    moveGroup,
  } = useDashboardStore();

  const currentPage = useCurrentPage();

  // Track active component for alignment guides
  const [activeCanvasComponent, setActiveCanvasComponent] = useState<CanvasComponentType | null>(null);

  // Selection box state for drag-to-select
  const [selectionBox, setSelectionBox] = useState<{
    start: { x: number; y: number };
    current: { x: number; y: number };
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Get components from current page
  const canvasComponents = currentPage?.components || [];
  const pageCanvasWidth = currentPage?.canvasWidth || canvasWidth;

  // Auto-convert rows to canvas if needed
  useEffect(() => {
    if (currentPage && !currentPage.components && currentPage.rows && currentPage.rows.length > 0) {
      console.log('Auto-converting row/column layout to canvas mode...');
      convertToCanvas();
    }
  }, [currentPage?.id, convertToCanvas]);

  // Keyboard shortcuts for multi-select
  useEffect(() => {
    const viewMode = 'edit'; // Access from parent prop
    if (viewMode !== 'edit') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - Deselect all
      if (e.key === 'Escape') {
        deselectAll();
      }

      // Ctrl+A / Cmd+A - Select all components
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const allCanvasIds = canvasComponents.map(c => c.id);
        selectMultiple(allCanvasIds);
      }

      // Delete - Remove all selected components
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentIds.size > 0) {
          e.preventDefault();
          selectedComponentIds.forEach(id => {
            const canvasComp = canvasComponents.find(c => c.id === id);
            if (canvasComp && !canvasComp.component.locked) {
              removeComponent(canvasComp.component.id);
            }
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasComponents, selectedComponentIds, deselectAll, selectMultiple, removeComponent]);

  const handlePositionChange = (id: string, x: number, y: number) => {
    moveComponentAbsolute(id, x, y);
    setActiveCanvasComponent(null); // Clear guides after drag
  };

  const handleSizeChange = (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) => {
    resizeComponent(id, width, height, x, y);

    // Update active component for live guides during resize
    const updatedComp = canvasComponents.find(c => c.id === id);
    if (updatedComp) {
      setActiveCanvasComponent({
        ...updatedComp,
        x,
        y,
        width,
        height,
      });
    }
  };

  const handleDragStart = (id: string) => {
    const comp = canvasComponents.find(c => c.id === id);
    if (comp) {
      setActiveCanvasComponent(comp);
    }
  };

  const handleRemove = (id: string) => {
    // Find component by canvas ID
    const canvasComp = canvasComponents.find((c) => c.id === id);
    if (canvasComp) {
      removeComponent(canvasComp.component.id);
    }
  };

  const handleSelect = (id: string, event?: React.MouseEvent) => {
    const canvasComp = canvasComponents.find((c) => c.id === id);
    if (canvasComp) {
      // Shift+click: Add/remove from selection
      const addToSelection = event?.shiftKey || false;
      selectComponent(canvasComp.component.id, addToSelection);
      onSelectComponent(canvasComp.component.id);
    }
  };

  const handleToggleLock = (id: string) => {
    const canvasComp = canvasComponents.find((c) => c.id === id);
    if (canvasComp) {
      toggleLock(canvasComp.component.id);
    }
  };

  const handleCanvasWidthChange = (width: number) => {
    setCanvasWidth(width);
  };

  // Selection box handlers for drag-to-select
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start selection if clicking directly on canvas (not on a component)
    const target = e.target as HTMLElement;
    const isCanvasBackground = target.hasAttribute('data-canvas') || target.classList.contains('canvas-background');

    if (isCanvasBackground && isEditing) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setSelectionBox({
        start: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
        current: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (selectionBox && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();

      setSelectionBox({
        ...selectionBox,
        current: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (selectionBox) {
      // Find components within selection box
      const selectedIds = findComponentsInBox(selectionBox, canvasComponents);

      if (selectedIds.length > 0) {
        selectMultiple(selectedIds);
      } else {
        deselectAll();
      }

      setSelectionBox(null);
    }
  };

  // Find components that intersect with selection box
  const findComponentsInBox = (
    box: { start: { x: number; y: number }; current: { x: number; y: number } },
    components: CanvasComponentType[]
  ): string[] => {
    const boxLeft = Math.min(box.start.x, box.current.x);
    const boxRight = Math.max(box.start.x, box.current.x);
    const boxTop = Math.min(box.start.y, box.current.y);
    const boxBottom = Math.max(box.start.y, box.current.y);

    return components
      .filter((comp) => {
        const compLeft = comp.x;
        const compRight = comp.x + comp.width;
        const compTop = comp.y;
        const compBottom = comp.y + comp.height;

        // Check if selection box intersects component bounds
        return !(
          compRight < boxLeft ||
          compLeft > boxRight ||
          compBottom < boxTop ||
          compTop > boxBottom
        );
      })
      .map((comp) => comp.id);
  };

  const isEditing = viewMode === 'edit';

  return (
    <div className="relative w-full h-full flex flex-col dashboard-canvas">
      {/* Canvas Container */}
      <CanvasContainer
        canvasWidth={pageCanvasWidth}
        onCanvasWidthChange={handleCanvasWidthChange}
        showGrid={showGrid}
        isEditing={isEditing}
        zoom={zoom}
      >
        {/* Canvas background with selection handlers */}
        <div
          ref={canvasRef}
          data-canvas
          className="canvas-background absolute inset-0"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => setSelectionBox(null)} // Cancel selection if mouse leaves
          style={{ zIndex: -1 }} // Behind all components
        />

        {/* Selection Box */}
        {selectionBox && (
          <SelectionBox
            start={selectionBox.start}
            current={selectionBox.current}
          />
        )}

        {/* Alignment Guides */}
        {isEditing && (
          <AlignmentGuides
            activeComponent={activeCanvasComponent}
            allComponents={canvasComponents}
            canvasWidth={pageCanvasWidth}
            tolerance={2}
          />
        )}

        {/* Render Canvas Components */}
        {canvasComponents.map((canvasComp) => (
          <CanvasComponent
            key={canvasComp.id}
            id={canvasComp.id}
            position={{
              x: canvasComp.x,
              y: canvasComp.y,
              width: canvasComp.width,
              height: canvasComp.height,
            }}
            component={canvasComp.component}
            zIndex={canvasComp.zIndex || 0}
            isEditing={isEditing}
            isSelected={selectedComponentIds.has(canvasComp.id)}
            isMultiSelect={selectedComponentIds.size > 1}
            selectedComponentIds={selectedComponentIds}
            onPositionChange={handlePositionChange}
            onGroupMove={moveGroup}
            onSizeChange={handleSizeChange}
            onRemove={handleRemove}
            onSelect={handleSelect}
            onToggleLock={handleToggleLock}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onDragStart={handleDragStart}
          />
        ))}

        {/* Empty State */}
        {canvasComponents.length === 0 && isEditing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="empty-state fade-in">
              <div className="empty-state-icon">
                <Plus className="w-full h-full" />
              </div>
              <h3 className="empty-state-title">
                Start building your dashboard
              </h3>
              <p className="empty-state-description mb-6">
                Add components from the sidebar to begin creating your canvas-based dashboard.
                Drag, resize, and position components anywhere you like.
              </p>
              <p className="text-sm text-gray-500">
                💡 Tip: Components snap to a 20px grid for perfect alignment
              </p>
            </div>
          </div>
        )}
      </CanvasContainer>

      {/* Styles */}
      <style jsx>{`
        .empty-state {
          text-align: center;
          max-width: 500px;
          padding: 2rem;
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          color: hsl(var(--muted-foreground));
        }

        .empty-state-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .empty-state-description {
          color: hsl(var(--muted-foreground));
          line-height: 1.6;
        }

        .fade-in {
          animation: fadeIn 300ms ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
