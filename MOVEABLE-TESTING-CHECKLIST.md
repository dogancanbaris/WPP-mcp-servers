# Moveable.js Migration - Testing Checklist

**Purpose:** Verify all features work correctly after migration
**Expected Time:** 15-20 minutes

---

## 🧪 Pre-Flight Checks

Before testing, verify in browser DevTools:

### Console Checks
```javascript
// Should see these on page load:
[Moveable] Canvas mode - components: N
[Moveable] Targets updated: 0 elements
```

### DOM Checks
```javascript
// All components should have:
document.querySelectorAll('.moveable-element').length // Should match component count
document.querySelectorAll('[data-canvas-id]').length // Should match component count
```

### React DevTools
- [ ] DashboardCanvas component renders
- [ ] Moveable component renders (when selection exists)
- [ ] Selecto component renders
- [ ] MovableCanvasComponent renders for each component

---

## ✅ Test 1: Single Component Operations

### 1.1 Click to Select
**Steps:**
1. Click any component
2. Check border changes to blue/primary color
3. Check resize handles appear (8 small squares)

**Console Output:**
```
[Canvas] Select component: component-123
[Moveable] Targets updated: 1 elements
```

**Expected:**
- ✅ Blue border around component
- ✅ 8 resize handles visible
- ✅ Settings menu appears on hover
- ✅ Component ID in selectedComponentIds Set

### 1.2 Single Drag
**Steps:**
1. Select component
2. Click and drag component
3. Move 100px to the right
4. Release mouse

**Console Output:**
```
[Moveable] onDrag - Updating DOM
  - Target: component-123
  - Position: { left: 200, top: 100 }
[Moveable] onDrag - Updating DOM
  - Target: component-123
  - Position: { left: 220, top: 100 }
... (many times)
[Moveable] onDragEnd - Updating store
  - Canvas ID: component-123
  - Final position: { left: 300, top: 100 }
```

**Expected:**
- ✅ Component moves smoothly
- ✅ Snaps to 20px grid
- ✅ Alignment guides appear (purple lines)
- ✅ Position updates in store after drag ends
- ✅ Stays within canvas bounds

### 1.3 Single Resize
**Steps:**
1. Select component
2. Drag bottom-right resize handle
3. Make component larger
4. Release mouse

**Console Output:**
```
[Moveable] onResize - Updating DOM
  - Target: component-123
  - Size: { width: 320, height: 240 }
... (many times)
[Moveable] onResizeEnd - Updating store
  - Canvas ID: component-123
  - Final size: { width: 400, height: 300 }
  - Final position: { left: 100, top: 100 }
```

**Expected:**
- ✅ Component resizes smoothly
- ✅ Snaps to 20px grid
- ✅ Alignment guides appear
- ✅ Size updates in store after resize ends
- ✅ Content scales appropriately

---

## ✅ Test 2: Multi-Select Operations

### 2.1 Shift+Click Selection
**Steps:**
1. Click component A
2. Hold Shift, click component B
3. Hold Shift, click component C

**Console Output:**
```
[Canvas] Select component: component-A Shift: false
[Moveable] Targets updated: 1 elements
[Canvas] Select component: component-B Shift: true
[Moveable] Targets updated: 2 elements
[Canvas] Select component: component-C Shift: true
[Moveable] Targets updated: 3 elements
```

**Expected:**
- ✅ All 3 components have blue borders
- ✅ Badge shows "3 selected"
- ✅ Resize handles appear (combined bounds)
- ✅ selectedComponentIds.size === 3

### 2.2 Rectangle Selection (Selecto)
**Steps:**
1. Click empty canvas area
2. Drag to create rectangle over 2+ components
3. Release mouse

**Console Output:**
```
[Selecto] onDragStart triggered
  - PROCEEDING - Selecto will handle selection
[Selecto] onSelect event
  - Selected DOM elements: 3
  - Canvas IDs extracted: [...3 IDs...]
  - Calling selectMultiple with 3 IDs
[Moveable] Targets updated: 3 elements
```

**Expected:**
- ✅ Blue selection rectangle appears while dragging
- ✅ All intersected components selected
- ✅ Badge shows count
- ✅ No conflict with Moveable

### 2.3 Ctrl+A (Select All)
**Steps:**
1. Press Ctrl+A (or Cmd+A on Mac)

**Console Output:**
```
[Moveable] Ctrl+A - Selecting all: N
[Moveable] Targets updated: N elements
```

**Expected:**
- ✅ All components selected
- ✅ Badge shows total count
- ✅ Combined resize handles appear

---

## ✅ Test 3: Group Operations (NEW!)

### 3.1 Group Drag
**Steps:**
1. Select 3 components (Ctrl+A or rectangle)
2. Click and drag any selected component
3. Move 50px down
4. Release mouse

**Console Output:**
```
[Moveable] onDragGroup - Group drag
  - Components: 3
  - Component 0: left=100, top=200
  - Component 1: left=150, top=250
  - Component 2: left=200, top=300
... (many times)
[Moveable] onDragGroupEnd - Updating store for group
  - Components: 3
  - Component 0 (component-A): left=100, top=250
  - Component 1 (component-B): left=150, top=300
  - Component 2 (component-C): left=200, top=350
```

**Expected:**
- ✅ All 3 components move together
- ✅ Maintain relative positions
- ✅ Snap to 20px grid together
- ✅ Alignment guides for all active components
- ✅ Store updates for all 3 after drag ends
- ✅ Smooth animation during drag

### 3.2 Group Resize
**Steps:**
1. Select 3 components
2. Drag bottom-right resize handle
3. Make all components larger
4. Release mouse

**Console Output:**
```
[Moveable] onResizeGroup - Group resize
  - Components: 3
  - Component 0: width=400, height=300
  - Component 1: width=400, height=300
  - Component 2: width=400, height=300
... (many times)
[Moveable] onResizeGroupEnd - Updating store for group
  - Components: 3
  - Component 0 (component-A): size=400x300, pos=100,100
  - Component 1 (component-B): size=400x300, pos=150,150
  - Component 2 (component-C): size=400x300, pos=200,200
```

**Expected:**
- ✅ All 3 components resize together
- ✅ Proportional scaling
- ✅ Snap to 20px grid
- ✅ Alignment guides for all
- ✅ Store updates for all 3 after resize ends
- ✅ Content scales in all components

---

## ✅ Test 4: Keyboard Shortcuts

### 4.1 ESC (Deselect All)
**Steps:**
1. Select 3 components
2. Press ESC

**Console Output:**
```
[Moveable] ESC - Deselecting all
[Moveable] Targets updated: 0 elements
```

**Expected:**
- ✅ All components deselected
- ✅ No blue borders
- ✅ No resize handles
- ✅ selectedComponentIds.size === 0

### 4.2 Delete (Remove Selected)
**Steps:**
1. Select 2 components (ensure NOT locked)
2. Press Delete or Backspace

**Console Output:**
```
[Moveable] Delete - Removing 2 components
```

**Expected:**
- ✅ Both components removed from canvas
- ✅ Store updated
- ✅ Auto-save triggered

### 4.3 Delete with Locked Component
**Steps:**
1. Lock component A
2. Select components A and B
3. Press Delete

**Expected:**
- ✅ Component B removed
- ✅ Component A stays (locked)
- ✅ No error in console

---

## ✅ Test 5: Edge Cases

### 5.1 Click on Moveable Element (Conflict Prevention)
**Steps:**
1. Select component A
2. Click on component A again (NOT empty canvas)
3. Try to drag

**Console Output:**
```
[Selecto] onDragStart triggered
  - STOPPED - Moveable element clicked (let Moveable handle it)
```

**Expected:**
- ✅ Selecto stops (e.stop() called)
- ✅ Moveable handles the drag
- ✅ No conflict/race condition
- ✅ Component drags smoothly

### 5.2 Locked Component
**Steps:**
1. Lock component A
2. Try to drag component A
3. Try to resize component A

**Expected:**
- ✅ Component doesn't move
- ✅ Component doesn't resize
- ✅ Lock indicator visible (yellow badge)
- ✅ No store updates

### 5.3 Canvas Bounds
**Steps:**
1. Select component near edge
2. Try to drag outside canvas bounds

**Expected:**
- ✅ Component stops at canvas edge
- ✅ Doesn't go outside bounds
- ✅ Bounds: left=0, top=0, right=canvasWidth, bottom=canvasHeight

### 5.4 Auto-Convert Rows to Canvas
**Steps:**
1. Open dashboard with row/column layout
2. Wait for auto-conversion

**Console Output:**
```
[Moveable] Auto-converting rows to canvas mode
[Moveable] Rows count: 3
[Moveable] Canvas mode - components: 5
```

**Expected:**
- ✅ Rows converted to absolute positions
- ✅ Components maintain visual positions
- ✅ Canvas mode active

### 5.5 Empty State
**Steps:**
1. Remove all components from canvas
2. Check empty state message

**Expected:**
- ✅ Empty state message appears
- ✅ "Start building your dashboard" text visible
- ✅ Plus icon visible
- ✅ Tip about 20px grid visible

---

## ✅ Test 6: Alignment Guides (Enhanced)

### 6.1 Single Component Alignment
**Steps:**
1. Select and drag component A
2. Move near component B's edge

**Expected:**
- ✅ Purple line appears when edges align
- ✅ Purple line appears when centers align
- ✅ Pink dashed line for width/height matches
- ✅ Label shows dimension (e.g., "300px")

### 6.2 Multi-Select Alignment (NEW!)
**Steps:**
1. Select 3 components
2. Group drag near another component

**Console Output:**
```
[Moveable] onDragGroup - Group drag
  - Components: 3
(alignment guides update for all 3 active components)
```

**Expected:**
- ✅ Alignment guides for all 3 dragged components
- ✅ Guides to all other (non-selected) components
- ✅ Labels show dimensions
- ✅ Max 10 guides shown (prevent clutter)

---

## ✅ Test 7: Performance

### 7.1 Many Components (50+)
**Steps:**
1. Add 50 components to canvas
2. Select all (Ctrl+A)
3. Group drag
4. Check performance

**Expected:**
- ✅ Smooth drag (no lag)
- ✅ Single Moveable instance (check React DevTools)
- ✅ Console logs don't flood excessively
- ✅ Frame rate stays high (60 FPS)

### 7.2 Rapid Selection Changes
**Steps:**
1. Click component A
2. Immediately click component B
3. Immediately Ctrl+A
4. Immediately ESC
5. Repeat 10 times quickly

**Expected:**
- ✅ No console errors
- ✅ Selection state always accurate
- ✅ No memory leaks
- ✅ Smooth UI updates

---

## 🐛 Common Issues & Fixes

### Issue: Components not selectable
**Symptoms:** Click component, nothing happens
**Fix:** Check `.moveable-element` class and `data-canvas-id` attribute

### Issue: Group drag not working
**Symptoms:** Drag one, others don't move
**Fix:** Verify targets array includes all selected DOM elements

### Issue: Selecto and Moveable conflict
**Symptoms:** Selection rectangle appears when dragging component
**Fix:** Check isMoveableElement() in Selecto onDragStart

### Issue: Store not updating
**Symptoms:** Drag works, but position lost on reload
**Fix:** Verify onDragEnd/onDragGroupEnd calls store actions

### Issue: Alignment guides not showing
**Symptoms:** Drag component, no purple lines
**Fix:** Check activeCanvasComponents state updates in drag handlers

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Single Operations:
[ ] Click to select
[ ] Single drag
[ ] Single resize

Multi-Select:
[ ] Shift+click
[ ] Rectangle selection (Selecto)
[ ] Ctrl+A

Group Operations:
[ ] Group drag (NEW!)
[ ] Group resize (NEW!)

Keyboard Shortcuts:
[ ] ESC (deselect)
[ ] Delete (remove)

Edge Cases:
[ ] Conflict prevention
[ ] Locked components
[ ] Canvas bounds
[ ] Auto-convert
[ ] Empty state

Alignment Guides:
[ ] Single component
[ ] Multi-select (NEW!)

Performance:
[ ] 50+ components
[ ] Rapid selection

Overall: [ ] PASS  [ ] FAIL

Notes:
_______________________
_______________________
```

---

## ✅ Success Criteria

All tests should pass:
- ✅ Single drag/resize works
- ✅ Multi-select works (Shift+click, rectangle)
- ✅ **Group drag works** (NEW - primary requirement!)
- ✅ **Group resize works** (NEW - primary requirement!)
- ✅ No Selecto/Moveable conflicts
- ✅ Keyboard shortcuts work
- ✅ Alignment guides show for multi-select
- ✅ Performance acceptable (50+ components)
- ✅ No console errors

**If all pass:** ✅ Migration successful, ready for production

**If any fail:** 🐛 Check console logs, verify DOM structure, review event handlers

---

**Happy Testing!** 🚀
