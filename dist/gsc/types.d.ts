/**
 * Type definitions for Google Search Console MCP Server
 */
/**
 * Configuration for the GSC MCP server
 */
export interface GSCConfig {
    selectedProperties?: string[];
    role: 'admin' | 'editor' | 'viewer';
    auditLogging: boolean;
    requireApproval: {
        writeOperations: boolean;
        deleteOperations: boolean;
    };
}
/**
 * OAuth tokens for Google API authentication
 */
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiryDate?: Date;
    tokenType: string;
}
/**
 * Context for an operation being performed
 */
export interface OperationContext {
    user: string;
    property: string;
    timestamp: Date;
    operationType: 'read' | 'write' | 'delete';
}
/**
 * Audit log entry
 */
export interface AuditLogEntry {
    timestamp: Date;
    user: string;
    action: string;
    property: string;
    operationType: 'read' | 'write' | 'delete';
    result: 'success' | 'failure' | 'blocked';
    details: Record<string, any>;
    errorMessage?: string;
}
/**
 * Dry-run result showing what would happen
 */
export interface DryRunResult {
    wouldSucceed: boolean;
    expectedResult: any;
    changes: string[];
    warnings: string[];
    riskLevel: 'low' | 'medium' | 'high';
    estimatedImpact?: string;
}
/**
 * Tool execution result
 */
export interface ToolExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    warning?: string;
    audit?: AuditLogEntry;
}
/**
 * Search Analytics query parameters
 */
export interface SearchAnalyticsQuery {
    property: string;
    startDate: string;
    endDate: string;
    dimensions?: string[];
    searchType?: 'web' | 'image' | 'video' | 'news';
    rowLimit?: number;
    filters?: Array<{
        dimension: string;
        operator: 'contains' | 'equals' | 'notContains' | 'notEquals';
        expression: string;
    }>;
}
/**
 * Search Analytics response
 */
export interface SearchAnalyticsResponse {
    rows?: Array<{
        keys: string[];
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    responseAggregationType?: string;
}
/**
 * GSC Property/Site information
 */
export interface GSCProperty {
    siteUrl: string;
    permissionLevel: string;
}
/**
 * Sitemap information
 */
export interface SitemapInfo {
    path: string;
    lastSubmitted?: string;
    lastDownloaded?: string;
    errors?: number;
    warnings?: number;
    contents?: Array<{
        type: string;
        submitted: number;
        indexed: number;
    }>;
}
/**
 * URL Inspection result
 */
export interface URLInspectionResult {
    inspectionUrl: string;
    indexStatusResult?: {
        indexStatus: string;
        coverageState: string;
        robotsTxt?: string;
        indexingState?: string;
        lastCrawlTime?: string;
        pageProtocol?: string;
    };
    ampResult?: {
        ampIndexStatus: string;
        ampVersion?: string;
        ampTestingToolLink?: string;
    };
    richResultsResult?: {
        detectedItems: Array<{
            richResultType: string;
            items: any[];
        }>;
    };
    mobileUsabilityResult?: {
        issues: Array<{
            rule: string;
            severity: string;
        }>;
    };
}
/**
 * Approval request for write operations
 */
export interface ApprovalRequest {
    id: string;
    operation: string;
    property: string;
    dryRunResult: DryRunResult;
    requestedBy: string;
    timestamp: Date;
    expiresAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
}
//# sourceMappingURL=types.d.ts.map