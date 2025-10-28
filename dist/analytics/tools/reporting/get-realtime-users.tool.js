/**
 * Get Realtime Users Tool
 *
 * MCP tool for retrieving real-time active user data.
 */
import { RunRealtimeReportSchema } from '../../validation.js';
import { getLogger } from '../../../shared/logger.js';
import { extractOAuthToken, createAnalyticsDataClient } from '../../../shared/oauth-client-factory.js';
const logger = getLogger('analytics.tools.reporting.get-realtime-users');
/**
 * Get realtime users
 */
export const getRealtimeUsersTool = {
    name: 'get_realtime_users',
    description: `Get real-time active users and live traffic data (last 30 minutes).

💡 AGENT GUIDANCE - LIVE MONITORING:

📊 WHAT THIS SHOWS:
- Users active RIGHT NOW (last 30 minutes)
- What pages/screens they're viewing
- Where traffic is coming from this moment
- Live event tracking

🎯 USE CASES:
- "How many users are on the site right now?"
- "What pages are people viewing currently?"
- "Is the campaign launch driving traffic?"
- "Check if tracking is working after deployment"
- "Monitor during high-traffic events"

⚠️ DATA NOTES:
- Shows last 30 minutes of activity (60 for GA360)
- Updates within seconds of user activity
- Fewer dimensions/metrics than standard reports
- May have 1-2 minute delay for some data

💡 COMMON REALTIME QUERIES:

**Active Users:**
- metrics: ["activeUsers"]

**Live Pages:**
- dimensions: ["unifiedScreenName"]
- metrics: ["screenPageViews", "activeUsers"]

**Traffic Sources Now:**
- dimensions: ["sessionSource", "sessionMedium"]
- metrics: ["activeUsers"]

**Device Breakdown:**
- dimensions: ["deviceCategory"]
- metrics: ["activeUsers"]`,
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
        required: ['propertyId'],
    },
    async handler(input) {
        try {
            RunRealtimeReportSchema.parse(input);
            const { propertyId, dimensions, metrics, limit } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Analytics API access');
            }
            // Create Analytics client with user's OAuth token
            const client = createAnalyticsDataClient(oauthToken);
            logger.info('Running realtime Analytics report', { propertyId });
            const [response] = await client.runRealtimeReport({
                property: `properties/${propertyId}`,
                dimensions: dimensions?.map((d) => ({ name: d })),
                metrics: metrics?.map((m) => ({ name: m })) || [{ name: 'activeUsers' }],
                limit: limit || 10,
            });
            return {
                success: true,
                data: {
                    propertyId,
                    timeframe: 'Last 30 minutes',
                    dimensions: (response.dimensionHeaders || []).map((h) => h.name),
                    metrics: (response.metricHeaders || []).map((h) => h.name),
                    rows: response.rows || [],
                    rowCount: parseInt(String(response.rowCount || 0)),
                    message: `${response.rowCount || 0} active user segment(s) in last 30 minutes`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to run realtime Analytics report', error);
            throw error;
        }
    },
};
//# sourceMappingURL=get-realtime-users.tool.js.map