'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler } from 'lucide-react';

interface CanvasContainerProps {
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight?: number;
  /** Callback when canvas width changes */
  onCanvasWidthChange: (width: number) => void;
  /** Callback when canvas height changes */
  onCanvasHeightChange?: (height: number) => void;
  /** Child components to render (CanvasComponent wrappers) */
  children: React.ReactNode;
  /** Whether grid background is visible */
  showGrid?: boolean;
  /** Edit mode enables width controls */
  isEditing?: boolean;
  /** Canvas zoom scale (0-200%) */
  zoom?: number;
  /** Additional className */
  className?: string;
}

/**
 * Canvas Container Component
 *
 * Provides a responsive canvas with:
 * - Absolute positioning for child components
 * - Grid background (20px)
 * - Width control in edit mode
 * - Zoom support
 * - Bounds for react-rnd components
 */
export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  canvasWidth,
  canvasHeight = 800,
  onCanvasWidthChange,
  onCanvasHeightChange,
  children,
  showGrid = true,
  isEditing = true,
  zoom = 100,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = React.useState(canvasWidth.toString());
  const [inputHeight, setInputHeight] = React.useState(canvasHeight.toString());

  // Sync input with props
  useEffect(() => {
    setInputWidth(canvasWidth.toString());
  }, [canvasWidth]);

  useEffect(() => {
    setInputHeight(canvasHeight.toString());
  }, [canvasHeight]);

  const handleWidthChange = (value: string) => {
    setInputWidth(value);

    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 800 && parsed <= 3000) {
      onCanvasWidthChange(parsed);
    }
  };

  const handleWidthBlur = () => {
    const parsed = parseInt(inputWidth);
    if (isNaN(parsed) || parsed < 800) {
      setInputWidth('800');
      onCanvasWidthChange(800);
    } else if (parsed > 3000) {
      setInputWidth('3000');
      onCanvasWidthChange(3000);
    }
  };

  const handleHeightChange = (value: string) => {
    setInputHeight(value);

    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 600 && parsed <= 5000 && onCanvasHeightChange) {
      onCanvasHeightChange(parsed);
    }
  };

  const handleHeightBlur = () => {
    if (!onCanvasHeightChange) return;

    const parsed = parseInt(inputHeight);
    if (isNaN(parsed) || parsed < 600) {
      setInputHeight('600');
      onCanvasHeightChange(600);
    } else if (parsed > 5000) {
      setInputHeight('5000');
      onCanvasHeightChange(5000);
    }
  };

  // Calculate scale for zoom
  const scale = zoom / 100;

  return (
    <div className={cn("relative w-full h-full flex flex-col", className)}>
      {/* Canvas Controls Bar */}
      {isEditing && (
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-gray-500" />
            <Label htmlFor="canvas-width" className="text-sm font-medium">
              Width
            </Label>
            <Input
              id="canvas-width"
              type="number"
              min={800}
              max={3000}
              step={100}
              value={inputWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              onBlur={handleWidthBlur}
              className="w-24 h-8 text-sm"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>

          {/* Canvas Height Control */}
          {onCanvasHeightChange && (
            <div className="flex items-center gap-2">
              <Label htmlFor="canvas-height" className="text-sm font-medium">
                Height
              </Label>
              <Input
                id="canvas-height"
                type="number"
                min={600}
                max={5000}
                step={100}
                value={inputHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                onBlur={handleHeightBlur}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Zoom: {zoom}%
          </div>

          {showGrid && (
            <div className="text-xs text-gray-500 ml-auto">
              Grid: 20px snapping enabled
            </div>
          )}
        </div>
      )}

      {/* Canvas Area with Grid */}
      <div
        className={cn(
          "flex-1 overflow-auto p-6 transition-colors",
          showGrid && "canvas-grid"
        )}
        style={{
          backgroundColor: 'var(--muted)',
        }}
      >
        {/* Canvas Content - Fixed width, scales with zoom */}
        <div
          ref={containerRef}
          data-canvas
          className="mx-auto smooth-zoom origin-top bg-white dark:bg-gray-950 rounded-lg shadow-sm"
          style={{
            transform: `scale(${scale})`,
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`, // Use canvasHeight
            transition: 'width 300ms ease-in-out, height 300ms ease-in-out, transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative', // Important for react-rnd bounds
          }}
        >
          {/* Canvas Components */}
          {children}

          {/* Empty State */}
          {!children && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-medium">Empty Canvas</p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop components from the sidebar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grid Styles */}
      <style jsx>{`
        .canvas-grid {
          background-image:
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        :global(.dark) .canvas-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }

        .smooth-zoom {
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
};
