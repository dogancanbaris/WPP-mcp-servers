/**
 * Meta-Tools for On-Demand Tool Discovery and Execution
 *
 * Enables lazy loading pattern: Only 3 meta-tools loaded upfront (~2K tokens),
 * real tools discovered and loaded on-demand (97% token reduction).
 *
 * Pattern:
 * 1. search_tools - Find tools by keyword/category
 * 2. get_tool_schema - Load full schema for specific tool
 * 3. execute_tool - Execute discovered tool with interactive workflows
 */

import { getLogger } from '../shared/logger.js';
import type { BackendRegistry } from './backend-registry.js';
import {
  searchToolsByKeyword,
  getToolsByCategory,
  getToolsByPlatform,
  getAllCategories,
  findCategoryForTool,
} from './tool-categories.js';

const logger = getLogger('router.meta-tools');

/**
 * Tool metadata for discovery
 */
interface ToolMetadata {
  name: string;
  description: string;
  category?: string;
  platform?: string;
}

/**
 * Create search_tools meta-tool
 */
export function createSearchToolsMeta(registry: BackendRegistry) {
  return {
    name: 'search_tools',
    description: 'Search available Google marketing tools by keyword, category, or platform',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword (e.g., "campaign", "keyword", "budget", "analytics")'
        },
        category: {
          type: 'string',
          description: 'Tool category (e.g., "ads.campaigns", "gsc.analytics", "analytics.reporting")'
        },
        platform: {
          type: 'string',
          enum: [
            'google-search-console',
            'google-ads',
            'google-analytics',
            'core-web-vitals',
            'google-business',
            'bigquery',
            'serp',
            'wpp-analytics'
          ],
          description: 'Filter by platform'
        },
        detailLevel: {
          type: 'string',
          enum: ['minimal', 'full'],
          description: 'minimal = names only, full = with descriptions and categories'
        }
      }
    },
    async handler(input: any) {
      const { query, category, platform, detailLevel = 'full' } = input;

      logger.info('Searching tools', { query, category, platform, detailLevel });

      // DEBUG: Log what's in registry
      const registryTools = registry.getAllTools();
      logger.info('Registry debug', {
        totalTools: registryTools.length,
        sampleNames: registryTools.slice(0, 3).map(t => t.name),
        sampleOriginalNames: registryTools.slice(0, 3).map(t => t._originalName)
      });

      let matchedTools: string[] = [];

      // Search by different criteria
      if (query) {
        matchedTools = searchToolsByKeyword(query);
      } else if (category) {
        matchedTools = getToolsByCategory(category);
      } else if (platform) {
        matchedTools = getToolsByPlatform(platform);
      } else {
        // No filters - show categories
        const categories = getAllCategories();
        return {
          content: [{
            type: 'text' as const,
            text: `🔍 TOOL CATEGORIES (${categories.length} categories, 98 tools total)

**How to search:**
- By keyword: search_tools({ query: "campaign" })
- By category: search_tools({ category: "ads.campaigns" })
- By platform: search_tools({ platform: "google-ads" })

**Available categories:**

${categories.map(({ key, category }) =>
  `• ${key} - ${category.description} (${category.tools.length} tools)`
).join('\n')}

**Popular searches:**
- "campaign" - Campaign management tools
- "keyword" - Keyword research and management
- "budget" - Budget configuration
- "analytics" - GA4 reporting and analysis
- "dashboard" - Dashboard creation

What would you like to find?`
          }],
          categories: categories.map(c => c.key),
          totalTools: 98
        };
      }

      // Build response based on detail level
      if (detailLevel === 'minimal') {
        return {
          content: [{
            type: 'text' as const,
            text: `🔍 FOUND ${matchedTools.length} TOOLS

${matchedTools.map((tool, i) => `${i + 1}. ${tool}`).join('\n')}

**Next steps:**
- Get full schema: get_tool_schema({ toolName: "tool_name" })
- Execute directly: execute_tool({ toolName: "tool_name", params: {...} })`
          }],
          tools: matchedTools,
          count: matchedTools.length
        };
      }

      // Full detail level - include descriptions
      const toolsWithMetadata: ToolMetadata[] = [];
      const allBackendTools = registry.getAllTools();

      for (const toolName of matchedTools) {
        // Find tool in backend registry by _originalName (unprefixed)
        // matchedTools contains unprefixed names from tool-categories
        // registry has tools with prefixed names but stores _originalName
        const backendTool = allBackendTools.find(t => t._originalName === toolName);

        if (backendTool) {
          toolsWithMetadata.push({
            name: toolName,
            description: backendTool.description || 'No description',
            category: findCategoryForTool(toolName) || undefined,
            platform: backendTool._backend
          });
        }
      }

      return {
        content: [{
          type: 'text' as const,
          text: `🔍 FOUND ${toolsWithMetadata.length} TOOLS

${toolsWithMetadata.map((tool, i) =>
  `${i + 1}. **${tool.name}**
   ${tool.description}
   Category: ${tool.category || 'N/A'} | Platform: ${tool.platform || 'N/A'}`
).join('\n\n')}

**Next steps:**
- Get full schema: get_tool_schema({ toolName: "${toolsWithMetadata[0]?.name}" })
- Execute directly: execute_tool({ toolName: "${toolsWithMetadata[0]?.name}", params: {...} })

💡 Use get_tool_schema to see available parameters for each tool.`
        }],
        tools: toolsWithMetadata,
        count: toolsWithMetadata.length
      };
    }
  };
}

/**
 * Create get_tool_schema meta-tool
 */
export function createGetToolSchemaMeta(registry: BackendRegistry) {
  return {
    name: 'get_tool_schema',
    description: 'Get full input schema and documentation for a specific tool',
    inputSchema: {
      type: 'object' as const,
      properties: {
        toolName: {
          type: 'string',
          description: 'Tool name without google__ prefix (e.g., "list_campaigns", "query_search_analytics")'
        }
      },
      required: ['toolName']
    },
    async handler(input: any) {
      const { toolName } = input;

      logger.info('Getting tool schema', { toolName });

      // Find tool in registry by _originalName (unprefixed)
      // User provides unprefixed name (e.g., "list_campaigns")
      // Registry has prefixed names (e.g., "google__list_campaigns")
      const tool = registry.getAllTools().find(t => t._originalName === toolName);

      if (!tool) {
        return {
          content: [{
            type: 'text' as const,
            text: `❌ Tool not found: ${toolName}

Available tools can be found using:
  search_tools({ query: "your_keyword" })

Or browse categories:
  search_tools({})`
          }],
          error: 'Tool not found'
        };
      }

      // Format schema for readability
      const schemaProps = tool.inputSchema?.properties || {};
      const requiredProps = (tool.inputSchema as any)?.required || [];

      const paramsDoc = Object.entries(schemaProps).map(([key, prop]: [string, any]) => {
        const required = requiredProps.includes(key) ? '**REQUIRED**' : 'optional';
        const type = prop.type || 'any';
        const desc = prop.description || 'No description';
        const enumValues = prop.enum ? `\n     Allowed: ${prop.enum.join(', ')}` : '';

        return `  • **${key}** (${type}) - ${required}
     ${desc}${enumValues}`;
      }).join('\n\n');

      const categoryKey = findCategoryForTool(toolName);

      return {
        content: [{
          type: 'text' as const,
          text: `📋 TOOL SCHEMA: ${toolName}

**Description:** ${tool.description}

**Category:** ${categoryKey || 'N/A'}

**Parameters:**

${paramsDoc || '  No parameters required'}

${requiredProps.length > 0 ? `\n**Required Parameters:** ${requiredProps.join(', ')}` : '\n**All parameters optional** (interactive discovery mode)'}

**Usage:**

\`\`\`typescript
execute_tool({
  toolName: "${toolName}",
  params: {
    // Add your parameters here
  }
})
\`\`\`

💡 **Tip:** Most tools support interactive discovery - call execute_tool without all params and the tool will guide you step-by-step!

🎯 **Ready to execute this tool?**`
        }],
        tool: {
          name: toolName,
          fullName: tool.name, // Prefixed name from registry
          description: tool.description,
          inputSchema: tool.inputSchema,
          category: categoryKey
        }
      };
    }
  };
}

/**
 * Create execute_tool meta-tool
 */
export function createExecuteToolMeta(registry: BackendRegistry) {
  return {
    name: 'execute_tool',
    description: 'Execute a discovered Google marketing tool with parameters (supports interactive workflows)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        toolName: {
          type: 'string',
          description: 'Tool name without google__ prefix (e.g., "list_campaigns")'
        },
        params: {
          type: 'object',
          description: 'Tool-specific parameters (use get_tool_schema to see available params)'
        },
        __oauthToken: {
          type: 'string',
          description: 'OAuth access token (auto-loaded from config if not provided)'
        },
        __refreshToken: {
          type: 'string',
          description: 'OAuth refresh token (auto-loaded from config if not provided)'
        }
      },
      required: ['toolName']
    },
    async handler(input: any) {
      const { toolName, params = {}, __oauthToken, __refreshToken } = input;

      logger.info('Executing tool via meta-tool', { toolName, hasParams: Object.keys(params).length > 0 });

      // Find tool in registry by _originalName (unprefixed)
      // User provides unprefixed name (e.g., "list_campaigns")
      // We need to find the prefixed version (e.g., "google__list_campaigns")
      const tool = registry.getAllTools().find(t => t._originalName === toolName);

      if (!tool) {
        return {
          content: [{
            type: 'text' as const,
            text: `❌ Tool not found: ${toolName}

Use search_tools to find available tools:
  search_tools({ query: "${toolName}" })`
          }],
          error: 'Tool not found'
        };
      }

      // Use the PREFIXED name for the actual call
      const prefixedToolName = tool.name; // e.g., "google__list_campaigns"

      // Inject OAuth tokens into params if provided
      const enrichedParams = {
        ...params,
        ...(__oauthToken && { __oauthToken }),
        ...(__refreshToken && { __refreshToken })
      };

      try {
        // Execute via registry (routes to backend)
        // Use prefixed name for registry call
        const result = await registry.callTool(prefixedToolName, enrichedParams);

        logger.info('Tool executed successfully via meta-tool', { toolName });

        // Result already contains interactive workflow guidance!
        return result;
      } catch (error) {
        logger.error('Tool execution failed via meta-tool', {
          toolName,
          error: error instanceof Error ? error.message : String(error)
        });

        return {
          content: [{
            type: 'text' as const,
            text: `❌ Execution failed: ${toolName}

**Error:** ${error instanceof Error ? error.message : String(error)}

**Troubleshooting:**
1. Check parameters: get_tool_schema({ toolName: "${toolName}" })
2. Verify OAuth: Check if tokens are valid
3. Check tool availability: search_tools({ query: "${toolName}" })`
          }],
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  };
}

/**
 * Get all meta-tools for router
 */
export function getMetaTools(registry: BackendRegistry) {
  return [
    createSearchToolsMeta(registry),
    createGetToolSchemaMeta(registry),
    createExecuteToolMeta(registry)
  ];
}
