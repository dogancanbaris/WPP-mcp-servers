/**
 * Type definitions for Chrome UX Report (CrUX) API
 */
/**
 * Form factor for device type
 */
export type FormFactor = 'PHONE' | 'TABLET' | 'DESKTOP' | 'ALL';
/**
 * Core Web Vitals metric names
 */
export type MetricName = 'largest_contentful_paint' | 'interaction_to_next_paint' | 'cumulative_layout_shift' | 'first_contentful_paint' | 'experimental_time_to_first_byte';
/**
 * Histogram bin for metric distribution
 */
export interface HistogramBin {
    start?: number;
    end?: number;
    density: number;
}
/**
 * Metric percentiles
 */
export interface Percentiles {
    p75: number;
}
/**
 * Metric data with histogram and percentiles
 */
export interface MetricData {
    histogram: HistogramBin[];
    percentiles: Percentiles;
}
/**
 * Collection period for the data
 */
export interface CollectionPeriod {
    firstDate: {
        year: number;
        month: number;
        day: number;
    };
    lastDate: {
        year: number;
        month: number;
        day: number;
    };
}
/**
 * CrUX API query record request
 */
export interface CruxQueryRequest {
    origin?: string;
    url?: string;
    formFactor?: FormFactor;
    metrics?: MetricName[];
}
/**
 * Record key in response
 */
export interface RecordKey {
    origin?: string;
    url?: string;
    formFactor?: FormFactor;
}
/**
 * CrUX API record response
 */
export interface CruxRecord {
    key: RecordKey;
    metrics: {
        [key in MetricName]?: MetricData;
    };
    collectionPeriod?: CollectionPeriod;
}
/**
 * CrUX API query response
 */
export interface CruxQueryResponse {
    record: CruxRecord;
    urlNormalizationDetails?: {
        originalUrl: string;
        normalizedUrl: string;
    };
}
/**
 * Historical record with timeline data
 */
export interface HistoricalRecord {
    key: RecordKey;
    metrics: {
        [key in MetricName]?: {
            histogramTimeseries: Array<{
                start?: number;
                end?: number;
                densities: number[];
            }>;
            percentilesTimeseries: {
                p75s: number[];
            };
        };
    };
    collectionPeriods: CollectionPeriod[];
}
/**
 * CrUX History API response
 */
export interface CruxHistoryResponse {
    record: HistoricalRecord;
    urlNormalizationDetails?: {
        originalUrl: string;
        normalizedUrl: string;
    };
}
/**
 * Error response from CrUX API
 */
export interface CruxError {
    error: {
        code: number;
        message: string;
        status: string;
    };
}
/**
 * Processed Core Web Vitals metrics for easier consumption
 */
export interface ProcessedCWV {
    lcp?: {
        p75: number;
        good: number;
        needsImprovement: number;
        poor: number;
    };
    inp?: {
        p75: number;
        good: number;
        needsImprovement: number;
        poor: number;
    };
    cls?: {
        p75: number;
        good: number;
        needsImprovement: number;
        poor: number;
    };
    fcp?: {
        p75: number;
        good: number;
        needsImprovement: number;
        poor: number;
    };
    ttfb?: {
        p75: number;
        good: number;
        needsImprovement: number;
        poor: number;
    };
    collectionPeriod?: {
        start: string;
        end: string;
    };
}
//# sourceMappingURL=types.d.ts.map