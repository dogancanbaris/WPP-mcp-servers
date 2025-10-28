'use client';

import React, { useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPageDialog({ open, onOpenChange }: AddPageDialogProps) {
  const [pageName, setPageName] = useState('');
  const { addPage } = useDashboardStore();

  const handleSubmit = () => {
    if (pageName.trim()) {
      addPage(pageName.trim());
      setPageName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Page</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="page-name">Page Name</Label>
            <Input
              id="page-name"
              placeholder="e.g., Overview, Details, Analysis"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
