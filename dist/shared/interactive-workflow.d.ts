/**
 * Interactive Workflow Utilities
 *
 * Provides reusable utilities for creating interactive MCP tools that guide users
 * step-by-step through parameter discovery and provide rich guidance in responses.
 *
 * Core Concepts:
 * - Minimal descriptions in tool metadata (~15 tokens each)
 * - Verbose guidance injected into responses (only when tool is called)
 * - Interactive parameter discovery (multi-step workflows)
 * - Rich insights and next-step suggestions
 *
 * Token Savings:
 * - Before: ~1,500 tokens per tool in metadata (loaded at connection)
 * - After: ~15 tokens per tool in metadata, ~300-1,200 tokens in responses (only when called)
 * - Net savings: ~98% reduction in upfront token usage
 *
 * @module shared/interactive-workflow
 */
/**
 * Standard MCP response format with content and data
 */
export interface McpResponse {
    content?: Array<{
        type: string;
        text: string;
    }>;
    data?: any;
    success?: boolean;
    requiresApproval?: boolean;
    confirmationToken?: string;
    preview?: any;
}
/**
 * Configuration for discovery response formatting
 */
export interface DiscoveryConfig {
    /** Step indicator (e.g., "1/5", "2/3") */
    step: string;
    /** Title for this discovery step (e.g., "SELECT ACCOUNT") */
    title: string;
    /** Items to present for selection */
    items: any[];
    /** Function to format each item for display */
    itemFormatter: (item: any, index: number) => string;
    /** Prompt text asking user what to provide */
    prompt: string;
    /** Name of the parameter being discovered */
    nextParam: string;
    /** Optional context to display (already collected parameters) */
    context?: Record<string, any>;
    /** Optional emoji for the section (defaults to 🔍) */
    emoji?: string;
}
/**
 * Configuration for success summary formatting
 */
export interface SuccessSummaryConfig {
    /** Title of success message (e.g., "BUDGET UPDATED SUCCESSFULLY") */
    title: string;
    /** Brief description of operation performed */
    operation: string;
    /** Key details to display (field: value pairs) */
    details: Record<string, any>;
    /** Optional audit ID for tracking */
    auditId?: string;
    /** Optional timestamp (defaults to now) */
    timestamp?: string;
    /** Optional next steps to suggest */
    nextSteps?: string[];
    /** Optional warnings or important notes */
    warnings?: string[];
    /** Optional emoji for the section (defaults to ✅) */
    emoji?: string;
}
/**
 * Workflow step definition for WorkflowBuilder
 */
export interface WorkflowStep {
    /** Condition that determines if this step should execute */
    condition: (input: any) => boolean;
    /** Handler to execute if condition is true */
    handler: (input: any, context: any) => Promise<McpResponse>;
}
/**
 * Inject guidance text into a tool response.
 *
 * This is the core pattern for token optimization: keep tool descriptions minimal,
 * but inject detailed guidance when the tool is actually called.
 *
 * @param data - The data to return to the user
 * @param guidanceText - Rich guidance text with formatting, insights, next steps
 * @returns MCP-formatted response with content and data
 *
 * @example
 * ```typescript
 * const properties = await fetchProperties();
 * return injectGuidance(
 *   { properties },
 *   `📊 DISCOVERED ${properties.length} PROPERTIES
 *
 * ${properties.map((p, i) => `${i+1}. ${p.url}`).join('\n')}
 *
 * 💡 WHAT YOU CAN DO:
 * - Analyze traffic: use query_search_analytics
 * - Check indexing: use inspect_url
 *
 * Which property would you like to analyze?`
 * );
 * ```
 */
export declare function injectGuidance(data: any, guidanceText: string): McpResponse;
/**
 * Format a discovery response for interactive parameter collection.
 *
 * Use this when a required parameter is missing. Present options to the user
 * and guide them on what to provide next.
 *
 * @param config - Discovery configuration
 * @returns MCP-formatted response with discovery prompt
 *
 * @example
 * ```typescript
 * if (!input.customerId) {
 *   const accounts = await listAccounts();
 *   return formatDiscoveryResponse({
 *     step: "1/3",
 *     title: "SELECT ACCOUNT",
 *     items: accounts,
 *     itemFormatter: (a, i) => `${i+1}. ${a.name} (${a.id})`,
 *     prompt: "Which account?",
 *     nextParam: "customerId"
 *   });
 * }
 * ```
 */
export declare function formatDiscoveryResponse(config: DiscoveryConfig): McpResponse;
/**
 * Format next steps suggestions.
 *
 * Use this to guide users on what they can do after completing an operation.
 *
 * @param suggestions - Array of suggested actions (plain text)
 * @returns Formatted next steps text
 *
 * @example
 * ```typescript
 * const nextSteps = formatNextSteps([
 *   'Monitor campaign performance: use get_campaign_performance',
 *   'Check keyword rankings: use get_keyword_performance',
 *   'Adjust bid strategy: use update_bidding_strategy'
 * ]);
 * ```
 */
export declare function formatNextSteps(suggestions: string[]): string;
/**
 * Format a success summary with rich details.
 *
 * Use this after successful write operations to confirm what happened,
 * provide audit trail, and suggest next steps.
 *
 * @param config - Success summary configuration
 * @returns Formatted success message
 *
 * @example
 * ```typescript
 * return formatSuccessSummary({
 *   title: "BUDGET UPDATED SUCCESSFULLY",
 *   operation: "Budget modification",
 *   details: {
 *     "Budget": "Campaign X Budget",
 *     "Old Amount": "$50/day",
 *     "New Amount": "$75/day",
 *     "Change": "+$25/day (+50%)"
 *   },
 *   auditId: "aud_123",
 *   nextSteps: [
 *     'Monitor performance: use get_campaign_performance',
 *     'Check daily spend: use get_budget_report'
 *   ]
 * });
 * ```
 */
export declare function formatSuccessSummary(config: SuccessSummaryConfig): string;
/**
 * Format a dry-run preview with enhanced details.
 *
 * Use this for write operations to show what will happen before execution.
 *
 * @param title - Preview title
 * @param step - Step indicator (e.g., "3/4")
 * @param changes - List of changes that will be made
 * @param risks - Warning messages about risks
 * @param recommendations - Best practice recommendations
 * @returns Formatted dry-run preview
 *
 * @example
 * ```typescript
 * const preview = formatDryRunPreview(
 *   "BUDGET UPDATE PREVIEW",
 *   "3/4",
 *   [
 *     `Budget: ${budgetName}`,
 *     `Current: $${oldAmount}/day`,
 *     `New: $${newAmount}/day`,
 *     `Change: +$${change}/day (+${changePercent}%)`
 *   ],
 *   ['Large increase: +50%. Consider gradual increases.'],
 *   ['Allow 7 days between increases for algorithm optimization']
 * );
 * ```
 */
export declare function formatDryRunPreview(title: string, step: string, changes: string[], risks?: string[], recommendations?: string[]): string;
/**
 * WorkflowBuilder - Create multi-step interactive workflows
 *
 * Use this to build complex workflows with multiple conditional steps.
 * Each step has a condition (when to execute) and a handler (what to do).
 *
 * @example
 * ```typescript
 * const workflow = new WorkflowBuilder()
 *   .addStep(
 *     (input) => !input.customerId,
 *     async (input, context) => discoverAccount()
 *   )
 *   .addStep(
 *     (input) => !input.budgetId,
 *     async (input, context) => discoverBudget(input.customerId)
 *   )
 *   .addStep(
 *     (input) => !input.confirmationToken,
 *     async (input, context) => buildDryRunPreview(input)
 *   )
 *   .addStep(
 *     (input) => !!input.confirmationToken,
 *     async (input, context) => executeOperation(input)
 *   );
 *
 * // Execute workflow
 * return await workflow.execute(input);
 * ```
 */
export declare class WorkflowBuilder {
    private steps;
    /**
     * Add a step to the workflow.
     *
     * Steps are evaluated in order. The first step whose condition returns true
     * will have its handler executed.
     *
     * @param condition - Function that determines if this step should execute
     * @param handler - Async function to execute if condition is true
     * @returns This builder for chaining
     */
    addStep(condition: (input: any) => boolean, handler: (input: any, context: any) => Promise<McpResponse>): this;
    /**
     * Execute the workflow.
     *
     * Evaluates conditions in order and executes the first matching handler.
     *
     * @param input - User input parameters
     * @param context - Optional context object (shared across steps)
     * @returns Response from the executed step
     * @throws Error if no step condition matches
     */
    execute(input: any, context?: any): Promise<McpResponse>;
    /**
     * Get the number of steps in this workflow.
     *
     * @returns Number of steps
     */
    getStepCount(): number;
}
/**
 * Helper: Check if required parameters are present.
 *
 * Use this to validate input before executing operations.
 *
 * @param input - User input
 * @param required - Array of required parameter names
 * @returns Object with { valid: boolean, missing: string[] }
 *
 * @example
 * ```typescript
 * const validation = checkRequiredParams(input, ['customerId', 'budgetId', 'newAmount']);
 * if (!validation.valid) {
 *   return formatDiscoveryResponse({
 *     // ... guide user to provide missing params
 *   });
 * }
 * ```
 */
export declare function checkRequiredParams(input: any, required: string[]): {
    valid: boolean;
    missing: string[];
};
/**
 * Helper: Format data table for display.
 *
 * Converts array of objects into formatted table text.
 *
 * @param data - Array of objects
 * @param columns - Column names to display (in order)
 * @param maxRows - Maximum rows to display (default: 10)
 * @returns Formatted table text
 *
 * @example
 * ```typescript
 * const table = formatDataTable(
 *   campaigns,
 *   ['name', 'status', 'budget', 'clicks'],
 *   5
 * );
 * // Returns:
 * // 1. Campaign A | ENABLED | $50/day | 1,234 clicks
 * // 2. Campaign B | PAUSED  | $30/day | 567 clicks
 * // ...
 * ```
 */
export declare function formatDataTable(data: any[], columns: string[], maxRows?: number): string;
/**
 * Helper: Format percentage change.
 *
 * @param oldValue - Original value
 * @param newValue - New value
 * @returns Formatted change string (e.g., "+25% increase" or "-15% decrease")
 *
 * @example
 * ```typescript
 * formatPercentageChange(50, 75);  // Returns: "+50% increase"
 * formatPercentageChange(100, 85); // Returns: "-15% decrease"
 * formatPercentageChange(50, 50);  // Returns: "no change"
 * ```
 */
export declare function formatPercentageChange(oldValue: number, newValue: number): string;
/**
 * Helper: Format currency value.
 *
 * @param amount - Amount in dollars
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$50.00")
 *
 * @example
 * ```typescript
 * formatCurrency(50);      // Returns: "$50.00"
 * formatCurrency(1234.56); // Returns: "$1,234.56"
 * ```
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Helper: Format large numbers with commas.
 *
 * @param value - Numeric value
 * @returns Formatted string with thousand separators
 *
 * @example
 * ```typescript
 * formatNumber(1234567); // Returns: "1,234,567"
 * formatNumber(123.45);  // Returns: "123.45"
 * ```
 */
export declare function formatNumber(value: number): string;
//# sourceMappingURL=interactive-workflow.d.ts.map