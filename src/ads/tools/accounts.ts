/**
 * MCP Tools for Google Ads Account Management
 */

import { extractCustomerId } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { injectGuidance, formatNextSteps } from '../../shared/interactive-workflow.js';

const logger = getLogger('ads.tools.accounts');

/**
 * List accessible Google Ads accounts
 */
export const listAccessibleAccountsTool = {
  name: 'list_accessible_accounts',
  description: 'List all Google Ads accounts accessible with your credentials.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
  async handler(input: any) {
    try {
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
      // Note: For list accounts, we don't have a customerId yet, so pass empty string
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      logger.info('Listing accessible Google Ads accounts');

      const resourceNames = await client.listAccessibleAccounts();

      const accounts = resourceNames.map((rn) => ({
        resourceName: rn,
        customerId: extractCustomerId(rn),
      }));

      // Inject rich guidance into response
      const guidanceText = `🏢 DISCOVERED ${accounts.length} GOOGLE ADS ACCOUNT(S)

${accounts.map((a, i) =>
  `${i + 1}. Customer ID: ${a.customerId}
   Resource: ${a.resourceName}`
).join('\n\n')}

💡 AGENT GUIDANCE - START HERE:

**This should be the FIRST tool you call when working with Google Ads**

These customer IDs are required for all subsequent Google Ads operations.
Each customer ID represents a separate Google Ads account with its own:
- Campaigns and ad groups
- Budgets and billing settings
- Keywords and targeting
- Performance data

📊 WHAT YOU CAN DO WITH THESE ACCOUNTS:

**Campaign Management:**
- View campaigns: use list_campaigns with customerId
- Create campaigns: use create_campaign
- Manage budgets: use list_budgets, create_budget, update_budget
- Pause/enable campaigns: use update_campaign_status

**Performance Analysis:**
- Campaign metrics: use get_campaign_performance
- Keyword performance: use get_keyword_performance
- Search terms: use get_search_terms_report

**Optimization:**
- Add keywords: use add_keywords
- Manage negative keywords: use add_negative_keywords
- Adjust budgets: use update_budget
- Track conversions: use list_conversion_actions

${formatNextSteps([
  'Check campaign status: call list_campaigns with a customerId',
  'Review budgets: call list_budgets with a customerId',
  'Analyze performance: call get_campaign_performance with customerId and date range'
])}

Which account would you like to work with?`;

      return injectGuidance(
        {
          accounts,
          count: accounts.length,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to list accessible accounts', error as Error);
      throw error;
    }
  },
};
