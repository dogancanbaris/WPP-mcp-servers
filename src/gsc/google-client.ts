/**
 * Google Search Console API client wrapper
 */

import { google, webmasters_v3 } from 'googleapis';
import { GSCAuthManager } from './auth.js';
import { APIError } from '../shared/errors.js';
import { getLogger } from '../shared/logger.js';
import { retry } from '../shared/utils.js';

const logger = getLogger('gsc.google-client');

/**
 * Google Search Console API client
 */
export class GSCGoogleClient {
  private authManager: GSCAuthManager;
  private webmastersClient: webmasters_v3.Webmasters | null = null;
  private searchConsoleClient: any = null;

  constructor(authManager: GSCAuthManager) {
    this.authManager = authManager;
  }

  /**
   * Initialize Google API clients
   */
  async initialize(): Promise<void> {
    try {
      const auth = this.authManager.getAuthenticatedClient();

      // Initialize Webmasters (Search Analytics, Sitemaps, Sites) client
      this.webmastersClient = google.webmasters({
        version: 'v3',
        auth: auth as any,
      } as any);

      // Initialize Search Console (URL Inspection) client
      // This uses the REST API directly
      this.searchConsoleClient = google.searchconsole({
        version: 'v1',
        auth: auth as any,
      } as any);

      logger.info('Google API clients initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google API clients', error);
      throw new APIError(`Failed to initialize Google clients: ${(error as Error).message}`);
    }
  }

  /**
   * Query search analytics
   */
  async querySearchAnalytics(
    siteUrl: string,
    request: any
  ): Promise<webmasters_v3.Schema$SearchAnalyticsQueryResponse> {
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

      const response = await retry(
        async () => {
          const res = await this.webmastersClient!.searchanalytics.query({
            siteUrl,
            requestBody: request,
          });
          return res.data;
        },
        3,
        1000
      );

      logger.debug('Search analytics query successful', {
        rowsReturned: response.rows?.length || 0,
      });

      return response;
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Search analytics query failed', error as Error);
      throw new APIError(`Failed to query search analytics: ${errorMsg}`);
    }
  }

  /**
   * List all sites
   */
  async listSites(): Promise<webmasters_v3.Schema$SitesListResponse> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.debug('Listing sites');

      const response = await retry(
        async () => {
          const res = await this.webmastersClient!.sites.list();
          return res.data;
        },
        3,
        1000
      );

      logger.debug('Sites listing successful', {
        sitesCount: response.siteEntry?.length || 0,
      });

      return response;
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to list sites', error as Error);
      throw new APIError(`Failed to list sites: ${errorMsg}`);
    }
  }

  /**
   * Get site details
   */
  async getSite(siteUrl: string): Promise<webmasters_v3.Schema$WmxSite> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.debug('Getting site details', { siteUrl });

      const response = await retry(
        async () => {
          const res = await this.webmastersClient!.sites.get({ siteUrl });
          return res.data;
        },
        3,
        1000
      );

      logger.debug('Site details retrieved successfully', { siteUrl });

      return response;
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to get site', error as Error, { siteUrl });
      throw new APIError(`Failed to get site ${siteUrl}: ${errorMsg}`);
    }
  }

  /**
   * Add site
   */
  async addSite(siteUrl: string): Promise<void> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.debug('Adding site', { siteUrl });

      await retry(
        async () => {
          await this.webmastersClient!.sites.add({ siteUrl });
        },
        3,
        1000
      );

      logger.info('Site added successfully', { siteUrl });
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to add site', error as Error, { siteUrl });
      throw new APIError(`Failed to add site ${siteUrl}: ${errorMsg}`);
    }
  }

  /**
   * Delete site
   */
  async deleteSite(siteUrl: string): Promise<void> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.warn('Deleting site', { siteUrl });

      await retry(
        async () => {
          await this.webmastersClient!.sites.delete({ siteUrl });
        },
        3,
        1000
      );

      logger.warn('Site deleted successfully', { siteUrl });
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to delete site', error as Error, { siteUrl });
      throw new APIError(`Failed to delete site ${siteUrl}: ${errorMsg}`);
    }
  }

  /**
   * List sitemaps for a site
   */
  async listSitemaps(
    siteUrl: string
  ): Promise<webmasters_v3.Schema$SitemapsListResponse> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.debug('Listing sitemaps', { siteUrl });

      const response = await retry(
        async () => {
          const res = await this.webmastersClient!.sitemaps.list({ siteUrl });
          return res.data;
        },
        3,
        1000
      );

      logger.debug('Sitemaps listing successful', {
        sitemapCount: response.sitemap?.length || 0,
      });

      return response;
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to list sitemaps', error as Error, { siteUrl });
      throw new APIError(`Failed to list sitemaps for ${siteUrl}: ${errorMsg}`);
    }
  }

  /**
   * Get sitemap details
   */
  async getSitemap(
    siteUrl: string,
    feedpath: string
  ): Promise<webmasters_v3.Schema$WmxSitemap> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.debug('Getting sitemap details', { siteUrl, feedpath });

      const response = await retry(
        async () => {
          const res = await this.webmastersClient!.sitemaps.get({
            siteUrl,
            feedpath,
          });
          return res.data;
        },
        3,
        1000
      );

      logger.debug('Sitemap details retrieved', { siteUrl, feedpath });

      return response;
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to get sitemap', error as Error, { siteUrl, feedpath });
      throw new APIError(
        `Failed to get sitemap ${feedpath} for ${siteUrl}: ${errorMsg}`
      );
    }
  }

  /**
   * Submit sitemap
   */
  async submitSitemap(siteUrl: string, feedpath: string): Promise<void> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.info('Submitting sitemap', { siteUrl, feedpath });

      await retry(
        async () => {
          await this.webmastersClient!.sitemaps.submit({
            siteUrl,
            feedpath,
          });
        },
        3,
        1000
      );

      logger.info('Sitemap submitted successfully', { siteUrl, feedpath });
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to submit sitemap', error as Error, { siteUrl, feedpath });
      throw new APIError(`Failed to submit sitemap ${feedpath}: ${errorMsg}`);
    }
  }

  /**
   * Delete sitemap
   */
  async deleteSitemap(siteUrl: string, feedpath: string): Promise<void> {
    try {
      if (!this.webmastersClient) {
        throw new Error('Google client not initialized');
      }

      logger.warn('Deleting sitemap', { siteUrl, feedpath });

      await retry(
        async () => {
          await this.webmastersClient!.sitemaps.delete({
            siteUrl,
            feedpath,
          });
        },
        3,
        1000
      );

      logger.warn('Sitemap deleted successfully', { siteUrl, feedpath });
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to delete sitemap', error as Error, { siteUrl, feedpath });
      throw new APIError(`Failed to delete sitemap ${feedpath}: ${errorMsg}`);
    }
  }

  /**
   * Inspect URL
   */
  async inspectUrl(siteUrl: string, inspectionUrl: string): Promise<any> {
    try {
      if (!this.searchConsoleClient) {
        throw new Error('Google client not initialized');
      }

      logger.debug('Inspecting URL', { siteUrl, inspectionUrl });

      const response = await retry(
        async () => {
          const res = await this.searchConsoleClient.urlInspection.index.inspect({
            requestBody: {
              inspectionUrl,
              siteUrl,
            },
          });
          return res.data;
        },
        3,
        1000
      );

      logger.debug('URL inspection successful', { inspectionUrl });

      return response;
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Failed to inspect URL', error as Error, { inspectionUrl });
      throw new APIError(`Failed to inspect URL ${inspectionUrl}: ${errorMsg}`);
    }
  }
}

/**
 * Singleton client instance
 */
let instance: GSCGoogleClient | null = null;

/**
 * Get Google client instance
 */
export function getGoogleClient(authManager?: GSCAuthManager): GSCGoogleClient {
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
export async function initializeGoogleClient(authManager: GSCAuthManager): Promise<GSCGoogleClient> {
  const client = getGoogleClient(authManager);
  await client.initialize();
  return client;
}

/**
 * Reset client (for testing)
 */
export function resetGoogleClient(): void {
  instance = null;
}
