/**
 * MCP Tools for Google Ads Campaign Write Operations
 */

import { UpdateCampaignStatusSchema } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';

const logger = getLogger('ads.tools.campaigns');

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
    type: 'object' as const,
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
  async handler(input: any) {
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
      const campaign = campaigns.find((c: any) => c.campaign.id === campaignId);
      const currentStatus = campaign?.campaign?.status || 'UNKNOWN';
      const campaignName = campaign?.campaign?.name || campaignId;

      // Build dry-run preview
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'update_campaign_status',
        'Google Ads',
        customerId
      );

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
        dryRunBuilder.addRisk(
          'Campaign will start spending budget immediately once enabled'
        );
        if (currentStatus === 'PAUSED') {
          dryRunBuilder.addRecommendation(
            'Verify budget and ads are configured correctly before enabling'
          );
        }
      }

      if (status === 'PAUSED') {
        dryRunBuilder.addRisk(
          'All ad delivery will stop immediately - no traffic or conversions'
        );
        dryRunBuilder.addRecommendation(
          'Check if this is the only active campaign to avoid complete traffic loss'
        );
      }

      if (status === 'REMOVED') {
        dryRunBuilder.addRisk(
          'Campaign will be soft-deleted and can be recovered within 30 days'
        );
        dryRunBuilder.addRecommendation(
          'Consider pausing instead of removing for temporary deactivation'
        );
      }

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'update_campaign_status',
          'Google Ads',
          customerId,
          { campaignId, status }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Campaign status change requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Updating campaign status with confirmation', { customerId, campaignId, status });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          return await client.updateCampaignStatus(customerId, campaignId, status);
        }
      );

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
    } catch (error) {
      logger.error('Failed to update campaign status', error as Error);
      throw error;
    }
  },
};

/**
 * Create campaign
 */
export const createCampaignTool = {
  name: 'create_campaign',
  description: `Create a new Google Ads campaign.

💡 AGENT GUIDANCE - CAMPAIGN CREATION:

⚠️ PREREQUISITES - CHECK THESE FIRST:
1. Budget must exist (call list_budgets or create_budget first)
2. Know the campaign type you want to create
3. Have clear campaign objective and targeting in mind
4. User has approved campaign creation

📋 REQUIRED INFORMATION:
- Campaign name (descriptive, unique)
- Campaign type (SEARCH, DISPLAY, PERFORMANCE_MAX, etc.)
- Budget ID (must exist already)
- Targeting parameters (will be set after creation)

💡 BEST PRACTICES - CAMPAIGN SETUP:
- Start campaigns in PAUSED status (default)
- Use clear naming: "[Client] - [Type] - [Purpose] - [Date]"
- Set end date for test campaigns
- Review all settings before enabling
- Small budget initially for testing

🎯 TYPICAL WORKFLOW:
1. Create budget first (or identify existing budget)
2. Create campaign in PAUSED status
3. Add ad groups (separate API call)
4. Add keywords (separate API call)
5. Create ads (separate API call)
6. Review everything
7. Enable campaign when ready

⚠️ COMMON MISTAKES TO AVOID:
- Creating campaign without budget → Will fail
- Enabling immediately without ads/keywords → Wastes money
- Vague campaign names → Hard to manage later
- Not setting end date for tests → Runs indefinitely

📊 CAMPAIGN TYPES:
- SEARCH → Text ads on Google Search
- DISPLAY → Banner/image ads on Display Network
- PERFORMANCE_MAX → Automated cross-channel
- SHOPPING → Product listing ads
- VIDEO → YouTube ads
- DEMAND_GEN → Demand generation campaigns`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      name: {
        type: 'string',
        description: 'Campaign name',
      },
      budgetId: {
        type: 'string',
        description: 'Budget ID to assign (must exist)',
      },
      campaignType: {
        type: 'string',
        enum: ['SEARCH', 'DISPLAY', 'SHOPPING', 'VIDEO', 'PERFORMANCE_MAX', 'DEMAND_GEN'],
        description: 'Type of campaign to create',
      },
      status: {
        type: 'string',
        enum: ['PAUSED', 'ENABLED'],
        description: 'Initial status (default: PAUSED - recommended)',
      },
    },
    required: ['customerId', 'name', 'budgetId', 'campaignType'],
  },
  async handler(input: any) {
    try {
      const { customerId, name, budgetId, campaignType, status } = input;

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

      logger.info('Creating campaign', { customerId, name, campaignType });

      const result = await client.createCampaign(customerId, name, budgetId, campaignType, status || 'PAUSED');

      return {
        success: true,
        data: {
          customerId,
          campaignId: result,
          name,
          campaignType,
          status: status || 'PAUSED',
          message: `Campaign "${name}" created successfully in ${status || 'PAUSED'} status`,
        },
        warning: [
          status === 'ENABLED'
            ? '⚠️ Campaign created in ENABLED status - will start spending immediately if ads and keywords are added'
            : 'ℹ️ Campaign created in PAUSED status - add ads and keywords, then enable when ready',
        ],
      };
    } catch (error) {
      logger.error('Failed to create campaign', error as Error);
      throw error;
    }
  },
};
