/**
 * List Campaigns Tool
 *
 * MCP tool for listing all campaigns in a Google Ads account.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
const logger = getLogger('ads.tools.reporting.list-campaigns');
/**
 * List campaigns
 */
export const listCampaignsTool = {
    name: 'list_campaigns',
    description: `List all campaigns in a Google Ads account with status and basic info.

💡 AGENT GUIDANCE:
- Use this to discover all campaigns before making any changes
- Check campaign status before modifications (ENABLED, PAUSED, REMOVED)
- Note the campaign type - different types have different capabilities

📊 WHAT YOU'LL GET:
- Campaign ID, name, status
- Campaign type (SEARCH, DISPLAY, VIDEO, PERFORMANCE_MAX, etc.)
- Budget assignment
- Bidding strategy type
- Serving status

🎯 NEXT STEPS AFTER CALLING THIS:
- Use campaign IDs in performance reporting tools
- Check campaign type before applying type-specific changes
- Verify status before attempting to modify`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits, e.g., "2191558405")',
            },
        },
        required: ['customerId'],
    },
    async handler(input) {
        try {
            const { customerId } = input;
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
            logger.info('Listing campaigns', { customerId });
            const campaigns = await client.listCampaigns(customerId);
            return {
                success: true,
                data: {
                    customerId,
                    campaigns,
                    count: campaigns.length,
                    message: `Found ${campaigns.length} campaign(s) in account ${customerId}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to list campaigns', error);
            throw error;
        }
    },
};
//# sourceMappingURL=list-campaigns.tool.js.map