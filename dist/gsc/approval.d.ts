/**
 * Approval and dry-run system for write operations
 */
import { DryRunResult, ApprovalRequest } from './types.js';
/**
 * Dry-run result builder
 */
export declare class DryRunResultBuilder {
    private result;
    /**
     * Set whether operation would succeed
     */
    wouldSucceed(success: boolean): this;
    /**
     * Set expected result
     */
    expectedResult(result: any): this;
    /**
     * Add a change description
     */
    addChange(change: string): this;
    /**
     * Add multiple changes
     */
    addChanges(changes: string[]): this;
    /**
     * Add a warning
     */
    addWarning(warning: string): this;
    /**
     * Add multiple warnings
     */
    addWarnings(warnings: string[]): this;
    /**
     * Set risk level
     */
    riskLevel(level: 'low' | 'medium' | 'high'): this;
    /**
     * Set estimated impact
     */
    estimatedImpact(impact: string): this;
    /**
     * Build the result
     */
    build(): DryRunResult;
}
/**
 * Approval request manager
 */
export declare class ApprovalManager {
    private approvals;
    private timeoutMs;
    constructor(timeoutMs?: number);
    /**
     * Create approval request
     */
    createRequest(operation: string, property: string, dryRunResult: DryRunResult, requestedBy: string): string;
    /**
     * Get approval request
     */
    getRequest(id: string): ApprovalRequest | null;
    /**
     * Approve request
     */
    approveRequest(id: string, approvedBy: string): ApprovalRequest;
    /**
     * Reject request
     */
    rejectRequest(id: string, rejectedBy: string): ApprovalRequest;
    /**
     * Check if request is approved
     */
    isApproved(id: string): boolean;
    /**
     * Clean up expired requests
     */
    cleanup(): void;
    /**
     * Clear all requests (for testing)
     */
    clear(): void;
}
/**
 * Get approval manager
 */
export declare function getApprovalManager(): ApprovalManager;
/**
 * Reset approval manager (for testing)
 */
export declare function resetApprovalManager(): void;
/**
 * Format dry-run result for display
 */
export declare function formatDryRunResult(result: DryRunResult): string;
//# sourceMappingURL=approval.d.ts.map