---
name: Safety Audit Reviewer
description: Audit MCP write operations against 9-layer safety checklist from SAFETY-AUDIT.md, ensuring all protections are properly integrated
---

# Safety Audit Reviewer Skill

## Purpose

Review write operation tools to ensure ALL 9 safety layers are properly implemented. This prevents safety gaps that could lead to accidental destructive operations or financial losses.

## The 9 Safety Layers

Every WRITE operation in WPP MCP must have:

### 1. Account Authorization ✅
**What to check:**
- Tool validates user has access to account
- Uses AccountAuthorizationManager (HTTP server mode)
- Blocks unauthorized account access

**How to verify:**
```typescript
// Look for:
import { /* ... */ } from '../../shared/account-authorization.js';
// OR check that HTTP server validates before calling tool
```

### 2. Approval Workflow ✅
**What to check:**
- Imports ApprovalEnforcer and DryRunResultBuilder
- Returns preview if no confirmationToken
- Executes only with valid token
- 60-second confirmation window

**How to verify:**
```typescript
// Must have:
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';

// Must build preview:
const dryRunBuilder = new DryRunResultBuilder(...);
dryRunBuilder.addChange({ ... });
const dryRun = dryRunBuilder.build();

// Must check token:
if (!confirmationToken) {
  return { requiresApproval: true, preview, confirmationToken };
}

// Must validate and execute:
await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
  // actual operation
});
```

### 3. Vagueness Detection ✅
**What to check:**
- Imports vagueness detector
- Calls detectAndEnforceVagueness() at start of handler
- Blocks if required fields missing or vague terms present

**How to verify:**
```typescript
// Must have:
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';

// Must call:
detectAndEnforceVagueness({
  operation: 'tool_name',
  inputText: `description`,
  inputParams: input,
});
```

### 4. Budget Caps ✅ (if financial operation)
**What to check:**
- For budget/bid changes: Interceptor checks >500% changes
- Preview shows percentage change
- Error thrown if exceeds cap

**How to verify:**
```typescript
// Interceptor automatically validates (in update_budget)
// Check preview includes:
dryRunBuilder.setFinancialImpact({
  percentageChange: calculated_percent
});

// The interceptor in src/shared/interceptor.ts handles blocking
```

### 5. Bulk Limits ✅ (if bulk operation)
**What to check:**
- Max 20 items for pattern matching
- Max 50 items for keyword additions
- Error thrown if exceeded

**How to verify:**
```typescript
// Must have:
if (keywords.length > 50) {
  throw new Error('Cannot add more than 50 keywords per operation');
}

// Or use validation:
keywords: z.array(z.object({...})).max(50)
```

### 6. Snapshot Creation ✅
**What to check:**
- ApprovalEnforcer.validateAndExecute() automatically creates snapshot
- No manual code needed (handled by enforcer)

**How to verify:**
- Using approvalEnforcer.validateAndExecute() = automatic snapshots ✅

### 7. Financial Impact Calculation ✅ (if applicable)
**What to check:**
- Budget changes calculate daily/monthly impact
- Percentage change calculated
- Added to preview

**How to verify:**
```typescript
// Must have (for financial operations):
const impact = {
  currentDailySpend: current,
  estimatedNewDailySpend: estimated,
  dailyDifference: diff,
  monthlyDifference: diff * 30.4,
  percentageChange: percent
};

dryRunBuilder.setFinancialImpact(impact);
```

### 8. Comprehensive Agent Guidance ✅
**What to check:**
- Description includes:
  - What tool does
  - Safety features listed
  - Best practices
  - Risk warnings
  - Example workflow
  - Recommendations

**How to verify:**
Look for description sections:
- ⚠️ SAFETY FEATURES
- 💡 AGENT GUIDANCE
- 📊 FINANCIAL IMPACT (if applicable)
- Example Workflow

### 9. Testing ✅
**What to check:**
- Test file exists in `tests/`
- Tests preview generation
- Tests execution with token
- Tests vagueness detection
- Tests validation

**How to verify:**
- Check `tests/{tool-name}.test.ts` exists
- At least 3-4 tests per write tool

---

## Audit Workflow

### Step 1: Identify Tool Type
```bash
# Read tool = 6 layers not needed
# Write tool = ALL 9 layers required
```

### Step 2: Run Checklist

For each write tool, check ALL 9 layers:
- [ ] 1. Account authorization
- [ ] 2. Approval workflow (preview/token)
- [ ] 3. Vagueness detection
- [ ] 4. Budget caps (if financial)
- [ ] 5. Bulk limits (if bulk)
- [ ] 6. Snapshot (via approvalEnforcer)
- [ ] 7. Financial impact (if financial)
- [ ] 8. Agent guidance
- [ ] 9. Testing

### Step 3: Report Findings

Generate audit report:
```markdown
# SAFETY AUDIT: {tool_name}

## Status: ✅ COMPLIANT / ⚠️ ISSUES FOUND

## Checklist Results:
1. Account Authorization: ✅ / ❌
2. Approval Workflow: ✅ / ❌
3. Vagueness Detection: ✅ / ❌
4. Budget Caps: ✅ / ❌ / N/A
5. Bulk Limits: ✅ / ❌ / N/A
6. Snapshot Creation: ✅ / ❌
7. Financial Impact: ✅ / ❌ / N/A
8. Agent Guidance: ✅ / ❌
9. Testing: ✅ / ❌

## Issues Found:
[List any missing layers]

## Recommendations:
[Specific fixes needed with code snippets]
```

## Quick Audit Commands

### Audit Single Tool:
```typescript
// Check if tool file contains required imports
grep -l "ApprovalEnforcer" src/ads/tools/budgets.ts
grep -l "detectAndEnforceVagueness" src/ads/tools/budgets.ts

// Check if exported
grep "updateBudgetTool" src/ads/tools/index.ts
```

### Audit All Write Tools:
```bash
# List all write tools
grep -r "WRITE OPERATION" src/*/tools/*.ts

# Check each has approval workflow
grep -L "ApprovalEnforcer" src/*/tools/*.ts | grep -v "reporting\|accounts"
```

## Common Safety Gaps

### Gap 1: Missing Vagueness Detection
**Symptom:** Tool accepts requests without specific IDs/amounts

**Fix:**
```typescript
// Add at start of handler:
detectAndEnforceVagueness({
  operation: 'tool_name',
  inputText: `${input.description}`,
  inputParams: input,
});
```

### Gap 2: No Preview for Write Operation
**Symptom:** Tool executes immediately without showing changes

**Fix:**
```typescript
// Add preview logic:
if (!confirmationToken) {
  const dryRunBuilder = new DryRunResultBuilder(...);
  // Build preview
  return { requiresApproval: true, preview, confirmationToken };
}
```

### Gap 3: Missing Financial Impact
**Symptom:** Budget changes don't show $ impact

**Fix:**
```typescript
// Calculate and add:
const impact = {
  currentDailySpend: oldBudget,
  estimatedNewDailySpend: newBudget,
  dailyDifference: newBudget - oldBudget,
  monthlyDifference: (newBudget - oldBudget) * 30.4,
  percentageChange: ((newBudget - oldBudget) / oldBudget) * 100
};
dryRunBuilder.setFinancialImpact(impact);
```

### Gap 4: Weak Agent Guidance
**Symptom:** Description is brief, missing safety notes

**Fix:**
- Add ⚠️ SAFETY FEATURES section
- Add 💡 AGENT GUIDANCE section
- Add example workflow
- Add best practices

### Gap 5: No Tests
**Symptom:** Tool not tested

**Fix:**
- Create `tests/{tool-name}.test.ts`
- Add 3-4 tests minimum
- Test preview, execution, validation, errors

## When to Use This Skill

Activate when:
- "Audit safety for [tool name]"
- "Review [tool] for safety compliance"
- "Check if [tool] is production-ready"
- "Verify [tool] has all safety features"
- After creating any new write tool

## Integration with mcp-tool-creator

These skills work together:
1. **mcp-tool-creator** creates the tool
2. **safety-audit-reviewer** audits it
3. Fixes any gaps found
4. Re-audits until compliant

## References

- `SAFETY-AUDIT.md` - Complete safety analysis (915 lines)
- `INTEGRATION-GUIDE.md` - Integration templates
- `src/ads/tools/budgets.ts` - Perfect compliant example
- `src/ads/tools/keywords.ts` - Another compliant example

## Remember

**ALL write tools must pass ALL 9 layers**

No exceptions - client money and reputation at stake!

One missing layer = production risk = unacceptable!
