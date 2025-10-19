/**
 * MCP Tools for Bright Data SERP API
 * Google search results, rank tracking, SERP features
 */
import { getSerpApiClient } from './client.js';
import { getLogger } from '../shared/logger.js';
const logger = getLogger('serp.tools');
/**
 * Search Google (web results)
 */
export const searchGoogleTool = {
    name: 'search_google',
    description: `Get Google search results for keyword research and rank tracking.

💡 AGENT GUIDANCE - SERP DATA:

🎯 WHAT THIS DOES:
- Get organic search results from Google
- Track keyword rankings
- Analyze SERP features
- Monitor competitor positions

📊 WHAT YOU'LL GET:
- Organic results (title, URL, snippet, position)
- Featured snippets
- People Also Ask
- Related searches
- Knowledge panel
- Shopping results
- Local pack

💡 USE CASES:
- "Get top 100 results for 'digital marketing agency NYC'"
- "Check our ranking for 'SEO services'"
- "See what SERP features appear for keyword"
- "Track competitor positions"

⚠️ NO LIMITS:
- Unlike Google Custom Search API (100 queries/day, 100 results max)
- Bright Data has no result limits
- Get all 100+ results in one call

📊 BEST PRACTICES:
- Track rankings weekly for core keywords
- Monitor SERP features (featured snippet opportunities)
- Analyze top 10 competitors
- Check local pack for local SEO`,
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Search query/keyword',
            },
            numResults: {
                type: 'number',
                description: 'Number of results to return (default: 10, max: 100)',
            },
            location: {
                type: 'string',
                description: 'Location for localized results (e.g., "New York, NY")',
            },
            device: {
                type: 'string',
                enum: ['desktop', 'mobile', 'tablet'],
                description: 'Device type for results (default: desktop)',
            },
            gl: {
                type: 'string',
                description: 'Country code (e.g., "us", "uk")',
            },
            hl: {
                type: 'string',
                description: 'Language code (e.g., "en", "es")',
            },
        },
        required: ['query'],
    },
    async handler(input) {
        try {
            const { query, numResults = 10, location, device = 'desktop', gl, hl } = input;
            const client = getSerpApiClient();
            logger.info('Searching Google', { query, numResults });
            const results = await client.search(query, {
                num: numResults,
                location,
                device,
                gl,
                hl,
            });
            return {
                success: true,
                data: {
                    query,
                    results,
                    message: `Search completed for "${query}"`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to search Google', error);
            throw error;
        }
    },
};
/**
 * Export SERP tools
 */
export const serpTools = [searchGoogleTool];
//# sourceMappingURL=tools.js.map