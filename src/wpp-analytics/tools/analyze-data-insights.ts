/**
 * Analyze GSC Data for Insights MCP Tool
 *
 * Queries BigQuery to extract trends, comparisons, and insights from GSC data with interactive discovery.
 */

import { getLogger } from '../../shared/logger.js';
import { formatDiscoveryResponse, injectGuidance } from '../../shared/interactive-workflow.js';
import { createClient } from '@supabase/supabase-js';

const logger = getLogger('wpp-analytics.analyze-insights');

export const analyzeGSCDataForInsightsTool = {
  name: 'analyze_gsc_data_for_insights',
  description: `Analyze GSC data to extract trends and insights.`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      bigqueryTable: {
        type: 'string',
        description: 'Full BigQuery table reference (optional - will be discovered if not provided)'
      },
      dateRange: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 2,
        description: 'Date range [startDate, endDate] (optional - will suggest ranges if not provided)'
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace ID (optional - will be discovered if not provided)'
      }
    },
    required: []
  },

  async handler(input: any) {
    try {
      const { BigQuery } = await import('@google-cloud/bigquery');
      const bigquery = new BigQuery({
        projectId: 'mcp-servers-475317',
        keyFilename: '/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json'
      });

      // STEP 1: Workspace Discovery
      if (!input.workspaceId) {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          return injectGuidance(
            { success: false },
            `❌ CONFIGURATION ERROR

Supabase credentials not configured.

💡 SOLUTION:
Set environment variables:
• SUPABASE_URL
• SUPABASE_SERVICE_ROLE_KEY`
          );
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false }
        });

        const { data: workspaces, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name')
          .order('name');

        if (workspaceError || !workspaces || workspaces.length === 0) {
          return injectGuidance(
            { success: false },
            `⚠️ NO WORKSPACES FOUND

Unable to find any workspaces in the system.

💡 TROUBLESHOOTING:
• Check Supabase connection
• Verify workspaces table exists`
          );
        }

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT WORKSPACE',
          items: workspaces,
          itemFormatter: (ws, i) => `${i + 1}. ${ws.name || 'Unnamed'} (ID: ${ws.id})`,
          prompt: 'Which workspace contains the data to analyze?',
          nextParam: 'workspaceId',
          emoji: '📊'
        });
      }

      // STEP 2: BigQuery Table Discovery
      if (!input.bigqueryTable) {
        // List available datasets for this workspace
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl!, supabaseKey!, {
          auth: { persistSession: false }
        });

        const { data: datasets, error: datasetError } = await supabase
          .from('datasets')
          .select('id, name, bigquery_project_id, bigquery_dataset_id, bigquery_table_id, platform_metadata')
          .eq('workspace_id', input.workspaceId)
          .order('name');

        if (datasetError || !datasets || datasets.length === 0) {
          return injectGuidance(
            { success: false },
            `📊 NO DATASETS FOUND

Workspace has no datasets yet.

💡 WHAT YOU CAN DO:
• Create dataset by pushing platform data: use push_platform_data_to_bigquery
• Verify workspace ID is correct`
          );
        }

        const datasetsWithTableRefs = datasets.map((d) => ({
          ...d,
          fullTableRef: `${d.bigquery_project_id}.${d.bigquery_dataset_id}.${d.bigquery_table_id}`,
          platform: d.platform_metadata?.platform || 'unknown'
        }));

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT DATASET TO ANALYZE',
          items: datasetsWithTableRefs,
          itemFormatter: (d, i) =>
            `${i + 1}. ${d.name}\n   Platform: ${d.platform}\n   Table: ${d.fullTableRef}`,
          prompt: 'Which dataset do you want to analyze?',
          nextParam: 'bigqueryTable',
          emoji: '📊'
        });
      }

      // STEP 3: Date Range Guidance
      if (!input.dateRange) {
        // Query table to get available date range
        const [metadata] = await bigquery.query(`
          SELECT
            MIN(date) as min_date,
            MAX(date) as max_date,
            COUNT(DISTINCT date) as total_days
          FROM \`${input.bigqueryTable}\`
          WHERE date IS NOT NULL
          LIMIT 1
        `);

        if (!metadata || metadata.length === 0) {
          return injectGuidance(
            { success: false },
            `❌ NO DATA IN TABLE

Table "${input.bigqueryTable}" contains no data.

💡 SOLUTION:
• Verify table name is correct
• Check if data has been imported
• Use push_platform_data_to_bigquery to import data`
          );
        }

        const minDate = metadata[0].min_date?.value;
        const maxDate = metadata[0].max_date?.value;
        const totalDays = metadata[0].total_days;

        const suggestions = [
          {
            label: 'Last 7 Days',
            range: [
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              maxDate
            ]
          },
          {
            label: 'Last 30 Days',
            range: [
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              maxDate
            ]
          },
          {
            label: 'Last 90 Days',
            range: [
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              maxDate
            ]
          },
          {
            label: 'All Available Data',
            range: [minDate, maxDate]
          }
        ];

        return injectGuidance(
          {
            suggestions,
            availableRange: { minDate, maxDate, totalDays }
          },
          `📅 SELECT DATE RANGE (Step 3/3)

**Available Data:**
• Earliest date: ${minDate}
• Latest date: ${maxDate}
• Total days: ${totalDays}

**SUGGESTED RANGES:**
${suggestions.map((s, i) => `${i + 1}. ${s.label}: [${s.range[0]}, ${s.range[1]}]`).join('\n')}

💡 WHAT TO PROVIDE:
Provide dateRange as array: ["YYYY-MM-DD", "YYYY-MM-DD"]

**Example:**
\`\`\`json
{
  "bigqueryTable": "${input.bigqueryTable}",
  "dateRange": ["${suggestions[1].range[0]}", "${suggestions[1].range[1]}"]
}
\`\`\``
        );
      }

      // STEP 4: Execute Analysis
      const table = input.bigqueryTable;
      const [startDate, endDate] = input.dateRange;

      logger.info('[analyze_gsc_data_for_insights] Analyzing data', {
        table,
        dateRange: input.dateRange
      });

      // Query 1: Overall totals and averages
      const [totals] = await bigquery.query(`
        SELECT
          SUM(clicks) as total_clicks,
          SUM(impressions) as total_impressions,
          AVG(ctr) as avg_ctr,
          AVG(position) as avg_position
        FROM \`${table}\`
        WHERE query IS NULL AND page IS NULL AND device IS NULL AND country IS NULL
          AND date >= '${startDate}' AND date <= '${endDate}'
        LIMIT 1
      `);

      // Query 2: Top 5 pages by clicks
      const [topPages] = await bigquery.query(`
        SELECT page, SUM(clicks) as clicks, AVG(ctr) as ctr, AVG(position) as position
        FROM \`${table}\`
        WHERE page IS NOT NULL AND query IS NULL AND device IS NULL AND country IS NULL
          AND date >= '${startDate}' AND date <= '${endDate}'
        GROUP BY page
        ORDER BY clicks DESC
        LIMIT 5
      `);

      // Query 3: Top 5 queries by clicks
      const [topQueries] = await bigquery.query(`
        SELECT query, SUM(clicks) as clicks, AVG(position) as position, AVG(ctr) as ctr
        FROM \`${table}\`
        WHERE query IS NOT NULL AND page IS NULL AND device IS NULL AND country IS NULL
          AND date >= '${startDate}' AND date <= '${endDate}'
        GROUP BY query
        ORDER BY clicks DESC
        LIMIT 5
      `);

      // Query 4: Device breakdown
      const [devices] = await bigquery.query(`
        SELECT device, SUM(clicks) as clicks, AVG(ctr) as ctr
        FROM \`${table}\`
        WHERE device IS NOT NULL AND query IS NULL AND page IS NULL AND country IS NULL
          AND date >= '${startDate}' AND date <= '${endDate}'
        GROUP BY device
        ORDER BY clicks DESC
      `);

      // Query 5: Country breakdown
      const [countries] = await bigquery.query(`
        SELECT country, SUM(clicks) as clicks, AVG(ctr) as ctr
        FROM \`${table}\`
        WHERE country IS NOT NULL AND query IS NULL AND page IS NULL AND device IS NULL
          AND date >= '${startDate}' AND date <= '${endDate}'
        GROUP BY country
        ORDER BY clicks DESC
        LIMIT 10
      `);

      // Query 6: Weekly trend (first vs last week)
      const [trend] = await bigquery.query(`
        WITH weekly_data AS (
          SELECT
            DATE_TRUNC(date, WEEK) as week,
            SUM(clicks) as clicks
          FROM \`${table}\`
          WHERE query IS NULL AND page IS NULL AND device IS NULL AND country IS NULL
            AND date >= '${startDate}' AND date <= '${endDate}'
          GROUP BY week
          ORDER BY week
        )
        SELECT
          (SELECT clicks FROM weekly_data ORDER BY week ASC LIMIT 1) as first_week,
          (SELECT clicks FROM weekly_data ORDER BY week DESC LIMIT 1) as last_week
      `);

      // Format insights
      const totalClicks = totals[0]?.total_clicks || 0;
      const totalImpr = totals[0]?.total_impressions || 0;
      const avgCtr = totals[0]?.avg_ctr || 0;
      const avgPosition = totals[0]?.avg_position || 0;

      // Calculate shares
      const topPageShare = topPages[0] ? (topPages[0].clicks / totalClicks * 100).toFixed(0) : 0;
      const mobileData = devices.find((d: any) => d.device === 'MOBILE');
      const desktopData = devices.find((d: any) => d.device === 'DESKTOP');
      const mobileShare = mobileData ? (mobileData.clicks / totalClicks * 100).toFixed(0) : 0;

      // Highest CTR country
      const topCTRCountry = countries.length > 0
        ? countries.reduce((max: any, c: any) => (c.ctr > (max?.ctr || 0) ? c : max), countries[0])
        : null;

      // Trend analysis
      const firstWeek = trend[0]?.first_week || 0;
      const lastWeek = trend[0]?.last_week || 0;
      const trendChange = firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek * 100).toFixed(0) : 'N/A';
      const trendDirection = lastWeek > firstWeek ? 'increasing ↗' : lastWeek < firstWeek ? 'decreasing ↘' : 'stable →';

      const insights = {
        totals: {
          clicks: totalClicks,
          impressions: totalImpr,
          ctr: (avgCtr * 100).toFixed(2) + '%',
          position: avgPosition.toFixed(1)
        },
        trends: {
          firstWeekClicks: firstWeek,
          lastWeekClicks: lastWeek,
          change: trendChange === 'N/A' ? 'N/A' : trendChange + '%',
          direction: trendDirection
        },
        topPerformers: {
          topPage: {
            url: topPages[0]?.page || '',
            clicks: topPages[0]?.clicks || 0,
            share: topPageShare + '%',
            position: topPages[0]?.position?.toFixed(1) || 'N/A'
          },
          topQuery: {
            query: topQueries[0]?.query || '',
            clicks: topQueries[0]?.clicks || 0,
            position: topQueries[0]?.position?.toFixed(1) || 'N/A'
          },
          top5Pages: topPages.map((p: any) => ({
            url: p.page,
            clicks: p.clicks,
            ctr: (p.ctr * 100).toFixed(2) + '%',
            position: p.position?.toFixed(1)
          })),
          top5Queries: topQueries.map((q: any) => ({
            query: q.query,
            clicks: q.clicks,
            position: q.position?.toFixed(1),
            ctr: (q.ctr * 100).toFixed(2) + '%'
          }))
        },
        deviceInsights: {
          mobileShare: mobileShare + '%',
          mobileCTR: mobileData ? (mobileData.ctr * 100).toFixed(2) + '%' : 'N/A',
          desktopCTR: desktopData ? (desktopData.ctr * 100).toFixed(2) + '%' : 'N/A',
          mobileAdvantage: mobileData && desktopData
            ? ((mobileData.ctr / desktopData.ctr - 1) * 100).toFixed(0) + '%'
            : 'N/A'
        },
        geoInsights: {
          topCountry: countries[0]?.country?.toUpperCase() || '',
          topCountryShare: countries[0] ? (countries[0].clicks / totalClicks * 100).toFixed(0) + '%' : '0%',
          highestCTRCountry: topCTRCountry?.country?.toUpperCase() || '',
          highestCTR: topCTRCountry ? (topCTRCountry.ctr * 100).toFixed(2) + '%' : 'N/A',
          top5Countries: countries.slice(0, 5).map((c: any) => ({
            country: c.country?.toUpperCase(),
            clicks: c.clicks,
            ctr: (c.ctr * 100).toFixed(2) + '%'
          }))
        }
      };

      logger.info('[analyze_gsc_data_for_insights] Analysis complete', {
        totalClicks,
        topPage: topPages[0]?.page
      });

      return injectGuidance(
        {
          success: true,
          insights,
          dateRange: input.dateRange,
          table: input.bigqueryTable
        },
        `📊 GSC DATA ANALYSIS COMPLETE

**Period:** ${startDate} to ${endDate}

📈 **OVERALL PERFORMANCE:**
• Total Clicks: ${totalClicks.toLocaleString()}
• Total Impressions: ${totalImpr.toLocaleString()}
• Average CTR: ${(avgCtr * 100).toFixed(2)}%
• Average Position: ${avgPosition.toFixed(1)}

📊 **TREND ANALYSIS:**
• First Week Clicks: ${firstWeek.toLocaleString()}
• Last Week Clicks: ${lastWeek.toLocaleString()}
• Change: ${trendChange}
• Direction: ${trendDirection}

🏆 **TOP PERFORMERS:**

**Top Page:**
• URL: ${topPages[0]?.page || 'N/A'}
• Clicks: ${topPages[0]?.clicks?.toLocaleString() || 0} (${topPageShare}% of total)
• Position: ${topPages[0]?.position?.toFixed(1) || 'N/A'}

**Top Query:**
• Query: "${topQueries[0]?.query || 'N/A'}"
• Clicks: ${topQueries[0]?.clicks?.toLocaleString() || 0}
• Position: ${topQueries[0]?.position?.toFixed(1) || 'N/A'}

**Top 5 Pages:**
${topPages.slice(0, 5).map((p: any, i) => `${i + 1}. ${p.page} - ${p.clicks.toLocaleString()} clicks (Pos: ${p.position?.toFixed(1)})`).join('\n')}

**Top 5 Queries:**
${topQueries.slice(0, 5).map((q: any, i) => `${i + 1}. "${q.query}" - ${q.clicks.toLocaleString()} clicks (Pos: ${q.position?.toFixed(1)})`).join('\n')}

📱 **DEVICE INSIGHTS:**
• Mobile Share: ${mobileShare}% of clicks
• Mobile CTR: ${mobileData ? (mobileData.ctr * 100).toFixed(2) : 'N/A'}%
• Desktop CTR: ${desktopData ? (desktopData.ctr * 100).toFixed(2) : 'N/A'}%
• Mobile Advantage: ${mobileData && desktopData ? ((mobileData.ctr / desktopData.ctr - 1) * 100).toFixed(0) : 'N/A'}%

🌍 **GEOGRAPHIC INSIGHTS:**
• Top Country: ${countries[0]?.country?.toUpperCase() || 'N/A'} (${countries[0] ? (countries[0].clicks / totalClicks * 100).toFixed(0) : 0}% of clicks)
• Highest CTR Country: ${topCTRCountry?.country?.toUpperCase() || 'N/A'} (${topCTRCountry ? (topCTRCountry.ctr * 100).toFixed(2) : 'N/A'}%)

**Top 5 Countries:**
${countries.slice(0, 5).map((c: any, i) => `${i + 1}. ${c.country?.toUpperCase()} - ${c.clicks.toLocaleString()} clicks (CTR: ${(c.ctr * 100).toFixed(2)}%)`).join('\n')}

💡 **KEY INSIGHTS:**
${trendChange !== 'N/A' && parseFloat(trendChange) > 10 ? '✅ Strong growth trend - traffic increasing week over week' : ''}
${trendChange !== 'N/A' && parseFloat(trendChange) < -10 ? '⚠️ Declining trend - investigate potential issues' : ''}
${avgCtr > 0.05 ? '✅ Good overall CTR (above 5%)' : '⚠️ CTR below 5% - consider improving titles/descriptions'}
${avgPosition < 10 ? '✅ Strong average position (top 10)' : '💡 Average position above 10 - opportunities for improvement'}
${mobileData && desktopData && mobileData.ctr > desktopData.ctr ? '📱 Mobile users engage better - optimize mobile experience' : ''}

🎯 **WHAT YOU CAN DO NEXT:**
• Create dashboard: use create_dashboard_from_table with this data
• Identify optimization opportunities: pages with high impressions but low CTR
• Export insights: use this data to write executive summary
• Deeper analysis: filter by specific devices or countries`
      );

    } catch (error) {
      logger.error('[analyze_gsc_data_for_insights] Error:', error);
      return injectGuidance(
        { success: false },
        `❌ ANALYSIS ERROR

${error instanceof Error ? error.message : String(error)}

💡 TROUBLESHOOTING:
• Verify BigQuery table exists and has data
• Check date range is valid
• Ensure table has required columns (date, clicks, impressions, etc.)
• Verify BigQuery credentials are configured

If the issue persists, contact system administrator.`
      );
    }
  }
};

export const insightsTools = [
  analyzeGSCDataForInsightsTool
];
