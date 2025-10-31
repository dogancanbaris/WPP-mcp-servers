/**
 * Run Analytics Report Tool
 *
 * MCP tool for running custom Google Analytics reports.
 */
import { RunReportSchema } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractOAuthToken, createAnalyticsDataClient, createGoogleAnalyticsAdminClient } from '../../../shared/oauth-client-factory.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps, formatNumber } from '../../../shared/interactive-workflow.js';
const logger = getLogger('analytics.tools.reporting.run-report');
/**
 * Run Analytics report (MAIN FLEXIBLE REPORTING TOOL)
 */
export const runAnalyticsReportTool = {
    name: 'run_analytics_report',
    description: 'Run a custom Google Analytics report with any combination of dimensions and metrics.',
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: {
                type: 'string',
                description: 'GA4 Property ID (e.g., "123456789")',
            },
            startDate: {
                type: 'string',
                description: 'Start date (YYYY-MM-DD, "today", "yesterday", "7daysAgo", etc.)',
            },
            endDate: {
                type: 'string',
                description: 'End date (YYYY-MM-DD, "today", "yesterday", etc.)',
            },
            dimensions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Dimensions to group by (e.g., ["sessionSource", "deviceCategory"]). Max 9.',
            },
            metrics: {
                type: 'array',
                items: { type: 'string' },
                description: 'Metrics to measure (e.g., ["activeUsers", "sessions", "conversions"]). Max 10.',
            },
            limit: {
                type: 'number',
                description: 'Max rows to return (default: 100, max: 100000)',
            },
        },
        required: [], // Make all params optional for discovery mode
    },
    async handler(input) {
        try {
            const { propertyId, startDate, endDate, dimensions, metrics, limit } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // ═══ STEP 1: PROPERTY DISCOVERY ═══
            if (!propertyId) {
                logger.info('Property discovery mode - listing properties');
                const adminClient = createGoogleAnalyticsAdminClient(oauthToken);
                // Get all accounts, then properties
                const accountsRes = await adminClient.accounts.list({});
                const accounts = accountsRes.data.accounts || [];
                let propertyList = [];
                for (const account of accounts) {
                    const res = await adminClient.properties.list({
                        filter: `parent:${account.name}`,
                    });
                    propertyList.push(...(res.data.properties || []));
                }
                const properties = propertyList.map((prop) => ({
                    propertyId: prop.name?.split('/')[1] || '',
                    displayName: prop.displayName,
                    timeZone: prop.timeZone,
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT GA4 PROPERTY',
                    items: properties,
                    itemFormatter: (p, i) => `${i + 1}. ${p.displayName || 'Untitled'}\n   Property ID: ${p.propertyId}\n   Timezone: ${p.timeZone || 'N/A'}`,
                    prompt: 'Which property would you like to analyze?',
                    nextParam: 'propertyId',
                    emoji: '📊',
                });
            }
            // ═══ STEP 2: DATE RANGE DISCOVERY ═══
            if (!startDate || !endDate) {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                const last7Days = new Date(today);
                last7Days.setDate(today.getDate() - 7);
                const last30Days = new Date(today);
                last30Days.setDate(today.getDate() - 30);
                const last90Days = new Date(today);
                last90Days.setDate(today.getDate() - 90);
                const formatDate = (d) => d.toISOString().split('T')[0];
                const guidanceText = `📅 DATE RANGE SELECTION (Step 2/3)

**Property:** ${propertyId}

Please specify the date range for your report:

**Quick Options:**
1. Last 7 days: startDate="${formatDate(last7Days)}", endDate="${formatDate(yesterday)}"
2. Last 30 days: startDate="${formatDate(last30Days)}", endDate="${formatDate(yesterday)}"
3. Last 90 days: startDate="${formatDate(last90Days)}", endDate="${formatDate(yesterday)}"

**Relative Dates:**
- "today", "yesterday"
- "7daysAgo", "30daysAgo"

**Optional Parameters:**
- dimensions: ["sessionSource"], ["pagePath"], ["country", "deviceCategory"], etc. (Max 9)
- metrics: ["activeUsers", "sessions", "conversions"] (Max 10, default: ["activeUsers"])
- limit: 1-100000 (default: 100)

💡 TIP: Use "yesterday" as endDate (today's data is incomplete)

What date range would you like to analyze?`;
                return injectGuidance({
                    propertyId,
                    suggestedRanges: {
                        last7Days: { start: formatDate(last7Days), end: formatDate(yesterday) },
                        last30Days: { start: formatDate(last30Days), end: formatDate(yesterday) },
                        last90Days: { start: formatDate(last90Days), end: formatDate(yesterday) },
                    },
                }, guidanceText);
            }
            // ═══ STEP 3: EXECUTE WITH ANALYSIS ═══
            RunReportSchema.parse(input);
            // Create Analytics client with user's OAuth token
            const client = createAnalyticsDataClient(oauthToken);
            logger.info('Running Analytics report', { propertyId, startDate, endDate });
            const [response] = await client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: dimensions?.map((d) => ({ name: d })),
                metrics: metrics?.map((m) => ({ name: m })) || [{ name: 'activeUsers' }],
                limit: limit || 100,
            });
            const rowCount = parseInt(String(response.rowCount || 0));
            const dimensionNames = (response.dimensionHeaders || []).map((h) => h.name);
            const metricNames = (response.metricHeaders || []).map((h) => h.name);
            // Calculate summary stats from first metric
            let summary = '';
            if (response.rows && response.rows.length > 0 && metricNames.length > 0) {
                const firstMetric = metricNames[0];
                const values = response.rows.map((r) => parseFloat(r.metricValues[0].value || '0'));
                const total = values.reduce((a, b) => a + b, 0);
                const avg = total / values.length;
                const max = Math.max(...values);
                const min = Math.min(...values);
                summary = `\n📊 SUMMARY STATISTICS (${firstMetric}):\n` +
                    `   Total: ${formatNumber(total)}\n` +
                    `   Average: ${formatNumber(avg)}\n` +
                    `   Max: ${formatNumber(max)}\n` +
                    `   Min: ${formatNumber(min)}`;
            }
            // Build insights
            const insights = [];
            if (rowCount === 0) {
                insights.push('⚠️ No data found for this date range and property');
            }
            else if (rowCount >= (limit || 100)) {
                insights.push(`⚠️ Result set limited to ${limit || 100} rows. Consider narrowing date range or adding filters.`);
            }
            if (dimensions && dimensions.length > 3) {
                insights.push('💡 Many dimensions may create sparse data. Consider fewer dimensions for clearer trends.');
            }
            const guidanceText = `📊 ANALYTICS REPORT ANALYSIS

**Property:** ${propertyId}
**Date Range:** ${startDate} to ${endDate}
**Dimensions:** ${dimensionNames.join(', ') || 'None (totals only)'}
**Metrics:** ${metricNames.join(', ')}
**Rows Returned:** ${formatNumber(rowCount)}${summary}

${insights.length > 0 ? `\n💡 INSIGHTS:\n${insights.map(i => `   ${i}`).join('\n')}\n` : ''}
${formatNextSteps([
                'Compare time periods: Change startDate/endDate to see trends',
                'Drill down: Add dimensions like "country" or "deviceCategory"',
                'Check real-time: use get_realtime_users for live data',
                'Configure tracking: use create_custom_dimension for additional data'
            ])}

Report data ready for analysis.`;
            return injectGuidance({
                propertyId,
                dateRange: { startDate, endDate },
                dimensions: dimensionNames,
                metrics: metricNames,
                rows: response.rows || [],
                rowCount,
                message: `Retrieved ${rowCount} row(s) from Google Analytics`,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to run Analytics report', error);
            throw error;
        }
    },
};
//# sourceMappingURL=run-report.tool.js.map