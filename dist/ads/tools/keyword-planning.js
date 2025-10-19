/**
 * MCP Tools for Google Ads Keyword Planning
 * Includes: KeywordPlanService, KeywordPlanIdeaService
 */
import { getGoogleAdsClient } from '../client.js';
import { getLogger } from '../../shared/logger.js';
const logger = getLogger('ads.tools.keyword-planning');
/**
 * Generate keyword ideas
 */
export const generateKeywordIdeasTool = {
    name: 'generate_keyword_ideas',
    description: `Generate keyword ideas and search volume data for campaign planning.

💡 AGENT GUIDANCE - KEYWORD RESEARCH:

🎯 WHAT THIS DOES:
- Discover new keyword opportunities
- Get search volume and competition data
- Find related keywords and phrases
- Estimate traffic potential

📊 DATA PROVIDED:
- Keyword text
- Average monthly searches
- Competition level (LOW, MEDIUM, HIGH)
- Suggested bid ranges
- Search trends (rising/declining)

💡 USE CASES:
- "Find keyword ideas for 'digital marketing'"
- "Get search volume for 100 keywords"
- "Discover related keywords for campaign"
- "Research keywords for new product launch"

🎯 BEST PRACTICES:
- Start with seed keywords (2-5 core terms)
- Review competition level - LOW is easier to rank
- Check search trends - rising keywords = opportunities
- Use for both campaign planning and content strategy`,
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
        required: ['customerId'],
    },
    async handler(input) {
        try {
            const { customerId, seedKeywords = [], pageUrl, languageCode = 'en', geoTargetIds = ['2840'] } = input;
            const client = getGoogleAdsClient();
            logger.info('Generating keyword ideas', { customerId, seedKeywordCount: seedKeywords.length });
            const customer = client.getCustomer(customerId);
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
            return {
                success: true,
                data: {
                    customerId,
                    keywordIdeas,
                    count: keywordIdeas.length,
                    message: `Generated ${keywordIdeas.length} keyword idea(s)`,
                },
            };
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