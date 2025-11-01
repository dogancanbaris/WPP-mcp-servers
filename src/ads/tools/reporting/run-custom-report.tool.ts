/**
 * Run Custom Report Tool
 *
 * MCP tool for running flexible Google Ads reports via GAQL (Google Ads Query Language).
 * Supports both direct GAQL queries and query builder mode.
 */

import { z } from 'zod';
import { extractCustomerId } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatCurrency, formatDiscoveryResponse, formatNextSteps, formatNumber, injectGuidance } from '../../../shared/interactive-workflow.js';

const logger = getLogger('ads.tools.reporting.run-custom-report');

/**
 * Zod schema for input validation
 */
const RunCustomReportSchema = z.object({
  customerId: z.string().optional(),
  query: z.string().optional(),
  resource: z
    .enum(['campaign', 'ad_group', 'keyword_view', 'ad_group_ad', 'search_term_view'])
    .optional(),
  metrics: z.array(z.string()).optional(),
  dimensions: z.array(z.string()).optional(),
  filters: z.record(z.string()).optional(),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  orderBy: z.string().optional(),
  limit: z.number().optional(),
  // OAuth headers (injected by server)
  headers: z.record(z.string()).optional(),
});

/**
 * Build GAQL query from parameters
 */
function buildGAQLQuery(config: {
  resource: string;
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, string>;
  dateRange?: { start: string; end: string };
  orderBy?: string;
  limit?: number;
}): string {
  const { resource, metrics = [], dimensions = [], filters = {}, dateRange, orderBy, limit = 1000 } = config;

  // Build SELECT clause
  const allFields = [...dimensions, ...metrics];
  if (allFields.length === 0) {
    throw new Error('At least one metric or dimension is required');
  }

  let query = `SELECT ${allFields.join(', ')}\nFROM ${resource}`;

  // Build WHERE clause
  const whereClauses: string[] = [];

  // Add date range filter
  if (dateRange) {
    whereClauses.push(`segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'`);
  }

  // Add custom filters
  Object.entries(filters).forEach(([field, value]) => {
    whereClauses.push(`${field} ${value}`);
  });

  if (whereClauses.length > 0) {
    query += `\nWHERE ${whereClauses.join(' AND ')}`;
  }

  // Add ORDER BY
  if (orderBy) {
    query += `\nORDER BY ${orderBy}`;
  }

  // Add LIMIT
  query += `\nLIMIT ${limit}`;

  return query;
}

/**
 * Parse and format results
 */
function formatResults(results: any[], query: string): string {
  if (results.length === 0) {
    return '📊 No results found for this query.\n\n💡 Try adjusting your filters or date range.';
  }

  // Get sample row for column detection
  const sampleRow = results[0];
  const columns = Object.keys(sampleRow);

  // Calculate some basic stats
  const totalRows = results.length;

  // Try to identify metric columns (numeric values)
  const metricColumns = columns.filter((col: any) => {
    const value = sampleRow[col];
    return typeof value === 'number' || (typeof value === 'object' && value?.value !== undefined);
  });

  let output = `📊 CUSTOM REPORT RESULTS

**Query Executed:**
\`\`\`sql
${query}
\`\`\`

**Results:** ${formatNumber(totalRows)} rows returned
**Columns:** ${columns.length} (${columns.join(', ')})

`;

  // Show top 10 rows
  output += `**TOP 10 ROWS:**\n\n`;
  results.slice(0, 10).forEach((row, i) => {
    output += `${i + 1}. `;
    columns.forEach((col, idx) => {
      const value = row[col];
      let formatted = value;

      // Format based on type
      if (typeof value === 'object' && value !== null) {
        formatted = value.value ?? JSON.stringify(value);
      } else if (typeof value === 'number') {
        // Check if it's a cost field (micros)
        if (col.includes('cost') || col.includes('cpc') || col.includes('cpm')) {
          formatted = formatCurrency(value / 1000000);
        } else {
          formatted = formatNumber(value);
        }
      }

      output += `${col}: ${formatted}${idx < columns.length - 1 ? ' | ' : ''}`;
    });
    output += '\n';
  });

  if (totalRows > 10) {
    output += `\n... and ${totalRows - 10} more rows\n`;
  }

  // Add aggregate stats for metrics
  if (metricColumns.length > 0) {
    output += `\n**AGGREGATE METRICS:**\n`;
    metricColumns.forEach((col) => {
      const sum = results.reduce((acc: number, row: any) => {
        const value = row[col];
        const numValue =
          typeof value === 'number'
            ? value
            : typeof value === 'object' && value?.value !== undefined
            ? value.value
            : 0;
        return acc + numValue;
      }, 0);

      let formatted = formatNumber(sum);
      if (col.includes('cost') || col.includes('cpc') || col.includes('cpm')) {
        formatted = formatCurrency(sum / 1000000);
      }

      output += `- Total ${col}: ${formatted}\n`;
    });
  }

  return output;
}

/**
 * Run custom report tool
 */
export const runCustomReportTool = {
  name: 'run_custom_report',
  description: 'Run flexible Google Ads reports via GAQL or query builder.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      query: {
        type: 'string',
        description: 'Direct GAQL query (alternative to query builder)',
      },
      resource: {
        type: 'string',
        enum: ['campaign', 'ad_group', 'keyword_view', 'ad_group_ad', 'search_term_view'],
        description: 'Resource to query (for query builder)',
      },
      metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics to retrieve (for query builder)',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions to retrieve (for query builder)',
      },
      filters: {
        type: 'object',
        description: 'Filters as field: value pairs (for query builder)',
      },
      dateRange: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' },
        },
        description: 'Date range (for query builder)',
      },
      orderBy: {
        type: 'string',
        description: 'ORDER BY clause (for query builder)',
      },
      limit: {
        type: 'number',
        description: 'Maximum rows to return (default: 1000)',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const validated = RunCustomReportSchema.parse(input);
      const { customerId, query, resource, metrics, dimensions, filters, dateRange, orderBy, limit } =
        validated;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error(
          'Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.'
        );
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn: any) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account would you like to query?',
          nextParam: 'customerId',
          emoji: '📊',
        });
      }

      // ═══ QUERY METHOD SELECTION ═══
      if (!query && !resource) {
        const guidanceText = `🔍 CUSTOM REPORT - FLEXIBLE QUERY BUILDER (Step 2/3)

**Account:** ${customerId}

You can run reports in two ways:

**METHOD 1: Direct GAQL Query (Advanced)**
Provide complete GAQL query in the \`query\` parameter:

\`\`\`sql
SELECT campaign.name, metrics.clicks, metrics.impressions
FROM campaign
WHERE metrics.clicks > 100
ORDER BY metrics.clicks DESC
LIMIT 50
\`\`\`

**METHOD 2: Query Builder (Guided)**
Provide structured parameters:
- \`resource\`: 'campaign', 'ad_group', 'keyword_view', 'ad_group_ad', 'search_term_view'
- \`metrics\`: ['metrics.clicks', 'metrics.impressions', 'metrics.cost_micros']
- \`dimensions\`: ['campaign.name', 'segments.device', 'segments.date']
- \`filters\`: { 'metrics.clicks': '> 100', 'campaign.status': '= ENABLED' }
- \`dateRange\`: { start: '2025-10-01', end: '2025-10-31' }
- \`orderBy\`: 'metrics.clicks DESC'
- \`limit\`: 1000 (optional, default: 1000)

**COMMON USE CASES:**

**Search Terms with Quality Score:**
\`\`\`json
{
  "resource": "keyword_view",
  "metrics": ["metrics.clicks", "metrics.impressions", "metrics.ctr", "metrics.cost_micros"],
  "dimensions": ["keyword_view.resource_name", "ad_group_criterion.keyword.text", "ad_group_criterion.quality_info.quality_score"],
  "filters": { "ad_group_criterion.quality_info.quality_score": "> 5" }
}
\`\`\`

**Campaign Performance by Device:**
\`\`\`json
{
  "resource": "campaign",
  "metrics": ["metrics.clicks", "metrics.impressions", "metrics.conversions"],
  "dimensions": ["campaign.name", "segments.device"],
  "dateRange": { "start": "2025-10-01", "end": "2025-10-31" }
}
\`\`\`

💡 Which method would you like to use?
- Direct GAQL: Provide \`query\` parameter
- Query Builder: Provide \`resource\`, \`metrics\`, \`dimensions\` (optional: filters, dateRange, orderBy, limit)`;

        return injectGuidance({ customerId }, guidanceText);
      }

      // ═══ BUILD OR USE QUERY ═══
      let finalQuery: string;

      if (query) {
        // Method 1: Direct GAQL
        finalQuery = query;
        logger.info('Using direct GAQL query', { customerId, query });
      } else if (resource) {
        // Method 2: Query builder
        if (!metrics && !dimensions) {
          const guidanceText = `⚠️ QUERY BUILDER - METRICS/DIMENSIONS REQUIRED (Step 3/3)

**Account:** ${customerId}
**Resource:** ${resource}

At least one metric or dimension is required.

**Available Metrics (Common):**
- metrics.clicks
- metrics.impressions
- metrics.ctr
- metrics.cost_micros
- metrics.conversions
- metrics.conversion_value
- metrics.average_cpc
- metrics.average_cpm

**Available Dimensions (Common):**
- campaign.name, campaign.id, campaign.status
- ad_group.name, ad_group.id, ad_group.status
- segments.device (MOBILE, DESKTOP, TABLET)
- segments.date
- segments.day_of_week
- segments.ad_network_type

**Example:**
\`\`\`json
{
  "metrics": ["metrics.clicks", "metrics.impressions", "metrics.cost_micros"],
  "dimensions": ["campaign.name", "segments.device"]
}
\`\`\`

💡 Provide \`metrics\` and/or \`dimensions\` arrays to build your query.`;

          return injectGuidance({ customerId, resource }, guidanceText);
        }

        finalQuery = buildGAQLQuery({
          resource,
          metrics,
          dimensions,
          filters,
          dateRange,
          orderBy,
          limit,
        });

        logger.info('Built GAQL query from parameters', { customerId, finalQuery });
      } else {
        throw new Error('Either query or resource must be provided');
      }

      // ═══ EXECUTE QUERY ═══
      logger.info('Executing custom report', { customerId, query: finalQuery });

      const customer = client.getCustomer(customerId);
      const results = await customer.query(finalQuery);

      logger.info('Custom report executed', { customerId, resultCount: results.length });

      // ═══ FORMAT RESULTS WITH ANALYSIS ═══
      const formattedResults = formatResults(results, finalQuery);

      const guidanceText = `${formattedResults}

💡 **ANALYSIS & INSIGHTS:**

This custom report provides flexible data exploration beyond standard reports.

**Key Use Cases:**
- Quality Score analysis → Identify low-quality keywords
- Device performance → Optimize by device type
- Search term mining → Discover new keyword opportunities
- Ad copy testing → Compare ad performance
- Budget allocation → Analyze spend by dimension

${formatNextSteps([
  'Refine query: adjust filters, date range, or metrics',
  'Compare time periods: run for different date ranges',
  'Drill down: query related resources (e.g., campaign → ad_group → keyword)',
  'Export results: use structured data output for further analysis',
  'Take action: use other tools to update campaigns, keywords, budgets based on insights',
])}

Full results (${results.length} rows) available in structured output.
Raw GAQL query is available for reuse or modification.`;

      return injectGuidance(
        {
          customerId,
          query: finalQuery,
          results,
          count: results.length,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to run custom report', error as Error);
      throw error;
    }
  },
};
