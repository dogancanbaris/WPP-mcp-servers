# PresetFilter Architecture

## Component Hierarchy

```
PresetFilter (Main Component)
├── Card Container
│   ├── CardHeader
│   │   ├── Title & Description
│   │   └── Action Buttons
│   │       ├── Favorites Toggle Button
│   │       └── Save Current Dialog Trigger
│   │           └── Save Dialog
│   │               ├── Name Input
│   │               ├── Description Input
│   │               ├── Filter Count Display
│   │               └── Save Button
│   │
│   ├── CardContent
│   │   ├── Empty State (if no presets)
│   │   │   ├── Icon
│   │   │   └── Help Text
│   │   │
│   │   └── Preset List (if presets exist)
│   │       └── For Each Preset:
│   │           ├── Favorite Star Button
│   │           ├── Preset Info
│   │           │   ├── Name & Applied Badge
│   │           │   ├── Description
│   │           │   └── Metadata (filter count, time, usage)
│   │           └── Actions
│   │               ├── Apply Button
│   │               └── Dropdown Menu
│   │                   ├── Edit
│   │                   ├── Duplicate
│   │                   └── Delete
│   │
│   └── CardFooter
│       └── Statistics (preset count, favorites count)
│
├── Edit Dialog
│   ├── Name Input
│   ├── Description Input
│   └── Save/Cancel Buttons
│
└── Delete Confirmation Dialog
    ├── Warning Message
    └── Delete/Cancel Buttons
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Dashboard Parent                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ currentFilters: FilterCombination                    │   │
│  │ {                                                     │   │
│  │   dimensions: ['GoogleAds.campaignName'],            │   │
│  │   filters: [{...}],                                  │   │
│  │   dateRange: {...}                                   │   │
│  │ }                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              <PresetFilter />                        │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ Props:                                         │  │   │
│  │  │ - currentFilters (read)                       │  │   │
│  │  │ - onApplyPreset (callback)                    │  │   │
│  │  │ - storageKey                                  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                      │                               │   │
│  │                      ▼                               │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ Internal State:                                │  │   │
│  │  │ - presets: FilterPreset[]                     │  │   │
│  │  │ - appliedPresetId: string | null              │  │   │
│  │  │ - showFavoritesOnly: boolean                  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                      │                               │   │
│  │                      ▼                               │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ localStorage                                   │  │   │
│  │  │ Key: storageKey                               │  │   │
│  │  │ Value: JSON.stringify(presets)                │  │   │
│  │  │                                               │  │   │
│  │  │ Automatic sync:                               │  │   │
│  │  │ - Load on mount                               │  │   │
│  │  │ - Save on presets change                      │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ onApplyPreset(preset)                                │   │
│  │ → Update dashboard filters                          │   │
│  │ → Refresh all charts                                │   │
│  │ → Update URL params (optional)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
User Action                  State Change                   Side Effect
─────────────────────────────────────────────────────────────────────────
Click "Save Current"    →   saveDialogOpen = true     →   Show dialog

Enter preset name       →   presetName = value        →   Enable save button

Click "Save Preset"     →   presets = [...presets,    →   Close dialog
                            newPreset]                    Save to localStorage
                                                          Reset form

Click "Apply"           →   appliedPresetId = id      →   Call onApplyPreset()
                            preset.usageCount++           Update localStorage

Click star icon         →   preset.isFavorite =       →   Update localStorage
                            !preset.isFavorite

Toggle favorites filter →   showFavoritesOnly =       →   Re-filter presets
                            !showFavoritesOnly

Click "Edit"            →   editingPreset = preset    →   Show edit dialog
                            Fill form with values

Update preset           →   preset.name = newName     →   Update localStorage
                            preset.updatedAt = now

Click "Delete"          →   deleteDialogOpen = true   →   Show confirmation

Confirm delete          →   presets = presets         →   Update localStorage
                            .filter(p => p.id !== id)     Clear appliedPresetId
```

## Hook Architecture: useFilterPresets

```
useFilterPresets(storageKey)
│
├── State
│   └── presets: FilterPreset[]
│
├── Effects
│   ├── Load from localStorage on mount
│   └── Save to localStorage on presets change
│
└── Return Object
    ├── presets (readonly)
    ├── savePreset(name, filters, description?)
    │   └── Creates new preset with metadata
    ├── applyPreset(preset)
    │   └── Increments usageCount, returns filters
    ├── deletePreset(presetId)
    │   └── Removes preset from array
    ├── toggleFavorite(presetId)
    │   └── Flips isFavorite boolean
    └── updatePreset(presetId, updates)
        └── Merges updates into preset
```

## FilterCombination Structure

```typescript
FilterCombination {
  // Cube.js dimension selection
  dimensions?: string[]
  // Example: ['GoogleAds.campaignName', 'GoogleAds.adGroupName']

  // Cube.js measure selection
  metrics?: string[]
  // Example: ['GoogleAds.clicks', 'GoogleAds.cost', 'GoogleAds.conversions']

  // Field filters (converted to Cube.js filters)
  filters?: Array<{
    field: string        // 'GoogleAds.status'
    operator: string     // 'equals', 'greaterThan', etc.
    value: string | string[]  // 'ENABLED' or ['ENABLED', 'PAUSED']
  }>

  // Date range (converted to Cube.js timeDimensions)
  dateRange?: {
    type: 'preset' | 'custom'
    preset?: string         // 'last_30_days', 'last_7_days', etc.
    startDate?: string      // '2025-01-01'
    endDate?: string        // '2025-01-31'
  }

  // Data source identifier
  dataSource?: string
  // Example: 'GoogleAds', 'SearchConsole', 'Analytics'

  // Custom properties (extensible)
  [key: string]: unknown
  // Allows for platform-specific fields
}
```

## Cube.js Integration Flow

```
FilterCombination
      │
      ▼
┌─────────────────────────────────────┐
│ Convert to Cube.js Query            │
│                                     │
│ dimensions → query.dimensions       │
│ metrics → query.measures            │
│ filters → query.filters             │
│ dateRange → query.timeDimensions    │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ Cube.js Query Object                │
│ {                                   │
│   measures: [                       │
│     'GoogleAds.clicks',             │
│     'GoogleAds.cost'                │
│   ],                                │
│   dimensions: [                     │
│     'GoogleAds.campaignName'        │
│   ],                                │
│   filters: [{                       │
│     member: 'GoogleAds.status',     │
│     operator: 'equals',             │
│     values: ['ENABLED']             │
│   }],                               │
│   timeDimensions: [{                │
│     dimension: 'GoogleAds.date',    │
│     dateRange: 'last 30 days'       │
│   }]                                │
│ }                                   │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ useCubeQuery(query)                 │
│ ↓                                   │
│ Execute against Cube.js             │
│ ↓                                   │
│ Cube.js → BigQuery                  │
│ ↓                                   │
│ Return aggregated results           │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ Chart Component                     │
│ Renders data visualization          │
└─────────────────────────────────────┘
```

## Storage Schema

```json
// localStorage['wpp-filter-presets']
[
  {
    "id": "preset-1234567890-abc123",
    "name": "High ROI Campaigns",
    "description": "Campaigns with ROI > 300% in last 30 days",
    "filters": {
      "dimensions": ["GoogleAds.campaignName"],
      "metrics": ["GoogleAds.cost", "GoogleAds.conversions"],
      "filters": [
        {
          "field": "GoogleAds.roas",
          "operator": "greaterThan",
          "value": "300"
        }
      ],
      "dateRange": {
        "type": "preset",
        "preset": "last_30_days"
      },
      "dataSource": "GoogleAds"
    },
    "isFavorite": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T14:22:00.000Z",
    "usageCount": 15
  },
  {
    "id": "preset-9876543210-xyz789",
    "name": "Mobile Traffic Only",
    "description": "All campaigns filtered to mobile devices",
    "filters": {
      "dimensions": ["GoogleAds.campaignName", "GoogleAds.device"],
      "filters": [
        {
          "field": "GoogleAds.device",
          "operator": "equals",
          "value": "MOBILE"
        }
      ],
      "dateRange": {
        "type": "preset",
        "preset": "last_7_days"
      }
    },
    "isFavorite": false,
    "createdAt": "2025-01-18T09:15:00.000Z",
    "updatedAt": "2025-01-18T09:15:00.000Z",
    "usageCount": 3
  }
]
```

## Event Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│ Component Mount                                               │
├──────────────────────────────────────────────────────────────┤
│ 1. useEffect(() => {                                         │
│      Load from localStorage[storageKey]                      │
│      Parse JSON → setPresets()                              │
│    }, [storageKey])                                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ User Interacts with Preset                                    │
├──────────────────────────────────────────────────────────────┤
│ - Click "Save Current"                                       │
│ - Click "Apply" on preset                                    │
│ - Click star to favorite                                     │
│ - Click "Edit" in dropdown                                   │
│ - Click "Delete" in dropdown                                 │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ State Update                                                  │
├──────────────────────────────────────────────────────────────┤
│ setPresets(newPresets)                                       │
│ ↓                                                            │
│ Triggers useEffect                                           │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ Persist to Storage                                            │
├──────────────────────────────────────────────────────────────┤
│ 2. useEffect(() => {                                         │
│      localStorage.setItem(                                   │
│        storageKey,                                           │
│        JSON.stringify(presets)                              │
│      )                                                       │
│    }, [presets, storageKey])                                │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ Re-render with Updated Presets                               │
├──────────────────────────────────────────────────────────────┤
│ - Updated list display                                       │
│ - Updated counts in footer                                   │
│ - Updated applied indicator                                  │
└──────────────────────────────────────────────────────────────┘
```

## Multi-Dashboard Pattern

```
Dashboard A (Google Ads)
├── storageKey: 'google-ads-dashboard-presets'
├── Presets:
│   ├── "High ROI Campaigns"
│   ├── "Mobile Only"
│   └── "Search Network Only"

Dashboard B (Search Console)
├── storageKey: 'gsc-dashboard-presets'
├── Presets:
│   ├── "Top 3 Rankings"
│   ├── "Page 2 Opportunities"
│   └── "Branded Queries"

Dashboard C (Analytics)
├── storageKey: 'analytics-dashboard-presets'
├── Presets:
│   ├── "High Value Users"
│   ├── "Mobile Traffic"
│   └── "Landing Page Performance"

Shared Storage Keys → Isolated Preset Lists
```

## Error Handling Flow

```
Operation                  Try                     Catch
───────────────────────────────────────────────────────────────
Load from localStorage → Parse JSON           → Log error
                        Set presets              Clear storage
                                                 Use empty array

Save to localStorage   → Stringify JSON        → Log error
                        Write to storage         Show toast
                                                 Keep local state

Apply preset          → Call onApplyPreset    → Log error
                        Update usage count       Revert state
                        Update localStorage      Show error UI
```

## Responsive Behavior

```
Desktop (≥1024px)
├── Full sidebar layout
├── Preset cards show all metadata
├── Dropdown menus
└── Tooltips on hover

Tablet (768px - 1023px)
├── Narrower sidebar
├── Truncated descriptions
├── Compact buttons
└── Touch-friendly tap targets

Mobile (<768px)
├── Full-width layout
├── Stacked preset cards
├── Bottom sheet for actions
└── Larger touch targets
```

## Performance Optimizations

```
1. Lazy Loading
   - Load from localStorage only on mount
   - Don't refetch on every render

2. Memoization
   - useCallback for all handlers
   - Prevent unnecessary re-renders
   - Stable function references

3. Efficient Sorting
   - Sort in-memory array
   - Don't re-sort on every render
   - Use stable sort algorithm

4. Batched Updates
   - Single localStorage write per state change
   - Group related updates
   - Debounce if needed

5. Small Bundle
   - Tree-shakeable exports
   - No unnecessary dependencies
   - Gzipped: ~15KB
```

## Security Considerations

```
1. XSS Prevention
   - Sanitize preset names/descriptions
   - Don't render HTML from user input
   - Use React's built-in escaping

2. Storage Limits
   - Enforce maxPresets limit
   - Check storage quota
   - Handle QuotaExceededError

3. Data Validation
   - Validate JSON structure
   - Check required fields
   - Type guard for FilterCombination

4. Injection Prevention
   - Don't eval() imported presets
   - Validate all preset properties
   - Whitelist allowed filter operators
```

This architecture ensures a robust, scalable, and maintainable preset management system for the WPP Analytics Platform.
