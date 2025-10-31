/**
 * Input validation schemas for GSC MCP tools
 */
import { z } from 'zod';
/**
 * Validate GSC property format
 */
export declare const GSCPropertySchema: z.ZodString;
/**
 * Search Analytics Query Schema
 */
export declare const SearchAnalyticsQuerySchema: z.ZodObject<{
    property: z.ZodString;
    startDate: z.ZodEffects<z.ZodString, string, string>;
    endDate: z.ZodEffects<z.ZodString, string, string>;
    dimensions: z.ZodOptional<z.ZodArray<z.ZodEnum<["query", "page", "country", "device", "searchType", "appearance"]>, "many">>;
    searchType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["web", "image", "video", "news"]>>>;
    rowLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
    property: string;
    searchType: "web" | "image" | "video" | "news";
    rowLimit: number;
    dimensions?: ("device" | "country" | "query" | "page" | "searchType" | "appearance")[] | undefined;
}, {
    startDate: string;
    endDate: string;
    property: string;
    dimensions?: ("device" | "country" | "query" | "page" | "searchType" | "appearance")[] | undefined;
    searchType?: "web" | "image" | "video" | "news" | undefined;
    rowLimit?: number | undefined;
}>;
/**
 * Properties List Schema
 */
export declare const PropertiesListSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * List Sitemaps Schema
 */
export declare const ListSitemapsSchema: z.ZodObject<{
    property: z.ZodString;
}, "strip", z.ZodTypeAny, {
    property: string;
}, {
    property: string;
}>;
/**
 * Get Sitemap Schema
 */
export declare const GetSitemapSchema: z.ZodObject<{
    property: z.ZodString;
    sitemapUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    property: string;
    sitemapUrl: string;
}, {
    property: string;
    sitemapUrl: string;
}>;
/**
 * Submit Sitemap Schema
 */
export declare const SubmitSitemapSchema: z.ZodObject<{
    property: z.ZodString;
    sitemapUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    property: string;
    sitemapUrl: string;
}, {
    property: string;
    sitemapUrl: string;
}>;
/**
 * Delete Sitemap Schema
 */
export declare const DeleteSitemapSchema: z.ZodObject<{
    property: z.ZodString;
    sitemapUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    property: string;
    sitemapUrl: string;
}, {
    property: string;
    sitemapUrl: string;
}>;
/**
 * Inspect URL Schema
 */
export declare const InspectURLSchema: z.ZodObject<{
    property: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    property: string;
}, {
    url: string;
    property: string;
}>;
/**
 * Add Property Schema
 */
export declare const AddPropertySchema: z.ZodObject<{
    siteUrl: z.ZodString;
    propertyType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["SITE", "PREFIX"]>>>;
}, "strip", z.ZodTypeAny, {
    siteUrl: string;
    propertyType: "SITE" | "PREFIX";
}, {
    siteUrl: string;
    propertyType?: "SITE" | "PREFIX" | undefined;
}>;
/**
 * Delete Property Schema
 */
export declare const DeletePropertySchema: z.ZodObject<{
    property: z.ZodString;
}, "strip", z.ZodTypeAny, {
    property: string;
}, {
    property: string;
}>;
/**
 * Validate input against schema
 */
export declare function validateInput<T>(schema: z.ZodSchema<T>, input: any): T;
/**
 * Validate GSC property format helper
 */
export declare function validateGSCProperty(property: string): void;
/**
 * Type helpers for schema inference
 */
export type SearchAnalyticsQuery = z.infer<typeof SearchAnalyticsQuerySchema>;
export type ListSitemaps = z.infer<typeof ListSitemapsSchema>;
export type SubmitSitemap = z.infer<typeof SubmitSitemapSchema>;
export type InspectURL = z.infer<typeof InspectURLSchema>;
export type AddProperty = z.infer<typeof AddPropertySchema>;
//# sourceMappingURL=validation.d.ts.map