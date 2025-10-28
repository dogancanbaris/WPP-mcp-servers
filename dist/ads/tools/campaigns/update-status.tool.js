/**
 * Update Campaign Status Tool
 *
 * MCP tool for pausing, enabling, or removing campaigns.
 */
import { UpdateCampaignStatusSchema } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../../shared/vagueness-detector.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
const logger = getLogger('ads.tools.campaigns.update-status');
/**
 * Update campaign status
 */
export const updateCampaignStatusTool = {
    name: 'update_campaign_status',
    description: `Pause, enable, or remove a Google Ads campaign.

🚨 CRITICAL OPERATION - READ CAREFULLY:

⚠️ IMMEDIATE IMPACT:
- PAUSED → Stops all ad delivery immediately (no more spend)
- ENABLED → Resumes ad delivery immediately (spending resumes)
- REMOVED → Soft-deletes campaign (can be recovered within 30 days)

💡 AGENT GUIDANCE - WHEN TO USE:

**Pause Campaign When:**
- Performance is poor and needs review
- Budget is exhausted for the period
- Seasonal pause needed
- Major website issues detected
- User requests to stop spending

**Enable Campaign When:**
- Ready to start new campaign
- Resuming after seasonal pause
- Issues resolved and ready to deliver
- Budget renewed

**Remove Campaign When:**
- Campaign is obsolete
- Major restructure needed
- Duplicated by mistake
- Test campaign concluded

⚠️ SAFETY CHECKS BEFORE PAUSING/REMOVING:
1. Check current performance - is it actually performing well?
2. Check if this is the only active campaign (pausing = no traffic)
3. Verify user intent - confirm they want to stop delivery
4. Check recent conversion data
5. Consider if temporary pause is better than removal

📊 RECOMMENDED WORKFLOW:
1. Call get_campaign_performance first
2. Review current status and metrics
3. Confirm user really wants status change
4. Execute status change
5. Verify change took effect
6. Monitor for next 24 hours

💡 BEST PRACTICES:
- PAUSE temporarily, don't REMOVE unless certain
- Check campaign performance before pausing good performers
- Enable gradually (start of business day preferred)
- Document reason for status changes in notes`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to modify',
            },
            status: {
                type: 'string',
                enum: ['ENABLED', 'PAUSED', 'REMOVED'],
                description: 'New status for the campaign',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'campaignId', 'status'],
    },
    async handler(input) {
        try {
            UpdateCampaignStatusSchema.parse(input);
            const { customerId, campaignId, status, confirmationToken } = input;
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
            // Vagueness detection - ensure campaignId is specific
            detectAndEnforceVagueness({
                operation: 'update_campaign_status',
                inputText: `update campaign ${campaignId} to ${status}`,
                inputParams: { customerId, campaignId, status },
            });
            // Get current campaign info for preview
            const campaigns = await client.listCampaigns(customerId);
            const campaign = campaigns.find((c) => c.campaign.id === campaignId);
            const currentStatus = campaign?.campaign?.status || 'UNKNOWN';
            const campaignName = campaign?.campaign?.name || campaignId;
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('update_campaign_status', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Campaign',
                resourceId: campaignId,
                field: 'status',
                currentValue: currentStatus,
                newValue: status,
                changeType: 'update',
            });
            // Add risks based on status change
            if (status === 'ENABLED') {
                dryRunBuilder.addRisk('Campaign will start spending budget immediately once enabled');
                if (currentStatus === 'PAUSED') {
                    dryRunBuilder.addRecommendation('Verify budget and ads are configured correctly before enabling');
                }
            }
            if (status === 'PAUSED') {
                dryRunBuilder.addRisk('All ad delivery will stop immediately - no traffic or conversions');
                dryRunBuilder.addRecommendation('Check if this is the only active campaign to avoid complete traffic loss');
            }
            if (status === 'REMOVED') {
                dryRunBuilder.addRisk('Campaign will be soft-deleted and can be recovered within 30 days');
                dryRunBuilder.addRecommendation('Consider pausing instead of removing for temporary deactivation');
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('update_campaign_status', 'Google Ads', customerId, { campaignId, status });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Campaign status change requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Updating campaign status with confirmation', { customerId, campaignId, status });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                return await client.updateCampaignStatus(customerId, campaignId, status);
            });
            return {
                success: true,
                data: {
                    customerId,
                    campaignId,
                    campaignName,
                    previousStatus: currentStatus,
                    newStatus: status,
                    result,
                    message: `✅ Campaign "${campaignName}" status updated from ${currentStatus} to ${status}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to update campaign status', error);
            throw error;
        }
    },
};
//# sourceMappingURL=update-status.tool.js.map