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
     * Create table
     */
    createTable(datasetId: string, tableId: string, schema: any): Promise<any>;
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