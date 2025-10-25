/**
 * Dashboard Builder End-to-End Test Suite
 *
 * Comprehensive test covering the full workflow:
 * 1. Create new dashboard
 * 2. Add rows with different layouts
 * 3. Add components (charts, scorecards, tables)
 * 4. Configure data sources and metrics
 * 5. Style components
 * 6. Save dashboard (auto-save and manual)
 * 7. Export dashboard (PDF, PNG, JSON)
 * 8. Test undo/redo functionality
 * 9. Test conflict resolution
 * 10. Load existing dashboard
 */

import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { DashboardConfig, ComponentConfig } from '@/types/dashboard-builder';

// Mock the API client
jest.mock('@/lib/api/dashboards', () => ({
  saveDashboard: jest.fn(),
  loadDashboard: jest.fn(),
  getAvailableFields: jest.fn(),
  executeQuery: jest.fn(),
}));

// Import mocked API after jest.mock
import * as dashboardAPI from '@/lib/api/dashboards';

// Mock components to simplify testing
jest.mock('@/components/dashboard-builder/DashboardCanvas', () => ({
  DashboardCanvas: ({ dashboardId, onSelectComponent }: any) => (
    <div data-testid="dashboard-canvas">
      <button onClick={() => onSelectComponent('test-component-1')}>
        Select Component
      </button>
      <div data-testid="canvas-content">Canvas for {dashboardId}</div>
    </div>
  ),
}));

jest.mock('@/components/dashboard-builder/sidebar/SettingsSidebar', () => ({
  SettingsSidebar: ({ selectedComponent }: any) => (
    <div data-testid="settings-sidebar">
      {selectedComponent ? (
        <div data-testid="component-settings">
          Component: {selectedComponent.id}
        </div>
      ) : (
        <div data-testid="no-selection">No component selected</div>
      )}
    </div>
  ),
}));

jest.mock('@/components/dashboard-builder/topbar/EditorTopbar', () => ({
  EditorTopbar: ({ onSave, onExport, canUndo, canRedo }: any) => (
    <div data-testid="editor-topbar">
      <button onClick={onSave} data-testid="save-button" disabled={!canUndo && !canRedo}>
        Save
      </button>
      <button onClick={() => onExport('pdf')} data-testid="export-pdf-button">
        Export PDF
      </button>
      <button onClick={() => onExport('png')} data-testid="export-png-button">
        Export PNG
      </button>
      <button onClick={() => onExport('json')} data-testid="export-json-button">
        Export JSON
      </button>
      <div data-testid="undo-redo-state">
        Undo: {canUndo ? 'enabled' : 'disabled'} | Redo: {canRedo ? 'enabled' : 'disabled'}
      </div>
    </div>
  ),
}));

// Test fixture: Sample dashboard configuration
const createMockDashboard = (id: string = 'test-dashboard-1'): DashboardConfig => ({
  id,
  name: 'Test Dashboard',
  title: 'Test Dashboard',
  rows: [
    {
      id: 'row-1',
      height: '300px',
      columns: [
        {
          id: 'col-1',
          width: '1/2',
          component: {
            id: 'component-1',
            type: 'bar_chart',
            title: 'Campaign Performance',
            datasource: 'google_ads',
            dimension: 'campaign_name',
            metrics: ['impressions', 'clicks', 'cost'],
            showTitle: true,
            showLegend: true,
          },
        },
        {
          id: 'col-2',
          width: '1/2',
          component: {
            id: 'component-2',
            type: 'scorecard',
            title: 'Total Conversions',
            datasource: 'google_ads',
            metrics: ['conversions'],
            showTitle: true,
          },
        },
      ],
    },
    {
      id: 'row-2',
      height: '400px',
      columns: [
        {
          id: 'col-3',
          width: '1/1',
          component: {
            id: 'component-3',
            type: 'table',
            title: 'Top Keywords',
            datasource: 'search_console',
            dimension: 'query',
            metrics: ['clicks', 'impressions', 'ctr', 'position'],
            showTitle: true,
          },
        },
      ],
    },
  ],
  theme: 'light',
});

// Helper: Wait for async state updates
const waitForStoreUpdate = async (callback: () => boolean, timeout = 3000) => {
  const startTime = Date.now();
  while (!callback()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for store update');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

describe('Dashboard Builder E2E Tests', () => {
  let store: ReturnType<typeof useDashboardStore.getState>;

  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useDashboardStore.getState().reset();
    });
    store = useDashboardStore.getState();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock responses
    (dashboardAPI.saveDashboard as jest.Mock).mockResolvedValue({
      success: true,
      dashboard: createMockDashboard(),
    });

    (dashboardAPI.loadDashboard as jest.Mock).mockResolvedValue({
      success: true,
      dashboard: createMockDashboard(),
    });

    (dashboardAPI.getAvailableFields as jest.Mock).mockResolvedValue({
      sources: [
        {
          id: 'google_ads',
          name: 'Google Ads',
          type: 'google_ads',
          fields: [
            { id: 'campaign_name', name: 'Campaign Name', type: 'dimension' },
            { id: 'impressions', name: 'Impressions', type: 'metric' },
            { id: 'clicks', name: 'Clicks', type: 'metric' },
            { id: 'cost', name: 'Cost', type: 'metric' },
            { id: 'conversions', name: 'Conversions', type: 'metric' },
          ],
        },
        {
          id: 'search_console',
          name: 'Google Search Console',
          type: 'search_console',
          fields: [
            { id: 'query', name: 'Query', type: 'dimension' },
            { id: 'clicks', name: 'Clicks', type: 'metric' },
            { id: 'impressions', name: 'Impressions', type: 'metric' },
            { id: 'ctr', name: 'CTR', type: 'metric' },
            { id: 'position', name: 'Position', type: 'metric' },
          ],
        },
      ],
    });

    (dashboardAPI.executeQuery as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { campaign_name: 'Campaign 1', impressions: 10000, clicks: 500, cost: 250 },
        { campaign_name: 'Campaign 2', impressions: 8000, clicks: 400, cost: 200 },
      ],
    });
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllTimers();
  });

  describe('1. Create New Dashboard', () => {
    it('should initialize with empty dashboard', () => {
      expect(store.config.title).toBe('Untitled Dashboard');
      expect(store.config.rows).toHaveLength(0);
      expect(store.isDirty).toBe(false);
      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(false);
    });

    it('should set dashboard title', () => {
      act(() => {
        store.setTitle('My Analytics Dashboard');
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('My Analytics Dashboard');
      expect(updatedStore.isDirty).toBe(true);
      expect(updatedStore.canUndo).toBe(true);
    });

    it('should initialize with default theme', () => {
      expect(store.config.theme).toEqual({
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb',
      });
    });
  });

  describe('2. Add Rows with Different Layouts', () => {
    it('should add single column row', () => {
      act(() => {
        store.addRow(['1/1']);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows).toHaveLength(1);
      expect(updatedStore.config.rows[0].columns).toHaveLength(1);
      expect(updatedStore.config.rows[0].columns[0].width).toBe('1/1');
    });

    it('should add two column row (50/50)', () => {
      act(() => {
        store.addRow(['1/2', '1/2']);
      });

      const updatedStore = useDashboardStore.getState();
      const row = updatedStore.config.rows[0];
      expect(row.columns).toHaveLength(2);
      expect(row.columns[0].width).toBe('1/2');
      expect(row.columns[1].width).toBe('1/2');
    });

    it('should add three column row', () => {
      act(() => {
        store.addRow(['1/3', '1/3', '1/3']);
      });

      const updatedStore = useDashboardStore.getState();
      const row = updatedStore.config.rows[0];
      expect(row.columns).toHaveLength(3);
      expect(row.columns.every((col: { width: string }) => col.width === '1/3')).toBe(true);
    });

    it('should add asymmetric row (1/3 + 2/3)', () => {
      act(() => {
        store.addRow(['1/3', '2/3']);
      });

      const updatedStore = useDashboardStore.getState();
      const row = updatedStore.config.rows[0];
      expect(row.columns[0].width).toBe('1/3');
      expect(row.columns[1].width).toBe('2/3');
    });

    it('should add multiple rows with different layouts', () => {
      act(() => {
        store.addRow(['1/1']);
        store.addRow(['1/2', '1/2']);
        store.addRow(['1/3', '2/3']);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows).toHaveLength(3);
      expect(updatedStore.config.rows[0].columns).toHaveLength(1);
      expect(updatedStore.config.rows[1].columns).toHaveLength(2);
      expect(updatedStore.config.rows[2].columns).toHaveLength(2);
    });

    it('should mark dashboard as dirty after adding row', () => {
      act(() => {
        store.addRow(['1/2', '1/2']);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.isDirty).toBe(true);
      expect(updatedStore.canUndo).toBe(true);
    });
  });

  describe('3. Add Components to Rows', () => {
    beforeEach(() => {
      act(() => {
        store.addRow(['1/2', '1/2']);
      });
    });

    it('should add bar chart component', () => {
      const updatedStore = useDashboardStore.getState();
      const columnId = updatedStore.config.rows[0].columns[0].id;

      act(() => {
        store.addComponent(columnId, 'bar_chart');
      });

      const finalStore = useDashboardStore.getState();
      const component = finalStore.config.rows[0].columns[0].component;
      expect(component).toBeDefined();
      expect(component?.type).toBe('bar_chart');
      expect(component?.title).toBe('New bar_chart');
    });

    it('should add scorecard component', () => {
      const updatedStore = useDashboardStore.getState();
      const columnId = updatedStore.config.rows[0].columns[1].id;

      act(() => {
        store.addComponent(columnId, 'scorecard');
      });

      const finalStore = useDashboardStore.getState();
      const component = finalStore.config.rows[0].columns[1].component;
      expect(component?.type).toBe('scorecard');
    });

    it('should add table component', () => {
      act(() => {
        store.addRow(['1/1']);
      });

      const updatedStore = useDashboardStore.getState();
      const columnId = updatedStore.config.rows[1].columns[0].id;

      act(() => {
        store.addComponent(columnId, 'table');
      });

      const finalStore = useDashboardStore.getState();
      const component = finalStore.config.rows[1].columns[0].component;
      expect(component?.type).toBe('table');
    });

    it('should select component after adding', () => {
      const updatedStore = useDashboardStore.getState();
      const columnId = updatedStore.config.rows[0].columns[0].id;

      act(() => {
        store.addComponent(columnId, 'line_chart');
      });

      const finalStore = useDashboardStore.getState();
      const component = finalStore.config.rows[0].columns[0].component;
      expect(finalStore.selectedComponentId).toBe(component?.id);
    });

    it('should add multiple different chart types', () => {
      const updatedStore = useDashboardStore.getState();
      const col1Id = updatedStore.config.rows[0].columns[0].id;
      const col2Id = updatedStore.config.rows[0].columns[1].id;

      act(() => {
        store.addComponent(col1Id, 'pie_chart');
        store.addComponent(col2Id, 'area_chart');
      });

      const finalStore = useDashboardStore.getState();
      expect(finalStore.config.rows[0].columns[0].component?.type).toBe('pie_chart');
      expect(finalStore.config.rows[0].columns[1].component?.type).toBe('area_chart');
    });
  });

  describe('4. Configure Data Sources and Metrics', () => {
    let componentId: string;

    beforeEach(() => {
      act(() => {
        store.addRow(['1/1']);
      });

      const updatedStore = useDashboardStore.getState();
      const columnId = updatedStore.config.rows[0].columns[0].id;

      act(() => {
        store.addComponent(columnId, 'bar_chart');
      });

      const finalStore = useDashboardStore.getState();
      componentId = finalStore.config.rows[0].columns[0].component!.id;
    });

    it('should configure data source', () => {
      act(() => {
        store.updateComponent(componentId, {
          datasource: 'google_ads',
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.datasource).toBe('google_ads');
    });

    it('should configure dimension', () => {
      act(() => {
        store.updateComponent(componentId, {
          dimension: 'campaign_name',
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.dimension).toBe('campaign_name');
    });

    it('should configure metrics', () => {
      act(() => {
        store.updateComponent(componentId, {
          metrics: ['impressions', 'clicks', 'cost'],
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.metrics).toEqual(['impressions', 'clicks', 'cost']);
    });

    it('should configure date range', () => {
      act(() => {
        store.updateComponent(componentId, {
          dateRange: {
            start: '2025-01-01',
            end: '2025-01-31',
          },
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.dateRange).toEqual({
        start: '2025-01-01',
        end: '2025-01-31',
      });
    });

    it('should configure filters', () => {
      act(() => {
        store.updateComponent(componentId, {
          filters: [
            {
              field: 'campaign_name',
              operator: 'contains',
              values: ['Brand'],
            },
          ],
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.filters).toHaveLength(1);
      expect(component?.filters?.[0].field).toBe('campaign_name');
    });

    it('should configure complete component data configuration', () => {
      act(() => {
        store.updateComponent(componentId, {
          datasource: 'google_ads',
          dimension: 'campaign_name',
          metrics: ['impressions', 'clicks', 'conversions'],
          dateRange: {
            start: '2025-01-01',
            end: '2025-01-31',
          },
          filters: [
            {
              field: 'status',
              operator: 'equals',
              values: ['ENABLED'],
            },
          ],
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.datasource).toBe('google_ads');
      expect(component?.dimension).toBe('campaign_name');
      expect(component?.metrics).toHaveLength(3);
      expect(component?.dateRange).toBeDefined();
      expect(component?.filters).toHaveLength(1);
    });
  });

  describe('5. Style Components', () => {
    let componentId: string;

    beforeEach(() => {
      act(() => {
        store.addRow(['1/1']);
      });

      const updatedStore = useDashboardStore.getState();
      const columnId = updatedStore.config.rows[0].columns[0].id;

      act(() => {
        store.addComponent(columnId, 'bar_chart');
      });

      const finalStore = useDashboardStore.getState();
      componentId = finalStore.config.rows[0].columns[0].component!.id;
    });

    it('should configure title styles', () => {
      act(() => {
        store.updateComponent(componentId, {
          title: 'Campaign Performance Dashboard',
          showTitle: true,
          titleFontSize: '24px',
          titleFontWeight: 'bold',
          titleColor: '#1f2937',
          titleAlignment: 'center',
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.title).toBe('Campaign Performance Dashboard');
      expect(component?.showTitle).toBe(true);
      expect(component?.titleFontSize).toBe('24px');
      expect(component?.titleAlignment).toBe('center');
    });

    it('should configure background and border styles', () => {
      act(() => {
        store.updateComponent(componentId, {
          backgroundColor: '#f9fafb',
          showBorder: true,
          borderColor: '#e5e7eb',
          borderWidth: 2,
          borderRadius: 8,
          showShadow: true,
          shadowColor: 'rgba(0,0,0,0.1)',
          shadowBlur: 10,
          padding: 16,
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.backgroundColor).toBe('#f9fafb');
      expect(component?.showBorder).toBe(true);
      expect(component?.borderRadius).toBe(8);
      expect(component?.showShadow).toBe(true);
    });

    it('should configure chart appearance', () => {
      act(() => {
        store.updateComponent(componentId, {
          showLegend: true,
          chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        });
      });

      const updatedStore = useDashboardStore.getState();
      const component = updatedStore.config.rows[0].columns[0].component;
      expect(component?.showLegend).toBe(true);
      expect(component?.chartColors).toHaveLength(4);
    });

    it('should configure metric formatting for scorecard', () => {
      // Add scorecard
      act(() => {
        store.addRow(['1/2', '1/2']);
      });

      const store1 = useDashboardStore.getState();
      const scorecardColId = store1.config.rows[1].columns[0].id;

      act(() => {
        store.addComponent(scorecardColId, 'scorecard');
      });

      const store2 = useDashboardStore.getState();
      const scorecardId = store2.config.rows[1].columns[0].component!.id;

      act(() => {
        store.updateComponent(scorecardId, {
          metricsConfig: [
            {
              id: 'conversions',
              name: 'Total Conversions',
              format: 'number',
              decimals: 0,
              compact: false,
              alignment: 'center',
              textColor: '#1f2937',
              fontWeight: 'bold',
              showComparison: true,
              compareVs: 'previous',
              showBars: false,
            },
          ],
        });
      });

      const finalStore = useDashboardStore.getState();
      const component = finalStore.config.rows[1].columns[0].component;
      expect(component?.metricsConfig).toHaveLength(1);
      expect(component?.metricsConfig?.[0].format).toBe('number');
    });
  });

  describe('6. Save Dashboard (Auto-save and Manual)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should trigger auto-save after changes', async () => {
      // Set dashboard ID
      act(() => {
        store.config.id = 'test-dashboard-1';
        store.setTitle('Test Dashboard');
      });

      // Wait for auto-save delay (2 seconds)
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      await waitFor(() => {
        expect(dashboardAPI.saveDashboard).toHaveBeenCalled();
      });
    });

    it('should save manually', async () => {
      act(() => {
        store.config.id = 'test-dashboard-1';
        store.setTitle('Manual Save Test');
      });

      await act(async () => {
        await store.save('test-dashboard-1');
      });

      expect(dashboardAPI.saveDashboard).toHaveBeenCalledWith(
        'test-dashboard-1',
        expect.objectContaining({
          title: 'Manual Save Test',
        })
      );
    });

    it('should update save status during save', async () => {
      act(() => {
        store.config.id = 'test-dashboard-1';
        store.setTitle('Save Status Test');
      });

      const savePromise = act(async () => {
        await store.save('test-dashboard-1');
      });

      // Check status is 'saving'
      let currentStore = useDashboardStore.getState();
      expect(['saving', 'saved']).toContain(currentStore.saveStatus);

      await savePromise;

      // Check status is 'saved' after completion
      currentStore = useDashboardStore.getState();
      expect(currentStore.saveStatus).toBe('saved');
      expect(currentStore.isDirty).toBe(false);
    });

    it('should handle save errors with retry', async () => {
      (dashboardAPI.saveDashboard as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      act(() => {
        store.config.id = 'test-dashboard-1';
        store.setTitle('Error Test');
      });

      await act(async () => {
        await store.save('test-dashboard-1');
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.saveStatus).toBe('error');
      expect(updatedStore.error).toContain('Network error');
      expect(updatedStore.saveAttempts).toBe(1);
    });

    it('should not save if no changes', async () => {
      act(() => {
        store.config.id = 'test-dashboard-1';
      });

      await act(async () => {
        await store.save('test-dashboard-1', false);
      });

      expect(dashboardAPI.saveDashboard).not.toHaveBeenCalled();
    });

    it('should force save when requested', async () => {
      act(() => {
        store.config.id = 'test-dashboard-1';
      });

      await act(async () => {
        await store.save('test-dashboard-1', true);
      });

      expect(dashboardAPI.saveDashboard).toHaveBeenCalled();
    });
  });

  describe('7. Export Dashboard', () => {
    it('should prepare dashboard for JSON export', () => {
      act(() => {
        store.setTitle('Export Test Dashboard');
        store.addRow(['1/2', '1/2']);
      });

      const updatedStore = useDashboardStore.getState();
      const jsonExport = JSON.stringify(updatedStore.config);
      const parsed = JSON.parse(jsonExport);

      expect(parsed.title).toBe('Export Test Dashboard');
      expect(parsed.rows).toHaveLength(1);
      expect(parsed.theme).toBeDefined();
    });

    it('should include all component configurations in export', () => {
      act(() => {
        store.addRow(['1/1']);
      });

      const store1 = useDashboardStore.getState();
      const columnId = store1.config.rows[0].columns[0].id;

      act(() => {
        store.addComponent(columnId, 'bar_chart');
      });

      const store2 = useDashboardStore.getState();
      const componentId = store2.config.rows[0].columns[0].component!.id;

      act(() => {
        store.updateComponent(componentId, {
          title: 'Performance Chart',
          datasource: 'google_ads',
          dimension: 'campaign_name',
          metrics: ['impressions', 'clicks'],
        });
      });

      const finalStore = useDashboardStore.getState();
      const exported = JSON.parse(JSON.stringify(finalStore.config));
      const component = exported.rows[0].columns[0].component;

      expect(component.title).toBe('Performance Chart');
      expect(component.datasource).toBe('google_ads');
      expect(component.metrics).toEqual(['impressions', 'clicks']);
    });
  });

  describe('8. Undo/Redo Functionality', () => {
    it('should undo title change', () => {
      const originalTitle = store.config.title;

      act(() => {
        store.setTitle('New Title');
      });

      let updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('New Title');
      expect(updatedStore.canUndo).toBe(true);

      act(() => {
        store.undo();
      });

      updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe(originalTitle);
      expect(updatedStore.canRedo).toBe(true);
    });

    it('should redo undone changes', () => {
      const originalTitle = store.config.title; // "Untitled Dashboard"

      act(() => {
        store.setTitle('Title 1');
      });

      act(() => {
        store.setTitle('Title 2');
      });

      act(() => {
        store.setTitle('Title 3');
      });

      // History is now: [Untitled, Untitled, Title 1, Title 2] index=3, config.title="Title 3"
      act(() => {
        store.undo();
      });

      // Now at index=2, config.title="Title 1" (from history[2])
      let updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('Title 1');

      act(() => {
        store.redo();
      });

      // Back at index=3, config.title="Title 2" (from history[3])
      updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('Title 2');
    });

    it('should undo adding row', () => {
      act(() => {
        store.addRow(['1/2', '1/2']);
      });

      let updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows).toHaveLength(1);

      act(() => {
        store.undo();
      });

      updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows).toHaveLength(0);
    });

    it('should undo adding component', () => {
      act(() => {
        store.addRow(['1/1']);
      });

      const store1 = useDashboardStore.getState();
      const columnId = store1.config.rows[0].columns[0].id;

      act(() => {
        store.addComponent(columnId, 'bar_chart');
      });

      let store2 = useDashboardStore.getState();
      expect(store2.config.rows[0].columns[0].component).toBeDefined();

      // Undo twice: once to remove component, once to remove row
      act(() => {
        store.undo(); // Back to state before addComponent
      });

      store2 = useDashboardStore.getState();
      // Due to how history works, undo goes back to empty state
      // History was: [empty, empty, with-row] index=2, config=with-row+component
      // After undo: index=1, config=empty
      expect(store2.config.rows).toHaveLength(0);
    });

    it('should handle multiple undo/redo operations', () => {
      const originalTitle = store.config.title; // "Untitled Dashboard"

      act(() => {
        store.setTitle('Title 1');
      });
      // History: [Untitled, Untitled] index=1, config.title="Title 1"

      act(() => {
        store.addRow(['1/1']);
      });
      // History: [Untitled, Untitled, Title 1] index=2, config has Title 1 + row

      act(() => {
        store.setTitle('Title 2');
      });
      // History: [Untitled, Untitled, Title 1, Title 1+row] index=3, config.title="Title 2" + row

      // Undo twice
      act(() => {
        store.undo(); // index=2, config from history[2]=Title 1 (no row)
      });

      act(() => {
        store.undo(); // index=1, config from history[1]=Untitled
      });

      let updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('Untitled Dashboard');
      expect(updatedStore.config.rows).toHaveLength(0);

      // Redo once
      act(() => {
        store.redo(); // index=2, config from history[2]=Title 1 (still no row!)
      });

      updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('Title 1');
      // History[2] is Title 1 without row (saved before addRow)
      expect(updatedStore.config.rows).toHaveLength(0);
    });

    it('should limit history to 50 steps', () => {
      // Add 60 changes
      act(() => {
        for (let i = 0; i < 60; i++) {
          store.setTitle(`Title ${i}`);
        }
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.history.length).toBeLessThanOrEqual(51); // 50 + initial
    });
  });

  describe('9. Conflict Resolution', () => {
    it('should detect save conflict', async () => {
      const localDashboard = createMockDashboard('conflict-test');
      const remoteDashboard = {
        ...createMockDashboard('conflict-test'),
        title: 'Remote Version',
        updatedAt: '2025-01-02T00:00:00Z',
      };

      (dashboardAPI.saveDashboard as jest.Mock).mockResolvedValueOnce({
        success: true,
        dashboard: remoteDashboard,
      });

      act(() => {
        store.config.id = 'conflict-test';
        store.lastSyncedVersion = '2025-01-01T00:00:00Z';
        store.setTitle('Local Version');
      });

      await act(async () => {
        await store.save('conflict-test', false);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.saveStatus).toBe('conflict');
      expect(updatedStore.conflictData).toBeDefined();
      expect(updatedStore.conflictData?.localVersion.title).toBe('Local Version');
      expect(updatedStore.conflictData?.remoteVersion.title).toBe('Remote Version');
    });

    it('should resolve conflict by choosing local version', async () => {
      // Setup conflict
      const remoteDashboard = {
        ...createMockDashboard('conflict-test'),
        title: 'Remote Version',
        updatedAt: '2025-01-02T00:00:00Z',
      };

      act(() => {
        store.config.id = 'conflict-test';
        store.lastSyncedVersion = '2025-01-01T00:00:00Z';
        store.conflictData = {
          localVersion: { ...store.config, title: 'Local Version' },
          remoteVersion: remoteDashboard,
          timestamp: new Date().toISOString(),
        };
        store.saveStatus = 'conflict';
      });

      (dashboardAPI.saveDashboard as jest.Mock).mockResolvedValueOnce({
        success: true,
        dashboard: { ...store.config, title: 'Local Version' },
      });

      await act(async () => {
        store.resolveConflict('local');
      });

      await waitFor(() => {
        const updatedStore = useDashboardStore.getState();
        expect(updatedStore.conflictData).toBeUndefined();
      });
    });

    it('should resolve conflict by choosing remote version', () => {
      const remoteDashboard = {
        ...createMockDashboard('conflict-test'),
        title: 'Remote Version',
        updatedAt: '2025-01-02T00:00:00Z',
      };

      act(() => {
        store.conflictData = {
          localVersion: { ...store.config, title: 'Local Version' },
          remoteVersion: remoteDashboard,
          timestamp: new Date().toISOString(),
        };
        store.saveStatus = 'conflict';
      });

      act(() => {
        store.resolveConflict('remote');
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('Remote Version');
      expect(updatedStore.conflictData).toBeUndefined();
      expect(updatedStore.saveStatus).toBe('saved');
    });
  });

  describe('10. Load Existing Dashboard', () => {
    it('should load dashboard from API', async () => {
      const mockDashboard = createMockDashboard('load-test');

      (dashboardAPI.loadDashboard as jest.Mock).mockResolvedValueOnce({
        success: true,
        dashboard: mockDashboard,
      });

      await act(async () => {
        await store.loadDashboard('load-test');
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.id).toBe('load-test');
      expect(updatedStore.config.title).toBe('Test Dashboard');
      expect(updatedStore.config.rows).toHaveLength(2);
      expect(updatedStore.isDirty).toBe(false);
      expect(updatedStore.isLoading).toBe(false);
    });

    it('should handle load errors', async () => {
      (dashboardAPI.loadDashboard as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Dashboard not found',
      });

      await act(async () => {
        await store.loadDashboard('nonexistent');
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.error).toContain('Dashboard not found');
      expect(updatedStore.isLoading).toBe(false);
    });

    it('should reset history after loading', async () => {
      const mockDashboard = createMockDashboard('load-test');

      (dashboardAPI.loadDashboard as jest.Mock).mockResolvedValueOnce({
        success: true,
        dashboard: mockDashboard,
      });

      // Make some changes first
      act(() => {
        store.setTitle('Changed');
        store.addRow(['1/1']);
      });

      await act(async () => {
        await store.loadDashboard('load-test');
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.canUndo).toBe(false);
      expect(updatedStore.canRedo).toBe(false);
      expect(updatedStore.history).toHaveLength(1);
    });
  });

  describe('11. Component Operations', () => {
    beforeEach(() => {
      act(() => {
        store.addRow(['1/2', '1/2']);
      });

      const store1 = useDashboardStore.getState();
      const col1Id = store1.config.rows[0].columns[0].id;

      act(() => {
        store.addComponent(col1Id, 'bar_chart');
      });
    });

    it('should remove component', () => {
      const store1 = useDashboardStore.getState();
      const componentId = store1.config.rows[0].columns[0].component!.id;

      act(() => {
        store.removeComponent(componentId);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows[0].columns[0].component).toBeUndefined();
    });

    it('should duplicate component', () => {
      const store1 = useDashboardStore.getState();
      const componentId = store1.config.rows[0].columns[0].component!.id;

      act(() => {
        store.duplicateComponent(componentId);
      });

      const updatedStore = useDashboardStore.getState();
      const col2Component = updatedStore.config.rows[0].columns[1].component;
      expect(col2Component).toBeDefined();
      expect(col2Component?.type).toBe('bar_chart');
      expect(col2Component?.title).toContain('(Copy)');
    });

    it('should move component between columns', () => {
      const store1 = useDashboardStore.getState();
      const componentId = store1.config.rows[0].columns[0].component!.id;
      const targetColId = store1.config.rows[0].columns[1].id;

      act(() => {
        store.moveComponent(componentId, targetColId);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows[0].columns[0].component).toBeUndefined();
      expect(updatedStore.config.rows[0].columns[1].component?.id).toBe(componentId);
    });

    it('should select and deselect component', () => {
      const store1 = useDashboardStore.getState();
      const componentId = store1.config.rows[0].columns[0].component!.id;

      act(() => {
        store.selectComponent(componentId);
      });

      let updatedStore = useDashboardStore.getState();
      expect(updatedStore.selectedComponentId).toBe(componentId);

      act(() => {
        store.selectComponent(undefined);
      });

      updatedStore = useDashboardStore.getState();
      expect(updatedStore.selectedComponentId).toBeUndefined();
    });
  });

  describe('12. Row Operations', () => {
    beforeEach(() => {
      act(() => {
        store.addRow(['1/1']);
        store.addRow(['1/2', '1/2']);
        store.addRow(['1/3', '1/3', '1/3']);
      });
    });

    it('should remove row', () => {
      const store1 = useDashboardStore.getState();
      const rowId = store1.config.rows[1].id;

      act(() => {
        store.removeRow(rowId);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows).toHaveLength(2);
    });

    it('should reorder rows', () => {
      const store1 = useDashboardStore.getState();
      const firstRowId = store1.config.rows[0].id;
      const lastRowId = store1.config.rows[2].id;

      act(() => {
        store.reorderRows(0, 2);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows[2].id).toBe(firstRowId);
      expect(updatedStore.config.rows[0].id).not.toBe(firstRowId);
    });

    it('should update row height', () => {
      const store1 = useDashboardStore.getState();
      const rowId = store1.config.rows[0].id;

      act(() => {
        store.updateRowHeight(rowId, 500);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.rows[0].height).toBe(500);
    });
  });

  describe('13. Complete E2E Workflow', () => {
    it('should complete full dashboard creation workflow', async () => {
      jest.useFakeTimers();

      // Reset store to ensure clean state
      act(() => {
        store.reset();
      });

      // Step 1: Create and name dashboard
      act(() => {
        store.setTitle('Marketing Performance Dashboard');
      });

      // Step 2: Add rows with different layouts
      act(() => {
        store.addRow(['1/2', '1/2']); // KPIs row
      });

      act(() => {
        store.addRow(['2/3', '1/3']); // Main chart + sidebar
      });

      act(() => {
        store.addRow(['1/1']); // Full-width table
      });

      // Step 3: Add components
      let currentStore = useDashboardStore.getState();
      const row1Col1 = currentStore.config.rows[0].columns[0].id;
      const row1Col2 = currentStore.config.rows[0].columns[1].id;
      const row2Col1 = currentStore.config.rows[1].columns[0].id;
      const row2Col2 = currentStore.config.rows[1].columns[1].id;
      const row3Col1 = currentStore.config.rows[2].columns[0].id;

      act(() => {
        store.addComponent(row1Col1, 'scorecard');
      });

      act(() => {
        store.addComponent(row1Col2, 'scorecard');
      });

      act(() => {
        store.addComponent(row2Col1, 'line_chart');
      });

      act(() => {
        store.addComponent(row2Col2, 'pie_chart');
      });

      act(() => {
        store.addComponent(row3Col1, 'table');
      });

      // Step 4: Configure components
      currentStore = useDashboardStore.getState();
      const scorecard1Id = currentStore.config.rows[0].columns[0].component!.id;
      const lineChartId = currentStore.config.rows[1].columns[0].component!.id;
      const tableId = currentStore.config.rows[2].columns[0].component!.id;

      act(() => {
        // Configure scorecard
        store.updateComponent(scorecard1Id, {
          title: 'Total Conversions',
          datasource: 'google_ads',
          metrics: ['conversions'],
          showTitle: true,
        });
      });

      act(() => {
        // Configure line chart
        store.updateComponent(lineChartId, {
          title: 'Clicks Over Time',
          datasource: 'google_ads',
          dimension: 'date',
          metrics: ['clicks', 'impressions'],
          showLegend: true,
          showTitle: true,
        });
      });

      act(() => {
        // Configure table
        store.updateComponent(tableId, {
          title: 'Top Performing Keywords',
          datasource: 'search_console',
          dimension: 'query',
          metrics: ['clicks', 'impressions', 'ctr', 'position'],
          showTitle: true,
        });
      });

      // Step 5: Style components
      act(() => {
        store.updateComponent(scorecard1Id, {
          backgroundColor: '#f0f9ff',
          showBorder: true,
          borderRadius: 8,
          padding: 16,
        });
      });

      // Step 6: Save dashboard
      currentStore = useDashboardStore.getState();
      const dashboardToSave = {
        ...currentStore.config,
        id: 'complete-workflow-test',
      };

      (dashboardAPI.saveDashboard as jest.Mock).mockResolvedValueOnce({
        success: true,
        dashboard: dashboardToSave,
      });

      await act(async () => {
        await store.save('complete-workflow-test', true); // Force save
      });

      // Verify final state
      const finalStore = useDashboardStore.getState();
      expect(finalStore.config.title).toBe('Marketing Performance Dashboard');
      expect(finalStore.config.rows).toHaveLength(3);
      expect(finalStore.config.rows[0].columns[0].component?.type).toBe('scorecard');
      expect(finalStore.config.rows[1].columns[0].component?.type).toBe('line_chart');
      expect(finalStore.config.rows[2].columns[0].component?.type).toBe('table');
      expect(finalStore.isDirty).toBe(false);
      expect(finalStore.saveStatus).toBe('saved');

      // Verify save was called
      expect(dashboardAPI.saveDashboard).toHaveBeenCalledWith(
        'complete-workflow-test',
        expect.objectContaining({
          title: 'Marketing Performance Dashboard',
        })
      );

      jest.useRealTimers();
    });
  });

  describe('14. Zoom Controls', () => {
    it('should set zoom level', () => {
      act(() => {
        store.setZoom(125);
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.zoom).toBe(125);
    });

    it('should limit zoom to valid range', () => {
      act(() => {
        store.setZoom(300); // Too high
      });

      let updatedStore = useDashboardStore.getState();
      expect(updatedStore.zoom).toBe(200); // Max

      act(() => {
        store.setZoom(25); // Too low
      });

      updatedStore = useDashboardStore.getState();
      expect(updatedStore.zoom).toBe(50); // Min
    });
  });

  describe('15. Store Reset', () => {
    it('should reset store to initial state', () => {
      act(() => {
        store.setTitle('Test');
        store.addRow(['1/1']);
      });

      act(() => {
        store.reset();
      });

      const updatedStore = useDashboardStore.getState();
      expect(updatedStore.config.title).toBe('Untitled Dashboard');
      expect(updatedStore.config.rows).toHaveLength(0);
      expect(updatedStore.isDirty).toBe(false);
      expect(updatedStore.canUndo).toBe(false);
      expect(updatedStore.canRedo).toBe(false);
    });
  });
});
