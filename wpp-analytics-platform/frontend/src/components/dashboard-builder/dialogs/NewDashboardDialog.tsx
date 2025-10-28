'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveDashboard } from '@/lib/supabase/dashboard-service';
import { listDatasets, toDatasetOption } from '@/lib/supabase/dataset-service';
import type { DatasetOption } from '@/types/dataset';
import { toast } from '@/lib/toast';
import { FilePlus, Database, TrendingUp, BarChart3, Users, Plus, Loader2 } from 'lucide-react';

interface NewDashboardDialogProps {
  open: boolean;
  onClose: () => void;
}

const PLATFORM_ICONS = {
  gsc: TrendingUp,
  google_ads: BarChart3,
  analytics: Users,
  bigquery: Database,
};

export const NewDashboardDialog: React.FC<NewDashboardDialogProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const [dashboardName, setDashboardName] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);

  // Load available datasets on mount
  useEffect(() => {
    if (open) {
      loadAvailableDatasets();
    }
  }, [open]);

  const loadAvailableDatasets = async () => {
    setIsLoadingDatasets(true);
    try {
      const result = await listDatasets();
      if (result.success && result.datasets) {
        const options = result.datasets.map(toDatasetOption);
        setDatasets(options);

        // Auto-select first dataset if available
        if (options.length > 0 && !selectedDatasetId) {
          setSelectedDatasetId(options[0].id);
        }
      } else {
        toast.error(result.error || 'Failed to load datasets');
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
      toast.error('Failed to load datasets');
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const handleCreate = async () => {
    if (!dashboardName.trim()) {
      toast.error('Please enter a dashboard name');
      return;
    }

    if (!selectedDatasetId) {
      toast.error('Please select a data source');
      return;
    }

    setIsCreating(true);

    try {
      // Generate new UUID
      const newId = crypto.randomUUID();

      // Get selected dataset details
      const selectedDataset = datasets.find(ds => ds.id === selectedDatasetId);

      // Create initial dashboard config with dataset link
      const dashboardConfig = {
        id: newId,
        name: dashboardName.trim(),
        title: dashboardName.trim(),
        description: '',
        dataset_id: selectedDatasetId, // LINK TO DATASET
        datasource: selectedDataset?.table || '', // Legacy field
        rows: [], // Start with empty layout - user builds it
        theme: {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          borderColor: '#e5e7eb'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Supabase using dashboard-service (will use mappers)
      const result = await saveDashboard(newId, dashboardConfig);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save dashboard');
      }

      toast.success('Dashboard created successfully');

      // Close dialog
      onClose();

      // Reset form
      setDashboardName('');
      setSelectedDatasetId('');

      // Navigate to builder
      router.push(`/dashboard/${newId}/builder`);
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      toast.error('Failed to create dashboard');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setDashboardName('');
    setSelectedDatasetId('');
    onClose();
  };

  const selectedDataset = datasets.find(ds => ds.id === selectedDatasetId);
  const PlatformIcon = selectedDataset
    ? PLATFORM_ICONS[selectedDataset.platform] || Database
    : Database;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="w-5 h-5" />
            Create New Dashboard
          </DialogTitle>
          <DialogDescription>
            Create a new dashboard connected to your data sources
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dashboard Name */}
          <div className="space-y-2">
            <Label htmlFor="dashboard-name">Dashboard Name</Label>
            <Input
              id="dashboard-name"
              placeholder="e.g., Q4 SEO Performance Report"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && dashboardName.trim() && selectedDatasetId) {
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>

          {/* Data Source Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="data-source">Data Source</Label>
              {datasets.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadAvailableDatasets}
                  disabled={isLoadingDatasets}
                >
                  {isLoadingDatasets ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
              )}
            </div>

            {isLoadingDatasets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : datasets.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                <Database className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">No data sources found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a data source to get started
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Create Data Source
                </Button>
              </div>
            ) : (
              <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                <SelectTrigger id="data-source">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <PlatformIcon className="h-4 w-4" />
                      <span>
                        {selectedDataset?.name || 'Select a data source'}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => {
                    const Icon = PLATFORM_ICONS[dataset.platform] || Database;
                    return (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{dataset.name}</span>
                            {dataset.description && (
                              <span className="text-xs text-muted-foreground">
                                {dataset.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}

                  {/* Separator */}
                  <div className="border-t my-1" />

                  {/* Create New Dataset Option */}
                  <SelectItem value="__create_new__" disabled>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      <span>Create New Data Source (Coming Soon)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            {selectedDataset && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-1 mb-1">
                  <Database className="h-3 w-3" />
                  <span className="font-medium">BigQuery Table:</span>
                </div>
                <code className="text-xs">{selectedDataset.table}</code>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!dashboardName.trim() || !selectedDatasetId || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FilePlus className="mr-2 h-4 w-4" />
                Create Dashboard
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
