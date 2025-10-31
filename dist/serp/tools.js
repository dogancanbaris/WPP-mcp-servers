/**
 * MCP Tools for Bright Data SERP API
 * Google search results, rank tracking, SERP features
 */
import { getSerpApiClient } from './client.js';
import { getLogger } from '../shared/logger.js';
import { injectGuidance } from '../shared/interactive-workflow.js';
const logger = getLogger('serp.tools');
/**
 * Search Google (web results)
 */
export const searchGoogleTool = {
    name: 'search_google',
    description: 'Get Google search results for keyword research and rank tracking.',
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
        required: [],
    },
    async handler(input) {
        try {
            const { query, numResults = 10, location, device = 'desktop', gl, hl } = input;
            // Discovery: Prompt for query if missing
            if (!query) {
                const guidanceText = `🔍 GOOGLE SERP RESEARCH

**What is SERP Data?**
Get live Google search results - see who ranks for keywords, identify SERP features, track competitors.

**What You'll Get:**
- Organic results (title, URL, snippet, position 1-100)
- Featured snippets (position 0)
- People Also Ask boxes
- Related searches
- Knowledge panels
- Shopping results
- Local pack (if location-based query)

**Example Queries:**

**Keyword Research:**
- "digital marketing agency NYC"
- "SEO services" (see top competitors)
- "how to optimize website" (check for featured snippet)

**Rank Tracking:**
- "best CRM software" (find your position)
- "email marketing tools" (competitor analysis)

**Local SEO:**
- "pizza near me" (check local pack)
- "dentist in Chicago" (localized results)

**Parameters You Can Specify:**
- numResults: 10-100 (default: 10)
- location: "New York, NY" (for local results)
- device: desktop, mobile, tablet (default: desktop)
- gl: Country code (us, uk, ca)
- hl: Language code (en, es, fr)

🎯 **What keyword would you like to research?**
Provide: query parameter with your search term`;
                return injectGuidance({}, guidanceText);
            }
            const client = getSerpApiClient();
            logger.info('Searching Google', { query, numResults });
            const results = await client.search(query, {
                num: numResults,
                location,
                device,
                gl,
                hl,
            });
            // Analyze SERP features
            const organicResults = results.organic || [];
            const featuredSnippet = results.featured_snippet || null;
            const relatedSearches = results.related_searches || [];
            const peopleAlsoAsk = results.people_also_ask || [];
            const localPack = results.local_results || null;
            const guidanceText = `🔍 SERP ANALYSIS: "${query}"

**Search Parameters:**
- Results: ${numResults}
- Device: ${device}
- Location: ${location || 'Global'}
- Country: ${gl || 'Default'}
- Language: ${hl || 'Default'}

**Organic Results Found:** ${organicResults.length}

${organicResults.slice(0, 5).map((result, i) => `${i + 1}. **${result.title}**
   URL: ${result.link}
   Snippet: ${result.snippet?.substring(0, 100)}...`).join('\n\n')}

${organicResults.length > 5 ? `\n... and ${organicResults.length - 5} more results\n` : ''}

**SERP Features Detected:**

${featuredSnippet ? `✅ **Featured Snippet** (Position 0)
   Title: ${featuredSnippet.title}
   Domain: ${featuredSnippet.domain}
   Type: ${featuredSnippet.type || 'paragraph'}

   **Opportunity:** Optimize content to capture this featured snippet!
` : '❌ No featured snippet'}

${peopleAlsoAsk.length > 0 ? `✅ **People Also Ask** (${peopleAlsoAsk.length} questions)
${peopleAlsoAsk.slice(0, 3).map((q) => `   • ${q.question}`).join('\n')}
${peopleAlsoAsk.length > 3 ? `   ... and ${peopleAlsoAsk.length - 3} more` : ''}

   **Opportunity:** Create content answering these questions!
` : '❌ No People Also Ask box'}

${localPack ? `✅ **Local Pack** (Map results)
   ${localPack.places?.length || 0} businesses shown

   **Opportunity:** Optimize Google Business Profile for local rankings!
` : '❌ No local pack'}

${relatedSearches.length > 0 ? `✅ **Related Searches** (${relatedSearches.length})
${relatedSearches.slice(0, 5).map((s) => `   • ${s.query}`).join('\n')}

   **Opportunity:** Target these related keywords!
` : ''}

**Competitive Analysis:**

**Top 3 Domains:**
${organicResults.slice(0, 3).map((r, i) => `${i + 1}. ${r.domain || new URL(r.link).hostname}`).join('\n')}

**Your Position:**
${organicResults.findIndex((r) => r.link.includes('your-domain.com')) + 1 || 'Not in top results'}

💡 **WHAT YOU CAN DO NEXT:**
   • Track rankings: Run this weekly to monitor position changes
   • Target featured snippet: Analyze winning content format
   • Expand keywords: Use related searches for keyword discovery
   • Analyze competitors: Visit top 3 domains to understand their strategy
   • Check mobile SERP: Run again with device="mobile"
   • Local optimization: Add location parameter for local SEO`;
            return injectGuidance({
                query,
                device,
                location,
                organic: organicResults,
                featuredSnippet,
                peopleAlsoAsk,
                relatedSearches,
                localPack,
                totalResults: organicResults.length,
            }, guidanceText);
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