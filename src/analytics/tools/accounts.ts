/**
 * MCP Tools for Google Analytics Account & Property Management
 */

import { getAnalyticsClient } from '../client.js';
import { ListPropertiesSchema } from '../validation.js';
import { getLogger } from '../../shared/logger.js';

const logger = getLogger('analytics.tools.accounts');

/**
 * List Analytics accounts
 */
export const listAnalyticsAccountsTool = {
  name: 'list_analytics_accounts',
  description: `List all Google Analytics 4 (GA4) accounts you have access to.

💡 AGENT GUIDANCE - START HERE FOR ANALYTICS:

📊 WHAT THIS RETURNS:
- All GA4 accounts accessible with your credentials
- Account IDs needed for listing properties
- Account display names

🎯 TYPICAL WORKFLOW:
1. Call this tool first to discover available accounts
2. Use account IDs to list properties
3. Use property IDs for all reporting operations

ℹ️ NOTE: Only GA4 accounts are returned (Universal Analytics sunset July 2024)`,
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
  async handler(_input: any) {
    try {
      const client = getAnalyticsClient();

      logger.info('Listing Analytics accounts');

      const accounts = await client.listAccounts();

      return {
        success: true,
        data: {
          accounts,
          count: accounts.length,
          message: `Found ${accounts.length} Google Analytics 4 account(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to list Analytics accounts', error as Error);
      throw error;
    }
  },
};

/**
 * List Analytics properties
 */
export const listAnalyticsPropertiesTool = {
  name: 'list_analytics_properties',
  description: `List all GA4 properties (websites/apps being tracked).

💡 AGENT GUIDANCE - PROPERTY DISCOVERY:

📊 WHAT THIS RETURNS:
- All GA4 properties you can access
- Property IDs (required for ALL reporting tools)
- Property names, time zones, currency codes
- Industry categories

🎯 PROPERTY ID IS CRITICAL:
- Every Analytics report requires a property ID
- Format: "123456789" or "properties/123456789"
- Each property = one website or app being tracked
- Get this before running any reports

💡 FILTER BY ACCOUNT (OPTIONAL):
- Provide accountId to see properties for specific account only
- Omit accountId to see all properties across all accounts

🔍 WHAT TO LOOK FOR:
- Property display name → Identify which site/app
- Time zone → Important for date-based reports
- Currency code → For revenue reports

📋 NEXT STEPS:
1. Identify the property you want to report on
2. Copy the property ID
3. Use in reporting tools (run_analytics_report, get_realtime_users, etc.)`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      accountId: {
        type: 'string',
        description: 'Account ID to filter properties (optional - shows all if omitted)',
      },
    },
  },
  async handler(input: any) {
    try {
      ListPropertiesSchema.parse(input);

      const { accountId } = input;

      const client = getAnalyticsClient();

      logger.info('Listing Analytics properties', { accountId });

      const properties = await client.listProperties(accountId);

      return {
        success: true,
        data: {
          accountId: accountId || 'all',
          properties,
          count: properties.length,
          message: `Found ${properties.length} GA4 propert${properties.length === 1 ? 'y' : 'ies'}`,
        },
      };
    } catch (error) {
      logger.error('Failed to list Analytics properties', error as Error);
      throw error;
    }
  },
};

/**
 * List data streams
 */
export const listDataStreamsTool = {
  name: 'list_data_streams',
  description: `List data streams (web/app tracking configurations) for a GA4 property.

💡 AGENT GUIDANCE - UNDERSTANDING DATA STREAMS:

📊 WHAT ARE DATA STREAMS:
- Web data stream = Website tracking
- iOS/Android app streams = Mobile app tracking
- Each stream has a Measurement ID (G-XXXXXXXXXX)
- One property can have multiple streams

🔍 WHAT YOU'LL GET:
- Stream IDs and types
- Measurement IDs (for tracking code)
- Stream names
- Website URLs (for web streams)

🎯 USE CASES:
- Verify which sites/apps are being tracked
- Get Measurement IDs for implementation
- Check stream configuration
- Multi-site property management`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'Property ID (numeric or properties/123456789 format)',
      },
    },
    required: ['propertyId'],
  },
  async handler(input: any) {
    try {
      const { propertyId } = input;

      const client = getAnalyticsClient();

      logger.info('Listing data streams', { propertyId });

      const streams = await client.listDataStreams(propertyId);

      return {
        success: true,
        data: {
          propertyId,
          streams,
          count: streams.length,
          message: `Found ${streams.length} data stream(s) for property ${propertyId}`,
        },
      };
    } catch (error) {
      logger.error('Failed to list data streams', error as Error);
      throw error;
    }
  },
};
