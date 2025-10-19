/**
 * Validation schemas for Google Analytics API inputs
 */
import { z } from 'zod';
/**
 * Property ID schema (numeric string or full resource name)
 */
export declare const PropertyIdSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Date schema (YYYY-MM-DD, 'today', 'yesterday', or NdaysAgo)
 */
export declare const AnalyticsDateSchema: z.ZodString;
/**
 * Dimension name schema
 */
export declare const DimensionNameSchema: z.ZodString;
/**
 * Metric name schema
 */
export declare const MetricNameSchema: z.ZodString;
/**
 * List properties schema
 */
export declare const ListPropertiesSchema: z.ZodObject<{
    accountId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountId?: string | undefined;
}, {
    accountId?: string | undefined;
}>;
/**
 * Run report schema
 */
export declare const RunReportSchema: z.ZodObject<{
    propertyId: z.ZodEffects<z.ZodString, string, string>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    dimensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
    propertyId: string;
    limit?: number | undefined;
    dimensions?: string[] | undefined;
    metrics?: string[] | undefined;
}, {
    startDate: string;
    endDate: string;
    propertyId: string;
    limit?: number | undefined;
    dimensions?: string[] | undefined;
    metrics?: string[] | undefined;
}>;
/**
 * Realtime report schema
 */
export declare const RunRealtimeReportSchema: z.ZodObject<{
    propertyId: z.ZodEffects<z.ZodString, string, string>;
    dimensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    propertyId: string;
    limit?: number | undefined;
    dimensions?: string[] | undefined;
    metrics?: string[] | undefined;
}, {
    propertyId: string;
    limit?: number | undefined;
    dimensions?: string[] | undefined;
    metrics?: string[] | undefined;
}>;
/**
 * Helper to extract property ID from resource name
 */
export declare function extractPropertyId(propertyName: string): string;
/**
 * Helper to format property resource name
 */
export declare function formatPropertyName(propertyId: string): string;
//# sourceMappingURL=validation.d.ts.map