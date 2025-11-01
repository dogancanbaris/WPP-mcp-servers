/**
 * Get Quality Score Report Tool
 *
 * MCP tool for retrieving detailed Quality Score components by keyword.
 */
import { z } from 'zod';
import { extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatDataTable, formatDiscoveryResponse, formatNextSteps, formatNumber, injectGuidance } from '../../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.reporting.get-quality-score-report');
const GetQualityScoreReportSchema = z.object({
    customerId: z.string().describe('Customer ID (10 digits)'),
    campaignId: z.string().optional().describe('Specific campaign ID (optional - returns all campaigns if omitted)'),
    adGroupId: z.string().optional().describe('Specific ad group ID (optional)'),
    startDate: z.string().optional().describe('Start date in YYYY-MM-DD format (optional)'),
    endDate: z.string().optional().describe('End date in YYYY-MM-DD format (optional)'),
    minQualityScore: z.number().min(1).max(10).optional().describe('Filter by minimum quality score (1-10)'),
});
/**
 * Get Quality Score report with detailed component breakdown
 */
export const getQualityScoreReportTool = {
    name: 'get_quality_score_report',
    description: 'Get detailed Quality Score report with component breakdown (landing page experience, ad relevance, expected CTR).',
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
            minQualityScore: {
                type: 'number',
                description: 'Filter by minimum quality score (1-10, optional)',
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
                    prompt: 'Which account would you like to analyze Quality Scores for?',
                    nextParam: 'customerId',
                });
            }
            GetQualityScoreReportSchema.parse(input);
            const { customerId, campaignId, adGroupId, startDate, endDate, minQualityScore } = input;
            logger.info('Getting Quality Score report', { customerId, campaignId, adGroupId });
            const customer = client.getCustomer(customerId);
            // Build GAQL query for Quality Score components
            let query = `
        SELECT
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.quality_info.creative_quality_score,
          ad_group_criterion.quality_info.post_click_quality_score,
          ad_group_criterion.quality_info.search_predicted_ctr,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          campaign.id,
          campaign.name,
          ad_group.id,
          ad_group.name
        FROM keyword_view
        WHERE ad_group_criterion.type = 'KEYWORD'
      `;
            if (campaignId) {
                query += ` AND campaign.id = ${campaignId}`;
            }
            if (adGroupId) {
                query += ` AND ad_group.id = ${adGroupId}`;
            }
            if (startDate && endDate) {
                query += ` AND segments.date BETWEEN '${startDate}' AND '${endDate}'`;
            }
            if (minQualityScore !== undefined) {
                query += ` AND ad_group_criterion.quality_info.quality_score >= ${minQualityScore}`;
            }
            query += ' ORDER BY ad_group_criterion.quality_info.quality_score ASC, metrics.impressions DESC LIMIT 500';
            const results = await customer.query(query);
            // Transform results for better readability
            const keywords = results.map((row) => ({
                keywordText: row.ad_group_criterion?.keyword?.text || 'N/A',
                matchType: row.ad_group_criterion?.keyword?.match_type || 'N/A',
                status: row.ad_group_criterion?.status || 'N/A',
                qualityScore: row.ad_group_criterion?.quality_info?.quality_score || 0,
                adRelevance: row.ad_group_criterion?.quality_info?.creative_quality_score || 'N/A',
                landingPageExperience: row.ad_group_criterion?.quality_info?.post_click_quality_score || 'N/A',
                expectedCtr: row.ad_group_criterion?.quality_info?.search_predicted_ctr || 'N/A',
                impressions: row.metrics?.impressions || 0,
                clicks: row.metrics?.clicks || 0,
                ctr: row.metrics?.ctr || 0,
                avgCpc: row.metrics?.average_cpc ? row.metrics.average_cpc / 1000000 : 0,
                cost: row.metrics?.cost_micros ? row.metrics.cost_micros / 1000000 : 0,
                campaignName: row.campaign?.name || 'N/A',
                adGroupName: row.ad_group?.name || 'N/A',
            }));
            // Calculate summary statistics
            const avgQualityScore = keywords.length > 0
                ? keywords.reduce((sum, k) => sum + (k.qualityScore || 0), 0) / keywords.length
                : 0;
            // QS distribution
            const qsDistribution = {
                excellent: keywords.filter(k => k.qualityScore >= 8).length,
                good: keywords.filter(k => k.qualityScore >= 6 && k.qualityScore < 8).length,
                poor: keywords.filter(k => k.qualityScore >= 4 && k.qualityScore < 6).length,
                veryPoor: keywords.filter(k => k.qualityScore < 4 && k.qualityScore > 0).length,
            };
            // Component analysis (count below-average scores)
            const componentIssues = {
                belowAvgAdRelevance: keywords.filter(k => k.adRelevance === 'BELOW_AVERAGE').length,
                belowAvgLandingPage: keywords.filter(k => k.landingPageExperience === 'BELOW_AVERAGE').length,
                belowAvgExpectedCtr: keywords.filter(k => k.expectedCtr === 'BELOW_AVERAGE').length,
            };
            // Find problematic keywords (QS < 5)
            const problematicKeywords = keywords.filter(k => k.qualityScore < 5 && k.qualityScore > 0);
            // Inject rich guidance into response
            const guidanceText = `📊 QUALITY SCORE ANALYSIS

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}` : '**Scope:** All campaigns'}
${adGroupId ? `**Ad Group:** ${adGroupId}` : ''}
**Date Range:** ${startDate && endDate ? `${startDate} to ${endDate}` : 'All time'}
**Total Keywords:** ${formatNumber(keywords.length)}

📈 QUALITY SCORE DISTRIBUTION:
• 8-10 (Excellent): ${qsDistribution.excellent} keywords (${((qsDistribution.excellent / keywords.length) * 100).toFixed(1)}%)
• 6-7 (Good): ${qsDistribution.good} keywords (${((qsDistribution.good / keywords.length) * 100).toFixed(1)}%)
• 4-5 (Poor): ${qsDistribution.poor} keywords (${((qsDistribution.poor / keywords.length) * 100).toFixed(1)}%)
• 1-3 (Very Poor): ${qsDistribution.veryPoor} keywords (${((qsDistribution.veryPoor / keywords.length) * 100).toFixed(1)}%)

**Average Quality Score:** ${avgQualityScore.toFixed(1)}/10

🔍 COMPONENT ISSUES (Below Average):
• Ad Relevance: ${componentIssues.belowAvgAdRelevance} keywords
• Landing Page Experience: ${componentIssues.belowAvgLandingPage} keywords
• Expected CTR: ${componentIssues.belowAvgExpectedCtr} keywords

${problematicKeywords.length > 0 ? `⚠️ PROBLEMATIC KEYWORDS (QS < 5):

${formatDataTable(problematicKeywords.slice(0, 10), ['keywordText', 'qualityScore', 'adRelevance', 'landingPageExperience', 'expectedCtr'], 10)}

` : '✅ No critically low quality score keywords found!'}

💡 QUALITY SCORE IMPROVEMENT GUIDE:

**1. Expected CTR (Below Average):**
   • Improve ad copy to be more compelling
   • Use keywords in ad headlines
   • Test different calls-to-action
   • Add extensions (sitelinks, callouts)

**2. Ad Relevance (Below Average):**
   • Create tighter themed ad groups
   • Match ad copy closely to keywords
   • Use keyword insertion in ads
   • Separate brand/non-brand keywords

**3. Landing Page Experience (Below Average):**
   • Improve page load speed
   • Make content highly relevant to keyword
   • Ensure mobile-friendly design
   • Clear call-to-action on landing page
   • Remove intrusive popups

🎯 RECOMMENDED ACTIONS:
${qsDistribution.veryPoor > 0 ? `• URGENT: Pause ${qsDistribution.veryPoor} keywords with QS 1-3 (wasting budget)` : ''}
${componentIssues.belowAvgAdRelevance > 5 ? `• Restructure ad groups for better keyword-ad matching (${componentIssues.belowAvgAdRelevance} keywords affected)` : ''}
${componentIssues.belowAvgLandingPage > 5 ? `• Audit landing pages for relevance and speed (${componentIssues.belowAvgLandingPage} keywords affected)` : ''}
${componentIssues.belowAvgExpectedCtr > 5 ? `• Improve ad copy for better CTR (${componentIssues.belowAvgExpectedCtr} keywords affected)` : ''}

${formatNextSteps([
                'Pause very poor keywords: identify keywords with QS 1-3 and pause them',
                'Get search terms report: use get_search_terms to find new high-QS keyword opportunities',
                'Review keyword performance: use get_keyword_performance for detailed metrics',
                'Update keyword bids: Increase bids on high-QS keywords, decrease on low-QS'
            ])}`;
            return injectGuidance({
                customerId,
                campaignId: campaignId || 'all',
                adGroupId: adGroupId || 'all',
                dateRange: startDate && endDate ? { startDate, endDate } : 'all time',
                keywords,
                count: keywords.length,
                avgQualityScore: avgQualityScore.toFixed(1),
                distribution: qsDistribution,
                componentIssues,
                problematicKeywords,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to get Quality Score report', error);
            throw error;
        }
    },
};
//# sourceMappingURL=get-quality-score-report.tool.js.map