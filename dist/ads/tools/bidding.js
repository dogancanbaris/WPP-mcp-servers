/**
 * MCP Tools for Google Ads Bidding Strategies
 * Includes: BiddingStrategyService, BiddingSeasonalityAdjustmentService
 */
import { getLogger } from '../../shared/logger.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps, formatCurrency } from '../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.bidding');
/**
 * List bidding strategies
 */
export const listBiddingStrategiesTool = {
    name: 'list_bidding_strategies',
    description: 'List all portfolio bidding strategies in account.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
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
            // Account discovery
            if (!input.customerId) {
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: rn.split('/')[1],
                }));
                return formatDiscoveryResponse({
                    step: '1/2',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account would you like to list bidding strategies for?',
                    nextParam: 'customerId',
                });
            }
            const { customerId } = input;
            const customer = client.getCustomer(customerId);
            logger.info('Listing bidding strategies', { customerId });
            const query = `
        SELECT
          bidding_strategy.id,
          bidding_strategy.name,
          bidding_strategy.type,
          bidding_strategy.campaign_count,
          bidding_strategy.target_cpa.target_cpa_micros,
          bidding_strategy.target_roas.target_roas,
          bidding_strategy.status
        FROM bidding_strategy
        WHERE bidding_strategy.status != 'REMOVED'
        ORDER BY bidding_strategy.name
      `;
            const results = await customer.query(query);
            const strategies = [];
            for (const row of results) {
                const strategy = row.bidding_strategy;
                strategies.push({
                    id: String(strategy?.id || ''),
                    name: String(strategy?.name || ''),
                    type: String(strategy?.type || ''),
                    campaignCount: parseInt(String(strategy?.campaign_count || 0)),
                    targetCpa: strategy?.target_cpa?.target_cpa_micros
                        ? parseFloat(String(strategy.target_cpa.target_cpa_micros)) / 1000000
                        : undefined,
                    targetRoas: strategy?.target_roas?.target_roas
                        ? parseFloat(String(strategy.target_roas.target_roas))
                        : undefined,
                    status: String(strategy?.status || ''),
                });
            }
            // Calculate summary stats
            const byType = strategies.reduce((acc, s) => {
                acc[s.type] = (acc[s.type] || 0) + 1;
                return acc;
            }, {});
            const totalCampaigns = strategies.reduce((sum, s) => sum + s.campaignCount, 0);
            // Inject rich guidance into response
            const guidanceText = `📊 PORTFOLIO BIDDING STRATEGIES

**Account:** ${customerId}
**Total Strategies:** ${strategies.length}
**Total Campaigns Using Strategies:** ${totalCampaigns}

📋 STRATEGY BREAKDOWN:
${Object.entries(byType).map(([type, count]) => `• ${type}: ${count} strateg${count === 1 ? 'y' : 'ies'}`).join('\n')}

🎯 STRATEGIES IN THIS ACCOUNT:
${strategies.map((s, i) => `${i + 1}. ${s.name} (${s.type})
   • Status: ${s.status}
   • Used by ${s.campaignCount} campaign(s)${s.targetCpa ? `\n   • Target CPA: ${formatCurrency(s.targetCpa)}` : ''}${s.targetRoas ? `\n   • Target ROAS: ${s.targetRoas.toFixed(2)}x` : ''}`).join('\n\n')}

💡 BIDDING STRATEGY TYPES EXPLAINED:
- **Target CPA:** Optimize for conversions at target cost per acquisition
- **Target ROAS:** Optimize for conversion value at target return on ad spend
- **Maximize Conversions:** Get most conversions within budget
- **Maximize Conversion Value:** Get highest conversion value within budget
- **Manual CPC + Enhanced CPC:** Manual bidding with automated adjustments

🎯 PORTFOLIO BENEFITS:
✅ Shared across multiple campaigns (simplifies management)
✅ More data = better machine learning optimization
✅ Consistent bidding goals across related campaigns

${formatNextSteps([
                'Review campaign performance: use get_campaign_performance',
                'Adjust strategy targets: use update_bidding_strategy (if needed)',
                'Create new strategy: use create_bidding_strategy',
                'Check which campaigns use a strategy: use list_campaigns'
            ])}`;
            return injectGuidance({
                customerId,
                strategies,
                count: strategies.length,
                byType,
                totalCampaigns,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list bidding strategies', error);
            throw error;
        }
    },
};
/**
 * Export bidding tools
 */
export const biddingTools = [listBiddingStrategiesTool];
//# sourceMappingURL=bidding.js.map