/**
 * Dashboard Data Refresh Utility
 *
 * Provides functionality to refresh all dashboard data by dispatching
 * a custom browser event that chart components listen to via useRefreshData hook.
 *
 * Updated for dataset-based architecture (no Cube.js).
 */

/**
 * Refreshes all dashboard data by dispatching a custom event.
 * Chart components listening via useRefreshData hook will re-fetch data.
 *
 * @returns Promise resolving to success status and optional error
 */
export const refreshAllDashboardData = async (): Promise<{
  success: boolean;
  error?: any;
}> => {
  try {
    // Dispatch custom event to all chart components
    // Components using useRefreshData hook will detect this and re-query
    window.dispatchEvent(new CustomEvent('refresh-dashboard-data', {
      detail: {
        timestamp: Date.now(),
        source: 'manual-refresh'
      }
    }));

    console.log('[refresh-data] Dashboard refresh event dispatched at', new Date().toISOString());

    return { success: true };
  } catch (error) {
    console.error('[refresh-data] Failed to refresh dashboard data:', error);
    return { success: false, error };
  }
};
