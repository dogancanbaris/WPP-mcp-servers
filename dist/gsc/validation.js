/**
 * Input validation schemas for GSC MCP tools
 */
import { z } from 'zod';
/**
 * Validate GSC property format
 */
export const GSCPropertySchema = z
    .string()
    .regex(/^sc-(domain|https?|app):/, 'Invalid GSC property format. Expected format like "sc-domain:example.com" or "sc-https://example.com"');
/**
 * Validate date format (YYYY-MM-DD)
 */
const DateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD')
    .refine((date) => {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return !isNaN(d.getTime());
}, 'Invalid date values');
/**
 * Validate URL format
 */
const URLSchema = z.string().url('Invalid URL format');
/**
 * Search Analytics Query Schema
 */
export const SearchAnalyticsQuerySchema = z.object({
    property: GSCPropertySchema,
    startDate: DateSchema,
    endDate: DateSchema,
    dimensions: z
        .array(z.enum(['query', 'page', 'country', 'device', 'searchType', 'appearance']))
        .optional(),
    searchType: z.enum(['web', 'image', 'video', 'news']).optional().default('web'),
    rowLimit: z.number().int().min(1).max(25000).optional().default(1000),
});
/**
 * Properties List Schema
 */
export const PropertiesListSchema = z.object({});
/**
 * List Sitemaps Schema
 */
export const ListSitemapsSchema = z.object({
    property: GSCPropertySchema,
});
/**
 * Get Sitemap Schema
 */
export const GetSitemapSchema = z.object({
    property: GSCPropertySchema,
    sitemapUrl: z.string().url('Invalid sitemap URL'),
});
/**
 * Submit Sitemap Schema
 */
export const SubmitSitemapSchema = z.object({
    property: GSCPropertySchema,
    sitemapUrl: z.string().url('Invalid sitemap URL'),
});
/**
 * Delete Sitemap Schema
 */
export const DeleteSitemapSchema = z.object({
    property: GSCPropertySchema,
    sitemapUrl: z.string().url('Invalid sitemap URL'),
});
/**
 * Inspect URL Schema
 */
export const InspectURLSchema = z.object({
    property: GSCPropertySchema,
    url: URLSchema,
});
/**
 * Add Property Schema
 */
export const AddPropertySchema = z.object({
    siteUrl: URLSchema,
    propertyType: z.enum(['SITE', 'PREFIX']).optional().default('SITE'),
});
/**
 * Delete Property Schema
 */
export const DeletePropertySchema = z.object({
    property: GSCPropertySchema,
});
/**
 * Validate input against schema
 */
export function validateInput(schema, input) {
    try {
        return schema.parse(input);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
            throw new Error(`Validation error: ${messages}`);
        }
        throw error;
    }
}
/**
 * Validate GSC property format helper
 */
export function validateGSCProperty(property) {
    try {
        GSCPropertySchema.parse(property);
    }
    catch (error) {
        throw new Error(`Invalid GSC property format: ${error.message}`);
    }
}
//# sourceMappingURL=validation.js.map