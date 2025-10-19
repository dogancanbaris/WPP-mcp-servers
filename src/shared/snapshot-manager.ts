/**
 * Snapshot Manager for Rollback
 * Captures state before write operations and enables rollback
 */

import crypto from 'crypto';
import { getLogger } from './logger.js';

const logger = getLogger('shared.snapshot-manager');

/**
 * Snapshot of a resource before modification
 */
export interface Snapshot {
  snapshotId: string;
  operation: string;
  api: string;
  accountId: string;
  userId: string;
  timestamp: Date;
  resourceType: string;
  resourceId: string;
  beforeState: any;
  afterState?: any;
  executedAt?: Date;
  rolledBackAt?: Date;
  rollbackSuccessful?: boolean;
  financialImpact?: SnapshotFinancialImpact;
}

/**
 * Financial impact associated with snapshot
 */
export interface SnapshotFinancialImpact {
  estimatedDailyCost?: number;
  estimatedMonthlyCost?: number;
  actualCostDuringError?: number;
  errorPeriodStart?: Date;
  errorPeriodEnd?: Date;
  costByDay?: Array<{ date: string; cost: number }>;
}

/**
 * Snapshot manager
 */
export class SnapshotManager {
  // In production, this would be DynamoDB
  private snapshots: Map<string, Snapshot> = new Map();

  /**
   * Create snapshot before write operation
   */
  async createSnapshot(params: {
    operation: string;
    api: string;
    accountId: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    beforeState: any;
  }): Promise<string> {
    const snapshotId = this.generateSnapshotId();

    const snapshot: Snapshot = {
      snapshotId,
      operation: params.operation,
      api: params.api,
      accountId: params.accountId,
      userId: params.userId,
      timestamp: new Date(),
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      beforeState: params.beforeState,
    };

    this.snapshots.set(snapshotId, snapshot);

    logger.info('Snapshot created', {
      snapshotId,
      operation: params.operation,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
    });

    return snapshotId;
  }

  /**
   * Record execution (after state)
   */
  async recordExecution(snapshotId: string, afterState: any): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    snapshot.afterState = afterState;
    snapshot.executedAt = new Date();

    this.snapshots.set(snapshotId, snapshot);

    logger.info('Snapshot execution recorded', { snapshotId });
  }

  /**
   * Get snapshot by ID
   */
  async getSnapshot(snapshotId: string): Promise<Snapshot | null> {
    return this.snapshots.get(snapshotId) || null;
  }

  /**
   * Get snapshots for account
   */
  async getSnapshotsForAccount(
    accountId: string,
    options?: {
      limit?: number;
      startDate?: Date;
      endDate?: Date;
      operation?: string;
    }
  ): Promise<Snapshot[]> {
    let snapshots = Array.from(this.snapshots.values()).filter(
      (s) => s.accountId === accountId
    );

    // Filter by operation
    if (options?.operation) {
      snapshots = snapshots.filter((s) => s.operation === options.operation);
    }

    // Filter by date range
    if (options?.startDate) {
      snapshots = snapshots.filter((s) => s.timestamp >= options.startDate!);
    }

    if (options?.endDate) {
      snapshots = snapshots.filter((s) => s.timestamp <= options.endDate!);
    }

    // Sort by timestamp descending
    snapshots.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Limit results
    if (options?.limit) {
      snapshots = snapshots.slice(0, options.limit);
    }

    return snapshots;
  }

  /**
   * Perform rollback
   */
  async rollback(
    snapshotId: string,
    executeRollback: (beforeState: any) => Promise<any>
  ): Promise<{ success: boolean; message: string; financialImpact?: SnapshotFinancialImpact }> {
    const snapshot = this.snapshots.get(snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    if (!snapshot.executedAt) {
      throw new Error(`Snapshot ${snapshotId} was never executed, cannot roll back`);
    }

    if (snapshot.rolledBackAt) {
      throw new Error(
        `Snapshot ${snapshotId} already rolled back at ${snapshot.rolledBackAt.toISOString()}`
      );
    }

    logger.info('Starting rollback', {
      snapshotId,
      operation: snapshot.operation,
      resourceType: snapshot.resourceType,
      resourceId: snapshot.resourceId,
    });

    try {
      // Execute rollback callback
      await executeRollback(snapshot.beforeState);

      // Mark as rolled back
      snapshot.rolledBackAt = new Date();
      snapshot.rollbackSuccessful = true;

      this.snapshots.set(snapshotId, snapshot);

      logger.info('Rollback successful', { snapshotId });

      return {
        success: true,
        message: `Successfully rolled back ${snapshot.operation} on ${snapshot.resourceType} ${snapshot.resourceId}`,
        financialImpact: snapshot.financialImpact,
      };
    } catch (error) {
      snapshot.rolledBackAt = new Date();
      snapshot.rollbackSuccessful = false;

      this.snapshots.set(snapshotId, snapshot);

      logger.error('Rollback failed', { snapshotId, error: error as Error });

      throw new Error(
        `Rollback failed for ${snapshotId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Attach financial impact to snapshot
   */
  async attachFinancialImpact(
    snapshotId: string,
    financialImpact: SnapshotFinancialImpact
  ): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    snapshot.financialImpact = financialImpact;

    this.snapshots.set(snapshotId, snapshot);

    logger.info('Financial impact attached to snapshot', { snapshotId, financialImpact });
  }

  /**
   * Generate comparison report between before and after states
   */
  generateComparisonReport(snapshot: Snapshot): string {
    let report = `\n📸 SNAPSHOT: ${snapshot.operation}\n`;
    report += `Snapshot ID: ${snapshot.snapshotId}\n`;
    report += `Resource: ${snapshot.resourceType} ${snapshot.resourceId}\n`;
    report += `Account: ${snapshot.accountId}\n`;
    report += `Timestamp: ${snapshot.timestamp.toISOString()}\n\n`;

    // Before state
    report += `📋 BEFORE STATE:\n`;
    report += JSON.stringify(snapshot.beforeState, null, 2) + '\n\n';

    // After state
    if (snapshot.afterState) {
      report += `📋 AFTER STATE:\n`;
      report += JSON.stringify(snapshot.afterState, null, 2) + '\n\n';
    }

    // Financial impact
    if (snapshot.financialImpact) {
      report += `💰 FINANCIAL IMPACT:\n`;
      const impact = snapshot.financialImpact;

      if (impact.estimatedDailyCost !== undefined) {
        report += `   Estimated daily cost: $${impact.estimatedDailyCost.toFixed(2)}\n`;
      }

      if (impact.estimatedMonthlyCost !== undefined) {
        report += `   Estimated monthly cost: $${impact.estimatedMonthlyCost.toFixed(2)}\n`;
      }

      if (impact.actualCostDuringError !== undefined) {
        report += `   Actual cost during error: $${impact.actualCostDuringError.toFixed(2)}\n`;
      }

      if (impact.errorPeriodStart && impact.errorPeriodEnd) {
        report += `   Error period: ${impact.errorPeriodStart.toISOString()} to ${impact.errorPeriodEnd.toISOString()}\n`;
      }

      if (impact.costByDay && impact.costByDay.length > 0) {
        report += `   Daily breakdown:\n`;
        impact.costByDay.forEach((day) => {
          report += `      ${day.date}: $${day.cost.toFixed(2)}\n`;
        });
      }

      report += '\n';
    }

    // Rollback status
    if (snapshot.rolledBackAt) {
      report += `🔄 ROLLBACK STATUS:\n`;
      report += `   Rolled back at: ${snapshot.rolledBackAt.toISOString()}\n`;
      report += `   Success: ${snapshot.rollbackSuccessful ? '✅ Yes' : '❌ No'}\n`;
    }

    return report;
  }

  /**
   * Clean up old snapshots (called periodically)
   */
  async cleanupOldSnapshots(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let removed = 0;

    for (const [snapshotId, snapshot] of this.snapshots.entries()) {
      if (snapshot.timestamp < cutoffDate) {
        this.snapshots.delete(snapshotId);
        removed++;
      }
    }

    if (removed > 0) {
      logger.info('Cleaned up old snapshots', { removed, retentionDays });
    }

    return removed;
  }

  /**
   * Generate snapshot ID
   */
  private generateSnapshotId(): string {
    return `snap_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Get snapshot count (for monitoring)
   */
  getSnapshotCount(): number {
    return this.snapshots.size;
  }
}

// Singleton instance
let snapshotManagerInstance: SnapshotManager | null = null;

/**
 * Get snapshot manager instance
 */
export function getSnapshotManager(): SnapshotManager {
  if (!snapshotManagerInstance) {
    snapshotManagerInstance = new SnapshotManager();
  }
  return snapshotManagerInstance;
}

/**
 * Helper to create snapshot before operation
 */
export async function createSnapshotBeforeOperation(params: {
  operation: string;
  api: string;
  accountId: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  beforeState: any;
}): Promise<string> {
  const manager = getSnapshotManager();
  return await manager.createSnapshot(params);
}

/**
 * Helper to record execution after operation
 */
export async function recordSnapshotExecution(
  snapshotId: string,
  afterState: any
): Promise<void> {
  const manager = getSnapshotManager();
  await manager.recordExecution(snapshotId, afterState);
}
