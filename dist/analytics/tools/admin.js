/**
 * MCP Tools for Google Analytics Admin API
 * Property management, data streams, custom dimensions/metrics, audiences, conversion events
 */
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { extractOAuthToken, createGoogleAnalyticsAdminClient } from '../../shared/oauth-client-factory.js';
import { formatDiscoveryResponse } from '../../shared/interactive-workflow.js';
const logger = getLogger('analytics.tools.admin');
/**
 * Create GA4 property
 */
export const createPropertyTool = {
    name: 'create_analytics_property',
    description: 'Create a new Google Analytics 4 property.',
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
        required: [], // Make optional for discovery mode
    },
    async handler(input) {
        try {
            const { accountId, displayName, timeZone = 'America/Los_Angeles', currencyCode = 'USD', industryCategory, confirmationToken, } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper (avoids gRPC issues)
            const client = createGoogleAnalyticsAdminClient(oauthToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!accountId) {
                logger.info('Account discovery mode - listing accounts');
                const accountsRes = await client.accounts.list({});
                const accounts = (accountsRes.data.accounts || []).map((acc) => ({
                    accountId: acc.name?.replace('accounts/', '') || '',
                    displayName: acc.displayName,
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT ANALYTICS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. ${a.displayName || 'Untitled'}\n   Account ID: ${a.accountId}`,
                    prompt: 'Which account should contain the new property?',
                    nextParam: 'accountId',
                    emoji: '🏢',
                });
            }
            // ═══ STEP 2: CHECK DISPLAY NAME ═══
            if (!displayName) {
                throw new Error('displayName is required to create a property');
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'create_analytics_property',
                inputText: `create property ${displayName}`,
                inputParams: { accountId, displayName },
            });
            // ═══ STEP 3: DRY-RUN PREVIEW (if no confirmation token) ═══
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
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_analytics_property', 'Google Analytics', accountId, { displayName });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Property creation requires approval. Review the preview and call again with confirmationToken (Step 3/3).',
                };
            }
            // ═══ STEP 4: EXECUTE WITH CONFIRMATION ═══
            logger.info('Creating GA4 property with confirmation', { accountId, displayName });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const res = await client.properties.create({
                    requestBody: {
                        parent: `accounts/${accountId}`,
                        displayName,
                        timeZone,
                        currencyCode,
                        industryCategory: industryCategory || undefined,
                    },
                });
                const createdProperty = res.data;
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
    description: 'Create a web or app data stream in GA4 property.',
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
        required: [], // Make optional for discovery mode
    },
    async handler(input) {
        try {
            const { propertyId, streamType, displayName, websiteUrl, confirmationToken } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper (avoids gRPC issues)
            const client = createGoogleAnalyticsAdminClient(oauthToken);
            // ═══ STEP 1: PROPERTY DISCOVERY ═══
            if (!propertyId) {
                logger.info('Property discovery mode - listing properties');
                const accountsRes = await client.accounts.list({});
                const accounts = accountsRes.data.accounts || [];
                let propertyList = [];
                for (const account of accounts) {
                    const res = await client.properties.list({
                        filter: `parent:${account.name}`,
                    });
                    propertyList.push(...(res.data.properties || []));
                }
                const properties = propertyList.map((prop) => ({
                    propertyId: prop.name?.split('/')[1] || '',
                    displayName: prop.displayName,
                }));
                return formatDiscoveryResponse({
                    step: '1/4',
                    title: 'SELECT PROPERTY FOR DATA STREAM',
                    items: properties,
                    itemFormatter: (p, i) => `${i + 1}. ${p.displayName || 'Untitled'}\n   Property ID: ${p.propertyId}`,
                    prompt: 'Which property should contain the data stream?',
                    nextParam: 'propertyId',
                    emoji: '📊',
                });
            }
            // ═══ STEP 2: CHECK REQUIRED PARAMS ═══
            if (!streamType || !displayName) {
                throw new Error('streamType and displayName are required');
            }
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
            // ═══ STEP 3: DRY-RUN PREVIEW (if no confirmation token) ═══
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
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_data_stream', 'Google Analytics', propertyId, { displayName, streamType });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Data stream creation requires approval. Review the preview and call again with confirmationToken (Step 3/4).',
                };
            }
            // ═══ STEP 4: EXECUTE WITH CONFIRMATION ═══
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
                const res = await client.properties.dataStreams.create({
                    parent: `properties/${propertyId}`,
                    requestBody: dataStream,
                });
                const createdStream = res.data;
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
    description: 'Create a custom dimension in GA4 for tracking additional data..',
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
        required: [], // Make optional for discovery mode
    },
    async handler(input) {
        try {
            const { propertyId, displayName, parameterName, scope, description, confirmationToken } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper (avoids gRPC issues)
            const client = createGoogleAnalyticsAdminClient(oauthToken);
            // ═══ STEP 1: PROPERTY DISCOVERY ═══
            if (!propertyId) {
                logger.info('Property discovery mode - listing properties');
                const accountsRes = await client.accounts.list({});
                const accounts = accountsRes.data.accounts || [];
                let propertyList = [];
                for (const account of accounts) {
                    const res = await client.properties.list({
                        filter: `parent:${account.name}`,
                    });
                    propertyList.push(...(res.data.properties || []));
                }
                const properties = propertyList.map((prop) => ({
                    propertyId: prop.name?.split('/')[1] || '',
                    displayName: prop.displayName,
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT PROPERTY FOR CUSTOM DIMENSION',
                    items: properties,
                    itemFormatter: (p, i) => `${i + 1}. ${p.displayName || 'Untitled'}\n   Property ID: ${p.propertyId}`,
                    prompt: 'Which property should contain the custom dimension?',
                    nextParam: 'propertyId',
                    emoji: '📊',
                });
            }
            // ═══ STEP 2: CHECK REQUIRED PARAMS ═══
            if (!displayName || !parameterName || !scope) {
                throw new Error('displayName, parameterName, and scope are required');
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'create_custom_dimension',
                inputText: `create custom dimension ${displayName}`,
                inputParams: { propertyId, displayName, parameterName, scope },
            });
            // ═══ STEP 3: DRY-RUN PREVIEW (if no confirmation token) ═══
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
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_custom_dimension', 'Google Analytics', propertyId, { displayName, parameterName });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Custom dimension creation requires approval. Review and call again with confirmationToken (Step 3/3).',
                };
            }
            // ═══ STEP 4: EXECUTE WITH CONFIRMATION ═══
            logger.info('Creating custom dimension with confirmation', { propertyId, displayName });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const res = await client.properties.customDimensions.create({
                    parent: `properties/${propertyId}`,
                    requestBody: {
                        displayName,
                        parameterName,
                        scope,
                        description: description || '',
                    },
                });
                const createdDimension = res.data;
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
    description: 'Create a custom metric in GA4 for tracking numeric data..',
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
        required: [], // Make optional for discovery mode
    },
    async handler(input) {
        try {
            const { propertyId, displayName, parameterName, measurementUnit, scope = 'EVENT', confirmationToken } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper (avoids gRPC issues)
            const client = createGoogleAnalyticsAdminClient(oauthToken);
            // ═══ STEP 1: PROPERTY DISCOVERY ═══
            if (!propertyId) {
                logger.info('Property discovery mode - listing properties');
                const accountsRes = await client.accounts.list({});
                const accounts = accountsRes.data.accounts || [];
                let propertyList = [];
                for (const account of accounts) {
                    const res = await client.properties.list({
                        filter: `parent:${account.name}`,
                    });
                    propertyList.push(...(res.data.properties || []));
                }
                const properties = propertyList.map((prop) => ({
                    propertyId: prop.name?.split('/')[1] || '',
                    displayName: prop.displayName,
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT PROPERTY FOR CUSTOM METRIC',
                    items: properties,
                    itemFormatter: (p, i) => `${i + 1}. ${p.displayName || 'Untitled'}\n   Property ID: ${p.propertyId}`,
                    prompt: 'Which property should contain the custom metric?',
                    nextParam: 'propertyId',
                    emoji: '📊',
                });
            }
            // ═══ STEP 2: CHECK REQUIRED PARAMS ═══
            if (!displayName || !parameterName || !measurementUnit) {
                throw new Error('displayName, parameterName, and measurementUnit are required');
            }
            detectAndEnforceVagueness({
                operation: 'create_custom_metric',
                inputText: `create custom metric ${displayName}`,
                inputParams: { propertyId, displayName, parameterName },
            });
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
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Custom metric creation requires approval. Review and call again with confirmationToken (Step 3/3).'
                };
            }
            // ═══ STEP 4: EXECUTE WITH CONFIRMATION ═══
            logger.info('Creating custom metric with confirmation', { propertyId, displayName });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const res = await client.properties.customMetrics.create({
                    parent: `properties/${propertyId}`,
                    requestBody: {
                        displayName,
                        parameterName,
                        measurementUnit,
                        scope,
                    },
                });
                return res.data;
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
    description: 'Mark a GA4 event as a conversion (key event)..',
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: { type: 'string' },
            eventName: { type: 'string', description: 'Event name to mark as conversion' },
            confirmationToken: { type: 'string' },
        },
        required: [], // Make optional for discovery mode
    },
    async handler(input) {
        try {
            const { propertyId, eventName, confirmationToken } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper (avoids gRPC issues)
            const client = createGoogleAnalyticsAdminClient(oauthToken);
            // ═══ STEP 1: PROPERTY DISCOVERY ═══
            if (!propertyId) {
                logger.info('Property discovery mode - listing properties');
                const accountsRes = await client.accounts.list({});
                const accounts = accountsRes.data.accounts || [];
                let propertyList = [];
                for (const account of accounts) {
                    const res = await client.properties.list({
                        filter: `parent:${account.name}`,
                    });
                    propertyList.push(...(res.data.properties || []));
                }
                const properties = propertyList.map((prop) => ({
                    propertyId: prop.name?.split('/')[1] || '',
                    displayName: prop.displayName,
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT PROPERTY FOR CONVERSION EVENT',
                    items: properties,
                    itemFormatter: (p, i) => `${i + 1}. ${p.displayName || 'Untitled'}\n   Property ID: ${p.propertyId}`,
                    prompt: 'Which property contains the event to mark as conversion?',
                    nextParam: 'propertyId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: CHECK REQUIRED PARAMS ═══
            if (!eventName) {
                throw new Error('eventName is required');
            }
            detectAndEnforceVagueness({
                operation: 'create_conversion_event',
                inputText: `mark ${eventName} as conversion`,
                inputParams: { propertyId, eventName },
            });
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
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Conversion event creation requires approval. Review and call again with confirmationToken (Step 3/3).'
                };
            }
            // ═══ STEP 4: EXECUTE WITH CONFIRMATION ═══
            logger.info('Creating conversion event with confirmation', { propertyId, eventName });
            await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const res = await client.properties.conversionEvents.create({
                    parent: `properties/${propertyId}`,
                    requestBody: {
                        eventName,
                    },
                });
                return res.data;
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
    description: 'Link GA4 property to Google Ads account for conversion import..',
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: { type: 'string' },
            googleAdsCustomerId: { type: 'string', description: 'Google Ads customer ID (10 digits)' },
            confirmationToken: { type: 'string' },
        },
        required: [], // Make optional for discovery mode
    },
    async handler(input) {
        try {
            const { propertyId, googleAdsCustomerId, confirmationToken } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics Admin client using googleapis wrapper (avoids gRPC issues)
            const client = createGoogleAnalyticsAdminClient(oauthToken);
            // ═══ STEP 1: PROPERTY DISCOVERY ═══
            if (!propertyId) {
                logger.info('Property discovery mode - listing properties');
                const accountsRes = await client.accounts.list({});
                const accounts = accountsRes.data.accounts || [];
                let propertyList = [];
                for (const account of accounts) {
                    const res = await client.properties.list({
                        filter: `parent:${account.name}`,
                    });
                    propertyList.push(...(res.data.properties || []));
                }
                const properties = propertyList.map((prop) => ({
                    propertyId: prop.name?.split('/')[1] || '',
                    displayName: prop.displayName,
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT PROPERTY FOR GOOGLE ADS LINK',
                    items: properties,
                    itemFormatter: (p, i) => `${i + 1}. ${p.displayName || 'Untitled'}\n   Property ID: ${p.propertyId}`,
                    prompt: 'Which property should link to Google Ads?',
                    nextParam: 'propertyId',
                    emoji: '🔗',
                });
            }
            // ═══ STEP 2: CHECK REQUIRED PARAMS ═══
            if (!googleAdsCustomerId) {
                throw new Error('googleAdsCustomerId is required (10-digit customer ID)');
            }
            detectAndEnforceVagueness({
                operation: 'create_google_ads_link',
                inputText: `link property ${propertyId} to ads account ${googleAdsCustomerId}`,
                inputParams: { propertyId, googleAdsCustomerId },
            });
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
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Google Ads link creation requires approval. Review and call again with confirmationToken (Step 3/3).'
                };
            }
            // ═══ STEP 4: EXECUTE WITH CONFIRMATION ═══
            logger.info('Creating Google Ads link with confirmation', { propertyId, googleAdsCustomerId });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const res = await client.properties.googleAdsLinks.create({
                    parent: `properties/${propertyId}`,
                    requestBody: {
                        customerId: googleAdsCustomerId,
                    },
                });
                return res.data;
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