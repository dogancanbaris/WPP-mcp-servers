/**
 * Get Realtime Users Tool
 *
 * MCP tool for retrieving real-time active user data.
 */
import { RunRealtimeReportSchema } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractOAuthToken, createAnalyticsDataClient, createGoogleAnalyticsAdminClient } from '../../../shared/oauth-client-factory.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps, formatNumber } from '../../../shared/interactive-workflow.js';
const logger = getLogger('analytics.tools.reporting.get-realtime-users');
/**
 * Get realtime users
 */
export const getRealtimeUsersTool = {
    name: 'get_realtime_users',
    description: 'Get real-time active users and live traffic data (last 30 minutes).',
    inputSchema: {
        type: 'object',
        properties: {
            propertyId: {
                type: 'string',
                description: 'GA4 Property ID',
            },
            dimensions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Dimensions for realtime data (e.g., ["unifiedScreenName", "deviceCategory"])',
            },
            metrics: {
                type: 'array',
                items: { type: 'string' },
                description: 'Metrics for realtime (e.g., ["activeUsers", "screenPageViews"])',
            },
            limit: {
                type: 'number',
                description: 'Max rows (default: 10)',
            },
        },
        required: [], // Make all params optional for discovery mode
    },
    async handler(input) {
        try {
            const { propertyId, dimensions, metrics, limit } = input;
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
                    step: '1/2',
                    title: 'SELECT GA4 PROPERTY FOR REAL-TIME MONITORING',
                    items: properties,
                    itemFormatter: (p, i) => `${i + 1}. ${p.displayName || 'Untitled'}\n   Property ID: ${p.propertyId}\n   Timezone: ${p.timeZone || 'N/A'}`,
                    prompt: 'Which property would you like to monitor?',
                    nextParam: 'propertyId',
                    emoji: '📡',
                });
            }
            // ═══ STEP 2: EXECUTE WITH ANALYSIS ═══
            RunRealtimeReportSchema.parse(input);
            // Create Analytics client with user's OAuth token
            const client = createAnalyticsDataClient(oauthToken);
            logger.info('Running realtime Analytics report', { propertyId });
            const [response] = await client.runRealtimeReport({
                property: `properties/${propertyId}`,
                dimensions: dimensions?.map((d) => ({ name: d })),
                metrics: metrics?.map((m) => ({ name: m })) || [{ name: 'activeUsers' }],
                limit: limit || 10,
            });
            const rowCount = parseInt(String(response.rowCount || 0));
            const dimensionNames = (response.dimensionHeaders || []).map((h) => h.name);
            const metricNames = (response.metricHeaders || []).map((h) => h.name);
            // Calculate total active users
            let totalActiveUsers = 0;
            if (response.rows && response.rows.length > 0) {
                // If no dimensions, total is in first row
                if (dimensionNames.length === 0) {
                    totalActiveUsers = parseInt(response.rows[0]?.metricValues?.[0]?.value || '0');
                }
                else {
                    // If dimensions, sum all rows
                    totalActiveUsers = response.rows.reduce((sum, row) => {
                        return sum + parseInt(row.metricValues[0]?.value || '0');
                    }, 0) || 0;
                }
            }
            // Build insights
            const insights = [];
            if (totalActiveUsers === 0) {
                insights.push('⚠️ No active users detected in last 30 minutes');
                insights.push('💡 Check if tracking code is installed and working');
            }
            else if (totalActiveUsers < 5) {
                insights.push(`✅ ${totalActiveUsers} active user${totalActiveUsers === 1 ? '' : 's'} detected`);
                insights.push('💡 Low traffic - consider checking during peak hours');
            }
            else if (totalActiveUsers >= 100) {
                insights.push(`✅ Strong live traffic: ${formatNumber(totalActiveUsers)} active users!`);
            }
            else {
                insights.push(`✅ ${formatNumber(totalActiveUsers)} active users in last 30 minutes`);
            }
            // Top pages/sources
            let topItems = '';
            if (response.rows && response.rows.length > 0 && dimensionNames.length > 0) {
                const sorted = [...response.rows].sort((a, b) => {
                    const aVal = parseInt(a.metricValues[0]?.value || '0');
                    const bVal = parseInt(b.metricValues[0]?.value || '0');
                    return bVal - aVal;
                });
                const top5 = sorted.slice(0, 5);
                topItems = `\n📊 TOP ${dimensionNames[0].toUpperCase()} (Live):\n` +
                    top5.map((row, i) => {
                        const dimValue = row.dimensionValues[0]?.value || 'Unknown';
                        const metricValue = row.metricValues[0]?.value || '0';
                        return `   ${i + 1}. ${dimValue}: ${formatNumber(parseInt(metricValue))} users`;
                    }).join('\n');
            }
            const guidanceText = `📡 REAL-TIME TRAFFIC ANALYSIS

**Property:** ${propertyId}
**Timeframe:** Last 30 minutes
**Active Users:** ${formatNumber(totalActiveUsers)}
**Dimensions:** ${dimensionNames.join(', ') || 'None (total only)'}
**Metrics:** ${metricNames.join(', ')}${topItems}

${insights.length > 0 ? `\n💡 INSIGHTS:\n${insights.map(i => `   ${i}`).join('\n')}\n` : ''}
${formatNextSteps([
                'Check pages: Add dimension "unifiedScreenName" to see what pages users are viewing',
                'Traffic sources: Add dimensions ["sessionSource", "sessionMedium"] to see where users came from',
                'Device breakdown: Add dimension "deviceCategory" for mobile vs desktop',
                'Historical data: use run_analytics_report for deeper analysis'
            ])}

Real-time data refreshes every few seconds.`;
            return injectGuidance({
                propertyId,
                timeframe: 'Last 30 minutes',
                dimensions: dimensionNames,
                metrics: metricNames,
                rows: response.rows || [],
                rowCount,
                totalActiveUsers,
                message: `${totalActiveUsers} active user${totalActiveUsers === 1 ? '' : 's'} in last 30 minutes`,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to run realtime Analytics report', error);
            throw error;
        }
    },
};
//# sourceMappingURL=get-realtime-users.tool.js.map