import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  DashboardConfig,
  ComponentConfig,
  RowConfig,
  ColumnConfig,
  ComponentType,
  ColumnWidth,
  FilterConfig,
  CanvasComponent as CanvasComponentConfig
} from '@/types/dashboard-builder';
import type {
  PageConfig,
  PageStyles
} from '@/types/page-config';
import {
  saveDashboard as saveDashboardAPI,
  loadDashboard as loadDashboardAPI
} from '@/lib/supabase/dashboard-service';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';

interface ConflictData {
  localVersion: DashboardConfig;
  remoteVersion: DashboardConfig;
  timestamp: string;
}

interface DashboardStore {
  // State
  config: DashboardConfig;
  selectedComponentId?: string; // Kept for backward compatibility (first in selectedComponentIds)
  selectedComponentIds: Set<string>; // NEW - Multi-select support
  selectedCanvasIds: Set<string>;
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

  // Page state
  currentPageId: string | null;

  // UI state - Settings sidebar focus
  sidebarScope: 'page' | 'component';
  sidebarActiveTab: 'setup' | 'style';

  // UI state - Data refresh control
  pauseUpdates: boolean;

  // Actions - Dashboard
  loadDashboard: (id: string) => Promise<void>;
  save: (id: string, force?: boolean) => Promise<void>;
  autoSave: () => void;
  resolveConflict: (strategy: 'local' | 'remote' | 'cancel') => void;
  setTitle: (title: string) => void;
  setZoom: (zoom: number) => void;
  setViewMode: (mode: 'edit' | 'view') => void;
  // Low-level config setter (use targeted actions when possible)
  setConfig: (next: DashboardConfig | ((prev: DashboardConfig) => DashboardConfig)) => void;
  resetError: () => void;
  resetSaveStatus: () => void;

  // UI actions
  setSidebar: (scope?: 'page' | 'component', tab?: 'setup' | 'style') => void;
  setPauseUpdates: (pause: boolean) => void;

  // Actions - Pages
  addPage: (name?: string) => void;
  removePage: (pageId: string) => void;
  reorderPages: (oldIndex: number, newIndex: number) => void;
  updatePage: (pageId: string, updates: Partial<PageConfig>) => void;
  duplicatePage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;
  setPageFilters: (pageId: string, filters: FilterConfig[]) => void;
  setPageStyles: (pageId: string, styles: PageStyles) => void;
  updatePageFilter: (pageId: string, filter: FilterConfig) => void;
  removePageFilter: (pageId: string, filterId: string) => void;

  // Actions - Rows
  addRow: (layout: ColumnWidth[]) => void;
  removeRow: (rowId: string) => void;
  reorderRows: (oldIndex: number, newIndex: number) => void;
  reorderColumns: (rowId: string, oldIndex: number, newIndex: number) => void;
  updateRowHeight: (rowId: string, height: number) => void;

  // Actions - Components
  addComponent: (columnId: string, type: ComponentType) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<ComponentConfig>) => void;
  duplicateComponent: (componentId: string) => void;
  moveComponent: (componentId: string, targetColumnId: string) => void;
  selectComponent: (componentId?: string, addToSelection?: boolean) => void;
  selectCanvasComponent: (canvasId?: string, addToSelection?: boolean) => void;
  selectMultipleCanvas: (canvasIds: string[]) => void;
  deselectAll: () => void;
  bulkUpdateComponents: (componentIds: string[], updates: Partial<ComponentConfig>) => void;
  bulkSetLock: (componentIds: string[], locked: boolean) => void;

  // Style & lock actions
  styleClipboard?: Partial<ComponentConfig> | null;
  copyStyle: (componentId: string) => void;
  pasteStyle: (componentId: string) => void;
  toggleLock: (componentId: string) => void;

  // Canvas mode actions (NEW)
  canvasWidth: number;
  canvasHeight: number;
  setCanvasWidth: (width: number) => void;
  setCanvasHeight: (height: number) => void;
  moveComponentAbsolute: (canvasId: string, x: number, y: number) => void;
  resizeComponent: (canvasId: string, width: number, height: number, x: number, y: number) => void;
  convertToCanvas: () => void;
  convertToRowColumn: () => void;
  bringToFront: (canvasId: string) => void;
  sendToBack: (canvasId: string) => void;
  moveGroup: (componentIds: Set<string>, deltaX: number, deltaY: number) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  addToHistory: () => void;
  clearHistory: () => void;

  // Actions - Reset
  reset: () => void;
}

const getCurrentPageConfig = (state: DashboardStore): PageConfig | undefined => {
  if (!state.config.pages || !state.currentPageId) return undefined;
  return state.config.pages.find((page) => page.id === state.currentPageId);
};

const findCanvasEntryByCanvasId = (
  state: DashboardStore,
  canvasId: string | undefined
): CanvasComponentConfig | undefined => {
  if (!canvasId) return undefined;
  const page = getCurrentPageConfig(state);
  return page?.components?.find((component) => component.id === canvasId);
};

const findCanvasEntriesByComponentId = (
  state: DashboardStore,
  componentId: string | undefined
): CanvasComponentConfig[] => {
  if (!componentId) return [];
  const page = getCurrentPageConfig(state);
  if (!page?.components) return [];
  return page.components.filter((component) => component.component.id === componentId);
};

const buildComponentSelectionFromCanvas = (
  state: DashboardStore,
  canvasIds: Iterable<string>
): Set<string> => {
  const componentIds = new Set<string>();
  for (const canvasId of canvasIds) {
    const entry = findCanvasEntryByCanvasId(state, canvasId);
    if (entry) {
      componentIds.add(entry.component.id);
    }
  }
  return componentIds;
};

const buildCanvasSelectionFromComponents = (
  state: DashboardStore,
  componentIds: Iterable<string>
): Set<string> => {
  const canvasIds = new Set<string>();
  for (const componentId of componentIds) {
    const entries = findCanvasEntriesByComponentId(state, componentId);
    entries.forEach((entry) => canvasIds.add(entry.id));
  }
  return canvasIds;
};

// Generate unique IDs
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const ensureId = (maybeId: string | undefined | null, prefix: string): string => {
  if (typeof maybeId === 'string' && maybeId.trim().length > 0) {
    return maybeId;
  }
  return generateId(prefix);
};

// Deep clone helper
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const normalizeComponent = (component?: ComponentConfig | null): ComponentConfig | undefined => {
  if (!component) return undefined;

  const normalized: ComponentConfig = {
    ...component,
    id: ensureId(component.id, 'component')
  };

  return normalized;
};

const normalizeColumns = (columns?: ColumnConfig[]): ColumnConfig[] => {
  if (!Array.isArray(columns)) return [];

  return columns.map((column) => {
    const normalizedColumn: ColumnConfig = {
      ...column,
      id: ensureId(column.id, 'col'),
      width: column.width ?? '1/1'
    };

    normalizedColumn.component = normalizeComponent(column.component);

    return normalizedColumn;
  });
};

const normalizeRows = (rows?: RowConfig[]): RowConfig[] => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => ({
    ...row,
    id: ensureId(row.id, 'row'),
    columns: normalizeColumns(row.columns)
  }));
};

const normalizeDashboardConfig = (config: DashboardConfig): DashboardConfig => {
  const normalizedRows = normalizeRows(config.rows);

  const normalizedPages = (config.pages ?? []).map((page) => ({
    ...page,
    id: ensureId(page.id, 'page'),
    rows: normalizeRows(page.rows)
  }));

  return {
    ...config,
    id: ensureId(config.id, 'dashboard'),
    rows: normalizedRows,
    pages: normalizedPages
  };
};

// Default empty dashboard configuration
const createEmptyDashboard = (): DashboardConfig => ({
  id: generateId('dashboard'),
  title: 'Untitled Dashboard',
  description: '',
  rows: [],
  pages: [
    {
      id: generateId('page'),
      name: 'Page 1',
      order: 0,
      rows: [],
      createdAt: new Date().toISOString(),
    }
  ],
  theme: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#e5e7eb'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const initialDashboard = createEmptyDashboard();

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
      config: deepClone(initialDashboard),
      selectedComponentId: undefined,
      selectedComponentIds: new Set<string>(), // NEW - Multi-select
      selectedCanvasIds: new Set<string>(),
      history: [deepClone(initialDashboard)],
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
      currentPageId: initialDashboard.pages?.[0]?.id ?? null,
      // UI state defaults
      sidebarScope: 'page',
      sidebarActiveTab: 'setup',
      pauseUpdates: false,
      styleClipboard: null,
      // Canvas mode state
      canvasWidth: 1200,
      canvasHeight: 800,

      // Dashboard Actions
      loadDashboard: async (id: string) => {
        set({ isLoading: true, error: undefined });

        try {
          // Use Supabase service directly
          const response = await loadDashboardAPI(id);

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Dashboard not found');
          }

          const dashboard = normalizeDashboardConfig(response.data);

          // Initialize currentPageId - check URL param or use first page
          let initialPageId: string | null = null;
          if (dashboard.pages && dashboard.pages.length > 0) {
            // Try to get page from URL parameter
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              const pageParam = params.get('page');
              if (pageParam && dashboard.pages.some(p => p.id === pageParam)) {
                initialPageId = pageParam;
              }
            }
            // Fallback to first page if no valid URL param
            if (!initialPageId) {
              initialPageId = dashboard.pages[0].id;
            }
          }

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
            conflictData: undefined,
            currentPageId: initialPageId
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

          // Use Supabase service which handles both create and update
          const response = await saveDashboardAPI(id, configToSave);

          if (!response.success) {
            throw new Error(response.error || 'Failed to save dashboard');
          }

          const savedDashboard = normalizeDashboardConfig(response.data || configToSave);

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
            if (!state.conflictData) return;
            const normalizedRemote = normalizeDashboardConfig(state.conflictData.remoteVersion);
            set({
              config: normalizedRemote,
              history: [deepClone(normalizedRemote)],
              historyIndex: 0,
              isDirty: false,
              saveStatus: 'saved',
              lastSaved: new Date(normalizedRemote.updatedAt),
              lastSyncedVersion: normalizedRemote.updatedAt,
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

      // Set entire dashboard config safely with history tracking
      setConfig: (next: DashboardConfig | ((prev: DashboardConfig) => DashboardConfig)) => {
        const state = get();
        // Record history before mutation
        state.addToHistory();

        const nextConfig = typeof next === 'function'
          ? (next as (prev: DashboardConfig) => DashboardConfig)(state.config)
          : next;

        const normalizedConfig = normalizeDashboardConfig(nextConfig);

        set({
          config: deepClone(normalizedConfig),
          isDirty: true
        });

        // trigger auto-save debounce
        get().autoSave();
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

      // UI actions
      setSidebar: (scope?: 'page' | 'component', tab?: 'setup' | 'style') => {
        set((state) => ({
          sidebarScope: scope ?? state.sidebarScope,
          sidebarActiveTab: tab ?? state.sidebarActiveTab,
        }));
      },

      setPauseUpdates: (pause: boolean) => {
        set({ pauseUpdates: !!pause });
      },

      // Page Actions
      addPage: (name?: string) => {
        const config = get().config;
        if (!config) return;

        const newPage: PageConfig = {
          id: crypto.randomUUID(),
          name: name || `Page ${(config.pages?.length || 0) + 1}`,
          order: config.pages?.length || 0,
          rows: [],
          createdAt: new Date().toISOString(),
        };

        get().addToHistory();

        set({
          config: {
            ...config,
            pages: [...(config.pages || []), newPage],
          },
        });

        // Auto-switch to new page
        get().setCurrentPage(newPage.id);
      },

      removePage: (pageId: string) => {
        const config = get().config;
        if (!config || !config.pages) return;

        // Don't allow removing last page
        if (config.pages.length === 1) {
          console.warn('Cannot remove the last page');
          return;
        }

        const newPages = config.pages.filter(p => p.id !== pageId);

        // Reorder remaining pages
        newPages.forEach((page, index) => {
          page.order = index;
        });

        get().addToHistory();

        set({
          config: {
            ...config,
            pages: newPages,
          },
        });

        // If removed current page, switch to first page
        if (get().currentPageId === pageId) {
          get().setCurrentPage(newPages[0]?.id || null);
        }
      },

      reorderPages: (oldIndex: number, newIndex: number) => {
        const config = get().config;
        if (!config || !config.pages) return;

        const pages = [...config.pages];
        const [movedPage] = pages.splice(oldIndex, 1);
        pages.splice(newIndex, 0, movedPage);

        // Update order property
        pages.forEach((page, index) => {
          page.order = index;
        });

        get().addToHistory();

        set({
          config: {
            ...config,
            pages,
          },
        });
      },

      updatePage: (pageId: string, updates: Partial<PageConfig>) => {
        const config = get().config;
        if (!config || !config.pages) return;

        get().addToHistory();

        set({
          config: {
            ...config,
            pages: config.pages.map(page =>
              page.id === pageId
                ? { ...page, ...updates, updatedAt: new Date().toISOString() }
                : page
            ),
          },
        });
      },

      duplicatePage: (pageId: string) => {
        const config = get().config;
        if (!config || !config.pages) return;

        const sourcePage = config.pages.find(p => p.id === pageId);
        if (!sourcePage) return;

        const newPage: PageConfig = {
          ...deepClone(sourcePage),
          id: crypto.randomUUID(),
          name: `${sourcePage.name} (Copy)`,
          order: config.pages.length,
          createdAt: new Date().toISOString(),
          updatedAt: undefined,
        };

        get().addToHistory();

        set({
          config: {
            ...config,
            pages: [...config.pages, newPage],
          },
        });
      },

      setCurrentPage: (pageId: string) => {
        set({ currentPageId: pageId });
      },

      setPageFilters: (pageId: string, filters: FilterConfig[]) => {
        get().updatePage(pageId, { filters });
      },

      setPageStyles: (pageId: string, styles: PageStyles) => {
        get().updatePage(pageId, { pageStyles: styles });
      },

      updatePageFilter: (pageId: string, filter: FilterConfig) => {
        const config = get().config;
        if (!config || !config.pages) return;

        const page = config.pages.find((p) => p.id === pageId);
        if (!page) return;

        get().addToHistory();

        const existingFilters = page.filters || [];
        const filterIndex = existingFilters.findIndex((f) => f.id === filter.id);

        let newFilters: FilterConfig[];
        if (filterIndex >= 0) {
          // Update existing filter
          newFilters = [...existingFilters];
          newFilters[filterIndex] = filter;
        } else {
          // Add new filter
          newFilters = [...existingFilters, filter];
        }

        get().updatePage(pageId, { filters: newFilters });
      },

      removePageFilter: (pageId: string, filterId: string) => {
        const config = get().config;
        if (!config || !config.pages) return;

        const page = config.pages.find((p) => p.id === pageId);
        if (!page) return;

        get().addToHistory();

        const newFilters = (page.filters || []).filter((f) => f.id !== filterId);
        get().updatePage(pageId, { filters: newFilters });
      },

      // Row Actions
      addRow: (layout: ColumnWidth[]) => {
        const state = get();
        const currentPageId = state.currentPageId;

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

        // If we have pages, add row to current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page =>
                page.id === currentPageId
                  ? { ...page, rows: [...page.rows, newRow] }
                  : page
              ),
            }
          });
        } else {
          // Legacy: add to config.rows for backwards compatibility
          set({
            config: {
              ...state.config,
              rows: [...state.config.rows, newRow]
            }
          });
        }
      },

      removeRow: (rowId: string) => {
        const state = get();
        const currentPageId = state.currentPageId;

        get().addToHistory();

        // If we have pages, remove row from current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page =>
                page.id === currentPageId
                  ? { ...page, rows: page.rows.filter(row => row.id !== rowId) }
                  : page
              ),
            },
            selectedComponentId: undefined
          });
        } else {
          // Legacy: remove from config.rows
          set({
            config: {
              ...state.config,
              rows: state.config.rows.filter(row => row.id !== rowId)
            },
            selectedComponentId: undefined
          });
        }
      },

      reorderRows: (oldIndex: number, newIndex: number) => {
        const state = get();
        const currentPageId = state.currentPageId;

        get().addToHistory();

        // If we have pages, reorder rows in current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page => {
                if (page.id === currentPageId) {
                  const newRows = [...page.rows];
                  const [movedRow] = newRows.splice(oldIndex, 1);
                  newRows.splice(newIndex, 0, movedRow);
                  return { ...page, rows: newRows };
                }
                return page;
              }),
            }
          });
        } else {
          // Legacy: reorder config.rows
          const newRows = [...state.config.rows];
          const [movedRow] = newRows.splice(oldIndex, 1);
          newRows.splice(newIndex, 0, movedRow);

          set({
            config: {
              ...state.config,
              rows: newRows
            }
          });
        }
      },

      reorderColumns: (rowId: string, oldIndex: number, newIndex: number) => {
        const state = get();
        const currentPageId = state.currentPageId;

        if (oldIndex === newIndex) {
          return;
        }

        const rowsForCurrentScope: RowConfig[] = state.config.pages && currentPageId
          ? (state.config.pages.find(page => page.id === currentPageId)?.rows ?? [])
          : state.config.rows;

        const targetRow = rowsForCurrentScope.find(row => row.id === rowId);

        if (!targetRow) {
          return;
        }

        if (
          oldIndex < 0 ||
          oldIndex >= targetRow.columns.length ||
          newIndex < 0 ||
          newIndex >= targetRow.columns.length
        ) {
          return;
        }

        get().addToHistory();

        const reorder = (rows: RowConfig[]) => {
          return rows.map(row => {
            if (row.id !== rowId) {
              return row;
            }

            const newColumns = [...row.columns];
            const [movedColumn] = newColumns.splice(oldIndex, 1);
            newColumns.splice(newIndex, 0, movedColumn);

            return {
              ...row,
              columns: newColumns
            };
          });
        };

        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page =>
                page.id === currentPageId
                  ? {
                      ...page,
                      rows: reorder(page.rows)
                    }
                  : page
              )
            }
          });
        } else {
          set({
            config: {
              ...state.config,
              rows: reorder(state.config.rows)
            }
          });
        }
      },

      updateRowHeight: (rowId: string, height: number) => {
        const state = get();
        const currentPageId = state.currentPageId;

        get().addToHistory();

        // If we have pages, update row height in current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page => {
                if (page.id === currentPageId) {
                  return {
                    ...page,
                    rows: page.rows.map(row =>
                      row.id === rowId ? { ...row, height } : row
                    )
                  };
                }
                return page;
              }),
            }
          });
        } else {
          // Legacy: update in config.rows
          set({
            config: {
              ...state.config,
              rows: state.config.rows.map(row =>
                row.id === rowId ? { ...row, height } : row
              )
            }
          });
        }
      },

      // Component Actions
      addComponent: (columnId: string, type: ComponentType) => {
        const state = get();
        const currentPageId = state.currentPageId;
        const currentPage = state.config.pages && currentPageId
          ? state.config.pages.find((p) => p.id === currentPageId)
          : undefined;

        const inheritedDatasetId =
          currentPage?.components?.find((comp) => comp.component.dataset_id)?.component.dataset_id ||
          currentPage?.rows
            ?.flatMap((row) => row.columns)
            .find((col) => col.component?.dataset_id)?.component?.dataset_id ||
          state.config.dataset_id ||
          undefined;

        const inheritedDatasource =
          currentPage?.components?.find((comp) => comp.component.datasource)?.component.datasource ||
          currentPage?.rows
            ?.flatMap((row) => row.columns)
            .find((col) => col.component?.datasource)?.component?.datasource ||
          state.config.datasource ||
          undefined;

        const newComponent: ComponentConfig = {
          id: generateId('component'),
          type,
          title: `New ${type}`,
          dataset_id: inheritedDatasetId,
          datasource: inheritedDatasource,
          config: {}
        };

        get().addToHistory();

        // If we have pages, add component to current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page => {
                if (page.id === currentPageId) {
                  return {
                    ...page,
                    rows: page.rows.map(row => ({
                      ...row,
                      columns: row.columns.map(col => {
                        if (col.id === columnId) {
                          return { ...col, component: newComponent };
                        }
                        return col;
                      })
                    }))
                  };
                }
                return page;
              }),
            },
            selectedComponentId: newComponent.id
          });
        } else {
          // Legacy: add to config.rows
          set({
            config: {
              ...state.config,
              rows: state.config.rows.map(row => ({
                ...row,
                columns: row.columns.map(col => {
                  if (col.id === columnId) {
                    return { ...col, component: newComponent };
                  }
                  return col;
                })
              }))
            },
            selectedComponentId: newComponent.id
          });
        }
      },

      removeComponent: (componentId: string) => {
        const state = get();
        const currentPageId = state.currentPageId;
        const currentPage = state.config.pages && currentPageId
          ? state.config.pages.find((p) => p.id === currentPageId)
          : undefined;

        // Prevent removing locked component (canvas mode)
        const canvasLocked = currentPage?.components?.some(
          (comp) => comp.component.id === componentId && comp.component.locked
        );
        if (canvasLocked) {
          return;
        }

        // Prevent removing locked component (row/column mode)
        const rowsToSearch = currentPage?.rows || state.config.rows;
        const rowLocked = rowsToSearch.some((row) =>
          row.columns.some((col) => col.component?.id === componentId && col.component.locked)
        );
        if (rowLocked) {
          return;
        }

        const removeFromRows = (rows: RowConfig[]) =>
          rows.map((row) => ({
            ...row,
            columns: row.columns.map((col) =>
              col.component?.id === componentId ? { ...col, component: undefined } : col
            ),
          }));

        const removedCanvasEntries = findCanvasEntriesByComponentId(state, componentId);
        const removedCanvasIds = removedCanvasEntries.map((entry) => entry.id);
        const nextComponentSelection = new Set(state.selectedComponentIds);
        nextComponentSelection.delete(componentId);
        const nextCanvasSelection = new Set(state.selectedCanvasIds);
        removedCanvasIds.forEach((id) => nextCanvasSelection.delete(id));
        const nextSelectedComponentId = nextComponentSelection.size
          ? nextComponentSelection.values().next().value
          : undefined;

        get().addToHistory();

        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map((page) => {
                if (page.id !== currentPageId) return page;
                return {
                  ...page,
                  rows: removeFromRows(page.rows),
                  components: page.components
                    ? page.components.filter((comp) => comp.component.id !== componentId)
                    : page.components,
                };
              }),
            },
            selectedComponentIds: nextComponentSelection,
            selectedCanvasIds: nextCanvasSelection,
            selectedComponentId: nextSelectedComponentId,
          });
        } else {
          set({
            config: {
              ...state.config,
              rows: removeFromRows(state.config.rows),
            },
            selectedComponentIds: nextComponentSelection,
            selectedCanvasIds: nextCanvasSelection,
            selectedComponentId: nextSelectedComponentId,
          });
        }
      },

      updateComponent: (componentId: string, updates: Partial<ComponentConfig>) => {
        const state = get();
        const currentPageId = state.currentPageId;

        // Prevent updating locked component (except toggling lock internally)
        const rowsToSearch = (state.config.pages && currentPageId)
          ? state.config.pages.find(p => p.id === currentPageId)?.rows || []
          : state.config.rows;
        for (const row of rowsToSearch) {
          for (const col of row.columns) {
            if (col.component?.id === componentId && col.component?.locked) {
              // Allow only lock field changes via toggleLock action; block other updates
              if (!(Object.keys(updates).length === 1 && 'locked' in updates)) {
                return;
              }
            }
          }
        }

        get().addToHistory();

        // If we have pages, update component in current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page => {
                if (page.id === currentPageId) {
                  return {
                    ...page,
                    rows: page.rows.map(row => ({
                      ...row,
                      columns: row.columns.map(col => {
                        if (col.component?.id === componentId) {
                          return {
                            ...col,
                            component: { ...col.component, ...updates }
                          };
                        }
                        return col;
                      })
                    }))
                    ,
                    components: page.components
                      ? page.components.map((canvasComp) =>
                          canvasComp.component.id === componentId
                            ? { ...canvasComp, component: { ...canvasComp.component, ...updates } }
                            : canvasComp
                        )
                      : page.components,
                  };
                }
                return page;
              }),
            }
          });
        } else {
          // Legacy: update in config.rows
          set({
            config: {
              ...state.config,
              rows: state.config.rows.map(row => ({
                ...row,
                columns: row.columns.map(col => {
                  if (col.component?.id === componentId) {
                    return {
                      ...col,
                      component: { ...col.component, ...updates }
                    };
                  }
                  return col;
                })
              }))
            }
          });
        }
      },

      bulkUpdateComponents: (componentIds: string[], updates: Partial<ComponentConfig>) => {
        if (!componentIds || componentIds.length === 0) return;
        const state = get();
        const idSet = new Set(componentIds);
        let didUpdate = false;

        const applyUpdates = (component?: ComponentConfig) => {
          if (component && idSet.has(component.id)) {
            didUpdate = true;
            return { ...component, ...updates };
          }
          return component;
        };

        if (!didUpdate) {
          // Only proceed if at least one component exists with matching id
          const currentPage = state.currentPageId
            ? state.config.pages?.find((p) => p.id === state.currentPageId)
            : undefined;
          didUpdate =
            !!currentPage?.components?.some((comp) => idSet.has(comp.component.id)) ||
            state.config.rows.some((row) =>
              row.columns.some((col) => col.component && idSet.has(col.component.id))
            );
          if (!didUpdate) return;
        }

        const updateRows = (rows: RowConfig[]) =>
          rows.map((row) => ({
            ...row,
            columns: row.columns.map((col) =>
              col.component ? { ...col, component: applyUpdates(col.component) } : col
            ),
          }));

        get().addToHistory();

        set({
          config: {
            ...state.config,
            pages: state.config.pages
              ? state.config.pages.map((page) => ({
                  ...page,
                  rows: updateRows(page.rows),
                  components: page.components
                    ? page.components.map((comp) =>
                        idSet.has(comp.component.id)
                          ? { ...comp, component: applyUpdates(comp.component) }
                          : comp
                      )
                    : page.components,
                }))
              : state.config.pages,
            rows: updateRows(state.config.rows),
          },
        });

        get().autoSave();
      },

      bulkSetLock: (componentIds: string[], locked: boolean) => {
        if (!componentIds || componentIds.length === 0) return;
        get().bulkUpdateComponents(componentIds, { locked });
      },

      duplicateComponent: (componentId: string) => {
        const state = get();
        const currentPageId = state.currentPageId;

        const currentPage = state.config.pages && currentPageId
          ? state.config.pages.find((p) => p.id === currentPageId)
          : undefined;

        const canvasEntry = currentPage?.components?.find((comp) => comp.component.id === componentId);
        if (canvasEntry) {
          const duplicatedComponent: ComponentConfig = {
            ...deepClone(canvasEntry.component),
            id: generateId('component'),
            title: canvasEntry.component.title ? `${canvasEntry.component.title} (Copy)` : undefined,
          };

          const newCanvasEntry: CanvasComponentConfig = {
            ...deepClone(canvasEntry),
            id: generateId('canvas'),
            x: (canvasEntry.x ?? 0) + 24,
            y: (canvasEntry.y ?? 0) + 24,
            component: duplicatedComponent,
          };

          get().addToHistory();

          set({
            config: {
              ...state.config,
              pages: state.config.pages!.map((page) =>
                page.id === currentPageId
                  ? {
                      ...page,
                      components: [...(page.components || []), newCanvasEntry],
                    }
                  : page
              ),
            },
            selectedComponentId: duplicatedComponent.id,
            selectedComponentIds: new Set([duplicatedComponent.id]),
            selectedCanvasIds: new Set([newCanvasEntry.id]),
          });

          return;
        }

        let componentToDuplicate: ComponentConfig | undefined;
        let targetColumnIndex = -1;
        let targetRowIndex = -1;

        // Determine which rows to search
        const rowsToSearch = (state.config.pages && currentPageId)
          ? state.config.pages.find(p => p.id === currentPageId)?.rows || []
          : state.config.rows;

        // Find the component to duplicate
        rowsToSearch.forEach((row, rowIndex) => {
          row.columns.forEach((col, colIndex) => {
            if (col.component?.id === componentId) {
              componentToDuplicate = col.component;
              targetRowIndex = rowIndex;
              targetColumnIndex = colIndex;
            }
          });
        });

        if (!componentToDuplicate) return;

        // Create duplicate with new ID
        const duplicatedComponent: ComponentConfig = {
          ...deepClone(componentToDuplicate),
          id: generateId('component'),
          title: `${componentToDuplicate.title} (Copy)`
        };

        get().addToHistory();

        // Helper function to duplicate in rows
        const duplicateInRows = (rows: RowConfig[]) => {
          const newRows = [...rows];
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

          return newRows;
        };

        // If we have pages, duplicate component in current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page => {
                if (page.id === currentPageId) {
                  return {
                    ...page,
                    rows: duplicateInRows(page.rows)
                  };
                }
                return page;
              }),
            },
            selectedComponentId: duplicatedComponent.id,
            selectedComponentIds: new Set([duplicatedComponent.id]),
            selectedCanvasIds: new Set<string>()
          });
        } else {
          // Legacy: duplicate in config.rows
          set({
            config: {
              ...state.config,
              rows: duplicateInRows(state.config.rows)
            },
            selectedComponentId: duplicatedComponent.id,
            selectedComponentIds: new Set([duplicatedComponent.id]),
            selectedCanvasIds: new Set<string>()
          });
        }
      },

      moveComponent: (componentId: string, targetColumnId: string) => {
        const state = get();
        const currentPageId = state.currentPageId;

        let componentToMove: ComponentConfig | undefined;

        // Prevent moving locked component
        const rowsToSearchForLock = (state.config.pages && currentPageId)
          ? state.config.pages.find(p => p.id === currentPageId)?.rows || []
          : state.config.rows;
        for (const row of rowsToSearchForLock) {
          for (const col of row.columns) {
            if (col.component?.id === componentId && col.component?.locked) {
              return; // No-op when locked
            }
          }
        }

        get().addToHistory();

        // Helper function to move component within rows
        const moveInRows = (rows: RowConfig[]) => {
          // Remove component from source
          const rowsAfterRemoval = rows.map(row => ({
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

          if (!componentToMove) return rows;

          // Add component to target
          return rowsAfterRemoval.map(row => ({
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
        };

        // If we have pages, move component in current page
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page => {
                if (page.id === currentPageId) {
                  return {
                    ...page,
                    rows: moveInRows(page.rows)
                  };
                }
                return page;
              }),
            }
          });
        } else {
          // Legacy: move in config.rows
          set({
            config: {
              ...state.config,
              rows: moveInRows(state.config.rows)
            }
          });
        }
      },

      selectComponent: (componentId?: string, addToSelection: boolean = false) => {
        const state = get();

        if (!componentId) {
          set({
            selectedComponentId: undefined,
            selectedComponentIds: new Set<string>(),
            selectedCanvasIds: new Set<string>()
          });
          return;
        }

        const canvasEntries = findCanvasEntriesByComponentId(state, componentId);
        const canvasIds = canvasEntries.map((entry) => entry.id);

        if (addToSelection) {
          const componentSelection = new Set(state.selectedComponentIds);
          if (componentSelection.has(componentId)) {
            componentSelection.delete(componentId);
          } else {
            componentSelection.add(componentId);
          }

          const canvasSelection = new Set(state.selectedCanvasIds);
          canvasIds.forEach((id) => {
            if (canvasSelection.has(id)) {
              canvasSelection.delete(id);
            } else {
              canvasSelection.add(id);
            }
          });

          set({
            selectedComponentIds: componentSelection,
            selectedCanvasIds: canvasSelection,
            selectedComponentId: componentSelection.size > 0 ? componentSelection.values().next().value : undefined
          });
          return;
        }

        // Replace selection with single component
        set({
          selectedComponentId: componentId,
          selectedComponentIds: new Set([componentId]),
          selectedCanvasIds: new Set(canvasIds)
        });
      },

      selectCanvasComponent: (canvasId?: string, addToSelection: boolean = false) => {
        const state = get();

        if (!canvasId) {
          set({
            selectedComponentId: undefined,
            selectedComponentIds: new Set<string>(),
            selectedCanvasIds: new Set<string>()
          });
          return;
        }

        const entry = findCanvasEntryByCanvasId(state, canvasId);
        if (!entry) {
          return;
        }
        const componentId = entry.component.id;

        if (addToSelection) {
          const canvasSelection = new Set(state.selectedCanvasIds);
          if (canvasSelection.has(canvasId)) {
            canvasSelection.delete(canvasId);
          } else {
            canvasSelection.add(canvasId);
          }

          const componentSelection = buildComponentSelectionFromCanvas(state, canvasSelection);

          set({
            selectedCanvasIds: canvasSelection,
            selectedComponentIds: componentSelection,
            selectedComponentId: componentSelection.size > 0 ? componentSelection.values().next().value : undefined
          });
          return;
        }

        set({
          selectedCanvasIds: new Set([canvasId]),
          selectedComponentIds: new Set([componentId]),
          selectedComponentId: componentId
        });
      },

      selectMultipleCanvas: (canvasIds: string[]) => {
        const state = get();
        if (!canvasIds || canvasIds.length === 0) {
          set({
            selectedComponentId: undefined,
            selectedComponentIds: new Set<string>(),
            selectedCanvasIds: new Set<string>()
          });
          return;
        }

        const validCanvasIds: string[] = [];
        canvasIds.forEach((id) => {
          const entry = findCanvasEntryByCanvasId(state, id);
          if (entry) {
            validCanvasIds.push(entry.id);
          }
        });

        const componentSelection = buildComponentSelectionFromCanvas(state, validCanvasIds);

        set({
          selectedCanvasIds: new Set(validCanvasIds),
          selectedComponentIds: componentSelection,
          selectedComponentId: componentSelection.size > 0 ? componentSelection.values().next().value : undefined
        });
      },

      deselectAll: () => {
        set({
          selectedComponentId: undefined,
          selectedComponentIds: new Set<string>(),
          selectedCanvasIds: new Set<string>()
        });
      },

      // History Actions
      addToHistory: () => {
        set((state) => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          const normalizedClone = deepClone(normalizeDashboardConfig(state.config));
          newHistory.push(normalizedClone);

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
            config: deepClone(normalizeDashboardConfig(state.history[newIndex])),
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
            config: deepClone(normalizeDashboardConfig(state.history[newIndex])),
            historyIndex: newIndex,
            isDirty: true,
            canUndo: true,
            canRedo: newIndex < state.history.length - 1
          };
        });
      },

      clearHistory: () => {
        set((state) => ({
          history: [deepClone(normalizeDashboardConfig(state.config))],
          historyIndex: 0,
          canUndo: false,
          canRedo: false
        }));
      },

      // Style & lock actions
      copyStyle: (componentId: string) => {
        const state = get();
        const currentPageId = state.currentPageId;

        const rows = (state.config.pages && currentPageId)
          ? state.config.pages.find(p => p.id === currentPageId)?.rows || []
          : state.config.rows;

        let source: ComponentConfig | undefined;
        rows.forEach(row => row.columns.forEach(col => {
          if (col.component?.id === componentId) source = col.component;
        }));
        if (!source) return;

        const styleKeys: (keyof ComponentConfig)[] = [
          'titleFontFamily','titleFontSize','titleFontWeight','titleColor','titleBackgroundColor','titleAlignment',
          'backgroundColor','showBorder','borderColor','borderWidth','borderRadius','showShadow','shadowColor','shadowBlur','padding',
          'showLegend','chartColors','metricsConfig','tableStyle','tableHeaderStyle','tableBodyStyle','fontFamily','fontSize','fontWeight','color','alignment'
        ];

        const clip: Partial<ComponentConfig> = {};
        styleKeys.forEach(k => {
          const v = source?.[k];
          if (v !== undefined) (clip as any)[k] = JSON.parse(JSON.stringify(v));
        });

        set({ styleClipboard: clip });
      },

      pasteStyle: (componentId: string) => {
        const state = get();
        const clip = state.styleClipboard;
        if (!clip) return;

        state.updateComponent(componentId, clip);
      },

      toggleLock: (componentId: string) => {
        const state = get();
        const currentPageId = state.currentPageId;
        const currentPage = (state.config.pages && currentPageId)
          ? state.config.pages.find(p => p.id === currentPageId)
          : null;

        get().addToHistory();

        // CANVAS MODE: Update components array
        if (currentPage?.components) {
          const canvasComp = currentPage.components.find(c => c.component.id === componentId);
          if (!canvasComp) return;

          const currentLocked = !!canvasComp.component.locked;

          set({
            config: {
              ...state.config,
              pages: state.config.pages!.map(page => page.id === currentPageId ? {
                ...page,
                components: page.components!.map(comp => comp.component.id === componentId ? {
                  ...comp,
                  component: { ...comp.component, locked: !currentLocked }
                } : comp)
              } : page)
            }
          });

          get().autoSave();
          return;
        }

        // ROW/COLUMN MODE (legacy): Update rows array
        const rows = currentPage?.rows || state.config.rows;

        // Find current lock state
        let locked = false;
        rows.forEach(row => row.columns.forEach(col => {
          if (col.component?.id === componentId) locked = !!col.component.locked;
        }));

        // Update only the locked flag (bypass lock check by calling set directly)
        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page => page.id === currentPageId ? {
                ...page,
                rows: page.rows.map(row => ({
                  ...row,
                  columns: row.columns.map(col => col.component?.id === componentId ? {
                    ...col,
                    component: { ...(col.component as ComponentConfig), locked: !locked }
                  } : col)
                }))
              } : page)
            }
          });
        } else {
          set({
            config: {
              ...state.config,
              rows: state.config.rows.map(row => ({
                ...row,
                columns: row.columns.map(col => col.component?.id === componentId ? {
                  ...col,
                  component: { ...(col.component as ComponentConfig), locked: !locked }
                } : col)
              }))
            }
          });
        }

        get().autoSave();
      },

      // Canvas Mode Actions
      setCanvasWidth: (width: number) => {
        set({ canvasWidth: width });

        // Also update current page's canvasWidth
        const state = get();
        const currentPageId = state.currentPageId;

        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page =>
                page.id === currentPageId
                  ? { ...page, canvasWidth: width }
                  : page
              )
            }
          });
        }

        get().autoSave();
      },

      setCanvasHeight: (height: number) => {
        set({ canvasHeight: height });

        // Also update current page's canvasHeight
        const state = get();
        const currentPageId = state.currentPageId;

        if (state.config.pages && currentPageId) {
          set({
            config: {
              ...state.config,
              pages: state.config.pages.map(page =>
                page.id === currentPageId
                  ? { ...page, canvasHeight: height }
                  : page
              )
            }
          });
        }

        get().autoSave();
      },

      moveComponentAbsolute: (canvasId: string, x: number, y: number) => {
        const state = get();
        const currentPageId = state.currentPageId;

        if (!state.config.pages || !currentPageId) return;

        get().addToHistory();

        set({
          config: {
            ...state.config,
            pages: state.config.pages.map(page => {
              if (page.id === currentPageId && page.components) {
                return {
                  ...page,
                  components: page.components.map(comp =>
                    comp.id === canvasId
                      ? { ...comp, x, y }
                      : comp
                  )
                };
              }
              return page;
            })
          }
        });

        get().autoSave();
      },

      resizeComponent: (canvasId: string, width: number, height: number, x: number, y: number) => {
        const state = get();
        const currentPageId = state.currentPageId;

        if (!state.config.pages || !currentPageId) return;

        get().addToHistory();

        set({
          config: {
            ...state.config,
            pages: state.config.pages.map(page => {
              if (page.id === currentPageId && page.components) {
                return {
                  ...page,
                  components: page.components.map(comp =>
                    comp.id === canvasId
                      ? { ...comp, x, y, width, height }
                      : comp
                  )
                };
              }
              return page;
            })
          }
        });

        get().autoSave();
      },

      convertToCanvas: () => {
        const state = get();
        const currentPageId = state.currentPageId;

        if (!state.config.pages || !currentPageId) return;

        const currentPage = state.config.pages.find(p => p.id === currentPageId);
        if (!currentPage || !currentPage.rows || currentPage.rows.length === 0) return;

        // Import converter
        const { rowColumnToAbsolute } = require('@/lib/utils/layout-converter');

        const canvasComponents = rowColumnToAbsolute(
          currentPage.rows,
          currentPage.canvasWidth || state.canvasWidth
        );

        get().addToHistory();

        set({
          config: {
            ...state.config,
            pages: state.config.pages.map(page =>
              page.id === currentPageId
                ? {
                    ...page,
                    components: canvasComponents,
                    canvasWidth: page.canvasWidth || state.canvasWidth
                  }
                : page
            )
          }
        });

        get().autoSave();
      },

      convertToRowColumn: () => {
        const state = get();
        const currentPageId = state.currentPageId;

        if (!state.config.pages || !currentPageId) return;

        const currentPage = state.config.pages.find(p => p.id === currentPageId);
        if (!currentPage || !currentPage.components || currentPage.components.length === 0) return;

        // Import converter
        const { absoluteToRowColumn } = require('@/lib/utils/layout-converter');

        const rows = absoluteToRowColumn(
          currentPage.components,
          currentPage.canvasWidth || state.canvasWidth
        );

        get().addToHistory();

        set({
          config: {
            ...state.config,
            pages: state.config.pages.map(page =>
              page.id === currentPageId
                ? { ...page, rows }
                : page
            )
          }
        });

        get().autoSave();
      },

      // Z-index management for layering
      bringToFront: (canvasId: string) => {
        console.log('⬆️ [Store] bringToFront called');
        console.log('  - Canvas ID:', canvasId);

        const state = get();
        const currentPageId = state.currentPageId;

        if (!state.config.pages || !currentPageId) {
          console.log('  - ❌ No pages or currentPageId');
          return;
        }

        const currentPage = state.config.pages.find(p => p.id === currentPageId);
        if (!currentPage?.components) {
          console.log('  - ❌ No components in current page');
          return;
        }

        console.log('  - Current page components:', currentPage.components.length);
        console.log('  - Current z-indices:', currentPage.components.map(c => ({
          id: c.id,
          zIndex: c.zIndex || 0
        })));

        get().addToHistory();

        // Find highest z-index
        const maxZ = Math.max(0, ...currentPage.components.map(c => c.zIndex || 0));
        console.log('  - Max z-index:', maxZ);
        console.log('  - New z-index will be:', maxZ + 1);

        set({
          config: {
            ...state.config,
            pages: state.config.pages.map(page =>
              page.id === currentPageId
                ? {
                    ...page,
                    components: page.components!.map(comp =>
                      comp.id === canvasId
                        ? { ...comp, zIndex: maxZ + 1 }
                        : comp
                    )
                  }
                : page
            )
          }
        });

        const newState = get();
        const updatedPage = newState.config.pages?.find(p => p.id === currentPageId);
        const updatedComp = updatedPage?.components?.find(c => c.id === canvasId);
        console.log('  - ✅ After update, component z-index:', updatedComp?.zIndex);
        console.log('  - All z-indices now:', updatedPage?.components?.map(c => ({
          id: c.id,
          zIndex: c.zIndex || 0
        })));

        get().autoSave();
      },

      sendToBack: (canvasId: string) => {
        console.log('⬇️ [Store] sendToBack called');
        console.log('  - Canvas ID:', canvasId);

        const state = get();
        const currentPageId = state.currentPageId;

        if (!state.config.pages || !currentPageId) {
          console.log('  - ❌ No pages or currentPageId');
          return;
        }

        const currentPage = state.config.pages.find(p => p.id === currentPageId);
        if (!currentPage?.components) {
          console.log('  - ❌ No components in current page');
          return;
        }

        console.log('  - Current page components:', currentPage.components.length);
        console.log('  - Current z-indices:', currentPage.components.map(c => ({
          id: c.id,
          zIndex: c.zIndex || 0
        })));

        get().addToHistory();

        // Find lowest z-index
        const minZ = Math.min(0, ...currentPage.components.map(c => c.zIndex || 0));
        console.log('  - Min z-index:', minZ);
        console.log('  - New z-index will be:', minZ - 1);

        set({
          config: {
            ...state.config,
            pages: state.config.pages.map(page =>
              page.id === currentPageId
                ? {
                    ...page,
                    components: page.components!.map(comp =>
                      comp.id === canvasId
                        ? { ...comp, zIndex: minZ - 1 }
                        : comp
                    )
                  }
                : page
            )
          }
        });

        const newState = get();
        const updatedPage = newState.config.pages?.find(p => p.id === currentPageId);
        const updatedComp = updatedPage?.components?.find(c => c.id === canvasId);
        console.log('  - ✅ After update, component z-index:', updatedComp?.zIndex);
        console.log('  - All z-indices now:', updatedPage?.components?.map(c => ({
          id: c.id,
          zIndex: c.zIndex || 0
        })));

        get().autoSave();
      },

      moveGroup: (componentIds: Set<string>, deltaX: number, deltaY: number) => {
        const state = get();
        const currentPageId = state.currentPageId;

        if (!state.config.pages || !currentPageId) return;

        const currentPage = state.config.pages.find(p => p.id === currentPageId);
        if (!currentPage?.components) return;

        // Check if any component is locked
        const hasLockedComponent = currentPage.components.some(comp =>
          componentIds.has(comp.id) && comp.component.locked
        );

        if (hasLockedComponent) return; // Don't move if any component is locked

        get().addToHistory();

        set({
          config: {
            ...state.config,
            pages: state.config.pages.map(page =>
              page.id === currentPageId
                ? {
                    ...page,
                    components: page.components!.map(comp =>
                      componentIds.has(comp.id)
                        ? {
                            ...comp,
                            x: comp.x + deltaX,
                            y: comp.y + deltaY,
                          }
                        : comp
                    )
                  }
                : page
            )
          }
        });

        get().autoSave();
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
          selectedComponentIds: new Set<string>(), // NEW
          selectedCanvasIds: new Set<string>(),
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
          canRedo: false,
          currentPageId: null
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
  const currentPageId = useDashboardStore((state) => state.currentPageId);

  if (!selectedId) return undefined;

  // Prefer canvas mode (page.components)
  if (config.pages && currentPageId) {
    const page = config.pages.find((p) => p.id === currentPageId);
    const comp = page?.components?.find(
      (c) => c.component.id === selectedId || c.id === selectedId
    )?.component;
    if (comp) return comp;
  }

  // Fallback to legacy row/column mode
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
export const useCurrentPageId = () => useDashboardStore((state) => state.currentPageId);
export const usePages = () => useDashboardStore((state) => state.config.pages);
export const useCurrentPage = () => {
  const currentPageId = useDashboardStore((state) => state.currentPageId);
  const pages = useDashboardStore((state) => state.config.pages);

  if (!currentPageId || !pages) return undefined;

  return pages.find(page => page.id === currentPageId);
};

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
