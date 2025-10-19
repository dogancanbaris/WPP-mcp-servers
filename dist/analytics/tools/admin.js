/**
 * MCP Tools for Google Analytics Admin API
 * Property management, data streams, custom dimensions/metrics, audiences, conversion events
 */
import { getAnalyticsClient } from '../client.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
const logger = getLogger('analytics.tools.admin');
/**
 * Create GA4 property
 */
export const createPropertyTool = {
    name: 'create_analytics_property',
    description: `Create a new Google Analytics 4 property.

💡 AGENT GUIDANCE - PROPERTY CREATION:

🎯 WHAT THIS DOES:
- Creates a new GA4 property under an account
- Sets up empty property ready for data streams
- Defines timezone, currency, industry

📋 PROPERTY SETTINGS:
- Display name (client name or website)
- Time zone (for report day boundaries)
- Currency code (for revenue reporting)
- Industry category (optional)

💡 COMMON USE CASES:
- Set up GA4 for new client website
- Create separate properties for staging/production
- Migrate from Universal Analytics to GA4

⚠️ NEXT STEPS AFTER CREATION:
1. Create data stream (web, iOS, or Android)
2. Install tracking code on website
3. Configure custom dimensions/metrics
4. Set up conversion events
5. Link to Google Ads`,
    inputSchema: {
        type: 'object',
        properties: {
            accountId: {
                type: 'string',
                description: 'Analytics account ID (format: "12345")',
            },
            displayName: {
                type: 'string',
                description: 'Property display name (e.g., "Client ABC Website")',
            },
            timeZone: {
                type: 'string',
                description: 'Time zone (e.g., "America/New_York", default: "America/Los_Angeles")',
            },
            currencyCode: {
                type: 'string',
                description: 'Currency code (e.g., "USD", default: "USD")',
            },
            industryCategory: {
                type: 'string',
                description: 'Industry category (optional)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['accountId', 'displayName'],
    },
    async handler(input) {
        try {
            const { accountId, displayName, timeZone = 'America/Los_Angeles', currencyCode = 'USD', industryCategory, confirmationToken, } = input;
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'create_analytics_property',
                inputText: `create property ${displayName}`,
                inputParams: { accountId, displayName },
            });
            const client = getAnalyticsClient();
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_analytics_property', 'Google Analytics', accountId);
            dryRunBuilder.addChange({
                resource: 'GA4 Property',
                resourceId: 'new',
                field: 'property',
                currentValue: 'N/A (new property)',
                newValue: `"${displayName}" (${timeZone}, ${currencyCode})`,
                changeType: 'create',
            });
            dryRunBuilder.addRecommendation('After creation, add a data stream to start tracking');
            dryRunBuilder.addRecommendation('Install GA4 tracking code on website');
            dryRunBuilder.addRecommendation('Configure conversion events and link to Google Ads');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_analytics_property', 'Google Analytics', accountId, { displayName });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Property creation requires approval. Review the preview and call again with confirmationToken.',
                };
            }
            // Execute with confirmation
            logger.info('Creating GA4 property with confirmation', { accountId, displayName });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const property = {
                    parent: `accounts/${accountId}`,
                    displayName,
                    timeZone,
                    currencyCode,
                    industryCategory: industryCategory || undefined,
                };
                const [createdProperty] = await client.createProperty(accountId, property);
                return createdProperty;
            });
            const propertyId = result.name?.split('/')[1] || '';
            return {
                success: true,
                data: {
                    accountId,
                    propertyId,
                    displayName,
                    timeZone,
                    currencyCode,
                    message: `✅ GA4 property "${displayName}" created successfully (ID: ${propertyId})`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create property', error);
            throw error;
        }
    },
};
/**
 * Create data stream
 */
export const createDataStreamTool = {
    name: 'create_data_stream',
    description: `Create a web or app data stream in GA4 property.

💡 AGENT GUIDANCE - DATA STREAMS:

🎯 WHAT THIS DOES:
- Creates tracking stream for website or mobile app
- Generates Measurement ID (G-XXXXXXXXXX)
- Enables data collection for property

📋 STREAM TYPES:
- WEB - Website tracking
- IOS_APP - iOS app tracking
- ANDROID_APP - Android app tracking

💡 USE CASES:
- "Add website tracking for www.client.com"
- "Create data stream for mobile app"
- "Set up tracking for new subdomain"

⚠️ NEXT STEPS:
1. Get Measurement ID from created stream
2. Install gtag.js on website with Measurement ID
3. Verify data is flowing (check real-time reports)`,
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: {
                type: 'string',
                description: 'Property ID (numeric)',
            },
            streamType: {
                type: 'string',
                enum: ['WEB', 'IOS_APP', 'ANDROID_APP'],
                description: 'Type of data stream',
            },
            displayName: {
                type: 'string',
                description: 'Stream display name',
            },
            websiteUrl: {
                type: 'string',
                description: 'Website URL (required for WEB streams)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['propertyId', 'streamType', 'displayName'],
    },
    async handler(input) {
        try {
            const { propertyId, streamType, displayName, websiteUrl, confirmationToken } = input;
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'create_data_stream',
                inputText: `create ${streamType} data stream ${displayName}`,
                inputParams: { propertyId, streamType, displayName },
            });
            // Validate websiteUrl for WEB streams
            if (streamType === 'WEB' && !websiteUrl) {
                throw new Error('websiteUrl is required for WEB data streams');
            }
            const client = getAnalyticsClient();
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_data_stream', 'Google Analytics', propertyId);
            dryRunBuilder.addChange({
                resource: 'Data Stream',
                resourceId: 'new',
                field: 'data_stream',
                currentValue: 'N/A (new stream)',
                newValue: `"${displayName}" (${streamType})${websiteUrl ? ` - ${websiteUrl}` : ''}`,
                changeType: 'create',
            });
            dryRunBuilder.addRecommendation('Install tracking code with generated Measurement ID');
            dryRunBuilder.addRecommendation('Verify data collection in Real-Time reports');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_data_stream', 'Google Analytics', propertyId, { displayName, streamType });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Data stream creation requires approval. Review the preview and call again with confirmationToken.',
                };
            }
            // Execute with confirmation
            logger.info('Creating data stream with confirmation', { propertyId, displayName, streamType });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const dataStream = {
                    displayName,
                    type: streamType,
                };
                if (streamType === 'WEB') {
                    dataStream.webStreamData = {
                        defaultUri: websiteUrl,
                    };
                }
                const [createdStream] = await client.createDataStream(propertyId, dataStream);
                return createdStream;
            });
            const streamId = result.name?.split('/')[3] || '';
            const measurementId = result.webStreamData?.measurementId || '';
            return {
                success: true,
                data: {
                    propertyId,
                    streamId,
                    measurementId,
                    displayName,
                    streamType,
                    message: `✅ Data stream "${displayName}" created (Measurement ID: ${measurementId})`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create data stream', error);
            throw error;
        }
    },
};
/**
 * Create custom dimension
 */
export const createCustomDimensionTool = {
    name: 'create_custom_dimension',
    description: `Create a custom dimension in GA4 for tracking additional data.

💡 AGENT GUIDANCE - CUSTOM DIMENSIONS:

🎯 WHAT THIS DOES:
- Create custom dimension to track data beyond default GA4 dimensions
- Define dimension name, parameter name, and scope
- Enable custom reporting on your specific data

📋 DIMENSION SCOPES:
- EVENT - Different for each event (e.g., product_name on purchase event)
- USER - Same for all events from user (e.g., customer_segment)
- ITEM - For e-commerce items (e.g., item_color)

💡 COMMON USE CASES:
- Customer segment (user scope)
- Product category (event scope)
- Campaign source (event scope)
- User role (user scope)
- Content type (event scope)

⚠️ REQUIREMENTS:
- Must already be sending parameter in events
- Parameter name must match exactly
- Limit: 50 event-scoped, 25 user-scoped per property

📊 EXAMPLE:
Event sent: purchase { customer_tier: "gold" }
Custom dimension: "Customer Tier" → parameter: customer_tier, scope: EVENT`,
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: {
                type: 'string',
                description: 'Property ID (numeric)',
            },
            displayName: {
                type: 'string',
                description: 'Dimension display name (e.g., "Customer Segment")',
            },
            parameterName: {
                type: 'string',
                description: 'Event parameter name to map (e.g., "customer_segment")',
            },
            scope: {
                type: 'string',
                enum: ['EVENT', 'USER', 'ITEM'],
                description: 'Dimension scope',
            },
            description: {
                type: 'string',
                description: 'Dimension description (optional)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['propertyId', 'displayName', 'parameterName', 'scope'],
    },
    async handler(input) {
        try {
            const { propertyId, displayName, parameterName, scope, description, confirmationToken } = input;
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'create_custom_dimension',
                inputText: `create custom dimension ${displayName}`,
                inputParams: { propertyId, displayName, parameterName, scope },
            });
            const client = getAnalyticsClient();
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_custom_dimension', 'Google Analytics', propertyId);
            dryRunBuilder.addChange({
                resource: 'Custom Dimension',
                resourceId: 'new',
                field: 'custom_dimension',
                currentValue: 'N/A (new dimension)',
                newValue: `"${displayName}" → parameter: ${parameterName}, scope: ${scope}`,
                changeType: 'create',
            });
            dryRunBuilder.addRecommendation(`Ensure "${parameterName}" parameter is being sent in events`);
            dryRunBuilder.addRecommendation('Data will only populate for events sent AFTER dimension creation');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_custom_dimension', 'Google Analytics', propertyId, { displayName, parameterName });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Custom dimension creation requires approval. Review and call again with confirmationToken.',
                };
            }
            // Execute with confirmation
            logger.info('Creating custom dimension with confirmation', { propertyId, displayName });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const dimension = {
                    displayName,
                    parameterName,
                    scope,
                    description: description || '',
                };
                const [createdDimension] = await client.createCustomDimension(propertyId, dimension);
                return createdDimension;
            });
            return {
                success: true,
                data: {
                    propertyId,
                    dimensionId: result.name,
                    displayName,
                    parameterName,
                    scope,
                    message: `✅ Custom dimension "${displayName}" created successfully`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create custom dimension', error);
            throw error;
        }
    },
};
/**
 * Create custom metric
 */
export const createCustomMetricTool = {
    name: 'create_custom_metric',
    description: `Create a custom metric in GA4 for tracking numeric data.

💡 AGENT GUIDANCE - CUSTOM METRICS:

🎯 WHAT THIS DOES:
- Create custom metric to track numeric values
- Define metric name, parameter name, and scope
- Enable custom calculations in reports

📋 METRIC SCOPES:
- EVENT - Different for each event (e.g., video_progress)

📊 MEASUREMENT UNITS:
- STANDARD - Default (count)
- CURRENCY - Monetary value
- TIME - Duration (seconds, milliseconds)
- DISTANCE - Length (meters, miles)

💡 COMMON USE CASES:
- Customer lifetime value
- Product margin
- Video watch time
- Page scroll depth
- Cart value`,
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: {
                type: 'string',
                description: 'Property ID (numeric)',
            },
            displayName: {
                type: 'string',
                description: 'Metric display name',
            },
            parameterName: {
                type: 'string',
                description: 'Event parameter name to map',
            },
            measurementUnit: {
                type: 'string',
                enum: ['STANDARD', 'CURRENCY', 'MILLISECONDS', 'SECONDS', 'MINUTES', 'HOURS'],
                description: 'Measurement unit',
            },
            scope: {
                type: 'string',
                enum: ['EVENT'],
                description: 'Metric scope (EVENT only for now)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token (optional)',
            },
        },
        required: ['propertyId', 'displayName', 'parameterName', 'measurementUnit'],
    },
    async handler(input) {
        try {
            const { propertyId, displayName, parameterName, measurementUnit, scope = 'EVENT', confirmationToken } = input;
            detectAndEnforceVagueness({
                operation: 'create_custom_metric',
                inputText: `create custom metric ${displayName}`,
                inputParams: { propertyId, displayName, parameterName },
            });
            const client = getAnalyticsClient();
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_custom_metric', 'Google Analytics', propertyId);
            dryRunBuilder.addChange({
                resource: 'Custom Metric',
                resourceId: 'new',
                field: 'custom_metric',
                currentValue: 'N/A',
                newValue: `"${displayName}" → ${parameterName} (${measurementUnit})`,
                changeType: 'create',
            });
            const dryRun = dryRunBuilder.build();
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_custom_metric', 'Google Analytics', propertyId, { displayName });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return { success: true, requiresApproval: true, preview, confirmationToken: token };
            }
            logger.info('Creating custom metric with confirmation', { propertyId, displayName });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const metric = { displayName, parameterName, measurementUnit, scope };
                const [created] = await client.createCustomMetric(propertyId, metric);
                return created;
            });
            return {
                success: true,
                data: {
                    propertyId,
                    metricId: result.name,
                    displayName,
                    message: `✅ Custom metric "${displayName}" created`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create custom metric', error);
            throw error;
        }
    },
};
/**
 * Create conversion event
 */
export const createConversionEventTool = {
    name: 'create_conversion_event',
    description: `Mark a GA4 event as a conversion (key event).

💡 AGENT GUIDANCE:

🎯 WHAT THIS DOES:
- Marks an existing GA4 event as a conversion
- Enables conversion tracking in reports
- Sends conversions to Google Ads (if linked)

💡 COMMON CONVERSIONS:
- purchase (e-commerce)
- generate_lead (forms)
- sign_up (accounts)
- add_to_cart
- begin_checkout

⚠️ REQUIREMENTS:
- Event must already exist in GA4
- Use exact event name (case-sensitive)`,
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: { type: 'string' },
            eventName: { type: 'string', description: 'Event name to mark as conversion' },
            confirmationToken: { type: 'string' },
        },
        required: ['propertyId', 'eventName'],
    },
    async handler(input) {
        try {
            const { propertyId, eventName, confirmationToken } = input;
            detectAndEnforceVagueness({
                operation: 'create_conversion_event',
                inputText: `mark ${eventName} as conversion`,
                inputParams: { propertyId, eventName },
            });
            const client = getAnalyticsClient();
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_conversion_event', 'Google Analytics', propertyId);
            dryRunBuilder.addChange({
                resource: 'Conversion Event',
                resourceId: eventName,
                field: 'is_conversion',
                currentValue: 'false',
                newValue: 'true',
                changeType: 'update',
            });
            const dryRun = dryRunBuilder.build();
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_conversion_event', 'Google Analytics', propertyId, { eventName });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return { success: true, requiresApproval: true, preview, confirmationToken: token };
            }
            logger.info('Creating conversion event with confirmation', { propertyId, eventName });
            await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const [created] = await client.createConversionEvent(propertyId, eventName);
                return created;
            });
            return {
                success: true,
                data: {
                    propertyId,
                    eventName,
                    message: `✅ Event "${eventName}" marked as conversion`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create conversion event', error);
            throw error;
        }
    },
};
/**
 * Link Google Ads to GA4
 */
export const createGoogleAdsLinkTool = {
    name: 'create_google_ads_link',
    description: `Link GA4 property to Google Ads account for conversion import.

💡 AGENT GUIDANCE:

🎯 WHAT THIS DOES:
- Links GA4 property to Google Ads account
- Enables conversion import to Google Ads
- Allows bidding on GA4 conversions

💡 CRITICAL FOR:
- Using GA4 conversions in Google Ads bidding
- Importing GA4 audiences to Google Ads
- Unified reporting

⚠️ REQUIREMENTS:
- Must have admin access to both GA4 and Google Ads
- Google Ads customer ID must be valid`,
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: { type: 'string' },
            googleAdsCustomerId: { type: 'string', description: 'Google Ads customer ID (10 digits)' },
            confirmationToken: { type: 'string' },
        },
        required: ['propertyId', 'googleAdsCustomerId'],
    },
    async handler(input) {
        try {
            const { propertyId, googleAdsCustomerId, confirmationToken } = input;
            detectAndEnforceVagueness({
                operation: 'create_google_ads_link',
                inputText: `link property ${propertyId} to ads account ${googleAdsCustomerId}`,
                inputParams: { propertyId, googleAdsCustomerId },
            });
            const client = getAnalyticsClient();
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_google_ads_link', 'Google Analytics', propertyId);
            dryRunBuilder.addChange({
                resource: 'Google Ads Link',
                resourceId: 'new',
                field: 'google_ads_link',
                currentValue: 'Not linked',
                newValue: `Linked to Google Ads account ${googleAdsCustomerId}`,
                changeType: 'create',
            });
            dryRunBuilder.addRecommendation('GA4 conversions will now import to Google Ads');
            dryRunBuilder.addRecommendation('Configure which conversions to import in Google Ads');
            const dryRun = dryRunBuilder.build();
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_google_ads_link', 'Google Analytics', propertyId, { googleAdsCustomerId });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return { success: true, requiresApproval: true, preview, confirmationToken: token };
            }
            logger.info('Creating Google Ads link with confirmation', { propertyId, googleAdsCustomerId });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const link = {
                    customerId: googleAdsCustomerId,
                };
                const [createdLink] = await client.createGoogleAdsLink(propertyId, link);
                return createdLink;
            });
            return {
                success: true,
                data: {
                    propertyId,
                    googleAdsCustomerId,
                    linkId: result.name,
                    message: `✅ GA4 property linked to Google Ads account ${googleAdsCustomerId}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create Google Ads link', error);
            throw error;
        }
    },
};
/**
 * Export analytics admin tools
 */
export const analyticsAdminTools = [
    createPropertyTool,
    createDataStreamTool,
    createCustomDimensionTool,
    createCustomMetricTool,
    createConversionEventTool,
    createGoogleAdsLinkTool,
];
//# sourceMappingURL=admin.js.map