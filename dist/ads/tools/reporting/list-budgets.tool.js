/**
 * List Budgets Tool
 *
 * MCP tool for listing all campaign budgets.
 */
import { microsToAmount } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
const logger = getLogger('ads.tools.reporting.list-budgets');
/**
 * List budgets
 */
export const listBudgetsTool = {
    name: 'list_budgets',
    description: `List all campaign budgets in a Google Ads account.

💡 AGENT GUIDANCE - BUDGET MONITORING:
- Shows all budgets with current spend and limits
- Critical to check before any budget modifications
- Use to understand budget allocation across campaigns

📊 WHAT YOU'LL GET:
- Budget ID and name
- Daily amount (in account currency)
- Delivery method (Standard vs Accelerated)
- Status
- Google's recommended budget (if available)

🎯 USE CASES:
- "What are my daily budgets?"
- "Which budgets are being recommended for increases?"
- "How are budgets allocated across campaigns?"

⚠️ BEFORE MODIFYING BUDGETS:
- Always call this first to see current state
- Check recommended budget amounts
- Understand current allocation`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
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
            return {
                success: true,
                data: {
                    customerId,
                    budgets: processed,
                    count: processed.length,
                    message: `Found ${processed.length} budget(s) in account ${customerId}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to list budgets', error);
            throw error;
        }
    },
};
//# sourceMappingURL=list-budgets.tool.js.map