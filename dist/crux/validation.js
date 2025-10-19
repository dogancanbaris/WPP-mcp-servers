/**
 * Validation schemas for CrUX API inputs
 */
import { z } from 'zod';
/**
 * Form factor schema
 */
export const FormFactorSchema = z.enum(['PHONE', 'TABLET', 'DESKTOP', 'ALL']).optional();
/**
 * Metric name schema
 */
export const MetricNameSchema = z.enum([
    'largest_contentful_paint',
    'interaction_to_next_paint',
    'cumulative_layout_shift',
    'first_contentful_paint',
    'experimental_time_to_first_byte',
]);
/**
 * URL validation schema
 */
export const UrlSchema = z.string().url();
/**
 * Origin validation schema (must include protocol)
 */
export const OriginSchema = z.string().refine((val) => {
    try {
        const url = new URL(val);
        return url.origin === val;
    }
    catch {
        return false;
    }
}, 'Must be a valid origin (e.g., https://example.com)');
/**
 * Query by origin schema
 */
export const QueryByOriginSchema = z.object({
    origin: OriginSchema,
    formFactor: FormFactorSchema,
});
/**
 * Query by URL schema
 */
export const QueryByUrlSchema = z.object({
    url: UrlSchema,
    formFactor: FormFactorSchema,
});
/**
 * Combined query schema
 */
export const CruxQuerySchema = z.union([QueryByOriginSchema, QueryByUrlSchema]);
/**
 * Validate and parse CrUX query input
 */
export function validateCruxQuery(input) {
    return CruxQuerySchema.parse(input);
}
/**
 * Check if input has origin
 */
export function hasOrigin(input) {
    return typeof input === 'object' && input !== null && 'origin' in input;
}
/**
 * Check if input has URL
 */
export function hasUrl(input) {
    return typeof input === 'object' && input !== null && 'url' in input;
}
//# sourceMappingURL=validation.js.map