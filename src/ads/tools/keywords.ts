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
            finalUrls: {
              type: 'array',
              items: { type: 'string' },
              description: 'Keyword-specific landing page URLs (optional)',
            },
            trackingUrlTemplate: {
              type: 'string',
              description: 'Keyword-specific tracking template (optional)',
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
              description: 'Keyword-specific custom URL parameters (optional)',
            },
          },
          required: ['text', 'matchType'],
        },
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, keywords } = input;

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

🎓 **AGENT TRAINING - KEYWORD QUALITY & RELEVANCE:**

**THE THEME COHERENCE RULE:**
All keywords in ad group MUST relate to the SAME theme!

**KEYWORD-TO-AD GROUP RELEVANCE CHECK:**

✅ **Good (Coherent):**
Ad Group: "Dell XPS 15 - Business"
Keywords: "dell xps 15", "xps 15 laptop", "business laptop dell", "premium dell laptop"
→ All relate to Dell XPS 15 business laptops ✅

❌ **Bad (Incoherent):**
Ad Group: "Dell XPS 15 - Business"
Keywords: "dell xps 15", "hp laptop", "printer", "mouse"
→ HP/printer/mouse don't match Dell XPS theme! ❌

**MATCH TYPE STRATEGY - AGENT HELP USER CHOOSE:**

**For each keyword, often use MULTIPLE match types:**
• "dell xps 15" [EXACT] - $3.00 bid (highest intent, exact searchers)
• "dell xps 15" [PHRASE] - $2.50 bid (exploratory, phrase matchers)
• "business laptop" [BROAD] - $1.50 bid (discovery, related searches)

**When to use each:**

**EXACT Match** [keyword]
✅ Use for: Brand terms, specific models, high-intent keywords
✅ Bid: Highest (most valuable traffic)
✅ Safety: Very safe, limited reach
❌ Risk: Almost none (very targeted)

**PHRASE Match** "keyword"
✅ Use for: Most keywords (best balance)
✅ Bid: Medium
✅ Safety: Safe with some reach
❌ Risk: Low (controlled expansion)

**BROAD Match** keyword
⚠️ Use for: Discovery, with TIGHT negative keyword list!
⚠️ Bid: Lowest (testing only)
⚠️ Safety: RISKY without negatives
❌ Risk: HIGH (can trigger on anything "related")

**AGENT QUALITY CHECKLIST - REVIEW USER'S KEYWORDS:**
□ Theme coherence: Do ALL keywords relate to ad group theme?
□ No brand conflicts: Not mixing competing brands (Nike + Adidas)?
□ Match type strategy: Is EXACT bid > PHRASE bid > BROAD bid?
□ BROAD match safety: If BROAD present, are negative keywords planned?
□ Character limits: Keywords under 80 chars?
□ Not too broad: No single-word BROAD match (extreme risk!)?

**AGENT REVIEW EXAMPLES:**
❌ User adds "nike shoes" to "Adidas Sneakers" ad group → Agent: "Brand conflict! 'Nike' doesn't match 'Adidas' ad group theme. Create separate 'Nike' ad group?"
❌ User adds "laptop" [BROAD] → Agent: "Single-word BROAD match = VERY wide reach (tablets, desktops, all laptops). Use 'business laptop' [PHRASE] instead? Or add extensive negatives?"
✅ User adds exact/phrase variations of same keyword → Agent: "Good strategy! You're using multiple match types for 'dell xps 15' to test reach vs control."

**Format:**
\`\`\`json
{
  "keywords": [
    {"text": "dell xps 15", "matchType": "EXACT", "maxCpcDollars": 3.00},
    {"text": "dell xps 15 laptop", "matchType": "PHRASE", "maxCpcDollars": 2.50}
  ]
}
\`\`\`

Provide keywords array (or describe what you want to target and agent can help!)`;

        return injectGuidance({ customerId, adGroupId }, guidanceText);
      }

      // ═══ STEP 4: EXECUTE KEYWORD ADDITION ═══
      // Note: CREATE operations don't need approval (like create_campaign, create_ad_group)
      // Keywords start in ENABLED status but ad group is PAUSED, so safe

      // Check bulk limit (max 50 keywords per request)
      if (keywords.length > 50) {
        throw new Error(
          `Cannot add ${keywords.length} keywords in one operation. Maximum is 50. Please batch into smaller operations.`
        );
      }

      logger.info('Adding keywords', { customerId, adGroupId, count: keywords.length });

      // Convert dollar bids to micros and add new fields
      const keywordsWithMicros = keywords.map((kw: any) => ({
        text: kw.text,
        matchType: kw.matchType,
        cpcBidMicros: kw.maxCpcDollars ? amountToMicros(kw.maxCpcDollars) : undefined,
        finalUrls: kw.finalUrls,
        trackingUrlTemplate: kw.trackingUrlTemplate,
        urlCustomParameters: kw.urlCustomParameters,
      }));

      const result = await client.addKeywords(customerId, adGroupId, keywordsWithMicros);

      // Count match types
      const matchTypeCounts = keywords.reduce(
        (acc: any, kw: any) => {
          acc[kw.matchType] = (acc[kw.matchType] || 0) + 1;
          return acc;
        },
        { EXACT: 0, PHRASE: 0, BROAD: 0 }
      );

      const guidanceText = `✅ KEYWORDS ADDED SUCCESSFULLY

**Summary:**
- Total Keywords: ${keywords.length}
- EXACT Match: ${matchTypeCounts.EXACT}
- PHRASE Match: ${matchTypeCounts.PHRASE}
- BROAD Match: ${matchTypeCounts.BROAD}

**Keywords Added:**
${keywords.map((kw: any, i: number) =>
  `${i + 1}. "${kw.text}" [${kw.matchType}]${kw.maxCpcDollars ? ` @ $${kw.maxCpcDollars}/click` : ''}${kw.finalUrls ? ` → ${kw.finalUrls[0]}` : ''}`
).join('\n')}

🎯 **NEXT STEPS:**

**1. Create Ads (Required before enabling):**
   • use create_ad with agent assistance
     → Agent can generate professional headlines/descriptions!

**2. Monitor Search Terms:**
   • use get_search_terms_report after campaign runs
     → Find irrelevant queries triggering your keywords

**3. Add Negative Keywords:**
   • use add_negative_keywords to block irrelevant traffic
     → Especially important for BROAD match keywords

**4. Optimize Bids:**
   • use set_keyword_bid to adjust based on performance
     → Higher bids for converting keywords, lower for exploratory

${matchTypeCounts.BROAD > 0 ? `\n⚠️ **BROAD MATCH WARNING:** You added ${matchTypeCounts.BROAD} BROAD match keyword(s). Monitor search terms closely to prevent wasted spend!` : ''}

${keywords.length > 20 ? `\n⚠️ **LARGE BATCH WARNING:** ${keywords.length} keywords may be hard to manage. Consider monitoring in smaller groups.` : ''}`;

      return injectGuidance({
        customerId,
        adGroupId,
        keywordsAdded: keywords.length,
        matchTypeBreakdown: matchTypeCounts,
        keywords,
        result,
      }, guidanceText);
    } catch (error) {
      logger.error('Failed to add keywords', error as Error);
      throw error;
    }
  },
};

/**
 * List keywords
 */
export const listKeywordsTool = {
  name: 'list_keywords',
  description: `List all keywords in an account or ad group with performance metrics.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad group ID to filter keywords (optional - if not provided, shows all keywords)',
      },
      includeRemoved: {
        type: 'boolean',
        description: 'Include removed keywords (default: false)',
      },
    },
    required: [], // All optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, includeRemoved = false } = input;

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
          step: '1/2',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account contains the keywords?',
          nextParam: 'customerId',
          emoji: '🔑',
        });
      }

      // ═══ STEP 2: EXECUTE QUERY ═══
      logger.info('Listing keywords', { customerId, adGroupId, includeRemoved });

      const customer = client.getCustomer(customerId);

      // Build GAQL query
      let query = `
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.criterion_id,
          ad_group_criterion.status,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.cpc_bid_micros,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions
        FROM keyword_view
        WHERE ad_group_criterion.type = 'KEYWORD'
      `;

      if (!includeRemoved) {
        query += ` AND ad_group_criterion.status != 'REMOVED'`;
      }

      if (adGroupId) {
        query += ` AND ad_group.id = ${adGroupId}`;
      }

      query += ' ORDER BY metrics.clicks DESC LIMIT 500';

      const results = await customer.query(query);

      if (results.length === 0) {
        const guidanceText = `📋 NO KEYWORDS FOUND

**Account:** ${customerId}
${adGroupId ? `**Ad Group:** ${adGroupId}\n` : ''}

No keywords found matching your criteria.

**Possible Reasons:**
- No keywords added yet
- All keywords removed
${adGroupId ? '- Wrong ad group ID' : '- Account has no active campaigns'}

**Next Steps:**
${adGroupId ? '- Use add_keywords to add keywords to this ad group' : '- Use list_campaigns to see all campaigns and ad groups'}`;

        return injectGuidance({ customerId, adGroupId }, guidanceText);
      }

      // Analyze keyword performance
      const totalKeywords = results.length;
      const statusCounts = results.reduce((acc: any, row: any) => {
        const status = row.ad_group_criterion?.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const matchTypeCounts = results.reduce((acc: any, row: any) => {
        const matchType = row.ad_group_criterion?.keyword?.match_type || 'UNKNOWN';
        acc[matchType] = (acc[matchType] || 0) + 1;
        return acc;
      }, {});

      // Calculate quality score distribution
      const qualityScores = results
        .map((row: any) => row.ad_group_criterion?.quality_info?.quality_score)
        .filter((qs: any) => qs !== null && qs !== undefined);

      const avgQualityScore = qualityScores.length > 0
        ? (qualityScores.reduce((sum: number, qs: number) => sum + qs, 0) / qualityScores.length).toFixed(1)
        : 'N/A';

      const lowQualityKeywords = results.filter(
        (row: any) => row.ad_group_criterion?.quality_info?.quality_score && row.ad_group_criterion.quality_info.quality_score < 5
      ).length;

      // Find top performers and underperformers
      const keywordsWithMetrics = results.filter((row: any) => (row.metrics?.clicks || 0) > 0);
      const topPerformers = keywordsWithMetrics.slice(0, 5);
      const bottomPerformers = keywordsWithMetrics.slice(-5).reverse();

      // Format response
      let responseText = `📊 KEYWORD ANALYSIS - ${totalKeywords} KEYWORD(S)

**Account:** ${customerId}
${adGroupId ? `**Ad Group:** ${adGroupId}\n` : ''}

**📈 OVERVIEW:**
- Total Keywords: ${totalKeywords}
- Match Types: ${Object.entries(matchTypeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}
- Status: ${Object.entries(statusCounts).map(([status, count]) => `${status}: ${count}`).join(', ')}
- Avg Quality Score: ${avgQualityScore}
${lowQualityKeywords > 0 ? `- ⚠️ Low Quality (<5): ${lowQualityKeywords} keywords\n` : ''}

**🎯 TOP PERFORMERS (by clicks):**
${topPerformers.map((row: any, i: number) => {
  const kw = row.ad_group_criterion?.keyword;
  const metrics = row.metrics || {};
  const qs = row.ad_group_criterion?.quality_info?.quality_score;
  const cost = metrics.cost_micros ? (metrics.cost_micros / 1_000_000).toFixed(2) : '0.00';
  return `${i + 1}. "${kw?.text}" [${kw?.match_type}]
   Clicks: ${metrics.clicks || 0} | Impr: ${metrics.impressions || 0} | CTR: ${(metrics.ctr * 100 || 0).toFixed(2)}%
   Cost: $${cost} | Conv: ${metrics.conversions || 0} | QS: ${qs || 'N/A'}`;
}).join('\n\n')}

${bottomPerformers.length > 0 ? `**⚠️ UNDERPERFORMERS (lowest clicks):**
${bottomPerformers.map((row: any, i: number) => {
  const kw = row.ad_group_criterion?.keyword;
  const metrics = row.metrics || {};
  const qs = row.ad_group_criterion?.quality_info?.quality_score;
  return `${i + 1}. "${kw?.text}" [${kw?.match_type}] - QS: ${qs || 'N/A'} - Clicks: ${metrics.clicks || 0}`;
}).join('\n')}\n` : ''}

**💡 INSIGHTS:**
${lowQualityKeywords > 0 ? `✅ ${lowQualityKeywords} keywords have low Quality Scores (<5) - consider improving ad relevance or landing pages\n` : ''}
${matchTypeCounts.BROAD > 0 ? `⚠️ ${matchTypeCounts.BROAD} BROAD match keywords - monitor search terms report for waste\n` : ''}
${statusCounts.PAUSED > 0 ? `⚠️ ${statusCounts.PAUSED} keywords are PAUSED - review if they should be enabled\n` : ''}

**🎯 NEXT STEPS:**
• Check search terms: use get_search_terms to see actual queries
${lowQualityKeywords > 0 ? '• Optimize low QS keywords: review ad copy and landing pages\n' : ''}
${bottomPerformers.length > 0 ? '• Review underperformers: consider pausing or removing\n' : ''}
• Add negatives: use add_negative_keywords to block waste`;

      return {
        success: true,
        content: [{ type: 'text', text: responseText }],
        data: {
          customerId,
          adGroupId,
          totalKeywords,
          statusBreakdown: statusCounts,
          matchTypeBreakdown: matchTypeCounts,
          avgQualityScore,
          lowQualityCount: lowQualityKeywords,
          keywords: results.map((row: any) => ({
            text: row.ad_group_criterion?.keyword?.text,
            matchType: row.ad_group_criterion?.keyword?.match_type,
            criterionId: row.ad_group_criterion?.criterion_id,
            status: row.ad_group_criterion?.status,
            qualityScore: row.ad_group_criterion?.quality_info?.quality_score,
            cpcBidMicros: row.ad_group_criterion?.cpc_bid_micros,
            adGroupId: row.ad_group?.id,
            adGroupName: row.ad_group?.name,
            campaignId: row.campaign?.id,
            campaignName: row.campaign?.name,
            impressions: row.metrics?.impressions || 0,
            clicks: row.metrics?.clicks || 0,
            ctr: row.metrics?.ctr || 0,
            costMicros: row.metrics?.cost_micros || 0,
            conversions: row.metrics?.conversions || 0,
          })),
        },
      };
    } catch (error) {
      logger.error('Failed to list keywords', error as Error);
      throw error;
    }
  },
};

/**
 * Remove keywords
 */
export const removeKeywordsTool = {
  name: 'remove_keywords',
  description: `Remove keywords from a Google Ads ad group (DESTRUCTIVE - requires approval).`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad group ID containing keywords to remove',
      },
      criterionIds: {
        type: 'array',
        description: 'Array of criterion IDs to remove',
        items: {
          type: 'string',
        },
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
      },
    },
    required: [], // All optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, criterionIds, confirmationToken } = input;

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
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🔑',
        });
      }

      // ═══ STEP 2: AD GROUP DISCOVERY ═══
      if (!adGroupId) {
        const guidanceText = `🎯 AD GROUP SELECTION (Step 2/4)

**How to find the ad group ID:**
1. Use list_keywords to see all keywords with their ad group IDs
2. Identify the ad group containing keywords to remove
3. Provide the ad group ID

**Alternatively:**
- If you know the ad group ID, provide it now as: adGroupId

What is the ad group ID?`;

        return injectGuidance({ customerId }, guidanceText);
      }

      // ═══ STEP 3: KEYWORD SELECTION ═══
      if (!criterionIds || criterionIds.length === 0) {
        // List keywords in this ad group for selection
        const customer = client.getCustomer(customerId);

        const query = `
          SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.criterion_id,
            ad_group_criterion.status,
            ad_group_criterion.quality_info.quality_score,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions
          FROM keyword_view
          WHERE ad_group_criterion.type = 'KEYWORD'
            AND ad_group.id = ${adGroupId}
            AND ad_group_criterion.status != 'REMOVED'
          ORDER BY metrics.clicks DESC
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          const guidanceText = `⚠️ NO KEYWORDS FOUND

Ad group ${adGroupId} has no active keywords.

**Next Steps:**
- Verify ad group ID is correct
- Use list_keywords to see all keywords in account`;

          return injectGuidance({ customerId, adGroupId }, guidanceText);
        }

        const keywordList = results.map((row: any, i: number) => {
          const kw = row.ad_group_criterion?.keyword;
          const metrics = row.metrics || {};
          const criterionId = row.ad_group_criterion?.criterion_id;
          const qs = row.ad_group_criterion?.quality_info?.quality_score;
          const cost = metrics.cost_micros ? (metrics.cost_micros / 1_000_000).toFixed(2) : '0.00';

          return `${i + 1}. "${kw?.text}" [${kw?.match_type}] - ID: ${criterionId}
   Clicks: ${metrics.clicks || 0} | Cost: $${cost} | Conv: ${metrics.conversions || 0} | QS: ${qs || 'N/A'}`;
        }).join('\n\n');

        const guidanceText = `🔑 SELECT KEYWORDS TO REMOVE (Step 3/4)

**Ad Group:** ${adGroupId}
**Found:** ${results.length} keyword(s)

${keywordList}

**⚠️ WARNING:** Removing keywords is DESTRUCTIVE and cannot be easily undone.

**To proceed:**
Provide criterionIds as array of IDs from the list above.

**Example:**
\`\`\`json
{
  "criterionIds": ["123456789", "987654321"]
}
\`\`\`

**What to provide:**
- criterionIds (array of criterion IDs to remove)`;

        return injectGuidance({ customerId, adGroupId }, guidanceText);
      }

      // ═══ STEP 4: DRY-RUN PREVIEW ═══
      // Fetch keyword details for preview
      const customer = client.getCustomer(customerId);

      const criterionIdsStr = criterionIds.join(', ');
      const query = `
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.criterion_id,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM keyword_view
        WHERE ad_group_criterion.type = 'KEYWORD'
          AND ad_group.id = ${adGroupId}
          AND ad_group_criterion.criterion_id IN (${criterionIdsStr})
      `;

      const keywordDetails = await customer.query(query);

      if (keywordDetails.length === 0) {
        throw new Error(`No keywords found with the provided criterion IDs in ad group ${adGroupId}`);
      }

      // Vagueness detection
      detectAndEnforceVagueness({
        operation: 'remove_keywords',
        inputText: `remove ${criterionIds.length} keywords from ad group ${adGroupId}`,
        inputParams: { customerId, adGroupId, keywordCount: criterionIds.length },
      });

      // Check bulk limit
      if (criterionIds.length > 50) {
        throw new Error(
          `Cannot remove ${criterionIds.length} keywords in one operation. Maximum is 50. Please batch into smaller operations.`
        );
      }

      // Build dry-run preview
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'remove_keywords',
        'Google Ads',
        customerId
      );

      // Add each keyword as a change
      keywordDetails.forEach((row: any) => {
        const kw = row.ad_group_criterion?.keyword;
        // const metrics = ...; // Unused metrics calculation removed
        const criterionId = row.ad_group_criterion?.criterion_id;

        dryRunBuilder.addChange({
          resource: 'Keyword',
          resourceId: criterionId,
          field: 'status',
          currentValue: `"${kw?.text}" [${kw?.match_type}] - Active`,
          newValue: 'REMOVED (deleted)',
          changeType: 'delete',
        });
      });

      // Add warnings
      dryRunBuilder.addRisk(
        `Removing ${keywordDetails.length} keyword(s) is DESTRUCTIVE and cannot be easily undone`
      );

      const totalCost = keywordDetails.reduce(
        (sum: number, row: any) => sum + (row.metrics?.cost_micros || 0),
        0
      ) / 1_000_000;

      if (totalCost > 100) {
        dryRunBuilder.addRisk(
          `These keywords have spent $${totalCost.toFixed(2)} historically - verify you want to remove them`
        );
      }

      const hasConversions = keywordDetails.some((row: any) => (row.metrics?.conversions || 0) > 0);
      if (hasConversions) {
        dryRunBuilder.addRisk(
          `Some keywords have generated conversions - removing may impact performance`
        );
      }

      dryRunBuilder.addRecommendation(
        'Consider pausing keywords instead of removing if you want to test disabling them first'
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'remove_keywords',
          'Google Ads',
          customerId,
          { adGroupId, criterionIds }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Keyword removal requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Removing keywords with confirmation', { customerId, adGroupId, count: criterionIds.length });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          // Build remove operations
          const operations = criterionIds.map((criterionId: string) => ({
            resource_name: `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`,
          }));

          return await customer.adGroupCriteria.remove(operations as any);
        }
      );

      return {
        success: true,
        data: {
          customerId,
          adGroupId,
          keywordsRemoved: criterionIds.length,
          criterionIds,
          result,
          message: `✅ Removed ${criterionIds.length} keyword(s) from ad group ${adGroupId}`,
        },
      };
    } catch (error) {
      logger.error('Failed to remove keywords', error as Error);
      throw error;
    }
  },
};

/**
 * Set keyword bid
 */
export const setKeywordBidTool = {
  name: 'set_keyword_bid',
  description: `Set maximum CPC bid for a specific keyword (granular per-keyword bid control).

💡 AGENT GUIDANCE - KEYWORD BID MANAGEMENT:

🎯 WHEN TO ADJUST KEYWORD BIDS:

**Increase Bids:**
- High converting keywords with low impression share
- Keywords losing to competitors (lost IS rank)
- High Quality Score keywords (you pay less per click)
- Brand terms (protect your brand)
- Bottom of funnel keywords (high intent)

**Decrease Bids:**
- High spend but low/no conversions
- High CPA (cost per acquisition) keywords
- Top of funnel keywords (lower intent)
- Research/informational keywords
- Keywords with low Quality Score (you pay premium)

⚠️ BID STRATEGY CONSIDERATIONS:

**Manual CPC Campaigns:**
- Full control over individual keyword bids
- This tool sets max CPC at keyword level
- Overrides ad group default bid

**Automated Bidding (Target CPA, Target ROAS, Maximize Conversions):**
- Google sets bids automatically
- Manual bids act as maximums
- Use carefully - may conflict with automation

💡 BEST PRACTICES:
- Make small incremental changes (10-20% at a time)
- Monitor performance after bid changes
- Check impression share - if 100%, bid may be too high
- Check avg position - if always #1, may be overpaying
- Set bid caps to prevent runaway spend
- Consider Quality Score - higher QS = lower actual CPC

📊 BID ANALYSIS:
- Current CPC vs Max CPC = headroom
- If current = max → increase to get more volume
- If current << max → decrease to save money
- Lost IS (rank) = need higher bids
- Lost IS (budget) = need higher budget, not bids

⚠️ COMMON MISTAKES:
- Raising bids without checking Quality Score first
- Bidding same amount for all keywords
- Not considering conversion rate differences
- Ignoring impression share metrics
- Making too many changes at once`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad group ID containing the keyword',
      },
      criterionId: {
        type: 'string',
        description: 'Criterion ID of the keyword to update',
      },
      newBidDollars: {
        type: 'number',
        description: 'New maximum CPC bid in dollars',
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview (optional)',
      },
    },
    required: [], // All optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, criterionId, newBidDollars, confirmationToken } = input;

      // Extract OAuth tokens
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create client
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
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🔑',
        });
      }

      // ═══ STEP 2: KEYWORD DISCOVERY ═══
      if (!adGroupId || !criterionId) {
        const customer = client.getCustomer(customerId);

        const query = `
          SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.criterion_id,
            ad_group_criterion.cpc_bid_micros,
            ad_group_criterion.quality_info.quality_score,
            ad_group.id,
            ad_group.name,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.average_cpc
          FROM keyword_view
          WHERE ad_group_criterion.type = 'KEYWORD'
            AND ad_group_criterion.status != 'REMOVED'
          ORDER BY metrics.clicks DESC
          LIMIT 100
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          const guidanceText = `⚠️ NO KEYWORDS FOUND

Account ${customerId} has no active keywords.

**Next Steps:**
- Use add_keywords to add keywords first`;

          return injectGuidance({ customerId }, guidanceText);
        }

        const keywordList = results.map((row: any, i: number) => {
          const kw = row.ad_group_criterion?.keyword;
          const metrics = row.metrics || {};
          const criterionId = row.ad_group_criterion?.criterion_id;
          const adGroupId = row.ad_group?.id;
          const currentBid = row.ad_group_criterion?.cpc_bid_micros
            ? (row.ad_group_criterion.cpc_bid_micros / 1_000_000).toFixed(2)
            : 'Not set';
          const avgCpc = metrics.average_cpc ? (metrics.average_cpc / 1_000_000).toFixed(2) : '0.00';
          const qs = row.ad_group_criterion?.quality_info?.quality_score;

          return `${i + 1}. "${kw?.text}" [${kw?.match_type}]
   Campaign: ${row.campaign?.name}
   Ad Group: ${row.ad_group?.name} (ID: ${adGroupId})
   Criterion ID: ${criterionId}
   Current Max CPC: $${currentBid} | Avg CPC: $${avgCpc}
   Clicks: ${metrics.clicks || 0} | Conv: ${metrics.conversions || 0} | QS: ${qs || 'N/A'}`;
        }).join('\n\n');

        const guidanceText = `🔑 SELECT KEYWORD TO UPDATE BID (Step 2/4)

**Found ${results.length} keyword(s)**

${keywordList}

**To proceed:**
Provide both:
- adGroupId (from list above)
- criterionId (from list above)`;

        return injectGuidance({ customerId }, guidanceText);
      }

      // ═══ STEP 3: BID AMOUNT GUIDANCE ═══
      if (newBidDollars === undefined || newBidDollars === null) {
        // Fetch current keyword details
        const customer = client.getCustomer(customerId);

        const query = `
          SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.cpc_bid_micros,
            ad_group_criterion.quality_info.quality_score,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.average_cpc,
            metrics.search_impression_share,
            metrics.search_rank_lost_impression_share
          FROM keyword_view
          WHERE ad_group_criterion.type = 'KEYWORD'
            AND ad_group.id = ${adGroupId}
            AND ad_group_criterion.criterion_id = ${criterionId}
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          throw new Error(`Keyword not found: ad group ${adGroupId}, criterion ${criterionId}`);
        }

        const row = results[0];
        const kw = row.ad_group_criterion?.keyword;
        const metrics = row.metrics || {};
        const currentBid = row.ad_group_criterion?.cpc_bid_micros
          ? (row.ad_group_criterion.cpc_bid_micros / 1_000_000).toFixed(2)
          : 'Not set';
        const avgCpc = metrics.average_cpc ? (metrics.average_cpc / 1_000_000).toFixed(2) : '0.00';
        const qs = row.ad_group_criterion?.quality_info?.quality_score;
        const impressionShare = metrics.search_impression_share
          ? (metrics.search_impression_share * 100).toFixed(1)
          : 'N/A';
        const lostIsRank = metrics.search_rank_lost_impression_share
          ? (metrics.search_rank_lost_impression_share * 100).toFixed(1)
          : 'N/A';

        const guidanceText = `💰 BID AMOUNT SELECTION (Step 3/4)

**Current Keyword:**
"${kw?.text}" [${kw?.match_type}]

**📊 CURRENT PERFORMANCE:**
- Current Max CPC: $${currentBid}
- Avg Actual CPC: $${avgCpc}
- Clicks: ${metrics.clicks || 0}
- Conversions: ${metrics.conversions || 0}
- Quality Score: ${qs || 'N/A'}
- Impression Share: ${impressionShare}%
${lostIsRank !== 'N/A' ? `- Lost IS (rank): ${lostIsRank}% (competitor bids higher)\n` : ''}

**💡 BID RECOMMENDATIONS:**

${lostIsRank !== 'N/A' && parseFloat(lostIsRank) > 20
  ? `⚠️ High Lost IS (rank) → Consider INCREASING bid (competitors outbidding you)\n`
  : ''}
${parseFloat(impressionShare) > 90
  ? `✅ High impression share → May be able to DECREASE bid slightly\n`
  : ''}
${qs && qs >= 7
  ? `✅ High Quality Score (${qs}) → You get discounts, safe to bid competitively\n`
  : ''}
${qs && qs < 5
  ? `⚠️ Low Quality Score (${qs}) → Fix relevance first, bid increases won't help much\n`
  : ''}

**SUGGESTED BID CHANGES:**
- Small increase: $${(parseFloat(currentBid || '0') * 1.1).toFixed(2)} (+10%)
- Moderate increase: $${(parseFloat(currentBid || '0') * 1.25).toFixed(2)} (+25%)
- Small decrease: $${(parseFloat(currentBid || '0') * 0.9).toFixed(2)} (-10%)
- Moderate decrease: $${(parseFloat(currentBid || '0') * 0.75).toFixed(2)} (-25%)

**What parameter to provide next?**
- newBidDollars (e.g., 2.50 for $2.50)`;

        return injectGuidance(
          { customerId, adGroupId, criterionId },
          guidanceText
        );
      }

      // ═══ STEP 4: DRY-RUN PREVIEW ═══
      // Fetch current details for preview
      const customer = client.getCustomer(customerId);

      const query = `
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.cpc_bid_micros
        FROM keyword_view
        WHERE ad_group.id = ${adGroupId}
          AND ad_group_criterion.criterion_id = ${criterionId}
      `;

      const results = await customer.query(query);

      if (results.length === 0) {
        throw new Error(`Keyword not found: ad group ${adGroupId}, criterion ${criterionId}`);
      }

      const row = results[0];
      const kw = row.ad_group_criterion?.keyword;
      const currentBidMicros = row.ad_group_criterion?.cpc_bid_micros || 0;
      const currentBid = currentBidMicros / 1_000_000;
      const newBidMicros = amountToMicros(newBidDollars);
      const bidChange = newBidDollars - currentBid;
      const bidChangePercent = currentBid > 0 ? ((bidChange / currentBid) * 100).toFixed(1) : 'N/A';

      // Vagueness detection
      detectAndEnforceVagueness({
        operation: 'set_keyword_bid',
        inputText: `set bid for keyword ${kw?.text} to $${newBidDollars}`,
        inputParams: { customerId, adGroupId, criterionId, newBidDollars },
      });

      // Build dry-run
      const approvalEnforcer = getApprovalEnforcer();
      const dryRunBuilder = new DryRunResultBuilder(
        'set_keyword_bid',
        'Google Ads',
        customerId
      );

      dryRunBuilder.addChange({
        resource: 'Keyword Bid',
        resourceId: criterionId,
        field: 'max_cpc',
        currentValue: `"${kw?.text}" [${kw?.match_type}] - $${currentBid.toFixed(2)}/click`,
        newValue: `$${newBidDollars.toFixed(2)}/click`,
        changeType: 'update',
      });

      // Add risks/recommendations
      if (Math.abs(bidChange) > currentBid * 0.5) {
        dryRunBuilder.addRisk(
          `Large bid change (${bidChangePercent}%) may cause significant traffic/spend changes`
        );
        dryRunBuilder.addRecommendation(
          'Consider making smaller incremental changes (10-20%) and monitoring results'
        );
      }

      if (newBidDollars > 10) {
        dryRunBuilder.addRisk(
          `High CPC bid ($${newBidDollars}) may increase spend rapidly`
        );
      }

      if (bidChange > 0) {
        dryRunBuilder.addRecommendation(
          'Monitor impression share and position after bid increase'
        );
      } else {
        dryRunBuilder.addRecommendation(
          'Monitor impression share - may decrease after bid reduction'
        );
      }

      const dryRun = dryRunBuilder.build();

      // If no confirmation, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'set_keyword_bid',
          'Google Ads',
          customerId,
          { adGroupId, criterionId, newBidDollars }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message: 'Keyword bid update requires approval. Review and call again with confirmationToken.',
        };
      }

      // Execute with confirmation
      logger.info('Setting keyword bid with confirmation', { customerId, adGroupId, criterionId, newBidDollars });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const resourceName = `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;

          return await customer.adGroupCriteria.update([{
            resource_name: resourceName,
            cpc_bid_micros: newBidMicros,
          }] as any);
        }
      );

      return {
        success: true,
        data: {
          customerId,
          adGroupId,
          criterionId,
          keyword: kw?.text,
          matchType: kw?.match_type,
          oldBid: `$${currentBid.toFixed(2)}`,
          newBid: `$${newBidDollars.toFixed(2)}`,
          change: `${bidChange >= 0 ? '+' : ''}${bidChange.toFixed(2)} (${bidChange >= 0 ? '+' : ''}${bidChangePercent}%)`,
          result,
          message: `✅ Updated bid for "${kw?.text}" from $${currentBid.toFixed(2)} to $${newBidDollars.toFixed(2)}`,
        },
      };
    } catch (error) {
      logger.error('Failed to set keyword bid', error as Error);
      throw error;
    }
  },
};

/**
 * Remove negative keywords
 */
export const removeNegativeKeywordsTool = {
  name: 'remove_negative_keywords',
  description: `Remove negative keywords from a campaign (allows ads to show for previously blocked searches).`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID containing negative keywords',
      },
      criterionIds: {
        type: 'array',
        description: 'Array of criterion IDs of negatives to remove',
        items: {
          type: 'string',
        },
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview (optional)',
      },
    },
    required: [], // All optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, campaignId, criterionIds, confirmationToken } = input;

      // Extract OAuth tokens
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create client
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🔑',
        });
      }

      // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
      if (!campaignId) {
        const campaigns = await client.listCampaigns(customerId);

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT CAMPAIGN',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign?.name || 'N/A'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}`;
          },
          prompt: 'Which campaign contains negative keywords to remove?',
          nextParam: 'campaignId',
          context: { customerId },
          emoji: '📊',
        });
      }

      // ═══ STEP 3: NEGATIVE KEYWORD SELECTION ═══
      if (!criterionIds || criterionIds.length === 0) {
        const customer = client.getCustomer(customerId);

        // Query negative keywords
        const query = `
          SELECT
            campaign_criterion.keyword.text,
            campaign_criterion.keyword.match_type,
            campaign_criterion.criterion_id,
            campaign_criterion.negative
          FROM campaign_criterion
          WHERE campaign.id = ${campaignId}
            AND campaign_criterion.negative = TRUE
            AND campaign_criterion.type = 'KEYWORD'
            AND campaign_criterion.status != 'REMOVED'
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          const guidanceText = `⚠️ NO NEGATIVE KEYWORDS FOUND

Campaign ${campaignId} has no active negative keywords.

**Next Steps:**
- Verify campaign ID is correct
- Use add_negative_keywords if you want to add negatives`;

          return injectGuidance({ customerId, campaignId }, guidanceText);
        }

        const negativeList = results.map((row: any, i: number) => {
          const kw = row.campaign_criterion?.keyword;
          const criterionId = row.campaign_criterion?.criterion_id;

          return `${i + 1}. "-${kw?.text}" [${kw?.match_type}] - ID: ${criterionId}`;
        }).join('\n');

        const guidanceText = `📝 SELECT NEGATIVE KEYWORDS TO REMOVE (Step 3/3)

**Campaign:** ${campaignId}
**Found:** ${results.length} negative keyword(s)

${negativeList}

**⚠️ WARNING:** Removing negative keywords will allow ads to show for previously blocked searches. This may:
- Increase impressions and clicks
- Potentially increase irrelevant traffic
- Increase spend

**To proceed:**
Provide criterionIds as array of IDs from above.

**Example:**
\`\`\`json
{
  "criterionIds": ["123456789", "987654321"]
}
\`\`\``;

        return injectGuidance({ customerId, campaignId }, guidanceText);
      }

      // ═══ STEP 4: DRY-RUN PREVIEW ═══
      // Fetch details for preview
      const customer = client.getCustomer(customerId);

      const criterionIdsStr = criterionIds.join(', ');
      const query = `
        SELECT
          campaign_criterion.keyword.text,
          campaign_criterion.keyword.match_type,
          campaign_criterion.criterion_id
        FROM campaign_criterion
        WHERE campaign.id = ${campaignId}
          AND campaign_criterion.criterion_id IN (${criterionIdsStr})
          AND campaign_criterion.negative = TRUE
      `;

      const negativeDetails = await customer.query(query);

      if (negativeDetails.length === 0) {
        throw new Error(`No negative keywords found with the provided criterion IDs in campaign ${campaignId}`);
      }

      // Vagueness detection
      detectAndEnforceVagueness({
        operation: 'remove_negative_keywords',
        inputText: `remove ${criterionIds.length} negative keywords from campaign ${campaignId}`,
        inputParams: { customerId, campaignId, count: criterionIds.length },
      });

      // Build dry-run
      const approvalEnforcer = getApprovalEnforcer();
      const dryRunBuilder = new DryRunResultBuilder(
        'remove_negative_keywords',
        'Google Ads',
        customerId
      );

      // Add each negative as change
      negativeDetails.forEach((row: any) => {
        const kw = row.campaign_criterion?.keyword;
        const criterionId = row.campaign_criterion?.criterion_id;

        dryRunBuilder.addChange({
          resource: 'Negative Keyword',
          resourceId: criterionId,
          field: 'status',
          currentValue: `-"${kw?.text}" [${kw?.match_type}] - Blocking`,
          newValue: 'REMOVED (ads will show)',
          changeType: 'delete',
        });
      });

      dryRunBuilder.addRisk(
        `Removing ${negativeDetails.length} negative keyword(s) will allow ads to show for previously blocked searches`
      );

      dryRunBuilder.addRisk(
        'This may increase impressions, clicks, and spend on potentially irrelevant searches'
      );

      dryRunBuilder.addRecommendation(
        'Monitor search terms report after removal to ensure no wasted spend on irrelevant queries'
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'remove_negative_keywords',
          'Google Ads',
          customerId,
          { campaignId, criterionIds }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message: 'Negative keyword removal requires approval. Review and call again with confirmationToken.',
        };
      }

      // Execute with confirmation
      logger.info('Removing negative keywords with confirmation', { customerId, campaignId, count: criterionIds.length });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const operations = criterionIds.map((criterionId: string) => ({
            resource_name: `customers/${customerId}/campaignCriteria/${campaignId}~${criterionId}`,
          }));

          return await customer.campaignCriteria.remove(operations as any);
        }
      );

      return {
        success: true,
        data: {
          customerId,
          campaignId,
          negativesRemoved: criterionIds.length,
          criterionIds,
          result,
          message: `✅ Removed ${criterionIds.length} negative keyword(s) from campaign ${campaignId}`,
        },
      };
    } catch (error) {
      logger.error('Failed to remove negative keywords', error as Error);
      throw error;
    }
  },
};

/**
 * Update keyword match type
 */
export const updateKeywordMatchTypeTool = {
  name: 'update_keyword_match_type',
  description: `Change keyword match type (EXACT ↔ PHRASE ↔ BROAD) without deleting/re-adding.

💡 AGENT GUIDANCE - MATCH TYPE CHANGES:

🎯 WHEN TO CHANGE MATCH TYPES:

**EXACT → PHRASE (Expand Reach):**
- Exact match getting conversions but limited volume
- Want to capture related variations
- Quality Score is high (7+)
- Budget has room to scale

**PHRASE → EXACT (More Control):**
- Getting too much irrelevant traffic
- High spend on unwanted variations
- Want tighter control over queries
- Quality Score declining

**PHRASE/EXACT → BROAD (Discovery):**
- Need more volume
- Have strong negative keyword list
- Want to discover new queries
- Quality Score is excellent (8+)
- Willing to monitor closely

**BROAD → PHRASE/EXACT (Reduce Waste):**
- Too much irrelevant traffic
- High spend, low conversions
- Search terms report shows waste
- Need more control

⚠️ TECHNICAL LIMITATION - GOOGLE ADS API:

**IMPORTANT:** The Google Ads API does NOT support directly updating match type on existing keywords.

**Workaround Required:**
1. Remove old keyword (old match type)
2. Add new keyword (same text, new match type)
3. Preserve historical data by using same text

**This tool automates the workaround:**
- Queries current keyword details
- Shows dry-run of remove + add
- Executes both operations atomically
- Preserves keyword text and settings

💡 BEST PRACTICES:
- Start conservative (EXACT/PHRASE) and expand
- Have negative keywords before going BROAD
- Monitor search terms after match type changes
- Expect traffic changes within 24-48 hours
- Adjust bids when changing match types:
  - BROAD typically needs lower bids
  - EXACT can sustain higher bids

⚠️ IMPACT EXPECTATIONS:

**EXACT → PHRASE:**
- +30-100% impressions
- +20-80% clicks
- CTR may decrease slightly
- Monitor relevance

**PHRASE → BROAD:**
- +100-300% impressions
- Highly variable click volume
- CTR likely decreases
- Close monitoring required

**BROAD → PHRASE:**
- -50-80% impressions
- Better quality traffic
- CTR likely improves
- Costs more controlled`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad group ID containing keyword',
      },
      criterionId: {
        type: 'string',
        description: 'Criterion ID of keyword to update',
      },
      newMatchType: {
        type: 'string',
        enum: ['EXACT', 'PHRASE', 'BROAD'],
        description: 'New match type',
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview (optional)',
      },
    },
    required: [], // All optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, criterionId, newMatchType, confirmationToken } = input;

      // Extract OAuth tokens
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create client
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
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🔑',
        });
      }

      // ═══ STEP 2: KEYWORD DISCOVERY ═══
      if (!adGroupId || !criterionId) {
        const customer = client.getCustomer(customerId);

        const query = `
          SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.criterion_id,
            ad_group_criterion.cpc_bid_micros,
            ad_group.id,
            ad_group.name,
            campaign.name,
            metrics.clicks,
            metrics.impressions
          FROM keyword_view
          WHERE ad_group_criterion.type = 'KEYWORD'
            AND ad_group_criterion.status != 'REMOVED'
          ORDER BY metrics.clicks DESC
          LIMIT 100
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          const guidanceText = `⚠️ NO KEYWORDS FOUND

Account ${customerId} has no active keywords.

**Next Steps:**
- Use add_keywords to add keywords first`;

          return injectGuidance({ customerId }, guidanceText);
        }

        const keywordList = results.map((row: any, i: number) => {
          const kw = row.ad_group_criterion?.keyword;
          const criterionId = row.ad_group_criterion?.criterion_id;
          const adGroupId = row.ad_group?.id;
          const metrics = row.metrics || {};

          return `${i + 1}. "${kw?.text}" [${kw?.match_type}]
   Campaign: ${row.campaign?.name}
   Ad Group: ${row.ad_group?.name} (ID: ${adGroupId})
   Criterion ID: ${criterionId}
   Clicks: ${metrics.clicks || 0} | Impr: ${metrics.impressions || 0}`;
        }).join('\n\n');

        const guidanceText = `🔑 SELECT KEYWORD TO CHANGE MATCH TYPE (Step 2/4)

**Found ${results.length} keyword(s)**

${keywordList}

**To proceed:**
Provide both:
- adGroupId (from list above)
- criterionId (from list above)`;

        return injectGuidance({ customerId }, guidanceText);
      }

      // ═══ STEP 3: MATCH TYPE SELECTION ═══
      if (!newMatchType) {
        // Fetch current keyword details
        const customer = client.getCustomer(customerId);

        const query = `
          SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions
          FROM keyword_view
          WHERE ad_group.id = ${adGroupId}
            AND ad_group_criterion.criterion_id = ${criterionId}
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          throw new Error(`Keyword not found: ad group ${adGroupId}, criterion ${criterionId}`);
        }

        const row = results[0];
        const kw = row.ad_group_criterion?.keyword;
        const metrics = row.metrics || {};
        const currentMatchType = kw?.match_type;

        const guidanceText = `🎯 SELECT NEW MATCH TYPE (Step 3/4)

**Current Keyword:**
"${kw?.text}" [${currentMatchType}]

**📊 CURRENT PERFORMANCE:**
- Impressions: ${metrics.impressions || 0}
- Clicks: ${metrics.clicks || 0}
- Conversions: ${metrics.conversions || 0}

**🎯 MATCH TYPE OPTIONS:**

${currentMatchType !== 'EXACT' ? '**EXACT** [keyword]\n- Most restrictive, highest relevance\n- Best for: Proven high-intent keywords\n- Expected: Fewer impressions, higher CTR\n\n' : ''}
${currentMatchType !== 'PHRASE' ? '**PHRASE** "keyword"\n- Balanced approach (RECOMMENDED for most)\n- Best for: Most keywords\n- Expected: Moderate reach, good relevance\n\n' : ''}
${currentMatchType !== 'BROAD' ? '**BROAD** keyword\n- Widest reach, requires monitoring\n- Best for: Discovery with strong negatives\n- Expected: High impressions, lower CTR\n\n' : ''}

**💡 RECOMMENDATIONS:**

${currentMatchType === 'EXACT' && (metrics.conversions || 0) > 5
  ? '✅ Keyword is converting well → Consider PHRASE to expand reach\n'
  : ''}
${currentMatchType === 'BROAD' && (metrics.clicks || 0) > 100 && (metrics.conversions || 0) < 2
  ? '⚠️ Low conversion rate → Consider PHRASE or EXACT for better control\n'
  : ''}

**What parameter to provide next?**
- newMatchType (EXACT, PHRASE, or BROAD)`;

        return injectGuidance(
          { customerId, adGroupId, criterionId },
          guidanceText
        );
      }

      // ═══ STEP 4: DRY-RUN PREVIEW ═══
      // Fetch current keyword details
      const customer = client.getCustomer(customerId);

      const query = `
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.cpc_bid_micros,
          ad_group_criterion.status
        FROM keyword_view
        WHERE ad_group.id = ${adGroupId}
          AND ad_group_criterion.criterion_id = ${criterionId}
      `;

      const results = await customer.query(query);

      if (results.length === 0) {
        throw new Error(`Keyword not found: ad group ${adGroupId}, criterion ${criterionId}`);
      }

      const row = results[0];
      const kw = row.ad_group_criterion?.keyword;
      const currentMatchType = kw?.match_type;
      const cpcBidMicros = row.ad_group_criterion?.cpc_bid_micros;

      // Check if match type is already the target
      if (currentMatchType === newMatchType) {
        return {
          success: true,
          data: {
            customerId,
            adGroupId,
            criterionId,
            keyword: kw?.text,
            message: `✅ Keyword "${kw?.text}" already has match type ${newMatchType} - no change needed`,
          },
        };
      }

      // Vagueness detection
      detectAndEnforceVagueness({
        operation: 'update_keyword_match_type',
        inputText: `change match type for ${kw?.text} from ${currentMatchType} to ${newMatchType}`,
        inputParams: { customerId, adGroupId, criterionId, newMatchType },
      });

      // Build dry-run
      const approvalEnforcer = getApprovalEnforcer();
      const dryRunBuilder = new DryRunResultBuilder(
        'update_keyword_match_type',
        'Google Ads',
        customerId
      );

      dryRunBuilder.addChange({
        resource: 'Keyword Match Type',
        resourceId: criterionId,
        field: 'match_type',
        currentValue: `"${kw?.text}" [${currentMatchType}]`,
        newValue: `"${kw?.text}" [${newMatchType}]`,
        changeType: 'update',
      });

      // Add impact warnings
      if (currentMatchType === 'EXACT' && newMatchType === 'BROAD') {
        dryRunBuilder.addRisk(
          'Changing from EXACT to BROAD will significantly expand reach - may increase spend dramatically'
        );
        dryRunBuilder.addRecommendation(
          'Consider PHRASE match as intermediate step before going BROAD'
        );
      }

      if (newMatchType === 'BROAD') {
        dryRunBuilder.addRisk(
          'BROAD match requires close monitoring and strong negative keyword list'
        );
        dryRunBuilder.addRecommendation(
          'Review search terms report frequently after enabling BROAD match'
        );
      }

      if (currentMatchType === 'BROAD' && newMatchType !== 'BROAD') {
        dryRunBuilder.addRecommendation(
          `Narrowing from BROAD to ${newMatchType} will reduce impressions but improve relevance`
        );
      }

      dryRunBuilder.addRecommendation(
        'Google Ads API limitation: This will remove old keyword and add new one with updated match type'
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'update_keyword_match_type',
          'Google Ads',
          customerId,
          { adGroupId, criterionId, newMatchType }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message: 'Match type update requires approval. Review and call again with confirmationToken.',
        };
      }

      // Execute with confirmation
      logger.info('Updating keyword match type with confirmation', {
        customerId,
        adGroupId,
        criterionId,
        currentMatchType,
        newMatchType
      });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          // STEP 1: Remove old keyword
          const removeOp = {
            resource_name: `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`,
          };

          await customer.adGroupCriteria.remove([removeOp] as any);

          // STEP 2: Add keyword with new match type (preserve bid if set)
          const addOp = {
            ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
            keyword: {
              text: kw?.text,
              match_type: newMatchType,
            },
            cpc_bid_micros: cpcBidMicros,
            status: 'ENABLED',
          };

          const addResult = await customer.adGroupCriteria.create([addOp] as any);

          return {
            removed: removeOp.resource_name,
            added: addResult,
          };
        }
      );

      return {
        success: true,
        data: {
          customerId,
          adGroupId,
          oldCriterionId: criterionId,
          keyword: kw?.text,
          oldMatchType: currentMatchType,
          newMatchType,
          result,
          message: `✅ Updated "${kw?.text}" match type from ${currentMatchType} to ${newMatchType}`,
        },
      };
    } catch (error) {
      logger.error('Failed to update keyword match type', error as Error);
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
