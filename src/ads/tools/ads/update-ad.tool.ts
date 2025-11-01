/**
 * Update Ad Tool
 *
 * MCP tool for updating ad status (pause/enable/remove) in Google Ads.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, formatSuccessSummary, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';

const logger = getLogger('ads.tools.ads.update');
const audit = getAuditLogger();

/**
 * Update ad status
 */
export const updateAdTool = {
  name: 'update_ad',
  description: 'Update ad status (pause, enable, or remove) in Google Ads.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad Group ID containing the ad',
      },
      adId: {
        type: 'string',
        description: 'Ad ID to update',
      },
      status: {
        type: 'string',
        enum: ['ENABLED', 'PAUSED', 'REMOVED'],
        description: 'New status for the ad',
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
      const { customerId, adGroupId, adId, status, confirmationToken } = input;

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
          step: '1/5',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account contains the ad you want to update?',
          nextParam: 'customerId',
          emoji: '🎯',
        });
      }

      // ═══ STEP 2: AD GROUP DISCOVERY ═══
      if (!adGroupId) {
        const customer = client.getCustomer(customerId);
        const adGroups = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            campaign.id,
            campaign.name,
            metrics.impressions
          FROM ad_group
          WHERE ad_group.status != 'REMOVED'
            AND segments.date DURING LAST_30_DAYS
          ORDER BY metrics.impressions DESC
        `);

        if (adGroups.length === 0) {
          const guidanceText = `⚠️ NO AD GROUPS FOUND (Step 2/5)

This account has no active ad groups.

Cannot update ads without ad groups.`;

          return injectGuidance({ customerId }, guidanceText);
        }

        // Aggregate by ad group
        const adGroupMap = new Map();
        for (const row of adGroups) {
          const agId = row.ad_group?.id;
          if (!agId) continue;

          if (!adGroupMap.has(agId)) {
            adGroupMap.set(agId, {
              adGroup: row.ad_group,
              campaign: row.campaign,
              impressions: 0,
            });
          }
          adGroupMap.get(agId).impressions += row.metrics?.impressions || 0;
        }

        const uniqueAdGroups = Array.from(adGroupMap.values());

        return formatDiscoveryResponse({
          step: '2/5',
          title: 'SELECT AD GROUP',
          items: uniqueAdGroups,
          itemFormatter: (ag, i) => {
            return `${i + 1}. ${ag.adGroup?.name || 'Unnamed'}
   ID: ${ag.adGroup?.id}
   Campaign: ${ag.campaign?.name || 'N/A'}
   Status: ${ag.adGroup?.status}
   Impressions (30d): ${ag.impressions.toLocaleString()}`;
          },
          prompt: 'Which ad group contains the ad?',
          nextParam: 'adGroupId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: AD DISCOVERY ═══
      if (!adId) {
        const customer = client.getCustomer(customerId);
        const ads = await customer.query(`
          SELECT
            ad_group_ad.ad.id,
            ad_group_ad.ad.name,
            ad_group_ad.ad.type,
            ad_group_ad.status,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.ad.responsive_search_ad.descriptions,
            ad_group_ad.policy_summary.approval_status,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr
          FROM ad_group_ad
          WHERE ad_group.id = ${adGroupId}
            AND ad_group_ad.status != 'REMOVED'
            AND segments.date DURING LAST_30_DAYS
          ORDER BY metrics.impressions DESC
        `);

        if (ads.length === 0) {
          const guidanceText = `⚠️ NO ADS FOUND (Step 3/5)

This ad group has no active ads.

**Ad Group ID:** ${adGroupId}

Create an ad first using create_ad.`;

          return injectGuidance({ customerId, adGroupId }, guidanceText);
        }

        // Aggregate by ad
        const adMap = new Map();
        for (const row of ads) {
          const id = row.ad_group_ad?.ad?.id;
          if (!id) continue;

          if (!adMap.has(id)) {
            adMap.set(id, {
              ad: row.ad_group_ad,
              metrics: { impressions: 0, clicks: 0 },
            });
          }
          const adData = adMap.get(id);
          adData.metrics.impressions += row.metrics?.impressions || 0;
          adData.metrics.clicks += row.metrics?.clicks || 0;
        }

        const uniqueAds = Array.from(adMap.values());

        return formatDiscoveryResponse({
          step: '3/5',
          title: 'SELECT AD',
          items: uniqueAds,
          itemFormatter: (adData, i) => {
            const ad = adData.ad;
            const rsa = ad?.ad?.responsive_search_ad;
            const headlines = rsa?.headlines?.map((h: any) => h.text).slice(0, 2) || [];
            const ctr = adData.metrics.impressions > 0
              ? ((adData.metrics.clicks / adData.metrics.impressions) * 100).toFixed(2)
              : '0.00';

            return `${i + 1}. Ad ID: ${ad?.ad?.id}
   Status: ${ad?.status}
   Approval: ${ad?.policy_summary?.approval_status}
   Headlines: ${headlines.join(' | ')}
   Performance (30d): ${adData.metrics.impressions.toLocaleString()} impr, ${ctr}% CTR`;
          },
          prompt: 'Which ad do you want to update?',
          nextParam: 'adId',
          context: { customerId, adGroupId },
        });
      }

      // ═══ STEP 4: STATUS SELECTION ═══
      if (!status) {
        // Fetch current ad details
        const customer = client.getCustomer(customerId);
        const adDetails = await customer.query(`
          SELECT
            ad_group_ad.ad.id,
            ad_group_ad.status,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.ad.responsive_search_ad.descriptions,
            ad_group_ad.policy_summary.approval_status,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros
          FROM ad_group_ad
          WHERE ad_group.id = ${adGroupId}
            AND ad_group_ad.ad.id = ${adId}
            AND segments.date DURING LAST_30_DAYS
        `);

        if (adDetails.length === 0) {
          throw new Error(`Ad ${adId} not found in ad group ${adGroupId}`);
        }

        const currentStatus = adDetails[0].ad_group_ad?.status || 'UNKNOWN';
        const approvalStatus = adDetails[0].ad_group_ad?.policy_summary?.approval_status || 'UNKNOWN';
        const headlines = adDetails[0].ad_group_ad?.ad?.responsive_search_ad?.headlines?.map((h: any) => h.text).slice(0, 3) || [];

        // Aggregate metrics
        const totalImpressions = adDetails.reduce((sum: number, row: any) => sum + (row.metrics?.impressions || 0), 0);
        const totalClicks = adDetails.reduce((sum: number, row: any) => sum + (row.metrics?.clicks || 0), 0);
        const totalCost = adDetails.reduce((sum: number, row: any) => sum + (row.metrics?.cost_micros || 0), 0);
        const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

        const guidanceText = `🔄 SELECT NEW STATUS (Step 4/5)

**Current Ad Details:**
   • Ad ID: ${adId}
   • Current Status: ${currentStatus}
   • Approval Status: ${approvalStatus}
   • Headlines: ${headlines.join(' | ')}

**Performance (Last 30 Days):**
   • Impressions: ${totalImpressions.toLocaleString()}
   • Clicks: ${totalClicks.toLocaleString()}
   • CTR: ${ctr}%
   • Cost: $${(totalCost / 1_000_000).toFixed(2)}

**Available Status Options:**

1. **ENABLED** - Ad will actively serve
   • Ad must be approved by Google
   • Will start accruing impressions and costs
   • Best for: Tested, approved ads ready to serve

2. **PAUSED** - Ad will not serve but remains in account
   • Preserves ad history and performance data
   • Can be re-enabled anytime
   • Best for: Temporarily stopping an ad

3. **REMOVED** - Ad will be deleted (cannot be undone)
   • Ad history preserved but ad cannot be re-enabled
   • Permanent action
   • Best for: Eliminating poor performers

${currentStatus === 'ENABLED' ? '💡 Tip: Pausing is safer than removing if you might want to re-enable later' : ''}
${currentStatus === 'PAUSED' ? '💡 Tip: Make sure ad is approved before enabling' : ''}

**Provide:** status (ENABLED, PAUSED, or REMOVED)`;

        return injectGuidance(
          {
            customerId,
            adGroupId,
            adId,
            currentStatus,
            approvalStatus,
            performance: {
              impressions: totalImpressions,
              clicks: totalClicks,
              ctr: parseFloat(ctr),
              cost: totalCost / 1_000_000,
            },
          },
          guidanceText
        );
      }

      // ═══ STEP 5: DRY-RUN PREVIEW ═══
      if (!confirmationToken) {
        // Fetch current status
        const customer = client.getCustomer(customerId);
        const adDetails = await customer.query(`
          SELECT
            ad_group_ad.status,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.policy_summary.approval_status
          FROM ad_group_ad
          WHERE ad_group.id = ${adGroupId}
            AND ad_group_ad.ad.id = ${adId}
          LIMIT 1
        `);

        const currentStatus = adDetails[0]?.ad_group_ad?.status || 'UNKNOWN';
        const approvalStatus = adDetails[0]?.ad_group_ad?.policy_summary?.approval_status || 'UNKNOWN';
        const headlines = adDetails[0]?.ad_group_ad?.ad?.responsive_search_ad?.headlines?.map((h: any) => h.text).slice(0, 2) || [];

        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Validate and warn
        if (status === 'ENABLED' && approvalStatus !== 'APPROVED') {
          warnings.push(`Ad approval status is ${approvalStatus} - ad may not serve even if enabled`);
        }

        if (status === 'REMOVED') {
          warnings.push('This action is PERMANENT - ad cannot be re-enabled after removal');
          recommendations.push('Consider PAUSED status instead if you might want to re-enable later');
        }

        if (currentStatus === status) {
          warnings.push(`Ad is already ${status} - this operation will have no effect`);
        }

        if (status === 'ENABLED') {
          recommendations.push('Monitor performance closely after enabling');
          recommendations.push('Consider A/B testing with variations');
        }

        const previewText = `📋 AD STATUS UPDATE PREVIEW (Step 5/5)

**Ad Details:**
   • Ad ID: ${adId}
   • Ad Group ID: ${adGroupId}
   • Headlines: ${headlines.join(' | ')}
   • Approval: ${approvalStatus}

**STATUS CHANGE:**
   • Current Status: ${currentStatus}
   • New Status: ${status}
   ${currentStatus !== status ? `• Action: ${currentStatus} → ${status}` : '• No change'}

${warnings.length > 0 ? `\n⚠️ **WARNINGS:**\n${warnings.map(w => `   • ${w}`).join('\n')}\n` : ''}
${recommendations.length > 0 ? `\n💡 **RECOMMENDATIONS:**\n${recommendations.map(r => `   • ${r}`).join('\n')}\n` : ''}

✅ **Ready to update this ad status?**

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
            adGroupId,
            adId,
            currentStatus,
            newStatus: status,
            approvalStatus,
          },
          requiresApproval: true,
          confirmationToken: Math.random().toString(36).substring(7),
          success: true,
        };
      }

      // ═══ STEP 6: EXECUTE STATUS UPDATE ═══
      logger.info('Updating ad status', { customerId, adGroupId, adId, status });

      const customer = client.getCustomer(customerId);

      // Fetch current status for comparison
      const beforeUpdate = await customer.query(`
        SELECT ad_group_ad.status
        FROM ad_group_ad
        WHERE ad_group.id = ${adGroupId} AND ad_group_ad.ad.id = ${adId}
        LIMIT 1
      `);
      const oldStatus = beforeUpdate[0]?.ad_group_ad?.status || 'UNKNOWN';

      // Build update operation
      const adGroupAdResourceName = `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`;

      const updateOperation: any = {
        update: {
          resource_name: adGroupAdResourceName,
          status,
        },
        update_mask: { paths: ['status'] },
      };

      await customer.adGroupAds.update([updateOperation]);

      // AUDIT: Log successful ad update
      await audit.logWriteOperation('user', 'update_ad', customerId, {
        adGroupId,
        adId,
        oldStatus,
        newStatus: status,
      });

      const successText = formatSuccessSummary({
        title: 'AD STATUS UPDATED SUCCESSFULLY',
        operation: 'Ad status modification',
        details: {
          'Ad ID': adId,
          'Ad Group ID': adGroupId,
          'Previous Status': oldStatus,
          'New Status': status,
        },
        auditId: `ad_update_${adId}`,
        nextSteps:
          status === 'ENABLED'
            ? [
                'Monitor performance in Google Ads interface',
                'Check if ad is actually serving (approval required)',
                'Review ad metrics: use list_ads',
                'Compare with other ad variations',
              ]
            : status === 'PAUSED'
            ? [
                'Ad will stop serving immediately',
                'Review why ad was paused (performance, testing, etc.)',
                'Re-enable when ready: call update_ad with status=ENABLED',
              ]
            : [
                'Ad has been permanently removed',
                'Create new ad if needed: use create_ad',
                'Review remaining ads: use list_ads',
              ],
        warnings:
          status === 'REMOVED'
            ? ['Ad cannot be re-enabled after removal']
            : status === 'ENABLED'
            ? ['Ad must be approved by Google before it will serve']
            : [],
      });

      return injectGuidance(
        {
          success: true,
          customerId,
          adGroupId,
          adId,
          oldStatus,
          newStatus: status,
        },
        successText
      );

    } catch (error) {
      logger.error('Failed to update ad', error as Error);

      // AUDIT: Log failed ad update
      await audit.logFailedOperation('user', 'update_ad', input.customerId, (error as Error).message, {
        adGroupId: input.adGroupId,
        adId: input.adId,
        status: input.status,
      });

      throw error;
    }
  },
};
