# WPP Analytics Platform - Development Workflow

**Last Updated:** 2025-10-26
**Purpose:** Complete guide for how Claude + Sub-Agents + Skills + Linear work together

---

## 🎯 System Overview

**YOU** drive the work → **Claude** coordinates → **Sub-agents** execute → **Linear** tracks → **Docs** stay synced

**9 Sub-Agents** (3 for answers, 5 for work, 1 for docs):
- **Fast Answer Agents** (Haiku, <2s): knowledge-base, mcp-tools-reference, linear-status-checker
- **Work Agents** (Sonnet, 5-60min): chart-migrator, frontend-builder, mcp-tool-builder, database-optimizer
- **Maintenance** (Haiku, <2min): doc-syncer, code-reviewer

---

## 🚀 Starting a New Session

###  **Step 1: Check Project State** (< 5 seconds)

**You ask:**
```
"Where are we in the roadmap?"
```

**linear-status-checker responds** (Haiku, 3s):
```
Current Position: Phase 4.1 → 4.3

Completed:
✅ MCP-44, MCP-45, MCP-46

In Progress:
🚧 MCP-47, MCP-48, MCP-56

Next: Phase 4.2 (UI), Phase 4.3 (Charts)
```

---

## 💡 Asking Questions (Instant Answers)

### **Architecture / Pattern Questions**

**You ask:**
```
"What's our OAuth pattern?"
"Show me chart migration pattern"
"Explain dataset architecture"
```

**knowledge-base responds** (Haiku, 1-2s):
- Direct answer with file:line references
- No searching needed (cached docs)
- Example: "OAuth pattern: src/shared/oauth-client-factory.ts:15-89"

### **Tool / API Questions**

**You ask:**
```
"What Google Ads tools exist?"
"How do I query BigQuery?"
"Parameters for create_dashboard?"
```

**mcp-tools-reference responds** (Haiku, 1s):
- Lists all 65 MCP tools by API
- Shows parameters + usage examples
- No execution, just documentation

### **Status Questions**

**You ask:**
```
"What's Phase 4.3 status?"
"Show me MCP-56 details"
"What's left in chart migration?"
```

**linear-status-checker responds** (Haiku, 3s):
- Checks Linear tickets (real-time)
- Compares with ROADMAP.md
- Shows done vs remaining

---

## 🔨 Doing Work (Sub-Agent Execution)

### **Chart Migration Work**

**You say:**
```
"Migrate BarChart.tsx"
```

**chart-migrator executes** (Sonnet, 5-10min):
1. Reads placeholder BarChart.tsx
2. Reads reference Scorecard.tsx
3. Applies 6-step migration pattern:
   - Replace Cube.js → Dataset API
   - Add style props
   - Add loading/error states
   - Test with data
4. Updates Linear MCP-56 progress
5. Reports completion

### **UI Component Work**

**You say:**
```
"Complete Style tab in SettingsSidebar"
```

**frontend-builder executes** (Sonnet, 15-30min):
1. Reads SettingsSidebar.tsx
2. Checks ROADMAP.md Phase 4.2 requirements
3. Implements Style tab:
   - Color picker
   - Font size controls
   - Theme presets
   - Custom CSS input
4. Uses shadcn/ui components
5. Updates Linear MCP-52

### **MCP Tool Creation**

**You say:**
```
"Create MCP tool for Bing Webmaster Tools"
```

**mcp-tool-builder executes** (Sonnet, 30-60min):
1. References src/gsc/tools/analytics.ts pattern
2. Implements OAuth 2.0 auth (no service accounts)
3. Creates Zod schema for validation
4. Registers in src/bing/tools/index.ts
5. Tests OAuth flow + API call
6. Updates Linear ticket

### **BigQuery Optimization**

**You say:**
```
"Optimize this BigQuery query for cost"
```

**database-optimizer executes** (Sonnet, 10-20min):
1. Analyzes query
2. Applies optimizations:
   - Add partitioning
   - Use clustering
   - Avoid SELECT *
   - Add materialized views
3. Shows cost comparison
4. Updates caching strategy

---

## 📝 After Milestones (Documentation Updates)

### **When to Update Docs**

**After completing milestones:**
- Finished 8 priority charts (MCP-56 done)
- Completed Phase 4.2 (UI work done)
- Major feature shipped

**You say:**
```
"Update docs with progress"
```

**doc-syncer executes** (Haiku, 10-15s):
1. Checks Linear for completed tickets (MCP-XX Done)
2. Updates ROADMAP.md checkboxes (- [ ] → - [x])
3. Updates LINEAR_TICKETS_MCP47_TO_MCP75.md statuses
4. Updates claude.md if needed
5. Git commit: "docs: Update progress - MCP-56, MCP-57 complete"

**User-triggered only** - doesn't run automatically.

---

## ✅ Before Committing Code

**You say:**
```
"Review code before commit"
```

**code-reviewer executes** (Haiku, 1-2min):
1. Runs `git diff --staged`
2. Checks for:
   - TypeScript errors
   - Console.logs left in
   - Deprecated imports (Cube.js)
   - Missing error handling
   - Hardcoded values
3. Pattern validation:
   - OAuth usage correct?
   - Dataset API patterns followed?
   - Loading/error states present?
4. Reports: ✅ Clean or ⚠️ Issues found

---

## 🔄 Decision Tree: Which Agent to Use?

### **Question About...**
- **"What is / How does / Explain"** → knowledge-base
- **"What tools / Which API / How to query"** → mcp-tools-reference
- **"Status / Progress / What's left"** → linear-status-checker

### **Work Task:**
- **"Migrate [ChartName]"** → chart-migrator
- **"Build sidebar / UI component"** → frontend-builder
- **"Create MCP tool"** → mcp-tool-builder
- **"Optimize BigQuery"** → database-optimizer

### **After Milestone:**
- **"Update docs"** → doc-syncer

### **Before Commit:**
- **"Review code"** → code-reviewer

---

## 📊 Linear Integration

### **All Work Tracked as MCP-XX Tickets**

**Format (from .claude/skills/linear.md):**
```markdown
## 📋 What Needs to Be Done
- [ ] Task 1
- [ ] Task 2

## 📚 References Needed
- File: path/to/file.ts:lines
- Skill: .claude/agents/skill-name.md
- Doc: docs/GUIDE-NAME.md

## ✅ Completion Checklist
- [ ] Code changes made
- [ ] Tests passing
- [ ] Documentation updated

## 📝 Work Log
[Updated as work progresses]

## 🎯 Definition of Done
Clear criteria for completion
```

### **Status Flow**
1. **Backlog** → Not started
2. **Todo** → Ready to work
3. **In Progress** → Currently being worked on
4. **Done** → Completed ✅

**Sub-agents update Linear as they work:**
- chart-migrator → Updates MCP-56/57/58 work logs
- frontend-builder → Updates MCP-52/53/54/55
- etc.

---

## 📚 Documentation Structure

### **Entry Point**
**claude.md** (60 lines) - Simple project overview + links

### **Planning**
**ROADMAP.md** - Phases 4.1-4.8, all tasks, timeline
**LINEAR_TICKETS_MCP47_TO_MCP75.md** - All 29 tickets detailed

### **Process**
**WORKFLOW.md** (this file) - How everything works together

### **Technical**
**DATA-LAYER-ARCHITECTURE.md** - Technical deep-dive
**wpp-analytics-platform/README.md** - Platform features

### **Skills** (.claude/skills/)
- mcp-server.md - Tool catalog
- oauth.md - OAuth patterns
- linear.md - Ticket format
- chrome-devtools-mcp.md - WSL2 debugging
- reporting-platform.md - Dashboard MCP tools

---

## 🎯 Example Workflow Sessions

### **Session 1: Chart Migration Day**

```
You: "Where are we with charts?"
→ linear-status-checker: "4/34 done, 24 need migration"

You: "Show me the pattern"
→ knowledge-base: "6-step pattern (ROADMAP:269-277), ref: Scorecard.tsx"

You: "Migrate BarChart, LineChart, AreaChart"
→ chart-migrator: [Migrates 3 charts, 15-30min each]

You: "Update docs"
→ doc-syncer: [Updates ROADMAP, Linear, commits]

Session result: 3 charts done, docs synced
```

### **Session 2: UI Feature Day**

```
You: "What's Phase 4.2 status?"
→ linear-status-checker: "SettingsSidebar Style tab incomplete"

You: "Show me SettingsSidebar structure"
→ knowledge-base: "Path: components/dashboard-builder/sidebar/SettingsSidebar.tsx:1-150"

You: "Complete Style tab"
→ frontend-builder: [Implements color picker, font controls, theme presets]

You: "Review code"
→ code-reviewer: "✅ Clean, no issues"

You: "Update docs"
→ doc-syncer: [Updates Linear MCP-52, commits]

Session result: Style tab done, ready for Phase 4.3
```

### **Session 3: MCP Tool Creation**

```
You: "What tools exist for Bing?"
→ mcp-tools-reference: "No Bing tools yet. Need to create."

You: "Show me GSC tool pattern"
→ knowledge-base: "Path: src/gsc/tools/analytics.ts, OAuth: oauth-client-factory.ts"

You: "Create Bing Webmaster Tools integration"
→ mcp-tool-builder: [Creates src/bing/, OAuth setup, tool registration]

You: "Review code"
→ code-reviewer: "✅ OAuth correct, validation present"

Session result: New API module added
```

---

## ⚡ Performance Targets

**Answer Questions:**
- knowledge-base: < 2 seconds
- mcp-tools-reference: < 1 second
- linear-status-checker: < 3 seconds

**Execute Work:**
- chart-migrator: 5-10 minutes/chart
- frontend-builder: 15-30 minutes/feature
- mcp-tool-builder: 30-60 minutes/tool
- database-optimizer: 10-20 minutes/query

**Maintenance:**
- doc-syncer: 10-15 seconds
- code-reviewer: 1-2 minutes

---

## 🎯 Success Criteria

**System is working when:**
1. ✅ You ask a question → Get instant answer (<2s)
2. ✅ You request work → Right agent executes it
3. ✅ Work completes → Linear updated automatically
4. ✅ You say "update docs" → Everything synced in <15s
5. ✅ New session starts → System knows exact project state
6. ✅ ROADMAP.md always matches Linear reality

**You should NEVER hear:**
- ❌ "Let me search for that..." (agents know instantly)
- ❌ "Let me check the codebase..." (already cached)
- ❌ "I'm not sure what the status is..." (Linear has truth)

---

## 💡 Tips for Efficient Work

**Start Every Session:**
1. "Where are we?" (gets status instantly)
2. Ask questions until clear (knowledge agents respond <2s)
3. Then request work (work agents execute)

**During Work:**
- Ask questions anytime (won't interrupt work agents)
- Check status anytime (linear-status-checker is fast)

**After Milestones:**
- "Update docs" (keeps system aware)
- "Review code" (before commits)

**The system serves YOU** - agents are ready, documentation is cached, Linear is synced. Just drive the work forward.

---

**Built for speed, awareness, and systematic progress** 🚀
