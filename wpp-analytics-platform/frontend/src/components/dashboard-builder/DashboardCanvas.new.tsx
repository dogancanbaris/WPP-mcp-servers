'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDashboardStore, useCurrentPage } from '@/store/dashboardStore';
import { CanvasContainer } from './CanvasContainer';
import { CanvasComponent } from './CanvasComponent';
import { rowColumnToAbsolute } from '@/lib/utils/layout-converter';
import { cn } from '@/lib/utils';
import type { ComponentType } from '@/types/dashboard-builder';

interface DashboardCanvasProps {
  dashboardId: string;
  onSelectComponent: (componentId?: string) => void;
  showGrid?: boolean;
  viewMode?: 'edit' | 'view';
}

/**
 * Dashboard Canvas Component (Canvas Mode)
 *
 * Renders dashboard in canvas mode with absolute positioning
 * - Uses CanvasContainer for the canvas area
 * - Renders CanvasComponent for each component
 * - Supports both canvas mode (components array) and legacy mode (rows array)
 */
export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  dashboardId,
  onSelectComponent,
  showGrid = true,
  viewMode = 'edit',
}) => {
  const {
    config,
    zoom,
    selectedComponentId,
    canvasWidth,
    setCanvasWidth,
    moveComponentAbsolute,
    resizeComponent,
    removeComponent,
    selectComponent,
    toggleLock,
    convertToCanvas,
  } = useDashboardStore();

  const currentPage = useCurrentPage();

  // Auto-convert rows to canvas if needed
  useEffect(() => {
    if (currentPage && !currentPage.components && currentPage.rows && currentPage.rows.length > 0) {
      console.log('Auto-converting row/column layout to canvas mode...');
      convertToCanvas();
    }
  }, [currentPage?.id, convertToCanvas]);

  // Get components from current page
  const canvasComponents = currentPage?.components || [];
  const pageCanvasWidth = currentPage?.canvasWidth || canvasWidth;

  const handlePositionChange = (id: string, x: number, y: number) => {
    moveComponentAbsolute(id, x, y);
  };

  const handleSizeChange = (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) => {
    resizeComponent(id, width, height, x, y);
  };

  const handleRemove = (id: string) => {
    // Find component by canvas ID
    const canvasComp = canvasComponents.find((c) => c.id === id);
    if (canvasComp) {
      removeComponent(canvasComp.component.id);
    }
  };

  const handleSelect = (id: string) => {
    const canvasComp = canvasComponents.find((c) => c.id === id);
    if (canvasComp) {
      selectComponent(canvasComp.component.id);
      onSelectComponent(canvasComp.component.id);
    }
  };

  const handleToggleLock = (id: string) => {
    const canvasComp = canvasComponents.find((c) => c.id === id);
    if (canvasComp) {
      toggleLock(canvasComp.component.id);
    }
  };

  const handleCanvasWidthChange = (width: number) => {
    setCanvasWidth(width);
  };

  const isEditing = viewMode === 'edit';

  return (
    <div className="relative w-full h-full flex flex-col dashboard-canvas">
      {/* Canvas Container */}
      <CanvasContainer
        canvasWidth={pageCanvasWidth}
        onCanvasWidthChange={handleCanvasWidthChange}
        showGrid={showGrid}
        isEditing={isEditing}
        zoom={zoom}
      >
        {/* Render Canvas Components */}
        {canvasComponents.map((canvasComp) => (
          <CanvasComponent
            key={canvasComp.id}
            id={canvasComp.id}
            position={{
              x: canvasComp.x,
              y: canvasComp.y,
              width: canvasComp.width,
              height: canvasComp.height,
            }}
            component={canvasComp.component}
            isEditing={isEditing}
            isSelected={canvasComp.component.id === selectedComponentId}
            onPositionChange={handlePositionChange}
            onSizeChange={handleSizeChange}
            onRemove={handleRemove}
            onSelect={handleSelect}
            onToggleLock={handleToggleLock}
          />
        ))}

        {/* Empty State */}
        {canvasComponents.length === 0 && isEditing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="empty-state fade-in">
              <div className="empty-state-icon">
                <Plus className="w-full h-full" />
              </div>
              <h3 className="empty-state-title">
                Start building your dashboard
              </h3>
              <p className="empty-state-description mb-6">
                Add components from the sidebar to begin creating your canvas-based dashboard.
                Drag, resize, and position components anywhere you like.
              </p>
              <p className="text-sm text-gray-500">
                💡 Tip: Components snap to a 20px grid for perfect alignment
              </p>
            </div>
          </div>
        )}
      </CanvasContainer>

      {/* Styles */}
      <style jsx>{`
        .empty-state {
          text-align: center;
          max-width: 500px;
          padding: 2rem;
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          color: hsl(var(--muted-foreground));
        }

        .empty-state-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }

        .empty-state-description {
          color: hsl(var(--muted-foreground));
          line-height: 1.6;
        }

        .fade-in {
          animation: fadeIn 300ms ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
