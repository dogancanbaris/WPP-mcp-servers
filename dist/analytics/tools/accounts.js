/**
 * MCP Tools for Google Analytics Account & Property Management
 */
import { ListPropertiesSchema } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { injectGuidance, formatNextSteps } from '../../shared/interactive-workflow.js';
import { extractOAuthToken, createGoogleAnalyticsAdminClient } from '../../shared/oauth-client-factory.js';
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
            // Extract OAuth token from request (per-request pattern like GSC)
            const oauthToken = await extractOAuthToken(_input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper (avoids gRPC issues)
            const analyticsAdmin = createGoogleAnalyticsAdminClient(oauthToken);
            logger.info('Listing Analytics accounts');
            // Call Analytics Admin API
            const res = await analyticsAdmin.accounts.list({});
            const accountList = res.data.accounts || [];
            const accounts = accountList.map((account) => ({
                name: account.name,
                displayName: account.displayName,
            }));
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
    description: 'List all GA4 properties (websites/apps being tracked).',
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
            // Extract OAuth token from request (per-request pattern)
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper
            const analyticsAdmin = createGoogleAnalyticsAdminClient(oauthToken);
            logger.info('Listing Analytics properties', { accountId });
            // Call Analytics Admin API
            // If no accountId, get all accounts first, then get their properties
            let propertyList = [];
            if (accountId) {
                const res = await analyticsAdmin.properties.list({
                    filter: `parent:accounts/${accountId}`,
                });
                propertyList = res.data.properties || [];
            }
            else {
                // Get all accounts, then get properties for each
                const accountsRes = await analyticsAdmin.accounts.list({});
                const accounts = accountsRes.data.accounts || [];
                for (const account of accounts) {
                    const res = await analyticsAdmin.properties.list({
                        filter: `parent:${account.name}`,
                    });
                    propertyList.push(...(res.data.properties || []));
                }
            }
            const properties = propertyList.map((prop) => ({
                name: prop.name,
                displayName: prop.displayName,
                timeZone: prop.timeZone,
                currencyCode: prop.currencyCode,
                propertyId: prop.name?.split('/')[1] || '',
            }));
            // Inject rich guidance
            const guidanceText = `📊 DISCOVERED ${properties.length} GA4 PROPERT${properties.length === 1 ? 'Y' : 'IES'}

${accountId ? `**Account:** ${accountId}\n` : '**Showing:** All properties across all accounts\n'}
${properties.map((p, i) => `${i + 1}. ${p.displayName || p.name}
   Property ID: ${p.propertyId}
   Timezone: ${p.timeZone || 'N/A'} | Currency: ${p.currencyCode || 'N/A'}`).join('\n\n')}

💡 PROPERTY ID IS CRITICAL:

**Every Analytics report requires a property ID**
- Format: "${properties[0]?.propertyId || '123456789'}" (just the numeric part)
- Each property = one website or app being tracked
- Get this before running any reports

📊 WHAT YOU CAN DO WITH THESE PROPERTIES:

**Data Exploration:**
- View data streams: use list_data_streams with propertyId
- Check tracking setup: verify Measurement IDs

**Reporting:**
- Run custom reports: use run_analytics_report with propertyId
- Get real-time users: use get_realtime_users with propertyId
- Analyze traffic patterns: specify metrics and dimensions

**Management:**
- Create data streams: use create_data_stream
- Configure custom dimensions: use create_custom_dimension
- Set up conversions: use create_conversion_event
- Link to Google Ads: use create_google_ads_link

${formatNextSteps([
                'Check data streams: call list_data_streams with a propertyId',
                'Run report: call run_analytics_report with propertyId and date range',
                'Monitor live traffic: call get_realtime_users with propertyId'
            ])}

Which property would you like to analyze?`;
            return injectGuidance({
                accountId: accountId || 'all',
                properties,
                count: properties.length,
            }, guidanceText);
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
    description: 'List data streams (web/app tracking configurations) for a GA4 property.',
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
            // Extract OAuth token from request (per-request pattern)
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper
            const analyticsAdmin = createGoogleAnalyticsAdminClient(oauthToken);
            logger.info('Listing data streams', { propertyId });
            // Call Analytics Admin API
            const res = await analyticsAdmin.properties.dataStreams.list({
                parent: `properties/${propertyId}`,
            });
            const streamList = res.data.dataStreams || [];
            const streams = streamList.map((stream) => ({
                name: stream.name,
                type: stream.type,
                displayName: stream.displayName,
                webStreamData: stream.webStreamData,
                measurementId: stream.webStreamData?.measurementId || 'N/A',
                streamId: stream.name?.split('/')[3] || '',
            }));
            // Inject rich guidance
            const guidanceText = `📊 DISCOVERED ${streams.length} DATA STREAM(S)

**Property:** ${propertyId}

${streams.map((s, i) => `${i + 1}. ${s.displayName || s.type}
   Type: ${s.type}
   Stream ID: ${s.streamId}
   Measurement ID: ${s.measurementId}${s.webStreamData?.defaultUri ? `\n   Website: ${s.webStreamData.defaultUri}` : ''}`).join('\n\n')}

💡 WHAT ARE DATA STREAMS:

**Data streams connect your website/app to GA4**
- Web data stream = Website tracking
- iOS/Android app streams = Mobile app tracking
- Each stream has Measurement ID (G-XXXXXXXXXX)
- Use Measurement ID in your tracking code

📊 WHAT YOU CAN DO:

**Implementation:**
- Install gtag.js with Measurement ID: ${streams[0]?.measurementId || 'G-XXXXXXXXXX'}
- Verify tracking: Check real-time reports after installation

**Reporting:**
- Run reports: use run_analytics_report with propertyId
- Check live users: use get_realtime_users with propertyId
- Analyze traffic: specify metrics and dimensions

${formatNextSteps([
                'Run report: call run_analytics_report with this propertyId',
                'Check live traffic: call get_realtime_users',
                'Create additional stream: use create_data_stream if needed'
            ])}`;
            return injectGuidance({
                propertyId,
                streams,
                count: streams.length,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list data streams', error);
            throw error;
        }
    },
};
//# sourceMappingURL=accounts.js.map