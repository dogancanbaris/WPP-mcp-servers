/**
 * List Budgets Tool
 *
 * MCP tool for listing all campaign budgets.
 */
import { microsToAmount, extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps } from '../../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.reporting.list-budgets');
/**
 * List budgets
 */
export const listBudgetsTool = {
    name: 'list_budgets',
    description: 'List all campaign budgets in a Google Ads account.',
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
            // ═══ ACCOUNT DISCOVERY ═══
            if (!customerId) {
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/1',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account\'s budgets would you like to view?',
                    nextParam: 'customerId',
                    emoji: '💰',
                });
            }
            // ═══ EXECUTE WITH ANALYSIS ═══
            logger.info('Listing budgets', { customerId });
            const budgets = await client.listBudgets(customerId);
            // Process to show dollar amounts
            const processed = budgets.map((b) => ({
                ...b,
                dailyAmount: b.campaign_budget?.amount_micros
                    ? microsToAmount(b.campaign_budget.amount_micros)
                    : '$0.00',
                recommendedAmount: b.campaign_budget?.recommended_budget_amount_micros
                    ? microsToAmount(b.campaign_budget.recommended_budget_amount_micros)
                    : null,
            }));
            // Calculate total daily spend
            const totalDaily = processed.reduce((sum, b) => {
                const amount = parseFloat(b.dailyAmount.replace('$', '').replace(',', ''));
                return sum + amount;
            }, 0);
            // Find budgets with recommendations
            const withRecommendations = processed.filter(b => b.recommendedAmount);
            const guidanceText = `💰 BUDGET OVERVIEW - ACCOUNT ${customerId}

**Total Budgets:** ${processed.length}
**Total Daily Spend:** $${totalDaily.toFixed(2)}
**Monthly Estimate:** $${(totalDaily * 30.4).toFixed(2)}

${withRecommendations.length > 0 ? `⚠️ **Google Recommends ${withRecommendations.length} Budget Increase(s)**\n` : ''}

**BUDGET LIST:**
${processed.map((b, i) => {
                const budget = b.campaign_budget;
                return `${i + 1}. ${budget?.name || 'Unnamed Budget'}
   ID: ${budget?.id}
   Daily: ${b.dailyAmount}${b.recommendedAmount ? `\n   ⚠️ Recommended: ${b.recommendedAmount}` : ''}
   Delivery: ${budget?.delivery_method || 'N/A'}`;
            }).join('\n\n')}

💡 WHAT YOU CAN DO WITH THESE BUDGETS:

**Budget Management:**
- Increase budget: use update_budget (affects spend immediately!)
- Create new budget: use create_budget
- View campaign performance: use get_campaign_performance

**Analysis:**
- Check if budgets are limiting performance
- Review recommended increases (if any)
- Analyze spend distribution across campaigns

${formatNextSteps([
                withRecommendations.length > 0 ? 'Review recommended increases: consider budget adjustments' : 'Monitor performance: call get_campaign_performance',
                'Adjust budget: use update_budget with budgetId and new amount',
                'View campaigns: call list_campaigns to see which campaigns use these budgets'
            ])}

⚠️ IMPORTANT: Budget changes affect spend immediately. Always review current performance before increasing.`;
            return injectGuidance({
                customerId,
                budgets: processed,
                count: processed.length,
                totalDailySpend: totalDaily,
                monthlyEstimate: totalDaily * 30.4,
                hasRecommendations: withRecommendations.length > 0,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list budgets', error);
            throw error;
        }
    },
};
//# sourceMappingURL=list-budgets.tool.js.map