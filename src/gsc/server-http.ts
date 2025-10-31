#!/usr/bin/env node

/**
 * GSC MCP Server - HTTP Transport
 *
 * External HTTP server for agent connections with OAuth per-request authentication.
 * Uses StreamableHTTPServerTransport from MCP SDK for native MCP protocol over HTTP.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

import { getLogger } from '../shared/logger.js';
import { GSCMCPServerBase } from './server-base.js';
import { createOAuthValidator, AuthenticatedRequest } from './middleware/oauth-validator.js';

const logger = getLogger('gsc.server-http');

interface TransportMap {
  [sessionId: string]: StreamableHTTPServerTransport;
}

/**
 * HTTP MCP Server with StreamableHTTPServerTransport
 */
class GSCMCPHttpServer extends GSCMCPServerBase {
  private app: express.Application;
  private transports: TransportMap = {};
  private port: number;
  private enableBypass: boolean;

  constructor(port: number = 3000, enableBypass: boolean = false) {
    super();
    this.port = port;
    this.enableBypass = enableBypass;
    this.app = express();
    this.setupMiddleware();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Parse JSON bodies
    this.app.use(express.json());

    // Configure CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
    this.app.use(cors({
      origin: allowedOrigins,
      exposedHeaders: ['Mcp-Session-Id'],
      credentials: true
    }));

    // OAuth validation middleware (with bypass mode)
    const oauth = createOAuthValidator({
      enableBypass: this.enableBypass,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    });

    // Apply OAuth to all MCP endpoints
    this.app.use('/mcp', oauth as any);

    // Health check endpoint (no auth required)
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        version: '1.0.0',
        transport: 'streamable-http',
        timestamp: new Date().toISOString()
      });
    });

    // MCP endpoint handler (GET, POST, DELETE)
    this.app.all('/mcp', this.handleMcpRequest.bind(this));

    logger.info('Express middleware configured', {
      allowedOrigins,
      bypassMode: this.enableBypass
    });
  }

  /**
   * Handle MCP requests (StreamableHTTPServerTransport protocol)
   */
  private async handleMcpRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    logger.debug(`Received ${req.method} request to /mcp`);

    try {
      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport | undefined;

      if (sessionId && this.transports[sessionId]) {
        // Reuse existing transport for this session
        transport = this.transports[sessionId];
        logger.debug(`Reusing transport for session ${sessionId}`);
      } else if (!sessionId && req.method === 'POST' && isInitializeRequest(req.body)) {
        // Create new transport for initialization request
        logger.info('Creating new MCP session');

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true, // Support JSON responses (not just SSE)
          onsessioninitialized: (newSessionId: string) => {
            // Store the transport by session ID
            logger.info(`MCP session initialized with ID: ${newSessionId}`);
            this.transports[newSessionId] = transport!;
          }
        });

        // Set up onclose handler to clean up transport
        transport.onclose = () => {
          const sid = transport!.sessionId;
          if (sid && this.transports[sid]) {
            logger.info(`Transport closed for session ${sid}`);
            delete this.transports[sid];
          }
        };

        // Connect the transport to the MCP server
        await this.getServer().connect(transport);
        logger.info('Transport connected to MCP server');
      } else {
        // Invalid request
        logger.warn('Invalid MCP request', {
          method: req.method,
          hasSessionId: !!sessionId,
          isInit: req.method === 'POST' && isInitializeRequest(req.body)
        });

        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided or not an initialization request'
          },
          id: null
        });
        return;
      }

      // Handle the request with the transport
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error('Error handling MCP request', error as Error);

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error: ' + (error as Error).message
          },
          id: null
        });
      }
    }
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    try {
      // Initialize base server (skip OAuth init for per-request mode)
      await this.initialize({ skipOAuthInit: true });

      // Start Express server
      await new Promise<void>((resolve, reject) => {
        const server = this.app.listen(this.port, () => {
          logger.info(`GSC MCP HTTP Server started on port ${this.port}`);
          logger.info(`
==============================================
MCP SERVER READY FOR EXTERNAL CONNECTIONS

Endpoint: http://localhost:${this.port}/mcp
Protocol: Streamable HTTP (MCP 2025-03-26)
Methods: GET, POST, DELETE

Health Check: http://localhost:${this.port}/health

Authentication:
${this.enableBypass ? '  - Bypass Mode: ENABLED (X-Dev-Bypass: true)' : '  - Bypass Mode: DISABLED'}
  - OAuth: Authorization: Bearer {token}

Usage:
  1. Initialize: POST /mcp (with initialize request)
  2. Establish SSE: GET /mcp (with Mcp-Session-Id header)
  3. Send requests: POST /mcp (with Mcp-Session-Id header)
  4. Terminate: DELETE /mcp (with Mcp-Session-Id header)

Active Sessions: ${Object.keys(this.transports).length}
==============================================
          `);
          resolve();
        });

        server.on('error', (error: Error) => {
          logger.error('Failed to start HTTP server', error);
          reject(error);
        });
      });

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        logger.info('Shutting down server...');

        // Close all active transports
        for (const sessionId in this.transports) {
          try {
            logger.info(`Closing transport for session ${sessionId}`);
            await this.transports[sessionId].close();
            delete this.transports[sessionId];
          } catch (error) {
            logger.error(`Error closing transport for session ${sessionId}`, error as Error);
          }
        }

        logger.info('Server shutdown complete');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Failed to start HTTP server', error as Error);
      process.exit(1);
    }
  }
}

/**
 * Start the server
 */
async function main(): Promise<void> {
  const port = parseInt(process.env.HTTP_PORT || '3000', 10);
  const enableBypass = process.env.ENABLE_DEV_BYPASS === 'true';

  if (enableBypass) {
    logger.warn('⚠️  DEVELOPMENT MODE: OAuth bypass enabled!');
    logger.warn('⚠️  This should NEVER be used in production!');
  }

  const server = new GSCMCPHttpServer(port, enableBypass);
  await server.start();
}

// Run the server
main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
