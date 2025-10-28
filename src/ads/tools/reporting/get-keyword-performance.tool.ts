/**
 * Get Keyword Performance Tool
 *
 * MCP tool for retrieving detailed keyword-level performance metrics.
 */

import { GetKeywordPerformanceSchema } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';

const logger = getLogger('ads.tools.reporting.get-keyword-performance');

/**
 * Get keyword performance
 */
export const getKeywordPerformanceTool = {
  name: 'get_keyword_performance',
  description: `Get detailed keyword-level performance metrics including Quality Scores.

💡 AGENT GUIDANCE - KEYWORD OPTIMIZATION:
- Quality Score is critical - low scores (< 5) need attention
- Higher Quality Scores = lower costs and better ad positions
- Use this to identify underperforming keywords for optimization or removal

📊 METRICS RETURNED:
- Keyword text and match type
- Quality Score (1-10 scale, 10 is best)
- Quality Score components: Expected CTR, Ad Relevance, Landing Page Experience
- Performance: Impressions, clicks, cost, conversions
- Current CPC bid

🎯 OPTIMIZATION OPPORTUNITIES:
- Keywords with QS < 5 → Consider pausing or improving
- High cost + low conversions → Reduce bids or pause
- High impressions + low clicks → Improve ad copy relevance
- High clicks + low conversions → Landing page issue

⚠️ QUALITY SCORE INTERPRETATION:
- 8-10: Excellent - maintain and expand
- 6-7: Good - minor improvements possible
- 4-5: Poor - needs attention or pause
- 1-3: Very Poor - pause immediately or fix major issues

💡 IMPROVEMENT ACTIONS:
- Low Expected CTR → Improve ad copy relevance to keyword
- Low Ad Relevance → Better match between keyword and ad
- Low Landing Page Experience → Improve page content/speed/relevance`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Specific campaign ID (optional - returns all keywords if omitted)',
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
      GetKeywordPerformanceSchema.parse(input);

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

      logger.info('Getting keyword performance', { customerId, campaignId });

      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const keywords = await client.getKeywordPerformance(customerId, campaignId, dateRange);

      return {
        success: true,
        data: {
          customerId,
          campaignId: campaignId || 'all',
          dateRange: dateRange || 'all time',
          keywords,
          count: keywords.length,
          message: `Retrieved performance data for ${keywords.length} keyword(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to get keyword performance', error as Error);
      throw error;
    }
  },
};
