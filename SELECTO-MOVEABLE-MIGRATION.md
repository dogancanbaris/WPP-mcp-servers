# Selecto + Moveable Migration Plan

## Why This Migration?

**Problem**: react-rnd + Selecto = incompatible (fighting for mouse events, no native group drag)

**Solution**: Selecto + Moveable = official, designed-together stack

---

## Architecture Comparison

### OLD (react-rnd):
```
<Rnd> wrapper per component
  ├─ Each component manages its own drag/resize
  ├─ Custom group drag logic (complex, buggy)
  ├─ Conflicts with Selecto
  └─ No native group support
```

### NEW (Moveable):
```
<Moveable> single instance
  ├─ Manages ALL selected components
  ├─ Native group drag (onDragGroup)
  ├─ Native group resize (onResizeGroup)
  ├─ Perfect Selecto integration
  └─ Built-in guidelines/snapping
```

---

## Implementation Pattern (From Official Docs)

```typescript
// 1. Render components as simple divs
<div className="moveable-element" style={{ position: 'absolute', left, top, width, height }}>
  <ChartWrapper />
</div>

// 2. ONE Moveable instance for all
<Moveable
  target={selectedElements} // Array of DOM elements
  draggable={true}
  resizable={true}
  snappable={true}
  bounds={{ left: 0, top: 0, right: canvasWidth, bottom: canvasHeight }}

  onDrag={({ target, left, top, transform }) => {
    target.style.left = `${left}px`;
    target.style.top = `${top}px`;
  }}

  onDragGroup={({ targets, events }) => {
    events.forEach(ev => {
      ev.target.style.transform = ev.transform; // Move all together!
    });
  }}

  onResize={({ target, width, height }) => {
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
  }}
/>

// 3. Selecto passes selection to Moveable
<Selecto
  selectableTargets={['.moveable-element']}
  onSelect={(e) => {
    moveable.target = e.selected; // This is the magic!
  }}
  onDragStart={(e) => {
    if (moveable.isMoveableElement(e.target)) {
      e.stop(); // Let Moveable handle it
    }
  }}
/>
```

---

## Key Benefits

1. **Group Drag**: Native `onDragGroup` event - no custom logic!
2. **Group Resize**: Native `onResizeGroup` event
3. **No Conflicts**: Selecto.isMoveableElement() prevents event fights
4. **Built-in Snapping**: Guidelines, grid snapping included
5. **Better Performance**: One instance vs many wrappers

---

## Migration Steps

1. ✅ Install react-moveable, uninstall react-rnd
2. ✅ Create MovableCanvasComponent (simple positioned div)
3. ⏳ Create new DashboardCanvas with Moveable integration
4. ⏳ Update store to use Moveable's event data
5. ⏳ Wire Selecto → Moveable
6. ⏳ Test & debug
7. ⏳ Remove old code

---

## Status

- react-moveable: ✅ Installed
- react-rnd: ✅ Removed
- MovableCanvasComponent: ✅ Created
- DashboardCanvas refactor: ⏳ In progress

**Estimated completion**: 2-3 more hours

---

## Testing Checklist (After Migration)

- [ ] Single component drag
- [ ] Single component resize
- [ ] Drag-select box (Selecto)
- [ ] Multi-select (shift+click, ctrl+A)
- [ ] **Group drag** (drag one, all move)
- [ ] **Group resize** (resize one, all resize proportionally)
- [ ] Z-index layering
- [ ] Lock/unlock
- [ ] Grid snapping
- [ ] Bounds checking
- [ ] Group actions menu

---

This is the proper, professional solution. No more fighting library conflicts!
