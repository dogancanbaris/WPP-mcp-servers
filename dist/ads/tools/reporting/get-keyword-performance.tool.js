/**
 * Get Keyword Performance Tool
 *
 * MCP tool for retrieving detailed keyword-level performance metrics.
 */
import { extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatDiscoveryResponse, formatNextSteps, formatNumber, injectGuidance } from '../../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.reporting.get-keyword-performance');
/**
 * Get keyword performance
 */
export const getKeywordPerformanceTool = {
    name: 'get_keyword_performance',
    description: 'Get detailed keyword-level performance metrics including Quality Scores.',
    inputSchema: {
        type: 'object',
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
                    step: '1/2',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account would you like to analyze keyword performance for?',
                    nextParam: 'customerId',
                });
            }
            input;
            const { customerId, campaignId, startDate, endDate } = input;
            logger.info('Getting keyword performance', { customerId, campaignId });
            const dateRange = startDate && endDate ? { startDate, endDate } : undefined;
            const keywords = await client.getKeywordPerformance(customerId, campaignId, dateRange);
            // Calculate summary stats
            const avgQualityScore = keywords.length > 0
                ? keywords.reduce((sum, k) => sum + (k.qualityScore || 0), 0) / keywords.length
                : 0;
            const lowQsKeywords = keywords.filter(k => k.qualityScore && k.qualityScore < 5).length;
            const highCostKeywords = keywords.filter(k => k.cost > 100).length;
            // Inject rich guidance into response
            const guidanceText = `📊 KEYWORD PERFORMANCE ANALYSIS

**Account:** ${customerId}
**Campaign:** ${campaignId || 'All campaigns'}
**Date Range:** ${dateRange ? `${startDate} to ${endDate}` : 'All time'}
**Total Keywords:** ${formatNumber(keywords.length)}

📈 KEY METRICS:
• Average Quality Score: ${avgQualityScore.toFixed(1)}/10
• Low Quality Score (< 5): ${lowQsKeywords} keyword(s)
• High Cost Keywords (> $100): ${highCostKeywords} keyword(s)

💡 QUALITY SCORE BREAKDOWN:
- 8-10: Excellent - maintain and expand
- 6-7: Good - minor improvements possible
- 4-5: Poor - needs attention or pause
- 1-3: Very Poor - pause immediately or fix major issues

🎯 OPTIMIZATION OPPORTUNITIES:
${lowQsKeywords > 0 ? `• ${lowQsKeywords} keywords with QS < 5 → Consider pausing or improving` : '✅ No critically low quality score keywords'}
${highCostKeywords > 0 ? `• ${highCostKeywords} high-cost keywords → Review for efficiency` : '✅ Cost distribution looks healthy'}

💡 IMPROVEMENT ACTIONS:
- Low Expected CTR → Improve ad copy relevance to keyword
- Low Ad Relevance → Better match between keyword and ad
- Low Landing Page Experience → Improve page content/speed/relevance

${formatNextSteps([
                'Review low quality score keywords in detail',
                'Pause underperforming keywords: identify keywords with high cost + low conversions',
                'Get search terms report: use get_search_terms_report to find new keyword opportunities',
                'Add negative keywords: use add_negative_keywords to exclude irrelevant searches'
            ])}`;
            return injectGuidance({
                customerId,
                campaignId: campaignId || 'all',
                dateRange: dateRange || 'all time',
                keywords,
                count: keywords.length,
                avgQualityScore: avgQualityScore.toFixed(1),
                lowQsKeywords,
                highCostKeywords,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to get keyword performance', error);
            throw error;
        }
    },
};
//# sourceMappingURL=get-keyword-performance.tool.js.map