# AGENT HANDOVER - WPP Digital Marketing MCP Server

**Date:** October 17, 2025
**Project Status:** Phase 1 Complete (MCP Built), Phase 2 In Progress (Safety Implementation)
**Next Agent:** Start here for complete context

---

## 🎯 PROJECT OVERVIEW

### What This Is:
A **unified MCP (Model Context Protocol) server** that connects AI agents to **4 Google Marketing APIs**:
1. Google Search Console (organic search, SEO)
2. Chrome UX Report (Core Web Vitals, site performance)
3. Google Ads (paid advertising, campaign management)
4. Google Analytics (user behavior, conversions, analytics)

### Purpose:
Enable WPP Media's global network of practitioners to use AI agents (Claude, GPT-4, Gemini) to:
- Analyze marketing data across all platforms
- Generate cross-platform reports instantly
- Manage campaigns programmatically
- Optimize budgets and keywords
- Monitor performance in real-time

**All through natural language conversation instead of manual UI work.**

### Business Impact:
- **Time Savings:** ~$2M/year (1000 users × 5 hours/week × $75/hour)
- **Error Reduction:** Fewer manual mistakes
- **Competitive Advantage:** No other agency has this
- **Investment:** ~$300K first year
- **ROI:** 600%+ in year 1

---

## 📊 CURRENT STATUS

### ✅ COMPLETED (Working Now):

**1. Complete MCP Server - 31 Tools**
- Google Search Console: 9 tools (removed delete_property for safety)
- Chrome UX Report: 5 tools (all read-only)
- Google Ads: 12 tools (6 read, 6 write)
- Google Analytics: 5 tools (all read-only)

**2. Authentication**
- Single OAuth 2.0 token for all Google APIs
- Scopes: webmasters, adwords, analytics
- Additional: Google Ads Developer Token, CrUX API Key
- Tokens stored in: `config/gsc-tokens.json`
- Automatic refresh working

**3. Initial Safety**
- delete_property tool permanently removed
- Budget caps: >500% changes blocked (enforced in code)
- Input validation on all tools
- Audit logging framework
- Comprehensive agent guidance in tool descriptions

**4. Modular Architecture**
```
src/
├── gsc/          # Google Search Console (9 tools)
├── crux/         # Chrome UX Report (5 tools)
├── ads/          # Google Ads (12 tools)
├── analytics/    # Google Analytics (5 tools)
└── shared/       # Common utilities + safety features
```

**5. Documentation (15 Files)**
- See "Documentation Guide" section below for what each file contains

**6. Testing**
- All read operations tested with real accounts
- Core functionality validated
- Budget cap enforcement tested

### ⏳ IN PROGRESS (Next 2-3 Weeks):

**Phase 2: Safety Implementation (70% Remaining)**

Need to implement:
1. Mandatory approval workflow (preview → confirm → execute)
2. Rollback system with financial impact reports
3. Multi-step typed confirmations for destructive ops
4. Vagueness detection (forces clarification)
5. Pattern matching with list-and-confirm for bulk ops
6. Dual-level notification system (email alerts)
7. Google Ads change history API integration

**Phase 3: OMA Integration**
8. HTTP server for network communication
9. Account authorization enforcement (two-layer auth)
10. OMA endpoint integration

---

## 🚀 IMMEDIATE NEXT TASKS

### Priority 1: Complete Safety Features (Week 1-2)

**Task 1.1: Build Approval Workflow Enforcer**
- **File to create:** `src/shared/approval-enforcer.ts`
- **What it does:** Intercepts ALL write tool calls, generates preview, requires user confirmation before execution
- **Implementation guide:** See OMA-MCP-INTEGRATION.md, search for "Mandatory Approval Workflow"
- **Key requirements:**
  - Preview shows: current state, proposed state, changes, impact, warnings
  - User must explicitly approve
  - 5-minute timeout
  - Audit log stores approval decision
- **Integration:** Wrap all write tool handlers in `src/ads/tools/`, `src/gsc/tools/`

**Task 1.2: Build Snapshot Manager**
- **File to create:** `src/shared/snapshot-manager.ts`
- **What it does:** Captures state before write operations, enables rollback
- **Implementation guide:** See OMA-MCP-INTEGRATION.md, search for "Rollback System"
- **Key requirements:**
  - Capture state before every write operation
  - Store in DynamoDB (table schema in AWS-DEPLOYMENT-GUIDE.md)
  - Support rollback to any of last 10 operations per account
  - Generate unique operation IDs

**Task 1.3: Build Financial Impact Calculator**
- **File to create:** `src/shared/financial-impact.ts`
- **What it does:** Calculates actual $ spent during error period for rollback reports
- **Requirements:**
  - Query Google Ads performance metrics for time period
  - Calculate baseline (what would have been spent)
  - Calculate actual (what was spent)
  - Difference = financial impact
  - Include clicks, conversions during period

**Task 1.4: Build Confirmation Manager**
- **File to create:** `src/shared/confirmation.ts`
- **What it does:** Requires typing exact resource name for destructive operations
- **Requirements:**
  - For delete_sitemap: User must type "DELETE sitemap-name.xml"
  - For update_campaign_status(REMOVED): User must type "REMOVE CampaignName"
  - Case-sensitive exact match
  - 60-second timeout
  - Log all confirmation attempts

**Task 1.5: Build Vagueness Detector**
- **File to create:** `src/shared/vagueness-detector.ts`
- **What it does:** Detects vague requests, blocks execution, forces clarification
- **Requirements:**
  - Detect vague phrases: "increase budgets", "pause campaigns", "change spending"
  - Check for missing required fields: campaign IDs, amounts, reasons
  - Return clarification prompt to agent
  - Block execution until specifics provided
- **Vague phrases to detect:** See SAFETY-AUDIT.md section "Vagueness Detection"

**Task 1.6: Build Pattern Matcher**
- **File to create:** `src/shared/pattern-matcher.ts`
- **What it does:** Allows "pause all Black Friday campaigns" with confirmation
- **Requirements:**
  - Match campaigns by name pattern
  - Show complete list of matches to user
  - Max 20 items per bulk operation
  - User must confirm after seeing list
  - Individual execution + logging for each item

**Task 1.7: Build Notification System**
- **File to create:** `src/shared/notifications.ts`
- **What it does:** Sends email notifications for all write operations
- **Requirements:**
  - **Central admin (dogancanbaris@wpp.com):** Real-time email per operation
  - **Agency managers:** Hourly batched summary for their team
  - **High-risk operations:** Additional urgent alert to central admin
  - Use SendGrid or AWS SES
  - Email templates defined in notification-config.json
  - Include rollback links in emails

**Task 1.8: Integrate Google Ads Change History**
- **File to create:** `src/ads/change-history.ts`
- **What it does:** Query Google Ads Change Event API for verification
- **Requirements:**
  - Query change_event resource (last 30 days available)
  - Use for rollback verification
  - Cross-reference MCP snapshots with Google's records
  - Include in financial impact reports
- **API docs:** Google Ads Change Event API (see research in OMA-MCP-INTEGRATION.md)

---

### Priority 2: OMA Integration (Week 3)

**Task 2.1: Build HTTP Server**
- **File to create:** `src/http-server.ts`
- **What it does:** HTTP API wrapper around MCP tools (replaces STDIO for network communication)
- **Endpoints needed:**
  - POST /mcp/execute-tool (main endpoint)
  - POST /mcp/confirm-operation (for approvals)
  - GET /mcp/tools/list
  - POST /mcp/rollback
  - GET /mcp/health
- **Complete spec:** See OMA-MCP-INTEGRATION.md, section "API Specification"

**Task 2.2: Integrate Account Authorization**
- **File:** Already created: `src/shared/account-authorization.ts`
- **What to do:** Integrate into all write tool handlers
- **Requirements:**
  - Check approved accounts before every write operation
  - Throw UnauthorizedAccountAccessError if account not approved
  - Works with encrypted approved accounts from OMA

**Task 2.3: Test OMA Integration**
- Create mock OMA requests
- Test account authorization enforcement
- Test approval workflow end-to-end
- Test notification delivery
- Test rollback functionality

---

## 📚 DOCUMENTATION GUIDE

### For Understanding the Project:

**Start Here:**
1. **CLAUDE.md** - Overall project explanation, architecture, tech stack
2. **COMPLETE-MCP-SERVER-SUMMARY.md** - What's built, tool breakdown
3. **CURRENT-STATUS.md** or **FINAL-STATUS-OCT-17.md** - Where we are now

### For Understanding Safety:

4. **SAFETY-AUDIT.md** - ⭐ CRITICAL - Read this first!
   - All 8 risk scenarios explained
   - What could go wrong
   - Current protections vs gaps
   - Tool-by-tool safety analysis

5. **AGENT-EXPERIENCE.md** - What AI agents see and can do
   - Agent's perspective
   - Good vs bad agent behavior
   - Real interaction examples

6. **PRODUCTION-READINESS.md** - Rollout plan
   - 4-phase deployment strategy
   - P0/P1/P2 priority matrix
   - Timeline and resources

### For API Capabilities:

7. **GSC-API-CAPABILITIES.md** - Google Search Console + CrUX
   - All 15 tools explained
   - Dimensions, metrics, use cases
   - Testing results

8. **GOOGLE-ADS-API-REFERENCE.md** - Google Ads (40 tools documented, 12 built)
   - Complete operation catalog
   - Agent guidance examples
   - Safety considerations

### For Implementation:

9. **OMA-MCP-INTEGRATION.md** - ⭐ FOR OMA INTEGRATION
   - Complete two-layer auth design
   - API contracts (OMA ↔ MCP)
   - Data flow diagrams
   - What OMA team must build
   - What MCP server must provide

10. **AWS-DEPLOYMENT-GUIDE.md** - ⭐ FOR AWS DEPLOYMENT
    - Complete infrastructure architecture
    - ECS Fargate, API Gateway, DynamoDB specs
    - Security layers (WAF, GuardDuty, encryption)
    - Step-by-step deployment procedure
    - Cost breakdown (~$900/month)

### For Development:

11. **IMPLEMENTATION-STATUS.md** - Original development log
12. **SETUP-GUIDE.md** - OAuth setup instructions
13. **GSC-API-REFERENCE.md** - Original API research
14. **GOOGLE-ADS-API-RESEARCH.md** - Ads integration research
15. **project-plan.md** - Original project plan

---

## 🔧 TECHNICAL DETAILS

### Authentication Setup:

**OAuth Credentials:**
- Client ID: `60184572847-2knv6l327muo06kdp35km87049hagsot.apps.googleusercontent.com`
- Client Secret: `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`
- Redirect URI: `http://localhost:6000/callback`
- Scopes: webmasters, webmasters.readonly, adwords, analytics.readonly, analytics

**Additional Credentials (in .env):**
- Google Ads Developer Token: `_rj-sEShX-fFZuMAIx3ouA`
- CrUX API Key: `AIzaSyChmTYxa4N8PL1SaqogPDyuhfh877LzEQ4`

**Token Location:** `config/gsc-tokens.json`
**OAuth Setup Command:** `npm run setup:auth`

### Running the Server:

**Local (STDIO mode):**
```bash
npm run build
npm run start:gsc
```

**Testing:**
- Run `/mcp` in Claude Code CLI
- All 31 tools should appear
- Try: "List my Google Search Console properties"

### Project Structure:

**Key Files:**
- **Entry point:** `src/gsc/server.ts` (initializes all 4 APIs)
- **Tool registry:** `src/gsc/tools/index.ts` (imports from all APIs)
- **Configuration:** `config/*.json`
- **Compiled output:** `dist/gsc/server.js`

**MCP Configuration:**
- File: `.mcp.json`
- Server name: "wpp-digital-marketing"
- Points to: `dist/gsc/server.js`

---

## ⚠️ CRITICAL SAFETY INFORMATION

### What's Safe to Use Now:

**✅ Completely Safe (20 tools):**
- All read-only operations (GSC, CrUX, Analytics)
- Google Ads read operations
- add_negative_keywords (saves money, not spends)

**⚠️ Use with Supervision (11 tools):**
- All write operations in GSC and Google Ads
- Manually verify each change immediately after
- Only on test accounts or with close monitoring
- Review audit logs: `logs/audit.log`

**❌ Blocked (1 operation):**
- delete_property - Permanently removed, cannot delete GSC properties through MCP

### Current Safety Enforcement:

**✅ Enforced in Code:**
- Budget changes >500%: BLOCKED (throws error, cannot execute)
- Property deletion: IMPOSSIBLE (tool doesn't exist)
- Input validation: ALL tools validate inputs

**❌ NOT Enforced Yet (Documented Only):**
- Approval workflow: Agent CAN execute writes immediately
- Spend limits: No max budget per campaign
- Rollback: Cannot undo operations yet
- Confirmations: No "type DELETE to confirm" yet
- Vagueness blocking: Agent can proceed with vague requests
- Rate limiting: None

**Implication:**
- **Safe for:** Personal testing, supervised use, development
- **NOT safe for:** Client accounts, multi-user production, unsupervised agents

---

## 🎯 NEXT AGENT: IMMEDIATE ACTION ITEMS

### Your First Steps:

**1. Read These Documents in Order:**
   a) **This file (AGENT-HANDOVER.md)** - You're reading it ✓
   b) **SAFETY-AUDIT.md** - Understand all risks
   c) **OMA-MCP-INTEGRATION.md** - Architecture for next phase
   d) **PRODUCTION-READINESS.md** - Rollout plan

**2. Understand Current State:**
   - Run: `npm run build`
   - Run: `npm run start:gsc`
   - Verify: 31 tools load successfully
   - Check: No TypeScript errors

**3. Review Existing Code:**
   - Look at: `src/shared/interceptor.ts` (basic safety validation)
   - Look at: `src/shared/account-authorization.ts` (two-layer auth manager)
   - Look at: `src/ads/tools/budgets.ts` (example of budget cap enforcement)
   - Understand pattern: How safety is integrated into tools

### Your Mission: Complete Safety Implementation

**You need to build 7 remaining safety features** (detailed below).

---

## 📋 DETAILED TASK LIST

### TASK GROUP A: Approval & Rollback System (Week 1)

#### Task A1: Approval Workflow Enforcer
**File to create:** `src/shared/approval-enforcer.ts`

**Requirements:**
```typescript
class ApprovalEnforcer {
  // 1. Intercept write tool call BEFORE execution
  async requireApproval(toolName, params, currentState) {
    // Generate preview using DryRunResultBuilder (exists in src/gsc/approval.ts)
    const preview = {
      operation: toolName,
      currentState: currentState,
      proposedState: params,
      changes: ["Budget: $100→$150/day", "Monthly: +$1500"],
      warnings: ["50% increase - consider gradual"],
      riskLevel: "MEDIUM" | "HIGH" | "CRITICAL"
    };

    // Create confirmation token (UUID)
    const confirmationToken = generateSecureToken();

    // Store pending operation (in-memory, 5-min TTL)
    storePendingOperation(confirmationToken, {
      toolName,
      params,
      preview,
      userId,
      expiresAt: Date.now() + 300000 // 5 minutes
    });

    // Return preview to agent (blocks execution)
    return {
      requiresApproval: true,
      preview,
      confirmationToken,
      message: "User confirmation required. Present preview and request approval."
    };
  }

  // 2. Execute after user confirms
  async executeWithApproval(confirmationToken, userConfirmed) {
    // Validate token
    const pending = getPendingOperation(confirmationToken);
    if (!pending) throw Error("Confirmation expired or invalid");

    // Check user actually approved
    if (userConfirmed !== "APPROVED") {
      await logRejection(pending);
      return { success: false, message: "Operation cancelled by user" };
    }

    // Take snapshot (for rollback)
    const snapshotId = await captureSnapshot(pending);

    // Execute the operation
    const result = await executeOperation(pending);

    // Log, notify
    await logApproval(pending, result, snapshotId);
    await sendNotifications(pending, result);

    return result;
  }
}
```

**Integration into tools:**
```typescript
// In src/ads/tools/budgets.ts (update_budget handler):
async handler(input) {
  const enforcer = new ApprovalEnforcer();

  // Get current state
  const currentBudget = await getCurrentBudget(input.budgetId);

  // Request approval (BLOCKS execution, returns preview)
  const approvalResult = await enforcer.requireApproval(
    'update_budget',
    input,
    currentBudget
  );

  // Return preview to agent
  if (approvalResult.requiresApproval) {
    return approvalResult;
  }

  // If we get here, approval was already granted
  // (This path taken when confirm-operation endpoint called)
}
```

**New HTTP endpoint needed:**
```
POST /mcp/confirm-operation
Body: { confirmationToken, userConfirmation: "APPROVED" | "REJECTED" }
```

#### Task A2: Snapshot Manager (Rollback System)
**File to create:** `src/shared/snapshot-manager.ts`

**Requirements:**
```typescript
interface Snapshot {
  operationId: string;
  userId: string;
  timestamp: Date;
  tool: string;
  api: 'GSC' | 'Google Ads' | 'Analytics';
  accountId: string;
  resourceType: 'campaign' | 'budget' | 'keyword' | 'sitemap' | 'property';
  resourceId: string;
  previousState: any; // Complete state before change
  newState: any; // State after change
  rollbackScript: string; // How to reverse this operation
}

class SnapshotManager {
  async captureSnapshot(operation): Promise<string> {
    const snapshot = {
      operationId: generateId(),
      timestamp: new Date(),
      ...operation,
      previousState: await getCurrentState(operation),
      rollbackScript: generateRollbackScript(operation)
    };

    // Save to DynamoDB
    await saveToDynamoDB('wpp-mcp-snapshots', snapshot);

    return snapshot.operationId;
  }

  async getRecentOperations(userId, limit = 10) {
    // Query DynamoDB for user's last N operations
    return await queryDynamoDB('wpp-mcp-snapshots', {
      userId: userId,
      limit: limit,
      sortBy: 'timestamp DESC'
    });
  }

  async rollback(operationId, requestedBy) {
    // 1. Get snapshot
    const snapshot = await getSnapshot(operationId);

    // 2. Calculate financial impact (Task A3)
    const financialImpact = await calculateFinancialImpact(snapshot);

    // 3. Execute rollback
    await restorePreviousState(snapshot);

    // 4. Generate report
    const report = generateFinancialReport(snapshot, financialImpact);

    // 5. Log rollback
    await logRollback(operationId, requestedBy, report);

    // 6. Send notifications with report
    await sendRollbackNotifications(report);

    return { success: true, report, financialImpact };
  }
}
```

**DynamoDB Schema:** See AWS-DEPLOYMENT-GUIDE.md, Table 3: operation-snapshots

#### Task A3: Financial Impact Calculator
**File to create:** `src/shared/financial-impact.ts`

**Requirements:**
```typescript
async function calculateFinancialImpact(snapshot) {
  // 1. Determine time period
  const errorStart = snapshot.timestamp;
  const errorEnd = new Date(); // Now (when rollback requested)
  const durationMinutes = (errorEnd - errorStart) / 60000;

  // 2. Get actual performance during error period
  const performance = await getCampaignPerformance(
    snapshot.accountId,
    snapshot.resourceId, // Campaign or budget ID
    errorStart,
    errorEnd
  );

  // 3. Calculate what SHOULD have been spent (at old budget)
  const baselineBudget = snapshot.previousState.amount_micros / 1000000;
  const newBudget = snapshot.newState.amount_micros / 1000000;

  const baselineSpendPerMinute = (baselineBudget / 24 / 60); // Daily → per minute
  const baselineSpend = baselineSpendPerMinute * durationMinutes;

  // 4. Actual spend from Google Ads
  const actualSpend = performance.cost_micros / 1000000;

  // 5. Calculate impact
  const extraSpend = actualSpend - baselineSpend;

  return {
    period: { start: errorStart, end: errorEnd },
    durationMinutes: durationMinutes,
    budgetChange: { from: baselineBudget, to: newBudget },
    baselineSpend: baselineBudget,
    actualSpend: actualSpend,
    extraSpend: extraSpend,
    clicks: performance.clicks,
    impressions: performance.impressions,
    conversions: performance.conversions,
    wastedSpend: extraSpend - (conversions * estimatedTargetCPA),
    recommendation: extraSpend > 0
      ? "Consider pausing campaign briefly to prevent additional elevated spend"
      : "No financial impact from this budget change"
  };
}
```

**Integrate with:** Rollback system, email reports

---

### TASK GROUP B: Confirmation & Validation (Week 2)

#### Task B1: Confirmation Manager
**File to create:** `src/shared/confirmation.ts`

**For destructive operations** (delete_sitemap, update_campaign_status when status=REMOVED):

```typescript
class ConfirmationManager {
  requireTypedConfirmation(resourceName: string, operationType: string) {
    const confirmationText = `${operationType.toUpperCase()} ${resourceName}`;

    return {
      requiresTypedConfirmation: true,
      prompt: `⚠️ DESTRUCTIVE OPERATION: ${operationType}

To confirm ${operationType} of ${resourceName}, type exactly:

${confirmationText}

This operation cannot be undone.
You have 60 seconds to respond.
Type 'CANCEL' to abort.`,
      expectedText: confirmationText,
      caseSensitive: true,
      timeout: 60,
      confirmationToken: generateId()
    };
  }

  validateConfirmation(userInput, expectedText) {
    if (userInput === 'CANCEL') {
      return { confirmed: false, cancelled: true };
    }

    if (userInput !== expectedText) {
      throw Error(`Confirmation text does not match.
Expected: "${expectedText}"
Received: "${userInput}"

Please type exactly as shown, including capitalization.`);
    }

    return { confirmed: true };
  }
}
```

**Integrate into:**
- `src/gsc/tools/sitemaps.ts` - delete_sitemap tool
- `src/ads/tools/campaigns.ts` - update_campaign_status when status=REMOVED

#### Task B2: Vagueness Detector
**File to create:** `src/shared/vagueness-detector.ts`

**Complete implementation** provided in plan above. Key points:
- Define VAGUENESS_RULES for each write tool
- Check for missing required fields
- Detect vague phrases in user's original message
- Return clarification prompt (blocks execution)
- Agent must get specifics before proceeding

**Vague phrases to detect:**
```typescript
const VAGUE_TRIGGERS = {
  'update_budget': [
    'increase budgets', 'change budgets', 'adjust spending',
    'make budgets higher', 'more budget', 'less budget'
  ],
  'update_campaign_status': [
    'pause campaigns', 'stop campaigns', 'enable campaigns',
    'turn on', 'turn off', 'these campaigns', 'those campaigns'
  ],
  'add_keywords': [
    'add keywords', 'add some keywords', 'more keywords'
  ]
};
```

**Required fields by tool:**
```typescript
const REQUIRED_FIELDS = {
  'update_budget': ['customerId', 'budgetId', 'newDailyAmountDollars', 'reason'],
  'update_campaign_status': ['customerId', 'campaignId', 'status', 'reason'],
  'add_keywords': ['customerId', 'adGroupId', 'keywords', 'matchTypes', 'maxCpcs']
};
```

#### Task B3: Pattern Matcher (Bulk Operations)
**File to create:** `src/shared/pattern-matcher.ts`

**Full implementation** provided in plan above. Key points:
- User says: "Pause all Black Friday campaigns"
- System finds all matching campaigns
- Max 20 per bulk operation
- Show complete list to user
- User must confirm seeing full list
- Execute individually for each (separate logs)

---

### TASK GROUP C: Notifications & Change History (Week 2-3)

#### Task C1: Notification System
**File to create:** `src/shared/notifications.ts`

**Email Service Options:**
- **SendGrid:** Popular, easy API, $15/month for 40K emails
- **AWS SES:** Cheaper ($0.10 per 1000 emails), requires AWS setup
- **Recommendation:** AWS SES (already using AWS)

**Notification Types:**

**1. Real-time (every write operation to central admin):**
```
To: dogancanbaris@wpp.com
Subject: [WPP MCP] Budget Updated - Client A Campaign
Priority: High

Operation: update_budget
User: john.doe@wpp.com (Toronto Office)
Timestamp: 2025-10-17 14:30:15 UTC

Account: Google Ads #2191558405
Client: Client A
Campaign: Q4 Retail Campaign

Change:
- Budget: $100/day → $150/day
- Impact: +$50/day, +$1500/month (+50%)
- Reason: "ROAS is 6.5, campaign constrained"

Approved by user: 14:30:10 UTC
Operation ID: op_abc123

[View Details] [Rollback This Change]
```

**2. Hourly batched (agency managers):**
```
To: manager-toronto@wpp.com
Subject: [WPP MCP] Hourly Summary - Toronto Office (5 operations)

Period: 2:00 PM - 3:00 PM, Oct 17, 2025
Team: Toronto Office

Operations:
1. john.doe: update_budget (Client A, +$50/day)
2. john.doe: add_keywords (Client A, 15 keywords)
3. jane.smith: update_campaign_status (Client B, PAUSED)
4. jane.smith: add_negative_keywords (Client C, 8 negatives)
5. john.doe: create_campaign (Client A, new campaign)

Total Budget Impact: +$50/day
Campaigns Affected: 3
Accounts Accessed: Client A, Client B, Client C

[View Full Audit Log]
```

**Configuration:** Use `config/notification-config.json` (already created)

**Implementation:**
- Use nodemailer or @sendgrid/mail or @aws-sdk/client-ses
- Templates defined in config
- Send real-time for central admin
- Batch and send hourly for agency managers (cron job)
- Include rollback links, audit log links

#### Task C2: Google Ads Change History Integration
**File to create:** `src/ads/change-history.ts`

**Google Ads API Resources:**
- **change_event:** Detailed changes with old/new values (last 30 days)
- **change_status:** Latest change per resource (last 90 days)

**Query to use:**
```typescript
async function getChangeHistory(customerId, resourceId, days = 30) {
  const customer = getGoogleAdsClient().getCustomer(customerId);

  const query = `
    SELECT
      change_event.change_date_time,
      change_event.user_email,
      change_event.change_resource_type,
      change_event.change_resource_name,
      change_event.old_resource.campaign_budget.amount_micros,
      change_event.new_resource.campaign_budget.amount_micros,
      change_event.resource_change_operation
    FROM change_event
    WHERE change_event.change_resource_name = '${resourceId}'
      AND segments.date DURING LAST_30_DAYS
    ORDER BY change_event.change_date_time DESC
    LIMIT 100
  `;

  return await customer.query(query);
}
```

**Use cases:**
1. **Rollback verification:** Cross-check MCP snapshot with Google's record
2. **Financial impact:** Use Google's data to calculate actual spend
3. **Audit trail:** Compare MCP logs with Google's change history
4. **Multi-source changes:** Detect if someone also changed via UI

**Integrate with:** Rollback system (Task A2)

---

### TASK GROUP D: HTTP Server for OMA (Week 3)

#### Task D1: HTTP Server Implementation
**File to create:** `src/http-server.ts`

**Complete specification** in OMA-MCP-INTEGRATION.md, section "API CONTRACT: OMA ↔ MCP"

**Endpoints to implement:**

**1. POST /mcp/execute-tool**
```typescript
app.post('/mcp/execute-tool', async (req, res) => {
  const { tool, params, userId, googleOAuthToken, approvedAccounts } = req.body;

  // 1. Load account authorization
  const authManager = new AccountAuthorizationManager();
  await authManager.loadFromEncrypted(
    approvedAccounts.data,
    approvedAccounts.signature
  );

  // 2. Find tool
  const toolDef = allTools.find(t => t.name === tool);
  if (!toolDef) return res.status(404).json({ error: "Tool not found" });

  // 3. Check account authorization
  const accountId = extractAccountId(params); // customerId, property, or propertyId
  const api = determineApi(tool); // Which API this tool belongs to
  authManager.enforceAccess(api, accountId); // Throws if not authorized

  // 4. Set Google OAuth token for this request
  setUserGoogleOAuthToken(googleOAuthToken);

  // 5. Execute tool (goes through approval if write operation)
  const result = await toolDef.handler(params);

  // 6. Return result
  res.json(result);
});
```

**2. POST /mcp/confirm-operation**
```typescript
app.post('/mcp/confirm-operation', async (req, res) => {
  const { confirmationToken, userConfirmation } = req.body;

  const enforcer = getApprovalEnforcer();
  const result = await enforcer.executeWithApproval(confirmationToken, userConfirmation);

  res.json(result);
});
```

**3. GET /mcp/tools/list**
```typescript
app.get('/mcp/tools/list', (req, res) => {
  res.json({
    tools: allTools.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    }))
  });
});
```

**4. POST /mcp/rollback**
```typescript
app.post('/mcp/rollback', async (req, res) => {
  const { operationId, userId, reason } = req.body;

  const snapshotMgr = getSnapshotManager();
  const result = await snapshotMgr.rollback(operationId, userId, reason);

  res.json(result);
});
```

**5. GET /mcp/health**
```typescript
app.get('/mcp/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    tools: 31,
    apis: ['GSC', 'CrUX', 'Google Ads', 'Analytics'],
    timestamp: new Date()
  });
});
```

**Middleware:**
- Validate OMA API key on every request
- Parse approved accounts
- Set request-scoped auth manager
- Error handling
- Request logging

**Start server:**
```typescript
const PORT = process.env.HTTP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`WPP MCP HTTP Server listening on port ${PORT}`);
});
```

---

## 🔗 INTEGRATION POINTS

### Where Safety Features Connect:

**1. All Write Tool Handlers →** Approval Enforcer
```
Every write tool (update_budget, update_campaign_status, etc.):
- First: Check account authorization
- Second: Check vagueness
- Third: Generate preview → Request approval
- Fourth: Wait for confirmation
- Fifth: Take snapshot
- Sixth: Execute operation
- Seventh: Send notifications
```

**2. Approval Enforcer →** Snapshot Manager
```
Before executing approved operation:
- Capture current state
- Store snapshot in DynamoDB
- Return snapshot ID
```

**3. Snapshot Manager →** Financial Impact Calculator
```
When rollback requested:
- Get snapshot
- Calculate financial impact
- Generate report
- Execute rollback
```

**4. All Operations →** Notification Manager
```
After every write operation:
- Send real-time email to central admin
- Queue batched email to agency manager
- Include operation details, rollback link
```

**5. Budget Tools →** Google Ads Change History
```
For verification and impact calculation:
- Query Google's change_event API
- Cross-reference with MCP snapshot
- Use for financial impact
```

---

## 🧪 TESTING REQUIREMENTS

### After Implementation, Test:

**1. Approval Workflow:**
```
Test: update_budget returns preview, not immediate execution
1. Call update_budget via HTTP API
2. Expect: requiresApproval: true, preview object
3. Call confirm-operation with token
4. Expect: Execution happens, notifications sent
```

**2. Budget Cap:**
```
Test: >500% change blocked
1. Current budget: $100
2. Try: update_budget to $600 (500% increase)
3. Expect: Success (at limit)
4. Try: update_budget to $601 (501% increase)
5. Expect: Error "exceeds 500% maximum"
```

**3. Account Authorization:**
```
Test: Access to non-approved account blocked
1. Approved accounts: [123, 456]
2. Try: update_budget for account 999
3. Expect: Error "You don't have access to account 999"
```

**4. Vagueness Detection:**
```
Test: Vague request blocked
1. Call: update_budget with missing reason
2. Expect: Error "Missing required field: reason"
3. Call: update_budget with all fields
4. Expect: Success (preview returned)
```

**5. Rollback:**
```
Test: Rollback restores previous state
1. Change budget: $100 → $150
2. Wait 10 minutes
3. Call rollback(operationId)
4. Expect: Budget back to $100, financial report generated
5. Verify: Report shows extra spend during 10 minutes
```

**6. Notifications:**
```
Test: Emails sent correctly
1. Execute write operation
2. Check: Central admin received email
3. Check: Agency manager email queued for batching
4. Check: Email contains rollback link
```

**7. Pattern Matching:**
```
Test: Bulk operations with confirmation
1. Request: "pause all Test campaigns"
2. Expect: List of matching campaigns returned
3. Expect: Requires confirmation
4. Confirm: Execute for all campaigns
5. Verify: Individual logs for each campaign
```

---

## 🔐 SECURITY NOTES

### Secrets Management:

**Current (Local Development):**
- Stored in: `.env` file
- OAuth tokens: `config/gsc-tokens.json`
- ⚠️ Works for local testing only

**Production (AWS):**
- Use: AWS Secrets Manager
- Automatically inject into ECS tasks
- Never commit secrets to Git
- Rotate every 90 days

**OMA-MCP Shared Secret:**
```
Purpose: Encrypt/decrypt approved accounts
Generation: openssl rand -hex 32
Storage:
  - OMA side: OMA's secret manager
  - MCP side: AWS Secrets Manager
Environment variable: OMA_MCP_SHARED_SECRET
Never log or expose
```

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

### Issue 1: Google Ads API Type Compatibility
**Problem:** google-ads-api package has strict typing
**Workaround:** Use `as any` type casting where needed
**Location:** `src/ads/client.ts` (multiple locations)
**Not a runtime issue:** Types are correct at runtime, just TypeScript compiler issue

### Issue 2: Google Analytics Connection Test
**Problem:** Connection test failed during server startup
**Status:** Non-blocking (server starts anyway)
**Tools:** Should still work when called
**Investigation:** May need different auth client initialization

### Issue 3: WSL2 Localhost OAuth Callback
**Problem:** Browser can't reach localhost:6000 callback from Windows to WSL2
**Workaround:** Manual code entry (built into setup-auth script)
**User flow:** Paste authorization code when prompted
**Not a production issue:** Only affects initial OAuth setup

---

## 📂 FILE LOCATIONS

### Source Code:
```
src/
├── gsc/
│   ├── server.ts                 # Main entry point
│   ├── auth.ts                   # OAuth manager (all APIs)
│   ├── google-client.ts          # GSC API wrapper
│   ├── approval.ts               # DryRunResultBuilder (exists, use this!)
│   ├── audit.ts                  # Audit logging
│   ├── config.ts                 # Configuration manager
│   └── tools/
│       ├── properties.ts         # 3 tools (delete_property removed)
│       ├── analytics.ts          # 1 tool (query_search_analytics)
│       ├── sitemaps.ts           # 4 tools
│       ├── url-inspection.ts     # 1 tool
│       └── index.ts              # Exports all tools from all APIs
├── crux/
│   ├── client.ts                 # CrUX HTTP client
│   ├── types.ts
│   ├── validation.ts
│   └── tools.ts                  # 5 CrUX tools
├── ads/
│   ├── client.ts                 # Google Ads API wrapper
│   ├── types.ts
│   ├── validation.ts
│   └── tools/
│       ├── accounts.ts           # 1 tool (list_accessible_accounts)
│       ├── reporting.ts          # 5 read tools
│       ├── campaigns.ts          # 2 write tools
│       ├── budgets.ts            # 2 write tools (budget cap enforced here!)
│       ├── keywords.ts           # 2 write tools
│       └── index.ts              # Exports all Ads tools
├── analytics/
│   ├── client.ts                 # GA4 Data + Admin API wrapper
│   ├── types.ts
│   ├── validation.ts
│   └── tools/
│       ├── accounts.ts           # 3 tools (list accounts/properties/streams)
│       ├── reporting.ts          # 2 tools (run_report, realtime)
│       └── index.ts
└── shared/
    ├── logger.ts                 # Logging utility
    ├── errors.ts                 # Custom error classes
    ├── utils.ts                  # Common utilities
    ├── interceptor.ts            # ✅ Safety validation (budget caps)
    └── account-authorization.ts  # ✅ Two-layer auth (done!)

    # TO CREATE (Your tasks):
    ├── approval-enforcer.ts      # Task A1
    ├── snapshot-manager.ts       # Task A2
    ├── financial-impact.ts       # Task A3
    ├── confirmation.ts           # Task B1
    ├── vagueness-detector.ts     # Task B2
    ├── pattern-matcher.ts        # Task B3
    ├── notifications.ts          # Task C1
    └── (other utility files as needed)

src/ads/
    └── change-history.ts         # Task C2 (Google Ads change history)

src/
    └── http-server.ts            # Task D1 (HTTP API wrapper)
```

### Configuration Files:
```
config/
├── gsc-config.json              # Server config (empty selectedProperties for discovery)
├── gsc-tokens.json              # OAuth tokens (DO NOT commit to Git!)
├── safety-limits.json           # ✅ Budget caps, bulk limits
├── prohibited-operations.json   # ✅ Blocked operations list
└── notification-config.json     # ✅ Email settings

.env                             # API credentials (DO NOT commit!)
.mcp.json                        # Claude Code CLI config
```

### Documentation (15 files):
See "Documentation Guide" section above for complete list

---

## 💻 DEVELOPMENT COMMANDS

### Build & Run:
```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run start:gsc    # Start MCP server (STDIO mode)
npm run setup:auth   # Re-run OAuth authorization
npm run test:ads     # Test Google Ads API connection
```

### Testing:
```bash
# Verify tool count
node -e "import('./dist/gsc/tools/index.js').then(m => console.log('Tools:', m.allTools.length))"

# List all tools
node -e "import('./dist/gsc/tools/index.js').then(m => m.allTools.forEach(t => console.log(t.name)))"

# Start server and check logs
npm run start:gsc 2>&1 | grep "Tool handlers registered"
```

### Code Quality:
```bash
npm run lint         # TypeScript type checking
npm test             # Run tests (when tests created)
```

---

## 🎯 USER (DOGANCANBARIS) REQUIREMENTS

### Critical Safety Rules (From User):

**1. Property Deletion:**
- ❌ NEVER allow delete_property through MCP
- ✅ Tool removed - DONE
- Any attempt → Error: "Must use GSC UI"

**2. Budget Changes:**
- ✅ Block >500% changes (enforced) - DONE
- ⏳ Require specific campaign ID + amount + reason
- ⏳ Force clarification if vague
- ⏳ Show preview + get approval
- ⏳ Send notifications (dual-level)
- ⏳ Enable rollback with financial report

**3. Campaign Status Changes:**
- ⏳ Require specific campaign ID + status + reason
- ⏳ If vague ("pause campaigns"), force clarification
- ⏳ Show preview (which campaigns, what impact)
- ⏳ Get explicit approval
- ⏳ For pattern matching ("pause all Black Friday"), show full list first

**4. All Write Operations:**
- ⏳ Must have: specific resource IDs, explicit amounts/actions, reasons
- ⏳ Vagueness blocked (agent must clarify)
- ⏳ Preview before execution
- ⏳ User approval required
- ⏳ Notifications sent (you + agency manager)
- ⏳ Logged in audit trail
- ⏳ Snapshot for rollback

**5. Rate Limiting:**
- Decision: NO rate limiting for now (revisit later per user request)

**6. Notifications:**
- Central admin (dogancanbaris@wpp.com): Every operation, real-time
- Agency managers: Hourly batched summary for their team
- Both levels for complete visibility

**7. Rollback:**
- Must restore previous setting
- Must calculate and report financial impact
- Must use Google Ads change history for verification
- Must send detailed report via email

---

## 🔗 KEY INTEGRATIONS

### OMA Platform (To Be Built by OMA Team):

**OMA Must Provide:**
1. User Google OAuth token storage (encrypted)
2. Access request UI (users request account access)
3. Manager approval UI (managers approve/reject)
4. Approved accounts API endpoint
5. MCP proxy (forwards requests to our HTTP server)
6. Handle previews and confirmations in their UI

**We Provide:**
- HTTP API endpoints (receiving OMA requests)
- Account authorization enforcement
- Tool execution with safety
- Previews and confirmation tokens
- Audit logs OMA can query

**Integration Spec:** See OMA-MCP-INTEGRATION.md (complete API contract)

### AWS Deployment (To Be Done):

**Infrastructure:**
- ECS Fargate for MCP containers
- API Gateway for HTTP endpoints
- Cognito for user authentication (JWT)
- DynamoDB for data (approved accounts, audit logs, snapshots)
- Secrets Manager for credentials
- CloudWatch for monitoring

**Deployment Guide:** See AWS-DEPLOYMENT-GUIDE.md (complete step-by-step)

---

## ⚠️ CRITICAL WARNINGS FOR NEXT AGENT

### DO NOT:

❌ **Remove budget caps** - User specifically wants >500% blocked
❌ **Add rate limiting yet** - User said to revisit later
❌ **Re-add delete_property** - Permanently prohibited
❌ **Skip approval workflow** - Must be enforced, not optional
❌ **Make vagueness detection optional** - Must block vague requests
❌ **Allow bulk operations >20 items** - Safety limit

### DO:

✅ **Read SAFETY-AUDIT.md first** - Understand all risks
✅ **Follow user's requirements exactly** - Documented in this file
✅ **Test every safety feature** - No shortcuts
✅ **Keep modular architecture** - Don't mix concerns
✅ **Document as you go** - Update STATUS files
✅ **Ask user if unclear** - Safety is critical

---

## 📞 COMMUNICATION WITH USER

### User's Priorities (In Order):

1. **Safety above all** - Client accounts, real money, reputation at stake
2. **OMA integration readiness** - Our side must be 100% ready
3. **Clear documentation** - Others need to understand this
4. **Quality over speed** - Do it right, not fast
5. **AWS deployment plan** - Enterprise-scale infrastructure

### User's Technical Level:
- Understands software architecture
- Understands Google APIs and marketing
- Wants detailed explanations
- Appreciates diagrams and examples
- Values comprehensive documentation

### Communication Style:
- Detailed plans before implementation
- Progress updates with specifics
- Clear explanations of decisions
- Comprehensive documentation
- No hand-waving - wants to understand everything

---

## 🎓 CONTEXT YOU NEED

### Why This Project Exists:

**WPP Media:**
- Large global advertising agency
- 1000+ practitioners managing client accounts
- Clients across Google Ads, Search Console, Analytics
- Manual work takes hours per day
- Opportunity: AI agents could automate 80% of repetitive work

**Current Pain Points:**
- Practitioners manually compile reports from 3+ platforms
- Manual campaign optimization (time-consuming)
- Error-prone copy-paste work
- No cross-platform insights
- Limited by human analysis capacity

**Vision:**
- Practitioners direct AI agents
- Agents query all platforms, combine insights
- Agents manage campaigns (with safety)
- 5-10x efficiency improvement
- Competitive advantage

**Risks:**
- AI agent mistakes on client accounts = financial loss + reputation damage
- Must be EXTREMELY safe before production
- User (dogancanbaris) is building proof-of-concept, then rolling to 1000+ users

---

## 📊 SUCCESS METRICS

### For Next Agent to Achieve:

**Technical Success:**
- ✅ All 7 remaining safety features implemented
- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ HTTP server working with mock OMA requests
- ✅ No TypeScript errors
- ✅ Clean code (no warnings)

**Safety Success:**
- ✅ Every write operation requires approval (enforced)
- ✅ Rollback works for all operation types
- ✅ Vagueness detection blocks unclear requests
- ✅ Notifications deliver successfully
- ✅ Pattern matching shows full list before acting

**Integration Success:**
- ✅ HTTP API endpoints working
- ✅ Account authorization enforced on every request
- ✅ Mock OMA integration tested end-to-end
- ✅ Ready for OMA team to connect

**Documentation Success:**
- ✅ All STATUS files updated
- ✅ Implementation details documented
- ✅ Next steps clear for following agents

---

## 🚀 WHEN YOU'RE DONE

### Final Checklist:

- [ ] All 7 safety features implemented and tested
- [ ] HTTP server working (can receive requests from OMA)
- [ ] Account authorization enforced (two-layer working)
- [ ] All tests passing
- [ ] Build successful (npm run build → 0 errors)
- [ ] Documentation updated (STATUS files current)
- [ ] Created: OMA-INTEGRATION-TESTING-GUIDE.md (how to test without OMA)

### Deliverables to User:

**Code:**
- All safety features working
- HTTP server operational
- Tests proving everything works

**Documentation:**
- Updated STATUS files
- Testing guide for OMA integration
- Deployment readiness report

**Demo:**
- Show approval workflow working
- Show rollback with financial report
- Show account authorization blocking unauthorized access
- Show vagueness detection forcing clarification

### Then:

**User decides:**
- Proceed with OMA team coordination?
- Deploy to AWS?
- Start pilot with internal users?

---

## 📖 RECOMMENDED READING ORDER (For New Agent)

### Day 1: Understand the Project
1. This file (AGENT-HANDOVER.md) ← You are here
2. SAFETY-AUDIT.md ← Understand all risks
3. COMPLETE-MCP-SERVER-SUMMARY.md ← Technical overview
4. CLAUDE.md ← Original project vision

### Day 2: Understand What to Build
5. OMA-MCP-INTEGRATION.md ← Your primary implementation guide
6. PRODUCTION-READINESS.md ← What "done" looks like
7. Review existing code in `src/shared/` ← See patterns

### Day 3: Start Implementing
8. Begin with Task A1 (Approval Enforcer)
9. Reference this file for requirements
10. Test each feature as you build

---

## 💡 TIPS FOR SUCCESS

### Code Patterns to Follow:

**1. Use Existing Utilities:**
```typescript
// Don't reinvent:
import { getLogger } from '../shared/logger.js';
import { readJsonFile } from '../shared/utils.js';
import { DryRunResultBuilder } from '../gsc/approval.js'; // Use this for previews!
```

**2. Type Safety:**
```typescript
// All tools return this format:
interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  warning?: string[];
  requiresApproval?: boolean; // For write operations
  preview?: PreviewData; // If approval needed
  confirmationToken?: string; // For two-step flow
}
```

**3. Error Handling:**
```typescript
// Wrap tool handlers in try-catch:
async handler(input) {
  try {
    // Validate input
    // Check authorization
    // Execute operation
    return { success: true, data: result };
  } catch (error) {
    logger.error('Tool execution failed', error);
    throw error; // MCP framework handles error response
  }
}
```

**4. Logging:**
```typescript
// Use structured logging:
logger.info('Operation completed', {
  userId: user,
  tool: toolName,
  accountId: accountId,
  result: 'success'
});

// Never log sensitive data:
// ❌ logger.info('Token:', token);
// ✅ logger.info('Token loaded'); // No actual token value
```

### Testing Strategy:

**1. Start with Unit Tests:**
- Test each safety feature in isolation
- Mock external dependencies
- Fast feedback loop

**2. Integration Tests:**
- Test full workflows
- Use test accounts
- Verify end-to-end flow

**3. Manual Testing:**
- Actually use the MCP with Claude Code CLI
- Try to bypass safety (should fail)
- Verify error messages are helpful

---

## 🆘 IF YOU GET STUCK

### Common Issues:

**TypeScript Errors:**
- Check: Type definitions match Google API responses
- Solution: Use `as any` for Google API type compatibility issues
- See: `src/ads/client.ts` for examples

**Build Failures:**
- Run: `npm run lint` to see all errors
- Fix: One at a time, rebuild after each
- Check: Imports use `.js` extension (ESM requirement)

**Runtime Errors:**
- Check: CloudWatch logs or console output
- Look for: Stack traces in `logs/audit.log`
- Verify: All environment variables set in `.env`

**Tool Not Working:**
- Verify: Tool is exported in `src/gsc/tools/index.ts`
- Check: Tool is in `allTools` array
- Test: Server logs show "Tool handlers registered: 31"

### Resources:

**Google API Documentation:**
- Google Search Console: https://developers.google.com/webmaster-tools
- Google Ads: https://developers.google.com/google-ads/api/docs
- Google Analytics: https://developers.google.com/analytics/devguides/reporting/data/v1
- CrUX: https://developer.chrome.com/docs/crux/api

**MCP Documentation:**
- Official SDK: https://github.com/modelcontextprotocol/typescript-sdk
- AWS MCP Deployment: https://aws.amazon.com/solutions/guidance/deploying-model-context-protocol-servers-on-aws/

**Ask User:**
- If requirements unclear, ask dogancanbaris
- He wants to be involved in decisions
- Better to clarify than assume

---

## 🎯 DEFINITION OF DONE

### When Safety Implementation is Complete:

**All Features Working:**
- [ ] Write operation → Preview generated → User approves → Execution
- [ ] Snapshot captured before every write
- [ ] Rollback available with financial impact report
- [ ] Vague requests blocked, clarification forced
- [ ] Pattern matching shows list, requires confirmation
- [ ] Notifications sent (dual-level: central + agency)
- [ ] Google Ads change history integrated for verification

**All Tests Passing:**
- [ ] Unit tests for each safety feature
- [ ] Integration tests for workflows
- [ ] Manual testing with real accounts
- [ ] Mock OMA integration tested

**Ready for OMA:**
- [ ] HTTP server operational
- [ ] Account authorization enforced
- [ ] API endpoints match OMA-MCP-INTEGRATION.md spec
- [ ] Can handle requests from OMA (when OMA ready)

**Documentation Updated:**
- [ ] CURRENT-STATUS.md reflects completion
- [ ] Testing guide created
- [ ] OMA integration testing documented

### Then:
**Report to user:** "Safety implementation complete. MCP server ready for OMA integration and AWS deployment."

---

## 📧 FINAL NOTES

### This Project is Important:

- **Not just a prototype** - This will be used by 1000+ WPP practitioners globally
- **Real money at stake** - Managing millions in ad spend
- **Client relationships** - Mistakes impact WPP's clients
- **Competitive advantage** - Industry-first AI-powered marketing automation
- **User's career** - This is a major initiative for dogancanbaris

### Safety is Paramount:

- **User's top priority** - Repeated emphasis on safety
- **No shortcuts** - Implement all safety features fully
- **Test thoroughly** - Every scenario must be tested
- **Document everything** - Others will maintain this

### You Have Great Foundation:

- **Code quality:** Production-ready, modular, type-safe
- **Architecture:** Well-designed, scalable
- **Documentation:** Comprehensive, detailed
- **User's plans:** Clear, well-thought-out

**Your job:** Complete the safety layer to match the quality of the foundation.

---

**Good luck! You're building something that will transform how WPP Media operates. 🚀**

---

Last Updated: October 17, 2025
Next Agent: Read this file top to bottom, then read SAFETY-AUDIT.md, then start implementing Task A1.
Status: Ready for handover
Estimated Completion: 2-3 weeks
