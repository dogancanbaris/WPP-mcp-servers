// Keyboard shortcuts hook for dashboard builder
import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onAddChart?: () => void;
  onToggleFilters?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl key
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + S: Save
      if (modifier && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }

      // Cmd/Ctrl + K: Add Chart
      if (modifier && e.key === 'k') {
        e.preventDefault();
        handlers.onAddChart?.();
        return;
      }

      // Cmd/Ctrl + F: Toggle Filters
      if (modifier && e.key === 'f') {
        e.preventDefault();
        handlers.onToggleFilters?.();
        return;
      }

      // Cmd/Ctrl + E: Export
      if (modifier && e.key === 'e') {
        e.preventDefault();
        handlers.onExport?.();
        return;
      }

      // Cmd/Ctrl + Z: Undo
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z: Redo
      if ((modifier && e.key === 'y') || (modifier && e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      // Cmd/Ctrl + X: Cut
      if (modifier && e.key === 'x' && !isInputElement(e.target)) {
        e.preventDefault();
        handlers.onCut?.();
        return;
      }

      // Cmd/Ctrl + C: Copy
      if (modifier && e.key === 'c' && !isInputElement(e.target)) {
        e.preventDefault();
        handlers.onCopy?.();
        return;
      }

      // Cmd/Ctrl + V: Paste
      if (modifier && e.key === 'v' && !isInputElement(e.target)) {
        e.preventDefault();
        handlers.onPaste?.();
        return;
      }

      // Cmd/Ctrl + D: Duplicate
      if (modifier && e.key === 'd') {
        e.preventDefault();
        handlers.onDuplicate?.();
        return;
      }

      // Cmd/Ctrl + A: Select All
      if (modifier && e.key === 'a' && !isInputElement(e.target)) {
        e.preventDefault();
        handlers.onSelectAll?.();
        return;
      }

      // Cmd/Ctrl + Shift + A: Deselect All
      if (modifier && e.shiftKey && e.key === 'a' && !isInputElement(e.target)) {
        e.preventDefault();
        handlers.onDeselectAll?.();
        return;
      }

      // Delete/Backspace: Delete selected component
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputElement(e.target)) {
        e.preventDefault();
        handlers.onDelete?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}

// Helper to check if target is input element
function isInputElement(target: any): boolean {
  if (!target) return false;

  const tagName = target.tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

// Helper function to get keyboard shortcuts list
export function getKeyboardShortcuts() {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  return [
    // File operations
    { key: `${modifierKey} + S`, action: 'Save dashboard' },

    // Edit operations
    { key: `${modifierKey} + Z`, action: 'Undo' },
    { key: `${modifierKey} + Y`, action: 'Redo' },
    { key: `${modifierKey} + X`, action: 'Cut' },
    { key: `${modifierKey} + C`, action: 'Copy' },
    { key: `${modifierKey} + V`, action: 'Paste' },
    { key: `${modifierKey} + D`, action: 'Duplicate' },
    { key: 'Delete', action: 'Delete selected component' },
    { key: `${modifierKey} + A`, action: 'Select all' },
    { key: `${modifierKey} + Shift + A`, action: 'Deselect all' },

    // View operations
    { key: `${modifierKey} + K`, action: 'Add chart' },
    { key: `${modifierKey} + F`, action: 'Toggle filters' },
    { key: `${modifierKey} + E`, action: 'Export dashboard' },
  ];
}
