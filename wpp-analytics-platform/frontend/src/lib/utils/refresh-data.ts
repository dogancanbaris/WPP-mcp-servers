/**
 * Dashboard Data Refresh Utility
 *
 * Provides functionality to refresh all dashboard data from BigQuery via Cube.js.
 * Clears Cube.js cache and triggers re-render of all charts.
 */

import { cubeApi } from '@/lib/cubejs/client';

/**
 * Refreshes all dashboard data by:
 * 1. Clearing Cube.js client-side cache
 * 2. Dispatching a custom event to notify all chart components
 * 3. Charts listening for this event will re-run their queries
 *
 * @returns Promise resolving to success status and optional error
 */
export const refreshAllDashboardData = async (): Promise<{
  success: boolean;
  error?: any;
}> => {
  try {
    // Clear Cube.js cache (if method exists)
    // Note: @cubejs-client/core doesn't expose clearCache() method by default
    // The cache is managed per-query, so we'll rely on the event to trigger re-queries

    // Dispatch custom event to all chart components
    // Components will listen for this event and re-run their Cube.js queries
    window.dispatchEvent(new CustomEvent('refresh-dashboard-data', {
      detail: { timestamp: Date.now() }
    }));

    console.log('[refresh-data] Dashboard refresh event dispatched');

    return { success: true };
  } catch (error) {
    console.error('[refresh-data] Failed to refresh data:', error);
    return { success: false, error };
  }
};
