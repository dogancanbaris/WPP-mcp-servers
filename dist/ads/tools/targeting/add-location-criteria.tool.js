/**
 * Add Location Targeting Criteria Tool
 *
 * MCP tool for adding geographic location targeting to campaigns.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance, formatSuccessSummary } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { DryRunBuilder } from '../../../shared/dry-run-builder.js';
const logger = getLogger('ads.tools.targeting.location');
const audit = getAuditLogger();
/**
 * Common geo target constants (countries)
 */
const COMMON_COUNTRIES = [
    { id: '2840', name: 'United States', type: 'Country' },
    { id: '2826', name: 'United Kingdom', type: 'Country' },
    { id: '2124', name: 'Canada', type: 'Country' },
    { id: '2036', name: 'Australia', type: 'Country' },
    { id: '2276', name: 'Germany', type: 'Country' },
    { id: '2250', name: 'France', type: 'Country' },
    { id: '2380', name: 'Italy', type: 'Country' },
    { id: '2724', name: 'Spain', type: 'Country' },
    { id: '2392', name: 'Japan', type: 'Country' },
    { id: '2156', name: 'China', type: 'Country' },
];
/**
 * Major US cities (examples)
 */
const US_MAJOR_CITIES = [
    { id: '1023191', name: 'New York, NY', parent: 'United States' },
    { id: '1013962', name: 'Los Angeles, CA', parent: 'United States' },
    { id: '1014044', name: 'Chicago, IL', parent: 'United States' },
    { id: '1026047', name: 'Houston, TX', parent: 'United States' },
    { id: '1023369', name: 'Phoenix, AZ', parent: 'United States' },
    { id: '1023371', name: 'Philadelphia, PA', parent: 'United States' },
    { id: '1025356', name: 'San Antonio, TX', parent: 'United States' },
    { id: '1023768', name: 'San Diego, CA', parent: 'United States' },
    { id: '1025202', name: 'Dallas, TX', parent: 'United States' },
    { id: '1023511', name: 'San Jose, CA', parent: 'United States' },
];
export const addLocationCriteriaTool = {
    name: 'add_location_criteria',
    description: `Add geographic location targeting to a campaign.`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to add location targeting',
            },
            geoTargetIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of geo target constant IDs (e.g., ["2840"] for USA)',
            },
            radiusTargeting: {
                type: 'object',
                properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    radiusMiles: { type: 'number' },
                },
                description: 'Optional: Target radius around coordinates',
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
            const { customerId, campaignId, geoTargetIds, radiusTargeting, confirmationToken } = input;
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required. OMA must provide X-Google-Refresh-Token header.');
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
                    prompt: 'Which account contains the campaign?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                if (campaigns.length === 0) {
                    const guidanceText = `⚠️ NO CAMPAIGNS FOUND (Step 2/5)

This account has no campaigns. Create a campaign first before adding location targeting.

**Next Steps:**
1. Use create_campaign to create a campaign
2. Then return here to add location targeting`;
                    return injectGuidance({ customerId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '2/5',
                    title: 'SELECT CAMPAIGN',
                    items: campaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'Unnamed'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
                    },
                    prompt: 'Which campaign should have location targeting?',
                    nextParam: 'campaignId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: LOCATION TYPE GUIDANCE ═══
            if (!geoTargetIds && !radiusTargeting) {
                const guidanceText = `🌍 LOCATION TARGETING OPTIONS (Step 3/5)

Choose how to target by location:

**Option 1: Geographic Locations (Countries/Cities/Regions)**
Provide geoTargetIds array with geo target constant IDs.

**Common Countries:**
${COMMON_COUNTRIES.map((c) => `• ${c.name}: geoTargetIds: ["${c.id}"]`).join('\n')}

**Major US Cities (Examples):**
${US_MAJOR_CITIES.slice(0, 5).map((c) => `• ${c.name}: geoTargetIds: ["${c.id}"]`).join('\n')}

**Multiple Locations:**
\`\`\`json
geoTargetIds: ["2840", "2124"]  // USA + Canada
\`\`\`

**Option 2: Radius Targeting (Location + Distance)**
Provide radiusTargeting object:
\`\`\`json
radiusTargeting: {
  latitude: 40.7128,
  longitude: -74.0060,
  radiusMiles: 25
}
\`\`\`
(Targets 25-mile radius around New York City)

**How to Find Geo Target IDs:**
1. Use Google Ads API geo target constants
2. Common format:
   - Countries: 2000-3000 range
   - Cities/Metro: 1000000+ range
   - States/Provinces: varies by country

**Provide:** Either geoTargetIds (array of strings) OR radiusTargeting (object)`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // ═══ STEP 4: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                const dryRunBuilder = new DryRunBuilder('LOCATION TARGETING', 'Add geographic targeting to campaign');
                dryRunBuilder.addChange(`Campaign ID: ${campaignId}`);
                dryRunBuilder.addChange(`Customer ID: ${customerId}`);
                if (geoTargetIds) {
                    dryRunBuilder.addChange(`Targeting Type: Geographic Locations`);
                    dryRunBuilder.addChange(`Geo Target IDs: ${geoTargetIds.join(', ')}`);
                    dryRunBuilder.addChange(`Total Locations: ${geoTargetIds.length}`);
                }
                if (radiusTargeting) {
                    dryRunBuilder.addChange(`Targeting Type: Radius Targeting`);
                    dryRunBuilder.addChange(`Center: ${radiusTargeting.latitude}, ${radiusTargeting.longitude}`);
                    dryRunBuilder.addChange(`Radius: ${radiusTargeting.radiusMiles} miles`);
                }
                dryRunBuilder.addRecommendation('Location targeting is additive - you can add more locations later');
                dryRunBuilder.addRecommendation('To exclude locations, use negative location targeting');
                dryRunBuilder.addRecommendation('Location targeting affects ad delivery immediately once campaign is enabled');
                if (geoTargetIds && geoTargetIds.length > 50) {
                    dryRunBuilder.addRisk('Large number of locations may fragment performance data');
                }
                const preview = dryRunBuilder.build('4/5');
                return {
                    requiresApproval: true,
                    confirmationToken: dryRunBuilder.getConfirmationToken(),
                    preview,
                    content: [
                        {
                            type: 'text',
                            text: preview +
                                '\n\n✅ Proceed with location targeting?\nCall again with confirmationToken to execute.',
                        },
                    ],
                };
            }
            // ═══ STEP 5: EXECUTE LOCATION TARGETING ═══
            logger.info('Adding location targeting', { customerId, campaignId, geoTargetIds, radiusTargeting });
            const customer = client.getCustomer(customerId);
            const operations = [];
            // Build operations for geo target IDs
            if (geoTargetIds) {
                for (const geoTargetId of geoTargetIds) {
                    operations.push({
                        campaign: `customers/${customerId}/campaigns/${campaignId}`,
                        location: {
                            geo_target_constant: `geoTargetConstants/${geoTargetId}`,
                        },
                        type: 'LOCATION',
                        negative: false,
                    });
                }
            }
            // Build operation for radius targeting
            if (radiusTargeting) {
                operations.push({
                    campaign: `customers/${customerId}/campaigns/${campaignId}`,
                    proximity: {
                        geo_point: {
                            latitude_in_micro_degrees: Math.round(radiusTargeting.latitude * 1000000),
                            longitude_in_micro_degrees: Math.round(radiusTargeting.longitude * 1000000),
                        },
                        radius: radiusTargeting.radiusMiles,
                        radius_units: 'MILES',
                    },
                    type: 'PROXIMITY',
                    negative: false,
                });
            }
            const result = await customer.campaignCriteria.create(operations);
            // AUDIT: Log successful location targeting
            await audit.logWriteOperation('user', 'add_location_criteria', customerId, {
                campaignId,
                geoTargetIds,
                radiusTargeting,
                criteriaCount: operations.length,
            });
            const summaryText = formatSuccessSummary({
                title: 'LOCATION TARGETING ADDED',
                operation: 'Geographic targeting configuration',
                details: {
                    'Campaign ID': campaignId,
                    'Criteria Added': operations.length,
                    'Targeting Type': geoTargetIds ? 'Geographic Locations' : 'Radius Targeting',
                    'Locations': geoTargetIds ? geoTargetIds.join(', ') : 'Radius around coordinates',
                },
                nextSteps: [
                    'Add language targeting: use add_language_criteria',
                    'Add demographic targeting: use add_demographic_criteria',
                    'View campaign performance: use get_campaign_performance',
                ],
            });
            return {
                success: true,
                content: [{ type: 'text', text: summaryText }],
                data: {
                    customerId,
                    campaignId,
                    criteriaAdded: operations.length,
                    result,
                },
            };
        }
        catch (error) {
            logger.error('Failed to add location criteria', error);
            await audit.logFailedOperation('user', 'add_location_criteria', input.customerId, error.message, { campaignId: input.campaignId, geoTargetIds: input.geoTargetIds });
            throw error;
        }
    },
};
//# sourceMappingURL=add-location-criteria.tool.js.map