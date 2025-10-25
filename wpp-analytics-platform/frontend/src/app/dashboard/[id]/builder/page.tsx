'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { DashboardCanvas } from '@/components/dashboard-builder/DashboardCanvas';
import { EditorTopbar } from '@/components/dashboard-builder/topbar';
import { SettingsSidebar } from '@/components/dashboard-builder/sidebar';
import { GlobalFilters } from '@/components/dashboard-builder/GlobalFilters';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilterStore } from '@/store/filterStore';
import { useViewActions } from '@/components/dashboard-builder/actions/view-actions';
import type { RowConfig, ColumnConfig } from '@/types/dashboard-builder';
import '@/styles/dashboard-builder-professional.css';

export default function DashboardBuilder() {
  const params = useParams();
  const dashboardId = params.id as string;

  const {
    config,
    selectedComponentId,
    viewMode,
    isLoading,
    error,
    selectComponent,
    updateComponent,
    loadDashboard: loadDashboardFromStore,
  } = useDashboardStore();

  const { isFilterBarVisible } = useFilterStore();
  const { showGrid } = useViewActions();

  // Load dashboard on mount
  useEffect(() => {
    if (dashboardId && dashboardId !== 'example') {
      loadDashboardFromStore(dashboardId);
    }
  }, [dashboardId, loadDashboardFromStore]);

  // Loading state - Professional with fade-in animation
  if (isLoading) {
    return (
      <div className="h-screen bg-canvas flex items-center justify-center fade-in">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-base font-medium text-foreground mb-1">Loading dashboard...</p>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your workspace</p>
        </div>
      </div>
    );
  }

  // Error state - Professional error display
  if (error) {
    return (
      <div className="h-screen bg-canvas flex items-center justify-center fade-in">
        <div className="error-state max-w-md">
          <div className="error-state-title">Error loading dashboard</div>
          <p className="error-state-message mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-canvas fade-in">
      {/* Topbar - Fixed at top with shadow, z-index 50 */}
      <div className="z-topbar">
        <EditorTopbar dashboardId={dashboardId} />
      </div>

      {/* Global Filters Bar - Smooth slide-in animation */}
      {isFilterBarVisible && (
        <div className="border-b bg-surface shadow-elevation-1 slide-in-top">
          <GlobalFilters className="mx-auto max-w-7xl p-4" />
        </div>
      )}

      {/* Main Content Area - Canvas + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas - z-index 10 */}
        <div className="flex-1 overflow-hidden z-canvas">
          <DashboardCanvas
            dashboardId={dashboardId}
            onSelectComponent={selectComponent}
            showGrid={showGrid}
            viewMode={viewMode}
          />
        </div>

        {/* Right Settings Sidebar - z-index 40, smooth slide-in - only show in edit mode */}
        {viewMode === 'edit' && (
          <div className="z-sidebar slide-in-right">
            <SettingsSidebar
              selectedComponent={config.rows
                .flatMap((r: RowConfig) => r.columns)
                .find((c: ColumnConfig) => c.component?.id === selectedComponentId)
                ?.component
              }
              onUpdateComponent={updateComponent}
            />
          </div>
        )}
      </div>
    </div>
  );
}
