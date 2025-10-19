/**
 * MCP Tools for Google Ads Bidding Strategies
 * Includes: BiddingStrategyService, BiddingSeasonalityAdjustmentService
 */

import { getGoogleAdsClient } from '../client.js';
import { getLogger } from '../../shared/logger.js';

const logger = getLogger('ads.tools.bidding');

/**
 * List bidding strategies
 */
export const listBiddingStrategiesTool = {
  name: 'list_bidding_strategies',
  description: `List all portfolio bidding strategies in account.

💡 AGENT GUIDANCE:

📊 PORTFOLIO BIDDING STRATEGIES:
- Shared strategies used across multiple campaigns
- Automated bidding: Target CPA, Target ROAS, Maximize Conversions
- Manual bidding: Manual CPC with enhanced CPC

🎯 USE CASES:
- "Show all Target CPA strategies"
- "Which campaigns use this bidding strategy?"
- "What's the target CPA for our main strategy?"`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      const { customerId } = input;

      const client = getGoogleAdsClient();

      logger.info('Listing bidding strategies', { customerId });

      const query = `
        SELECT
          bidding_strategy.id,
          bidding_strategy.name,
          bidding_strategy.type,
          bidding_strategy.campaign_count,
          bidding_strategy.target_cpa.target_cpa_micros,
          bidding_strategy.target_roas.target_roas,
          bidding_strategy.status
        FROM bidding_strategy
        WHERE bidding_strategy.status != 'REMOVED'
        ORDER BY bidding_strategy.name
      `;

      const customer = client.getCustomer(customerId);
      const results = await customer.query(query);

      const strategies = [];

      for (const row of results) {
        const strategy = row.bidding_strategy;
        strategies.push({
          id: String(strategy?.id || ''),
          name: String(strategy?.name || ''),
          type: String(strategy?.type || ''),
          campaignCount: parseInt(String(strategy?.campaign_count || 0)),
          targetCpa: strategy?.target_cpa?.target_cpa_micros
            ? parseFloat(String(strategy.target_cpa.target_cpa_micros)) / 1000000
            : undefined,
          targetRoas: strategy?.target_roas?.target_roas
            ? parseFloat(String(strategy.target_roas.target_roas))
            : undefined,
          status: String(strategy?.status || ''),
        });
      }

      return {
        success: true,
        data: {
          customerId,
          strategies,
          count: strategies.length,
          message: `Found ${strategies.length} bidding strateg(ies)`,
        },
      };
    } catch (error) {
      logger.error('Failed to list bidding strategies', error as Error);
      throw error;
    }
  },
};

/**
 * Export bidding tools
 */
export const biddingTools = [listBiddingStrategiesTool];
