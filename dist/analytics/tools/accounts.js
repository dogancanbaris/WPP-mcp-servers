/**
 * MCP Tools for Google Analytics Account & Property Management
 */
import { getAnalyticsClient } from '../client.js';
import { ListPropertiesSchema } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { injectGuidance, formatNextSteps } from '../../shared/interactive-workflow.js';
const logger = getLogger('analytics.tools.accounts');
/**
 * List Analytics accounts
 */
export const listAnalyticsAccountsTool = {
    name: 'list_analytics_accounts',
    description: 'List all Google Analytics 4 (GA4) accounts you have access to.',
    inputSchema: {
        type: 'object',
        properties: {},
        required: [],
    },
    async handler(_input) {
        try {
            const client = getAnalyticsClient();
            logger.info('Listing Analytics accounts');
            const accounts = await client.listAccounts();
            // Inject rich guidance into response
            const guidanceText = `📊 DISCOVERED ${accounts.length} GOOGLE ANALYTICS 4 ACCOUNT(S)

${accounts.map((a, i) => `${i + 1}. ${a.displayName || a.name}
   Account ID: ${a.name?.replace('accounts/', '') || 'N/A'}`).join('\n\n')}

💡 AGENT GUIDANCE - START HERE FOR ANALYTICS:

**This is the entry point for Google Analytics data access**

GA4 accounts are the top-level containers that hold properties (websites/apps).
To access any Analytics data, you need to:
1. Know which account contains your property
2. Get the property ID from that account
3. Use the property ID in all reporting tools

📊 WHAT YOU CAN DO WITH THESE ACCOUNTS:

**Property Discovery:**
- List properties: use list_analytics_properties with accountId
- List all properties: use list_analytics_properties without accountId
- View data streams: use list_data_streams with propertyId

**Reporting:**
- Run custom reports: use run_analytics_report
- Get real-time users: use get_realtime_users
- Analyze traffic patterns: specify metrics and dimensions

**Account Management:**
- Create properties: use create_analytics_property
- Set up data streams: use create_data_stream
- Configure tracking: use create_custom_dimension, create_custom_metric

${formatNextSteps([
                'List properties: call list_analytics_properties (optionally with accountId)',
                'Check real-time traffic: call get_realtime_users with propertyId',
                'Run custom report: call run_analytics_report with propertyId and date range'
            ])}

ℹ️ NOTE: Only GA4 accounts are shown (Universal Analytics sunset July 2024)

Which account would you like to explore?`;
            return injectGuidance({
                accounts,
                count: accounts.length,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list Analytics accounts', error);
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
        type: 'object',
        properties: {
            accountId: {
                type: 'string',
                description: 'Account ID to filter properties (optional - shows all if omitted)',
            },
        },
    },
    async handler(input) {
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
        }
        catch (error) {
            logger.error('Failed to list Analytics properties', error);
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
        type: 'object',
        properties: {
            propertyId: {
                type: 'string',
                description: 'Property ID (numeric or properties/123456789 format)',
            },
        },
        required: ['propertyId'],
    },
    async handler(input) {
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
        }
        catch (error) {
            logger.error('Failed to list data streams', error);
            throw error;
        }
    },
};
//# sourceMappingURL=accounts.js.map