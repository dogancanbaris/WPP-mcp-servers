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

/**
 * Get account information including test account flag
 */
export const getAccountInfoTool = {
  name: 'get_account_info',
  description: 'Get detailed account information including test account flag for diagnostic purposes.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Google Ads customer ID (e.g., "1234567890")',
      },
    },
    required: ['customerId'],
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

      logger.info('Querying account info', { customerId });

      // Query account details including test_account flag
      const customer = client.getCustomer(customerId);
      const results = await customer.query(`
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.test_account,
          customer.manager,
          customer.status
        FROM customer
        WHERE customer.id = ${customerId}
      `);

      if (!results || results.length === 0) {
        throw new Error(`No account found with customer ID: ${customerId}`);
      }

      const accountInfo = results[0];

      // Inject rich guidance into response
      const isTestAccount = accountInfo.customer?.test_account || false;
      const guidanceText = `🔍 ACCOUNT INFORMATION - Customer ID: ${customerId}

**Account Details:**
- Name: ${accountInfo.customer?.descriptive_name || 'N/A'}
- Currency: ${accountInfo.customer?.currency_code || 'N/A'}
- Time Zone: ${accountInfo.customer?.time_zone || 'N/A'}
- Status: ${accountInfo.customer?.status || 'N/A'}
- Manager Account: ${accountInfo.customer?.manager ? 'Yes' : 'No'}

**🎯 TEST ACCOUNT FLAG: ${isTestAccount ? '✅ TRUE (Test Account)' : '❌ FALSE (Production Account)'}**

${isTestAccount
  ? `
✅ **This IS an official Google Ads test account**

This account can be accessed with a TEST-level developer token.
- Test accounts can create campaigns without spending real money
- Test accounts are safe for development and testing
- API operations will work with your current TEST developer token

💡 You can proceed with testing all 60 Google Ads tools using this account!`
  : `
❌ **This is a PRODUCTION account (NOT a test account)**

This account CANNOT be accessed with a TEST-level developer token.
- Production accounts require BASIC or STANDARD access level
- Your current developer token: TEST access (blocks production accounts)
- Error: "DEVELOPER_TOKEN_NOT_APPROVED" is expected for production accounts

**TO ACCESS THIS ACCOUNT:**
1. Apply for BASIC access: https://ads.google.com/aw/apicenter
2. OR get a BASIC/STANDARD token from your organization
3. OR create an official test account for development

**TO CREATE A TEST ACCOUNT:**
1. Go to: https://ads.google.com/home/tools/manager-accounts/
2. Create a new Manager Account (MCC)
3. Create test account under MCC
4. Look for red "Test account" label in UI`
}

${formatNextSteps([
  isTestAccount
    ? 'Proceed with testing: call list_campaigns with this customerId'
    : 'Apply for BASIC access or create a proper test account',
  'Check other accounts: call list_accessible_accounts',
])}`;

      return injectGuidance(
        {
          customerId,
          accountInfo: accountInfo.customer,
          isTestAccount,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to get account info', error as Error);
      throw error;
    }
  },
};
