/**
 * MCP Tools for Google Ads Budget Write Operations
 */

import { UpdateBudgetSchema, microsToAmount, amountToMicros, extractCustomerId } from '../validation.js';
import { validateBudgetChange } from '../../shared/interceptor.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { getAuditLogger } from '../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../shared/interactive-workflow.js';

const logger = getLogger('ads.tools.budgets');
const audit = getAuditLogger();

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
    type: 'object' as const,
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
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, name, dailyAmountDollars } = input;

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
          step: '1/4',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account do you want to create a budget for?',
          nextParam: 'customerId',
          emoji: '💰',
        });
      }

      // ═══ STEP 2: BUDGET NAME GUIDANCE ═══
      if (!name) {
        const guidanceText = `💰 BUDGET NAME (Step 2/4)

Enter a descriptive budget name:

**Examples:**
- "Q1 2025 Campaign Budget"
- "Brand Campaign - $50/day"
- "Product Launch Budget"

**Best Practices:**
- Include campaign purpose or name
- Optionally include daily amount for quick reference
- Keep it descriptive and clear

What should the budget be named?`;

        return injectGuidance({ customerId }, guidanceText);
      }

      // ═══ STEP 3: AMOUNT SPECIFICATION ═══
      if (!dailyAmountDollars) {
        const guidanceText = `💵 DAILY BUDGET AMOUNT (Step 3/4)

🎓 **AGENT TRAINING - BUDGET SIZING STRATEGY:**

**THE BUDGET CALCULATION FORMULA:**
Daily Budget = Target CPA × Desired Conversions/Day × Learning Buffer

**Example Calculation:**
• Target CPA: $50 per lead
• Goal: 2 conversions/day
• Learning buffer: 2x (for testing/optimization)
• Budget: $50 × 2 × 2 = $200/day

**BUDGET BY CAMPAIGN TYPE:**

**SEARCH Campaigns:**
• Test: $20-50/day (gather initial data)
• Standard: $50-200/day (most common)
• Competitive: $200-1000/day (high-CPC industries like legal, insurance)
• Brand protection: $10-30/day (usually low CPC)

**SHOPPING Campaigns:**
• Minimum: $50/day (need volume for product algorithms)
• Standard: $100-500/day
• Aggressive: $500+/day
⚠️ Lower budgets don't work well (insufficient data for optimization)

**PERFORMANCE_MAX:**
• Minimum: $50/day (automation needs budget flexibility)
• Recommended: $100-300/day
• Needs: 6-week learning period with consistent budget

**DISPLAY/VIDEO:**
• Minimum: $30/day (CPM-based, need impressions)
• Standard: $100-300/day
• Brand campaigns: $500+/day for reach

**AGENT BUDGET CHECKLIST - HELP USER DECIDE:**
□ What's the campaign type? (different minimums!)
□ What's target CPA or ROAS? (calculate from there)
□ How competitive is the industry? (legal = high, local service = medium)
□ Is this testing or scaling? (testing = lower, scaling = higher)
□ What's monthly budget limit? (daily = monthly ÷ 30.4)

**COMMON MISTAKES TO FLAG:**
❌ "$5/day for Shopping campaign" → Agent: "Shopping needs $50+/day minimum for algorithms to work. Increase to $50 or use Search?"
❌ "$500/day for brand term test" → Agent: "Brand terms typically have low CPC ($1-5). $500/day might be excessive. Start with $30-50?"
❌ "$20/day for 'insurance lawyer' keywords" → Agent: "This industry has $50-150 CPC. $20/day = less than 1 click/day! Need $200+ for meaningful data"

**AGENT SIZING EXAMPLES:**
✅ User: "I want 5 leads/day at $40 CPA" → Agent: "Budget: $40 × 5 × 2 (learning) = $400/day recommended. Start with $300-400"
✅ User: "Brand protection for 'My Company'" → Agent: "Brand terms usually $1-3 CPC. 10 clicks/day = $30/day recommended"
❌ User: "Make it $2/day" → Agent: "$2/day is too low for any meaningful traffic. Minimum $10 for testing, $20+ recommended"

**Budget amount in dollars:**`;

        return injectGuidance({ customerId, name }, guidanceText);
      }

      // ═══ STEP 4: EXECUTE BUDGET CREATION ═══
      // Note: CREATE operations don't need approval (budget doesn't affect spend until assigned)
      const amountMicros = amountToMicros(dailyAmountDollars);

      logger.info('Creating budget', { customerId, name, dailyAmountDollars });

      const result = await client.createBudget(customerId, name, amountMicros);

      // AUDIT: Log successful budget creation
      await audit.logWriteOperation('user', 'create_budget', customerId, {
        budgetId: result,
        budgetName: name,
        dailyAmount: dailyAmountDollars,
        monthlyEstimate: dailyAmountDollars * 30.4,
      });

      const budgetId = result.results?.[0]?.resource_name?.split('/')?.pop() || result;

      const guidanceText = `✅ BUDGET CREATED SUCCESSFULLY

**Budget Details:**
- Name: ${name}
- ID: ${budgetId}
- Daily Amount: $${dailyAmountDollars}/day
- Monthly Estimate: $${(dailyAmountDollars * 30.4).toFixed(2)}/month

⚠️ **IMPORTANT:** This budget won't affect spend until assigned to a campaign!

🎯 **NEXT STEPS:**

**1. Assign to Campaign:**
   • New campaign: use create_campaign with budgetId="${budgetId}"
   • Existing campaign: use update_campaign with budgetId="${budgetId}"

**2. Monitor Spend:**
   • Budget sets daily limit (campaign pauses when reached)
   • Monthly estimate: ~$${(dailyAmountDollars * 30.4).toFixed(0)} (actual varies by performance)

**3. Adjust if Needed:**
   • Too restrictive (pausing daily): use update_budget to increase
   • Overspending: Decrease via update_budget

${dailyAmountDollars > 200 ? `\n⚠️ **High Budget Alert:** $${dailyAmountDollars}/day is substantial. Monitor closely, especially in first week!` : ''}
${dailyAmountDollars < 20 ? `\n⚠️ **Low Budget Alert:** $${dailyAmountDollars}/day may be too low for competitive keywords. Consider increasing if performance is limited.` : ''}`;

      return injectGuidance({
        customerId,
        budgetId,
        name,
        dailyAmount: dailyAmountDollars,
        monthlyEstimate: dailyAmountDollars * 30.4,
      }, guidanceText);
    } catch (error) {
      logger.error('Failed to create budget', error as Error);

      // AUDIT: Log failed budget creation
      await audit.logFailedOperation('user', 'create_budget', input.customerId, (error as Error).message, {
        budgetName: input.name,
        attemptedAmount: input.dailyAmountDollars,
      });

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
    type: 'object' as const,
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
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
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

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/4',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: '🚨 CRITICAL: Which account\'s budget do you want to modify?',
          nextParam: 'customerId',
          emoji: '💰',
        });
      }

      // ═══ STEP 2: BUDGET DISCOVERY ═══
      if (!budgetId) {
        const budgets = await client.listBudgets(customerId);

        return formatDiscoveryResponse({
          step: '2/4',
          title: 'SELECT BUDGET TO MODIFY',
          items: budgets,
          itemFormatter: (b, i) => {
            const budget = b.campaign_budget;
            const dailyAmount = microsToAmount(budget?.amount_micros || 0);
            return `${i + 1}. ${budget?.name || 'Unnamed Budget'}
   ID: ${budget?.id}
   Current: ${dailyAmount}/day
   ${budget?.recommended_budget_amount_micros ? `⚠️ Google Recommends: ${microsToAmount(budget.recommended_budget_amount_micros)}/day` : ''}`;
          },
          prompt: '💰 Which budget do you want to modify?',
          nextParam: 'budgetId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: AMOUNT SPECIFICATION ═══
      if (!newDailyAmountDollars) {
        const budgets = await client.listBudgets(customerId);
        const currentBudget = budgets.find((b: any) => b.campaign_budget.id === budgetId);
        const currentAmount = currentBudget?.campaign_budget?.amount_micros ? microsToAmount(currentBudget.campaign_budget.amount_micros) : '$0.00';

        const guidanceText = `📊 SPECIFY NEW BUDGET AMOUNT (Step 3/4)

**Current Budget:** ${currentBudget?.campaign_budget?.name || budgetId}
**Current Amount:** ${currentAmount}/day

🚨 **CRITICAL OPERATION WARNING:**
- Changes take effect IMMEDIATELY
- Affects ALL campaigns using this budget
- Increasing = potential for more daily spend
- Decreasing below today's spend may pause delivery

💡 **HOW TO SPECIFY:**
Provide newDailyAmountDollars as a number (e.g., 75 for $75/day)

**Examples:**
- Increase to $75/day: newDailyAmountDollars=75
- Decrease to $40/day: newDailyAmountDollars=40

⚠️ **SAFETY GUIDELINES:**
- Don't increase >50% in single change
- For >20% increases, do 10-15% increments
- Wait 7 days between increases for algorithm optimization
- Always check performance before increasing

What should the new daily budget be (in dollars)?`;

        return injectGuidance(
          { customerId, budgetId, currentAmount },
          guidanceText
        );
      }

      // ═══ STEP 4: DRY-RUN PREVIEW (existing approval flow) ═══
      UpdateBudgetSchema.parse(input);
      const newAmountMicros = amountToMicros(newDailyAmountDollars);

      // Get current budget for comparison
      const budgets = await client.listBudgets(customerId);
      const currentBudget = budgets.find((b: any) => b.campaign_budget.id === budgetId);

      const currentAmountMicros = currentBudget?.campaign_budget?.amount_micros || 0;

      // SAFETY: Validate budget change against limits (500% max)
      const validation = await validateBudgetChange(currentAmountMicros, newAmountMicros);

      const currentAmount = currentAmountMicros / 1000000;
      const difference = newDailyAmountDollars - currentAmount;
      const percentChange = validation.percentChange.toFixed(1);

      // Build dry-run preview
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'update_budget',
        'Google Ads',
        customerId
      );

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
        dryRunBuilder.addRisk(
          `Large budget change (${percentChange}%) may cause delivery fluctuations`
        );
      }

      if (difference < 0) {
        dryRunBuilder.addRisk(
          'Decreasing budget may pause ad delivery if already spent more than new limit today'
        );
      }

      // Add recommendations
      if (Math.abs(parseFloat(percentChange)) > 20) {
        dryRunBuilder.addRecommendation(
          'Consider making budget changes in smaller increments (10-15% at a time)'
        );
        dryRunBuilder.addRecommendation(
          'Wait 7 days between budget increases to allow algorithm to optimize'
        );
      }

      // Add warnings to dry-run
      validation.warnings.forEach((warning) => {
        dryRunBuilder.addRecommendation(warning);
      });

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'update_budget',
          'Google Ads',
          customerId,
          { budgetId, newDailyAmountDollars }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Budget update requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Updating budget with confirmation', {
        customerId,
        budgetId,
        newDailyAmountDollars,
        percentChange: `${percentChange}%`,
      });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          return await client.updateBudget(customerId, budgetId, newAmountMicros);
        }
      );

      // AUDIT: Log successful budget update
      await audit.logWriteOperation('user', 'update_budget', customerId, {
        budgetId,
        previousAmount: microsToAmount(currentAmountMicros),
        newAmount: microsToAmount(newAmountMicros),
        dailyDifference: difference,
        monthlyImpact: difference * 30.4,
        percentageChange: percentChange + '%',
        budgetName: currentBudget?.campaign_budget?.name || 'Unknown',
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
    } catch (error) {
      logger.error('Failed to update budget', error as Error);

      // AUDIT: Log failed budget update
      await audit.logFailedOperation('user', 'update_budget', input.customerId, (error as Error).message, {
        budgetId: input.budgetId,
        attemptedAmount: input.newDailyAmountDollars,
      });

      throw error;
    }
  },
};
