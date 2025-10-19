/**
 * Account Authorization Manager
 * Enforces two-layer authorization: Google OAuth + WPP Manager Approval
 */
import crypto from 'crypto';
import { getLogger } from './logger.js';
const logger = getLogger('shared.account-authorization');
/**
 * Manages account-level authorization
 */
export class AccountAuthorizationManager {
    constructor() {
        this.approvedAccounts = [];
        this.userId = '';
    }
    /**
     * Load approved accounts from OMA (encrypted and signed)
     */
    async loadFromEncrypted(encryptedData, signature) {
        try {
            // Verify signature to ensure data came from OMA and wasn't tampered
            const sharedSecret = process.env.OMA_MCP_SHARED_SECRET;
            if (!sharedSecret) {
                throw new Error('OMA_MCP_SHARED_SECRET not configured');
            }
            const expectedSignature = crypto
                .createHmac('sha256', sharedSecret)
                .update(encryptedData)
                .digest('hex');
            if (signature !== expectedSignature) {
                logger.error('Invalid approved accounts signature - possible tampering detected');
                throw new Error('Invalid approved accounts signature');
            }
            // Decrypt (AES-256)
            const decrypted = this.decrypt(encryptedData, sharedSecret);
            // Parse JSON
            const data = JSON.parse(decrypted);
            this.approvedAccounts = data.accounts || [];
            this.userId = data.userId;
            // Filter expired accounts
            const now = new Date();
            this.approvedAccounts = this.approvedAccounts.filter((acc) => {
                if (acc.expiresAt) {
                    const expiryDate = new Date(acc.expiresAt);
                    if (expiryDate < now) {
                        logger.warn('Filtered expired account access', {
                            userId: this.userId,
                            account: acc.accountId,
                            expiredAt: acc.expiresAt,
                        });
                        return false;
                    }
                }
                return true;
            });
            logger.info('Approved accounts loaded', {
                userId: this.userId,
                count: this.approvedAccounts.length,
            });
        }
        catch (error) {
            logger.error('Failed to load approved accounts', error);
            throw error;
        }
    }
    /**
     * Check if user can access account
     */
    canAccessAccount(api, accountId) {
        return this.approvedAccounts.some((acc) => acc.api === api && acc.accountId === accountId);
    }
    /**
     * Enforce access (throws if not authorized)
     */
    enforceAccess(api, accountId) {
        if (!this.canAccessAccount(api, accountId)) {
            const approvedList = this.getApprovedAccountsList();
            logger.warn('Unauthorized account access attempt', {
                userId: this.userId,
                api,
                requestedAccount: accountId,
                approvedAccounts: approvedList,
            });
            throw new UnauthorizedAccountAccessError(`You don't have access to ${api} account ${accountId}.\n\n` +
                `Your currently approved accounts:\n${approvedList}\n\n` +
                `To request access to this account, go to OMA → Request Account Access.`);
        }
    }
    /**
     * Get list of approved accounts for display
     */
    getApprovedAccountsList() {
        if (this.approvedAccounts.length === 0) {
            return 'No approved accounts';
        }
        return this.approvedAccounts
            .map((acc) => `  - ${acc.api}: ${acc.accountId}${acc.accountName ? ` (${acc.accountName})` : ''}${acc.clientName ? ` - ${acc.clientName}` : ''}`)
            .join('\n');
    }
    /**
     * Get approved accounts for specific API
     */
    getApprovedAccountsForApi(api) {
        return this.approvedAccounts.filter((acc) => acc.api === api);
    }
    /**
     * Decrypt approved accounts data
     */
    decrypt(encrypted, secret) {
        try {
            // Split IV and encrypted data (format: "iv:encryptedData")
            const [ivHex, encryptedData] = encrypted.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const encryptedBuffer = Buffer.from(encryptedData, 'hex');
            // Create decipher
            const key = crypto.scryptSync(secret, 'salt', 32);
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            // Decrypt
            const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
            return decrypted.toString('utf8');
        }
        catch (error) {
            logger.error('Decryption failed', error);
            throw new Error('Failed to decrypt approved accounts data');
        }
    }
}
/**
 * Unauthorized account access error
 */
export class UnauthorizedAccountAccessError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedAccountAccessError';
    }
}
// Singleton instance (created per request in HTTP mode)
let accountAuthManagerInstance = null;
/**
 * Get account authorization manager instance
 */
export function getAccountAuthorizationManager() {
    if (!accountAuthManagerInstance) {
        accountAuthManagerInstance = new AccountAuthorizationManager();
    }
    return accountAuthManagerInstance;
}
/**
 * Set account authorization manager for current request
 */
export function setAccountAuthorizationManager(manager) {
    accountAuthManagerInstance = manager;
}
//# sourceMappingURL=account-authorization.js.map