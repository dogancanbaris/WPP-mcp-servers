# Auto-Save System Documentation

## Overview

The WPP Analytics Platform Dashboard Builder features a comprehensive auto-save system with visual indicators, conflict detection, and automatic retry logic. This document explains how the system works and how to use it.

## Features

### 1. Auto-Save (2-second delay)
- Automatically saves dashboard changes after 2 seconds of inactivity
- Debounced to prevent excessive API calls
- Triggered after any state-changing action (add/remove/update components, rows, etc.)

### 2. Visual Status Indicators
The system displays 5 distinct states:

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| **Saved** | ✓ CheckCircle | Green | All changes saved successfully |
| **Saving** | Cloud (animated) | Blue | Save operation in progress |
| **Unsaved** | Clock | Yellow | Changes pending, auto-save scheduled |
| **Error** | AlertCircle | Red | Save failed, retrying automatically |
| **Conflict** | AlertTriangle | Orange | Version conflict detected |

### 3. Conflict Detection
- Detects when dashboard was modified by another user/tab
- Compares `lastSyncedVersion` with remote `updatedAt` timestamp
- Shows conflict resolution dialog with three options:
  - **Keep Local**: Overwrite remote with your changes
  - **Use Remote**: Discard local changes, use remote version
  - **Cancel**: Keep conflict dialog open for review

### 4. Automatic Retry with Exponential Backoff
- Retries up to 3 times on save failure
- Exponential backoff: 1s → 2s → 4s
- Console logging for debugging retry attempts
- Stops retrying after max attempts

### 5. Browser Unload Warning
- Warns user before closing/refreshing if unsaved changes exist
- Cleans up timers on page unload
- Prevents accidental data loss

## Architecture

### State Management (dashboardStore.ts)

```typescript
interface DashboardStore {
  // Auto-save state
  saveStatus: SaveStatus;           // Current save state
  lastSaved?: Date;                 // Timestamp of last successful save
  lastSyncedVersion?: string;       // Remote version timestamp
  saveAttempts: number;             // Current retry count
  conflictData?: ConflictData;      // Conflict details if detected

  // Actions
  autoSave: () => void;                                  // Trigger auto-save
  save: (id: string, force?: boolean) => Promise<void>; // Manual save
  resolveConflict: (strategy) => void;                   // Handle conflicts
}
```

### Key Methods

#### `autoSave()`
```typescript
autoSave: () => {
  const state = get();

  if (!state.isDirty || !state.config.id) return;

  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  set({ saveStatus: 'unsaved' });

  autoSaveTimer = setTimeout(() => {
    const currentState = get();
    if (currentState.isDirty && currentState.config.id) {
      currentState.save(currentState.config.id);
    }
  }, AUTO_SAVE_DELAY);
}
```

**Trigger Points:**
- After any history-changing action via `addToHistory()`
- Automatically debounced with 2-second delay
- Cancels previous timer if new changes occur

#### `save(id, force)`
```typescript
save: async (id: string, force: boolean = false) => {
  const state = get();

  // Skip if no changes (unless forced)
  if (!state.isDirty && !force) return;

  // Clear pending auto-save
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  set({ isSaving: true, saveStatus: 'saving', error: undefined });

  try {
    // Save to API
    const response = await saveDashboardAPI(id, configToSave);

    // Conflict detection
    if (!force && isRemoteNewer()) {
      set({ saveStatus: 'conflict', conflictData: {...} });
      return;
    }

    // Success
    set({
      saveStatus: 'saved',
      lastSaved: new Date(),
      lastSyncedVersion: savedDashboard.updatedAt,
      saveAttempts: 0
    });
  } catch (error) {
    // Retry logic
    const newAttempts = state.saveAttempts + 1;
    set({ saveStatus: 'error', saveAttempts: newAttempts });

    if (newAttempts < MAX_RETRY_ATTEMPTS) {
      const retryDelay = RETRY_DELAY_BASE * Math.pow(2, newAttempts - 1);
      retryTimer = setTimeout(() => {
        get().save(id, force);
      }, retryDelay);
    }
  }
}
```

**Parameters:**
- `id`: Dashboard ID to save
- `force`: If true, bypasses conflict detection (used when resolving conflicts)

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: After 1 second
- Attempt 3: After 2 seconds
- Attempt 4: After 4 seconds

#### `resolveConflict(strategy)`
```typescript
resolveConflict: (strategy: 'local' | 'remote' | 'cancel') => {
  switch (strategy) {
    case 'local':
      // Force save local version
      set({ conflictData: undefined, saveStatus: 'unsaved' });
      state.save(state.config.id, true); // force=true
      break;

    case 'remote':
      // Accept remote version
      set({
        config: conflictData.remoteVersion,
        history: [deepClone(conflictData.remoteVersion)],
        isDirty: false,
        saveStatus: 'saved',
        lastSaved: new Date(conflictData.remoteVersion.updatedAt),
        lastSyncedVersion: conflictData.remoteVersion.updatedAt
      });
      break;

    case 'cancel':
      // Keep conflict state for review
      set({ saveStatus: 'conflict' });
      break;
  }
}
```

## UI Components

### SaveStatusIndicator Component

**Location:** `/frontend/src/components/dashboard-builder/SaveStatusIndicator.tsx`

**Usage:**
```tsx
import { SaveStatusIndicator } from '@/components/dashboard-builder/SaveStatusIndicator';

// In toolbar or header
<SaveStatusIndicator showLabel={true} className="ml-4" />
```

**Props:**
- `className?: string` - Additional Tailwind classes
- `showLabel?: boolean` - Show text label (default: true)

**Features:**
- Real-time status updates
- Animated pulse for "saving" state
- Time-ago display ("Saved 5s ago", "Saved 2m ago")
- Clickable when conflict detected
- Opens conflict resolution dialog automatically

### Conflict Resolution Dialog

**Features:**
- Side-by-side comparison of local vs remote versions
- Shows component counts and last modified timestamps
- Warning message explaining consequences
- Three action buttons: Cancel, Use Remote, Keep Local
- Color-coded for clarity (blue=local, purple=remote)

**User Flow:**
1. Conflict detected → Dialog opens automatically
2. User reviews differences in component counts and timestamps
3. User chooses resolution strategy:
   - **Keep Local**: Forces save of local version (overwrites remote)
   - **Use Remote**: Discards local changes, loads remote version
   - **Cancel**: Keeps dialog open, allows more time to review

## Selector Hooks

Optimized hooks for accessing auto-save state:

```typescript
// Status and timing
const saveStatus = useSaveStatus();      // 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict'
const lastSaved = useLastSaved();        // Date | undefined
const conflictData = useConflictData();  // ConflictData | undefined

// General state
const isDirty = useIsDirty();            // boolean
const isSaving = useDashboardStore((state) => state.isSaving); // boolean
const saveAttempts = useDashboardStore((state) => state.saveAttempts); // number
```

## Configuration Constants

Located at top of `dashboardStore.ts`:

```typescript
const AUTO_SAVE_DELAY = 2000;      // 2 seconds
const MAX_RETRY_ATTEMPTS = 3;      // Retry up to 3 times
const RETRY_DELAY_BASE = 1000;     // 1 second base delay
```

To customize:
1. Change constants in `/frontend/src/store/dashboardStore.ts`
2. Rebuild TypeScript: `npm run build`

## Testing Scenarios

### Test 1: Basic Auto-Save
1. Open dashboard builder
2. Add a component
3. Wait 2 seconds
4. Status should change: Unsaved → Saving → Saved
5. Check timestamp updates: "Saved just now"

### Test 2: Rapid Changes (Debouncing)
1. Add component
2. Immediately add another component
3. Add third component
4. Only one save request should fire after 2 seconds of final change

### Test 3: Network Error Recovery
1. Disconnect network
2. Make changes
3. Status: Unsaved → Saving → Error
4. Reconnect network
5. System automatically retries (1s, 2s, 4s)
6. Status: Error → Saving → Saved

### Test 4: Conflict Detection
1. Open dashboard in Tab 1
2. Open same dashboard in Tab 2
3. In Tab 2: Add component, wait for save
4. In Tab 1: Add different component, wait for save
5. Conflict dialog appears in Tab 1
6. Choose resolution strategy

### Test 5: Browser Unload Warning
1. Make changes to dashboard
2. Wait for "Unsaved" status (before 2s auto-save)
3. Try to close tab
4. Browser warning appears: "You have unsaved changes..."
5. Cancel or proceed

## API Requirements

The auto-save system expects the following from the backend API:

### `saveDashboardAPI(id, config)`
```typescript
interface SaveResponse {
  success: boolean;
  dashboard?: DashboardConfig;
  error?: string;
}
```

**Expected behavior:**
- Returns updated dashboard with fresh `updatedAt` timestamp
- Uses optimistic locking or version checking for conflict detection
- Handles both create (new ID) and update (existing ID) operations

### `loadDashboardAPI(id)`
```typescript
interface LoadResponse {
  success: boolean;
  dashboard?: DashboardConfig;
  error?: string;
}
```

**Expected behavior:**
- Returns full dashboard config
- Includes `updatedAt` timestamp for conflict detection
- Returns 404 if dashboard not found

## Performance Considerations

### Memory Usage
- History limited to 50 states (configurable)
- Deep cloning only occurs on history snapshots
- Conflict data stored only when conflict detected

### Network Usage
- Auto-save triggers only after 2-second idle period
- Debouncing prevents excessive API calls
- Retry logic uses exponential backoff (not constant interval)

### Render Optimization
- Selector hooks prevent unnecessary re-renders
- Status indicator updates independently
- Conflict dialog lazy-loaded

## Troubleshooting

### Auto-save not triggering
**Check:**
1. Is `config.id` set? (Dashboard must be saved once manually first)
2. Is `isDirty` true? (Changes must be tracked via `addToHistory()`)
3. Are you waiting full 2 seconds?
4. Check browser console for errors

### Conflict dialog not appearing
**Check:**
1. Is `lastSyncedVersion` initialized after load?
2. Does API return correct `updatedAt` timestamp?
3. Are remote changes actually newer?
4. Check Zustand DevTools (development mode)

### Retry not working
**Check:**
1. Is error actually recoverable? (Not 404/400)
2. Are you reaching max retry attempts (3)?
3. Check console for retry logs
4. Verify network connectivity restored

### Browser warning not showing
**Check:**
1. Is `isDirty` true or `saveStatus` unsaved/saving?
2. Modern browsers may suppress warnings
3. Try with different browser
4. Check console for event listener errors

## Future Enhancements

Potential improvements for v2:

1. **Offline Support**: LocalStorage fallback when network unavailable
2. **Collaboration**: Real-time multi-user editing with WebSockets
3. **Version History**: View and restore previous saved versions
4. **Merge Conflicts**: Three-way merge for simultaneous edits
5. **Save Queue**: Queue multiple saves during network outage
6. **Performance Monitoring**: Track save latency and success rates
7. **Undo/Redo Sync**: Sync history across tabs
8. **Partial Saves**: Save only changed components (delta updates)

## Related Documentation

- `/frontend/docs/DASHBOARD_BUILDER.md` - Dashboard builder architecture
- `/frontend/docs/STATE_MANAGEMENT.md` - Zustand store patterns
- `/docs/api-reference/dashboard-api.md` - Backend API specification
- `/frontend/src/store/dashboardStore.ts` - Source code

## Support

For issues or questions:
1. Check Zustand DevTools in development mode
2. Review browser console logs
3. Test network requests in DevTools Network tab
4. Refer to this documentation
5. Contact frontend team
