/**
 * Get Ad Group Performance Tool
 *
 * MCP tool for retrieving detailed performance metrics for ad groups.
 */

import { z } from 'zod';
import { extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatCurrency, formatDiscoveryResponse, formatNextSteps, formatNumber, injectGuidance } from '../../../shared/interactive-workflow.js';

const logger = getLogger('ads.tools.reporting.get-ad-group-performance');

/**
 * Zod schema for input validation
 */
const GetAdGroupPerformanceSchema = z.object({
  customerId: z.string().optional(),
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // OAuth headers (injected by server)
  headers: z.record(z.string()).optional(),
});

/**
 * Get ad group performance
 */
export const getAdGroupPerformanceTool = {
  name: 'get_ad_group_performance',
  description: 'Get detailed performance metrics for ad groups.',
  inputSchema: {
    type: 'object' as const,
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
  async handler(input: any) {
    try {
      const validated = GetAdGroupPerformanceSchema.parse(input);
      const { customerId, campaignId, adGroupId, startDate, endDate } = validated;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error(
          'Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.'
        );
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
        const accounts = resourceNames.map((rn: any) => ({
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
        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        const guidanceText = `📅 DATE RANGE OPTIONAL (Step 2/2)

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}\n` : ''}${adGroupId ? `**Ad Group:** ${adGroupId}\n` : ''}
You can view ad group performance with or without a date range:

**Without Date Range (Recommended for First Look):**
- Shows all-time ad group performance
- Good for getting overall ad group health
- Call this tool again with just customerId

**With Date Range:**
- Last 7 days: startDate=${formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Last 30 days: startDate=${formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Last 90 days: startDate=${formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000))}, endDate=${formatDate(today)}
- Custom: Provide both startDate and endDate in YYYY-MM-DD format

**Optional Filters:**
- Add \`campaignId\` to focus on a specific campaign
- Add \`adGroupId\` to focus on a specific ad group

💡 TIP: Start without dates to see overall performance, then add dates for detailed analysis

Would you like to proceed without dates or specify a date range?`;

        return injectGuidance({ customerId, campaignId, adGroupId }, guidanceText);
      }

      // ═══ EXECUTE WITH ANALYSIS ═══
      logger.info('Getting ad group performance', { customerId, campaignId, adGroupId });

      // Build GAQL query
      const whereClauses: string[] = [];

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
          ad_group.id,
          ad_group.name,
          ad_group.status,
          ad_group.type,
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_value,
          metrics.average_cpc,
          metrics.average_cpm,
          metrics.conversion_rate
        FROM ad_group
        ${whereClause}
        ORDER BY metrics.cost_micros DESC
        LIMIT 1000
      `;

      const customer = client.getCustomer(customerId);
      const results = await customer.query(query);

      // Process results
      const adGroups = results.map((row: any) => ({
        adGroupId: row.ad_group?.id,
        adGroupName: row.ad_group?.name,
        adGroupStatus: row.ad_group?.status,
        adGroupType: row.ad_group?.type,
        campaignId: row.campaign?.id,
        campaignName: row.campaign?.name,
        impressions: row.metrics?.impressions || 0,
        clicks: row.metrics?.clicks || 0,
        ctr: row.metrics?.ctr || 0,
        costMicros: row.metrics?.cost_micros || 0,
        cost: formatCurrency((row.metrics?.cost_micros || 0) / 1000000),
        conversions: row.metrics?.conversions || 0,
        conversionValue: row.metrics?.conversion_value || 0,
        averageCpc: formatCurrency((row.metrics?.average_cpc || 0) / 1000000),
        averageCpm: formatCurrency((row.metrics?.average_cpm || 0) / 1000000),
        conversionRate: row.metrics?.conversion_rate || 0,
      }));

      // Calculate aggregates
      const totalImpressions = adGroups.reduce((sum: number, ag: any) => sum + ag.impressions, 0);
      const totalClicks = adGroups.reduce((sum: number, ag: any) => sum + ag.clicks, 0);
      const totalCostMicros = adGroups.reduce((sum: number, ag: any) => sum + ag.costMicros, 0);
      const totalConversions = adGroups.reduce((sum: number, ag: any) => sum + ag.conversions, 0);
      const totalConversionValue = adGroups.reduce((sum: number, ag: any) => sum + ag.conversionValue, 0);

      const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const overallCost = totalCostMicros / 1000000;
      const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const overallCPA = totalConversions > 0 ? overallCost / totalConversions : 0;
      const overallROAS = overallCost > 0 ? totalConversionValue / overallCost : 0;

      // Identify top and bottom performers
      const activeAdGroups = adGroups.filter((ag: any) => ag.adGroupStatus === 'ENABLED');
      const topByClicks = [...activeAdGroups].sort((a, b) => b.clicks - a.clicks).slice(0, 3);
      const topByConversions = [...activeAdGroups]
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, 3);
      const lowPerformers = activeAdGroups
        .filter((ag: any) => ag.impressions > 100 && ag.ctr < 0.5)
        .sort((a, b) => b.costMicros - a.costMicros)
        .slice(0, 3);

      const guidanceText = `📊 AD GROUP PERFORMANCE ANALYSIS

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}\n` : ''}${adGroupId ? `**Ad Group:** ${adGroupId}\n` : ''}**Period:** ${startDate && endDate ? `${startDate} to ${endDate}` : 'All time'}
**Ad Groups Found:** ${adGroups.length}

**AGGREGATE METRICS:**
- Total Impressions: ${formatNumber(totalImpressions)}
- Total Clicks: ${formatNumber(totalClicks)}
- Overall CTR: ${overallCTR.toFixed(2)}%
- Total Spend: ${formatCurrency(overallCost)}
- Total Conversions: ${formatNumber(totalConversions)}
- Overall Conversion Rate: ${overallConversionRate.toFixed(2)}%
- Cost per Conversion: ${totalConversions > 0 ? formatCurrency(overallCPA) : 'N/A'}
- ROAS: ${totalConversionValue > 0 ? overallROAS.toFixed(2) + 'x' : 'N/A'}

${topByClicks.length > 0 ? `**TOP AD GROUPS (by clicks):**
${topByClicks.map((ag, i) => `${i + 1}. ${ag.adGroupName} (${ag.campaignName})
   Status: ${ag.adGroupStatus} | Type: ${ag.adGroupType}
   Clicks: ${formatNumber(ag.clicks)} | Spend: ${ag.cost}
   CTR: ${(ag.ctr * 100).toFixed(2)}% | Conversions: ${formatNumber(ag.conversions)}`).join('\n\n')}

` : ''}${topByConversions.length > 0 ? `**TOP AD GROUPS (by conversions):**
${topByConversions.map((ag, i) => `${i + 1}. ${ag.adGroupName} (${ag.campaignName})
   Conversions: ${formatNumber(ag.conversions)} | Spend: ${ag.cost}
   CVR: ${(ag.conversionRate * 100).toFixed(2)}% | CPA: ${formatCurrency(ag.costMicros / 1000000 / (ag.conversions || 1))}`).join('\n\n')}

` : ''}${lowPerformers.length > 0 ? `⚠️ **LOW-PERFORMING AD GROUPS (low CTR, high spend):**
${lowPerformers.map((ag, i) => `${i + 1}. ${ag.adGroupName} (${ag.campaignName})
   CTR: ${(ag.ctr * 100).toFixed(2)}% | Spend: ${ag.cost}
   💡 ACTION: Review ad copy, keywords, and targeting`).join('\n\n')}

` : ''}💡 KEY INSIGHTS:

**Performance Indicators:**
${overallCTR < 1 ? '   • 🔴 Low CTR (<1%) - Ad copy or targeting needs improvement' : overallCTR < 2 ? '   • ⚠️ Below average CTR (1-2%) - Consider optimizing ads' : '   • ✅ Healthy CTR (≥2%)'}
${overallConversionRate < 1 ? '   • ⚠️ Low conversion rate (<1%) - Review landing pages and keywords' : '   • ✅ Decent conversion rate (≥1%)'}
${totalConversions === 0 ? '   • 🔴 No conversions tracked - Check conversion tracking setup' : ''}
${overallROAS > 4 ? '   • ✅ Excellent ROAS (>4x)' : overallROAS > 2 ? '   • ✅ Good ROAS (>2x)' : overallROAS > 0 ? '   • ⚠️ Low ROAS (<2x) - Optimize bids and targeting' : ''}

**Optimization Opportunities:**
- Ad groups with low CTR → Improve ad copy relevance
- Ad groups with high impressions but low clicks → Review keywords and match types
- Ad groups with clicks but no conversions → Check landing page and conversion tracking

${formatNextSteps([
  lowPerformers.length > 0 ? 'Improve low performers: review ad copy and keywords for low-CTR ad groups' : 'Monitor performance: rerun this report weekly',
  'Check keywords: use get_keyword_performance to drill down',
  'Review ads: use get_ad_performance to compare individual ads',
  'Adjust bids: optimize bids based on ad group performance',
  'Test new ads: create A/B tests in underperforming ad groups'
])}

Full ad group data (${adGroups.length} ad groups) available in structured output.`;

      return injectGuidance(
        {
          customerId,
          campaignId: campaignId || 'all',
          adGroupId: adGroupId || 'all',
          dateRange: startDate && endDate ? { startDate, endDate } : 'all time',
          adGroups,
          count: adGroups.length,
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
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to get ad group performance', error as Error);
      throw error;
    }
  },
};
