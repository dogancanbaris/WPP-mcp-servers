/**
 * BigQuery API Client
 */
import { BigQuery } from '@google-cloud/bigquery';
import { getLogger } from '../shared/logger.js';
const logger = getLogger('bigquery.client');
/**
 * BigQuery API Client
 */
export class BigQueryClient {
    constructor(auth) {
        this.initialized = false;
        this.bigquery = new BigQuery({
            authClient: auth,
        });
        logger.info('BigQuery API client created');
    }
    /**
     * Initialize and verify connection
     */
    async initialize() {
        try {
            logger.debug('Initializing BigQuery API client');
            // Test connection by listing datasets
            await this.listDatasets();
            this.initialized = true;
            logger.info('BigQuery API client initialized successfully');
        }
        catch (error) {
            logger.warn('BigQuery API connection test failed', error);
            this.initialized = false;
        }
    }
    /**
     * List datasets
     */
    async listDatasets() {
        try {
            const [datasets] = await this.bigquery.getDatasets();
            return datasets || [];
        }
        catch (error) {
            logger.error('Failed to list datasets', error);
            throw error;
        }
    }
    /**
     * Create dataset
     */
    async createDataset(datasetId, options) {
        try {
            const [dataset] = await this.bigquery.createDataset(datasetId, options);
            return dataset;
        }
        catch (error) {
            logger.error('Failed to create dataset', error);
            throw error;
        }
    }
    /**
     * Get dataset
     */
    async getDataset(datasetId) {
        try {
            const dataset = this.bigquery.dataset(datasetId);
            const [metadata] = await dataset.get();
            return metadata;
        }
        catch (error) {
            logger.error('Failed to get dataset', error);
            throw error;
        }
    }
    /**
     * List tables in dataset
     */
    async listTables(datasetId) {
        try {
            const dataset = this.bigquery.dataset(datasetId);
            const [tables] = await dataset.getTables();
            return tables || [];
        }
        catch (error) {
            logger.error('Failed to list tables', error);
            throw error;
        }
    }
    /**
     * Create table (legacy - use createPartitionedTable instead)
     */
    async createTable(datasetId, tableId, schema) {
        try {
            const dataset = this.bigquery.dataset(datasetId);
            const [table] = await dataset.createTable(tableId, { schema });
            return table;
        }
        catch (error) {
            logger.error('Failed to create table', error);
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
    async createPartitionedTable(datasetId, tableId, schema, platform) {
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
        }
        catch (error) {
            logger.error('Failed to create partitioned table', error);
            throw error;
        }
    }
    /**
     * Insert rows
     */
    async insertRows(datasetId, tableId, rows) {
        try {
            const dataset = this.bigquery.dataset(datasetId);
            const table = dataset.table(tableId);
            await table.insert(rows);
            return { rowsInserted: rows.length };
        }
        catch (error) {
            logger.error('Failed to insert rows', error);
            throw error;
        }
    }
    /**
     * Run query
     */
    async runQuery(sql, options) {
        try {
            const [job] = await this.bigquery.createQueryJob({
                query: sql,
                ...options,
            });
            const [rows] = await job.getQueryResults();
            return { rows, jobId: job.id };
        }
        catch (error) {
            logger.error('Failed to run query', error);
            throw error;
        }
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.initialized;
    }
}
// Singleton instance
let bigQueryClientInstance = null;
/**
 * Get BigQuery client instance
 */
export function getBigQueryClient() {
    if (!bigQueryClientInstance) {
        throw new Error('BigQuery client not initialized. Call initializeBigQueryClient first.');
    }
    return bigQueryClientInstance;
}
/**
 * Initialize BigQuery client
 */
export function initializeBigQueryClient(auth) {
    bigQueryClientInstance = new BigQueryClient(auth);
    logger.info('BigQuery client instance created');
    return bigQueryClientInstance;
}
//# sourceMappingURL=client.js.map