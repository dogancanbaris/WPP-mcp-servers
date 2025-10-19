/**
 * Interceptor Middleware for Write Operations
 *
 * Intercepts all write tool calls to enforce:
 * - Mandatory approval workflow
 * - Preview before execution
 * - Safety validations
 * - Audit logging
 */
/**
 * Safety limits configuration
 */
interface SafetyLimits {
    budgetLimits: {
        maxIncreasePercent: number;
        maxDecreasePercent: number;
        warningThreshold: number;
        gradualRecommendation: number;
    };
    bulkOperationLimits: {
        maxKeywordsPerCall: number;
        maxCampaignsPerPatternMatch: number;
    };
}
/**
 * Check if operation is prohibited
 */
export declare function isOperationProhibited(operationName: string): Promise<boolean>;
/**
 * Validate budget change against safety limits
 */
export declare function validateBudgetChange(currentAmountMicros: number, newAmountMicros: number): Promise<{
    allowed: boolean;
    warnings: string[];
    percentChange: number;
}>;
/**
 * Validate bulk operation limits
 */
export declare function validateBulkOperation(operationType: string, itemCount: number): Promise<{
    allowed: boolean;
    limit: number;
}>;
/**
 * Get safety limits for reference
 */
export declare function getSafetyLimits(): Promise<SafetyLimits>;
export {};
//# sourceMappingURL=interceptor.d.ts.map