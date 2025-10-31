/**
 * BigQuery API Client
 */
import type { OAuth2Client } from 'google-auth-library';
/**
 * BigQuery API Client
 */
export declare class BigQueryClient {
    private bigquery;
    private initialized;
    constructor(auth: OAuth2Client);
    /**
     * Initialize and verify connection
     */
    initialize(): Promise<void>;
    /**
     * List datasets
     */
    listDatasets(): Promise<any[]>;
    /**
     * Create dataset
     */
    createDataset(datasetId: string, options?: any): Promise<any>;
    /**
     * Get dataset
     */
    getDataset(datasetId: string): Promise<any>;
    /**
     * List tables in dataset
     */
    listTables(datasetId: string): Promise<any[]>;
    /**
     * Create table (legacy - use createPartitionedTable instead)
     */
    createTable(datasetId: string, tableId: string, schema: any): Promise<any>;
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
    createPartitionedTable(datasetId: string, tableId: string, schema: any[], platform: string): Promise<any>;
    /**
     * Insert rows
     */
    insertRows(datasetId: string, tableId: string, rows: any[]): Promise<any>;
    /**
     * Run query
     */
    runQuery(sql: string, options?: any): Promise<any>;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
}
/**
 * Get BigQuery client instance
 */
export declare function getBigQueryClient(): BigQueryClient;
/**
 * Initialize BigQuery client
 */
export declare function initializeBigQueryClient(auth: OAuth2Client): BigQueryClient;
//# sourceMappingURL=client.d.ts.map