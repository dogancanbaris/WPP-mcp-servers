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
      useSharedTable: {
        type: 'boolean',
        description: 'Use shared table architecture (insert to gsc_performance_shared with workspace_id)'
      },
      workspaceId: {
        type: 'string',
        description: 'Workspace ID (required if useSharedTable=true)'
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
      const oauthToken = await extractOAuthToken(input);
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

      // STEP 2: Determine table strategy
      let tableName: string;
      let fullTableRef: string;

      if (input.useSharedTable) {
        // Shared table architecture
        if (!input.workspaceId) {
          return {
            success: false,
            error: 'workspaceId required when useSharedTable=true'
          };
        }

        tableName = `${input.platform}_performance_shared`;
        fullTableRef = `mcp-servers-475317.wpp_marketing.${tableName}`;

        // Add workspace_id and metadata to each row
        const importTimestamp = new Date().toISOString();
        platformData = platformData.map(row => ({
          ...row,
          workspace_id: input.workspaceId,
          property: input.property,
          oauth_user_id: null,
          data_source: 'api',
          imported_at: importTimestamp // Same timestamp for all rows in this batch
        }));

        logger.info('[push_platform_data_to_bigquery] Using shared table', {
          table: fullTableRef,
          workspace_id: input.workspaceId
        });
      } else {
        // Per-dashboard table (legacy)
        tableName = input.tableName || generateTableName(input.platform, input.property);
        fullTableRef = `mcp-servers-475317.wpp_marketing.${tableName}`;

        // STEP 3: Create BigQuery table if it doesn't exist
        await createBigQueryTable(tableName, input.platform);
      }

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
 * Calculate date chunks for GSC data pulling
 * Splits date range into 30-day chunks to handle GSC's 25K row limit
 */
function chunkDateRange(
  startDate: string,
  endDate: string,
  chunkDays: number = 30
): Array<{ start: string; end: string }> {
  const chunks: Array<{ start: string; end: string }> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentStart = new Date(start);

  while (currentStart < end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + chunkDays - 1);

    if (currentEnd >= end) {
      chunks.push({
        start: currentStart.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      });
      break;
    }

    chunks.push({
      start: currentStart.toISOString().split('T')[0],
      end: currentEnd.toISOString().split('T')[0]
    });

    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }

  return chunks;
}

/**
 * Pull a single chunk of data from Google Search Console
 */
async function pullGSCChunk(
  property: string,
  chunk: { start: string; end: string },
  dimensions: string[],
  webmasters: any,
  chunkIndex: number,
  totalChunks: number
): Promise<any[]> {
  logger.info(`[GSC] Pulling chunk ${chunkIndex}/${totalChunks}: ${chunk.start} to ${chunk.end}`);

  const response = await webmasters.searchanalytics.query({
    siteUrl: property,
    requestBody: {
      startDate: chunk.start,
      endDate: chunk.end,
      dimensions: dimensions,
      rowLimit: 25000
    }
  });

  const rows = response.data.rows || [];
  logger.info(`[GSC] Chunk ${chunkIndex} retrieved ${rows.length} rows`);

  return rows;
}

/**
 * Transform GSC rows to BigQuery schema
 */
function transformGSCRows(rows: any[], dimensions: string[]): any[] {
  return rows.map((row: any) => {
    const result: any = {
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    };

    // Map keys to dimensions
    dimensions.forEach((dim, index) => {
      result[dim] = row.keys[index] || null;
    });

    // Fill in missing dimensions with null
    ['date', 'query', 'page', 'device', 'country'].forEach(dim => {
      if (!(dim in result)) {
        result[dim] = null;
      }
    });

    return result;
  });
}

/**
 * Pull data from Google Search Console using parallel chunking
 * Splits date range into 30-day chunks and fetches all chunks concurrently
 * This avoids the GSC 25K row limit by pulling data in smaller time windows
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

  // STEP 1: Calculate chunks
  const chunks = chunkDateRange(dateRange[0], dateRange[1], 30);
  logger.info(`[GSC] Splitting ${dateRange[0]} to ${dateRange[1]} into ${chunks.length} chunks`);

  // STEP 2: Fetch all chunks in parallel
  logger.info(`[GSC] Pulling ${chunks.length} chunks in parallel with dimensions: ${dimensions.join(', ')}`);

  const chunkResults = await Promise.all(
    chunks.map((chunk, index) =>
      pullGSCChunk(property, chunk, dimensions, webmasters, index + 1, chunks.length)
    )
  );

  // STEP 3: Flatten results
  const allRows = chunkResults.flat();
  logger.info(`[GSC] Total rows from all ${chunks.length} chunks: ${allRows.length}`);

  // STEP 4: Transform to BigQuery schema
  const transformedRows = transformGSCRows(allRows, dimensions);

  logger.info(`[GSC] Pulled ${transformedRows.length} rows with all dimensions (${chunks.length} parallel chunks)`);
  return transformedRows;
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
 * Insert data to BigQuery table in batches
 * BigQuery streaming insert limit: 10MB per request, so batch large inserts
 */
async function insertToBigQuery(tableName: string, rows: any[]): Promise<void> {
  const { BigQuery } = await import('@google-cloud/bigquery');
  const bigquery = new BigQuery({
    projectId: 'mcp-servers-475317',
    keyFilename: '/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json'
  });

  const table = bigquery.dataset('wpp_marketing').table(tableName);
  const BATCH_SIZE = 5000; // Safe batch size to stay under 10MB limit

  try {
    // Insert in batches
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await table.insert(batch);
      logger.info(`[BigQuery] Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} rows`);
    }

    logger.info(`[BigQuery] Inserted total ${rows.length} rows to wpp_marketing.${tableName}`);
  } catch (error: any) {
    logger.error(`[BigQuery] Insert failed`, {
      table: tableName,
      rowCount: rows.length,
      error: error.message,
      errors: error.errors,
      sampleRow: rows[0]
    });
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const dataPushTools = [
  pushPlatformDataToBigQueryTool
];
