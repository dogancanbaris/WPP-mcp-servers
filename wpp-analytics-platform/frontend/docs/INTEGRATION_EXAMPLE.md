# SaveStatusIndicator Integration Example

## Quick Integration

### Step 1: Import the Component

```tsx
import { SaveStatusIndicator } from '@/components/dashboard-builder/SaveStatusIndicator';
```

### Step 2: Add to Your Toolbar/Header

```tsx
// In your dashboard builder topbar or header component
export function DashboardBuilderHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard Builder</h1>

        {/* Auto-save status indicator */}
        <SaveStatusIndicator showLabel={true} />
      </div>

      <div className="flex items-center gap-2">
        {/* Other toolbar buttons */}
        <Button variant="outline">Preview</Button>
        <Button>Publish</Button>
      </div>
    </header>
  );
}
```

### Step 3: That's It!

The component automatically:
- Subscribes to Zustand store state
- Updates in real-time as save status changes
- Shows conflict dialog when needed
- Handles all user interactions

## Full Example with Manual Save Button

```tsx
'use client';

import { SaveStatusIndicator } from '@/components/dashboard-builder/SaveStatusIndicator';
import { useDashboardStore, useSaveStatus, useIsDirty } from '@/store/dashboardStore';
import { Button } from '@/components/ui/button';
import { Save, Undo, Redo } from 'lucide-react';

export function DashboardBuilderToolbar() {
  const save = useDashboardStore((state) => state.save);
  const undo = useDashboardStore((state) => state.undo);
  const redo = useDashboardStore((state) => state.redo);
  const canUndo = useDashboardStore((state) => state.canUndo);
  const canRedo = useDashboardStore((state) => state.canRedo);
  const config = useDashboardStore((state) => state.config);
  const saveStatus = useSaveStatus();
  const isDirty = useIsDirty();

  const handleManualSave = () => {
    if (config.id) {
      save(config.id);
    }
  };

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b bg-white">
      {/* Left section: History controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Middle section: Save controls */}
      <div className="flex items-center gap-3">
        {/* Manual save button (optional, auto-save is automatic) */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSave}
          disabled={!isDirty || saveStatus === 'saving'}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Now
        </Button>

        {/* Auto-save status indicator */}
        <SaveStatusIndicator showLabel={true} />
      </div>

      {/* Right section: Other tools */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm">
          Preview
        </Button>
        <Button size="sm">
          Publish
        </Button>
      </div>
    </div>
  );
}
```

## Mobile-Friendly Compact Version

```tsx
export function DashboardBuilderMobileToolbar() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
      <h1 className="text-lg font-semibold">Builder</h1>

      {/* Icon-only version for mobile */}
      <SaveStatusIndicator showLabel={false} className="ml-auto" />
    </div>
  );
}
```

## Integration with Next.js App Router

```tsx
// app/dashboard/[id]/builder/page.tsx
'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DashboardBuilderToolbar } from '@/components/dashboard-builder/DashboardBuilderToolbar';
import { SaveStatusIndicator } from '@/components/dashboard-builder/SaveStatusIndicator';

export default function DashboardBuilderPage({
  params
}: {
  params: { id: string }
}) {
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);

  useEffect(() => {
    loadDashboard(params.id);
  }, [params.id, loadDashboard]);

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar with save indicator */}
      <DashboardBuilderToolbar />

      {/* Main builder canvas */}
      <main className="flex-1 overflow-auto">
        {/* Your dashboard builder UI */}
      </main>

      {/* Optional: Floating save indicator */}
      <div className="fixed bottom-4 right-4">
        <SaveStatusIndicator showLabel={true} className="shadow-lg" />
      </div>
    </div>
  );
}
```

## Advanced: Custom Status Display

If you want more control over the display:

```tsx
import { useSaveStatus, useLastSaved, useDashboardStore } from '@/store/dashboardStore';

export function CustomSaveIndicator() {
  const saveStatus = useSaveStatus();
  const lastSaved = useLastSaved();
  const saveAttempts = useDashboardStore((state) => state.saveAttempts);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        {saveStatus === 'saved' && (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-green-700">All changes saved</span>
          </>
        )}

        {saveStatus === 'saving' && (
          <>
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-blue-700">Saving...</span>
          </>
        )}

        {saveStatus === 'unsaved' && (
          <>
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-700">Auto-saving in 2s...</span>
          </>
        )}

        {saveStatus === 'error' && (
          <>
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">
              Save failed (retry {saveAttempts}/3)
            </span>
          </>
        )}

        {saveStatus === 'conflict' && (
          <>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700">Conflict - click to resolve</span>
          </>
        )}
      </div>

      {lastSaved && saveStatus === 'saved' && (
        <span className="text-gray-500">
          • Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      )}
    </div>
  );
}
```

## Keyboard Shortcuts Integration

Add manual save shortcut:

```tsx
'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export function DashboardKeyboardShortcuts() {
  const save = useDashboardStore((state) => state.save);
  const undo = useDashboardStore((state) => state.undo);
  const redo = useDashboardStore((state) => state.redo);
  const config = useDashboardStore((state) => state.config);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S: Manual save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (config.id) {
          save(config.id);
        }
      }

      // Ctrl+Z or Cmd+Z: Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [save, undo, redo, config.id]);

  return null; // This component doesn't render anything
}

// Usage in your page:
export default function DashboardBuilderPage() {
  return (
    <>
      <DashboardKeyboardShortcuts />
      {/* Rest of your page */}
    </>
  );
}
```

## Testing the Integration

### Manual Testing Checklist

1. **Basic Auto-Save**
   - [ ] Add component → Status changes to "Unsaved"
   - [ ] Wait 2 seconds → Status changes to "Saving"
   - [ ] After save → Status changes to "Saved"
   - [ ] Timestamp updates correctly

2. **Visual States**
   - [ ] Green checkmark for "Saved"
   - [ ] Blue animated cloud for "Saving"
   - [ ] Yellow clock for "Unsaved"
   - [ ] Red alert for "Error"
   - [ ] Orange warning for "Conflict"

3. **Conflict Resolution**
   - [ ] Open same dashboard in two tabs
   - [ ] Make changes in both
   - [ ] Conflict dialog appears
   - [ ] Can choose "Keep Local"
   - [ ] Can choose "Use Remote"
   - [ ] Can cancel

4. **Error Recovery**
   - [ ] Disconnect network
   - [ ] Make changes
   - [ ] See retry attempts (1, 2, 3)
   - [ ] Reconnect network
   - [ ] Auto-recovery works

5. **Browser Navigation**
   - [ ] Make changes
   - [ ] Try to close tab
   - [ ] Warning appears
   - [ ] Can cancel or proceed

## Styling Customization

Override styles with Tailwind classes:

```tsx
// Larger indicator for desktop
<SaveStatusIndicator
  showLabel={true}
  className="px-4 py-2 text-base"
/>

// Subtle indicator
<SaveStatusIndicator
  showLabel={false}
  className="opacity-70 hover:opacity-100 transition-opacity"
/>

// Floating with shadow
<SaveStatusIndicator
  showLabel={true}
  className="shadow-xl rounded-full"
/>

// Custom colors (not recommended - uses built-in status colors)
<SaveStatusIndicator
  showLabel={true}
  className="border-2"
/>
```

## Accessibility Features

The component includes:
- ✅ ARIA roles for clickable conflict state
- ✅ Keyboard navigation (Tab to focus, Enter to click)
- ✅ Screen reader friendly labels
- ✅ Color AND icon indicators (not color-only)
- ✅ Focus visible outlines

## Performance Tips

1. **Use selector hooks** to prevent unnecessary re-renders:
   ```tsx
   // Good - only re-renders when saveStatus changes
   const saveStatus = useSaveStatus();

   // Bad - re-renders on ANY store change
   const store = useDashboardStore();
   ```

2. **Memoize expensive operations**:
   ```tsx
   const timeAgo = useMemo(() => {
     if (!lastSaved) return '';
     return formatDistanceToNow(lastSaved);
   }, [lastSaved]);
   ```

3. **Debounce rapid updates** (already built-in for save operations)

## Troubleshooting Common Issues

### Issue: Indicator not updating
**Solution:** Ensure component is inside a Client Component (`'use client'`)

### Issue: Auto-save not triggering
**Solution:** Check that `config.id` is set (dashboard must be created first)

### Issue: Conflict dialog appears too often
**Solution:** Check `lastSyncedVersion` is correctly set after load/save

### Issue: Styles not applying
**Solution:** Ensure Tailwind includes component path in `content` array

## Next Steps

1. Integrate `SaveStatusIndicator` into your dashboard builder toolbar
2. Test all 5 status states
3. Test conflict resolution with multiple tabs
4. Add keyboard shortcuts for manual save
5. Customize styles if needed
6. Review documentation: `/frontend/docs/AUTO_SAVE_SYSTEM.md`

## Support

For questions or issues:
- Review source: `/frontend/src/components/dashboard-builder/SaveStatusIndicator.tsx`
- Check store: `/frontend/src/store/dashboardStore.ts`
- Read docs: `/frontend/docs/AUTO_SAVE_SYSTEM.md`
- Test in development mode with Zustand DevTools enabled
