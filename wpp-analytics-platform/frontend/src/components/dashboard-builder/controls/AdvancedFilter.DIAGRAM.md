# AdvancedFilter Component - Visual Diagrams

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AdvancedFilter                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Header                             │  │
│  │  ┌──┐  Advanced Filters                              │  │
│  │  └──┘                                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              FilterGroupComponent (Root)              │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │ [AND] Toggle   1 condition, 1 group   [✓][─]  │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │         FilterConditionComponent #1            │   │  │
│  │  │  [≡] [Campaign Name▼] [Equals▼] [ENABLED   ] │   │  │
│  │  │                                   [✓][⧉][🗑]   │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  ──────────── AND ────────────                        │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │    FilterGroupComponent (Nested)               │   │  │
│  │  │  ┌──────────────────────────────────────────┐  │   │  │
│  │  │  │ [OR] Toggle   2 conditions   [✓][─]      │  │   │  │
│  │  │  └──────────────────────────────────────────┘  │   │  │
│  │  │                                                │   │  │
│  │  │  ┌──────────────────────────────────────────┐  │   │  │
│  │  │  │   FilterConditionComponent #2            │  │   │  │
│  │  │  │  [Impressions▼] [>▼] [1000] [✓][⧉][🗑]  │  │   │  │
│  │  │  └──────────────────────────────────────────┘  │   │  │
│  │  │                                                │   │  │
│  │  │  ──────────── OR ────────────                 │   │  │
│  │  │                                                │   │  │
│  │  │  ┌──────────────────────────────────────────┐  │   │  │
│  │  │  │   FilterConditionComponent #3            │  │   │  │
│  │  │  │  [Clicks▼] [>▼] [100] [✓][⧉][🗑]        │  │   │  │
│  │  │  └──────────────────────────────────────────┘  │   │  │
│  │  │                                                │   │  │
│  │  │  [+ Add Condition]  [+ Add Group]             │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  [+ Add Condition]  [+ Add Group]                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Legend:
[≡]  = Drag handle
[▼]  = Dropdown
[✓]  = Enable/disable toggle
[⧉]  = Duplicate button
[🗑]  = Delete button
[─]  = Remove group button
```

## Data Flow

```
┌──────────────┐
│     User     │
│   Actions    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│       AdvancedFilter Props           │
│  - value: FilterGroup                │
│  - onChange: (FilterGroup) => void   │
│  - availableFields: FieldConfig[]    │
└──────────────┬───────────────────────┘
               │
               ▼
       ┌───────────────┐
       │  Component    │
       │  State Logic  │
       └───────┬───────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Update     │  │  Validate   │
│  FilterGroup│  │  Changes    │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  Call onChange│
        │  with updated │
        │  FilterGroup  │
        └───────┬───────┘
                │
                ▼
         ┌─────────────┐
         │ Parent State│
         │   Updated   │
         └─────────────┘
```

## Filter Structure Example

```
FilterGroup (Root)
├── id: "root-123"
├── operator: "AND"
├── enabled: true
├── conditions: [
│   ├── FilterCondition {
│   │   id: "cond-1",
│   │   field: "campaign_status",
│   │   operator: "equals",
│   │   value: "ENABLED",
│   │   dataType: "string",
│   │   enabled: true
│   │   }
│   ]
├── groups: [
│   ├── FilterGroup {
│   │   id: "group-1",
│   │   operator: "OR",
│   │   enabled: true,
│   │   conditions: [
│   │   ├── FilterCondition {
│   │   │   id: "cond-2",
│   │   │   field: "impressions",
│   │   │   operator: "greater_than",
│   │   │   value: "10000",
│   │   │   dataType: "number",
│   │   │   enabled: true
│   │   │   },
│   │   ├── FilterCondition {
│   │   │   id: "cond-3",
│   │   │   field: "clicks",
│   │   │   operator: "greater_than",
│   │   │   value: "1000",
│   │   │   dataType: "number",
│   │   │   enabled: true
│   │   │   }
│   │   ],
│   │   groups: []
│   │   }
│   ]

Translates to SQL:
campaign_status = 'ENABLED' AND (impressions > 10000 OR clicks > 1000)
```

## Operator Selection Flow

```
┌─────────────────┐
│  User Selects   │
│     Field       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Get Field DataType     │
│  (string/number/date)   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Filter Available Operators     │
│  by DataType                    │
│                                 │
│  String: equals, contains, ...  │
│  Number: equals, >, <, ...      │
│  Date: equals, >, <, between    │
│  Boolean: equals, is_null       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Show Operator Dropdown │
│  with Filtered Options  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User Selects Operator  │
└────────┬────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Determine Value Input     │
│                            │
│  - is_null: No input       │
│  - between: Two inputs     │
│  - in/not_in: Array input  │
│  - others: Single input    │
└────────┬───────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Render Appropriate     │
│  Value Input(s)         │
└─────────────────────────┘
```

## Export Conversion Pipeline

```
┌──────────────────┐
│   FilterGroup    │
│   (User Input)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│  Choose Export Format:       │
│  - SQL                       │
│  - Cube.js                   │
│  - MongoDB                   │
│  - REST API                  │
└────────┬─────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────┐   ┌──────────┐
│ SQL  │   │ Cube.js  │
└──┬───┘   └────┬─────┘
   │            │
   ▼            ▼
┌────────────────────────────┐
│  Recursive Conversion      │
│                            │
│  1. Process conditions     │
│  2. Process nested groups  │
│  3. Combine with operator  │
└──────────┬─────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Format-      │
    │ Specific     │
    │ Output       │
    └──────┬───────┘
           │
           ▼
┌──────────────────────────┐
│  SQL WHERE Clause:       │
│  "status = 'ENABLED'     │
│   AND (impr > 1000       │
│   OR clicks > 100)"      │
└──────────────────────────┘

┌──────────────────────────┐
│  Cube.js Filters:        │
│  [                       │
│    {member: "...",       │
│     operator: "equals",  │
│     values: ["..."]},    │
│    {or: [...]}           │
│  ]                       │
└──────────────────────────┘
```

## Interaction Flow: Adding a Nested Group

```
Step 1: User clicks "Add Group"
┌────────────────────┐
│  [+ Add Group]     │ ← Click
└────────────────────┘

Step 2: Create new FilterGroup
const newGroup = {
  id: generateId(),
  operator: 'AND',
  enabled: true,
  conditions: [defaultCondition],
  groups: []
}

Step 3: Add to parent group
parentGroup.groups.push(newGroup)

Step 4: Call onChange with updated root
onChange(updatedRootGroup)

Step 5: Component re-renders with new nested group
┌────────────────────────────┐
│  Root Group                │
│  ├── Condition 1           │
│  └── New Nested Group      │
│      └── Default Condition │
└────────────────────────────┘
```

## Validation Flow

```
┌──────────────────┐
│   User Changes   │
│   Filter Value   │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│  validateFilterGroup()  │
└────────┬────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│Validate │ │  Validate    │
│Root     │ │  Conditions  │
└────┬────┘ └──────┬───────┘
     │             │
     ▼             ▼
┌────────────┐  ┌──────────────┐
│Check       │  │Check field,  │
│structure   │  │operator,     │
│& operator  │  │value         │
└─────┬──────┘  └──────┬───────┘
      │                │
      └────────┬───────┘
               │
               ▼
      ┌────────────────┐
      │Validate Nested │
      │Groups          │
      │(Recursive)     │
      └────────┬───────┘
               │
               ▼
      ┌────────────────┐
      │Collect Errors  │
      └────────┬───────┘
               │
               ▼
      ┌────────────────┐
      │Return Result:  │
      │{               │
      │  isValid: bool,│
      │  errors: []    │
      │}               │
      └────────────────┘
```

## Drag & Drop Flow

```
┌─────────────────┐
│  User Drags     │
│  Condition      │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  onDragStart()       │
│  setDraggedItem(id)  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Visual Feedback     │
│  (opacity: 0.5)      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  User Drops at       │
│  New Position        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  onDrop()            │
│  Reorder conditions  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  setDraggedItem(null)│
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  onChange()          │
│  Update parent state │
└──────────────────────┘
```

## Integration Pattern: BigQuery

```
┌─────────────────────┐
│  React Component    │
│  ┌───────────────┐  │
│  │AdvancedFilter │  │
│  │   Component   │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │
           ▼
┌──────────────────────┐
│  convertFilterToSQL()│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│  SQL WHERE Clause:           │
│  "status = 'ENABLED' AND..." │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Construct Full Query:       │
│  SELECT * FROM table         │
│  WHERE [generated clause]    │
│  LIMIT 100                   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Execute via MCP Tool:       │
│  run_bigquery_query()        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  BigQuery API                │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Results (100-400 rows)      │
│  Token-efficient data        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Display in React Component  │
│  (Table, Chart, etc.)        │
└──────────────────────────────┘
```

## State Management

```
Parent Component State:
┌────────────────────────────┐
│  const [filter, setFilter] │
│  = useState(initialFilter) │
└──────────┬─────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Pass as props│
    └──────┬───────┘
           │
           ▼
┌──────────────────────────────┐
│  <AdvancedFilter             │
│    value={filter}            │
│    onChange={setFilter}      │
│  />                          │
└──────────┬───────────────────┘
           │
    ┌──────┴────────┐
    ▼               ▼
Internal      User Makes
Render        Change
    │               │
    │               ▼
    │        ┌──────────────┐
    │        │ Update logic │
    │        └──────┬───────┘
    │               │
    │               ▼
    │        ┌──────────────┐
    │        │Call onChange │
    │        └──────┬───────┘
    │               │
    └───────────────┘
           │
           ▼
    Parent State
      Updated
           │
           ▼
    Component
    Re-renders
```

## Memory Structure

```
FilterGroup Object in Memory:
{
  id: "root-1234567890",                    ← Unique identifier
  operator: "AND",                          ← Logical operator
  enabled: true,                            ← Active state
  conditions: [                             ← Array of conditions
    {
      id: "cond-1",                         ← Unique identifier
      field: "campaign_name",               ← Selected field
      operator: "equals",                   ← Selected operator
      value: "Test Campaign",               ← User input
      dataType: "string",                   ← Field data type
      enabled: true                         ← Active state
    }
  ],
  groups: [                                 ← Nested groups (recursive)
    {
      id: "group-1",
      operator: "OR",
      enabled: true,
      conditions: [...],                    ← More conditions
      groups: [...]                         ← More nested groups
    }
  ]
}

Size in memory: ~2 KB per filter group
Max recommended depth: 3-5 levels
```

This visual representation helps understand the component's architecture, data flow, and interaction patterns!
