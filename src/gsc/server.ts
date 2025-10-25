#!/usr/bin/env node

/**
 * Google Search Console MCP Server
 *
 * This is the main entry point for the MCP server that provides tools
 * for interacting with Google Search Console API.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { getLogger, setGlobalLogLevel } from '../shared/logger.js';
import { GSCAuthManager } from './auth.js';
import { getConfigManager } from './config.js';
import { getAuditLogger } from './audit.js';
import { initializeGoogleClient } from './google-client.js';
import { initializeGoogleAdsClient } from '../ads/client.js';
import { initializeAnalyticsClient } from '../analytics/client.js';
import { initializeSerpApiClient } from '../serp/client.js';
import { allTools } from './tools/index.js';

const logger = getLogger('gsc.server');

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

/**
 * Main server class
 */
class GSCMCPServer {
  private server: Server;
  private authManager: GSCAuthManager | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'WPP Digital Marketing MCP',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  /**
   * Setup request handlers for tools
   */
  private setupHandlers(): void {
    // Register tools list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Listing available tools');
      return {
        tools: allTools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Register tool execution handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: toolArgs } = request.params;

      logger.info('Tool called', { toolName: name });

      // Find the tool
      const tool = allTools.find((t) => t.name === name);

      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      // Execute the tool
      const result = await tool.handler(toolArgs);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    });

    logger.info('Tool handlers registered', { toolCount: allTools.length });
  }

  /**
   * Initialize and start the server
   */
  async start(): Promise<void> {
    try {
      logger.info('Starting GSC MCP Server');

      // Set log level
      const logLevel = (process.env.LOG_LEVEL || 'INFO') as any;
      setGlobalLogLevel(logLevel);

      // Initialize configuration
      const config = getConfigManager();
      await config.load();

      logger.info('Configuration loaded', {
        properties: config.getSelectedProperties().length,
        role: config.getRole(),
      });

      // Initialize auth
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback';

      if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
      }

      this.authManager = new GSCAuthManager(clientId, clientSecret, redirectUri);

      // Load existing tokens
      const tokens = await this.authManager.loadTokens();

      if (!tokens) {
        throw new Error(
          'OAuth tokens not found. Please run authentication setup first: npm run setup:auth'
        );
      }

      logger.info('OAuth tokens loaded successfully');

      // Initialize Google Search Console client
      await initializeGoogleClient(this.authManager);

      logger.info('Google Search Console API client initialized');

      // Initialize Google Ads client
      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (developerToken && tokens.refreshToken) {
        try {
          const adsClient = initializeGoogleAdsClient(
            clientId,
            clientSecret,
            developerToken,
            tokens.refreshToken
          );
          await adsClient.initialize();
          logger.info('Google Ads API client initialized');
        } catch (error) {
          logger.warn('Google Ads API initialization failed (optional)', error as Error);
          // Don't fail startup if Google Ads isn't configured
        }
      } else {
        logger.info('Google Ads API not configured (developer token missing)');
      }

      // Initialize Google Analytics client
      try {
        const analyticsClient = initializeAnalyticsClient(this.authManager.getAuthenticatedClient());
        await analyticsClient.initialize();
        logger.info('Google Analytics API client initialized');
      } catch (error) {
        logger.warn('Google Analytics API initialization failed (optional)', error as Error);
        // Don't fail startup if Analytics isn't configured
      }

      // Google Business Profile now uses OAuth per-request pattern (no global initialization needed)
      logger.info('Google Business Profile API client uses per-request OAuth');

      // BigQuery now uses OAuth per-request pattern (no global initialization needed)
      logger.info('BigQuery API client uses per-request OAuth');

      // Initialize Bright Data SERP API client
      const brightDataApiKey = process.env.BRIGHT_DATA_API_KEY;
      if (brightDataApiKey) {
        try {
          const serpClient = initializeSerpApiClient(brightDataApiKey);
          await serpClient.initialize();
          logger.info('Bright Data SERP API client initialized');
        } catch (error) {
          logger.warn('SERP API initialization failed (may need credits)', error as Error);
        }
      } else {
        logger.info('Bright Data SERP API not configured (API key missing)');
      }

      // Initialize audit logger
      const audit = getAuditLogger(
        process.env.AUDIT_LOG_PATH,
        config.isAuditLoggingEnabled()
      );

      await audit.logAuthenticationEvent('system', true, {
        server: 'GSC MCP started',
        version: '1.0.0',
      });

      // Setup tool handlers before connecting
      this.setupHandlers();

      // Start server with STDIO transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      logger.info('GSC MCP Server started and listening on STDIO');
    } catch (error) {
      logger.error('Failed to start server', error as Error);

      // Log critical error
      try {
        await getAuditLogger().logAuthenticationEvent('system', false, {
          error: (error as Error).message,
        });
      } catch {
        // Ignore audit logging errors on startup
      }

      process.exit(1);
    }
  }
}

/**
 * Start the server
 */
async function main(): Promise<void> {
  const server = new GSCMCPServer();
  await server.start();
}

// Run the server
main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
