/**
 * Page Navigation Keyboard Shortcuts
 *
 * Ctrl+Tab / Cmd+Tab - Next page
 * Ctrl+Shift+Tab / Cmd+Shift+Tab - Previous page
 * F2 - Rename current page
 */

import { useEffect } from 'react';
import { useDashboardStore, usePages, useCurrentPageId } from '@/store/dashboardStore';

interface UsePageKeyboardShortcutsOptions {
  onRename?: () => void;
}

export function usePageKeyboardShortcuts(options: UsePageKeyboardShortcutsOptions = {}) {
  const pages = usePages();
  const currentPageId = useCurrentPageId();
  const { setCurrentPage } = useDashboardStore();
  const { onRename } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Tab or Cmd+Tab (with/without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();

        if (!pages || pages.length === 0 || !currentPageId) return;

        const currentIndex = pages.findIndex((p) => p.id === currentPageId);
        if (currentIndex === -1) return;

        if (e.shiftKey) {
          // Previous page
          const prevIndex = currentIndex === 0 ? pages.length - 1 : currentIndex - 1;
          setCurrentPage(pages[prevIndex].id);
        } else {
          // Next page
          const nextIndex = currentIndex === pages.length - 1 ? 0 : currentIndex + 1;
          setCurrentPage(pages[nextIndex].id);
        }
      }

      // F2 - Rename current page
      if (e.key === 'F2' && onRename) {
        e.preventDefault();
        onRename();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages, currentPageId, setCurrentPage, onRename]);
}
