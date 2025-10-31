/**
 * Create Campaign Tool
 *
 * MCP tool for creating new Google Ads campaigns.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
const logger = getLogger('ads.tools.campaigns.create');
const audit = getAuditLogger();
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
        type: 'object',
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
    async handler(input) {
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
            // AUDIT: Log successful campaign creation
            await audit.logWriteOperation('user', 'create_campaign', customerId, {
                campaignId: result,
                campaignName: name,
                campaignType,
                budgetId,
                initialStatus: status || 'PAUSED',
            });
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
        }
        catch (error) {
            logger.error('Failed to create campaign', error);
            // AUDIT: Log failed campaign creation
            await audit.logFailedOperation('user', 'create_campaign', input.customerId, error.message, {
                campaignName: input.name,
                campaignType: input.campaignType,
                budgetId: input.budgetId,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=create-campaign.tool.js.map