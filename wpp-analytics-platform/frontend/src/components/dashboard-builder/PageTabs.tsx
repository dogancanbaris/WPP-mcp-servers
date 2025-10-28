'use client';

import React, { useState, useRef } from 'react';
import { useDashboardStore, usePages, useCurrentPageId } from '@/store/dashboardStore';
import { usePrefetchPages } from '@/hooks/usePrefetchPages';
import { usePageKeyboardShortcuts } from '@/hooks/usePageKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Plus, X, MoreVertical, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Page Tab Component
interface SortablePageTabProps {
  page: any;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  canDelete: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNameChange: (value: string) => void;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function SortablePageTab({
  page,
  isActive,
  isEditing,
  editingName,
  canDelete,
  onEdit,
  onSave,
  onCancel,
  onNameChange,
  onSelect,
  onDelete,
  onDuplicate,
  onHover,
  onLeave,
}: SortablePageTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          className={`
            page-tab flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer
            transition-colors hover:bg-background/80
            ${isActive ? 'bg-background shadow-sm' : 'bg-transparent'}
          `}
          onClick={onSelect}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing hover:text-primary"
          >
            <GripVertical size={14} />
          </div>

          {/* Page name - editable */}
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={onSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="text-sm font-medium bg-background border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <span
              className="text-sm font-medium select-none"
              onDoubleClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              {page.name}
            </span>
          )}

          {/* Delete button */}
          {canDelete && (
            <button
              className="hover:bg-muted rounded p-0.5"
              onClick={onDelete}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          Duplicate
        </ContextMenuItem>
        {canDelete && (
          <ContextMenuItem onClick={(e: any) => onDelete(e)}>
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function PageTabs() {
  const pages = usePages();
  const currentPageId = useCurrentPageId();
  const { setCurrentPage, addPage, removePage, duplicatePage, updatePage, reorderPages } = useDashboardStore();
  const { prefetchPage } = usePrefetchPages();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inline editing state
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard shortcuts (Ctrl+Tab for next/prev page, F2 for rename)
  usePageKeyboardShortcuts({
    onRename: () => {
      if (currentPageId) {
        const currentPage = pages.find((p) => p.id === currentPageId);
        if (currentPage) {
          startEditing(currentPageId, currentPage.name);
        }
      }
    },
  });

  const handleAddPage = () => {
    addPage(); // Auto-switches to new page
  };

  const handleRemovePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!pages || pages.length === 1) {
      alert('Cannot remove the last page');
      return;
    }
    if (confirm('Are you sure you want to delete this page?')) {
      removePage(pageId);
    }
  };

  const handleDuplicatePage = (pageId: string) => {
    duplicatePage(pageId);
  };

  // Inline editing handlers
  const startEditing = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    if (editingPageId && editingName.trim()) {
      updatePage(editingPageId, { name: editingName.trim() });
    }
    setEditingPageId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingPageId(null);
    setEditingName('');
  };

  // Drag-and-drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderPages(oldIndex, newIndex);
      }
    }
  };

  // Prefetch page data on hover (after 200ms delay)
  const handlePageHover = (pageId: string) => {
    // Don't prefetch current page (already loaded)
    if (pageId === currentPageId) return;

    // Clear any existing timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    // Set new timer to prefetch after 200ms
    hoverTimerRef.current = setTimeout(() => {
      prefetchPage(pageId);
    }, 200);
  };

  const handlePageLeave = () => {
    // Clear timer if user leaves before delay completes
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Don't render if no pages
  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <div className="page-tabs-container flex items-center gap-1 border-b bg-muted/50 px-2 py-1">
      {/* Page tabs with drag-and-drop */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((p) => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            {pages.map((page) => (
              <SortablePageTab
                key={page.id}
                page={page}
                isActive={page.id === currentPageId}
                isEditing={editingPageId === page.id}
                editingName={editingName}
                canDelete={pages.length > 1}
                onEdit={() => startEditing(page.id, page.name)}
                onSave={saveEdit}
                onCancel={cancelEdit}
                onNameChange={setEditingName}
                onSelect={() => setCurrentPage(page.id)}
                onDelete={(e) => handleRemovePage(page.id, e)}
                onDuplicate={() => handleDuplicatePage(page.id)}
                onHover={() => handlePageHover(page.id)}
                onLeave={handlePageLeave}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add page button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddPage}
        className="flex-shrink-0"
      >
        <Plus size={16} />
      </Button>

      {/* View all menu (when many pages) */}
      {pages.length > 5 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {pages.map((page) => (
              <DropdownMenuItem
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
              >
                {page.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
