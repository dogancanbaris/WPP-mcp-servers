'use client';

import React, { useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X, Settings, Maximize2, GripHorizontal, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartWrapper } from './ChartWrapper';
import { ComponentPicker } from './dialogs/ComponentPicker';
import { ColumnWidth, ComponentType, ComponentConfig } from '@/types/dashboard-builder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnProps {
  id: string;
  rowId: string;
  width: ColumnWidth;
  component?: ComponentConfig;
  onComponentAdd: (type: ComponentType) => void;
  onComponentRemove: () => void;
  onWidthChange: (width: ColumnWidth) => void;
  onRemove: () => void;
  isEditing?: boolean;
}

const widthClasses: Record<ColumnWidth, string> = {
  '1/1': 'w-full',
  '1/2': 'w-1/2',
  '1/3': 'w-1/3',
  '2/3': 'w-2/3',
  '1/4': 'w-1/4',
  '3/4': 'w-3/4',
};

const widthLabels: Record<ColumnWidth, string> = {
  '1/1': 'Full Width',
  '1/2': 'Half Width',
  '1/3': 'One Third',
  '2/3': 'Two Thirds',
  '1/4': 'Quarter',
  '3/4': 'Three Quarters',
};

const minHeightClasses: Record<ColumnWidth, string> = {
  '1/1': 'min-h-[500px]',  // Full width = tallest
  '1/2': 'min-h-[450px]',  // Half width
  '1/3': 'min-h-[400px]',  // Third width
  '2/3': 'min-h-[450px]',  // Two thirds
  '1/4': 'min-h-[350px]',  // Quarter = shortest
  '3/4': 'min-h-[480px]',  // Three quarters
};

interface ComponentItemProps {
  component: ComponentConfig;
  columnId: string;
  rowId: string;
  onRemove: () => void;
  isEditing: boolean;
}

const SortableComponentItem: React.FC<ComponentItemProps> = ({
  component,
  columnId,
  rowId,
  onRemove,
  isEditing
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: component.id,
    data: {
      type: 'component',
      componentId: component.id,
      columnId,
      rowId
    },
    disabled: !isEditing
  });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition
  }), [transform, transition]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative h-full",
        "rounded-lg",
        isDragging && "ring-2 ring-blue-300 shadow-lg"
      )}
      {...attributes}
      suppressHydrationWarning
    >
      {isEditing && (
        <button
          ref={setActivatorNodeRef}
          className={cn(
            "absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center",
            "rounded-md border border-gray-200 bg-white text-gray-400 shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "cursor-grab active:cursor-grabbing"
          )}
          {...listeners}
          type="button"
          aria-label="Drag component"
          suppressHydrationWarning
        >
          <GripVertical className="h-3 w-3" />
        </button>
      )}

      <ChartWrapper
        config={component}
        onClick={() => {/* Open component settings */}}
        isSelected={false}
      />

      {isEditing && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "p-1.5 rounded-md",
                "bg-white dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "hover:bg-gray-50 dark:hover:bg-gray-800"
              )}>
                <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {/* Open settings */}}>
                Configure Component
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* Duplicate */}}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onRemove}
                className="text-red-600 dark:text-red-400"
              >
                Remove Component
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={onRemove}
            className={cn(
              "p-1.5 rounded-md",
              "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
              "hover:bg-red-100 dark:hover:bg-red-900"
            )}
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

interface EmptyComponentDropzoneProps {
  columnId: string;
  rowId: string;
  onAdd: () => void;
}

const EmptyComponentDropzone: React.FC<EmptyComponentDropzoneProps> = ({
  columnId,
  rowId,
  onAdd
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `component-drop-${columnId}`,
    data: {
      type: 'component-drop',
      columnId,
      rowId
    }
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onAdd}
      className={cn(
        "w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2",
        "text-gray-500 dark:text-gray-400",
        "transition-colors duration-200",
        "border-2 border-dashed border-transparent",
        isOver ? "border-blue-400 bg-blue-50 dark:bg-blue-950/50" : "hover:text-gray-700 dark:hover:text-gray-200"
      )}
    >
      <Plus className="w-6 h-6" />
      <span className="text-sm">Add Component</span>
    </button>
  );
};

export const Column: React.FC<ColumnProps> = ({
  id,
  rowId,
  width,
  component,
  onComponentAdd,
  onComponentRemove,
  onWidthChange,
  onRemove,
  isEditing = true
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    data: {
      type: 'column',
      columnId: id,
      rowId
    },
    disabled: !isEditing
  });

  const columnStyle = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition
  }), [transform, transition]);

  const { setNodeRef: setDropZoneRef, isOver } = useDroppable({
    id: `column-dropzone-${id}`,
    data: {
      type: 'column-dropzone',
      columnId: id,
      rowId
    }
  });

  const handleComponentSelect = (type: ComponentType) => {
    onComponentAdd(type);
    setShowPicker(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={columnStyle}
        className={cn(
          "relative group p-0", // Changed p-2 to p-0, components control their own padding
          widthClasses[width],
          component && minHeightClasses[width],  // ADD: Responsive min-height when component exists
          "border rounded-lg transition-all duration-200",
          component ? (
            "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
          ) : (
            "border-dashed border-gray-300 dark:border-gray-700 min-h-[100px]" // Keep min-height only for empty columns
          ),
          isDragging && "ring-2 ring-blue-300 shadow-lg",
          isOver && "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/50",
          !component && isEditing && "hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer"
        )}
        suppressHydrationWarning
      >
        {isEditing && (
          <button
            ref={setActivatorNodeRef}
            className={cn(
              "absolute -left-3 top-3 z-10 flex h-6 w-6 items-center justify-center",
              "rounded-md border border-gray-200 bg-white text-gray-400 shadow-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "cursor-grab active:cursor-grabbing"
            )}
            {...listeners}
            {...attributes}
            aria-label="Drag column"
            type="button"
            suppressHydrationWarning
          >
            <GripHorizontal className="h-3 w-3" />
          </button>
        )}

        <div
          ref={setDropZoneRef}
          className={cn(
            "relative h-full",
            isOver && "ring-2 ring-blue-400 ring-offset-2"
          )}
        >
          <SortableContext
            items={component ? [component.id] : []}
            strategy={rectSortingStrategy}
          >
            {component ? (
              <SortableComponentItem
                component={component}
                columnId={id}
                rowId={rowId}
                onRemove={onComponentRemove}
                isEditing={isEditing}
              />
            ) : (
              isEditing && (
                <EmptyComponentDropzone
                  columnId={id}
                  rowId={rowId}
                  onAdd={() => setShowPicker(true)}
                />
              )
            )}
          </SortableContext>
        </div>

        {/* Column Settings */}
        {isEditing && (
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "p-1 rounded-md text-xs",
                  "bg-white dark:bg-gray-800",
                  "border border-gray-200 dark:border-gray-700",
                  "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}>
                  <Maximize2 className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <div className="px-2 py-1 text-xs font-medium text-gray-500">
                  Column Width
                </div>
                {Object.entries(widthLabels).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => onWidthChange(value as ColumnWidth)}
                    className={cn(
                      width === value && "bg-blue-50 dark:bg-blue-950"
                    )}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onRemove}
                  className="text-red-600 dark:text-red-400"
                >
                  Remove Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Component Picker Modal */}
      {showPicker && (
        <ComponentPicker
          onSelect={handleComponentSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};