/**
 * Export Jobs Panel Component
 *
 * Monitor and manage export jobs
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useExportJobs } from '@/lib/export/use-enhanced-export';
import {
  FileDown,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Download,
  X,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ExportStatus } from '@/lib/export/enhanced-export';

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ status }: { status: ExportStatus }) {
  const variants: Record<ExportStatus, { variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
    pending: {
      variant: 'secondary',
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    processing: {
      variant: 'default',
      icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
    },
    completed: {
      variant: 'default',
      icon: <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />,
    },
    failed: {
      variant: 'destructive',
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };

  const { variant, icon } = variants[status];

  return (
    <Badge variant={variant} className="flex items-center w-fit">
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ExportJobsPanel() {
  const { jobs, activeJobs, refresh, cancel } = useExportJobs();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Export Jobs
            </CardTitle>
            <CardDescription>Monitor and manage your export history</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {activeJobs.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-3">
              Active Jobs ({activeJobs.length})
            </div>
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{job.dashboardName}</div>
                    <div className="text-xs text-muted-foreground">
                      {job.options.format.toUpperCase()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancel(job.id)}
                    disabled={job.status !== 'pending'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileDown className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No export jobs yet</p>
            <p className="text-sm">Your export history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 10).map((job) => (
              <div
                key={job.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{job.dashboardName}</div>
                    <StatusBadge status={job.status} />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{job.options.format.toUpperCase()}</span>
                    </div>
                    {job.fileSize && (
                      <div className="flex items-center gap-1">
                        <span>{formatFileSize(job.fileSize)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(job.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>

                  {job.error && (
                    <div className="text-sm text-destructive">Error: {job.error}</div>
                  )}

                  {job.options.emailDelivery?.enabled && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        Email to {job.options.emailDelivery.recipients.length} recipient(s)
                      </Badge>
                    </div>
                  )}

                  {job.options.scheduled && job.options.frequency !== 'once' && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        Scheduled: {job.options.frequency}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {job.status === 'completed' && job.fileUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={job.fileUrl} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  {job.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => cancel(job.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {jobs.length > 10 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                Showing 10 of {jobs.length} jobs
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
