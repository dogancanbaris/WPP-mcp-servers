/**
 * MCP Tools for Google Ads Keyword Update Operations
 *
 * Tools for updating existing keywords (match type, status, CPC bid)
 */
import { amountToMicros, extractCustomerId } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { formatDiscoveryResponse, injectGuidance } from '../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.keywords-update');
/**
 * Update keyword tool - change match type, status, or bid
 */
export const updateKeywordTool = {
    name: 'update_keyword',
    description: `Update a keyword's match type, status, or CPC bid.`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID containing the keyword',
            },
            adGroupId: {
                type: 'string',
                description: 'Ad group ID containing the keyword',
            },
            keywordResourceName: {
                type: 'string',
                description: 'Keyword resource name (from get_keyword_performance)',
            },
            matchType: {
                type: 'string',
                enum: ['EXACT', 'PHRASE', 'BROAD'],
                description: 'New match type (optional)',
            },
            status: {
                type: 'string',
                enum: ['ENABLED', 'PAUSED', 'REMOVED'],
                description: 'New status (optional)',
            },
            maxCpcDollars: {
                type: 'number',
                description: 'New max CPC bid in dollars (optional)',
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
            const { customerId, campaignId, adGroupId, keywordResourceName, matchType, status, maxCpcDollars, confirmationToken, } = input;
            // Extract OAuth tokens
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API.');
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
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/5',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account contains the keyword to update?',
                    nextParam: 'customerId',
                    emoji: '🔑',
                });
            }
            // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                return formatDiscoveryResponse({
                    step: '2/5',
                    title: 'SELECT CAMPAIGN',
                    items: campaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'N/A'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}`;
                    },
                    prompt: 'Which campaign contains the keyword?',
                    nextParam: 'campaignId',
                    context: { customerId },
                    emoji: '📊',
                });
            }
            // ═══ STEP 3: AD GROUP DISCOVERY ═══
            if (!adGroupId) {
                const guidanceText = `🎯 AD GROUP SELECTION (Step 3/5)

**Current Context:**
- Account: ${customerId}
- Campaign: ${campaignId}

You need to provide the ad group ID that contains the keyword.

What is the ad group ID?`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // ═══ STEP 4: KEYWORD SELECTION ═══
            if (!keywordResourceName) {
                const keywords = await client.listKeywords(customerId, adGroupId);
                if (keywords.length === 0) {
                    const guidanceText = `⚠️ NO KEYWORDS FOUND (Step 4/5)

This ad group has no keywords.

**Next Steps:**
1. Use add_keywords to add keywords to this ad group
2. Or select a different ad group`;
                    return injectGuidance({ customerId, campaignId, adGroupId }, guidanceText);
                }
                const guidanceText = `🔑 SELECT KEYWORD TO UPDATE (Step 4/5)

**Found ${keywords.length} keyword(s) in this ad group:**

${keywords
                    .map((kw, i) => {
                    const criterion = kw.ad_group_criterion;
                    const keyword = criterion?.keyword;
                    const currentBid = criterion?.cpc_bid_micros
                        ? `$${(criterion.cpc_bid_micros / 1000000).toFixed(2)}`
                        : 'Ad group default';
                    return `${i + 1}. "${keyword?.text}"
   Match Type: ${keyword?.match_type}
   Status: ${criterion?.status}
   Max CPC: ${currentBid}
   Resource: ${criterion?.resource_name}`;
                })
                    .join('\n\n')}

**What to provide next:**
- keywordResourceName: The resource name of the keyword you want to update

Example:
\`\`\`json
{
  "keywordResourceName": "${keywords[0]?.ad_group_criterion?.resource_name}"
}
\`\`\``;
                return injectGuidance({
                    customerId,
                    campaignId,
                    adGroupId,
                    keywords: keywords.map((kw) => ({
                        text: kw.ad_group_criterion?.keyword?.text,
                        matchType: kw.ad_group_criterion?.keyword?.match_type,
                        status: kw.ad_group_criterion?.status,
                        resourceName: kw.ad_group_criterion?.resource_name,
                    })),
                }, guidanceText);
            }
            // ═══ STEP 5: UPDATE SPECIFICATION ═══
            if (!matchType && !status && !maxCpcDollars) {
                // Get current keyword details
                const keywords = await client.listKeywords(customerId, adGroupId);
                const currentKeyword = keywords.find((kw) => kw.ad_group_criterion?.resource_name === keywordResourceName);
                if (!currentKeyword) {
                    throw new Error('Keyword not found. Please verify keywordResourceName.');
                }
                const criterion = currentKeyword.ad_group_criterion;
                const keyword = criterion?.keyword;
                const currentBid = criterion?.cpc_bid_micros
                    ? `$${(criterion.cpc_bid_micros / 1000000).toFixed(2)}`
                    : 'Ad group default';
                const guidanceText = `🔄 SPECIFY UPDATES (Step 5/5)

**Current Keyword:**
- Text: "${keyword?.text}"
- Match Type: ${keyword?.match_type}
- Status: ${criterion?.status}
- Max CPC: ${currentBid}

**What would you like to update?**

**1. Change Match Type:**
- EXACT: Most control, lowest reach
- PHRASE: Balanced control and reach
- BROAD: Maximum reach, highest risk

Example: \`{ "matchType": "PHRASE" }\`

**2. Change Status:**
- ENABLED: Active and serving
- PAUSED: Temporarily stop serving
- REMOVED: Permanently remove (cannot undo!)

Example: \`{ "status": "PAUSED" }\`

**3. Adjust Max CPC Bid:**
- Increase for more traffic
- Decrease to control costs

Example: \`{ "maxCpcDollars": 2.50 }\`

**You can update multiple fields at once:**
\`\`\`json
{
  "matchType": "PHRASE",
  "maxCpcDollars": 3.00
}
\`\`\`

What changes would you like to make?`;
                return injectGuidance({
                    customerId,
                    campaignId,
                    adGroupId,
                    keywordResourceName,
                    currentKeyword: {
                        text: keyword?.text,
                        matchType: keyword?.match_type,
                        status: criterion?.status,
                        maxCpc: currentBid,
                    },
                }, guidanceText);
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'update_keyword',
                inputText: `update keyword ${keywordResourceName}`,
                inputParams: { customerId, keywordResourceName },
            });
            // Get current keyword for comparison
            const keywords = await client.listKeywords(customerId, adGroupId);
            const currentKeyword = keywords.find((kw) => kw.ad_group_criterion?.resource_name === keywordResourceName);
            if (!currentKeyword) {
                throw new Error('Keyword not found. Please verify keywordResourceName.');
            }
            const criterion = currentKeyword.ad_group_criterion;
            const keyword = criterion?.keyword;
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('update_keyword', 'Google Ads', customerId);
            const changes = [];
            if (matchType && matchType !== keyword?.match_type) {
                changes.push({
                    resource: 'Keyword',
                    resourceId: keywordResourceName,
                    field: 'Match Type',
                    currentValue: keyword?.match_type || 'Unknown',
                    newValue: matchType,
                    changeType: 'update',
                });
                dryRunBuilder.addChange(changes[changes.length - 1]);
                // Add risk if expanding to BROAD
                if (matchType === 'BROAD') {
                    dryRunBuilder.addRisk('BROAD match will trigger on related searches - may increase spend significantly');
                    dryRunBuilder.addRecommendation('Add negative keywords to control BROAD match traffic');
                }
            }
            if (status && status !== criterion?.status) {
                changes.push({
                    resource: 'Keyword',
                    resourceId: keywordResourceName,
                    field: 'Status',
                    currentValue: criterion?.status || 'Unknown',
                    newValue: status,
                    changeType: 'update',
                });
                dryRunBuilder.addChange(changes[changes.length - 1]);
                if (status === 'REMOVED') {
                    dryRunBuilder.addRisk('REMOVED status is permanent - keyword must be recreated to restore');
                }
            }
            if (maxCpcDollars !== undefined) {
                const currentBidDollars = criterion?.cpc_bid_micros ? criterion.cpc_bid_micros / 1000000 : 0;
                const bidChange = maxCpcDollars - currentBidDollars;
                const percentChange = currentBidDollars > 0 ? (bidChange / currentBidDollars) * 100 : 0;
                changes.push({
                    resource: 'Keyword',
                    resourceId: keywordResourceName,
                    field: 'Max CPC Bid',
                    currentValue: currentBidDollars > 0 ? `$${currentBidDollars.toFixed(2)}` : 'Ad group default',
                    newValue: `$${maxCpcDollars.toFixed(2)}`,
                    changeType: 'update',
                });
                dryRunBuilder.addChange(changes[changes.length - 1]);
                if (Math.abs(percentChange) > 50) {
                    dryRunBuilder.addRisk(`Large bid change (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}%) may cause significant traffic fluctuation`);
                }
            }
            if (changes.length === 0) {
                throw new Error('No changes specified. Provide at least one of: matchType, status, or maxCpcDollars');
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('update_keyword', 'Google Ads', customerId, { keywordResourceName, matchType, status, maxCpcDollars });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Keyword update requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Updating keyword with confirmation', { customerId, keywordResourceName });
            const updates = {};
            if (matchType)
                updates.matchType = matchType;
            if (status)
                updates.status = status;
            if (maxCpcDollars !== undefined)
                updates.cpcBidMicros = amountToMicros(maxCpcDollars);
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                return await client.updateKeyword(customerId, keywordResourceName, updates);
            });
            return {
                success: true,
                data: {
                    customerId,
                    keywordResourceName,
                    keyword: keyword?.text,
                    changes: changes.map((c) => `${c.field}: ${c.currentValue} → ${c.newValue}`),
                    result,
                    message: `✅ Keyword "${keyword?.text}" updated successfully`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to update keyword', error);
            throw error;
        }
    },
};
/**
 * Pause keyword tool - quick pause operation
 */
export const pauseKeywordTool = {
    name: 'pause_keyword',
    description: `Quickly pause a keyword to stop it from serving.`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID containing the keyword',
            },
            adGroupId: {
                type: 'string',
                description: 'Ad group ID containing the keyword',
            },
            keywordResourceName: {
                type: 'string',
                description: 'Keyword resource name (from get_keyword_performance)',
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
            const { customerId, campaignId, adGroupId, keywordResourceName, confirmationToken } = input;
            // Extract OAuth tokens
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API.');
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
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/4',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account contains the keyword to pause?',
                    nextParam: 'customerId',
                    emoji: '⏸️',
                });
            }
            // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
            if (!campaignId) {
                const campaigns = await client.listCampaigns(customerId);
                return formatDiscoveryResponse({
                    step: '2/4',
                    title: 'SELECT CAMPAIGN',
                    items: campaigns,
                    itemFormatter: (c, i) => {
                        const campaign = c.campaign;
                        return `${i + 1}. ${campaign?.name || 'N/A'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}`;
                    },
                    prompt: 'Which campaign contains the keyword?',
                    nextParam: 'campaignId',
                    context: { customerId },
                    emoji: '📊',
                });
            }
            // ═══ STEP 3: AD GROUP DISCOVERY ═══
            if (!adGroupId) {
                const guidanceText = `🎯 AD GROUP SELECTION (Step 3/4)

**Current Context:**
- Account: ${customerId}
- Campaign: ${campaignId}

You need to provide the ad group ID that contains the keyword.

What is the ad group ID?`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // ═══ STEP 4: KEYWORD SELECTION ═══
            if (!keywordResourceName) {
                const keywords = await client.listKeywords(customerId, adGroupId);
                if (keywords.length === 0) {
                    const guidanceText = `⚠️ NO KEYWORDS FOUND

This ad group has no keywords to pause.`;
                    return injectGuidance({ customerId, campaignId, adGroupId }, guidanceText);
                }
                const enabledKeywords = keywords.filter((kw) => kw.ad_group_criterion?.status === 'ENABLED');
                const guidanceText = `⏸️ SELECT KEYWORD TO PAUSE (Step 4/4)

**Found ${keywords.length} keyword(s), ${enabledKeywords.length} currently ENABLED:**

${keywords
                    .map((kw, i) => {
                    const criterion = kw.ad_group_criterion;
                    const keyword = criterion?.keyword;
                    const statusIndicator = criterion?.status === 'ENABLED' ? '✅' : '⏸️';
                    return `${statusIndicator} ${i + 1}. "${keyword?.text}"
   Match Type: ${keyword?.match_type}
   Status: ${criterion?.status}
   Resource: ${criterion?.resource_name}`;
                })
                    .join('\n\n')}

**What to provide next:**
- keywordResourceName: The resource name of the keyword to pause

Example:
\`\`\`json
{
  "keywordResourceName": "${keywords[0]?.ad_group_criterion?.resource_name}"
}
\`\`\``;
                return injectGuidance({
                    customerId,
                    campaignId,
                    adGroupId,
                    keywords: keywords.map((kw) => ({
                        text: kw.ad_group_criterion?.keyword?.text,
                        matchType: kw.ad_group_criterion?.keyword?.match_type,
                        status: kw.ad_group_criterion?.status,
                        resourceName: kw.ad_group_criterion?.resource_name,
                    })),
                }, guidanceText);
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'pause_keyword',
                inputText: `pause keyword ${keywordResourceName}`,
                inputParams: { customerId, keywordResourceName },
            });
            // Get current keyword details
            const keywords = await client.listKeywords(customerId, adGroupId);
            const currentKeyword = keywords.find((kw) => kw.ad_group_criterion?.resource_name === keywordResourceName);
            if (!currentKeyword) {
                throw new Error('Keyword not found. Please verify keywordResourceName.');
            }
            const criterion = currentKeyword.ad_group_criterion;
            const keyword = criterion?.keyword;
            // Check if already paused
            if (criterion?.status === 'PAUSED') {
                return {
                    success: true,
                    data: {
                        customerId,
                        keywordResourceName,
                        keyword: keyword?.text,
                        message: `⏸️ Keyword "${keyword?.text}" is already PAUSED`,
                    },
                };
            }
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('pause_keyword', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Keyword',
                resourceId: keywordResourceName,
                field: 'Status',
                currentValue: criterion?.status || 'Unknown',
                newValue: 'PAUSED',
                changeType: 'update',
            });
            dryRunBuilder.addRecommendation('Keyword will stop serving immediately but can be re-enabled anytime without losing data');
            dryRunBuilder.addRecommendation('Consider alternatives: add negative keywords, lower bid, or change match type to EXACT');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('pause_keyword', 'Google Ads', customerId, { keywordResourceName });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Keyword pause requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Pausing keyword with confirmation', { customerId, keywordResourceName });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                return await client.updateKeyword(customerId, keywordResourceName, { status: 'PAUSED' });
            });
            return {
                success: true,
                data: {
                    customerId,
                    keywordResourceName,
                    keyword: keyword?.text,
                    result,
                    message: `✅ Keyword "${keyword?.text}" paused successfully - will stop serving immediately`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to pause keyword', error);
            throw error;
        }
    },
};
//# sourceMappingURL=keywords-update.js.map