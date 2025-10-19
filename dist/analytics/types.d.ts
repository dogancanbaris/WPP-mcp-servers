/**
 * Type definitions for Google Analytics API
 */
/**
 * GA4 Property
 */
export interface AnalyticsProperty {
    name?: string;
    propertyId: string;
    displayName?: string;
    timeZone?: string;
    currencyCode?: string;
    industryCategory?: string;
}
/**
 * GA4 Account
 */
export interface AnalyticsAccount {
    name?: string;
    accountId: string;
    displayName?: string;
}
/**
 * Data Stream (Web or App)
 */
export interface DataStream {
    name?: string;
    streamId: string;
    type?: 'WEB_DATA_STREAM' | 'ANDROID_APP_DATA_STREAM' | 'IOS_APP_DATA_STREAM';
    displayName?: string;
    webStreamData?: {
        measurementId?: string;
        defaultUri?: string;
    };
}
/**
 * Report date range
 */
export interface DateRange {
    startDate: string;
    endDate: string;
    name?: string;
}
/**
 * Dimension for report
 */
export interface Dimension {
    name?: string;
}
/**
 * Metric for report
 */
export interface Metric {
    name?: string;
}
/**
 * Report request
 */
export interface ReportRequest {
    propertyId: string;
    dateRanges: DateRange[];
    dimensions?: Dimension[];
    metrics?: Metric[];
    limit?: number;
    offset?: number;
}
/**
 * Report row result
 */
export interface ReportRow {
    dimensionValues?: Array<{
        value?: string;
    }>;
    metricValues?: Array<{
        value?: string;
    }>;
}
/**
 * Report response
 */
export interface ReportResponse {
    dimensionHeaders: Array<{
        name: string;
    }>;
    metricHeaders: Array<{
        name: string;
        type: string;
    }>;
    rows: ReportRow[];
    rowCount: number;
    metadata?: any;
}
/**
 * Realtime report request
 */
export interface RealtimeReportRequest {
    propertyId: string;
    dimensions?: Dimension[];
    metrics?: Metric[];
    limit?: number;
}
/**
 * Funnel step
 */
export interface FunnelStep {
    name: string;
    isDirectlyFollowedBy?: boolean;
    withinDurationFromPriorStep?: string;
    filterExpression?: any;
}
/**
 * Funnel report request
 */
export interface FunnelReportRequest {
    propertyId: string;
    dateRange: DateRange;
    funnel: {
        steps: FunnelStep[];
    };
    dimensions?: Dimension[];
}
//# sourceMappingURL=types.d.ts.map