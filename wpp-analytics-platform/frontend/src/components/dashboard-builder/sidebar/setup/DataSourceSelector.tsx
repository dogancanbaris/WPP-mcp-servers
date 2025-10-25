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
}

export function DataSourceSelector({
  dataSources,
  selectedSourceId,
  onSourceChange,
  blendEnabled,
  onBlendToggle,
}: DataSourceSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Data Source</label>

      <Select value={selectedSourceId} onValueChange={onSourceChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>
                {dataSources.find((ds) => ds.id === selectedSourceId)?.name || 'Select data source'}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {dataSources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{source.name}</span>
                  <span className="text-xs text-gray-500">{source.type}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center justify-between pt-2 border-t">
        <label htmlFor="blend-toggle" className="text-sm text-gray-600 cursor-pointer">
          Blend data from multiple sources
        </label>
        <Switch
          id="blend-toggle"
          checked={blendEnabled}
          onCheckedChange={onBlendToggle}
        />
      </div>
    </div>
  );
}
