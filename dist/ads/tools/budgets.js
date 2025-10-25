/**
 * MCP Tools for Google Ads Budget Write Operations
 */
import { UpdateBudgetSchema, microsToAmount, amountToMicros } from '../validation.js';
import { validateBudgetChange } from '../../shared/interceptor.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
const logger = getLogger('ads.tools.budgets');
/**
 * Create budget
 */
export const createBudgetTool = {
    name: 'create_budget',
    description: `Create a new campaign budget.

💡 AGENT GUIDANCE - BUDGET CREATION:

📋 WHAT THIS DOES:
- Creates a new daily budget that can be assigned to campaigns
- Does NOT automatically assign to any campaign
- Budget won't affect spend until assigned to active campaign

💡 BEST PRACTICES - NAMING & AMOUNTS:
- Use descriptive names: "[Campaign Name] - $XX/day"
- Start conservative for new campaigns ($10-50/day typical)
- Consider account-level budget constraints
- Standard delivery recommended (vs accelerated)

🎯 TYPICAL WORKFLOW:
1. Decide daily budget amount
2. Create budget with clear name
3. Get budget ID from result
4. Assign to campaign (via create_campaign or update)

⚠️ AMOUNT FORMAT:
- Provide amount in dollars (will be converted to micros)
- Example: 50 = $50/day budget
- Minimum: Usually $1/day ($1,000,000 micros)

💰 BUDGET PLANNING TIPS:
- Calculate based on: (Target CPA × Desired conversions/day)
- Consider search volume and competition
- Start small and scale based on performance
- Allow 2-3x target CPA for testing phase`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            name: {
                type: 'string',
                description: 'Budget name (descriptive)',
            },
            dailyAmountDollars: {
                type: 'number',
                description: 'Daily budget amount in dollars (e.g., 50 for $50/day)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'name', 'dailyAmountDollars'],
    },
    async handler(input) {
        try {
            const { customerId, name, dailyAmountDollars, confirmationToken } = input;
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
            const amountMicros = amountToMicros(dailyAmountDollars);
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_budget', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Campaign Budget',
                resourceId: 'new',
                field: 'daily_amount_micros',
                currentValue: 'N/A (new budget)',
                newValue: `$${dailyAmountDollars.toFixed(2)}/day`,
                changeType: 'create',
            });
            dryRunBuilder.setFinancialImpact({
                estimatedNewDailySpend: dailyAmountDollars,
                monthlyDifference: dailyAmountDollars * 30.4,
            });
            // Add recommendations
            if (dailyAmountDollars > 100) {
                dryRunBuilder.addRecommendation('This is a relatively high daily budget for a new budget. Consider starting lower and scaling up.');
            }
            dryRunBuilder.addRecommendation('This budget will not affect spend until assigned to an active campaign');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_budget', 'Google Ads', customerId, { name, dailyAmountDollars });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Budget creation requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Creating budget with confirmation', { customerId, name, dailyAmountDollars });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                return await client.createBudget(customerId, name, amountMicros);
            });
            return {
                success: true,
                data: {
                    customerId,
                    budgetId: result,
                    name,
                    dailyAmount: microsToAmount(amountMicros),
                    monthlyEstimate: microsToAmount(amountMicros * 30.4),
                    message: `✅ Budget "${name}" created successfully with ${microsToAmount(amountMicros)}/day`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create budget', error);
            throw error;
        }
    },
};
/**
 * Update budget
 */
export const updateBudgetTool = {
    name: 'update_budget',
    description: `Modify an existing campaign budget amount.

🚨 CRITICAL OPERATION - THIS AFFECTS SPEND:

⚠️ IMMEDIATE IMPACT:
- Changes take effect IMMEDIATELY
- Increasing budget = potential for more daily spend
- Decreasing budget = may pause delivery if already spent more today
- Affects all campaigns using this budget

💰 SPEND IMPACT CALCULATION:

Before calling this tool, you MUST:
1. Call list_budgets to get current amount
2. Calculate the difference
3. Show user the spend impact:
   - Current: $X/day
   - New: $Y/day
   - Daily difference: +/- $Z
   - Monthly estimate: +/- $Z × 30 = $ABC
   - Percentage change: +/- N%

🚨 HIGH-RISK SCENARIOS:

**Budget Increase >20%:**
- Flag as high-risk change
- Require explicit user confirmation
- Recommend gradual increases (10-15% at a time)
- Allow algorithm to optimize before next increase

**Budget Decrease:**
- Check if campaign already spent more than new budget today
- May cause immediate ad pause if over new limit
- Warn user about potential delivery disruption
- Consider pausing campaign first, then adjusting budget

📊 RECOMMENDED WORKFLOW:

**For Increases:**
1. Get current budget and performance
2. Calculate target budget based on goals
3. If increase >20%, recommend smaller step
4. Show spend impact clearly
5. Get user approval with dollar amounts
6. Execute change
7. Monitor for 48 hours

**For Decreases:**
1. Get current spend today
2. Check if new budget < today's spend (will pause delivery)
3. Warn user about delivery impact
4. Get confirmation
5. Execute change
6. Verify delivery status

⚠️ SAFETY GUIDELINES:
- Never increase budget >50% in single change
- For >20% increases, do in 10-15% increments
- Wait 7 days between budget increases for algorithm optimization
- Always show monthly spend impact (daily × 30.4)
- Check performance justifies budget increase`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            budgetId: {
                type: 'string',
                description: 'Budget ID to modify',
            },
            newDailyAmountDollars: {
                type: 'number',
                description: 'New daily budget amount in dollars',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'budgetId', 'newDailyAmountDollars'],
    },
    async handler(input) {
        try {
            UpdateBudgetSchema.parse(input);
            const { customerId, budgetId, newDailyAmountDollars, confirmationToken } = input;
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
            const newAmountMicros = amountToMicros(newDailyAmountDollars);
            // Get current budget for comparison
            const budgets = await client.listBudgets(customerId);
            const currentBudget = budgets.find((b) => b.campaign_budget.id === budgetId);
            const currentAmountMicros = currentBudget?.campaign_budget?.amount_micros || 0;
            // SAFETY: Validate budget change against limits (500% max)
            const validation = await validateBudgetChange(currentAmountMicros, newAmountMicros);
            const currentAmount = currentAmountMicros / 1000000;
            const difference = newDailyAmountDollars - currentAmount;
            const percentChange = validation.percentChange.toFixed(1);
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('update_budget', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Campaign Budget',
                resourceId: budgetId,
                field: 'daily_amount_micros',
                currentValue: `$${currentAmount.toFixed(2)}/day`,
                newValue: `$${newDailyAmountDollars.toFixed(2)}/day`,
                changeType: 'update',
            });
            dryRunBuilder.setFinancialImpact({
                currentDailySpend: currentAmount,
                estimatedNewDailySpend: newDailyAmountDollars,
                dailyDifference: difference,
                monthlyDifference: difference * 30.4,
                percentageChange: parseFloat(percentChange),
            });
            // Add risks if significant change
            if (Math.abs(parseFloat(percentChange)) > 100) {
                dryRunBuilder.addRisk(`Large budget change (${percentChange}%) may cause delivery fluctuations`);
            }
            if (difference < 0) {
                dryRunBuilder.addRisk('Decreasing budget may pause ad delivery if already spent more than new limit today');
            }
            // Add recommendations
            if (Math.abs(parseFloat(percentChange)) > 20) {
                dryRunBuilder.addRecommendation('Consider making budget changes in smaller increments (10-15% at a time)');
                dryRunBuilder.addRecommendation('Wait 7 days between budget increases to allow algorithm to optimize');
            }
            // Add warnings to dry-run
            validation.warnings.forEach((warning) => {
                dryRunBuilder.addRecommendation(warning);
            });
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('update_budget', 'Google Ads', customerId, { budgetId, newDailyAmountDollars });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Budget update requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Updating budget with confirmation', {
                customerId,
                budgetId,
                newDailyAmountDollars,
                percentChange: `${percentChange}%`,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                return await client.updateBudget(customerId, budgetId, newAmountMicros);
            });
            return {
                success: true,
                data: {
                    customerId,
                    budgetId,
                    previousAmount: microsToAmount(currentAmountMicros),
                    newAmount: microsToAmount(newAmountMicros),
                    dailyDifference: microsToAmount(Math.abs(difference * 1000000)),
                    monthlyImpact: microsToAmount(Math.abs(difference * 30.4 * 1000000)),
                    percentageChange: `${difference > 0 ? '+' : ''}${percentChange}%`,
                    result,
                    message: `✅ Budget updated from ${microsToAmount(currentAmountMicros)}/day to ${microsToAmount(newAmountMicros)}/day`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to update budget', error);
            throw error;
        }
    },
};
//# sourceMappingURL=budgets.js.map