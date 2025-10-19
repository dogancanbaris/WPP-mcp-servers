---
name: Documentation Syncer
description: Update WPP MCP status documentation files (CURRENT-STATUS.md, README.md, tool counts, metrics) when tools added or milestones reached
---

# Documentation Syncer Skill

## Purpose

Keep project documentation synchronized with code changes. Updates metrics, tool counts, and status across multiple documentation files.

## Files to Keep Updated

### Primary Status Files:
1. **CURRENT-STATUS.md** - Current state snapshot
2. **README.md** - Project overview and metrics
3. **CLAUDE.md** - Project documentation (if major changes)

### Metrics to Track:

```
Current Metrics (update these):
- Total Tools: 58 (update when tools added)
- Total APIs: 7 (update when API added)
- Lines of Code: ~18,750 (recalculate when major changes)
- Safety Features: 9 (update when new safety added)
- Documentation Files: 18+ (count .md files)
- Tests: 23 (update when tests added)
```

## Update Patterns

### When Tool Added:
Update in these files:
- README.md: Tool count by API section
- CURRENT-STATUS.md: Tool inventory section
- Any FINAL-STATUS-*.md being actively used

### When Safety Feature Completed:
Update:
- CURRENT-STATUS.md: Safety status section
- README.md: Safety features list
- Production readiness percentage

### When Milestone Reached:
- Create new FINAL-STATUS-{DATE}.md
- Update CURRENT-STATUS.md
- Update README.md roadmap

## Calculation Scripts

### Tool Count by API:
```bash
# Count tools in each API module
echo "GSC: $(grep -r "export const.*Tool = {" src/gsc/tools/*.ts | wc -l)"
echo "CrUX: $(grep -r "export const.*Tool = {" src/crux/tools.ts | wc -l)"
echo "Ads: $(grep -r "export const.*Tool = {" src/ads/tools/*.ts | wc -l)"
echo "Analytics: $(grep -r "export const.*Tool = {" src/analytics/tools/*.ts | wc -l)"
echo "Business Profile: $(grep -r "export const.*Tool = {" src/business-profile/tools.ts | wc -l)"
echo "BigQuery: $(grep -r "export const.*Tool = {" src/bigquery/tools.ts | wc -l)"
echo "SERP: $(grep -r "export const.*Tool = {" src/serp/tools.ts | wc -l)"
```

### Line Count:
```bash
find src -name "*.ts" -exec wc -l {} + | tail -1
```

### Safety Feature Completion:
Count completed safety features by checking if files exist and are integrated.

## Usage

Activate when:
- "Update the docs with new tool count"
- "Sync documentation"
- "Update README metrics"
- After adding tools or completing features

## Remember

Keep documentation current - it's how the team stays aligned!
