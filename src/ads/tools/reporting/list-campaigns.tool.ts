/**
 * List Campaigns Tool
 *
 * MCP tool for listing all campaigns in a Google Ads account.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatDiscoveryResponse, formatNextSteps, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';

const logger = getLogger('ads.tools.reporting.list-campaigns');

/**
 * List campaigns
 */
export const listCampaignsTool = {
  name: 'list_campaigns',
  description: 'List all campaigns in a Google Ads account with status and basic info.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits, e.g., "2191558405")',
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId } = input;

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

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        logger.info('Account discovery mode - listing accessible accounts');
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn: any) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/1',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) =>
            `${i + 1}. Customer ID: ${a.customerId}\n   Resource: ${a.resourceName}`,
          prompt: 'Which account\'s campaigns would you like to list?',
          nextParam: 'customerId',
          emoji: '🏢',
        });
      }

      // ═══ STEP 2: EXECUTE WITH ANALYSIS ═══
      logger.info('Listing campaigns', { customerId });

      const campaigns = await client.listCampaigns(customerId);

      // Analyze campaigns
      const statusCounts = campaigns.reduce((acc: any, c: any) => {
        const status = c.campaign?.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const typeCounts = campaigns.reduce((acc: any, c: any) => {
        const type = c.campaign?.advertising_channel_type || 'UNKNOWN';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Build rich guidance
      const guidanceText = `📊 CAMPAIGN OVERVIEW - ACCOUNT ${customerId}

**Total Campaigns:** ${campaigns.length}

**By Status:**
${Object.entries(statusCounts).map(([status, count]) =>
  `   • ${status}: ${count}`
).join('\n')}

**By Type:**
${Object.entries(typeCounts).map(([type, count]) =>
  `   • ${type}: ${count}`
).join('\n')}

**CAMPAIGN LIST:**
${campaigns.slice(0, 10).map((c: any, i) => {
  const campaign = c.campaign;
  return `${i + 1}. ${campaign?.name || 'N/A'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
}).join('\n\n')}${campaigns.length > 10 ? `\n\n... and ${campaigns.length - 10} more campaigns` : ''}

💡 WHAT YOU CAN DO WITH THESE CAMPAIGNS:

**Performance Analysis:**
- View metrics: use get_campaign_performance with customerId
- Check keywords: use get_keyword_performance
- Analyze search terms: use get_search_terms_report

**Campaign Management:**
- Pause/enable campaigns: use update_campaign_status
- Adjust budgets: use list_budgets, then update_budget
- Add keywords: use add_keywords

**Optimization:**
- Add negative keywords: use add_negative_keywords
- Review bid strategies: use list_bidding_strategies
- Track conversions: use list_conversion_actions

${formatNextSteps([
  'Analyze performance: call get_campaign_performance with date range',
  'Review budgets: call list_budgets with this customerId',
  'Check keywords: call get_keyword_performance'
])}

Which campaign would you like to analyze?`;

      return injectGuidance(
        {
          customerId,
          campaigns,
          count: campaigns.length,
          statusBreakdown: statusCounts,
          typeBreakdown: typeCounts,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to list campaigns', error as Error);
      throw error;
    }
  },
};
