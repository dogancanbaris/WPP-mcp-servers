/**
 * MCP Tools for Google Ads Keyword Write Operations
 */
import { amountToMicros } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
const logger = getLogger('ads.tools.keywords');
/**
 * Add keywords
 */
export const addKeywordsTool = {
    name: 'add_keywords',
    description: `Add keywords to a Google Ads ad group.

💡 AGENT GUIDANCE - KEYWORD MANAGEMENT:

⚠️ SPEND IMPACT:
- Adding keywords = potential new traffic and spend
- Match type dramatically affects reach and cost
- Always set max CPC bid to control costs

📋 MATCH TYPE GUIDE:

**EXACT Match** [keyword]
- Shows ONLY for exact keyword (and close variants)
- Most control, lowest reach
- Lowest risk of irrelevant clicks
- Best for: Brand terms, high-intent keywords
- Example: [running shoes] → matches "running shoes", "shoes running"

**PHRASE Match** "keyword"
- Shows for searches containing the phrase
- Medium control, medium reach
- Moderate risk
- Best for: Most keywords
- Example: "running shoes" → matches "best running shoes", "running shoes for women"

**BROAD Match** keyword
- Shows for related searches (Google decides)
- Least control, highest reach
- Highest risk of irrelevant clicks
- Best for: Discovery, with tight negative keywords
- Example: running shoes → matches "athletic footwear", "sneakers for jogging"

🎯 RECOMMENDED APPROACH:
1. Start with EXACT and PHRASE match
2. Add BROAD match only with:
   - Strong negative keyword list
   - Lower bids than exact/phrase
   - Close monitoring
3. Use search terms report to find waste

💡 BID STRATEGY:
- EXACT: Highest bid (most relevant)
- PHRASE: Medium bid
- BROAD: Lowest bid (cast wide net)

⚠️ COMMON MISTAKES:
- Adding too many BROAD match without negatives → Budget waste
- Bids too high without testing → Overspend
- Not grouping related keywords → Poor Quality Scores
- No negative keywords → Irrelevant traffic

📊 WORKFLOW:
1. Research keywords (use keyword planner or ideas tool)
2. Group by theme/intent
3. Start with exact/phrase match
4. Set conservative max CPC
5. Add to ad group
6. Monitor search terms report
7. Add negatives as needed
8. Expand to broad match gradually`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            adGroupId: {
                type: 'string',
                description: 'Ad group ID to add keywords to',
            },
            keywords: {
                type: 'array',
                description: 'Array of keywords to add',
                items: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'Keyword text',
                        },
                        matchType: {
                            type: 'string',
                            enum: ['EXACT', 'PHRASE', 'BROAD'],
                            description: 'Match type',
                        },
                        maxCpcDollars: {
                            type: 'number',
                            description: 'Maximum CPC bid in dollars (optional)',
                        },
                    },
                    required: ['text', 'matchType'],
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'adGroupId', 'keywords'],
    },
    async handler(input) {
        try {
            const { customerId, adGroupId, keywords, confirmationToken } = input;
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
            // Vagueness detection - ensure specific IDs
            detectAndEnforceVagueness({
                operation: 'add_keywords',
                inputText: `add ${keywords.length} keywords to ad group ${adGroupId}`,
                inputParams: { customerId, adGroupId, keywordCount: keywords.length },
            });
            // Check bulk limit (max 50 keywords per request)
            if (keywords.length > 50) {
                throw new Error(`Cannot add ${keywords.length} keywords in one operation. Maximum is 50. Please batch into smaller operations.`);
            }
            // Convert dollar bids to micros
            const keywordsWithMicros = keywords.map((kw) => ({
                text: kw.text,
                matchType: kw.matchType,
                cpcBidMicros: kw.maxCpcDollars ? amountToMicros(kw.maxCpcDollars) : undefined,
            }));
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('add_keywords', 'Google Ads', customerId);
            // Add each keyword as a change
            keywords.forEach((kw, index) => {
                dryRunBuilder.addChange({
                    resource: 'Keyword',
                    resourceId: `new_${index + 1}`,
                    field: 'keyword',
                    currentValue: 'N/A (new keyword)',
                    newValue: `"${kw.text}" [${kw.matchType}]${kw.maxCpcDollars ? ` @ $${kw.maxCpcDollars}/click` : ''}`,
                    changeType: 'create',
                });
            });
            // Count match types and broad match keywords
            const matchTypeCounts = keywords.reduce((acc, kw) => {
                acc[kw.matchType] = (acc[kw.matchType] || 0) + 1;
                return acc;
            }, { EXACT: 0, PHRASE: 0, BROAD: 0 });
            const broadMatchCount = matchTypeCounts.BROAD || 0;
            // Add risks based on match types
            if (broadMatchCount > 0) {
                dryRunBuilder.addRisk(`${broadMatchCount} BROAD match keyword(s) will trigger on related searches - may increase spend significantly`);
                dryRunBuilder.addRecommendation('Monitor search terms report closely for BROAD match keywords to identify irrelevant traffic');
                dryRunBuilder.addRecommendation('Consider adding negative keywords to prevent wasted spend on BROAD match');
            }
            if (keywords.length > 20) {
                dryRunBuilder.addRisk(`Adding ${keywords.length} keywords at once may be difficult to manage and optimize`);
                dryRunBuilder.addRecommendation('Consider adding keywords in smaller batches for easier monitoring and optimization');
            }
            // Check for high CPC bids
            const highCpcKeywords = keywords.filter((kw) => kw.maxCpcDollars && kw.maxCpcDollars > 10);
            if (highCpcKeywords.length > 0) {
                dryRunBuilder.addRisk(`${highCpcKeywords.length} keyword(s) have high CPC bids (>$10) which may increase spend rapidly`);
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('add_keywords', 'Google Ads', customerId, { adGroupId, keywords });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Keyword addition requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Adding keywords with confirmation', { customerId, adGroupId, count: keywords.length });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                return await client.addKeywords(customerId, adGroupId, keywordsWithMicros);
            });
            return {
                success: true,
                data: {
                    customerId,
                    adGroupId,
                    keywordsAdded: keywords.length,
                    matchTypeBreakdown: matchTypeCounts,
                    keywords: keywords.map((kw) => ({
                        text: kw.text,
                        matchType: kw.matchType,
                        maxCpc: kw.maxCpcDollars ? `$${kw.maxCpcDollars}` : 'Not set',
                    })),
                    result,
                    message: `✅ Added ${keywords.length} keyword(s) to ad group ${adGroupId}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to add keywords', error);
            throw error;
        }
    },
};
/**
 * Add negative keywords
 */
export const addNegativeKeywordsTool = {
    name: 'add_negative_keywords',
    description: `Add negative keywords to prevent ads from showing for unwanted searches.

💡 AGENT GUIDANCE - NEGATIVE KEYWORDS (SAVES MONEY!):

✅ THIS IS A MONEY-SAVING OPERATION:
- Prevents ads from showing for irrelevant searches
- Reduces wasted spend
- Improves campaign relevance and CTR
- Generally LOW RISK operation

🎯 WHEN TO ADD NEGATIVES:

**From Search Terms Report:**
- Irrelevant queries getting clicks but no conversions
- Brand competitor names (if not allowed to bid)
- Job seekers ("jobs", "careers", "hiring")
- Free-seekers ("free", "cheap", "discount" if premium product)
- Wrong intent ("how to make" vs "buy")

**Proactive Negatives:**
- Competitor brands
- Informational queries for transactional campaigns
- Geographic locations you don't serve
- Product types you don't sell

⚠️ MATCH TYPE CONSIDERATIONS:

**EXACT Negative** [-keyword]
- Blocks only exact match
- Most precise control
- Safest option

**PHRASE Negative** -"keyword"
- Blocks phrase and close variants
- Good balance
- Most commonly used

**BROAD Negative** -keyword
- Blocks all variations
- Can be too aggressive
- Use carefully - may block wanted traffic

💡 BEST PRACTICES:
- Start with PHRASE match for most negatives
- Use EXACT for very specific blocks
- Be careful with BROAD (can block too much)
- Add at campaign level (affects whole campaign)
- Review search terms weekly and add new negatives
- Keep negative keyword list organized

🎯 WORKFLOW:
1. Review search terms report
2. Identify irrelevant queries
3. Determine appropriate match type
4. Add as negatives
5. Monitor to ensure not blocking wanted traffic`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to add negatives to',
            },
            keywords: {
                type: 'array',
                description: 'Array of negative keywords',
                items: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'Negative keyword text',
                        },
                        matchType: {
                            type: 'string',
                            enum: ['EXACT', 'PHRASE', 'BROAD'],
                            description: 'Match type (PHRASE recommended for most)',
                        },
                    },
                    required: ['text', 'matchType'],
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'campaignId', 'keywords'],
    },
    async handler(input) {
        try {
            const { customerId, campaignId, keywords, confirmationToken } = input;
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
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'add_negative_keywords',
                inputText: `add ${keywords.length} negative keywords to campaign ${campaignId}`,
                inputParams: { customerId, campaignId, keywordCount: keywords.length },
            });
            // Check bulk limit
            if (keywords.length > 50) {
                throw new Error(`Cannot add ${keywords.length} negative keywords in one operation. Maximum is 50. Please batch into smaller operations.`);
            }
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('add_negative_keywords', 'Google Ads', customerId);
            // Add each negative keyword as a change
            keywords.forEach((kw, index) => {
                dryRunBuilder.addChange({
                    resource: 'Negative Keyword',
                    resourceId: `new_${index + 1}`,
                    field: 'negative_keyword',
                    currentValue: 'N/A (new negative)',
                    newValue: `-"${kw.text}" [${kw.matchType}]`,
                    changeType: 'create',
                });
            });
            // Count match types
            const broadMatchCount = keywords.filter((kw) => kw.matchType === 'BROAD').length;
            // Add recommendations based on match types
            if (broadMatchCount > 0) {
                dryRunBuilder.addRecommendation(`${broadMatchCount} BROAD match negative(s) will block many variations - monitor to ensure not blocking wanted traffic`);
            }
            dryRunBuilder.addRecommendation('Negative keywords reduce wasted spend by preventing ads on irrelevant searches');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('add_negative_keywords', 'Google Ads', customerId, { campaignId, keywords });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Negative keyword addition requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Adding negative keywords with confirmation', { customerId, campaignId, count: keywords.length });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                return await client.addNegativeKeywords(customerId, campaignId, keywords);
            });
            return {
                success: true,
                data: {
                    customerId,
                    campaignId,
                    negativesAdded: keywords.length,
                    keywords: keywords.map((kw) => `${kw.matchType}: ${kw.text}`),
                    result,
                    message: `✅ Added ${keywords.length} negative keyword(s) to campaign ${campaignId}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to add negative keywords', error);
            throw error;
        }
    },
};
//# sourceMappingURL=keywords.js.map