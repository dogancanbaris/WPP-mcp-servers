#!/usr/bin/env node

/**
 * Google Marketing Backend MCP Server
 *
 * Consolidates all Google marketing platform tools:
 * - Google Search Console
 * - Google Ads
 * - Google Analytics
 * - Chrome UX Report (Core Web Vitals)
 * - Google Business Profile
 * - BigQuery
 * - SERP API
 * - WPP Analytics Platform
 *
 * This backend is HTTP-only and designed to be called by the MCP router.
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { getLogger } from '../../shared/logger.js';

// Import all Google tools from existing structure
import { allTools as gscTools } from '../../gsc/tools/index.js';

const logger = getLogger('backend.google-marketing');

/**
 * Initialize Google Marketing MCP Server
 */
async function initializeServer() {
  logger.info('Initializing Google Marketing Backend MCP Server');

  // Create MCP server
  const server = new Server(
    {
      name: 'google-marketing-backend',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {
          listChanged: false, // Backend tools are static
        },
      },
    }
  );

  logger.info(`Registering ${gscTools.length} Google marketing tools`);

  // Handle tools/list - return all tool metadata
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Handling tools/list request');

    // Return tool metadata (name, description, inputSchema)
    const toolMetadata = gscTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));

    logger.info(`Returning ${toolMetadata.length} tools`);

    return {
      tools: toolMetadata,
    };
  });

  // Handle tools/call - route to appropriate tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info(`Handling tools/call: ${name}`, { args });

    // Find the tool
    const tool = gscTools.find((t) => t.name === name);
    if (!tool) {
      logger.error(`Tool not found: ${name}`);
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      // Call the tool handler
      const result = await tool.handler(args);

      logger.info(`Tool call successful: ${name}`);

      // Return as MCP-compatible result (type assertion for flexibility)
      return result as any;
    } catch (error) {
      logger.error(`Tool call failed: ${name}`, error);
      throw error;
    }
  });

  logger.info('Google Marketing Backend initialized successfully');

  return server;
}

/**
 * Start HTTP server
 */
async function startHttpServer() {
  const port = parseInt(process.env.GOOGLE_BACKEND_PORT || process.env.PORT || '3100');

  logger.info(`Starting Google Marketing Backend on port ${port}`);

  const server = await initializeServer();

  const app = express();
  app.use(express.json());

  // MCP endpoint
  app.post('/mcp', async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless
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

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      name: 'google-marketing-backend',
      version: '1.0.0',
      tools: gscTools.length,
    });
  });

  // Start server
  app.listen(port, () => {
    logger.info(`🚀 Google Marketing Backend running on http://localhost:${port}/mcp`);
    logger.info(`✅ Serving ${gscTools.length} tools`);
  }).on('error', (error) => {
    logger.error('Server error', error);
    process.exit(1);
  });
}

// Main
if (process.env.MCP_TRANSPORT === 'stdio') {
  logger.error('Google Marketing Backend only supports HTTP transport');
  logger.error('This backend is designed to be called by the router, not directly by CLI');
  process.exit(1);
}

startHttpServer().catch((error) => {
  logger.error('Failed to start Google Marketing Backend', error);
  process.exit(1);
});
