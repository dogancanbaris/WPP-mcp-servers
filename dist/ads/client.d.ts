/**
 * Google Ads API Client Wrapper
 */
import { Customer } from 'google-ads-api';
/**
 * Google Ads API Client
 */
export declare class GoogleAdsClient {
    private client;
    private refreshToken;
    private initialized;
    constructor(clientId: string, clientSecret: string, developerToken: string, refreshToken: string);
    /**
     * Initialize client and verify connection
     */
    initialize(): Promise<void>;
    /**
     * List accessible Google Ads accounts
     */
    listAccessibleAccounts(): Promise<string[]>;
    /**
     * Get customer instance for a specific account
     */
    getCustomer(customerId: string): Customer;
    /**
     * List campaigns for a customer
     */
    listCampaigns(customerId: string): Promise<any[]>;
    /**
     * Get campaign performance metrics
     */
    getCampaignPerformance(customerId: string, campaignId?: string, dateRange?: {
        startDate: string;
        endDate: string;
    }): Promise<any[]>;
    /**
     * Get search terms report
     */
    getSearchTermsReport(customerId: string, campaignId?: string, dateRange?: {
        startDate: string;
        endDate: string;
    }): Promise<any[]>;
    /**
     * List budgets for a customer
     */
    listBudgets(customerId: string): Promise<any[]>;
    /**
     * Get keyword performance
     */
    getKeywordPerformance(customerId: string, campaignId?: string, dateRange?: {
        startDate: string;
        endDate: string;
    }): Promise<any[]>;
    /**
     * Check if client is initialized
     */
    isInitialized(): boolean;
    /**
     * Update campaign status (pause/enable/remove)
     */
    updateCampaignStatus(customerId: string, campaignId: string, status: string): Promise<any>;
    /**
     * Create campaign budget
     */
    createBudget(customerId: string, name: string, amountMicros: number): Promise<any>;
    /**
     * Update budget amount
     */
    updateBudget(customerId: string, budgetId: string, amountMicros: number): Promise<any>;
    /**
     * Add keywords to ad group
     */
    addKeywords(customerId: string, adGroupId: string, keywords: Array<{
        text: string;
        matchType: string;
        cpcBidMicros?: number;
    }>): Promise<any>;
    /**
     * Add negative keywords
     */
    addNegativeKeywords(customerId: string, campaignId: string, keywords: Array<{
        text: string;
        matchType: string;
    }>): Promise<any>;
    /**
     * Create campaign
     */
    createCampaign(customerId: string, name: string, budgetId: string, campaignType: string, status?: string): Promise<any>;
}
/**
 * Get Google Ads client instance
 */
export declare function getGoogleAdsClient(): GoogleAdsClient;
/**
 * Initialize Google Ads client
 */
export declare function initializeGoogleAdsClient(clientId: string, clientSecret: string, developerToken: string, refreshToken: string): GoogleAdsClient;
//# sourceMappingURL=client.d.ts.map