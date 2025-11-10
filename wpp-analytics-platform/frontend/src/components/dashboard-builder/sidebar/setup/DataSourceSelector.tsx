import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Database } from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: string;
}

interface DataSourceSelectorProps {
  dataSources: DataSource[];
  selectedSourceId: string;
  onSourceChange: (sourceId: string) => void;
  blendEnabled: boolean;
  onBlendToggle: (enabled: boolean) => void;
  isBlendActive?: boolean;
  blendSummary?: string;
  onConfigureBlend?: () => void;
}

export function DataSourceSelector({
  dataSources,
  selectedSourceId,
  onSourceChange,
  blendEnabled,
  onBlendToggle,
  isBlendActive,
  blendSummary,
  onConfigureBlend,
}: DataSourceSelectorProps) {
  const currentSource = dataSources.find((ds) => ds.id === selectedSourceId);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Data Source</label>

      <Select value={selectedSourceId} onValueChange={onSourceChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 mt-1" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {currentSource?.name || 'Select data source'}
                  </span>
                  {currentSource?.table && (
                    <span className="text-xs text-muted-foreground">
                      {currentSource.table}
                    </span>
                  )}
                </div>
              </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {dataSources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{source.name}</span>
                    <span className="text-xs text-gray-500">{source.type}</span>
                  </div>
                </div>
                {source.table && (
                  <span className="text-xs text-gray-500 pl-6">{source.table}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center justify-between pt-2 border-t">
        <label htmlFor="blend-toggle" className="text-sm text-gray-600 cursor-pointer">
          Blend data from multiple sources
        </label>
        <div className="flex items-center gap-2">
          {isBlendActive && blendSummary && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={onConfigureBlend}
            >
              {blendSummary}
            </button>
          )}
          <Switch
            id="blend-toggle"
            checked={blendEnabled}
            onCheckedChange={onBlendToggle}
          />
        </div>
      </div>

      {isBlendActive && (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={onConfigureBlend}
          >
            Configure blend settings
          </button>
        </div>
      )}
    </div>
  );
}
