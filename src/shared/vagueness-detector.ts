/**
 * Vagueness Detector
 * Detects vague requests and forces clarification before execution
 */

import { getLogger } from './logger.js';

const logger = getLogger('shared.vagueness-detector');

/**
 * Vagueness detection result
 */
export interface VaguenessDetectionResult {
  isVague: boolean;
  vaguenessScore: number; // 0-100, higher = more vague
  vagueTerms: string[];
  requiredClarifications: string[];
  suggestions: string[];
}

/**
 * Vague term patterns
 */
const VAGUE_PATTERNS = {
  // Quantifiers without specifics
  quantifiers: [
    /\ball\b/i,
    /\bevery\b/i,
    /\beach\b/i,
    /\bmost\b/i,
    /\bsome\b/i,
    /\bfew\b/i,
    /\bmany\b/i,
    /\bseveral\b/i,
    /\ba (bunch|lot|few) of\b/i,
  ],

  // Relative terms without context
  relativeTerms: [
    /\bhigh(er)?\b/i,
    /\blow(er)?\b/i,
    /\bbig(ger)?\b/i,
    /\bsmall(er)?\b/i,
    /\bmore\b/i,
    /\bless\b/i,
    /\brecent(ly)?\b/i,
    /\bold(er)?\b/i,
  ],

  // Indefinite references
  indefiniteReferences: [
    /\bit\b/i,
    /\bthey\b/i,
    /\bthem\b/i,
    /\bthose\b/i,
    /\bthese\b/i,
    /\bstuff\b/i,
    /\bthings\b/i,
  ],

  // Action without target
  vagueActions: [
    /^(update|change|modify|adjust|fix)\s*$/i,
    /^(increase|decrease|reduce|raise)\s*$/i,
    /^(pause|enable|disable|turn on|turn off)\s*$/i,
  ],
};

// Keywords that should have specific values (for future enhancement)
// const REQUIRES_SPECIFICS = {
//   budget: ['budget', 'spend', 'cost', 'amount'],
//   campaign: ['campaign', 'ad group', 'keyword'],
//   account: ['account', 'customer'],
//   percentage: ['increase', 'decrease', 'change', 'adjust'],
//   timeframe: ['recent', 'old', 'new', 'last', 'past'],
// };

/**
 * Vagueness detector
 */
export class VaguenessDetector {
  /**
   * Detect vagueness in operation request
   */
  detect(params: {
    operation: string;
    inputText: string;
    inputParams: Record<string, any>;
  }): VaguenessDetectionResult {
    logger.info('Detecting vagueness', { operation: params.operation });

    const vagueTerms: string[] = [];
    const requiredClarifications: string[] = [];
    const suggestions: string[] = [];

    let vaguenessScore = 0;

    // Check for vague patterns in input text
    const text = params.inputText.toLowerCase();

    // Check quantifiers without specifics
    for (const pattern of VAGUE_PATTERNS.quantifiers) {
      if (pattern.test(text)) {
        const match = text.match(pattern);
        if (match) {
          vagueTerms.push(match[0]);
          vaguenessScore += 15;
          requiredClarifications.push(
            `Specify exactly which items you want to ${params.operation}`
          );
        }
      }
    }

    // Check relative terms without numbers
    for (const pattern of VAGUE_PATTERNS.relativeTerms) {
      if (pattern.test(text)) {
        const match = text.match(pattern);
        if (match) {
          // Check if there's a number nearby
          const hasNumber = /\d+/.test(text);
          if (!hasNumber) {
            vagueTerms.push(match[0]);
            vaguenessScore += 20;
            requiredClarifications.push(`Specify exact values instead of relative terms like "${match[0]}"`);
          }
        }
      }
    }

    // Check indefinite references
    for (const pattern of VAGUE_PATTERNS.indefiniteReferences) {
      if (pattern.test(text)) {
        const match = text.match(pattern);
        if (match) {
          vagueTerms.push(match[0]);
          vaguenessScore += 25;
          requiredClarifications.push(`Specify what "${match[0]}" refers to (campaign ID, account ID, etc.)`);
        }
      }
    }

    // Check if input params are missing specifics
    this.checkMissingSpecifics(params, requiredClarifications, suggestions);

    // Adjust vagueness score based on required clarifications
    if (requiredClarifications.length > 0) {
      vaguenessScore = Math.min(100, vaguenessScore + requiredClarifications.length * 10);
    }

    const isVague = vaguenessScore >= 30; // Threshold for blocking

    if (isVague) {
      logger.warn('Vague request detected', {
        operation: params.operation,
        vaguenessScore,
        vagueTerms,
        requiredClarifications,
      });
    }

    return {
      isVague,
      vaguenessScore,
      vagueTerms,
      requiredClarifications,
      suggestions,
    };
  }

  /**
   * Check for missing specific values in params
   */
  private checkMissingSpecifics(
    params: { operation: string; inputParams: Record<string, any> },
    requiredClarifications: string[],
    suggestions: string[]
  ): void {
    const inputParams = params.inputParams;

    // Budget operations should have exact amounts
    if (
      params.operation.includes('budget') ||
      params.operation.includes('bid')
    ) {
      if (!inputParams.dailyAmountDollars && !inputParams.newDailyAmountDollars && !inputParams.amount) {
        requiredClarifications.push('Specify the exact budget amount in dollars');
        suggestions.push('Example: "Set budget to $100/day"');
      }
    }

    // Campaign operations should have campaign IDs
    if (params.operation.includes('campaign')) {
      if (!inputParams.campaignId && !inputParams.campaignIds) {
        requiredClarifications.push('Specify the campaign ID or list of campaign IDs');
        suggestions.push('Use list_campaigns first to get campaign IDs');
      }
    }

    // Account operations should have customer ID
    if (!inputParams.customerId && !inputParams.accountId && !inputParams.property) {
      requiredClarifications.push('Specify which account/customer/property to operate on');
      suggestions.push('Provide customerId, accountId, or property parameter');
    }

    // Status changes should specify the target status
    if (params.operation.includes('status') || params.operation.includes('pause') || params.operation.includes('enable')) {
      if (!inputParams.status) {
        requiredClarifications.push('Specify the target status (ENABLED, PAUSED, or REMOVED)');
      }
    }
  }

  /**
   * Format vagueness detection result for display
   */
  formatDetectionResult(result: VaguenessDetectionResult): string {
    if (!result.isVague) {
      return '';
    }

    let output = '\n⚠️  VAGUE REQUEST DETECTED\n\n';
    output += `Vagueness Score: ${result.vaguenessScore}/100 (30+ blocks execution)\n\n`;

    if (result.vagueTerms.length > 0) {
      output += `🔍 Vague terms found: ${result.vagueTerms.join(', ')}\n\n`;
    }

    if (result.requiredClarifications.length > 0) {
      output += `❗ Required clarifications:\n`;
      result.requiredClarifications.forEach((clarification, i) => {
        output += `   ${i + 1}. ${clarification}\n`;
      });
      output += '\n';
    }

    if (result.suggestions.length > 0) {
      output += `💡 Suggestions:\n`;
      result.suggestions.forEach((suggestion) => {
        output += `   • ${suggestion}\n`;
      });
      output += '\n';
    }

    output += `🚫 This operation is blocked until you provide specific details.\n`;
    output += `Please rephrase your request with exact values and identifiers.\n`;

    return output;
  }

  /**
   * Enforce vagueness check (throws if vague)
   */
  enforce(params: {
    operation: string;
    inputText: string;
    inputParams: Record<string, any>;
  }): void {
    const result = this.detect(params);

    if (result.isVague) {
      const errorMessage = this.formatDetectionResult(result);
      throw new VagueRequestError(errorMessage);
    }
  }
}

/**
 * Vague request error
 */
export class VagueRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VagueRequestError';
  }
}

// Singleton instance
let vaguenessDetectorInstance: VaguenessDetector | null = null;

/**
 * Get vagueness detector instance
 */
export function getVaguenessDetector(): VaguenessDetector {
  if (!vaguenessDetectorInstance) {
    vaguenessDetectorInstance = new VaguenessDetector();
  }
  return vaguenessDetectorInstance;
}

/**
 * Helper to detect and enforce vagueness check
 */
export function detectAndEnforceVagueness(params: {
  operation: string;
  inputText: string;
  inputParams: Record<string, any>;
}): void {
  const detector = getVaguenessDetector();
  detector.enforce(params);
}
