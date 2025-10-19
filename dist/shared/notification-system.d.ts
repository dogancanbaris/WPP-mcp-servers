/**
 * Notification System
 * Dual-level notifications: Central admin (real-time) + Agency managers (hourly batches)
 */
/**
 * Notification types
 */
export declare enum NotificationType {
    BUDGET_CHANGE = "BUDGET_CHANGE",
    CAMPAIGN_STATUS_CHANGE = "CAMPAIGN_STATUS_CHANGE",
    BULK_OPERATION = "BULK_OPERATION",
    ROLLBACK = "ROLLBACK",
    ERROR = "ERROR",
    VAGUE_REQUEST_BLOCKED = "VAGUE_REQUEST_BLOCKED",
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"
}
/**
 * Notification priority
 */
export declare enum NotificationPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
/**
 * Notification
 */
export interface Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    timestamp: Date;
    userId: string;
    accountId: string;
    api: string;
    operation: string;
    message: string;
    details?: any;
    sentToCentral: boolean;
    sentToAgency: boolean;
    centralSentAt?: Date;
    agencySentAt?: Date;
}
/**
 * Notification configuration
 */
export interface NotificationConfig {
    centralAdmin: {
        email: string;
        realTime: boolean;
    };
    agencyManagers: Array<{
        email: string;
        accountIds: string[];
    }>;
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
}
/**
 * Notification system
 */
export declare class NotificationSystem {
    private config;
    private transporter;
    private pendingAgencyNotifications;
    private batchInterval;
    /**
     * Initialize notification system
     */
    initialize(config: NotificationConfig): Promise<void>;
    /**
     * Send notification
     */
    notify(notification: Omit<Notification, 'id' | 'timestamp' | 'sentToCentral' | 'sentToAgency'>): Promise<void>;
    /**
     * Send to central admin (real-time)
     */
    private sendToCentralAdmin;
    /**
     * Queue notification for agency managers
     */
    private queueForAgencyManagers;
    /**
     * Process agency manager batch (hourly)
     */
    private processAgencyBatch;
    /**
     * Send batch email to agency manager
     */
    private sendBatchToAgencyManager;
    /**
     * Build email subject
     */
    private buildSubject;
    /**
     * Build email body
     */
    private buildEmailBody;
    /**
     * Build HTML email body
     */
    private buildHtmlBody;
    /**
     * Build batch email body
     */
    private buildBatchEmailBody;
    /**
     * Build batch HTML email body
     */
    private buildBatchHtmlBody;
    /**
     * Start batch processing (hourly)
     */
    private startBatchProcessing;
    /**
     * Stop batch processing
     */
    stopBatchProcessing(): void;
    /**
     * Generate notification ID
     */
    private generateNotificationId;
    /**
     * Get pending notifications count
     */
    getPendingNotificationsCount(): number;
}
/**
 * Get notification system instance
 */
export declare function getNotificationSystem(): NotificationSystem;
/**
 * Helper to send notification
 */
export declare function sendNotification(params: {
    type: NotificationType;
    priority: NotificationPriority;
    userId: string;
    accountId: string;
    api: string;
    operation: string;
    message: string;
    details?: any;
}): Promise<void>;
//# sourceMappingURL=notification-system.d.ts.map