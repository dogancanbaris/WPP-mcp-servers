/**
 * Push Platform Data to BigQuery MCP Tool
 *
 * Pulls data from marketing platforms (GSC, Google Ads, GA4) and inserts to BigQuery.
 * Works entirely within MCP server context - no HTTP calls, no Supabase connection needed.
 */

import { google } from 'googleapis';
import { getLogger } from '../../shared/logger.js';
import { extractOAuthToken } from '../../shared/oauth-client-factory.js';

const logger = getLogger('wpp-analytics.push-data');

// ============================================================================
// MAIN TOOL
// ============================================================================

export const pushPlatformDataToBigQueryTool = {
  name: 'push_platform_data_to_bigquery',
  description: `Pull data from marketing platform and insert to BigQuery table.

**Purpose:**
First step in dashboard creation - gets platform data into BigQuery for analysis.

**What it does:**
1. Pulls data from platform (GSC, Google Ads, or GA4) using OAuth
2. Transforms to BigQuery schema with NULL dimension logic
3. Creates BigQuery table if it doesn't exist
4. Inserts all rows
5. Returns table reference for dashboard creation

**Parameters:**
- platform: Platform to pull from ("gsc", "google_ads", "analytics")
- property: Property ID (GSC domain, Ads customer ID, or GA4 property)
- dateRange: [startDate, endDate] in YYYY-MM-DD format
- dimensions: Array of dimensions to pull (e.g., ["date", "query", "page", "device", "country"])
- tableName: (Optional) BigQuery table name (auto-generated if not provided)

**Example Usage:**
\`\`\`json
{
  "platform": "gsc",
  "property": "sc-domain:themindfulsteward.com",
  "dateRange": ["2025-07-25", "2025-10-23"],
  "dimensions": ["date", "query", "page", "device", "country"]
}
\`\`\`

**Returns:**
\`\`\`json
{
  "success": true,
  "table": "mcp-servers-475317.wpp_marketing.gsc_themindfulsteward_com_1729757890",
  "rows_inserted": 117,
  "dimensions_pulled": 5,
  "platform": "gsc"
}
\`\`\`

**Workflow:**
After calling this tool, use the returned table name to create a dashboard with \`create_dashboard\` tool.`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      platform: {
        type: 'string',
        enum: ['gsc', 'google_ads', 'analytics'],
        description: 'Platform to pull data from'
      },
      property: {
        type: 'string',
        description: 'Property identifier (GSC domain, Ads customer ID, GA4 property ID)'
      },
      dateRange: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 2,
        description: 'Date range [startDate, endDate] in YYYY-MM-DD format'
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions to pull (e.g., ["date", "query", "page"])'
      },
      tableName: {
        type: 'string',
        description: 'Optional BigQuery table name (auto-generated if not provided)'
      },
      __oauthToken: {
        type: 'string',
        description: 'OAuth token (auto-loaded if not provided)'
      }
    },
    required: ['platform', 'property', 'dateRange', 'dimensions']
  },

  async handler(input: any) {
    try {
      logger.info('[push_platform_data_to_bigquery] Starting...', {
        platform: input.platform,
        property: input.property,
        dateRange: input.dateRange,
        dimensions: input.dimensions
      });

      // Get OAuth token
      const oauthToken = extractOAuthToken(input);
      if (!oauthToken) {
        return {
          success: false,
          error: 'OAuth token required. Cannot access platform data without authentication.'
        };
      }

      // STEP 1: Pull data from platform
      let platformData: any[];

      switch (input.platform) {
        case 'gsc':
          platformData = await pullGSCData(input.property, input.dateRange, input.dimensions, oauthToken);
          break;

        case 'google_ads':
          return {
            success: false,
            error: 'Google Ads data pull not yet implemented. Use GSC for now.'
          };

        case 'analytics':
          return {
            success: false,
            error: 'GA4 data pull not yet implemented. Use GSC for now.'
          };

        default:
          return {
            success: false,
            error: `Unknown platform: ${input.platform}`
          };
      }

      // STEP 2: Generate table name
      const tableName = input.tableName || generateTableName(input.platform, input.property);
      const fullTableRef = `mcp-servers-475317.wpp_marketing.${tableName}`;

      // STEP 3: Create BigQuery table if it doesn't exist
      await createBigQueryTable(tableName, input.platform);

      // STEP 4: Insert data
      await insertToBigQuery(tableName, platformData);

      logger.info('[push_platform_data_to_bigquery] Success!', {
        table: fullTableRef,
        rows: platformData.length
      });

      return {
        success: true,
        table: fullTableRef,
        tableName: tableName,
        rows_inserted: platformData.length,
        dimensions_pulled: input.dimensions.length,
        platform: input.platform,
        property: input.property,
        dateRange: input.dateRange
      };

    } catch (error) {
      logger.error('[push_platform_data_to_bigquery] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate BigQuery table name from platform and property
 */
function generateTableName(platform: string, property: string): string {
  const cleaned = property.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  return `${platform}_${cleaned}_${timestamp}`;
}

/**
 * Pull data from Google Search Console
 */
async function pullGSCData(
  property: string,
  dateRange: [string, string],
  dimensions: string[],
  oauthToken: string
): Promise<any[]> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: oauthToken });
  const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });

  const allRows: any[] = [];

  // Pull data for each dimension separately
  for (const dimension of dimensions) {
    logger.info(`[GSC] Pulling data for dimension: ${dimension}`);

    const response = await webmasters.searchanalytics.query({
      siteUrl: property,
      requestBody: {
        startDate: dateRange[0],
        endDate: dateRange[1],
        dimensions: [dimension],
        rowLimit: dimension === 'date' ? 1000 : 100
      }
    });

    const rows = response.data.rows || [];

    // Transform to BigQuery schema with NULL dimensions
    const transformedRows = rows.map((row: any) => ({
      date: dimension === 'date' ? row.keys[0] : null,
      query: dimension === 'query' ? row.keys[0] : null,
      page: dimension === 'page' ? row.keys[0] : null,
      device: dimension === 'device' ? row.keys[0] : null,
      country: dimension === 'country' ? row.keys[0] : null,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));

    allRows.push(...transformedRows);
    logger.info(`[GSC] Pulled ${transformedRows.length} rows for ${dimension}`);
  }

  logger.info(`[GSC] Total rows pulled: ${allRows.length}`);
  return allRows;
}

/**
 * Create BigQuery table with schema
 */
async function createBigQueryTable(tableName: string, platform: string): Promise<void> {
  const { BigQuery } = await import('@google-cloud/bigquery');
  const bigquery = new BigQuery({
    projectId: 'mcp-servers-475317',
    keyFilename: '/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json'
  });

  // Define schema based on platform
  const schema = platform === 'gsc'
    ? [
        { name: 'date', type: 'DATE', mode: 'NULLABLE' },
        { name: 'query', type: 'STRING', mode: 'NULLABLE' },
        { name: 'page', type: 'STRING', mode: 'NULLABLE' },
        { name: 'device', type: 'STRING', mode: 'NULLABLE' },
        { name: 'country', type: 'STRING', mode: 'NULLABLE' },
        { name: 'clicks', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'impressions', type: 'INTEGER', mode: 'NULLABLE' },
        { name: 'ctr', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'position', type: 'FLOAT', mode: 'NULLABLE' }
      ]
    : []; // TODO: Add schemas for other platforms

  try {
    await bigquery.dataset('wpp_marketing').createTable(tableName, { schema });
    logger.info(`[BigQuery] Created table: wpp_marketing.${tableName}`);
  } catch (error: any) {
    // Table might already exist, that's ok
    if (error.code === 409) {
      logger.info(`[BigQuery] Table already exists: ${tableName}`);
    } else {
      throw error;
    }
  }
}

/**
 * Insert data to BigQuery table
 */
async function insertToBigQuery(tableName: string, rows: any[]): Promise<void> {
  const { BigQuery } = await import('@google-cloud/bigquery');
  const bigquery = new BigQuery({
    projectId: 'mcp-servers-475317',
    keyFilename: '/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json'
  });

  const table = bigquery.dataset('wpp_marketing').table(tableName);
  await table.insert(rows);

  logger.info(`[BigQuery] Inserted ${rows.length} rows to wpp_marketing.${tableName}`);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const dataPushTools = [
  pushPlatformDataToBigQueryTool
];
