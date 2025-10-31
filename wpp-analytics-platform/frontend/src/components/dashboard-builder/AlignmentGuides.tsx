'use client';

import React from 'react';
import type { CanvasComponent } from '@/types/dashboard-builder';

interface Guide {
  type: 'width-match' | 'height-match' | 'align-left' | 'align-right' | 'align-top' | 'align-bottom' | 'center-h' | 'center-v';
  position: { x1: number; y1: number; x2: number; y2: number };
  label?: string;
}

interface AlignmentGuidesProps {
  activeComponent: CanvasComponent | null;
  allComponents: CanvasComponent[];
  canvasWidth: number;
  tolerance?: number; // Snap tolerance in pixels (default: 2px)
}

/**
 * Alignment Guides Component
 *
 * Shows Looker-style alignment guides when:
 * - Component dimensions match (width/height)
 * - Component edges align (left/right/top/bottom)
 * - Component centers align (horizontal/vertical)
 */
export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  activeComponent,
  allComponents,
  canvasWidth,
  tolerance = 2,
}) => {
  if (!activeComponent) return null;

  const guides: Guide[] = [];

  // Get active component bounds
  const activeLeft = activeComponent.x;
  const activeRight = activeComponent.x + activeComponent.width;
  const activeTop = activeComponent.y;
  const activeBottom = activeComponent.y + activeComponent.height;
  const activeCenterX = activeComponent.x + activeComponent.width / 2;
  const activeCenterY = activeComponent.y + activeComponent.height / 2;

  // Compare with all other components
  allComponents.forEach((comp) => {
    if (comp.id === activeComponent.id) return;

    const compLeft = comp.x;
    const compRight = comp.x + comp.width;
    const compTop = comp.y;
    const compBottom = comp.y + comp.height;
    const compCenterX = comp.x + comp.width / 2;
    const compCenterY = comp.y + comp.height / 2;

    // Check for matching widths
    if (Math.abs(activeComponent.width - comp.width) <= tolerance) {
      guides.push({
        type: 'width-match',
        position: {
          x1: Math.min(activeLeft, compLeft),
          y1: Math.max(activeBottom, compBottom) + 10,
          x2: Math.max(activeRight, compRight),
          y2: Math.max(activeBottom, compBottom) + 10,
        },
        label: `${Math.round(activeComponent.width)}px`,
      });
    }

    // Check for matching heights
    if (Math.abs(activeComponent.height - comp.height) <= tolerance) {
      guides.push({
        type: 'height-match',
        position: {
          x1: Math.max(activeRight, compRight) + 10,
          y1: Math.min(activeTop, compTop),
          x2: Math.max(activeRight, compRight) + 10,
          y2: Math.max(activeBottom, compBottom),
        },
        label: `${Math.round(activeComponent.height)}px`,
      });
    }

    // Check for left edge alignment
    if (Math.abs(activeLeft - compLeft) <= tolerance) {
      guides.push({
        type: 'align-left',
        position: {
          x1: activeLeft,
          y1: Math.min(activeTop, compTop),
          x2: activeLeft,
          y2: Math.max(activeBottom, compBottom),
        },
      });
    }

    // Check for right edge alignment
    if (Math.abs(activeRight - compRight) <= tolerance) {
      guides.push({
        type: 'align-right',
        position: {
          x1: activeRight,
          y1: Math.min(activeTop, compTop),
          x2: activeRight,
          y2: Math.max(activeBottom, compBottom),
        },
      });
    }

    // Check for top edge alignment
    if (Math.abs(activeTop - compTop) <= tolerance) {
      guides.push({
        type: 'align-top',
        position: {
          x1: Math.min(activeLeft, compLeft),
          y1: activeTop,
          x2: Math.max(activeRight, compRight),
          y2: activeTop,
        },
      });
    }

    // Check for bottom edge alignment
    if (Math.abs(activeBottom - compBottom) <= tolerance) {
      guides.push({
        type: 'align-bottom',
        position: {
          x1: Math.min(activeLeft, compLeft),
          y1: activeBottom,
          x2: Math.max(activeRight, compRight),
          y2: activeBottom,
        },
      });
    }

    // Check for horizontal center alignment
    if (Math.abs(activeCenterX - compCenterX) <= tolerance) {
      guides.push({
        type: 'center-h',
        position: {
          x1: activeCenterX,
          y1: Math.min(activeTop, compTop),
          x2: activeCenterX,
          y2: Math.max(activeBottom, compBottom),
        },
      });
    }

    // Check for vertical center alignment
    if (Math.abs(activeCenterY - compCenterY) <= tolerance) {
      guides.push({
        type: 'center-v',
        position: {
          x1: Math.min(activeLeft, compLeft),
          y1: activeCenterY,
          x2: Math.max(activeRight, compRight),
          y2: activeCenterY,
        },
      });
    }
  });

  // Limit to 5 most relevant guides to avoid clutter
  const relevantGuides = guides.slice(0, 5);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: `${canvasWidth}px`, height: '100%', zIndex: 9999 }}
    >
      {relevantGuides.map((guide, index) => {
        const { x1, y1, x2, y2 } = guide.position;
        const isHorizontal = Math.abs(y1 - y2) < 1;
        const isVertical = Math.abs(x1 - x2) < 1;

        // Magenta/purple color like Looker Studio
        const color = guide.type.startsWith('align') || guide.type.startsWith('center')
          ? '#A855F7' // Purple for alignment
          : '#EC4899'; // Pink for dimension matching

        return (
          <g key={`${guide.type}-${index}`}>
            {/* Guide Line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray={guide.type.includes('match') ? '4 4' : '0'}
            />

            {/* Dimension Label */}
            {guide.label && (
              <g>
                <rect
                  x={isHorizontal ? (x1 + x2) / 2 - 25 : x1 + 5}
                  y={isHorizontal ? y1 - 12 : (y1 + y2) / 2 - 8}
                  width={50}
                  height={16}
                  fill={color}
                  rx={3}
                />
                <text
                  x={isHorizontal ? (x1 + x2) / 2 : x1 + 30}
                  y={isHorizontal ? y1 - 2 : (y1 + y2) / 2 + 3}
                  fill="white"
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {guide.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
