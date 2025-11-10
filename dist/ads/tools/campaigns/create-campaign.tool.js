/**
 * Create Campaign Tool
 *
 * MCP tool for creating new Google Ads campaigns.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId, microsToAmount } from '../../validation.js';
const logger = getLogger('ads.tools.campaigns.create');
const audit = getAuditLogger();
/**
 * Create campaign
 */
export const createCampaignTool = {
    name: 'create_campaign',
    description: `Create a new Google Ads campaign.

💡 AGENT GUIDANCE - CAMPAIGN CREATION:

⚠️ PREREQUISITES - CHECK THESE FIRST:
1. Budget must exist (call list_budgets or create_budget first)
2. Know the campaign type you want to create
3. Have clear campaign objective and targeting in mind
4. User has approved campaign creation

📋 REQUIRED INFORMATION:
- Campaign name (descriptive, unique)
- Campaign type (SEARCH, DISPLAY, PERFORMANCE_MAX, etc.)
- Budget ID (must exist already)
- Targeting parameters (will be set after creation)

💡 BEST PRACTICES - CAMPAIGN SETUP:
- Start campaigns in PAUSED status (default)
- Use clear naming: "[Client] - [Type] - [Purpose] - [Date]"
- Set end date for test campaigns
- Review all settings before enabling
- Small budget initially for testing

🎯 TYPICAL WORKFLOW:
1. Create budget first (or identify existing budget)
2. Create campaign in PAUSED status
3. Add ad groups (separate API call)
4. Add keywords (separate API call)
5. Create ads (separate API call)
6. Review everything
7. Enable campaign when ready

⚠️ COMMON MISTAKES TO AVOID:
- Creating campaign without budget → Will fail
- Enabling immediately without ads/keywords → Wastes money
- Vague campaign names → Hard to manage later
- Not setting end date for tests → Runs indefinitely

📊 CAMPAIGN TYPES:
- SEARCH → Text ads on Google Search
- DISPLAY → Banner/image ads on Display Network
- PERFORMANCE_MAX → Automated cross-channel
- SHOPPING → Product listing ads
- VIDEO → YouTube ads
- DEMAND_GEN → Demand generation campaigns`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            name: {
                type: 'string',
                description: 'Campaign name',
            },
            budgetId: {
                type: 'string',
                description: 'Budget ID to assign (must exist)',
            },
            campaignType: {
                type: 'string',
                enum: ['SEARCH', 'DISPLAY', 'SHOPPING', 'VIDEO', 'PERFORMANCE_MAX', 'DEMAND_GEN'],
                description: 'Type of campaign to create',
            },
            status: {
                type: 'string',
                enum: ['PAUSED', 'ENABLED'],
                description: 'Initial status (default: PAUSED - recommended)',
            },
            // Network settings
            targetGoogleSearch: {
                type: 'boolean',
                description: 'Target Google Search (default: true for SEARCH campaigns)',
            },
            targetSearchNetwork: {
                type: 'boolean',
                description: 'Target Search Network partners (default: false)',
            },
            targetContentNetwork: {
                type: 'boolean',
                description: 'Target Display Network / Content Network (default: false for SEARCH)',
            },
            targetPartnerSearchNetwork: {
                type: 'boolean',
                description: 'Target partner search networks (default: false)',
            },
            // Date settings
            startDate: {
                type: 'string',
                description: 'Campaign start date in YYYY-MM-DD format (default: tomorrow)',
            },
            endDate: {
                type: 'string',
                description: 'Campaign end date in YYYY-MM-DD format (optional, default: no end date)',
            },
            // Tracking settings
            trackingTemplate: {
                type: 'string',
                description: 'URL tracking template for conversion tracking (optional)',
            },
            finalUrlSuffix: {
                type: 'string',
                description: 'Final URL suffix for UTM parameters (optional, e.g., "utm_campaign=name")',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, name, budgetId, campaignType, status, targetGoogleSearch, targetSearchNetwork, targetContentNetwork, targetPartnerSearchNetwork, startDate, endDate, trackingTemplate, finalUrlSuffix } = input;
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
                    prompt: 'Which account do you want to create a campaign in?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: BUDGET DISCOVERY ═══
            if (!budgetId) {
                const budgets = await client.listBudgets(customerId);
                if (budgets.length === 0) {
                    const guidanceText = `⚠️ NO BUDGETS FOUND (Step 2/5)

This account has no budgets. You must create a budget before creating a campaign.

**Next Steps:**
1. Use create_budget tool to create a budget
2. Then return here to create the campaign

**Example:**
\`\`\`
create_budget(
  customerId: "${customerId}",
  name: "Q1 2025 Budget",
  dailyAmountDollars: 50
)
\`\`\``;
                    return injectGuidance({ customerId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '2/5',
                    title: 'SELECT BUDGET',
                    items: budgets,
                    itemFormatter: (b, i) => {
                        const budget = b.campaign_budget;
                        const dailyAmount = microsToAmount(budget?.amount_micros || 0);
                        return `${i + 1}. ${budget?.name || 'Unnamed Budget'}
   ID: ${budget?.id}
   Daily Budget: ${dailyAmount}/day`;
                    },
                    prompt: 'Which budget should this campaign use?',
                    nextParam: 'budgetId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: CAMPAIGN TYPE GUIDANCE ═══
            if (!campaignType) {
                const guidanceText = `🎯 SELECT CAMPAIGN TYPE (Step 3/5)

🎓 **AGENT TRAINING - CAMPAIGN TYPE SELECTION:**

**THE DECISION TREE - HELP USER CHOOSE:**

**Q: What's the primary goal?**
→ Direct response (sales, leads, conversions) = SEARCH or PERFORMANCE_MAX
→ Brand awareness (reach, impressions) = DISPLAY or VIDEO
→ E-commerce products with feed = SHOPPING
→ New product launch = DEMAND_GEN

**Q: What content do you have?**
→ Keywords + text ads = SEARCH
→ Product feed (SKUs, prices, images) = SHOPPING
→ Banner images/creatives = DISPLAY
→ Video content = VIDEO
→ Mix of assets = PERFORMANCE_MAX (auto-generates)

**Q: How much control do you want?**
→ Full control (keywords, bids, placements) = SEARCH or DISPLAY
→ Automated optimization = PERFORMANCE_MAX
→ Product-based automation = SHOPPING

**CAMPAIGN TYPES EXPLAINED:**

1. **SEARCH** 🔍 (Most Common - 60% of campaigns)
   ✅ **Use when:** User searches with intent, you have keywords
   ✅ **Best for:** Services, B2B, local businesses, branded terms
   ✅ **Budget:** Start $20-50/day
   ✅ **Timeline:** Results in 1-2 weeks
   ❌ **Avoid if:** No keyword research, purely visual product

2. **DISPLAY** 🖼️ (Brand awareness)
   ✅ **Use when:** Building awareness, remarketing, visual appeal
   ✅ **Best for:** Consumer products, events, brand campaigns
   ✅ **Budget:** Start $30-100/day (need volume for optimization)
   ✅ **Timeline:** Results in 2-4 weeks
   ❌ **Avoid if:** Direct response only, no creatives

3. **PERFORMANCE_MAX** 🚀 (Automated, growing)
   ✅ **Use when:** You want Google to optimize everything
   ✅ **Best for:** E-commerce with conversion data, accounts with 50+ conversions/month
   ✅ **Budget:** Start $50-200/day
   ✅ **Timeline:** Needs 6 weeks learning period
   ❌ **Avoid if:** Need control, new account (<15 conversions), specific targeting needed

4. **SHOPPING** 🛒 (E-commerce only)
   ✅ **Use when:** You have product feed in Merchant Center
   ✅ **Best for:** Retailers, product catalogs
   ✅ **Budget:** Start $50-150/day
   ⚠️ **Requires:** Merchant Center account, product feed approved
   ❌ **Avoid if:** Services (no products), no Merchant Center

5. **VIDEO** 📹 (YouTube)
   ✅ **Use when:** You have video content
   ✅ **Best for:** Brand storytelling, product demos, entertainment
   ✅ **Budget:** Start $20-100/day
   ⚠️ **Requires:** Video uploaded to YouTube
   ❌ **Avoid if:** No video assets

6. **DEMAND_GEN** 📢 (New, specialized)
   ✅ **Use when:** Launching new product, building awareness
   ✅ **Best for:** Visually-driven products, aspirational brands
   ✅ **Placements:** YouTube, Gmail, Discover feed
   ⚠️ **Requires:** High-quality images/videos
   ❌ **Avoid if:** Direct response only, limited creative assets

**AGENT RECOMMENDATION FRAMEWORK:**

Ask user:
1. "What's your primary goal?" (sales/leads/awareness)
2. "What content do you have?" (keywords/products/images/videos)
3. "What's your experience level?" (beginner/advanced)

**Then recommend:**
• Beginner + Direct response → **SEARCH** (easiest to start, most control)
• E-commerce + Product feed → **SHOPPING** (automatic product ads)
• Advanced + Optimization → **PERFORMANCE_MAX** (best results but needs data)
• Brand building + Visuals → **DISPLAY** (awareness + remarketing)

**COMMON MISTAKES TO FLAG:**
❌ "PERFORMANCE_MAX needs 50+ conversions/month to optimize. You have 5. Recommend SEARCH instead?"
❌ "SHOPPING requires Merchant Center. Is your product feed approved? If not, use SEARCH with product keywords"
❌ "VIDEO requires video content. Do you have YouTube videos uploaded? If not, choose SEARCH or DISPLAY"

Which campaign type matches your goals?`;
                return injectGuidance({ customerId, budgetId }, guidanceText);
            }
            // ═══ STEP 4: CAMPAIGN NAME GUIDANCE ═══
            if (!name) {
                const guidanceText = `📝 CAMPAIGN NAME (Step 4/6)

Enter a descriptive campaign name:

**Naming Best Practices:**
- Format: "[Client/Brand] - [Type] - [Purpose] - [Date]"
- Examples:
  • "ACME Inc - Search - Brand Terms - 2025 Q1"
  • "Product Launch - PMax - November 2025"
  • "Holiday Sale - Remarketing"

**Keep it:**
- Descriptive (know what it is at a glance)
- Consistent (same format across campaigns)
- Searchable (easy to find in reports)

What should the campaign be named?`;
                return injectGuidance({ customerId, budgetId, campaignType }, guidanceText);
            }
            // ═══ STEP 5: SETTINGS & TRACKING FORM ═══
            // Check if ANY of the optional settings are missing - if so, show the form
            const hasNetworkSettings = targetGoogleSearch !== undefined || targetSearchNetwork !== undefined ||
                targetContentNetwork !== undefined || targetPartnerSearchNetwork !== undefined;
            const hasDateSettings = startDate !== undefined || endDate !== undefined;
            const hasTrackingSettings = trackingTemplate !== undefined || finalUrlSuffix !== undefined;
            if (!hasNetworkSettings && !hasDateSettings && !hasTrackingSettings) {
                const guidanceText = `⚙️ CAMPAIGN SETTINGS & TRACKING (Step 5/6)

**Campaign So Far:**
✅ Account: ${customerId}
✅ Budget: ${budgetId}
✅ Type: ${campaignType}
✅ Name: ${name}
✅ Status: ${status || 'PAUSED'}

Now configure campaign settings and tracking (all optional - smart defaults will be used):

📡 **NETWORK SETTINGS** (Where should ads appear?):
  targetGoogleSearch: true/false (default: true)
  targetSearchNetwork: true/false (default: false)
  targetContentNetwork: true/false (default: false for SEARCH, true for DISPLAY)
  targetPartnerSearchNetwork: true/false (default: false)

📅 **CAMPAIGN SCHEDULE** (When should campaign run?):
  startDate: "YYYY-MM-DD" (default: tomorrow)
  endDate: "YYYY-MM-DD" (optional, default: no end date - runs indefinitely)

📊 **TRACKING & URLs** (For analytics and conversion tracking):
  trackingTemplate: "https://tracker.com?src={lpurl}" (optional)
  finalUrlSuffix: "utm_campaign=${name.replace(/ /g, '_')}" (optional)

💡 **RECOMMENDATIONS:**
- For SEARCH campaigns: Keep targetGoogleSearch=true, others false
- For test campaigns: Set endDate to limit spend
- For conversion tracking: Add trackingTemplate and finalUrlSuffix

**To proceed:**
1. Provide any settings you want to customize (or none for smart defaults)
2. Example: { targetGoogleSearch: true, startDate: "2025-01-01", endDate: "2025-03-31" }

**Or skip all optional settings** by calling with just the parameters you've already provided.`;
                return injectGuidance({ customerId, budgetId, campaignType, name }, guidanceText);
            }
            // ═══ STEP 6: EXECUTE CAMPAIGN CREATION ═══
            logger.info('Creating campaign', { customerId, name, campaignType });
            // Build options object for additional settings
            const campaignOptions = {
                targetGoogleSearch,
                targetSearchNetwork,
                targetContentNetwork,
                targetPartnerSearchNetwork,
                startDate,
                endDate,
                trackingTemplate,
                finalUrlSuffix
            };
            const result = await client.createCampaign(customerId, name, budgetId, campaignType, status || 'PAUSED', campaignOptions);
            // AUDIT: Log successful campaign creation
            await audit.logWriteOperation('user', 'create_campaign', customerId, {
                campaignId: result,
                campaignName: name,
                campaignType,
                budgetId,
                initialStatus: status || 'PAUSED',
            });
            // Extract campaign ID from result
            const campaignId = result.results?.[0]?.resource_name?.split('/')?.pop() || result;
            const guidanceText = `✅ CAMPAIGN CREATED SUCCESSFULLY

**Campaign Details:**
- Name: ${name}
- ID: ${campaignId}
- Type: ${campaignType}
- Status: ${status || 'PAUSED'}
- Budget: ${budgetId}

**Settings Applied:**
- Network: Google Search ${campaignOptions.targetGoogleSearch !== false ? '✅' : '❌'}, Partners ${campaignOptions.targetSearchNetwork ? '✅' : '❌'}, Display ${campaignOptions.targetContentNetwork ? '✅' : '❌'}
${campaignOptions.startDate ? `- Start Date: ${campaignOptions.startDate}` : ''}
${campaignOptions.endDate ? `- End Date: ${campaignOptions.endDate}` : ''}
${campaignOptions.finalUrlSuffix ? `- Tracking: ${campaignOptions.finalUrlSuffix}` : ''}

🎯 **NEXT STEPS - Complete Campaign Setup:**

🚨 **CRITICAL - ADD TARGETING NOW:**
⚠️ **Campaign currently targets ENTIRE WORLD in ALL LANGUAGES!**
This is almost NEVER what you want - 99% of campaigns need specific targeting.

**Why this matters:**
• Budget wasted on irrelevant locations (ads in countries you don't serve)
• Poor quality traffic (wrong language, wrong geography)
• Lower conversion rates (international users can't buy)

**FIX IMMEDIATELY - Add Targeting:**

**1. Add Locations (REQUIRED for most campaigns):**
   • use add_location_criteria
   • Example - USA only: add_location_criteria(customerId: "${customerId}", campaignId: "${campaignId}", geoTargetIds: ["2840"])
   • Example - USA + Canada: geoTargetIds: ["2840", "2124"]
   • Example - California only: geoTargetIds: ["21137"]

**2. Add Languages (REQUIRED for non-English):**
   • use add_language_criteria
   • Example - English only: add_language_criteria(customerId: "${customerId}", campaignId: "${campaignId}", languageIds: ["1000"])
   • Example - English + Spanish: languageIds: ["1000", "1003"]

**AGENT: After campaign creation, IMMEDIATELY remind user:**
"⚠️ Campaign has NO geo targeting - currently targets entire world! Add locations with add_location_criteria before enabling, or you'll waste budget on irrelevant traffic."

**2. Create Ad Groups:**
   • use create_ad_group(customerId: "${customerId}", campaignId: "${campaignId}", name: "Ad Group 1")

**3. Add Keywords:**
   • use add_keywords with keywords for the ad group

**4. Create Ads:**
   • use create_ad with headlines and descriptions

**5. Enable Campaign:**
   • use update_campaign_status to set status to ENABLED

${status === 'ENABLED' ? '⚠️ **WARNING:** Campaign is ENABLED - will spend immediately once ads/keywords added!' : 'ℹ️ Campaign is PAUSED - safe to add targeting, ad groups, keywords, and ads'}

**Recommended Flow:**
→ add_location_criteria → add_language_criteria → create_ad_group → add_keywords → create_ad → update_campaign_status(ENABLED)`;
            return injectGuidance({
                success: true,
                customerId,
                campaignId,
                name,
                campaignType,
                status: status || 'PAUSED',
                budgetId,
                settings: campaignOptions
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to create campaign', error);
            // AUDIT: Log failed campaign creation
            await audit.logFailedOperation('user', 'create_campaign', input.customerId, error.message, {
                campaignName: input.name,
                campaignType: input.campaignType,
                budgetId: input.budgetId,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=create-campaign.tool.js.map