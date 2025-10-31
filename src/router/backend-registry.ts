/**
 * Backend Registry - Manages backend MCP servers
 */

import { getLogger } from '../shared/logger.js';
import { McpHttpClient } from './http-client.js';
import type {
  BackendConfig,
  McpTool,
  PrefixedTool,
  BackendHealth,
  RouterStats,
} from './types.js';

const logger = getLogger('router.backend-registry');

/**
 * Extract first line from tool description (strip verbose guidance)
 * This reduces token usage by removing multi-line agent guidance from tool metadata.
 */
function extractMinimalDescription(description: string | undefined): string {
  if (!description) return '';

  // Split by newline and take first line
  const firstLine = description.split('\n')[0].trim();

  // Remove emoji if present at start (💡, 📊, 🎯, etc.)
  const withoutEmoji = firstLine.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '');

  return withoutEmoji || firstLine;
}

export class BackendRegistry {
  private backends: Map<string, BackendConfig> = new Map();
  private httpClient: McpHttpClient;
  private toolCache: Map<string, PrefixedTool> = new Map();
  private lastRefresh: Map<string, Date> = new Map();

  constructor() {
    this.httpClient = new McpHttpClient();
  }

  /**
   * Register a backend MCP server
   */
  registerBackend(config: BackendConfig): void {
    logger.info(`Registering backend: ${config.name}`, {
      url: config.url,
      prefix: config.prefix,
      active: config.active,
    });

    this.backends.set(config.name, config);

    // Refresh tools if active
    if (config.active) {
      this.refreshBackendTools(config.name).catch((error) => {
        logger.error(`Failed to refresh tools for ${config.name}`, error);
      });
    }
  }

  /**
   * Get backend configuration
   */
  getBackend(name: string): BackendConfig | undefined {
    return this.backends.get(name);
  }

  /**
   * List all registered backends
   */
  listBackends(): BackendConfig[] {
    return Array.from(this.backends.values());
  }

  /**
   * List only active backends
   */
  listActiveBackends(): BackendConfig[] {
    return this.listBackends().filter((b) => b.active);
  }

  /**
   * Activate a backend
   */
  async activateBackend(name: string): Promise<void> {
    const backend = this.backends.get(name);
    if (!backend) {
      throw new Error(`Backend not found: ${name}`);
    }

    backend.active = true;
    logger.info(`Activated backend: ${name}`);

    await this.refreshBackendTools(name);
  }

  /**
   * Deactivate a backend
   */
  deactivateBackend(name: string): void {
    const backend = this.backends.get(name);
    if (!backend) {
      throw new Error(`Backend not found: ${name}`);
    }

    backend.active = false;
    logger.info(`Deactivated backend: ${name}`);

    // Remove tools from cache
    this.removeBackendTools(name);
  }

  /**
   * Refresh tools from a specific backend
   */
  async refreshBackendTools(backendName: string): Promise<void> {
    const backend = this.backends.get(backendName);
    if (!backend || !backend.active) {
      logger.warn(`Cannot refresh tools for inactive backend: ${backendName}`);
      return;
    }

    try {
      logger.info(`Refreshing tools from backend: ${backendName}`);

      // Call backend's tools/list
      const result = await this.httpClient.call(
        backend.url,
        'tools/list',
        undefined,
        backend.timeout
      );

      const tools: McpTool[] = result.tools || [];

      logger.info(`Received ${tools.length} tools from ${backendName}`);

      // Remove old tools from this backend
      this.removeBackendTools(backendName);

      // Add prefixed tools to cache with minimal descriptions
      for (const tool of tools) {
        const minimalDescription = extractMinimalDescription(tool.description);

        const prefixedTool: PrefixedTool = {
          ...tool,
          name: `${backend.prefix}__${tool.name}`,
          description: minimalDescription, // Use minimal description to save tokens
          _originalName: tool.name,
          _backend: backendName,
          _prefix: backend.prefix,
        };

        // Store full description separately if we need it later
        if (tool.description && tool.description !== minimalDescription) {
          if (!prefixedTool.annotations) {
            prefixedTool.annotations = {};
          }
          prefixedTool.annotations._fullDescription = tool.description;
        }

        this.toolCache.set(prefixedTool.name, prefixedTool);
      }

      this.lastRefresh.set(backendName, new Date());

      // Calculate token savings (rough estimate: 4 chars ≈ 1 token)
      const originalDescriptionLength = tools.reduce((sum, t) => sum + (t.description?.length || 0), 0);
      const minimalDescriptionLength = Array.from(this.toolCache.values())
        .filter((t) => t._backend === backendName)
        .reduce((sum, t) => sum + (t.description?.length || 0), 0);
      const estimatedTokenSavings = Math.round((originalDescriptionLength - minimalDescriptionLength) / 4);

      logger.info(`Cached ${tools.length} prefixed tools from ${backendName}`, {
        prefix: backend.prefix,
        sampleTools: tools.slice(0, 3).map((t) => `${backend.prefix}__${t.name}`),
        estimatedTokenSavings: `~${estimatedTokenSavings} tokens saved`,
      });
    } catch (error) {
      logger.error(`Failed to refresh tools from ${backendName}`, error);
      throw error;
    }
  }

  /**
   * Refresh tools from all active backends
   */
  async refreshAllTools(): Promise<void> {
    logger.info('Refreshing tools from all active backends');

    const activeBackends = this.listActiveBackends();

    // Refresh in parallel
    const refreshPromises = activeBackends.map((backend) =>
      this.refreshBackendTools(backend.name).catch((error) => {
        logger.error(`Failed to refresh ${backend.name}`, error);
        // Continue with other backends even if one fails
      })
    );

    await Promise.all(refreshPromises);

    logger.info(`Total tools cached: ${this.toolCache.size}`);
  }

  /**
   * Remove all tools from a specific backend
   */
  private removeBackendTools(backendName: string): void {
    const toolsToRemove: string[] = [];

    for (const [toolName, tool] of this.toolCache.entries()) {
      if (tool._backend === backendName) {
        toolsToRemove.push(toolName);
      }
    }

    for (const toolName of toolsToRemove) {
      this.toolCache.delete(toolName);
    }

    logger.debug(`Removed ${toolsToRemove.length} tools from ${backendName}`);
  }

  /**
   * Get all cached tools (aggregated from all active backends)
   */
  getAllTools(): PrefixedTool[] {
    return Array.from(this.toolCache.values());
  }

  /**
   * Get a specific tool by prefixed name
   */
  getTool(prefixedName: string): PrefixedTool | undefined {
    return this.toolCache.get(prefixedName);
  }

  /**
   * Get tools from a specific backend
   */
  getToolsByBackend(backendName: string): PrefixedTool[] {
    return this.getAllTools().filter((tool) => tool._backend === backendName);
  }

  /**
   * Check health of all backends
   */
  async checkAllBackendsHealth(): Promise<BackendHealth[]> {
    const backends = this.listBackends();

    const healthChecks = await Promise.all(
      backends.map(async (backend) => {
        const startTime = Date.now();
        const healthy = await this.httpClient.healthCheck(
          backend.healthCheckUrl || backend.url,
          backend.timeout
        );
        const responseTime = Date.now() - startTime;

        return {
          name: backend.name,
          url: backend.url,
          healthy,
          lastChecked: new Date(),
          responseTime,
        };
      })
    );

    return healthChecks;
  }

  /**
   * Get router statistics
   */
  getStats(startTime: number): RouterStats {
    const backends = this.listBackends();
    const activeBackends = this.listActiveBackends();

    const toolsByBackend: Record<string, number> = {};
    for (const backend of backends) {
      toolsByBackend[backend.name] = this.getToolsByBackend(backend.name).length;
    }

    return {
      totalBackends: backends.length,
      activeBackends: activeBackends.length,
      totalTools: this.toolCache.size,
      toolsByBackend,
      uptime: Date.now() - startTime,
    };
  }

  /**
   * Call a tool on its backend
   */
  async callTool(prefixedToolName: string, args: any): Promise<any> {
    const tool = this.getTool(prefixedToolName);
    if (!tool) {
      throw new Error(`Tool not found: ${prefixedToolName}`);
    }

    const backend = this.backends.get(tool._backend);
    if (!backend) {
      throw new Error(`Backend not found for tool: ${tool._backend}`);
    }

    if (!backend.active) {
      throw new Error(`Backend is inactive: ${backend.name}`);
    }

    logger.info(`Routing tool call to backend`, {
      prefixedName: prefixedToolName,
      originalName: tool._originalName,
      backend: backend.name,
    });

    // Call backend with original (unprefixed) tool name
    const result = await this.httpClient.call(
      backend.url,
      'tools/call',
      {
        name: tool._originalName,
        arguments: args,
      },
      backend.timeout
    );

    return result;
  }
}
