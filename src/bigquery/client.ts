/**
 * BigQuery API Client
 */

import { BigQuery } from '@google-cloud/bigquery';
import { getLogger } from '../shared/logger.js';
import type { OAuth2Client } from 'google-auth-library';

const logger = getLogger('bigquery.client');

/**
 * BigQuery API Client
 */
export class BigQueryClient {
  private bigquery: BigQuery;
  private initialized: boolean = false;

  constructor(auth: OAuth2Client) {
    this.bigquery = new BigQuery({
      authClient: auth as any,
    });

    logger.info('BigQuery API client created');
  }

  /**
   * Initialize and verify connection
   */
  async initialize(): Promise<void> {
    try {
      logger.debug('Initializing BigQuery API client');

      // Test connection by listing datasets
      await this.listDatasets();

      this.initialized = true;
      logger.info('BigQuery API client initialized successfully');
    } catch (error) {
      logger.warn('BigQuery API connection test failed', error as Error);
      this.initialized = false;
    }
  }

  /**
   * List datasets
   */
  async listDatasets(): Promise<any[]> {
    try {
      const [datasets] = await this.bigquery.getDatasets();
      return datasets || [];
    } catch (error) {
      logger.error('Failed to list datasets', error as Error);
      throw error;
    }
  }

  /**
   * Create dataset
   */
  async createDataset(datasetId: string, options?: any): Promise<any> {
    try {
      const [dataset] = await this.bigquery.createDataset(datasetId, options);
      return dataset;
    } catch (error) {
      logger.error('Failed to create dataset', error as Error);
      throw error;
    }
  }

  /**
   * Get dataset
   */
  async getDataset(datasetId: string): Promise<any> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const [metadata] = await dataset.get();
      return metadata;
    } catch (error) {
      logger.error('Failed to get dataset', error as Error);
      throw error;
    }
  }

  /**
   * List tables in dataset
   */
  async listTables(datasetId: string): Promise<any[]> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const [tables] = await dataset.getTables();
      return tables || [];
    } catch (error) {
      logger.error('Failed to list tables', error as Error);
      throw error;
    }
  }

  /**
   * Create table (legacy - use createPartitionedTable instead)
   */
  async createTable(datasetId: string, tableId: string, schema: any): Promise<any> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const [table] = await dataset.createTable(tableId, { schema });
      return table;
    } catch (error) {
      logger.error('Failed to create table', error as Error);
      throw error;
    }
  }

  /**
   * Create partitioned and clustered table (RECOMMENDED)
   *
   * Creates a table with proper partitioning and clustering for cost optimization.
   * This should be used for ALL new table creation.
   *
   * Cost optimization:
   * - Partitioning by date reduces scan from GB to MB (95%+ reduction)
   * - Clustering improves block pruning for filtered queries
   * - requirePartitionFilter prevents accidental full table scans
   *
   * @param datasetId - BigQuery dataset ID
   * @param tableId - Table name
   * @param schema - Table schema (must include 'date' column)
   * @param platform - Platform ID for clustering config ('gsc', 'google_ads', 'analytics')
   * @returns Created table metadata
   */
  async createPartitionedTable(
    datasetId: string,
    tableId: string,
    schema: any[],
    platform: string
  ): Promise<any> {
    try {
      // Import BigQuery table config utility
      const { getTableCreationOptions } = await import('../shared/bigquery-table-config.js');

      // Get platform-specific partitioning and clustering config
      const tableOptions = getTableCreationOptions(platform, schema);

      const dataset = this.bigquery.dataset(datasetId);
      const [table] = await dataset.createTable(tableId, tableOptions);

      logger.info(`Created partitioned table: ${datasetId}.${tableId}`, {
        partition_field: tableOptions.timePartitioning.field,
        clustering_fields: tableOptions.clustering.fields,
        require_partition_filter: tableOptions.timePartitioning.requirePartitionFilter
      });

      return table;
    } catch (error) {
      logger.error('Failed to create partitioned table', error as Error);
      throw error;
    }
  }

  /**
   * Insert rows
   */
  async insertRows(datasetId: string, tableId: string, rows: any[]): Promise<any> {
    try {
      const dataset = this.bigquery.dataset(datasetId);
      const table = dataset.table(tableId);
      await table.insert(rows);
      return { rowsInserted: rows.length };
    } catch (error) {
      logger.error('Failed to insert rows', error as Error);
      throw error;
    }
  }

  /**
   * Run query
   */
  async runQuery(sql: string, options?: any): Promise<any> {
    try {
      const [job] = await this.bigquery.createQueryJob({
        query: sql,
        ...options,
      });

      const [rows] = await job.getQueryResults();
      return { rows, jobId: job.id };
    } catch (error) {
      logger.error('Failed to run query', error as Error);
      throw error;
    }
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
let bigQueryClientInstance: BigQueryClient | null = null;

/**
 * Get BigQuery client instance
 */
export function getBigQueryClient(): BigQueryClient {
  if (!bigQueryClientInstance) {
    throw new Error('BigQuery client not initialized. Call initializeBigQueryClient first.');
  }
  return bigQueryClientInstance;
}

/**
 * Initialize BigQuery client
 */
export function initializeBigQueryClient(auth: OAuth2Client): BigQueryClient {
  bigQueryClientInstance = new BigQueryClient(auth);
  logger.info('BigQuery client instance created');
  return bigQueryClientInstance;
}
