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
export {};
//# sourceMappingURL=server.d.ts.map