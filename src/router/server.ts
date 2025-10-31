#!/usr/bin/env node

/**
 * WPP Marketing MCP Router
 *
 * Aggregates multiple backend MCP servers into a single interface.
 * Supports both stdio (CLI) and HTTP (web UI) transports.
 *
 * Architecture:
 * - Router accepts client connections (stdio or HTTP)
 * - Router connects to backend MCP servers (always HTTP)
 * - Router aggregates tools from all backends with prefixes
 * - Router routes tool calls to appropriate backend
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { getLogger } from '../shared/logger.js';
import { BackendRegistry } from './backend-registry.js';
import { loadBackendConfigs, loadRouterConfig, validateBackendConfig } from './config.js';

const logger = getLogger('router.server');

/**
 * Initialize router with backends
 */
async function initializeRouter() {
  const startTime = Date.now();

  logger.info('Initializing WPP Marketing MCP Router');

  // Load configurations
  const routerConfig = loadRouterConfig();
  const backendConfigs = loadBackendConfigs();

  logger.info('Router configuration loaded', {
    transport: routerConfig.transport,
    httpPort: routerConfig.httpPort,
    backendsCount: backendConfigs.length,
  });

  // Validate backend configs
  for (const config of backendConfigs) {
    const errors = validateBackendConfig(config);
    if (errors.length > 0) {
      logger.error(`Invalid backend configuration: ${config.name}`, { errors });
      throw new Error(`Invalid backend config for ${config.name}: ${errors.join(', ')}`);
    }
  }

  // Create backend registry
  const registry = new BackendRegistry();

  // Register all backends
  for (const config of backendConfigs) {
    registry.registerBackend(config);
  }

  // Refresh tools from all active backends
  try {
    await registry.refreshAllTools();
    logger.info('Initial tool refresh completed', {
      totalTools: registry.getAllTools().length,
    });
  } catch (error) {
    logger.error('Failed to refresh tools from backends', error);
    // Continue even if refresh fails - tools will be empty but router will work
  }

  // Create MCP server
  const server = new Server(
    {
      name: 'wpp-marketing-router',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {
          listChanged: true, // We support dynamic tool updates
        },
      },
    }
  );

  logger.info('MCP Server created', { name: 'wpp-marketing-router' });

  // Handle tools/list - return aggregated tools from all backends
  server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
    logger.debug('Handling tools/list request');

    const tools = registry.getAllTools();

    // Remove internal metadata and annotations (with verbose descriptions) before returning
    const cleanTools = tools.map((tool) => {
      const { _originalName, _backend, _prefix, annotations, ...cleanTool } = tool;
      // Don't send annotations to client - keeps full descriptions out of context
      return cleanTool;
    });

    logger.info(`Returning ${cleanTools.length} tools to client`, {
      toolsByBackend: registry.getStats(startTime).toolsByBackend,
    });

    return {
      tools: cleanTools,
    };
  });

  // Handle tools/call - route to appropriate backend
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info(`Handling tools/call request`, { toolName: name });

    try {
      const result = await registry.callTool(name, args);

      logger.info(`Tool call successful`, { toolName: name });

      return result;
    } catch (error) {
      logger.error(`Tool call failed`, {
        toolName: name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

  // Setup periodic tool refresh if enabled
  if (routerConfig.refreshInterval > 0) {
    setInterval(
      () => {
        logger.debug('Periodic tool refresh starting');
        registry.refreshAllTools().catch((error) => {
          logger.error('Periodic tool refresh failed', error);
        });
      },
      routerConfig.refreshInterval
    );

    logger.info(`Periodic tool refresh enabled`, {
      interval: routerConfig.refreshInterval,
    });
  }

  // Setup health checks if enabled
  if (routerConfig.healthCheckEnabled) {
    setInterval(
      () => {
        logger.debug('Backend health check starting');
        registry.checkAllBackendsHealth().then((results) => {
          const unhealthyBackends = results.filter((r) => !r.healthy);
          if (unhealthyBackends.length > 0) {
            logger.warn('Unhealthy backends detected', {
              unhealthy: unhealthyBackends.map((r) => r.name),
            });
          } else {
            logger.debug('All backends healthy');
          }
        });
      },
      routerConfig.healthCheckInterval
    );

    logger.info('Health checks enabled', {
      interval: routerConfig.healthCheckInterval,
    });
  }

  return { server, registry, routerConfig, startTime };
}

/**
 * Start router with stdio transport (for CLI)
 */
async function startStdioServer() {
  logger.info('Starting router with stdio transport');

  const { server } = await initializeRouter();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Router connected via stdio - ready for CLI usage');
}

/**
 * Start router with HTTP transport (for web UI)
 */
async function startHttpServer() {
  logger.info('Starting router with HTTP transport');

  const { server, registry, routerConfig, startTime } = await initializeRouter();

  const app = express();
  app.use(express.json());

  // Main MCP endpoint
  app.post('/mcp', async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode for simplicity
        enableJsonResponse: true,
      });

      res.on('close', () => {
        transport.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error('HTTP request handling failed', error);

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // Health check endpoint
  app.get('/health', async (_req, res) => {
    try {
      const health = await registry.checkAllBackendsHealth();
      const allHealthy = health.every((h) => h.healthy);

      res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'degraded',
        backends: health,
        router: {
          uptime: Date.now() - startTime,
          totalTools: registry.getAllTools().length,
        },
      });
    } catch (error) {
      logger.error('Health check failed', error);
      res.status(500).json({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Stats endpoint
  app.get('/stats', (_req, res) => {
    const stats = registry.getStats(startTime);
    res.json(stats);
  });

  // Admin endpoint: Refresh tools from all backends
  app.post('/admin/refresh', async (_req, res) => {
    try {
      logger.info('Manual tool refresh requested');
      await registry.refreshAllTools();

      res.json({
        success: true,
        totalTools: registry.getAllTools().length,
        toolsByBackend: registry.getStats(startTime).toolsByBackend,
      });
    } catch (error) {
      logger.error('Manual refresh failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Admin endpoint: List backends
  app.get('/admin/backends', (_req, res) => {
    const backends = registry.listBackends();
    res.json({
      backends: backends.map((b) => ({
        name: b.name,
        url: b.url,
        prefix: b.prefix,
        description: b.description,
        active: b.active,
        toolCount: registry.getToolsByBackend(b.name).length,
        lastRefresh: registry['lastRefresh'].get(b.name)?.toISOString(),
      })),
    });
  });

  // Start HTTP server
  app.listen(routerConfig.httpPort, () => {
    logger.info(`🚀 WPP Marketing MCP Router running on http://localhost:${routerConfig.httpPort}/mcp`);
    logger.info(`📊 Health check: http://localhost:${routerConfig.httpPort}/health`);
    logger.info(`📈 Stats: http://localhost:${routerConfig.httpPort}/stats`);
    logger.info(`🔧 Admin: http://localhost:${routerConfig.httpPort}/admin/backends`);
  }).on('error', (error) => {
    logger.error('HTTP server error', error);
    process.exit(1);
  });
}

/**
 * Main entry point
 */
async function main() {
  try {
    const config = loadRouterConfig();

    if (config.transport === 'stdio') {
      await startStdioServer();
    } else if (config.transport === 'http') {
      await startHttpServer();
    } else if (config.transport === 'both') {
      // For 'both' mode, start HTTP server (stdio not supported in parallel)
      logger.warn('Transport "both" mode: Starting HTTP server only. Use separate processes for stdio.');
      await startHttpServer();
    } else {
      logger.error(`Unknown transport: ${config.transport}. Use 'stdio', 'http', or 'both'`);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Router failed to start', error);
    process.exit(1);
  }
}

// Start the router
main();
