'use client';

import React, { useMemo } from 'react';
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
  /** Edit mode enables drag/resize */
  isEditing?: boolean;
  /** Whether component is selected */
  isSelected?: boolean;
  /** Callback when position changes */
  onPositionChange: (id: string, x: number, y: number) => void;
  /** Callback when size changes */
  onSizeChange: (id: string, width: number, height: number, x: number, y: number) => void;
  /** Callback when component is removed */
  onRemove: (id: string) => void;
  /** Callback when component is selected */
  onSelect: (id: string) => void;
  /** Callback when lock state changes */
  onToggleLock?: (id: string) => void;
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
export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  id,
  position,
  component,
  isEditing = true,
  isSelected = false,
  onPositionChange,
  onSizeChange,
  onRemove,
  onSelect,
  onToggleLock,
}) => {
  const isLocked = component.locked || false;

  // Enable drag and resize only in edit mode and when not locked
  const enableDrag = isEditing && !isLocked;
  const enableResize = isEditing && !isLocked;

  const rndStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: isSelected
        ? '2px solid hsl(var(--primary))'
        : '1px solid hsl(var(--border))',
      borderRadius: '8px',
      backgroundColor: 'hsl(var(--card))',
      boxShadow: isSelected
        ? '0 4px 12px rgba(0, 0, 0, 0.15)'
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'border-color 200ms, box-shadow 200ms',
    }),
    [isSelected]
  );

  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    onPositionChange(id, d.x, d.y);
  };

  const handleResizeStop = (
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
  };

  return (
    <Rnd
      size={{ width: position.width, height: position.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      grid={[20, 20]} // 20px grid snapping
      minWidth={200}
      minHeight={150}
      disableDragging={!enableDrag}
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
      style={rndStyle}
      className={cn(
        'group canvas-component',
        isLocked && 'locked',
        isSelected && 'selected'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      {/* Drag Handle */}
      {isEditing && !isLocked && (
        <div
          className={cn(
            'absolute left-2 top-2 z-10',
            'flex h-6 w-6 items-center justify-center',
            'rounded-md border border-gray-200 bg-white text-gray-400 shadow-sm',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'cursor-grab active:cursor-grabbing'
          )}
        >
          <GripVertical className="h-3 w-3" />
        </div>
      )}

      {/* Chart/Component Content */}
      <div className="w-full h-full overflow-hidden">
        <ChartWrapper
          config={component}
          onClick={() => onSelect(id)}
          isSelected={isSelected}
        />
      </div>

      {/* Component Controls */}
      {isEditing && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Lock/Unlock Button */}
          {onToggleLock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(id);
              }}
              className={cn(
                'p-1.5 rounded-md',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                isLocked && 'bg-yellow-50 border-yellow-400'
              )}
              title={isLocked ? 'Unlock component' : 'Lock component'}
            >
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-yellow-600" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
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
                  'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onSelect(id)}>
                Configure Component
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* Duplicate */}}>
                Duplicate
              </DropdownMenuItem>
              {onToggleLock && (
                <DropdownMenuItem onClick={() => onToggleLock(id)}>
                  {isLocked ? 'Unlock' : 'Lock'} Position
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRemove(id)}
                className="text-red-600 dark:text-red-400"
              >
                Remove Component
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className={cn(
              'p-1.5 rounded-md',
              'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
              'hover:bg-red-100 dark:hover:bg-red-900'
            )}
          >
            <X className="w-3.5 h-3.5" />
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
    </Rnd>
  );
};
