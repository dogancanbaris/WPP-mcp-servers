/**
 * Account Authorization Manager
 * Enforces two-layer authorization: Google OAuth + WPP Manager Approval
 */
/**
 * Approved account record
 */
export interface ApprovedAccount {
    api: 'GSC' | 'Google Ads' | 'Analytics' | 'CrUX';
    accountId: string;
    accountName?: string;
    clientName?: string;
    approvedBy: string;
    approvedAt: string;
    expiresAt?: string;
}
/**
 * Manages account-level authorization
 */
export declare class AccountAuthorizationManager {
    private approvedAccounts;
    private userId;
    /**
     * Load approved accounts from OMA (encrypted and signed)
     */
    loadFromEncrypted(encryptedData: string, signature: string): Promise<void>;
    /**
     * Check if user can access account
     */
    canAccessAccount(api: string, accountId: string): boolean;
    /**
     * Enforce access (throws if not authorized)
     */
    enforceAccess(api: string, accountId: string): void;
    /**
     * Get list of approved accounts for display
     */
    getApprovedAccountsList(): string;
    /**
     * Get approved accounts for specific API
     */
    getApprovedAccountsForApi(api: string): ApprovedAccount[];
    /**
     * Decrypt approved accounts data
     */
    private decrypt;
}
/**
 * Unauthorized account access error
 */
export declare class UnauthorizedAccountAccessError extends Error {
    constructor(message: string);
}
/**
 * Get account authorization manager instance
 */
export declare function getAccountAuthorizationManager(): AccountAuthorizationManager;
/**
 * Set account authorization manager for current request
 */
export declare function setAccountAuthorizationManager(manager: AccountAuthorizationManager): void;
//# sourceMappingURL=account-authorization.d.ts.map