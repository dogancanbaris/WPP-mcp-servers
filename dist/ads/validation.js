/**
 * Validation schemas for Google Ads API inputs
 */
import { z } from 'zod';
/**
 * Customer ID schema (10 digits, no hyphens)
 */
export const CustomerIdSchema = z.string().regex(/^\d{10}$/, 'Customer ID must be 10 digits');
/**
 * Campaign ID schema
 */
export const CampaignIdSchema = z.string().regex(/^\d+$/, 'Campaign ID must be numeric');
/**
 * Date schema (YYYY-MM-DD)
 */
export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
/**
 * Date range schema
 */
export const DateRangeSchema = z.object({
    startDate: DateSchema,
    endDate: DateSchema,
});
/**
 * Budget amount in micros (must be positive)
 */
export const BudgetMicrosSchema = z.number().int().positive();
/**
 * Keyword match type schema
 */
export const MatchTypeSchema = z.enum(['EXACT', 'PHRASE', 'BROAD']);
/**
 * Campaign status schema
 */
export const CampaignStatusSchema = z.enum(['ENABLED', 'PAUSED', 'REMOVED']);
/**
 * List campaigns input
 */
export const ListCampaignsSchema = z.object({
    customerId: CustomerIdSchema,
});
/**
 * Get campaign performance input
 */
export const GetCampaignPerformanceSchema = z.object({
    customerId: CustomerIdSchema,
    campaignId: CampaignIdSchema.optional(),
    dateRange: DateRangeSchema.optional(),
});
/**
 * Get search terms report input
 */
export const GetSearchTermsSchema = z.object({
    customerId: CustomerIdSchema,
    campaignId: CampaignIdSchema.optional(),
    dateRange: DateRangeSchema.optional(),
});
/**
 * Get keyword performance input
 */
export const GetKeywordPerformanceSchema = z.object({
    customerId: CustomerIdSchema,
    campaignId: CampaignIdSchema.optional(),
    dateRange: DateRangeSchema.optional(),
});
/**
 * Update campaign status input
 */
export const UpdateCampaignStatusSchema = z.object({
    customerId: CustomerIdSchema,
    campaignId: CampaignIdSchema,
    status: CampaignStatusSchema,
});
/**
 * Update budget input
 */
export const UpdateBudgetSchema = z.object({
    customerId: CustomerIdSchema,
    budgetId: z.string(),
    amountMicros: BudgetMicrosSchema,
});
/**
 * Helper to validate customer ID format
 */
export function validateCustomerId(customerId) {
    CustomerIdSchema.parse(customerId);
}
/**
 * Helper to convert customer ID from resource name
 */
export function extractCustomerId(resourceName) {
    // Resource name format: customers/1234567890
    const match = resourceName.match(/customers\/(\d+)/);
    if (!match) {
        throw new Error(`Invalid customer resource name: ${resourceName}`);
    }
    return match[1];
}
/**
 * Helper to convert micros to dollars
 */
export function microsToAmount(micros, currency = 'USD') {
    const amount = micros / 1000000;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}
/**
 * Helper to convert dollars to micros
 */
export function amountToMicros(amount) {
    return Math.round(amount * 1000000);
}
//# sourceMappingURL=validation.js.map