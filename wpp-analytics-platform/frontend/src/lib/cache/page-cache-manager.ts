/**
 * Page Cache Manager - Centralized Cache Invalidation
 *
 * Manages page-aware query caching and invalidation.
 * Provides fine-grained control over cache lifecycle.
 */

import { QueryClient } from '@tanstack/react-query';

export class PageCacheManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate all queries for a specific page
   */
  invalidatePage(dashboardId: string, pageId: string) {
    this.queryClient.invalidateQueries({
      queryKey: ['page-component-data', pageId],
    });
  }

  /**
   * Invalidate all queries for entire dashboard
   */
  invalidateDashboard(dashboardId: string) {
    this.queryClient.invalidateQueries({
      queryKey: ['page-component-data'],
    });
  }

  /**
   * Invalidate specific component on a page
   */
  invalidateComponent(pageId: string, componentId: string) {
    this.queryClient.invalidateQueries({
      queryKey: ['page-component-data', pageId, componentId],
    });
  }

  /**
   * Clear all page caches (use when filters change globally)
   */
  clearAll() {
    this.queryClient.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.isActive()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    };
  }
}

// Export singleton instance
export let pageCacheManager: PageCacheManager | null = null;

export function initPageCacheManager(queryClient: QueryClient) {
  pageCacheManager = new PageCacheManager(queryClient);
  return pageCacheManager;
}

export function getPageCacheManager(): PageCacheManager {
  if (!pageCacheManager) {
    throw new Error('PageCacheManager not initialized. Call initPageCacheManager first.');
  }
  return pageCacheManager;
}
