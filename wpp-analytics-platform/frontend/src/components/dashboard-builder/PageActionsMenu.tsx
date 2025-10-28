import React from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Trash2, Edit } from 'lucide-react';

interface PageActionsMenuProps {
  pageId: string;
  children: React.ReactNode;
}

export function PageActionsMenu({ pageId, children }: PageActionsMenuProps) {
  const { duplicatePage, removePage, updatePage } = useDashboardStore();

  const handleRename = () => {
    const newName = prompt('Enter new page name:');
    if (newName && newName.trim()) {
      updatePage(pageId, { name: newName.trim() });
    }
  };

  const handleDuplicate = () => {
    duplicatePage(pageId);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this page?')) {
      removePage(pageId);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleRename}>
          <Edit size={16} className="mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy size={16} className="mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 size={16} className="mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
