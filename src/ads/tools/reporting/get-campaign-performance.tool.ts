/**
 * Get Campaign Performance Tool
 *
 * MCP tool for retrieving detailed performance metrics for campaigns.
 */

import { GetCampaignPerformanceSchema, microsToAmount } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';

const logger = getLogger('ads.tools.reporting.get-campaign-performance');

/**
 * Get campaign performance
 */
export const getCampaignPerformanceTool = {
  name: 'get_campaign_performance',
  description: `Get detailed performance metrics for campaigns.

💡 AGENT GUIDANCE - PERFORMANCE ANALYSIS:
- This is your primary tool for understanding campaign success
- Use date ranges to analyze specific periods
- Compare metrics against goals to identify issues

📊 METRICS RETURNED:
- Impressions (how often ads shown)
- Clicks (ad engagements)
- CTR (Click-through rate)
- Cost (total spend)
- Conversions (goal completions)
- Cost per Conversion
- Conversion Rate
- ROAS (Return on Ad Spend)

🎯 USE CASES:
- "How is campaign X performing this month?"
- "Which campaigns have the best ROAS?"
- "Show me cost per conversion trends"
- "Compare week-over-week performance"

⚠️ INTERPRETATION TIPS:
- High impressions + low CTR = ad relevance issue
- High clicks + low conversions = landing page or targeting issue
- High cost per conversion = bidding or targeting needs optimization
- Check if ROAS meets target (typically >4.0 is good for most businesses)`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Specific campaign ID (optional - returns all campaigns if omitted)',
      },
      startDate: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format (optional)',
      },
      endDate: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format (optional)',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      GetCampaignPerformanceSchema.parse(input);

      const { customerId, campaignId, startDate, endDate } = input;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      logger.info('Getting campaign performance', { customerId, campaignId });

      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const performance = await client.getCampaignPerformance(customerId, campaignId, dateRange);

      // Process results to include dollar amounts
      const processed = performance.map((p: any) => ({
        ...p,
        cost: p.campaign?.metrics?.cost_micros
          ? microsToAmount(p.campaign.metrics.cost_micros)
          : '$0.00',
        averageCpc: p.campaign?.metrics?.average_cpc
          ? microsToAmount(p.campaign.metrics.average_cpc)
          : '$0.00',
      }));

      return {
        success: true,
        data: {
          customerId,
          campaignId: campaignId || 'all',
          dateRange: dateRange || 'all time',
          campaigns: processed,
          count: processed.length,
          message: `Retrieved performance data for ${processed.length} campaign(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to get campaign performance', error as Error);
      throw error;
    }
  },
};
