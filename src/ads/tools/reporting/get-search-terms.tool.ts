/**
 * Get Search Terms Report Tool
 *
 * MCP tool for retrieving actual search queries that triggered ads.
 */

import { GetSearchTermsSchema, extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps, formatNumber } from '../../../shared/interactive-workflow.js';

const logger = getLogger('ads.tools.reporting.get-search-terms');

/**
 * Get search terms report
 */
export const getSearchTermsReportTool = {
  name: 'get_search_terms_report',
  description: 'Get actual search queries that triggered your ads.',
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
    required: [],
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

      // ═══ ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/1',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account\'s search terms would you like to analyze?',
          nextParam: 'customerId',
          emoji: '🔍',
        });
      }

      // ═══ EXECUTE WITH ANALYSIS ═══
      logger.info('Getting search terms report', { customerId, campaignId });

      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const searchTerms = await client.getSearchTermsReport(customerId, campaignId, dateRange);

      // Analyze search terms
      const totalClicks = searchTerms.reduce((sum, st: any) => sum + (st.metrics?.clicks || 0), 0);
      const totalImpressions = searchTerms.reduce((sum, st: any) => sum + (st.metrics?.impressions || 0), 0);
      const totalConversions = searchTerms.reduce((sum, st: any) => sum + (st.metrics?.conversions || 0), 0);

      // Find high-cost low-conversion queries (candidates for negatives)
      const wastefulQueries = searchTerms
        .filter((st: any) => (st.metrics?.cost_micros || 0) > 0 && (st.metrics?.conversions || 0) === 0)
        .sort((a: any, b: any) => (b.metrics?.cost_micros || 0) - (a.metrics?.cost_micros || 0))
        .slice(0, 5);

      // Find high-performing queries (candidates for new keywords)
      const highPerformers = searchTerms
        .filter((st: any) => (st.metrics?.conversions || 0) > 0)
        .sort((a: any, b: any) => (b.metrics?.conversions || 0) - (a.metrics?.conversions || 0))
        .slice(0, 5);

      const guidanceText = `🔍 SEARCH TERMS ANALYSIS - GOLDMINE FOR OPTIMIZATION

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}\n` : ''}**Period:** ${dateRange ? `${dateRange.startDate} to ${dateRange.endDate}` : 'Recent'}
**Total Search Terms:** ${searchTerms.length}

**AGGREGATE METRICS:**
- Total Impressions: ${formatNumber(totalImpressions)}
- Total Clicks: ${formatNumber(totalClicks)}
- Total Conversions: ${formatNumber(totalConversions)}

${wastefulQueries.length > 0 ? `⚠️ **TOP 5 WASTEFUL QUERIES (Add as Negatives):**
${wastefulQueries.map((st: any, i) => {
  const cost = (st.metrics?.cost_micros || 0) / 1000000;
  return `${i + 1}. "${st.search_term_view?.search_term}"
   Cost: $${cost.toFixed(2)} | Clicks: ${st.metrics?.clicks || 0} | Conversions: 0
   Match Type: ${st.search_term_view?.ad_group_ad?.ad_group_ad?.match_type || 'N/A'}
   💡 ACTION: Add as negative keyword to prevent future spend`;
}).join('\n\n')}

` : '✅ No obvious wasteful queries found\n\n'}${highPerformers.length > 0 ? `✅ **TOP 5 HIGH-PERFORMING QUERIES (Consider Adding as Keywords):**
${highPerformers.map((st: any, i) => {
  const cost = (st.metrics?.cost_micros || 0) / 1000000;
  const cpa = cost / (st.metrics?.conversions || 1);
  return `${i + 1}. "${st.search_term_view?.search_term}"
   Conversions: ${st.metrics?.conversions} | Cost: $${cost.toFixed(2)} | CPA: $${cpa.toFixed(2)}
   💡 ACTION: Add as exact/phrase match keyword`;
}).join('\n\n')}

` : 'ℹ️ No high-performing queries found in this data\n\n'}💡 KEY INSIGHTS & ACTIONS:

**This Shows ACTUAL Words People Typed:**
- Critical for finding irrelevant queries → Add as negatives
- Discover new keyword opportunities → Add high performers
- Understand user intent → Improve ad copy/landing pages

**Optimization Workflow:**
1. Review wasteful queries above → Add negatives: use add_negative_keywords
2. Review high performers → Add keywords: use add_keywords
3. Check match types → Consider tighter matching for BROAD keywords
4. Monitor weekly → Run this report regularly

${formatNextSteps([
  wastefulQueries.length > 0 ? `Add negative keywords: use add_negative_keywords with ${wastefulQueries.length} queries above` : 'Monitor search terms: rerun this weekly',
  highPerformers.length > 0 ? `Add high performers: use add_keywords for converting queries` : 'Review targeting: check if keywords are too restrictive',
  'Check keyword performance: use get_keyword_performance',
  'Adjust match types: consider exact/phrase vs broad'
])}

Full search terms data (${searchTerms.length} queries) available in structured output.`;

      return injectGuidance(
        {
          customerId,
          campaignId: campaignId || 'all',
          dateRange: dateRange || 'recent',
          searchTerms,
          count: searchTerms.length,
          analysis: {
            totalClicks,
            totalImpressions,
            totalConversions,
            wastefulQueriesCount: wastefulQueries.length,
            highPerformersCount: highPerformers.length,
          },
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to get search terms report', error as Error);
      throw error;
    }
  },
};
