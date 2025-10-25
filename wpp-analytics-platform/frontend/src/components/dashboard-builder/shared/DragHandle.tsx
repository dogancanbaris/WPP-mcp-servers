import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DragHandleProps {
  className?: string;
  size?: number;
  isDragging?: boolean;
  isDisabled?: boolean;
}

/**
 * DragHandle Component
 *
 * Reusable drag handle for drag-and-drop interfaces
 * Used in Row, MetricRow, and other draggable items
 * Provides consistent visual feedback for draggable elements
 *
 * @example
 * <DragHandle />
 * <DragHandle isDragging={true} />
 * <DragHandle size={20} className="text-gray-400" />
 */
export const DragHandle: React.FC<DragHandleProps> = ({
  className,
  size = 16,
  isDragging = false,
  isDisabled = false,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center cursor-grab active:cursor-grabbing',
        'text-gray-400 hover:text-gray-600 transition-colors',
        isDragging && 'text-blue-500 cursor-grabbing',
        isDisabled && 'opacity-30 cursor-not-allowed',
        className
      )}
      aria-label="Drag to reorder"
      role="button"
      tabIndex={isDisabled ? -1 : 0}
    >
      <GripVertical size={size} />
    </div>
  );
};

/**
 * Inline drag handle for compact layouts
 */
export const InlineDragHandle: React.FC<DragHandleProps> = (props) => (
  <DragHandle {...props} size={14} className={cn('mr-1', props.className)} />
);

/**
 * Large drag handle for prominent items
 */
export const LargeDragHandle: React.FC<DragHandleProps> = (props) => (
  <DragHandle {...props} size={20} />
);
