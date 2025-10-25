/**
 * MCP Tools for Google Analytics Reporting
 */

import { RunReportSchema, RunRealtimeReportSchema } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { extractOAuthToken, createAnalyticsDataClient } from '../../shared/oauth-client-factory.js';

const logger = getLogger('analytics.tools.reporting');

/**
 * Run Analytics report (MAIN FLEXIBLE REPORTING TOOL)
 */
export const runAnalyticsReportTool = {
  name: 'run_analytics_report',
  description: `Run a custom Google Analytics report with any combination of dimensions and metrics.

💡 AGENT GUIDANCE - MOST POWERFUL ANALYTICS TOOL:

🎯 THIS IS YOUR PRIMARY ANALYTICS TOOL:
- Supports 100+ dimensions and 200+ metrics
- Combine freely to create any report
- Flexible date ranges
- This single tool can answer 90% of analytics questions

📊 COMMON DIMENSION CATEGORIES:

**Traffic Sources:**
- sessionSource, sessionMedium, sessionCampaign
- firstUserSource, firstUserMedium (acquisition)
- sessionDefaultChannelGroup

**Content:**
- pagePath, pageTitle, landingPage, exitPage
- screenPageViews by page

**User Demographics:**
- country, city, region
- deviceCategory, browser, operatingSystem
- userAgeBracket, userGender

**Time:**
- date, year, month, week, dayOfWeek, hour

**Events:**
- eventName, customEvent:{parameter_name}

**E-commerce:**
- itemName, itemCategory, itemBrand
- transactionId

📈 COMMON METRIC CATEGORIES:

**Users & Sessions:**
- activeUsers, newUsers, totalUsers
- sessions, sessionsPerUser, averageSessionDuration

**Engagement:**
- screenPageViews, engagementRate, engagedSessions
- eventCount, eventsPerSession

**Conversions & Revenue:**
- conversions, keyEvents
- totalRevenue, purchaseRevenue, ecommercePurchases
- transactions, averagePurchaseRevenue

**Advertising:**
- advertiserAdClicks, advertiserAdCost, advertiserAdImpressions

🎯 EXAMPLE REPORT COMBINATIONS:

**Traffic Overview:**
- dimensions: []
- metrics: ["activeUsers", "sessions", "screenPageViews", "engagementRate"]

**Traffic Sources:**
- dimensions: ["sessionSource", "sessionMedium", "sessionCampaign"]
- metrics: ["activeUsers", "sessions", "conversions", "totalRevenue"]

**Top Pages:**
- dimensions: ["pagePath", "pageTitle"]
- metrics: ["screenPageViews", "averageSessionDuration", "bounceRate"]

**Geographic Analysis:**
- dimensions: ["country", "city"]
- metrics: ["activeUsers", "conversions", "purchaseRevenue"]

**Device Performance:**
- dimensions: ["deviceCategory", "browser"]
- metrics: ["users", "sessions", "conversionRate"]

**E-commerce Products:**
- dimensions: ["itemName", "itemCategory"]
- metrics: ["itemRevenue", "itemsViewed", "itemsPurchased", "cartToViewRate"]

**Daily Trends:**
- dimensions: ["date"]
- metrics: ["activeUsers", "sessions", "conversions", "revenue"]

⚠️ COMPATIBILITY NOTES:
- Not all dimension/metric combinations work together
- Limit to 9 dimensions and 10 metrics per request
- Some metrics only work with specific dimensions
- Use simple combinations if errors occur

💡 DATE RANGE OPTIONS:
- Specific dates: "2024-10-01" to "2024-10-17"
- Relative: "7daysAgo" to "yesterday"
- Keywords: "today", "yesterday"
- Can go back 14 months for GA4

📊 RECOMMENDED WORKFLOW:
1. Identify the question to answer
2. Choose relevant dimensions (group by what?)
3. Choose relevant metrics (measure what?)
4. Set appropriate date range
5. Run report
6. Analyze results

🎯 PRO TIPS:
- Start with fewer dimensions for clarity
- Use date dimension to see trends
- Combine geographic + source dimensions for attribution
- Add deviceCategory to understand mobile vs desktop
- Use limit parameter for top N results`,
  inputSchema: {
    type: 'object' as const,
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
        description:
          'Metrics to measure (e.g., ["activeUsers", "sessions", "conversions"]). Max 10.',
      },
      limit: {
        type: 'number',
        description: 'Max rows to return (default: 100, max: 100000)',
      },
    },
    required: ['propertyId', 'startDate', 'endDate'],
  },
  async handler(input: any) {
    try {
      RunReportSchema.parse(input);

      const { propertyId, startDate, endDate, dimensions, metrics, limit } = input;

      // Extract OAuth token from request
      const oauthToken = extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for Google Analytics API access');
      }

      // Create Analytics client with user's OAuth token
      const client = createAnalyticsDataClient(oauthToken);

      logger.info('Running Analytics report', { propertyId, startDate, endDate });

      const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: dimensions?.map((d: string) => ({ name: d })),
        metrics: metrics?.map((m: string) => ({ name: m })),
        limit: limit || 100,
      });

      return {
        success: true,
        data: {
          propertyId,
          dateRange: { startDate, endDate },
          dimensions: (response.dimensionHeaders || []).map((h: any) => h.name),
          metrics: (response.metricHeaders || []).map((h: any) => h.name),
          rows: response.rows || [],
          rowCount: parseInt(String(response.rowCount || 0)),
          message: `Retrieved ${response.rowCount || 0} row(s) from Google Analytics`,
        },
      };
    } catch (error) {
      logger.error('Failed to run Analytics report', error as Error);
      throw error;
    }
  },
};

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
    type: 'object' as const,
    properties: {
      propertyId: {
        type: 'string',
        description: 'GA4 Property ID',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Dimensions for realtime data (e.g., ["unifiedScreenName", "deviceCategory"])',
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
  async handler(input: any) {
    try {
      RunRealtimeReportSchema.parse(input);

      const { propertyId, dimensions, metrics, limit } = input;

      // Extract OAuth token from request
      const oauthToken = extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for Google Analytics API access');
      }

      // Create Analytics client with user's OAuth token
      const client = createAnalyticsDataClient(oauthToken);

      logger.info('Running realtime Analytics report', { propertyId });

      const [response] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: dimensions?.map((d: string) => ({ name: d })),
        metrics: metrics?.map((m: string) => ({ name: m })) || [{ name: 'activeUsers' }],
        limit: limit || 10,
      });

      return {
        success: true,
        data: {
          propertyId,
          timeframe: 'Last 30 minutes',
          dimensions: (response.dimensionHeaders || []).map((h: any) => h.name),
          metrics: (response.metricHeaders || []).map((h: any) => h.name),
          rows: response.rows || [],
          rowCount: parseInt(String(response.rowCount || 0)),
          message: `${response.rowCount || 0} active user segment(s) in last 30 minutes`,
        },
      };
    } catch (error) {
      logger.error('Failed to run realtime Analytics report', error as Error);
      throw error;
    }
  },
};
