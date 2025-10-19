/**
 * MCP Tools for Google Ads Conversion Tracking
 * Includes: ConversionActionService, ConversionUploadService, ConversionAdjustmentService
 */
import { getGoogleAdsClient } from '../client.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
const logger = getLogger('ads.tools.conversions');
/**
 * List conversion actions
 */
export const listConversionActionsTool = {
    name: 'list_conversion_actions',
    description: `List all conversion actions in a Google Ads account.

💡 AGENT GUIDANCE - CONVERSION TRACKING:

📊 WHAT ARE CONVERSION ACTIONS:
- Conversion actions define what counts as a valuable action (purchase, signup, call, etc.)
- Each action has tracking settings: category, counting method, attribution window
- Required for measuring campaign ROI and optimizing for conversions

🎯 USE CASES:
- "What conversions are being tracked for this account?"
- "Show me all conversion actions and their settings"
- "Which conversions are imported from Google Analytics?"

📋 WHAT YOU'LL GET:
- Conversion action name and ID
- Category (purchase, signup, lead, page_view, etc.)
- Counting method (ONE or MANY per click/session)
- Attribution window (days between click and conversion)
- Value settings (fixed value or transaction-specific)
- Status (enabled/removed)`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
        },
        required: ['customerId'],
    },
    async handler(input) {
        try {
            const { customerId } = input;
            const client = getGoogleAdsClient();
            logger.info('Listing conversion actions', { customerId });
            // Query conversion actions
            const query = `
        SELECT
          conversion_action.id,
          conversion_action.name,
          conversion_action.category,
          conversion_action.status,
          conversion_action.type,
          conversion_action.counting_type,
          conversion_action.click_through_lookback_window_days,
          conversion_action.value_settings.default_value,
          conversion_action.value_settings.always_use_default_value
        FROM conversion_action
        WHERE conversion_action.status != 'REMOVED'
        ORDER BY conversion_action.name
      `;
            const customer = client.getCustomer(customerId);
            const results = await customer.query(query);
            const conversionActions = [];
            for (const row of results) {
                const action = row.conversion_action;
                conversionActions.push({
                    id: String(action?.id || ''),
                    name: String(action?.name || ''),
                    category: String(action?.category || ''),
                    status: String(action?.status || ''),
                    type: String(action?.type || ''),
                    countingType: String(action?.counting_type || ''),
                    attributionWindow: parseInt(String(action?.click_through_lookback_window_days || 30)),
                    defaultValue: action?.value_settings?.default_value
                        ? parseFloat(String(action.value_settings.default_value)) / 1000000
                        : undefined,
                    alwaysUseDefaultValue: action?.value_settings?.always_use_default_value || false,
                });
            }
            return {
                success: true,
                data: {
                    customerId,
                    conversionActions,
                    count: conversionActions.length,
                    message: `Found ${conversionActions.length} conversion action(s)`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to list conversion actions', error);
            throw error;
        }
    },
};
/**
 * Create conversion action
 */
export const createConversionActionTool = {
    name: 'create_conversion_action',
    description: `Create a new conversion action for tracking.

💡 AGENT GUIDANCE - CREATING CONVERSIONS:

🎯 WHAT THIS DOES:
- Creates a new conversion action to track valuable user actions
- Defines what counts as a conversion and how to count it
- Sets attribution window and value settings
- Enables conversion optimization in campaigns

📋 CONVERSION CATEGORIES:
- PURCHASE - E-commerce transactions
- LEAD - Form submissions, signups
- SIGNUP - Account creation
- PAGE_VIEW - Specific page visits
- PHONE_CALL - Call tracking
- DOWNLOAD - File/app downloads
- STORE_VISIT - Physical store visits

📊 COUNTING METHODS:
- ONE - Count one conversion per click (recommended for purchases)
- MANY - Count every conversion (recommended for page views)

⏱️ ATTRIBUTION WINDOW:
- Default: 30 days (click to conversion)
- Can set: 1-90 days
- Shorter window = more conservative attribution

💰 VALUE SETTINGS:
- Use transaction-specific value (e-commerce)
- Use fixed value (leads: $50 each)
- Don't assign value (just count conversions)

🎯 TYPICAL WORKFLOW:
1. Decide what action to track (purchase, signup, etc.)
2. Choose counting method (one vs many)
3. Set attribution window (typically 30 days)
4. Configure value (transaction-specific or fixed)
5. Implement tracking tag on website
6. Verify conversions are being tracked`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            name: {
                type: 'string',
                description: 'Conversion action name (e.g., "Purchase", "Sign Up")',
            },
            category: {
                type: 'string',
                enum: ['PURCHASE', 'LEAD', 'SIGNUP', 'PAGE_VIEW', 'PHONE_CALL', 'DOWNLOAD', 'STORE_VISIT'],
                description: 'Conversion category',
            },
            countingType: {
                type: 'string',
                enum: ['ONE', 'MANY'],
                description: 'How to count conversions (ONE = once per click, MANY = every time)',
            },
            attributionWindowDays: {
                type: 'number',
                description: 'Days between click and conversion to count (1-90, default: 30)',
            },
            valueSettings: {
                type: 'object',
                properties: {
                    defaultValue: {
                        type: 'number',
                        description: 'Fixed value per conversion in dollars (optional)',
                    },
                    alwaysUseDefaultValue: {
                        type: 'boolean',
                        description: 'Always use default value instead of transaction-specific',
                    },
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'name', 'category', 'countingType'],
    },
    async handler(input) {
        try {
            const { customerId, name, category, countingType, attributionWindowDays = 30, valueSettings, confirmationToken, } = input;
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'create_conversion_action',
                inputText: `create conversion action ${name} category ${category}`,
                inputParams: { customerId, name, category },
            });
            const client = getGoogleAdsClient();
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_conversion_action', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Conversion Action',
                resourceId: 'new',
                field: 'conversion_action',
                currentValue: 'N/A (new conversion)',
                newValue: `"${name}" (${category}, ${countingType}, ${attributionWindowDays} day window)`,
                changeType: 'create',
            });
            // Add value info if provided
            if (valueSettings?.defaultValue) {
                dryRunBuilder.addChange({
                    resource: 'Conversion Action',
                    resourceId: 'new',
                    field: 'default_value',
                    currentValue: 'N/A',
                    newValue: `$${valueSettings.defaultValue.toFixed(2)} per conversion`,
                    changeType: 'create',
                });
            }
            dryRunBuilder.addRecommendation('After creating, implement tracking tag on website or app');
            dryRunBuilder.addRecommendation('Verify conversions are being tracked within 24-48 hours');
            if (countingType === 'MANY') {
                dryRunBuilder.addRecommendation('MANY counting type selected - every occurrence will count (good for page views, not purchases)');
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_conversion_action', 'Google Ads', customerId, { name, category });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Conversion action creation requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Creating conversion action with confirmation', { customerId, name, category });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                // Build conversion action
                const conversionAction = {
                    name,
                    category,
                    type: 'WEBPAGE',
                    counting_type: countingType,
                    click_through_lookback_window_days: attributionWindowDays,
                };
                // Add value settings if provided
                if (valueSettings) {
                    conversionAction.value_settings = {
                        default_value: valueSettings.defaultValue
                            ? valueSettings.defaultValue * 1000000
                            : undefined,
                        always_use_default_value: valueSettings.alwaysUseDefaultValue || false,
                    };
                }
                const customer = client.getCustomer(customerId);
                const operation = {
                    create: conversionAction,
                };
                const response = await customer.conversionActions.create([operation]);
                return response;
            });
            return {
                success: true,
                data: {
                    customerId,
                    conversionActionId: result,
                    name,
                    category,
                    countingType,
                    attributionWindowDays,
                    message: `✅ Conversion action "${name}" created successfully`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create conversion action', error);
            throw error;
        }
    },
};
/**
 * Upload click conversions (offline conversion import)
 */
export const uploadClickConversionsTool = {
    name: 'upload_click_conversions',
    description: `Upload offline conversions to Google Ads.

💡 AGENT GUIDANCE - OFFLINE CONVERSION IMPORT:

🎯 WHAT THIS DOES:
- Imports offline conversions (sales, leads, calls) that happened outside Google Ads
- Links conversions back to the Google Ads click that drove them
- Enables proper ROI attribution for offline sales
- Critical for B2B and long sales cycles

📋 REQUIRED DATA:
- Conversion action name (must already exist in account)
- GCLID (Google Click ID from ad click)
- Conversion date/time
- Conversion value (optional)

🔗 HOW IT WORKS:
1. User clicks Google Ad → GCLID stored in URL
2. User converts offline (calls, visits store, closes deal)
3. Business records GCLID with conversion in CRM
4. Upload GCLID + conversion data via API
5. Google Ads attributes conversion to original click

💡 COMMON USE CASES:
- B2B: Import closed deals from Salesforce/HubSpot
- Retail: Import in-store purchases linked to online clicks
- Service: Import booked appointments
- Real Estate: Import property sales

⚠️ REQUIREMENTS:
- GCLID tracking must be enabled (auto-tagging)
- Conversions must be within attribution window (default 30 days)
- Conversion action must exist in account
- GCLID must match actual click in Google Ads

📊 BEST PRACTICES:
- Upload conversions daily for accurate attribution
- Include conversion value for revenue tracking
- Verify GCLID format before uploading (starts with "Cj0...")
- Check upload errors and fix in next batch`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            conversionActionId: {
                type: 'string',
                description: 'Conversion action ID (must exist in account)',
            },
            conversions: {
                type: 'array',
                description: 'Array of conversions to upload',
                items: {
                    type: 'object',
                    properties: {
                        gclid: {
                            type: 'string',
                            description: 'Google Click ID from ad click',
                        },
                        conversionDateTime: {
                            type: 'string',
                            description: 'Conversion date/time in format: "2025-10-18 14:30:00 America/New_York"',
                        },
                        conversionValue: {
                            type: 'number',
                            description: 'Conversion value in dollars (optional)',
                        },
                        currencyCode: {
                            type: 'string',
                            description: 'Currency code (e.g., "USD") - default: USD',
                        },
                    },
                    required: ['gclid', 'conversionDateTime'],
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'conversionActionId', 'conversions'],
    },
    async handler(input) {
        try {
            const { customerId, conversionActionId, conversions, confirmationToken } = input;
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'upload_click_conversions',
                inputText: `upload ${conversions.length} conversions to action ${conversionActionId}`,
                inputParams: { customerId, conversionActionId, conversionCount: conversions.length },
            });
            // Check bulk limit
            if (conversions.length > 2000) {
                throw new Error(`Cannot upload ${conversions.length} conversions at once. Maximum is 2,000. Please batch into smaller uploads.`);
            }
            const client = getGoogleAdsClient();
            // Calculate total value
            const totalValue = conversions.reduce((sum, c) => sum + (c.conversionValue || 0), 0);
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('upload_click_conversions', 'Google Ads', customerId);
            // Show sample conversions (first 5)
            const sampleSize = Math.min(5, conversions.length);
            for (let i = 0; i < sampleSize; i++) {
                const conv = conversions[i];
                dryRunBuilder.addChange({
                    resource: 'Click Conversion',
                    resourceId: `conversion_${i + 1}`,
                    field: 'conversion',
                    currentValue: 'N/A (new conversion)',
                    newValue: `GCLID: ${conv.gclid}, Date: ${conv.conversionDateTime}, Value: $${conv.conversionValue || 0}`,
                    changeType: 'create',
                });
            }
            if (conversions.length > sampleSize) {
                dryRunBuilder.addChange({
                    resource: 'Click Conversions',
                    resourceId: 'additional',
                    field: 'additional_conversions',
                    currentValue: 'N/A',
                    newValue: `... and ${conversions.length - sampleSize} more conversions`,
                    changeType: 'create',
                });
            }
            // Add financial impact
            if (totalValue > 0) {
                dryRunBuilder.setFinancialImpact({
                    estimatedNewDailySpend: totalValue,
                    monthlyDifference: totalValue,
                });
            }
            dryRunBuilder.addRecommendation(`Uploading ${conversions.length} conversion(s) with total value $${totalValue.toFixed(2)}`);
            dryRunBuilder.addRecommendation('Verify GCLIDs are valid and within attribution window');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('upload_click_conversions', 'Google Ads', customerId, { conversionActionId, conversions: conversions.length });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Conversion upload requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Uploading click conversions with confirmation', {
                customerId,
                conversionActionId,
                count: conversions.length,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const customer = client.getCustomer(customerId);
                // Format conversions for API
                const clickConversions = conversions.map((c) => ({
                    gclid: c.gclid,
                    conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
                    conversion_date_time: c.conversionDateTime,
                    conversion_value: c.conversionValue ? c.conversionValue * 1000000 : undefined,
                    currency_code: c.currencyCode || 'USD',
                }));
                // Upload conversions
                const uploadRequest = {
                    customer_id: customerId,
                    conversions: clickConversions,
                    partial_failure: true,
                };
                const response = await customer.conversionUploads.uploadClickConversions(uploadRequest);
                return response;
            });
            return {
                success: true,
                data: {
                    customerId,
                    conversionActionId,
                    conversionsUploaded: conversions.length,
                    totalValue: `$${totalValue.toFixed(2)}`,
                    result,
                    message: `✅ Uploaded ${conversions.length} click conversion(s) with total value $${totalValue.toFixed(2)}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to upload click conversions', error);
            throw error;
        }
    },
};
/**
 * Upload conversion adjustments
 */
export const uploadConversionAdjustmentsTool = {
    name: 'upload_conversion_adjustments',
    description: `Adjust previously uploaded conversions (update value, retract conversion).

💡 AGENT GUIDANCE - CONVERSION ADJUSTMENTS:

🎯 WHAT THIS DOES:
- Modify conversions after initial upload
- Update conversion value (customer upgraded/downgraded)
- Retract conversions (refunds, cancellations)
- Restate conversions with corrected data

📋 ADJUSTMENT TYPES:
- RETRACTION - Remove conversion (refund, cancellation)
- RESTATEMENT - Update conversion value or time
- ENHANCEMENT - Add additional conversion data

💡 COMMON USE CASES:
- Customer refunded → Retract conversion
- Customer upgraded from $100 to $500 plan → Restate with new value
- Conversion value calculated incorrectly → Restate with correct value
- Duplicate conversion uploaded → Retract duplicate

⚠️ REQUIREMENTS:
- Original conversion must exist (same GCLID + conversion action + time)
- Adjustment must be within 55 days of conversion
- GCLID must match exactly

📊 BEST PRACTICES:
- Upload adjustments promptly for accurate reporting
- Include adjustment type and reason
- Track adjustments in CRM for audit trail
- Verify adjustment succeeded`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            conversionActionId: {
                type: 'string',
                description: 'Conversion action ID',
            },
            adjustments: {
                type: 'array',
                description: 'Array of conversion adjustments',
                items: {
                    type: 'object',
                    properties: {
                        gclid: {
                            type: 'string',
                            description: 'Google Click ID (must match original conversion)',
                        },
                        conversionDateTime: {
                            type: 'string',
                            description: 'Original conversion date/time',
                        },
                        adjustmentType: {
                            type: 'string',
                            enum: ['RETRACTION', 'RESTATEMENT'],
                            description: 'RETRACTION (remove) or RESTATEMENT (update value)',
                        },
                        adjustedValue: {
                            type: 'number',
                            description: 'New conversion value for RESTATEMENT (optional)',
                        },
                        adjustmentDateTime: {
                            type: 'string',
                            description: 'When adjustment occurred (defaults to now)',
                        },
                    },
                    required: ['gclid', 'conversionDateTime', 'adjustmentType'],
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'conversionActionId', 'adjustments'],
    },
    async handler(input) {
        try {
            const { customerId, conversionActionId, adjustments, confirmationToken } = input;
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'upload_conversion_adjustments',
                inputText: `upload ${adjustments.length} conversion adjustments`,
                inputParams: { customerId, conversionActionId, adjustmentCount: adjustments.length },
            });
            // Check bulk limit
            if (adjustments.length > 2000) {
                throw new Error(`Cannot upload ${adjustments.length} adjustments at once. Maximum is 2,000. Please batch into smaller uploads.`);
            }
            const client = getGoogleAdsClient();
            // Count retractions vs restatements
            const retractionCount = adjustments.filter((a) => a.adjustmentType === 'RETRACTION').length;
            const restatementCount = adjustments.length - retractionCount;
            // Calculate total value impact
            const totalValueChange = adjustments
                .filter((a) => a.adjustmentType === 'RESTATEMENT' && a.adjustedValue)
                .reduce((sum, a) => sum + (a.adjustedValue || 0), 0);
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('upload_conversion_adjustments', 'Google Ads', customerId);
            // Show sample adjustments (first 5)
            const sampleSize = Math.min(5, adjustments.length);
            for (let i = 0; i < sampleSize; i++) {
                const adj = adjustments[i];
                dryRunBuilder.addChange({
                    resource: 'Conversion Adjustment',
                    resourceId: `adjustment_${i + 1}`,
                    field: 'adjustment',
                    currentValue: 'Original conversion',
                    newValue: `${adj.adjustmentType}: GCLID ${adj.gclid}${adj.adjustedValue ? `, New Value: $${adj.adjustedValue}` : ''}`,
                    changeType: 'update',
                });
            }
            if (adjustments.length > sampleSize) {
                dryRunBuilder.addChange({
                    resource: 'Conversion Adjustments',
                    resourceId: 'additional',
                    field: 'additional_adjustments',
                    currentValue: 'N/A',
                    newValue: `... and ${adjustments.length - sampleSize} more adjustments`,
                    changeType: 'update',
                });
            }
            dryRunBuilder.addRecommendation(`${retractionCount} retraction(s), ${restatementCount} restatement(s)`);
            if (retractionCount > 0) {
                dryRunBuilder.addRisk(`${retractionCount} conversion(s) will be removed (affects conversion reporting)`);
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('upload_conversion_adjustments', 'Google Ads', customerId, { conversionActionId, adjustments: adjustments.length });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Conversion adjustments require approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Uploading conversion adjustments with confirmation', {
                customerId,
                count: adjustments.length,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const customer = client.getCustomer(customerId);
                // Format adjustments for API
                const conversionAdjustments = adjustments.map((a) => ({
                    gclid_date_time_pair: {
                        gclid: a.gclid,
                        conversion_date_time: a.conversionDateTime,
                    },
                    conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
                    adjustment_type: a.adjustmentType,
                    adjustment_date_time: a.adjustmentDateTime || new Date().toISOString().replace('T', ' ').slice(0, 19),
                    restatement_value: a.adjustedValue && a.adjustmentType === 'RESTATEMENT'
                        ? {
                            adjusted_value: a.adjustedValue * 1000000,
                            currency_code: 'USD',
                        }
                        : undefined,
                }));
                const uploadRequest = {
                    customer_id: customerId,
                    conversion_adjustments: conversionAdjustments,
                    partial_failure: true,
                };
                const response = await customer.conversionAdjustmentUploads.uploadConversionAdjustments(uploadRequest);
                return response;
            });
            return {
                success: true,
                data: {
                    customerId,
                    conversionActionId,
                    adjustmentsUploaded: adjustments.length,
                    retractions: retractionCount,
                    restatements: restatementCount,
                    totalValueChange: `$${totalValueChange.toFixed(2)}`,
                    result,
                    message: `✅ Uploaded ${adjustments.length} conversion adjustment(s): ${retractionCount} retraction(s), ${restatementCount} restatement(s)`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to upload conversion adjustments', error);
            throw error;
        }
    },
};
/**
 * Get conversion action
 */
export const getConversionActionTool = {
    name: 'get_conversion_action',
    description: `Get details of a specific conversion action.

💡 AGENT GUIDANCE:

📊 WHAT YOU'LL GET:
- Conversion action settings and configuration
- Tracking tag/snippet for implementation
- Attribution window, counting method
- Value settings
- Recent conversion stats

🎯 USE CASES:
- "Get details for conversion action ID 12345"
- "Check attribution window for Purchase conversion"
- "See if conversion uses transaction-specific or fixed value"`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            conversionActionId: {
                type: 'string',
                description: 'Conversion action ID',
            },
        },
        required: ['customerId', 'conversionActionId'],
    },
    async handler(input) {
        try {
            const { customerId, conversionActionId } = input;
            const client = getGoogleAdsClient();
            logger.info('Getting conversion action', { customerId, conversionActionId });
            const query = `
        SELECT
          conversion_action.id,
          conversion_action.name,
          conversion_action.category,
          conversion_action.status,
          conversion_action.type,
          conversion_action.counting_type,
          conversion_action.click_through_lookback_window_days,
          conversion_action.view_through_lookback_window_days,
          conversion_action.value_settings.default_value,
          conversion_action.value_settings.always_use_default_value,
          conversion_action.tag_snippets
        FROM conversion_action
        WHERE conversion_action.id = ${conversionActionId}
      `;
            const customer = client.getCustomer(customerId);
            const results = await customer.query(query);
            let conversionAction = null;
            for (const row of results) {
                const action = row.conversion_action;
                conversionAction = {
                    id: String(action?.id || ''),
                    name: String(action?.name || ''),
                    category: String(action?.category || ''),
                    status: String(action?.status || ''),
                    type: String(action?.type || ''),
                    countingType: String(action?.counting_type || ''),
                    clickThroughWindow: parseInt(String(action?.click_through_lookback_window_days || 30)),
                    viewThroughWindow: parseInt(String(action?.view_through_lookback_window_days || 1)),
                    defaultValue: action?.value_settings?.default_value
                        ? parseFloat(String(action.value_settings.default_value)) / 1000000
                        : undefined,
                    alwaysUseDefaultValue: action?.value_settings?.always_use_default_value || false,
                    tagSnippets: action?.tag_snippets || [],
                };
            }
            if (!conversionAction) {
                throw new Error(`Conversion action ${conversionActionId} not found`);
            }
            return {
                success: true,
                data: {
                    customerId,
                    conversionAction,
                    message: `Retrieved conversion action: ${conversionAction.name}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to get conversion action', error);
            throw error;
        }
    },
};
/**
 * Export conversion tools
 */
export const conversionTools = [
    listConversionActionsTool,
    getConversionActionTool,
    createConversionActionTool,
    uploadClickConversionsTool,
    uploadConversionAdjustmentsTool,
];
//# sourceMappingURL=conversions.js.map