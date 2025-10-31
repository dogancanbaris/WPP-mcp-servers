#!/usr/bin/env node

/**
 * GSC MCP Server - Stdio Transport
 *
 * Original stdio-based server for local CLI usage (Claude Code CLI).
 * This is kept as a backup/alternative for local development.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getLogger } from '../shared/logger.js';
import { GSCMCPServerBase } from './server-base.js';

const logger = getLogger('gsc.server-stdio');

/**
 * Stdio MCP Server for Claude Code CLI
 */
class GSCMCPStdioServer extends GSCMCPServerBase {
  /**
   * Start the stdio server
   */
  async start(): Promise<void> {
    try {
      // Initialize base server (with OAuth from .env tokens)
      await this.initialize({ skipOAuthInit: false });

      // Start server with STDIO transport
      const transport = new StdioServerTransport();
      await this.getServer().connect(transport);

      logger.info('GSC MCP Server started and listening on STDIO');
      logger.info('This server is for local CLI usage only');
    } catch (error) {
      logger.error('Failed to start stdio server', error as Error);
      process.exit(1);
    }
  }
}

/**
 * Start the server
 */
async function main(): Promise<void> {
  const server = new GSCMCPStdioServer();
  await server.start();
}

// Run the server
main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
