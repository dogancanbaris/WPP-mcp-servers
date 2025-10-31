/**
 * BigQuery Client for Server-Side Data Queries
 *
 * This module provides a singleton BigQuery client for executing queries
 * from Next.js API routes. Uses OAuth-based authentication.
 */

import { BigQuery } from '@google-cloud/bigquery';

let bigqueryClient: BigQuery | null = null;

/**
 * Get or create BigQuery client (singleton pattern)
 */
export function getBigQueryClient(): BigQuery {
  if (!bigqueryClient) {
    // SECURITY: Use environment variable for key path (never hardcode)
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH ||
      '/home/dogancanbaris/projects/MCP Servers/config/service-account-key.json';

    bigqueryClient = new BigQuery({
      projectId: 'mcp-servers-475317',
      // Service account key for server-side operations
      keyFilename: keyPath
    });
  }

  return bigqueryClient;
}

/**
 * Execute BigQuery SQL query
 *
 * @param sql - SQL query string
 * @param params - Optional query parameters for parameterized queries
 * @returns Array of result rows
 */
export async function executeQuery(sql: string, params?: any[]): Promise<any[]> {
  const bigquery = getBigQueryClient();

  console.log('[BigQuery] Executing query:', sql.substring(0, 200) + '...');

  const options = {
    query: sql,
    params: params || [],
    useLegacySql: false,
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();

  console.log(`[BigQuery] Query completed: ${rows.length} rows returned`);

  return rows;
}

/**
 * Execute query with timeout and cost estimation
 */
export async function executeQueryWithMetadata(sql: string) {
  const bigquery = getBigQueryClient();

  // Dry run to estimate cost
  const [dryRunJob] = await bigquery.createQueryJob({
    query: sql,
    dryRun: true
  });

  const bytesProcessed = parseInt(dryRunJob.metadata.statistics.totalBytesProcessed || '0');
  const estimatedCostUSD = (bytesProcessed / 1_000_000_000_000) * 6.25; // $6.25 per TB

  console.log(`[BigQuery] Dry run - Bytes: ${bytesProcessed}, Est. cost: $${estimatedCostUSD.toFixed(4)}`);

  // Execute actual query
  const startTime = Date.now();
  const rows = await executeQuery(sql);
  const duration = Date.now() - startTime;

  return {
    rows,
    metadata: {
      rowCount: rows.length,
      bytesProcessed,
      estimatedCost: estimatedCostUSD,
      durationMs: duration,
      sql
    }
  };
}

/**
 * Test BigQuery connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const bigquery = getBigQueryClient();
    const [datasets] = await bigquery.getDatasets();
    console.log(`[BigQuery] Connection successful. Found ${datasets.length} datasets.`);
    return true;
  } catch (error) {
    console.error('[BigQuery] Connection failed:', error);
    return false;
  }
}
