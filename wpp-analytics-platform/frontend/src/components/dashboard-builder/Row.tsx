'use client';

import React from 'react';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Column } from './Column';
import { ColumnConfig } from '@/types/dashboard-builder';

interface RowProps {
  id: string;
  columns: ColumnConfig[];
  onDelete: () => void;
  onAddColumn: () => void;
  onUpdateColumn: (columnId: string, updates: Partial<ColumnConfig>) => void;
  onRemoveColumn: (columnId: string) => void;
  isEditing?: boolean;
}

export const Row: React.FC<RowProps> = ({
  id,
  columns,
  onDelete,
  onAddColumn,
  onUpdateColumn,
  onRemoveColumn,
  isEditing = true
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition
  } = useSortable({
    id,
    data: {
      type: 'row',
      rowId: id
    },
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEmpty = columns.length === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group relative flex items-start mb-4", // Changed items-stretch to items-start, removed min-h-[120px]
        "rounded-lg transition-all duration-200",
        isEmpty ? (
          "border-2 border-dashed border-gray-300 dark:border-gray-700 min-h-[120px]" // Keep min-height only for empty rows
        ) : (
          "border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
        ),
        // Removed isDragging opacity effect as it was causing display issues
        "bg-white dark:bg-gray-950"
      )}
      suppressHydrationWarning
    >
      {/* Drag Handle - Left Side */}
      {isEditing && (
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center",
            "bg-gray-50 dark:bg-gray-900 rounded-l-lg",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "cursor-grab active:cursor-grabbing",
            "border-r border-gray-200 dark:border-gray-800"
          )}
          ref={setActivatorNodeRef}
          {...listeners}
          suppressHydrationWarning
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex items-start p-1", // Changed items-stretch to items-start, p-4 to p-1 for auto-height
        isEditing && "ml-8" // Offset for drag handle
      )}>
        {isEmpty ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Add columns to this row
            </p>
            {isEditing && (
              <button
                onClick={onAddColumn}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2",
                  "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
                  "rounded-md hover:bg-blue-100 dark:hover:bg-blue-900",
                  "transition-colors duration-200"
                )}
              >
                <Plus className="w-4 h-4" />
                Add Column
              </button>
            )}
          </div>
        ) : (
          // Columns Container
          <div className="flex gap-4 flex-1">
            <SortableContext
              items={columns.map((column) => column.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column, index) => (
                <Column
                  key={column.id}
                  id={column.id}
                  rowId={id}
                  width={column.width}
                  component={column.component}
                  onComponentAdd={(type) =>
                    onUpdateColumn(column.id, {
                      component: {
                        id: `component-${Date.now()}`,
                        type,
                        title: `New ${type.replace('-', ' ')}`
                      }
                    })
                  }
                  onComponentRemove={() =>
                    onUpdateColumn(column.id, { component: undefined })
                  }
                  onWidthChange={(width) =>
                    onUpdateColumn(column.id, { width })
                  }
                  onRemove={() => onRemoveColumn(column.id)}
                  isEditing={isEditing}
                />
              ))}
            </SortableContext>
            {/* Add Column Button (when row has columns) */}
            {isEditing && columns.length < 4 && (
              <button
                onClick={onAddColumn}
                className={cn(
                  "w-16 flex items-center justify-center",
                  "border-2 border-dashed border-gray-300 dark:border-gray-700",
                  "rounded-md hover:border-blue-400 dark:hover:border-blue-600",
                  "hover:bg-blue-50 dark:hover:bg-blue-950/50",
                  "transition-all duration-200"
                )}
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Button - Right Side */}
      {isEditing && !isEmpty && (
        <button
          onClick={onDelete}
          className={cn(
            "absolute right-2 top-2",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "p-1.5 rounded-md",
            "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
            "hover:bg-red-100 dark:hover:bg-red-900"
          )}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};