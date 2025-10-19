/**
 * Validation schemas for Google Ads API inputs
 */
import { z } from 'zod';
/**
 * Customer ID schema (10 digits, no hyphens)
 */
export declare const CustomerIdSchema: z.ZodString;
/**
 * Campaign ID schema
 */
export declare const CampaignIdSchema: z.ZodString;
/**
 * Date schema (YYYY-MM-DD)
 */
export declare const DateSchema: z.ZodString;
/**
 * Date range schema
 */
export declare const DateRangeSchema: z.ZodObject<{
    startDate: z.ZodString;
    endDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
}, {
    startDate: string;
    endDate: string;
}>;
/**
 * Budget amount in micros (must be positive)
 */
export declare const BudgetMicrosSchema: z.ZodNumber;
/**
 * Keyword match type schema
 */
export declare const MatchTypeSchema: z.ZodEnum<["EXACT", "PHRASE", "BROAD"]>;
/**
 * Campaign status schema
 */
export declare const CampaignStatusSchema: z.ZodEnum<["ENABLED", "PAUSED", "REMOVED"]>;
/**
 * List campaigns input
 */
export declare const ListCampaignsSchema: z.ZodObject<{
    customerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    customerId: string;
}, {
    customerId: string;
}>;
/**
 * Get campaign performance input
 */
export declare const GetCampaignPerformanceSchema: z.ZodObject<{
    customerId: z.ZodString;
    campaignId: z.ZodOptional<z.ZodString>;
    dateRange: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    campaignId?: string | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}, {
    customerId: string;
    campaignId?: string | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}>;
/**
 * Get search terms report input
 */
export declare const GetSearchTermsSchema: z.ZodObject<{
    customerId: z.ZodString;
    campaignId: z.ZodOptional<z.ZodString>;
    dateRange: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    campaignId?: string | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}, {
    customerId: string;
    campaignId?: string | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}>;
/**
 * Get keyword performance input
 */
export declare const GetKeywordPerformanceSchema: z.ZodObject<{
    customerId: z.ZodString;
    campaignId: z.ZodOptional<z.ZodString>;
    dateRange: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    campaignId?: string | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}, {
    customerId: string;
    campaignId?: string | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}>;
/**
 * Update campaign status input
 */
export declare const UpdateCampaignStatusSchema: z.ZodObject<{
    customerId: z.ZodString;
    campaignId: z.ZodString;
    status: z.ZodEnum<["ENABLED", "PAUSED", "REMOVED"]>;
}, "strip", z.ZodTypeAny, {
    status: "ENABLED" | "PAUSED" | "REMOVED";
    customerId: string;
    campaignId: string;
}, {
    status: "ENABLED" | "PAUSED" | "REMOVED";
    customerId: string;
    campaignId: string;
}>;
/**
 * Update budget input
 */
export declare const UpdateBudgetSchema: z.ZodObject<{
    customerId: z.ZodString;
    budgetId: z.ZodString;
    amountMicros: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    budgetId: string;
    amountMicros: number;
}, {
    customerId: string;
    budgetId: string;
    amountMicros: number;
}>;
/**
 * Helper to validate customer ID format
 */
export declare function validateCustomerId(customerId: string): void;
/**
 * Helper to convert customer ID from resource name
 */
export declare function extractCustomerId(resourceName: string): string;
/**
 * Helper to convert micros to dollars
 */
export declare function microsToAmount(micros: number, currency?: string): string;
/**
 * Helper to convert dollars to micros
 */
export declare function amountToMicros(amount: number): number;
//# sourceMappingURL=validation.d.ts.map