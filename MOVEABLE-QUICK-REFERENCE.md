# Moveable.js - Quick Reference Card

**For developers working with the dashboard canvas**

---

## 🏗️ Architecture (One-Minute Overview)

```
Components = Simple positioned divs (.moveable-element)
    ↓
Selection = DOM element array (targets)
    ↓
ONE Moveable instance = Manages ALL selected
    ↓
Events = Update DOM first, then store
```

**Key Pattern:** DOM-first updates (smooth visuals) → Store updates (persistence)

---

## 📦 Component Structure

### Component Rendering
```tsx
{canvasComponents.map(comp => (
  <div
    className="moveable-element"      // Required: Selecto target
    data-canvas-id={comp.id}           // Required: ID for store updates
    style={{
      position: 'absolute',            // Required: Absolute positioning
      left: `${comp.x}px`,
      top: `${comp.y}px`,
      width: `${comp.width}px`,
      height: `${comp.height}px`,
      zIndex: comp.zIndex || 0,
    }}
  >
    <YourContent />
  </div>
))}
```

**Critical:**
- ✅ `className="moveable-element"` - Selecto targeting
- ✅ `data-canvas-id={comp.id}` - Store updates
- ✅ Absolute positioning with px units

---

## 🎯 Moveable Instance

### Basic Setup
```tsx
const moveableRef = useRef<Moveable>(null);
const [targets, setTargets] = useState<Array<HTMLElement>>([]);

// Sync targets with selection
useEffect(() => {
  const elements = [];
  selectedComponentIds.forEach(id => {
    const el = canvasRef.current.querySelector(`[data-canvas-id="${id}"]`);
    if (el) elements.push(el);
  });
  setTargets(elements);
}, [selectedComponentIds]);

// Render
<Moveable
  ref={moveableRef}
  target={targets}
  draggable={true}
  resizable={true}
  // ... config ...
  onDrag={handleDrag}
  onDragEnd={handleDragEnd}
  onDragGroup={handleDragGroup}
  onDragGroupEnd={handleDragGroupEnd}
/>
```

---

## 🔄 Event Handlers

### Single Drag
```tsx
const handleDrag = useCallback(({ target, left, top }) => {
  // Update DOM (many times during drag)
  target.style.left = `${left}px`;
  target.style.top = `${top}px`;
}, []);

const handleDragEnd = useCallback(({ target }) => {
  // Update store (once after drag ends)
  const id = target.getAttribute('data-canvas-id');
  const left = parseFloat(target.style.left) || 0;
  const top = parseFloat(target.style.top) || 0;
  moveComponentAbsolute(id, left, top);
}, [moveComponentAbsolute]);
```

### Group Drag (NEW!)
```tsx
const handleDragGroup = useCallback(({ events }) => {
  // Update DOM for all (many times during drag)
  events.forEach(ev => {
    ev.target.style.transform = ev.transform;
  });
}, []);

const handleDragGroupEnd = useCallback(({ events }) => {
  // Update store for all (once after drag ends)
  events.forEach(ev => {
    const id = ev.target.getAttribute('data-canvas-id');
    moveComponentAbsolute(id, ev.left, ev.top);
  });
}, [moveComponentAbsolute]);
```

### Single Resize
```tsx
const handleResize = useCallback(({ target, width, height, drag }) => {
  // Update DOM (many times during resize)
  target.style.width = `${width}px`;
  target.style.height = `${height}px`;
  target.style.transform = drag.transform;
}, []);

const handleResizeEnd = useCallback(({ target, width, height, drag }) => {
  // Update store (once after resize ends)
  const id = target.getAttribute('data-canvas-id');
  resizeComponent(id, width, height, drag.left, drag.top);
}, [resizeComponent]);
```

### Group Resize (NEW!)
```tsx
const handleResizeGroup = useCallback(({ events }) => {
  // Update DOM for all
  events.forEach(ev => {
    ev.target.style.width = `${ev.width}px`;
    ev.target.style.height = `${ev.height}px`;
    ev.target.style.transform = ev.drag.transform;
  });
}, []);

const handleResizeGroupEnd = useCallback(({ events }) => {
  // Update store for all
  events.forEach(ev => {
    const id = ev.target.getAttribute('data-canvas-id');
    resizeComponent(id, ev.width, ev.height, ev.drag.left, ev.drag.top);
  });
}, [resizeComponent]);
```

---

## 🖱️ Selecto Integration

### Basic Setup
```tsx
const selectoRef = useRef<Selecto>(null);

<Selecto
  ref={selectoRef}
  container={canvasRef.current}
  rootContainer={document.body}
  selectableTargets={['.moveable-element']}
  hitRate={0}
  selectByClick={false}
  toggleContinueSelect={['shift']}
  onDragStart={handleSelectoDragStart}
  onSelect={handleSelectoSelect}
/>
```

### Conflict Prevention (CRITICAL!)
```tsx
const handleSelectoDragStart = useCallback((e) => {
  // MUST CHECK: Prevent Selecto/Moveable conflict
  if (moveableRef.current?.isMoveableElement(e.inputEvent.target)) {
    e.stop(); // Let Moveable handle it
    return;
  }

  // Also check for component class
  const target = e.inputEvent.target as HTMLElement;
  if (target.closest('.moveable-element')) {
    e.stop(); // Let Moveable handle it
    return;
  }
}, []);
```

**Without this check:** Selecto and Moveable fight over events! ❌

### Selection Handler
```tsx
const handleSelectoSelect = useCallback((e) => {
  // Pass DOM elements to Moveable
  setTargets(e.selected);

  // Update store selection
  const ids = e.selected.map(el => el.getAttribute('data-canvas-id')).filter(Boolean);
  if (ids.length > 0) {
    selectMultiple(ids);
  } else {
    deselectAll();
  }
}, [selectMultiple, deselectAll]);
```

---

## ⚙️ Configuration Reference

### Draggable
```tsx
draggable={true}
throttleDrag={0}              // No throttle (smooth)
edgeDraggable={false}         // No edge drag
```

### Resizable
```tsx
resizable={true}
keepRatio={false}             // Free resize
throttleResize={0}            // No throttle
renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']} // 8 handles
```

### Snappable (20px Grid)
```tsx
snappable={true}
snapThreshold={10}
snapGridWidth={20}
snapGridHeight={20}
isDisplaySnapDigit={true}
snapGap={true}
snapElement={true}
snapCenter={true}
```

### Bounds
```tsx
bounds={{
  left: 0,
  top: 0,
  right: canvasWidth,
  bottom: canvasHeight,
  position: 'css',
}}
```

---

## 🎨 Store Actions

### Position
```tsx
moveComponentAbsolute(canvasId: string, x: number, y: number)
```

### Size
```tsx
resizeComponent(canvasId: string, width: number, height: number, x: number, y: number)
```

### Selection
```tsx
selectComponent(componentId: string, addToSelection?: boolean)
selectMultiple(componentIds: string[])
deselectAll()
```

### Z-Index
```tsx
bringToFront(canvasId: string)
sendToBack(canvasId: string)
```

---

## 🐛 Common Mistakes

### ❌ DON'T: Wrap each component in Moveable
```tsx
// WRONG
{components.map(comp => (
  <Moveable><div>Content</div></Moveable>
))}
```

### ✅ DO: ONE Moveable for all selected
```tsx
// CORRECT
{components.map(comp => (
  <div className="moveable-element">Content</div>
))}
<Moveable target={selectedDomElements} />
```

### ❌ DON'T: Skip isMoveableElement check
```tsx
// WRONG - Conflicts!
onDragStart={(e) => {
  // No check
}}
```

### ✅ DO: Check before Selecto proceeds
```tsx
// CORRECT
onDragStart={(e) => {
  if (moveableRef.current?.isMoveableElement(e.inputEvent.target)) {
    e.stop();
    return;
  }
}}
```

### ❌ DON'T: Update store on every drag frame
```tsx
// WRONG - Performance disaster!
onDrag={({ target, left, top }) => {
  moveComponentAbsolute(id, left, top); // 60 times per second!
}}
```

### ✅ DO: Update DOM during drag, store after
```tsx
// CORRECT
onDrag={({ target, left, top }) => {
  target.style.left = `${left}px`; // DOM only
  target.style.top = `${top}px`;
}}
onDragEnd={({ target }) => {
  moveComponentAbsolute(id, left, top); // Store once
}}
```

---

## 🔍 Debugging

### Check Targets
```tsx
console.log('Targets:', targets.map(t => t.getAttribute('data-canvas-id')));
```

### Check Selection State
```tsx
console.log('Selected IDs:', Array.from(selectedComponentIds));
console.log('Targets length:', targets.length);
```

### Verify DOM Structure
```javascript
// All components should have class
document.querySelectorAll('.moveable-element').length

// All should have data-canvas-id
document.querySelectorAll('[data-canvas-id]').length
```

### Console Logs
All events log automatically:
```
[Moveable] onDrag - Updating DOM
[Moveable] onDragGroup - Group drag
[Selecto] STOPPED - Moveable element clicked
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **ESC** | Deselect all |
| **Ctrl+A** / **Cmd+A** | Select all |
| **Delete** / **Backspace** | Remove selected (respects locks) |
| **Shift+Click** | Add to selection |

---

## 📊 Performance Tips

1. **Use single Moveable instance** (not one per component)
2. **Update DOM during drag** (not store)
3. **Update store after drag ends** (once, not 60 times/sec)
4. **Limit console logs** in production
5. **Use throttle if needed** (for 100+ components)

---

## 📚 TypeScript Types

```tsx
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import type { CanvasComponent } from '@/types/dashboard-builder';

const moveableRef = useRef<Moveable>(null);
const selectoRef = useRef<Selecto>(null);
const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([]);
```

---

## 🔗 External Resources

- [Moveable GitHub](https://github.com/daybrush/moveable)
- [Moveable + Selecto Guide](https://daybrush.com/moveable/storybook/?path=/story/group--with-selecto)
- [React Moveable Docs](https://github.com/daybrush/moveable/tree/master/packages/react-moveable)

---

## ✅ Checklist for New Features

When adding new canvas features:

- [ ] Components have `.moveable-element` class
- [ ] Components have `data-canvas-id` attribute
- [ ] Use single Moveable instance (not per-component)
- [ ] isMoveableElement check in Selecto
- [ ] DOM updates in onDrag/onResize
- [ ] Store updates in onDragEnd/onResizeEnd
- [ ] Group handlers implemented (onDragGroup, etc.)
- [ ] Comprehensive console logging
- [ ] Test with multi-select
- [ ] Test performance with 50+ components

---

**Need More Details?**
- Implementation: `MOVEABLE-MIGRATION-COMPLETE.md`
- Comparison: `REACT-RND-VS-MOVEABLE-COMPARISON.md`
- Testing: `MOVEABLE-TESTING-CHECKLIST.md`
- Summary: `MIGRATION-SUMMARY.md`

**Quick Questions?**
- Check browser console logs
- Verify `.moveable-element` class exists
- Confirm `data-canvas-id` attribute set
- Test isMoveableElement check with breakpoint
