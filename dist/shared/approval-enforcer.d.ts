/**
 * Approval Workflow Enforcer
 * Implements preview → confirm → execute workflow for write operations
 */
/**
 * Dry-run result that can be shown to user for confirmation
 */
export interface DryRunResult {
    operation: string;
    api: string;
    accountId: string;
    changes: ChangePreview[];
    risks: string[];
    recommendations: string[];
    estimatedImpact?: FinancialImpact;
}
/**
 * Individual change preview
 */
export interface ChangePreview {
    resource: string;
    resourceId: string;
    field: string;
    currentValue: any;
    newValue: any;
    changeType: 'create' | 'update' | 'delete';
}
/**
 * Financial impact estimation
 */
export interface FinancialImpact {
    currentDailySpend?: number;
    estimatedNewDailySpend?: number;
    dailyDifference?: number;
    monthlyDifference?: number;
    percentageChange?: number;
}
/**
 * Confirmation token for approved operations
 */
export interface ConfirmationToken {
    token: string;
    operation: string;
    dryRunHash: string;
    expiresAt: Date;
    createdAt: Date;
}
/**
 * Approval workflow manager
 */
export declare class ApprovalEnforcer {
    private pendingApprovals;
    private readonly CONFIRMATION_TIMEOUT;
    /**
     * Create dry-run preview for write operation
     */
    createDryRun(operation: string, api: string, accountId: string, _params: any): Promise<{
        dryRun: DryRunResult;
        confirmationToken: string;
    }>;
    /**
     * Validate confirmation token and execute operation
     */
    validateAndExecute(confirmationToken: string, dryRun: DryRunResult, executeCallback: () => Promise<any>): Promise<any>;
    /**
     * Build dry-run result for specific operations
     */
    buildDryRunResult(params: {
        operation: string;
        api: string;
        accountId: string;
        changes: ChangePreview[];
        risks?: string[];
        recommendations?: string[];
        estimatedImpact?: FinancialImpact;
    }): DryRunResult;
    /**
     * Format dry-run result for display to user
     */
    formatDryRunForDisplay(dryRun: DryRunResult): string;
    /**
     * Generate confirmation token
     */
    private generateConfirmationToken;
    /**
     * Hash dry-run result for verification
     */
    private hashDryRun;
    /**
     * Clean up expired confirmations (called periodically)
     */
    cleanupExpiredConfirmations(): void;
    /**
     * Get pending approvals count (for monitoring)
     */
    getPendingApprovalsCount(): number;
}
/**
 * Get approval enforcer instance
 */
export declare function getApprovalEnforcer(): ApprovalEnforcer;
/**
 * Helper to create dry-run builder
 */
export declare class DryRunResultBuilder {
    private operation;
    private api;
    private accountId;
    private changes;
    private risks;
    private recommendations;
    private estimatedImpact?;
    constructor(operation: string, api: string, accountId: string);
    addChange(change: ChangePreview): this;
    addRisk(risk: string): this;
    addRecommendation(recommendation: string): this;
    setFinancialImpact(impact: FinancialImpact): this;
    build(): DryRunResult;
}
//# sourceMappingURL=approval-enforcer.d.ts.map