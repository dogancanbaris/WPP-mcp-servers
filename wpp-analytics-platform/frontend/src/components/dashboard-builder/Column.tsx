'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, X, Settings, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentPlaceholder } from './ComponentPlaceholder';
import { ChartWrapper } from './ChartWrapper';
import { ComponentPicker } from './ComponentPicker';
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

export const Column: React.FC<ColumnProps> = ({
  id,
  width,
  component,
  onComponentAdd,
  onComponentRemove,
  onWidthChange,
  onRemove,
  isEditing = true
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id });

  const handleComponentSelect = (type: ComponentType) => {
    onComponentAdd(type);
    setShowPicker(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={cn(
          "relative group p-0", // Changed p-2 to p-0, components control their own padding
          widthClasses[width],
          "border rounded-lg transition-all duration-200",
          component ? (
            "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
          ) : (
            "border-dashed border-gray-300 dark:border-gray-700 min-h-[100px]" // Keep min-height only for empty columns
          ),
          isOver && "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/50",
          !component && isEditing && "hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer"
        )}
      >
        {component ? (
          // Component Container
          <div className="relative h-full">
            {/* Render actual chart component */}
            <ChartWrapper
              config={component}
              onClick={() => {/* Open component settings */}}
              isSelected={false}
            />

            {/* Component Actions */}
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
                      onClick={onComponentRemove}
                      className="text-red-600 dark:text-red-400"
                    >
                      Remove Component
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={onComponentRemove}
                  className={cn(
                    "p-1.5 rounded-md",
                    "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
                    "hover:bg-red-100 dark:hover:bg-red-900"
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          isEditing && (
            <button
              onClick={() => setShowPicker(true)}
              className={cn(
                "w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2",
                "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                "transition-colors duration-200"
              )}
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">Add Component</span>
            </button>
          )
        )}

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