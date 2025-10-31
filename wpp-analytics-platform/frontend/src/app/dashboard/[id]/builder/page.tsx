'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { DashboardCanvas } from '@/components/dashboard-builder/DashboardCanvas';
import { EditorTopbar } from '@/components/dashboard-builder/topbar';
import { SettingsSidebar } from '@/components/dashboard-builder/sidebar';
import { PageTabs } from '@/components/dashboard-builder/PageTabs';
import { useDashboardStore, useCurrentPageId, usePages, useCurrentPage } from '@/store/dashboardStore';
import { useViewActions } from '@/components/dashboard-builder/actions/view-actions';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import type { RowConfig, ColumnConfig } from '@/types/dashboard-builder';
import '@/styles/dashboard-builder-professional.css';

export default function DashboardBuilder() {
  const params = useParams();
  const searchParams = useSearchParams();
  const dashboardId = params.id as string;
  const pageIdFromUrl = searchParams.get('page');

  // Enable daily auto-refresh for preset date filters
  useDataRefresh();

  const {
    config,
    selectedComponentId,
    viewMode,
    isLoading,
    error,
    selectComponent,
    updateComponent,
    loadDashboard: loadDashboardFromStore,
    setCurrentPage,
    setPageFilters,
  } = useDashboardStore();

  const { showGrid } = useViewActions();

  const currentPageId = useCurrentPageId();
  const pages = usePages();
  const currentPage = useCurrentPage();
  const [filtersReady, setFiltersReady] = useState(false);

  // Load dashboard on mount
  useEffect(() => {
    if (dashboardId && dashboardId !== 'example') {
      loadDashboardFromStore(dashboardId);
    }
  }, [dashboardId, loadDashboardFromStore]);

  // Set page from URL on mount or when URL changes
  useEffect(() => {
    if (pageIdFromUrl && pages && pages.find(p => p.id === pageIdFromUrl)) {
      setCurrentPage(pageIdFromUrl);
    }
  }, [pageIdFromUrl, pages, setCurrentPage]);

  // Ensure a date range filter exists before rendering charts to prevent initial fetch without filters
  useEffect(() => {
    if (!pages || !currentPageId) return;
    const page = pages.find(p => p.id === currentPageId);
    if (!page) return;
    const hasDate = (page.filters || []).some(f => f.field === 'date' && f.operator === 'inDateRange' && Array.isArray(f.values) && f.values.length >= 2);
    if (hasDate) {
      setFiltersReady(true);
      return;
    }
    // Seed Last 30 Days (yesterday inclusive)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday);
    start.setDate(start.getDate() - 29);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const cleaned = (page.filters || []).filter(f => !(f.field === 'date' && f.operator === 'inDateRange'));
    setPageFilters(currentPageId, [
      ...cleaned,
      {
        id: 'date-control-default',
        field: 'date',
        operator: 'inDateRange',
        values: [fmt(start), fmt(yesterday)],
        enabled: true,
      } as any,
    ]);
    setFiltersReady(true);
  }, [pages, currentPageId, setPageFilters]);

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

      {/* Page Tabs - NEW: Google Sheets-style navigation */}
      {pages && pages.length > 0 && (
        <PageTabs />
      )}

      {/* Main Content Area - Canvas + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas - z-index 10 */}
        <div className="flex-1 overflow-hidden z-canvas">
          {filtersReady ? (
            <DashboardCanvas
              dashboardId={dashboardId}
              onSelectComponent={selectComponent}
              showGrid={showGrid}
              viewMode={viewMode}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center text-sm text-muted-foreground">Preparing filters…</div>
            </div>
          )}
        </div>

        {/* Right Settings Sidebar - z-index 40, smooth slide-in - only show in edit mode */}
        {viewMode === 'edit' && filtersReady && (
          <div className="z-sidebar slide-in-right">
            <SettingsSidebar
              selectedComponent={currentPage?.rows
                ?.flatMap((r: RowConfig) => r.columns)
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
