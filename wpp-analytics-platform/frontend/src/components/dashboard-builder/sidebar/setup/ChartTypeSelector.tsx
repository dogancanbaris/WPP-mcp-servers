import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  MapPin,
  TrendingUp,
  Layout,
} from 'lucide-react';

interface ChartTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CHART_TYPES = [
  { value: 'table', label: 'Table', icon: Table2 },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'geo', label: 'Geo Chart', icon: MapPin },
  { value: 'scorecard', label: 'Scorecard', icon: TrendingUp },
  { value: 'pivot', label: 'Pivot Table', icon: Layout },
];

export function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  const selectedType = CHART_TYPES.find((type) => type.value === value);
  const Icon = selectedType?.icon || BarChart3;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Chart Type</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{selectedType?.label || 'Select chart type'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CHART_TYPES.map((type) => {
            const TypeIcon = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" />
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
