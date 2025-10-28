# File Menu Dialogs - Feature Reference

Quick visual reference for the 3 new dialog components.

---

## 1. Dashboard Settings Dialog

### Tab 1: General Settings

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Settings                                   × │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [General] [Access & Sharing] [Display Options]        │
│                                                         │
│  Dashboard Name                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ My Marketing Dashboard                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Description                                            │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Performance metrics for Q4 campaigns              │ │
│  │                                                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Tags                                                   │
│  ┌─────────────────────────────┐ [Add]                │
│  │ Add tags (press Enter)      │                       │
│  └─────────────────────────────┘                       │
│  [Marketing ×] [Q4 ×] [Google Ads ×]                  │
│                                                         │
│  Default Date Range                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Last 30 days                              ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Refresh Interval                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Manual                                    ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                                    [Cancel] [Save]      │
└─────────────────────────────────────────────────────────┘
```

### Tab 2: Access & Sharing

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Settings                                   × │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [General] [Access & Sharing] [Display Options]        │
│                                                         │
│  Access Level                                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ○ Private                                         │ │
│  │   Only you can view and edit this dashboard      │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ● Team                                            │ │
│  │   Anyone in your team can view this dashboard    │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ○ Public                                          │ │
│  │   Anyone with the link can view this dashboard   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Sharing Information                               │ │
│  │ • Dashboard ID: abc-123-def                       │ │
│  │ • Current access level: Team                      │ │
│  │ • Created: 10/26/2025                             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                                    [Cancel] [Save]      │
└─────────────────────────────────────────────────────────┘
```

### Tab 3: Display Options

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Settings                                   × │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [General] [Access & Sharing] [Display Options]        │
│                                                         │
│  Display Options                                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☑ Show Toolbar                                    │ │
│  │   Display the editing toolbar at the top          │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☑ Show Filters                                    │ │
│  │   Display filter controls for viewers             │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☐ Auto-refresh Data                               │ │
│  │   Automatically refresh based on interval         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Display Preview                                    │ │
│  │ • Toolbar: Visible                                │ │
│  │ • Filters: Visible                                │ │
│  │ • Auto-refresh: Disabled                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                                    [Cancel] [Save]      │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Schedule Email Dialog

### Main View

```
┌─────────────────────────────────────────────────────────┐
│ 🕐 Schedule Email Delivery                           × │
├─────────────────────────────────────────────────────────┤
│ Set up automatic email delivery for "My Dashboard"     │
│                                                         │
│  Delivery Frequency                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Daily                                     ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Delivery Time                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 09:00                                     ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Recipients                                             │
│  ┌─────────────────────────────────┐ [Add]             │
│  │ Enter email (press Enter)       │                   │
│  └─────────────────────────────────┘                   │
│  [📧 john@example.com ×] [📧 sarah@example.com ×]     │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Email Subject                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Dashboard Report: {{dashboard_name}}              │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Email Body                                             │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Here is your scheduled dashboard report for       │ │
│  │ {{date}}.                                         │ │
│  │                                                   │ │
│  │ View the full dashboard: {{dashboard_url}}        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ℹ️  Template Variables                            │ │
│  │ {{dashboard_name}} - Dashboard title              │ │
│  │ {{dashboard_url}} - Dashboard link                │ │
│  │ {{date}} - Current date                           │ │
│  │ {{time}} - Current time                           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ☑ Show preview                                        │
│                                                         │
│                                [Cancel] [🕐 Create]     │
└─────────────────────────────────────────────────────────┘
```

### Weekly Frequency

```
┌─────────────────────────────────────────────────────────┐
│ 🕐 Schedule Email Delivery                           × │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Delivery Frequency                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Weekly                                    ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Delivery Time                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 09:00                                     ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Days of Week                                           │
│  [Sun] [Mon] [Tue] [Wed] [Thu] [Fri] [Sat]            │
│         ✓     ✓     ✓     ✓     ✓                      │
│                                                         │
│  ... (rest of form) ...                                │
└─────────────────────────────────────────────────────────┘
```

### Monthly Frequency

```
┌─────────────────────────────────────────────────────────┐
│ 🕐 Schedule Email Delivery                           × │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Delivery Frequency                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Monthly                                   ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Delivery Time                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 09:00                                     ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Day of Month                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1                                         ▼     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ... (rest of form) ...                                │
└─────────────────────────────────────────────────────────┘
```

### With Preview

```
┌─────────────────────────────────────────────────────────┐
│ ... (form fields above) ...                            │
│                                                         │
│  ☑ Show preview                                        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Email Preview                                     │ │
│  │                                                   │ │
│  │ Subject:                                          │ │
│  │ Dashboard Report: My Marketing Dashboard          │ │
│  │                                                   │ │
│  │ ─────────────────────────────────────────────────│ │
│  │                                                   │ │
│  │ Body:                                             │ │
│  │ Here is your scheduled dashboard report for       │ │
│  │ 10/26/2025.                                       │ │
│  │                                                   │ │
│  │ View the full dashboard:                          │ │
│  │ https://app.wpp.com/dashboard/abc-123            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                                [Cancel] [🕐 Create]     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. CSV Export Flow

### Trigger from File Menu

```
File Menu
  ├─ New
  ├─ Make a copy
  ├─ Rename
  ├─ ───────────
  ├─ Download PDF
  ├─ Download CSV  ← Click here
  └─ ...
```

### Toast Notifications

```
Step 1: Start Export
┌─────────────────────────────────┐
│ ℹ️  Generating CSV export...    │
└─────────────────────────────────┘

Step 2: Success
┌─────────────────────────────────┐
│ ✅ CSV exported successfully    │
└─────────────────────────────────┘

Or if error:
┌─────────────────────────────────┐
│ ❌ No table or scorecard        │
│    components found to export   │
└─────────────────────────────────┘
```

### Downloaded Files

```
Files saved to Downloads:

For single component:
  my-dashboard-table-2025-10-26.csv

For multiple components:
  my-dashboard-table-1-2025-10-26.csv
  my-dashboard-scorecard-2-2025-10-26.csv
  my-dashboard-table-3-2025-10-26.csv
```

### CSV Content Example

```csv
Dimension,clicks,impressions,ctr
Sample Data 1,100,200,0.5
Sample Data 2,150,250,0.6
Sample Data 3,120,220,0.55
```

---

## Component Props Reference

### DashboardSettingsDialog

```typescript
interface DashboardSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId: string;
  onSave: (settings: DashboardSettings) => void;
  initialSettings?: DashboardSettings;
}
```

### ScheduleEmailDialog

```typescript
interface ScheduleEmailDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId: string;
  dashboardTitle: string;
  onSchedule: (schedule: EmailSchedule) => void;
}
```

### CSV Exporter

```typescript
// Main function
exportDashboardToCSV(dashboardConfig: DashboardConfig): Promise<void>

// Helper function for specific table
exportTableData(
  datasource: string,
  dimension: string | null,
  metrics: string[],
  filters?: any[],
  dateRange?: any
): Promise<string>
```

---

## Keyboard Shortcuts

### All Dialogs
- `Escape` - Close dialog
- `Tab` - Navigate between fields
- `Shift+Tab` - Navigate backwards

### Dashboard Settings
- `Enter` - Add tag (when in tag input)

### Schedule Email
- `Enter` - Add recipient (when in email input)

---

## Color Reference

### WPP Branding
- Primary: `#191D63` (WPP Deep Blue)
- Used in:
  - Primary buttons ("Save", "Create Schedule")
  - Selected states (radio buttons, checkboxes)
  - Active days of week
  - Badge accents

### Semantic Colors
- `bg-primary` + `text-primary-foreground` ✅
- `bg-accent` + `text-accent-foreground` ✅
- `bg-muted` + `text-muted-foreground` ✅

---

## Validation Rules

### Dashboard Settings
- Name: Required, 1-100 characters
- Description: Optional, max 500 characters
- Tags: Max 20 tags, each 1-30 characters

### Schedule Email
- Recipients: At least 1 valid email required
- Email format: Must match email regex
- Weekly: At least 1 day selected
- Monthly: Day 1-31 selected
- Subject/Body: Required, non-empty

### CSV Export
- At least 1 table or scorecard component required
- Component must have datasource configured

---

## Storage

### Dashboard Settings
```javascript
// localStorage key format
localStorage.setItem(
  `dashboard-settings-${dashboardId}`,
  JSON.stringify(settings)
);
```

### Email Schedules
```javascript
// localStorage array of all schedules
const schedules = JSON.parse(
  localStorage.getItem('emailSchedules') || '[]'
);
```

---

## Error Messages

### Dashboard Settings
- "Name is required"
- "Tag already exists"
- "Maximum 20 tags allowed"

### Schedule Email
- "Please add at least one recipient"
- "Invalid email address"
- "Please select at least one day of the week"
- "Please select a day of the month"

### CSV Export
- "No table or scorecard components found to export"
- "Failed to export CSV: [error message]"

---

This quick reference provides visual layouts and feature details for all 3 dialogs.
