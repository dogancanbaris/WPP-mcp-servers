# Filter System Visual Guide

## Badge Color System

### Visual Identity

```
┌──────────────────────────────────────────────────────────────┐
│                    FILTER BADGE LEGEND                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔵 Global Filter - Applies to All Pages                     │
│     [Global]  ← Blue badge (bg-blue-500/10)                 │
│                                                              │
│  🟢 Page Filter - Applies to Current Page Only              │
│     [Page]    ← Green badge (bg-green-500/10)               │
│                                                              │
│  🟣 Component Filter - Applies to This Chart Only           │
│     [Component] ← Purple badge (bg-purple-500/10)           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Filter Scope Selector

### Global Filters Panel

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Global Filters                                      ℹ️  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Apply to:  ┌──────────────┬──────────────┐               │
│             │  All Pages   │ Current Page │               │
│             └──────────────┴──────────────┘               │
│             └─────────────────────────────┘               │
│                   ToggleGroup                             │
│                                                             │
│  3 filters active           [+ Add Filter] [🗑️ Clear All]  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 Date Range                                    ▼         │
│  ├─ [Global] Last 30 Days                    👁️  ×        │
│  └─ [Page] 2025-10-01 to 2025-10-22         👁️  ×        │
│                                                             │
│  🔍 Dimensions                                    ▼         │
│  ├─ [Global] Country: US, UK                 👁️  ×        │
│  ├─ [Page] Device: Mobile                    👁️  ×        │
│  └─ [Global] Campaign contains "Brand"       👁️  ×        │
│                                                             │
│  📊 Measures                                      ▼         │
│  └─ [Page] Cost > 1000                       👁️  ×        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Filters (Chart Setup)

### Sidebar → Setup Tab → Filters Section

```
┌─────────────────────────────────────────────────────────────┐
│  Chart Setup                                                │
├─────────────────────────────────────────────────────────────┤
│  ⋮                                                          │
│  [Chart Type]                                               │
│  [Data Source]                                              │
│  [Dimensions]                                               │
│  [Metrics]                                                  │
│  ─────────────────────────────────────────────────────────  │
│  Filters                              [+ Add filter]        │
│                                                             │
│  [Component] Campaign contains "Brand"           ×          │
│  [Component] Cost > 1000                         ×          │
│  [Component] Clicks > 100                        ×          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  [Date Range]                                               │
│  ⋮                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Complete Example: Dashboard with All Filter Types

```
┌──────────────────────────────────────────────────────────────────────┐
│  📊 Marketing Performance Dashboard                                  │
│  [🔍 Filters] [📅 Last 30 Days] [👤 User Menu]                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Active Filters:                                                     │
│  [Global] Last 30 Days    [Page] Country: US    [Global] Mobile     │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │ Campaign Performance    │  │ Conversion Funnel       │          │
│  ├─────────────────────────┤  ├─────────────────────────┤          │
│  │ Component Filters:      │  │ Component Filters:      │          │
│  │ [Component] Brand       │  │ [Component] Purchase    │          │
│  │                         │  │                         │          │
│  │ ▆▆▆▆▆▆▆▆▆▆▆            │  │     ████                │          │
│  │ ▆▆▆▆▆▆▆                 │  │     ██                  │          │
│  │ ▆▆▆▆▆                   │  │     █                   │          │
│  │                         │  │                         │          │
│  │ Inherits:               │  │ Inherits:               │          │
│  │ • [Global] Last 30 Days │  │ • [Global] Last 30 Days │          │
│  │ • [Page] Country: US    │  │ • [Page] Country: US    │          │
│  │ • [Global] Mobile       │  │ • [Global] Mobile       │          │
│  └─────────────────────────┘  └─────────────────────────┘          │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │ Top Performing Keywords                           │              │
│  ├───────────────────────────────────────────────────┤              │
│  │ Component Filters:                                │              │
│  │ [Component] Clicks > 100                          │              │
│  │                                                   │              │
│  │ Keyword         Clicks   CTR    Conversions       │              │
│  │ ─────────────────────────────────────────────     │              │
│  │ marketing tool   1,234   5.2%        45          │              │
│  │ analytics        987     4.8%        32          │              │
│  │ dashboard        856     4.5%        28          │              │
│  │                                                   │              │
│  │ Inherits:                                         │              │
│  │ • [Global] Last 30 Days                           │              │
│  │ • [Page] Country: US                              │              │
│  │ • [Global] Mobile                                 │              │
│  └───────────────────────────────────────────────────┘              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Filter Inheritance Rules

### Priority Order (Highest to Lowest)

```
┌────────────────────────────────────────────────────────┐
│  Filter Application Priority                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. Component Filters  🟣                              │
│     └─ Highest priority                               │
│     └─ Overrides global/page filters                  │
│     └─ Only affects this component                    │
│                                                        │
│  2. Page Filters  🟢                                   │
│     └─ Medium priority                                │
│     └─ Applies to all components on this page         │
│     └─ Can be overridden by component filters         │
│                                                        │
│  3. Global Filters  🔵                                 │
│     └─ Lowest priority                                │
│     └─ Applies to all pages and components            │
│     └─ Can be overridden by page/component filters    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Example Scenarios

#### Scenario 1: No Conflicts

```
Global:    [Date: Last 30 Days]
Page:      [Country: US]
Component: [Campaign: Brand]

Result: All three filters apply
→ Show Brand campaigns in US for last 30 days
```

#### Scenario 2: Override

```
Global:    [Device: All]
Page:      [Device: Mobile]
Component: [Device: Desktop]

Result: Component filter overrides
→ Show Desktop data only (component wins)
```

#### Scenario 3: Combination

```
Global:    [Date: Last 30 Days]
Page:      [Cost > 100]
Component: [Clicks > 50, CTR > 2%]

Result: All filters combine
→ Show data where:
  - Date in last 30 days (Global)
  - AND Cost > 100 (Page)
  - AND Clicks > 50 (Component)
  - AND CTR > 2% (Component)
```

## User Interface States

### Toggle Group States

```
┌──────────────────────────────────────┐
│ Default State (All Pages selected)   │
├──────────────────────────────────────┤
│ Apply to:  [All Pages] Current Page  │
│            ^^^^^^^^^^^                │
│            Selected (darker bg)       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Current Page Selected                │
├──────────────────────────────────────┤
│ Apply to:  All Pages [Current Page]  │
│                      ^^^^^^^^^^^^^^   │
│                      Selected         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Hover State                          │
├──────────────────────────────────────┤
│ Apply to:  [All Pages] Current Page  │
│                        ^^^^^^^^^^^    │
│                        Hover effect   │
└──────────────────────────────────────┘
```

### Filter Chip States

```
┌─────────────────────────────────────────┐
│ Enabled Filter (default)                │
├─────────────────────────────────────────┤
│ [Global] Campaign: Brand       👁️  ×    │
│          ^^^^^^^^^^^^^^^^^^^^           │
│          Full opacity, solid badge      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Disabled Filter (toggled off)           │
├─────────────────────────────────────────┤
│ [Global] Campaign: Brand       👁️‍🗨️  ×    │
│          ^^^^^^^^^^^^^^^^^^^^           │
│          50% opacity, outline badge     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Hover State (remove button)             │
├─────────────────────────────────────────┤
│ [Global] Campaign: Brand       👁️  [×]  │
│                                     ^^   │
│                               Hover: red │
└─────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (>1024px)

```
Full width filter chips, all visible
[Global] Date: Last 30 Days  👁️  ×
[Page] Country: US, UK, CA  👁️  ×
[Component] Campaign contains "Brand"  👁️  ×
```

### Tablet (768px - 1024px)

```
Wrapped chips
[Global] Date: Last 30 Days  👁️  ×
[Page] Country: US, UK...  👁️  ×
[Component] Campaign...  👁️  ×
```

### Mobile (<768px)

```
Stacked chips, truncated text
[Global] Last 30 Days  👁️  ×
[Page] Country: US...  👁️  ×
[Component] Campai...  👁️  ×
```

## Accessibility

### Keyboard Navigation

```
Tab Order:
1. Filters Button
2. Scope Toggle (All Pages)
3. Scope Toggle (Current Page)
4. Add Filter Button
5. Clear All Button
6. Each filter chip:
   a. Toggle enabled/disabled button
   b. Remove button

Shortcuts:
- Enter/Space: Activate button
- Arrow keys: Navigate toggle group
- Escape: Close filter panel
```

### Screen Reader Announcements

```
"Filters button, 3 filters active"
→ Click
"Global filters panel opened"
"Apply to: Toggle group, All Pages selected"
"3 filters active"
"Add filter button"
"Clear all filters button"

"Date range section, 1 filter"
"Global scope, Last 30 Days filter, enabled"
"Toggle enabled button"
"Remove filter button"
```

## Animation States

### Panel Slide-In

```
Closed:  [Filter panel off-screen top]
         ↓ 300ms ease-out
Open:    [Filter panel visible from top]
         ↓ Hover on backdrop
Closing: [Filter panel slides up]
         ↓ 200ms ease-in
Closed:  [Filter panel hidden]
```

### Badge Transitions

```
Scope Change:
[Global] → [Page]
Blue fade out 150ms → Green fade in 150ms

Enable/Disable:
Solid → Outline
Opacity 1.0 → 0.5 (200ms)
```

## Color Palette Reference

```css
/* Global (All Pages) */
.global-filter {
  background: rgba(59, 130, 246, 0.1);  /* bg-blue-500/10 */
  color: rgb(29, 78, 216);              /* text-blue-700 */
  border-color: rgba(59, 130, 246, 0.2); /* border-blue-500/20 */
}

/* Page (Current Page) */
.page-filter {
  background: rgba(34, 197, 94, 0.1);   /* bg-green-500/10 */
  color: rgb(21, 128, 61);              /* text-green-700 */
  border-color: rgba(34, 197, 94, 0.2); /* border-green-500/20 */
}

/* Component */
.component-filter {
  background: rgba(168, 85, 247, 0.1);  /* bg-purple-500/10 */
  color: rgb(126, 34, 206);             /* text-purple-700 */
  border-color: rgba(168, 85, 247, 0.2); /* border-purple-500/20 */
}
```

## Best Practices

### When to Use Each Filter Type

✅ **Global Filters (All Pages):**
- Date ranges that apply across entire dashboard
- User role/department filters
- Data quality filters (e.g., exclude test data)
- Currency/region settings

✅ **Page Filters (Current Page):**
- Focus on specific marketing channels
- Time period comparisons (This week vs Last week)
- Geographic/demographic segments
- Campaign type filtering

✅ **Component Filters:**
- Metric thresholds (Cost > $100)
- Top N filtering (Top 10 campaigns)
- Specific campaign/keyword selection
- Data exploration and drill-down

### Filter Naming Conventions

```
Good:
✅ "Last 30 Days"
✅ "Country: US, UK, Canada"
✅ "Mobile Devices Only"
✅ "High-Spend Campaigns (>$1000)"

Bad:
❌ "filter_1"
❌ "device eq mobile"
❌ "Date range filter applied"
❌ "asdf"
```
