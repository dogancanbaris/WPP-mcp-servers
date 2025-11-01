/**
 * Update Ad Group Bid Modifier Tool
 *
 * Adjust ad group CPC bid by a percentage increase/decrease.
 * More intuitive than setting absolute micros values.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, formatSuccessSummary, injectGuidance, formatCurrency } from '../../../shared/interactive-workflow.js';
import { extractCustomerId, microsToAmount } from '../../validation.js';

const logger = getLogger('ads.tools.ad-groups.update-bid-modifier');
const audit = getAuditLogger();

/**
 * Update ad group bid by percentage
 */
export const updateAdGroupBidModifierTool = {
  name: 'update_ad_group_bid_modifier',
  description: 'Adjust ad group CPC bid by percentage (increase/decrease).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID containing the ad group',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad Group ID to update',
      },
      percentageChange: {
        type: 'number',
        description: 'Percentage to change bid (e.g., 20 for +20%, -15 for -15%)',
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token for executing the operation',
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, campaignId, adGroupId, percentageChange, confirmationToken } = input;

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
        const accounts = resourceNames.map((rn: any) => ({
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
          emoji: '🎯',
        });
      }

      // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
      if (!campaignId) {
        const campaigns = await client.listCampaigns(customerId);

        if (campaigns.length === 0) {
          const guidanceText = `⚠️ NO CAMPAIGNS FOUND (Step 2/4)

This account has no campaigns.

Create a campaign first using create_campaign.`;

          return injectGuidance({ customerId }, guidanceText);
        }

        return formatDiscoveryResponse({
          step: '2/4',
          title: 'SELECT CAMPAIGN',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign?.name || 'Unnamed Campaign'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
          },
          prompt: 'Which campaign contains the ad group?',
          nextParam: 'campaignId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: AD GROUP DISCOVERY ═══
      if (!adGroupId) {
        const customer = client.getCustomer(customerId);
        const adGroups = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.cpc_bid_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions
          FROM ad_group
          WHERE campaign.id = ${campaignId}
            AND ad_group.status != 'REMOVED'
            AND segments.date DURING LAST_30_DAYS
          ORDER BY metrics.impressions DESC
        `);

        if (adGroups.length === 0) {
          const guidanceText = `⚠️ NO AD GROUPS FOUND (Step 3/4)

Campaign ${campaignId} has no active ad groups.

Create an ad group first using create_ad_group.`;

          return injectGuidance({ customerId, campaignId }, guidanceText);
        }

        // Aggregate by ad group
        const adGroupMap = new Map();
        for (const row of adGroups) {
          const agId = row.ad_group?.id;
          if (!agId) continue;

          if (!adGroupMap.has(agId)) {
            adGroupMap.set(agId, {
              adGroup: row.ad_group,
              metrics: { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 },
            });
          }
          const ag = adGroupMap.get(agId);
          ag.metrics.impressions += row.metrics?.impressions || 0;
          ag.metrics.clicks += row.metrics?.clicks || 0;
          ag.metrics.costMicros += row.metrics?.cost_micros || 0;
          ag.metrics.conversions += row.metrics?.conversions || 0;
        }

        const uniqueAdGroups = Array.from(adGroupMap.values());

        return formatDiscoveryResponse({
          step: '3/4',
          title: 'SELECT AD GROUP',
          items: uniqueAdGroups,
          itemFormatter: (ag, i) => {
            const adGroup = ag.adGroup;
            const cpcBid = adGroup?.cpc_bid_micros ? microsToAmount(adGroup.cpc_bid_micros) : 'Campaign default';
            const avgCpc = ag.metrics.clicks > 0
              ? formatCurrency(ag.metrics.costMicros / 1_000_000 / ag.metrics.clicks)
              : '$0.00';

            return `${i + 1}. ${adGroup?.name || 'Unnamed'}
   ID: ${adGroup?.id}
   Status: ${adGroup?.status}
   CPC Bid: ${cpcBid}
   Performance (30d): ${ag.metrics.impressions.toLocaleString()} impr, ${ag.metrics.clicks.toLocaleString()} clicks
   Avg CPC: ${avgCpc} | Conversions: ${ag.metrics.conversions.toFixed(2)}`;
          },
          prompt: 'Which ad group\'s bid would you like to modify?',
          nextParam: 'adGroupId',
          context: { customerId, campaignId },
        });
      }

      // ═══ STEP 4: PERCENTAGE CHANGE INPUT ═══
      if (percentageChange === undefined || percentageChange === null) {
        const customer = client.getCustomer(customerId);
        const adGroupDetails = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.cpc_bid_micros,
            metrics.average_cpc,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.cost_micros
          FROM ad_group
          WHERE ad_group.id = ${adGroupId}
            AND segments.date DURING LAST_30_DAYS
        `);

        if (adGroupDetails.length === 0) {
          throw new Error(`Ad Group ${adGroupId} not found`);
        }

        const currentBidMicros = adGroupDetails[0].ad_group?.cpc_bid_micros || 0;
        const currentBid = currentBidMicros / 1_000_000;

        // Aggregate metrics
        const totalImpressions = adGroupDetails.reduce((sum: number, row: any) => sum + (row.metrics?.impressions || 0), 0);
        const totalClicks = adGroupDetails.reduce((sum: number, row: any) => sum + (row.metrics?.clicks || 0), 0);
        const totalCostMicros = adGroupDetails.reduce((sum: number, row: any) => sum + (row.metrics?.cost_micros || 0), 0);
        const totalConversions = adGroupDetails.reduce((sum: number, row: any) => sum + (row.metrics?.conversions || 0), 0);

        const avgCpc = totalClicks > 0 ? (totalCostMicros / 1_000_000) / totalClicks : 0;

        const guidanceText = `💰 ENTER BID ADJUSTMENT PERCENTAGE (Step 4/4)

**Ad Group:** ${adGroupDetails[0].ad_group?.name}
**Ad Group ID:** ${adGroupId}

**Current Bid Settings:**
   • CPC Bid: ${formatCurrency(currentBid)}
   • Actual Avg CPC (30d): ${formatCurrency(avgCpc)}

**Recent Performance (Last 30 Days):**
   • Impressions: ${totalImpressions.toLocaleString()}
   • Clicks: ${totalClicks.toLocaleString()}
   • Conversions: ${totalConversions.toFixed(2)}
   • Total Cost: ${formatCurrency(totalCostMicros / 1_000_000)}

**How Percentage Changes Work:**

Positive values increase bid:
   • +10% → ${formatCurrency(currentBid * 1.1)} (from ${formatCurrency(currentBid)})
   • +20% → ${formatCurrency(currentBid * 1.2)}
   • +50% → ${formatCurrency(currentBid * 1.5)}

Negative values decrease bid:
   • -10% → ${formatCurrency(currentBid * 0.9)} (from ${formatCurrency(currentBid)})
   • -20% → ${formatCurrency(currentBid * 0.8)}
   • -30% → ${formatCurrency(currentBid * 0.7)}

💡 **BIDDING BEST PRACTICES:**

**Increase bid when:**
   • Quality Score is high (8-10) but impression share is low
   • Conversions are good but volume is limited
   • Avg CPC is well below bid (room to compete)

**Decrease bid when:**
   • Quality Score is low (<5) - fix quality first!
   • Cost per conversion is too high
   • Limited by budget (optimize spend instead)

**Typical adjustments:**
   • Small test: ±10-15%
   • Moderate change: ±20-30%
   • Aggressive change: ±40-50% (risky!)

**Provide:** percentageChange (number, e.g., 20 for +20%, -15 for -15%)`;

        return injectGuidance(
          {
            customerId,
            campaignId,
            adGroupId,
            currentBid,
            avgCpc,
            performance: {
              impressions: totalImpressions,
              clicks: totalClicks,
              conversions: totalConversions,
              cost: totalCostMicros / 1_000_000,
            },
          },
          guidanceText
        );
      }

      // ═══ STEP 5: DRY-RUN PREVIEW ═══
      if (!confirmationToken) {
        const customer = client.getCustomer(customerId);
        const adGroupDetails = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.cpc_bid_micros,
            metrics.average_cpc
          FROM ad_group
          WHERE ad_group.id = ${adGroupId}
          LIMIT 1
        `);

        const currentBidMicros = adGroupDetails[0].ad_group?.cpc_bid_micros || 0;
        const currentBid = currentBidMicros / 1_000_000;
        const newBid = currentBid * (1 + percentageChange / 100);
        // const newBidMicros = Math.round(newBid * 1_000_000); // Calculated inline below

        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Validate percentage
        if (percentageChange === 0) {
          warnings.push('Zero percentage change - no modification will occur');
        }

        if (Math.abs(percentageChange) > 50) {
          warnings.push(`Large bid change: ${percentageChange}% - consider gradual adjustments`);
          recommendations.push('Test smaller changes (10-20%) first');
        }

        if (newBid < 0.01) {
          warnings.push('New bid would be less than minimum ($0.01) - will be clamped');
        }

        if (percentageChange > 0) {
          recommendations.push('Monitor performance closely after bid increase');
          recommendations.push('Expect higher avg position but also higher costs');
        } else {
          recommendations.push('Bid decrease may reduce impression share');
          recommendations.push('Monitor if conversions drop after decrease');
        }

        const previewText = `📋 BID MODIFICATION PREVIEW (Step 5/5)

**Ad Group:** ${adGroupDetails[0].ad_group?.name}
**Ad Group ID:** ${adGroupId}

**PROPOSED BID CHANGE:**
   • Current Bid: ${formatCurrency(currentBid)}
   • Percentage Change: ${percentageChange > 0 ? '+' : ''}${percentageChange}%
   • New Bid: ${formatCurrency(newBid)}
   • Dollar Change: ${formatCurrency(newBid - currentBid)}

${warnings.length > 0 ? `\n⚠️ **WARNINGS:**\n${warnings.map(w => `   • ${w}`).join('\n')}\n` : ''}
${recommendations.length > 0 ? `\n💡 **RECOMMENDATIONS:**\n${recommendations.map(r => `   • ${r}`).join('\n')}\n` : ''}

✅ **Ready to update bid?**

Call this tool again with the same parameters plus:
\`\`\`json
{
  "confirmationToken": "${Math.random().toString(36).substring(7)}"
}
\`\`\``;

        return {
          content: [{
            type: 'text',
            text: previewText
          }],
          data: {
            customerId,
            campaignId,
            adGroupId,
            currentBid,
            percentageChange,
            newBid,
          },
          requiresApproval: true,
          confirmationToken: Math.random().toString(36).substring(7),
          success: true,
        };
      }

      // ═══ STEP 6: EXECUTE BID UPDATE ═══
      logger.info('Updating ad group bid', { customerId, adGroupId, percentageChange });

      const customer = client.getCustomer(customerId);

      // Fetch current bid
      const beforeUpdate = await customer.query(`
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.cpc_bid_micros
        FROM ad_group
        WHERE ad_group.id = ${adGroupId}
        LIMIT 1
      `);

      const currentBidMicros = beforeUpdate[0]?.ad_group?.cpc_bid_micros || 0;
      const currentBid = currentBidMicros / 1_000_000;
      const newBid = currentBid * (1 + percentageChange / 100);
      const newBidMicros = Math.max(10000, Math.round(newBid * 1_000_000)); // Min $0.01

      // Build update operation
      const adGroupResourceName = `customers/${customerId}/adGroups/${adGroupId}`;

      const updateOperation: any = {
        update: {
          resource_name: adGroupResourceName,
          cpc_bid_micros: newBidMicros,
        },
        update_mask: { paths: ['cpc_bid_micros'] },
      };

      await customer.adGroups.update([updateOperation]);

      // AUDIT: Log successful update
      await audit.logWriteOperation('user', 'update_ad_group_bid_modifier', customerId, {
        adGroupId,
        percentageChange,
        oldBid: currentBid,
        newBid: newBidMicros / 1_000_000,
      });

      const successText = formatSuccessSummary({
        title: 'AD GROUP BID UPDATED SUCCESSFULLY',
        operation: 'Bid modification by percentage',
        details: {
          'Ad Group ID': adGroupId,
          'Ad Group Name': beforeUpdate[0]?.ad_group?.name || 'N/A',
          'Old Bid': formatCurrency(currentBid),
          'Percentage Change': `${percentageChange > 0 ? '+' : ''}${percentageChange}%`,
          'New Bid': formatCurrency(newBidMicros / 1_000_000),
          'Dollar Change': formatCurrency((newBidMicros / 1_000_000) - currentBid),
        },
        auditId: `bid_modifier_${adGroupId}`,
        nextSteps: [
          'Monitor performance: changes take 1-2 hours to reflect',
          'Check impression share: use get_ad_group_performance',
          'Review avg CPC: compare to new bid',
          'Adjust again if needed: use this tool with different percentage',
        ],
        warnings:
          Math.abs(percentageChange) > 30
            ? ['Large bid change - monitor closely for next 24-48 hours']
            : [],
      });

      return injectGuidance(
        {
          success: true,
          customerId,
          campaignId,
          adGroupId,
          percentageChange,
          oldBid: currentBid,
          newBid: newBidMicros / 1_000_000,
        },
        successText
      );

    } catch (error) {
      logger.error('Failed to update ad group bid', error as Error);

      // AUDIT: Log failed operation
      await audit.logFailedOperation('user', 'update_ad_group_bid_modifier', input.customerId, (error as Error).message, {
        adGroupId: input.adGroupId,
        percentageChange: input.percentageChange,
      });

      throw error;
    }
  },
};
