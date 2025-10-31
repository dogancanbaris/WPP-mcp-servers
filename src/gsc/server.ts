#!/usr/bin/env node

/**
 * GSC MCP Server - Main Entry Point
 *
 * Routes to HTTP or Stdio transport based on MCP_TRANSPORT environment variable.
 * Default: HTTP (for external agent connections)
 */

/**
 * NOTE: This file now serves as a router to select the appropriate transport.
 *
 * - MCP_TRANSPORT=http (default) → HTTP server for external connections
 * - MCP_TRANSPORT=stdio → Stdio server for local CLI usage
 *
 * The actual implementations are in:
 * - src/gsc/server-http.ts (HTTP with OAuth per-request)
 * - src/gsc/server-stdio.ts (Stdio with stored tokens)
 */

import { getLogger } from '../shared/logger.js';

const logger = getLogger('gsc.server');

const transport = process.env.MCP_TRANSPORT || 'http';

logger.info(`Starting GSC MCP Server with ${transport.toUpperCase()} transport`);

if (transport === 'stdio') {
  // Start stdio server for CLI
  import('./server-stdio.js').catch((error) => {
    logger.error('Failed to start stdio server', error);
    process.exit(1);
  });
} else if (transport === 'http') {
  // Start HTTP server for external connections (default)
  import('./server-http.js').catch((error) => {
    logger.error('Failed to start HTTP server', error);
    process.exit(1);
  });
} else {
  logger.error(`Unknown transport: ${transport}. Use 'http' or 'stdio'`);
  process.exit(1);
}
