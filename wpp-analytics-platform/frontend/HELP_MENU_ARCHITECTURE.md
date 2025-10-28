# Help Menu Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     WPP Analytics Platform                       │
│                     Dashboard Builder UI                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks "Help" menu
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EditorTopbar.tsx                         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Help Menu Item │  │ Help Menu Item │  │ Help Menu Item   │  │
│  │ Report Issue   │  │ Send Feedback  │  │ What's New       │  │
│  │ (AlertCircle)  │  │ (MessageSquare)│  │ (Sparkles)       │  │
│  └────────┬───────┘  └────────┬───────┘  └────────┬─────────┘  │
└───────────┼──────────────────┼──────────────────┼──────────────┘
            │                  │                  │
            │ onClick          │ onClick          │ onClick
            │                  │                  │
            ▼                  ▼                  ▼
┌───────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ ReportIssueDialog │  │  FeedbackDialog  │  │ ChangelogDialog  │
│                   │  │                  │  │                  │
│ ┌───────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │ Issue Title   │ │  │ │ Feedback Type│ │  │ │ Version List │ │
│ │ Description   │ │  │ │ (RadioGroup) │ │  │ │ (ScrollArea) │ │
│ │ Category      │ │  │ │ Message      │ │  │ │              │ │
│ │ Priority      │ │  │ │ Email (opt)  │ │  │ │ v0.2.0       │ │
│ │ Browser Info  │ │  │ │ Page Context │ │  │ │ v0.1.5       │ │
│ │               │ │  │ │              │ │  │ │ v0.1.0       │ │
│ │ [Submit]      │ │  │ │ [Send]       │ │  │ │              │ │
│ └───────┬───────┘ │  │ └──────┬───────┘ │  │ │ [Close]      │ │
└─────────┼─────────┘  └────────┼─────────┘  └──────────────────┘
          │                     │
          │ POST request        │ POST request
          │                     │
          ▼                     ▼
┌───────────────────┐  ┌──────────────────┐
│  API Route        │  │  API Route       │
│  /api/mcp/linear/ │  │  /api/feedback   │
│  create-issue     │  │                  │
└─────────┬─────────┘  └────────┬─────────┘
          │                     │
          │ GraphQL API         │ REST API
          │                     │
          ▼                     ▼
┌───────────────────┐  ┌──────────────────┐
│  Linear Service   │  │  Supabase DB     │
│                   │  │                  │
│ ┌───────────────┐ │  │ ┌──────────────┐ │
│ │ Create Issue  │ │  │ │ feedback     │ │
│ │ WPP-123       │ │  │ │ table        │ │
│ │               │ │  │ │              │ │
│ │ Title: ...    │ │  │ │ id           │ │
│ │ Description   │ │  │ │ type         │ │
│ │ Priority: 2   │ │  │ │ message      │ │
│ │ Labels: [bug] │ │  │ │ email        │ │
│ │               │ │  │ │ context      │ │
│ └───────────────┘ │  │ │ created_at   │ │
│                   │  │ └──────────────┘ │
│ Returns:          │  │                  │
│ {                 │  │ RLS Policies:    │
│   issueId: 123    │  │ - Insert: auth   │
│   url: linear.app │  │ - Select: admin  │
│ }                 │  │                  │
└───────────────────┘  └──────────────────┘
          │                     │
          │ Success response    │ Success response
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Toast Notification                          │
│  ✅ "Issue reported successfully! Issue #WPP-123 created"        │
│  ✅ "Feedback submitted successfully! Thank you."                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
EditorTopbar
├── Help Menu Button
│   ├── Documentation (external link)
│   ├── Keyboard Shortcuts (existing dialog)
│   ├── Video Tutorials (external link)
│   ├── ───────────────────────────
│   ├── Report an Issue ────────────► ReportIssueDialog
│   │                                 ├── Form Fields
│   │                                 ├── Submit Handler
│   │                                 └── API: /api/mcp/linear/create-issue
│   ├── Send Feedback ─────────────► FeedbackDialog
│   │                                 ├── Radio Group
│   │                                 ├── Submit Handler
│   │                                 └── API: /api/feedback
│   ├── ───────────────────────────
│   └── What's New ────────────────► ChangelogDialog
│                                     ├── Version List
│                                     ├── Badge Colors
│                                     └── Data: CHANGELOG.md
└── [Other menu items...]
```

---

## Data Flow: Report Issue

```
1. User Input
   ┌─────────────────────────────────────────────┐
   │ Title: "Dashboard not loading"              │
   │ Description: "Steps to reproduce..."        │
   │ Category: Bug                               │
   │ Priority: High                              │
   │ Browser: Chrome 120.0.0 (auto-filled)       │
   └──────────────────┬──────────────────────────┘
                      │
2. Form Validation    ▼
   ┌─────────────────────────────────────────────┐
   │ ✓ Title required                            │
   │ ✓ Description required                      │
   │ ✓ Category valid                            │
   │ ✓ Priority valid                            │
   └──────────────────┬──────────────────────────┘
                      │
3. API Request        ▼
   POST /api/mcp/linear/create-issue
   {
     "title": "Dashboard not loading",
     "description": "Steps...\n\n---\nBrowser: Chrome",
     "team": "wpp-analytics",
     "priority": 2,  // High = 2
     "labels": ["bug"]
   }
                      │
4. Linear GraphQL     ▼
   mutation CreateIssue {
     issueCreate(input: {
       title: "Dashboard not loading",
       description: "...",
       teamId: "team-uuid",
       priority: 2,
       labelIds: ["label-uuid"]
     }) {
       issue { id, identifier, url }
     }
   }
                      │
5. Response           ▼
   {
     "success": true,
     "issueId": "WPP-123",
     "issueUrl": "https://linear.app/wpp/issue/WPP-123"
   }
                      │
6. UI Update          ▼
   ┌─────────────────────────────────────────────┐
   │ Toast: ✅ "Issue #WPP-123 created!"         │
   │ Dialog closes                               │
   │ Form resets                                 │
   └─────────────────────────────────────────────┘
```

---

## Data Flow: Send Feedback

```
1. User Input
   ┌─────────────────────────────────────────────┐
   │ Type: 💡 Suggestion (radio selected)        │
   │ Message: "Add dark mode support"            │
   │ Email: user@example.com (optional)          │
   │ Context: /dashboard/123/builder (auto)      │
   └──────────────────┬──────────────────────────┘
                      │
2. Form Validation    ▼
   ┌─────────────────────────────────────────────┐
   │ ✓ Feedback type selected                    │
   │ ✓ Message not empty                         │
   │ ✓ Email format valid (if provided)          │
   └──────────────────┬──────────────────────────┘
                      │
3. API Request        ▼
   POST /api/feedback
   {
     "feedback_type": "suggestion",
     "message": "Add dark mode support",
     "email": "user@example.com",
     "context": "/dashboard/123/builder"
   }
                      │
4. Supabase Insert    ▼
   INSERT INTO feedback (
     feedback_type,
     message,
     email,
     context,
     created_at
   ) VALUES (
     'suggestion',
     'Add dark mode support',
     'user@example.com',
     '/dashboard/123/builder',
     NOW()
   )
                      │
5. Response           ▼
   {
     "success": true,
     "feedback": {
       "id": "uuid",
       "feedback_type": "suggestion",
       "message": "...",
       "created_at": "2025-10-26T20:15:00Z"
     }
   }
                      │
6. UI Update          ▼
   ┌─────────────────────────────────────────────┐
   │ Toast: ✅ "Feedback submitted! Thank you."  │
   │ Dialog closes                               │
   │ Form resets                                 │
   └─────────────────────────────────────────────┘
```

---

## Changelog Dialog Flow

```
1. User Click
   Help > What's New
          │
2. Dialog Opens        ▼
   ┌─────────────────────────────────────────────┐
   │ ChangelogDialog                             │
   │                                             │
   │ ┌─────────────────────────────────────────┐ │
   │ │ What's New                              │ │
   │ │ Latest updates and improvements         │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ ScrollArea:                                 │
   │ ┌─────────────────────────────────────────┐ │
   │ │ v0.2.0 - October 26, 2025   [Latest]   │ │
   │ │ ┌─────────────────────────────────────┐ │ │
   │ │ │ [Feature] File > New dialog         │ │ │
   │ │ │ [Fix] Fixed route error             │ │ │
   │ │ │ [Improvement] Enhanced UX           │ │ │
   │ │ └─────────────────────────────────────┘ │ │
   │ │                                         │ │
   │ │ ─────────────────────────────────────── │ │
   │ │                                         │ │
   │ │ v0.1.5 - October 23, 2025              │ │
   │ │ ┌─────────────────────────────────────┐ │ │
   │ │ │ [Feature] 13 new chart types        │ │ │
   │ │ │ [Fix] Chart refresh issues          │ │ │
   │ │ └─────────────────────────────────────┘ │ │
   │ │                                         │ │
   │ │ ─────────────────────────────────────── │ │
   │ │                                         │ │
   │ │ v0.1.0 - October 21, 2025              │ │
   │ │ ┌─────────────────────────────────────┐ │ │
   │ │ │ [Feature] Initial dashboard builder │ │ │
   │ │ │ [Feature] 34 chart types            │ │ │
   │ │ └─────────────────────────────────────┘ │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ [View full changelog] [Close]               │
   └─────────────────────────────────────────────┘
          │
3. User Action         ▼
   ┌─────────────────────────────────────────────┐
   │ Option 1: Click "View full changelog"      │
   │           → Opens /docs/changelog           │
   │                                             │
   │ Option 2: Click "Close"                    │
   │           → Dialog dismisses                │
   └─────────────────────────────────────────────┘
```

---

## State Management

```
EditorTopbar Component State:
┌─────────────────────────────────────────────────────────┐
│ const [isReportIssueOpen, setIsReportIssueOpen]       │
│ const [isFeedbackOpen, setIsFeedbackOpen]             │
│ const [isChangelogOpen, setIsChangelogOpen]           │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Props passed to dialogs
                         ▼
┌─────────────────────────────────────────────────────────┐
│ <ReportIssueDialog                                     │
│   open={isReportIssueOpen}                             │
│   onClose={() => setIsReportIssueOpen(false)}          │
│ />                                                      │
│                                                         │
│ <FeedbackDialog                                        │
│   open={isFeedbackOpen}                                │
│   onClose={() => setIsFeedbackOpen(false)}             │
│ />                                                      │
│                                                         │
│ <ChangelogDialog                                       │
│   open={isChangelogOpen}                               │
│   onClose={() => setIsChangelogOpen(false)}            │
│ />                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
API Request
     │
     ├─► Success ────────────────────► Toast: ✅ Success
     │                                 Dialog closes
     │                                 Form resets
     │
     └─► Error
         │
         ├─► Network Error ──────────► Toast: ❌ "Network error"
         │                             Dialog stays open
         │                             User can retry
         │
         ├─► Validation Error ───────► Toast: ❌ "Invalid input"
         │                             Highlight field
         │                             Dialog stays open
         │
         ├─► API Error ──────────────► Toast: ❌ "API error"
         │                             Log to console
         │                             Dialog stays open
         │
         └─► Auth Error ─────────────► Toast: ❌ "Not authenticated"
                                       Redirect to login
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────┤
│ React 19.1.0          │ Component framework             │
│ Next.js 15.5.6        │ App Router, API routes          │
│ TypeScript            │ Type safety                     │
│ Shadcn/ui             │ UI components (Radix UI)        │
│ Zustand 5.0.8         │ State management                │
│ Sonner                │ Toast notifications             │
│ Lucide React          │ Icon library                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
├─────────────────────────────────────────────────────────┤
│ Next.js API Routes    │ /api/feedback                   │
│                       │ /api/mcp/linear/create-issue    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Backend Services                      │
├─────────────────────────────────────────────────────────┤
│ Linear GraphQL API    │ Issue tracking                  │
│ Supabase REST API     │ Database + Auth                 │
│ PostgreSQL            │ Feedback storage                │
└─────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Environment Variables                   │
├─────────────────────────────────────────────────────────┤
│ LINEAR_API_KEY                │ Server-side only        │
│ SUPABASE_SERVICE_ROLE_KEY     │ Server-side only        │
│ NEXT_PUBLIC_SUPABASE_URL      │ Public                  │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY │ Public                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  API Routes (Server)                     │
├─────────────────────────────────────────────────────────┤
│ • Input validation                                      │
│ • Rate limiting (TODO)                                  │
│ • Error sanitization                                    │
│ • Secure headers                                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase RLS                           │
├─────────────────────────────────────────────────────────┤
│ feedback table:                                         │
│ • INSERT: authenticated users only                      │
│ • SELECT: service role only                             │
│ • UPDATE: service role only                             │
│ • DELETE: service role only                             │
└─────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
✅ Separation of concerns
✅ Type safety
✅ Security best practices
✅ Scalable structure
✅ Easy maintenance
✅ Clear data flow
