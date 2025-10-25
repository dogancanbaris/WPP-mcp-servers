import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  DashboardConfig,
  ComponentConfig,
  RowConfig,
  ComponentType,
  ColumnWidth
} from '@/types/dashboard-builder';
import {
  saveDashboard as saveDashboardAPI,
  loadDashboard as loadDashboardAPI
} from '@/lib/api/dashboards';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';

interface ConflictData {
  localVersion: DashboardConfig;
  remoteVersion: DashboardConfig;
  timestamp: string;
}

interface DashboardStore {
  // State
  config: DashboardConfig;
  selectedComponentId?: string;
  history: DashboardConfig[];
  historyIndex: number;
  zoom: number;
  viewMode: 'edit' | 'view';
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error?: string;

  // Auto-save state
  saveStatus: SaveStatus;
  lastSaved?: Date;
  lastSyncedVersion?: string;
  saveAttempts: number;
  conflictData?: ConflictData;

  // Computed
  canUndo: boolean;
  canRedo: boolean;

  // Actions - Dashboard
  loadDashboard: (id: string) => Promise<void>;
  save: (id: string, force?: boolean) => Promise<void>;
  autoSave: () => void;
  resolveConflict: (strategy: 'local' | 'remote' | 'cancel') => void;
  setTitle: (title: string) => void;
  setZoom: (zoom: number) => void;
  setViewMode: (mode: 'edit' | 'view') => void;
  resetError: () => void;
  resetSaveStatus: () => void;

  // Actions - Rows
  addRow: (layout: ColumnWidth[]) => void;
  removeRow: (rowId: string) => void;
  reorderRows: (oldIndex: number, newIndex: number) => void;
  updateRowHeight: (rowId: string, height: number) => void;

  // Actions - Components
  addComponent: (columnId: string, type: ComponentType) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<ComponentConfig>) => void;
  duplicateComponent: (componentId: string) => void;
  moveComponent: (componentId: string, targetColumnId: string) => void;
  selectComponent: (componentId?: string) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  addToHistory: () => void;
  clearHistory: () => void;

  // Actions - Reset
  reset: () => void;
}

// Default empty dashboard configuration
const createEmptyDashboard = (): DashboardConfig => ({
  id: '',
  title: 'Untitled Dashboard',
  description: '',
  rows: [],
  theme: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#e5e7eb'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Generate unique IDs
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Deep clone helper
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Auto-save configuration
const AUTO_SAVE_DELAY = 2000; // 2 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second, exponential backoff

// Auto-save debounce timer
let autoSaveTimer: NodeJS.Timeout | null = null;
let retryTimer: NodeJS.Timeout | null = null;

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      config: createEmptyDashboard(),
      selectedComponentId: undefined,
      history: [createEmptyDashboard()],
      historyIndex: 0,
      zoom: 100,
      viewMode: 'edit',
      isDirty: false,
      isLoading: false,
      isSaving: false,
      error: undefined,
      saveStatus: 'saved',
      lastSaved: undefined,
      lastSyncedVersion: undefined,
      saveAttempts: 0,
      conflictData: undefined,
      canUndo: false,
      canRedo: false,

      // Dashboard Actions
      loadDashboard: async (id: string) => {
        set({ isLoading: true, error: undefined });

        try {
          // Use API client instead of Supabase service directly
          const response = await loadDashboardAPI(id);

          if (!response.success || !response.dashboard) {
            throw new Error(response.error || 'Dashboard not found');
          }

          const dashboard = response.dashboard;

          set({
            config: dashboard,
            history: [deepClone(dashboard)],
            historyIndex: 0,
            isDirty: false,
            isLoading: false,
            canUndo: false,
            canRedo: false,
            saveStatus: 'saved',
            lastSaved: new Date(dashboard.updatedAt),
            lastSyncedVersion: dashboard.updatedAt,
            saveAttempts: 0,
            conflictData: undefined
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load dashboard',
            isLoading: false
          });
        }
      },

      save: async (id: string, force: boolean = false) => {
        const state = get();

        if (!state.isDirty && !force) return;

        // Clear any pending auto-save
        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
          autoSaveTimer = null;
        }

        set({ isSaving: true, saveStatus: 'saving', error: undefined });

        try {
          const configToSave = {
            ...state.config,
            id,
            updatedAt: new Date().toISOString()
          };

          // Use API client which handles both create and update
          const response = await saveDashboardAPI(id, configToSave);

          if (!response.success) {
            throw new Error(response.error || 'Failed to save dashboard');
          }

          const savedDashboard = response.dashboard || configToSave;

          // Check for conflicts (if remote version is newer than our last sync)
          if (
            !force &&
            state.lastSyncedVersion &&
            savedDashboard.updatedAt !== state.lastSyncedVersion &&
            new Date(savedDashboard.updatedAt) > new Date(state.lastSyncedVersion)
          ) {
            // Conflict detected
            set({
              saveStatus: 'conflict',
              isSaving: false,
              conflictData: {
                localVersion: state.config,
                remoteVersion: savedDashboard,
                timestamp: new Date().toISOString()
              }
            });
            return;
          }

          set({
            config: savedDashboard,
            isDirty: false,
            isSaving: false,
            saveStatus: 'saved',
            lastSaved: new Date(),
            lastSyncedVersion: savedDashboard.updatedAt,
            saveAttempts: 0,
            error: undefined
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save dashboard';
          const newAttempts = state.saveAttempts + 1;

          set({
            error: errorMessage,
            isSaving: false,
            saveStatus: 'error',
            saveAttempts: newAttempts
          });

          // Retry logic with exponential backoff
          if (newAttempts < MAX_RETRY_ATTEMPTS) {
            const retryDelay = RETRY_DELAY_BASE * Math.pow(2, newAttempts - 1);

            if (retryTimer) {
              clearTimeout(retryTimer);
            }

            retryTimer = setTimeout(() => {
              console.log(`Retrying save (attempt ${newAttempts + 1}/${MAX_RETRY_ATTEMPTS})...`);
              get().save(id, force);
            }, retryDelay);
          }
        }
      },

      autoSave: () => {
        const state = get();

        if (!state.isDirty || !state.config.id) return;

        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
        }

        set({ saveStatus: 'unsaved' });

        autoSaveTimer = setTimeout(() => {
          const currentState = get();
          if (currentState.isDirty && currentState.config.id) {
            currentState.save(currentState.config.id);
          }
        }, AUTO_SAVE_DELAY);
      },

      resolveConflict: (strategy: 'local' | 'remote' | 'cancel') => {
        const state = get();

        if (!state.conflictData) return;

        switch (strategy) {
          case 'local':
            // Force save local version
            set({
              conflictData: undefined,
              saveStatus: 'unsaved'
            });
            state.save(state.config.id, true);
            break;

          case 'remote':
            // Accept remote version
            set({
              config: state.conflictData.remoteVersion,
              history: [deepClone(state.conflictData.remoteVersion)],
              historyIndex: 0,
              isDirty: false,
              saveStatus: 'saved',
              lastSaved: new Date(state.conflictData.remoteVersion.updatedAt),
              lastSyncedVersion: state.conflictData.remoteVersion.updatedAt,
              conflictData: undefined,
              canUndo: false,
              canRedo: false
            });
            break;

          case 'cancel':
            // Keep conflict state for user review
            set({
              saveStatus: 'conflict'
            });
            break;
        }
      },

      setTitle: (title: string) => {
        set((state) => {
          get().addToHistory();

          return {
            config: {
              ...state.config,
              title
            }
          };
        });
      },

      setZoom: (zoom: number) => {
        set({ zoom: Math.max(50, Math.min(200, zoom)) });
      },

      setViewMode: (mode: 'edit' | 'view') => {
        set({ viewMode: mode });
      },

      resetError: () => {
        set({ error: undefined });
      },

      resetSaveStatus: () => {
        set({
          saveStatus: 'saved',
          saveAttempts: 0,
          error: undefined,
          conflictData: undefined
        });

        if (retryTimer) {
          clearTimeout(retryTimer);
          retryTimer = null;
        }
      },

      // Row Actions
      addRow: (layout: ColumnWidth[]) => {
        set((state) => {
          const newRow: RowConfig = {
            id: generateId('row'),
            height: 300,
            columns: layout.map((width) => ({
              id: generateId('col'),
              width,
              component: undefined
            }))
          };

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: [...state.config.rows, newRow]
            }
          };
        });
      },

      removeRow: (rowId: string) => {
        set((state) => {
          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: state.config.rows.filter(row => row.id !== rowId)
            },
            selectedComponentId: undefined
          };
        });
      },

      reorderRows: (oldIndex: number, newIndex: number) => {
        set((state) => {
          const newRows = [...state.config.rows];
          const [movedRow] = newRows.splice(oldIndex, 1);
          newRows.splice(newIndex, 0, movedRow);

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: newRows
            }
          };
        });
      },

      updateRowHeight: (rowId: string, height: number) => {
        set((state) => {
          const newRows = state.config.rows.map(row =>
            row.id === rowId ? { ...row, height } : row
          );

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: newRows
            }
          };
        });
      },

      // Component Actions
      addComponent: (columnId: string, type: ComponentType) => {
        set((state) => {
          const newComponent: ComponentConfig = {
            id: generateId('component'),
            type,
            title: `New ${type}`,
            config: {}
          };

          const newRows = state.config.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.id === columnId) {
                return {
                  ...col,
                  component: newComponent
                };
              }
              return col;
            })
          }));

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: newRows
            },
            selectedComponentId: newComponent.id
          };
        });
      },

      removeComponent: (componentId: string) => {
        set((state) => {
          const newRows = state.config.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.component?.id === componentId) {
                return {
                  ...col,
                  component: undefined
                };
              }
              return col;
            })
          }));

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: newRows
            },
            selectedComponentId: state.selectedComponentId === componentId
              ? undefined
              : state.selectedComponentId
          };
        });
      },

      updateComponent: (componentId: string, updates: Partial<ComponentConfig>) => {
        set((state) => {
          const newRows = state.config.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.component?.id === componentId) {
                return {
                  ...col,
                  component: {
                    ...col.component,
                    ...updates
                  }
                };
              }
              return col;
            })
          }));

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: newRows
            }
          };
        });
      },

      duplicateComponent: (componentId: string) => {
        set((state) => {
          let componentToDuplicate: ComponentConfig | undefined;
          let targetColumnIndex = -1;
          let targetRowIndex = -1;

          // Find the component to duplicate
          state.config.rows.forEach((row, rowIndex) => {
            row.columns.forEach((col, colIndex) => {
              if (col.component?.id === componentId) {
                componentToDuplicate = col.component;
                targetRowIndex = rowIndex;
                targetColumnIndex = colIndex;
              }
            });
          });

          if (!componentToDuplicate) return state;

          // Create duplicate with new ID
          const duplicatedComponent: ComponentConfig = {
            ...deepClone(componentToDuplicate),
            id: generateId('component'),
            title: `${componentToDuplicate.title} (Copy)`
          };

          // Try to place in next column in same row
          const newRows = [...state.config.rows];
          const targetRow = newRows[targetRowIndex];

          if (targetColumnIndex + 1 < targetRow.columns.length) {
            // Place in next column
            targetRow.columns[targetColumnIndex + 1].component = duplicatedComponent;
          } else {
            // Create new row with same layout
            const newRow: RowConfig = {
              id: generateId('row'),
              height: targetRow.height,
              columns: targetRow.columns.map((col, i) => ({
                id: generateId('col'),
                width: col.width,
                component: i === 0 ? duplicatedComponent : undefined
              }))
            };
            newRows.splice(targetRowIndex + 1, 0, newRow);
          }

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: newRows
            },
            selectedComponentId: duplicatedComponent.id
          };
        });
      },

      moveComponent: (componentId: string, targetColumnId: string) => {
        set((state) => {
          let componentToMove: ComponentConfig | undefined;

          // Remove component from source
          const rowsAfterRemoval = state.config.rows.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.component?.id === componentId) {
                componentToMove = col.component;
                return {
                  ...col,
                  component: undefined
                };
              }
              return col;
            })
          }));

          if (!componentToMove) return state;

          // Add component to target
          const finalRows = rowsAfterRemoval.map(row => ({
            ...row,
            columns: row.columns.map(col => {
              if (col.id === targetColumnId) {
                return {
                  ...col,
                  component: componentToMove
                };
              }
              return col;
            })
          }));

          get().addToHistory();

          return {
            config: {
              ...state.config,
              rows: finalRows
            }
          };
        });
      },

      selectComponent: (componentId?: string) => {
        set({ selectedComponentId: componentId });
      },

      // History Actions
      addToHistory: () => {
        set((state) => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          const configClone = deepClone(state.config);
          newHistory.push(configClone);

          // Limit history to 50 steps
          if (newHistory.length > 50) {
            newHistory.shift();
          }

          const newIndex = newHistory.length - 1;

          return {
            history: newHistory,
            historyIndex: newIndex,
            isDirty: true,
            canUndo: newIndex > 0,
            canRedo: false
          };
        });

        // Trigger auto-save
        get().autoSave();
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex === 0) return state;

          const newIndex = state.historyIndex - 1;

          return {
            config: deepClone(state.history[newIndex]),
            historyIndex: newIndex,
            isDirty: true,
            canUndo: newIndex > 0,
            canRedo: true
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;

          const newIndex = state.historyIndex + 1;

          return {
            config: deepClone(state.history[newIndex]),
            historyIndex: newIndex,
            isDirty: true,
            canUndo: true,
            canRedo: newIndex < state.history.length - 1
          };
        });
      },

      clearHistory: () => {
        set((state) => ({
          history: [deepClone(state.config)],
          historyIndex: 0,
          canUndo: false,
          canRedo: false
        }));
      },

      // Reset
      reset: () => {
        const emptyDashboard = createEmptyDashboard();

        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
          autoSaveTimer = null;
        }

        if (retryTimer) {
          clearTimeout(retryTimer);
          retryTimer = null;
        }

        set({
          config: emptyDashboard,
          selectedComponentId: undefined,
          history: [emptyDashboard],
          historyIndex: 0,
          zoom: 100,
          isDirty: false,
          isLoading: false,
          isSaving: false,
          error: undefined,
          saveStatus: 'saved',
          lastSaved: undefined,
          lastSyncedVersion: undefined,
          saveAttempts: 0,
          conflictData: undefined,
          canUndo: false,
          canRedo: false
        });
      }
    }),
    {
      name: 'dashboard-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Selector hooks for better performance
export const useConfig = () => useDashboardStore((state) => state.config);
export const useSelectedComponent = () => {
  const selectedId = useDashboardStore((state) => state.selectedComponentId);
  const config = useDashboardStore((state) => state.config);

  if (!selectedId) return undefined;

  for (const row of config.rows) {
    for (const col of row.columns) {
      if (col.component?.id === selectedId) {
        return col.component;
      }
    }
  }

  return undefined;
};

export const useCanUndo = () => useDashboardStore((state) => state.canUndo);
export const useCanRedo = () => useDashboardStore((state) => state.canRedo);
export const useIsDirty = () => useDashboardStore((state) => state.isDirty);
export const useZoom = () => useDashboardStore((state) => state.zoom);
export const useSaveStatus = () => useDashboardStore((state) => state.saveStatus);
export const useLastSaved = () => useDashboardStore((state) => state.lastSaved);
export const useConflictData = () => useDashboardStore((state) => state.conflictData);

// Cleanup on unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', (e) => {
    const state = useDashboardStore.getState();

    // Clear timers
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    if (retryTimer) {
      clearTimeout(retryTimer);
    }

    // Warn user if there are unsaved changes
    if (state.isDirty || state.saveStatus === 'unsaved' || state.saveStatus === 'saving') {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
}
