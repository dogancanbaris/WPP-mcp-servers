/**
 * Get Ad Performance Tool
 *
 * MCP tool for retrieving detailed performance metrics for individual ads.
 */
import { z } from 'zod';
import { extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatCurrency, formatDiscoveryResponse, formatNextSteps, formatNumber, injectGuidance } from '../../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.reporting.get-ad-performance');
/**
 * Zod schema for input validation
 */
const GetAdPerformanceSchema = z.object({
    customerId: z.string().optional(),
    campaignId: z.string().optional(),
    adGroupId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    // OAuth headers (injected by server)
    headers: z.record(z.string()).optional(),
});
/**
 * Get ad performance
 */
export const getAdPerformanceTool = {
    name: 'get_ad_performance',
    description: 'Get detailed performance metrics for individual ads.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Filter by specific campaign ID (optional)',
            },
            adGroupId: {
                type: 'string',
                description: 'Filter by specific ad group ID (optional)',
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
            const validated = GetAdPerformanceSchema.parse(input);
            const { customerId, campaignId, adGroupId, startDate, endDate } = validated;
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
                    step: '1/3',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account would you like to analyze?',
                    nextParam: 'customerId',
                    emoji: '📊',
                });
            }
            // ═══ AD GROUP DISCOVERY (OPTIONAL) ═══
            if (!adGroupId && !campaignId) {
                const guidanceText = `📋 AD GROUP FILTER OPTIONAL (Step 2/3)

**Account:** ${customerId}

You can view ad performance with or without filtering by ad group:

**Without Filter (Recommended for First Look):**
- Shows all ads across all campaigns and ad groups
- Good for getting overall ad performance
- Call this tool again with customerId and optional dates

**With Filter:**
- Add \`campaignId\` to focus on ads in a specific campaign
- Add \`adGroupId\` to focus on ads in a specific ad group
- Add both to drill down further

💡 TIP: Start without filters to see overall ad performance, then add filters for detailed analysis

Would you like to proceed without filters or specify a campaignId/adGroupId?`;
                return injectGuidance({ customerId }, guidanceText);
            }
            // ═══ DATE RANGE SUGGESTION ═══
            if (!startDate || !endDate) {
                const today = new Date();
                const formatDate = (d) => d.toISOString().split('T')[0];
                const guidanceText = `📅 DATE RANGE OPTIONAL (Step 3/3)

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}\n` : ''}${adGroupId ? `**Ad Group:** ${adGroupId}\n` : ''}
You can view ad performance with or without a date range:

**Without Date Range (Recommended for First Look):**
- Shows all-time ad performance
- Good for getting overall ad health
- Call this tool again with current parameters

**With Date Range:**
- Last 7 days: startDate=${formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Last 30 days: startDate=${formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Last 90 days: startDate=${formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Custom: Provide both startDate and endDate in YYYY-MM-DD format

💡 TIP: Start without dates to see overall performance, then add dates for detailed analysis

Would you like to proceed without dates or specify a date range?`;
                return injectGuidance({ customerId, campaignId, adGroupId }, guidanceText);
            }
            // ═══ EXECUTE WITH ANALYSIS ═══
            logger.info('Getting ad performance', { customerId, campaignId, adGroupId });
            // Build GAQL query
            const whereClauses = [];
            if (startDate && endDate) {
                whereClauses.push(`segments.date BETWEEN '${startDate}' AND '${endDate}'`);
            }
            if (campaignId) {
                whereClauses.push(`campaign.id = ${campaignId}`);
            }
            if (adGroupId) {
                whereClauses.push(`ad_group.id = ${adGroupId}`);
            }
            const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
            const query = `
        SELECT
          ad_group_ad.ad.id,
          ad_group_ad.ad.name,
          ad_group_ad.ad.type,
          ad_group_ad.status,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name,
          ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          ad_group_ad.ad.final_urls,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_value,
          metrics.average_cpc,
          metrics.conversion_rate
        FROM ad_group_ad
        ${whereClause}
        ORDER BY metrics.impressions DESC
        LIMIT 1000
      `;
            const customer = client.getCustomer(customerId);
            const results = await customer.query(query);
            // Process results
            const ads = results.map((row) => {
                const ad = row.ad_group_ad?.ad;
                // Extract headlines and descriptions for responsive search ads
                let headlines = [];
                let descriptions = [];
                if (ad?.responsive_search_ad) {
                    headlines = (ad.responsive_search_ad.headlines || [])
                        .map((h) => h.text)
                        .filter(Boolean);
                    descriptions = (ad.responsive_search_ad.descriptions || [])
                        .map((d) => d.text)
                        .filter(Boolean);
                }
                return {
                    adId: ad?.id,
                    adName: ad?.name || 'N/A',
                    adType: ad?.type || 'N/A',
                    adStatus: row.ad_group_ad?.status,
                    adGroupId: row.ad_group?.id,
                    adGroupName: row.ad_group?.name,
                    campaignId: row.campaign?.id,
                    campaignName: row.campaign?.name,
                    headlines: headlines.slice(0, 3), // Top 3 headlines
                    descriptions: descriptions.slice(0, 2), // Top 2 descriptions
                    finalUrls: ad?.final_urls || [],
                    impressions: row.metrics?.impressions || 0,
                    clicks: row.metrics?.clicks || 0,
                    ctr: row.metrics?.ctr || 0,
                    costMicros: row.metrics?.cost_micros || 0,
                    cost: formatCurrency((row.metrics?.cost_micros || 0) / 1000000),
                    conversions: row.metrics?.conversions || 0,
                    conversionValue: row.metrics?.conversion_value || 0,
                    averageCpc: formatCurrency((row.metrics?.average_cpc || 0) / 1000000),
                    conversionRate: row.metrics?.conversion_rate || 0,
                };
            });
            // Calculate aggregates
            const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
            const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
            const totalCostMicros = ads.reduce((sum, ad) => sum + ad.costMicros, 0);
            const totalConversions = ads.reduce((sum, ad) => sum + ad.conversions, 0);
            const totalConversionValue = ads.reduce((sum, ad) => sum + ad.conversionValue, 0);
            const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
            const overallCost = totalCostMicros / 1000000;
            const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
            const overallCPA = totalConversions > 0 ? overallCost / totalConversions : 0;
            const overallROAS = overallCost > 0 ? totalConversionValue / overallCost : 0;
            // Identify top and bottom performers
            const enabledAds = ads.filter((ad) => ad.adStatus === 'ENABLED');
            const topByImpressions = [...enabledAds]
                .sort((a, b) => b.impressions - a.impressions)
                .slice(0, 3);
            const topByConversions = [...enabledAds]
                .filter((ad) => ad.conversions > 0)
                .sort((a, b) => b.conversions - a.conversions)
                .slice(0, 3);
            const lowPerformers = enabledAds
                .filter((ad) => ad.impressions > 100 && ad.ctr < 0.5)
                .sort((a, b) => b.costMicros - a.costMicros)
                .slice(0, 3);
            const guidanceText = `📊 AD PERFORMANCE ANALYSIS - COMPARE INDIVIDUAL AD COPY

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}\n` : ''}${adGroupId ? `**Ad Group:** ${adGroupId}\n` : ''}**Period:** ${startDate && endDate ? `${startDate} to ${endDate}` : 'All time'}
**Ads Found:** ${ads.length}

**AGGREGATE METRICS:**
- Total Impressions: ${formatNumber(totalImpressions)}
- Total Clicks: ${formatNumber(totalClicks)}
- Overall CTR: ${overallCTR.toFixed(2)}%
- Total Spend: ${formatCurrency(overallCost)}
- Total Conversions: ${formatNumber(totalConversions)}
- Overall Conversion Rate: ${overallConversionRate.toFixed(2)}%
- Cost per Conversion: ${totalConversions > 0 ? formatCurrency(overallCPA) : 'N/A'}
- ROAS: ${totalConversionValue > 0 ? overallROAS.toFixed(2) + 'x' : 'N/A'}

${topByImpressions.length > 0 ? `**TOP ADS (by impressions):**
${topByImpressions.map((ad, i) => `${i + 1}. ${ad.adName || `Ad ${ad.adId}`} (${ad.adGroupName})
   Type: ${ad.adType} | Status: ${ad.adStatus}
   Impressions: ${formatNumber(ad.impressions)} | Clicks: ${formatNumber(ad.clicks)}
   CTR: ${(ad.ctr * 100).toFixed(2)}% | Spend: ${ad.cost}
   ${ad.headlines.length > 0 ? `Headlines: "${ad.headlines.slice(0, 2).join('", "')}"` : ''}
   ${ad.finalUrls.length > 0 ? `URL: ${ad.finalUrls[0]}` : ''}`).join('\n\n')}

` : ''}${topByConversions.length > 0 ? `✅ **TOP ADS (by conversions):**
${topByConversions.map((ad, i) => `${i + 1}. ${ad.adName || `Ad ${ad.adId}`} (${ad.adGroupName})
   Conversions: ${formatNumber(ad.conversions)} | Spend: ${ad.cost}
   CVR: ${(ad.conversionRate * 100).toFixed(2)}% | CPA: ${formatCurrency(ad.costMicros / 1000000 / (ad.conversions || 1))}
   ${ad.headlines.length > 0 ? `Headlines: "${ad.headlines.slice(0, 2).join('", "')}"` : ''}
   💡 WINNER: This ad copy resonates - consider using similar messaging`).join('\n\n')}

` : ''}${lowPerformers.length > 0 ? `⚠️ **LOW-PERFORMING ADS (low CTR, high impressions):**
${lowPerformers.map((ad, i) => `${i + 1}. ${ad.adName || `Ad ${ad.adId}`} (${ad.adGroupName})
   CTR: ${(ad.ctr * 100).toFixed(2)}% | Impressions: ${formatNumber(ad.impressions)} | Spend: ${ad.cost}
   ${ad.headlines.length > 0 ? `Headlines: "${ad.headlines.slice(0, 2).join('", "')}"` : ''}
   💡 ACTION: Pause and rewrite ad copy, or replace with top performer's messaging`).join('\n\n')}

` : ''}💡 KEY INSIGHTS & AD COPY OPTIMIZATION:

**Performance Indicators:**
${overallCTR < 1 ? '   • 🔴 Low CTR (<1%) - Ad copy not compelling enough' : overallCTR < 2 ? '   • ⚠️ Below average CTR (1-2%) - Test new ad copy variations' : '   • ✅ Healthy CTR (≥2%)'}
${overallConversionRate < 1 ? '   • ⚠️ Low conversion rate (<1%) - Review ad-to-landing-page message match' : '   • ✅ Decent conversion rate (≥1%)'}
${topByConversions.length === 0 ? '   • 🔴 No converting ads found - Review conversion tracking and ad messaging' : ''}
${lowPerformers.length > 0 ? `   • ⚠️ ${lowPerformers.length} low-performing ads found - Pause and replace` : ''}

**Ad Copy Best Practices:**
- **Test 3-5 ads per ad group** - Let Google optimize for winners
- **Use emotional triggers** - Benefits over features, urgency, social proof
- **Match user intent** - Ad copy should mirror keyword themes
- **Strong CTAs** - "Get", "Start", "Try", "Discover" drive action
- **Pin key headlines** - Ensure your value prop always shows

**A/B Testing Workflow:**
1. Identify winner (highest CTR or conversions)
2. Pause underperformers (CTR < 1% with >500 impressions)
3. Create 2-3 new variations of winner
4. Test for 7-14 days (need statistical significance)
5. Repeat: Keep winner, test new variations

${formatNextSteps([
                lowPerformers.length > 0 ? `Pause low performers: ${lowPerformers.length} ads with CTR < 0.5%` : 'Monitor ad performance: rerun this report weekly',
                topByConversions.length > 0 ? 'Scale winners: increase budget for campaigns with high-converting ads' : 'Create new ad variations: test different value propositions',
                'Check ad strength: ensure responsive search ads have "Excellent" rating',
                'Review landing pages: ensure ad message matches landing page headline',
                'Test different ad types: try image ads, video ads if currently using text only'
            ])}

Full ad data (${ads.length} ads) available in structured output.
Ad headlines and descriptions included for copy analysis.`;
            return injectGuidance({
                customerId,
                campaignId: campaignId || 'all',
                adGroupId: adGroupId || 'all',
                dateRange: startDate && endDate ? { startDate, endDate } : 'all time',
                ads,
                count: ads.length,
                aggregates: {
                    totalImpressions,
                    totalClicks,
                    overallCTR,
                    totalCost: overallCost,
                    totalConversions,
                    overallConversionRate,
                    costPerConversion: overallCPA,
                    roas: overallROAS,
                },
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to get ad performance', error);
            throw error;
        }
    },
};
//# sourceMappingURL=get-ad-performance.tool.js.map