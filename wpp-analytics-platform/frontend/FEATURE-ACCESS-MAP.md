# Feature Access Map

Visual guide showing all ways to access each feature in the dashboard builder.

## Version History

```
┌─────────────────────────────────────────────────────┐
│  EditorTopbar - Menu Bar                            │
│  ┌────────────────────────────────────────────┐    │
│  │ File ▼                                     │    │
│  │  ├─ New                                    │    │
│  │  ├─ Make a copy                            │    │
│  │  ├─ Rename                                 │    │
│  │  ├─ Download                               │    │
│  │  ├─ Schedule email                         │    │
│  │  ├─ [Version history] ◄──────────────┐    │    │
│  │  ├─ Make a template                   │    │    │
│  │  └─ Report settings                   │    │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                                                │
                                                │ Opens
                                                ▼
                          ┌─────────────────────────────┐
                          │  Version History Dialog     │
                          │  • Timeline view            │
                          │  • Compare versions         │
                          │  • Restore functionality    │
                          │  • Export versions          │
                          └─────────────────────────────┘
```

## Global Filters

```
┌──────────────────────────────────────────────────────────────┐
│  EditorTopbar - Toolbar (Center)                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │ [Add chart ▼] [Tools ▼] [Controls ▼] [Align ▼]  │       │
│  │ [Filters] ◄──────────┐  [Theme and layout]      │       │
│  └──────────────────────┼──────────────────────────┘       │
└─────────────────────────┼─────────────────────────────────┘
                          │ Toggles
                          ▼
      ┌──────────────────────────────────────────┐
      │  Global Filters Bar                      │
      │  [Date Range] [Campaign: X, Y, Z]        │
      │  [Cost > 1000]  [+ Add Filter]           │
      └──────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  SettingsSidebar                                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Component Settings          [Setup|Style|Dashboard] │    │
│  │ ┌────────────────────────────────────────────┐   │       │
│  │ │ Dashboard Settings                         │   │       │
│  │ │ [Global Filters] ◄────────┐               │   │       │
│  │ │ [Theme Editor]             │               │   │       │
│  │ │ [Keyboard Shortcuts]       │               │   │       │
│  │ └────────────────────────────┼───────────────┘   │       │
│  └──────────────────────────────┼───────────────────┘       │
└─────────────────────────────────┼──────────────────────────┘
                                  │ Opens
                                  ▼
                 ┌────────────────────────────────┐
                 │  Global Filters Dialog         │
                 │  • Add date range filters      │
                 │  • Add dimension filters       │
                 │  • Add measure filters         │
                 │  • Enable/disable filters      │
                 └────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  SettingsSidebar (No Component Selected)                     │
│  ┌──────────────────────────────────────────────────┐       │
│  │ No Component Selected                            │       │
│  │                                                  │       │
│  │ Quick Actions:                                   │       │
│  │ [Global Filters] ◄────────┐                     │       │
│  │ [Theme Editor]             │                     │       │
│  │ [Keyboard Shortcuts]       │                     │       │
│  └────────────────────────────┼──────────────────────┘       │
└─────────────────────────────────┼──────────────────────────┘
                                  │ Opens
                                  └──────────┐
                                             │
                                             ▼
                            Same dialog as above
```

## Theme Editor

```
┌──────────────────────────────────────────────────────────────┐
│  EditorTopbar - Toolbar (Center)                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │ [Add chart ▼] [Tools ▼] [Controls ▼] [Align ▼]  │       │
│  │ [Filters]  [Theme and layout] ◄────┐            │       │
│  └────────────────────────────────────┼────────────┘       │
└─────────────────────────────────────────┼─────────────────────┘
                                          │ Opens
                                          ▼
                        ┌─────────────────────────────────┐
                        │  Theme Editor (Full Screen)     │
                        │  • Color palettes               │
                        │  • Typography settings          │
                        │  • Spacing & border radius      │
                        │  • Shadows & effects            │
                        │  • Save/Load/Export/Import      │
                        └─────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  SettingsSidebar - Dashboard Tab                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Dashboard Settings                               │       │
│  │ [Global Filters]                                 │       │
│  │ [Theme Editor] ◄────────┐                        │       │
│  │ [Keyboard Shortcuts]     │                        │       │
│  └──────────────────────────┼──────────────────────┘       │
└─────────────────────────────┼─────────────────────────────┘
                              │ Opens
                              └──────────┐
                                         │
                                         ▼
                        Same full-screen editor as above

┌──────────────────────────────────────────────────────────────┐
│  SettingsSidebar - Quick Actions                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Quick Actions:                                   │       │
│  │ [Global Filters]                                 │       │
│  │ [Theme Editor] ◄────────┐                        │       │
│  │ [Keyboard Shortcuts]     │                        │       │
│  └──────────────────────────┼──────────────────────┘       │
└─────────────────────────────┼─────────────────────────────┘
                              │ Opens
                              └──────────┐
                                         │
                                         ▼
                        Same full-screen editor as above
```

## Keyboard Shortcuts

```
┌──────────────────────────────────────────────────────────────┐
│  Global Shortcut (Works Anywhere)                            │
│                                                              │
│  Press: Ctrl+/ ◄───────────────────┐                        │
│                                     │                        │
└─────────────────────────────────────┼───────────────────────┘
                                      │ Opens
                                      │
┌─────────────────────────────────────┼────────────────────────┐
│  EditorTopbar - Menu Bar            │                        │
│  ┌──────────────────────────────────┼──────────┐            │
│  │ Help ▼                           │          │            │
│  │  ├─ Documentation                │          │            │
│  │  ├─ [Keyboard shortcuts] ◄───────┼─────┐    │            │
│  │  ├─ Video tutorials              │     │    │            │
│  │  ├─ Report an issue              │     │    │            │
│  │  └─ Send feedback                │     │    │            │
│  └──────────────────────────────────┘     │    │            │
└────────────────────────────────────────────┼────┼───────────┘
                                             │    │ Opens
┌────────────────────────────────────────────┼────┼───────────┐
│  EditorTopbar - Toolbar (Right)            │    │            │
│  ┌─────────────────────────────────────────┼────┼──┐        │
│  │ [Share ▼] [View] [More ▼] [Help ▼] ◄───┼────┼──┤        │
│  │   └─ [Keyboard shortcuts] ◄─────────────┼────┘  │        │
│  │ [Profile] [Pause]                       │       │        │
│  └─────────────────────────────────────────┘       │        │
└────────────────────────────────────────────────────┼────────┘
                                                      │ Opens
┌─────────────────────────────────────────────────────┼────────┐
│  SettingsSidebar - Dashboard Tab                    │        │
│  ┌──────────────────────────────────────────────────┼───┐   │
│  │ Dashboard Settings                               │   │   │
│  │ [Global Filters]                                 │   │   │
│  │ [Theme Editor]                                   │   │   │
│  │ [Keyboard Shortcuts] ◄───────────────────────────┼───┤   │
│  └──────────────────────────────────────────────────┘   │   │
└─────────────────────────────────────────────────────────┼──┘
                                                          │ Opens
┌─────────────────────────────────────────────────────────┼──┐
│  SettingsSidebar - Quick Actions                        │  │
│  ┌──────────────────────────────────────────────────────┼──┤
│  │ Quick Actions:                                       │  │
│  │ [Global Filters]                                     │  │
│  │ [Theme Editor]                                       │  │
│  │ [Keyboard Shortcuts] ◄───────────────────────────────┼──┘
│  └──────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
                            │
                            │ All paths lead to:
                            ▼
            ┌────────────────────────────────────┐
            │  Keyboard Shortcuts Dialog         │
            │  • Searchable shortcut list        │
            │  • Grouped by category             │
            │  • Customize key bindings          │
            │  • Visual key recorder             │
            │  • Reset to defaults               │
            └────────────────────────────────────┘
```

## Access Summary

| Feature | Access Points | Total |
|---------|--------------|-------|
| **Version History** | File menu | 1 |
| **Global Filters** | Toolbar button, Settings Dashboard tab, Quick Actions | 3 |
| **Theme Editor** | Toolbar button, Settings Dashboard tab, Quick Actions | 3 |
| **Keyboard Shortcuts** | Global shortcut (Ctrl+/), Help menu, Help dropdown, Settings Dashboard tab, Quick Actions | 5 |

## Design Principles

### Redundancy
Every feature is accessible from multiple locations, ensuring users can always find what they need regardless of their workflow.

### Discoverability
- Toolbar buttons are visible and labeled
- Menu items use familiar naming
- Quick Actions appear when relevant
- Global shortcuts work anywhere

### Consistency
- Similar features grouped together
- Same dialog/component regardless of access point
- Predictable keyboard shortcuts
- Unified visual design

### Progressive Disclosure
- Basic features in toolbar (1 click)
- Advanced features in menus (2 clicks)
- Dashboard-wide settings in sidebar
- Global shortcuts for power users

## User Workflows

### Casual User (Mouse-Heavy)
1. Clicks toolbar buttons for common actions
2. Uses Settings sidebar for configuration
3. Accesses menus for less common features

### Power User (Keyboard-Heavy)
1. Uses Ctrl+/ to learn shortcuts
2. Customizes key bindings
3. Uses shortcuts for all actions
4. Rarely touches mouse

### New User (Discovery)
1. Explores menus to learn features
2. Discovers Quick Actions in sidebar
3. Gradually learns toolbar buttons
4. Eventually discovers shortcuts

## Accessibility Paths

### Screen Reader Users
- All buttons have proper labels
- Menus are keyboard navigable
- Dialogs announce correctly
- Focus management works

### Keyboard-Only Users
- Tab navigation works everywhere
- Enter/Space activate buttons
- Escape closes dialogs
- Arrow keys navigate menus

### Low Vision Users
- High contrast buttons
- Large click targets
- Clear visual hierarchy
- Consistent spacing
