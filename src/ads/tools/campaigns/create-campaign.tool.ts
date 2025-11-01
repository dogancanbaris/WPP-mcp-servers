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
    type: 'object' as const,
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
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, name, budgetId, campaignType, status } = input;

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
        const accounts = resourceNames.map((rn: any) => ({
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

Choose the campaign type:

**Available Types:**

1. **SEARCH** - Text ads on Google Search
   • Best for: Intent-based searches, high-converting keywords
   • Example: User searches "buy running shoes" → sees your text ad

2. **DISPLAY** - Banner/image ads on Display Network
   • Best for: Brand awareness, remarketing, visual products
   • Example: Image ads on news sites, YouTube, Gmail

3. **PERFORMANCE_MAX** - Automated cross-channel campaigns
   • Best for: Maximizing conversions across all Google properties
   • Google automatically optimizes placements and creatives

4. **SHOPPING** - Product listing ads (requires Merchant Center)
   • Best for: E-commerce, product catalogs
   • Shows product image, price, store name

5. **VIDEO** - YouTube ads
   • Best for: Video content, brand storytelling
   • In-stream, discovery, bumper ads

6. **DEMAND_GEN** - Demand generation campaigns
   • Best for: Building demand on YouTube, Gmail, Discover
   • Visually rich, storytelling formats

**Provide:** campaignType (one of: SEARCH, DISPLAY, PERFORMANCE_MAX, SHOPPING, VIDEO, DEMAND_GEN)

Which campaign type do you want?`;

        return injectGuidance({ customerId, budgetId }, guidanceText);
      }

      // ═══ STEP 4: CAMPAIGN NAME GUIDANCE ═══
      if (!name) {
        const guidanceText = `📝 CAMPAIGN NAME (Step 4/5)

Enter a descriptive campaign name:

**Naming Best Practices:**
- Format: "[Client/Brand] - [Type] - [Purpose] - [Date]"
- Examples:
  • "ACME Inc - Search - Brand Terms - 2025 Q1"
  • "Product Launch - PMax - November 2025"
  • "Holiday Sale - Display - Remarketing"

**Keep it:**
- Descriptive (know what it is at a glance)
- Consistent (same format across campaigns)
- Searchable (easy to find in reports)

What should the campaign be named?`;

        return injectGuidance({ customerId, budgetId, campaignType }, guidanceText);
      }

      // ═══ STEP 5: EXECUTE CAMPAIGN CREATION ═══
      logger.info('Creating campaign', { customerId, name, campaignType });

      const result = await client.createCampaign(customerId, name, budgetId, campaignType, status || 'PAUSED');

      // AUDIT: Log successful campaign creation
      await audit.logWriteOperation('user', 'create_campaign', customerId, {
        campaignId: result,
        campaignName: name,
        campaignType,
        budgetId,
        initialStatus: status || 'PAUSED',
      });

      return {
        success: true,
        data: {
          customerId,
          campaignId: result,
          name,
          campaignType,
          status: status || 'PAUSED',
          message: `Campaign "${name}" created successfully in ${status || 'PAUSED'} status`,
        },
        warning: [
          status === 'ENABLED'
            ? '⚠️ Campaign created in ENABLED status - will start spending immediately if ads and keywords are added'
            : 'ℹ️ Campaign created in PAUSED status - add ads and keywords, then enable when ready',
        ],
      };
    } catch (error) {
      logger.error('Failed to create campaign', error as Error);

      // AUDIT: Log failed campaign creation
      await audit.logFailedOperation('user', 'create_campaign', input.customerId, (error as Error).message, {
        campaignName: input.name,
        campaignType: input.campaignType,
        budgetId: input.budgetId,
      });

      throw error;
    }
  },
};
