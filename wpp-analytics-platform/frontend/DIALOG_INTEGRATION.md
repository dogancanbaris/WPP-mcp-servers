# File Menu Dialogs Integration Guide

This document provides integration instructions for the 3 new File Menu dialogs in EditorTopbar.tsx.

## Files Created

1. **DashboardSettingsDialog.tsx** - `/src/components/dashboard-builder/dialogs/DashboardSettingsDialog.tsx`
2. **ScheduleEmailDialog.tsx** - `/src/components/dashboard-builder/dialogs/ScheduleEmailDialog.tsx`
3. **csv-exporter.ts** - `/src/lib/export/csv-exporter.ts`
4. **file-actions.ts** - Updated with CSV export functionality

## Integration Steps for EditorTopbar.tsx

### Step 1: Add Imports

Add these imports at the top of `EditorTopbar.tsx`:

```typescript
import { DashboardSettingsDialog, type DashboardSettings } from '../dialogs/DashboardSettingsDialog';
import { ScheduleEmailDialog, type EmailSchedule } from '../dialogs/ScheduleEmailDialog';
```

### Step 2: Add State Variables

Add these state variables inside the `EditorTopbar` component (around line 67, after existing dialog states):

```typescript
// New dialog states
const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false);
const [isScheduleEmailOpen, setIsScheduleEmailOpen] = useState(false);
```

### Step 3: Add Handler Functions

Add these handler functions before the return statement (around line 160):

```typescript
// Dashboard settings handler
const handleSaveDashboardSettings = (settings: DashboardSettings) => {
  // Update dashboard config with settings
  setConfig({
    ...config,
    title: settings.name || config.title,
    // Store additional settings in localStorage for now
  });

  // Save settings to localStorage
  localStorage.setItem(`dashboard-settings-${dashboardId}`, JSON.stringify(settings));

  toast.success('Dashboard settings saved');
};

// Email schedule handler
const handleScheduleEmail = (schedule: EmailSchedule) => {
  toast.success(`Email scheduled: ${schedule.frequency} at ${schedule.time}`);
};
```

### Step 4: Update File Menu Items

Update the `fileMenuItems` creation (around line 162) to handle dialog opening:

```typescript
const fileMenuItems = createFileMenuItems({
  ...fileActions,
  onNew: () => setIsNewDashboardOpen(true),
  onVersionHistory: () => setIsVersionHistoryOpen(true),
  onDashboardSettings: () => setIsDashboardSettingsOpen(true),  // ADD THIS
  onScheduleEmail: () => setIsScheduleEmailOpen(true),          // ADD THIS
});
```

### Step 5: Add Dialog Components to JSX

Add these dialog components at the end of the JSX, after the existing dialogs (around line 493, before the closing `</div>`):

```typescript
{/* Dashboard Settings Dialog */}
<DashboardSettingsDialog
  open={isDashboardSettingsOpen}
  onClose={() => setIsDashboardSettingsOpen(false)}
  dashboardId={dashboardId}
  onSave={handleSaveDashboardSettings}
  initialSettings={{
    name: config.title,
    description: '',
    tags: [],
    defaultDateRange: 'last30days',
    refreshInterval: 'manual',
    accessLevel: 'private',
    displayOptions: {
      showToolbar: true,
      showFilters: true,
      autoRefresh: false,
    },
  }}
/>

{/* Schedule Email Dialog */}
<ScheduleEmailDialog
  open={isScheduleEmailOpen}
  onClose={() => setIsScheduleEmailOpen(false)}
  dashboardId={dashboardId}
  dashboardTitle={config.title}
  onSchedule={handleScheduleEmail}
/>
```

## Complete Integration Code Snippet

Here's a complete snippet showing all changes together:

```typescript
// === AT THE TOP (IMPORTS) ===
import { DashboardSettingsDialog, type DashboardSettings } from '../dialogs/DashboardSettingsDialog';
import { ScheduleEmailDialog, type EmailSchedule } from '../dialogs/ScheduleEmailDialog';

// === INSIDE EditorTopbar COMPONENT ===
export const EditorTopbar: React.FC<EditorTopbarProps> = ({ dashboardId }) => {
  // ... existing state variables ...

  // New dialog states
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false);
  const [isScheduleEmailOpen, setIsScheduleEmailOpen] = useState(false);

  // ... existing code ...

  // Dashboard settings handler
  const handleSaveDashboardSettings = (settings: DashboardSettings) => {
    setConfig({
      ...config,
      title: settings.name || config.title,
    });
    localStorage.setItem(`dashboard-settings-${dashboardId}`, JSON.stringify(settings));
    toast.success('Dashboard settings saved');
  };

  // Email schedule handler
  const handleScheduleEmail = (schedule: EmailSchedule) => {
    toast.success(`Email scheduled: ${schedule.frequency} at ${schedule.time}`);
  };

  // Update file menu items
  const fileMenuItems = createFileMenuItems({
    ...fileActions,
    onNew: () => setIsNewDashboardOpen(true),
    onVersionHistory: () => setIsVersionHistoryOpen(true),
    onDashboardSettings: () => setIsDashboardSettingsOpen(true),
    onScheduleEmail: () => setIsScheduleEmailOpen(true),
  });

  return (
    <div className="topbar ...">
      {/* ... existing JSX ... */}

      {/* Add these at the end, after KeyboardShortcutsDialog */}

      <DashboardSettingsDialog
        open={isDashboardSettingsOpen}
        onClose={() => setIsDashboardSettingsOpen(false)}
        dashboardId={dashboardId}
        onSave={handleSaveDashboardSettings}
        initialSettings={{
          name: config.title,
          description: '',
          tags: [],
          defaultDateRange: 'last30days',
          refreshInterval: 'manual',
          accessLevel: 'private',
          displayOptions: {
            showToolbar: true,
            showFilters: true,
            autoRefresh: false,
          },
        }}
      />

      <ScheduleEmailDialog
        open={isScheduleEmailOpen}
        onClose={() => setIsScheduleEmailOpen(false)}
        dashboardId={dashboardId}
        dashboardTitle={config.title}
        onSchedule={handleScheduleEmail}
      />
    </div>
  );
};
```

## Testing Checklist

After integration, test the following:

### Dashboard Settings Dialog
- [ ] Opens when "Dashboard Settings" is clicked in File menu
- [ ] Can edit dashboard name
- [ ] Can add/remove tags (press Enter to add, click X to remove)
- [ ] Can select default date range
- [ ] Can select refresh interval
- [ ] Can switch between access level tabs (General, Access, Display)
- [ ] Can toggle display options checkboxes
- [ ] Saves successfully and shows toast notification

### Schedule Email Dialog
- [ ] Opens when "Schedule Email" is clicked in File menu
- [ ] Can select frequency (Daily, Weekly, Monthly, Custom)
- [ ] Can select delivery time (00:00 - 23:00)
- [ ] For Weekly: Can select multiple days of week
- [ ] For Monthly: Can select day of month (1-31)
- [ ] Can add/remove email recipients (press Enter to add)
- [ ] Email validation works (rejects invalid emails)
- [ ] Can edit subject and body
- [ ] Template variables are shown in info box
- [ ] Preview toggle works and shows substituted variables
- [ ] Saves to localStorage successfully

### CSV Export
- [ ] Clicking "Download CSV" in File menu triggers export
- [ ] Shows "Generating CSV export..." toast
- [ ] Exports table/scorecard components
- [ ] CSV file downloads with correct filename
- [ ] Multiple components export as multiple files
- [ ] Shows success/error toast after export

## Backend Integration (Future)

Currently, these features use localStorage for persistence. For production:

1. **Dashboard Settings**: Save to Supabase `dashboards` table
2. **Email Schedules**: Create `email_schedules` table in Supabase
3. **CSV Export**: Fetch real data from Cube.js/BigQuery before exporting

Example Supabase schema for email schedules:

```sql
CREATE TABLE email_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid REFERENCES dashboards(id),
  frequency text NOT NULL,
  recipients text[] NOT NULL,
  time text NOT NULL,
  days_of_week integer[],
  day_of_month integer,
  subject text NOT NULL,
  body text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Notes

- All dialogs use shadcn/ui components exclusively
- WPP Blue (#191D63) is used for primary actions
- All dialogs follow the existing ShareDialog pattern
- Responsive design (mobile-friendly)
- Keyboard shortcuts work (Enter to submit, Escape to close)
- Form validation is built-in
