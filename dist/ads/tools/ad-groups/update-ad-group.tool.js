/**
 * Update Ad Group Tool
 *
 * MCP tool for updating ad group settings in Google Ads.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId, microsToAmount } from '../../validation.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';
const logger = getLogger('ads.tools.ad-groups.update');
const audit = getAuditLogger();
/**
 * Update ad group
 */
export const updateAdGroupTool = {
    name: 'update_ad_group',
    description: `Update an existing ad group (name, status, or CPC bid).

🚨 CRITICAL OPERATION - THIS AFFECTS PERFORMANCE:

⚠️ IMMEDIATE IMPACT:
- Status changes take effect IMMEDIATELY
- Pausing ad group = stops all ads in this group
- Enabling ad group = resumes ad serving
- CPC bid changes = affects ad auction immediately
- Name changes = affects reporting organization only

💰 WHAT YOU CAN UPDATE:

**1. Ad Group Name:**
- Safe operation, only affects reporting
- Does not impact performance or spend
- Best practice: Keep naming consistent

**2. Ad Group Status:**
- PAUSED → ENABLED: Resumes ad serving immediately
- ENABLED → PAUSED: Stops ads immediately
- ENABLED → REMOVED: Permanent deletion (cannot undo)

**3. CPC Bid:**
- Increase = higher ad positions, more spend potential
- Decrease = lower positions, less spend
- Affects all keywords without keyword-level bids
- Changes take effect in next auction

🚨 HIGH-RISK SCENARIOS:

**Status Changes:**
- ENABLED → PAUSED during peak hours = lost conversions
- PAUSED → ENABLED without checking ads/keywords = wasted spend
- Any → REMOVED = permanent, cannot undo

**CPC Bid Changes >50%:**
- Flag as high-risk change
- May cause delivery fluctuations
- Algorithm needs time to adjust (3-7 days)
- Recommend gradual changes (10-20% at a time)

📊 RECOMMENDED WORKFLOW:

**For Status Changes:**
1. Check current performance (impressions, spend today)
2. Verify ads and keywords are ready (if enabling)
3. Get user confirmation
4. Execute change
5. Monitor for 1-2 hours after change

**For CPC Bid Changes:**
1. Get current bid and performance
2. Calculate impact (bid change × expected clicks)
3. If change >50%, recommend smaller step
4. Show spend impact clearly
5. Get user approval
6. Execute change
7. Monitor for 24-48 hours

⚠️ SAFETY GUIDELINES:
- Never change status to REMOVED without explicit confirmation
- For CPC increases >50%, do in 10-20% increments
- Check ad group has active ads before enabling
- Always show impact preview before executing`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID (to help find the ad group)',
            },
            adGroupId: {
                type: 'string',
                description: 'Ad group ID to update',
            },
            name: {
                type: 'string',
                description: 'New ad group name (optional)',
            },
            status: {
                type: 'string',
                enum: ['PAUSED', 'ENABLED', 'REMOVED'],
                description: 'New status (optional)',
            },
            cpcBidMicros: {
                type: 'number',
                description: 'New CPC bid in micros (optional)',
            },
            // NEW: Match create_ad_group parameters
            type: {
                type: 'string',
                enum: ['SEARCH_STANDARD', 'SEARCH_DYNAMIC_ADS', 'DISPLAY_STANDARD', 'SHOPPING_PRODUCT_ADS', 'VIDEO_TRUE_VIEW_IN_STREAM', 'HOTEL_ADS'],
                description: 'Ad group type (optional)',
            },
            trackingUrlTemplate: {
                type: 'string',
                description: 'Tracking URL template (optional)',
            },
            urlCustomParameters: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        key: { type: 'string' },
                        value: { type: 'string' },
                    },
                },
                description: 'Custom URL parameters for tracking (optional)',
            },
            adRotationMode: {
                type: 'string',
                enum: ['OPTIMIZE', 'ROTATE_INDEFINITELY', 'OPTIMIZE_FOR_CONVERSIONS'],
                description: 'Ad rotation mode (optional)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, campaignId, adGroupId, name, status, cpcBidMicros, type, trackingUrlTemplate, urlCustomParameters, adRotationMode, confirmationToken } = input;
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
                    step: '1/5',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: '🚨 CRITICAL: Which account\'s ad group do you want to modify?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                return formatDiscoveryResponse({
                    step: '2/5',
                    title: 'SELECT CAMPAIGN',
                    items: campaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'Unnamed Campaign'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}`;
                    },
                    prompt: 'Which campaign contains the ad group you want to modify?',
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
            campaign.name
          FROM ad_group
          WHERE campaign.id = ${campaignId}
          ORDER BY ad_group.name
        `);
                if (adGroups.length === 0) {
                    const guidanceText = `⚠️ NO AD GROUPS FOUND (Step 3/5)

This campaign has no ad groups. Create an ad group first.

**Next Steps:**
1. Use create_ad_group tool to create an ad group
2. Then return here to modify it if needed`;
                    return injectGuidance({ customerId, campaignId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '3/5',
                    title: 'SELECT AD GROUP TO MODIFY',
                    items: adGroups,
                    itemFormatter: (ag, i) => {
                        const adGroup = ag.ad_group;
                        const cpcBid = adGroup?.cpc_bid_micros ? microsToAmount(adGroup.cpc_bid_micros) : 'Campaign default';
                        return `${i + 1}. ${adGroup?.name || 'Unnamed Ad Group'}
   ID: ${adGroup?.id}
   Status: ${adGroup?.status}
   CPC Bid: ${cpcBid}`;
                    },
                    prompt: '💰 Which ad group do you want to modify?',
                    nextParam: 'adGroupId',
                    context: { customerId, campaignId },
                });
            }
            // ═══ STEP 4: MODIFICATION SPECIFICATION ═══
            if (!name && !status && cpcBidMicros === undefined && !type && !trackingUrlTemplate && !urlCustomParameters && !adRotationMode) {
                const customer = client.getCustomer(customerId);
                const adGroups = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.cpc_bid_micros
          FROM ad_group
          WHERE ad_group.id = ${adGroupId}
        `);
                const currentAdGroup = adGroups[0]?.ad_group;
                const currentCpcBid = currentAdGroup?.cpc_bid_micros
                    ? microsToAmount(currentAdGroup.cpc_bid_micros)
                    : 'Campaign default';
                const guidanceText = `📊 SPECIFY MODIFICATIONS (Step 4/5)

**Current Ad Group:** ${currentAdGroup?.name || adGroupId}
**Current Status:** ${currentAdGroup?.status || 'UNKNOWN'}
**Current CPC Bid:** ${currentCpcBid}

🚨 **CRITICAL OPERATION WARNING:**
- Changes take effect IMMEDIATELY
- Status changes affect ad serving instantly
- CPC bid changes affect ad auctions immediately

💡 **WHAT TO CHANGE:**

Provide one or more of:

1. **name** - New ad group name
   - Example: "Running Shoes - Exact Match"
   - Safe operation, only affects reporting

2. **status** - New status (PAUSED, ENABLED, or REMOVED)
   - PAUSED = Stop serving ads
   - ENABLED = Resume serving ads
   - REMOVED = Permanently delete (CANNOT UNDO)

3. **cpcBidMicros** - New CPC bid in micros
   - Current: ${currentCpcBid}
   - Example: 1500000 for $1.50 CPC
   - Affects all keywords without keyword-level bids

⚠️ **SAFETY GUIDELINES:**
- For status REMOVED, you'll get extra confirmation
- For CPC changes >50%, recommended to do smaller increments
- Always check performance before major changes

What would you like to change?`;
                return injectGuidance({ customerId, campaignId, adGroupId, currentAdGroup }, guidanceText);
            }
            // ═══ STEP 5: DRY-RUN PREVIEW ═══
            const customer = client.getCustomer(customerId);
            const adGroups = await customer.query(`
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.status,
          ad_group.cpc_bid_micros
        FROM ad_group
        WHERE ad_group.id = ${adGroupId}
      `);
            const currentAdGroup = adGroups[0]?.ad_group;
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('update_ad_group', 'Google Ads', customerId);
            // Build change list
            if (name && name !== currentAdGroup?.name) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: adGroupId,
                    field: 'name',
                    currentValue: currentAdGroup?.name || 'Unknown',
                    newValue: name,
                    changeType: 'update',
                });
            }
            if (status && status !== currentAdGroup?.status) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: adGroupId,
                    field: 'status',
                    currentValue: currentAdGroup?.status || 'Unknown',
                    newValue: status,
                    changeType: 'update',
                });
                // Add risks for status changes
                if (status === 'REMOVED') {
                    dryRunBuilder.addRisk('🚨 PERMANENT DELETION: This ad group will be permanently removed and cannot be restored');
                }
                else if (status === 'ENABLED' && currentAdGroup?.status === 'PAUSED') {
                    dryRunBuilder.addRecommendation('⚠️ Enabling ad group will resume ad serving immediately. Ensure ads and keywords are ready.');
                }
                else if (status === 'PAUSED' && currentAdGroup?.status === 'ENABLED') {
                    dryRunBuilder.addRecommendation('⚠️ Pausing ad group will stop all ads in this group immediately');
                }
            }
            if (cpcBidMicros !== undefined && cpcBidMicros !== currentAdGroup?.cpc_bid_micros) {
                const currentBid = currentAdGroup?.cpc_bid_micros || 0;
                const newBid = cpcBidMicros;
                const currentAmount = currentBid / 1000000;
                const newAmount = newBid / 1000000;
                const difference = newAmount - currentAmount;
                const percentChange = currentBid > 0 ? ((difference / currentAmount) * 100).toFixed(1) : '0';
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: adGroupId,
                    field: 'cpc_bid_micros',
                    currentValue: currentBid > 0 ? microsToAmount(currentBid) : 'Campaign default',
                    newValue: microsToAmount(newBid),
                    changeType: 'update',
                });
                // Financial impact for CPC bid changes shown in change preview above
                // Add risks if significant change
                if (Math.abs(parseFloat(percentChange)) > 50) {
                    dryRunBuilder.addRisk(`Large CPC bid change (${percentChange}%) may cause delivery fluctuations`);
                    dryRunBuilder.addRecommendation('Consider making CPC bid changes in smaller increments (10-20% at a time)');
                }
            }
            // NEW: Add changes for missing parameters from create_ad_group
            if (type) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: adGroupId,
                    field: 'type',
                    currentValue: 'Current',
                    newValue: type,
                    changeType: 'update',
                });
            }
            if (trackingUrlTemplate) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: adGroupId,
                    field: 'tracking_url_template',
                    currentValue: 'Current',
                    newValue: trackingUrlTemplate,
                    changeType: 'update',
                });
            }
            if (urlCustomParameters && urlCustomParameters.length > 0) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: adGroupId,
                    field: 'url_custom_parameters',
                    currentValue: 'Current',
                    newValue: urlCustomParameters.map((p) => `${p.key}=${p.value}`).join(', '),
                    changeType: 'update',
                });
            }
            if (adRotationMode) {
                dryRunBuilder.addChange({
                    resource: 'Ad Group',
                    resourceId: adGroupId,
                    field: 'ad_rotation_mode',
                    currentValue: 'Current',
                    newValue: adRotationMode,
                    changeType: 'update',
                });
            }
            // Add general recommendations
            if (status !== 'REMOVED') {
                dryRunBuilder.addRecommendation('Monitor performance for 24-48 hours after making changes');
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('update_ad_group', 'Google Ads', customerId, { adGroupId, name, status, cpcBidMicros, type, trackingUrlTemplate, urlCustomParameters, adRotationMode });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Ad group update requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // ═══ STEP 6: EXECUTE UPDATE ═══
            logger.info('Updating ad group with confirmation', {
                customerId,
                adGroupId,
                name,
                status,
                cpcBidMicros,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const updateOperation = {
                    resource_name: `customers/${customerId}/adGroups/${adGroupId}`,
                };
                if (name) {
                    updateOperation.name = name;
                }
                if (status) {
                    updateOperation.status = status;
                }
                if (cpcBidMicros !== undefined) {
                    updateOperation.cpc_bid_micros = cpcBidMicros;
                }
                // NEW: Add missing parameters from create_ad_group
                if (type) {
                    updateOperation.type = type;
                }
                if (trackingUrlTemplate) {
                    updateOperation.tracking_url_template = trackingUrlTemplate;
                }
                if (urlCustomParameters && urlCustomParameters.length > 0) {
                    updateOperation.url_custom_parameters = urlCustomParameters.map((param) => ({
                        key: param.key,
                        value: param.value,
                    }));
                }
                if (adRotationMode) {
                    updateOperation.ad_rotation_mode = adRotationMode;
                }
                const updateResult = await customer.adGroups.update([updateOperation]);
                return updateResult;
            });
            // AUDIT: Log successful ad group update
            await audit.logWriteOperation('user', 'update_ad_group', customerId, {
                adGroupId,
                adGroupName: name || currentAdGroup?.name,
                previousStatus: currentAdGroup?.status,
                newStatus: status,
                previousCpcBid: currentAdGroup?.cpc_bid_micros
                    ? microsToAmount(currentAdGroup.cpc_bid_micros)
                    : 'Campaign default',
                newCpcBid: cpcBidMicros ? microsToAmount(cpcBidMicros) : undefined,
            });
            return {
                success: true,
                data: {
                    customerId,
                    campaignId,
                    adGroupId,
                    name: name || currentAdGroup?.name,
                    status: status || currentAdGroup?.status,
                    cpcBid: cpcBidMicros ? microsToAmount(cpcBidMicros) : undefined,
                    result,
                    message: `✅ Ad group updated successfully`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to update ad group', error);
            // AUDIT: Log failed ad group update
            await audit.logFailedOperation('user', 'update_ad_group', input.customerId, error.message, {
                adGroupId: input.adGroupId,
                attemptedChanges: {
                    name: input.name,
                    status: input.status,
                    cpcBidMicros: input.cpcBidMicros,
                },
            });
            throw error;
        }
    },
};
//# sourceMappingURL=update-ad-group.tool.js.map