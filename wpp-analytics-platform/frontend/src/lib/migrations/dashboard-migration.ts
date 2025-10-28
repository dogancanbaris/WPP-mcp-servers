/**
 * Dashboard Migration Utility
 *
 * Provides automatic migration from old single-page dashboard format to the new
 * multi-page dashboard system. This ensures backward compatibility with existing
 * dashboards while enabling the new page-based architecture.
 *
 * ## Why Migration is Needed
 *
 * Old dashboards stored rows directly on the dashboard object:
 * ```typescript
 * {
 *   id: "dashboard-123",
 *   name: "My Dashboard",
 *   rows: [...]  // rows directly on dashboard
 * }
 * ```
 *
 * New dashboards use a pages array, where each page has its own rows:
 * ```typescript
 * {
 *   id: "dashboard-123",
 *   name: "My Dashboard",
 *   pages: [
 *     {
 *       id: "page-1",
 *       name: "Page 1",
 *       order: 0,
 *       rows: [...]  // rows nested under page
 *     }
 *   ]
 * }
 * ```
 *
 * ## When to Use
 *
 * Call `migrateDashboardConfig()` whenever loading a dashboard from:
 * - Supabase database (may contain old format)
 * - LocalStorage cache (may contain old format)
 * - External imports (may be in old format)
 * - Any untrusted source where format is unknown
 *
 * ## Example Usage
 *
 * ```typescript
 * import { migrateDashboardConfig, isOldFormat } from '@/lib/migrations/dashboard-migration';
 *
 * // Load dashboard from Supabase
 * const rawConfig = await supabase.from('dashboards').select('*').eq('id', id).single();
 *
 * // Migrate if needed (safe to call on any format)
 * const migratedConfig = migrateDashboardConfig(rawConfig);
 *
 * // Now guaranteed to have pages array
 * console.log(migratedConfig.pages); // ✓ Always present
 * ```
 *
 * ## Migration Strategy
 *
 * 1. **Old Format Detection**: Checks for `rows` array without `pages` array
 * 2. **Single Page Conversion**: Converts to single page containing all existing rows
 * 3. **Empty Dashboard Handling**: Creates one empty page if dashboard has no content
 * 4. **Idempotent**: Safe to call multiple times (already migrated configs pass through)
 */

import type { DashboardLayout } from '@/types/dashboard-builder';
import type { PageConfig } from '@/types/page-config';

/**
 * Generate a unique page ID
 *
 * Uses crypto.randomUUID() if available (modern browsers), falls back to
 * timestamp-based ID for compatibility.
 *
 * @returns Unique page identifier string
 */
export function generatePageId(): string {
  // Use native UUID generation if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Detect if a dashboard config is in the old format
 *
 * Old format has:
 * - `rows` array directly on dashboard object
 * - No `pages` array
 *
 * @param config - Dashboard configuration to check
 * @returns true if old format, false if new format or empty
 *
 * @example
 * ```typescript
 * const config = loadFromDatabase();
 * if (isOldFormat(config)) {
 *   console.log("Old format detected - migration needed");
 * }
 * ```
 */
export function isOldFormat(config: any): boolean {
  return !config.pages && config.rows && Array.isArray(config.rows);
}

/**
 * Detect if a dashboard config is in the new multi-page format
 *
 * New format has:
 * - `pages` array with PageConfig objects
 *
 * @param config - Dashboard configuration to check
 * @returns true if new format with pages array
 */
export function isNewFormat(config: any): boolean {
  return config.pages && Array.isArray(config.pages);
}

/**
 * Check if a dashboard is empty (no rows, no pages)
 *
 * @param config - Dashboard configuration to check
 * @returns true if dashboard has no content
 */
export function isEmpty(config: any): boolean {
  return !config.pages && (!config.rows || config.rows.length === 0);
}

/**
 * Migrate dashboard from old format to new multi-page format
 *
 * This function is **idempotent** - safe to call multiple times.
 * It detects the current format and only migrates if needed.
 *
 * ## Migration Scenarios
 *
 * ### Scenario 1: Old Format (rows directly on dashboard)
 * ```typescript
 * // Input
 * {
 *   id: "dash-1",
 *   name: "Sales Dashboard",
 *   rows: [{ id: "row-1", columns: [...] }]
 * }
 *
 * // Output (migrated to single page)
 * {
 *   id: "dash-1",
 *   name: "Sales Dashboard",
 *   pages: [{
 *     id: "page-uuid",
 *     name: "Page 1",
 *     order: 0,
 *     rows: [{ id: "row-1", columns: [...] }],
 *     createdAt: "2025-10-28T00:00:00.000Z"
 *   }],
 *   rows: undefined  // removed
 * }
 * ```
 *
 * ### Scenario 2: New Format (already has pages)
 * ```typescript
 * // Input (already migrated)
 * {
 *   id: "dash-1",
 *   name: "Sales Dashboard",
 *   pages: [{ id: "page-1", name: "Overview", order: 0, rows: [...] }]
 * }
 *
 * // Output (no changes)
 * {
 *   id: "dash-1",
 *   name: "Sales Dashboard",
 *   pages: [{ id: "page-1", name: "Overview", order: 0, rows: [...] }]
 * }
 * ```
 *
 * ### Scenario 3: Empty Dashboard
 * ```typescript
 * // Input (no content)
 * {
 *   id: "dash-1",
 *   name: "New Dashboard"
 * }
 *
 * // Output (creates empty page)
 * {
 *   id: "dash-1",
 *   name: "New Dashboard",
 *   pages: [{
 *     id: "page-uuid",
 *     name: "Page 1",
 *     order: 0,
 *     rows: [],
 *     createdAt: "2025-10-28T00:00:00.000Z"
 *   }]
 * }
 * ```
 *
 * @param config - Dashboard configuration in any format
 * @returns Migrated dashboard with pages array
 *
 * @example
 * ```typescript
 * // Load and migrate in one step
 * const dashboard = migrateDashboardConfig(await loadDashboard(id));
 *
 * // Now safe to access pages
 * dashboard.pages.forEach(page => {
 *   console.log(`Page: ${page.name}, Rows: ${page.rows.length}`);
 * });
 * ```
 */
export function migrateDashboardConfig(config: any): DashboardLayout {
  // OLD FORMAT: Has rows but no pages
  // Convert to single page containing all rows
  if (isOldFormat(config)) {
    const migratedConfig: DashboardLayout = {
      ...config,
      pages: [
        {
          id: generatePageId(),
          name: 'Page 1',
          order: 0,
          rows: config.rows,
          createdAt: new Date().toISOString(),
        } as PageConfig,
      ],
      // Remove old rows property (clean up after migration)
      rows: undefined as any,
    };

    return migratedConfig;
  }

  // NEW FORMAT: Already has pages array
  // Return as-is (already migrated)
  if (isNewFormat(config)) {
    return config as DashboardLayout;
  }

  // EMPTY DASHBOARD: No rows, no pages
  // Create with one empty page
  return {
    ...config,
    pages: [
      {
        id: generatePageId(),
        name: 'Page 1',
        order: 0,
        rows: [],
        createdAt: new Date().toISOString(),
      } as PageConfig,
    ],
  } as DashboardLayout;
}

/**
 * Batch migrate multiple dashboards
 *
 * Useful for migrating entire workspaces or collections.
 *
 * @param configs - Array of dashboard configurations
 * @returns Array of migrated dashboards
 *
 * @example
 * ```typescript
 * const allDashboards = await supabase.from('dashboards').select('*');
 * const migrated = migrateBatch(allDashboards);
 * ```
 */
export function migrateBatch(configs: any[]): DashboardLayout[] {
  return configs.map((config) => migrateDashboardConfig(config));
}

/**
 * Get migration statistics for a dashboard
 *
 * Useful for logging and debugging migration status.
 *
 * @param config - Dashboard configuration
 * @returns Object with migration details
 *
 * @example
 * ```typescript
 * const stats = getMigrationStats(dashboard);
 * console.log(`Format: ${stats.format}, Pages: ${stats.pageCount}`);
 * ```
 */
export function getMigrationStats(config: any): {
  format: 'old' | 'new' | 'empty';
  needsMigration: boolean;
  pageCount: number;
  rowCount: number;
} {
  if (isOldFormat(config)) {
    return {
      format: 'old',
      needsMigration: true,
      pageCount: 0,
      rowCount: config.rows?.length || 0,
    };
  }

  if (isNewFormat(config)) {
    return {
      format: 'new',
      needsMigration: false,
      pageCount: config.pages?.length || 0,
      rowCount: config.pages?.reduce(
        (sum: number, page: PageConfig) => sum + (page.rows?.length || 0),
        0
      ),
    };
  }

  return {
    format: 'empty',
    needsMigration: true,
    pageCount: 0,
    rowCount: 0,
  };
}
