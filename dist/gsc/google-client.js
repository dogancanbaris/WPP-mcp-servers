/**
 * Google Search Console API client wrapper
 */
import { google } from 'googleapis';
import { APIError } from '../shared/errors.js';
import { getLogger } from '../shared/logger.js';
import { retry } from '../shared/utils.js';
const logger = getLogger('gsc.google-client');
/**
 * Google Search Console API client
 */
export class GSCGoogleClient {
    constructor(authManager) {
        this.webmastersClient = null;
        this.searchConsoleClient = null;
        this.authManager = authManager;
    }
    /**
     * Initialize Google API clients
     */
    async initialize() {
        try {
            const auth = this.authManager.getAuthenticatedClient();
            // Initialize Webmasters (Search Analytics, Sitemaps, Sites) client
            this.webmastersClient = google.webmasters({
                version: 'v3',
                auth: auth,
            });
            // Initialize Search Console (URL Inspection) client
            // This uses the REST API directly
            this.searchConsoleClient = google.searchconsole({
                version: 'v1',
                auth: auth,
            });
            logger.info('Google API clients initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Google API clients', error);
            throw new APIError(`Failed to initialize Google clients: ${error.message}`);
        }
    }
    /**
     * Query search analytics
     */
    async querySearchAnalytics(siteUrl, request) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.debug('Querying search analytics', {
                siteUrl,
                startDate: request.startDate,
                endDate: request.endDate,
                dimensions: request.dimensions?.length || 0,
            });
            const response = await retry(async () => {
                const res = await this.webmastersClient.searchanalytics.query({
                    siteUrl,
                    requestBody: request,
                });
                return res.data;
            }, 3, 1000);
            logger.debug('Search analytics query successful', {
                rowsReturned: response.rows?.length || 0,
            });
            return response;
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Search analytics query failed', error);
            throw new APIError(`Failed to query search analytics: ${errorMsg}`);
        }
    }
    /**
     * List all sites
     */
    async listSites() {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.debug('Listing sites');
            const response = await retry(async () => {
                const res = await this.webmastersClient.sites.list();
                return res.data;
            }, 3, 1000);
            logger.debug('Sites listing successful', {
                sitesCount: response.siteEntry?.length || 0,
            });
            return response;
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to list sites', error);
            throw new APIError(`Failed to list sites: ${errorMsg}`);
        }
    }
    /**
     * Get site details
     */
    async getSite(siteUrl) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.debug('Getting site details', { siteUrl });
            const response = await retry(async () => {
                const res = await this.webmastersClient.sites.get({ siteUrl });
                return res.data;
            }, 3, 1000);
            logger.debug('Site details retrieved successfully', { siteUrl });
            return response;
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to get site', error, { siteUrl });
            throw new APIError(`Failed to get site ${siteUrl}: ${errorMsg}`);
        }
    }
    /**
     * Add site
     */
    async addSite(siteUrl) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.debug('Adding site', { siteUrl });
            await retry(async () => {
                await this.webmastersClient.sites.add({ siteUrl });
            }, 3, 1000);
            logger.info('Site added successfully', { siteUrl });
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to add site', error, { siteUrl });
            throw new APIError(`Failed to add site ${siteUrl}: ${errorMsg}`);
        }
    }
    /**
     * Delete site
     */
    async deleteSite(siteUrl) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.warn('Deleting site', { siteUrl });
            await retry(async () => {
                await this.webmastersClient.sites.delete({ siteUrl });
            }, 3, 1000);
            logger.warn('Site deleted successfully', { siteUrl });
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to delete site', error, { siteUrl });
            throw new APIError(`Failed to delete site ${siteUrl}: ${errorMsg}`);
        }
    }
    /**
     * List sitemaps for a site
     */
    async listSitemaps(siteUrl) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.debug('Listing sitemaps', { siteUrl });
            const response = await retry(async () => {
                const res = await this.webmastersClient.sitemaps.list({ siteUrl });
                return res.data;
            }, 3, 1000);
            logger.debug('Sitemaps listing successful', {
                sitemapCount: response.sitemap?.length || 0,
            });
            return response;
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to list sitemaps', error, { siteUrl });
            throw new APIError(`Failed to list sitemaps for ${siteUrl}: ${errorMsg}`);
        }
    }
    /**
     * Get sitemap details
     */
    async getSitemap(siteUrl, feedpath) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.debug('Getting sitemap details', { siteUrl, feedpath });
            const response = await retry(async () => {
                const res = await this.webmastersClient.sitemaps.get({
                    siteUrl,
                    feedpath,
                });
                return res.data;
            }, 3, 1000);
            logger.debug('Sitemap details retrieved', { siteUrl, feedpath });
            return response;
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to get sitemap', error, { siteUrl, feedpath });
            throw new APIError(`Failed to get sitemap ${feedpath} for ${siteUrl}: ${errorMsg}`);
        }
    }
    /**
     * Submit sitemap
     */
    async submitSitemap(siteUrl, feedpath) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.info('Submitting sitemap', { siteUrl, feedpath });
            await retry(async () => {
                await this.webmastersClient.sitemaps.submit({
                    siteUrl,
                    feedpath,
                });
            }, 3, 1000);
            logger.info('Sitemap submitted successfully', { siteUrl, feedpath });
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to submit sitemap', error, { siteUrl, feedpath });
            throw new APIError(`Failed to submit sitemap ${feedpath}: ${errorMsg}`);
        }
    }
    /**
     * Delete sitemap
     */
    async deleteSitemap(siteUrl, feedpath) {
        try {
            if (!this.webmastersClient) {
                throw new Error('Google client not initialized');
            }
            logger.warn('Deleting sitemap', { siteUrl, feedpath });
            await retry(async () => {
                await this.webmastersClient.sitemaps.delete({
                    siteUrl,
                    feedpath,
                });
            }, 3, 1000);
            logger.warn('Sitemap deleted successfully', { siteUrl, feedpath });
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to delete sitemap', error, { siteUrl, feedpath });
            throw new APIError(`Failed to delete sitemap ${feedpath}: ${errorMsg}`);
        }
    }
    /**
     * Inspect URL
     */
    async inspectUrl(siteUrl, inspectionUrl) {
        try {
            if (!this.searchConsoleClient) {
                throw new Error('Google client not initialized');
            }
            logger.debug('Inspecting URL', { siteUrl, inspectionUrl });
            const response = await retry(async () => {
                const res = await this.searchConsoleClient.urlInspection.index.inspect({
                    requestBody: {
                        inspectionUrl,
                        siteUrl,
                    },
                });
                return res.data;
            }, 3, 1000);
            logger.debug('URL inspection successful', { inspectionUrl });
            return response;
        }
        catch (error) {
            const errorMsg = error.message;
            logger.error('Failed to inspect URL', error, { inspectionUrl });
            throw new APIError(`Failed to inspect URL ${inspectionUrl}: ${errorMsg}`);
        }
    }
}
/**
 * Singleton client instance
 */
let instance = null;
/**
 * Get Google client instance
 */
export function getGoogleClient(authManager) {
    if (!instance) {
        if (!authManager) {
            throw new Error('AuthManager required to initialize Google client');
        }
        instance = new GSCGoogleClient(authManager);
    }
    return instance;
}
/**
 * Initialize and get the client
 */
export async function initializeGoogleClient(authManager) {
    const client = getGoogleClient(authManager);
    await client.initialize();
    return client;
}
/**
 * Reset client (for testing)
 */
export function resetGoogleClient() {
    instance = null;
}
//# sourceMappingURL=google-client.js.map