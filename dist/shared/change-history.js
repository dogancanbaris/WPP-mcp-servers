/**
 * Google Ads Change History Integration
 * Queries change_event API for verification and financial impact calculation
 */
import { getGoogleAdsClient } from '../ads/client.js';
import { getLogger } from './logger.js';
const logger = getLogger('shared.change-history');
/**
 * Change history manager
 */
export class ChangeHistoryManager {
    /**
     * Query change history for account
     */
    async queryChangeHistory(params) {
        logger.info('Querying change history', {
            customerId: params.customerId,
            startDate: params.startDate.toISOString(),
            endDate: params.endDate.toISOString(),
        });
        const client = getGoogleAdsClient();
        // Format dates for Google Ads API (YYYY-MM-DD HH:MM:SS)
        const startDateStr = this.formatDateTime(params.startDate);
        const endDateStr = this.formatDateTime(params.endDate);
        // Build query
        let query = `
      SELECT
        change_event.change_date_time,
        change_event.change_resource_type,
        change_event.change_resource_name,
        change_event.user_email,
        change_event.client_type,
        change_event.old_resource,
        change_event.new_resource,
        change_event.resource_change_operation,
        campaign.name,
        ad_group.name
      FROM change_event
      WHERE change_event.change_date_time >= '${startDateStr}'
        AND change_event.change_date_time <= '${endDateStr}'
    `;
        if (params.resourceType) {
            query += ` AND change_event.change_resource_type = '${params.resourceType}'`;
        }
        if (params.campaignId) {
            query += ` AND campaign.id = ${params.campaignId}`;
        }
        query += ` ORDER BY change_event.change_date_time DESC`;
        const events = [];
        try {
            const customer = client.getCustomer(params.customerId);
            const results = await customer.query(query);
            for (const row of results) {
                const event = {
                    changeDateTime: String(row.change_event?.change_date_time || ''),
                    changeResourceType: String(row.change_event?.change_resource_type || ''),
                    changeResourceName: String(row.change_event?.change_resource_name || ''),
                    userEmail: String(row.change_event?.user_email || ''),
                    clientType: String(row.change_event?.client_type || ''),
                    changeOperation: String(row.change_event?.resource_change_operation || ''),
                    oldValue: row.change_event?.old_resource,
                    newValue: row.change_event?.new_resource,
                    campaignName: row.campaign?.name || undefined,
                    adGroupName: row.ad_group?.name || undefined,
                };
                events.push(event);
            }
            logger.info('Change history retrieved', {
                customerId: params.customerId,
                totalEvents: events.length,
            });
            return {
                events,
                totalEvents: events.length,
                startDate: startDateStr,
                endDate: endDateStr,
            };
        }
        catch (error) {
            logger.error('Failed to query change history', error);
            throw new Error(`Failed to query change history: ${error.message}`);
        }
    }
    /**
     * Verify MCP operation against change history
     */
    async verifyOperation(params) {
        logger.info('Verifying operation against change history', {
            snapshotId: params.snapshotId,
            resourceType: params.resourceType,
        });
        // Query change history around operation time (±5 minutes)
        const startDate = new Date(params.operationTime.getTime() - 5 * 60 * 1000);
        const endDate = new Date(params.operationTime.getTime() + 5 * 60 * 1000);
        const history = await this.queryChangeHistory({
            customerId: params.customerId,
            startDate,
            endDate,
            resourceType: params.resourceType,
        });
        // Find matching change event
        const matchingEvent = history.events.find((event) => event.changeResourceName.includes(params.resourceName));
        if (matchingEvent) {
            logger.info('Operation verified in change history', {
                snapshotId: params.snapshotId,
                changeDateTime: matchingEvent.changeDateTime,
            });
            return {
                verified: true,
                changeEvent: matchingEvent,
                message: `Operation verified in Google Ads change history at ${matchingEvent.changeDateTime}`,
            };
        }
        else {
            logger.warn('Operation not found in change history', {
                snapshotId: params.snapshotId,
                operationTime: params.operationTime.toISOString(),
            });
            return {
                verified: false,
                message: 'Operation not found in Google Ads change history within ±5 minutes of operation time',
            };
        }
    }
    /**
     * Get changes for rollback context
     */
    async getChangesForRollback(params) {
        // Query changes since snapshot
        const history = await this.queryChangeHistory({
            customerId: params.customerId,
            startDate: params.snapshotTimestamp,
            endDate: new Date(),
            resourceType: params.resourceType,
        });
        // Filter to this specific resource
        const resourceChanges = history.events.filter((event) => event.changeResourceName.includes(params.resourceName));
        logger.info('Retrieved changes for rollback', {
            resourceType: params.resourceType,
            resourceName: params.resourceName,
            changesCount: resourceChanges.length,
        });
        return resourceChanges;
    }
    /**
     * Format change history as readable report
     */
    formatChangeHistoryReport(result) {
        let report = '\n📜 CHANGE HISTORY REPORT\n\n';
        report += `Period: ${result.startDate} to ${result.endDate}\n`;
        report += `Total events: ${result.totalEvents}\n\n`;
        if (result.events.length === 0) {
            report += 'No change events found in this period.\n';
            return report;
        }
        report += '📋 CHANGES:\n\n';
        result.events.forEach((event, i) => {
            report += `${i + 1}. ${event.changeDateTime}\n`;
            report += `   Type: ${event.changeResourceType}\n`;
            report += `   Operation: ${event.changeOperation}\n`;
            report += `   User: ${event.userEmail}\n`;
            report += `   Client: ${event.clientType}\n`;
            if (event.campaignName) {
                report += `   Campaign: ${event.campaignName}\n`;
            }
            if (event.adGroupName) {
                report += `   Ad Group: ${event.adGroupName}\n`;
            }
            report += `   Resource: ${event.changeResourceName}\n`;
            if (event.oldValue) {
                report += `   Old value: ${JSON.stringify(event.oldValue)}\n`;
            }
            if (event.newValue) {
                report += `   New value: ${JSON.stringify(event.newValue)}\n`;
            }
            report += '\n';
        });
        return report;
    }
    /**
     * Format date-time as YYYY-MM-DD HH:MM:SS
     */
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    /**
     * Get recent changes (convenience method)
     */
    async getRecentChanges(params) {
        const hoursAgo = params.hoursAgo || 24;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hoursAgo);
        return await this.queryChangeHistory({
            customerId: params.customerId,
            startDate,
            endDate,
        });
    }
}
// Singleton instance
let changeHistoryManagerInstance = null;
/**
 * Get change history manager instance
 */
export function getChangeHistoryManager() {
    if (!changeHistoryManagerInstance) {
        changeHistoryManagerInstance = new ChangeHistoryManager();
    }
    return changeHistoryManagerInstance;
}
/**
 * Helper to query and format change history
 */
export async function queryAndFormatChangeHistory(params) {
    const manager = getChangeHistoryManager();
    const result = await manager.queryChangeHistory(params);
    const report = manager.formatChangeHistoryReport(result);
    return { result, report };
}
//# sourceMappingURL=change-history.js.map