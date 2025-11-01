'use client';

/**
 * AlignmentGuides Component - ENHANCED VERSION
 *
 * Shows Looker-style alignment guides for single and multi-select components.
 *
 * Features:
 * - Supports multiple active components (multi-select)
 * - Shows alignments to all other components
 * - Dimension labels on width/height matches
 * - Professional purple/pink color scheme
 * - Limits to 10 most relevant guides to prevent clutter
 * - Smooth animations on guide appearance
 *
 * Guide Types:
 * - Purple solid lines: Edge or center alignment
 * - Pink dashed lines: Width/height dimension match
 * - Labels: Dimension values (e.g., "300px")
 */

import React, { useMemo } from 'react';
import type { CanvasComponent } from '@/types/dashboard-builder';

interface Guide {
  type: 'width-match' | 'height-match' | 'align-left' | 'align-right' | 'align-top' | 'align-bottom' | 'center-h' | 'center-v';
  position: { x1: number; y1: number; x2: number; y2: number };
  label?: string;
  relevance: number; // 0-100, higher = more important
}

interface AlignmentGuidesProps {
  /** One or more active components to show guides for */
  activeComponents: CanvasComponent[];
  /** All components on canvas (to compare against) */
  allComponents: CanvasComponent[];
  /** Canvas width (for SVG sizing) */
  canvasWidth: number;
  /** Snap tolerance in pixels (default: 2px) */
  tolerance?: number;
}

/**
 * Calculate relevance score for a guide (0-100)
 * Higher score = more important to show
 * Priority: exact matches > edge alignment > center alignment
 */
function calculateRelevance(guide: Omit<Guide, 'relevance'>): number {
  switch (guide.type) {
    case 'width-match':
    case 'height-match':
      return 100; // Dimension matches are most important
    case 'align-left':
    case 'align-right':
    case 'align-top':
    case 'align-bottom':
      return 80; // Edge alignment is next most important
    case 'center-h':
    case 'center-v':
      return 60; // Center alignment is least important
    default:
      return 0;
  }
}

/**
 * AlignmentGuides Component
 *
 * Renders SVG guides for component alignment visualization
 */
export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  activeComponents,
  allComponents,
  canvasWidth,
  tolerance = 2,
}) => {
  // Return null if no active components
  if (!activeComponents || activeComponents.length === 0) return null;

  /**
   * Compute guides for all active components
   * Memoized to avoid recalculating on every render
   */
  const relevantGuides = useMemo(() => {
    const guides: Guide[] = [];

    // ENHANCED: For EACH active component, find alignments to all others
    activeComponents.forEach((activeComponent) => {
      // FIX: Skip components with invalid dimensions (prevents NaN errors)
      if (!activeComponent ||
          typeof activeComponent.x !== 'number' ||
          typeof activeComponent.y !== 'number' ||
          typeof activeComponent.width !== 'number' ||
          typeof activeComponent.height !== 'number' ||
          isNaN(activeComponent.x) ||
          isNaN(activeComponent.y) ||
          isNaN(activeComponent.width) ||
          isNaN(activeComponent.height)) {
        return;
      }

      // Get active component bounds
      const activeLeft = activeComponent.x;
      const activeRight = activeComponent.x + activeComponent.width;
      const activeTop = activeComponent.y;
      const activeBottom = activeComponent.y + activeComponent.height;
      const activeCenterX = activeComponent.x + activeComponent.width / 2;
      const activeCenterY = activeComponent.y + activeComponent.height / 2;

      // Compare with all other components
      allComponents.forEach((comp) => {
        if (comp.id === activeComponent.id) return; // Skip self

        // FIX: Skip components with invalid dimensions
        if (!comp ||
            typeof comp.x !== 'number' ||
            typeof comp.y !== 'number' ||
            typeof comp.width !== 'number' ||
            typeof comp.height !== 'number' ||
            isNaN(comp.x) ||
            isNaN(comp.y) ||
            isNaN(comp.width) ||
            isNaN(comp.height)) {
          return;
        }

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
            relevance: calculateRelevance({ type: 'width-match', position: {} as any, label: '' }),
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
            relevance: calculateRelevance({ type: 'height-match', position: {} as any, label: '' }),
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
            relevance: calculateRelevance({ type: 'align-left', position: {} as any }),
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
            relevance: calculateRelevance({ type: 'align-right', position: {} as any }),
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
            relevance: calculateRelevance({ type: 'align-top', position: {} as any }),
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
            relevance: calculateRelevance({ type: 'align-bottom', position: {} as any }),
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
            relevance: calculateRelevance({ type: 'center-h', position: {} as any }),
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
            relevance: calculateRelevance({ type: 'center-v', position: {} as any }),
          });
        }
      });
    });

    // Sort by relevance (descending) and limit to 10 most relevant guides
    // This prevents visual clutter while showing most important alignments
    return guides
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }, [activeComponents, allComponents, tolerance]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: `${canvasWidth}px`, height: '100%', zIndex: 9999 }}
    >
      {relevantGuides.map((guide, index) => {
        const { x1, y1, x2, y2 } = guide.position;
        // Guard against invalid coordinates (prevents NaN warnings in SVG)
        if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
          return null;
        }
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
