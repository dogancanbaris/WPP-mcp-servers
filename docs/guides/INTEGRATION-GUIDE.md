# Safety Integration Guide

## How to Integrate Safety Features into MCP Tools

This guide shows how to integrate the safety infrastructure into write operation tools.

---

## Quick Start: Copy-Paste Template

For any write operation tool, follow this pattern (based on `update_budget` implementation):

### 1. Add Imports

```typescript
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
```

### 2. Add `confirmationToken` to Input Schema

```typescript
inputSchema: {
  type: 'object' as const,
  properties: {
    // ... existing properties ...
    confirmationToken: {
      type: 'string',
      description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
    },
  },
  required: [/* existing required fields */],
}
```

### 3. Integrate into Handler

```typescript
async handler(input: any) {
  try {
    const { /* params */, confirmationToken } = input;

    // STEP 1: Vagueness Detection (optional but recommended)
    detectAndEnforceVagueness({
      operation: 'tool_name',
      inputText: `human-readable description of operation`,
      inputParams: input,
    });

    // STEP 2: Get current state (for preview)
    const currentState = await /* fetch current state */;

    // STEP 3: Build dry-run preview
    const approvalEnforcer = getApprovalEnforcer();
    const dryRunBuilder = new DryRunResultBuilder(
      'tool_name',
      'API Name', // e.g., 'Google Ads', 'GSC'
      accountId
    );

    // Add changes
    dryRunBuilder.addChange({
      resource: 'Resource Type', // e.g., 'Campaign Budget'
      resourceId: resourceId,
      field: 'field_name',
      currentValue: currentState.field,
      newValue: newValue,
      changeType: 'update', // or 'create', 'delete'
    });

    // Add financial impact (if applicable)
    if (hasFinancialImpact) {
      dryRunBuilder.setFinancialImpact({
        currentDailySpend: current,
        estimatedNewDailySpend: estimated,
        dailyDifference: difference,
        monthlyDifference: difference * 30.4,
        percentageChange: percentChange,
      });
    }

    // Add risks
    dryRunBuilder.addRisk('Description of risk');

    // Add recommendations
    dryRunBuilder.addRecommendation('Suggestion for user');

    const dryRun = dryRunBuilder.build();

    // STEP 4: If no confirmation token, return preview
    if (!confirmationToken) {
      const { confirmationToken: token } = await approvalEnforcer.createDryRun(
        'tool_name',
        'API Name',
        accountId,
        { /* operation params */ }
      );

      const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

      return {
        success: true,
        requiresApproval: true,
        preview,
        confirmationToken: token,
        message: 'Operation requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
      };
    }

    // STEP 5: Execute with confirmation
    logger.info('Executing with confirmation', { /* params */ });

    const result = await approvalEnforcer.validateAndExecute(
      confirmationToken,
      dryRun,
      async () => {
        // Execute the actual operation
        return await client.performOperation(/* params */);
      }
    );

    return {
      success: true,
      data: {
        /* operation results */
        message: `✅ Operation completed successfully`,
      },
    };
  } catch (error) {
    logger.error('Operation failed', error as Error);
    throw error;
  }
}
```

---

## Examples

### Example 1: Budget Update (Complete Implementation)

See `src/ads/tools/budgets.ts` - `updateBudgetTool`

**Key Features:**
- Financial impact calculation
- Budget cap validation (>500% blocked in interceptor)
- Percentage change warnings
- Recommendations based on change size

### Example 2: Campaign Status Update (Complete Implementation)

See `src/ads/tools/campaigns.ts` - `updateCampaignStatusTool`

**Key Features:**
- Vagueness detection (ensures specific campaign ID)
- Status-specific risks (ENABLED vs PAUSED vs REMOVED)
- Current state retrieval for preview
- Contextual recommendations

### Example 3: Budget Creation (Complete Implementation)

See `src/ads/tools/budgets.ts` - `createBudgetTool`

**Key Features:**
- Create operation (no current state)
- High budget warnings
- Future impact estimation

---

## Remaining Tools to Integrate

### Priority 1: High-Risk Operations

**1. Add Keywords** (`src/ads/tools/keywords.ts` - `addKeywordsTool`)

Pattern matching integration needed:

```typescript
import { getPatternMatcher } from '../../shared/pattern-matcher.js';

// Check if adding >50 keywords
if (keywords.length > 50) {
  throw new Error(`Cannot add ${keywords.length} keywords in one operation. Maximum is 50. Please batch into smaller operations.`);
}

// Build preview showing all keywords
keywords.forEach((kw) => {
  dryRunBuilder.addChange({
    resource: 'Keyword',
    resourceId: 'new',
    field: 'text',
    currentValue: 'N/A (new keyword)',
    newValue: `"${kw.text}" [${kw.matchType}] @ $${kw.maxCpcDollars}/click`,
    changeType: 'create',
  });
});
```

**2. Add Negative Keywords** (`src/ads/tools/keywords.ts` - `addNegativeKeywordsTool`)

Similar to add_keywords but with pattern matching for bulk negatives.

**3. Submit Sitemap** (`src/gsc/tools/sitemaps.ts` - `submitSitemapTool`)

```typescript
// Simple approval workflow
dryRunBuilder.addChange({
  resource: 'Sitemap',
  resourceId: sitemapUrl,
  field: 'status',
  currentValue: 'Not submitted',
  newValue: 'Submitted',
  changeType: 'create',
});

dryRunBuilder.addRecommendation(
  'Verify sitemap is accessible and valid before submitting'
);
```

**4. Delete Sitemap** (`src/gsc/tools/sitemaps.ts` - `deleteSitemapTool`)

```typescript
// Requires explicit confirmation
dryRunBuilder.addChange({
  resource: 'Sitemap',
  resourceId: sitemapUrl,
  field: 'status',
  currentValue: 'Submitted',
  newValue: 'Deleted',
  changeType: 'delete',
});

dryRunBuilder.addRisk(
  'Sitemap will be removed from Google Search Console'
);

dryRunBuilder.addRecommendation(
  'Consider if you really need to delete this sitemap'
);
```

### Priority 2: Read-Only Operations

These do NOT need safety integration:
- All `list_*` tools
- All `get_*` tools
- `query_search_analytics`
- `inspect_url`
- Performance reporting tools

---

## Pattern Matching for Bulk Operations

When a tool accepts patterns (e.g., "pause all campaigns matching 'test*'"):

```typescript
import { getPatternMatcher } from '../../shared/pattern-matcher.js';

const matcher = getPatternMatcher();

// Match campaigns by pattern
const matchResult = matcher.matchCampaigns({
  pattern: input.pattern,
  campaigns: allCampaigns,
});

// This automatically:
// - Checks if >20 items matched (throws TooManyMatchesError)
// - Formats full list for confirmation
// - Returns confirmation message

if (matchResult.requiresConfirmation) {
  return {
    success: true,
    requiresApproval: true,
    preview: matchResult.confirmationMessage,
    itemsToConfirm: matchResult.matchedItems,
  };
}
```

---

## Vagueness Detection

Add to any operation where vague requests could be dangerous:

```typescript
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';

// This will throw VagueRequestError if request is too vague
detectAndEnforceVagueness({
  operation: 'update_campaign_status',
  inputText: `update campaign ${campaignId} to ${status}`,
  inputParams: { customerId, campaignId, status },
});
```

**What it detects:**
- Indefinite references ("it", "them", "those")
- Relative terms without numbers ("high", "low", "more")
- Quantifiers without specifics ("all", "some", "many")
- Missing required parameters

---

## Snapshots for Rollback

To enable rollback, create a snapshot before execution:

```typescript
import { getSnapshotManager } from '../../shared/snapshot-manager.js';

const snapshotManager = getSnapshotManager();

// Create snapshot before execution
const snapshotId = await snapshotManager.createSnapshot({
  operation: 'update_budget',
  api: 'Google Ads',
  accountId: customerId,
  userId: 'user@example.com', // From request context
  resourceType: 'Campaign Budget',
  resourceId: budgetId,
  beforeState: currentBudget,
});

// Execute operation
const result = await client.updateBudget(...);

// Record execution
await snapshotManager.recordExecution(snapshotId, result);
```

---

## Notifications

Send notifications for important operations:

```typescript
import { sendNotification, NotificationType, NotificationPriority } from '../../shared/notification-system.js';

await sendNotification({
  type: NotificationType.BUDGET_CHANGE,
  priority: NotificationPriority.HIGH,
  userId: 'user@example.com',
  accountId: customerId,
  api: 'Google Ads',
  operation: 'update_budget',
  message: `Budget updated from $${oldAmount}/day to $${newAmount}/day`,
  details: { budgetId, oldAmount, newAmount, percentageChange },
});
```

---

## Testing Your Integration

### 1. Unit Test Template

```typescript
import { getApprovalEnforcer } from '../shared/approval-enforcer';

describe('update_budget with approval workflow', () => {
  it('should return preview when no confirmation token provided', async () => {
    const result = await updateBudgetTool.handler({
      customerId: '123',
      budgetId: '456',
      newDailyAmountDollars: 100,
      // No confirmationToken
    });

    expect(result.requiresApproval).toBe(true);
    expect(result.confirmationToken).toBeDefined();
    expect(result.preview).toContain('PREVIEW');
  });

  it('should execute when valid confirmation token provided', async () => {
    // First call - get token
    const previewResult = await updateBudgetTool.handler({
      customerId: '123',
      budgetId: '456',
      newDailyAmountDollars: 100,
    });

    // Second call - confirm
    const executeResult = await updateBudgetTool.handler({
      customerId: '123',
      budgetId: '456',
      newDailyAmountDollars: 100,
      confirmationToken: previewResult.confirmationToken,
    });

    expect(executeResult.success).toBe(true);
    expect(executeResult.data).toBeDefined();
  });

  it('should reject expired confirmation token', async () => {
    const expiredToken = 'old_token_from_70_seconds_ago';

    await expect(
      updateBudgetTool.handler({
        customerId: '123',
        budgetId: '456',
        newDailyAmountDollars: 100,
        confirmationToken: expiredToken,
      })
    ).rejects.toThrow('expired');
  });
});
```

### 2. Manual Testing

```bash
# 1. Start MCP server
npm run dev

# 2. Call tool without confirmation (get preview)
# Expected: Returns preview + confirmation token

# 3. Call tool WITH confirmation token
# Expected: Executes operation

# 4. Try to reuse same token
# Expected: Error (token already used)

# 5. Wait 61 seconds, try to use old token
# Expected: Error (token expired)
```

---

## Common Patterns

### High-Value Operation (Budget/Bid Changes)

- ✅ Vagueness detection
- ✅ Financial impact calculation
- ✅ Percentage change warnings
- ✅ Budget cap validation
- ✅ Approval workflow
- ✅ Snapshot for rollback
- ✅ Notification (HIGH priority)

### Medium-Risk Operation (Status Changes)

- ✅ Vagueness detection
- ✅ Approval workflow
- ✅ Status-specific risks/recommendations
- ✅ Snapshot for rollback
- ✅ Notification (MEDIUM priority)

### Bulk Operations (Keywords, Campaigns)

- ✅ Pattern matching (max 20 items)
- ✅ Full list display
- ✅ Approval workflow
- ✅ Notification (MEDIUM priority)

### Low-Risk Operations (Sitemap Submit)

- ✅ Simple approval workflow
- ✅ Basic recommendations
- ✅ Notification (LOW priority)

---

## Error Handling

All safety features throw specific error types:

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof VagueRequestError) {
    // User needs to provide more specific request
    return { success: false, error: error.message };
  }

  if (error instanceof TooManyMatchesError) {
    // Pattern matched too many items
    return { success: false, error: error.message };
  }

  if (error instanceof UnauthorizedAccountAccessError) {
    // User doesn't have access to this account
    return { success: false, error: error.message };
  }

  // Generic error
  throw error;
}
```

---

## Summary Checklist

For each write operation tool:

- [ ] Add `confirmationToken` to input schema
- [ ] Import approval enforcer and dry-run builder
- [ ] Build dry-run preview with changes
- [ ] Add financial impact (if applicable)
- [ ] Add risks and recommendations
- [ ] Return preview if no confirmation token
- [ ] Execute with approval enforcer if confirmed
- [ ] Add vagueness detection (recommended)
- [ ] Create snapshot for rollback (recommended)
- [ ] Send notification (recommended)
- [ ] Write tests
- [ ] Update tool description with approval workflow

---

## Need Help?

See completed implementations:
- `src/ads/tools/budgets.ts` - Both create and update
- `src/ads/tools/campaigns.ts` - Status updates

Or refer to safety feature documentation:
- `src/shared/approval-enforcer.ts` - Approval system
- `src/shared/vagueness-detector.ts` - Vagueness detection
- `src/shared/pattern-matcher.ts` - Bulk operations
- `src/shared/snapshot-manager.ts` - Rollback capability
