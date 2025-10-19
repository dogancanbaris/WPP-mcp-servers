---
name: Data Flow Router
description: Intelligently route WPP data requests to BigQuery (aggregated analysis), Metabase (full data viewing), or MCP write tools (platform changes)
---

# Data Flow Router Skill

## Purpose

The "traffic cop" of WPP MCP - routes requests to the right destination based on intent, data volume, and output needs.

## Routing Decision Tree

```
User Request
    ↓
Is it a question about data?
│
├─ YES → Need analysis
│   │
│   ├─ Quick insight needed? (Top N, trends, etc.)
│   │   → Route to: BigQuery aggregated query (bigquery-aggregator skill)
│   │   → Returns: 50-400 rows to Claude context
│   │
│   ├─ Need ALL data? (export, share, recurring view)
│   │   → Route to: Metabase dashboard (metabase-dashboard-builder skill)
│   │   → Creates: Dashboard with BigQuery direct connection
│   │
│   └─ Complex cross-platform analysis?
│       → Route to: BigQuery joins (cross-platform-analyzer skill)
│       → Returns: Blended data, 100-300 rows
│
└─ NO → It's an action request
    │
    ├─ Making platform changes? (update, create, delete)
    │   → Route to: MCP write tool with safety workflow
    │   → Flow: Preview → Approve → Execute
    │
    └─ Reading platform config? (list, get)
        → Route to: MCP read tool
        → Flow: Direct execution (safe)
```

## Routing Rules

### Route to BigQuery (aggregated) when:
- "Show me top N..."
- "What are the trends..."
- "Analyze performance for..."
- "Find opportunities in..."
- **Expected rows:** 50-400
- **Token cost:** Low (~1,000 tokens)
- **Speed:** Fast (2-5 seconds)

### Route to Metabase when:
- "Create dashboard for..."
- "I need to export all..."
- "Share report with client..."
- "Set up recurring report..."
- **Expected rows:** All data (no limit)
- **Token cost:** Near zero (Claude only creates dashboard definition)
- **Speed:** One-time setup, infinite views

### Route to MCP write tools when:
- "Update budget..."
- "Pause campaign..."
- "Add keywords..."
- "Create conversion action..."
- **Safety:** Full approval workflow
- **Token cost:** Low (just preview + confirmation)
- **Impact:** Changes live platform

### Route to MCP read tools when:
- "List my properties..."
- "Get campaign details..."
- "Show conversion actions..."
- **Safety:** None needed (read-only)
- **Token cost:** Low
- **Speed:** Fast

## Examples

### Example 1: Data Question

```
User: "Show me top performing queries for last month"

Router decision:
- Data question ✓
- Top N analysis ✓
- Quick insight needed ✓

Route to: BigQuery aggregated query
→ Uses bigquery-aggregator skill
→ Returns ~50 rows
→ Claude presents in chat
```

### Example 2: Export Need

```
User: "Create a report I can share with the client showing all our SEO data"

Router decision:
- Data question ✓
- Need ALL data ✓
- Sharing/export required ✓

Route to: Metabase dashboard
→ Uses metabase-dashboard-builder skill
→ Creates dashboard with charts + tables
→ Returns dashboard URL
→ Client can view/export directly
```

### Example 3: Platform Change

```
User: "Increase budget for campaign X by 20%"

Router decision:
- Action request ✓
- Platform change ✓
- Financial impact ✓

Route to: MCP write tool (update_budget)
→ Generates preview with financial impact
→ Requires approval
→ Executes with safety
→ Logs and snapshots
```

### Example 4: Complex Analysis

```
User: "Show me campaigns where we're spending money but also ranking organically"

Router decision:
- Data question ✓
- Cross-platform (Ads + GSC) ✓
- Complex join needed ✓

Route to: BigQuery join query
→ Uses cross-platform-analyzer skill
→ Joins ads + gsc tables
→ Returns ~100 rows
→ Claude analyzes overlap
```

## Integration with WPP Workflow

This skill IS the workflow orchestrator at routing level:

```
wpp-practitioner-assistant (master orchestrator)
    ↓
data-flow-router (traffic cop)
    ↓
┌─────────────────┬───────────────────┬────────────────┐
│ bigquery-       │ metabase-         │ MCP write tools│
│ aggregator      │ dashboard-builder │ (with safety)  │
└─────────────────┴───────────────────┴────────────────┘
```

## When to Use

Auto-activates as part of wpp-practitioner-assistant

Or manually when user asks:
- "What's the best way to get [data]?"
- "Should I use BigQuery or Metabase for this?"

## Remember

**Routing correctly = efficiency**
- Wrong route = wasted tokens or slow response
- Right route = fast, cheap, effective
