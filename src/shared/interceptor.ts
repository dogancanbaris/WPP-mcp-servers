/**
 * Interceptor Middleware for Write Operations
 *
 * Intercepts all write tool calls to enforce:
 * - Mandatory approval workflow
 * - Preview before execution
 * - Safety validations
 * - Audit logging
 */

import { readJsonFile } from './utils.js';
import { getLogger } from './logger.js';
import * as path from 'path';

const logger = getLogger('shared.interceptor');

/**
 * Safety limits configuration
 */
interface SafetyLimits {
  budgetLimits: {
    maxIncreasePercent: number;
    maxDecreasePercent: number;
    warningThreshold: number;
    gradualRecommendation: number;
  };
  bulkOperationLimits: {
    maxKeywordsPerCall: number;
    maxCampaignsPerPatternMatch: number;
  };
}

/**
 * Prohibited operations configuration
 */
interface ProhibitedOps {
  prohibitedOperations: Array<{
    operation: string;
    errorMessage: string;
  }>;
}

let safetyLimits: SafetyLimits | null = null;
let prohibitedOps: ProhibitedOps | null = null;

/**
 * Load safety configuration
 */
async function loadSafetyConfig(): Promise<void> {
  if (!safetyLimits) {
    const configPath = path.join(process.cwd(), 'config', 'safety-limits.json');
    safetyLimits = await readJsonFile<SafetyLimits>(configPath);
  }

  if (!prohibitedOps) {
    const opsPath = path.join(process.cwd(), 'config', 'prohibited-operations.json');
    prohibitedOps = await readJsonFile<ProhibitedOps>(opsPath);
  }
}

/**
 * Check if operation is prohibited
 */
export async function isOperationProhibited(operationName: string): Promise<boolean> {
  await loadSafetyConfig();

  const prohibited = prohibitedOps?.prohibitedOperations.find(
    (op) => op.operation === operationName
  );

  if (prohibited) {
    logger.warn('Prohibited operation attempted', { operation: operationName });
    throw new Error(prohibited.errorMessage);
  }

  return false;
}

/**
 * Validate budget change against safety limits
 */
export async function validateBudgetChange(
  currentAmountMicros: number,
  newAmountMicros: number
): Promise<{ allowed: boolean; warnings: string[]; percentChange: number }> {
  await loadSafetyConfig();

  const currentAmount = currentAmountMicros / 1000000;
  const newAmount = newAmountMicros / 1000000;
  const difference = newAmount - currentAmount;
  const percentChange = (difference / currentAmount) * 100;

  const warnings: string[] = [];

  // Check against max percent change
  if (Math.abs(percentChange) > safetyLimits!.budgetLimits.maxIncreasePercent) {
    logger.error('Budget change exceeds maximum allowed', { percentChange });
    throw new Error(
      `Budget change of ${percentChange.toFixed(0)}% exceeds maximum allowed (${safetyLimits!.budgetLimits.maxIncreasePercent}%). ` +
        `This change must be made directly in Google Ads UI for safety. ` +
        `Current: $${currentAmount}/day, Proposed: $${newAmount}/day`
    );
  }

  // Warning threshold
  if (Math.abs(percentChange) > safetyLimits!.budgetLimits.warningThreshold) {
    warnings.push(
      `⚠️ Large budget change (${percentChange.toFixed(0)}%). Consider making this in multiple smaller steps.`
    );
  }

  // Gradual recommendation
  if (Math.abs(percentChange) > safetyLimits!.budgetLimits.gradualRecommendation) {
    warnings.push(
      `💡 For changes >${safetyLimits!.budgetLimits.gradualRecommendation}%, Google recommends gradual increases to allow algorithm optimization.`
    );
  }

  return {
    allowed: true,
    warnings,
    percentChange,
  };
}

/**
 * Validate bulk operation limits
 */
export async function validateBulkOperation(
  operationType: string,
  itemCount: number
): Promise<{ allowed: boolean; limit: number }> {
  await loadSafetyConfig();

  let limit = 0;

  switch (operationType) {
    case 'add_keywords':
      limit = safetyLimits!.bulkOperationLimits.maxKeywordsPerCall;
      break;
    case 'update_campaign_status_bulk':
      limit = safetyLimits!.bulkOperationLimits.maxCampaignsPerPatternMatch;
      break;
    default:
      return { allowed: true, limit: 0 };
  }

  if (itemCount > limit) {
    throw new Error(
      `Bulk operation limit exceeded. You're trying to process ${itemCount} items, but the maximum is ${limit} per operation. ` +
        `Please split this into multiple smaller operations or reduce the scope.`
    );
  }

  return { allowed: true, limit };
}

/**
 * Get safety limits for reference
 */
export async function getSafetyLimits(): Promise<SafetyLimits> {
  await loadSafetyConfig();
  return safetyLimits!;
}
