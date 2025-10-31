/**
 * HTTP Client for calling backend MCP servers
 */

import { getLogger } from '../shared/logger.js';
import type { JsonRpcRequest, JsonRpcResponse } from './types.js';

const logger = getLogger('router.http-client');

export class McpHttpClient {
  private requestId = 0;

  /**
   * Call a backend MCP server via HTTP
   */
  async call(
    backendUrl: string,
    method: string,
    params?: any,
    timeout: number = 30000
  ): Promise<any> {
    this.requestId++;

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: this.requestId,
      method,
      params,
    };

    logger.debug(`Calling backend`, { backendUrl, method, params });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream', // Required by StreamableHTTPServerTransport
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend HTTP error: ${response.status} ${response.statusText}`);
      }

      const jsonResponse = (await response.json()) as JsonRpcResponse;

      if (jsonResponse.error) {
        logger.error(`Backend returned error`, {
          backendUrl,
          method,
          error: jsonResponse.error,
        });
        throw new Error(`Backend error: ${jsonResponse.error.message}`);
      }

      logger.debug(`Backend call successful`, { backendUrl, method });

      return jsonResponse.result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          logger.error(`Backend call timed out`, { backendUrl, method, timeout });
          throw new Error(`Backend call timed out after ${timeout}ms`);
        }
        logger.error(`Backend call failed`, { backendUrl, method, error: error.message });
      }
      throw error;
    }
  }

  /**
   * Check if backend is healthy
   */
  async healthCheck(backendUrl: string, timeout: number = 5000): Promise<boolean> {
    try {
      const startTime = Date.now();

      // Try to call tools/list as health check
      await this.call(backendUrl, 'tools/list', undefined, timeout);

      const responseTime = Date.now() - startTime;
      logger.info(`Backend health check passed`, { backendUrl, responseTime });

      return true;
    } catch (error) {
      logger.warn(`Backend health check failed`, {
        backendUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
