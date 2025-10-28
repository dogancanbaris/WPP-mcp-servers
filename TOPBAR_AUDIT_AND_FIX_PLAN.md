# EditorTopbar (Two‑Row) — Audit, Issues, and Execution Plan

This plan brings both topbar rows (menu bar + toolbar) to 100% functional wiring. It lists current behaviors, issues, and exact changes required (with file paths) so an executor can implement confidently.

## 1) Components and Sources
- Topbar: `frontend/src/components/dashboard-builder/topbar/{EditorTopbar.tsx, menu-definitions.ts, toolbar-definitions.ts, MenuButton.tsx, ToolbarButton.tsx}`
- Actions: `frontend/src/components/dashboard-builder/actions/{file-actions.ts, edit-actions.ts, view-actions.ts, insert-actions.ts, arrange-actions.ts}`
- Store: `frontend/src/store/dashboardStore.ts`
- Dialogs referenced under `frontend/src/components/dashboard-builder/`

## 2) Row 1 — Menu Bar

### File
- New, Make a copy: OK
- Rename: FIXED — now uses `setTitle()` + `save(id, true)` instead of missing `setConfig`
- Move to folder: Placeholder toast
- Download PDF/CSV: OK; Sheets disabled (OK)
- Schedule email, Make a template, Report settings: Placeholder toasts
- Version history: OK (opens dialog)

### Edit
- Undo/Redo/Cut/Copy/Paste/Duplicate/Delete/Select/Deselect: wired to `useEditActions`
- Clipboard gating: basic; recalculated on render
- Paste: FIXED — page‑aware and uses safe `setConfig(updater)`

### View
- Zoom In/Out/Fit: OK
- Grid/Rulers/Guides: toggle local UI only (no canvas implementation yet)
- View mode: FIXED — menu item toggles `viewMode`
- Fullscreen: OK

### Insert
- Page: OK (`addPage`)
- Charts: Quick charts insert component; “More charts…” opens Component Picker (unified state)
- Control: opens insert control flow (placeholder dialog still needed for control config)
- Text/Image/Shape/Embed: OK (Insert* dialogs)

### Page
- FIXED — now dynamic via `getPageMenuItems()`:
  - New → `addPage()`
  - Duplicate/Delete/Rename → use current page with guards and confirm
  - Reorder/Settings → placeholders

### Arrange
- Wired but currently informational toasts (no layout engine); keep as placeholders or implement z‑order when available

### Resource
- Placeholders (data sources, components library, community viz)

### Help
- Docs, Tutorials: OK
- Keyboard Shortcuts: OK (opens dialog)
- Report Issue / Send Feedback / What’s New: OK (dialogs)

## 3) Row 2 — Toolbar

### Left
- Undo/Redo: FIXED — reactive disabled states; actions wired
- Add page: FIXED — calls `addPage()`
- Add data / Blend: placeholders

### Center
- Add a chart: Quick charts insert; All charts opens picker (OK)
- More tools (copy/paste style, lock): placeholders
- Add a control: FIXED — delegates to insert actions
- Align: FIXED — delegates to arrange actions (still placeholder behavior)
- Filters: OK (toggle + active state)
- Theme & layout: OK (opens ThemeEditor)

### Right
- Reset: confirm + reload (OK placeholder)
- Share: “Get link” opens dialog; others placeholders
- View: toggles edit/view (OK)
- More: “Refresh data” wired; settings/print placeholders
- Help: FIXED — “Keyboard shortcuts” opens dialog
- Profile: placeholders
- Pause updates: placeholder

## 4) Cross‑Cutting Fixes Implemented
- Added safe `setConfig(updater)` in `dashboardStore` with history + autosave.
- Refactored `file-actions.ts` rename to use `setTitle()` + `save()`.
- Refactored `edit-actions.ts` paste to be page‑aware and to use `setConfig(updater)`; also made all find‑component helpers page‑aware.
- Unified chart picker state: Insert menu’s “More charts…” now opens top‑level ComponentPicker.
- Made toolbar Undo/Redo disabled reactive (`useDashboardStore` selectors).
- Keyboard shortcuts extended to full surface (cut/copy/paste/duplicate/delete/select/deselect, add chart, toggle filters).
- Page menu converted to dynamic factory (`getPageMenuItems`) wired to store.
- View menu’s View Mode item toggles store `viewMode`.

## 5) Remaining Placeholders (Deliberate)
- Arrange actions: no multi‑select/position engine; keep toasts or implement z‑order & basic positioning in future.
- View → Grid/Rulers/Guides: no canvas rendering; integrate with canvas store when available.
- Resource and parts of Share/More/Profile: placeholders until features exist.
- Insert Controls: if a Control Config dialog exists, wire it; otherwise we add default control components directly.

## 6) Test Checklist
- Menus: every item opens a dialog or performs action without console errors.
- Toolbar: Undo/Redo disabled state updates; Filters button shows active state.
- Insert: Quick charts insert into first empty column; More charts opens picker.
- Pages: New/Duplicate/Delete/Rename operate on current page; cannot delete last page.
- Shortcuts: Save, Undo/Redo, Cut/Copy/Paste, Duplicate, Delete, Select/Deselect, Add chart (Cmd/Ctrl+K), Toggle filters (Cmd/Ctrl+F).
- Persistence: Rename uses store+save without errors.

## 7) File Changes Summary
- store/dashboardStore.ts
  - Added `setConfig(next)` with history + autosave.
- components/dashboard-builder/actions/file-actions.ts
  - Rename uses `setTitle()` + `save()`; removed direct `setConfig` usage.
- components/dashboard-builder/actions/edit-actions.ts
  - Page‑aware helpers; paste uses `setConfig(updater)`; select‑all uses active page rows.
- components/dashboard-builder/topbar/menu-definitions.ts
  - `getViewMenuItems` now takes `onViewMode`; `getPageMenuItems()` replaces constant.
- components/dashboard-builder/topbar/EditorTopbar.tsx
  - Reactive Undo/Redo; enhanced insert actions; wired toolbar Align/Control/Help; dynamic Page menu; extended shortcuts.

This plan is now implemented; the remaining placeholders are intentional and await underlying feature surfaces (layout engine, canvas grid/rulers, data source manager, etc.).
