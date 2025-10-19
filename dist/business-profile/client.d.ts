/**
 * Google Business Profile API Client
 */
import type { OAuth2Client } from 'google-auth-library';
/**
 * Google Business Profile API Client
 */
export declare class BusinessProfileClient {
    private mybusinessbusinessinformation;
    private mybusinessaccountmanagement;
    private initialized;
    constructor(auth: OAuth2Client);
    /**
     * Initialize and verify connection
     */
    initialize(): Promise<void>;
    /**
     * List accounts
     */
    listAccounts(): Promise<any[]>;
    /**
     * List locations
     */
    listLocations(accountId: string): Promise<any[]>;
    /**
     * Get location details
     */
    getLocation(locationName: string): Promise<any>;
    /**
     * Update location
     */
    updateLocation(locationName: string, location: any, updateMask: string[]): Promise<any>;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
}
/**
 * Get Business Profile client instance
 */
export declare function getBusinessProfileClient(): BusinessProfileClient;
/**
 * Initialize Business Profile client
 */
export declare function initializeBusinessProfileClient(auth: OAuth2Client): BusinessProfileClient;
//# sourceMappingURL=client.d.ts.map