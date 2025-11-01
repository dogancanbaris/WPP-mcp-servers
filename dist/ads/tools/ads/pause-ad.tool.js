/**
 * Pause Ad Tool
 *
 * Quick wrapper around update_ad for the common operation of pausing/enabling ads.
 * Provides simplified workflow focused on status changes only.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, formatSuccessSummary, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
const logger = getLogger('ads.tools.ads.pause');
const audit = getAuditLogger();
/**
 * Pause or enable an ad (quick status toggle)
 */
export const pauseAdTool = {
    name: 'pause_ad',
    description: 'Quickly pause or enable an ad in Google Ads.',
    inputSchema: {
        type: 'object',
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
                description: 'Ad ID to pause/enable',
            },
            action: {
                type: 'string',
                enum: ['pause', 'enable'],
                description: 'Action: pause or enable',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token for executing the operation',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, adGroupId, adId, action, confirmationToken } = input;
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
                    step: '1/4',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account contains the ad?',
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
            campaign.name,
            metrics.impressions
          FROM ad_group
          WHERE ad_group.status != 'REMOVED'
            AND segments.date DURING LAST_30_DAYS
          ORDER BY metrics.impressions DESC
        `);
                if (adGroups.length === 0) {
                    const guidanceText = `⚠️ NO AD GROUPS FOUND (Step 2/4)

This account has no active ad groups.

Cannot pause/enable ads without ad groups.`;
                    return injectGuidance({ customerId }, guidanceText);
                }
                // Aggregate by ad group
                const adGroupMap = new Map();
                for (const row of adGroups) {
                    const agId = row.ad_group?.id;
                    if (!agId)
                        continue;
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
                    step: '2/4',
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
            if (!adId || !action) {
                const customer = client.getCustomer(customerId);
                const ads = await customer.query(`
          SELECT
            ad_group_ad.ad.id,
            ad_group_ad.status,
            ad_group_ad.ad.responsive_search_ad.headlines,
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
                    const guidanceText = `⚠️ NO ADS FOUND (Step 3/4)

This ad group has no active ads.

**Ad Group ID:** ${adGroupId}

Create an ad first using create_ad.`;
                    return injectGuidance({ customerId, adGroupId }, guidanceText);
                }
                // Aggregate by ad
                const adMap = new Map();
                for (const row of ads) {
                    const id = row.ad_group_ad?.ad?.id;
                    if (!id)
                        continue;
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
                const guidanceText = `🔍 SELECT AD TO ${!action ? 'PAUSE/ENABLE' : action.toUpperCase()} (Step 3/4)

**Ad Group ID:** ${adGroupId}
**Total Ads:** ${uniqueAds.length}

${uniqueAds.map((adData, i) => {
                    const ad = adData.ad;
                    const rsa = ad?.ad?.responsive_search_ad;
                    const headlines = rsa?.headlines?.map((h) => h.text).slice(0, 2) || [];
                    const ctr = adData.metrics.impressions > 0
                        ? ((adData.metrics.clicks / adData.metrics.impressions) * 100).toFixed(2)
                        : '0.00';
                    const statusIndicator = ad?.status === 'ENABLED' ? '🟢' : ad?.status === 'PAUSED' ? '⏸️' : '🔴';
                    return `${i + 1}. Ad ID: ${ad?.ad?.id}
   ${statusIndicator} Status: ${ad?.status}
   Approval: ${ad?.policy_summary?.approval_status}
   Headlines: ${headlines.join(' | ')}
   Performance (30d): ${adData.metrics.impressions.toLocaleString()} impr, ${ctr}% CTR`;
                }).join('\n\n')}

💡 **What to provide:**
- **adId:** The ad ID to ${action || 'pause/enable'}
${!action ? '- **action:** Either "pause" or "enable"' : ''}`;
                return injectGuidance({
                    customerId,
                    adGroupId,
                    ads: uniqueAds,
                }, guidanceText);
            }
            // ═══ STEP 4: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                // Fetch current status
                const customer = client.getCustomer(customerId);
                const adDetails = await customer.query(`
          SELECT
            ad_group_ad.status,
            ad_group_ad.ad.responsive_search_ad.headlines,
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
                const headlines = adDetails[0].ad_group_ad?.ad?.responsive_search_ad?.headlines?.map((h) => h.text).slice(0, 3) || [];
                // Aggregate metrics
                const totalImpressions = adDetails.reduce((sum, row) => sum + (row.metrics?.impressions || 0), 0);
                const totalClicks = adDetails.reduce((sum, row) => sum + (row.metrics?.clicks || 0), 0);
                const totalCost = adDetails.reduce((sum, row) => sum + (row.metrics?.cost_micros || 0), 0);
                const newStatus = action === 'pause' ? 'PAUSED' : 'ENABLED';
                const warnings = [];
                const recommendations = [];
                // Validate and warn
                if (action === 'enable' && approvalStatus !== 'APPROVED') {
                    warnings.push(`Ad approval status is ${approvalStatus} - ad may not serve even if enabled`);
                }
                if (currentStatus === newStatus) {
                    warnings.push(`Ad is already ${newStatus} - this operation will have no effect`);
                }
                if (action === 'enable') {
                    recommendations.push('Monitor performance closely after enabling');
                    recommendations.push('Consider A/B testing with variations');
                }
                else {
                    recommendations.push('Ad will stop serving immediately');
                    recommendations.push('Re-enable anytime using action=enable');
                }
                const previewText = `📋 AD ${action.toUpperCase()} PREVIEW (Step 4/4)

**Ad Details:**
   • Ad ID: ${adId}
   • Ad Group ID: ${adGroupId}
   • Headlines: ${headlines.join(' | ')}
   • Approval: ${approvalStatus}

**STATUS CHANGE:**
   • Current Status: ${currentStatus}
   • New Status: ${newStatus}
   ${currentStatus !== newStatus ? `• Action: ${currentStatus} → ${newStatus}` : '• No change'}

**Recent Performance (Last 30 Days):**
   • Impressions: ${totalImpressions.toLocaleString()}
   • Clicks: ${totalClicks.toLocaleString()}
   • Cost: $${(totalCost / 1000000).toFixed(2)}

${warnings.length > 0 ? `\n⚠️ **WARNINGS:**\n${warnings.map(w => `   • ${w}`).join('\n')}\n` : ''}
${recommendations.length > 0 ? `\n💡 **RECOMMENDATIONS:**\n${recommendations.map(r => `   • ${r}`).join('\n')}\n` : ''}

✅ **Ready to ${action} this ad?**

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
                        newStatus,
                        action,
                        approvalStatus,
                    },
                    requiresApproval: true,
                    confirmationToken: Math.random().toString(36).substring(7),
                    success: true,
                };
            }
            // ═══ STEP 5: EXECUTE STATUS UPDATE ═══
            logger.info(`${action} ad`, { customerId, adGroupId, adId, action });
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
            const newStatus = action === 'pause' ? 'PAUSED' : 'ENABLED';
            const updateOperation = {
                update: {
                    resource_name: adGroupAdResourceName,
                    status: newStatus,
                },
                update_mask: { paths: ['status'] },
            };
            await customer.adGroupAds.update([updateOperation]);
            // AUDIT: Log successful ad update
            await audit.logWriteOperation('user', 'pause_ad', customerId, {
                adGroupId,
                adId,
                action,
                oldStatus,
                newStatus,
            });
            const successText = formatSuccessSummary({
                title: `AD ${action.toUpperCase()}D SUCCESSFULLY`,
                operation: `Ad ${action} operation`,
                details: {
                    'Ad ID': adId,
                    'Ad Group ID': adGroupId,
                    'Previous Status': oldStatus,
                    'New Status': newStatus,
                    'Action': action,
                },
                auditId: `ad_${action}_${adId}`,
                nextSteps: action === 'enable'
                    ? [
                        'Monitor performance in Google Ads interface',
                        'Check if ad is actually serving (approval required)',
                        'Review ad metrics: use list_ads',
                        'Compare with other ad variations',
                    ]
                    : [
                        'Ad will stop serving immediately',
                        'Review why ad was paused (performance, testing, etc.)',
                        'Re-enable when ready: call pause_ad with action=enable',
                    ],
                warnings: action === 'enable'
                    ? ['Ad must be approved by Google before it will serve']
                    : ['Ad will stop accruing impressions and costs'],
            });
            return injectGuidance({
                success: true,
                customerId,
                adGroupId,
                adId,
                action,
                oldStatus,
                newStatus,
            }, successText);
        }
        catch (error) {
            logger.error(`Failed to ${input.action || 'pause/enable'} ad`, error);
            // AUDIT: Log failed operation
            await audit.logFailedOperation('user', 'pause_ad', input.customerId, error.message, {
                adGroupId: input.adGroupId,
                adId: input.adId,
                action: input.action,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=pause-ad.tool.js.map