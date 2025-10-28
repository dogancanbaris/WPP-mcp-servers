/**
 * DEPRECATED - Use types from dashboard-builder.ts instead
 * This file kept for backward compatibility during migration
 * All types re-exported from dashboard-builder.ts
 */

export type {
  ColumnWidth,
  ComponentType,
  ComponentConfig,
  ColumnConfig,
  RowConfig,
  DashboardConfig,
  DashboardLayout,
} from './dashboard-builder';

// Column layout templates
export interface ColumnLayout {
  name: string;
  columns: ColumnWidth[];
  preview: string; // ASCII art preview
}

// State for the dashboard builder
export interface DashboardBuilderState {
  config: DashboardConfig;
  selectedComponentId?: string;
  history: DashboardConfig[];
  historyIndex: number;
  zoom: number;
  isDirty: boolean;
}

// Actions for modifying the dashboard
export type DashboardAction =
  | { type: 'ADD_ROW'; layout: ColumnWidth[] }
  | { type: 'REMOVE_ROW'; rowId: string }
  | { type: 'REORDER_ROWS'; oldIndex: number; newIndex: number }
  | { type: 'ADD_COMPONENT'; columnId: string; component: ComponentConfig }
  | { type: 'REMOVE_COMPONENT'; componentId: string }
  | { type: 'UPDATE_COMPONENT'; componentId: string; updates: Partial<ComponentConfig> }
  | { type: 'MOVE_COMPONENT'; componentId: string; targetColumnId: string }
  | { type: 'SELECT_COMPONENT'; componentId?: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_DASHBOARD'; config: DashboardConfig }
  | { type: 'SET_TITLE'; title: string };