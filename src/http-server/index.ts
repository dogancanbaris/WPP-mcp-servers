/**
 * HTTP Server Entry Point
 * Start MCP HTTP server for OMA integration
 */

import { startHttpServer } from './server.js';
import { getLogger } from '../shared/logger.js';
import { getNotificationSystem } from '../shared/notification-system.js';

const logger = getLogger('http-server.index');

/**
 * Main entry point
 */
async function main() {
  try {
    logger.info('Starting MCP HTTP server');

    // Load environment variables
    const port = parseInt(process.env.HTTP_PORT || '3000');
    const omaApiKey = process.env.OMA_API_KEY;
    const omaMcpSharedSecret = process.env.OMA_MCP_SHARED_SECRET;

    // Validate required environment variables
    if (!omaApiKey) {
      throw new Error('OMA_API_KEY environment variable is required');
    }

    if (!omaMcpSharedSecret) {
      throw new Error('OMA_MCP_SHARED_SECRET environment variable is required');
    }

    logger.info('Environment variables validated');

    // Initialize notification system if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const centralAdminEmail = process.env.CENTRAL_ADMIN_EMAIL;

    if (smtpHost && smtpUser && smtpPass && centralAdminEmail) {
      logger.info('Initializing notification system');

      const notificationSystem = getNotificationSystem();
      await notificationSystem.initialize({
        centralAdmin: {
          email: centralAdminEmail,
          realTime: process.env.CENTRAL_ADMIN_REALTIME === 'true',
        },
        agencyManagers: [], // Would be loaded from database in production
        smtp: {
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        },
      });

      logger.info('Notification system initialized');
    } else {
      logger.warn('Notification system not configured - emails will not be sent');
    }

    // Start HTTP server
    await startHttpServer(port);

    logger.info(`MCP HTTP server running on port ${port}`);
    logger.info('Ready to accept requests from OMA platform');

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start MCP HTTP server', error as Error);
    process.exit(1);
  }
}

// Start server
main();
