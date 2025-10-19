/**
 * Google Search Console API client wrapper
 */
import { webmasters_v3 } from 'googleapis';
import { GSCAuthManager } from './auth.js';
/**
 * Google Search Console API client
 */
export declare class GSCGoogleClient {
    private authManager;
    private webmastersClient;
    private searchConsoleClient;
    constructor(authManager: GSCAuthManager);
    /**
     * Initialize Google API clients
     */
    initialize(): Promise<void>;
    /**
     * Query search analytics
     */
    querySearchAnalytics(siteUrl: string, request: any): Promise<webmasters_v3.Schema$SearchAnalyticsQueryResponse>;
    /**
     * List all sites
     */
    listSites(): Promise<webmasters_v3.Schema$SitesListResponse>;
    /**
     * Get site details
     */
    getSite(siteUrl: string): Promise<webmasters_v3.Schema$WmxSite>;
    /**
     * Add site
     */
    addSite(siteUrl: string): Promise<void>;
    /**
     * Delete site
     */
    deleteSite(siteUrl: string): Promise<void>;
    /**
     * List sitemaps for a site
     */
    listSitemaps(siteUrl: string): Promise<webmasters_v3.Schema$SitemapsListResponse>;
    /**
     * Get sitemap details
     */
    getSitemap(siteUrl: string, feedpath: string): Promise<webmasters_v3.Schema$WmxSitemap>;
    /**
     * Submit sitemap
     */
    submitSitemap(siteUrl: string, feedpath: string): Promise<void>;
    /**
     * Delete sitemap
     */
    deleteSitemap(siteUrl: string, feedpath: string): Promise<void>;
    /**
     * Inspect URL
     */
    inspectUrl(siteUrl: string, inspectionUrl: string): Promise<any>;
}
/**
 * Get Google client instance
 */
export declare function getGoogleClient(authManager?: GSCAuthManager): GSCGoogleClient;
/**
 * Initialize and get the client
 */
export declare function initializeGoogleClient(authManager: GSCAuthManager): Promise<GSCGoogleClient>;
/**
 * Reset client (for testing)
 */
export declare function resetGoogleClient(): void;
//# sourceMappingURL=google-client.d.ts.map