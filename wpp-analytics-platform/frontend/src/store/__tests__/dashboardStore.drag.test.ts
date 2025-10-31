import { renderHook, act } from '@testing-library/react';
import { useDashboardStore } from '../dashboardStore';
import type { DashboardConfig } from '@/types/dashboard-builder';

describe('Dashboard Store - Drag Operations', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useDashboardStore());
    act(() => {
      result.current.reset();
    });
  });

  it('reorders columns within a row', () => {
    const { result } = renderHook(() => useDashboardStore());

    act(() => {
      const firstPageId = result.current.config.pages?.[0].id;
      if (firstPageId) {
        result.current.setCurrentPage(firstPageId);
      }
      result.current.addRow(['1/2', '1/2']);
    });

    const row = result.current.config.pages?.[0].rows[0];
    expect(row).toBeDefined();
    if (!row) return;

    const initialColumnIds = row.columns.map((column) => column.id);
    expect(initialColumnIds).toHaveLength(2);

    act(() => {
      result.current.reorderColumns(row.id, 0, 1);
    });

    const updatedRow = result.current.config.pages?.[0].rows[0];
    expect(updatedRow?.columns.map((column) => column.id)).toEqual([initialColumnIds[1], initialColumnIds[0]]);
  });

  it('moves component between columns', () => {
    const { result } = renderHook(() => useDashboardStore());

    act(() => {
      const firstPageId = result.current.config.pages?.[0].id;
      if (firstPageId) {
        result.current.setCurrentPage(firstPageId);
      }
      result.current.addRow(['1/2', '1/2']);
    });

    const row = result.current.config.pages?.[0].rows[0];
    expect(row).toBeDefined();
    if (!row) return;

    const [sourceColumn, targetColumn] = row.columns;
    expect(sourceColumn).toBeDefined();
    expect(targetColumn).toBeDefined();
    if (!sourceColumn || !targetColumn) return;

    act(() => {
      result.current.addComponent(sourceColumn.id, 'bar_chart');
    });

    const componentId = result.current.config.pages?.[0].rows[0].columns[0].component?.id;
    expect(componentId).toBeDefined();
    if (!componentId) return;

    act(() => {
      result.current.moveComponent(componentId, targetColumn.id);
    });

    const updatedRows = result.current.config.pages?.[0].rows[0];
    expect(updatedRows?.columns[0].component).toBeUndefined();
    expect(updatedRows?.columns[1].component?.id).toBe(componentId);
  });

  it('hydrates missing identifiers when setting legacy config', () => {
    const { result } = renderHook(() => useDashboardStore());

    const dirtyConfig: DashboardConfig = {
      ...result.current.config,
      rows: [],
      pages: [{
        id: 'legacy-page',
        name: 'Legacy Page',
        order: 0,
        rows: [{
          id: '',
          columns: [{
            id: '',
            width: '1/1',
            component: {
              // Intentionally missing id to simulate legacy data
              id: '',
              type: 'bar_chart',
              title: 'Legacy Bar'
            }
          }]
        }],
        createdAt: new Date().toISOString()
      }]
    };

    act(() => {
      result.current.setConfig(dirtyConfig);
    });

    const page = result.current.config.pages?.[0];
    expect(page).toBeDefined();
    if (!page) return;

    const row = page.rows[0];
    expect(row.id).toBeTruthy();
    const column = row.columns[0];
    expect(column.id).toBeTruthy();
    expect(column.component?.id).toBeTruthy();
  });
});
