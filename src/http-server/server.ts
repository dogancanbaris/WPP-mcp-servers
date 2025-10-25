/**
 * HTTP Server for OMA Integration
 * Provides REST API endpoints for OMA platform to execute MCP tools
 */

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getLogger } from '../shared/logger.js';
import { AccountAuthorizationManager } from '../shared/account-authorization.js';
import { getSnapshotManager } from '../shared/snapshot-manager.js';
import { allTools } from '../gsc/tools/index.js';

const logger = getLogger('http-server');

/**
 * HTTP server for MCP operations
 */
export class MCPHttpServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: process.env.OMA_ORIGIN || '*',
      credentials: true,
    }));

    // Body parser
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      logger.info('HTTP request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
      next();
    });

    // Authentication middleware
    this.app.use(this.authenticateRequest.bind(this));

    // Error handling
    this.app.use(this.errorHandler.bind(this));
  }

  /**
   * Authenticate OMA API requests
   */
  private async authenticateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip health check
    if (req.path === '/health') {
      return next();
    }

    // Get OMA API key from header
    const apiKey = req.headers['x-oma-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'Missing OMA API key',
        message: 'X-OMA-API-Key header is required',
      });
      return;
    }

    // Verify API key
    const expectedKey = process.env.OMA_API_KEY;

    if (!expectedKey) {
      logger.error('OMA_API_KEY not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
      return;
    }

    if (apiKey !== expectedKey) {
      logger.warn('Invalid OMA API key', { ip: req.ip });
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
      });
      return;
    }

    // CRITICAL: Extract user's Google OAuth tokens from headers
    const authHeader = req.headers['authorization'] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Missing OAuth access token',
        message: 'Authorization: Bearer <access-token> header is required for Google API access',
      });
      return;
    }

    // Extract and validate OAuth access token
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!accessToken || accessToken.length < 20) {
      res.status(401).json({
        success: false,
        error: 'Invalid OAuth token format',
        message: 'OAuth access token appears to be malformed',
      });
      return;
    }

    // Extract refresh token (required for Google Ads API)
    const refreshToken = req.headers['x-google-refresh-token'] as string;

    // Store OAuth tokens in request for tool execution
    (req as any).userOAuthToken = accessToken;
    (req as any).userRefreshToken = refreshToken; // May be undefined for non-Ads tools

    logger.debug('OAuth tokens extracted from request', {
      accessTokenPrefix: accessToken.substring(0, 10) + '...',
      accessTokenLength: accessToken.length,
      hasRefreshToken: !!refreshToken
    });

    // Load approved accounts from request
    const encryptedAccounts = req.headers['x-oma-approved-accounts'] as string;
    const accountsSignature = req.headers['x-oma-accounts-signature'] as string;

    if (encryptedAccounts && accountsSignature) {
      try {
        const authManager = new AccountAuthorizationManager();
        await authManager.loadFromEncrypted(encryptedAccounts, accountsSignature);

        // Store in request for use in route handlers
        (req as any).accountAuthManager = authManager;
      } catch (error) {
        logger.error('Failed to load approved accounts', error as Error);
        res.status(400).json({
          success: false,
          error: 'Invalid approved accounts data',
          message: (error as Error).message,
        });
        return;
      }
    }

    next();
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    // List tools
    this.app.get('/mcp/tools/list', this.listTools.bind(this));

    // Execute tool
    this.app.post('/mcp/execute-tool', this.executeTool.bind(this));

    // Confirm operation
    this.app.post('/mcp/confirm-operation', this.confirmOperation.bind(this));

    // Rollback operation
    this.app.post('/mcp/rollback', this.rollbackOperation.bind(this));

    // Get snapshots for account
    this.app.get('/mcp/snapshots/:accountId', this.getSnapshots.bind(this));

    // Get snapshot details
    this.app.get('/mcp/snapshot/:snapshotId', this.getSnapshotDetails.bind(this));
  }

  /**
   * List available tools
   */
  private async listTools(_req: Request, res: Response): Promise<void> {
    try {
      const tools = allTools.map((tool) => ({
        name: tool.name,
        description: tool.description.split('\n\n')[0], // First paragraph only
        inputSchema: tool.inputSchema,
      }));

      res.json({
        success: true,
        tools,
        count: tools.length,
      });
    } catch (error) {
      logger.error('Failed to list tools', error as Error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Execute MCP tool
   */
  private async executeTool(req: Request, res: Response): Promise<void> {
    try {
      const { toolName, input, userId, confirmationToken } = req.body;

      if (!toolName || !input) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: toolName, input',
        });
        return;
      }

      logger.info('Executing tool', { toolName, userId, hasConfirmation: !!confirmationToken });

      // Find tool
      const tool = allTools.find((t) => t.name === toolName);

      if (!tool) {
        res.status(404).json({
          success: false,
          error: `Tool not found: ${toolName}`,
        });
        return;
      }

      // Get OAuth tokens and account authorization manager from request
      const accessToken = (req as any).userOAuthToken as string;
      const refreshToken = (req as any).userRefreshToken as string | undefined;
      const authManager = (req as any).accountAuthManager as AccountAuthorizationManager;

      // Set globally for tool execution (tools will use getAccountAuthorizationManager())
      if (authManager) {
        const { setAccountAuthorizationManager } = await import('../shared/account-authorization.js');
        setAccountAuthorizationManager(authManager);
      }

      // Add OAuth tokens to input for tool execution
      const inputWithOAuth = {
        ...input,
        __oauthToken: accessToken, // Access token for most Google APIs
        __refreshToken: refreshToken, // Refresh token for Google Ads API
      };

      // Execute tool handler with OAuth tokens
      const result = await tool.handler(inputWithOAuth);

      res.json({
        success: true,
        toolName,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Tool execution failed', error as Error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      });
    }
  }

  /**
   * Confirm pending operation
   */
  private async confirmOperation(req: Request, res: Response): Promise<void> {
    try {
      const { confirmationToken, toolName, input } = req.body;

      if (!confirmationToken || !toolName || !input) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: confirmationToken, toolName, input',
        });
        return;
      }

      logger.info('Confirming operation', { confirmationToken, toolName });

      // Add confirmation token to input and re-execute
      const inputWithToken = { ...input, confirmationToken };

      // Find and execute tool
      const tool = allTools.find((t) => t.name === toolName);

      if (!tool) {
        res.status(404).json({
          success: false,
          error: `Tool not found: ${toolName}`,
        });
        return;
      }

      const result = await tool.handler(inputWithToken);

      res.json({
        success: true,
        confirmed: true,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Operation confirmation failed', error as Error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Rollback operation
   */
  private async rollbackOperation(req: Request, res: Response): Promise<void> {
    try {
      const { snapshotId, userId } = req.body;

      if (!snapshotId) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: snapshotId',
        });
        return;
      }

      logger.info('Rolling back operation', { snapshotId, userId });

      const snapshotManager = getSnapshotManager();
      const snapshot = await snapshotManager.getSnapshot(snapshotId);

      if (!snapshot) {
        res.status(404).json({
          success: false,
          error: `Snapshot not found: ${snapshotId}`,
        });
        return;
      }

      // Rollback depends on resource type - would need specific rollback logic per tool
      // For now, return snapshot info and let caller decide
      res.json({
        success: true,
        message: 'Rollback capability available - implement specific rollback logic per resource type',
        snapshot: {
          snapshotId: snapshot.snapshotId,
          operation: snapshot.operation,
          resourceType: snapshot.resourceType,
          resourceId: snapshot.resourceId,
          beforeState: snapshot.beforeState,
          afterState: snapshot.afterState,
          financialImpact: snapshot.financialImpact,
        },
      });
    } catch (error) {
      logger.error('Rollback failed', error as Error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get snapshots for account
   */
  private async getSnapshots(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { limit, startDate, endDate, operation } = req.query;

      logger.info('Getting snapshots', { accountId, limit, startDate, endDate, operation });

      const snapshotManager = getSnapshotManager();

      const snapshots = await snapshotManager.getSnapshotsForAccount(accountId, {
        limit: limit ? parseInt(limit as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        operation: operation as string | undefined,
      });

      res.json({
        success: true,
        accountId,
        snapshots: snapshots.map((s) => ({
          snapshotId: s.snapshotId,
          operation: s.operation,
          timestamp: s.timestamp,
          resourceType: s.resourceType,
          resourceId: s.resourceId,
          executedAt: s.executedAt,
          rolledBackAt: s.rolledBackAt,
          rollbackSuccessful: s.rollbackSuccessful,
        })),
        count: snapshots.length,
      });
    } catch (error) {
      logger.error('Failed to get snapshots', error as Error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get snapshot details
   */
  private async getSnapshotDetails(req: Request, res: Response): Promise<void> {
    try {
      const { snapshotId } = req.params;

      logger.info('Getting snapshot details', { snapshotId });

      const snapshotManager = getSnapshotManager();
      const snapshot = await snapshotManager.getSnapshot(snapshotId);

      if (!snapshot) {
        res.status(404).json({
          success: false,
          error: `Snapshot not found: ${snapshotId}`,
        });
        return;
      }

      res.json({
        success: true,
        snapshot,
      });
    } catch (error) {
      logger.error('Failed to get snapshot details', error as Error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Error handler
   */
  private errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    logger.error('HTTP server error', err);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        logger.info(`MCP HTTP server started on port ${this.port}`);
        resolve();
      });
    });
  }
}

/**
 * Create and start HTTP server
 */
export async function startHttpServer(port?: number): Promise<MCPHttpServer> {
  const server = new MCPHttpServer(port);
  await server.start();
  return server;
}
