/**
 * MCP Tools for Google Business Profile API
 * Location management, reviews, posts, media, performance
 */
import { extractOAuthToken, createBusinessProfileClient } from '../shared/oauth-client-factory.js';
import { getLogger } from '../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../shared/vagueness-detector.js';
import { formatDiscoveryResponse, injectGuidance, formatNextSteps } from '../shared/interactive-workflow.js';
const logger = getLogger('business-profile.tools');
/**
 * List business locations
 */
export const listLocationsTool = {
    name: 'list_business_locations',
    description: 'List all Google Business Profile locations for an account',
    inputSchema: {
        type: 'object',
        properties: {
            accountId: {
                type: 'string',
                description: 'Business Profile account ID',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { accountId } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Business Profile API access');
            }
            // Create Business Profile client with user's OAuth token
            const client = createBusinessProfileClient(oauthToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!accountId) {
                logger.info('Account discovery mode - listing accounts');
                const accountsResponse = await client.accounts.list();
                const accounts = accountsResponse.data.accounts || [];
                if (accounts.length === 0) {
                    return injectGuidance({ accounts: [] }, `⚠️ NO BUSINESS PROFILE ACCOUNTS FOUND

You don't have access to any Google Business Profile accounts yet.

💡 TO GET STARTED:
1. Visit https://business.google.com
2. Create or claim your business
3. Verify ownership
4. Return here to manage your locations

${formatNextSteps([
                        'Visit Google Business Profile: https://business.google.com',
                        'Learn about verification: https://support.google.com/business/answer/7107242'
                    ])}`);
                }
                return formatDiscoveryResponse({
                    step: '1/1',
                    title: 'SELECT BUSINESS PROFILE ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => {
                        const account = a;
                        return `${i + 1}. ${account.accountName || account.name}
   Account ID: ${account.name?.split('/')[1] || 'Unknown'}
   Type: ${account.type || 'Standard'}`;
                    },
                    prompt: 'Which account\'s locations do you want to list?',
                    nextParam: 'accountId',
                    emoji: '🏢',
                });
            }
            // ═══ STEP 2: EXECUTE WITH ANALYSIS ═══
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
            // Generate insights
            const insights = [];
            if (formatted.length === 0) {
                insights.push('⚠️ No locations found - consider adding your first business location');
            }
            else if (formatted.length === 1) {
                insights.push('✅ Single location business');
            }
            else {
                insights.push(`✅ Multi-location business with ${formatted.length} locations`);
            }
            const locationsWithWebsite = formatted.filter(l => l.websiteUri).length;
            const locationsWithPhone = formatted.filter(l => l.phoneNumbers?.length > 0).length;
            if (locationsWithWebsite < formatted.length) {
                insights.push(`⚠️ ${formatted.length - locationsWithWebsite} location(s) missing website`);
            }
            if (locationsWithPhone < formatted.length) {
                insights.push(`⚠️ ${formatted.length - locationsWithPhone} location(s) missing phone number`);
            }
            const guidanceText = `🏢 BUSINESS PROFILE LOCATIONS

**Account ID:** ${accountId}
**Total Locations:** ${formatted.length}

**LOCATIONS:**
${formatted.length > 0
                ? formatted.map((loc, i) => `${i + 1}. ${loc.title || 'Unnamed Location'}
   Location ID: ${loc.locationId}
   Address: ${loc.address?.addressLines?.join(', ') || 'No address'}
   Phone: ${loc.phoneNumbers?.[0]?.primaryPhone || 'None'}
   Website: ${loc.websiteUri || 'None'}
   Categories: ${loc.categories?.map((c) => c.displayName).join(', ') || 'None'}`)
                    .join('\n\n')
                : '(No locations found)'}

💡 KEY INSIGHTS:
${insights.map(i => `   • ${i}`).join('\n')}

${formatNextSteps([
                'Get details: use get_business_location with location ID',
                'Update location: use update_business_location',
                'Add missing info: Ensure all locations have complete data',
                'Verify locations: Check verification status in Business Profile'
            ])}

Full location data available in structured output.`;
            return injectGuidance({
                accountId,
                locations: formatted,
                count: formatted.length,
            }, guidanceText);
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
    description: 'Get detailed information for a specific business location',
    inputSchema: {
        type: 'object',
        properties: {
            accountId: {
                type: 'string',
                description: 'Business Profile account ID',
            },
            locationId: {
                type: 'string',
                description: 'Location ID',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { accountId, locationId } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Business Profile API access');
            }
            // Create Business Profile client with user's OAuth token
            const client = createBusinessProfileClient(oauthToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!accountId) {
                logger.info('Account discovery mode - listing accounts');
                const accountsResponse = await client.accounts.list();
                const accounts = accountsResponse.data.accounts || [];
                return formatDiscoveryResponse({
                    step: '1/2',
                    title: 'SELECT BUSINESS PROFILE ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => {
                        const account = a;
                        return `${i + 1}. ${account.accountName || account.name}
   Account ID: ${account.name?.split('/')[1] || 'Unknown'}`;
                    },
                    prompt: 'Which account contains the location?',
                    nextParam: 'accountId',
                    emoji: '🏢',
                });
            }
            // ═══ STEP 2: LOCATION DISCOVERY ═══
            if (!locationId) {
                const response = await client.businessinformation.accounts.locations.list({
                    parent: `accounts/${accountId}`,
                    readMask: 'name,title,storefrontAddress',
                });
                const locations = response.data.locations || [];
                if (locations.length === 0) {
                    return injectGuidance({ accountId, locations: [] }, `⚠️ NO LOCATIONS FOUND

**Account ID:** ${accountId}

No locations found in this account.

${formatNextSteps([
                        'List all accounts: use list_business_locations without parameters',
                        'Add a location: Visit https://business.google.com'
                    ])}`);
                }
                return formatDiscoveryResponse({
                    step: '2/2',
                    title: 'SELECT LOCATION',
                    items: locations,
                    itemFormatter: (l, i) => {
                        const location = l;
                        return `${i + 1}. ${location.title || 'Unnamed Location'}
   Location ID: ${location.name?.split('/')[3] || 'Unknown'}
   Address: ${location.storefrontAddress?.addressLines?.join(', ') || 'No address'}`;
                    },
                    prompt: 'Which location do you want details for?',
                    nextParam: 'locationId',
                    context: { accountId },
                });
            }
            // ═══ STEP 3: EXECUTE WITH ANALYSIS ═══
            const locationName = `accounts/${accountId}/locations/${locationId}`;
            logger.info('Getting location details', { locationName });
            const response = await client.businessinformation.locations.get({
                name: locationName,
                readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours,profile',
            });
            const location = response.data;
            // Generate insights
            const insights = [];
            if (!location.websiteUri) {
                insights.push('⚠️ No website URL - consider adding one to increase visibility');
            }
            if (!location.phoneNumbers || (Array.isArray(location.phoneNumbers) && location.phoneNumbers.length === 0)) {
                insights.push('⚠️ No phone numbers - customers need a way to contact you');
            }
            if (!location.regularHours) {
                insights.push('⚠️ No business hours set - helps customers know when you\'re open');
            }
            if (!location.categories || (Array.isArray(location.categories) && location.categories.length === 0)) {
                insights.push('⚠️ No categories - helps customers find you in search');
            }
            if (insights.length === 0) {
                insights.push('✅ Location profile is complete');
            }
            const guidanceText = `🏢 BUSINESS LOCATION DETAILS

**Location:** ${location.title || 'Unnamed Location'}
**Location ID:** ${locationId}

**ADDRESS:**
${location.storefrontAddress?.addressLines?.join('\n') || 'No address'}
${location.storefrontAddress?.locality || ''}, ${location.storefrontAddress?.administrativeArea || ''} ${location.storefrontAddress?.postalCode || ''}
${location.storefrontAddress?.regionCode || ''}

**CONTACT:**
- Phone: ${(Array.isArray(location.phoneNumbers) ? location.phoneNumbers[0]?.primaryPhone : null) || 'None'}
- Website: ${location.websiteUri || 'None'}

**CATEGORIES:**
${(Array.isArray(location.categories) ? location.categories : []).map((c) => `- ${c.displayName}`).join('\n') || 'None'}

**BUSINESS HOURS:**
${(location.regularHours?.periods?.length ?? 0) > 0
                ? location.regularHours?.periods?.map((p) => `${p.openDay}: ${p.openTime?.hours || '00'}:${p.openTime?.minutes || '00'} - ${p.closeTime?.hours || '00'}:${p.closeTime?.minutes || '00'}`)
                    .join('\n')
                : 'Not set'}

**PROFILE:**
- Description: ${location.profile?.description || 'None'}

💡 KEY INSIGHTS:
${insights.map(i => `   • ${i}`).join('\n')}

${formatNextSteps([
                'Update location: use update_business_location',
                'List all locations: use list_business_locations',
                'View in Business Profile: https://business.google.com'
            ])}

Full location data available in structured output.`;
            return injectGuidance(location, guidanceText);
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
    description: 'Update business location information (hours, phone, website, etc.).',
    inputSchema: {
        type: 'object',
        properties: {
            accountId: {
                type: 'string',
                description: 'Business Profile account ID',
            },
            locationId: {
                type: 'string',
                description: 'Location ID',
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
        required: [],
    },
    async handler(input) {
        try {
            const { accountId, locationId, updates, confirmationToken } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Business Profile API access');
            }
            // Create Business Profile client with user's OAuth token
            const client = createBusinessProfileClient(oauthToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!accountId) {
                logger.info('Account discovery mode');
                const accountsResponse = await client.accounts.list();
                const accounts = accountsResponse.data.accounts || [];
                return formatDiscoveryResponse({
                    step: '1/4',
                    title: 'SELECT BUSINESS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => {
                        const account = a;
                        return `${i + 1}. ${account.accountName || account.name}
   Account ID: ${account.name?.split('/')[1] || 'Unknown'}`;
                    },
                    prompt: 'Which account contains the location to update?',
                    nextParam: 'accountId',
                    emoji: '🏢',
                });
            }
            // ═══ STEP 2: LOCATION DISCOVERY ═══
            if (!locationId) {
                const locationsResponse = await client.businessinformation.accounts.locations.list({
                    parent: `accounts/${accountId}`,
                    readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers',
                });
                const locations = locationsResponse.data.locations || [];
                if (locations.length === 0) {
                    throw new Error(`No locations found for account ${accountId}`);
                }
                return formatDiscoveryResponse({
                    step: '2/4',
                    title: 'SELECT LOCATION',
                    items: locations,
                    itemFormatter: (l, i) => {
                        const loc = l;
                        return `${i + 1}. ${loc.title}
   Location ID: ${loc.name?.split('/')[3] || 'Unknown'}
   Address: ${loc.storefrontAddress?.addressLines?.[0] || 'N/A'}
   Phone: ${loc.phoneNumbers?.[0]?.primaryPhone || 'None'}`;
                    },
                    prompt: 'Which location to update?',
                    nextParam: 'locationId',
                    context: { accountId },
                });
            }
            // ═══ STEP 3: SHOW CURRENT VALUES ═══
            const locationName = `accounts/${accountId}/locations/${locationId}`;
            if (!updates || Object.keys(updates).length === 0) {
                const currentLocation = await client.businessinformation.locations.get({
                    name: locationName,
                    readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,regularHours',
                });
                const loc = currentLocation.data;
                const guidanceText = `📝 CURRENT LOCATION DETAILS (Step 3/4)

**Location:** ${loc.title}
**Location ID:** ${locationId}

**Current Values:**
- **Title:** ${loc.title || 'N/A'}
- **Website:** ${loc.websiteUri || 'N/A'}
- **Phone:** ${(Array.isArray(loc.phoneNumbers) ? loc.phoneNumbers[0]?.primaryPhone : null) || 'N/A'}
- **Address:** ${loc.storefrontAddress?.addressLines?.join(', ') || 'N/A'}

**Business Hours:**
${loc.regularHours?.periods?.map((p) => `   • ${p.openDay}: ${p.openTime?.hours || '00'}:${p.openTime?.minutes || '00'} - ${p.closeTime?.hours || '00'}:${p.closeTime?.minutes || '00'}`).join('\n') || '   Not set'}

**Updateable Fields:**
- title: Business name
- websiteUri: Website URL
- phoneNumbers: Array of phone objects
- regularHours: Business hours object

💡 **What would you like to update?**
Provide: updates parameter as JSON object

**Example:**
\`\`\`json
{
  "websiteUri": "https://newwebsite.com",
  "phoneNumbers": [{ "primaryPhone": "+1-555-0123" }]
}
\`\`\``;
                return injectGuidance({ currentLocation: loc, nextParam: 'updates' }, guidanceText);
            }
            // ═══ STEP 4: DRY-RUN PREVIEW ═══
            detectAndEnforceVagueness({
                operation: 'update_business_location',
                inputText: `update location ${locationName}`,
                inputParams: { locationName, updates },
            });
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('update_business_location', 'Google Business Profile', locationName);
            // Fetch current values for comparison
            const currentLocation = await client.businessinformation.locations.get({
                name: locationName,
                readMask: 'name,title,websiteUri,phoneNumbers,regularHours',
            });
            const current = currentLocation.data;
            Object.keys(updates).forEach((field) => {
                dryRunBuilder.addChange({
                    resource: 'Business Location',
                    resourceId: locationName,
                    field,
                    currentValue: JSON.stringify(current[field] || 'N/A'),
                    newValue: JSON.stringify(updates[field]),
                    changeType: 'update',
                });
            });
            dryRunBuilder.addRecommendation('Changes may take 24-48 hours to appear on Google Search and Maps');
            dryRunBuilder.addRecommendation('Verify changes in Google Business Profile dashboard after update');
            const dryRun = dryRunBuilder.build();
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('update_business_location', 'Google Business Profile', locationName, { updates });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return { success: true, requiresApproval: true, preview, confirmationToken: token };
            }
            // ═══ STEP 5: EXECUTE WITH CONFIRMATION ═══
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
            const guidanceText = `✅ BUSINESS LOCATION UPDATED

**Location:** ${locationName}
**Fields Updated:** ${Object.keys(updates).join(', ')}

**Changes:**
${Object.entries(updates).map(([field, value]) => `   • ${field}: ${JSON.stringify(value)}`).join('\n')}

⏱️ **Timeline:**
- Changes propagate to Google within 24-48 hours
- Verify in Google Business Profile dashboard
- Check Google Search and Maps for public visibility

${formatNextSteps([
                'Verify changes: use get_business_location',
                'Update other locations: use update_business_location again',
                'Check all locations: use list_business_locations',
                'Monitor reviews: Check Business Profile dashboard'
            ])}`;
            return injectGuidance({
                locationName,
                updatedFields: Object.keys(updates),
                updates,
            }, guidanceText);
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