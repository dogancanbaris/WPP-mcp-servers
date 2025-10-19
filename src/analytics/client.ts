/**
 * Google Analytics API Client Wrapper
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { getLogger } from '../shared/logger.js';
import type { OAuth2Client } from 'google-auth-library';
import type {
  AnalyticsProperty,
  AnalyticsAccount,
  DataStream,
  ReportRequest,
  ReportResponse,
  RealtimeReportRequest,
} from './types.js';

const logger = getLogger('analytics.client');

/**
 * Google Analytics API Client
 */
export class AnalyticsClient {
  private dataClient: BetaAnalyticsDataClient;
  private adminClient: AnalyticsAdminServiceClient;
  private initialized: boolean = false;

  constructor(auth: OAuth2Client) {

    // Initialize Data API client (for reports)
    this.dataClient = new BetaAnalyticsDataClient({
      authClient: auth as any,
    });

    // Initialize Admin API client (for property management)
    this.adminClient = new AnalyticsAdminServiceClient({
      authClient: auth as any,
    });

    logger.info('Google Analytics API clients created');
  }

  /**
   * Initialize and verify connection
   */
  async initialize(): Promise<void> {
    try {
      logger.debug('Initializing Google Analytics API client');

      // Test connection by listing accounts
      await this.listAccounts();

      this.initialized = true;
      logger.info('Google Analytics API client initialized successfully');
    } catch (error) {
      logger.warn('Google Analytics API connection test failed - tools may not work', error as Error);
      // Don't throw - allow server to start even if Analytics has issues
      this.initialized = false;
    }
  }

  /**
   * List all GA4 accounts
   */
  async listAccounts(): Promise<AnalyticsAccount[]> {
    try {
      logger.debug('Listing Analytics accounts');

      const [accounts] = await this.adminClient.listAccounts({});

      const formatted = (accounts || []).map((account: any) => ({
        name: account.name,
        accountId: account.name?.split('/')[1] || '',
        displayName: account.displayName || '',
      }));

      logger.info('Analytics accounts retrieved', { count: formatted.length });

      return formatted;
    } catch (error) {
      logger.error('Failed to list Analytics accounts', error as Error);
      throw new Error(`Failed to list Analytics accounts: ${(error as Error).message}`);
    }
  }

  /**
   * List properties for an account
   */
  async listProperties(accountId?: string): Promise<AnalyticsProperty[]> {
    try {
      logger.debug('Listing Analytics properties', { accountId });

      const request: any = {};
      if (accountId) {
        request.filter = `parent:accounts/${accountId}`;
      }

      const [properties] = await this.adminClient.listProperties(request);

      const formatted = (properties || []).map((prop: any) => ({
        name: prop.name,
        propertyId: prop.name?.split('/')[1] || '',
        displayName: prop.displayName || '',
        timeZone: prop.timeZone,
        currencyCode: prop.currencyCode,
        industryCategory: prop.industryCategory,
      }));

      logger.info('Analytics properties retrieved', { count: formatted.length });

      return formatted;
    } catch (error) {
      logger.error('Failed to list Analytics properties', error as Error);
      throw new Error(`Failed to list Analytics properties: ${(error as Error).message}`);
    }
  }

  /**
   * List data streams for a property
   */
  async listDataStreams(propertyId: string): Promise<DataStream[]> {
    try {
      logger.debug('Listing data streams', { propertyId });

      const [streams] = await this.adminClient.listDataStreams({
        parent: `properties/${propertyId}`,
      });

      const formatted = (streams || []).map((stream: any) => ({
        name: stream.name,
        streamId: stream.name?.split('/')[3] || '',
        type: stream.type,
        displayName: stream.displayName || '',
        webStreamData: stream.webStreamData,
      }));

      logger.info('Data streams retrieved', { propertyId, count: formatted.length });

      return formatted;
    } catch (error) {
      logger.error('Failed to list data streams', error as Error);
      throw new Error(`Failed to list data streams: ${(error as Error).message}`);
    }
  }

  /**
   * Run analytics report
   */
  async runReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      logger.debug('Running Analytics report', { propertyId: request.propertyId });

      const [response] = await this.dataClient.runReport({
        property: `properties/${request.propertyId}`,
        dateRanges: request.dateRanges,
        dimensions: request.dimensions,
        metrics: request.metrics,
        limit: request.limit,
        offset: request.offset,
      });

      logger.info('Analytics report completed', {
        propertyId: request.propertyId,
        rowCount: response.rowCount,
      });

      return {
        dimensionHeaders: (response.dimensionHeaders || []) as any,
        metricHeaders: (response.metricHeaders || []) as any,
        rows: (response.rows || []) as any,
        rowCount: parseInt(String(response.rowCount || 0)),
        metadata: response.metadata,
      };
    } catch (error) {
      logger.error('Failed to run Analytics report', error as Error);
      throw new Error(`Failed to run Analytics report: ${(error as Error).message}`);
    }
  }

  /**
   * Run realtime report
   */
  async runRealtimeReport(request: RealtimeReportRequest): Promise<ReportResponse> {
    try {
      logger.debug('Running realtime Analytics report', { propertyId: request.propertyId });

      const [response] = await this.dataClient.runRealtimeReport({
        property: `properties/${request.propertyId}`,
        dimensions: request.dimensions,
        metrics: request.metrics,
        limit: request.limit,
      });

      logger.info('Realtime Analytics report completed', {
        propertyId: request.propertyId,
        rowCount: response.rowCount,
      });

      return {
        dimensionHeaders: (response.dimensionHeaders || []) as any,
        metricHeaders: (response.metricHeaders || []) as any,
        rows: (response.rows || []) as any,
        rowCount: parseInt(String(response.rowCount || 0)),
      };
    } catch (error) {
      logger.error('Failed to run realtime Analytics report', error as Error);
      throw new Error(`Failed to run realtime Analytics report: ${(error as Error).message}`);
    }
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create GA4 property
   */
  async createProperty(accountId: string, property: any): Promise<any> {
    try {
      return await this.adminClient.createProperty({
        property: {
          parent: `accounts/${accountId}`,
          ...property,
        },
      });
    } catch (error) {
      logger.error('Failed to create property', error as Error);
      throw error;
    }
  }

  /**
   * Create data stream
   */
  async createDataStream(propertyId: string, dataStream: any): Promise<any> {
    try {
      return await this.adminClient.createDataStream({
        parent: `properties/${propertyId}`,
        dataStream,
      });
    } catch (error) {
      logger.error('Failed to create data stream', error as Error);
      throw error;
    }
  }

  /**
   * Create custom dimension
   */
  async createCustomDimension(propertyId: string, dimension: any): Promise<any> {
    try {
      return await this.adminClient.createCustomDimension({
        parent: `properties/${propertyId}`,
        customDimension: dimension,
      });
    } catch (error) {
      logger.error('Failed to create custom dimension', error as Error);
      throw error;
    }
  }

  /**
   * Create custom metric
   */
  async createCustomMetric(propertyId: string, metric: any): Promise<any> {
    try {
      return await this.adminClient.createCustomMetric({
        parent: `properties/${propertyId}`,
        customMetric: metric,
      });
    } catch (error) {
      logger.error('Failed to create custom metric', error as Error);
      throw error;
    }
  }

  /**
   * Create conversion event
   */
  async createConversionEvent(propertyId: string, eventName: string): Promise<any> {
    try {
      return await this.adminClient.createConversionEvent({
        parent: `properties/${propertyId}`,
        conversionEvent: {
          eventName,
        },
      });
    } catch (error) {
      logger.error('Failed to create conversion event', error as Error);
      throw error;
    }
  }

  /**
   * Create Google Ads link
   */
  async createGoogleAdsLink(propertyId: string, link: any): Promise<any> {
    try {
      return await this.adminClient.createGoogleAdsLink({
        parent: `properties/${propertyId}`,
        googleAdsLink: link,
      });
    } catch (error) {
      logger.error('Failed to create Google Ads link', error as Error);
      throw error;
    }
  }
}

// Singleton instance
let analyticsClientInstance: AnalyticsClient | null = null;

/**
 * Get Analytics client instance
 */
export function getAnalyticsClient(): AnalyticsClient {
  if (!analyticsClientInstance) {
    throw new Error('Analytics client not initialized. Call initializeAnalyticsClient first.');
  }
  return analyticsClientInstance;
}

/**
 * Initialize Analytics client
 */
export function initializeAnalyticsClient(auth: OAuth2Client): AnalyticsClient {
  analyticsClientInstance = new AnalyticsClient(auth);
  logger.info('Google Analytics client instance created');
  return analyticsClientInstance;
}
