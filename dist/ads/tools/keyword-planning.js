/**
 * MCP Tools for Google Ads Keyword Planning
 * Includes: KeywordPlanService, KeywordPlanIdeaService
 */
import { getLogger } from '../../shared/logger.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps, formatNumber } from '../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.keyword-planning');
/**
 * Generate keyword ideas
 */
export const generateKeywordIdeasTool = {
    name: 'generate_keyword_ideas',
    description: 'Generate keyword ideas and search volume data for campaign planning.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            seedKeywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Seed keywords to generate ideas from',
            },
            pageUrl: {
                type: 'string',
                description: 'URL to generate keywords for (optional)',
            },
            languageCode: {
                type: 'string',
                description: 'Language code (e.g., "en", default: "en")',
            },
            geoTargetIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Geographic target IDs (e.g., ["2840"] for USA)',
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
                    prompt: 'Which account would you like to research keywords for?',
                    nextParam: 'customerId',
                });
            }
            const { customerId, seedKeywords = [], pageUrl, languageCode = 'en', geoTargetIds = ['2840'] } = input;
            const customer = client.getCustomer(customerId);
            logger.info('Generating keyword ideas', { customerId, seedKeywordCount: seedKeywords.length });
            const request = {
                customer_id: customerId,
                language: `languageconstants/${languageCode}`,
                geo_target_constants: geoTargetIds.map((id) => `geoTargetConstants/${id}`),
            };
            if (seedKeywords.length > 0) {
                request.keyword_seed = {
                    keywords: seedKeywords,
                };
            }
            if (pageUrl) {
                request.url_seed = {
                    url: pageUrl,
                };
            }
            const response = await customer.keywordPlanIdeas.generateKeywordIdeas(request);
            const keywordIdeas = [];
            const ideas = response.results || [];
            for (const idea of ideas) {
                keywordIdeas.push({
                    keyword: idea.text || '',
                    avgMonthlySearches: parseInt(String(idea.keyword_idea_metrics?.avg_monthly_searches || 0)),
                    competition: idea.keyword_idea_metrics?.competition || 'UNSPECIFIED',
                    lowTopPageBid: idea.keyword_idea_metrics?.low_top_of_page_bid_micros
                        ? parseFloat(String(idea.keyword_idea_metrics.low_top_of_page_bid_micros)) / 1000000
                        : undefined,
                    highTopPageBid: idea.keyword_idea_metrics?.high_top_of_page_bid_micros
                        ? parseFloat(String(idea.keyword_idea_metrics.high_top_of_page_bid_micros)) / 1000000
                        : undefined,
                });
            }
            // Calculate summary stats
            const totalSearchVolume = keywordIdeas.reduce((sum, k) => sum + k.avgMonthlySearches, 0);
            const lowCompKeywords = keywordIdeas.filter(k => k.competition === 'LOW').length;
            const medCompKeywords = keywordIdeas.filter(k => k.competition === 'MEDIUM').length;
            const highCompKeywords = keywordIdeas.filter(k => k.competition === 'HIGH').length;
            const topKeywords = keywordIdeas.sort((a, b) => b.avgMonthlySearches - a.avgMonthlySearches).slice(0, 10);
            // Inject rich guidance into response
            const guidanceText = `🔍 KEYWORD IDEAS GENERATED

**Account:** ${customerId}
**Seed Keywords:** ${seedKeywords.length > 0 ? seedKeywords.join(', ') : pageUrl || 'None (broad search)'}
**Geographic Target:** ${geoTargetIds.join(', ')} (USA: 2840)
**Total Ideas:** ${formatNumber(keywordIdeas.length)}

📊 SEARCH VOLUME & COMPETITION:
• Total Monthly Searches: ${formatNumber(totalSearchVolume)}
• Low Competition: ${lowCompKeywords} keywords
• Medium Competition: ${medCompKeywords} keywords
• High Competition: ${highCompKeywords} keywords

🏆 TOP 10 KEYWORDS BY SEARCH VOLUME:
${topKeywords.map((k, i) => `${i + 1}. "${k.keyword}" - ${formatNumber(k.avgMonthlySearches)} searches/month (${k.competition})`).join('\n')}

💡 KEYWORD RESEARCH INSIGHTS:
- Start with LOW competition keywords for easier rankings
- HIGH competition = more expensive CPCs but potentially higher intent
- Consider search volume vs. relevance tradeoff
- Mix broad and specific keywords for complete coverage

🎯 BEST PRACTICES:
${lowCompKeywords > 0 ? `✅ ${lowCompKeywords} low-competition opportunities found - great for starting!` : '⚠️  No low-competition keywords - may need broader seed terms'}
${medCompKeywords > 0 ? `✅ ${medCompKeywords} medium-competition keywords - balanced opportunity` : ''}
${totalSearchVolume > 10000 ? `✅ Strong search volume potential (${formatNumber(totalSearchVolume)}/month)` : '⚠️  Lower search volume - consider expanding keyword list'}

${formatNextSteps([
                'Add high-potential keywords to campaign: use add_keywords',
                'Create new campaign with these keywords: use create_campaign',
                'Refine search with different seed keywords or URL',
                'Check keyword performance after launch: use get_keyword_performance'
            ])}`;
            return injectGuidance({
                customerId,
                keywordIdeas,
                count: keywordIdeas.length,
                totalSearchVolume,
                lowCompKeywords,
                medCompKeywords,
                highCompKeywords,
                topKeywords: topKeywords.slice(0, 5),
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to generate keyword ideas', error);
            throw error;
        }
    },
};
/**
 * Export keyword planning tools
 */
export const keywordPlanningTools = [generateKeywordIdeasTool];
//# sourceMappingURL=keyword-planning.js.map