/**
 * Approval and dry-run system for write operations
 */
import { generateId } from '../shared/utils.js';
import { getLogger } from '../shared/logger.js';
const logger = getLogger('gsc.approval');
/**
 * Dry-run result builder
 */
export class DryRunResultBuilder {
    constructor() {
        this.result = {
            wouldSucceed: true,
            expectedResult: null,
            changes: [],
            warnings: [],
            riskLevel: 'low',
        };
    }
    /**
     * Set whether operation would succeed
     */
    wouldSucceed(success) {
        this.result.wouldSucceed = success;
        return this;
    }
    /**
     * Set expected result
     */
    expectedResult(result) {
        this.result.expectedResult = result;
        return this;
    }
    /**
     * Add a change description
     */
    addChange(change) {
        this.result.changes.push(change);
        return this;
    }
    /**
     * Add multiple changes
     */
    addChanges(changes) {
        this.result.changes.push(...changes);
        return this;
    }
    /**
     * Add a warning
     */
    addWarning(warning) {
        this.result.warnings.push(warning);
        return this;
    }
    /**
     * Add multiple warnings
     */
    addWarnings(warnings) {
        this.result.warnings.push(...warnings);
        return this;
    }
    /**
     * Set risk level
     */
    riskLevel(level) {
        this.result.riskLevel = level;
        return this;
    }
    /**
     * Set estimated impact
     */
    estimatedImpact(impact) {
        this.result.estimatedImpact = impact;
        return this;
    }
    /**
     * Build the result
     */
    build() {
        return { ...this.result };
    }
}
/**
 * Approval request manager
 */
export class ApprovalManager {
    constructor(timeoutMs = 10 * 60 * 1000) {
        this.approvals = new Map();
        // 10 minutes default
        this.timeoutMs = timeoutMs;
    }
    /**
     * Create approval request
     */
    createRequest(operation, property, dryRunResult, requestedBy) {
        const id = generateId('approval');
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.timeoutMs);
        const request = {
            id,
            operation,
            property,
            dryRunResult,
            requestedBy,
            timestamp: now,
            expiresAt,
            status: 'pending',
        };
        this.approvals.set(id, request);
        logger.info('Approval request created', {
            id,
            operation,
            property,
            requestedBy,
            expiresAt: expiresAt.toISOString(),
        });
        return id;
    }
    /**
     * Get approval request
     */
    getRequest(id) {
        const request = this.approvals.get(id);
        if (request && request.status === 'pending') {
            // Check if expired
            if (request.expiresAt && request.expiresAt < new Date()) {
                logger.warn('Approval request expired', { id });
                request.status = 'rejected';
                return null;
            }
        }
        return request || null;
    }
    /**
     * Approve request
     */
    approveRequest(id, approvedBy) {
        const request = this.getRequest(id);
        if (!request) {
            throw new Error(`Approval request not found: ${id}`);
        }
        if (request.status !== 'pending') {
            throw new Error(`Approval request is not pending: ${id}`);
        }
        request.status = 'approved';
        request.approvedBy = approvedBy;
        request.approvedAt = new Date();
        logger.info('Approval request approved', {
            id,
            operation: request.operation,
            approvedBy,
        });
        return request;
    }
    /**
     * Reject request
     */
    rejectRequest(id, rejectedBy) {
        const request = this.getRequest(id);
        if (!request) {
            throw new Error(`Approval request not found: ${id}`);
        }
        if (request.status !== 'pending') {
            throw new Error(`Approval request is not pending: ${id}`);
        }
        request.status = 'rejected';
        request.approvedBy = rejectedBy;
        request.approvedAt = new Date();
        logger.info('Approval request rejected', {
            id,
            operation: request.operation,
            rejectedBy,
        });
        return request;
    }
    /**
     * Check if request is approved
     */
    isApproved(id) {
        const request = this.getRequest(id);
        return request?.status === 'approved';
    }
    /**
     * Clean up expired requests
     */
    cleanup() {
        const now = new Date();
        const toDelete = [];
        for (const [id, request] of this.approvals.entries()) {
            if (request.expiresAt && request.expiresAt < now) {
                toDelete.push(id);
            }
        }
        toDelete.forEach((id) => this.approvals.delete(id));
        if (toDelete.length > 0) {
            logger.debug('Cleaned up expired approval requests', { count: toDelete.length });
        }
    }
    /**
     * Clear all requests (for testing)
     */
    clear() {
        this.approvals.clear();
    }
}
/**
 * Singleton approval manager
 */
let instance = null;
/**
 * Get approval manager
 */
export function getApprovalManager() {
    if (!instance) {
        instance = new ApprovalManager();
    }
    return instance;
}
/**
 * Reset approval manager (for testing)
 */
export function resetApprovalManager() {
    instance = null;
}
/**
 * Format dry-run result for display
 */
export function formatDryRunResult(result) {
    let message = '═══════════════════════════════════════\n';
    message += '         DRY-RUN PREVIEW\n';
    message += '═══════════════════════════════════════\n\n';
    message += `Status: ${result.wouldSucceed ? '✓ Would Succeed' : '✗ Would Fail'}\n`;
    message += `Risk Level: ${result.riskLevel.toUpperCase()}\n\n`;
    if (result.changes.length > 0) {
        message += 'Changes that would be made:\n';
        result.changes.forEach((change, i) => {
            message += `  ${i + 1}. ${change}\n`;
        });
        message += '\n';
    }
    if (result.warnings.length > 0) {
        message += '⚠ Warnings:\n';
        result.warnings.forEach((warning, i) => {
            message += `  ${i + 1}. ${warning}\n`;
        });
        message += '\n';
    }
    if (result.estimatedImpact) {
        message += `Estimated Impact: ${result.estimatedImpact}\n\n`;
    }
    if (result.expectedResult) {
        message += `Expected Result:\n${JSON.stringify(result.expectedResult, null, 2)}\n\n`;
    }
    message += '═══════════════════════════════════════\n';
    message += 'Please review and confirm to proceed.\n';
    return message;
}
//# sourceMappingURL=approval.js.map