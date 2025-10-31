'use client';

/**
 * MovableCanvasComponent
 *
 * Replaces CanvasComponent - uses Moveable instead of react-rnd
 * Works seamlessly with Selecto for multi-select and group operations
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ChartWrapper } from './ChartWrapper';
import { Lock, Unlock, Settings, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ComponentConfig, AbsolutePosition } from '@/types/dashboard-builder';

interface MovableCanvasComponentProps {
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
  /** Callback when component is removed */
  onRemove: (id: string) => void;
  /** Callback when component is selected */
  onSelect: (id: string, event?: React.MouseEvent) => void;
  /** Callback when lock state changes */
  onToggleLock?: (id: string) => void;
  /** Callback when z-index changes */
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  /** All selected component IDs for group operations */
  selectedComponentIds?: Set<string>;
}

/**
 * Get component-type specific minimum sizes
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

/**
 * MovableCanvasComponent
 *
 * Renders component with absolute positioning for Moveable to manipulate
 * No drag/resize logic here - Moveable handles it all from parent
 */
export const MovableCanvasComponent: React.FC<MovableCanvasComponentProps> = ({
  id,
  position,
  component,
  zIndex = 0,
  isEditing = true,
  isSelected = false,
  isMultiSelect = false,
  onRemove,
  onSelect,
  onToggleLock,
  onBringToFront,
  onSendToBack,
  selectedComponentIds,
}) => {
  const isLocked = component.locked || false;

  console.log(`🎨 [MovableCanvasComponent] Rendering ${component.title || id}:`, {
    id,
    position,
    zIndex,
    isSelected,
    isMultiSelect,
  });

  return (
    <div
      className={cn(
        'moveable-element', // Selecto targets this
        'absolute',
        'group',
        isLocked && 'locked',
        isSelected && 'selected'
      )}
      data-canvas-id={id}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        zIndex,
        border: isSelected
          ? '2px solid hsl(var(--primary))'
          : isEditing
          ? '1px dashed rgba(200, 200, 200, 0.3)'
          : 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
        transition: 'border-color 200ms, box-shadow 200ms',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id, e);
      }}
    >
      {/* Chart/Component Content */}
      <div className="w-full h-full overflow-hidden pointer-events-none">
        <ChartWrapper
          config={component}
          onClick={(e) => onSelect(id, e)}
          isSelected={isSelected}
          containerSize={{ width: position.width, height: position.height }}
        />
      </div>

      {/* Component Controls */}
      {isEditing && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-[90] pointer-events-auto">
          {/* Lock/Unlock Button */}
          {onToggleLock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleLock(id);
              }}
              className={cn(
                'p-1.5 rounded-md',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'cursor-pointer',
                isLocked && 'bg-yellow-50 border-yellow-400'
              )}
              title={isLocked ? 'Unlock component' : 'Lock component'}
            >
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-yellow-600 pointer-events-none" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-gray-600 pointer-events-none" />
              )}
            </button>
          )}

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'p-1.5 rounded-md',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  'cursor-pointer'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Settings className="w-3.5 h-3.5 text-gray-600 pointer-events-none" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {/* Group Actions */}
              {isMultiSelect && selectedComponentIds && selectedComponentIds.size > 1 && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      selectedComponentIds.forEach(canvasId => onRemove(canvasId));
                    }}
                    className="text-red-600"
                  >
                    Delete {selectedComponentIds.size} Components
                  </DropdownMenuItem>
                  {onToggleLock && (
                    <DropdownMenuItem onClick={() => {
                      selectedComponentIds.forEach(canvasId => onToggleLock(canvasId));
                    }}>
                      Lock {selectedComponentIds.size} Components
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Single Actions */}
              <DropdownMenuItem onClick={() => onSelect(id)}>Configure Component</DropdownMenuItem>
              {onToggleLock && !isMultiSelect && (
                <DropdownMenuItem onClick={() => onToggleLock(id)}>
                  {isLocked ? 'Unlock' : 'Lock'} Position
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onBringToFront && (
                <DropdownMenuItem onClick={() => onBringToFront(id)}>Bring to Front</DropdownMenuItem>
              )}
              {onSendToBack && (
                <DropdownMenuItem onClick={() => onSendToBack(id)}>Send to Back</DropdownMenuItem>
              )}
              {!isMultiSelect && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onRemove(id)} className="text-red-600">
                    Remove Component
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Locked Indicator */}
      {isLocked && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-yellow-100 border border-yellow-400 text-xs">
          <Lock className="w-3 h-3 inline mr-1" />
          Locked
        </div>
      )}

      {/* Multi-Select Indicator */}
      {isMultiSelect && isSelected && selectedComponentIds && selectedComponentIds.size > 1 && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium shadow-md pointer-events-none">
          {selectedComponentIds.size} selected
        </div>
      )}
    </div>
  );
};
