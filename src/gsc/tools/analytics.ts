/**
 * MCP Tools for Search Analytics operations
 */

import { extractOAuthToken, createGSCClient } from '../../shared/oauth-client-factory.js';
import { getAuditLogger } from '../audit.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import {
  injectGuidance,
  formatDiscoveryResponse,
  formatNextSteps,
  formatNumber,
} from '../../shared/interactive-workflow.js';

const logger = getLogger('gsc.tools.analytics');

/**
 * Query search analytics tool
 */
export const querySearchAnalyticsTool = {
  name: 'query_search_analytics',
  description:
    'Query search traffic data from Google Search Console with filters and aggregations',
  inputSchema: {
    type: 'object' as const,
    properties: {
      property: {
        type: 'string',
        description: 'Property URL (e.g., sc-domain:example.com)',
      },
      startDate: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format',
      },
      endDate: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Dimensions to group by (query, page, country, device, searchAppearance, date, hour)',
      },
      searchType: {
        type: 'string',
        enum: ['web', 'image', 'video', 'news', 'discover', 'googleNews'],
        description: 'Search type to query',
      },
      rowLimit: {
        type: 'number',
        description: 'Maximum rows to return (1-25000)',
      },
    },
    required: [], // Make all params optional for discovery mode
  },
  async handler(input: any) {
    try {
      const { property, startDate, endDate, dimensions, searchType, rowLimit } = input;

      // Extract OAuth token from request
      const oauthToken = await extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for Google Search Console API access');
      }

      // Create GSC client with user's OAuth token
      const gscClient = createGSCClient(oauthToken);

      // ═══ STEP 1: PROPERTY DISCOVERY ═══
      if (!property) {
        logger.info('Property discovery mode - listing properties');
        const res = await gscClient.sites.list();
        const sites = res.data.siteEntry || [];
        const properties = sites.map((site) => ({
          url: site.siteUrl,
          permissionLevel: site.permissionLevel,
        }));

        return formatDiscoveryResponse({
          step: '1/2',
          title: 'SELECT PROPERTY',
          items: properties,
          itemFormatter: (p, i) =>
            `${i + 1}. ${p.url}\n   Permission: ${p.permissionLevel}`,
          prompt: 'Which property would you like to analyze?',
          nextParam: 'property',
          emoji: '🔍',
        });
      }

      // ═══ STEP 2: DATE RANGE DISCOVERY ═══
      if (!startDate || !endDate) {
        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);
        const last90Days = new Date(today);
        last90Days.setDate(today.getDate() - 90);

        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        const guidanceText = `📅 DATE RANGE SELECTION (Step 2/2)

**Property:** ${property}

Please specify the date range for your search analytics report:

**Quick Options:**
1. Last 7 days: ${formatDate(last7Days)} to ${formatDate(today)}
2. Last 30 days: ${formatDate(last30Days)} to ${formatDate(today)}
3. Last 90 days: ${formatDate(last90Days)} to ${formatDate(today)}

**Custom Range:**
Provide startDate and endDate in YYYY-MM-DD format

**Optional Parameters:**
- dimensions: ["query"], ["page"], ["country"], ["device"], or combinations
- searchType: "web" (default), "image", "video", "news"
- rowLimit: 1-25000 (default: 1000)

💡 TIP: Start with "query" dimension to see which keywords drive traffic

What date range would you like to analyze?`;

        return injectGuidance(
          {
            property,
            suggestedRanges: {
              last7Days: { start: formatDate(last7Days), end: formatDate(today) },
              last30Days: { start: formatDate(last30Days), end: formatDate(today) },
              last90Days: { start: formatDate(last90Days), end: formatDate(today) },
            },
          },
          guidanceText
        );
      }

      // ═══ STEP 3: EXECUTE WITH ANALYSIS ═══
      // Validate input
      validateGSCProperty(property);

      const audit = getAuditLogger();

      // Note: Access control removed for full property discovery mode
      // Google API will handle permission errors if user doesn't own the property

      logger.info('Query search analytics requested', {
        property,
        startDate,
        endDate,
        dimensionsCount: dimensions?.length || 0,
        searchType,
      });

      // Build request body
      const requestBody: any = {
        startDate,
        endDate,
      };

      if (dimensions && dimensions.length > 0) {
        requestBody.dimensions = dimensions;
      }

      if (searchType) {
        requestBody.type = searchType;
      }

      if (rowLimit) {
        requestBody.rowLimit = Math.min(rowLimit, 25000);
      } else {
        requestBody.rowLimit = 1000;
      }

      // Query API
      const res = await gscClient.searchanalytics.query({
        siteUrl: property,
        requestBody: requestBody,
      });
      const response = res.data;

      // Format response
      const rows = response.rows || [];
      const formattedRows = rows.map((row: any) => ({
        keys: row.keys,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));

      await audit.logReadOperation('user', 'query_search_analytics', property, {
        startDate,
        endDate,
        rowsReturned: rows.length,
        dimensions: dimensions?.join(','),
      });

      // Calculate summary metrics
      const totalClicks = formattedRows.reduce((sum, row) => sum + (row.clicks || 0), 0);
      const totalImpressions = formattedRows.reduce((sum, row) => sum + (row.impressions || 0), 0);
      const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
      const avgPosition = formattedRows.length > 0
        ? formattedRows.reduce((sum, row) => sum + (row.position || 0), 0) / formattedRows.length
        : 0;

      // Get top performers
      const topByClicks = [...formattedRows].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

      // Generate insights
      const insights: string[] = [];
      if (avgCTR > 0.05) insights.push('✅ Good overall CTR (>5%)');
      else if (avgCTR > 0.02) insights.push('⚠️ CTR could be improved (2-5%)');
      else insights.push('🔴 Low CTR (<2%) - optimize titles and descriptions');

      if (avgPosition < 10) insights.push('✅ Strong average ranking (top 10)');
      else if (avgPosition < 20) insights.push('⚠️ Rankings need improvement (11-20)');
      else insights.push('🔴 Poor rankings (>20) - focus on SEO');

      if (topByClicks.length > 0 && totalClicks > 0) {
        const topQueryPercent = ((topByClicks[0]?.clicks || 0) / totalClicks) * 100;
        if (topQueryPercent > 50) {
          insights.push(`⚠️ Traffic concentrated: Top query = ${topQueryPercent.toFixed(1)}% of clicks`);
        }
      }

      // Build rich guidance text
      const guidanceText = `📊 SEARCH PERFORMANCE ANALYSIS

**Property:** ${property}
**Period:** ${startDate} to ${endDate}
**Grouped by:** ${dimensions?.join(', ') || 'none'}
**Rows:** ${formattedRows.length}

**SUMMARY METRICS:**
- Total Clicks: ${formatNumber(totalClicks)}
- Total Impressions: ${formatNumber(totalImpressions)}
- Average CTR: ${(avgCTR * 100).toFixed(2)}%
- Average Position: ${avgPosition.toFixed(1)}

**TOP 5 PERFORMERS (by clicks):**
${topByClicks.map((row, i) => {
  const key = row.keys?.[0] || 'N/A';
  return `${i + 1}. ${key}
   Clicks: ${formatNumber(row.clicks || 0)} | Impressions: ${formatNumber(row.impressions || 0)}
   CTR: ${((row.ctr || 0) * 100).toFixed(2)}% | Position: ${(row.position || 0).toFixed(1)}`;
}).join('\n\n')}

💡 KEY INSIGHTS:
${insights.map(i => `   • ${i}`).join('\n')}

${formatNextSteps([
  'Identify opportunities: Find high impression, low CTR queries',
  'Check indexing: use inspect_url for underperforming pages',
  'Monitor Core Web Vitals: use get_core_web_vitals_url',
  'Compare time periods: run this query for different date ranges',
  'Analyze by device: add "device" to dimensions array'
])}

Full dataset (${formattedRows.length} rows) available in structured output.`;

      return injectGuidance(
        {
          property,
          dateRange: { start: startDate, end: endDate },
          dimensions: dimensions || [],
          searchType: searchType || 'web',
          rows: formattedRows,
          rowCount: rows.length,
          summary: {
            totalClicks,
            totalImpressions,
            avgCTR,
            avgPosition,
          },
          topPerformers: topByClicks,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to query search analytics', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'query_search_analytics',
        input.property,
        (error as Error).message
      );
      throw error;
    }
  },
};
