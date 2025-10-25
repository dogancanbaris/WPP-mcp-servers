# INSERT and ARRANGE Menu Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EditorTopbar.tsx                             │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │ useInsertActions() │  │ useArrangeActions()│                    │
│  └────────┬───────────┘  └────────┬───────────┘                    │
│           │                        │                                │
│           ▼                        ▼                                │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │  insertActions     │  │  arrangeActions    │                    │
│  │  ---------------   │  │  ----------------  │                    │
│  │  - onInsertChart   │  │  - onBringToFront │                    │
│  │  - onInsertControl │  │  - onSendToBack   │                    │
│  │  - onInsertContent │  │  - onMoveForward  │                    │
│  │  - ...state        │  │  - onAlignLeft    │                    │
│  └────────┬───────────┘  │  - onAlignCenter  │                    │
│           │              │  - ...12 more     │                    │
│           │              └────────┬───────────┘                    │
│           │                       │                                │
│           ▼                       ▼                                │
│  ┌──────────────────────────────────────────────────┐             │
│  │          menu-definitions.ts                     │             │
│  │                                                   │             │
│  │  getInsertMenuItems(insertActions)               │             │
│  │  getArrangeMenuItems(arrangeActions)             │             │
│  └────────┬────────────────────┬────────────────────┘             │
│           │                    │                                   │
│           ▼                    ▼                                   │
│  ┌──────────────────┐  ┌──────────────────┐                       │
│  │ INSERT MenuButton│  │ ARRANGE MenuButton│                      │
│  └──────────────────┘  └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘

User clicks "Insert > Chart > Bar Chart"
        │
        ▼
getInsertMenuItems returns MenuItem with action: insertActions.onInsertChart('bar_chart')
        │
        ▼
useInsertActions().onInsertChart('bar_chart') executes
        │
        ├──> setPreSelectedType('bar_chart')
        ├──> setComponentPickerOpen(true)
        └──> toast.info('Select a column to add chart')
```

## Data Flow

### INSERT Menu Flow
```typescript
// 1. User clicks menu item
"Insert > Chart > Bar Chart"

// 2. Menu definition triggers action
insertActions.onInsertChart('bar_chart')

// 3. Action handler executes
useInsertActions() {
  const [preSelectedType, setPreSelectedType] = useState(null);
  const [componentPickerOpen, setComponentPickerOpen] = useState(false);
  
  onInsertChart: (type) => {
    setPreSelectedType('bar_chart');
    setComponentPickerOpen(true);
    toast.info('Select a column to add chart');
  }
}

// 4. Component picker opens with pre-selected type
<ComponentPicker
  open={componentPickerOpen}
  preSelectedType="bar_chart"
  onSelect={(type) => addComponent(columnId, type)}
/>
```

### ARRANGE Menu Flow
```typescript
// 1. User selects component and clicks menu item
"Arrange > Align > Left"

// 2. Menu definition triggers action
arrangeActions.onAlignLeft()

// 3. Action handler executes
useArrangeActions() {
  const { selectedComponentId, config } = useDashboardStore();
  
  onAlignLeft: () => {
    if (!selectedComponentId) {
      toast.error('No component selected');
      return;
    }
    
    // Find component position
    const pos = findComponentPosition();
    
    // Calculate alignment
    // Update component position in store
    // Show success toast
  }
}

// 4. Dashboard re-renders with aligned component
```

## State Management

### INSERT Actions State
```typescript
const insertActions = useInsertActions();
// Returns:
{
  onInsertChart: (type?: string) => void,
  onInsertControl: (type: string) => void,
  onInsertContent: (type: string) => void,
  componentPickerOpen: boolean,
  setComponentPickerOpen: (open: boolean) => void,
  preSelectedType: string | null,
}
```

### ARRANGE Actions State
```typescript
const arrangeActions = useArrangeActions();
// Returns:
{
  onBringToFront: () => void,
  onSendToBack: () => void,
  onMoveForward: () => void,
  onMoveBackward: () => void,
  onAlignLeft: () => void,
  onAlignCenter: () => void,
  onAlignRight: () => void,
  onAlignTop: () => void,
  onAlignMiddle: () => void,
  onAlignBottom: () => void,
  onDistributeHorizontally: () => void,
  onDistributeVertically: () => void,
  onGroup: () => void,
  onUngroup: () => void,
}
```

## Store Integration

### Dashboard Store
```typescript
const useDashboardStore = create((set, get) => ({
  config: {
    rows: [
      {
        id: 'row-1',
        columns: [
          {
            id: 'col-1',
            width: '1/2',
            component: {
              id: 'comp-1',
              type: 'bar_chart',
              position: { x: 0, y: 0 },
              zIndex: 1,
            }
          }
        ]
      }
    ]
  },
  selectedComponentId: 'comp-1',
  
  addComponent: (columnId, type) => { /* ... */ },
  updateComponent: (componentId, updates) => { /* ... */ },
}));
```

### Integration Points
```typescript
// INSERT actions use store to:
// - Find empty columns
// - Add new components
// - Update component data

// ARRANGE actions use store to:
// - Get selected component
// - Find component position in grid
// - Update component position/zIndex
// - Update multiple components for alignment
```

## Menu Item Structure

### Before (Static)
```typescript
export const INSERT_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Chart',
    submenu: [
      { label: 'Bar Chart', action: () => console.log('Add bar chart') }
    ]
  }
];
```

### After (Dynamic Factory)
```typescript
export const getInsertMenuItems = (insertActions: {
  onInsertChart: (type?: string) => void;
}) => [
  {
    label: 'Chart',
    submenu: [
      { label: 'Bar Chart', action: () => insertActions.onInsertChart('bar_chart') }
    ]
  }
];
```

## Consistency Across Menus

All menus now follow the same pattern:

| Menu     | Factory Function        | Action Hook          | Status      |
|----------|------------------------|---------------------|-------------|
| FILE     | createFileMenuItems()  | useFileActions()    | ✅ Connected |
| EDIT     | createEditMenuItems()  | useEditActions()    | ✅ Connected |
| VIEW     | getViewMenuItems()     | useViewActions()    | ✅ Connected |
| INSERT   | getInsertMenuItems()   | useInsertActions()  | ✅ Connected |
| ARRANGE  | getArrangeMenuItems()  | useArrangeActions() | ✅ Connected |
| PAGE     | Static array           | -                   | ⬜ Pending   |
| RESOURCE | Static array           | -                   | ⬜ Pending   |
| HELP     | Static array           | -                   | ⬜ Pending   |

## Testing Examples

### Test INSERT Menu
```typescript
// In browser console:
import { useDashboardStore } from '@/store/dashboardStore';

// 1. Check initial state
const state = useDashboardStore.getState();
console.log('Rows:', state.config.rows);

// 2. Click INSERT > Chart > Bar Chart
// Expected: Toast "Select a column to add chart"
// Expected: Component picker opens

// 3. Select a column in picker
// Expected: Bar chart added to column
// Expected: Store updated with new component

// 4. Verify component added
const newState = useDashboardStore.getState();
console.log('Updated rows:', newState.config.rows);
```

### Test ARRANGE Menu
```typescript
// In browser console:
import { useDashboardStore } from '@/store/dashboardStore';

// 1. Select a component
const { selectComponent } = useDashboardStore.getState();
selectComponent('comp-1');

// 2. Click ARRANGE > Align > Left
// Expected: Toast "Align left - basic alignment"
// Expected: Component aligns to left edge

// 3. Verify position updated
const state = useDashboardStore.getState();
const component = findComponentById(state.config, 'comp-1');
console.log('Component position:', component.position);
```

## Future Enhancements

### INSERT Actions
- [ ] Integrate ComponentPicker dialog
- [ ] Implement actual chart creation
- [ ] Add control component templates
- [ ] Add content component editors
- [ ] Support drag-and-drop component insertion
- [ ] Add component duplication

### ARRANGE Actions
- [ ] Implement actual z-index management
- [ ] Calculate and apply alignment transformations
- [ ] Support multi-select operations
- [ ] Add snap-to-grid functionality
- [ ] Implement grouping/ungrouping
- [ ] Add keyboard shortcuts for arrange actions
- [ ] Visual guides during alignment

