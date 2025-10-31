/**
 * Get Campaign Performance Tool
 *
 * MCP tool for retrieving detailed performance metrics for campaigns.
 */
import { GetCampaignPerformanceSchema, microsToAmount, extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps, formatNumber, formatCurrency } from '../../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.reporting.get-campaign-performance');
/**
 * Get campaign performance
 */
export const getCampaignPerformanceTool = {
    name: 'get_campaign_performance',
    description: 'Get detailed performance metrics for campaigns.',
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
            // ═══ ACCOUNT DISCOVERY ═══
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
                    prompt: 'Which account would you like to analyze?',
                    nextParam: 'customerId',
                    emoji: '📊',
                });
            }
            // ═══ DATE RANGE SUGGESTION ═══
            if (!startDate || !endDate) {
                const today = new Date();
                const formatDate = (d) => d.toISOString().split('T')[0];
                const guidanceText = `📅 DATE RANGE OPTIONAL (Step 2/2)

**Account:** ${customerId}

You can view performance with or without a date range:

**Without Date Range (Recommended for First Look):**
- Shows all-time campaign performance
- Good for getting overall campaign health
- Call this tool again with just customerId

**With Date Range:**
- Last 7 days: startDate=${formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Last 30 days: startDate=${formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Last 90 days: startDate=${formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Custom: Provide both startDate and endDate in YYYY-MM-DD format

**Optional:** Add campaignId to focus on a specific campaign

💡 TIP: Start without dates to see overall performance, then add dates for detailed analysis

Would you like to proceed without dates (call again with just customerId) or specify a date range?`;
                return injectGuidance({ customerId }, guidanceText);
            }
            // ═══ EXECUTE WITH ANALYSIS ═══
            logger.info('Getting campaign performance', { customerId, campaignId });
            const dateRange = startDate && endDate ? { startDate, endDate } : undefined;
            const performance = await client.getCampaignPerformance(customerId, campaignId, dateRange);
            // Process results to include dollar amounts
            const processed = performance.map((p) => ({
                ...p,
                cost: p.campaign?.metrics?.cost_micros
                    ? microsToAmount(p.campaign.metrics.cost_micros)
                    : '$0.00',
                averageCpc: p.campaign?.metrics?.average_cpc
                    ? microsToAmount(p.campaign.metrics.average_cpc)
                    : '$0.00',
            }));
            // Calculate aggregates
            const totalImpressions = processed.reduce((sum, p) => sum + (p.campaign?.metrics?.impressions || 0), 0);
            const totalClicks = processed.reduce((sum, p) => sum + (p.campaign?.metrics?.clicks || 0), 0);
            const totalCostMicros = processed.reduce((sum, p) => sum + (p.campaign?.metrics?.cost_micros || 0), 0);
            const totalConversions = processed.reduce((sum, p) => sum + (p.campaign?.metrics?.conversions || 0), 0);
            const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
            const overallCost = totalCostMicros / 1000000;
            const overallCostPerConversion = totalConversions > 0 ? overallCost / totalConversions : 0;
            const guidanceText = `📊 CAMPAIGN PERFORMANCE ANALYSIS

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}\n` : '**Campaigns:** All campaigns\n'}**Period:** ${dateRange ? `${dateRange.startDate} to ${dateRange.endDate}` : 'All time'}

**AGGREGATE METRICS:**
- Total Impressions: ${formatNumber(totalImpressions)}
- Total Clicks: ${formatNumber(totalClicks)}
- Overall CTR: ${overallCTR.toFixed(2)}%
- Total Spend: ${formatCurrency(overallCost)}
- Total Conversions: ${formatNumber(totalConversions)}
- Cost per Conversion: ${totalConversions > 0 ? formatCurrency(overallCostPerConversion) : 'N/A'}

**TOP 5 CAMPAIGNS (by spend):**
${processed.sort((a, b) => (b.campaign?.metrics?.cost_micros || 0) - (a.campaign?.metrics?.cost_micros || 0)).slice(0, 5).map((p, i) => {
                const m = p.campaign?.metrics;
                const ctr = m?.impressions > 0 ? (m.clicks / m.impressions * 100).toFixed(2) : '0.00';
                const cvr = m?.clicks > 0 ? (m.conversions / m.clicks * 100).toFixed(2) : '0.00';
                return `${i + 1}. ${p.campaign?.name || 'N/A'}
   Status: ${p.campaign?.status}
   Spend: ${p.cost} | Clicks: ${formatNumber(m?.clicks || 0)}
   CTR: ${ctr}% | Conversions: ${formatNumber(m?.conversions || 0)} | CVR: ${cvr}%`;
            }).join('\n\n')}

💡 KEY INSIGHTS:
${overallCTR < 2 ? '   • ⚠️ Low CTR (<2%) - Consider improving ad copy and targeting' : '   • ✅ Healthy CTR (≥2%)'}
${totalConversions === 0 ? '   • 🔴 No conversions tracked - Check conversion tracking setup' : overallCostPerConversion > 100 ? '   • ⚠️ High cost per conversion (>$100) - Review bidding strategy' : '   • ✅ Cost per conversion looks reasonable'}

${formatNextSteps([
                'Optimize keywords: use get_keyword_performance to find low performers',
                'Review search terms: use get_search_terms_report for query insights',
                'Adjust budgets: use list_budgets then update_budget if needed',
                'Check conversions: use list_conversion_actions to review tracking'
            ])}

Full performance data (${processed.length} campaigns) available in structured output.`;
            return injectGuidance({
                customerId,
                campaignId: campaignId || 'all',
                dateRange: dateRange || 'all time',
                campaigns: processed,
                count: processed.length,
                aggregates: {
                    totalImpressions,
                    totalClicks,
                    overallCTR,
                    totalCost: overallCost,
                    totalConversions,
                    costPerConversion: overallCostPerConversion,
                },
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to get campaign performance', error);
            throw error;
        }
    },
};
//# sourceMappingURL=get-campaign-performance.tool.js.map