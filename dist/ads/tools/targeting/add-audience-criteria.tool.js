/**
 * Add Audience Targeting Criteria Tool
 *
 * MCP tool for adding audience targeting (in-market, affinity, custom audiences) to campaigns.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance, formatSuccessSummary } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { DryRunBuilder } from '../../../shared/dry-run-builder.js';
const logger = getLogger('ads.tools.targeting.audience');
const audit = getAuditLogger();
/**
 * Example in-market audiences (sample IDs - actual IDs vary)
 */
const EXAMPLE_IN_MARKET = [
    { category: 'Travel', description: 'Users researching travel, hotels, flights' },
    { category: 'Real Estate', description: 'Users looking to buy/rent property' },
    { category: 'Auto & Vehicles', description: 'Users shopping for vehicles' },
    { category: 'Home & Garden', description: 'Users shopping for home improvement' },
    { category: 'Business Services', description: 'Users researching business solutions' },
    { category: 'Education', description: 'Users researching education programs' },
    { category: 'Employment', description: 'Users looking for jobs' },
    { category: 'Financial Services', description: 'Users researching financial products' },
];
/**
 * Example affinity audiences (sample categories)
 */
const EXAMPLE_AFFINITY = [
    { category: 'Sports & Fitness Enthusiasts', description: 'Active lifestyle, sports fans' },
    { category: 'Technology Early Adopters', description: 'Tech enthusiasts, early adopters' },
    { category: 'Foodies', description: 'Food lovers, restaurant goers' },
    { category: 'Travelers', description: 'Frequent travelers, vacation planners' },
    { category: 'Fashionistas', description: 'Fashion-conscious shoppers' },
    { category: 'Home Improvement Enthusiasts', description: 'DIY, home renovation' },
    { category: 'Automotive Enthusiasts', description: 'Car enthusiasts, gear heads' },
    { category: 'Entertainment & Media', description: 'TV, movies, gaming fans' },
];
export const addAudienceCriteriaTool = {
    name: 'add_audience_criteria',
    description: `Add audience targeting (in-market, affinity, custom) to a campaign.`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to add audience targeting',
            },
            audienceIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of audience resource names or IDs',
            },
            audienceType: {
                type: 'string',
                enum: ['IN_MARKET', 'AFFINITY', 'CUSTOM', 'USER_LIST'],
                description: 'Type of audience targeting',
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
            const { customerId, campaignId, audienceIds, audienceType, confirmationToken } = input;
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

This account has no campaigns. Create a campaign first before adding audience targeting.

**Next Steps:**
1. Use create_campaign to create a campaign
2. Then return here to add audience targeting`;
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
                    prompt: 'Which campaign should have audience targeting?',
                    nextParam: 'campaignId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: AUDIENCE TYPE GUIDANCE ═══
            if (!audienceType) {
                const guidanceText = `👥 AUDIENCE TYPE SELECTION (Step 3/5)

Choose the type of audience targeting:

**1. IN_MARKET AUDIENCES** (High Purchase Intent)
Users actively researching or comparing products/services
• Best for: Conversion-focused campaigns
• Examples: ${EXAMPLE_IN_MARKET.slice(0, 3)
                    .map((a) => a.category)
                    .join(', ')}

**2. AFFINITY AUDIENCES** (Interest-Based)
Users with sustained interest in topics
• Best for: Awareness, consideration campaigns
• Examples: ${EXAMPLE_AFFINITY.slice(0, 3)
                    .map((a) => a.category)
                    .join(', ')}

**3. CUSTOM AUDIENCES** (Your Definitions)
Audiences you've created based on:
• Keywords, URLs, apps users have interacted with
• Your own targeting criteria

**4. USER_LIST** (Remarketing)
Your customer lists:
• Website visitors (remarketing)
• Customer Match lists (uploaded emails/phones)
• YouTube engagement audiences

**How to Get Audience IDs:**
1. Use Google Ads API to query available audiences:
   \`SELECT user_interest.resource_name, user_interest.name FROM user_interest\`
2. Or create custom audiences via create_audience tool
3. Or upload customer lists via customer match

**Provide:** audienceType (one of: IN_MARKET, AFFINITY, CUSTOM, USER_LIST)`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // ═══ STEP 4: AUDIENCE SELECTION GUIDANCE ═══
            if (!audienceIds || audienceIds.length === 0) {
                const guidanceText = `🎯 SELECT AUDIENCES (Step 4/5)

Provide the audience IDs or resource names to target.

**Format Examples:**

**Resource Name Format:**
\`\`\`json
audienceIds: [
  "customers/${customerId}/userInterests/12345",
  "customers/${customerId}/userInterests/67890"
]
\`\`\`

**Simple ID Format:**
\`\`\`json
audienceIds: ["12345", "67890"]
\`\`\`

**How to Discover Available Audiences:**

1. **Query your audiences via Google Ads API:**
   - In-Market: \`SELECT user_interest.resource_name, user_interest.name FROM user_interest WHERE user_interest.user_interest_category = 'AFFINITY'\`
   - Custom: Query \`custom_audience\` resource
   - User Lists: Query \`user_list\` resource

2. **Use Google Ads UI:**
   - Navigate to Tools → Audience Manager
   - Browse categories
   - Note the audience IDs

3. **Common In-Market Examples (Sample IDs):**
${EXAMPLE_IN_MARKET.slice(0, 4)
                    .map((a) => `   • ${a.category}: ${a.description}`)
                    .join('\n')}

4. **Common Affinity Examples (Sample IDs):**
${EXAMPLE_AFFINITY.slice(0, 4)
                    .map((a) => `   • ${a.category}: ${a.description}`)
                    .join('\n')}

**Note:** Actual audience IDs vary by account and are dynamic. Use Google Ads API to query available audiences.

**Provide:** audienceIds (array of audience resource names or IDs)`;
                return injectGuidance({ customerId, campaignId, audienceType }, guidanceText);
            }
            // ═══ STEP 5: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                const dryRunBuilder = new DryRunBuilder('AUDIENCE TARGETING', 'Add audience targeting to campaign');
                dryRunBuilder.addChange(`Campaign ID: ${campaignId}`);
                dryRunBuilder.addChange(`Customer ID: ${customerId}`);
                dryRunBuilder.addChange(`Audience Type: ${audienceType}`);
                dryRunBuilder.addChange(`Audience Count: ${audienceIds.length}`);
                dryRunBuilder.addChange(`Audience IDs: ${audienceIds.join(', ')}`);
                dryRunBuilder.addRecommendation('Monitor audience performance separately to identify best performers');
                dryRunBuilder.addRecommendation('Consider bid adjustments for high-performing audiences');
                dryRunBuilder.addRecommendation('Audience targeting can be observation mode (no targeting restriction) or targeting mode');
                if (audienceType === 'USER_LIST') {
                    dryRunBuilder.addRecommendation('Remarketing lists require minimum 1,000 users (100 for video)');
                    dryRunBuilder.addRisk('User lists may be too small initially - allow time to accumulate');
                }
                if (audienceIds.length > 20) {
                    dryRunBuilder.addRisk('Many audiences may fragment performance data - consider consolidation');
                }
                const preview = dryRunBuilder.build('5/5');
                return {
                    requiresApproval: true,
                    confirmationToken: dryRunBuilder.getConfirmationToken(),
                    preview,
                    content: [
                        {
                            type: 'text',
                            text: preview +
                                '\n\n✅ Proceed with audience targeting?\nCall again with confirmationToken to execute.',
                        },
                    ],
                };
            }
            // ═══ STEP 6: EXECUTE AUDIENCE TARGETING ═══
            logger.info('Adding audience targeting', { customerId, campaignId, audienceIds, audienceType });
            const customer = client.getCustomer(customerId);
            const operations = [];
            for (const audienceId of audienceIds) {
                // Build resource name if not already in resource name format
                const resourceName = audienceId.startsWith('customers/')
                    ? audienceId
                    : `customers/${customerId}/userInterests/${audienceId}`;
                operations.push({
                    campaign: `customers/${customerId}/campaigns/${campaignId}`,
                    user_interest: {
                        user_interest_category: resourceName,
                    },
                    type: 'USER_INTEREST',
                    negative: false,
                });
            }
            const result = await customer.campaignCriteria.create(operations);
            // AUDIT: Log successful audience targeting
            await audit.logWriteOperation('user', 'add_audience_criteria', customerId, {
                campaignId,
                audienceType,
                audienceIds,
                criteriaCount: operations.length,
            });
            const summaryText = formatSuccessSummary({
                title: 'AUDIENCE TARGETING ADDED',
                operation: 'Audience targeting configuration',
                details: {
                    'Campaign ID': campaignId,
                    'Audience Type': audienceType,
                    'Audiences Added': audienceIds.length,
                    'Total Criteria': operations.length,
                },
                nextSteps: [
                    'Monitor audience performance: use get_campaign_performance with audience segments',
                    'Add more targeting: use add_location_criteria, add_demographic_criteria',
                    'Create custom audiences: use create_audience',
                    'Adjust bids by audience: use audience bid modifiers',
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
            logger.error('Failed to add audience criteria', error);
            await audit.logFailedOperation('user', 'add_audience_criteria', input.customerId, error.message, {
                campaignId: input.campaignId,
                audienceType: input.audienceType,
                audienceIds: input.audienceIds,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=add-audience-criteria.tool.js.map