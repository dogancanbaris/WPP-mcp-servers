/**
 * Chrome UX Report API Client
 */
import * as dotenv from 'dotenv';
import { getLogger } from '../shared/logger.js';
import { retry } from '../shared/utils.js';
dotenv.config();
const logger = getLogger('crux.client');
const CRUX_API_BASE = 'https://chromeuxreport.googleapis.com/v1';
const API_KEY = process.env.CRUX_API_KEY;
/**
 * CrUX API Client
 */
export class CruxClient {
    constructor(apiKey) {
        this.apiKey = apiKey || API_KEY || '';
        if (!this.apiKey) {
            throw new Error('CRUX_API_KEY is required');
        }
    }
    /**
     * Query current Core Web Vitals data
     */
    async queryRecord(request) {
        const url = `${CRUX_API_BASE}/records:queryRecord?key=${this.apiKey}`;
        logger.debug('Querying CrUX record', {
            origin: request.origin,
            url: request.url,
            formFactor: request.formFactor,
        });
        const response = await retry(async () => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (!res.ok) {
                const errorData = (await res.json());
                if (errorData.error.status === 'NOT_FOUND') {
                    throw new Error(`Site not found in CrUX database. This can happen if the site doesn't have enough traffic or data. ${errorData.error.message}`);
                }
                throw new Error(`CrUX API error: ${errorData.error.message}`);
            }
            return res.json();
        });
        logger.info('CrUX record retrieved', {
            origin: request.origin,
            url: request.url,
            formFactor: request.formFactor,
        });
        return response;
    }
    /**
     * Query historical Core Web Vitals data
     */
    async queryHistoryRecord(request) {
        const url = `${CRUX_API_BASE}/records:queryHistoryRecord?key=${this.apiKey}`;
        logger.debug('Querying CrUX history', {
            origin: request.origin,
            url: request.url,
            formFactor: request.formFactor,
        });
        const response = await retry(async () => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (!res.ok) {
                const errorData = (await res.json());
                if (errorData.error.status === 'NOT_FOUND') {
                    throw new Error(`Site not found in CrUX database. This can happen if the site doesn't have enough traffic or data. ${errorData.error.message}`);
                }
                throw new Error(`CrUX API error: ${errorData.error.message}`);
            }
            return res.json();
        });
        logger.info('CrUX history retrieved', {
            origin: request.origin,
            url: request.url,
            formFactor: request.formFactor,
        });
        return response;
    }
    /**
     * Process metric data into human-readable format
     */
    processMetricData(metric) {
        const histogram = metric.histogram;
        return {
            p75: metric.percentiles.p75,
            good: (histogram[0]?.density || 0) * 100,
            needsImprovement: (histogram[1]?.density || 0) * 100,
            poor: (histogram[2]?.density || 0) * 100,
        };
    }
    /**
     * Process CrUX response into processed CWV data
     */
    processCWVData(response) {
        const { record } = response;
        const processed = {};
        if (record.metrics.largest_contentful_paint) {
            processed.lcp = this.processMetricData(record.metrics.largest_contentful_paint);
        }
        if (record.metrics.interaction_to_next_paint) {
            processed.inp = this.processMetricData(record.metrics.interaction_to_next_paint);
        }
        if (record.metrics.cumulative_layout_shift) {
            processed.cls = this.processMetricData(record.metrics.cumulative_layout_shift);
        }
        if (record.metrics.first_contentful_paint) {
            processed.fcp = this.processMetricData(record.metrics.first_contentful_paint);
        }
        if (record.metrics.experimental_time_to_first_byte) {
            processed.ttfb = this.processMetricData(record.metrics.experimental_time_to_first_byte);
        }
        if (record.collectionPeriod) {
            const { firstDate, lastDate } = record.collectionPeriod;
            processed.collectionPeriod = {
                start: `${firstDate.year}-${String(firstDate.month).padStart(2, '0')}-${String(firstDate.day).padStart(2, '0')}`,
                end: `${lastDate.year}-${String(lastDate.month).padStart(2, '0')}-${String(lastDate.day).padStart(2, '0')}`,
            };
        }
        return processed;
    }
}
// Singleton instance
let cruxClientInstance = null;
/**
 * Get CrUX client instance
 */
export function getCruxClient() {
    if (!cruxClientInstance) {
        cruxClientInstance = new CruxClient();
    }
    return cruxClientInstance;
}
/**
 * Initialize CrUX client with API key
 */
export function initializeCruxClient(apiKey) {
    cruxClientInstance = new CruxClient(apiKey);
    logger.info('CrUX client initialized');
    return cruxClientInstance;
}
//# sourceMappingURL=client.js.map