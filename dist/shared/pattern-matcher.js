/**
 * Pattern Matcher for Bulk Operations
 * Enables pattern-based selection with full list confirmation
 */
import { getLogger } from './logger.js';
const logger = getLogger('shared.pattern-matcher');
/**
 * Pattern matcher for bulk operations
 */
export class PatternMatcher {
    constructor() {
        this.MAX_BULK_ITEMS = 20; // User requirement: max 20 items
    }
    /**
     * Match items by pattern
     */
    match(params) {
        logger.info('Matching pattern', { pattern: params.pattern, totalItems: params.items.length });
        // Match items
        const matchedItems = params.items.filter((item) => params.matchFn(item, params.pattern));
        const totalMatched = matchedItems.length;
        const requiresConfirmation = totalMatched > 0;
        // Build confirmation message
        let confirmationMessage = `\n🔍 PATTERN MATCH RESULT\n\n`;
        confirmationMessage += `Pattern: "${params.pattern}"\n`;
        confirmationMessage += `Matched: ${totalMatched} item(s)\n\n`;
        // Check if exceeds max
        if (totalMatched > this.MAX_BULK_ITEMS) {
            confirmationMessage += `❌ TOO MANY MATCHES\n\n`;
            confirmationMessage += `This pattern matches ${totalMatched} items, which exceeds the maximum of ${this.MAX_BULK_ITEMS}.\n`;
            confirmationMessage += `Please refine your pattern to match fewer items.\n\n`;
            confirmationMessage += `💡 Suggestions:\n`;
            confirmationMessage += `   • Use more specific pattern\n`;
            confirmationMessage += `   • Add additional filters\n`;
            confirmationMessage += `   • Process items in smaller batches\n`;
            throw new TooManyMatchesError(confirmationMessage);
        }
        // List all matched items (requirement: show full list)
        if (totalMatched > 0) {
            confirmationMessage += `📋 MATCHED ITEMS:\n`;
            matchedItems.forEach((item, i) => {
                confirmationMessage += `   ${i + 1}. ${params.formatFn(item)}\n`;
            });
            confirmationMessage += '\n';
            confirmationMessage += `⚠️  This operation will affect ALL ${totalMatched} items listed above.\n`;
            confirmationMessage += `Please review the list carefully before confirming.\n`;
        }
        else {
            confirmationMessage += `ℹ️  No items matched this pattern.\n`;
        }
        logger.info('Pattern match complete', { totalMatched });
        return {
            pattern: params.pattern,
            matchedItems,
            totalMatched,
            requiresConfirmation,
            confirmationMessage,
        };
    }
    /**
     * Match campaigns by pattern
     */
    matchCampaigns(params) {
        return this.match({
            pattern: params.pattern,
            items: params.campaigns,
            matchFn: (campaign, pattern) => {
                const regex = new RegExp(pattern, 'i');
                return regex.test(campaign.name) || campaign.id === pattern;
            },
            formatFn: (campaign) => `${campaign.name} (ID: ${campaign.id}, Status: ${campaign.status})`,
        });
    }
    /**
     * Match keywords by pattern
     */
    matchKeywords(params) {
        return this.match({
            pattern: params.pattern,
            items: params.keywords,
            matchFn: (keyword, pattern) => {
                const regex = new RegExp(pattern, 'i');
                return regex.test(keyword.text);
            },
            formatFn: (keyword) => `"${keyword.text}" [${keyword.matchType}] (${keyword.status})`,
        });
    }
    /**
     * Create bulk operation with confirmation requirement
     */
    createBulkOperation(params) {
        const totalItems = params.matchedItems.length;
        if (totalItems === 0) {
            throw new Error('No items to operate on');
        }
        if (totalItems > this.MAX_BULK_ITEMS) {
            throw new TooManyMatchesError(`Cannot perform bulk operation on ${totalItems} items (max: ${this.MAX_BULK_ITEMS}). Please refine your pattern.`);
        }
        let message = `\n⚠️  BULK OPERATION CONFIRMATION REQUIRED\n\n`;
        message += `Operation: ${params.operation}\n`;
        message += `Pattern: "${params.pattern}"\n`;
        message += `Items to affect: ${totalItems}\n\n`;
        message += `📋 ITEMS THAT WILL BE AFFECTED:\n`;
        params.matchedItems.forEach((item, i) => {
            message += `   ${i + 1}. ${params.formatFn(item)}\n`;
        });
        message += '\n';
        message += `⚠️  This will apply "${params.operation}" to ALL ${totalItems} items above.\n`;
        message += `⚠️  This action cannot be easily undone.\n\n`;
        message += `To proceed:\n`;
        message += `   1. Review the list above carefully\n`;
        message += `   2. Confirm you want to proceed with this bulk operation\n`;
        message += `   3. Call the tool again with explicit confirmation\n`;
        return {
            requiresConfirmation: true,
            confirmationMessage: message,
            itemsToConfirm: params.matchedItems,
        };
    }
    /**
     * Get max bulk items allowed
     */
    getMaxBulkItems() {
        return this.MAX_BULK_ITEMS;
    }
}
/**
 * Too many matches error
 */
export class TooManyMatchesError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TooManyMatchesError';
    }
}
// Singleton instance
let patternMatcherInstance = null;
/**
 * Get pattern matcher instance
 */
export function getPatternMatcher() {
    if (!patternMatcherInstance) {
        patternMatcherInstance = new PatternMatcher();
    }
    return patternMatcherInstance;
}
/**
 * Helper to match campaigns by pattern
 */
export function matchCampaignsByPattern(params) {
    const matcher = getPatternMatcher();
    return matcher.matchCampaigns(params);
}
/**
 * Helper to match keywords by pattern
 */
export function matchKeywordsByPattern(params) {
    const matcher = getPatternMatcher();
    return matcher.matchKeywords(params);
}
//# sourceMappingURL=pattern-matcher.js.map