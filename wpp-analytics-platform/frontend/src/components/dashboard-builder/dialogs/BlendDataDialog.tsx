"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2 } from 'lucide-react';
import { toast } from '@/lib/toast';

interface BlendDataDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BlendDataDialog: React.FC<BlendDataDialogProps> = ({ open, onClose }) => {
  const [sourceA, setSourceA] = useState('');
  const [sourceB, setSourceB] = useState('');
  const [joinKey, setJoinKey] = useState('date');

  const onApply = () => {
    if (!sourceA || !sourceB) {
      toast.error('Please provide both sources');
      return;
    }
    toast.success(`Blend configured: ${sourceA} ⋈ ${sourceB} on ${joinKey}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Blend Data Sources</DialogTitle>
          <DialogDescription>
            Combine two sources by a common key. Advanced blending UI coming soon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Source A (dataset id)</Label>
            <Input value={sourceA} onChange={(e)=> setSourceA(e.target.value)} placeholder="e.g., gsc_performance_7days" />
          </div>
          <div>
            <Label className="text-xs">Source B (dataset id)</Label>
            <Input value={sourceB} onChange={(e)=> setSourceB(e.target.value)} placeholder="e.g., ads_performance_7days" />
          </div>
          <div>
            <Label className="text-xs">Join Key</Label>
            <Input value={joinKey} onChange={(e)=> setJoinKey(e.target.value)} placeholder="date" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlendDataDialog;
