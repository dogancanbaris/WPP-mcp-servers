/**
 * List Ad Groups Tool
 *
 * MCP tool for listing all ad groups in a Google Ads campaign with performance analysis.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatDiscoveryResponse, formatNextSteps, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId, microsToAmount } from '../../validation.js';

const logger = getLogger('ads.tools.ad-groups.list');

/**
 * List ad groups
 */
export const listAdGroupsTool = {
  name: 'list_ad_groups',
  description: 'List all ad groups in a Google Ads campaign with status, CPC bids, and performance metrics.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID (to list ad groups from this campaign)',
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, campaignId } = input;

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
        const accounts = resourceNames.map((rn: any) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/2',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) =>
            `${i + 1}. Customer ID: ${a.customerId}\n   Resource: ${a.resourceName}`,
          prompt: 'Which account\'s ad groups would you like to list?',
          nextParam: 'customerId',
          emoji: '🏢',
        });
      }

      // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
      if (!campaignId) {
        const campaigns = await client.listCampaigns(customerId);

        if (campaigns.length === 0) {
          const guidanceText = `⚠️ NO CAMPAIGNS FOUND

This account has no campaigns. Create a campaign first.

**Next Steps:**
1. Use create_campaign tool to create a campaign
2. Then create ad groups within that campaign`;

          return injectGuidance({ customerId }, guidanceText);
        }

        return formatDiscoveryResponse({
          step: '2/2',
          title: 'SELECT CAMPAIGN',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign?.name || 'Unnamed Campaign'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
          },
          prompt: 'Which campaign\'s ad groups would you like to list?',
          nextParam: 'campaignId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: EXECUTE WITH ANALYSIS ═══
      logger.info('Listing ad groups', { customerId, campaignId });

      const customer = client.getCustomer(customerId);

      // Query ad groups with performance metrics
      const adGroups = await customer.query(`
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.status,
          ad_group.cpc_bid_micros,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_rate
        FROM ad_group
        WHERE campaign.id = ${campaignId}
          AND segments.date DURING LAST_30_DAYS
        ORDER BY ad_group.name
      `);

      if (adGroups.length === 0) {
        const guidanceText = `⚠️ NO AD GROUPS FOUND

Campaign ${campaignId} has no ad groups. Create an ad group first.

**Next Steps:**
1. Use create_ad_group tool to create an ad group in this campaign
2. Add keywords and ads to the ad group
3. Enable the ad group when ready`;

        return injectGuidance({ customerId, campaignId }, guidanceText);
      }

      // Analyze ad groups
      const statusCounts = adGroups.reduce((acc: any, ag: any) => {
        const status = ag.ad_group?.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Calculate totals
      const totals = adGroups.reduce(
        (acc: any, ag: any) => {
          const metrics = ag.metrics || {};
          acc.impressions += metrics.impressions || 0;
          acc.clicks += metrics.clicks || 0;
          acc.costMicros += metrics.cost_micros || 0;
          acc.conversions += metrics.conversions || 0;
          return acc;
        },
        { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 }
      );

      const totalCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const totalCost = totals.costMicros / 1000000;
      const avgCpc = totals.clicks > 0 ? totalCost / totals.clicks : 0;

      // Find top performers
      const byImpressions = [...adGroups].sort(
        (a: any, b: any) => (b.metrics?.impressions || 0) - (a.metrics?.impressions || 0)
      );
      const byConversions = [...adGroups].sort(
        (a: any, b: any) => (b.metrics?.conversions || 0) - (a.metrics?.conversions || 0)
      );

      // Quality Score analysis (if available)
      const withQualityScore = adGroups.filter((ag: any) => ag.ad_group?.quality_info?.quality_score);
      const avgQualityScore = withQualityScore.length > 0
        ? withQualityScore.reduce((sum: number, ag: any) => sum + (ag.ad_group.quality_info.quality_score || 0), 0) / withQualityScore.length
        : null;

      // Build rich guidance
      const guidanceText = `📊 AD GROUP OVERVIEW - CAMPAIGN ${campaignId}

**Total Ad Groups:** ${adGroups.length}

**By Status:**
${Object.entries(statusCounts).map(([status, count]) =>
  `   • ${status}: ${count}`
).join('\n')}

**Performance Summary (Last 30 Days):**
   • Total Impressions: ${totals.impressions.toLocaleString()}
   • Total Clicks: ${totals.clicks.toLocaleString()}
   • CTR: ${totalCtr.toFixed(2)}%
   • Total Cost: $${totalCost.toFixed(2)}
   • Avg CPC: $${avgCpc.toFixed(2)}
   • Total Conversions: ${totals.conversions.toFixed(2)}
${avgQualityScore ? `   • Avg Quality Score: ${avgQualityScore.toFixed(1)}/10` : ''}

**Top Performers (by Impressions):**
${byImpressions.slice(0, 3).map((ag: any, i) => {
  const adGroup = ag.ad_group;
  const metrics = ag.metrics || {};
  const cpcBid = adGroup?.cpc_bid_micros ? microsToAmount(adGroup.cpc_bid_micros) : 'Campaign default';
  const ctr = metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : '0.00';

  return `${i + 1}. ${adGroup?.name || 'N/A'}
   ID: ${adGroup?.id} | Status: ${adGroup?.status}
   CPC Bid: ${cpcBid}
   Impressions: ${(metrics.impressions || 0).toLocaleString()} | Clicks: ${(metrics.clicks || 0).toLocaleString()} | CTR: ${ctr}%
   Conversions: ${(metrics.conversions || 0).toFixed(2)}`;
}).join('\n\n')}

${adGroups.length > 3 ? `... and ${adGroups.length - 3} more ad groups\n` : ''}

**Top Converters:**
${byConversions.slice(0, 3).map((ag: any, i) => {
  const adGroup = ag.ad_group;
  const metrics = ag.metrics || {};
  const convRate = metrics.clicks > 0 ? ((metrics.conversions / metrics.clicks) * 100).toFixed(2) : '0.00';

  return `${i + 1}. ${adGroup?.name || 'N/A'}
   Conversions: ${(metrics.conversions || 0).toFixed(2)} | Conv Rate: ${convRate}%
   Cost: ${microsToAmount(metrics.cost_micros || 0)}`;
}).join('\n\n')}

💡 WHAT YOU CAN DO WITH THESE AD GROUPS:

**Performance Analysis:**
- View detailed metrics: use get_keyword_performance with specific ad group
- Analyze search terms: use get_search_terms_report
- Check Quality Score: Available in keyword performance report

**Ad Group Management:**
- Update status (pause/enable): use update_ad_group
- Modify CPC bids: use update_ad_group with cpcBidMicros
- Add keywords: use add_keywords with adGroupId
- Create ads: use create_ad with adGroupId

**Optimization:**
- Add negative keywords: use add_negative_keywords
- Review keyword performance: use get_keyword_performance
- A/B test ads: create multiple ads per ad group
- Optimize bids: adjust CPC based on Quality Score

${formatNextSteps([
  'Analyze keywords: call get_keyword_performance with ad group ID',
  'View search terms: call get_search_terms_report',
  'Optimize bids: call update_ad_group to adjust CPC',
  'Add keywords: call add_keywords with top-performing ad group'
])}

Which ad group would you like to analyze or modify?`;

      return injectGuidance(
        {
          customerId,
          campaignId,
          adGroups,
          count: adGroups.length,
          statusBreakdown: statusCounts,
          totals,
          topPerformers: {
            byImpressions: byImpressions.slice(0, 3),
            byConversions: byConversions.slice(0, 3),
          },
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to list ad groups', error as Error);
      throw error;
    }
  },
};
