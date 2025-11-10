import { useDashboardStore } from '@/store/dashboardStore';
import { toast } from 'sonner';
import type { ComponentConfig } from '@/types/dashboard-builder';

// Clipboard state - using localStorage for persistence across reloads
const CLIPBOARD_KEY = 'dashboard-builder-clipboard';

// Max columns per row (12-column grid system)
const MAX_COLUMNS_PER_ROW = 12;

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface ClipboardData {
  component: ComponentConfig;
  timestamp: number;
}

const getClipboard = (): ClipboardData | null => {
  try {
    const data = localStorage.getItem(CLIPBOARD_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setClipboard = (component: ComponentConfig | null) => {
  if (component) {
    const data: ClipboardData = {
      component,
      timestamp: Date.now(),
    };
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(CLIPBOARD_KEY);
  }
};

export const useEditActions = () => {
  const {
    selectedComponentId,
    updateComponent,
    removeComponent,
    addComponent,
    undo,
    redo,
    canUndo,
    canRedo,
    config,
    selectComponent,
    selectCanvasComponent,
    selectMultipleCanvas,
    currentPageId,
  } = useDashboardStore();

  /**
   * Undo last action
   */
  const onUndo = () => {
    if (canUndo) {
      undo();
      toast.success('Undo');
    } else {
      toast.info('Nothing to undo');
    }
  };

  /**
   * Redo last undone action
   */
  const onRedo = () => {
    if (canRedo) {
      redo();
      toast.success('Redo');
    } else {
      toast.info('Nothing to redo');
    }
  };

  const getCurrentPageConfig = () => {
    if (config.pages && currentPageId) {
      return config.pages.find((p) => p.id === currentPageId);
    }
    return undefined;
  };

  /**
   * Find component by ID across all rows and columns
   */
  const getActiveRows = () => {
    if (config.pages && config.pages.length > 0) {
      const page = getCurrentPageConfig();
      if (page) {
        return page.rows;
      }
      return config.pages[0]?.rows || [];
    }
    return config.rows;
  };

  const findComponent = (componentId: string): ComponentConfig | undefined => {
    const page = getCurrentPageConfig();
    const canvasEntry = page?.components?.find((comp) => comp.component.id === componentId);
    if (canvasEntry) {
      return canvasEntry.component;
    }

    const rows = getActiveRows();
    for (const row of rows) {
      for (const column of row.columns) {
        if (column.component?.id === componentId) {
          return column.component;
        }
      }
    }
    return undefined;
  };

  /**
   * Find the row and column indices for a component
   */
  const findComponentLocation = (componentId: string): { rowIndex: number; colIndex: number } | null => {
    const rows = getActiveRows();
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      for (let colIndex = 0; colIndex < row.columns.length; colIndex++) {
        if (row.columns[colIndex].component?.id === componentId) {
          return { rowIndex, colIndex };
        }
      }
    }
    return null;
  };

  /**
   * Cut selected component to clipboard
   */
  const onCut = () => {
    if (!selectedComponentId) {
      toast.error('No component selected');
      return;
    }

    const component = findComponent(selectedComponentId);
    if (!component) {
      toast.error('Component not found');
      return;
    }

    // Copy to clipboard
    setClipboard(component);

    // Remove from dashboard
    removeComponent(selectedComponentId);

    toast.success('Cut to clipboard');
  };

  /**
   * Copy selected component to clipboard
   */
  const onCopy = () => {
    if (!selectedComponentId) {
      toast.error('No component selected');
      return;
    }

    const component = findComponent(selectedComponentId);
    if (!component) {
      toast.error('Component not found');
      return;
    }

    // Deep clone and store in clipboard
    setClipboard(JSON.parse(JSON.stringify(component)));

    toast.success('Copied to clipboard');
  };

  /**
   * Paste component from clipboard
   */
  const onPaste = () => {
    const clipboardData = getClipboard();

    if (!clipboardData) {
      toast.error('Nothing to paste');
      return;
    }

    const page = getCurrentPageConfig();
    const isCanvasMode = !!(page?.components && page.components.length > 0);

    // Canvas mode: append component to components array with default position
    if (isCanvasMode && currentPageId && page) {
      const reference = page.components?.find((comp) => comp.component.id === selectedComponentId);
      const newCanvasId = createId('canvas');
      const newComponent: ComponentConfig = {
        ...JSON.parse(JSON.stringify(clipboardData.component)),
        id: createId('component'),
      };

      const nextComponent = {
        id: newCanvasId,
        x: (reference?.x ?? 40) + 24,
        y: (reference?.y ?? 40) + 24,
        width: reference?.width ?? 320,
        height: reference?.height ?? 200,
        zIndex: reference?.zIndex ?? 0,
        component: newComponent,
      };

      useDashboardStore.getState().setConfig((prev) => {
        if (!prev.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === currentPageId
              ? {
                  ...p,
                  components: [...(p.components || []), nextComponent],
                }
              : p
          ),
        };
      });

      selectCanvasComponent(newCanvasId);
      toast.success('Pasted component');
      return;
    }

    // Legacy row/column mode
    const newComponent: ComponentConfig = {
      ...clipboardData.component,
      id: createId('component'),
    };

    // Determine where to paste
    const rows = getActiveRows();
    let targetRowIndex = rows.length - 1; // Default: last row
    let targetColIndex = 0;

    // If there's a selected component, paste in the same row, next column
    if (selectedComponentId) {
      const location = findComponentLocation(selectedComponentId);
      if (location) {
        targetRowIndex = location.rowIndex;
        targetColIndex = location.colIndex + 1;
      }
    }

    // Add component to the target location
    if (targetRowIndex >= 0 && targetRowIndex < rows.length) {
      const targetRow = rows[targetRowIndex];

      // If target column is beyond current columns, create new column
      if (targetColIndex >= targetRow.columns.length) {
        // Check if adding a new column would exceed the max limit
        if (targetRow.columns.length >= MAX_COLUMNS_PER_ROW) {
          toast.error(`Cannot paste: Row already has maximum ${MAX_COLUMNS_PER_ROW} columns`);
          return;
        }

        // Add new column to existing row
        const newRows = [...rows];
        newRows[targetRowIndex] = {
          ...targetRow,
          columns: [
            ...targetRow.columns,
            {
              width: '1/3', // Default width for pasted component
              component: newComponent,
            },
          ],
        };
        useDashboardStore.getState().setConfig((prev) => {
          if (prev.pages && currentPageId) {
            return {
              ...prev,
              pages: prev.pages.map(p =>
                p.id === currentPageId ? { ...p, rows: newRows } : p
              ),
            };
          }
          return { ...prev, rows: newRows };
        });
      } else {
        // Replace component in existing column
        const newRows = [...rows];
        newRows[targetRowIndex] = {
          ...targetRow,
          columns: targetRow.columns.map((col, idx) =>
            idx === targetColIndex
              ? { ...col, component: newComponent }
              : col
          ),
        };
        useDashboardStore.getState().setConfig((prev) => {
          if (prev.pages && currentPageId) {
            return {
              ...prev,
              pages: prev.pages.map(p =>
                p.id === currentPageId ? { ...p, rows: newRows } : p
              ),
            };
          }
          return { ...prev, rows: newRows };
        });
      }

      // Select the newly pasted component
      selectComponent(newComponent.id);
      toast.success('Pasted component');
    } else {
      toast.error('Could not determine paste location');
    }
  };

  /**
   * Delete selected component
   */
  const onDelete = () => {
    if (!selectedComponentId) {
      toast.error('No component selected');
      return;
    }

    const component = findComponent(selectedComponentId);
    if (!component) {
      toast.error('Component not found');
      return;
    }

    // Confirm deletion for non-empty components
    const shouldDelete = component.type === 'title'
      ? true
      : confirm(`Delete ${component.type} component?`);

    if (shouldDelete) {
      removeComponent(selectedComponentId);
      toast.success('Component deleted');
    }
  };

  /**
   * Select all components (multi-select)
   * Note: Multi-select not fully implemented yet
   */
  const onSelectAll = () => {
    const page = getCurrentPageConfig();

    if (page?.components && page.components.length > 0) {
      const canvasIds = page.components.map((comp) => comp.id);
      if (canvasIds.length === 0) {
        toast.info('No components to select');
        return;
      }
      selectMultipleCanvas(canvasIds);
      toast.success(`Selected ${canvasIds.length} component(s)`);
      return;
    }

    // Legacy row-based selection (fallback)
    const rows = getActiveRows();
    const firstComponentId = rows
      .flatMap((row) => row.columns)
      .map((col) => col.component?.id)
      .find((id): id is string => !!id);

    if (!firstComponentId) {
      toast.info('No components to select');
      return;
    }

    selectComponent(firstComponentId);
    toast.success('Component selected');
  };

  /**
   * Deselect all components
   */
  const onDeselectAll = () => {
    selectComponent(undefined);
    toast.success('Deselected');
  };

  /**
   * Duplicate selected component
   */
  const onDuplicate = () => {
    if (!selectedComponentId) {
      toast.error('No component selected');
      return;
    }

    const component = findComponent(selectedComponentId);
    if (!component) {
      toast.error('Component not found');
      return;
    }

    // Copy to clipboard and paste
    setClipboard(component);
    onPaste();
  };

  /**
   * Check if clipboard has content
   */
  const hasClipboardContent = (): boolean => {
    return getClipboard() !== null;
  };

  return {
    // Undo/Redo
    onUndo,
    onRedo,
    canUndo,
    canRedo,

    // Clipboard operations
    onCut,
    onCopy,
    onPaste,
    hasClipboardContent: hasClipboardContent(),

    // Selection
    onSelectAll,
    onDeselectAll,

    // Delete & Duplicate
    onDelete,
    onDuplicate,
  };
};
