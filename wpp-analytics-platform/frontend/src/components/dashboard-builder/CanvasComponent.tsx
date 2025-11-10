'use client';

import React, { useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { cn } from '@/lib/utils';
import { ChartWrapper } from './ChartWrapper';
import { GripVertical, X, Settings, Lock, Unlock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ComponentConfig, AbsolutePosition } from '@/types/dashboard-builder';

interface CanvasComponentProps {
  /** Unique ID for this canvas component */
  id: string;
  /** Position and size */
  position: AbsolutePosition;
  /** Component configuration */
  component: ComponentConfig;
  /** Z-index for layering */
  zIndex?: number;
  /** Edit mode enables drag/resize */
  isEditing?: boolean;
  /** Whether component is selected */
  isSelected?: boolean;
  /** Whether this is part of a multi-select group */
  isMultiSelect?: boolean;
  /** Callback when position changes */
  onPositionChange: (id: string, x: number, y: number) => void;
  /** Callback for group move */
  onGroupMove?: (componentIds: Set<string>, deltaX: number, deltaY: number) => void;
  /** All selected component IDs for group operations */
  selectedComponentIds?: Set<string>;
  /** Callback when size changes */
  onSizeChange: (id: string, width: number, height: number, x: number, y: number) => void;
  /** Callback when component is removed */
  onRemove: (id: string) => void;
  /** Callback when component is selected */
  onSelect: (id: string, event?: React.MouseEvent) => void;
  /** Callback when lock state changes */
  onToggleLock?: (id: string) => void;
  /** Callback when z-index changes */
  onBringToFront?: (id: string) => void;
  /** Callback to duplicate the component */
  onDuplicate?: (componentId: string) => void;
  onSendToBack?: (id: string) => void;
  /** Callback when drag starts (for alignment guides) */
  onDragStart?: (id: string) => void;
  /** Callback fired during drag to preview live position */
  onDragPreview?: (id: string, preview: { x: number; y: number; width: number; height: number }) => void;
}

/**
 * Canvas Component Wrapper
 *
 * Wraps react-rnd to provide:
 * - Drag and resize functionality
 * - 20px grid snapping
 * - Bounds checking
 * - Edit mode controls
 */
/**
 * Get component-type specific minimum sizes
 * Smaller components like scorecards can be tiny, larger ones like tables need more space
 */
function getMinSize(componentType: string): { minWidth: number; minHeight: number } {
  switch (componentType) {
    case 'scorecard':
      return { minWidth: 80, minHeight: 60 };
    case 'title':
    case 'text':
      return { minWidth: 100, minHeight: 40 };
    case 'line':
      return { minWidth: 60, minHeight: 20 };
    case 'circle':
    case 'rectangle':
      return { minWidth: 40, minHeight: 40 };
    case 'pie_chart':
    case 'donut_chart':
      return { minWidth: 120, minHeight: 120 };
    case 'table':
      return { minWidth: 300, minHeight: 200 };
    case 'time_series':
    case 'bar_chart':
    case 'line_chart':
    case 'area_chart':
      return { minWidth: 200, minHeight: 150 };
    default:
      return { minWidth: 150, minHeight: 120 };
  }
}

const CanvasComponentInner: React.FC<CanvasComponentProps> = ({
  id,
  position,
  component,
  zIndex = 0,
  isEditing = true,
  isSelected = false,
  isMultiSelect = false,
  onPositionChange,
  onGroupMove,
  selectedComponentIds,
  onSizeChange,
  onRemove,
  onSelect,
  onToggleLock,
  onBringToFront,
  onDuplicate,
  onSendToBack,
  onDragStart,
  onDragPreview,
}) => {
  const [contextMenuPosition, setContextMenuPosition] = React.useState<{ x: number; y: number } | null>(null);
  const contextMenuRef = React.useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeContextMenu = React.useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  const handleContextMenu = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(id, event);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, [id, onSelect]);

  // Track initial position for group drag delta calculation
  const dragStartPos = React.useRef({ x: position.x, y: position.y });
  const isLocked = component.locked || false;

  // Enable drag and resize only in edit mode and when not locked
  const enableDrag = isEditing && !isLocked;
  const enableResize = isEditing && !isLocked;

  // Get component-type specific minimum sizes
  const { minWidth, minHeight } = getMinSize(component.type);

  // Log component state on render
  console.log(`🎨 [CanvasComponent] Rendering ${component.title || id}:`, {
    id,
    zIndex,
    isSelected,
    isMultiSelect,
    position,
    enableDrag,
    enableResize,
    dataCanvasId: id // This should match what Selecto looks for
  });

  const rndStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: isEditing && !isSelected
        ? '1px dashed rgba(200, 200, 200, 0.3)' // Subtle dashed border in edit mode
        : 'none',
      outline: isSelected
        ? '2px solid hsl(var(--primary))' // Use outline for selection (no layout shift)
        : 'none',
      outlineOffset: '-2px', // Inside the component bounds
      borderRadius: '4px',
      backgroundColor: 'transparent', // Transparent - canvas background shows through
      boxShadow: isSelected
        ? '0 4px 12px rgba(0, 0, 0, 0.15)'
        : 'none', // No shadow unless selected
      transition: 'border-color 200ms, box-shadow 200ms',
      // Z-index moved to wrapping div style
    }),
    [isSelected, isEditing]
  );
  React.useEffect(() => {
    const handleGlobalMouseDown = (event: MouseEvent) => {
      if (!contextMenuPosition) return;
      if (contextMenuRef.current && contextMenuRef.current.contains(event.target as Node)) {
        return;
      }
      closeContextMenu();
    };

    window.addEventListener('mousedown', handleGlobalMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleGlobalMouseDown);
    };
  }, [contextMenuPosition, closeContextMenu]);

  const contextMenuTitle = component.title ? `${component.title} options` : 'Component options';

  const contextMenuItems = React.useMemo(() => ([
    {
      label: isLocked ? 'Unlock component' : 'Lock component',
      action: () => onToggleLock?.(component.id),
      disabled: !onToggleLock
    },
    {
      label: 'Duplicate component',
      action: () => onDuplicate?.(component.id),
      disabled: !onDuplicate
    },
    {
      label: 'Bring to front',
      action: () => onBringToFront?.(id),
      disabled: !onBringToFront
    },
    {
      label: 'Send to back',
      action: () => onSendToBack?.(id),
      disabled: !onSendToBack
    },
    {
      label: 'Remove component',
      action: () => onRemove(id),
      disabled: false
    }
  ]), [
    component.id,
    id,
    isLocked,
    onBringToFront,
    onDuplicate,
    onRemove,
    onSendToBack,
    onToggleLock
  ]);

  const handleContextMenuAction = React.useCallback((action?: () => void) => {
    if (action) {
      action();
    }
    closeContextMenu();
  }, [closeContextMenu]);

  const handleDragStart = useCallback(() => {
    // Store initial position for delta calculation
    dragStartPos.current = { x: position.x, y: position.y };

    if (onDragStart) {
      onDragStart(id);
    }
  }, [id, position.x, position.y, onDragStart]);

  // Live group drag - update all selected components in real-time during drag
  const handleDrag = useCallback((_e: any, d: { x: number; y: number }) => {
    // Check if this is part of a multi-select group
    if (isMultiSelect && selectedComponentIds && selectedComponentIds.has(id) && selectedComponentIds.size > 1 && onGroupMove) {
      // Calculate delta from start position
      const deltaX = d.x - dragStartPos.current.x;
      const deltaY = d.y - dragStartPos.current.y;

      // Move entire group in real-time (throttled by react-rnd internally)
      onGroupMove(selectedComponentIds, deltaX, deltaY);
    } else if (onDragPreview) {
      onDragPreview(id, {
        x: d.x,
        y: d.y,
        width: position.width,
        height: position.height
      });
    }
    // Single component drag handled automatically by Rnd position prop updates
  }, [id, isMultiSelect, selectedComponentIds, onGroupMove, onDragPreview, position.height, position.width]);

  const handleDragStop = useCallback((_e: any, d: { x: number; y: number }) => {
    console.log('🔄 [Drag] handleDragStop');
    console.log('  - Component ID:', id);
    console.log('  - New position from Rnd:', d);
    console.log('  - Start position:', dragStartPos.current);
    console.log('  - Is multi-select?', isMultiSelect);
    console.log('  - Selected IDs:', Array.from(selectedComponentIds || []));
    console.log('  - This ID in selection?', selectedComponentIds?.has(id));
    console.log('  - Selection size:', selectedComponentIds?.size);
    console.log('  - Has onGroupMove?', !!onGroupMove);

    // Check if this component is part of a multi-select group
    if (isMultiSelect && selectedComponentIds && selectedComponentIds.has(id) && selectedComponentIds.size > 1 && onGroupMove) {
      // Calculate delta from start position
      const deltaX = d.x - dragStartPos.current.x;
      const deltaY = d.y - dragStartPos.current.y;

      console.log('  - ✅ GROUP DRAG TRIGGERED');
      console.log('  - Delta:', { deltaX, deltaY });
      console.log('  - Moving', selectedComponentIds.size, 'components');

      // Move entire group
      onGroupMove(selectedComponentIds, deltaX, deltaY);
    } else {
      console.log('  - Single component move to:', d);
      // Single component move
      onPositionChange(id, d.x, d.y);
    }
  }, [id, isMultiSelect, selectedComponentIds, onGroupMove, onPositionChange]);

  // Live resize preview - updates during resize for immediate feedback
  const handleResize = useCallback((
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number }
  ) => {
    onSizeChange(
      id,
      ref.offsetWidth,
      ref.offsetHeight,
      position.x,
      position.y
    );
  }, [id, onSizeChange]);

  const handleResizeStop = useCallback((
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number }
  ) => {
    onSizeChange(
      id,
      ref.offsetWidth,
      ref.offsetHeight,
      position.x,
      position.y
    );
  }, [id, onSizeChange]);

  return (
    <Rnd
      size={{ width: position.width, height: position.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={handleDragStart}
      onDrag={handleDrag} // Live group drag - moves all selected in real-time
      onDragStop={handleDragStop}
      onContextMenu={handleContextMenu}
      onResize={handleResize} // Live resize preview
      onResizeStop={handleResizeStop}
      bounds="parent"
      grid={[20, 20]} // 20px grid snapping
      minWidth={minWidth}
      minHeight={minHeight}
      disableDragging={!enableDrag}
      // dragHandleClassName removed - can drag from anywhere on component!
      cancel=".settings-button, .lock-button, .remove-button, .dropdown-trigger, button, input, select, textarea" // Don't start drag on interactive elements
      enableResizing={
        enableResize
          ? {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }
          : false
      }
      resizeHandleStyles={{
        top: { cursor: 'ns-resize', zIndex: 100 },
        right: { cursor: 'ew-resize', zIndex: 100 },
        bottom: { cursor: 'ns-resize', zIndex: 100 },
        left: { cursor: 'ew-resize', zIndex: 100 },
        // FIX: Position corner handles exactly on corner intersections
        topRight: { cursor: 'nesw-resize', zIndex: 100, right: '-5px', top: '-5px' },
        topLeft: { cursor: 'nwse-resize', zIndex: 100, left: '-5px', top: '-5px' },
        bottomRight: { cursor: 'nwse-resize', zIndex: 100, right: '-5px', bottom: '-5px' },
        bottomLeft: { cursor: 'nesw-resize', zIndex: 100, left: '-5px', bottom: '-5px' },
      }}
      resizeHandleClasses={{
        top: 'resize-handle-edge',
        right: 'resize-handle-edge',
        bottom: 'resize-handle-edge',
        left: 'resize-handle-edge',
        topRight: 'resize-handle-corner',
        topLeft: 'resize-handle-corner',
        bottomRight: 'resize-handle-corner',
        bottomLeft: 'resize-handle-corner',
      }}
      style={{ ...rndStyle, zIndex }} // Apply z-index in Rnd style (works!)
      className={cn(
        'group canvas-component',
        isLocked && 'locked',
        isSelected && 'selected'
      )}
      data-canvas-id={id} // For Selecto.js to identify components
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id, e); // Pass event for shift-click detection
      }}
    >
      {/* Drag Handle */}
      {isEditing && !isLocked && (
        <div
          className={cn(
            'drag-handle', // For dragHandleClassName
            'absolute left-2 top-2 z-10',
            'flex h-6 w-6 items-center justify-center',
            'rounded-md border border-gray-200 bg-white text-gray-400 shadow-sm',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'pointer-events-auto' // Can be clicked/dragged
            // Remove cursor-grab - let Rnd handle cursor
          )}
        >
          <GripVertical className="h-3 w-3 pointer-events-none" />
        </div>
      )}

      {/* Chart/Component Content */}
      <div className="w-full h-full overflow-hidden">
        <ChartWrapper
          config={component}
          onClick={(e) => onSelect(id, e)}
          isSelected={isSelected}
          containerSize={{ width: position.width, height: position.height }}
        />
      </div>

      {/* Component Controls */}
      {isEditing && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-[90]">
          {/* Lock/Unlock Button */}
          {onToggleLock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault(); // Prevent any drag
                onToggleLock(id);
              }}
              className={cn(
                'lock-button', // For cancel prop
                'p-1.5 rounded-md',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'pointer-events-auto cursor-pointer', // Ensure clickable
                isLocked && 'bg-yellow-50 border-yellow-400'
              )}
              title={isLocked ? 'Unlock component' : 'Lock component'}
            >
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-yellow-600 pointer-events-none" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 pointer-events-none" />
              )}
            </button>
          )}

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'settings-button dropdown-trigger', // For cancel prop
                  'p-1.5 rounded-md',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  'pointer-events-auto cursor-pointer' // Ensure clickable
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault(); // Prevent any drag
                }}
              >
                <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 pointer-events-none" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {/* Group Actions - Show when multiple selected */}
              {isMultiSelect && selectedComponentIds && selectedComponentIds.size > 1 && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      console.log('🗑️ [Group Action] Delete', selectedComponentIds.size, 'components');
                      selectedComponentIds.forEach(canvasId => {
                        const comp = component; // Will need to get actual components
                        onRemove(canvasId);
                      });
                    }}
                    className="text-red-600 dark:text-red-400"
                  >
                    Delete {selectedComponentIds.size} Components
                  </DropdownMenuItem>

                  {onToggleLock && (
                    <DropdownMenuItem onClick={() => {
                      console.log('🔒 [Group Action] Lock', selectedComponentIds.size, 'components');
                      selectedComponentIds.forEach(canvasId => {
                        onToggleLock(canvasId);
                      });
                    }}>
                      Lock {selectedComponentIds.size} Components
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                </>
              )}

              {/* Single Component Actions */}
              <DropdownMenuItem onClick={() => onSelect(id)}>
                Configure Component
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* Duplicate */}}>
                Duplicate
              </DropdownMenuItem>
              {onToggleLock && !isMultiSelect && (
                <DropdownMenuItem onClick={() => onToggleLock(id)}>
                  {isLocked ? 'Unlock' : 'Lock'} Position
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onBringToFront && (
                <DropdownMenuItem onClick={() => onBringToFront(id)}>
                  Bring to Front
                </DropdownMenuItem>
              )}
              {onSendToBack && (
                <DropdownMenuItem onClick={() => onSendToBack(id)}>
                  Send to Back
                </DropdownMenuItem>
              )}
              {(onBringToFront || onSendToBack) && <DropdownMenuSeparator />}
              {!isMultiSelect && (
                <DropdownMenuItem
                  onClick={() => onRemove(id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Remove Component
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault(); // Prevent any drag
              onRemove(id);
            }}
            className={cn(
              'remove-button', // For cancel prop
              'p-1.5 rounded-md',
              'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
              'hover:bg-red-100 dark:hover:bg-red-900',
              'pointer-events-auto cursor-pointer' // Ensure clickable
            )}
          >
            <X className="w-3.5 h-3.5 pointer-events-none" />
          </button>
        </div>
      )}

      {/* Locked Indicator */}
      {isLocked && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-xs text-yellow-800 dark:text-yellow-200">
          <Lock className="w-3 h-3" />
          Locked
        </div>
      )}

      {/* Resize Indicator (shows current size on resize) */}
      {isEditing && !isLocked && (
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-gray-900/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {Math.round(position.width)} × {Math.round(position.height)}
        </div>
      )}

      {/* Multi-Select Indicator */}
      {isMultiSelect && isSelected && selectedComponentIds && selectedComponentIds.size > 1 && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium shadow-md">
          {selectedComponentIds.size} selected
        </div>
      )}
      {contextMenuPosition && isMounted && createPortal(
        <div
          ref={contextMenuRef}
          role="menu"
          aria-label={contextMenuTitle}
          className="bg-white dark:bg-gray-900"
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            padding: 0,
            border: '1px solid rgba(148, 163, 184, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(15, 23, 42, 0.25)',
            minWidth: '0px',
            width: 'max-content',
            maxWidth: '220px',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          <div className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            {contextMenuTitle}
          </div>
          {contextMenuItems.map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => handleContextMenuAction(item.action)}
              disabled={item.disabled}
              className={cn(
                'w-full text-left px-4 py-2 text-sm transition-colors whitespace-normal',
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed bg-transparent'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </Rnd>
  );
};

// Memoize component to prevent unnecessary re-renders
// Only re-render if id, position, component, isEditing, isSelected, or zIndex changes
export const CanvasComponent = React.memo(CanvasComponentInner, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.position.width === nextProps.position.width &&
    prevProps.position.height === nextProps.position.height &&
    prevProps.component === nextProps.component &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.zIndex === nextProps.zIndex // CRITICAL: Track z-index changes!
  );
});
