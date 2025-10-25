/**
 * MCP Tools for Google Ads Performance Reporting
 */

import { GetCampaignPerformanceSchema, GetSearchTermsSchema, GetKeywordPerformanceSchema, microsToAmount } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';

const logger = getLogger('ads.tools.reporting');

/**
 * List campaigns
 */
export const listCampaignsTool = {
  name: 'list_campaigns',
  description: `List all campaigns in a Google Ads account with status and basic info.

💡 AGENT GUIDANCE:
- Use this to discover all campaigns before making any changes
- Check campaign status before modifications (ENABLED, PAUSED, REMOVED)
- Note the campaign type - different types have different capabilities

📊 WHAT YOU'LL GET:
- Campaign ID, name, status
- Campaign type (SEARCH, DISPLAY, VIDEO, PERFORMANCE_MAX, etc.)
- Budget assignment
- Bidding strategy type
- Serving status

🎯 NEXT STEPS AFTER CALLING THIS:
- Use campaign IDs in performance reporting tools
- Check campaign type before applying type-specific changes
- Verify status before attempting to modify`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits, e.g., "2191558405")',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      const { customerId } = input;

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

      logger.info('Listing campaigns', { customerId });

      const campaigns = await client.listCampaigns(customerId);

      return {
        success: true,
        data: {
          customerId,
          campaigns,
          count: campaigns.length,
          message: `Found ${campaigns.length} campaign(s) in account ${customerId}`,
        },
      };
    } catch (error) {
      logger.error('Failed to list campaigns', error as Error);
      throw error;
    }
  },
};

/**
 * Get campaign performance
 */
export const getCampaignPerformanceTool = {
  name: 'get_campaign_performance',
  description: `Get detailed performance metrics for campaigns.

💡 AGENT GUIDANCE - PERFORMANCE ANALYSIS:
- This is your primary tool for understanding campaign success
- Use date ranges to analyze specific periods
- Compare metrics against goals to identify issues

📊 METRICS RETURNED:
- Impressions (how often ads shown)
- Clicks (ad engagements)
- CTR (Click-through rate)
- Cost (total spend)
- Conversions (goal completions)
- Cost per Conversion
- Conversion Rate
- ROAS (Return on Ad Spend)

🎯 USE CASES:
- "How is campaign X performing this month?"
- "Which campaigns have the best ROAS?"
- "Show me cost per conversion trends"
- "Compare week-over-week performance"

⚠️ INTERPRETATION TIPS:
- High impressions + low CTR = ad relevance issue
- High clicks + low conversions = landing page or targeting issue
- High cost per conversion = bidding or targeting needs optimization
- Check if ROAS meets target (typically >4.0 is good for most businesses)`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Specific campaign ID (optional - returns all campaigns if omitted)',
      },
      startDate: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format (optional)',
      },
      endDate: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format (optional)',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      GetCampaignPerformanceSchema.parse(input);

      const { customerId, campaignId, startDate, endDate } = input;

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

      logger.info('Getting campaign performance', { customerId, campaignId });

      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const performance = await client.getCampaignPerformance(customerId, campaignId, dateRange);

      // Process results to include dollar amounts
      const processed = performance.map((p: any) => ({
        ...p,
        cost: p.campaign?.metrics?.cost_micros
          ? microsToAmount(p.campaign.metrics.cost_micros)
          : '$0.00',
        averageCpc: p.campaign?.metrics?.average_cpc
          ? microsToAmount(p.campaign.metrics.average_cpc)
          : '$0.00',
      }));

      return {
        success: true,
        data: {
          customerId,
          campaignId: campaignId || 'all',
          dateRange: dateRange || 'all time',
          campaigns: processed,
          count: processed.length,
          message: `Retrieved performance data for ${processed.length} campaign(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to get campaign performance', error as Error);
      throw error;
    }
  },
};

/**
 * Get search terms report
 */
export const getSearchTermsReportTool = {
  name: 'get_search_terms_report',
  description: `Get actual search queries that triggered your ads.

💡 AGENT GUIDANCE - GOLDMINE FOR OPTIMIZATION:
- This shows the ACTUAL words people typed to trigger your ads
- Critical for finding irrelevant queries (add as negatives)
- Discover new keyword opportunities
- Understand user intent and search behavior

📊 WHAT YOU'LL GET:
- Search query text (exact words users typed)
- Match type that triggered (EXACT, PHRASE, BROAD)
- Performance metrics per query
- Status (added, excluded, etc.)

🎯 KEY USE CASES:
- "What searches are wasting money?" → Add negatives
- "What searches convert well?" → Add as keywords
- "Are BROAD match keywords too broad?" → Review queries
- "What's the user intent?" → Improve ad copy/landing pages

⚠️ COMMON FINDINGS & ACTIONS:
- Irrelevant queries with spend → Add as negative keywords
- High-converting queries not in keyword list → Add as keywords
- Different user intent than expected → Adjust targeting or ad copy
- Brand misspellings → Add as exact/phrase match keywords

💡 BEST PRACTICE WORKFLOW:
1. Run this report weekly
2. Sort by cost (find expensive irrelevant queries)
3. Add negatives for irrelevant queries
4. Add high-performers as keywords
5. Monitor changes`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Specific campaign ID (optional)',
      },
      startDate: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format (optional)',
      },
      endDate: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format (optional)',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      GetSearchTermsSchema.parse(input);

      const { customerId, campaignId, startDate, endDate } = input;

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

      logger.info('Getting search terms report', { customerId, campaignId });

      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const searchTerms = await client.getSearchTermsReport(customerId, campaignId, dateRange);

      return {
        success: true,
        data: {
          customerId,
          campaignId: campaignId || 'all',
          dateRange: dateRange || 'recent',
          searchTerms,
          count: searchTerms.length,
          message: `Retrieved ${searchTerms.length} search query term(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to get search terms report', error as Error);
      throw error;
    }
  },
};

/**
 * List budgets
 */
export const listBudgetsTool = {
  name: 'list_budgets',
  description: `List all campaign budgets in a Google Ads account.

💡 AGENT GUIDANCE - BUDGET MONITORING:
- Shows all budgets with current spend and limits
- Critical to check before any budget modifications
- Use to understand budget allocation across campaigns

📊 WHAT YOU'LL GET:
- Budget ID and name
- Daily amount (in account currency)
- Delivery method (Standard vs Accelerated)
- Status
- Google's recommended budget (if available)

🎯 USE CASES:
- "What are my daily budgets?"
- "Which budgets are being recommended for increases?"
- "How are budgets allocated across campaigns?"

⚠️ BEFORE MODIFYING BUDGETS:
- Always call this first to see current state
- Check recommended budget amounts
- Understand current allocation`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      const { customerId } = input;

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

      logger.info('Listing budgets', { customerId });

      const budgets = await client.listBudgets(customerId);

      // Process to show dollar amounts
      const processed = budgets.map((b: any) => ({
        ...b,
        dailyAmount: b.campaign_budget?.amount_micros
          ? microsToAmount(b.campaign_budget.amount_micros)
          : '$0.00',
        recommendedAmount: b.campaign_budget?.recommended_budget_amount_micros
          ? microsToAmount(b.campaign_budget.recommended_budget_amount_micros)
          : null,
      }));

      return {
        success: true,
        data: {
          customerId,
          budgets: processed,
          count: processed.length,
          message: `Found ${processed.length} budget(s) in account ${customerId}`,
        },
      };
    } catch (error) {
      logger.error('Failed to list budgets', error as Error);
      throw error;
    }
  },
};

/**
 * Get keyword performance
 */
export const getKeywordPerformanceTool = {
  name: 'get_keyword_performance',
  description: `Get detailed keyword-level performance metrics including Quality Scores.

💡 AGENT GUIDANCE - KEYWORD OPTIMIZATION:
- Quality Score is critical - low scores (< 5) need attention
- Higher Quality Scores = lower costs and better ad positions
- Use this to identify underperforming keywords for optimization or removal

📊 METRICS RETURNED:
- Keyword text and match type
- Quality Score (1-10 scale, 10 is best)
- Quality Score components: Expected CTR, Ad Relevance, Landing Page Experience
- Performance: Impressions, clicks, cost, conversions
- Current CPC bid

🎯 OPTIMIZATION OPPORTUNITIES:
- Keywords with QS < 5 → Consider pausing or improving
- High cost + low conversions → Reduce bids or pause
- High impressions + low clicks → Improve ad copy relevance
- High clicks + low conversions → Landing page issue

⚠️ QUALITY SCORE INTERPRETATION:
- 8-10: Excellent - maintain and expand
- 6-7: Good - minor improvements possible
- 4-5: Poor - needs attention or pause
- 1-3: Very Poor - pause immediately or fix major issues

💡 IMPROVEMENT ACTIONS:
- Low Expected CTR → Improve ad copy relevance to keyword
- Low Ad Relevance → Better match between keyword and ad
- Low Landing Page Experience → Improve page content/speed/relevance`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Specific campaign ID (optional - returns all keywords if omitted)',
      },
      startDate: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format (optional)',
      },
      endDate: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format (optional)',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      GetKeywordPerformanceSchema.parse(input);

      const { customerId, campaignId, startDate, endDate } = input;

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

      logger.info('Getting keyword performance', { customerId, campaignId });

      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const keywords = await client.getKeywordPerformance(customerId, campaignId, dateRange);

      return {
        success: true,
        data: {
          customerId,
          campaignId: campaignId || 'all',
          dateRange: dateRange || 'all time',
          keywords,
          count: keywords.length,
          message: `Retrieved performance data for ${keywords.length} keyword(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to get keyword performance', error as Error);
      throw error;
    }
  },
};
