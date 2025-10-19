/**
 * Chrome UX Report API Client
 */
import type { CruxQueryRequest, CruxQueryResponse, CruxHistoryResponse, ProcessedCWV, MetricData } from './types.js';
/**
 * CrUX API Client
 */
export declare class CruxClient {
    private apiKey;
    constructor(apiKey?: string);
    /**
     * Query current Core Web Vitals data
     */
    queryRecord(request: CruxQueryRequest): Promise<CruxQueryResponse>;
    /**
     * Query historical Core Web Vitals data
     */
    queryHistoryRecord(request: CruxQueryRequest): Promise<CruxHistoryResponse>;
    /**
     * Process metric data into human-readable format
     */
    processMetricData(metric: MetricData): {
        p75: number;
        good: number;
        needsImprovement: number;
        poor: number;
    };
    /**
     * Process CrUX response into processed CWV data
     */
    processCWVData(response: CruxQueryResponse): ProcessedCWV;
}
/**
 * Get CrUX client instance
 */
export declare function getCruxClient(): CruxClient;
/**
 * Initialize CrUX client with API key
 */
export declare function initializeCruxClient(apiKey: string): CruxClient;
//# sourceMappingURL=client.d.ts.map