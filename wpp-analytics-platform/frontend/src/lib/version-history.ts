/**
 * Version History Utilities
 *
 * Manages dashboard version snapshots, retrieval, restoration, and diff generation.
 * Integrates with Supabase dashboard_versions table.
 */

import { createClient } from '@/lib/supabase/client';
import type { DashboardConfig } from '@/types/dashboard-builder';

// ============================================================================
// TYPES
// ============================================================================

export type ChangeType =
  | 'created'
  | 'layout_modified'
  | 'component_added'
  | 'component_removed'
  | 'component_updated'
  | 'style_changed'
  | 'filter_changed'
  | 'manual_save'
  | 'auto_save';

export interface DashboardVersion {
  id: string;
  dashboard_id: string;
  version_number: number;
  snapshot: DashboardConfig;
  change_summary?: string;
  change_type: ChangeType;
  created_by?: string;
  created_at: string;
  snapshot_size_bytes?: number;
}

export interface VersionStats {
  total_versions: number;
  oldest_version: string;
  newest_version: string;
  total_size_bytes: number;
  avg_size_bytes: number;
  version_types: Record<ChangeType, number>;
}

export interface DiffItem {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: unknown;
  newValue?: unknown;
  description: string;
}

export interface VersionDiff {
  fromVersion: number;
  toVersion: number;
  changes: DiffItem[];
  summary: string;
}

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

/**
 * Save a new version snapshot
 * Note: This is typically handled automatically by DB trigger,
 * but can be called manually for explicit version creation
 */
export async function saveVersion(
  dashboardId: string,
  snapshot: DashboardConfig,
  changeType: ChangeType = 'manual_save',
  changeSummary?: string
): Promise<{ success: boolean; version?: DashboardVersion; error?: string }> {
  try {
    const supabase = createClient();

    // Get next version number
    const { data: existingVersions, error: countError } = await supabase
      .from('dashboard_versions')
      .select('version_number')
      .eq('dashboard_id', dashboardId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextVersion = existingVersions && existingVersions.length > 0
      ? existingVersions[0].version_number + 1
      : 1;

    // Calculate snapshot size
    const snapshotText = JSON.stringify(snapshot);
    const snapshotSize = new Blob([snapshotText]).size;

    // Insert version
    const { data, error } = await supabase
      .from('dashboard_versions')
      .insert({
        dashboard_id: dashboardId,
        version_number: nextVersion,
        snapshot,
        change_type: changeType,
        change_summary: changeSummary,
        snapshot_size_bytes: snapshotSize
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, version: data as DashboardVersion };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save version'
    };
  }
}

/**
 * Get all versions for a dashboard
 */
export async function getVersions(
  dashboardId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ success: boolean; versions?: DashboardVersion[]; error?: string }> {
  try {
    const supabase = createClient();

    let query = supabase
      .from('dashboard_versions')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('version_number', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, versions: data as DashboardVersion[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load versions'
    };
  }
}

/**
 * Get a specific version by version number
 */
export async function getVersion(
  dashboardId: string,
  versionNumber: number
): Promise<{ success: boolean; version?: DashboardVersion; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('dashboard_versions')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .eq('version_number', versionNumber)
      .single();

    if (error) throw error;

    return { success: true, version: data as DashboardVersion };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load version'
    };
  }
}

/**
 * Get the latest version for a dashboard
 */
export async function getLatestVersion(
  dashboardId: string
): Promise<{ success: boolean; version?: DashboardVersion; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('dashboard_versions')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return { success: true, version: data as DashboardVersion };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load latest version'
    };
  }
}

/**
 * Restore a specific version (creates new version with restored state)
 */
export async function restoreVersion(
  dashboardId: string,
  versionNumber: number
): Promise<{ success: boolean; newVersion?: DashboardVersion; error?: string }> {
  try {
    // Get the version to restore
    const { success, version, error } = await getVersion(dashboardId, versionNumber);

    if (!success || !version) {
      return { success: false, error: error || 'Version not found' };
    }

    // Save as new version with restored snapshot
    const result = await saveVersion(
      dashboardId,
      version.snapshot,
      'manual_save',
      `Restored from version ${versionNumber}`
    );

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to restore version'
    };
  }
}

/**
 * Delete old versions (keep last N)
 */
export async function pruneVersions(
  dashboardId: string,
  keepCount: number = 50
): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    const supabase = createClient();

    // Call the database function
    const { data, error } = await supabase.rpc('prune_old_versions', {
      p_dashboard_id: dashboardId,
      p_keep_count: keepCount
    });

    if (error) throw error;

    return { success: true, deletedCount: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to prune versions'
    };
  }
}

/**
 * Get version statistics
 */
export async function getVersionStats(
  dashboardId: string
): Promise<{ success: boolean; stats?: VersionStats; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.rpc('get_version_stats', {
      p_dashboard_id: dashboardId
    });

    if (error) throw error;

    return { success: true, stats: data as VersionStats };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load stats'
    };
  }
}

// ============================================================================
// DIFF GENERATION
// ============================================================================

/**
 * Compare two versions and generate a diff
 */
export async function compareVersions(
  dashboardId: string,
  fromVersion: number,
  toVersion: number
): Promise<{ success: boolean; diff?: VersionDiff; error?: string }> {
  try {
    // Get both versions
    const [v1Result, v2Result] = await Promise.all([
      getVersion(dashboardId, fromVersion),
      getVersion(dashboardId, toVersion)
    ]);

    if (!v1Result.success || !v1Result.version) {
      return { success: false, error: v1Result.error || 'From version not found' };
    }

    if (!v2Result.success || !v2Result.version) {
      return { success: false, error: v2Result.error || 'To version not found' };
    }

    // Generate diff
    const changes = generateDiff(v1Result.version.snapshot, v2Result.version.snapshot);
    const summary = generateDiffSummary(changes);

    return {
      success: true,
      diff: {
        fromVersion,
        toVersion,
        changes,
        summary
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compare versions'
    };
  }
}

/**
 * Generate diff between two dashboard snapshots
 */
function generateDiff(
  oldSnapshot: DashboardConfig,
  newSnapshot: DashboardConfig
): DiffItem[] {
  const changes: DiffItem[] = [];

  // Compare title
  if (oldSnapshot.title !== newSnapshot.title) {
    changes.push({
      path: 'title',
      type: 'modified',
      oldValue: oldSnapshot.title,
      newValue: newSnapshot.title,
      description: `Title changed from "${oldSnapshot.title}" to "${newSnapshot.title}"`
    });
  }

  // Compare description
  if (oldSnapshot.description !== newSnapshot.description) {
    changes.push({
      path: 'description',
      type: 'modified',
      oldValue: oldSnapshot.description,
      newValue: newSnapshot.description,
      description: 'Description changed'
    });
  }

  // Compare rows
  const oldRowCount = oldSnapshot.rows?.length || 0;
  const newRowCount = newSnapshot.rows?.length || 0;

  if (oldRowCount !== newRowCount) {
    changes.push({
      path: 'rows',
      type: oldRowCount < newRowCount ? 'added' : 'removed',
      oldValue: oldRowCount,
      newValue: newRowCount,
      description: `Row count changed from ${oldRowCount} to ${newRowCount}`
    });
  }

  // Compare components (detailed)
  const oldComponents = extractComponents(oldSnapshot);
  const newComponents = extractComponents(newSnapshot);

  // Find added components
  newComponents.forEach(comp => {
    if (!oldComponents.find(c => c.id === comp.id)) {
      changes.push({
        path: `component.${comp.id}`,
        type: 'added',
        newValue: comp,
        description: `Added ${comp.type} component: "${comp.title}"`
      });
    }
  });

  // Find removed components
  oldComponents.forEach(comp => {
    if (!newComponents.find(c => c.id === comp.id)) {
      changes.push({
        path: `component.${comp.id}`,
        type: 'removed',
        oldValue: comp,
        description: `Removed ${comp.type} component: "${comp.title}"`
      });
    }
  });

  // Find modified components
  newComponents.forEach(newComp => {
    const oldComp = oldComponents.find(c => c.id === newComp.id);
    if (oldComp) {
      const compChanges = compareComponents(oldComp, newComp);
      changes.push(...compChanges);
    }
  });

  // Compare theme
  if (JSON.stringify(oldSnapshot.theme) !== JSON.stringify(newSnapshot.theme)) {
    changes.push({
      path: 'theme',
      type: 'modified',
      oldValue: oldSnapshot.theme,
      newValue: newSnapshot.theme,
      description: 'Theme settings changed'
    });
  }

  return changes;
}

/**
 * Extract all components from dashboard snapshot
 */
function extractComponents(snapshot: DashboardConfig): any[] {
  const components: any[] = [];

  if (snapshot.rows) {
    snapshot.rows.forEach(row => {
      row.columns?.forEach(col => {
        if (col.component) {
          components.push(col.component);
        }
      });
    });
  }

  return components;
}

/**
 * Compare two components
 */
function compareComponents(oldComp: any, newComp: any): DiffItem[] {
  const changes: DiffItem[] = [];

  // Compare title
  if (oldComp.title !== newComp.title) {
    changes.push({
      path: `component.${newComp.id}.title`,
      type: 'modified',
      oldValue: oldComp.title,
      newValue: newComp.title,
      description: `Component title changed from "${oldComp.title}" to "${newComp.title}"`
    });
  }

  // Compare type
  if (oldComp.type !== newComp.type) {
    changes.push({
      path: `component.${newComp.id}.type`,
      type: 'modified',
      oldValue: oldComp.type,
      newValue: newComp.type,
      description: `Component type changed from "${oldComp.type}" to "${newComp.type}"`
    });
  }

  // Compare data source
  if (oldComp.datasource !== newComp.datasource) {
    changes.push({
      path: `component.${newComp.id}.datasource`,
      type: 'modified',
      oldValue: oldComp.datasource,
      newValue: newComp.datasource,
      description: `Data source changed`
    });
  }

  // Compare metrics
  const oldMetrics = JSON.stringify(oldComp.metrics || []);
  const newMetrics = JSON.stringify(newComp.metrics || []);
  if (oldMetrics !== newMetrics) {
    changes.push({
      path: `component.${newComp.id}.metrics`,
      type: 'modified',
      oldValue: oldComp.metrics,
      newValue: newComp.metrics,
      description: `Metrics configuration changed`
    });
  }

  // Compare filters
  const oldFilters = JSON.stringify(oldComp.filters || []);
  const newFilters = JSON.stringify(newComp.filters || []);
  if (oldFilters !== newFilters) {
    changes.push({
      path: `component.${newComp.id}.filters`,
      type: 'modified',
      oldValue: oldComp.filters,
      newValue: newComp.filters,
      description: `Filters changed`
    });
  }

  return changes;
}

/**
 * Generate human-readable summary of changes
 */
function generateDiffSummary(changes: DiffItem[]): string {
  if (changes.length === 0) {
    return 'No changes detected';
  }

  const added = changes.filter(c => c.type === 'added').length;
  const removed = changes.filter(c => c.type === 'removed').length;
  const modified = changes.filter(c => c.type === 'modified').length;

  const parts: string[] = [];

  if (added > 0) parts.push(`${added} addition${added > 1 ? 's' : ''}`);
  if (removed > 0) parts.push(`${removed} deletion${removed > 1 ? 's' : ''}`);
  if (modified > 0) parts.push(`${modified} modification${modified > 1 ? 's' : ''}`);

  return parts.join(', ');
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export version as JSON file
 */
export function exportVersionAsJSON(version: DashboardVersion): void {
  const dataStr = JSON.stringify(version, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard-v${version.version_number}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;

  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}
