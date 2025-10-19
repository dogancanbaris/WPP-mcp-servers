/**
 * Google Ads Change History Integration
 * Queries change_event API for verification and financial impact calculation
 */
/**
 * Change event from Google Ads
 */
export interface ChangeEvent {
    changeDateTime: string;
    changeResourceType: string;
    changeResourceName: string;
    userEmail: string;
    clientType: string;
    changeOperation: string;
    oldValue?: any;
    newValue?: any;
    campaignName?: string;
    adGroupName?: string;
}
/**
 * Change history query result
 */
export interface ChangeHistoryResult {
    events: ChangeEvent[];
    totalEvents: number;
    startDate: string;
    endDate: string;
}
/**
 * Change history manager
 */
export declare class ChangeHistoryManager {
    /**
     * Query change history for account
     */
    queryChangeHistory(params: {
        customerId: string;
        startDate: Date;
        endDate: Date;
        resourceType?: string;
        campaignId?: string;
    }): Promise<ChangeHistoryResult>;
    /**
     * Verify MCP operation against change history
     */
    verifyOperation(params: {
        customerId: string;
        snapshotId: string;
        operationTime: Date;
        resourceType: string;
        resourceName: string;
    }): Promise<{
        verified: boolean;
        changeEvent?: ChangeEvent;
        message: string;
    }>;
    /**
     * Get changes for rollback context
     */
    getChangesForRollback(params: {
        customerId: string;
        snapshotTimestamp: Date;
        resourceType: string;
        resourceName: string;
    }): Promise<ChangeEvent[]>;
    /**
     * Format change history as readable report
     */
    formatChangeHistoryReport(result: ChangeHistoryResult): string;
    /**
     * Format date-time as YYYY-MM-DD HH:MM:SS
     */
    private formatDateTime;
    /**
     * Get recent changes (convenience method)
     */
    getRecentChanges(params: {
        customerId: string;
        hoursAgo?: number;
    }): Promise<ChangeHistoryResult>;
}
/**
 * Get change history manager instance
 */
export declare function getChangeHistoryManager(): ChangeHistoryManager;
/**
 * Helper to query and format change history
 */
export declare function queryAndFormatChangeHistory(params: {
    customerId: string;
    startDate: Date;
    endDate: Date;
    resourceType?: string;
    campaignId?: string;
}): Promise<{
    result: ChangeHistoryResult;
    report: string;
}>;
//# sourceMappingURL=change-history.d.ts.map