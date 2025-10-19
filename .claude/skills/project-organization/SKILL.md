---
name: Project Organization
description: Understand WPP MCP project structure before creating files - ensures modular architecture, correct file placement, and maintains clean organization as project scales
---

# Project Organization Skill

## Purpose

**INVOKE THIS SKILL FIRST** before creating any new files, features, or components. This ensures everything goes in the right place and follows WPP MCP's modular architecture.

## When to Use This Skill

**ALWAYS invoke BEFORE:**
- Creating new MCP tool
- Adding new API integration
- Creating new safety feature
- Adding documentation
- Creating new module/directory
- Unsure where something belongs

**Trigger phrases:**
- "Create new tool for..."
- "Add [API name] integration..."
- "Where should I put..."
- "How should I organize..."
- "Create new [feature]..."

---

## Project Structure Overview

```
WPP MCP Servers/
├── README.md, GETTING-STARTED.md    # Entry points only
│
├── src/                              # ALL SOURCE CODE
│   ├── {api-name}/                   # One directory per API
│   │   ├── client.ts                 # API client wrapper
│   │   ├── types.ts                  # TypeScript types
│   │   ├── validation.ts             # Zod schemas
│   │   └── tools/                    # MCP tools for this API
│   │       ├── {category}.ts         # Tools grouped by category
│   │       └── index.ts              # Export all tools
│   │
│   ├── shared/                       # Shared utilities & safety
│   │   ├── {safety-feature}.ts       # Safety features
│   │   ├── logger.ts, errors.ts      # Common utilities
│   │   └── utils.ts
│   │
│   ├── http-server/                  # HTTP API wrapper
│   │   ├── server.ts
│   │   └── index.ts
│   │
│   └── setup-auth.ts, test-*.ts     # Utility scripts
│
├── tests/                            # ALL TESTS
│   └── {feature-name}.test.ts
│
├── config/                           # ALL CONFIGURATION
│   ├── {purpose}-config.json
│   └── {safety}-limits.json
│
├── scripts/                          # UTILITY SCRIPTS
│   └── {purpose}.sh
│
├── docs/                             # ALL DOCUMENTATION
│   ├── 00-START-HERE.md             # Index
│   ├── guides/                       # How-to guides
│   ├── architecture/                 # System design
│   ├── api-reference/                # API documentation
│   ├── safety/                       # Safety & compliance
│   ├── status/                       # Current + archived status
│   └── internal/                     # Developer/agent docs
│
├── .claude/                          # CLAUDE CODE INTEGRATION
│   └── skills/                       # Custom skills
│       └── {skill-name}/
│           ├── SKILL.md
│           ├── templates/
│           └── examples/
│
├── dist/                             # GENERATED (don't edit)
├── logs/                             # GENERATED (audit logs)
└── node_modules/                     # GENERATED (dependencies)
```

---

## File Location Decision Tree

### I'm creating a new MCP tool...

**Question 1:** Which API is this for?
- Google Search Console → `src/gsc/tools/`
- Google Ads → `src/ads/tools/`
- Google Analytics → `src/analytics/tools/`
- Google Business Profile → `src/business-profile/tools.ts`
- BigQuery → `src/bigquery/tools.ts`
- Bright Data SERP → `src/serp/tools.ts`
- New API → Create `src/{new-api-name}/` (see API Module Pattern below)

**Question 2:** What category does the tool belong to?
- GSC: properties, analytics, sitemaps, url-inspection
- Ads: campaigns, budgets, keywords, conversions, audiences, assets, bidding, extensions, reporting, accounts
- Analytics: accounts, reporting, admin

**File:** `src/{api}/tools/{category}.ts`

**Then export in:** `src/{api}/tools/index.ts`

**Example:**
```
New tool: "update_conversion_action" for Google Ads
→ File: src/ads/tools/conversions.ts
→ Export in: src/ads/tools/index.ts
```

---

### I'm adding a new API integration...

**Follow this module pattern:**

```
src/{new-api-name}/
├── client.ts          # API client wrapper
│   - Initialize API client
│   - Handle authentication
│   - Provide helper methods
│
├── types.ts           # TypeScript types
│   - Interface definitions
│   - Type aliases
│   - API response types
│
├── validation.ts      # Zod validation schemas
│   - Input validation for all tools
│   - Schema definitions
│
└── tools/             # MCP tools (if multiple categories)
    ├── {category1}.ts
    ├── {category2}.ts
    └── index.ts       # Export all tools
```

**OR for simple APIs:**
```
src/{new-api-name}/
├── client.ts
├── tools.ts          # All tools in one file (if < 5 tools)
├── types.ts
└── validation.ts
```

**Examples to copy:**
- Complex API: `src/ads/` (25 tools, multiple categories)
- Simple API: `src/crux/` (5 tools, single file)
- Medium API: `src/analytics/` (11 tools, 2 categories)

**Required integrations:**
1. Add to `src/gsc/tools/index.ts` allTools array
2. Add client initialization to `src/gsc/server.ts`
3. Update package.json dependencies (if new npm package)
4. Create documentation in `docs/api-reference/`

---

### I'm creating a new safety feature...

**Location:** `src/shared/{feature-name}.ts`

**Pattern:** All safety features in `src/shared/` because they're used across all APIs

**Examples:**
- `src/shared/approval-enforcer.ts` - Approval workflow
- `src/shared/snapshot-manager.ts` - Rollback system
- `src/shared/vagueness-detector.ts` - Vagueness blocking
- `src/shared/financial-impact-calculator.ts` - Cost calculation

**Integration:**
- Import in tool files that need it
- Add to safety checklist in safety-audit-reviewer skill
- Document in `docs/safety/SAFETY-AUDIT.md`
- Update safety count in `docs/status/CURRENT-STATUS.md`

---

### I'm adding documentation...

**Decision tree:**

**What type of doc?**
- **How-to guide** (setup, integration, testing) → `docs/guides/`
- **Architecture** (design, planning, infrastructure) → `docs/architecture/`
- **API reference** (tool catalog, API docs) → `docs/api-reference/`
- **Safety** (audit, production readiness, agent experience) → `docs/safety/`
- **Status** (current state, completion reports) → `docs/status/`
  - Active: `docs/status/CURRENT-STATUS.md`
  - Historical: `docs/status/archive/`
- **Internal** (agent handover, technical deep dives) → `docs/internal/`

**Naming convention:**
- Guides: `{PURPOSE}-GUIDE.md` (SETUP-GUIDE, TESTING-GUIDE)
- Architecture: `{TOPIC}.md` (CLAUDE.md, OMA-MCP-INTEGRATION.md)
- API References: `{API-NAME}-API-REFERENCE.md`
- Safety: `{PURPOSE}.md` (SAFETY-AUDIT.md, PRODUCTION-READINESS.md)
- Status: `CURRENT-STATUS.md` or `FINAL-STATUS-{DATE}.md`

**After creating:**
- Add to `docs/00-START-HERE.md` index
- Update README.md if essential doc
- Link from related docs

---

### I'm creating a test file...

**Location:** `tests/{feature-name}.test.ts`

**Pattern:**
- Safety features: `tests/safety-features.test.ts`
- Specific tool: `tests/{tool-name}.test.ts`
- Integration: `tests/{workflow-name}-integration.test.ts`

**Structure:**
```typescript
import { describe, it, expect } from '@jest/globals';
import { featureName } from '../src/{path}/feature';

describe('FeatureName', () => {
  it('should do X', async () => {
    // Test logic
    expect(result).toBe(expected);
  });
});
```

---

### I'm creating a configuration file...

**Location:** `config/{purpose}-config.json` or `config/{category}/{file}.json`

**Current configs:**
- Server: `config/gsc-config.json`
- Safety: `config/safety-limits.json`, `config/prohibited-operations.json`
- Notifications: `config/notification-config.json`

**Pattern:** Group related configs in subdirectories if growing:
```
config/
├── server/
│   ├── gsc-config.json
│   └── http-server-config.json
└── safety/
    ├── safety-limits.json
    ├── prohibited-operations.json
    └── notification-config.json
```

---

### I'm creating a Claude Code skill...

**Location:** `.claude/skills/{skill-name}/`

**Required:**
- `SKILL.md` with YAML frontmatter
  ```markdown
  ---
  name: Skill Name (max 64 chars)
  description: When to invoke (max 200 chars)
  ---

  # Detailed instructions...
  ```

**Optional:**
- `templates/` - Reusable templates
- `examples/` - Examples from project
- `workflows/` - Multi-step workflows

**After creating:**
- Add to `docs/guides/SKILLS-GUIDE.md`
- Test by restarting Claude Code CLI

---

### I'm creating a utility script...

**Location:** `scripts/{purpose}.sh`

**Pattern:**
- Make executable: `chmod +x scripts/{script}.sh`
- Add shebang: `#!/bin/bash`
- Use relative paths: `cd "$(dirname "$0")/.."`
- Document usage in README or scripts/README.md

**Examples:**
- `scripts/count-tools.sh` - Count tools by API
- `scripts/verify-safety.sh` - Check safety integration
- `scripts/pre-deploy-check.sh` - Pre-deployment verification

---

## Modular Architecture Principles

### Principle 1: Separation by API

**Each API is completely independent:**
```
src/ads/        # Google Ads - self-contained
src/analytics/  # Analytics - self-contained
src/gsc/        # Search Console - self-contained
```

**Benefits:**
- Can work on one API without affecting others
- Easy to add new APIs (copy pattern)
- Clear boundaries and ownership

### Principle 2: Shared Code Only When Truly Shared

**src/shared/ contains:**
- ✅ Safety features (used by ALL APIs)
- ✅ Logging (used by ALL)
- ✅ Errors (used by ALL)
- ✅ Common utilities

**src/shared/ does NOT contain:**
- ❌ API-specific logic
- ❌ Tool implementations
- ❌ API clients

### Principle 3: Tools Grouped by Category

**Don't:**
```
src/ads/tools/
├── update-budget.ts
├── create-budget.ts
├── update-campaign.ts
├── create-campaign.ts
└── (50 separate files - hard to manage)
```

**Do:**
```
src/ads/tools/
├── budgets.ts          # All budget tools together
├── campaigns.ts        # All campaign tools together
├── keywords.ts         # All keyword tools together
└── index.ts            # Export all
```

**Benefits:**
- Related tools together
- Easy to find
- Shared code within category
- Scalable to 100+ tools

### Principle 4: One Clear Entry Point

**Main server:** `src/gsc/server.ts`
- Initializes ALL API clients
- Registers ALL tools
- Starts MCP server

**Tool registry:** `src/gsc/tools/index.ts`
- Imports from all API modules
- Exports allTools array
- Single source of truth

---

## File Naming Conventions

### TypeScript Source Files:
- **API clients:** `client.ts` (always)
- **Tool categories:** `{category}.ts` (budgets.ts, campaigns.ts)
- **Types:** `types.ts` (always)
- **Validation:** `validation.ts` (always)
- **Tool index:** `index.ts` (exports)

### Documentation Files:
- **Guides:** `{PURPOSE}-GUIDE.md` (SETUP-GUIDE.md)
- **Architecture:** `{TOPIC}.md` (CLAUDE.md, OMA-MCP-INTEGRATION.md)
- **References:** `{API}-API-REFERENCE.md`
- **Status:** `CURRENT-STATUS.md` or `{EVENT}-COMPLETE.md`
- **Index:** `00-START-HERE.md` (00 prefix sorts first)

### Configuration Files:
- **Pattern:** `{purpose}-{type}.json`
- **Examples:** `gsc-config.json`, `safety-limits.json`, `notification-config.json`

### Test Files:
- **Pattern:** `{feature}.test.ts`
- **Examples:** `safety-features.test.ts`, `budget-tools.test.ts`

---

## What to Update When Adding Components

### When Adding New MCP Tool:

**Required updates:**
1. ✅ Create tool file in `src/{api}/tools/{category}.ts`
2. ✅ Export in `src/{api}/tools/index.ts`
3. ✅ Add to allTools array in `src/gsc/tools/index.ts`
4. ✅ Create test in `tests/{tool-name}.test.ts`
5. ✅ Update tool count in `docs/status/CURRENT-STATUS.md`
6. ✅ Update README.md tool count
7. ✅ Create Linear ticket documenting the work
8. ✅ Update API reference doc in `docs/api-reference/`
9. ✅ Commit with descriptive message

**Use skills:**
- `mcp-tool-creator` - Generate tool with safety
- `safety-audit-reviewer` - Verify compliance
- `documentation-syncer` - Update docs
- `linear-ticket-creator` - Create ticket
- `github-commit-helper` - Commit properly

---

### When Adding New API:

**Required structure:**
1. ✅ Create directory: `src/{new-api-name}/`
2. ✅ Create client: `src/{new-api-name}/client.ts`
3. ✅ Create types: `src/{new-api-name}/types.ts`
4. ✅ Create validation: `src/{new-api-name}/validation.ts`
5. ✅ Create tools: `src/{new-api-name}/tools.ts` or `tools/` directory
6. ✅ Initialize client in `src/gsc/server.ts`
7. ✅ Import tools in `src/gsc/tools/index.ts`
8. ✅ Add npm package to `package.json` (if needed)
9. ✅ Create API reference doc in `docs/api-reference/{API}-REFERENCE.md`
10. ✅ Update README.md with new API
11. ✅ Create Linear ticket for integration
12. ✅ Update status docs

---

### When Adding Safety Feature:

**File location:** `src/shared/{feature-name}.ts`

**Required updates:**
1. ✅ Create feature file
2. ✅ Import in relevant tool files
3. ✅ Add to safety checklist in `safety-audit-reviewer` skill
4. ✅ Document in `docs/safety/SAFETY-AUDIT.md`
5. ✅ Update safety count in status docs
6. ✅ Create tests
7. ✅ Create Linear ticket

---

### When Adding Documentation:

**Decision:** Which docs/ subdirectory?
- How-to guide → `docs/guides/`
- Architecture/design → `docs/architecture/`
- API reference → `docs/api-reference/`
- Safety/compliance → `docs/safety/`
- Project status → `docs/status/` (active) or `docs/status/archive/` (historical)
- Internal/handover → `docs/internal/`

**Required updates:**
1. ✅ Create doc in appropriate directory
2. ✅ Add to `docs/00-START-HERE.md` index
3. ✅ Link from README.md if essential
4. ✅ Cross-link from related docs
5. ✅ Update doc count in status files

---

### When Adding Claude Code Skill:

**Location:** `.claude/skills/{skill-name}/`

**Required:**
1. ✅ Create directory: `.claude/skills/{skill-name}/`
2. ✅ Create `SKILL.md` with YAML frontmatter
3. ✅ Add templates/ and examples/ if needed
4. ✅ Document in `docs/guides/SKILLS-GUIDE.md`
5. ✅ Test by restarting Claude Code

---

## Examples from Project

### Perfect API Module: Google Ads

```
src/ads/
├── client.ts (340 lines) - API wrapper
├── types.ts - TypeScript types
├── validation.ts - Zod schemas
└── tools/ (well-organized by category!)
    ├── accounts.ts - 1 tool (account discovery)
    ├── reporting.ts - 5 tools (performance data)
    ├── campaigns.ts - 2 tools (status, create)
    ├── budgets.ts - 2 tools (create, update)
    ├── keywords.ts - 2 tools (add keywords, negatives)
    ├── conversions.ts - 5 tools (conversion tracking)
    ├── audiences.ts - 4 tools (remarketing)
    ├── assets.ts - 1 tool (creative assets)
    ├── keyword-planning.ts - 1 tool (keyword research)
    ├── bidding.ts - 1 tool (bidding strategies)
    ├── extensions.ts - 1 tool (ad extensions)
    └── index.ts - Exports all 25 tools
```

**Why this is perfect:**
- Self-contained (doesn't depend on other APIs)
- Organized by category (related tools together)
- Scalable (can add more categories easily)
- Clear exports (index.ts)

### Perfect Documentation Organization

```
docs/
├── 00-START-HERE.md (index - start here!)
│
├── guides/ (for users)
│   ├── SETUP-GUIDE.md
│   ├── INTEGRATION-GUIDE.md
│   ├── TESTING-GUIDE.md
│   └── SKILLS-GUIDE.md
│
├── architecture/ (for understanding system)
│   ├── CLAUDE.md (main doc)
│   ├── project-plan.md
│   ├── OMA-MCP-INTEGRATION.md
│   └── AWS-DEPLOYMENT-GUIDE.md
│
└── (other categories similarly organized)
```

**Why this is perfect:**
- Clear hierarchy (guides vs architecture vs references)
- Easy to find (00-START-HERE.md index)
- Scalable (can add more guides without clutter)
- Logical grouping (by purpose, not chronology)

---

## Anti-Patterns to Avoid

### ❌ Don't Do This:

**1. Mixed Concerns:**
```
src/tools/
├── gsc-tools.ts
├── ads-tools.ts
└── shared-utilities.ts  # ❌ Mixed with tools
```
**Instead:** Each API separate, shared in src/shared/

**2. Flat Tool Structure:**
```
src/ads/tools/
├── tool1.ts
├── tool2.ts
├── tool3.ts
... (50 files - unmanageable)
```
**Instead:** Group by category (budgets.ts, campaigns.ts, etc.)

**3. Documentation Dumping:**
```
Root directory:
- DOC1.md
- DOC2.md
- DOC3.md
... (32 files in root)
```
**Instead:** Organize in docs/ subdirectories

**4. Monolithic Files:**
```
src/google-apis/everything.ts (5,000 lines)
```
**Instead:** Split by API, then by category

**5. Unclear Names:**
```
src/stuff.ts
docs/notes.md
config/config.json
```
**Instead:** Descriptive names (approval-enforcer.ts, SAFETY-AUDIT.md, safety-limits.json)

---

## Quick Reference

### "Where does X go?"

| What | Where | Example |
|------|-------|---------|
| New MCP tool | `src/{api}/tools/{category}.ts` | `src/ads/tools/budgets.ts` |
| New API integration | `src/{new-api}/` | `src/business-profile/` |
| New safety feature | `src/shared/{feature}.ts` | `src/shared/approval-enforcer.ts` |
| New shared utility | `src/shared/{utility}.ts` | `src/shared/logger.ts` |
| HTTP endpoint | `src/http-server/server.ts` | (add to existing) |
| How-to guide | `docs/guides/` | `docs/guides/SETUP-GUIDE.md` |
| Architecture doc | `docs/architecture/` | `docs/architecture/CLAUDE.md` |
| API reference | `docs/api-reference/` | `docs/api-reference/GOOGLE-ADS-API-REFERENCE.md` |
| Safety doc | `docs/safety/` | `docs/safety/SAFETY-AUDIT.md` |
| Status report | `docs/status/` | `docs/status/CURRENT-STATUS.md` |
| Historical status | `docs/status/archive/` | `docs/status/archive/FINAL-STATUS-OCT-18.md` |
| Agent handover | `docs/internal/` | `docs/internal/AGENT-HANDOVER.md` |
| Test file | `tests/{name}.test.ts` | `tests/safety-features.test.ts` |
| Config file | `config/{purpose}.json` | `config/safety-limits.json` |
| Utility script | `scripts/{purpose}.sh` | `scripts/count-tools.sh` |
| Claude skill | `.claude/skills/{name}/SKILL.md` | `.claude/skills/mcp-tool-creator/SKILL.md` |

---

## Checklist Before Creating Anything

**Before writing code, ask yourself:**

1. □ Have I invoked `project-organization` skill?
2. □ Do I know where this file belongs?
3. □ Does a similar file already exist? (don't duplicate)
4. □ Is this truly a new module or can it be added to existing?
5. □ What else needs updating when I create this?
6. □ Am I following the modular patterns?

**If unsure about ANY of these → invoke this skill!**

---

## Workflow: Creating New Feature

```
1. Invoke project-organization skill
   ↓
2. Understand where everything goes
   ↓
3. Use mcp-tool-creator (if tool) or create file manually
   ↓
4. Run safety-audit-reviewer (if write tool)
   ↓
5. Create tests
   ↓
6. Use documentation-syncer to update docs
   ↓
7. Use linear-ticket-creator to document work
   ↓
8. Use github-commit-helper to commit
   ↓
9. Verify with deployment-readiness-checker
```

---

## Benefits of This Skill

### For New Agents:
- **Immediate understanding** of project structure
- **Prevents mistakes** (files in wrong places)
- **Maintains consistency** across all agents
- **Onboarding:** From confused to productive in minutes

### For Project Quality:
- **Clean structure** as project scales
- **Easy to find** anything
- **Logical organization** that makes sense
- **Scalable** to 200+ tools without chaos

### For Team:
- **All agents follow same patterns** (consistency!)
- **No cleanup needed** (organized from start)
- **Easy code review** (everything in expected places)
- **Fast navigation** (know where to look)

---

## Remember

**Good organization = Good code = Good product**

This project will serve 1,000+ WPP practitioners - organization matters!

Invoke this skill FIRST, create files RIGHT, maintain structure ALWAYS!
