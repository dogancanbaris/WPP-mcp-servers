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
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, campaignId, name, cpcBidMicros, status, type, trackingUrlTemplate, urlCustomParameters, adRotationMode } = input;
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

🎓 **AGENT TRAINING - AD GROUP STRUCTURE & NAMING:**

**THE GOLDEN RULE:** One keyword theme per ad group = Higher Quality Score

**WHAT IS AN AD GROUP?**
Container for related keywords + ads sharing same:
• Theme/topic
• Landing page
• Target audience

**QUALITY AD GROUP STRUCTURE:**
✅ **Tight theme:** All keywords relate to ONE specific product/service
✅ **5-20 keywords:** Related variations of main theme
✅ **2-3 ads:** Test different messaging
✅ **Shared landing page:** All keywords → same destination

❌ **Poor structure:**
• Mixed themes: "Laptops and Printers" (split into 2 ad groups!)
• Too broad: "All Nike Products" (split by product type!)
• Too narrow: Single keyword (wasteful over-segmentation!)

**NAMING FORMULA - AGENT HELP USER CREATE SPECIFIC NAMES:**

**Format:** [Brand/Category] + [Product Type] + [Qualifier/Intent]

**Examples (GOOD):**
✅ "Dell XPS 15 - Premium Business" (specific model + audience)
✅ "Nike Running Shoes - Men's" (brand + product + demographic)
✅ "iPhone 15 Pro - Pre-Order" (model + intent)
✅ "Plumber Services - Emergency" (service + urgency)

**Examples (BAD) - AGENT SHOULD FLAG:**
❌ "Products" (too vague - what products?)
❌ "Test Ad Group" (not descriptive)
❌ "Keywords" (tells nothing about theme)
❌ "Nike Shoes and Apparel" (two themes - split!)

**AGENT QUALITY CHECKLIST - REVIEW USER'S AD GROUP NAME:**
□ Specific: Does name describe ONE clear theme?
□ Keyword-aligned: Will keywords match this theme?
□ Not too broad: Is this actually 2-3 themes that should be separate?
□ Not too narrow: Is this just one keyword (over-segmentation)?
□ Searchable: Can user find this in reports easily?

**AGENT REVIEW EXAMPLES:**
❌ User: "Laptops" → Agent: "Too broad! Which laptops? Try: 'Dell Business Laptops - XPS Series' or 'Gaming Laptops - Budget Friendly'"
❌ User: "Nike Shoes and Clothing" → Agent: "Two different themes. Split into: 1) 'Nike Running Shoes', 2) 'Nike Athletic Apparel'"
✅ User: "Dell XPS 15 - Business Professionals" → Agent: "Excellent! Specific product (XPS 15) + target audience. Expect keywords like: 'dell xps 15', 'business laptop', 'professional laptop'"

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
            // ═══ STEP 5: EXECUTE AD GROUP CREATION ═══
            // Note: CREATE operations don't need approval (like create_campaign)
            // Starting in PAUSED status is safe - practitioner adds keywords/ads before enabling
            logger.info('Creating ad group', { customerId, campaignId, name });
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
            const result = await customer.adGroups.create([adGroupOperation]);
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
            // Extract ad group ID from result
            const adGroupId = result.results?.[0]?.resource_name?.split('/')?.pop() || result;
            const guidanceText = `✅ AD GROUP CREATED SUCCESSFULLY

**Ad Group Details:**
- Name: ${name}
- ID: ${adGroupId}
- Campaign: ${campaignId}
- Status: ${status || 'PAUSED'}
- CPC Bid: ${cpcBidMicros ? microsToAmount(cpcBidMicros) : 'Campaign default'}
${type ? `- Type: ${type}` : ''}
${trackingUrlTemplate ? `- Tracking Template: ${trackingUrlTemplate}` : ''}
${urlCustomParameters && urlCustomParameters.length > 0 ? `- Custom Parameters: ${urlCustomParameters.map((p) => `${p.key}=${p.value}`).join(', ')}` : ''}
${adRotationMode ? `- Ad Rotation: ${adRotationMode}` : ''}

🎯 **NEXT STEPS - Complete Ad Group Setup:**

**1. Add Keywords (5-20 keywords recommended):**
   • use add_keywords
     Example: add_keywords(customerId: "${customerId}", adGroupId: "${adGroupId}", keywords: [
       {text: "dell xps 15", matchType: "EXACT"},
       {text: "dell xps 15 laptop", matchType: "PHRASE"},
       {text: "premium business laptop", matchType: "BROAD"}
     ])

**2. Create Ads (2-3 ads for A/B testing):**
   • use create_ad with agent assistance
     → Agent can help generate headlines and descriptions!

**3. Add Negative Keywords (optional but recommended):**
   • use add_negative_keywords
     Example: ["cheap", "used", "refurbished"]

**4. Enable Ad Group When Ready:**
   • use update_ad_group to set status to ENABLED

⚠️ **IMPORTANT:** Ad group is in PAUSED status. Add keywords and ads before enabling!

💡 **TIP:** Use agent-assisted ad creation (create_ad) - agent will generate professional headlines and descriptions based on your product details!`;
            return injectGuidance({
                customerId,
                campaignId,
                adGroupId,
                name,
                status: status || 'PAUSED',
                cpcBid: cpcBidMicros ? microsToAmount(cpcBidMicros) : 'Campaign default',
                type,
                trackingUrlTemplate,
                urlCustomParameters,
                adRotationMode,
            }, guidanceText);
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