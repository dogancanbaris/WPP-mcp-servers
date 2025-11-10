/**
 * Create Ad Group Tool
 *
 * MCP tool for creating new ad groups in Google Ads campaigns.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId, microsToAmount } from '../../validation.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';
const logger = getLogger('ads.tools.ad-groups.create');
const audit = getAuditLogger();
/**
 * Create ad group
 */
export const createAdGroupTool = {
    name: 'create_ad_group',
    description: `Create a new ad group in a Google Ads campaign.

💡 AGENT GUIDANCE - AD GROUP CREATION:

⚠️ PREREQUISITES - CHECK THESE FIRST:
1. Campaign must exist (call list_campaigns first)
2. Campaign should be in PAUSED status (safest for setup)
3. Have keywords ready to add after creation
4. Have ad creatives ready to add after creation
5. User has approved ad group creation

📋 REQUIRED INFORMATION:
- Ad group name (descriptive, keyword-focused)
- Campaign ID (must exist)
- CPC bid (optional, inherits from campaign if not set)
- Status (PAUSED recommended for initial setup)

💡 BEST PRACTICES - AD GROUP SETUP:
- Start in PAUSED status (default)
- One ad group per keyword theme
- Name format: "[Theme] - [Match Type]" or "[Product/Service Name]"
- Set initial CPC bid conservative (can optimize later)
- Group similar keywords together

🎯 TYPICAL WORKFLOW:
1. Create campaign (or identify existing campaign)
2. Create ad group in PAUSED status
3. Add keywords to ad group (separate API call)
4. Create ads in ad group (separate API call)
5. Review everything
6. Enable ad group when ready

⚠️ COMMON MISTAKES TO AVOID:
- Creating ad group without keywords/ads → Wastes time
- Too broad ad groups → Poor Quality Score
- Enabling immediately without ads → Campaign won't serve
- Vague ad group names → Hard to manage later

📊 AD GROUP ORGANIZATION:
- Single keyword theme per ad group
- 5-20 keywords per ad group (tight targeting)
- 2-3 ads per ad group (A/B testing)
- Match types: Broad, Phrase, Exact (mix recommended)

💰 BIDDING GUIDANCE:
- Set initial CPC bid conservative
- Start with campaign default or slightly lower
- Monitor Quality Score and adjust
- Typical starting bids: $0.50 - $2.00 depending on competition`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID (ad group will be created in this campaign)',
            },
            name: {
                type: 'string',
                description: 'Ad group name (descriptive, keyword-focused)',
            },
            cpcBidMicros: {
                type: 'number',
                description: 'CPC bid in micros (optional, e.g., 1000000 = $1.00)',
            },
            status: {
                type: 'string',
                enum: ['PAUSED', 'ENABLED'],
                description: 'Initial status (default: PAUSED - recommended)',
            },
            // NEW Phase 1: Essential parameters
            type: {
                type: 'string',
                enum: ['SEARCH_STANDARD', 'SEARCH_DYNAMIC_ADS', 'DISPLAY_STANDARD', 'SHOPPING_PRODUCT_ADS', 'VIDEO_TRUE_VIEW_IN_STREAM', 'HOTEL_ADS'],
                description: 'Ad group type (auto-detected from campaign if not provided)',
            },
            trackingUrlTemplate: {
                type: 'string',
                description: 'Tracking URL template with {lpurl} placeholder for analytics integration (optional)',
            },
            urlCustomParameters: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        key: { type: 'string' },
                        value: { type: 'string' },
                    },
                },
                description: 'Custom URL parameters for tracking (optional, e.g., [{key: "_source", value: "google_ads"}])',
            },
            adRotationMode: {
                type: 'string',
                enum: ['OPTIMIZE', 'ROTATE_INDEFINITELY', 'OPTIMIZE_FOR_CONVERSIONS'],
                description: 'How to rotate ads within the ad group (default: OPTIMIZE)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, campaignId, name, cpcBidMicros, status, type, trackingUrlTemplate, urlCustomParameters, adRotationMode, confirmationToken } = input;
            // Extract OAuth tokens from request
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            // Create Google Ads client with user's refresh token
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
                    prompt: 'Which account do you want to create an ad group in?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                if (campaigns.length === 0) {
                    const guidanceText = `⚠️ NO CAMPAIGNS FOUND (Step 2/5)

This account has no campaigns. You must create a campaign before creating an ad group.

**Next Steps:**
1. Use create_campaign tool to create a campaign
2. Then return here to create the ad group

**Example:**
\`\`\`
create_campaign(
  customerId: "${customerId}",
  name: "Search Campaign - Q1 2025",
  campaignType: "SEARCH"
)
\`\`\``;
                    return injectGuidance({ customerId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '2/5',
                    title: 'SELECT CAMPAIGN',
                    items: campaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'Unnamed Campaign'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
                    },
                    prompt: 'Which campaign should this ad group belong to?',
                    nextParam: 'campaignId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: AD GROUP NAME GUIDANCE ═══
            if (!name) {
                const campaigns = await client.listCampaigns(customerId);
                const selectedCampaign = campaigns.find((c) => c.campaign.id === campaignId);
                const guidanceText = `📝 AD GROUP NAME (Step 3/5)

**Campaign:** ${selectedCampaign?.campaign?.name || campaignId}

Enter a descriptive ad group name:

**Naming Best Practices:**
- Format: "[Keyword Theme] - [Match Type]" or "[Product/Service Name]"
- Examples:
  • "Running Shoes - Exact Match"
  • "Women's Sneakers - Broad"
  • "Nike Air Max - Brand Terms"
  • "Winter Boots - Sale"

**Keep it:**
- Descriptive (reflects keyword theme)
- Specific (tight keyword focus)
- Searchable (easy to find in reports)

**Organization Tips:**
- One keyword theme per ad group
- Group similar keywords together
- Use match type in name if helpful

What should the ad group be named?`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // ═══ STEP 4: CPC BID GUIDANCE (OPTIONAL) ═══
            if (cpcBidMicros === undefined) {
                const guidanceText = `💰 CPC BID (Step 4/5 - OPTIONAL)

**Ad Group:** ${name}

Set a default CPC bid for this ad group (optional).

**What is CPC Bid?**
- Maximum amount you'll pay per click
- Applies to all keywords in this ad group (unless keyword-level bid set)
- Can be overridden at keyword level

**Bidding Options:**

1. **Skip CPC bid** (recommended for initial setup)
   - Ad group will inherit campaign's default bid
   - Set keyword-level bids later based on performance
   - Provide: (leave empty or skip this step)

2. **Set CPC bid now**
   - Typical starting bids: $0.50 - $2.00
   - Higher for competitive keywords
   - Lower for brand terms
   - Format: Provide dollar amount (will be converted to micros)

**Examples:**
- For $1.00 CPC: cpcBidMicros=1000000
- For $0.75 CPC: cpcBidMicros=750000
- For $2.50 CPC: cpcBidMicros=2500000

**Best Practice:**
- Start conservative (can increase later)
- Monitor Quality Score (affects actual CPC)
- Optimize based on performance data

Would you like to set a CPC bid? (Optional - leave empty to skip)`;
                return injectGuidance({ customerId, campaignId, name, skipCpcBid: true }, guidanceText);
            }
            // ═══ STEP 5: DRY-RUN PREVIEW ═══
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_ad_group', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Ad Group',
                resourceId: 'new',
                field: 'name',
                currentValue: 'N/A (new ad group)',
                newValue: name,
                changeType: 'create',
            });
            dryRunBuilder.addChange({
                resource: 'Ad Group',
                resourceId: 'new',
                field: 'campaign',
                currentValue: 'N/A',
                newValue: `Campaign ID: ${campaignId}`,
                changeType: 'create',
            });
            dryRunBuilder.addChange({
                resource: 'Ad Group',
                resourceId: 'new',
                field: 'status',
                currentValue: 'N/A',
                newValue: status || 'PAUSED',
                changeType: 'create',
            });
            if (cpcBidMicros) {
                const cpcAmount = microsToAmount(cpcBidMicros);
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: 'new',
                    field: 'cpc_bid_micros',
                    currentValue: 'N/A',
                    newValue: `${cpcAmount} per click`,
                    changeType: 'create',
                });
            }
            // NEW Phase 1: Add type if provided
            if (type) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: 'new',
                    field: 'type',
                    currentValue: 'N/A',
                    newValue: type,
                    changeType: 'create',
                });
            }
            // NEW Phase 1: Add tracking template if provided
            if (trackingUrlTemplate) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: 'new',
                    field: 'tracking_url_template',
                    currentValue: 'N/A',
                    newValue: trackingUrlTemplate,
                    changeType: 'create',
                });
            }
            // NEW Phase 1: Add custom parameters if provided
            if (urlCustomParameters && urlCustomParameters.length > 0) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: 'new',
                    field: 'url_custom_parameters',
                    currentValue: 'N/A',
                    newValue: urlCustomParameters.map((p) => `${p.key}=${p.value}`).join(', '),
                    changeType: 'create',
                });
            }
            // NEW Phase 1: Add ad rotation mode if provided
            if (adRotationMode) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: 'new',
                    field: 'ad_rotation_mode',
                    currentValue: 'N/A',
                    newValue: adRotationMode,
                    changeType: 'create',
                });
            }
            // Add recommendations
            if (status === 'ENABLED') {
                dryRunBuilder.addRecommendation('⚠️ Ad group will be created in ENABLED status. Ensure you have keywords and ads ready to add.');
            }
            else {
                dryRunBuilder.addRecommendation('✅ Ad group will be created in PAUSED status. Add keywords and ads before enabling.');
            }
            dryRunBuilder.addRecommendation('Next steps: Add 5-20 keywords to this ad group, then create 2-3 ads for A/B testing');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_ad_group', 'Google Ads', customerId, { campaignId, name, cpcBidMicros, status, type, trackingUrlTemplate, urlCustomParameters, adRotationMode });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Ad group creation requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // ═══ STEP 6: EXECUTE AD GROUP CREATION ═══
            logger.info('Creating ad group with confirmation', { customerId, campaignId, name });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const customer = client.getCustomer(customerId);
                const adGroupOperation = {
                    name,
                    campaign: `customers/${customerId}/campaigns/${campaignId}`,
                    status: status || 'PAUSED',
                };
                // CPC bid (optional)
                if (cpcBidMicros) {
                    adGroupOperation.cpc_bid_micros = cpcBidMicros;
                }
                // NEW Phase 1: Ad group type (optional - defaults to campaign type)
                if (type) {
                    adGroupOperation.type = type;
                }
                // NEW Phase 1: Tracking URL template (optional)
                if (trackingUrlTemplate) {
                    adGroupOperation.tracking_url_template = trackingUrlTemplate;
                }
                // NEW Phase 1: Custom URL parameters (optional)
                if (urlCustomParameters && urlCustomParameters.length > 0) {
                    adGroupOperation.url_custom_parameters = urlCustomParameters.map((param) => ({
                        key: param.key,
                        value: param.value,
                    }));
                }
                // NEW Phase 1: Ad rotation mode (optional)
                if (adRotationMode) {
                    adGroupOperation.ad_rotation_mode = adRotationMode;
                }
                const createResult = await customer.adGroups.create([adGroupOperation]);
                return createResult;
            });
            // AUDIT: Log successful ad group creation
            await audit.logWriteOperation('user', 'create_ad_group', customerId, {
                adGroupId: result,
                adGroupName: name,
                campaignId,
                cpcBidMicros,
                initialStatus: status || 'PAUSED',
                type,
                trackingUrlTemplate,
                urlCustomParameters,
                adRotationMode,
            });
            return {
                success: true,
                data: {
                    customerId,
                    campaignId,
                    adGroupId: result,
                    name,
                    status: status || 'PAUSED',
                    cpcBid: cpcBidMicros ? microsToAmount(cpcBidMicros) : 'Campaign default',
                    message: `✅ Ad group "${name}" created successfully in ${status || 'PAUSED'} status`,
                },
                nextSteps: [
                    `Add keywords: use add_keywords with adGroupId="${result}"`,
                    `Create ads: use create_ad with adGroupId="${result}"`,
                    status === 'PAUSED' ? `Enable ad group when ready: use update_ad_group` : null,
                ].filter(Boolean),
            };
        }
        catch (error) {
            logger.error('Failed to create ad group', error);
            // AUDIT: Log failed ad group creation
            await audit.logFailedOperation('user', 'create_ad_group', input.customerId, error.message, {
                adGroupName: input.name,
                campaignId: input.campaignId,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=create-ad-group.tool.js.map