/**
 * Google Business Profile API Client
 */
import { google } from 'googleapis';
import { getLogger } from '../shared/logger.js';
const logger = getLogger('business-profile.client');
/**
 * Google Business Profile API Client
 */
export class BusinessProfileClient {
    constructor(auth) {
        this.initialized = false;
        // Initialize Business Information API
        this.mybusinessbusinessinformation = google.mybusinessbusinessinformation({
            version: 'v1',
            auth: auth,
        });
        // Initialize Account Management API
        this.mybusinessaccountmanagement = google.mybusinessaccountmanagement({
            version: 'v1',
            auth: auth,
        });
        logger.info('Google Business Profile API client created');
    }
    /**
     * Initialize and verify connection
     */
    async initialize() {
        try {
            logger.debug('Initializing Business Profile API client');
            // Test connection by listing accounts
            await this.listAccounts();
            this.initialized = true;
            logger.info('Business Profile API client initialized successfully');
        }
        catch (error) {
            logger.warn('Business Profile API connection test failed', error);
            this.initialized = false;
        }
    }
    /**
     * List accounts
     */
    async listAccounts() {
        try {
            const response = await this.mybusinessaccountmanagement.accounts.list();
            return response.data.accounts || [];
        }
        catch (error) {
            logger.error('Failed to list accounts', error);
            throw error;
        }
    }
    /**
     * List locations
     */
    async listLocations(accountId) {
        try {
            const response = await this.mybusinessbusinessinformation.accounts.locations.list({
                parent: `accounts/${accountId}`,
                readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,profile',
            });
            return response.data.locations || [];
        }
        catch (error) {
            logger.error('Failed to list locations', error);
            throw error;
        }
    }
    /**
     * Get location details
     */
    async getLocation(locationName) {
        try {
            const response = await this.mybusinessbusinessinformation.locations.get({
                name: locationName,
                readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours,profile',
            });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to get location', error);
            throw error;
        }
    }
    /**
     * Update location
     */
    async updateLocation(locationName, location, updateMask) {
        try {
            const response = await this.mybusinessbusinessinformation.locations.patch({
                name: locationName,
                updateMask: updateMask.join(','),
                requestBody: location,
            });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to update location', error);
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
let businessProfileClientInstance = null;
/**
 * Get Business Profile client instance
 */
export function getBusinessProfileClient() {
    if (!businessProfileClientInstance) {
        throw new Error('Business Profile client not initialized. Call initializeBusinessProfileClient first.');
    }
    return businessProfileClientInstance;
}
/**
 * Initialize Business Profile client
 */
export function initializeBusinessProfileClient(auth) {
    businessProfileClientInstance = new BusinessProfileClient(auth);
    logger.info('Business Profile client instance created');
    return businessProfileClientInstance;
}
//# sourceMappingURL=client.js.map