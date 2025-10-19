---
name: Linear Ticket Creator
description: Create detailed Linear tickets for WPP MCP work using project categorization (A-J categories), following format from MCP-1 to MCP-43
---

# Linear Ticket Creator Skill

## Purpose

Create Linear tickets that match the established WPP MCP Servers format and categorization system.

## Ticket Categories (A-J)

- **A:** Foundation & Infrastructure
- **B:** Google Search Console Integration
- **C:** Chrome UX Report Integration
- **D:** Google Ads Integration
- **E:** Google Analytics Integration
- **F:** HTTP Server & OMA Integration
- **G:** Safety Features
- **H:** Documentation
- **I:** API Expansion
- **J:** Status & Completion Milestones

## Ticket Format Template

```markdown
# {Title}

## Status: ✅ COMPLETED / ⏳ IN PROGRESS / 📋 PENDING

## What Was Built
[Description of what was created/implemented]

## Files Created/Modified
- `path/to/file.ts` - Description (XXX lines)
- `path/to/other.ts` - Description

## Key Features
- Feature 1
- Feature 2
- Feature 3

## [Additional sections based on type]
For implementation tickets:
- Testing Results
- Integration Notes
- Safety Features (if write operations)

For planning tickets:
- Planned Tools/Features
- Estimated Timeline
- Dependencies
- Next Steps

## Completion Notes
[For completed tickets: what was achieved, any notes]
[For pending tickets: what needs to be done]
```

## Status Assignment

- **Done:** Feature complete, tested, integrated
- **In Progress:** Started but not finished (include % if known)
- **Todo:** Planned but not started

## Label Recommendations

Based on ticket content, suggest labels:
- API name: `google-ads`, `gsc`, `google-analytics`, `bigquery`, etc.
- Type: `read-operations`, `write-operations`, `safety`, `documentation`, `testing`, etc.
- Status: `completed`, `in-progress`, `pending`, `expansion`
- Priority: `critical`, `high-priority` (if applicable)

## Usage

When user says:
- "Create Linear ticket for [work done]"
- "Document [feature] in Linear"
- "Add ticket for [new work]"

Ask clarifying questions:
1. Which category (A-J)?
2. Status (Done/In Progress/Todo)?
3. Files created/modified?
4. Key features or deliverables?

Then create ticket via Linear MCP tool:
```typescript
mcp.call('mcp__linear-server__create_issue', {
  team: 'MCP Servers',
  title: '{Category}{Number}: {Title}',
  description: formatted_markdown,
  state: status_mapping[user_status],
  labels: recommended_labels
});
```

## Team Info

- **Team Name:** MCP Servers
- **Team ID:** 58e2cf30-3682-4245-b7e5-ae0975ec7eee
- **Current Tickets:** MCP-1 to MCP-43
- **Next Number:** MCP-44+

## Examples

See existing tickets MCP-1 through MCP-43 for perfect examples of:
- Completed work (MCP-1 to MCP-33)
- In-progress work (MCP-26, MCP-27, MCP-28)
- Expansion planning (MCP-34 to MCP-39)
