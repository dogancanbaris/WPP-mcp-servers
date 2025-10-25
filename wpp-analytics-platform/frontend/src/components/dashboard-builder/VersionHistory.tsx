'use client';

/**
 * Version History Dialog
 *
 * Displays dashboard version history with:
 * - Timeline of all versions
 * - One-click restore functionality
 * - Visual diff viewer
 * - Export capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import {
  Clock,
  Download,
  RotateCcw,
  GitCompare,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileJson,
  Loader2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  getVersions,
  restoreVersion,
  compareVersions,
  exportVersionAsJSON,
  formatRelativeTime,
  formatBytes,
  type DashboardVersion,
  type VersionDiff,
  type DiffItem,
} from '@/lib/version-history';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface VersionHistoryProps {
  dashboardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: (version: DashboardVersion) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VersionHistory({
  dashboardId,
  open,
  onOpenChange,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<DashboardVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DashboardVersion | null>(null);
  const [compareWithVersion, setCompareWithVersion] = useState<DashboardVersion | null>(null);
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load versions when dialog opens
  useEffect(() => {
    if (open && dashboardId) {
      loadVersions();
    }
  }, [open, dashboardId]);

  // Load all versions
  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getVersions(dashboardId, { limit: 100 });

      if (result.success && result.versions) {
        setVersions(result.versions);
      } else {
        setError(result.error || 'Failed to load versions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  // Restore a version
  const handleRestore = useCallback(async (version: DashboardVersion) => {
    if (!confirm(`Restore to version ${version.version_number}? This will create a new version with the restored state.`)) {
      return;
    }

    setIsRestoring(true);
    setError(null);

    try {
      const result = await restoreVersion(dashboardId, version.version_number);

      if (result.success && result.newVersion) {
        // Callback to parent to update dashboard
        if (onRestore) {
          onRestore(result.newVersion);
        }

        // Reload versions
        await loadVersions();

        // Show success
        alert('Version restored successfully!');
      } else {
        setError(result.error || 'Failed to restore version');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRestoring(false);
    }
  }, [dashboardId, onRestore, loadVersions]);

  // Compare two versions
  const handleCompare = useCallback(async () => {
    if (!selectedVersion || !compareWithVersion) return;

    setIsComparing(true);
    setError(null);

    try {
      const result = await compareVersions(
        dashboardId,
        compareWithVersion.version_number,
        selectedVersion.version_number
      );

      if (result.success && result.diff) {
        setDiff(result.diff);
      } else {
        setError(result.error || 'Failed to compare versions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsComparing(false);
    }
  }, [dashboardId, selectedVersion, compareWithVersion]);

  // Export version
  const handleExport = useCallback((version: DashboardVersion) => {
    exportVersionAsJSON(version);
  }, []);

  // Clear comparison
  const clearComparison = useCallback(() => {
    setCompareWithVersion(null);
    setDiff(null);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View, compare, and restore previous versions of your dashboard
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <p>{error}</p>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 h-[600px]">
          {/* Left Panel: Version List */}
          <div className="flex flex-col border rounded-lg">
            <div className="p-4 border-b bg-muted/50">
              <h3 className="font-semibold">Timeline</h3>
              <p className="text-sm text-muted-foreground">
                {versions.length} version{versions.length !== 1 ? 's' : ''}
              </p>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Clock className="w-12 h-12 mb-2 opacity-50" />
                  <p>No versions found</p>
                </div>
              ) : (
                <div className="p-2">
                  {versions.map((version, index) => (
                    <VersionItem
                      key={version.id}
                      version={version}
                      isSelected={selectedVersion?.id === version.id}
                      isCompareWith={compareWithVersion?.id === version.id}
                      isLatest={index === 0}
                      onSelect={() => setSelectedVersion(version)}
                      onCompare={() => {
                        if (compareWithVersion?.id === version.id) {
                          clearComparison();
                        } else {
                          setCompareWithVersion(version);
                        }
                      }}
                      onRestore={() => handleRestore(version)}
                      onExport={() => handleExport(version)}
                      isRestoring={isRestoring}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel: Details/Diff Viewer */}
          <div className="flex flex-col border rounded-lg">
            {diff ? (
              // Diff View
              <>
                <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <GitCompare className="w-4 h-4" />
                      Comparing Versions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      v{diff.fromVersion} → v{diff.toVersion}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearComparison}
                  >
                    Clear
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">{diff.summary}</p>
                    </div>

                    <DiffViewer changes={diff.changes} />
                  </div>
                </ScrollArea>
              </>
            ) : selectedVersion ? (
              // Details View
              <>
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-semibold">
                    Version {selectedVersion.version_number}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatRelativeTime(selectedVersion.created_at)}
                  </p>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <VersionDetails version={selectedVersion} />

                    {compareWithVersion && (
                      <div className="pt-4">
                        <Button
                          onClick={handleCompare}
                          disabled={isComparing}
                          className="w-full"
                        >
                          {isComparing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Comparing...
                            </>
                          ) : (
                            <>
                              <GitCompare className="w-4 h-4 mr-2" />
                              Compare with v{compareWithVersion.version_number}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileJson className="w-12 h-12 mb-2 opacity-50" />
                <p>Select a version to view details</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// VERSION ITEM COMPONENT
// ============================================================================

interface VersionItemProps {
  version: DashboardVersion;
  isSelected: boolean;
  isCompareWith: boolean;
  isLatest: boolean;
  onSelect: () => void;
  onCompare: () => void;
  onRestore: () => void;
  onExport: () => void;
  isRestoring: boolean;
}

function VersionItem({
  version,
  isSelected,
  isCompareWith,
  isLatest,
  onSelect,
  onCompare,
  onRestore,
  onExport,
  isRestoring,
}: VersionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'mb-2 p-3 rounded-lg border transition-colors cursor-pointer',
        isSelected && 'bg-primary/10 border-primary',
        isCompareWith && 'bg-secondary/50 border-secondary',
        !isSelected && !isCompareWith && 'hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">v{version.version_number}</span>
            {isLatest && (
              <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-700 dark:text-green-400 rounded">
                Latest
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {version.change_summary || 'No description'}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(version.created_at)}
            {version.snapshot_size_bytes && (
              <>
                <span>•</span>
                <span>{formatBytes(version.snapshot_size_bytes)}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 hover:bg-muted rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
            disabled={isRestoring || isLatest}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Restore
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onCompare();
            }}
          >
            <GitCompare className="w-3 h-3 mr-1" />
            {isCompareWith ? 'Unselect' : 'Compare'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onExport();
            }}
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VERSION DETAILS COMPONENT
// ============================================================================

function VersionDetails({ version }: { version: DashboardVersion }) {
  const snapshot = version.snapshot;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2">Dashboard Info</h4>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Title</dt>
            <dd className="font-medium">{snapshot.title}</dd>
          </div>
          {snapshot.description && (
            <div>
              <dt className="text-muted-foreground">Description</dt>
              <dd>{snapshot.description}</dd>
            </div>
          )}
        </dl>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-2">Layout</h4>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Rows</dt>
            <dd>{snapshot.rows?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Components</dt>
            <dd>
              {snapshot.rows?.reduce(
                (count, row) =>
                  count +
                  (row.columns?.filter((col) => col.component).length || 0),
                0
              ) || 0}
            </dd>
          </div>
        </dl>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-2">Metadata</h4>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Change Type</dt>
            <dd className="capitalize">{version.change_type.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{new Date(version.created_at).toLocaleString()}</dd>
          </div>
          {version.snapshot_size_bytes && (
            <div>
              <dt className="text-muted-foreground">Size</dt>
              <dd>{formatBytes(version.snapshot_size_bytes)}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

// ============================================================================
// DIFF VIEWER COMPONENT
// ============================================================================

function DiffViewer({ changes }: { changes: DiffItem[] }) {
  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No changes detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {changes.map((change, index) => (
        <DiffItem key={index} change={change} />
      ))}
    </div>
  );
}

function DiffItem({ change }: { change: DiffItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const icon =
    change.type === 'added' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : change.type === 'removed' ? (
      <XCircle className="w-4 h-4 text-red-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-600" />
    );

  const bgColor =
    change.type === 'added'
      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
      : change.type === 'removed'
      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
      : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900';

  return (
    <div className={cn('p-3 rounded-lg border', bgColor)}>
      <div className="flex items-start gap-2">
        {icon}
        <div className="flex-1">
          <p className="text-sm font-medium">{change.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {change.path}
          </p>

          {(change.oldValue !== undefined || change.newValue !== undefined) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:underline mt-2"
            >
              {isExpanded ? 'Hide' : 'Show'} details
            </button>
          )}

          {isExpanded && (
            <div className="mt-2 space-y-1 text-xs">
              {change.oldValue !== undefined && (
                <div>
                  <span className="text-muted-foreground">Old: </span>
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {JSON.stringify(change.oldValue)}
                  </code>
                </div>
              )}
              {change.newValue !== undefined && (
                <div>
                  <span className="text-muted-foreground">New: </span>
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {JSON.stringify(change.newValue)}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
