/**
 * Google Ads API Client Wrapper
 */

import { GoogleAdsApi, Customer } from 'google-ads-api';
import * as dotenv from 'dotenv';
import { getLogger } from '../shared/logger.js';

dotenv.config();

const logger = getLogger('ads.client');

/**
 * Format Google Ads API error for user-friendly display
 * Google Ads errors have structure: { errors: [{ error_code: {...}, message: "..." }] }
 */
function formatGoogleAdsError(error: any): string {
  // If it's a Google Ads API error with the errors array
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    const firstError = error.errors[0];
    const errorCode = firstError.error_code ? Object.values(firstError.error_code)[0] : 'UNKNOWN';
    const message = firstError.message || 'Unknown error';
    return `${errorCode}: ${message}`;
  }

  // Fallback to standard error message
  return error.message || String(error);
}

/**
 * Google Ads API Client
 */
export class GoogleAdsClient {
  private client: GoogleAdsApi;
  private refreshToken: string;
  private initialized: boolean = false;

  constructor(clientId: string, clientSecret: string, developerToken: string, refreshToken: string) {
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
  async initialize(): Promise<void> {
    try {
      logger.debug('Initializing Google Ads API client');

      // Test connection by listing accessible customers
      await this.listAccessibleAccounts();

      this.initialized = true;
      logger.info('Google Ads API client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google Ads API client', error as Error);
      throw error;
    }
  }

  /**
   * List accessible Google Ads accounts
   */
  async listAccessibleAccounts(): Promise<string[]> {
    try {
      logger.debug('Listing accessible accounts');

      const response = await this.client.listAccessibleCustomers(this.refreshToken);
      const customerResourceNames = response.resource_names || [];

      logger.info('Accessible accounts retrieved', { count: customerResourceNames.length });

      return customerResourceNames;
    } catch (error) {
      logger.error('Failed to list accessible accounts', error as Error);
      throw new Error(`Failed to list Google Ads accounts: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Get customer instance for a specific account
   * @param customerId The customer ID to access
   * @param loginCustomerId Optional manager account ID (required when accessing client accounts)
   */
  getCustomer(customerId: string, loginCustomerId?: string): Customer {
    const config: any = {
      customer_id: customerId,
      refresh_token: this.refreshToken,
    };

    // When accessing client accounts under a manager, set login_customer_id
    // Default to manager account 6625745756 for testing
    const effectiveLoginCustomerId = loginCustomerId || '6625745756';

    // Always set login_customer_id to support client account access
    config.login_customer_id = effectiveLoginCustomerId;

    return this.client.Customer(config);
  }

  /**
   * List campaigns for a customer
   */
  async listCampaigns(customerId: string, loginCustomerId?: string): Promise<any[]> {
    try {
      const customer = this.getCustomer(customerId, loginCustomerId);

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
    } catch (error) {
      logger.error('Failed to list campaigns', error as Error);
      throw new Error(`Failed to list campaigns: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignPerformance(
    customerId: string,
    campaignId?: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any[]> {
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
    } catch (error) {
      logger.error('Failed to get campaign performance', error as Error);
      throw new Error(`Failed to get campaign performance: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Get search terms report
   */
  async getSearchTermsReport(
    customerId: string,
    campaignId?: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any[]> {
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

      const conditions: string[] = [];

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
    } catch (error) {
      logger.error('Failed to get search terms report', error as Error);
      throw new Error(`Failed to get search terms: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * List budgets for a customer
   */
  async listBudgets(customerId: string): Promise<any[]> {
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
    } catch (error) {
      logger.error('Failed to list budgets', error as Error);
      throw new Error(`Failed to list budgets: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Get keyword performance
   */
  async getKeywordPerformance(
    customerId: string,
    campaignId?: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any[]> {
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
    } catch (error) {
      logger.error('Failed to get keyword performance', error as Error);
      throw new Error(`Failed to get keyword performance: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Update campaign status (pause/enable/remove)
   */
  async updateCampaignStatus(customerId: string, campaignId: string, status: string): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Updating campaign status', { customerId, campaignId, status });

      const campaign = {
        resource_name: `customers/${customerId}/campaigns/${campaignId}`,
        status,
      };

      const result = await customer.campaigns.update([campaign as any]);

      logger.info('Campaign status updated', { customerId, campaignId, status });

      return result;
    } catch (error) {
      logger.error('Failed to update campaign status', error as Error);
      throw new Error(`Failed to update campaign status: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Create campaign budget
   */
  async createBudget(customerId: string, name: string, amountMicros: number): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Creating budget', { customerId, name, amountMicros });

      const budget = {
        name,
        amount_micros: amountMicros,
        delivery_method: 'STANDARD',
      };

      const result = await customer.campaignBudgets.create([budget as any]);

      logger.info('Budget created', { customerId, budgetId: result });

      return result;
    } catch (error) {
      logger.error('Failed to create budget', error as Error);
      throw new Error(`Failed to create budget: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Update budget amount
   */
  async updateBudget(customerId: string, budgetId: string, amountMicros: number): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Updating budget', { customerId, budgetId, amountMicros });

      const budget = {
        resource_name: `customers/${customerId}/campaignBudgets/${budgetId}`,
        amount_micros: amountMicros,
      };

      const result = await customer.campaignBudgets.update([budget as any]);

      logger.info('Budget updated', { customerId, budgetId });

      return result;
    } catch (error) {
      logger.error('Failed to update budget', error as Error);
      throw new Error(`Failed to update budget: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Add keywords to ad group
   */
  async addKeywords(
    customerId: string,
    adGroupId: string,
    keywords: Array<{
      text: string;
      matchType: string;
      cpcBidMicros?: number;
      finalUrls?: string[];
      trackingUrlTemplate?: string;
      urlCustomParameters?: Array<{ key: string; value: string }>;
    }>
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Adding keywords', { customerId, adGroupId, count: keywords.length });

      const operations = keywords.map((kw) => {
        const operation: any = {
          ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
          keyword: {
            text: kw.text,
            match_type: kw.matchType,
          },
          status: 'ENABLED',
        };

        // Optional CPC bid
        if (kw.cpcBidMicros) {
          operation.cpc_bid_micros = kw.cpcBidMicros;
        }

        // NEW: Final URLs (keyword-specific landing pages)
        if (kw.finalUrls && kw.finalUrls.length > 0) {
          operation.final_urls = kw.finalUrls;
        }

        // NEW: Tracking template (keyword-level tracking)
        if (kw.trackingUrlTemplate) {
          operation.tracking_url_template = kw.trackingUrlTemplate;
        }

        // NEW: Custom parameters (keyword-level custom data)
        if (kw.urlCustomParameters && kw.urlCustomParameters.length > 0) {
          operation.url_custom_parameters = kw.urlCustomParameters;
        }

        return operation;
      });

      const result = await customer.adGroupCriteria.create(operations as any);

      logger.info('Keywords added', { customerId, adGroupId, count: keywords.length });

      return result;
    } catch (error) {
      logger.error('Failed to add keywords', error as Error);
      throw new Error(`Failed to add keywords: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Add negative keywords
   */
  async addNegativeKeywords(
    customerId: string,
    campaignId: string,
    keywords: Array<{ text: string; matchType: string }>
  ): Promise<any> {
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

      const result = await customer.campaignCriteria.create(operations as any);

      logger.info('Negative keywords added', { customerId, campaignId, count: keywords.length });

      return result;
    } catch (error) {
      logger.error('Failed to add negative keywords', error as Error);
      throw new Error(`Failed to add negative keywords: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Create campaign with full configuration
   */
  async createCampaign(
    customerId: string,
    name: string,
    budgetId: string,
    campaignType: string,
    status: string = 'PAUSED',
    options?: {
      targetGoogleSearch?: boolean;
      targetSearchNetwork?: boolean;
      targetContentNetwork?: boolean;
      targetPartnerSearchNetwork?: boolean;
      startDate?: string;
      endDate?: string;
      trackingTemplate?: string;
      finalUrlSuffix?: string;
    }
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Creating campaign', { customerId, name, campaignType, options });

      const campaign: any = {
        name,
        status,
        campaign_budget: `customers/${customerId}/campaignBudgets/${budgetId}`,
        advertising_channel_type: campaignType,
        // EU Political Advertising declaration (required as of Sept 3, 2025)
        contains_eu_political_advertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
        // Manual CPC bidding strategy (default)
        manual_cpc: {
          enhanced_cpc_enabled: false
        },
        // Network settings - use provided values or smart defaults
        network_settings: {
          target_google_search: options?.targetGoogleSearch ?? true,
          target_search_network: options?.targetSearchNetwork ?? false,
          target_content_network: options?.targetContentNetwork ?? (campaignType === 'DISPLAY'),
          target_partner_search_network: options?.targetPartnerSearchNetwork ?? false
        }
      };

      // Add dates if provided
      if (options?.startDate) {
        // Convert YYYY-MM-DD to YYYYMMDD
        campaign.start_date = options.startDate.replace(/-/g, '');
      }
      if (options?.endDate) {
        campaign.end_date = options.endDate.replace(/-/g, '');
      }

      // Add tracking if provided
      if (options?.trackingTemplate) {
        campaign.tracking_url_template = options.trackingTemplate;
      }
      if (options?.finalUrlSuffix) {
        campaign.final_url_suffix = options.finalUrlSuffix;
      }

      const result = await customer.campaigns.create([campaign]);

      logger.info('Campaign created', { customerId, campaignId: result });

      return result;
    } catch (error) {
      logger.error('Failed to create campaign', error as Error);
      throw new Error(`Failed to create campaign: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Create portfolio bidding strategy
   */
  async createBiddingStrategy(
    customerId: string,
    name: string,
    type: 'TARGET_CPA' | 'TARGET_ROAS' | 'MAXIMIZE_CONVERSIONS' | 'MAXIMIZE_CONVERSION_VALUE',
    targetValue?: number // CPA in micros or ROAS as decimal
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Creating bidding strategy', { customerId, name, type });

      const strategy: any = {
        name,
        type,
        status: 'ENABLED',
      };

      // Add target values based on type
      if (type === 'TARGET_CPA' && targetValue) {
        strategy.target_cpa = {
          target_cpa_micros: targetValue,
        };
      } else if (type === 'TARGET_ROAS' && targetValue) {
        strategy.target_roas = {
          target_roas: targetValue,
        };
      }

      const result = await customer.biddingStrategies.create([strategy]);

      logger.info('Bidding strategy created', { customerId, strategyId: result });

      return result;
    } catch (error) {
      logger.error('Failed to create bidding strategy', error as Error);
      throw new Error(`Failed to create bidding strategy: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Update bidding strategy
   */
  async updateBiddingStrategy(
    customerId: string,
    strategyId: string,
    targetValue: number // CPA in micros or ROAS as decimal
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Updating bidding strategy', { customerId, strategyId });

      // First get current strategy to determine type
      const strategies = await customer.query(`
        SELECT
          bidding_strategy.id,
          bidding_strategy.type
        FROM bidding_strategy
        WHERE bidding_strategy.id = ${strategyId}
      `);

      if (!strategies || strategies.length === 0) {
        throw new Error(`Bidding strategy ${strategyId} not found`);
      }

      const strategyType = strategies[0]?.bidding_strategy?.type;

      const update: any = {
        resource_name: `customers/${customerId}/biddingStrategies/${strategyId}`,
      };

      if (strategyType === 'TARGET_CPA') {
        update.target_cpa = {
          target_cpa_micros: targetValue,
        };
      } else if (strategyType === 'TARGET_ROAS') {
        update.target_roas = {
          target_roas: targetValue,
        };
      } else {
        throw new Error(`Cannot update target for strategy type ${strategyType}`);
      }

      const result = await customer.biddingStrategies.update([update]);

      logger.info('Bidding strategy updated', { customerId, strategyId });

      return result;
    } catch (error) {
      logger.error('Failed to update bidding strategy', error as Error);
      throw new Error(`Failed to update bidding strategy: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Set ad group CPC bid
   */
  async setAdGroupCpcBid(
    customerId: string,
    adGroupId: string,
    cpcBidMicros: number
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Setting ad group CPC bid', { customerId, adGroupId, cpcBidMicros });

      const update = {
        resource_name: `customers/${customerId}/adGroups/${adGroupId}`,
        cpc_bid_micros: cpcBidMicros,
      };

      const result = await customer.adGroups.update([update]);

      logger.info('Ad group CPC bid updated', { customerId, adGroupId });

      return result;
    } catch (error) {
      logger.error('Failed to set ad group CPC bid', error as Error);
      throw new Error(`Failed to set ad group CPC bid: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Create sitelink extensions
   */
  async createSitelinkExtensions(
    customerId: string,
    sitelinks: Array<{
      linkText: string;
      finalUrls: string[];
      description1?: string;
      description2?: string;
    }>
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Creating sitelink extensions', { customerId, count: sitelinks.length });

      const operations = sitelinks.map((sitelink) => ({
        type: 'SITELINK',
        sitelink_asset: {
          link_text: sitelink.linkText,
          description1: sitelink.description1 || '',
          description2: sitelink.description2 || '',
        },
        final_urls: sitelink.finalUrls,
      }));

      const result = await customer.assets.create(operations as any);

      logger.info('Sitelink extensions created', { customerId, count: sitelinks.length });

      return result;
    } catch (error) {
      logger.error('Failed to create sitelink extensions', error as Error);
      throw new Error(`Failed to create sitelink extensions: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Update sitelink extension
   */
  async updateSitelinkExtension(
    customerId: string,
    assetId: string,
    updates: {
      linkText?: string;
      finalUrls?: string[];
      description1?: string;
      description2?: string;
    }
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Updating sitelink extension', { customerId, assetId });

      const operation: any = {
        resource_name: `customers/${customerId}/assets/${assetId}`,
      };

      if (updates.linkText || updates.description1 || updates.description2) {
        operation.sitelink_asset = {};
        if (updates.linkText) operation.sitelink_asset.link_text = updates.linkText;
        if (updates.description1) operation.sitelink_asset.description1 = updates.description1;
        if (updates.description2) operation.sitelink_asset.description2 = updates.description2;
      }

      if (updates.finalUrls) {
        operation.final_urls = updates.finalUrls;
      }

      const result = await customer.assets.update([operation]);

      logger.info('Sitelink extension updated', { customerId, assetId });

      return result;
    } catch (error) {
      logger.error('Failed to update sitelink extension', error as Error);
      throw new Error(`Failed to update sitelink extension: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Create callout extensions
   */
  async createCalloutExtensions(
    customerId: string,
    callouts: Array<{ calloutText: string }>
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Creating callout extensions', { customerId, count: callouts.length });

      const operations = callouts.map((callout) => ({
        type: 'CALLOUT',
        callout_asset: {
          callout_text: callout.calloutText,
        },
      }));

      const result = await customer.assets.create(operations as any);

      logger.info('Callout extensions created', { customerId, count: callouts.length });

      return result;
    } catch (error) {
      logger.error('Failed to create callout extensions', error as Error);
      throw new Error(`Failed to create callout extensions: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Update callout extension
   */
  async updateCalloutExtension(
    customerId: string,
    assetId: string,
    calloutText: string
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Updating callout extension', { customerId, assetId });

      const operation = {
        resource_name: `customers/${customerId}/assets/${assetId}`,
        callout_asset: {
          callout_text: calloutText,
        },
      };

      const result = await customer.assets.update([operation]);

      logger.info('Callout extension updated', { customerId, assetId });

      return result;
    } catch (error) {
      logger.error('Failed to update callout extension', error as Error);
      throw new Error(`Failed to update callout extension: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Update keyword (change match type, status, or bid)
   */
  async updateKeyword(
    customerId: string,
    keywordResourceName: string,
    updates: {
      matchType?: string;
      status?: string;
      cpcBidMicros?: number;
    }
  ): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Updating keyword', { customerId, keywordResourceName, updates });

      const operation: any = {
        resource_name: keywordResourceName,
      };

      if (updates.matchType !== undefined) {
        operation.keyword = {
          match_type: updates.matchType,
        };
      }

      if (updates.status !== undefined) {
        operation.status = updates.status;
      }

      if (updates.cpcBidMicros !== undefined) {
        operation.cpc_bid_micros = updates.cpcBidMicros;
      }

      const result = await customer.adGroupCriteria.update([operation]);

      logger.info('Keyword updated', { customerId, keywordResourceName });

      return result;
    } catch (error) {
      logger.error('Failed to update keyword', error as Error);
      throw new Error(`Failed to update keyword: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * List keywords with details (for selection in update operations)
   */
  async listKeywords(
    customerId: string,
    adGroupId?: string,
    campaignId?: string
  ): Promise<any[]> {
    try {
      const customer = this.getCustomer(customerId);

      logger.debug('Listing keywords', { customerId, adGroupId, campaignId });

      let query = `
        SELECT
          ad_group_criterion.resource_name,
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.cpc_bid_micros,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name
        FROM keyword_view
        WHERE ad_group_criterion.type = 'KEYWORD'
      `;

      if (campaignId) {
        query += ` AND campaign.id = ${campaignId}`;
      }

      if (adGroupId) {
        query += ` AND ad_group.id = ${adGroupId}`;
      }

      query += ' ORDER BY ad_group_criterion.keyword.text';

      const results = await customer.query(query);

      logger.info('Keywords retrieved', { customerId, count: results.length });

      return results;
    } catch (error) {
      logger.error('Failed to list keywords', error as Error);
      throw new Error(`Failed to list keywords: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * List labels for a customer
   */
  async listLabels(customerId: string): Promise<any[]> {
    try {
      const customer = this.getCustomer(customerId);

      logger.debug('Listing labels', { customerId });

      const labels = await customer.query(`
        SELECT
          label.id,
          label.name,
          label.resource_name,
          label.status
        FROM label
        ORDER BY label.name
      `);

      logger.info('Labels retrieved', { customerId, count: labels.length });

      return labels;
    } catch (error) {
      logger.error('Failed to list labels', error as Error);
      throw new Error(`Failed to list labels: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Create label
   */
  async createLabel(customerId: string, name: string, description?: string): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Creating label', { customerId, name });

      const label = {
        name,
        status: 'ENABLED',
        ...(description && { description }),
      };

      const result = await customer.labels.create([label as any]);

      logger.info('Label created', { customerId, labelId: result });

      return result;
    } catch (error) {
      logger.error('Failed to create label', error as Error);
      throw new Error(`Failed to create label: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Remove (delete) label
   */
  async removeLabel(customerId: string, labelId: string): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Removing label', { customerId, labelId });

      const resourceName = `customers/${customerId}/labels/${labelId}`;
      const result = await customer.labels.remove([resourceName]);

      logger.info('Label removed', { customerId, labelId });

      return result;
    } catch (error) {
      logger.error('Failed to remove label', error as Error);
      throw new Error(`Failed to remove label: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Apply label to campaign
   */
  async applyCampaignLabel(customerId: string, campaignId: string, labelId: string): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Applying label to campaign', { customerId, campaignId, labelId });

      const campaignLabel = {
        campaign: `customers/${customerId}/campaigns/${campaignId}`,
        label: `customers/${customerId}/labels/${labelId}`,
      };

      const result = await customer.campaignLabels.create([campaignLabel as any]);

      logger.info('Label applied to campaign', { customerId, campaignId, labelId });

      return result;
    } catch (error) {
      logger.error('Failed to apply label to campaign', error as Error);
      throw new Error(`Failed to apply label to campaign: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Apply label to ad group
   */
  async applyAdGroupLabel(customerId: string, adGroupId: string, labelId: string): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Applying label to ad group', { customerId, adGroupId, labelId });

      const adGroupLabel = {
        ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
        label: `customers/${customerId}/labels/${labelId}`,
      };

      const result = await customer.adGroupLabels.create([adGroupLabel as any]);

      logger.info('Label applied to ad group', { customerId, adGroupId, labelId });

      return result;
    } catch (error) {
      logger.error('Failed to apply label to ad group', error as Error);
      throw new Error(`Failed to apply label to ad group: ${formatGoogleAdsError(error)}`);
    }
  }

  /**
   * Apply label to keyword (ad group criterion)
   */
  async applyKeywordLabel(customerId: string, criterionId: string, labelId: string): Promise<any> {
    try {
      const customer = this.getCustomer(customerId);

      logger.info('Applying label to keyword', { customerId, criterionId, labelId });

      const criterionLabel = {
        ad_group_criterion: `customers/${customerId}/adGroupCriteria/${criterionId}`,
        label: `customers/${customerId}/labels/${labelId}`,
      };

      const result = await customer.adGroupCriterionLabels.create([criterionLabel as any]);

      logger.info('Label applied to keyword', { customerId, criterionId, labelId });

      return result;
    } catch (error) {
      logger.error('Failed to apply label to keyword', error as Error);
      throw new Error(`Failed to apply label to keyword: ${formatGoogleAdsError(error)}`);
    }
  }
}

// Singleton instance
let googleAdsClientInstance: GoogleAdsClient | null = null;

/**
 * Get Google Ads client instance
 */
export function getGoogleAdsClient(): GoogleAdsClient {
  if (!googleAdsClientInstance) {
    throw new Error('Google Ads client not initialized. Call initializeGoogleAdsClient first.');
  }
  return googleAdsClientInstance;
}

/**
 * Initialize Google Ads client
 */
export function initializeGoogleAdsClient(
  clientId: string,
  clientSecret: string,
  developerToken: string,
  refreshToken: string
): GoogleAdsClient {
  googleAdsClientInstance = new GoogleAdsClient(clientId, clientSecret, developerToken, refreshToken);
  logger.info('Google Ads client instance created');
  return googleAdsClientInstance;
}

/**
 * Create Google Ads client from refresh token (per-request)
 */
export function createGoogleAdsClientFromRefreshToken(
  refreshToken: string,
  developerToken: string
): GoogleAdsClient {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  return new GoogleAdsClient(clientId, clientSecret, developerToken, refreshToken);
}
