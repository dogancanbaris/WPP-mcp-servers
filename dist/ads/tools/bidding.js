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
 * Create portfolio bidding strategy
 */
export const createBiddingStrategyTool = {
    name: 'create_portfolio_bidding_strategy',
    description: 'Create a new portfolio bidding strategy (TARGET_CPA, TARGET_ROAS, etc).',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            name: {
                type: 'string',
                description: 'Strategy name (descriptive)',
            },
            strategyType: {
                type: 'string',
                description: 'Strategy type (TARGET_CPA, TARGET_ROAS, MAXIMIZE_CONVERSIONS, MAXIMIZE_CONVERSION_VALUE)',
            },
            targetValue: {
                type: 'number',
                description: 'Target value (CPA in dollars or ROAS as decimal, e.g., 2.5 for 2.5x ROAS)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
            const { customerId, name, strategyType, targetValue, confirmationToken } = input;
            // Extract OAuth tokens
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
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
                    customerId: rn.split('/')[1],
                }));
                return formatDiscoveryResponse({
                    step: '1/5',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account do you want to create a bidding strategy for?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: STRATEGY TYPE SELECTION ═══
            if (!strategyType) {
                const strategyTypes = [
                    {
                        type: 'TARGET_CPA',
                        name: 'Target CPA',
                        description: 'Optimize for conversions at a target cost per acquisition',
                        useCase: 'Best for: Lead generation, form fills, sign-ups',
                        requires: 'Target CPA value in dollars',
                    },
                    {
                        type: 'TARGET_ROAS',
                        name: 'Target ROAS',
                        description: 'Optimize for conversion value at a target return on ad spend',
                        useCase: 'Best for: E-commerce, transactions with revenue tracking',
                        requires: 'Target ROAS as decimal (e.g., 2.5 for 2.5x return)',
                    },
                    {
                        type: 'MAXIMIZE_CONVERSIONS',
                        name: 'Maximize Conversions',
                        description: 'Get the most conversions within your budget',
                        useCase: 'Best for: Maximum volume, awareness campaigns',
                        requires: 'No target value needed',
                    },
                    {
                        type: 'MAXIMIZE_CONVERSION_VALUE',
                        name: 'Maximize Conversion Value',
                        description: 'Get the highest total conversion value within your budget',
                        useCase: 'Best for: E-commerce, maximizing revenue',
                        requires: 'No target value needed',
                    },
                ];
                const guidanceText = `🎯 SELECT BIDDING STRATEGY TYPE (Step 2/5)

📊 **AVAILABLE STRATEGY TYPES:**

${strategyTypes.map((st, i) => `${i + 1}. **${st.name}** (${st.type})
   ${st.description}
   ${st.useCase}
   ${st.requires}`).join('\n\n')}

💡 **PORTFOLIO STRATEGY BENEFITS:**
✅ Share learnings across multiple campaigns
✅ More data = better optimization
✅ Consistent bidding goals
✅ Easier management

⚠️ **REQUIREMENTS:**
- Conversion tracking must be enabled
- Sufficient conversion data (15+ conversions in 30 days recommended)
- Active campaigns to assign strategy to

Which strategy type do you want to create?
**Provide:** strategyType (e.g., "TARGET_CPA")`;
                return injectGuidance({ customerId, strategyTypes }, guidanceText);
            }
            // Validate strategy type
            const validTypes = ['TARGET_CPA', 'TARGET_ROAS', 'MAXIMIZE_CONVERSIONS', 'MAXIMIZE_CONVERSION_VALUE'];
            if (!validTypes.includes(strategyType)) {
                throw new Error(`Invalid strategy type. Must be one of: ${validTypes.join(', ')}`);
            }
            // ═══ STEP 3: STRATEGY NAME ═══
            if (!name) {
                const guidanceText = `📝 STRATEGY NAME (Step 3/5)

Enter a descriptive name for your ${strategyType} strategy:

**Examples:**
- "Lead Gen - Target $50 CPA"
- "E-commerce ROAS 3.0x"
- "Brand Awareness - Max Conversions"
- "Q1 2025 Performance Strategy"

**Best Practices:**
- Include strategy type for quick reference
- Mention target value if applicable
- Keep it clear and descriptive
- Use naming convention consistent with your account

What should the strategy be named?`;
                return injectGuidance({ customerId, strategyType }, guidanceText);
            }
            // ═══ STEP 4: TARGET VALUE (if needed) ═══
            const needsTarget = strategyType === 'TARGET_CPA' || strategyType === 'TARGET_ROAS';
            if (needsTarget && !targetValue) {
                let guidanceText = '';
                if (strategyType === 'TARGET_CPA') {
                    guidanceText = `💰 TARGET CPA VALUE (Step 4/5)

Enter your target cost per acquisition in dollars:

**How to Calculate Target CPA:**
1. Customer Lifetime Value (LTV): $___
2. Acceptable profit margin: ___%
3. Target CPA = LTV × (1 - margin)

**Example:**
- If LTV = $200 and margin = 60%
- Target CPA = $200 × 0.40 = $80

**Current Performance Check:**
Before setting target, check your current CPA:
- Use get_campaign_performance tool
- Review last 30-90 days
- Set target 10-20% better than current average

**Recommended Approach:**
- Start conservative (close to current CPA)
- Monitor for 7-14 days
- Gradually lower target if hitting goals
- Increase if volume drops too much

What should the target CPA be (in dollars)?
**Example:** 50 (for $50 CPA target)`;
                }
                else {
                    guidanceText = `📈 TARGET ROAS VALUE (Step 4/5)

Enter your target return on ad spend as a decimal:

**What is ROAS?**
ROAS = Conversion Value ÷ Ad Spend
- 2.0 = $2 revenue for every $1 spent (100% return)
- 3.0 = $3 revenue for every $1 spent (200% return)
- 4.0 = $4 revenue for every $1 spent (300% return)

**How to Calculate Target ROAS:**
1. Product profit margin: ___%
2. Operating costs: ___%
3. Target ROAS = 1 ÷ (acceptable margin - costs)

**Example:**
- If profit margin = 40% and costs = 10%
- Acceptable margin = 30%
- Target ROAS = 1 ÷ 0.30 = 3.33x

**Current Performance Check:**
Before setting target, check your current ROAS:
- Use get_campaign_performance tool
- Review last 30-90 days
- Set target 10-20% better than current average

**Recommended Approach:**
- Start with current ROAS (or slightly lower)
- Monitor for 7-14 days
- Gradually increase target if hitting goals
- Decrease if volume drops too much

What should the target ROAS be (as decimal)?
**Example:** 2.5 (for 2.5x ROAS = $2.50 per $1 spent)`;
                }
                return injectGuidance({ customerId, strategyType, name }, guidanceText);
            }
            // ═══ STEP 5: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                // @ts-ignore - Variable used in API call
                const targetMicros = targetValue ? (strategyType === 'TARGET_CPA' ? targetValue * 1000000 : targetValue) : undefined; // Used in API call below
                const changes = [
                    `Strategy Type: ${strategyType}`,
                    `Strategy Name: ${name}`,
                ];
                if (strategyType === 'TARGET_CPA' && targetValue) {
                    changes.push(`Target CPA: ${formatCurrency(targetValue)}`);
                    changes.push(`Monthly Target (30 conversions): ${formatCurrency(targetValue * 30)}`);
                }
                else if (strategyType === 'TARGET_ROAS' && targetValue) {
                    changes.push(`Target ROAS: ${targetValue.toFixed(2)}x`);
                    changes.push(`For $1,000 spend: ${formatCurrency(targetValue * 1000)} expected revenue`);
                }
                const risks = [];
                const recommendations = [];
                if (strategyType === 'TARGET_CPA' || strategyType === 'TARGET_ROAS') {
                    recommendations.push('Strategy requires 15+ conversions in last 30 days for optimal performance');
                    recommendations.push('Monitor for 7-14 days before making adjustments');
                    recommendations.push('Assign to campaigns with similar conversion goals');
                }
                if (strategyType === 'TARGET_CPA' && targetValue && targetValue < 10) {
                    risks.push('Very low CPA target may limit delivery. Ensure conversion tracking is accurate.');
                }
                if (strategyType === 'TARGET_ROAS' && targetValue && targetValue > 5) {
                    risks.push('High ROAS target may limit delivery. Start lower and increase gradually.');
                }
                recommendations.push('This strategy will not affect campaigns until assigned');
                recommendations.push('Use update_campaign tool to assign strategy to campaigns');
                const preview = `📋 CREATE BIDDING STRATEGY - REVIEW & CONFIRM (Step 5/5)

**PROPOSED CHANGES:**
${changes.map(c => `   • ${c}`).join('\n')}

${risks.length > 0 ? `\n⚠️ **RISKS & WARNINGS:**\n${risks.map(r => `   • ${r}`).join('\n')}` : ''}

💡 **RECOMMENDATIONS:**
${recommendations.map(r => `   • ${r}`).join('\n')}

✅ **Proceed with strategy creation?**
Call this tool again with confirmationToken to execute.`;
                return {
                    content: [{
                            type: 'text',
                            text: preview,
                        }],
                    requiresApproval: true,
                    confirmationToken: `create_bidding_strategy_${Date.now()}`,
                    preview: { changes, risks, recommendations },
                };
            }
            // ═══ STEP 6: EXECUTE ═══
            logger.info('Creating bidding strategy', { customerId, name, strategyType, targetValue });
            const targetMicros = targetValue ? (strategyType === 'TARGET_CPA' ? targetValue * 1000000 : targetValue) : undefined;
            const result = await client.createBiddingStrategy(customerId, name, strategyType, targetMicros);
            logger.info("Bidding strategy created", { result });
            const successText = `✅ BIDDING STRATEGY CREATED SUCCESSFULLY

**Strategy Details:**
   • Name: ${name}
   • Type: ${strategyType}
   • ID: ${result}
${strategyType === 'TARGET_CPA' && targetValue ? `   • Target CPA: ${formatCurrency(targetValue)}` : ''}
${strategyType === 'TARGET_ROAS' && targetValue ? `   • Target ROAS: ${targetValue.toFixed(2)}x` : ''}

🎯 **NEXT STEPS:**
   • Assign strategy to campaigns: use update_campaign tool
   • Monitor performance: use get_campaign_performance
   • Check strategy usage: use list_bidding_strategies
   • Review after 7-14 days: use get_bidding_strategy_performance

⚠️ **IMPORTANT:**
   • Strategy will not affect spend until assigned to active campaigns
   • Allow 7-14 days for algorithm to optimize
   • Need 15+ conversions in 30 days for best results`;
            return injectGuidance({
                customerId,
                strategyId: result,
                name,
                type: strategyType,
                targetValue,
            }, successText);
        }
        catch (error) {
            logger.error('Failed to create bidding strategy', error);
            throw error;
        }
    },
};
/**
 * Update bidding strategy
 */
export const updateBiddingStrategyTool = {
    name: 'update_bidding_strategy',
    description: 'Update target CPA or ROAS for an existing portfolio bidding strategy.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            strategyId: {
                type: 'string',
                description: 'Bidding strategy ID',
            },
            newTargetValue: {
                type: 'number',
                description: 'New target value (CPA in dollars or ROAS as decimal)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
            const { customerId, strategyId, newTargetValue, confirmationToken } = input;
            // Extract OAuth tokens
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
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
                    customerId: rn.split('/')[1],
                }));
                return formatDiscoveryResponse({
                    step: '1/4',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account has the bidding strategy you want to update?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: STRATEGY DISCOVERY ═══
            if (!strategyId) {
                const customer = client.getCustomer(customerId);
                const query = `
          SELECT
            bidding_strategy.id,
            bidding_strategy.name,
            bidding_strategy.type,
            bidding_strategy.campaign_count,
            bidding_strategy.target_cpa.target_cpa_micros,
            bidding_strategy.target_roas.target_roas
          FROM bidding_strategy
          WHERE bidding_strategy.status != 'REMOVED'
          AND (bidding_strategy.type = 'TARGET_CPA' OR bidding_strategy.type = 'TARGET_ROAS')
          ORDER BY bidding_strategy.name
        `;
                const results = await customer.query(query);
                const strategies = results.map((row) => {
                    const strategy = row.bidding_strategy;
                    return {
                        id: String(strategy?.id || ''),
                        name: String(strategy?.name || ''),
                        type: String(strategy?.type || ''),
                        campaignCount: parseInt(String(strategy?.campaign_count || 0)),
                        currentTarget: strategy?.target_cpa?.target_cpa_micros
                            ? parseFloat(String(strategy.target_cpa.target_cpa_micros)) / 1000000
                            : strategy?.target_roas?.target_roas
                                ? parseFloat(String(strategy.target_roas.target_roas))
                                : undefined,
                    };
                });
                if (strategies.length === 0) {
                    return injectGuidance({ customerId }, `⚠️ NO UPDATABLE STRATEGIES FOUND

No TARGET_CPA or TARGET_ROAS strategies found in this account.

Only these strategy types can have targets updated:
- TARGET_CPA (target cost per acquisition)
- TARGET_ROAS (target return on ad spend)

MAXIMIZE_CONVERSIONS and MAXIMIZE_CONVERSION_VALUE don't have adjustable targets.

🎯 **NEXT STEPS:**
   • Create a new strategy: use create_portfolio_bidding_strategy
   • Check all strategies: use list_bidding_strategies`);
                }
                return formatDiscoveryResponse({
                    step: '2/4',
                    title: 'SELECT BIDDING STRATEGY',
                    items: strategies,
                    itemFormatter: (s, i) => {
                        const targetDisplay = s.type === 'TARGET_CPA'
                            ? `Current Target: ${formatCurrency(s.currentTarget)}`
                            : `Current Target: ${s.currentTarget.toFixed(2)}x ROAS`;
                        return `${i + 1}. ${s.name} (${s.type})
   ID: ${s.id}
   ${targetDisplay}
   Used by ${s.campaignCount} campaign(s)`;
                    },
                    prompt: 'Which strategy do you want to update?',
                    nextParam: 'strategyId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: NEW TARGET VALUE ═══
            if (!newTargetValue) {
                const customer = client.getCustomer(customerId);
                const query = `
          SELECT
            bidding_strategy.id,
            bidding_strategy.name,
            bidding_strategy.type,
            bidding_strategy.target_cpa.target_cpa_micros,
            bidding_strategy.target_roas.target_roas
          FROM bidding_strategy
          WHERE bidding_strategy.id = ${strategyId}
        `;
                const results = await customer.query(query);
                if (results.length === 0) {
                    throw new Error(`Bidding strategy ${strategyId} not found`);
                }
                const strategy = results[0].bidding_strategy;
                const strategyType = String(strategy?.type);
                const currentTarget = strategy?.target_cpa?.target_cpa_micros
                    ? parseFloat(String(strategy.target_cpa.target_cpa_micros)) / 1000000
                    : strategy?.target_roas?.target_roas
                        ? parseFloat(String(strategy.target_roas.target_roas))
                        : 0;
                let guidanceText = '';
                if (strategyType === 'TARGET_CPA') {
                    guidanceText = `💰 NEW TARGET CPA VALUE (Step 3/4)

**Current Strategy:** ${strategy?.name}
**Current Target:** ${formatCurrency(currentTarget)}

🚨 **CRITICAL OPERATION:**
- Changes take effect IMMEDIATELY for all campaigns using this strategy
- Affects ${results[0].bidding_strategy?.campaign_count || 0} campaign(s)

💡 **HOW TO ADJUST:**
Provide newTargetValue as a number in dollars

**Examples:**
- Increase to $75: newTargetValue=75
- Decrease to $40: newTargetValue=40

⚠️ **SAFETY GUIDELINES:**
- Don't change by >50% in single adjustment
- For >20% changes, do 10-15% increments
- Wait 7-14 days between adjustments
- Check performance before changing
- Lower target = fewer conversions but better quality
- Higher target = more conversions but higher cost

What should the new target CPA be (in dollars)?`;
                }
                else {
                    guidanceText = `📈 NEW TARGET ROAS VALUE (Step 3/4)

**Current Strategy:** ${strategy?.name}
**Current Target:** ${currentTarget.toFixed(2)}x ROAS

🚨 **CRITICAL OPERATION:**
- Changes take effect IMMEDIATELY for all campaigns using this strategy
- Affects ${results[0].bidding_strategy?.campaign_count || 0} campaign(s)

💡 **HOW TO ADJUST:**
Provide newTargetValue as a decimal

**Examples:**
- Increase to 3.5x: newTargetValue=3.5
- Decrease to 2.0x: newTargetValue=2.0

⚠️ **SAFETY GUIDELINES:**
- Don't change by >50% in single adjustment
- For >20% changes, do 10-15% increments
- Wait 7-14 days between adjustments
- Check performance before changing
- Higher target = less volume but better efficiency
- Lower target = more volume but lower ROAS

What should the new target ROAS be (as decimal)?`;
                }
                return injectGuidance({ customerId, strategyId, strategyType, currentTarget }, guidanceText);
            }
            // ═══ STEP 4: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                const customer = client.getCustomer(customerId);
                const query = `
          SELECT
            bidding_strategy.id,
            bidding_strategy.name,
            bidding_strategy.type,
            bidding_strategy.campaign_count,
            bidding_strategy.target_cpa.target_cpa_micros,
            bidding_strategy.target_roas.target_roas
          FROM bidding_strategy
          WHERE bidding_strategy.id = ${strategyId}
        `;
                const results = await customer.query(query);
                const strategy = results[0].bidding_strategy;
                const strategyType = String(strategy?.type);
                const currentTarget = strategy?.target_cpa?.target_cpa_micros
                    ? parseFloat(String(strategy.target_cpa.target_cpa_micros)) / 1000000
                    : strategy?.target_roas?.target_roas
                        ? parseFloat(String(strategy.target_roas.target_roas))
                        : 0;
                const difference = newTargetValue - currentTarget;
                const percentChange = ((difference / currentTarget) * 100).toFixed(1);
                const changes = [
                    `Strategy: ${strategy?.name}`,
                    `Type: ${strategyType}`,
                    strategyType === 'TARGET_CPA'
                        ? `Current Target: ${formatCurrency(currentTarget)}`
                        : `Current Target: ${currentTarget.toFixed(2)}x ROAS`,
                    strategyType === 'TARGET_CPA'
                        ? `New Target: ${formatCurrency(newTargetValue)}`
                        : `New Target: ${newTargetValue.toFixed(2)}x ROAS`,
                    `Change: ${difference > 0 ? '+' : ''}${strategyType === 'TARGET_CPA' ? formatCurrency(Math.abs(difference)) : Math.abs(difference).toFixed(2)} (${percentChange}%)`,
                    `Campaigns Affected: ${strategy?.campaign_count || 0}`,
                ];
                const risks = [];
                const recommendations = [];
                if (Math.abs(parseFloat(percentChange)) > 50) {
                    risks.push(`Large change (${percentChange}%). May cause significant delivery fluctuations.`);
                }
                if (Math.abs(parseFloat(percentChange)) > 20) {
                    recommendations.push('Consider making changes in smaller increments (10-15%)');
                    recommendations.push('Wait 7-14 days between adjustments for optimization');
                }
                if (difference < 0) {
                    recommendations.push('Lowering target may reduce delivery volume');
                }
                else {
                    recommendations.push('Increasing target may increase delivery volume but at higher cost/lower efficiency');
                }
                const preview = `📋 UPDATE BIDDING STRATEGY - REVIEW & CONFIRM (Step 4/4)

**PROPOSED CHANGES:**
${changes.map(c => `   • ${c}`).join('\n')}

${risks.length > 0 ? `\n⚠️ **RISKS & WARNINGS:**\n${risks.map(r => `   • ${r}`).join('\n')}` : ''}

💡 **RECOMMENDATIONS:**
${recommendations.map(r => `   • ${r}`).join('\n')}

✅ **Proceed with strategy update?**
Call this tool again with confirmationToken to execute.`;
                return {
                    content: [{
                            type: 'text',
                            text: preview,
                        }],
                    requiresApproval: true,
                    confirmationToken: `update_bidding_strategy_${Date.now()}`,
                    preview: { changes, risks, recommendations, currentTarget, newTargetValue, percentChange },
                };
            }
            // ═══ STEP 5: EXECUTE ═══
            logger.info('Updating bidding strategy', { customerId, strategyId, newTargetValue });
            const customer = client.getCustomer(customerId);
            const query = `
        SELECT
          bidding_strategy.name,
          bidding_strategy.type,
          bidding_strategy.target_cpa.target_cpa_micros,
          bidding_strategy.target_roas.target_roas
        FROM bidding_strategy
        WHERE bidding_strategy.id = ${strategyId}
      `;
            const results = await customer.query(query);
            const strategy = results[0].bidding_strategy;
            const strategyType = String(strategy?.type);
            const currentTarget = strategy?.target_cpa?.target_cpa_micros
                ? parseFloat(String(strategy.target_cpa.target_cpa_micros)) / 1000000
                : parseFloat(String(strategy?.target_roas?.target_roas || 0));
            const targetMicros = strategyType === 'TARGET_CPA' ? newTargetValue * 1000000 : newTargetValue;
            const result = await client.updateBiddingStrategy(customerId, strategyId, targetMicros);
            logger.info("Bidding strategy updated", { result });
            const difference = newTargetValue - currentTarget;
            const percentChange = ((difference / currentTarget) * 100).toFixed(1);
            const successText = `✅ BIDDING STRATEGY UPDATED SUCCESSFULLY

**Strategy:** ${strategy?.name}
**Type:** ${strategyType}
${strategyType === 'TARGET_CPA' ? `**Previous Target:** ${formatCurrency(currentTarget)}` : `**Previous Target:** ${currentTarget.toFixed(2)}x ROAS`}
${strategyType === 'TARGET_CPA' ? `**New Target:** ${formatCurrency(newTargetValue)}` : `**New Target:** ${newTargetValue.toFixed(2)}x ROAS`}
**Change:** ${difference > 0 ? '+' : ''}${percentChange}%

🎯 **NEXT STEPS:**
   • Monitor campaign performance closely over next 7-14 days
   • Use get_campaign_performance to track results
   • Allow time for algorithm to adapt to new target
   • Check strategy performance: use list_bidding_strategies

⚠️ **IMPORTANT:**
   • Changes affect all campaigns using this strategy
   • Performance may fluctuate during adjustment period
   • Consider gradual adjustments if making further changes`;
            return injectGuidance({
                customerId,
                strategyId,
                strategyName: strategy?.name,
                strategyType,
                previousTarget: currentTarget,
                newTarget: newTargetValue,
                change: difference,
                percentChange: `${percentChange}%`,
            }, successText);
        }
        catch (error) {
            logger.error('Failed to update bidding strategy', error);
            throw error;
        }
    },
};
/**
 * Set ad group CPC bid
 */
export const setAdGroupCpcBidTool = {
    name: 'set_ad_group_cpc_bid',
    description: 'Set maximum CPC bid at ad group level (for Manual CPC campaigns).',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID',
            },
            adGroupId: {
                type: 'string',
                description: 'Ad Group ID',
            },
            maxCpcDollars: {
                type: 'number',
                description: 'Maximum CPC bid in dollars (e.g., 2.50 for $2.50 max CPC)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
            const { customerId, campaignId, adGroupId, maxCpcDollars, confirmationToken } = input;
            // Extract OAuth tokens
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
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
                    customerId: rn.split('/')[1],
                }));
                return formatDiscoveryResponse({
                    step: '1/5',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account has the ad group you want to modify?',
                    nextParam: 'customerId',
                    emoji: '💰',
                });
            }
            // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                const manualCpcCampaigns = campaigns.filter((c) => c.campaign?.bidding_strategy_type === 'MANUAL_CPC' ||
                    c.campaign?.bidding_strategy_type === 'TARGET_SPEND');
                if (manualCpcCampaigns.length === 0) {
                    return injectGuidance({ customerId }, `⚠️ NO MANUAL CPC CAMPAIGNS FOUND

Ad group-level CPC bids only apply to campaigns using Manual CPC or Enhanced CPC bidding.

None of your campaigns in this account use these bidding strategies.

🎯 **ALTERNATIVE OPTIONS:**
   • Use portfolio bidding strategies: create_portfolio_bidding_strategy
   • Change campaign bidding strategy: update_campaign tool
   • Check current strategies: list_campaigns`);
                }
                return formatDiscoveryResponse({
                    step: '2/5',
                    title: 'SELECT CAMPAIGN',
                    items: manualCpcCampaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'Unnamed Campaign'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Bidding: ${campaign?.bidding_strategy_type}`;
                    },
                    prompt: 'Which campaign has the ad group?',
                    nextParam: 'campaignId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: AD GROUP DISCOVERY ═══
            if (!adGroupId) {
                const customer = client.getCustomer(customerId);
                const query = `
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.cpc_bid_micros,
            campaign.id,
            campaign.name
          FROM ad_group
          WHERE campaign.id = ${campaignId}
          AND ad_group.status != 'REMOVED'
          ORDER BY ad_group.name
        `;
                const results = await customer.query(query);
                const adGroups = results.map((row) => {
                    const adGroup = row.ad_group;
                    return {
                        id: String(adGroup?.id || ''),
                        name: String(adGroup?.name || ''),
                        status: String(adGroup?.status || ''),
                        currentCpc: adGroup?.cpc_bid_micros
                            ? parseFloat(String(adGroup.cpc_bid_micros)) / 1000000
                            : null,
                    };
                });
                if (adGroups.length === 0) {
                    return injectGuidance({ customerId, campaignId }, `⚠️ NO AD GROUPS FOUND

This campaign has no active ad groups.

🎯 **NEXT STEPS:**
   • Create an ad group first: use create_ad_group tool
   • Check campaign status: use list_campaigns`);
                }
                return formatDiscoveryResponse({
                    step: '3/5',
                    title: 'SELECT AD GROUP',
                    items: adGroups,
                    itemFormatter: (ag, i) => {
                        const currentBid = ag.currentCpc ? formatCurrency(ag.currentCpc) : 'Not set';
                        return `${i + 1}. ${ag.name}
   ID: ${ag.id}
   Status: ${ag.status}
   Current Max CPC: ${currentBid}`;
                    },
                    prompt: 'Which ad group do you want to set the CPC bid for?',
                    nextParam: 'adGroupId',
                    context: { customerId, campaignId },
                });
            }
            // ═══ STEP 4: CPC AMOUNT ═══
            if (!maxCpcDollars) {
                const customer = client.getCustomer(customerId);
                const query = `
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.cpc_bid_micros,
            metrics.average_cpc
          FROM ad_group
          WHERE ad_group.id = ${adGroupId}
          AND segments.date DURING LAST_30_DAYS
        `;
                const results = await customer.query(query);
                const adGroup = results[0]?.ad_group;
                const metrics = results[0]?.metrics;
                const currentCpc = adGroup?.cpc_bid_micros
                    ? parseFloat(String(adGroup.cpc_bid_micros)) / 1000000
                    : null;
                const avgCpc = metrics?.average_cpc
                    ? parseFloat(String(metrics.average_cpc)) / 1000000
                    : null;
                const guidanceText = `💰 SET MAXIMUM CPC BID (Step 4/5)

**Ad Group:** ${adGroup?.name || adGroupId}
**Current Max CPC:** ${currentCpc ? formatCurrency(currentCpc) : 'Not set'}
${avgCpc ? `**Average CPC (Last 30 Days):** ${formatCurrency(avgCpc)}` : ''}

🚨 **WHAT IS MAX CPC?**
- Maximum amount you'll pay for a click
- Actual CPC is usually lower (auction dynamics)
- Setting too low = reduced impressions/clicks
- Setting too high = overpaying for clicks

💡 **HOW TO SET:**
Provide maxCpcDollars as a number

**Examples:**
- $2.50 max CPC: maxCpcDollars=2.50
- $5.00 max CPC: maxCpcDollars=5.00
- $0.75 max CPC: maxCpcDollars=0.75

⚠️ **BIDDING RECOMMENDATIONS:**
${avgCpc ? `- Your current average: ${formatCurrency(avgCpc)}` : ''}
- Industry typical: $1-5 for most industries
- Competitive terms: $5-50+ possible
- Start conservative and adjust based on performance
- Check keyword competition levels first

📊 **BEST PRACTICES:**
- Set ad group bid as baseline
- Override with keyword-level bids for precision
- Monitor search impression share (budget)
- Adjust based on conversion data

What should the maximum CPC bid be (in dollars)?`;
                return injectGuidance({ customerId, campaignId, adGroupId, currentCpc, avgCpc }, guidanceText);
            }
            // ═══ STEP 5: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                const customer = client.getCustomer(customerId);
                const query = `
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.cpc_bid_micros,
            campaign.name
          FROM ad_group
          WHERE ad_group.id = ${adGroupId}
        `;
                const results = await customer.query(query);
                const adGroup = results[0]?.ad_group;
                const campaign = results[0]?.campaign;
                const currentCpc = adGroup?.cpc_bid_micros
                    ? parseFloat(String(adGroup.cpc_bid_micros)) / 1000000
                    : 0;
                const changes = [
                    `Campaign: ${campaign?.name}`,
                    `Ad Group: ${adGroup?.name}`,
                    currentCpc > 0
                        ? `Current Max CPC: ${formatCurrency(currentCpc)}`
                        : 'Current Max CPC: Not set',
                    `New Max CPC: ${formatCurrency(maxCpcDollars)}`,
                ];
                if (currentCpc > 0) {
                    const difference = maxCpcDollars - currentCpc;
                    const percentChange = ((difference / currentCpc) * 100).toFixed(1);
                    changes.push(`Change: ${difference > 0 ? '+' : ''}${formatCurrency(Math.abs(difference))} (${percentChange}%)`);
                }
                const risks = [];
                const recommendations = [];
                if (maxCpcDollars > 10) {
                    risks.push('High CPC bid. Verify this is intentional for competitive keywords.');
                }
                if (maxCpcDollars < 0.50) {
                    risks.push('Very low CPC bid may severely limit delivery.');
                }
                if (currentCpc > 0 && maxCpcDollars > currentCpc * 2) {
                    risks.push('Large increase. Consider gradual adjustments.');
                }
                recommendations.push('Monitor performance after 48-72 hours');
                recommendations.push('Check search impression share for delivery impact');
                recommendations.push('Consider keyword-level bid adjustments for precision');
                const preview = `📋 SET AD GROUP CPC BID - REVIEW & CONFIRM (Step 5/5)

**PROPOSED CHANGES:**
${changes.map(c => `   • ${c}`).join('\n')}

${risks.length > 0 ? `\n⚠️ **RISKS & WARNINGS:**\n${risks.map(r => `   • ${r}`).join('\n')}` : ''}

💡 **RECOMMENDATIONS:**
${recommendations.map(r => `   • ${r}`).join('\n')}

✅ **Proceed with CPC bid update?**
Call this tool again with confirmationToken to execute.`;
                return {
                    content: [{
                            type: 'text',
                            text: preview,
                        }],
                    requiresApproval: true,
                    confirmationToken: `set_ad_group_cpc_${Date.now()}`,
                    preview: { changes, risks, recommendations, currentCpc, newCpc: maxCpcDollars },
                };
            }
            // ═══ STEP 6: EXECUTE ═══
            logger.info('Setting ad group CPC bid', { customerId, adGroupId, maxCpcDollars });
            const cpcMicros = maxCpcDollars * 1000000;
            await client.setAdGroupCpcBid(customerId, adGroupId, cpcMicros);
            const customer = client.getCustomer(customerId);
            const query = `
        SELECT
          ad_group.name,
          campaign.name
        FROM ad_group
        WHERE ad_group.id = ${adGroupId}
      `;
            const results = await customer.query(query);
            const adGroup = results[0]?.ad_group;
            const campaign = results[0]?.campaign;
            const successText = `✅ AD GROUP CPC BID UPDATED SUCCESSFULLY

**Campaign:** ${campaign?.name}
**Ad Group:** ${adGroup?.name}
**New Max CPC:** ${formatCurrency(maxCpcDollars)}

🎯 **NEXT STEPS:**
   • Monitor performance over next 48-72 hours
   • Check search impression share: use get_ad_group_performance
   • Review average CPC vs max CPC
   • Adjust individual keywords if needed: use update_keyword_bid
   • Check click volume changes

⚠️ **IMPORTANT:**
   • Changes take effect immediately
   • Actual CPC will likely be lower than max bid
   • Monitor for delivery impact (too low) or overspending (too high)
   • Keyword-level bids override ad group bids`;
            return injectGuidance({
                customerId,
                campaignId,
                adGroupId,
                adGroupName: adGroup?.name,
                campaignName: campaign?.name,
                maxCpcDollars,
            }, successText);
        }
        catch (error) {
            logger.error('Failed to set ad group CPC bid', error);
            throw error;
        }
    },
};
/**
 * Export bidding tools
 */
export const biddingTools = [
    listBiddingStrategiesTool,
    createBiddingStrategyTool,
    updateBiddingStrategyTool,
    setAdGroupCpcBidTool,
];
//# sourceMappingURL=bidding.js.map