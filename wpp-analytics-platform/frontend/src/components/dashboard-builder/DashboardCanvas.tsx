'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Selecto from 'react-selecto';
import { useDashboardStore, useCurrentPage } from '@/store/dashboardStore';
import { CanvasContainer } from './CanvasContainer';
import { CanvasComponent } from './CanvasComponent';
import { AlignmentGuides } from './AlignmentGuides';
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
    canvasHeight,
    setCanvasWidth,
    setCanvasHeight,
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
    duplicateComponent,
  } = useDashboardStore();

  const currentPage = useCurrentPage();

  // Track active component for alignment guides
  // Track active components for alignment guides (supports multi-select)
  const [activeCanvasComponents, setActiveCanvasComponents] = useState<CanvasComponentType[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const selectoRef = useRef<Selecto>(null);

  // Get components from current page
  const canvasComponents = currentPage?.components || [];
  const pageCanvasWidth = currentPage?.canvasWidth || canvasWidth;
  const pageCanvasHeight = currentPage?.canvasHeight || canvasHeight;

  // Auto-convert rows to canvas if needed
  useEffect(() => {
    if (currentPage && !currentPage.components && currentPage.rows && currentPage.rows.length > 0) {
      console.log('[DashboardCanvas] Auto-converting row/column layout to canvas mode...');
      console.log('[DashboardCanvas] Rows count:', currentPage.rows.length);
      convertToCanvas();
    } else if (currentPage?.components) {
      console.log('[DashboardCanvas] Canvas mode - components:', currentPage.components.length);
      console.log('[DashboardCanvas] First 3 positions:', currentPage.components.slice(0, 3).map(c => ({
        id: c.id,
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height
      })));
    }
  }, [currentPage?.id, convertToCanvas, currentPage?.components, currentPage?.rows]);

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
    setActiveCanvasComponents([]); // Clear guides after drag
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
      setActiveCanvasComponents([{
        ...updatedComp,
        x,
        y,
        width,
        height,
      }]);
    }
  };

  const handleDragStart = (id: string) => {
    // If multi-select, show guides for ALL selected components
    if (selectedComponentIds.size > 1 && selectedComponentIds.has(id)) {
      const activeComps = canvasComponents.filter(c => selectedComponentIds.has(c.id));
      setActiveCanvasComponents(activeComps);
    } else {
      // Single component drag
      const comp = canvasComponents.find(c => c.id === id);
      if (comp) {
        setActiveCanvasComponents([comp]);
      }
    }
  };

  const handleDragPreview = (id: string, preview: { x: number; y: number; width: number; height: number }) => {
    const baseComponent = canvasComponents.find(c => c.id === id);
    if (!baseComponent) return;

    setActiveCanvasComponents([{
      ...baseComponent,
      x: preview.x,
      y: preview.y,
      width: preview.width,
      height: preview.height,
    }]);
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
      // FIX: Use canvas ID, not component ID (store expects canvas IDs)
      selectComponent(canvasComp.id, addToSelection);
      onSelectComponent(canvasComp.component.id); // Still notify with component ID for sidebar
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

  const handleCanvasHeightChange = (height: number) => {
    setCanvasHeight(height);
  };

  const isEditing = viewMode === 'edit';

  // Handle clicks on empty canvas to deselect all
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking canvas background (not a component)
    const target = e.target as HTMLElement;
    const isCanvasBackground = target.hasAttribute('data-canvas') ||
                                target.classList.contains('canvas-grid') ||
                                target.closest('[data-canvas]') === target;

    if (isCanvasBackground && selectedComponentIds.size > 0) {
      deselectAll();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col dashboard-canvas" onClick={handleCanvasClick}>
      {/* Canvas Container */}
      <CanvasContainer
        ref={canvasRef}
        canvasWidth={pageCanvasWidth}
        canvasHeight={pageCanvasHeight}
        onCanvasWidthChange={handleCanvasWidthChange}
        onCanvasHeightChange={handleCanvasHeightChange}
        showGrid={showGrid}
        isEditing={isEditing}
        zoom={zoom}
      >
        {/* Selecto.js - Professional drag-to-select */}
        {isEditing && canvasRef.current && (
          <Selecto
            ref={selectoRef}
            container={canvasRef.current}
            rootContainer={document.body} // CRITICAL: Non-transformed container for accurate coordinates
            dragContainer={canvasRef.current}
            selectableTargets={['.canvas-component']}
            hitRate={0} // Any intersection selects (Looker/Figma style)
            selectByClick={false} // Prevent click conflicts with component clicks
            selectFromInside={false} // Must drag from outside components
            continueSelect={false} // Don't continue adding to selection automatically
            continueSelectWithoutDeselect={true} // Keep existing selection when shift held
            toggleContinueSelect={['shift']} // Shift key for multi-select
            keyContainer={window}
            onDragStart={(e) => {
              // Only stop Selecto for interactive elements (buttons, inputs, etc)
              const target = e.inputEvent.target as HTMLElement;
              const isInteractiveEl = target.closest('button, input, select, textarea, .settings-button, .lock-button, .remove-button, .dropdown-trigger');

              if (isInteractiveEl) {
                e.stop(); // Stop Selecto for interactive elements
                return;
              }

              // For everything else (components, canvas), let click handlers work
              // Don't stop propagation - allows onClick to fire for selection
            }}
            onSelectStart={(e) => {
              console.log('🟦 [Selecto] onSelectStart');
              console.log('  - Input event:', e.inputEvent.type);

              // Clear alignment guides when starting selection
              setActiveCanvasComponents([]);
            }}
            onSelect={(e) => {
              const selectedCanvasIds: string[] = [];

              e.selected.forEach((el) => {
                const canvasId = el.getAttribute('data-canvas-id');

                if (canvasId) {
                  selectedCanvasIds.push(canvasId);
                }
              });

              if (selectedCanvasIds.length > 0) {
                selectMultiple(selectedCanvasIds);
              } else if (e.selected.length === 0 && !e.inputEvent.shiftKey) {
                deselectAll();
              }
            }}
            onSelectEnd={(e) => {
              console.log('🟦 [Selecto] onSelectEnd');
              console.log('  - Final selected count:', e.selected.length);
              console.log('  - Is drag start:', e.isDragStart);
              console.log('  - Is click:', e.isClick);
            }}
          />
        )}

        {/* Alignment Guides */}
        {isEditing && (
          <AlignmentGuides
            activeComponents={activeCanvasComponents}
            allComponents={canvasComponents}
            canvasWidth={pageCanvasWidth}
            tolerance={2}
          />
        )}

        {/* Render Canvas Components */}
        {canvasComponents.map((canvasComp) => {
          const isSelected = selectedComponentIds.has(canvasComp.id);

          return (
            <CanvasComponent
              key={canvasComp.id}
              id={canvasComp.id}
              position={{
                x: canvasComp.x ?? 0,
                y: canvasComp.y ?? 0,
                width: canvasComp.width ?? 300,
                height: canvasComp.height ?? 200,
              }}
              component={canvasComp.component}
              zIndex={canvasComp.zIndex || 0}
              isEditing={isEditing}
              isSelected={isSelected}
              isMultiSelect={selectedComponentIds.size > 1}
              selectedComponentIds={selectedComponentIds}
              onPositionChange={handlePositionChange}
              onGroupMove={moveGroup}
              onSizeChange={handleSizeChange}
              onRemove={handleRemove}
              onSelect={handleSelect}
              onToggleLock={handleToggleLock}
              onBringToFront={bringToFront}
              onDuplicate={duplicateComponent}
              onSendToBack={sendToBack}
              onDragStart={handleDragStart}
              onDragPreview={handleDragPreview}
            />
          );
        })}

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
