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

**IMPORTANT:** By default, uses SHARED TABLE architecture for multi-dashboard support.
This enables multiple dashboards to use the same data source, reducing storage costs.

**What it does:**
1. Pulls data from platform (GSC, Google Ads, or GA4) using OAuth
2. Transforms to BigQuery schema with NULL dimension logic
3. Inserts to SHARED TABLE (default) or creates per-dashboard table
4. Inserts all rows with workspace_id for data isolation
5. Returns table reference for dashboard creation

**Parameters:**
- platform: Platform to pull from ("gsc", "google_ads", "analytics") [REQUIRED]
- property: Property ID (GSC domain, Ads customer ID, or GA4 property) [REQUIRED]
- dateRange: [startDate, endDate] in YYYY-MM-DD format [REQUIRED]
- dimensions: Array of dimensions to pull (e.g., ["date", "query", "page", "device", "country"]) [REQUIRED]
- workspaceId: Workspace UUID for data isolation [REQUIRED]
- useSharedTable: Use shared table architecture (default: TRUE)
- tableName: (Optional) BigQuery table name (auto-generated if not provided, ignored if useSharedTable=true)

**Example Usage:**
\`\`\`json
{
  "platform": "gsc",
  "property": "sc-domain:themindfulsteward.com",
  "dateRange": ["2024-06-25", "2025-10-29"],
  "dimensions": ["date", "query", "page", "device", "country"],
  "workspaceId": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "useSharedTable": true
}
\`\`\`

**Returns:**
\`\`\`json
{
  "success": true,
  "table": "mcp-servers-475317.wpp_marketing.gsc_performance_shared",
  "tableName": "gsc_performance_shared",
  "rows_inserted": 58349,
  "dimensions_pulled": 5,
  "platform": "gsc",
  "property": "sc-domain:themindfulsteward.com",
  "dateRange": ["2024-06-25", "2025-10-29"]
}
\`\`\`

**Workflow:**
After calling this tool, use the returned table name to create a dashboard with \`create_dashboard\` tool.

**Shared Table Architecture:**
- Shared tables enable multiple dashboards to use the same data source
- Data is isolated by workspace_id column
- Reduces BigQuery storage costs significantly
- Default behavior (useSharedTable: true)`,

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
      workspaceId: {
        type: 'string',
        description: 'Workspace ID (REQUIRED for data isolation)'
      },
      useSharedTable: {
        type: 'boolean',
        description: 'Use shared table architecture (default: true)',
        default: true
      },
      __oauthToken: {
        type: 'string',
        description: 'OAuth token (auto-loaded if not provided)'
      }
    },
    required: ['platform', 'property', 'dateRange', 'dimensions', 'workspaceId']
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

      // STEP 2: Determine table strategy (default to shared table)
      let tableName: string;
      let fullTableRef: string;
      const useSharedTable = input.useSharedTable !== false; // Default to true

      if (useSharedTable) {
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
 * Pull data for a date range with automatic pagination
 * Uses startRow parameter to retrieve all data beyond 25K row limit
 * Implements Google's recommended pagination strategy from official docs
 */
async function pullGSCChunkWithPagination(
  property: string,
  chunk: { start: string; end: string },
  dimensions: string[],
  webmasters: any,
  chunkIndex: number,
  totalChunks: number
): Promise<any[]> {
  logger.info(`[GSC] Pulling chunk ${chunkIndex}/${totalChunks}: ${chunk.start} to ${chunk.end} (with pagination)`);

  const allRows: any[] = [];
  let startRow = 0;
  const rowLimit = 25000;
  let pageNum = 1;

  // Pagination loop - continue until API returns 0 rows
  while (true) {
    logger.info(`[GSC] Chunk ${chunkIndex}, Page ${pageNum}: fetching rows ${startRow} to ${startRow + rowLimit - 1}`);

    const response = await webmasters.searchanalytics.query({
      siteUrl: property,
      requestBody: {
        startDate: chunk.start,
        endDate: chunk.end,
        dimensions: dimensions,
        startRow: startRow,      // Pagination parameter
        rowLimit: rowLimit
      }
    });

    const rows = response.data.rows || [];

    if (rows.length === 0) {
      logger.info(`[GSC] Chunk ${chunkIndex}: Complete! Total rows: ${allRows.length} (${pageNum - 1} pages)`);
      break;
    }

    allRows.push(...rows);
    logger.info(`[GSC] Chunk ${chunkIndex}, Page ${pageNum}: Retrieved ${rows.length} rows (cumulative: ${allRows.length})`);

    startRow += rowLimit;
    pageNum++;

    // Rate limiting: 2 seconds between pagination requests
    if (rows.length === rowLimit) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Safety limit: prevent infinite loops
    if (pageNum > 200) {
      logger.warn(`[GSC] Chunk ${chunkIndex}: Exceeded 200 pages (5M rows). Stopping pagination.`);
      break;
    }
  }

  return allRows;
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

  // STEP 2: Fetch all chunks with pagination (sequential for quota safety)
  logger.info(`[GSC] Pulling ${chunks.length} chunks sequentially with pagination. Dimensions: ${dimensions.join(', ')}`);

  const chunkResults: any[][] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const rows = await pullGSCChunkWithPagination(
      property,
      chunk,
      dimensions,
      webmasters,
      i + 1,
      chunks.length
    );
    chunkResults.push(rows);

    // Rate limiting between chunks
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // STEP 3: Flatten results
  const allRows = chunkResults.flat();
  logger.info(`[GSC] Total rows from all ${chunks.length} chunks: ${allRows.length}`);

  // STEP 4: Transform to BigQuery schema
  const transformedRows = transformGSCRows(allRows, dimensions);

  logger.info(`[GSC] Pulled ${transformedRows.length} rows with all dimensions (${chunks.length} parallel chunks)`);
  return transformedRows;
}

/**
 * Create BigQuery table with partitioning and clustering
 *
 * COST OPTIMIZATION: All tables are created with:
 * - PARTITION BY date (reduces scan from GB to MB)
 * - CLUSTER BY platform-specific fields (block pruning)
 * - require_partition_filter = TRUE (prevents full scans)
 *
 * This reduces query costs by 95%+ compared to non-partitioned tables.
 */
async function createBigQueryTable(tableName: string, platform: string): Promise<void> {
  const { BigQuery } = await import('@google-cloud/bigquery');
  const { getPlatformSchema, getTableCreationOptions } = await import('../../shared/bigquery-table-config.js');

  const bigquery = new BigQuery({
    projectId: 'mcp-servers-475317',
    keyFilename: '/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json'
  });

  // Get platform-specific schema
  const schema = getPlatformSchema(platform);

  // Get partitioning and clustering configuration
  const tableOptions = getTableCreationOptions(platform, schema);

  try {
    await bigquery.dataset('wpp_marketing').createTable(tableName, tableOptions);

    logger.info(`[BigQuery] Created PARTITIONED table: wpp_marketing.${tableName}`, {
      partition_by: 'date',
      cluster_by: tableOptions.clustering.fields,
      require_partition_filter: tableOptions.timePartitioning.requirePartitionFilter,
      cost_optimized: true
    });
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
