/**
 * Bright Data SERP API Client
 */
import { getLogger } from '../shared/logger.js';
const logger = getLogger('serp.client');
const BRIGHT_DATA_API_BASE = 'https://api.brightdata.com/serp';
/**
 * Bright Data SERP API Client
 */
export class SerpApiClient {
    constructor(apiKey) {
        this.initialized = false;
        this.apiKey = apiKey;
        logger.info('Bright Data SERP API client created');
    }
    /**
     * Initialize and verify connection
     */
    async initialize() {
        try {
            logger.debug('Initializing SERP API client');
            // Test connection with simple search
            await this.search('test', { num: 1 });
            this.initialized = true;
            logger.info('SERP API client initialized successfully');
        }
        catch (error) {
            logger.warn('SERP API connection test failed - may need credits', error);
            this.initialized = false;
        }
    }
    /**
     * Search Google
     */
    async search(query, options = {}) {
        try {
            const params = new URLSearchParams({
                q: query,
                num: String(options.num || 10),
                device: options.device || 'desktop',
                ...(options.location && { location: options.location }),
                ...(options.gl && { gl: options.gl }),
                ...(options.hl && { hl: options.hl }),
            });
            const response = await fetch(`${BRIGHT_DATA_API_BASE}/google?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`SERP API error: ${errorData.message || response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            logger.error('Failed to search Google', error);
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
let serpApiClientInstance = null;
/**
 * Get SERP API client instance
 */
export function getSerpApiClient() {
    if (!serpApiClientInstance) {
        throw new Error('SERP API client not initialized. Call initializeSerpApiClient first.');
    }
    return serpApiClientInstance;
}
/**
 * Initialize SERP API client
 */
export function initializeSerpApiClient(apiKey) {
    serpApiClientInstance = new SerpApiClient(apiKey);
    logger.info('SERP API client instance created');
    return serpApiClientInstance;
}
//# sourceMappingURL=client.js.map