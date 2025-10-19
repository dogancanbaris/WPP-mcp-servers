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
  private apiKey: string;
  private initialized: boolean = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    logger.info('Bright Data SERP API client created');
  }

  /**
   * Initialize and verify connection
   */
  async initialize(): Promise<void> {
    try {
      logger.debug('Initializing SERP API client');

      // Test connection with simple search
      await this.search('test', { num: 1 });

      this.initialized = true;
      logger.info('SERP API client initialized successfully');
    } catch (error) {
      logger.warn('SERP API connection test failed - may need credits', error as Error);
      this.initialized = false;
    }
  }

  /**
   * Search Google
   */
  async search(query: string, options: {
    num?: number;
    location?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
    gl?: string;
    hl?: string;
  } = {}): Promise<any> {
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
        throw new Error(`SERP API error: ${(errorData as any).message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Failed to search Google', error as Error);
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
let serpApiClientInstance: SerpApiClient | null = null;

/**
 * Get SERP API client instance
 */
export function getSerpApiClient(): SerpApiClient {
  if (!serpApiClientInstance) {
    throw new Error('SERP API client not initialized. Call initializeSerpApiClient first.');
  }
  return serpApiClientInstance;
}

/**
 * Initialize SERP API client
 */
export function initializeSerpApiClient(apiKey: string): SerpApiClient {
  serpApiClientInstance = new SerpApiClient(apiKey);
  logger.info('SERP API client instance created');
  return serpApiClientInstance;
}
