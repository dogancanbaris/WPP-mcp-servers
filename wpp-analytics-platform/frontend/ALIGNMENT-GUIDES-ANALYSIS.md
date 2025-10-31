# Alignment Guides Configuration Analysis & Recommendations

**Date:** October 31, 2025
**Status:** COMPLETE EVALUATION
**Recommendation:** **OPTION B - Enhanced Custom AlignmentGuides (SELECTED)**

---

## Executive Summary

### Current State:
- ✅ DashboardCanvas.tsx exists with Selecto for multi-select
- ✅ CanvasComponent.tsx uses **react-rnd** (NOT react-moveable) for drag/resize
- ✅ AlignmentGuides.tsx provides custom Looker-style alignment visualization
- ✅ Guides work only for **single active component** (current limitation)

### Findings:

**Option A (Moveable's Built-In Guidelines):**
- ✅ Moveable has elementGuidelines feature
- ❌ **Project uses react-rnd, NOT react-moveable**
- ❌ Would require major refactoring (swap drag/resize library)
- ❌ Not worth effort for single new feature

**Option B (Enhanced Custom AlignmentGuides):**
- ✅ Already partially implemented
- ✅ Works with current react-rnd setup
- ✅ Minimal changes needed
- ✅ Shows ALL component alignments (not just active one)
- ✅ Professional Looker-style appearance
- **SELECTED** - Recommended solution

---

## Technical Analysis

### Current Implementation Details

**DashboardCanvas.tsx (lines 289-297):**
```typescript
{/* Alignment Guides */}
{isEditing && (
  <AlignmentGuides
    activeComponent={activeCanvasComponent}  // Only ONE active component
    allComponents={canvasComponents}         // All other components
    canvasWidth={pageCanvasWidth}
    tolerance={2}
  />
)}
```

**Limitation:** Shows alignment guides only when ONE component is active (during drag).

**AlignmentGuides.tsx (line 47):**
```typescript
// Only compares active component to all others
allComponents.forEach((comp) => {
  if (comp.id === activeComponent.id) return;
  // ... compare logic
});
```

### Why react-rnd is Used:

✅ **Reasons for current choice:**
- Native React drag/resize without external transform library
- Works well with Selecto for multi-select
- Built-in grid snapping (20px)
- Bounds checking out-of-the-box
- Simpler integration with component lifecycle

### Moveable Would Require:

❌ **Major refactoring to switch:**
1. Replace all `<Rnd>` components with `<Moveable>`
2. Reimplement grid snapping (not built-in to Moveable)
3. Reimplement bounds checking
4. Handle resize handles differently
5. Update event handling (drag events are different)
6. Test all interactions
7. ~2-3 hours of work for unclear benefit

---

## Option B: Enhanced AlignmentGuides Implementation

### Current Behavior:
```
Single component dragged:
  → Shows alignment lines to matching components
  → Shows dimension labels (width/height)
  → Purple/pink Looker-style visualization
  ✓ Works well for single component

Multi-component dragged:
  ❌ Only shows guides for first selected component
  ❌ Other components don't show guides
  ❌ Limited visual feedback
```

### Proposed Enhancement:

**Show guides for ALL selected components during multi-select drag:**

```typescript
// Enhanced logic:
// If multiple components selected, show guides for ALL of them
selectedComponentIds.forEach((selectedId) => {
  allComponents.forEach((comp) => {
    if (comp.id === selectedId) return;
    // Check alignment for this selected component to all others
    // Add guides to array
  });
});

// Limit to 10 most relevant guides (sort by distance)
const sortedGuides = guides
  .sort((a, b) => calculateRelevance(a) - calculateRelevance(b))
  .slice(0, 10);
```

### Benefits:

✅ **For Single Component:**
- Shows alignment to all other components
- Dimension labels on width/height match
- Professional visual feedback
- Works during drag AND resize

✅ **For Multi-Select:**
- Shows alignment feedback for all selected components
- Helps align groups to other elements
- Maintains Looker-style professional appearance

✅ **Minimal Code Changes:**
- Modify AlignmentGuides.tsx (~20 lines)
- Enhance DashboardCanvas.tsx for multi-select (~5 lines)
- No library changes needed
- No event handler changes

✅ **Zero Performance Impact:**
- SVG renders only 10 guides max
- Cleanup happens on drag end
- No heavy DOM manipulation

---

## Moveable Option (Not Recommended)

### Would Be Used If:
- Project exclusively used Moveable for drag/resize
- Alignment guides were the only remaining feature
- We had days to refactor

### Actual Status:
- ❌ Project uses react-rnd exclusively
- ❌ Would break existing drag/resize behavior
- ❌ Would break existing resize handles UI
- ❌ Would require retesting everything
- ❌ Moveable's guides are good, but not worth the migration

---

## Implementation Plan: Enhanced AlignmentGuides

### Step 1: Update AlignmentGuides.tsx

**Current (line 27-32):**
```typescript
export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  activeComponent,    // Only ONE
  allComponents,
  canvasWidth,
  tolerance = 2,
}) => {
  if (!activeComponent) return null;
```

**Enhanced (new version):**
```typescript
interface AlignmentGuidesProps {
  activeComponents: CanvasComponent[];  // CHANGE: Support multiple
  allComponents: CanvasComponent[];
  canvasWidth: number;
  tolerance?: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  activeComponents,    // Now an array
  allComponents,
  canvasWidth,
  tolerance = 2,
}) => {
  if (!activeComponents || activeComponents.length === 0) return null;

  const guides: Guide[] = [];

  // For EACH active component, find alignments
  activeComponents.forEach((activeComponent) => {
    allComponents.forEach((comp) => {
      if (comp.id === activeComponent.id) return;
      // ... existing alignment logic
    });
  });

  // Sort by relevance and limit to 10
  const relevantGuides = guides
    .sort((a, b) => {
      // Prioritize: exact matches > edge alignments > center alignments
      const priority = {
        'width-match': 0,
        'height-match': 0,
        'align-left': 1,
        'align-right': 1,
        'align-top': 1,
        'align-bottom': 1,
        'center-h': 2,
        'center-v': 2,
      };
      return (priority[a.type as keyof typeof priority] || 3) -
             (priority[b.type as keyof typeof priority] || 3);
    })
    .slice(0, 10);  // Show max 10 guides
```

### Step 2: Update DashboardCanvas.tsx

**Current (line 152-157):**
```typescript
const handleDragStart = (id: string) => {
  const comp = canvasComponents.find(c => c.id === id);
  if (comp) {
    setActiveCanvasComponent(comp);  // Only one
  }
};
```

**Enhanced:**
```typescript
const handleDragStart = (id: string) => {
  // If part of multi-select, show guides for ALL selected
  if (selectedComponentIds && selectedComponentIds.has(id) && selectedComponentIds.size > 1) {
    const activeComps = canvasComponents.filter(c => selectedComponentIds.has(c.id));
    setActiveCanvasComponents(activeComps);
  } else {
    const comp = canvasComponents.find(c => c.id === id);
    if (comp) {
      setActiveCanvasComponents([comp]);  // Single component in array
    }
  }
};
```

### Step 3: Update DashboardCanvas.tsx Component Calls

**Current (line 290-296):**
```typescript
{isEditing && (
  <AlignmentGuides
    activeComponent={activeCanvasComponent}
    allComponents={canvasComponents}
    canvasWidth={pageCanvasWidth}
    tolerance={2}
  />
)}
```

**Enhanced:**
```typescript
{isEditing && (
  <AlignmentGuides
    activeComponents={activeCanvasComponents || []}  // Array format
    allComponents={canvasComponents}
    canvasWidth={pageCanvasWidth}
    tolerance={2}
  />
)}
```

### Step 4: Update State Management

**Current state variable:**
```typescript
const [activeCanvasComponent, setActiveCanvasComponent] = useState<CanvasComponent | null>(null);
```

**Enhanced:**
```typescript
const [activeCanvasComponents, setActiveCanvasComponents] = useState<CanvasComponent[]>([]);
```

**Clear on drag end (line 151):**
```typescript
const handleSizeChange = (...) => {
  resizeComponent(id, width, height, x, y);
  setActiveCanvasComponents([]);  // Clear after resize completes
};
```

---

## Visual Improvements

### Current Appearance:
- Magenta/purple lines (✓ Good)
- Solid lines for edge alignment (✓ Good)
- Dashed lines for dimension match (✓ Good)
- Dimension labels (✓ Good)
- Single component only (✗ Limited)

### Enhanced Appearance:
- **Same visual style** (maintains consistency)
- **Multiple guides** for multi-select (shows all alignments)
- **Relevance sorting** (most important guides shown first)
- **Max 10 guides** (prevents clutter with many components)
- **Fade effect** on guides (optional - add CSS animation)

### Optional CSS Enhancement:

```css
.alignment-guide {
  opacity: 0;
  animation: slideIn 150ms ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    stroke-width: 0;
  }
  to {
    opacity: 1;
    stroke-width: 1.5px;
  }
}
```

---

## Testing Checklist

### Task 1: Drag Single Component
- [ ] Alignment guides appear during drag
- [ ] Guides show to matching components
- [ ] Dimension labels display correctly
- [ ] Guides disappear after drag end
- [ ] Performance is smooth (no lag)

### Task 2: Drag Multi-Selected Components (2+)
- [ ] Guides show for ALL selected components
- [ ] Different colors if multiple alignment types
- [ ] No clutter (max 10 guides)
- [ ] Guides disappear after drag end
- [ ] Group stays intact during drag

### Task 3: Resize Component
- [ ] Guides appear during resize
- [ ] Dimension labels update in real-time
- [ ] Guides disappear after resize end
- [ ] Snap tolerance works correctly

### Task 4: Performance
- [ ] No lag with 50+ components on canvas
- [ ] SVG re-renders only on change
- [ ] No memory leaks during extended use
- [ ] Mobile/touchscreen works smoothly

---

## Success Criteria

✅ **Implementation Complete When:**

1. **Single Component Alignment:**
   - Guides appear during drag
   - Shows alignment to all other components
   - Dimension labels visible
   - Looker-style appearance maintained

2. **Multi-Select Alignment:**
   - Guides appear for all selected components
   - Limited to 10 most relevant guides
   - Professional appearance (no clutter)
   - Works during group drag

3. **Performance:**
   - 0 lag during drag (60 FPS)
   - SVG rendering efficient (<50ms)
   - No memory leaks

4. **Quality:**
   - Tested with various component counts
   - Tested with edge cases (overlapping, small components)
   - Works in both desktop and mobile views
   - Responsive to viewport changes

---

## Documentation

### Code Comments:
```typescript
// Enhanced to support multi-component alignment feedback
// Shows guides for all selected components to help users align groups
// Limits to 10 most relevant guides to prevent visual clutter
// Magenta/purple Looker-style colors for professional appearance
```

### In docs/ALIGNMENT-GUIDES.md:
```markdown
# Alignment Guides Feature

## How It Works

During component drag:
1. Calculate distance to all other components
2. Detect alignments (edges, centers, dimensions)
3. Show top 10 most relevant guides
4. Hide guides on drag end

## Guide Types
- **Purple lines**: Edge or center alignment
- **Pink dashed lines**: Width/height dimension match
- **Labels**: Dimension values (e.g., "300px")

## For Multi-Select
- Shows guides for all selected components
- Helps align groups to other elements
- Prevents visual clutter (max 10 guides)
```

---

## Timeline

| Task | Duration | Notes |
|------|----------|-------|
| Modify AlignmentGuides.tsx | 20 min | Core logic enhancement |
| Update DashboardCanvas.tsx | 10 min | State management change |
| Add animation CSS (optional) | 5 min | Visual polish |
| Testing | 15 min | Functional + performance |
| Documentation | 5 min | Code comments + guide |
| **Total** | **~55 minutes** | Ready for production |

---

## Conclusion

**OPTION B is Recommended:**

✅ Works with existing react-rnd setup (no migration)
✅ Minimal code changes (~30 lines modified)
✅ Professional Looker-style result
✅ Supports single AND multi-select
✅ Zero performance impact
✅ Can be implemented in <1 hour

**Next Steps:**

1. Implement enhanced AlignmentGuides.tsx
2. Update DashboardCanvas.tsx state management
3. Test with various component layouts
4. Document in project guides
5. Deploy with confidence

---

**Document prepared by:** Frontend Specialist Agent
**Reviewed:** October 31, 2025
**Status:** Ready for implementation
