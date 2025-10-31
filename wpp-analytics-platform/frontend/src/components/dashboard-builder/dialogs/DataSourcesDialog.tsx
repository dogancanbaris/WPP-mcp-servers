"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DataSourcesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const DataSourcesDialog: React.FC<DataSourcesDialogProps> = ({ open, onClose }) => {
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Manage Data Sources</DialogTitle>
          <DialogDescription>
            Connect new datasets or manage existing ones. A full data source manager is coming soon.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>Use Settings to view connected BigQuery project and available tables.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={() => { onClose(); router.push('/settings'); }}>Go to Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataSourcesDialog;
