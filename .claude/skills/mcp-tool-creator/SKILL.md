---
name: MCP Tool Creator
description: Create new MCP tools for Google APIs with full safety integration, following WPP project patterns from INTEGRATION-GUIDE.md
---

# MCP Tool Creator Skill

## Purpose

Generate new MCP tools that follow WPP project standards with complete safety integration. Uses templates from `INTEGRATION-GUIDE.md` and patterns from existing tools.

## Tool Types

### Read Tool (Safe - No Approval Needed)
Examples: `list_campaigns`, `query_search_analytics`, `get_keyword_performance`

### Write Tool (Requires Safety Integration)
Examples: `update_budget`, `add_keywords`, `create_campaign`

## Read Tool Template

```typescript
import { z } from 'zod';
import { getLogger } from '../../shared/logger.js';

const logger = getLogger();

// Validation schema
const {toolName}Schema = z.object({
  // Add parameters
  customerId: z.string().describe('Customer ID'),
  // ... more params
});

export const {toolName}Tool = {
  name: '{tool_name}',
  description: `
[Brief description of what tool does]

Use this tool when you need to [use case].

Parameters:
- param1: Description
- param2: Description

Returns: [what it returns]

Example: [usage example]
  `,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Google Ads Customer ID (10 digits)',
      },
      // ... more properties
    },
    required: ['customerId'],
  },
  handler: async (input: any) => {
    try {
      // Validate input
      const validated = {toolName}Schema.parse(input);

      logger.info('{tool_name} called', { customerId: validated.customerId });

      // Get API client
      const client = getApiClient();

      // Perform operation
      const result = await client.{apiMethod}(validated);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error('{tool_name} failed', error as Error);
      throw error;
    }
  },
};
```

## Write Tool Template (With Full Safety)

```typescript
import { z } from 'zod';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';

const logger = getLogger();

// Validation schema
const {toolName}Schema = z.object({
  customerId: z.string(),
  resourceId: z.string(),
  // ... params for the change
  confirmationToken: z.string().optional(),
});

export const {toolName}Tool = {
  name: '{tool_name}',
  description: `
[WRITE OPERATION - Requires approval]

[What this tool does]

⚠️ SAFETY FEATURES:
- Preview shown before execution
- Requires user confirmation
- All changes logged and reversible
- [Additional safety notes if applicable]

💡 AGENT GUIDANCE:
- Always check current state first (use [read_tool_name])
- Provide specific [resource IDs, amounts, etc]
- Include reason for change
- [Best practices]

Parameters:
- param1: Description
- confirmationToken: Optional - if not provided, will show preview

Example workflow:
1. Call without confirmationToken → Get preview
2. Review preview
3. Call with confirmationToken → Execute change
  `,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: { type: 'string', description: 'Customer ID' },
      resourceId: { type: 'string', description: 'Resource to modify' },
      // ... change parameters
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from preview (optional)',
      },
    },
    required: ['customerId', 'resourceId' /* other required params */],
  },
  handler: async (input: any) => {
    try {
      const validated = {toolName}Schema.parse(input);
      const { customerId, resourceId, confirmationToken } = validated;

      // STEP 1: Vagueness Detection
      detectAndEnforceVagueness({
        operation: '{tool_name}',
        inputText: `{operation description}`,
        inputParams: input,
      });

      // STEP 2: Get Current State
      const client = getApiClient();
      const currentState = await client.{getCurrentStateMethod}(resourceId);

      // STEP 3: Build Preview
      const approvalEnforcer = getApprovalEnforcer();
      const dryRunBuilder = new DryRunResultBuilder(
        '{tool_name}',
        '{API Name}',
        customerId
      );

      // Add changes
      dryRunBuilder.addChange({
        resource: '{Resource Type}',
        resourceId: resourceId,
        field: '{field_name}',
        currentValue: currentState.{field},
        newValue: validated.{newValue},
        changeType: 'update',
      });

      // Add financial impact (if applicable)
      // Only for budget/bid changes
      if ({hasFinancialImpact}) {
        const impact = calculateFinancialImpact(currentState, validated);
        dryRunBuilder.setFinancialImpact(impact);
      }

      // Add risks
      if ({hasRisks}) {
        dryRunBuilder.addRisk('{Risk description}');
      }

      // Add recommendations
      dryRunBuilder.addRecommendation('{Helpful suggestion}');

      const dryRun = dryRunBuilder.build();

      // STEP 4: If no token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          '{tool_name}',
          '{API Name}',
          customerId,
          validated
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message: 'Operation requires approval. Review preview and call again with confirmationToken.',
        };
      }

      // STEP 5: Execute with approval
      logger.info('{tool_name} executing with confirmation', { resourceId });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          // Execute actual operation
          return await client.{executeMethod}(validated);
        }
      );

      return {
        success: true,
        data: {
          ...result,
          message: `✅ {Operation} completed successfully`,
        },
      };
    } catch (error) {
      logger.error('{tool_name} failed', error as Error);
      throw error;
    }
  },
};
```

## Safety Integration Checklist

When creating a WRITE tool, ensure ALL 9 layers:

1. ✅ **Account Authorization**
   - Validates user has access to account
   - Uses AccountAuthorizationManager

2. ✅ **Approval Workflow**
   - Import ApprovalEnforcer
   - Build preview with DryRunResultBuilder
   - Return preview if no confirmationToken
   - Validate token and execute if provided

3. ✅ **Vagueness Detection**
   - Import detectAndEnforceVagueness
   - Call at start of handler
   - Blocks if missing required fields or vague terms

4. ✅ **Budget Caps** (if financial operation)
   - Interceptor automatically checks >500% changes
   - Add percentage calculation to preview

5. ✅ **Bulk Limits** (if bulk operation)
   - Check array length < max (20 for patterns, 50 for keywords)
   - Throw error if exceeded

6. ✅ **Snapshot Creation**
   - ApprovalEnforcer automatically creates snapshot
   - Captured before execution

7. ✅ **Financial Impact** (if applicable)
   - Use FinancialImpactCalculator
   - Add to preview via setFinancialImpact()

8. ✅ **Agent Guidance**
   - Comprehensive description with:
     - What tool does
     - When to use it
     - Safety features
     - Best practices
     - Example workflow

9. ✅ **Testing**
   - Create test file in tests/
   - Test preview generation
   - Test execution with token
   - Test error cases

## File Organization

### New Tool Location
- **GSC tools:** `src/gsc/tools/{toolname}.ts`
- **Google Ads tools:** `src/ads/tools/{category}.ts` (budgets, campaigns, keywords, etc.)
- **Analytics tools:** `src/analytics/tools/{category}.ts`
- **Other APIs:** `src/{api-name}/tools.ts`

### Export Tool
Always add to index file:
```typescript
// In src/ads/tools/index.ts
export { newTool } from './category.js';

// In src/gsc/tools/index.ts
export const allTools = [
  ...gscTools,
  ...cruxTools,
  ...adsTools,
  ...analyticsTools,
  newTool,  // Add here
];
```

## Validation Schema Patterns

### Common Validation Rules

```typescript
// Customer/Account IDs
customerId: z.string().regex(/^\d{10}$/).describe('10-digit customer ID')

// Property URLs (GSC)
property: z.string().regex(/^sc-(domain|https?):.+/).describe('GSC property URL')

// Dates
startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('YYYY-MM-DD')

// Enums
status: z.enum(['ENABLED', 'PAUSED', 'REMOVED'])

// Arrays with limits
keywords: z.array(z.string()).max(50).describe('Max 50 keywords per operation')

// Dollar amounts
dailyBudgetDollars: z.number().positive().max(100000).describe('Daily budget in USD')

// Optional confirmation token
confirmationToken: z.string().optional().describe('Token from preview')
```

## Agent Guidance Template

```
description: `
[One-line summary of what tool does]

[WRITE OPERATION - Requires approval] (if write tool)

[Detailed explanation of tool purpose and what it modifies]

⚠️ SAFETY FEATURES:
- Preview generated before execution
- Requires user confirmation via confirmationToken
- [Financial impact calculated] (if applicable)
- All changes logged and reversible via rollback
- [Additional safety notes]

💡 AGENT GUIDANCE:
- **Before using this tool:** Call {related_read_tool} to check current state
- **Required information:** Provide specific {resource IDs, amounts, reasons}
- **Best practice:** {Helpful workflow tip}
- **Risk awareness:** {What could go wrong if misused}
- **Recommendations:**
  - {Best practice 1}
  - {Best practice 2}

📊 FINANCIAL IMPACT (if applicable):
This tool affects spending. Always:
- Show current vs proposed budget/bid
- Calculate daily and monthly impact
- Recommend gradual changes (<20% at a time)
- Allow 7 days between increases for algorithm optimization

Parameters:
- param1 (required): Description
- param2 (optional): Description
- confirmationToken (optional): From preview - include to execute

Returns: [What tool returns]

Example Workflow:
1. Check current state: {read_tool_name}({ params })
2. Request change: {tool_name}({ params }) → Get preview
3. Review preview (shows current → new, impact, risks)
4. Confirm: {tool_name}({ params, confirmationToken }) → Executes

Example Use Case:
"{Realistic practitioner scenario}"
`
```

## Testing Template

```typescript
// tests/{tool-name}.test.ts
import { {toolName}Tool } from '../src/{api}/tools/{category}';

describe('{toolName}Tool', () => {
  // Test 1: Preview generation (write tools)
  it('should return preview without confirmationToken', async () => {
    const result = await {toolName}Tool.handler({
      customerId: 'test-customer',
      resourceId: 'test-resource',
      // ... params
    });

    expect(result.requiresApproval).toBe(true);
    expect(result.preview).toBeDefined();
    expect(result.confirmationToken).toBeDefined();
  });

  // Test 2: Execution with token (write tools)
  it('should execute with valid confirmationToken', async () => {
    // Setup: Create preview first
    const preview = await {toolName}Tool.handler({ /* params */ });

    // Execute with token
    const result = await {toolName}Tool.handler({
      // ... params
      confirmationToken: preview.confirmationToken,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  // Test 3: Vagueness detection (write tools)
  it('should block vague requests', async () => {
    await expect({toolName}Tool.handler({
      customerId: 'test',
      // Missing required fields
    })).rejects.toThrow('Vague request detected');
  });

  // Test 4: Input validation
  it('should validate inputs', async () => {
    await expect({toolName}Tool.handler({
      customerId: 'invalid',  // Wrong format
    })).rejects.toThrow();
  });
});
```

## Step-by-Step Tool Creation

### Step 1: Determine Tool Type
- Read tool? (safe, no approval)
- Write tool? (needs full safety)

### Step 2: Create Tool File
- Choose appropriate directory
- Create TypeScript file
- Import required dependencies

### Step 3: Add Validation Schema
- Define Zod schema
- Add all parameters
- Include confirmationToken (if write tool)

### Step 4: Build Tool Object
- name: Snake_case MCP tool name
- description: Comprehensive agent guidance
- inputSchema: JSON schema from Zod
- handler: Async function

### Step 5: Integrate Safety (Write Tools Only)
- Add vagueness detection
- Get current state
- Build preview with DryRunResultBuilder
- Handle confirmation token
- Execute with approvalEnforcer.validateAndExecute()

### Step 6: Export Tool
- Add to category index file
- Add to allTools array in main index
- Verify exports correct

### Step 7: Create Tests
- Use test template
- Test preview (write tools)
- Test execution
- Test validation
- Test error cases

### Step 8: Update Documentation
- Add tool to API reference docs
- Update tool count in status docs
- Document use cases

## Examples from Project

### Perfect Read Tool Example:
`src/ads/tools/reporting.ts` - `getCampaignPerformanceTool`
- Clean structure
- Good validation
- Comprehensive description
- No safety needed (read-only)

### Perfect Write Tool Example:
`src/ads/tools/budgets.ts` - `updateBudgetTool`
- Full safety integration
- Financial impact calculation
- Budget cap check
- Excellent agent guidance
- Complete preview/confirm flow

### Perfect Validation Example:
`src/gsc/validation.ts`
- Strict schemas
- Clear error messages
- Helpful descriptions

## Common Patterns

### Pattern 1: List Operations
```typescript
// Always include filters, limits
export const listXTool = {
  name: 'list_x',
  description: 'List all X with optional filtering',
  handler: async ({ customerId, filters }) => {
    const client = getClient();
    const results = await client.list({
      customerId,
      ...filters,
      limit: 100,  // Always limit
    });
    return { success: true, data: results };
  },
};
```

### Pattern 2: Get Single Resource
```typescript
export const getXTool = {
  name: 'get_x',
  description: 'Get details for specific X',
  handler: async ({ customerId, resourceId }) => {
    const client = getClient();
    const result = await client.get(resourceId);
    return { success: true, data: result };
  },
};
```

### Pattern 3: Create Resource (Write - Full Safety)
```typescript
export const createXTool = {
  name: 'create_x',
  description: '[Comprehensive description with safety notes]',
  handler: async (input) => {
    const { confirmationToken } = input;

    // Vagueness check
    detectAndEnforceVagueness({ ... });

    // Build preview
    const dryRunBuilder = new DryRunResultBuilder(...);
    dryRunBuilder.addChange({
      resource: 'X',
      changeType: 'create',
      newValue: input.params,
    });

    // Preview or execute
    if (!confirmationToken) {
      return { requiresApproval: true, preview, confirmationToken };
    }

    // Execute
    const result = await approvalEnforcer.validateAndExecute(...);
    return { success: true, data: result };
  },
};
```

## When to Use This Skill

Activate when user says:
- "Create a new tool for [API operation]"
- "Add [tool name] tool"
- "Implement [feature] as MCP tool"
- "We need a tool to [do something]"

## Output

This skill will generate:
1. Complete tool TypeScript file
2. Validation schema
3. Test file
4. Export statements to add
5. Documentation snippet

## References

- `INTEGRATION-GUIDE.md` - Complete integration patterns
- `src/ads/tools/budgets.ts` - Perfect write tool example
- `src/ads/tools/reporting.ts` - Perfect read tool examples
- `SAFETY-AUDIT.md` - Safety requirements

## Remember

- **Read tools:** Simple, no safety needed
- **Write tools:** Full 9-layer safety integration REQUIRED
- **Always follow project patterns:** Consistency is critical for 1,000+ users
- **Test everything:** No shortcuts on testing
