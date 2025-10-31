/**
 * MCP Tools for Google Ads Keyword Write Operations
 */

import { amountToMicros, extractCustomerId } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { formatDiscoveryResponse, injectGuidance } from '../../shared/interactive-workflow.js';

const logger = getLogger('ads.tools.keywords');

/**
 * Add keywords
 */
export const addKeywordsTool = {
  name: 'add_keywords',
  description: `Add keywords to a Google Ads ad group.

💡 AGENT GUIDANCE - KEYWORD MANAGEMENT:

⚠️ SPEND IMPACT:
- Adding keywords = potential new traffic and spend
- Match type dramatically affects reach and cost
- Always set max CPC bid to control costs

📋 MATCH TYPE GUIDE:

**EXACT Match** [keyword]
- Shows ONLY for exact keyword (and close variants)
- Most control, lowest reach
- Lowest risk of irrelevant clicks
- Best for: Brand terms, high-intent keywords
- Example: [running shoes] → matches "running shoes", "shoes running"

**PHRASE Match** "keyword"
- Shows for searches containing the phrase
- Medium control, medium reach
- Moderate risk
- Best for: Most keywords
- Example: "running shoes" → matches "best running shoes", "running shoes for women"

**BROAD Match** keyword
- Shows for related searches (Google decides)
- Least control, highest reach
- Highest risk of irrelevant clicks
- Best for: Discovery, with tight negative keywords
- Example: running shoes → matches "athletic footwear", "sneakers for jogging"

🎯 RECOMMENDED APPROACH:
1. Start with EXACT and PHRASE match
2. Add BROAD match only with:
   - Strong negative keyword list
   - Lower bids than exact/phrase
   - Close monitoring
3. Use search terms report to find waste

💡 BID STRATEGY:
- EXACT: Highest bid (most relevant)
- PHRASE: Medium bid
- BROAD: Lowest bid (cast wide net)

⚠️ COMMON MISTAKES:
- Adding too many BROAD match without negatives → Budget waste
- Bids too high without testing → Overspend
- Not grouping related keywords → Poor Quality Scores
- No negative keywords → Irrelevant traffic

📊 WORKFLOW:
1. Research keywords (use keyword planner or ideas tool)
2. Group by theme/intent
3. Start with exact/phrase match
4. Set conservative max CPC
5. Add to ad group
6. Monitor search terms report
7. Add negatives as needed
8. Expand to broad match gradually`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad group ID to add keywords to',
      },
      keywords: {
        type: 'array',
        description: 'Array of keywords to add',
        items: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Keyword text',
            },
            matchType: {
              type: 'string',
              enum: ['EXACT', 'PHRASE', 'BROAD'],
              description: 'Match type',
            },
            maxCpcDollars: {
              type: 'number',
              description: 'Maximum CPC bid in dollars (optional)',
            },
          },
          required: ['text', 'matchType'],
        },
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, keywords, confirmationToken } = input;

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
          step: '1/4',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account contains the ad group?',
          nextParam: 'customerId',
          emoji: '🔑',
        });
      }

      // ═══ STEP 2: AD GROUP DISCOVERY ═══
      if (!adGroupId) {
        const campaigns = await client.listCampaigns(customerId);

        if (campaigns.length === 0) {
          const guidanceText = `⚠️ NO CAMPAIGNS FOUND (Step 2/4)

This account has no campaigns. You must create a campaign and ad group before adding keywords.

**Next Steps:**
1. Use create_campaign to create a campaign
2. Create an ad group in that campaign
3. Then return here to add keywords`;

          return injectGuidance({ customerId }, guidanceText);
        }

        // For simplicity, show campaigns and ask user to provide ad group ID
        const guidanceText = `🎯 AD GROUP SELECTION (Step 2/4)

This account has ${campaigns.length} campaign(s).

**To add keywords, you need an ad group ID.**

**How to find ad group IDs:**
1. Use list_campaigns to see all campaigns
2. Each campaign contains ad groups
3. Identify the ad group ID where you want to add keywords

**Alternatively:**
- If you know the ad group ID, provide it now as: adGroupId

**Note:** Ad group listing tool not yet implemented. You need to provide the ad group ID directly.

What is the ad group ID?`;

        return injectGuidance({ customerId }, guidanceText);
      }

      // ═══ STEP 3: KEYWORD INPUT GUIDANCE ═══
      if (!keywords || keywords.length === 0) {
        const guidanceText = `🔑 KEYWORD SPECIFICATION (Step 3/4)

Enter the keywords you want to add:

**Format:**
\`\`\`json
{
  "keywords": [
    {
      "text": "running shoes",
      "matchType": "PHRASE",
      "maxCpcDollars": 2.50
    },
    {
      "text": "nike running shoes",
      "matchType": "EXACT",
      "maxCpcDollars": 3.00
    }
  ]
}
\`\`\`

**Match Types:**
- **EXACT**: [keyword] - Only exact searches (most control, lowest reach)
- **PHRASE**: "keyword" - Searches containing phrase (balanced)
- **BROAD**: keyword - Related searches (least control, highest reach)

**Best Practices:**
- Start with EXACT and PHRASE match
- Set conservative max CPC bids
- Limit to 10-20 keywords per batch for easier management
- Group related keywords together

**Max CPC (optional but recommended):**
- Set per-keyword bid limit
- Prevents overspending on expensive clicks
- Example: 2.50 for $2.50 max per click

How many keywords do you want to add? Provide keywords array.`;

        return injectGuidance({ customerId, adGroupId }, guidanceText);
      }

      // ═══ STEP 4: DRY-RUN PREVIEW (existing approval flow) ═══
      // Vagueness detection - ensure specific IDs
      detectAndEnforceVagueness({
        operation: 'add_keywords',
        inputText: `add ${keywords.length} keywords to ad group ${adGroupId}`,
        inputParams: { customerId, adGroupId, keywordCount: keywords.length },
      });

      // Check bulk limit (max 50 keywords per request)
      if (keywords.length > 50) {
        throw new Error(
          `Cannot add ${keywords.length} keywords in one operation. Maximum is 50. Please batch into smaller operations.`
        );
      }

      // Convert dollar bids to micros
      const keywordsWithMicros = keywords.map((kw: any) => ({
        text: kw.text,
        matchType: kw.matchType,
        cpcBidMicros: kw.maxCpcDollars ? amountToMicros(kw.maxCpcDollars) : undefined,
      }));

      // Build dry-run preview
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'add_keywords',
        'Google Ads',
        customerId
      );

      // Add each keyword as a change
      keywords.forEach((kw: any, index: number) => {
        dryRunBuilder.addChange({
          resource: 'Keyword',
          resourceId: `new_${index + 1}`,
          field: 'keyword',
          currentValue: 'N/A (new keyword)',
          newValue: `"${kw.text}" [${kw.matchType}]${kw.maxCpcDollars ? ` @ $${kw.maxCpcDollars}/click` : ''}`,
          changeType: 'create',
        });
      });

      // Count match types and broad match keywords
      const matchTypeCounts = keywords.reduce(
        (acc: any, kw: any) => {
          acc[kw.matchType] = (acc[kw.matchType] || 0) + 1;
          return acc;
        },
        { EXACT: 0, PHRASE: 0, BROAD: 0 }
      );

      const broadMatchCount = matchTypeCounts.BROAD || 0;

      // Add risks based on match types
      if (broadMatchCount > 0) {
        dryRunBuilder.addRisk(
          `${broadMatchCount} BROAD match keyword(s) will trigger on related searches - may increase spend significantly`
        );
        dryRunBuilder.addRecommendation(
          'Monitor search terms report closely for BROAD match keywords to identify irrelevant traffic'
        );
        dryRunBuilder.addRecommendation(
          'Consider adding negative keywords to prevent wasted spend on BROAD match'
        );
      }

      if (keywords.length > 20) {
        dryRunBuilder.addRisk(
          `Adding ${keywords.length} keywords at once may be difficult to manage and optimize`
        );
        dryRunBuilder.addRecommendation(
          'Consider adding keywords in smaller batches for easier monitoring and optimization'
        );
      }

      // Check for high CPC bids
      const highCpcKeywords = keywords.filter((kw: any) => kw.maxCpcDollars && kw.maxCpcDollars > 10);
      if (highCpcKeywords.length > 0) {
        dryRunBuilder.addRisk(
          `${highCpcKeywords.length} keyword(s) have high CPC bids (>$10) which may increase spend rapidly`
        );
      }

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'add_keywords',
          'Google Ads',
          customerId,
          { adGroupId, keywords }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Keyword addition requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Adding keywords with confirmation', { customerId, adGroupId, count: keywords.length });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          return await client.addKeywords(customerId, adGroupId, keywordsWithMicros);
        }
      );

      return {
        success: true,
        data: {
          customerId,
          adGroupId,
          keywordsAdded: keywords.length,
          matchTypeBreakdown: matchTypeCounts,
          keywords: keywords.map((kw: any) => ({
            text: kw.text,
            matchType: kw.matchType,
            maxCpc: kw.maxCpcDollars ? `$${kw.maxCpcDollars}` : 'Not set',
          })),
          result,
          message: `✅ Added ${keywords.length} keyword(s) to ad group ${adGroupId}`,
        },
      };
    } catch (error) {
      logger.error('Failed to add keywords', error as Error);
      throw error;
    }
  },
};

/**
 * Add negative keywords
 */
export const addNegativeKeywordsTool = {
  name: 'add_negative_keywords',
  description: `Add negative keywords to prevent ads from showing for unwanted searches.

💡 AGENT GUIDANCE - NEGATIVE KEYWORDS (SAVES MONEY!):

✅ THIS IS A MONEY-SAVING OPERATION:
- Prevents ads from showing for irrelevant searches
- Reduces wasted spend
- Improves campaign relevance and CTR
- Generally LOW RISK operation

🎯 WHEN TO ADD NEGATIVES:

**From Search Terms Report:**
- Irrelevant queries getting clicks but no conversions
- Brand competitor names (if not allowed to bid)
- Job seekers ("jobs", "careers", "hiring")
- Free-seekers ("free", "cheap", "discount" if premium product)
- Wrong intent ("how to make" vs "buy")

**Proactive Negatives:**
- Competitor brands
- Informational queries for transactional campaigns
- Geographic locations you don't serve
- Product types you don't sell

⚠️ MATCH TYPE CONSIDERATIONS:

**EXACT Negative** [-keyword]
- Blocks only exact match
- Most precise control
- Safest option

**PHRASE Negative** -"keyword"
- Blocks phrase and close variants
- Good balance
- Most commonly used

**BROAD Negative** -keyword
- Blocks all variations
- Can be too aggressive
- Use carefully - may block wanted traffic

💡 BEST PRACTICES:
- Start with PHRASE match for most negatives
- Use EXACT for very specific blocks
- Be careful with BROAD (can block too much)
- Add at campaign level (affects whole campaign)
- Review search terms weekly and add new negatives
- Keep negative keyword list organized

🎯 WORKFLOW:
1. Review search terms report
2. Identify irrelevant queries
3. Determine appropriate match type
4. Add as negatives
5. Monitor to ensure not blocking wanted traffic`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID to add negatives to',
      },
      keywords: {
        type: 'array',
        description: 'Array of negative keywords',
        items: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Negative keyword text',
            },
            matchType: {
              type: 'string',
              enum: ['EXACT', 'PHRASE', 'BROAD'],
              description: 'Match type (PHRASE recommended for most)',
            },
          },
          required: ['text', 'matchType'],
        },
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
      },
    },
    required: [], // Make all optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, campaignId, keywords, confirmationToken } = input;

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
        logger.info('Account discovery mode - listing accessible accounts');
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) =>
            `${i + 1}. Customer ID: ${a.customerId}\n   Resource: ${a.resourceName}`,
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🏢',
        });
      }

      // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
      if (!campaignId) {
        logger.info('Campaign discovery mode', { customerId });
        const campaigns = await client.listCampaigns(customerId);

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT CAMPAIGN FOR NEGATIVE KEYWORDS',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign?.name || 'N/A'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
          },
          prompt: 'Which campaign should receive negative keywords?',
          nextParam: 'campaignId',
          context: { customerId },
          emoji: '📊',
        });
      }

      // ═══ STEP 3: KEYWORD INPUT GUIDANCE ═══
      if (!keywords || keywords.length === 0) {
        const guidanceText = `📝 PROVIDE NEGATIVE KEYWORDS (Step 3/3)

**Current Context:**
- Account: ${customerId}
- Campaign: ${campaignId}

**💡 NEGATIVE KEYWORD EXAMPLES:**

**Common Money-Saving Negatives:**
- "free" - Block free-seekers
- "cheap" - Block bargain hunters (if premium product)
- "download" - Block software downloaders
- "jobs" - Block job seekers
- "careers" - Block recruitment searchers
- "how to make" - Block DIY tutorials (if selling products)

**Match Type Guide:**
- EXACT [-keyword] - Most precise, blocks exact matches only
- PHRASE [-"keyword"] - Balanced, blocks phrase + close variants (RECOMMENDED)
- BROAD [-keyword] - Aggressive, blocks all variations (use carefully)

**Format:**
Provide as array of objects with "text" and "matchType":
\`\`\`json
{
  "keywords": [
    { "text": "free", "matchType": "PHRASE" },
    { "text": "cheap", "matchType": "PHRASE" },
    { "text": "jobs", "matchType": "EXACT" }
  ]
}
\`\`\`

**What parameter to provide next?**
- keywords (array of {text, matchType})`;

        return injectGuidance(
          { customerId, campaignId },
          guidanceText
        );
      }

      // Vagueness detection
      detectAndEnforceVagueness({
        operation: 'add_negative_keywords',
        inputText: `add ${keywords.length} negative keywords to campaign ${campaignId}`,
        inputParams: { customerId, campaignId, keywordCount: keywords.length },
      });

      // Check bulk limit
      if (keywords.length > 50) {
        throw new Error(
          `Cannot add ${keywords.length} negative keywords in one operation. Maximum is 50. Please batch into smaller operations.`
        );
      }

      // Build dry-run preview
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'add_negative_keywords',
        'Google Ads',
        customerId
      );

      // Add each negative keyword as a change
      keywords.forEach((kw: any, index: number) => {
        dryRunBuilder.addChange({
          resource: 'Negative Keyword',
          resourceId: `new_${index + 1}`,
          field: 'negative_keyword',
          currentValue: 'N/A (new negative)',
          newValue: `-"${kw.text}" [${kw.matchType}]`,
          changeType: 'create',
        });
      });

      // Count match types
      const broadMatchCount = keywords.filter((kw: any) => kw.matchType === 'BROAD').length;

      // Add recommendations based on match types
      if (broadMatchCount > 0) {
        dryRunBuilder.addRecommendation(
          `${broadMatchCount} BROAD match negative(s) will block many variations - monitor to ensure not blocking wanted traffic`
        );
      }

      dryRunBuilder.addRecommendation(
        'Negative keywords reduce wasted spend by preventing ads on irrelevant searches'
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'add_negative_keywords',
          'Google Ads',
          customerId,
          { campaignId, keywords }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Negative keyword addition requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Adding negative keywords with confirmation', { customerId, campaignId, count: keywords.length });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          return await client.addNegativeKeywords(customerId, campaignId, keywords);
        }
      );

      return {
        success: true,
        data: {
          customerId,
          campaignId,
          negativesAdded: keywords.length,
          keywords: keywords.map((kw: any) => `${kw.matchType}: ${kw.text}`),
          result,
          message: `✅ Added ${keywords.length} negative keyword(s) to campaign ${campaignId}`,
        },
      };
    } catch (error) {
      logger.error('Failed to add negative keywords', error as Error);
      throw error;
    }
  },
};
