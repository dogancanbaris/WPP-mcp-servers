/**
 * Get Auction Insights Tool
 *
 * MCP tool for retrieving auction insights showing competitor overlap and position metrics.
 */
import { z } from 'zod';
import { extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatDataTable, formatDiscoveryResponse, formatNextSteps, injectGuidance } from '../../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.reporting.get-auction-insights');
const GetAuctionInsightsSchema = z.object({
    customerId: z.string().describe('Customer ID (10 digits)'),
    campaignId: z.string().optional().describe('Specific campaign ID (optional - returns all campaigns if omitted)'),
    adGroupId: z.string().optional().describe('Specific ad group ID (optional)'),
    startDate: z.string().optional().describe('Start date in YYYY-MM-DD format (optional)'),
    endDate: z.string().optional().describe('End date in YYYY-MM-DD format (optional)'),
});
/**
 * Get Auction Insights report
 */
export const getAuctionInsightsTool = {
    name: 'get_auction_insights',
    description: 'Get auction insights showing competitor overlap, impression share, position metrics, and top of page rates.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Specific campaign ID (optional - returns all campaigns if omitted)',
            },
            adGroupId: {
                type: 'string',
                description: 'Specific ad group ID (optional)',
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
        required: [],
    },
    async handler(input) {
        try {
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
            // Account discovery
            if (!input.customerId) {
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
                    prompt: 'Which account would you like to analyze auction insights for?',
                    nextParam: 'customerId',
                });
            }
            // Campaign discovery (if not provided)
            if (!input.campaignId) {
                const campaigns = await client.listCampaigns(input.customerId);
                return formatDiscoveryResponse({
                    step: '2/3',
                    title: 'SELECT CAMPAIGN',
                    items: campaigns,
                    itemFormatter: (c, i) => `${i + 1}. ${c.campaign?.name || 'Unnamed'} (ID: ${c.campaign?.id}, Status: ${c.campaign?.status})`,
                    prompt: 'Which campaign would you like auction insights for?',
                    nextParam: 'campaignId',
                    context: { customerId: input.customerId },
                });
            }
            GetAuctionInsightsSchema.parse(input);
            const { customerId, campaignId, adGroupId, startDate, endDate } = input;
            logger.info('Getting auction insights', { customerId, campaignId, adGroupId });
            const customer = client.getCustomer(customerId);
            // Build GAQL query for Auction Insights
            // Note: Auction insights data is available through auction_insight_search_term_view
            let query = `
        SELECT
          auction_insight_search_term_view.display_name,
          metrics.search_impression_share,
          metrics.search_overlap_rate,
          metrics.search_outranking_share,
          metrics.search_position_above_rate,
          metrics.search_top_impression_percentage,
          metrics.search_absolute_top_impression_percentage,
          campaign.id,
          campaign.name
        FROM auction_insight_search_term_view
        WHERE campaign.id = ${campaignId}
      `;
            if (adGroupId) {
                query += ` AND ad_group.id = ${adGroupId}`;
            }
            if (startDate && endDate) {
                query += ` AND segments.date BETWEEN '${startDate}' AND '${endDate}'`;
            }
            query += ' ORDER BY metrics.search_impression_share DESC LIMIT 100';
            const results = await customer.query(query);
            // Transform results for better readability
            const insights = results.map((row) => ({
                competitorDomain: row.auction_insight_search_term_view?.display_name || 'N/A',
                impressionShare: ((row.metrics?.search_impression_share || 0) * 100).toFixed(2) + '%',
                overlapRate: ((row.metrics?.search_overlap_rate || 0) * 100).toFixed(2) + '%',
                outrankingShare: ((row.metrics?.search_outranking_share || 0) * 100).toFixed(2) + '%',
                positionAboveRate: ((row.metrics?.search_position_above_rate || 0) * 100).toFixed(2) + '%',
                topOfPageRate: ((row.metrics?.search_top_impression_percentage || 0) * 100).toFixed(2) + '%',
                absoluteTopRate: ((row.metrics?.search_absolute_top_impression_percentage || 0) * 100).toFixed(2) + '%',
            }));
            // Find your own performance (usually first row or marked differently)
            const yourPerformance = insights[0] || null;
            // Calculate competitive landscape
            const totalCompetitors = insights.length - 1; // Exclude your own domain
            const highOverlapCompetitors = insights.filter(i => parseFloat(i.overlapRate) > 50).length;
            const competitorsOutrankingYou = insights.filter(i => parseFloat(i.positionAboveRate) > 50).length;
            // Inject rich guidance into response
            const guidanceText = `📊 AUCTION INSIGHTS ANALYSIS

**Account:** ${customerId}
**Campaign:** ${campaignId}
${adGroupId ? `**Ad Group:** ${adGroupId}` : ''}
**Date Range:** ${startDate && endDate ? `${startDate} to ${endDate}` : 'All time'}

🎯 YOUR PERFORMANCE:
${yourPerformance ? `
• Impression Share: ${yourPerformance.impressionShare}
• Top of Page Rate: ${yourPerformance.topOfPageRate}
• Absolute Top Rate: ${yourPerformance.absoluteTopRate}
` : 'No performance data available'}

🏆 COMPETITIVE LANDSCAPE:
• Total Competitors: ${totalCompetitors}
• High Overlap Competitors (>50%): ${highOverlapCompetitors}
• Competitors Often Above You: ${competitorsOutrankingYou}

📋 TOP COMPETITORS:

${formatDataTable(insights.slice(0, 10), ['competitorDomain', 'impressionShare', 'overlapRate', 'positionAboveRate', 'topOfPageRate'], 10)}

🔍 METRIC DEFINITIONS:

**Impression Share:**
• % of impressions you received vs. total eligible impressions
• Higher = better visibility

**Overlap Rate:**
• % of auctions where both you and competitor appeared
• Shows direct competition intensity

**Outranking Share:**
• % of auctions where you ranked higher than competitor
• Higher = you're winning more auctions

**Position Above Rate:**
• % of auctions where competitor ranked above you
• Lower = better (they're not beating you often)

**Top of Page Rate:**
• % of impressions showing at top of search results
• Higher = better ad position

**Absolute Top Rate:**
• % of impressions in absolute top position (#1)
• Premium position, highest CTR

💡 COMPETITIVE INSIGHTS:
${highOverlapCompetitors > 3 ? `• High competition: ${highOverlapCompetitors} competitors overlap >50% with your auctions` : ''}
${competitorsOutrankingYou > 2 ? `⚠️ Warning: ${competitorsOutrankingYou} competitors frequently outrank you` : ''}
${yourPerformance && parseFloat(yourPerformance.impressionShare) < 50 ? `⚠️ Low impression share: You're missing >50% of eligible auctions` : ''}
${yourPerformance && parseFloat(yourPerformance.topOfPageRate) < 30 ? `⚠️ Low top-of-page rate: Most impressions below organic results` : ''}

🎯 RECOMMENDED ACTIONS:
${competitorsOutrankingYou > 2 ? `• Increase bids to improve position vs. ${competitorsOutrankingYou} dominant competitors` : ''}
${yourPerformance && parseFloat(yourPerformance.impressionShare) < 50 ? `• Increase budget to capture more of the ${(100 - parseFloat(yourPerformance.impressionShare)).toFixed(1)}% missed impressions` : ''}
${yourPerformance && parseFloat(yourPerformance.topOfPageRate) < 50 ? `• Improve Quality Score and bids to appear above organic results more often` : ''}
• Monitor competitor changes weekly to spot new threats
• Analyze competitor landing pages for inspiration

${formatNextSteps([
                'Check lost impression share: use run_custom_report with search_lost_is_budget and search_lost_is_rank',
                'Get Quality Score report: use get_quality_score_report to identify improvement opportunities',
                'Review campaign performance: use get_campaign_performance to see ROI of position changes',
                'Adjust budgets: If losing to budget, increase daily budget; if losing to rank, improve QS or raise bids'
            ])}`;
            return injectGuidance({
                customerId,
                campaignId,
                adGroupId: adGroupId || 'all',
                dateRange: startDate && endDate ? { startDate, endDate } : 'all time',
                insights,
                count: insights.length,
                yourPerformance,
                competitiveLandscape: {
                    totalCompetitors,
                    highOverlapCompetitors,
                    competitorsOutrankingYou,
                },
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to get auction insights', error);
            throw error;
        }
    },
};
//# sourceMappingURL=get-auction-insights.tool.js.map