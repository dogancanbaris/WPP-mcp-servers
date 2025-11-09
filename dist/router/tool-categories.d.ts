/**
 * Tool Categorization for Smart Discovery
 *
 * Organizes all 98 Google marketing tools into logical categories
 * for efficient searching and discovery via meta-tools.
 */
export interface ToolCategory {
    name: string;
    description: string;
    platform: string;
    tools: string[];
}
/**
 * Complete tool categorization
 */
export declare const toolCategories: Record<string, ToolCategory>;
/**
 * Platform mapping for quick filtering
 */
export declare const platformMap: Record<string, string[]>;
/**
 * Search tools by keyword
 */
export declare function searchToolsByKeyword(query: string): string[];
/**
 * Get tools by category key
 */
export declare function getToolsByCategory(categoryKey: string): string[];
/**
 * Get tools by platform
 */
export declare function getToolsByPlatform(platform: string): string[];
/**
 * Get all categories for discovery
 */
export declare function getAllCategories(): Array<{
    key: string;
    category: ToolCategory;
}>;
/**
 * Find which category a tool belongs to
 */
export declare function findCategoryForTool(toolName: string): string | null;
//# sourceMappingURL=tool-categories.d.ts.map