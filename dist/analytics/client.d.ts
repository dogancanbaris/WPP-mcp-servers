/**
 * Google Analytics API Client Wrapper
 */
import type { OAuth2Client } from 'google-auth-library';
import type { AnalyticsProperty, AnalyticsAccount, DataStream, ReportRequest, ReportResponse, RealtimeReportRequest } from './types.js';
/**
 * Google Analytics API Client
 */
export declare class AnalyticsClient {
    private dataClient;
    private adminClient;
    private initialized;
    constructor(auth: OAuth2Client);
    /**
     * Initialize and verify connection
     */
    initialize(): Promise<void>;
    /**
     * List all GA4 accounts
     */
    listAccounts(): Promise<AnalyticsAccount[]>;
    /**
     * List properties for an account
     */
    listProperties(accountId?: string): Promise<AnalyticsProperty[]>;
    /**
     * List data streams for a property
     */
    listDataStreams(propertyId: string): Promise<DataStream[]>;
    /**
     * Run analytics report
     */
    runReport(request: ReportRequest): Promise<ReportResponse>;
    /**
     * Run realtime report
     */
    runRealtimeReport(request: RealtimeReportRequest): Promise<ReportResponse>;
    /**
     * Check if client is initialized
     */
    isInitialized(): boolean;
    /**
     * Create GA4 property
     */
    createProperty(accountId: string, property: any): Promise<any>;
    /**
     * Create data stream
     */
    createDataStream(propertyId: string, dataStream: any): Promise<any>;
    /**
     * Create custom dimension
     */
    createCustomDimension(propertyId: string, dimension: any): Promise<any>;
    /**
     * Create custom metric
     */
    createCustomMetric(propertyId: string, metric: any): Promise<any>;
    /**
     * Create conversion event
     */
    createConversionEvent(propertyId: string, eventName: string): Promise<any>;
    /**
     * Create Google Ads link
     */
    createGoogleAdsLink(propertyId: string, link: any): Promise<any>;
}
/**
 * Get Analytics client instance
 */
export declare function getAnalyticsClient(): AnalyticsClient;
/**
 * Initialize Analytics client
 */
export declare function initializeAnalyticsClient(auth: OAuth2Client): AnalyticsClient;
//# sourceMappingURL=client.d.ts.map