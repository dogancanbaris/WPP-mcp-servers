'use client';

import React from 'react';
import { ColumnWidth } from '@/types/dashboard-builder';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Columns, Columns2, Columns3, Columns4 } from 'lucide-react';

interface LayoutPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (widths: ColumnWidth[]) => void;
}

interface LayoutOption {
  name: string;
  widths: ColumnWidth[];
  preview: string;
  icon: React.ReactNode;
  description: string;
}

const LAYOUTS: LayoutOption[] = [
  {
    name: 'Single Column',
    widths: ['1/1'],
    preview: '████████████████',
    icon: <Columns className="w-5 h-5" />,
    description: 'Full width layout for large components'
  },
  {
    name: 'Two Columns (Equal)',
    widths: ['1/2', '1/2'],
    preview: '████████ ████████',
    icon: <Columns2 className="w-5 h-5" />,
    description: 'Two equal columns, 50-50 split'
  },
  {
    name: 'Two Columns (1/3 + 2/3)',
    widths: ['1/3', '2/3'],
    preview: '█████ ███████████',
    icon: <Columns2 className="w-5 h-5" />,
    description: 'Narrow left, wide right column'
  },
  {
    name: 'Two Columns (2/3 + 1/3)',
    widths: ['2/3', '1/3'],
    preview: '███████████ █████',
    icon: <Columns2 className="w-5 h-5" />,
    description: 'Wide left, narrow right column'
  },
  {
    name: 'Three Columns (Equal)',
    widths: ['1/3', '1/3', '1/3'],
    preview: '█████ █████ █████',
    icon: <Columns3 className="w-5 h-5" />,
    description: 'Three equal columns, 33-33-33 split'
  },
  {
    name: 'Four Columns (Equal)',
    widths: ['1/4', '1/4', '1/4', '1/4'],
    preview: '████ ████ ████ ████',
    icon: <Columns4 className="w-5 h-5" />,
    description: 'Four equal columns, 25-25-25-25 split'
  }
];

export const LayoutPicker: React.FC<LayoutPickerProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const handleSelect = (widths: ColumnWidth[]) => {
    onSelect(widths);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Choose Row Layout</DialogTitle>
          <DialogDescription>
            Select a column configuration for this row
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.name}
              onClick={() => handleSelect(layout.widths)}
              className={cn(
                "flex flex-col items-start gap-3 p-4 text-left",
                "rounded-lg border-2 border-gray-200 dark:border-gray-700",
                "hover:border-blue-500 dark:hover:border-blue-500",
                "hover:bg-blue-50 dark:hover:bg-blue-950/50",
                "transition-all duration-200",
                "group"
              )}
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-2 w-full">
                <div className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {layout.icon}
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {layout.name}
                </h3>
              </div>

              {/* ASCII Art Preview */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded p-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <div className="font-mono text-xs text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-center break-all">
                  {layout.preview}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {layout.description}
              </p>

              {/* Column Count Badge */}
              <div className="flex items-center gap-2 mt-auto">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {layout.widths.length} column{layout.widths.length > 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
