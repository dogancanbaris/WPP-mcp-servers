/**
 * Google Business Profile API Client
 */

import { google } from 'googleapis';
import { getLogger } from '../shared/logger.js';
import type { OAuth2Client } from 'google-auth-library';

const logger = getLogger('business-profile.client');

/**
 * Google Business Profile API Client
 */
export class BusinessProfileClient {
  private mybusinessbusinessinformation: any;
  private mybusinessaccountmanagement: any;
  private initialized: boolean = false;

  constructor(auth: OAuth2Client) {
    // Initialize Business Information API
    this.mybusinessbusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: auth as any,
    });

    // Initialize Account Management API
    this.mybusinessaccountmanagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: auth as any,
    });

    logger.info('Google Business Profile API client created');
  }

  /**
   * Initialize and verify connection
   */
  async initialize(): Promise<void> {
    try {
      logger.debug('Initializing Business Profile API client');

      // Test connection by listing accounts
      await this.listAccounts();

      this.initialized = true;
      logger.info('Business Profile API client initialized successfully');
    } catch (error) {
      logger.warn('Business Profile API connection test failed', error as Error);
      this.initialized = false;
    }
  }

  /**
   * List accounts
   */
  async listAccounts(): Promise<any[]> {
    try {
      const response = await this.mybusinessaccountmanagement.accounts.list();
      return response.data.accounts || [];
    } catch (error) {
      logger.error('Failed to list accounts', error as Error);
      throw error;
    }
  }

  /**
   * List locations
   */
  async listLocations(accountId: string): Promise<any[]> {
    try {
      const response = await this.mybusinessbusinessinformation.accounts.locations.list({
        parent: `accounts/${accountId}`,
        readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,profile',
      });

      return response.data.locations || [];
    } catch (error) {
      logger.error('Failed to list locations', error as Error);
      throw error;
    }
  }

  /**
   * Get location details
   */
  async getLocation(locationName: string): Promise<any> {
    try {
      const response = await this.mybusinessbusinessinformation.locations.get({
        name: locationName,
        readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours,profile',
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get location', error as Error);
      throw error;
    }
  }

  /**
   * Update location
   */
  async updateLocation(locationName: string, location: any, updateMask: string[]): Promise<any> {
    try {
      const response = await this.mybusinessbusinessinformation.locations.patch({
        name: locationName,
        updateMask: updateMask.join(','),
        requestBody: location,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to update location', error as Error);
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
let businessProfileClientInstance: BusinessProfileClient | null = null;

/**
 * Get Business Profile client instance
 */
export function getBusinessProfileClient(): BusinessProfileClient {
  if (!businessProfileClientInstance) {
    throw new Error('Business Profile client not initialized. Call initializeBusinessProfileClient first.');
  }
  return businessProfileClientInstance;
}

/**
 * Initialize Business Profile client
 */
export function initializeBusinessProfileClient(auth: OAuth2Client): BusinessProfileClient {
  businessProfileClientInstance = new BusinessProfileClient(auth);
  logger.info('Business Profile client instance created');
  return businessProfileClientInstance;
}
