---
name: GitHub Commit Helper
description: Commit WPP MCP changes to GitHub with comprehensive commit messages documenting files changed, lines added, tool counts, compilation status
---

# GitHub Commit Helper Skill

## Purpose

Create well-formatted, informative git commits for the WPP MCP Servers project.

## Commit Message Format

```
{Category}: {Brief description}

{Detailed multi-line description of changes}

{Stats and verification}

{Optional: Next steps or notes}
```

## Examples from Project

### Good Commit 1 (Initial):
```
Initial commit: WPP MCP Servers v1.0

Enterprise-grade MCP server with 31 tools across 4 Google APIs

Features:
- 31 MCP tools (GSC, CrUX, Google Ads, GA4)
- 9 comprehensive safety features
- HTTP server for OMA integration (7 endpoints)
- 23 automated tests
- 18 documentation files
- 15,000 lines of TypeScript
- Production-ready with 0 errors

Phase 1 & 2: Complete (100%)
Phase 3: API expansion planned (110+ new tools)
```

### Good Commit 2 (Expansion):
```
Add API expansion work - Phase 1 & 2 complete

New APIs integrated (3):
- Google Business Profile (3 tools)
- BigQuery (3 tools)
- Bright Data SERP (1 tool)

Expanded existing APIs:
- Google Ads: +13 tools (25 total)
- Google Analytics: +6 Admin API tools (11 total)

Total: 58 tools across 7 APIs (+27 new tools)

Files added:
- src/ads/tools/{conversions,audiences,assets,keyword-planning,bidding,extensions}.ts
- src/analytics/tools/admin.ts
- src/business-profile/{client,tools}.ts
- src/bigquery/{client,tools}.ts
- src/serp/{client,tools}.ts

All safety features integrated for new write operations
Compilation: 0 errors, 0 warnings
```

## Pre-Commit Checklist

Before committing, verify:

- [ ] No sensitive files (check .gitignore):
  - ❌ .env
  - ❌ config/*-tokens.json
  - ❌ client_secret_*.json

- [ ] Code compiles:
  ```bash
  npm run build
  # Must show: 0 errors
  ```

- [ ] Tool count accurate:
  ```bash
  # Count tools and update commit message
  ```

- [ ] No debugging code:
  - No console.log in production code
  - No commented-out blocks
  - No TODO without ticket reference

## Commit Categories

- **feat:** New feature/tool added
- **fix:** Bug fix
- **docs:** Documentation updates
- **refactor:** Code improvements (no functionality change)
- **test:** Test additions
- **safety:** Safety feature additions
- **chore:** Build/config changes

## Usage

When user says:
- "Commit these changes"
- "Push to GitHub"
- "Save this work"

Workflow:
1. Run pre-commit checklist
2. Identify changed files
3. Categorize changes
4. Calculate stats (tools added, lines changed)
5. Generate commit message
6. Execute: `git add -A && git commit -m "..." && git push`

## Remember

Good commits = good history = easy rollback and understanding!
