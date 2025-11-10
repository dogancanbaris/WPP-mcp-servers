"use client";

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { listDatasets, toDatasetOption } from '@/lib/supabase/dataset-service';
import type { DatasetOption } from '@/types/dataset';
import { useRouter } from 'next/navigation';

interface DataSourcesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const DataSourcesDialog: React.FC<DataSourcesDialogProps> = ({ open, onClose }) => {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listDatasets();
      if (result.success && result.datasets) {
        setDatasets(result.datasets.map(toDatasetOption));
      } else {
        setDatasets([]);
        setError(result.error || 'Unable to load datasets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load datasets');
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void loadDatasets();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manage Data Sources
          </DialogTitle>
          <DialogDescription>
            View the shared BigQuery tables your workspace can access. Use Settings to register additional datasets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {loading && <p className="text-muted-foreground">Loading datasets…</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && datasets.length === 0 && !error && (
            <p className="text-muted-foreground">No datasets registered yet.</p>
          )}

          {datasets.length > 0 && (
            <div className="rounded border divide-y">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="p-3">
                  <p className="font-medium text-sm">{dataset.name}</p>
                  <p className="text-xs text-muted-foreground">{dataset.table}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Platform: {dataset.platform}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="justify-between">
          <Button variant="outline" size="sm" onClick={loadDatasets} disabled={loading}>
            Refresh
          </Button>
          <div className="space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => { onClose(); router.push('/settings'); }}>
              Go to Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataSourcesDialog;
