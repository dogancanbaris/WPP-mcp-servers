import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MetricRow } from './MetricRow';

interface Field {
  id: string;
  name: string;
  type: 'dimension' | 'metric';
  dataType?: string;
}

interface Metric {
  id: string;
  name: string;
  aggregation: string;
  sortOrder?: 'asc' | 'desc' | null;
  compareEnabled?: boolean;
}

interface MetricSelectorProps {
  availableFields: Field[];
  metrics: Metric[];
  onMetricsChange: (metrics: Metric[]) => void;
}

function SortableMetricRow({
  metric,
  onUpdate,
  onRemove,
}: {
  metric: Metric;
  onUpdate: (updates: Partial<Metric>) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MetricRow
        metric={metric}
        onUpdate={onUpdate}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function MetricSelector({
  availableFields,
  metrics,
  onMetricsChange,
}: MetricSelectorProps) {
  const [showAddMetric, setShowAddMetric] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const metricFields = availableFields.filter((f) => f.type === 'metric');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = metrics.findIndex((m) => m.id === active.id);
      const newIndex = metrics.findIndex((m) => m.id === over.id);
      onMetricsChange(arrayMove(metrics, oldIndex, newIndex));
    }
  };

  const handleAddMetric = (fieldId: string) => {
    const field = metricFields.find((f) => f.id === fieldId);
    if (field && !metrics.find((m) => m.id === fieldId)) {
      onMetricsChange([
        ...metrics,
        {
          id: field.id,
          name: field.name,
          aggregation: 'sum',
          sortOrder: null,
          compareEnabled: false,
        },
      ]);
      setShowAddMetric(false);
    }
  };

  const handleUpdateMetric = (index: number, updates: Partial<Metric>) => {
    const newMetrics = [...metrics];
    newMetrics[index] = { ...newMetrics[index], ...updates };
    onMetricsChange(newMetrics);
  };

  const handleRemoveMetric = (index: number) => {
    const newMetrics = [...metrics];
    newMetrics.splice(index, 1);
    onMetricsChange(newMetrics);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#5F6368]">Metric</label>

      {/* Metrics List */}
      {metrics.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={metrics.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {metrics.map((metric, index) => (
                <SortableMetricRow
                  key={metric.id}
                  metric={metric}
                  onUpdate={(updates) => handleUpdateMetric(index, updates)}
                  onRemove={() => handleRemoveMetric(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Metric Button */}
      {!showAddMetric && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 border-[#DADCE0] text-[#1967D2] hover:bg-[#F8F9FA] hover:border-[#1967D2] text-xs font-medium"
          onClick={() => setShowAddMetric(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add metric
        </Button>
      )}

      {/* Add Metric Selector */}
      {showAddMetric && (
        <Select
          value=""
          onValueChange={(value) => {
            handleAddMetric(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose metric to add" />
          </SelectTrigger>
          <SelectContent>
            {metricFields
              .filter((f) => !metrics.find((m) => m.id === f.id))
              .map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  <div className="flex flex-col">
                    <span>{field.name}</span>
                    {field.dataType && (
                      <span className="text-xs text-gray-500">{field.dataType}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
