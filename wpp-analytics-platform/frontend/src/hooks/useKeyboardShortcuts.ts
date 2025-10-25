import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard shortcut configuration
 */
export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: string;
  handler: (event: KeyboardEvent) => void;
  disabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Shortcut binding format for customization
 */
export interface ShortcutBinding {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

/**
 * Predefined shortcut categories
 */
export enum ShortcutCategory {
  GENERAL = 'General',
  EDITING = 'Editing',
  NAVIGATION = 'Navigation',
  DASHBOARD = 'Dashboard',
  VISUALIZATION = 'Visualization',
  DATA = 'Data',
}

/**
 * Storage key for custom shortcuts
 */
const SHORTCUTS_STORAGE_KEY = 'wpp-keyboard-shortcuts';

/**
 * Platform detection for Cmd vs Ctrl
 */
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

/**
 * Get the primary modifier key based on platform
 */
export const getPrimaryModifier = () => (isMac ? 'metaKey' : 'ctrlKey');

/**
 * Format shortcut for display
 */
export const formatShortcut = (binding: ShortcutBinding): string => {
  const parts: string[] = [];

  if (binding.ctrlKey) parts.push('Ctrl');
  if (binding.metaKey) parts.push(isMac ? 'Cmd' : 'Meta');
  if (binding.altKey) parts.push('Alt');
  if (binding.shiftKey) parts.push('Shift');

  // Format key name
  const key = binding.key.length === 1
    ? binding.key.toUpperCase()
    : binding.key.charAt(0).toUpperCase() + binding.key.slice(1);

  parts.push(key);

  return parts.join('+');
};

/**
 * Check if a keyboard event matches a shortcut binding
 */
const matchesShortcut = (event: KeyboardEvent, binding: ShortcutBinding): boolean => {
  const keyMatch = event.key.toLowerCase() === binding.key.toLowerCase();
  const ctrlMatch = !!event.ctrlKey === !!binding.ctrlKey;
  const shiftMatch = !!event.shiftKey === !!binding.shiftKey;
  const altMatch = !!event.altKey === !!binding.altKey;
  const metaMatch = !!event.metaKey === !!binding.metaKey;

  return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
};

/**
 * Load custom shortcuts from localStorage
 */
const loadCustomShortcuts = (): Record<string, ShortcutBinding> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load custom shortcuts:', error);
    return {};
  }
};

/**
 * Save custom shortcuts to localStorage
 */
const saveCustomShortcuts = (shortcuts: Record<string, ShortcutBinding>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (error) {
    console.error('Failed to save custom shortcuts:', error);
  }
};

/**
 * Hook for managing keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: ShortcutConfig[],
  enabled = true
) => {
  const shortcutsRef = useRef<ShortcutConfig[]>(shortcuts);
  const customBindingsRef = useRef<Record<string, ShortcutBinding>>(loadCustomShortcuts());

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  /**
   * Get the effective binding for a shortcut (custom or default)
   */
  const getEffectiveBinding = useCallback((shortcut: ShortcutConfig): ShortcutBinding => {
    const customBinding = customBindingsRef.current[shortcut.description];
    if (customBinding) {
      return customBinding;
    }
    return {
      key: shortcut.key,
      ctrlKey: shortcut.ctrlKey,
      shiftKey: shortcut.shiftKey,
      altKey: shortcut.altKey,
      metaKey: shortcut.metaKey,
    };
  }, []);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if user is typing in an input field
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow certain shortcuts even in input fields
      const allowInInput = ['Escape', '/'];
      if (!allowInInput.includes(event.key)) {
        return;
      }
    }

    // Check each shortcut
    for (const shortcut of shortcutsRef.current) {
      if (shortcut.disabled) continue;

      const binding = getEffectiveBinding(shortcut);

      if (matchesShortcut(event, binding)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }

        shortcut.handler(event);
        break;
      }
    }
  }, [enabled, getEffectiveBinding]);

  /**
   * Customize a shortcut binding
   */
  const customizeShortcut = useCallback((
    description: string,
    newBinding: ShortcutBinding
  ) => {
    const updated = {
      ...customBindingsRef.current,
      [description]: newBinding,
    };
    customBindingsRef.current = updated;
    saveCustomShortcuts(updated);
  }, []);

  /**
   * Reset a shortcut to default
   */
  const resetShortcut = useCallback((description: string) => {
    const updated = { ...customBindingsRef.current };
    delete updated[description];
    customBindingsRef.current = updated;
    saveCustomShortcuts(updated);
  }, []);

  /**
   * Reset all shortcuts to defaults
   */
  const resetAllShortcuts = useCallback(() => {
    customBindingsRef.current = {};
    saveCustomShortcuts({});
  }, []);

  /**
   * Get all shortcuts with their effective bindings
   */
  const getShortcutsWithBindings = useCallback(() => {
    return shortcutsRef.current.map(shortcut => ({
      ...shortcut,
      binding: getEffectiveBinding(shortcut),
      isCustomized: !!customBindingsRef.current[shortcut.description],
    }));
  }, [getEffectiveBinding]);

  // Register event listener
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    customizeShortcut,
    resetShortcut,
    resetAllShortcuts,
    getShortcutsWithBindings,
    formatShortcut,
  };
};

/**
 * Hook for a single keyboard shortcut
 */
export const useKeyboardShortcut = (
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    enabled?: boolean;
    preventDefault?: boolean;
  } = {}
) => {
  const {
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    enabled = true,
    preventDefault = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const binding: ShortcutBinding = {
        key,
        ctrlKey,
        shiftKey,
        altKey,
        metaKey,
      };

      if (matchesShortcut(event, binding)) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, handler, ctrlKey, shiftKey, altKey, metaKey, enabled, preventDefault]);
};

/**
 * Default keyboard shortcuts for dashboard builder
 */
export const createDefaultShortcuts = (handlers: {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDuplicate?: () => void;
  onFind?: () => void;
  onHelp?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onFullscreen?: () => void;
  onNewDashboard?: () => void;
  onOpenDashboard?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
  onRefresh?: () => void;
  onAddChart?: () => void;
  onAddFilter?: () => void;
  onSettings?: () => void;
}): ShortcutConfig[] => {
  const primaryModifier = getPrimaryModifier();

  return [
    // General
    {
      key: '/',
      [primaryModifier]: true,
      description: 'Show keyboard shortcuts',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onHelp || (() => {}),
    },
    {
      key: 's',
      [primaryModifier]: true,
      description: 'Save dashboard',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onSave || (() => {}),
    },
    {
      key: 'n',
      [primaryModifier]: true,
      description: 'New dashboard',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onNewDashboard || (() => {}),
    },
    {
      key: 'o',
      [primaryModifier]: true,
      description: 'Open dashboard',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onOpenDashboard || (() => {}),
    },
    {
      key: 'e',
      [primaryModifier]: true,
      description: 'Export dashboard',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onExport || (() => {}),
    },
    {
      key: 'p',
      [primaryModifier]: true,
      description: 'Preview dashboard',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onPreview || (() => {}),
    },
    {
      key: 'r',
      [primaryModifier]: true,
      description: 'Refresh data',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onRefresh || (() => {}),
    },
    {
      key: ',',
      [primaryModifier]: true,
      description: 'Settings',
      category: ShortcutCategory.GENERAL,
      handler: handlers.onSettings || (() => {}),
    },

    // Editing
    {
      key: 'z',
      [primaryModifier]: true,
      description: 'Undo',
      category: ShortcutCategory.EDITING,
      handler: handlers.onUndo || (() => {}),
    },
    {
      key: 'z',
      [primaryModifier]: true,
      shiftKey: true,
      description: 'Redo',
      category: ShortcutCategory.EDITING,
      handler: handlers.onRedo || (() => {}),
    },
    {
      key: 'y',
      [primaryModifier]: true,
      description: 'Redo (alternative)',
      category: ShortcutCategory.EDITING,
      handler: handlers.onRedo || (() => {}),
    },
    {
      key: 'c',
      [primaryModifier]: true,
      description: 'Copy',
      category: ShortcutCategory.EDITING,
      handler: handlers.onCopy || (() => {}),
    },
    {
      key: 'x',
      [primaryModifier]: true,
      description: 'Cut',
      category: ShortcutCategory.EDITING,
      handler: handlers.onCut || (() => {}),
    },
    {
      key: 'v',
      [primaryModifier]: true,
      description: 'Paste',
      category: ShortcutCategory.EDITING,
      handler: handlers.onPaste || (() => {}),
    },
    {
      key: 'Delete',
      description: 'Delete selected',
      category: ShortcutCategory.EDITING,
      handler: handlers.onDelete || (() => {}),
    },
    {
      key: 'Backspace',
      description: 'Delete selected (alternative)',
      category: ShortcutCategory.EDITING,
      handler: handlers.onDelete || (() => {}),
    },
    {
      key: 'a',
      [primaryModifier]: true,
      description: 'Select all',
      category: ShortcutCategory.EDITING,
      handler: handlers.onSelectAll || (() => {}),
    },
    {
      key: 'd',
      [primaryModifier]: true,
      description: 'Duplicate selected',
      category: ShortcutCategory.EDITING,
      handler: handlers.onDuplicate || (() => {}),
    },

    // Navigation
    {
      key: 'f',
      [primaryModifier]: true,
      description: 'Find',
      category: ShortcutCategory.NAVIGATION,
      handler: handlers.onFind || (() => {}),
    },
    {
      key: 'Escape',
      description: 'Cancel/Close',
      category: ShortcutCategory.NAVIGATION,
      handler: () => {
        // Close any open dialogs or deselect
        const event = new CustomEvent('escape-pressed');
        window.dispatchEvent(event);
      },
      preventDefault: false,
    },

    // Dashboard
    {
      key: '=',
      [primaryModifier]: true,
      description: 'Zoom in',
      category: ShortcutCategory.DASHBOARD,
      handler: handlers.onZoomIn || (() => {}),
    },
    {
      key: '-',
      [primaryModifier]: true,
      description: 'Zoom out',
      category: ShortcutCategory.DASHBOARD,
      handler: handlers.onZoomOut || (() => {}),
    },
    {
      key: '0',
      [primaryModifier]: true,
      description: 'Reset zoom',
      category: ShortcutCategory.DASHBOARD,
      handler: handlers.onZoomReset || (() => {}),
    },
    {
      key: 'f11',
      description: 'Toggle fullscreen',
      category: ShortcutCategory.DASHBOARD,
      handler: handlers.onFullscreen || (() => {}),
    },

    // Visualization
    {
      key: 'c',
      [primaryModifier]: true,
      shiftKey: true,
      description: 'Add chart',
      category: ShortcutCategory.VISUALIZATION,
      handler: handlers.onAddChart || (() => {}),
    },
    {
      key: 'f',
      [primaryModifier]: true,
      shiftKey: true,
      description: 'Add filter',
      category: ShortcutCategory.VISUALIZATION,
      handler: handlers.onAddFilter || (() => {}),
    },

    // Arrow keys for moving selected elements
    {
      key: 'ArrowUp',
      description: 'Move selected up',
      category: ShortcutCategory.NAVIGATION,
      handler: () => {
        window.dispatchEvent(new CustomEvent('move-element', { detail: { direction: 'up' } }));
      },
    },
    {
      key: 'ArrowDown',
      description: 'Move selected down',
      category: ShortcutCategory.NAVIGATION,
      handler: () => {
        window.dispatchEvent(new CustomEvent('move-element', { detail: { direction: 'down' } }));
      },
    },
    {
      key: 'ArrowLeft',
      description: 'Move selected left',
      category: ShortcutCategory.NAVIGATION,
      handler: () => {
        window.dispatchEvent(new CustomEvent('move-element', { detail: { direction: 'left' } }));
      },
    },
    {
      key: 'ArrowRight',
      description: 'Move selected right',
      category: ShortcutCategory.NAVIGATION,
      handler: () => {
        window.dispatchEvent(new CustomEvent('move-element', { detail: { direction: 'right' } }));
      },
    },
  ];
};
