/**
 * MCP Tools for Sitemaps operations
 */
import { extractOAuthToken, createGSCClient } from '../../shared/oauth-client-factory.js';
import { getConfigManager } from '../config.js';
import { getAuditLogger } from '../audit.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder as NewDryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps } from '../../shared/interactive-workflow.js';
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
        required: [],
    },
    async handler(input) {
        try {
            const { property } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Search Console API access');
            }
            // Create GSC client with user's OAuth token
            const gscClient = createGSCClient(oauthToken);
            // Property discovery
            if (!property) {
                const res = await gscClient.sites.list();
                const sites = res.data.siteEntry || [];
                return formatDiscoveryResponse({
                    step: '1/1',
                    title: 'SELECT PROPERTY',
                    items: sites.map(s => ({ url: s.siteUrl })),
                    itemFormatter: (s, i) => `${i + 1}. ${s.url}`,
                    prompt: 'Which property\'s sitemaps?',
                    nextParam: 'property',
                });
            }
            // Validate input
            validateGSCProperty(property);
            const audit = getAuditLogger();
            // Note: Access control removed for full property discovery mode
            // Google API will handle permission errors if user doesn't own the property
            logger.info('Listing sitemaps', { property });
            const res = await gscClient.sitemaps.list({ siteUrl: property });
            const response = res.data;
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
            return injectGuidance({ property, sitemaps: formatted, count: sitemaps.length }, `🗺️ SITEMAPS FOR ${property}

Found ${sitemaps.length} submitted sitemap(s)

${formatted.map((s, i) => `${i + 1}. ${s.url}
   Last submitted: ${s.lastSubmitted || 'N/A'}
   Errors: ${s.errors} | Warnings: ${s.warnings}`).join('\n\n')}

${formatNextSteps(['Submit new: use submit_sitemap', 'Get details: use get_sitemap', 'Check indexing: use inspect_url'])}`);
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
        required: [],
    },
    async handler(input) {
        try {
            const { property, sitemapUrl } = input;
            // Extract OAuth token
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken)
                throw new Error('OAuth token required for Google Search Console API access');
            const gscClient = createGSCClient(oauthToken);
            // Property discovery
            if (!property) {
                const res = await gscClient.sites.list();
                const sites = res.data.siteEntry || [];
                return formatDiscoveryResponse({
                    step: '1/2',
                    title: 'SELECT PROPERTY',
                    items: sites.map(s => ({ url: s.siteUrl })),
                    itemFormatter: (s, i) => `${i + 1}. ${s.url}`,
                    prompt: 'Which property?',
                    nextParam: 'property',
                });
            }
            // Sitemap URL discovery
            if (!sitemapUrl) {
                const res = await gscClient.sitemaps.list({ siteUrl: property });
                const sitemaps = res.data.sitemap || [];
                return formatDiscoveryResponse({
                    step: '2/2',
                    title: 'SELECT SITEMAP',
                    items: sitemaps,
                    itemFormatter: (s, i) => `${i + 1}. ${s.path}`,
                    prompt: 'Which sitemap?',
                    nextParam: 'sitemapUrl',
                    context: { property },
                });
            }
            // Validate input
            validateGSCProperty(property);
            const audit = getAuditLogger();
            // Note: Access control removed for full property discovery mode
            // Google API will handle permission errors if user doesn't own the property
            logger.info('Getting sitemap details', { property, sitemapUrl });
            const res = await gscClient.sitemaps.get({ siteUrl: property, feedpath: sitemapUrl });
            const sitemap = res.data;
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
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Search Console API access');
            }
            // Create GSC client with user's OAuth token
            const gscClient = createGSCClient(oauthToken);
            // Validate input
            validateGSCProperty(property);
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'submit_sitemap',
                inputText: `submit sitemap ${sitemapUrl} to ${property}`,
                inputParams: { property, sitemapUrl },
            });
            const config = getConfigManager();
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
                await gscClient.sitemaps.submit({ siteUrl: property, feedpath: sitemapUrl });
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
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Search Console API access');
            }
            // Create GSC client with user's OAuth token
            const gscClient = createGSCClient(oauthToken);
            // Validate input
            validateGSCProperty(property);
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'delete_sitemap',
                inputText: `delete sitemap ${sitemapUrl} from ${property}`,
                inputParams: { property, sitemapUrl },
            });
            const config = getConfigManager();
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
                await gscClient.sitemaps.delete({ siteUrl: property, feedpath: sitemapUrl });
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