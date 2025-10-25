import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  ArrowUpDown,
  Scale,
  X,
  Sigma,
} from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  aggregation: string;
  sortOrder?: 'asc' | 'desc' | null;
  compareEnabled?: boolean;
}

interface MetricRowProps {
  metric: Metric;
  onUpdate: (updates: Partial<Metric>) => void;
  onRemove: () => void;
  dragHandleProps?: any;
}

const AGGREGATION_TYPES = [
  { value: 'sum', label: 'SUM' },
  { value: 'avg', label: 'AVG' },
  { value: 'count', label: 'COUNT' },
  { value: 'min', label: 'MIN' },
  { value: 'max', label: 'MAX' },
  { value: 'countDistinct', label: 'COUNT DISTINCT' },
];

export function MetricRow({
  metric,
  onUpdate,
  onRemove,
  dragHandleProps,
}: MetricRowProps) {
  const handleSortToggle = () => {
    let newSort: 'asc' | 'desc' | null = 'desc';
    if (metric.sortOrder === 'desc') newSort = 'asc';
    else if (metric.sortOrder === 'asc') newSort = null;

    onUpdate({ sortOrder: newSort });
  };

  const handleCompareToggle = () => {
    onUpdate({ compareEnabled: !metric.compareEnabled });
  };

  return (
    <div
      className="flex items-center gap-2 p-2 border border-[#DADCE0] rounded bg-white hover:bg-[#F8F9FA] transition-colors"
      {...dragHandleProps}
    >
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-[#80868B]" />
      </div>

      {/* Metric Badge with Name */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#1967D2] border border-[#AECBFA] text-[11px] font-medium">
          <span className="font-semibold">#</span>
          <span className="truncate" title={metric.name}>{metric.name}</span>
        </span>
      </div>

      {/* Aggregation Selector */}
      <Select
        value={metric.aggregation}
        onValueChange={(value) => onUpdate({ aggregation: value })}
      >
        <SelectTrigger className="w-[100px] h-7 border-[#DADCE0] text-xs">
          <SelectValue>
            <div className="flex items-center gap-1">
              <Sigma className="h-3 w-3 text-[#5F6368]" />
              <span className="text-[11px] text-[#202124] font-medium">{metric.aggregation.toUpperCase()}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AGGREGATION_TYPES.map((agg) => (
            <SelectItem key={agg.value} value={agg.value}>
              <span className="text-[11px]">{agg.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Button */}
      <Button
        size="sm"
        variant={metric.sortOrder ? 'secondary' : 'ghost'}
        className="h-7 w-7 p-0 hover:bg-[#F1F3F4]"
        onClick={handleSortToggle}
        title={
          metric.sortOrder === 'desc'
            ? 'Sorted descending'
            : metric.sortOrder === 'asc'
            ? 'Sorted ascending'
            : 'Not sorted'
        }
      >
        <ArrowUpDown
          className={`h-3.5 w-3.5 ${
            metric.sortOrder === 'asc'
              ? 'rotate-180 text-[#1967D2]'
              : metric.sortOrder === 'desc'
              ? 'text-[#1967D2]'
              : 'text-[#80868B]'
          }`}
        />
      </Button>

      {/* Compare Button */}
      <Button
        size="sm"
        variant={metric.compareEnabled ? 'secondary' : 'ghost'}
        className="h-7 w-7 p-0 hover:bg-[#F1F3F4]"
        onClick={handleCompareToggle}
        title={metric.compareEnabled ? 'Comparison enabled' : 'Enable comparison'}
      >
        <Scale className={`h-3.5 w-3.5 ${metric.compareEnabled ? 'text-[#1967D2]' : 'text-[#80868B]'}`} />
      </Button>

      {/* Remove Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-[#EA4335] hover:text-[#C5221F] hover:bg-[#FCE8E6]"
        onClick={onRemove}
        title="Remove metric"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
