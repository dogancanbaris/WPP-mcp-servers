/**
 * Get Search Terms Report Tool
 *
 * MCP tool for retrieving actual search queries that triggered ads.
 */

import { GetSearchTermsSchema } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';

const logger = getLogger('ads.tools.reporting.get-search-terms');

/**
 * Get search terms report
 */
export const getSearchTermsReportTool = {
  name: 'get_search_terms_report',
  description: `Get actual search queries that triggered your ads.

💡 AGENT GUIDANCE - GOLDMINE FOR OPTIMIZATION:
- This shows the ACTUAL words people typed to trigger your ads
- Critical for finding irrelevant queries (add as negatives)
- Discover new keyword opportunities
- Understand user intent and search behavior

📊 WHAT YOU'LL GET:
- Search query text (exact words users typed)
- Match type that triggered (EXACT, PHRASE, BROAD)
- Performance metrics per query
- Status (added, excluded, etc.)

🎯 KEY USE CASES:
- "What searches are wasting money?" → Add negatives
- "What searches convert well?" → Add as keywords
- "Are BROAD match keywords too broad?" → Review queries
- "What's the user intent?" → Improve ad copy/landing pages

⚠️ COMMON FINDINGS & ACTIONS:
- Irrelevant queries with spend → Add as negative keywords
- High-converting queries not in keyword list → Add as keywords
- Different user intent than expected → Adjust targeting or ad copy
- Brand misspellings → Add as exact/phrase match keywords

💡 BEST PRACTICE WORKFLOW:
1. Run this report weekly
2. Sort by cost (find expensive irrelevant queries)
3. Add negatives for irrelevant queries
4. Add high-performers as keywords
5. Monitor changes`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Specific campaign ID (optional)',
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
      GetSearchTermsSchema.parse(input);

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

      logger.info('Getting search terms report', { customerId, campaignId });

      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const searchTerms = await client.getSearchTermsReport(customerId, campaignId, dateRange);

      return {
        success: true,
        data: {
          customerId,
          campaignId: campaignId || 'all',
          dateRange: dateRange || 'recent',
          searchTerms,
          count: searchTerms.length,
          message: `Retrieved ${searchTerms.length} search query term(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to get search terms report', error as Error);
      throw error;
    }
  },
};
