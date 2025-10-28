# Insert Control Dialog - Integration Guide

## Overview
This guide shows how to integrate the new InsertControlDialog component into EditorTopbar.tsx.

## Files Modified
1. ✅ **Created**: `src/components/dashboard-builder/dialogs/InsertControlDialog.tsx`
2. ✅ **Updated**: `src/components/dashboard-builder/actions/insert-actions.ts`
3. ⚠️ **Needs Update**: `src/components/dashboard-builder/topbar/EditorTopbar.tsx`

---

## Step 1: Import the Dialog

Add this import at the top of `EditorTopbar.tsx`:

```typescript
import { InsertControlDialog } from '../dialogs/InsertControlDialog';
```

**Location**: After line 31 (after ShareDialog import)

---

## Step 2: Add Dialog to JSX

Add the dialog component in the "Dialogs" section (around line 489, after ShareDialog):

```tsx
<InsertControlDialog
  open={insertActions.controlDialogState.open}
  controlType={insertActions.controlDialogState.controlType}
  onClose={() => insertActions.setControlDialogState({ open: false, controlType: '' })}
  onInsert={insertActions.handleControlInsert}
/>
```

**Full Dialogs Section** should look like:

```tsx
{/* Dialogs */}
<NewDashboardDialog
  open={isNewDashboardOpen}
  onClose={() => setIsNewDashboardOpen(false)}
/>

<VersionHistory
  dashboardId={dashboardId}
  open={isVersionHistoryOpen}
  onOpenChange={setIsVersionHistoryOpen}
/>

{isThemeEditorOpen && (
  <ThemeEditor onClose={() => setIsThemeEditorOpen(false)} />
)}

<LayoutPicker
  open={isLayoutPickerOpen}
  onClose={() => setIsLayoutPickerOpen(false)}
  onSelect={handleAddRow}
/>

<ComponentPicker
  open={isComponentPickerOpen}
  onClose={() => setIsComponentPickerOpen(false)}
  onSelect={handleAddComponent}
/>

<ShareDialog
  open={isShareDialogOpen}
  onClose={() => setIsShareDialogOpen(false)}
  dashboardId={dashboardId}
  dashboardTitle={config.title}
/>

{/* NEW: Insert Control Dialog */}
<InsertControlDialog
  open={insertActions.controlDialogState.open}
  controlType={insertActions.controlDialogState.controlType}
  onClose={() => insertActions.setControlDialogState({ open: false, controlType: '' })}
  onInsert={insertActions.handleControlInsert}
/>

<KeyboardShortcutsDialog
  open={isKeyboardShortcutsOpen}
  onOpenChange={setIsKeyboardShortcutsOpen}
/>
```

---

## Step 3: Test the Integration

### How to Test:

1. **Start the dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open dashboard builder**:
   - Navigate to any dashboard in edit mode
   - Go to Insert menu → Control submenu

3. **Test each control type**:
   - Click "Date Range Control"
   - Click "Dropdown Control"
   - Click "List Control"
   - Click "Input Box Control"
   - Click "Checkbox Control"
   - Click "Slider Control"

4. **Verify functionality**:
   - ✅ Dialog opens with correct tab selected
   - ✅ Configuration options work
   - ✅ Preview updates in real-time
   - ✅ Insert button adds control to dashboard
   - ✅ Toast notification shows success
   - ✅ Dialog closes after insert

---

## Control Type Mappings

The dialog maps internal control types to dashboard ComponentTypes:

| Dialog Type    | ComponentType         | Description                        |
|----------------|-----------------------|------------------------------------|
| `date_filter`  | `date_range_filter`   | Date range picker with presets     |
| `dropdown`     | `dropdown_filter`     | Single/multi-select dropdown       |
| `list`         | `list_filter`         | Fixed-size scrollable list         |
| `input_box`    | `input_box_filter`    | Text/number/email/url input        |
| `checkbox`     | `checkbox_filter`     | Single checkbox with label         |
| `slider`       | `slider_filter`       | Numeric range slider               |

---

## Features Implemented

### 1. **Date Range Control**
- Default range selection (Last 7/30/90 days, This month, Custom, All time)
- Date format options (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Allow custom date selection toggle
- Show preset options toggle
- Live preview of selected range

### 2. **Dropdown Control**
- Add/remove options with + button
- Default selection from options
- Multi-select toggle
- Search enabled toggle
- Placeholder text configuration
- Live preview

### 3. **Fixed-Size List Control**
- Add/remove list items
- Max height configuration (px)
- Allow search toggle
- Show checkboxes toggle
- Live preview with scrolling

### 4. **Input Box Control**
- Placeholder text
- Default value
- Input type (text, number, email, url)
- Validation pattern (regex)
- Live preview with type indicator

### 5. **Checkbox Control**
- Label text
- Default checked state
- Optional help text
- Live preview

### 6. **Slider Control**
- Min/max value configuration
- Step value
- Default value
- Unit label (%, $, px, etc.)
- Show value label toggle
- Live preview with current value

---

## Architecture Notes

### State Management
- Dialog state managed in `useInsertActions()` hook
- Persistent state for each control type
- Automatic cleanup on close

### Component Insertion
- Finds first empty column in dashboard
- Falls back to first column of first row if no empty columns
- Shows error if no rows exist
- Integrates with Zustand store for undo/redo

### Type Safety
- Full TypeScript support
- Proper type definitions for all control configs
- Type-safe mappings to ComponentType

---

## Troubleshooting

### Issue: Dialog doesn't open
**Solution**: Check that `insertActions.onInsertControl('date_filter')` is called from menu

### Issue: Control not added to dashboard
**Solution**: Ensure at least one row exists. Add a row first if needed.

### Issue: Toast notification not showing
**Solution**: Verify `sonner` is properly configured in layout.tsx

### Issue: TypeScript errors
**Solution**: Run `npm run type-check` to identify missing type definitions

---

## Future Enhancements

1. **Control Templates**: Save and reuse control configurations
2. **Advanced Filters**: Complex filter logic with AND/OR operators
3. **Control Groups**: Organize related controls together
4. **Conditional Display**: Show/hide controls based on other values
5. **Global Filters**: Apply control values across all charts
6. **URL Parameters**: Sync control values with URL query params

---

## Support

For issues or questions:
1. Check existing control implementations in `/src/components/dashboard-builder/controls/`
2. Review ComponentPicker.tsx for similar dialog patterns
3. Reference this guide for integration steps
4. Test in development environment before production deployment

---

**Status**: ✅ Ready for Integration
**Last Updated**: 2025-10-26
**Version**: 1.0.0
