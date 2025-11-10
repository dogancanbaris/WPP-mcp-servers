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
  table?: string;
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
  blendDetails?: string[];
  supportsBlending?: boolean;
  onClearBlend?: () => void;
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
  blendDetails,
  supportsBlending = true,
  onClearBlend,
}: DataSourceSelectorProps) {
  const currentSource = dataSources.find((ds) => ds.id === selectedSourceId);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Data Source</label>

      <Select value={selectedSourceId} onValueChange={onSourceChange} disabled={blendEnabled}>
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

      {supportsBlending && (
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
      )}

      {supportsBlending && isBlendActive && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">Blend active</span>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={onConfigureBlend}
              >
                Edit
              </button>
              {onClearBlend && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    className="text-destructive hover:underline"
                    onClick={onClearBlend}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
          {blendSummary && <p className="text-sm text-primary">{blendSummary}</p>}
          {blendDetails?.length ? (
            <ul className="space-y-1 text-muted-foreground">
              {blendDetails.map((detail, index) => (
                <li key={`${detail}-${index}`}>• {detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
