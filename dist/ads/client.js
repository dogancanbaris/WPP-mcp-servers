/**
 * Google Ads API Client Wrapper
 */
import { GoogleAdsApi } from 'google-ads-api';
import * as dotenv from 'dotenv';
import { getLogger } from '../shared/logger.js';
dotenv.config();
const logger = getLogger('ads.client');
/**
 * Google Ads API Client
 */
export class GoogleAdsClient {
    constructor(clientId, clientSecret, developerToken, refreshToken) {
        this.initialized = false;
        if (!clientId || !clientSecret || !developerToken || !refreshToken) {
            throw new Error('Missing required Google Ads API credentials');
        }
        this.client = new GoogleAdsApi({
            client_id: clientId,
            client_secret: clientSecret,
            developer_token: developerToken,
        });
        this.refreshToken = refreshToken;
        logger.info('Google Ads API client created');
    }
    /**
     * Initialize client and verify connection
     */
    async initialize() {
        try {
            logger.debug('Initializing Google Ads API client');
            // Test connection by listing accessible customers
            await this.listAccessibleAccounts();
            this.initialized = true;
            logger.info('Google Ads API client initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Google Ads API client', error);
            throw error;
        }
    }
    /**
     * List accessible Google Ads accounts
     */
    async listAccessibleAccounts() {
        try {
            logger.debug('Listing accessible accounts');
            const response = await this.client.listAccessibleCustomers(this.refreshToken);
            const customerResourceNames = response.resource_names || [];
            logger.info('Accessible accounts retrieved', { count: customerResourceNames.length });
            return customerResourceNames;
        }
        catch (error) {
            logger.error('Failed to list accessible accounts', error);
            throw new Error(`Failed to list Google Ads accounts: ${error.message}`);
        }
    }
    /**
     * Get customer instance for a specific account
     */
    getCustomer(customerId) {
        return this.client.Customer({
            customer_id: customerId,
            refresh_token: this.refreshToken,
        });
    }
    /**
     * List campaigns for a customer
     */
    async listCampaigns(customerId) {
        try {
            const customer = this.getCustomer(customerId);
            logger.debug('Listing campaigns', { customerId });
            const campaigns = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.start_date,
          campaign.end_date,
          campaign.campaign_budget,
          campaign.bidding_strategy_type,
          campaign.serving_status
        FROM campaign
        ORDER BY campaign.name
      `);
            logger.info('Campaigns retrieved', { customerId, count: campaigns.length });
            return campaigns;
        }
        catch (error) {
            logger.error('Failed to list campaigns', error);
            throw new Error(`Failed to list campaigns: ${error.message}`);
        }
    }
    /**
     * Get campaign performance metrics
     */
    async getCampaignPerformance(customerId, campaignId, dateRange) {
        try {
            const customer = this.getCustomer(customerId);
            logger.debug('Getting campaign performance', { customerId, campaignId });
            let query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.cost_per_conversion,
          metrics.conversion_rate
        FROM campaign
      `;
            if (campaignId) {
                query += ` WHERE campaign.id = ${campaignId}`;
            }
            if (dateRange) {
                const whereClause = campaignId ? ' AND' : ' WHERE';
                query += `${whereClause} segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'`;
            }
            query += ' ORDER BY metrics.impressions DESC';
            const results = await customer.query(query);
            logger.info('Campaign performance retrieved', { customerId, count: results.length });
            return results;
        }
        catch (error) {
            logger.error('Failed to get campaign performance', error);
            throw new Error(`Failed to get campaign performance: ${error.message}`);
        }
    }
    /**
     * Get search terms report
     */
    async getSearchTermsReport(customerId, campaignId, dateRange) {
        try {
            const customer = this.getCustomer(customerId);
            logger.debug('Getting search terms report', { customerId, campaignId });
            let query = `
        SELECT
          search_term_view.search_term,
          search_term_view.status,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          ad_group.id,
          campaign.id,
          campaign.name
        FROM search_term_view
      `;
            const conditions = [];
            if (campaignId) {
                conditions.push(`campaign.id = ${campaignId}`);
            }
            if (dateRange) {
                conditions.push(`segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'`);
            }
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            query += ' ORDER BY metrics.impressions DESC LIMIT 100';
            const results = await customer.query(query);
            logger.info('Search terms report retrieved', { customerId, count: results.length });
            return results;
        }
        catch (error) {
            logger.error('Failed to get search terms report', error);
            throw new Error(`Failed to get search terms: ${error.message}`);
        }
    }
    /**
     * List budgets for a customer
     */
    async listBudgets(customerId) {
        try {
            const customer = this.getCustomer(customerId);
            logger.debug('Listing budgets', { customerId });
            const budgets = await customer.query(`
        SELECT
          campaign_budget.id,
          campaign_budget.name,
          campaign_budget.amount_micros,
          campaign_budget.delivery_method,
          campaign_budget.status,
          campaign_budget.recommended_budget_amount_micros
        FROM campaign_budget
        ORDER BY campaign_budget.name
      `);
            logger.info('Budgets retrieved', { customerId, count: budgets.length });
            return budgets;
        }
        catch (error) {
            logger.error('Failed to list budgets', error);
            throw new Error(`Failed to list budgets: ${error.message}`);
        }
    }
    /**
     * Get keyword performance
     */
    async getKeywordPerformance(customerId, campaignId, dateRange) {
        try {
            const customer = this.getCustomer(customerId);
            logger.debug('Getting keyword performance', { customerId, campaignId });
            let query = `
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.quality_info.creative_quality_score,
          ad_group_criterion.quality_info.post_click_quality_score,
          ad_group_criterion.quality_info.search_predicted_ctr,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          campaign.id,
          campaign.name,
          ad_group.id,
          ad_group.name
        FROM keyword_view
        WHERE ad_group_criterion.type = 'KEYWORD'
      `;
            if (campaignId) {
                query += ` AND campaign.id = ${campaignId}`;
            }
            if (dateRange) {
                query += ` AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'`;
            }
            query += ' ORDER BY metrics.impressions DESC LIMIT 500';
            const results = await customer.query(query);
            logger.info('Keyword performance retrieved', { customerId, count: results.length });
            return results;
        }
        catch (error) {
            logger.error('Failed to get keyword performance', error);
            throw new Error(`Failed to get keyword performance: ${error.message}`);
        }
    }
    /**
     * Check if client is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Update campaign status (pause/enable/remove)
     */
    async updateCampaignStatus(customerId, campaignId, status) {
        try {
            const customer = this.getCustomer(customerId);
            logger.info('Updating campaign status', { customerId, campaignId, status });
            const campaign = {
                resource_name: `customers/${customerId}/campaigns/${campaignId}`,
                status,
            };
            const result = await customer.campaigns.update([campaign]);
            logger.info('Campaign status updated', { customerId, campaignId, status });
            return result;
        }
        catch (error) {
            logger.error('Failed to update campaign status', error);
            throw new Error(`Failed to update campaign status: ${error.message}`);
        }
    }
    /**
     * Create campaign budget
     */
    async createBudget(customerId, name, amountMicros) {
        try {
            const customer = this.getCustomer(customerId);
            logger.info('Creating budget', { customerId, name, amountMicros });
            const budget = {
                name,
                amount_micros: amountMicros,
                delivery_method: 'STANDARD',
            };
            const result = await customer.campaignBudgets.create([budget]);
            logger.info('Budget created', { customerId, budgetId: result });
            return result;
        }
        catch (error) {
            logger.error('Failed to create budget', error);
            throw new Error(`Failed to create budget: ${error.message}`);
        }
    }
    /**
     * Update budget amount
     */
    async updateBudget(customerId, budgetId, amountMicros) {
        try {
            const customer = this.getCustomer(customerId);
            logger.info('Updating budget', { customerId, budgetId, amountMicros });
            const budget = {
                resource_name: `customers/${customerId}/campaignBudgets/${budgetId}`,
                amount_micros: amountMicros,
            };
            const result = await customer.campaignBudgets.update([budget]);
            logger.info('Budget updated', { customerId, budgetId });
            return result;
        }
        catch (error) {
            logger.error('Failed to update budget', error);
            throw new Error(`Failed to update budget: ${error.message}`);
        }
    }
    /**
     * Add keywords to ad group
     */
    async addKeywords(customerId, adGroupId, keywords) {
        try {
            const customer = this.getCustomer(customerId);
            logger.info('Adding keywords', { customerId, adGroupId, count: keywords.length });
            const operations = keywords.map((kw) => ({
                ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
                keyword: {
                    text: kw.text,
                    match_type: kw.matchType,
                },
                cpc_bid_micros: kw.cpcBidMicros,
                status: 'ENABLED',
            }));
            const result = await customer.adGroupCriteria.create(operations);
            logger.info('Keywords added', { customerId, adGroupId, count: keywords.length });
            return result;
        }
        catch (error) {
            logger.error('Failed to add keywords', error);
            throw new Error(`Failed to add keywords: ${error.message}`);
        }
    }
    /**
     * Add negative keywords
     */
    async addNegativeKeywords(customerId, campaignId, keywords) {
        try {
            const customer = this.getCustomer(customerId);
            logger.info('Adding negative keywords', { customerId, campaignId, count: keywords.length });
            const operations = keywords.map((kw) => ({
                campaign: `customers/${customerId}/campaigns/${campaignId}`,
                keyword: {
                    text: kw.text,
                    match_type: kw.matchType,
                },
                negative: true,
            }));
            const result = await customer.campaignCriteria.create(operations);
            logger.info('Negative keywords added', { customerId, campaignId, count: keywords.length });
            return result;
        }
        catch (error) {
            logger.error('Failed to add negative keywords', error);
            throw new Error(`Failed to add negative keywords: ${error.message}`);
        }
    }
    /**
     * Create campaign
     */
    async createCampaign(customerId, name, budgetId, campaignType, status = 'PAUSED') {
        try {
            const customer = this.getCustomer(customerId);
            logger.info('Creating campaign', { customerId, name, campaignType });
            const campaign = {
                name,
                status,
                campaign_budget: `customers/${customerId}/campaignBudgets/${budgetId}`,
                advertising_channel_type: campaignType,
                bidding_strategy_type: 'MANUAL_CPC',
            };
            const result = await customer.campaigns.create([campaign]);
            logger.info('Campaign created', { customerId, campaignId: result });
            return result;
        }
        catch (error) {
            logger.error('Failed to create campaign', error);
            throw new Error(`Failed to create campaign: ${error.message}`);
        }
    }
}
// Singleton instance
let googleAdsClientInstance = null;
/**
 * Get Google Ads client instance
 */
export function getGoogleAdsClient() {
    if (!googleAdsClientInstance) {
        throw new Error('Google Ads client not initialized. Call initializeGoogleAdsClient first.');
    }
    return googleAdsClientInstance;
}
/**
 * Initialize Google Ads client
 */
export function initializeGoogleAdsClient(clientId, clientSecret, developerToken, refreshToken) {
    googleAdsClientInstance = new GoogleAdsClient(clientId, clientSecret, developerToken, refreshToken);
    logger.info('Google Ads client instance created');
    return googleAdsClientInstance;
}
/**
 * Create Google Ads client from refresh token (per-request)
 */
export function createGoogleAdsClientFromRefreshToken(refreshToken, developerToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    return new GoogleAdsClient(clientId, clientSecret, developerToken, refreshToken);
}
//# sourceMappingURL=client.js.map