/**
 * List Ads Tool
 *
 * MCP tool for listing all ads in a Google Ads account or ad group.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatDiscoveryResponse, formatNextSteps, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
const logger = getLogger('ads.tools.ads.list');
/**
 * List ads
 */
export const listAdsTool = {
    name: 'list_ads',
    description: 'List all ads in a Google Ads account or ad group.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            adGroupId: {
                type: 'string',
                description: 'Ad Group ID to filter by (optional)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to filter by (optional)',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, adGroupId, campaignId } = input;
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
                    step: '1/1',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account\'s ads would you like to list?',
                    nextParam: 'customerId',
                    emoji: '📢',
                });
            }
            // ═══ STEP 2: EXECUTE QUERY ═══
            logger.info('Listing ads', { customerId, adGroupId, campaignId });
            const customer = client.getCustomer(customerId);
            // Build GAQL query
            let query = `
        SELECT
          ad_group_ad.ad.id,
          ad_group_ad.ad.name,
          ad_group_ad.ad.type,
          ad_group_ad.status,
          ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          ad_group_ad.ad.responsive_search_ad.path1,
          ad_group_ad.ad.responsive_search_ad.path2,
          ad_group_ad.ad.final_urls,
          ad_group_ad.policy_summary.approval_status,
          ad_group_ad.policy_summary.review_status,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros
        FROM ad_group_ad
        WHERE ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'
          AND ad_group_ad.status != 'REMOVED'
      `;
            // Add filters
            if (campaignId) {
                query += ` AND campaign.id = ${campaignId}`;
            }
            if (adGroupId) {
                query += ` AND ad_group.id = ${adGroupId}`;
            }
            // Add date range for metrics (last 30 days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const formatDate = (d) => d.toISOString().split('T')[0];
            query += ` AND segments.date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'`;
            query += ' ORDER BY metrics.impressions DESC';
            const ads = await customer.query(query);
            // Aggregate ad data (can have multiple rows per ad due to date segments)
            const adMap = new Map();
            for (const row of ads) {
                const adId = row.ad_group_ad?.ad?.id;
                if (!adId)
                    continue;
                if (!adMap.has(adId)) {
                    adMap.set(adId, {
                        ad: row.ad_group_ad,
                        adGroup: row.ad_group,
                        campaign: row.campaign,
                        metrics: {
                            impressions: 0,
                            clicks: 0,
                            cost_micros: 0,
                        },
                    });
                }
                const adData = adMap.get(adId);
                adData.metrics.impressions += row.metrics?.impressions || 0;
                adData.metrics.clicks += row.metrics?.clicks || 0;
                adData.metrics.cost_micros += row.metrics?.cost_micros || 0;
            }
            const aggregatedAds = Array.from(adMap.values());
            // Sort by impressions
            aggregatedAds.sort((a, b) => b.metrics.impressions - a.metrics.impressions);
            // Analyze ads
            const statusCounts = aggregatedAds.reduce((acc, ad) => {
                const status = ad.ad?.status || 'UNKNOWN';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            const approvalCounts = aggregatedAds.reduce((acc, ad) => {
                const status = ad.ad?.policy_summary?.approval_status || 'UNKNOWN';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            // Calculate totals
            const totalImpressions = aggregatedAds.reduce((sum, ad) => sum + ad.metrics.impressions, 0);
            const totalClicks = aggregatedAds.reduce((sum, ad) => sum + ad.metrics.clicks, 0);
            const totalCost = aggregatedAds.reduce((sum, ad) => sum + ad.metrics.cost_micros, 0);
            const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
            // Format ads for display
            const formatAd = (adData, index) => {
                const ad = adData.ad?.ad;
                const rsa = ad?.responsive_search_ad;
                const adGroup = adData.adGroup;
                const campaign = adData.campaign;
                const metrics = adData.metrics;
                const headlines = rsa?.headlines?.map((h) => h.text).slice(0, 3) || [];
                const descriptions = rsa?.descriptions?.map((d) => d.text).slice(0, 2) || [];
                const finalUrl = ad?.final_urls?.[0] || 'N/A';
                const ctr = metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : '0.00';
                const cost = (metrics.cost_micros / 1000000).toFixed(2);
                return `${index + 1}. Ad ID: ${ad?.id} | Status: ${adData.ad?.status} | Approval: ${adData.ad?.policy_summary?.approval_status}
   Campaign: ${campaign?.name} (ID: ${campaign?.id})
   Ad Group: ${adGroup?.name} (ID: ${adGroup?.id})

   Headlines (${rsa?.headlines?.length || 0}):
   ${headlines.map((h) => `   • ${h}`).join('\n')}
   ${rsa?.headlines?.length > 3 ? `   ... and ${rsa.headlines.length - 3} more` : ''}

   Descriptions (${rsa?.descriptions?.length || 0}):
   ${descriptions.map((d) => `   • ${d}`).join('\n')}
   ${rsa?.descriptions?.length > 2 ? `   ... and ${rsa.descriptions.length - 2} more` : ''}

   Final URL: ${finalUrl}

   Performance (Last 30 Days):
   • Impressions: ${metrics.impressions.toLocaleString()}
   • Clicks: ${metrics.clicks.toLocaleString()}
   • CTR: ${ctr}%
   • Cost: $${cost}`;
            };
            // Build rich guidance
            const guidanceText = `📢 AD OVERVIEW - ACCOUNT ${customerId}

**Total Ads:** ${aggregatedAds.length}${adGroupId ? ` (filtered by Ad Group ${adGroupId})` : ''}${campaignId ? ` (filtered by Campaign ${campaignId})` : ''}

**By Status:**
${Object.entries(statusCounts).map(([status, count]) => `   • ${status}: ${count}`).join('\n')}

**By Approval Status:**
${Object.entries(approvalCounts).map(([status, count]) => `   • ${status}: ${count}`).join('\n')}

**Performance Summary (Last 30 Days):**
   • Total Impressions: ${totalImpressions.toLocaleString()}
   • Total Clicks: ${totalClicks.toLocaleString()}
   • Average CTR: ${avgCtr.toFixed(2)}%
   • Total Cost: $${(totalCost / 1000000).toFixed(2)}

**AD LIST (Top ${Math.min(aggregatedAds.length, 5)} by Impressions):**

${aggregatedAds.slice(0, 5).map(formatAd).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n')}

${aggregatedAds.length > 5 ? `\n... and ${aggregatedAds.length - 5} more ads (total: ${aggregatedAds.length})\n` : ''}

💡 WHAT YOU CAN DO WITH THESE ADS:

**Ad Management:**
- Pause/enable ads: use update_ad with status parameter
- Create new ads: use create_ad
- Update ad copy: use update_ad (limited - may need to create new ad)

**Analysis:**
- Low CTR? Review headline/description combinations
- High impressions, low clicks? Improve ad copy relevance
- Disapproved ads? Check policy_summary for issues

**Optimization:**
- A/B test different headline combinations
- Add more headlines/descriptions for better coverage
- Match ad copy to landing page content
- Use ad customizers for dynamic content

${formatNextSteps([
                'Create new ad variations: use create_ad',
                'Update ad status: use update_ad with status parameter',
                'Check campaign performance: use get_campaign_performance',
                'Review keywords: use get_keyword_performance'
            ])}`;
            return injectGuidance({
                customerId,
                adGroupId,
                campaignId,
                ads: aggregatedAds,
                count: aggregatedAds.length,
                statusBreakdown: statusCounts,
                approvalBreakdown: approvalCounts,
                performanceSummary: {
                    impressions: totalImpressions,
                    clicks: totalClicks,
                    ctr: avgCtr,
                    cost: totalCost / 1000000,
                },
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list ads', error);
            throw error;
        }
    },
};
//# sourceMappingURL=list-ads.tool.js.map