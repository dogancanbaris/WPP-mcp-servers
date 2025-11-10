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
     * @param customerId The customer ID to access
     * @param loginCustomerId Optional manager account ID (required when accessing client accounts)
     */
    getCustomer(customerId: string, loginCustomerId?: string): Customer;
    /**
     * List campaigns for a customer
     */
    listCampaigns(customerId: string, loginCustomerId?: string): Promise<any[]>;
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
        finalUrls?: string[];
        trackingUrlTemplate?: string;
        urlCustomParameters?: Array<{
            key: string;
            value: string;
        }>;
    }>): Promise<any>;
    /**
     * Add negative keywords
     */
    addNegativeKeywords(customerId: string, campaignId: string, keywords: Array<{
        text: string;
        matchType: string;
    }>): Promise<any>;
    /**
     * Create campaign with full configuration
     */
    createCampaign(customerId: string, name: string, budgetId: string, campaignType: string, status?: string, options?: {
        targetGoogleSearch?: boolean;
        targetSearchNetwork?: boolean;
        targetContentNetwork?: boolean;
        targetPartnerSearchNetwork?: boolean;
        startDate?: string;
        endDate?: string;
        trackingTemplate?: string;
        finalUrlSuffix?: string;
    }): Promise<any>;
    /**
     * Create portfolio bidding strategy
     */
    createBiddingStrategy(customerId: string, name: string, type: 'TARGET_CPA' | 'TARGET_ROAS' | 'MAXIMIZE_CONVERSIONS' | 'MAXIMIZE_CONVERSION_VALUE', targetValue?: number): Promise<any>;
    /**
     * Update bidding strategy
     */
    updateBiddingStrategy(customerId: string, strategyId: string, targetValue: number): Promise<any>;
    /**
     * Set ad group CPC bid
     */
    setAdGroupCpcBid(customerId: string, adGroupId: string, cpcBidMicros: number): Promise<any>;
    /**
     * Create sitelink extensions
     */
    createSitelinkExtensions(customerId: string, sitelinks: Array<{
        linkText: string;
        finalUrls: string[];
        description1?: string;
        description2?: string;
    }>): Promise<any>;
    /**
     * Update sitelink extension
     */
    updateSitelinkExtension(customerId: string, assetId: string, updates: {
        linkText?: string;
        finalUrls?: string[];
        description1?: string;
        description2?: string;
    }): Promise<any>;
    /**
     * Create callout extensions
     */
    createCalloutExtensions(customerId: string, callouts: Array<{
        calloutText: string;
    }>): Promise<any>;
    /**
     * Update callout extension
     */
    updateCalloutExtension(customerId: string, assetId: string, calloutText: string): Promise<any>;
    /**
     * Update keyword (change match type, status, or bid)
     */
    updateKeyword(customerId: string, keywordResourceName: string, updates: {
        matchType?: string;
        status?: string;
        cpcBidMicros?: number;
        finalUrls?: string[];
        trackingUrlTemplate?: string;
        urlCustomParameters?: Array<{
            key: string;
            value: string;
        }>;
    }): Promise<any>;
    /**
     * List keywords with details (for selection in update operations)
     */
    listKeywords(customerId: string, adGroupId?: string, campaignId?: string): Promise<any[]>;
    /**
     * List labels for a customer
     */
    listLabels(customerId: string): Promise<any[]>;
    /**
     * Create label
     */
    createLabel(customerId: string, name: string, description?: string): Promise<any>;
    /**
     * Remove (delete) label
     */
    removeLabel(customerId: string, labelId: string): Promise<any>;
    /**
     * Apply label to campaign
     */
    applyCampaignLabel(customerId: string, campaignId: string, labelId: string): Promise<any>;
    /**
     * Apply label to ad group
     */
    applyAdGroupLabel(customerId: string, adGroupId: string, labelId: string): Promise<any>;
    /**
     * Apply label to keyword (ad group criterion)
     */
    applyKeywordLabel(customerId: string, criterionId: string, labelId: string): Promise<any>;
}
/**
 * Get Google Ads client instance
 */
export declare function getGoogleAdsClient(): GoogleAdsClient;
/**
 * Initialize Google Ads client
 */
export declare function initializeGoogleAdsClient(clientId: string, clientSecret: string, developerToken: string, refreshToken: string): GoogleAdsClient;
/**
 * Create Google Ads client from refresh token (per-request)
 */
export declare function createGoogleAdsClientFromRefreshToken(refreshToken: string, developerToken: string): GoogleAdsClient;
//# sourceMappingURL=client.d.ts.map