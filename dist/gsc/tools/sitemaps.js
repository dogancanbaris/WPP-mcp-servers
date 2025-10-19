/**
 * MCP Tools for Sitemaps operations
 */
import { getGoogleClient } from '../google-client.js';
import { getConfigManager } from '../config.js';
import { getAuditLogger } from '../audit.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder as NewDryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
const logger = getLogger('gsc.tools.sitemaps');
/**
 * List sitemaps tool
 */
export const listSitemapsTool = {
    name: 'list_sitemaps',
    description: 'List all submitted sitemaps for a property',
    inputSchema: {
        type: 'object',
        properties: {
            property: {
                type: 'string',
                description: 'Property URL (e.g., sc-domain:example.com)',
            },
        },
        required: ['property'],
    },
    async handler(input) {
        try {
            const { property } = input;
            // Validate input
            validateGSCProperty(property);
            const client = getGoogleClient();
            const audit = getAuditLogger();
            // Note: Access control removed for full property discovery mode
            // Google API will handle permission errors if user doesn't own the property
            logger.info('Listing sitemaps', { property });
            const response = await client.listSitemaps(property);
            const sitemaps = response.sitemap || [];
            const formatted = sitemaps.map((sitemap) => ({
                url: sitemap.path,
                lastSubmitted: sitemap.lastSubmitted,
                lastDownloaded: sitemap.lastDownloaded,
                errors: sitemap.errors || 0,
                warnings: sitemap.warnings || 0,
                contents: sitemap.contents || [],
            }));
            await audit.logReadOperation('user', 'list_sitemaps', property, {
                sitemapCount: sitemaps.length,
            });
            return {
                success: true,
                data: {
                    property,
                    sitemaps: formatted,
                    count: sitemaps.length,
                    message: `Found ${sitemaps.length} submitted sitemaps`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to list sitemaps', error);
            await getAuditLogger().logFailedOperation('user', 'list_sitemaps', input.property, error.message);
            throw error;
        }
    },
};
/**
 * Get sitemap details tool
 */
export const getSitemapTool = {
    name: 'get_sitemap',
    description: 'Get detailed information about a specific sitemap',
    inputSchema: {
        type: 'object',
        properties: {
            property: {
                type: 'string',
                description: 'Property URL',
            },
            sitemapUrl: {
                type: 'string',
                description: 'Sitemap URL',
            },
        },
        required: ['property', 'sitemapUrl'],
    },
    async handler(input) {
        try {
            const { property, sitemapUrl } = input;
            // Validate input
            validateGSCProperty(property);
            const client = getGoogleClient();
            const audit = getAuditLogger();
            // Note: Access control removed for full property discovery mode
            // Google API will handle permission errors if user doesn't own the property
            logger.info('Getting sitemap details', { property, sitemapUrl });
            const sitemap = await client.getSitemap(property, sitemapUrl);
            await audit.logReadOperation('user', 'get_sitemap', property, {
                sitemapUrl,
            });
            return {
                success: true,
                data: {
                    url: sitemap.path,
                    lastSubmitted: sitemap.lastSubmitted,
                    lastDownloaded: sitemap.lastDownloaded,
                    errors: sitemap.errors || 0,
                    warnings: sitemap.warnings || 0,
                    contents: sitemap.contents || [],
                },
            };
        }
        catch (error) {
            logger.error('Failed to get sitemap', error);
            await getAuditLogger().logFailedOperation('user', 'get_sitemap', input.property, error.message);
            throw error;
        }
    },
};
/**
 * Submit sitemap tool (WRITE)
 */
export const submitSitemapTool = {
    name: 'submit_sitemap',
    description: 'Submit a new sitemap to Google Search Console',
    inputSchema: {
        type: 'object',
        properties: {
            property: {
                type: 'string',
                description: 'Property URL',
            },
            sitemapUrl: {
                type: 'string',
                description: 'Full URL of the sitemap to submit',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['property', 'sitemapUrl'],
    },
    async handler(input) {
        try {
            const { property, sitemapUrl, confirmationToken } = input;
            // Validate input
            validateGSCProperty(property);
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'submit_sitemap',
                inputText: `submit sitemap ${sitemapUrl} to ${property}`,
                inputParams: { property, sitemapUrl },
            });
            const config = getConfigManager();
            const client = getGoogleClient();
            // Check permission
            if (!config.hasPermission('editor')) {
                throw new Error('Insufficient permissions for write operations');
            }
            logger.info('Submit sitemap requested', { property, sitemapUrl });
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new NewDryRunResultBuilder('submit_sitemap', 'Google Search Console', property);
            dryRunBuilder.addChange({
                resource: 'Sitemap',
                resourceId: sitemapUrl,
                field: 'status',
                currentValue: 'Not submitted',
                newValue: 'Submitted',
                changeType: 'create',
            });
            dryRunBuilder.addRecommendation('Verify sitemap is accessible and valid before submitting');
            dryRunBuilder.addRecommendation('Indexing may take hours or days - monitor in Search Console');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('submit_sitemap', 'Google Search Console', property, { sitemapUrl });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Sitemap submission requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Submitting sitemap with confirmation', { property, sitemapUrl });
            await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                await client.submitSitemap(property, sitemapUrl);
                await getAuditLogger().logWriteOperation('user', 'submit_sitemap', property, {
                    sitemapUrl,
                });
                return { property, sitemapUrl };
            });
            return {
                success: true,
                data: {
                    property,
                    sitemapUrl,
                    message: '✅ Sitemap submitted successfully',
                },
            };
        }
        catch (error) {
            logger.error('Failed to submit sitemap', error);
            await getAuditLogger().logFailedOperation('user', 'submit_sitemap', input.property, error.message);
            throw error;
        }
    },
};
/**
 * Delete sitemap tool (WRITE - DESTRUCTIVE)
 */
export const deleteSitemapTool = {
    name: 'delete_sitemap',
    description: 'Remove a sitemap from Google Search Console',
    inputSchema: {
        type: 'object',
        properties: {
            property: {
                type: 'string',
                description: 'Property URL',
            },
            sitemapUrl: {
                type: 'string',
                description: 'Sitemap URL to delete',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['property', 'sitemapUrl'],
    },
    async handler(input) {
        try {
            const { property, sitemapUrl, confirmationToken } = input;
            // Validate input
            validateGSCProperty(property);
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'delete_sitemap',
                inputText: `delete sitemap ${sitemapUrl} from ${property}`,
                inputParams: { property, sitemapUrl },
            });
            const config = getConfigManager();
            const client = getGoogleClient();
            // Check permission
            if (!config.hasPermission('admin')) {
                throw new Error('Only admins can delete sitemaps');
            }
            logger.warn('Delete sitemap requested', { property, sitemapUrl });
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new NewDryRunResultBuilder('delete_sitemap', 'Google Search Console', property);
            dryRunBuilder.addChange({
                resource: 'Sitemap',
                resourceId: sitemapUrl,
                field: 'status',
                currentValue: 'Submitted',
                newValue: 'Deleted',
                changeType: 'delete',
            });
            dryRunBuilder.addRisk('This removes the sitemap from Search Console tracking');
            dryRunBuilder.addRisk('Google may continue to use cached sitemap data temporarily');
            dryRunBuilder.addRecommendation('The sitemap file itself will NOT be deleted from your server');
            dryRunBuilder.addRecommendation('Consider if you really need to delete this sitemap');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('delete_sitemap', 'Google Search Console', property, { sitemapUrl });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'DESTRUCTIVE OPERATION: Sitemap deletion requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Deleting sitemap with confirmation', { property, sitemapUrl });
            await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                await client.deleteSitemap(property, sitemapUrl);
                await getAuditLogger().logWriteOperation('user', 'delete_sitemap', property, {
                    sitemapUrl,
                });
                return { property, sitemapUrl };
            });
            return {
                success: true,
                data: {
                    property,
                    sitemapUrl,
                    message: '✅ Sitemap deleted successfully',
                },
            };
        }
        catch (error) {
            logger.error('Failed to delete sitemap', error);
            await getAuditLogger().logFailedOperation('user', 'delete_sitemap', input.property, error.message);
            throw error;
        }
    },
};
//# sourceMappingURL=sitemaps.js.map