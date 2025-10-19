/**
 * Validation schemas for CrUX API inputs
 */
import { z } from 'zod';
/**
 * Form factor schema
 */
export declare const FormFactorSchema: z.ZodOptional<z.ZodEnum<["PHONE", "TABLET", "DESKTOP", "ALL"]>>;
/**
 * Metric name schema
 */
export declare const MetricNameSchema: z.ZodEnum<["largest_contentful_paint", "interaction_to_next_paint", "cumulative_layout_shift", "first_contentful_paint", "experimental_time_to_first_byte"]>;
/**
 * URL validation schema
 */
export declare const UrlSchema: z.ZodString;
/**
 * Origin validation schema (must include protocol)
 */
export declare const OriginSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Query by origin schema
 */
export declare const QueryByOriginSchema: z.ZodObject<{
    origin: z.ZodEffects<z.ZodString, string, string>;
    formFactor: z.ZodOptional<z.ZodEnum<["PHONE", "TABLET", "DESKTOP", "ALL"]>>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}, {
    origin: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}>;
/**
 * Query by URL schema
 */
export declare const QueryByUrlSchema: z.ZodObject<{
    url: z.ZodString;
    formFactor: z.ZodOptional<z.ZodEnum<["PHONE", "TABLET", "DESKTOP", "ALL"]>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}, {
    url: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}>;
/**
 * Combined query schema
 */
export declare const CruxQuerySchema: z.ZodUnion<[z.ZodObject<{
    origin: z.ZodEffects<z.ZodString, string, string>;
    formFactor: z.ZodOptional<z.ZodEnum<["PHONE", "TABLET", "DESKTOP", "ALL"]>>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}, {
    origin: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}>, z.ZodObject<{
    url: z.ZodString;
    formFactor: z.ZodOptional<z.ZodEnum<["PHONE", "TABLET", "DESKTOP", "ALL"]>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}, {
    url: string;
    formFactor?: "PHONE" | "TABLET" | "DESKTOP" | "ALL" | undefined;
}>]>;
/**
 * Validate and parse CrUX query input
 */
export declare function validateCruxQuery(input: unknown): z.infer<typeof CruxQuerySchema>;
/**
 * Check if input has origin
 */
export declare function hasOrigin(input: unknown): input is {
    origin: string;
    formFactor?: string;
};
/**
 * Check if input has URL
 */
export declare function hasUrl(input: unknown): input is {
    url: string;
    formFactor?: string;
};
//# sourceMappingURL=validation.d.ts.map