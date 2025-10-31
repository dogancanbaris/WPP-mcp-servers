# Linear Skill - Systematic Issue Management

**Keywords that trigger this skill:** "create issue", "update ticket", "linear format", "track work", "document in linear", "linear issue", "create linear"

## 🎯 When to Use This

Use this skill when:
- Creating issues for any task or project work
- Updating issue progress
- Closing completed work
- Tracking what needs to be done

## 📋 Systematic Format for Every Issue

**Title Format:** `[Category]: Brief description of what needs to be done`

**Categories:**
- Documentation - Docs, guides, READMEs, specifications
- Agent Experience - Skills, claude.md, MCP improvements
- Security - OAuth, safety layers, authorization
- Reporting Platform - Dashboard, frontend, API
- MCP Tools - Tool implementation, debugging
- OAuth - Authentication, token management
- Production - Deployment, monitoring, scaling
- Cleanup - Removing deprecated code/docs
- Technical Debt - Code quality, refactoring

## 🏗️ Description Structure (ALWAYS USE THIS)

```markdown
## 📋 What Needs to Be Done
- [ ] Bullet point 1
- [ ] Bullet point 2
- [ ] Bullet point 3

## 📚 References Needed
- File: path/to/file.ts:line_numbers
- Skill: .claude/agents/skill-name.md
- Doc: docs/GUIDE-NAME.md
- Related Issue: MCP-XX
- Tool: mcp__tool_name__

## ✅ Completion Checklist
- [ ] Research completed
- [ ] Code changes made
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Reviewed and tested

## 📝 Work Log
<!-- Add bullets as work progresses with timestamps -->

## 🎯 Definition of Done
Clear criteria for when this issue can be closed.
```

## 🛠️ Using Linear MCP Tools

```typescript
// Create new issue
mcp__linear-server__create_issue({
  team: "MCP Servers",
  title: "[Category]: Brief description",
  description: "<!-- Use template above -->",
  labels: ["label1", "label2"],
  project: "WPP Marketing Analytics Platform"
})

// Update existing issue
mcp__linear-server__update_issue({
  id: "issue-id",
  description: "<!-- Add to ## Work Log section -->",
  state: "In Progress"
})

// List your issues
mcp__linear-server__list_issues({
  team: "MCP Servers",
  assignee: "me",
  includeArchived: false
})

// Find issues
mcp__linear-server__list_issues({
  team: "MCP Servers",
  query: "search term"
})
```

## 📊 Label System

Use these labels consistently:
- `documentation` - Docs, guides, READMEs
- `agent-experience` - Skills, claude.md, MCP
- `security` - OAuth, safety, authorization
- `reporting-platform` - Dashboard, frontend, API
- `mcp-tools` - Tool implementation
- `oauth` - Authentication, tokens
- `production` - Deployment, scaling
- `cleanup` - Deprecated code removal
- `technical-debt` - Code quality

## ✍️ When Creating Issues

**Good Title:** `[Documentation]: Consolidate 26+ root MD files into /docs`
**Bad Title:** `Documentation consolidation` (missing category)

**Good Description:**
```markdown
## What Needs to Be Done
- [ ] Review all 26+ root MD files
- [ ] Create /docs folder structure
- [ ] Consolidate critical docs
- [ ] Delete obsolete files

## References Needed
- Folder: Root directory (26+ files)
- File: CHROME-DEVTOOLS-MCP-FIX.md (keep)
- File: OAUTH-TOKEN-SOLUTION.md (consolidate)

## Definition of Done
All docs consolidated into /docs with claude.md as entry point.
```

**Bad Description:** `We need to organize documentation` (too vague, no checklist)

## ✅ When Closing Issues

**ALWAYS update with completion summary:**
```markdown
## ✅ Completion Checklist
- [x] Research completed - Analyzed all 26 files
- [x] Code changes made - Updated oauth-client-factory.ts
- [x] Tests passing - All 12 tests green
- [x] Documentation updated - Added to docs/OAUTH-GUIDE.md
- [x] Reviewed and tested - Manual testing completed

## 📝 Work Log
- [2025-10-25] Created oauth-client-factory.ts with auto-refresh
- [2025-10-25] Added 9 BigQuery connection methods
- [2025-10-25] Tested with all 7 Google API platforms
- [2025-10-25] Documentation completed

## 🎯 Outcome
OAuth client factory implemented and tested. All 65 MCP tools now use centralized OAuth with auto-refresh.
```

Then change status to **Closed**

## 🎯 Current Work

**Team:** MCP Servers
**Project:** WPP Marketing Analytics Platform
**Recent Issues:** MCP-44, MCP-45, MCP-46, MCP-47, MCP-48 (current reorganization work)

## 📚 Reference

MCP Linear tools: mcp__linear-server__*
Team: MCP Servers
Project: WPP Marketing Analytics Platform
