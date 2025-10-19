/**
 * Snapshot Manager for Rollback
 * Captures state before write operations and enables rollback
 */
/**
 * Snapshot of a resource before modification
 */
export interface Snapshot {
    snapshotId: string;
    operation: string;
    api: string;
    accountId: string;
    userId: string;
    timestamp: Date;
    resourceType: string;
    resourceId: string;
    beforeState: any;
    afterState?: any;
    executedAt?: Date;
    rolledBackAt?: Date;
    rollbackSuccessful?: boolean;
    financialImpact?: SnapshotFinancialImpact;
}
/**
 * Financial impact associated with snapshot
 */
export interface SnapshotFinancialImpact {
    estimatedDailyCost?: number;
    estimatedMonthlyCost?: number;
    actualCostDuringError?: number;
    errorPeriodStart?: Date;
    errorPeriodEnd?: Date;
    costByDay?: Array<{
        date: string;
        cost: number;
    }>;
}
/**
 * Snapshot manager
 */
export declare class SnapshotManager {
    private snapshots;
    /**
     * Create snapshot before write operation
     */
    createSnapshot(params: {
        operation: string;
        api: string;
        accountId: string;
        userId: string;
        resourceType: string;
        resourceId: string;
        beforeState: any;
    }): Promise<string>;
    /**
     * Record execution (after state)
     */
    recordExecution(snapshotId: string, afterState: any): Promise<void>;
    /**
     * Get snapshot by ID
     */
    getSnapshot(snapshotId: string): Promise<Snapshot | null>;
    /**
     * Get snapshots for account
     */
    getSnapshotsForAccount(accountId: string, options?: {
        limit?: number;
        startDate?: Date;
        endDate?: Date;
        operation?: string;
    }): Promise<Snapshot[]>;
    /**
     * Perform rollback
     */
    rollback(snapshotId: string, executeRollback: (beforeState: any) => Promise<any>): Promise<{
        success: boolean;
        message: string;
        financialImpact?: SnapshotFinancialImpact;
    }>;
    /**
     * Attach financial impact to snapshot
     */
    attachFinancialImpact(snapshotId: string, financialImpact: SnapshotFinancialImpact): Promise<void>;
    /**
     * Generate comparison report between before and after states
     */
    generateComparisonReport(snapshot: Snapshot): string;
    /**
     * Clean up old snapshots (called periodically)
     */
    cleanupOldSnapshots(retentionDays?: number): Promise<number>;
    /**
     * Generate snapshot ID
     */
    private generateSnapshotId;
    /**
     * Get snapshot count (for monitoring)
     */
    getSnapshotCount(): number;
}
/**
 * Get snapshot manager instance
 */
export declare function getSnapshotManager(): SnapshotManager;
/**
 * Helper to create snapshot before operation
 */
export declare function createSnapshotBeforeOperation(params: {
    operation: string;
    api: string;
    accountId: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    beforeState: any;
}): Promise<string>;
/**
 * Helper to record execution after operation
 */
export declare function recordSnapshotExecution(snapshotId: string, afterState: any): Promise<void>;
//# sourceMappingURL=snapshot-manager.d.ts.map