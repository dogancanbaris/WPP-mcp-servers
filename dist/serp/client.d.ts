/**
 * Bright Data SERP API Client
 */
/**
 * Bright Data SERP API Client
 */
export declare class SerpApiClient {
    private apiKey;
    private initialized;
    constructor(apiKey: string);
    /**
     * Initialize and verify connection
     */
    initialize(): Promise<void>;
    /**
     * Search Google
     */
    search(query: string, options?: {
        num?: number;
        location?: string;
        device?: 'desktop' | 'mobile' | 'tablet';
        gl?: string;
        hl?: string;
    }): Promise<any>;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
}
/**
 * Get SERP API client instance
 */
export declare function getSerpApiClient(): SerpApiClient;
/**
 * Initialize SERP API client
 */
export declare function initializeSerpApiClient(apiKey: string): SerpApiClient;
//# sourceMappingURL=client.d.ts.map