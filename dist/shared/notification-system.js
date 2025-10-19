/**
 * Notification System
 * Dual-level notifications: Central admin (real-time) + Agency managers (hourly batches)
 */
import nodemailer from 'nodemailer';
import { getLogger } from './logger.js';
const logger = getLogger('shared.notification-system');
/**
 * Notification types
 */
export var NotificationType;
(function (NotificationType) {
    NotificationType["BUDGET_CHANGE"] = "BUDGET_CHANGE";
    NotificationType["CAMPAIGN_STATUS_CHANGE"] = "CAMPAIGN_STATUS_CHANGE";
    NotificationType["BULK_OPERATION"] = "BULK_OPERATION";
    NotificationType["ROLLBACK"] = "ROLLBACK";
    NotificationType["ERROR"] = "ERROR";
    NotificationType["VAGUE_REQUEST_BLOCKED"] = "VAGUE_REQUEST_BLOCKED";
    NotificationType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
})(NotificationType || (NotificationType = {}));
/**
 * Notification priority
 */
export var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
    NotificationPriority["CRITICAL"] = "CRITICAL";
})(NotificationPriority || (NotificationPriority = {}));
/**
 * Notification system
 */
export class NotificationSystem {
    constructor() {
        this.config = null;
        this.transporter = null;
        this.pendingAgencyNotifications = [];
        this.batchInterval = null;
    }
    /**
     * Initialize notification system
     */
    async initialize(config) {
        this.config = config;
        // Create email transporter
        this.transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: {
                user: config.smtp.auth.user,
                pass: config.smtp.auth.pass,
            },
        });
        // Verify connection
        try {
            await this.transporter.verify();
            logger.info('Notification system initialized', {
                centralAdmin: config.centralAdmin.email,
                agencyManagers: config.agencyManagers.length,
            });
        }
        catch (error) {
            logger.error('Failed to initialize notification system', error);
            throw error;
        }
        // Start batch processing for agency managers (hourly)
        this.startBatchProcessing();
    }
    /**
     * Send notification
     */
    async notify(notification) {
        const fullNotification = {
            ...notification,
            id: this.generateNotificationId(),
            timestamp: new Date(),
            sentToCentral: false,
            sentToAgency: false,
        };
        logger.info('Sending notification', {
            type: notification.type,
            priority: notification.priority,
            operation: notification.operation,
        });
        // Send to central admin immediately if real-time is enabled
        if (this.config?.centralAdmin.realTime) {
            await this.sendToCentralAdmin(fullNotification);
        }
        // Queue for agency managers (hourly batch)
        this.queueForAgencyManagers(fullNotification);
    }
    /**
     * Send to central admin (real-time)
     */
    async sendToCentralAdmin(notification) {
        if (!this.config || !this.transporter) {
            logger.warn('Notification system not initialized');
            return;
        }
        const subject = this.buildSubject(notification);
        const body = this.buildEmailBody(notification);
        try {
            await this.transporter.sendMail({
                from: this.config.smtp.auth.user,
                to: this.config.centralAdmin.email,
                subject: `[${notification.priority}] ${subject}`,
                text: body,
                html: this.buildHtmlBody(notification),
            });
            notification.sentToCentral = true;
            notification.centralSentAt = new Date();
            logger.info('Notification sent to central admin', {
                notificationId: notification.id,
                email: this.config.centralAdmin.email,
            });
        }
        catch (error) {
            logger.error('Failed to send notification to central admin', error);
        }
    }
    /**
     * Queue notification for agency managers
     */
    queueForAgencyManagers(notification) {
        this.pendingAgencyNotifications.push(notification);
        logger.info('Notification queued for agency managers', {
            notificationId: notification.id,
            queueSize: this.pendingAgencyNotifications.length,
        });
    }
    /**
     * Process agency manager batch (hourly)
     */
    async processAgencyBatch() {
        if (this.pendingAgencyNotifications.length === 0) {
            logger.info('No pending agency notifications to send');
            return;
        }
        logger.info('Processing agency notification batch', {
            count: this.pendingAgencyNotifications.length,
        });
        if (!this.config || !this.transporter) {
            logger.warn('Notification system not initialized');
            return;
        }
        // Group notifications by agency manager
        const notificationsByManager = new Map();
        for (const notification of this.pendingAgencyNotifications) {
            // Find agency managers responsible for this account
            const managers = this.config.agencyManagers.filter((manager) => manager.accountIds.includes(notification.accountId));
            for (const manager of managers) {
                if (!notificationsByManager.has(manager.email)) {
                    notificationsByManager.set(manager.email, []);
                }
                notificationsByManager.get(manager.email).push(notification);
            }
        }
        // Send batch emails to each agency manager
        for (const [email, notifications] of notificationsByManager.entries()) {
            await this.sendBatchToAgencyManager(email, notifications);
        }
        // Clear pending notifications
        this.pendingAgencyNotifications = [];
    }
    /**
     * Send batch email to agency manager
     */
    async sendBatchToAgencyManager(email, notifications) {
        if (!this.transporter || !this.config)
            return;
        const subject = `WPP MCP - Hourly Activity Summary (${notifications.length} operations)`;
        const body = this.buildBatchEmailBody(notifications);
        try {
            await this.transporter.sendMail({
                from: this.config.smtp.auth.user,
                to: email,
                subject,
                text: body,
                html: this.buildBatchHtmlBody(notifications),
            });
            // Mark as sent
            const now = new Date();
            notifications.forEach((n) => {
                n.sentToAgency = true;
                n.agencySentAt = now;
            });
            logger.info('Batch notification sent to agency manager', {
                email,
                count: notifications.length,
            });
        }
        catch (error) {
            logger.error('Failed to send batch notification to agency manager', {
                email,
                error: error,
            });
        }
    }
    /**
     * Build email subject
     */
    buildSubject(notification) {
        const typeLabels = {
            [NotificationType.BUDGET_CHANGE]: 'Budget Change',
            [NotificationType.CAMPAIGN_STATUS_CHANGE]: 'Campaign Status Change',
            [NotificationType.BULK_OPERATION]: 'Bulk Operation',
            [NotificationType.ROLLBACK]: 'Rollback Executed',
            [NotificationType.ERROR]: 'Error',
            [NotificationType.VAGUE_REQUEST_BLOCKED]: 'Vague Request Blocked',
            [NotificationType.UNAUTHORIZED_ACCESS]: 'Unauthorized Access Attempt',
        };
        return `${typeLabels[notification.type]} - ${notification.accountId}`;
    }
    /**
     * Build email body
     */
    buildEmailBody(notification) {
        let body = `WPP MCP Notification\n\n`;
        body += `Type: ${notification.type}\n`;
        body += `Priority: ${notification.priority}\n`;
        body += `Timestamp: ${notification.timestamp.toISOString()}\n`;
        body += `User: ${notification.userId}\n`;
        body += `Account: ${notification.accountId}\n`;
        body += `API: ${notification.api}\n`;
        body += `Operation: ${notification.operation}\n\n`;
        body += `Message:\n${notification.message}\n\n`;
        if (notification.details) {
            body += `Details:\n${JSON.stringify(notification.details, null, 2)}\n`;
        }
        return body;
    }
    /**
     * Build HTML email body
     */
    buildHtmlBody(notification) {
        const priorityColors = {
            [NotificationPriority.LOW]: '#28a745',
            [NotificationPriority.MEDIUM]: '#ffc107',
            [NotificationPriority.HIGH]: '#fd7e14',
            [NotificationPriority.CRITICAL]: '#dc3545',
        };
        const color = priorityColors[notification.priority];
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .header { background-color: ${color}; color: white; padding: 15px; }
          .content { padding: 20px; }
          .details { background-color: #f4f4f4; padding: 10px; margin: 10px 0; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>WPP MCP Notification - ${notification.type}</h2>
        </div>
        <div class="content">
          <p><span class="label">Priority:</span> ${notification.priority}</p>
          <p><span class="label">Timestamp:</span> ${notification.timestamp.toISOString()}</p>
          <p><span class="label">User:</span> ${notification.userId}</p>
          <p><span class="label">Account:</span> ${notification.accountId}</p>
          <p><span class="label">API:</span> ${notification.api}</p>
          <p><span class="label">Operation:</span> ${notification.operation}</p>
          <div class="details">
            <p><span class="label">Message:</span></p>
            <p>${notification.message}</p>
          </div>
          ${notification.details ? `<div class="details"><pre>${JSON.stringify(notification.details, null, 2)}</pre></div>` : ''}
        </div>
      </body>
      </html>
    `;
    }
    /**
     * Build batch email body
     */
    buildBatchEmailBody(notifications) {
        let body = `WPP MCP - Hourly Activity Summary\n\n`;
        body += `Total operations: ${notifications.length}\n`;
        body += `Time range: ${notifications[0].timestamp.toISOString()} to ${notifications[notifications.length - 1].timestamp.toISOString()}\n\n`;
        // Group by type
        const byType = new Map();
        notifications.forEach((n) => {
            byType.set(n.type, (byType.get(n.type) || 0) + 1);
        });
        body += `Operations by type:\n`;
        byType.forEach((count, type) => {
            body += `  - ${type}: ${count}\n`;
        });
        body += `\n\nDetailed Operations:\n\n`;
        notifications.forEach((notification, i) => {
            body += `${i + 1}. [${notification.priority}] ${notification.type}\n`;
            body += `   Time: ${notification.timestamp.toISOString()}\n`;
            body += `   User: ${notification.userId}\n`;
            body += `   Account: ${notification.accountId}\n`;
            body += `   Operation: ${notification.operation}\n`;
            body += `   Message: ${notification.message}\n\n`;
        });
        return body;
    }
    /**
     * Build batch HTML email body
     */
    buildBatchHtmlBody(notifications) {
        const rows = notifications
            .map((n, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${n.timestamp.toLocaleString()}</td>
          <td><span class="badge badge-${n.priority.toLowerCase()}">${n.priority}</span></td>
          <td>${n.type}</td>
          <td>${n.accountId}</td>
          <td>${n.operation}</td>
          <td>${n.message}</td>
        </tr>
      `)
            .join('');
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .header { background-color: #007bff; color: white; padding: 15px; }
          .content { padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .badge { padding: 3px 8px; border-radius: 3px; color: white; }
          .badge-critical { background-color: #dc3545; }
          .badge-high { background-color: #fd7e14; }
          .badge-medium { background-color: #ffc107; }
          .badge-low { background-color: #28a745; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>WPP MCP - Hourly Activity Summary</h2>
          <p>${notifications.length} operations</p>
        </div>
        <div class="content">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Priority</th>
                <th>Type</th>
                <th>Account</th>
                <th>Operation</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    }
    /**
     * Start batch processing (hourly)
     */
    startBatchProcessing() {
        // Process every hour
        this.batchInterval = setInterval(() => {
            this.processAgencyBatch();
        }, 60 * 60 * 1000); // 1 hour
        logger.info('Agency notification batch processing started (hourly)');
    }
    /**
     * Stop batch processing
     */
    stopBatchProcessing() {
        if (this.batchInterval) {
            clearInterval(this.batchInterval);
            this.batchInterval = null;
            logger.info('Agency notification batch processing stopped');
        }
    }
    /**
     * Generate notification ID
     */
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get pending notifications count
     */
    getPendingNotificationsCount() {
        return this.pendingAgencyNotifications.length;
    }
}
// Singleton instance
let notificationSystemInstance = null;
/**
 * Get notification system instance
 */
export function getNotificationSystem() {
    if (!notificationSystemInstance) {
        notificationSystemInstance = new NotificationSystem();
    }
    return notificationSystemInstance;
}
/**
 * Helper to send notification
 */
export async function sendNotification(params) {
    const system = getNotificationSystem();
    await system.notify(params);
}
//# sourceMappingURL=notification-system.js.map