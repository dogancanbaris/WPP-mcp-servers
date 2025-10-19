/**
 * Pattern Matcher for Bulk Operations
 * Enables pattern-based selection with full list confirmation
 */
/**
 * Pattern match result
 */
export interface PatternMatchResult<T> {
    pattern: string;
    matchedItems: T[];
    totalMatched: number;
    requiresConfirmation: boolean;
    confirmationMessage: string;
}
/**
 * Bulk operation confirmation
 */
export interface BulkOperationConfirmation {
    pattern: string;
    operation: string;
    matchedItems: any[];
    confirmed: boolean;
    confirmedAt?: Date;
    executedAt?: Date;
}
/**
 * Pattern matcher for bulk operations
 */
export declare class PatternMatcher {
    private readonly MAX_BULK_ITEMS;
    /**
     * Match items by pattern
     */
    match<T>(params: {
        pattern: string;
        items: T[];
        matchFn: (item: T, pattern: string) => boolean;
        formatFn: (item: T) => string;
    }): PatternMatchResult<T>;
    /**
     * Match campaigns by pattern
     */
    matchCampaigns(params: {
        pattern: string;
        campaigns: Array<{
            id: string;
            name: string;
            status: string;
        }>;
    }): PatternMatchResult<{
        id: string;
        name: string;
        status: string;
    }>;
    /**
     * Match keywords by pattern
     */
    matchKeywords(params: {
        pattern: string;
        keywords: Array<{
            text: string;
            matchType: string;
            status: string;
        }>;
    }): PatternMatchResult<{
        text: string;
        matchType: string;
        status: string;
    }>;
    /**
     * Create bulk operation with confirmation requirement
     */
    createBulkOperation<T>(params: {
        operation: string;
        pattern: string;
        matchedItems: T[];
        formatFn: (item: T) => string;
    }): {
        requiresConfirmation: true;
        confirmationMessage: string;
        itemsToConfirm: T[];
    };
    /**
     * Get max bulk items allowed
     */
    getMaxBulkItems(): number;
}
/**
 * Too many matches error
 */
export declare class TooManyMatchesError extends Error {
    constructor(message: string);
}
/**
 * Get pattern matcher instance
 */
export declare function getPatternMatcher(): PatternMatcher;
/**
 * Helper to match campaigns by pattern
 */
export declare function matchCampaignsByPattern(params: {
    pattern: string;
    campaigns: Array<{
        id: string;
        name: string;
        status: string;
    }>;
}): PatternMatchResult<{
    id: string;
    name: string;
    status: string;
}>;
/**
 * Helper to match keywords by pattern
 */
export declare function matchKeywordsByPattern(params: {
    pattern: string;
    keywords: Array<{
        text: string;
        matchType: string;
        status: string;
    }>;
}): PatternMatchResult<{
    text: string;
    matchType: string;
    status: string;
}>;
//# sourceMappingURL=pattern-matcher.d.ts.map