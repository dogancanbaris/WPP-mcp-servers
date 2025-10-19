/**
 * Validation schemas for Google Analytics API inputs
 */
import { z } from 'zod';
/**
 * Property ID schema (numeric string or full resource name)
 */
export const PropertyIdSchema = z.string().refine((val) => /^\d+$/.test(val) || val.startsWith('properties/'), 'Property ID must be numeric or in format properties/123456789');
/**
 * Date schema (YYYY-MM-DD, 'today', 'yesterday', or NdaysAgo)
 */
export const AnalyticsDateSchema = z.string();
/**
 * Dimension name schema
 */
export const DimensionNameSchema = z.string();
/**
 * Metric name schema
 */
export const MetricNameSchema = z.string();
/**
 * List properties schema
 */
export const ListPropertiesSchema = z.object({
    accountId: z.string().optional(),
});
/**
 * Run report schema
 */
export const RunReportSchema = z.object({
    propertyId: PropertyIdSchema,
    startDate: AnalyticsDateSchema,
    endDate: AnalyticsDateSchema,
    dimensions: z.array(DimensionNameSchema).optional(),
    metrics: z.array(MetricNameSchema).optional(),
    limit: z.number().int().positive().max(100000).optional(),
});
/**
 * Realtime report schema
 */
export const RunRealtimeReportSchema = z.object({
    propertyId: PropertyIdSchema,
    dimensions: z.array(DimensionNameSchema).optional(),
    metrics: z.array(MetricNameSchema).optional(),
    limit: z.number().int().positive().max(10000).optional(),
});
/**
 * Helper to extract property ID from resource name
 */
export function extractPropertyId(propertyName) {
    if (propertyName.startsWith('properties/')) {
        return propertyName.split('/')[1];
    }
    return propertyName;
}
/**
 * Helper to format property resource name
 */
export function formatPropertyName(propertyId) {
    if (propertyId.startsWith('properties/')) {
        return propertyId;
    }
    return `properties/${propertyId}`;
}
//# sourceMappingURL=validation.js.map