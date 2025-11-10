/**
 * Update Campaign Tool
 *
 * MCP tool for updating existing Google Ads campaign settings.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { ApprovalEnforcer } from '../../../shared/approval-enforcer.js';
const logger = getLogger('ads.tools.campaigns.update');
const audit = getAuditLogger();
const approvalEnforcer = new ApprovalEnforcer();
/**
 * Update campaign settings
 */
export const updateCampaignTool = {
    name: 'update_campaign',
    description: `Update settings for an existing Google Ads campaign.

💡 AGENT GUIDANCE - CAMPAIGN UPDATES:

⚠️ WHAT CAN BE UPDATED:
- Campaign name
- Campaign budget (reassign to different budget)
- Network settings (which networks to target)
- Start/end dates
- Tracking URLs (tracking template, final URL suffix)

⚠️ WHAT CANNOT BE UPDATED (API Limitations):
- Campaign type (SEARCH, DISPLAY, etc.) - cannot be changed
- Bidding strategy type - use separate update_bidding_strategy tool

💡 BEST PRACTICES:
- Use update_campaign_status to pause/enable campaigns
- Review current settings before making changes
- Test changes in paused campaigns first
- Document why changes were made

🎯 TYPICAL USE CASES:
- Rename campaign for better organization
- Change budget allocation
- Adjust network targeting
- Extend/shorten campaign dates
- Update tracking parameters`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to update',
            },
            // Fields that can be updated
            name: {
                type: 'string',
                description: 'New campaign name (optional)',
            },
            budgetId: {
                type: 'string',
                description: 'New budget ID to assign (optional)',
            },
            targetGoogleSearch: {
                type: 'boolean',
                description: 'Target Google Search (optional)',
            },
            targetSearchNetwork: {
                type: 'boolean',
                description: 'Target Search Network partners (optional)',
            },
            targetContentNetwork: {
                type: 'boolean',
                description: 'Target Display/Content Network (optional)',
            },
            targetPartnerSearchNetwork: {
                type: 'boolean',
                description: 'Target partner search networks (optional)',
            },
            startDate: {
                type: 'string',
                description: 'New start date in YYYY-MM-DD format (optional)',
            },
            endDate: {
                type: 'string',
                description: 'New end date in YYYY-MM-DD format (optional, null to remove)',
            },
            trackingTemplate: {
                type: 'string',
                description: 'New tracking template (optional)',
            },
            finalUrlSuffix: {
                type: 'string',
                description: 'New final URL suffix (optional)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview',
            },
        },
        required: [], // All optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, campaignId, name, budgetId, targetGoogleSearch, targetSearchNetwork, targetContentNetwork, targetPartnerSearchNetwork, startDate, endDate, trackingTemplate, finalUrlSuffix, confirmationToken } = input;
            // Extract OAuth tokens
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
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
                    prompt: 'Which account contains the campaign you want to update?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: CAMPAIGN SELECTION ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                if (campaigns.length === 0) {
                    return injectGuidance({ customerId }, `⚠️ NO CAMPAIGNS FOUND

This account has no campaigns to update.

Create a campaign first using create_campaign.`);
                }
                return formatDiscoveryResponse({
                    step: '2/3',
                    title: 'SELECT CAMPAIGN TO UPDATE',
                    items: campaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'Unnamed'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
                    },
                    prompt: 'Which campaign do you want to update?',
                    nextParam: 'campaignId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: UPDATE FIELDS FORM ═══
            const hasUpdates = name || budgetId ||
                targetGoogleSearch !== undefined || targetSearchNetwork !== undefined ||
                targetContentNetwork !== undefined || targetPartnerSearchNetwork !== undefined ||
                startDate || endDate ||
                trackingTemplate !== undefined || finalUrlSuffix !== undefined;
            if (!hasUpdates && !confirmationToken) {
                const guidanceText = `📝 CAMPAIGN UPDATE FORM (Step 3/3)

**Selected Campaign:**
- Customer: ${customerId}
- Campaign: ${campaignId}

**What would you like to update?** (all optional):

📋 **BASIC SETTINGS:**
  name: "New campaign name"
  budgetId: "New budget ID"

📡 **NETWORK SETTINGS:**
  targetGoogleSearch: true/false
  targetSearchNetwork: true/false
  targetContentNetwork: true/false
  targetPartnerSearchNetwork: true/false

📅 **DATES:**
  startDate: "YYYY-MM-DD"
  endDate: "YYYY-MM-DD" (or null to remove end date)

📊 **TRACKING:**
  trackingTemplate: "https://..."
  finalUrlSuffix: "utm_campaign=..."

💡 **EXAMPLE:**
{
  name: "Updated Campaign Name",
  endDate: "2025-12-31",
  finalUrlSuffix: "utm_campaign=updated"
}

Provide the fields you want to update.`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // ═══ APPROVAL & EXECUTION ═══
            const updateOperation = async () => {
                const customer = client.getCustomer(customerId);
                // Build update object
                const updates = {
                    resource_name: `customers/${customerId}/campaigns/${campaignId}`
                };
                let changeCount = 0;
                if (name) {
                    updates.name = name;
                    changeCount++;
                }
                if (budgetId) {
                    updates.campaign_budget = `customers/${customerId}/campaignBudgets/${budgetId}`;
                    changeCount++;
                }
                // Network settings
                if (targetGoogleSearch !== undefined || targetSearchNetwork !== undefined ||
                    targetContentNetwork !== undefined || targetPartnerSearchNetwork !== undefined) {
                    updates.network_settings = {};
                    if (targetGoogleSearch !== undefined)
                        updates.network_settings.target_google_search = targetGoogleSearch;
                    if (targetSearchNetwork !== undefined)
                        updates.network_settings.target_search_network = targetSearchNetwork;
                    if (targetContentNetwork !== undefined)
                        updates.network_settings.target_content_network = targetContentNetwork;
                    if (targetPartnerSearchNetwork !== undefined)
                        updates.network_settings.target_partner_search_network = targetPartnerSearchNetwork;
                    changeCount++;
                }
                // Dates
                if (startDate) {
                    updates.start_date = startDate.replace(/-/g, '');
                    changeCount++;
                }
                if (endDate) {
                    updates.end_date = endDate === 'null' || endDate === null ? null : endDate.replace(/-/g, '');
                    changeCount++;
                }
                // Tracking
                if (trackingTemplate !== undefined) {
                    updates.tracking_url_template = trackingTemplate;
                    changeCount++;
                }
                if (finalUrlSuffix !== undefined) {
                    updates.final_url_suffix = finalUrlSuffix;
                    changeCount++;
                }
                logger.info('Updating campaign', { customerId, campaignId, changeCount });
                const result = await customer.campaigns.update([updates]);
                logger.info('Campaign updated', { customerId, campaignId, result });
                // AUDIT: Log successful update
                await audit.logWriteOperation('user', 'update_campaign', customerId, {
                    campaignId,
                    fieldsUpdated: changeCount,
                    updates: { name, budgetId, endDate, trackingTemplate, finalUrlSuffix }
                });
                const successText = `✅ CAMPAIGN UPDATED SUCCESSFULLY

**Campaign ID:** ${campaignId}
**Changes Applied:** ${changeCount}

**Updated Fields:**
${name ? `\n  • Name: ${name}` : ''}
${budgetId ? `\n  • Budget: ${budgetId}` : ''}
${endDate ? `\n  • End Date: ${endDate}` : ''}
${trackingTemplate ? `\n  • Tracking Template: ${trackingTemplate}` : ''}
${finalUrlSuffix ? `\n  • Final URL Suffix: ${finalUrlSuffix}` : ''}

Changes are now live in the campaign.`;
                return injectGuidance({ customerId, campaignId, changes: changeCount }, successText);
            };
            // Dry-run preview
            const previewText = `📋 CAMPAIGN UPDATE - REVIEW CHANGES

**Campaign:** ${campaignId}
**Account:** ${customerId}

🔄 **CHANGES** (${Object.keys(input).filter(k => input[k] !== undefined && k !== 'customerId' && k !== 'campaignId' && k !== 'confirmationToken').length}):
${name ? `\n  • Name: "${name}"` : ''}
${budgetId ? `\n  • Budget: ${budgetId}` : ''}
${targetGoogleSearch !== undefined ? `\n  • Google Search: ${targetGoogleSearch}` : ''}
${targetSearchNetwork !== undefined ? `\n  • Search Network: ${targetSearchNetwork}` : ''}
${targetContentNetwork !== undefined ? `\n  • Content Network: ${targetContentNetwork}` : ''}
${targetPartnerSearchNetwork !== undefined ? `\n  • Partner Networks: ${targetPartnerSearchNetwork}` : ''}
${startDate ? `\n  • Start Date: ${startDate}` : ''}
${endDate ? `\n  • End Date: ${endDate}` : ''}
${trackingTemplate !== undefined ? `\n  • Tracking Template: ${trackingTemplate || '(removed)'}` : ''}
${finalUrlSuffix !== undefined ? `\n  • Final URL Suffix: ${finalUrlSuffix || '(removed)'}` : ''}

⚠️ **IMPACT:**
- Changes apply immediately to the campaign
- If campaign is ENABLED, changes affect live ads
- Changing budget affects spend immediately

💡 **RECOMMENDATIONS:**
- Pause campaign before major changes
- Test in a paused campaign first
- Document reason for changes`;
            // Build changes array with proper ChangePreview structure
            const changesList = [];
            if (name)
                changesList.push({ resource: 'Campaign', resourceId: campaignId, field: 'name', currentValue: 'current', newValue: name, changeType: 'UPDATE' });
            if (budgetId)
                changesList.push({ resource: 'Campaign', resourceId: campaignId, field: 'budget', currentValue: 'current', newValue: budgetId, changeType: 'UPDATE' });
            if (targetGoogleSearch !== undefined)
                changesList.push({ resource: 'Campaign', resourceId: campaignId, field: 'targetGoogleSearch', currentValue: 'current', newValue: String(targetGoogleSearch), changeType: 'UPDATE' });
            if (startDate)
                changesList.push({ resource: 'Campaign', resourceId: campaignId, field: 'startDate', currentValue: 'current', newValue: startDate, changeType: 'UPDATE' });
            if (endDate)
                changesList.push({ resource: 'Campaign', resourceId: campaignId, field: 'endDate', currentValue: 'current', newValue: endDate, changeType: 'UPDATE' });
            const dryRun = {
                api: 'Google Ads',
                operation: 'Update Campaign',
                accountId: customerId,
                resourceId: campaignId,
                changes: changesList,
                preview: previewText,
                risks: ['Changes apply immediately to campaign'],
                recommendations: ['Pause campaign before major changes', 'Test in paused campaign first'],
            };
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const token = approvalEnforcer.createConfirmationToken(dryRun);
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun, token);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Campaign update requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            return await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, updateOperation);
        }
        catch (error) {
            logger.error('Failed to update campaign', error);
            await audit.logFailedOperation('user', 'update_campaign', input.customerId, error.message, {
                campaignId: input.campaignId,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=update-campaign.tool.js.map