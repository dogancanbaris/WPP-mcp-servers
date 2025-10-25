'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Row } from '@/components/dashboard-builder';
import { RowConfig, ColumnConfig, ColumnWidth } from '@/types/dashboard-builder';

export default function TestDashboardBuilder() {
  const [rows, setRows] = useState<RowConfig[]>([
    {
      id: 'row-1',
      columns: []
    }
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setRows((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addRow = () => {
    const newRow: RowConfig = {
      id: `row-${Date.now()}`,
      columns: []
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: string) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  const addColumn = (rowId: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const newColumn: ColumnConfig = {
          id: `column-${Date.now()}`,
          width: '1/3' as ColumnWidth
        };
        return {
          ...row,
          columns: [...row.columns, newColumn]
        };
      }
      return row;
    }));
  };

  const updateColumn = (rowId: string, columnId: string, updates: Partial<ColumnConfig>) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          columns: row.columns.map(col =>
            col.id === columnId ? { ...col, ...updates } : col
          )
        };
      }
      return row;
    }));
  };

  const removeColumn = (rowId: string, columnId: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          columns: row.columns.filter(col => col.id !== columnId)
        };
      }
      return row;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Dashboard Builder Component Test
        </h1>

        <div className="mb-4">
          <button
            onClick={addRow}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Row
          </button>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rows.map(row => row.id)}
            strategy={verticalListSortingStrategy}
          >
            {rows.map((row) => (
              <Row
                key={row.id}
                id={row.id}
                columns={row.columns}
                onDelete={() => deleteRow(row.id)}
                onAddColumn={() => addColumn(row.id)}
                onUpdateColumn={(columnId, updates) => updateColumn(row.id, columnId, updates)}
                onRemoveColumn={(columnId) => removeColumn(row.id, columnId)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No rows added. Click "Add Row" to get started.
          </div>
        )}
      </div>
    </div>
  );
}