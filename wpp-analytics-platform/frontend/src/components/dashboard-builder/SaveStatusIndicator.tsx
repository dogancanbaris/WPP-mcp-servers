import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  useSaveStatus,
  useLastSaved,
  useConflictData,
  useDashboardStore
} from '@/store/dashboardStore';
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  AlertTriangle,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface SaveStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function SaveStatusIndicator({
  className,
  showLabel = true
}: SaveStatusIndicatorProps) {
  const saveStatus = useSaveStatus();
  const lastSaved = useLastSaved();
  const conflictData = useConflictData();
  const resolveConflict = useDashboardStore((state) => state.resolveConflict);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago display
  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);

      if (seconds < 10) {
        setTimeAgo('just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  // Show conflict dialog when conflict is detected
  useEffect(() => {
    if (conflictData) {
      setShowConflictDialog(true);
    }
  }, [conflictData]);

  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saved':
        return {
          icon: CheckCircle2,
          label: lastSaved ? `Saved ${timeAgo}` : 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          pulseColor: 'bg-green-500'
        };
      case 'saving':
        return {
          icon: Cloud,
          label: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          pulseColor: 'bg-blue-500',
          animate: true
        };
      case 'unsaved':
        return {
          icon: Clock,
          label: 'Unsaved changes',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          pulseColor: 'bg-yellow-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Save failed (retrying...)',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          pulseColor: 'bg-red-500'
        };
      case 'conflict':
        return {
          icon: AlertTriangle,
          label: 'Conflict detected',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          pulseColor: 'bg-orange-500',
          clickable: true
        };
      default:
        return {
          icon: CloudOff,
          label: 'Unknown status',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          pulseColor: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const handleConflictResolve = (strategy: 'local' | 'remote' | 'cancel') => {
    resolveConflict(strategy);
    setShowConflictDialog(false);
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
          config.bgColor,
          config.borderColor,
          config.clickable && 'cursor-pointer hover:opacity-80',
          className
        )}
        onClick={config.clickable ? () => setShowConflictDialog(true) : undefined}
        role={config.clickable ? 'button' : undefined}
        tabIndex={config.clickable ? 0 : undefined}
      >
        <div className="relative">
          <Icon
            className={cn(
              'h-4 w-4',
              config.color,
              config.animate && 'animate-pulse'
            )}
          />
          {config.animate && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  config.pulseColor
                )}
              />
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2 w-2',
                  config.pulseColor
                )}
              />
            </span>
          )}
        </div>

        {showLabel && (
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
        )}
      </div>

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Save Conflict Detected
            </DialogTitle>
            <DialogDescription>
              The dashboard has been modified by another user or in another tab.
              Choose how to resolve this conflict.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Local Version */}
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  Your Local Changes
                </h4>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>
                    <span className="font-medium">Components:</span>{' '}
                    {conflictData?.localVersion.rows.reduce(
                      (acc, row) =>
                        acc +
                        row.columns.filter((col) => col.component).length,
                      0
                    ) || 0}
                  </p>
                  <p>
                    <span className="font-medium">Last modified:</span>{' '}
                    {conflictData?.localVersion.updatedAt
                      ? new Date(
                          conflictData.localVersion.updatedAt
                        ).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Remote Version */}
              <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                  Remote Changes
                </h4>
                <div className="space-y-1 text-xs text-purple-700">
                  <p>
                    <span className="font-medium">Components:</span>{' '}
                    {conflictData?.remoteVersion.rows.reduce(
                      (acc, row) =>
                        acc +
                        row.columns.filter((col) => col.component).length,
                      0
                    ) || 0}
                  </p>
                  <p>
                    <span className="font-medium">Last modified:</span>{' '}
                    {conflictData?.remoteVersion.updatedAt
                      ? new Date(
                          conflictData.remoteVersion.updatedAt
                        ).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Warning</p>
                  <p>
                    Choosing "Keep Local" will overwrite the remote changes.
                    Choosing "Use Remote" will discard your local changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleConflictResolve('cancel')}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={() => handleConflictResolve('remote')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Use Remote
            </Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleConflictResolve('local')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Keep Local
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
