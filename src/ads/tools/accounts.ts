/**
 * MCP Tools for Google Ads Account Management
 */

import { getGoogleAdsClient } from '../client.js';
import { extractCustomerId } from '../validation.js';
import { getLogger } from '../../shared/logger.js';

const logger = getLogger('ads.tools.accounts');

/**
 * List accessible Google Ads accounts
 */
export const listAccessibleAccountsTool = {
  name: 'list_accessible_accounts',
  description: `List all Google Ads accounts accessible with your credentials.

💡 AGENT GUIDANCE - START HERE:
- This should be the FIRST tool you call when working with Google Ads
- Returns all customer accounts you have permission to access
- Use the customer IDs returned here for all subsequent Google Ads operations
- Each customer ID represents a separate Google Ads account

📊 WHAT YOU'LL GET:
- Customer resource names (e.g., customers/1234567890)
- Extract the numeric ID for use in other tools

🎯 TYPICAL WORKFLOW:
1. Call this tool to discover available accounts
2. Pick the relevant customer ID for the user's request
3. Use that customer ID in all other Google Ads tools`,
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
  async handler(_input: any) {
    try {
      const client = getGoogleAdsClient();

      logger.info('Listing accessible Google Ads accounts');

      const resourceNames = await client.listAccessibleAccounts();

      const accounts = resourceNames.map((rn) => ({
        resourceName: rn,
        customerId: extractCustomerId(rn),
      }));

      return {
        success: true,
        data: {
          accounts,
          count: accounts.length,
          message: `Found ${accounts.length} accessible Google Ads account(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to list accessible accounts', error as Error);
      throw error;
    }
  },
};
