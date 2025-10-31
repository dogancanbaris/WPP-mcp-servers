# react-rnd vs Moveable.js - Side-by-Side Comparison

**Purpose:** Understand the architectural shift from react-rnd to Moveable.js

---

## 🏗️ Architecture Comparison

### Component Wrapping Pattern

#### react-rnd (OLD)
```typescript
// Each component wrapped in Rnd
import Rnd from 'react-rnd';

{canvasComponents.map(comp => (
  <Rnd
    key={comp.id}
    position={{ x: comp.x, y: comp.y }}
    size={{ width: comp.width, height: comp.height }}
    onDragStop={(e, d) => {
      moveComponentAbsolute(comp.id, d.x, d.y);
    }}
    onResizeStop={(e, direction, ref, delta, position) => {
      resizeComponent(comp.id, ref.offsetWidth, ref.offsetHeight, position.x, position.y);
    }}
    bounds="parent"
    dragGrid={[20, 20]}
    resizeGrid={[20, 20]}
  >
    <div className="canvas-component">
      <ChartWrapper config={comp.component} />
    </div>
  </Rnd>
))}
```

**Problems:**
- ❌ Each component has own Rnd instance (N instances for N components)
- ❌ No coordination between instances (no group drag possible)
- ❌ [Open issue from 2020](https://github.com/bokuweb/react-rnd/issues/742) - group drag not supported

#### Moveable.js (NEW)
```typescript
// Components as simple positioned divs
{canvasComponents.map(comp => (
  <div
    key={comp.id}
    className="moveable-element"
    data-canvas-id={comp.id}
    style={{
      position: 'absolute',
      left: `${comp.x}px`,
      top: `${comp.y}px`,
      width: `${comp.width}px`,
      height: `${comp.height}px`,
    }}
  >
    <ChartWrapper config={comp.component} />
  </div>
))}

// ONE Moveable instance manages ALL selected
<Moveable
  ref={moveableRef}
  target={domElementArray} // Array of HTMLElement[]
  draggable={true}
  resizable={true}
  onDrag={handleDrag}
  onDragEnd={handleDragEnd}
  onDragGroup={handleDragGroup} // NATIVE GROUP SUPPORT!
  onDragGroupEnd={handleDragGroupEnd}
/>
```

**Benefits:**
- ✅ Single Moveable instance (1 instance for ALL components)
- ✅ Native group operations (drag, resize)
- ✅ Designed to work with Selecto (same author)

---

## 🎯 Single Drag Comparison

### react-rnd (OLD)
```typescript
<Rnd
  onDragStop={(e, d) => {
    // Update store directly (no DOM manipulation)
    moveComponentAbsolute(comp.id, d.x, d.y);
  }}
/>
```

**Pattern:** Update store directly after drag

### Moveable.js (NEW)
```typescript
// Update DOM during drag
onDrag={({ target, left, top }) => {
  target.style.left = `${left}px`;
  target.style.top = `${top}px`;
}}

// Update store after drag ends
onDragEnd={({ target }) => {
  const id = target.getAttribute('data-canvas-id');
  const left = parseFloat(target.style.left) || 0;
  const top = parseFloat(target.style.top) || 0;
  moveComponentAbsolute(id, left, top);
}}
```

**Pattern:** Update DOM first (smooth visual), store second (persistence)

---

## 👥 Group Operations Comparison

### react-rnd (OLD)
```typescript
// Group drag: NOT POSSIBLE
// Each Rnd instance independent
// Would need custom logic to track group, calculate deltas, update all
// Open issue: https://github.com/bokuweb/react-rnd/issues/742
```

**Result:** ❌ No native group drag support

### Moveable.js (NEW)
```typescript
// Group drag: NATIVE SUPPORT!
onDragGroup={({ events }) => {
  events.forEach(ev => {
    ev.target.style.transform = ev.transform;
  });
}}

onDragGroupEnd={({ events }) => {
  events.forEach(ev => {
    const id = ev.target.getAttribute('data-canvas-id');
    moveComponentAbsolute(id, ev.left, ev.top);
  });
}}

// Group resize: NATIVE SUPPORT!
onResizeGroup={({ events }) => {
  events.forEach(ev => {
    ev.target.style.width = `${ev.width}px`;
    ev.target.style.height = `${ev.height}px`;
    ev.target.style.transform = ev.drag.transform;
  });
}}

onResizeGroupEnd={({ events }) => {
  events.forEach(ev => {
    const id = ev.target.getAttribute('data-canvas-id');
    resizeComponent(id, ev.width, ev.height, ev.drag.left, ev.drag.top);
  });
}}
```

**Result:** ✅ Native group drag and resize support

---

## 🖱️ Multi-Select Integration

### react-rnd + Selecto (OLD)
```typescript
// Selecto for multi-select
<Selecto
  onSelect={(e) => {
    const ids = e.selected.map(el => el.getAttribute('data-id'));
    selectMultiple(ids);
  }}
/>

// Problem: Selecto and Rnd fight over events!
// - Clicking component might trigger both Selecto and Rnd
// - No built-in coordination
// - Manual event conflict resolution required
```

**Result:** ⚠️ Event conflicts between Selecto and react-rnd

### Moveable + Selecto (NEW)
```typescript
// Selecto for multi-select
<Selecto
  onDragStart={(e) => {
    // CRITICAL: Check if clicking Moveable element
    if (moveableRef.current?.isMoveableElement(e.inputEvent.target)) {
      e.stop(); // Let Moveable handle it
      return;
    }
  }}
  onSelect={(e) => {
    setTargets(e.selected); // Pass DOM elements to Moveable
    const ids = e.selected.map(el => el.getAttribute('data-canvas-id'));
    selectMultiple(ids);
  }}
/>

// Moveable and Selecto designed to work together
// isMoveableElement() prevents conflicts
```

**Result:** ✅ Official integration, no conflicts (same author: daybrush)

---

## 📐 Grid Snapping

### react-rnd (OLD)
```typescript
<Rnd
  dragGrid={[20, 20]}
  resizeGrid={[20, 20]}
/>
```

**Snapping:** Basic grid snapping

### Moveable.js (NEW)
```typescript
<Moveable
  snappable={true}
  snapThreshold={10}
  snapGridWidth={20}
  snapGridHeight={20}
  isDisplaySnapDigit={true}
  snapGap={true}
  snapElement={true}
  snapCenter={true}
  snapVertical={true}
  snapHorizontal={true}
/>
```

**Snapping:** Advanced snapping (grid, elements, center, gaps)

---

## 🎨 Alignment Guides

### react-rnd (OLD)
```typescript
// Manual implementation required
// Track drag position, compare with other components
// Custom component for rendering guides
```

**Alignment Guides:** Custom implementation

### Moveable.js (NEW)
```typescript
// Built-in support via Snappable
<Moveable
  snappable={true}
  snapElement={true} // Snap to other elements
  snapCenter={true} // Snap to element centers
  isDisplaySnapDigit={true} // Show snap distance
/>

// Or custom implementation using onDrag
onDrag={({ target, left, top }) => {
  setActiveComponent({ x: left, y: top }); // Triggers AlignmentGuides
}}
```

**Alignment Guides:** Built-in snapping features + custom guides

---

## 🔒 Bounds Handling

### react-rnd (OLD)
```typescript
<Rnd
  bounds="parent" // Simple parent bounds
/>
```

**Bounds:** Basic parent container

### Moveable.js (NEW)
```typescript
<Moveable
  bounds={{
    left: 0,
    top: 0,
    right: pageCanvasWidth,
    bottom: pageCanvasHeight,
    position: 'css',
  }}
/>
```

**Bounds:** Precise pixel-level control

---

## 📊 Performance Comparison

### react-rnd (OLD)
```
N components = N Rnd instances
Each instance:
  - Event listeners
  - Drag state management
  - Resize calculations
  - Independent updates

Performance: O(N) overhead
```

**Scalability:** Performance degrades with many components

### Moveable.js (NEW)
```
N components = 1 Moveable instance
Single instance:
  - Event listeners (1 set)
  - Group state management
  - Batch calculations
  - Coordinated updates

Performance: O(1) overhead
```

**Scalability:** Constant performance regardless of component count

---

## 🧪 Testing Scenarios

| Scenario | react-rnd | Moveable.js |
|----------|-----------|-------------|
| **Single drag** | ✅ Works | ✅ Works |
| **Single resize** | ✅ Works | ✅ Works |
| **Group drag (2+ components)** | ❌ Not supported | ✅ Native support |
| **Group resize (2+ components)** | ❌ Not supported | ✅ Native support |
| **Multi-select via Selecto** | ⚠️ Event conflicts | ✅ Official integration |
| **Grid snapping** | ✅ Basic | ✅ Advanced |
| **Alignment guides** | ⚠️ Custom | ✅ Built-in + custom |
| **Performance (50+ components)** | ⚠️ N instances | ✅ 1 instance |

---

## 🔄 Migration Effort

### Code Changes Required

#### Component Rendering
- **Before:** `<Rnd>...</Rnd>` wrapper per component
- **After:** Simple `<div className="moveable-element">` per component
- **Effort:** Low - Template change

#### Event Handlers
- **Before:** `onDragStop`, `onResizeStop` per Rnd
- **After:** `onDrag`, `onDragEnd`, `onDragGroup`, `onDragGroupEnd` on ONE Moveable
- **Effort:** Medium - Event handler restructure

#### Target Management
- **Before:** Not needed (Rnd manages internally)
- **After:** Convert selectedComponentIds → DOM element array
- **Effort:** Medium - New pattern to implement

#### Selecto Integration
- **Before:** Basic selection (no conflict prevention)
- **After:** Add isMoveableElement check
- **Effort:** Low - One check added

**Total Migration Time:** ~3-4 hours for complete conversion

---

## 💰 Cost-Benefit Analysis

### Costs
- ❌ Code restructure (3-4 hours)
- ❌ New architectural pattern to learn
- ❌ Testing and validation

### Benefits
- ✅ Native group drag/resize (primary requirement!)
- ✅ Official Selecto integration (no conflicts)
- ✅ Better performance (1 instance vs N instances)
- ✅ Advanced snapping features
- ✅ Future-proof (actively maintained)
- ✅ Industry standard (Figma, Framer use similar pattern)

**Verdict:** ✅ Benefits far outweigh costs

---

## 📚 Documentation References

### react-rnd
- [GitHub](https://github.com/bokuweb/react-rnd)
- [Issue #742 - Group drag not supported](https://github.com/bokuweb/react-rnd/issues/742)
- **Status:** Open issue since 2020, no official solution

### Moveable.js
- [GitHub](https://github.com/daybrush/moveable)
- [React Integration](https://github.com/daybrush/moveable/tree/master/packages/react-moveable)
- [Selecto Integration Guide](https://daybrush.com/moveable/storybook/?path=/story/group--with-selecto)
- **Status:** Active development, official Selecto support

---

## ✅ Decision: Moveable.js

**Why Moveable.js wins:**
1. **Native group operations** - Primary requirement
2. **Official Selecto integration** - No event conflicts
3. **Single instance pattern** - Better performance
4. **Active development** - Future-proof
5. **Industry standard** - Used by Figma, Framer, etc.

**Migration status:** ✅ COMPLETE (October 31, 2025)

---

**Questions?**
- See `MOVEABLE-MIGRATION-COMPLETE.md` for implementation details
- Check browser console for comprehensive event logging
- Verify `.moveable-element` class and `data-canvas-id` attributes
