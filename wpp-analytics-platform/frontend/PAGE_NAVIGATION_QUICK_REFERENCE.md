# Page Navigation Quick Reference

## Using Pages in Your Code

### Get Current Page Data
```typescript
import { useCurrentPage, useCurrentPageId, usePages } from '@/store/dashboardStore';

// Get the full current page object
const currentPage = useCurrentPage();

// Get just the current page ID
const currentPageId = useCurrentPageId();

// Get all pages
const pages = usePages();
```

### Access Current Page's Rows
```typescript
const currentPage = useCurrentPage();
const rows = currentPage?.rows || [];

// Iterate over rows
rows.map((row) => (
  <Row key={row.id} {...row} />
));
```

### Page Actions
```typescript
import { useDashboardStore } from '@/store/dashboardStore';

const {
  addPage,
  removePage,
  updatePage,
  duplicatePage,
  setCurrentPage,
  reorderPages
} = useDashboardStore();

// Add a new page
addPage('My New Page');

// Switch to a page
setCurrentPage(pageId);

// Update page name
updatePage(pageId, { name: 'New Name' });

// Duplicate a page
duplicatePage(pageId);

// Remove a page (protects last page)
removePage(pageId);

// Reorder pages
reorderPages(oldIndex, newIndex);
```

### Row Actions (Auto-targets Current Page)
```typescript
const { addRow, removeRow, reorderRows, updateRowHeight } = useDashboardStore();

// All row actions automatically work with the current page
addRow(['1/2', '1/2']); // Adds to current page
removeRow(rowId); // Removes from current page
reorderRows(0, 1); // Reorders in current page
updateRowHeight(rowId, 400); // Updates in current page
```

### Component Actions (Auto-targets Current Page)
```typescript
const { addComponent, removeComponent, updateComponent } = useDashboardStore();

// All component actions automatically work with the current page
addComponent(columnId, 'bar_chart'); // Adds to current page
removeComponent(componentId); // Removes from current page
updateComponent(componentId, { title: 'New Title' }); // Updates in current page
```

## URL Deep Linking

### Link to Specific Page
```typescript
// Navigate to a specific page
router.push(`/dashboard/${dashboardId}/builder?page=${pageId}`);

// Or use an anchor tag
<a href={`/dashboard/${dashboardId}/builder?page=${pageId}`}>
  View Page
</a>
```

### Get Page from URL
```typescript
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const pageIdFromUrl = searchParams.get('page');
```

## Common Patterns

### Render Content Only for Current Page
```typescript
const currentPage = useCurrentPage();

if (!currentPage) {
  return <div>No page selected</div>;
}

return (
  <div>
    <h1>{currentPage.name}</h1>
    {currentPage.rows.map((row) => (
      <Row key={row.id} {...row} />
    ))}
  </div>
);
```

### Check if Page Exists
```typescript
const pages = usePages();
const pageExists = pages?.some(p => p.id === pageId);

if (!pageExists) {
  // Handle missing page
}
```

### Get Page by ID
```typescript
const pages = usePages();
const page = pages?.find(p => p.id === pageId);
```

### Iterate Over All Pages
```typescript
const pages = usePages();

pages?.map((page) => (
  <PageTab key={page.id} page={page} />
));
```

## Backwards Compatibility

All row/component actions automatically handle both page-based and legacy structures:

```typescript
// This code works for both:
// 1. New: config.pages[currentPageId].rows
// 2. Legacy: config.rows

const { addRow } = useDashboardStore();
addRow(['1/1']); // Automatically detects structure
```

## Component Example: Custom Page Selector

```typescript
'use client';

import { usePages, useCurrentPageId, useDashboardStore } from '@/store/dashboardStore';

export function PageSelector() {
  const pages = usePages();
  const currentPageId = useCurrentPageId();
  const { setCurrentPage } = useDashboardStore();

  if (!pages) return null;

  return (
    <select 
      value={currentPageId || ''} 
      onChange={(e) => setCurrentPage(e.target.value)}
    >
      {pages.map((page) => (
        <option key={page.id} value={page.id}>
          {page.name}
        </option>
      ))}
    </select>
  );
}
```

## Type Definitions

```typescript
interface PageConfig {
  id: string;
  name: string;
  order: number;
  rows: RowConfig[];
  filters?: FilterConfig[];
  dateRange?: DateRangeConfig;
  pageStyles?: PageStyles;
  createdAt?: string;
  updatedAt?: string;
}

interface PageStyles {
  backgroundColor?: string;
  padding?: number;
  gap?: number;
}
```

## Keyboard Shortcuts

- `Ctrl+Shift+P` - Add new page (via Insert menu)

## Best Practices

1. **Always check for page existence** before accessing page data
2. **Use hooks instead of direct store access** for better performance
3. **Handle URL parameters** for deep linking support
4. **Validate page operations** (e.g., don't allow removing last page)
5. **Provide user feedback** with toast notifications
6. **Implement confirmation dialogs** for destructive actions

## Common Gotchas

1. **Page ID vs Index**: Always use page ID, not array index
2. **Legacy Support**: Some actions still fall back to config.rows
3. **Current Page State**: Set on mount from URL or defaults to first page
4. **Store Updates**: Always use store actions, never mutate config directly

## Testing

```typescript
// Test page creation
it('should create a new page', () => {
  const { addPage } = useDashboardStore.getState();
  addPage('Test Page');
  
  const pages = useDashboardStore.getState().config.pages;
  expect(pages).toHaveLength(1);
  expect(pages[0].name).toBe('Test Page');
});

// Test page navigation
it('should switch pages', () => {
  const { setCurrentPage } = useDashboardStore.getState();
  setCurrentPage(pageId);
  
  const currentPageId = useDashboardStore.getState().currentPageId;
  expect(currentPageId).toBe(pageId);
});
```

## Migration from Legacy Structure

If you have existing code using `config.rows`:

### Before (Legacy)
```typescript
const { config } = useDashboardStore();
const rows = config.rows;
```

### After (Page-based)
```typescript
const currentPage = useCurrentPage();
const rows = currentPage?.rows || [];
```

The store actions handle this automatically, but for UI code, use the page-based approach.

