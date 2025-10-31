'use client';

import React from 'react';

interface SelectionBoxProps {
  /** Selection box start position (null if not selecting) */
  start: { x: number; y: number } | null;
  /** Current mouse position while dragging */
  current: { x: number; y: number } | null;
}

/**
 * Selection Box Component
 *
 * Renders a dashed blue rectangle when user is drag-selecting components.
 * Classic design tool behavior (Figma, Sketch, Looker Studio).
 */
export const SelectionBox: React.FC<SelectionBoxProps> = ({ start, current }) => {
  if (!start || !current) return null;

  // Calculate rectangle bounds (handle any drag direction)
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  // Only show if dragged at least 5px (prevent accidental selections)
  if (width < 5 && height < 5) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px dashed #3b82f6', // Blue dashed border
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Semi-transparent blue fill
        borderRadius: '2px',
        zIndex: 10000, // Above all components
      }}
    >
      {/* Optional: Show selection dimensions */}
      <div
        className="absolute bottom-1 right-1 px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium"
        style={{ pointerEvents: 'none' }}
      >
        {Math.round(width)} × {Math.round(height)}
      </div>
    </div>
  );
};
