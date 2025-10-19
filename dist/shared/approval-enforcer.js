/**
 * Approval Workflow Enforcer
 * Implements preview → confirm → execute workflow for write operations
 */
import crypto from 'crypto';
import { getLogger } from './logger.js';
const logger = getLogger('shared.approval-enforcer');
/**
 * Approval workflow manager
 */
export class ApprovalEnforcer {
    constructor() {
        this.pendingApprovals = new Map();
        this.CONFIRMATION_TIMEOUT = 60000; // 60 seconds
    }
    /**
     * Create dry-run preview for write operation
     */
    async createDryRun(operation, api, accountId, _params) {
        logger.info('Creating dry-run preview', { operation, api, accountId });
        // Build dry-run result (operation-specific logic will be passed in)
        const dryRun = {
            operation,
            api,
            accountId,
            changes: [],
            risks: [],
            recommendations: [],
        };
        // Generate confirmation token
        const token = this.generateConfirmationToken();
        const dryRunHash = this.hashDryRun(dryRun);
        const confirmation = {
            token,
            operation,
            dryRunHash,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.CONFIRMATION_TIMEOUT),
        };
        this.pendingApprovals.set(token, confirmation);
        // Schedule cleanup
        setTimeout(() => {
            if (this.pendingApprovals.has(token)) {
                logger.info('Confirmation token expired', { token, operation });
                this.pendingApprovals.delete(token);
            }
        }, this.CONFIRMATION_TIMEOUT);
        return { dryRun, confirmationToken: token };
    }
    /**
     * Validate confirmation token and execute operation
     */
    async validateAndExecute(confirmationToken, dryRun, executeCallback) {
        // Get confirmation record
        const confirmation = this.pendingApprovals.get(confirmationToken);
        if (!confirmation) {
            throw new Error('Invalid or expired confirmation token. Please generate a new preview and confirm within 60 seconds.');
        }
        // Verify not expired
        if (new Date() > confirmation.expiresAt) {
            this.pendingApprovals.delete(confirmationToken);
            throw new Error('Confirmation token has expired. Please generate a new preview and confirm within 60 seconds.');
        }
        // Verify dry-run matches (prevents tampering)
        const currentHash = this.hashDryRun(dryRun);
        if (currentHash !== confirmation.dryRunHash) {
            logger.error('Dry-run hash mismatch - possible tampering', {
                token: confirmationToken,
                expected: confirmation.dryRunHash,
                actual: currentHash,
            });
            throw new Error('Dry-run result has changed since preview was generated. Please generate a fresh preview.');
        }
        logger.info('Executing approved operation', {
            operation: confirmation.operation,
            token: confirmationToken,
        });
        try {
            // Execute the actual operation
            const result = await executeCallback();
            // Remove from pending
            this.pendingApprovals.delete(confirmationToken);
            logger.info('Approved operation executed successfully', {
                operation: confirmation.operation,
                token: confirmationToken,
            });
            return result;
        }
        catch (error) {
            logger.error('Approved operation failed during execution', {
                operation: confirmation.operation,
                error: error,
            });
            throw error;
        }
    }
    /**
     * Build dry-run result for specific operations
     */
    buildDryRunResult(params) {
        return {
            operation: params.operation,
            api: params.api,
            accountId: params.accountId,
            changes: params.changes,
            risks: params.risks || [],
            recommendations: params.recommendations || [],
            estimatedImpact: params.estimatedImpact,
        };
    }
    /**
     * Format dry-run result for display to user
     */
    formatDryRunForDisplay(dryRun) {
        let output = `\n📋 PREVIEW: ${dryRun.operation}\n`;
        output += `API: ${dryRun.api}\n`;
        output += `Account: ${dryRun.accountId}\n\n`;
        // Changes
        if (dryRun.changes.length > 0) {
            output += `🔄 CHANGES (${dryRun.changes.length}):\n`;
            dryRun.changes.forEach((change, i) => {
                output += `\n  ${i + 1}. ${change.changeType.toUpperCase()}: ${change.resource} ${change.resourceId}\n`;
                if (change.changeType === 'update') {
                    output += `     ${change.field}: ${JSON.stringify(change.currentValue)} → ${JSON.stringify(change.newValue)}\n`;
                }
                else if (change.changeType === 'create') {
                    output += `     ${change.field}: ${JSON.stringify(change.newValue)}\n`;
                }
            });
            output += '\n';
        }
        // Financial impact
        if (dryRun.estimatedImpact) {
            const impact = dryRun.estimatedImpact;
            output += `💰 FINANCIAL IMPACT:\n`;
            if (impact.currentDailySpend !== undefined) {
                output += `   Current daily spend: $${impact.currentDailySpend.toFixed(2)}\n`;
            }
            if (impact.estimatedNewDailySpend !== undefined) {
                output += `   Estimated new daily spend: $${impact.estimatedNewDailySpend.toFixed(2)}\n`;
            }
            if (impact.dailyDifference !== undefined) {
                const sign = impact.dailyDifference >= 0 ? '+' : '';
                output += `   Daily difference: ${sign}$${impact.dailyDifference.toFixed(2)}\n`;
            }
            if (impact.monthlyDifference !== undefined) {
                const sign = impact.monthlyDifference >= 0 ? '+' : '';
                output += `   Monthly estimate: ${sign}$${impact.monthlyDifference.toFixed(2)}\n`;
            }
            if (impact.percentageChange !== undefined) {
                const sign = impact.percentageChange >= 0 ? '+' : '';
                output += `   Percentage change: ${sign}${impact.percentageChange.toFixed(1)}%\n`;
            }
            output += '\n';
        }
        // Risks
        if (dryRun.risks.length > 0) {
            output += `⚠️  RISKS:\n`;
            dryRun.risks.forEach((risk) => {
                output += `   • ${risk}\n`;
            });
            output += '\n';
        }
        // Recommendations
        if (dryRun.recommendations.length > 0) {
            output += `💡 RECOMMENDATIONS:\n`;
            dryRun.recommendations.forEach((rec) => {
                output += `   • ${rec}\n`;
            });
            output += '\n';
        }
        output += `⏱️  You have 60 seconds to confirm this operation.\n`;
        output += `✅ To proceed, call the tool again with the confirmation token.\n`;
        output += `❌ To cancel, simply don't confirm within 60 seconds.\n`;
        return output;
    }
    /**
     * Generate confirmation token
     */
    generateConfirmationToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    /**
     * Hash dry-run result for verification
     */
    hashDryRun(dryRun) {
        const serialized = JSON.stringify({
            operation: dryRun.operation,
            api: dryRun.api,
            accountId: dryRun.accountId,
            changes: dryRun.changes,
        });
        return crypto.createHash('sha256').update(serialized).digest('hex');
    }
    /**
     * Clean up expired confirmations (called periodically)
     */
    cleanupExpiredConfirmations() {
        const now = new Date();
        for (const [token, confirmation] of this.pendingApprovals.entries()) {
            if (now > confirmation.expiresAt) {
                logger.info('Removing expired confirmation', { token, operation: confirmation.operation });
                this.pendingApprovals.delete(token);
            }
        }
    }
    /**
     * Get pending approvals count (for monitoring)
     */
    getPendingApprovalsCount() {
        return this.pendingApprovals.size;
    }
}
// Singleton instance
let approvalEnforcerInstance = null;
/**
 * Get approval enforcer instance
 */
export function getApprovalEnforcer() {
    if (!approvalEnforcerInstance) {
        approvalEnforcerInstance = new ApprovalEnforcer();
    }
    return approvalEnforcerInstance;
}
/**
 * Helper to create dry-run builder
 */
export class DryRunResultBuilder {
    constructor(operation, api, accountId) {
        this.operation = operation;
        this.api = api;
        this.accountId = accountId;
        this.changes = [];
        this.risks = [];
        this.recommendations = [];
    }
    addChange(change) {
        this.changes.push(change);
        return this;
    }
    addRisk(risk) {
        this.risks.push(risk);
        return this;
    }
    addRecommendation(recommendation) {
        this.recommendations.push(recommendation);
        return this;
    }
    setFinancialImpact(impact) {
        this.estimatedImpact = impact;
        return this;
    }
    build() {
        return {
            operation: this.operation,
            api: this.api,
            accountId: this.accountId,
            changes: this.changes,
            risks: this.risks,
            recommendations: this.recommendations,
            estimatedImpact: this.estimatedImpact,
        };
    }
}
//# sourceMappingURL=approval-enforcer.js.map