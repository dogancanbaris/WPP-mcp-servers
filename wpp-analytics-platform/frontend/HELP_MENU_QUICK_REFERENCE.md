# Help Menu Integration - Quick Reference

## Files Created

### Dialog Components
```
src/components/dashboard-builder/dialogs/
├── ReportIssueDialog.tsx    ✅ Linear integration
├── FeedbackDialog.tsx        ✅ Supabase integration
└── ChangelogDialog.tsx       ✅ Hardcoded changelog data
```

### API Routes
```
src/app/api/
├── feedback/
│   └── route.ts              ✅ POST endpoint for Supabase
└── mcp/linear/
    └── create-issue/
        └── route.ts          ✅ POST endpoint for Linear
```

### Config Files
```
public/CHANGELOG.md           ✅ Changelog markdown source
src/components/dashboard-builder/topbar/
├── menu-definitions.ts       ✅ Updated with createHelpMenuItems()
└── EditorTopbar.tsx          ✅ Integrated all 3 dialogs
```

---

## EditorTopbar.tsx Integration Snippet

Add these imports at the top:
```typescript
import { ReportIssueDialog } from '../dialogs/ReportIssueDialog';
import { FeedbackDialog } from '../dialogs/FeedbackDialog';
import { ChangelogDialog } from '../dialogs/ChangelogDialog';
import { createHelpMenuItems } from './menu-definitions';
```

Add these state variables:
```typescript
const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
const [isChangelogOpen, setIsChangelogOpen] = useState(false);
```

Replace HELP_MENU_ITEMS with:
```typescript
const helpMenuItems = createHelpMenuItems({
  onReportIssue: () => setIsReportIssueOpen(true),
  onSendFeedback: () => setIsFeedbackOpen(true),
  onWhatsNew: () => setIsChangelogOpen(true),
  onKeyboardShortcuts: () => setIsKeyboardShortcutsOpen(true),
});
```

Update menu button:
```typescript
<MenuButton label="Help" items={helpMenuItems} />
```

Add dialog components before closing `</div>`:
```typescript
<ReportIssueDialog
  open={isReportIssueOpen}
  onClose={() => setIsReportIssueOpen(false)}
/>

<FeedbackDialog
  open={isFeedbackOpen}
  onClose={() => setIsFeedbackOpen(false)}
/>

<ChangelogDialog
  open={isChangelogOpen}
  onClose={() => setIsChangelogOpen(false)}
/>
```

---

## Environment Variables (.env.local)

```bash
# Linear Integration
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxx

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## Test Commands

### Test Report Issue (Linear)
```bash
curl -X POST http://localhost:3000/api/mcp/linear/create-issue \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue",
    "description": "Testing Linear integration",
    "team": "wpp-analytics",
    "priority": 2,
    "labels": ["bug"]
  }'
```

### Test Feedback (Supabase)
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_type": "suggestion",
    "message": "Test feedback",
    "email": "test@example.com",
    "context": "/dashboard/123/builder"
  }'
```

---

## Key Features

### Report Issue Dialog
- ✅ Issue title + description
- ✅ Category (Bug, Feature Request, Question, Documentation)
- ✅ Priority (Low, Medium, High, Critical)
- ✅ Auto-filled browser info
- ✅ Creates Linear issue via GraphQL API

### Feedback Dialog
- ✅ Feedback type (Positive, Negative, Suggestion, Question)
- ✅ Message (required)
- ✅ Email (optional for follow-up)
- ✅ Auto-filled page context
- ✅ Saves to Supabase with RLS

### Changelog Dialog
- ✅ Scrollable version history
- ✅ Badge-coded changes (Feature, Fix, Improvement)
- ✅ Latest version highlighted
- ✅ Link to full docs

---

## Shadcn/ui Components Used

All dialogs use official shadcn/ui components:
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- Button (with loading states)
- Input, Textarea, Label
- Select, SelectTrigger, SelectValue, SelectContent, SelectItem
- RadioGroup, RadioGroupItem
- Badge (with variant colors)
- ScrollArea, Separator
- Toast notifications (Sonner)

---

## WPP Branding

Primary color: **#191D63** (WPP Deep Blue)
- Used in dialog titles (icon colors)
- Used in primary action buttons
- Used in badge variants for "Feature" type

---

## Status: ✅ COMPLETE

All 3 dialogs fully implemented and integrated into Help menu.
Ready for testing after environment variables are configured.
