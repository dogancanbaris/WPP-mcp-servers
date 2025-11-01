/**
 * Create Location Bid Modifier Tool
 *
 * MCP tool for creating location bid modifiers (adjust bids by +/-% for specific geographic locations).
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';
const logger = getLogger('ads.tools.bid-modifiers.location');
const audit = getAuditLogger();
/**
 * Create location bid modifier
 */
export const createLocationBidModifierTool = {
    name: 'create_location_bid_modifier',
    description: `Create a location bid modifier to adjust bids by percentage for specific geographic locations.

💡 AGENT GUIDANCE - LOCATION BID MODIFIERS:

⚠️ WHAT ARE LOCATION BID MODIFIERS?
Adjust your bids up or down based on the user's physical location (country, state, city, zip code).

**Example:**
- New York converts 40% better → Set +40% modifier
- Rural areas convert poorly → Set -30% modifier
- California high competition → Set +50% modifier

📋 MODIFIER RANGE:
- Minimum: -90% (reduce bids by 90%)
- Maximum: +900% (increase bids by 900%)
- Special: -100% = exclude location entirely

💡 BEST PRACTICES - LOCATION TARGETING:
- Review "Locations" report BEFORE setting modifiers
- Urban vs rural often have different conversion rates
- Consider local competition levels
- Test high-value markets with increased bids
- Start conservative (±10-20%), optimize over time

🎯 TYPICAL USE CASES:
1. **High-value markets** → +30% to +60% in NYC, SF, LA
2. **Low-performing regions** → -20% to -40% in underperforming states
3. **Exclude locations** → -100% for non-serviceable areas
4. **Localized campaigns** → +50% in store proximity (5-10 mile radius)

⚠️ COMMON MISTAKES TO AVOID:
- Setting modifiers without location performance data
- Too granular (city-level) without enough volume
- Forgetting to check "Location of interest" vs "Location of presence"
- Not accounting for seasonality (tourism, events)

📊 LOCATION TYPES:
- **Country** → United States, Canada, UK (Geo Target Constant ID)
- **State/Region** → California, Texas, New York
- **City** → New York City, Los Angeles, Chicago
- **Postal Code** → 10001, 90210, 60601
- **Radius** → 10 miles around address

🔍 FINDING LOCATION IDs:
Use Google Ads Geo Target Constants:
- United States = 2840
- California = 21137
- New York (state) = 21167
- New York City = 1023191
See: https://developers.google.com/google-ads/api/data/geotargets

💰 FINANCIAL IMPACT:
A +40% modifier in NYC on $2.00 bids = $2.80 effective bid
A -30% modifier in rural areas on $1.00 bids = $0.70 effective bid`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to apply modifier to',
            },
            locationId: {
                type: 'string',
                description: 'Google Ads Geo Target Constant ID (e.g., 2840 for United States, 21137 for California)',
            },
            locationName: {
                type: 'string',
                description: 'Location name for display (e.g., "California", "New York City")',
            },
            bidModifierPercent: {
                type: 'number',
                description: 'Bid adjustment percentage (-90 to +900, e.g., 40 = +40%, -30 = -30%)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
            const { customerId, campaignId, locationId, locationName, bidModifierPercent, confirmationToken } = input;
            // Extract OAuth tokens
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!customerId) {
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/5',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                if (campaigns.length === 0) {
                    return injectGuidance({ customerId }, '⚠️ NO CAMPAIGNS FOUND\n\nCreate a campaign first using create_campaign tool.');
                }
                return formatDiscoveryResponse({
                    step: '2/5',
                    title: 'SELECT CAMPAIGN',
                    items: campaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'Unnamed'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}`;
                    },
                    prompt: 'Which campaign should have location bid modifiers?',
                    nextParam: 'campaignId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: LOCATION ID GUIDANCE ═══
            if (!locationId) {
                const guidanceText = `🌍 ENTER LOCATION ID (Step 3/5)

You need a Google Ads Geo Target Constant ID for the location.

**Common Location IDs:**

**Countries:**
• United States → 2840
• Canada → 2124
• United Kingdom → 2826
• Australia → 2036

**US States:**
• California → 21137
• Texas → 21176
• New York → 21167
• Florida → 21139
• Illinois → 21141

**Major US Cities:**
• New York City → 1023191
• Los Angeles → 1015116
• Chicago → 1014044
• Houston → 1014221
• Phoenix → 1022876

**How to Find Location IDs:**
1. Visit: https://developers.google.com/google-ads/api/data/geotargets
2. Search for your location
3. Copy the "Criteria ID"
4. Provide that ID here

**Alternative:**
If you don't have the ID, you can:
1. Check your "Locations" report in Google Ads UI
2. Look for location performance data
3. Use the location name to find the ID in the geotargets list

**Provide:** locationId (Geo Target Constant ID number)

What is the location ID?`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // ═══ STEP 4: LOCATION NAME ═══
            if (!locationName) {
                const guidanceText = `📍 ENTER LOCATION NAME (Step 4/5)

**Location ID:** ${locationId}

For display purposes, provide the location name.

**Examples:**
• Location ID 2840 → "United States"
• Location ID 21137 → "California"
• Location ID 1023191 → "New York City"
• Location ID 21176 → "Texas"

This name is for your reference and will be displayed in reports.

**Provide:** locationName (string, e.g., "California")

What is the location name?`;
                return injectGuidance({ customerId, campaignId, locationId }, guidanceText);
            }
            // ═══ STEP 5: BID MODIFIER PERCENTAGE ═══
            if (bidModifierPercent === undefined) {
                const guidanceText = `📊 SET BID MODIFIER PERCENTAGE (Step 5/5)

**Campaign:** ID ${campaignId}
**Location:** ${locationName} (ID: ${locationId})

Enter the bid adjustment percentage:

**Modifier Range:**
- **-90% to +900%** (valid range)
- **-100%** = Exclude location entirely (no ads shown)
- **0%** = No adjustment (default)

**Examples:**

**Increase Bids (Location performs well):**
• +20% = Raise bids by 20% in ${locationName}
• +40% = Raise bids by 40% (moderate increase)
• +60% = Raise bids by 60% (aggressive, high-value market)

**Decrease Bids (Location performs poorly):**
• -10% = Lower bids by 10% in ${locationName}
• -30% = Lower bids by 30% (moderate decrease)
• -50% = Lower bids by 50% (low-performing market)

**Exclude Location:**
• -100% = Don't show ads in ${locationName}

**Financial Impact:**
If base bid = $1.50:
• +40% modifier → Effective bid = $2.10 in ${locationName}
• -30% modifier → Effective bid = $1.05 in ${locationName}
• -100% modifier → No ads shown in ${locationName}

**Best Practice:**
1. Review "Locations" report for performance data
2. Start conservative (±10-30%)
3. Higher modifiers for high-value markets (NYC, SF, LA)
4. Monitor for 14-30 days before adjusting
5. Consider seasonality (tourism, events)

**Provide:** bidModifierPercent (number from -90 to +900)

What percentage adjustment for ${locationName}?`;
                return injectGuidance({ customerId, campaignId, locationId, locationName }, guidanceText);
            }
            // Validate modifier range
            if (bidModifierPercent < -100 || bidModifierPercent > 900) {
                throw new Error('Bid modifier must be between -100% (exclude) and +900%. Provided: ' + bidModifierPercent);
            }
            // ═══ STEP 6: DRY-RUN PREVIEW ═══
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_location_bid_modifier', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Campaign Bid Modifier',
                resourceId: campaignId,
                field: `${locationName} bid modifier`,
                currentValue: '0% (no adjustment)',
                newValue: `${bidModifierPercent > 0 ? '+' : ''}${bidModifierPercent}%`,
                changeType: 'create',
            });
            // Calculate financial impact
            const isIncrease = bidModifierPercent > 0;
            const impactDescription = bidModifierPercent === -100
                ? `All ads in ${locationName} will be EXCLUDED (not shown)`
                : `All bids in ${locationName} will be ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`;
            dryRunBuilder.addChange({
                resource: 'Financial Impact',
                resourceId: campaignId,
                field: 'Bid adjustment',
                currentValue: 'No adjustment',
                newValue: impactDescription,
                changeType: 'update',
            });
            // Add warnings
            if (Math.abs(bidModifierPercent) >= 50) {
                dryRunBuilder.addRecommendation(`⚠️ Large bid adjustment (${bidModifierPercent}%) for ${locationName}. This will significantly impact spend in this location.`);
            }
            if (bidModifierPercent === -100) {
                dryRunBuilder.addRecommendation(`🚫 EXCLUSION: Ads will NOT show in ${locationName}. Ensure this is intentional.`);
            }
            if (Math.abs(bidModifierPercent) < 10) {
                dryRunBuilder.addRecommendation(`ℹ️ Small adjustment (${bidModifierPercent}%). May have minimal impact on ${locationName} performance.`);
            }
            dryRunBuilder.addRecommendation(`📊 Monitor ${locationName} performance after this change. Check "Locations" report in 14-30 days.`);
            dryRunBuilder.addRecommendation(`🌍 Consider other nearby locations. If ${locationName} performs well, adjacent areas might too.`);
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_location_bid_modifier', 'Google Ads', customerId, { campaignId, locationId, locationName, bidModifierPercent });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Location bid modifier creation requires approval. Review the preview and call this tool again with confirmationToken.',
                };
            }
            // ═══ STEP 7: EXECUTE MODIFIER CREATION ═══
            logger.info('Creating location bid modifier', {
                customerId,
                campaignId,
                locationId,
                locationName,
                bidModifierPercent,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const customer = client.getCustomer(customerId);
                // Convert percentage to multiplier
                const bidModifier = bidModifierPercent === -100 ? 0 : 1 + bidModifierPercent / 100;
                const operation = {
                    campaign: `customers/${customerId}/campaigns/${campaignId}`,
                    location: {
                        geo_target_constant: `geoTargetConstants/${locationId}`,
                    },
                    bid_modifier: bidModifier,
                };
                const createResult = await customer.campaignCriteria.create([operation]);
                return createResult;
            });
            // AUDIT: Log successful modifier creation
            await audit.logWriteOperation('user', 'create_location_bid_modifier', customerId, {
                campaignId,
                locationId,
                locationName,
                bidModifierPercent,
                resultId: result,
            });
            return {
                success: true,
                data: {
                    customerId,
                    campaignId,
                    locationId,
                    locationName,
                    bidModifierPercent,
                    modifierId: result,
                    message: `✅ Location bid modifier created: ${locationName} bids ${bidModifierPercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`,
                },
                nextSteps: [
                    `Monitor ${locationName} performance in "Locations" report`,
                    'Check spend and conversions after 14-30 days',
                    'Consider adding modifiers for other high/low-performing locations',
                    'Adjust modifier if needed based on performance data',
                ],
            };
        }
        catch (error) {
            logger.error('Failed to create location bid modifier', error);
            await audit.logFailedOperation('user', 'create_location_bid_modifier', input.customerId, error.message, {
                campaignId: input.campaignId,
                locationId: input.locationId,
                locationName: input.locationName,
                bidModifierPercent: input.bidModifierPercent,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=create-location-bid-modifier.tool.js.map