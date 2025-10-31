/**
 * Base GSC MCP Server Class
 *
 * Shared logic for both stdio and HTTP transports.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
const logger = getLogger('gsc.server-base');
/**
 * Base server class with shared logic
 */
export class GSCMCPServerBase {
    constructor() {
        this.authManager = null;
        this.initialized = false;
        // Load environment variables
        const envPath = path.join(process.cwd(), '.env');
        dotenv.config({ path: envPath });
        this.server = new Server({
            name: 'WPP Digital Marketing MCP',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
    }
    /**
     * Get the MCP server instance
     */
    getServer() {
        return this.server;
    }
    /**
     * Setup request handlers for tools
     */
    setupHandlers() {
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
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        });
        logger.info('Tool handlers registered', { toolCount: allTools.length });
    }
    /**
     * Initialize server (configuration, auth, API clients)
     */
    async initialize(options = {}) {
        if (this.initialized) {
            logger.debug('Server already initialized, skipping');
            return;
        }
        try {
            logger.info('Initializing GSC MCP Server');
            // Set log level
            const logLevel = (process.env.LOG_LEVEL || 'INFO');
            setGlobalLogLevel(logLevel);
            // Initialize configuration
            const config = getConfigManager();
            await config.load();
            logger.info('Configuration loaded', {
                properties: config.getSelectedProperties().length,
                role: config.getRole(),
            });
            // Initialize auth (skip if per-request OAuth mode)
            if (!options.skipOAuthInit) {
                const clientId = process.env.GOOGLE_CLIENT_ID;
                const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
                const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback';
                if (!clientId || !clientSecret) {
                    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
                }
                this.authManager = options.authManager || new GSCAuthManager(clientId, clientSecret, redirectUri);
                // Load existing tokens
                const tokens = await this.authManager.loadTokens();
                if (!tokens) {
                    throw new Error('OAuth tokens not found. Please run authentication setup first: npm run setup:auth');
                }
                logger.info('OAuth tokens loaded successfully');
                // Initialize Google Search Console client
                await initializeGoogleClient(this.authManager);
                logger.info('Google Search Console API client initialized');
                // Initialize Google Ads client
                const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
                if (developerToken && tokens.refreshToken) {
                    try {
                        const adsClient = initializeGoogleAdsClient(clientId, clientSecret, developerToken, tokens.refreshToken);
                        await adsClient.initialize();
                        logger.info('Google Ads API client initialized');
                    }
                    catch (error) {
                        logger.warn('Google Ads API initialization failed (optional)', error);
                    }
                }
                else {
                    logger.info('Google Ads API not configured (developer token missing)');
                }
                // Initialize Google Analytics client
                try {
                    const analyticsClient = initializeAnalyticsClient(this.authManager.getAuthenticatedClient());
                    await analyticsClient.initialize();
                    logger.info('Google Analytics API client initialized');
                }
                catch (error) {
                    logger.warn('Google Analytics API initialization failed (optional)', error);
                }
                // Google Business Profile uses OAuth per-request pattern
                logger.info('Google Business Profile API client uses per-request OAuth');
                // BigQuery uses OAuth per-request pattern
                logger.info('BigQuery API client uses per-request OAuth');
                // Initialize Bright Data SERP API client
                const brightDataApiKey = process.env.BRIGHT_DATA_API_KEY;
                if (brightDataApiKey) {
                    try {
                        const serpClient = initializeSerpApiClient(brightDataApiKey);
                        await serpClient.initialize();
                        logger.info('Bright Data SERP API client initialized');
                    }
                    catch (error) {
                        logger.warn('SERP API initialization failed (may need credits)', error);
                    }
                }
                else {
                    logger.info('Bright Data SERP API not configured (API key missing)');
                }
            }
            else {
                logger.info('Skipping OAuth initialization (per-request OAuth mode)');
            }
            // Initialize audit logger
            const audit = getAuditLogger(process.env.AUDIT_LOG_PATH, config.isAuditLoggingEnabled());
            await audit.logAuthenticationEvent('system', true, {
                server: 'GSC MCP initialized',
                version: '1.0.0',
            });
            // Setup tool handlers
            this.setupHandlers();
            this.initialized = true;
            logger.info('GSC MCP Server initialization complete');
        }
        catch (error) {
            logger.error('Failed to initialize server', error);
            // Log critical error
            try {
                await getAuditLogger().logAuthenticationEvent('system', false, {
                    error: error.message,
                });
            }
            catch {
                // Ignore audit logging errors on startup
            }
            throw error;
        }
    }
}
//# sourceMappingURL=server-base.js.map