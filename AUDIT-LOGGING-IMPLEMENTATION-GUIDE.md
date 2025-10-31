# Audit Logging Implementation Guide

**Date:** October 30, 2025
**Purpose:** Add comprehensive audit logging to all MCP tools
**Status:** 4 of 54 tools complete - CRITICAL GAP IDENTIFIED

---

## Critical Finding

**Issue:** Only 11 GSC tools have audit logging. **43 tools have NO audit logging:**
- ❌ 21 Google Ads tools (budgets, campaigns, keywords, conversions, audiences, etc.)
- ❌ 11 Analytics tools (property creation, data streams, dimensions, etc.)
- ❌ 3 BigQuery tools
- ❌ 3 Business Profile tools
- ❌ 6 WPP Analytics tools

**Impact:** No audit trail for client data operations - cannot track who did what, when, on which accounts.

**Priority:** FIX BEFORE CLIENT DATA TESTING

---

## Tools Completed ✅ (4/54)

### Google Ads
- ✅ create_budget
- ✅ update_budget
- ✅ create_campaign
- ✅ update_campaign_status

---

## Tools Needing Audit Logging (50 Remaining)

### 🔴 CRITICAL - Google Ads Write Tools (17 tools)

**Keywords (2 tools):**
- [ ] `src/ads/tools/keywords.ts` → add_keywords
- [ ] `src/ads/tools/keywords.ts` → add_negative_keywords

**Conversions (5 tools):**
- [ ] `src/ads/tools/conversions.ts` → create_conversion_action
- [ ] `src/ads/tools/conversions.ts` → upload_click_conversions
- [ ] `src/ads/tools/conversions.ts` → upload_conversion_adjustments
- [ ] `src/ads/tools/conversions.ts` → list_conversion_actions (read)
- [ ] `src/ads/tools/conversions.ts` → get_conversion_action (read)

**Audiences (4 tools):**
- [ ] `src/ads/tools/audiences.ts` → create_user_list
- [ ] `src/ads/tools/audiences.ts` → upload_customer_match_list
- [ ] `src/ads/tools/audiences.ts` → create_audience
- [ ] `src/ads/tools/audiences.ts` → list_user_lists (read)

**Read Operations (6 tools):**
- [ ] `src/ads/tools/reporting/list-campaigns.tool.ts`
- [ ] `src/ads/tools/reporting/get-campaign-performance.tool.ts`
- [ ] `src/ads/tools/reporting/get-search-terms.tool.ts`
- [ ] `src/ads/tools/reporting/list-budgets.tool.ts`
- [ ] `src/ads/tools/reporting/get-keyword-performance.tool.ts`
- [ ] `src/ads/tools/accounts.ts` → list_accessible_accounts

**Other Operations:**
- [ ] `src/ads/tools/assets.ts` → list_assets (read)
- [ ] `src/ads/tools/bidding.ts` → list_bidding_strategies (read)
- [ ] `src/ads/tools/extensions.ts` → list_ad_extensions (read)
- [ ] `src/ads/tools/keyword-planning.ts` → generate_keyword_ideas (read)

---

### 🔴 CRITICAL - Analytics Write Tools (8 tools)

**All in `src/analytics/tools/admin.ts`:**
- [ ] create_analytics_property
- [ ] create_data_stream
- [ ] create_custom_dimension
- [ ] create_custom_metric
- [ ] create_conversion_event
- [ ] create_google_ads_link

**Read Operations:**
- [ ] `src/analytics/tools/reporting/run-report.tool.ts` → run_analytics_report
- [ ] `src/analytics/tools/reporting/get-realtime-users.tool.ts` → get_realtime_users

---

### 🟡 HIGH - BigQuery & Business Profile (6 tools)

**BigQuery (3 tools) - `src/bigquery/tools.ts`:**
- [ ] create_bigquery_dataset (write)
- [ ] run_bigquery_query (read)
- [ ] list_bigquery_datasets (read)

**Business Profile (3 tools) - `src/business-profile/tools.ts`:**
- [ ] update_business_location (write)
- [ ] list_business_locations (read)
- [ ] get_business_location (read)

---

### 🟡 HIGH - WPP Analytics Platform (6 tools)

**All in `src/wpp-analytics/tools/`:**
- [ ] create_dashboard (write)
- [ ] create_dashboard_from_table (write)
- [ ] update_dashboard_layout (write)
- [ ] delete_dashboard (write)
- [ ] list_dashboards (read)
- [ ] get_dashboard (read)
- [ ] push_platform_data_to_bigquery (write)
- [ ] list_datasets (read)
- [ ] analyze_gsc_data_for_insights (read)

---

### 🟢 LOW - Other Tools (2 tools)

**SERP API - `src/serp/tools.ts`:**
- [ ] search_google (read)

**CrUX API:**
- [ ] All CrUX tools (read-only, low priority)

---

## Implementation Pattern

### Step 1: Add Import

**Add to top of file:**
```typescript
import { getAuditLogger } from '../../gsc/audit.js';  // Adjust path based on file location

const audit = getAuditLogger();
```

**Path Adjustments:**
- From `src/ads/tools/*.ts`: `'../../gsc/audit.js'`
- From `src/ads/tools/campaigns/*.ts`: `'../../../gsc/audit.js'`
- From `src/ads/tools/reporting/*.ts`: `'../../../gsc/audit.js'`
- From `src/analytics/tools/*.ts`: `'../../gsc/audit.js'`
- From `src/bigquery/*.ts`: `'../gsc/audit.js'`
- From `src/wpp-analytics/tools/*.ts`: `'../../gsc/audit.js'`

---

### Step 2: Add Success Logging

**For Write Operations (after successful execution):**
```typescript
// After operation completes successfully
await audit.logWriteOperation('user', 'tool_name', accountId, {
  // Include all relevant details:
  resourceId: result.id,
  resourceName: input.name,
  previousValue: beforeValue,
  newValue: afterValue,
  // ... any other important details
});
```

**For Read Operations (after successful execution):**
```typescript
// After query completes successfully
await audit.logReadOperation('user', 'tool_name', accountId, {
  // Include what was accessed:
  recordCount: results.length,
  dateRange: input.dateRange,
  dimensions: input.dimensions,
  // ... any other relevant details
});
```

---

### Step 3: Add Failure Logging

**In catch block:**
```typescript
catch (error) {
  logger.error('Failed to execute tool', error as Error);

  // AUDIT: Log failed operation
  await audit.logFailedOperation('user', 'tool_name', accountId, (error as Error).message, {
    // Include what was attempted:
    attemptedAction: 'description of what failed',
    inputParams: relevantInputs,
  });

  throw error;
}
```

---

## Code Templates

### Template A: Write Tool with Approval Enforcer

```typescript
// imports
import { getAuditLogger } from '../../gsc/audit.js';
const audit = getAuditLogger();

// in handler function
async handler(input: any) {
  try {
    // ... existing validation and setup ...

    // Build dry-run preview
    const dryRun = dryRunBuilder.build();

    if (!confirmationToken) {
      // Return preview (no logging needed)
      return { requiresApproval: true, preview, confirmationToken };
    }

    // Execute with confirmation
    const result = await approvalEnforcer.validateAndExecute(
      confirmationToken,
      dryRun,
      async () => {
        return await client.someOperation(...);
      }
    );

    // ✅ ADD AUDIT LOGGING HERE
    await audit.logWriteOperation('user', 'tool_name', customerId, {
      resourceId: result.id,
      resourceName: input.name,
      // ... relevant details
    });

    return { success: true, data: result };

  } catch (error) {
    logger.error('Failed to execute tool', error as Error);

    // ✅ ADD AUDIT LOGGING HERE
    await audit.logFailedOperation('user', 'tool_name', customerId, (error as Error).message, {
      attemptedAction: 'what failed',
      inputParams: input,
    });

    throw error;
  }
}
```

---

### Template B: Write Tool WITHOUT Approval (Simple)

```typescript
// imports
import { getAuditLogger } from '../../gsc/audit.js';
const audit = getAuditLogger();

// in handler function
async handler(input: any) {
  try {
    // ... setup ...

    const result = await client.someOperation(...);

    // ✅ ADD AUDIT LOGGING HERE
    await audit.logWriteOperation('user', 'tool_name', accountId, {
      resultId: result.id,
      // ... relevant details
    });

    return { success: true, data: result };

  } catch (error) {
    // ✅ ADD AUDIT LOGGING HERE
    await audit.logFailedOperation('user', 'tool_name', accountId, (error as Error).message, {
      inputParams: input,
    });

    throw error;
  }
}
```

---

### Template C: Read Tool

```typescript
// imports
import { getAuditLogger } from '../../gsc/audit.js';
const audit = getAuditLogger();

// in handler function
async handler(input: any) {
  try {
    // ... setup ...

    const results = await client.someQuery(...);

    // ✅ ADD AUDIT LOGGING HERE
    await audit.logReadOperation('user', 'tool_name', accountId, {
      recordCount: results.length,
      dateRange: input.dateRange,
      filters: input.filters,
    });

    return { success: true, data: results };

  } catch (error) {
    // ✅ ADD AUDIT LOGGING HERE
    await audit.logFailedOperation('user', 'tool_name', accountId, (error as Error).message);

    throw error;
  }
}
```

---

## Example: Keywords Tool (add_keywords)

**File:** `src/ads/tools/keywords.ts`

### Before (No Logging):
```typescript
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';

const logger = getLogger('ads.tools.keywords');

export const addKeywordsTool = {
  async handler(input: any) {
    try {
      // ... validation ...

      const result = await client.addKeywords(customerId, adGroupId, keywords);

      return { success: true, data: result };  // ❌ NO AUDIT LOG
    } catch (error) {
      logger.error('Failed to add keywords', error as Error);
      throw error;  // ❌ NO AUDIT LOG
    }
  }
};
```

### After (With Logging):
```typescript
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { getAuditLogger } from '../../gsc/audit.js';  // ✅ ADD THIS

const logger = getLogger('ads.tools.keywords');
const audit = getAuditLogger();  // ✅ ADD THIS

export const addKeywordsTool = {
  async handler(input: any) {
    try {
      // ... validation ...

      const result = await client.addKeywords(customerId, adGroupId, keywords);

      // ✅ ADD AUDIT LOGGING
      await audit.logWriteOperation('user', 'add_keywords', customerId, {
        adGroupId,
        keywordCount: keywords.length,
        keywords: keywords.map((k: any) => ({ text: k.text, matchType: k.matchType })),
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error('Failed to add keywords', error as Error);

      // ✅ ADD AUDIT LOGGING
      await audit.logFailedOperation('user', 'add_keywords', customerId, (error as Error).message, {
        adGroupId,
        keywordCount: keywords.length,
      });

      throw error;
    }
  }
};
```

---

## What to Log

### For Write Operations:
- ✅ Customer/Account ID
- ✅ Resource being created/modified (ID and name)
- ✅ Before values (for updates)
- ✅ After values
- ✅ Financial impact (if applicable)
- ✅ Count of items affected (for bulk operations)

### For Read Operations:
- ✅ Customer/Account ID
- ✅ Number of records returned
- ✅ Date range queried
- ✅ Filters applied
- ✅ Dimensions/metrics requested

### For Failed Operations:
- ✅ What was attempted
- ✅ Error message
- ✅ Input parameters (for debugging)

---

## Audit Log Output

**Location:** `logs/audit.log`

**Format:** JSON Lines (one entry per line)

**Example Entry:**
```json
{
  "timestamp": "2025-10-30T15:30:00.000Z",
  "user": "user",
  "action": "update_budget",
  "property": "1234567890",
  "operationType": "write",
  "result": "success",
  "details": {
    "budgetId": "456",
    "budgetName": "Main Campaign Budget",
    "previousAmount": 100,
    "newAmount": 150,
    "dailyDifference": 50,
    "monthlyImpact": 1520,
    "percentageChange": "+50.0%"
  }
}
```

---

## Testing Audit Logging

### Manual Test

```bash
# 1. Clear audit log
echo "[]" > logs/audit.log

# 2. Execute a tool (via Claude Code CLI)
# Example: "List campaigns for account 1234567890"

# 3. Check audit log
cat logs/audit.log | jq '.'

# 4. Verify entry contains:
✅ timestamp (recent)
✅ user: "user"
✅ action: "list_campaigns"
✅ property: "1234567890"
✅ operationType: "read"
✅ result: "success"
✅ details: { campaignCount: N }
```

### Automated Test

```bash
#!/bin/bash
# test-audit-logging.sh

echo "Testing audit logging for critical tools..."

# Store initial log size
INITIAL_SIZE=$(wc -l < logs/audit.log)

# Test update_budget (if you have testaccount)
# claude "Update budget 123 to $50/day for account 1234567890"

# Wait for operation
sleep 2

# Check new entry added
FINAL_SIZE=$(wc -l < logs/audit.log)
NEW_ENTRIES=$((FINAL_SIZE - INITIAL_SIZE))

if [ $NEW_ENTRIES -gt 0 ]; then
  echo "✅ Audit logging working - $NEW_ENTRIES new entries"
  tail -1 logs/audit.log | jq '.action, .result, .details'
else
  echo "❌ No audit log entries added!"
  exit 1
fi
```

---

## Batch Update Script

Given the number of tools, here's a script to help add audit logging systematically:

```bash
#!/bin/bash
# add-audit-logging.sh
# Helper script to add audit logging imports to tool files

TOOL_FILE=$1

if [ -z "$TOOL_FILE" ]; then
  echo "Usage: ./add-audit-logging.sh <path/to/tool.ts>"
  exit 1
fi

# Determine correct import path based on file location
if [[ $TOOL_FILE == *"/ads/tools/campaigns/"* ]]; then
  IMPORT_PATH="../../../gsc/audit.js"
elif [[ $TOOL_FILE == *"/ads/tools/reporting/"* ]]; then
  IMPORT_PATH="../../../gsc/audit.js"
elif [[ $TOOL_FILE == *"/ads/tools/"* ]]; then
  IMPORT_PATH="../../gsc/audit.js"
elif [[ $TOOL_FILE == *"/analytics/tools/"* ]]; then
  IMPORT_PATH="../../gsc/audit.js"
elif [[ $TOOL_FILE == *"/bigquery/"* ]]; then
  IMPORT_PATH="../gsc/audit.js"
elif [[ $TOOL_FILE == *"/business-profile/"* ]]; then
  IMPORT_PATH="../gsc/audit.js"
elif [[ $TOOL_FILE == *"/wpp-analytics/tools/"* ]]; then
  IMPORT_PATH="../../gsc/audit.js"
else
  echo "Unknown tool location, please specify import path manually"
  exit 1
fi

# Check if audit import already exists
if grep -q "getAuditLogger" "$TOOL_FILE"; then
  echo "✅ $TOOL_FILE already has audit logger import"
else
  # Add import after other imports (before first const/export)
  echo "Adding audit logger import to $TOOL_FILE..."

  # Create backup
  cp "$TOOL_FILE" "$TOOL_FILE.backup"

  # Add import and const
  sed -i "/^import.*logger/a\\
import { getAuditLogger } from '$IMPORT_PATH';\\
" "$TOOL_FILE"

  sed -i "/^const logger = getLogger/a\\
const audit = getAuditLogger();\\
" "$TOOL_FILE"

  echo "✅ Import added. Now manually add logging calls to success/failure blocks."
  echo "   Backup saved to $TOOL_FILE.backup"
fi
```

---

## Verification Checklist

After updating each tool, verify:

- [ ] Import statement added with correct path
- [ ] `const audit = getAuditLogger()` declared
- [ ] Success logging called after operation completes
- [ ] Failure logging called in catch block
- [ ] Logged details include:
  - Account/customer ID
  - Resource ID (for writes)
  - Relevant metrics (for reads)
- [ ] File compiles without errors: `npm run build`
- [ ] Test tool execution writes to `logs/audit.log`

---

## Priority Rollout

### Phase 1: Critical Write Tools (30 min)
Update tools that modify client data:
1. Keywords (add_keywords, add_negative_keywords)
2. Conversions (create_conversion_action, upload_click_conversions)
3. Analytics (create_property, create_data_stream)

### Phase 2: All Write Tools (1 hour)
Update remaining write operations:
4. Audiences (create_user_list, upload_customer_match_list)
5. BigQuery (create_dataset)
6. Business Profile (update_location)
7. WPP Analytics (create_dashboard, update_dashboard)

### Phase 3: Read Tools (1 hour)
Update all read operations for complete audit trail:
8. All reporting tools
9. List operations
10. Query operations

### Phase 4: Testing & Verification (30 min)
11. Test each updated tool
12. Verify audit log format
13. Check log completeness
14. Document any issues

**Total Time:** ~3 hours for all 50 tools

---

## Sample Audit Log Entries

### Budget Update (Already Implemented ✅)
```json
{
  "timestamp": "2025-10-30T21:15:00.000Z",
  "user": "user",
  "action": "update_budget",
  "property": "1234567890",
  "operationType": "write",
  "result": "success",
  "details": {
    "budgetId": "456",
    "budgetName": "Main Campaign Budget",
    "previousAmount": 100,
    "newAmount": 150,
    "dailyDifference": 50,
    "monthlyImpact": 1520,
    "percentageChange": "+50.0%"
  }
}
```

### Add Keywords (Pattern to Implement)
```json
{
  "timestamp": "2025-10-30T21:20:00.000Z",
  "user": "user",
  "action": "add_keywords",
  "property": "1234567890",
  "operationType": "write",
  "result": "success",
  "details": {
    "adGroupId": "789",
    "keywordCount": 15,
    "keywords": [
      { "text": "digital marketing", "matchType": "PHRASE" },
      { "text": "seo services", "matchType": "EXACT" }
    ]
  }
}
```

### Campaign Performance Query
```json
{
  "timestamp": "2025-10-30T21:25:00.000Z",
  "user": "user",
  "action": "get_campaign_performance",
  "property": "1234567890",
  "operationType": "read",
  "result": "success",
  "details": {
    "campaignCount": 12,
    "dateRange": ["2025-10-01", "2025-10-30"],
    "metricsRequested": ["clicks", "cost", "conversions"]
  }
}
```

### Failed Operation
```json
{
  "timestamp": "2025-10-30T21:30:00.000Z",
  "user": "user",
  "action": "update_campaign_status",
  "property": "1234567890",
  "operationType": "write",
  "result": "failure",
  "details": {
    "campaignId": "999",
    "attemptedStatus": "ENABLED"
  },
  "errorMessage": "Campaign not found: 999"
}
```

---

## Benefits of Complete Audit Logging

### For Client Data Testing:
1. **Accountability** - Know exactly what operations were performed
2. **Debugging** - Trace issues back to specific operations
3. **Rollback** - Understand what changed for rollback decisions
4. **Compliance** - Full audit trail for GDPR/SOC2
5. **Security** - Detect unauthorized access attempts

### For Production (OMA):
1. **Multi-user tracking** - Know which practitioner did what
2. **Security monitoring** - Detect suspicious patterns
3. **Cost analysis** - Track budget changes over time
4. **Performance tracking** - Analyze tool usage patterns
5. **Incident response** - Complete forensics for security events

---

## Next Steps

### Option A: Manual Implementation (Recommended for Learning)
1. Use templates above
2. Update one tool at a time
3. Test after each update
4. Build knowledge of audit system

### Option B: Batch Implementation (Faster)
1. I can update all 50 tools in batches
2. ~10 tools at a time
3. Test between batches
4. Complete in 2-3 iterations

### Option C: Script-Assisted (Middle Ground)
1. Use `add-audit-logging.sh` to add imports
2. Manually add logging calls using templates
3. Verify each file

---

## Current Status

**Completed (4 tools):**
- ✅ create_budget - Logs budget creation with amount details
- ✅ update_budget - Logs old/new amounts, percentage change, monthly impact
- ✅ create_campaign - Logs campaign details, type, budget, status
- ✅ update_campaign_status - Logs status changes, impact description

**Remaining (50 tools):**
- 17 Google Ads write tools
- 6 Google Ads read tools
- 8 Analytics tools
- 6 BigQuery/Business Profile tools
- 11 WPP Analytics tools
- 2 Other tools

**Estimated Time to Complete:** 3 hours

---

## Recommendation

**For immediate client data testing:**
- ✅ Critical write tools are NOW covered (budgets, campaign status)
- ⚠️ Should add keywords tools before testing keyword operations
- ⚠️ Should add conversion tools before testing conversion imports

**Priority order:**
1. Keywords tools (15 min) - If testing keyword operations
2. Conversion tools (20 min) - If testing offline conversion imports
3. Analytics tools (30 min) - If testing GA4 property creation
4. All read tools (1 hour) - For complete audit trail
5. Remaining tools (1 hour) - For production readiness

Would you like me to:
A) Continue adding audit logging to remaining critical tools?
B) Provide the list and you'll update them manually?
C) Create a more automated solution?

---

**Last Updated:** October 30, 2025
**Tools with Audit Logging:** 15/65 (23%)
**Status:** CRITICAL GAP - 50 tools need logging before production
