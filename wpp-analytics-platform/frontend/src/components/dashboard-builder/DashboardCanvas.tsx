'use client';

/**
 * DashboardCanvas - Moveable.js Migration
 *
 * Replaces react-rnd with Moveable for native group drag/resize support
 *
 * KEY ARCHITECTURE:
 * - Components are simple positioned divs (NOT wrapped in Moveable!)
 * - ONE Moveable instance manages ALL selected components
 * - Moveable receives DOM element references, not component data
 * - Update DOM first (onDrag), then store (onDragEnd)
 * - Selecto integration requires isMoveableElement check to prevent conflicts
 *
 * OFFICIAL PATTERN FROM DAYBRUSH:
 * Moveable + Selecto are designed to work together (same author)
 * Moveable provides: Draggable, Resizable, Groupable (built-in!)
 * Selecto provides: Drag-to-select rectangles, multi-select
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import { useDashboardStore, useCurrentPage } from '@/store/dashboardStore';
import { CanvasContainer } from './CanvasContainer';
import { MovableCanvasComponent } from './MovableCanvasComponent';
import { AlignmentGuides } from './AlignmentGuides';
import { Plus } from 'lucide-react';
import type { CanvasComponent as CanvasComponentType } from '@/types/dashboard-builder';

interface DashboardCanvasProps {
  dashboardId: string;
  onSelectComponent: (componentId?: string) => void;
  showGrid?: boolean;
  viewMode?: 'edit' | 'view';
}

/**
 * Dashboard Canvas Component (Moveable.js Architecture)
 *
 * Components are absolutely positioned divs
 * ONE Moveable instance handles drag/resize for ALL selected
 * Selecto handles multi-select rectangles
 * Store updates happen after DOM manipulation completes
 */
export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  dashboardId,
  onSelectComponent,
  showGrid = true,
  viewMode = 'edit',
}) => {
  // ============================================
  // STORE HOOKS
  // ============================================
  const {
    zoom,
    selectedComponentIds,
    canvasWidth,
    canvasHeight,
    setCanvasWidth,
    setCanvasHeight,
    moveComponentAbsolute,
    resizeComponent,
    moveGroup,
    selectComponent,
    selectMultiple,
    deselectAll,
    toggleLock,
    bringToFront,
    sendToBack,
    removeComponent,
    convertToCanvas,
  } = useDashboardStore();

  const currentPage = useCurrentPage();
  const canvasComponents = currentPage?.components || [];
  const pageCanvasWidth = currentPage?.canvasWidth || canvasWidth;
  const pageCanvasHeight = currentPage?.canvasHeight || canvasHeight;

  // ============================================
  // REFS
  // ============================================
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ============================================
  // STATE
  // ============================================
  // DOM element targets for Moveable (NOT component data!)
  const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([]);

  // ENHANCED: Track active components (array) for alignment guides
  // Supports both single component and multi-select alignment visualization
  const [activeCanvasComponents, setActiveCanvasComponents] = useState<CanvasComponentType[]>([]);

  // ============================================
  // AUTO-CONVERT ROWS TO CANVAS
  // ============================================
  useEffect(() => {
    if (currentPage && !currentPage.components && currentPage.rows?.length > 0) {
      console.log('[Moveable] Auto-converting rows to canvas mode');
      console.log('[Moveable] Rows count:', currentPage.rows.length);
      convertToCanvas();
    } else if (currentPage?.components) {
      console.log('[Moveable] Canvas mode - components:', currentPage.components.length);
    }
  }, [currentPage?.id, convertToCanvas]);

  // ============================================
  // SYNC TARGETS WITH SELECTION
  // ============================================
  useEffect(() => {
    if (!canvasRef.current) return;

    const selectedElements: HTMLElement[] = [];
    selectedComponentIds.forEach(id => {
      const el = canvasRef.current!.querySelector(`[data-canvas-id="${id}"]`) as HTMLElement;
      if (el) {
        selectedElements.push(el);
        console.log(`[Moveable] Added to targets: ${id}`);
      } else {
        console.warn(`[Moveable] Element not found for id: ${id}`);
      }
    });

    setTargets(selectedElements);
    console.log('[Moveable] Targets updated:', selectedElements.length, 'elements');
    console.log('[Moveable] Selected IDs:', Array.from(selectedComponentIds));
  }, [selectedComponentIds]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  useEffect(() => {
    if (viewMode !== 'edit') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - Deselect all
      if (e.key === 'Escape') {
        console.log('[Moveable] ESC - Deselecting all');
        deselectAll();
      }

      // Ctrl+A / Cmd+A - Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const allCanvasIds = canvasComponents.map(c => c.id);
        console.log('[Moveable] Ctrl+A - Selecting all:', allCanvasIds.length);
        selectMultiple(allCanvasIds);
      }

      // Delete/Backspace - Remove selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentIds.size > 0) {
          e.preventDefault();
          console.log('[Moveable] Delete - Removing', selectedComponentIds.size, 'components');
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
  }, [viewMode, canvasComponents, selectedComponentIds, deselectAll, selectMultiple, removeComponent]);

  // ============================================
  // MOVEABLE EVENT HANDLERS - SINGLE DRAG
  // ============================================
  const handleDrag = useCallback(({ target, left, top }) => {
    console.log('[Moveable] onDrag - Updating DOM');
    console.log('  - Target:', target.getAttribute('data-canvas-id'));
    console.log('  - Position:', { left, top });

    // Update DOM directly (CRITICAL: Moveable pattern!)
    target.style.left = `${left}px`;
    target.style.top = `${top}px`;

    // ENHANCED: Update alignment guides for all dragged components
    const id = target.getAttribute('data-canvas-id');
    const activeComps = canvasComponents.filter(c => selectedComponentIds.has(c.id));

    // If dragging multiple components, update all of them
    if (activeComps.length > 0) {
      const updated = activeComps.map(comp =>
        comp.id === id
          ? { ...comp, x: left, y: top }
          : comp
      );
      setActiveCanvasComponents(updated);
    }
  }, [canvasComponents, selectedComponentIds]);

  const handleDragEnd = useCallback(({ target }) => {
    const id = target.getAttribute('data-canvas-id');
    if (!id) return;

    const left = parseFloat(target.style.left) || 0;
    const top = parseFloat(target.style.top) || 0;

    console.log('[Moveable] onDragEnd - Updating store');
    console.log('  - Canvas ID:', id);
    console.log('  - Final position:', { left, top });

    // Update store AFTER DOM manipulation complete
    moveComponentAbsolute(id, left, top);

    // ENHANCED: Clear alignment guides
    setActiveCanvasComponents([]);
  }, [moveComponentAbsolute]);

  // ============================================
  // MOVEABLE EVENT HANDLERS - GROUP DRAG (NATIVE!)
  // ============================================
  const handleDragGroup = useCallback(({ events }) => {
    console.log('[Moveable] onDragGroup - Group drag');
    console.log('  - Components:', events.length);

    // ENHANCED: Update alignment guides for all components being dragged
    const activeComps: CanvasComponentType[] = [];

    events.forEach((ev, index) => {
      console.log(`  - Component ${index}: left=${ev.left}, top=${ev.top}`);
      // Update DOM with transform (Moveable handles this)
      ev.target.style.transform = ev.transform;

      // Track active components for alignment guides
      const id = ev.target.getAttribute('data-canvas-id');
      const comp = canvasComponents.find(c => c.id === id);
      if (comp) {
        activeComps.push({
          ...comp,
          x: ev.left,
          y: ev.top,
        });
      }
    });

    // Update alignment guides
    if (activeComps.length > 0) {
      setActiveCanvasComponents(activeComps);
    }
  }, [canvasComponents]);

  const handleDragGroupEnd = useCallback(({ events }) => {
    console.log('[Moveable] onDragGroupEnd - Updating store for group');
    console.log('  - Components:', events.length);

    events.forEach((ev, index) => {
      const id = ev.target.getAttribute('data-canvas-id');
      if (id) {
        console.log(`  - Component ${index} (${id}): left=${ev.left}, top=${ev.top}`);
        moveComponentAbsolute(id, ev.left, ev.top);
      }
    });

    // ENHANCED: Clear alignment guides
    setActiveCanvasComponents([]);
  }, [moveComponentAbsolute]);

  // ============================================
  // MOVEABLE EVENT HANDLERS - SINGLE RESIZE
  // ============================================
  const handleResize = useCallback(({ target, width, height, drag }) => {
    console.log('[Moveable] onResize - Updating DOM');
    console.log('  - Target:', target.getAttribute('data-canvas-id'));
    console.log('  - Size:', { width, height });
    console.log('  - Drag transform:', drag.transform);

    // Update DOM directly
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
    target.style.transform = drag.transform;

    // ENHANCED: Update alignment guides for all resized components
    const id = target.getAttribute('data-canvas-id');
    const activeComps = canvasComponents.filter(c => selectedComponentIds.has(c.id));

    // If resizing multiple components, update all of them
    if (activeComps.length > 0) {
      const updated = activeComps.map(comp =>
        comp.id === id
          ? { ...comp, x: drag.left, y: drag.top, width, height }
          : comp
      );
      setActiveCanvasComponents(updated);
    }
  }, [canvasComponents, selectedComponentIds]);

  const handleResizeEnd = useCallback(({ target, width, height, drag }) => {
    const id = target.getAttribute('data-canvas-id');
    if (!id) return;

    const left = drag.left;
    const top = drag.top;

    console.log('[Moveable] onResizeEnd - Updating store');
    console.log('  - Canvas ID:', id);
    console.log('  - Final size:', { width, height });
    console.log('  - Final position:', { left, top });

    // Update store AFTER DOM manipulation complete
    resizeComponent(id, width, height, left, top);

    // ENHANCED: Clear alignment guides
    setActiveCanvasComponents([]);
  }, [resizeComponent]);

  // ============================================
  // MOVEABLE EVENT HANDLERS - GROUP RESIZE (NATIVE!)
  // ============================================
  const handleResizeGroup = useCallback(({ events }) => {
    console.log('[Moveable] onResizeGroup - Group resize');
    console.log('  - Components:', events.length);

    // ENHANCED: Update alignment guides for all components being resized
    const activeComps: CanvasComponentType[] = [];

    events.forEach((ev, index) => {
      console.log(`  - Component ${index}: width=${ev.width}, height=${ev.height}`);
      // Update DOM
      ev.target.style.width = `${ev.width}px`;
      ev.target.style.height = `${ev.height}px`;
      ev.target.style.transform = ev.drag.transform;

      // Track active components for alignment guides
      const id = ev.target.getAttribute('data-canvas-id');
      const comp = canvasComponents.find(c => c.id === id);
      if (comp) {
        activeComps.push({
          ...comp,
          x: ev.drag.left,
          y: ev.drag.top,
          width: ev.width,
          height: ev.height,
        });
      }
    });

    // Update alignment guides
    if (activeComps.length > 0) {
      setActiveCanvasComponents(activeComps);
    }
  }, [canvasComponents]);

  const handleResizeGroupEnd = useCallback(({ events }) => {
    console.log('[Moveable] onResizeGroupEnd - Updating store for group');
    console.log('  - Components:', events.length);

    events.forEach((ev, index) => {
      const id = ev.target.getAttribute('data-canvas-id');
      if (id) {
        console.log(`  - Component ${index} (${id}): size=${ev.width}x${ev.height}, pos=${ev.drag.left},${ev.drag.top}`);
        resizeComponent(id, ev.width, ev.height, ev.drag.left, ev.drag.top);
      }
    });

    // ENHANCED: Clear alignment guides
    setActiveCanvasComponents([]);
  }, [resizeComponent]);

  // ============================================
  // SELECTO EVENT HANDLERS
  // ============================================
  const handleSelectoDragStart = useCallback((e) => {
    console.log('[Selecto] onDragStart triggered');
    console.log('  - Input event target:', e.inputEvent.target);
    console.log('  - Target tagName:', (e.inputEvent.target as HTMLElement).tagName);
    console.log('  - Target className:', (e.inputEvent.target as HTMLElement).className);

    // CRITICAL: If clicking a Moveable element, stop Selecto!
    // This prevents conflict between Selecto and Moveable
    if (moveableRef.current?.isMoveableElement(e.inputEvent.target)) {
      console.log('  - STOPPED - Moveable element clicked (let Moveable handle it)');
      e.stop();
      return;
    }

    // Also check for .moveable-element class
    const target = e.inputEvent.target as HTMLElement;
    const componentEl = target.closest('.moveable-element');
    if (componentEl) {
      console.log('  - STOPPED - Moveable component clicked (let Moveable handle it)');
      e.stop();
      return;
    }

    console.log('  - PROCEEDING - Selecto will handle selection');
  }, []);

  const handleSelectoSelectStart = useCallback((e) => {
    console.log('[Selecto] onSelectStart');
    console.log('  - Input event:', e.inputEvent.type);

    // ENHANCED: Clear alignment guides when starting selection
    setActiveCanvasComponents([]);
  }, []);

  const handleSelectoSelect = useCallback((e) => {
    console.log('[Selecto] onSelect event');
    console.log('  - Selected DOM elements:', e.selected.length);
    console.log('  - Added:', e.added.length);
    console.log('  - Removed:', e.removed.length);

    // Get canvas IDs from selected DOM elements
    const selectedCanvasIds: string[] = [];

    e.selected.forEach((el, index) => {
      const canvasId = el.getAttribute('data-canvas-id');
      console.log(`  - Element ${index}:`, {
        tagName: el.tagName,
        className: el.className,
        dataCanvasId: canvasId,
      });

      if (canvasId) {
        selectedCanvasIds.push(canvasId);
      }
    });

    console.log('  - Canvas IDs extracted:', selectedCanvasIds);
    console.log('  - Calling selectMultiple with', selectedCanvasIds.length, 'IDs');

    // Pass DOM elements to Moveable
    setTargets(e.selected);

    // Update store selection state
    if (selectedCanvasIds.length > 0) {
      selectMultiple(selectedCanvasIds);
    } else if (e.selected.length === 0 && !e.inputEvent.shiftKey) {
      console.log('  - No elements selected, calling deselectAll');
      deselectAll();
    }
  }, [selectMultiple, deselectAll]);

  const handleSelectoSelectEnd = useCallback((e) => {
    console.log('[Selecto] onSelectEnd');
    console.log('  - Final selected count:', e.selected.length);
    console.log('  - Is drag start:', e.isDragStart);
    console.log('  - Is click:', e.isClick);
  }, []);

  // ============================================
  // COMPONENT ACTION HANDLERS
  // ============================================
  const handleRemove = useCallback((id: string) => {
    console.log('[Canvas] Remove component:', id);
    const canvasComp = canvasComponents.find(c => c.id === id);
    if (canvasComp) {
      removeComponent(canvasComp.component.id);
    }
  }, [canvasComponents, removeComponent]);

  const handleSelect = useCallback((id: string, event?: React.MouseEvent) => {
    console.log('[Canvas] Select component:', id, 'Shift:', event?.shiftKey);
    const canvasComp = canvasComponents.find(c => c.id === id);
    if (canvasComp) {
      const addToSelection = event?.shiftKey || false;
      selectComponent(canvasComp.component.id, addToSelection);
      onSelectComponent(canvasComp.component.id);
    }
  }, [canvasComponents, selectComponent, onSelectComponent]);

  const handleToggleLock = useCallback((id: string) => {
    console.log('[Canvas] Toggle lock:', id);
    const canvasComp = canvasComponents.find(c => c.id === id);
    if (canvasComp) {
      toggleLock(canvasComp.component.id);
    }
  }, [canvasComponents, toggleLock]);

  // ============================================
  // RENDER
  // ============================================
  const isEditing = viewMode === 'edit';

  return (
    <div className="relative w-full h-full flex flex-col dashboard-canvas">
      <CanvasContainer
        ref={canvasRef}
        canvasWidth={pageCanvasWidth}
        canvasHeight={pageCanvasHeight}
        onCanvasWidthChange={setCanvasWidth}
        onCanvasHeightChange={setCanvasHeight}
        showGrid={showGrid}
        isEditing={isEditing}
        zoom={zoom}
      >
        {/* Render all components as positioned divs */}
        {canvasComponents.map((canvasComp) => {
          const isSelected = selectedComponentIds.has(canvasComp.id);

          console.log(`[Render] Component ${canvasComp.component.title || canvasComp.id}:`, {
            canvasId: canvasComp.id,
            position: { x: canvasComp.x, y: canvasComp.y },
            size: { w: canvasComp.width, h: canvasComp.height },
            zIndex: canvasComp.zIndex || 0,
            isSelected,
            selectedCount: selectedComponentIds.size,
          });

          return (
            <MovableCanvasComponent
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
              isSelected={isSelected}
              isMultiSelect={selectedComponentIds.size > 1}
              selectedComponentIds={selectedComponentIds}
              onRemove={handleRemove}
              onSelect={handleSelect}
              onToggleLock={handleToggleLock}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
            />
          );
        })}

        {/* Moveable - Single instance for all selected */}
        {isEditing && targets.length > 0 && (
          <Moveable
            ref={moveableRef}
            target={targets}

            // Draggable config
            draggable={true}
            throttleDrag={0}
            edgeDraggable={false}
            startDragRotate={0}
            throttleDragRotate={0}

            // Resizable config
            resizable={true}
            keepRatio={false}
            throttleResize={0}
            renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}

            // Grid snapping (20px)
            snappable={true}
            snapThreshold={10}
            snapGridWidth={20}
            snapGridHeight={20}
            isDisplaySnapDigit={true}
            snapGap={true}
            snapElement={true}
            snapCenter={true}
            snapVertical={true}
            snapHorizontal={true}

            // Bounds (canvas limits)
            bounds={{
              left: 0,
              top: 0,
              right: pageCanvasWidth,
              bottom: pageCanvasHeight,
              position: 'css',
            }}

            // Single drag events
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}

            // Group drag events (NATIVE GROUP SUPPORT!)
            onDragGroup={handleDragGroup}
            onDragGroupEnd={handleDragGroupEnd}

            // Single resize events
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}

            // Group resize events (NATIVE GROUP SUPPORT!)
            onResizeGroup={handleResizeGroup}
            onResizeGroupEnd={handleResizeGroupEnd}
          />
        )}

        {/* Selecto - Multi-select rectangles */}
        {isEditing && canvasRef.current && (
          <Selecto
            ref={selectoRef}
            container={canvasRef.current}
            rootContainer={document.body} // CRITICAL: Non-transformed container
            dragContainer={canvasRef.current}
            selectableTargets={['.moveable-element']}
            hitRate={0} // Any intersection selects (Looker/Figma style)
            selectByClick={false} // Prevent conflicts with component clicks
            selectFromInside={false} // Must drag from outside components
            continueSelect={false} // Don't auto-continue selection
            continueSelectWithoutDeselect={true} // Keep existing when shift held
            toggleContinueSelect={['shift']} // Shift key for multi-select
            keyContainer={window}
            onDragStart={handleSelectoDragStart}
            onSelectStart={handleSelectoSelectStart}
            onSelect={handleSelectoSelect}
            onSelectEnd={handleSelectoSelectEnd}
          />
        )}

        {/* Alignment Guides - ENHANCED: Now supports multi-select */}
        {isEditing && (
          <AlignmentGuides
            activeComponents={activeCanvasComponents}
            allComponents={canvasComponents}
            canvasWidth={pageCanvasWidth}
            tolerance={2}
          />
        )}

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
