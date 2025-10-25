/**
 * MCP Tools for Google Business Profile API
 * Location management, reviews, posts, media, performance
 */
import { extractOAuthToken, createBusinessProfileClient } from '../shared/oauth-client-factory.js';
import { getLogger } from '../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../shared/vagueness-detector.js';
const logger = getLogger('business-profile.tools');
/**
 * List business locations
 */
export const listLocationsTool = {
    name: 'list_business_locations',
    description: `List all Google Business Profile locations for an account.

💡 AGENT GUIDANCE - BUSINESS LOCATIONS:

📊 WHAT YOU'LL GET:
- Location name and ID
- Business address
- Phone numbers
- Website URL
- Categories
- Verification status

🎯 USE CASES:
- "Show all business locations"
- "Get locations for multi-location client"
- "Check which locations are verified"`,
    inputSchema: {
        type: 'object',
        properties: {
            accountId: {
                type: 'string',
                description: 'Business Profile account ID',
            },
        },
        required: ['accountId'],
    },
    async handler(input) {
        try {
            const { accountId } = input;
            // Extract OAuth token from request
            const oauthToken = extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Business Profile API access');
            }
            // Create Business Profile client with user's OAuth token
            const client = createBusinessProfileClient(oauthToken);
            logger.info('Listing business locations', { accountId });
            const response = await client.businessinformation.accounts.locations.list({
                parent: `accounts/${accountId}`,
                readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,profile',
            });
            const locations = response.data.locations || [];
            const formatted = locations.map((loc) => ({
                name: loc.name,
                locationId: loc.name?.split('/')[3] || '',
                title: loc.title,
                address: loc.storefrontAddress,
                websiteUri: loc.websiteUri,
                phoneNumbers: loc.phoneNumbers,
                categories: loc.categories,
            }));
            return {
                success: true,
                data: {
                    accountId,
                    locations: formatted,
                    count: formatted.length,
                    message: `Found ${formatted.length} location(s)`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to list locations', error);
            throw error;
        }
    },
};
/**
 * Get location details
 */
export const getLocationTool = {
    name: 'get_business_location',
    description: `Get detailed information for a specific business location.

💡 AGENT GUIDANCE:

📊 WHAT YOU'LL GET:
- Complete location details
- Business hours
- Categories
- Phone numbers
- Reviews summary
- Verification status

🎯 USE CASES:
- "Get full details for location ID xyz"
- "Check business hours for a location"
- "See verification status"`,
    inputSchema: {
        type: 'object',
        properties: {
            locationName: {
                type: 'string',
                description: 'Location resource name (accounts/{accountId}/locations/{locationId})',
            },
        },
        required: ['locationName'],
    },
    async handler(input) {
        try {
            const { locationName } = input;
            // Extract OAuth token from request
            const oauthToken = extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Business Profile API access');
            }
            // Create Business Profile client with user's OAuth token
            const client = createBusinessProfileClient(oauthToken);
            logger.info('Getting location details', { locationName });
            const response = await client.businessinformation.locations.get({
                name: locationName,
                readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours,profile',
            });
            const location = response.data;
            return {
                success: true,
                data: {
                    location,
                    message: `Retrieved location: ${location.title}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to get location', error);
            throw error;
        }
    },
};
/**
 * Update business location
 */
export const updateLocationTool = {
    name: 'update_business_location',
    description: `Update business location information (hours, description, phone, etc.).

💡 AGENT GUIDANCE - UPDATE LOCATIONS:

🎯 WHAT THIS DOES:
- Update location details
- Change business hours
- Update phone numbers, website
- Modify categories

⚠️ UPDATEABLE FIELDS:
- title (business name)
- phoneNumbers
- websiteUri
- regularHours
- categories
- profile (description)

💡 COMMON USE CASES:
- "Update business hours for holiday schedule"
- "Change phone number for all locations"
- "Update website URL after rebrand"

⚠️ BULK OPERATIONS:
- Use vagueness check for bulk updates
- Show all locations being updated before confirming`,
    inputSchema: {
        type: 'object',
        properties: {
            locationName: {
                type: 'string',
                description: 'Location resource name',
            },
            updates: {
                type: 'object',
                description: 'Fields to update',
                properties: {
                    title: { type: 'string' },
                    websiteUri: { type: 'string' },
                    phoneNumbers: { type: 'object' },
                    regularHours: { type: 'object' },
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token (optional)',
            },
        },
        required: ['locationName', 'updates'],
    },
    async handler(input) {
        try {
            const { locationName, updates, confirmationToken } = input;
            // Extract OAuth token from request
            const oauthToken = extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Business Profile API access');
            }
            detectAndEnforceVagueness({
                operation: 'update_business_location',
                inputText: `update location ${locationName}`,
                inputParams: { locationName, updates },
            });
            // Create Business Profile client with user's OAuth token
            const client = createBusinessProfileClient(oauthToken);
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('update_business_location', 'Google Business Profile', locationName);
            Object.keys(updates).forEach((field) => {
                dryRunBuilder.addChange({
                    resource: 'Business Location',
                    resourceId: locationName,
                    field,
                    currentValue: 'Current value',
                    newValue: JSON.stringify(updates[field]),
                    changeType: 'update',
                });
            });
            dryRunBuilder.addRecommendation('Changes may take 24-48 hours to appear on Google');
            const dryRun = dryRunBuilder.build();
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('update_business_location', 'Google Business Profile', locationName, { updates });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return { success: true, requiresApproval: true, preview, confirmationToken: token };
            }
            logger.info('Updating location with confirmation', { locationName });
            await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const updateMask = Object.keys(updates);
                const response = await client.businessinformation.locations.patch({
                    name: locationName,
                    updateMask: updateMask.join(','),
                    requestBody: updates,
                });
                return response.data;
            });
            return {
                success: true,
                data: {
                    locationName,
                    updatedFields: Object.keys(updates),
                    message: `✅ Location updated successfully`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to update location', error);
            throw error;
        }
    },
};
/**
 * Export Business Profile tools
 */
export const businessProfileTools = [
    listLocationsTool,
    getLocationTool,
    updateLocationTool,
];
//# sourceMappingURL=tools.js.map