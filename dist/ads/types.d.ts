/**
 * Type definitions for Google Ads API
 */
/**
 * Google Ads customer account
 */
export interface GoogleAdsAccount {
    customerId: string;
    resourceName: string;
    descriptiveName?: string;
    currencyCode?: string;
    timeZone?: string;
    isManager?: boolean;
}
/**
 * Campaign status
 */
export type CampaignStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';
/**
 * Campaign type
 */
export type CampaignType = 'SEARCH' | 'DISPLAY' | 'SHOPPING' | 'VIDEO' | 'MULTI_CHANNEL' | 'HOTEL' | 'LOCAL' | 'SMART' | 'PERFORMANCE_MAX' | 'DEMAND_GEN';
/**
 * Bidding strategy type
 */
export type BiddingStrategyType = 'MANUAL_CPC' | 'MANUAL_CPM' | 'MANUAL_CPV' | 'MAXIMIZE_CONVERSIONS' | 'MAXIMIZE_CONVERSION_VALUE' | 'TARGET_CPA' | 'TARGET_ROAS' | 'TARGET_SPEND' | 'TARGET_IMPRESSION_SHARE';
/**
 * Keyword match type
 */
export type KeywordMatchType = 'EXACT' | 'PHRASE' | 'BROAD';
/**
 * Ad status
 */
export type AdStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';
/**
 * Campaign information
 */
export interface Campaign {
    id: string;
    resourceName: string;
    name: string;
    status: CampaignStatus;
    campaignType: CampaignType;
    startDate?: string;
    endDate?: string;
    budget?: string;
    biddingStrategy?: string;
    servingStatus?: string;
}
/**
 * Campaign performance metrics
 */
export interface CampaignPerformance extends Campaign {
    impressions: number;
    clicks: number;
    ctr: number;
    averageCpc: number;
    cost: number;
    conversions: number;
    conversionValue: number;
    costPerConversion: number;
    conversionRate: number;
    roas?: number;
}
/**
 * Budget information
 */
export interface Budget {
    id: string;
    resourceName: string;
    name: string;
    amountMicros: number;
    deliveryMethod?: string;
    status?: string;
    recommendedBudgetAmountMicros?: number;
}
/**
 * Keyword information
 */
export interface Keyword {
    id: string;
    resourceName: string;
    adGroupId: string;
    text: string;
    matchType: KeywordMatchType;
    status: string;
    cpcBidMicros?: number;
    qualityScore?: number;
}
/**
 * Keyword performance
 */
export interface KeywordPerformance extends Keyword {
    impressions: number;
    clicks: number;
    ctr: number;
    averageCpc: number;
    cost: number;
    conversions: number;
    costPerConversion: number;
    qualityScore: number;
    expectedCtr?: string;
    adRelevance?: string;
    landingPageExperience?: string;
}
/**
 * Ad information
 */
export interface Ad {
    id: string;
    resourceName: string;
    adGroupId: string;
    type: string;
    status: AdStatus;
    finalUrls?: string[];
}
/**
 * Responsive Search Ad
 */
export interface ResponsiveSearchAd extends Ad {
    headlines: Array<{
        text: string;
        pinnedField?: string;
    }>;
    descriptions: Array<{
        text: string;
        pinnedField?: string;
    }>;
    path1?: string;
    path2?: string;
}
/**
 * Search term (query) information
 */
export interface SearchTerm {
    query: string;
    matchType: string;
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
    conversions: number;
    status?: string;
}
/**
 * Experiment information
 */
export interface Experiment {
    id: string;
    resourceName: string;
    name: string;
    description?: string;
    status: string;
    type: string;
    startDate?: string;
    endDate?: string;
    trafficSplitPercent?: number;
}
/**
 * Date range for reports
 */
export interface DateRange {
    startDate: string;
    endDate: string;
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    impressions?: number;
    clicks?: number;
    ctr?: number;
    averageCpc?: number;
    cost?: number;
    conversions?: number;
    conversionValue?: number;
    costPerConversion?: number;
    conversionRate?: number;
    averagePosition?: number;
    impressionShare?: number;
    qualityScore?: number;
}
/**
 * Tool execution result for Google Ads
 */
export interface AdsToolResult {
    success: boolean;
    data?: any;
    warning?: string[];
    error?: string;
    spendImpact?: {
        current: number;
        new: number;
        dailyDifference: number;
        monthlyEstimate: number;
        percentageChange: number;
    };
}
//# sourceMappingURL=types.d.ts.map