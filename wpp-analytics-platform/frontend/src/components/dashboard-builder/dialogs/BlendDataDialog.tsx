"use client";

import React, { useEffect, useMemo, useState } from 'react';
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
import { Link2, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/lib/toast';
import type { DataSource } from '@/lib/api/dashboards';
import type { BlendConfig } from '@/types/dashboard-builder';

interface BlendSourceDraft {
  id: string;
  datasetId: string;
  alias: string;
  joinType: 'left' | 'inner';
  metrics: string[];
}

interface BlendDataDialogProps {
  open: boolean;
  onClose: () => void;
  dataSources: DataSource[];
  value?: BlendConfig;
  onSave: (config: BlendConfig) => void;
}

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const BlendDataDialog: React.FC<BlendDataDialogProps> = ({ open, onClose, dataSources, value, onSave }) => {
  const [sources, setSources] = useState<BlendSourceDraft[]>([]);
  const [primarySourceId, setPrimarySourceId] = useState('');
  const [joinKeys, setJoinKeys] = useState<string[]>(['date']);

  useEffect(() => {
    if (!open) return;
    if (value) {
      setSources(
        value.sources.map((source) => ({
          id: source.id,
          datasetId: source.datasetId,
          alias: source.alias,
          joinType: source.joinType,
          metrics: [...source.metrics],
        }))
      );
      setPrimarySourceId(value.primarySourceId);
      setJoinKeys(value.sources[0]?.joinKeys || ['date']);
    } else {
      const defaultId = createId('blend-source');
      setSources([
        {
          id: defaultId,
          datasetId: dataSources[0]?.id || '',
          alias: dataSources[0]?.name || 'Primary',
          joinType: 'left',
          metrics: [],
        },
      ]);
      setPrimarySourceId(defaultId);
      setJoinKeys(['date']);
    }
  }, [open, value, dataSources]);

  const primaryDataset = useMemo(() => {
    const primary = sources.find((source) => source.id === primarySourceId);
    return dataSources.find((ds) => ds.id === primary?.datasetId);
  }, [sources, primarySourceId, dataSources]);

  const dimensionFields = (primaryDataset?.fields || []).filter((field) => field.type === 'dimension');

  const updateSource = (id: string, updates: Partial<BlendSourceDraft>) => {
    setSources((prev) => prev.map((source) => (source.id === id ? { ...source, ...updates } : source)));
  };

  const addSecondarySource = () => {
    const newId = createId('blend-source');
    setSources((prev) => [
      ...prev,
      {
        id: newId,
        datasetId: '',
        alias: `Source ${prev.length + 1}`,
        joinType: 'left',
        metrics: [],
      },
    ]);
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((source) => source.id !== id));
    if (primarySourceId === id && sources.length > 1) {
      setPrimarySourceId(sources[0].id);
    }
  };

  const toggleMetric = (sourceId: string, metric: string, checked: boolean) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === sourceId
          ? {
              ...source,
              metrics: checked
                ? Array.from(new Set([...source.metrics, metric]))
                : source.metrics.filter((m) => m !== metric),
            }
          : source
      )
    );
  };

  const handleSave = () => {
    if (!primarySourceId) {
      toast.error('Select a primary data source');
      return;
    }
    if (sources.length < 2) {
      toast.error('Add at least one secondary source');
      return;
    }
    if (joinKeys.length === 0) {
      toast.error('Select at least one join key');
      return;
    }
    const normalizedSources = sources.map((source) => {
      if (!source.datasetId) {
        throw new Error('All sources must select a dataset');
      }
      if (source.metrics.length === 0) {
        throw new Error('Each source must select at least one metric');
      }
      return source;
    });

    try {
      const blendConfig: BlendConfig = {
        id: value?.id ?? createId('blend-config'),
        primarySourceId,
        sources: normalizedSources.map((source) => ({
          id: source.id,
          datasetId: source.datasetId,
          alias: source.alias || (dataSources.find((ds) => ds.id === source.datasetId)?.name ?? source.id),
          joinKeys,
          joinType: source.joinType,
          metrics: source.metrics,
        })),
      };
      onSave(blendConfig);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save blend');
    }
  };

  const renderSourceCard = (source: BlendSourceDraft, index: number) => {
    const dataset = dataSources.find((ds) => ds.id === source.datasetId);
    const metricFields = (dataset?.fields || []).filter((field) => field.type === 'metric');
    const isPrimary = source.id === primarySourceId;

    return (
      <div key={source.id} className="rounded-lg border p-3 space-y-3 bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{isPrimary ? 'Primary' : `Source ${index}`}</p>
            <p className="text-xs text-muted-foreground">{source.alias || 'Alias'}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isPrimary && (
              <Button variant="ghost" size="icon" onClick={() => removeSource(source.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Dataset</Label>
          <Select value={source.datasetId} onValueChange={(val) => updateSource(source.id, { datasetId: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {dataSources.map((ds) => (
                <SelectItem key={ds.id} value={ds.id}>
                  {ds.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Alias</Label>
          <Input value={source.alias} onChange={(e) => updateSource(source.id, { alias: e.target.value })} placeholder="Display alias" />
        </div>

        {!isPrimary && (
          <div className="space-y-2">
            <Label className="text-xs">Join Type</Label>
            <Select value={source.joinType} onValueChange={(val: 'left' | 'inner') => updateSource(source.id, { joinType: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left Join</SelectItem>
                <SelectItem value="inner">Inner Join</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Metrics</Label>
          <div className="max-h-32 overflow-auto border rounded-md p-2 space-y-1">
            {metricFields.length === 0 && <p className="text-xs text-muted-foreground">No numeric fields detected.</p>}
            {metricFields.map((field) => (
              <label key={field.id} className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={source.metrics.includes(field.id)}
                  onCheckedChange={(checked) => toggleMetric(source.id, field.id, Boolean(checked))}
                />
                {field.name}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" /> Blend Data Sources
          </DialogTitle>
          <DialogDescription>Combine multiple datasets using shared keys to enrich your visuals.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-auto pr-1">
          <div className="space-y-2">
            <Label className="text-xs">Primary Source</Label>
            <Select value={primarySourceId} onValueChange={(id) => setPrimarySourceId(id)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.alias || dataSources.find((ds) => ds.id === source.datasetId)?.name || 'Untitled Source'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Join Keys</Label>
            <div className="flex flex-wrap gap-3 border rounded-md p-3">
              {dimensionFields.length === 0 && (
                <p className="text-xs text-muted-foreground">Select a primary dataset to choose join keys.</p>
              )}
              {dimensionFields.map((field) => (
                <label key={field.id} className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={joinKeys.includes(field.id)}
                    onCheckedChange={(checked) => {
                      setJoinKeys((prev) =>
                        checked ? Array.from(new Set([...prev, field.id])) : prev.filter((key) => key !== field.id)
                      );
                    }}
                  />
                  {field.name}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sources.map((source, index) => renderSourceCard(source, index + 1))}
          </div>

          <Button variant="outline" size="sm" className="gap-2" onClick={addSecondarySource}>
            <Plus className="h-4 w-4" /> Add data source
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Blend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlendDataDialog;
