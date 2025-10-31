/**
 * MCP Tools for GSC Properties (Sites) operations
 */
import { extractOAuthToken, createGSCClient } from '../../shared/oauth-client-factory.js';
import { getConfigManager } from '../config.js';
import { getAuditLogger } from '../audit.js';
import { DryRunResultBuilder, getApprovalManager, formatDryRunResult } from '../approval.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { injectGuidance, formatNextSteps } from '../../shared/interactive-workflow.js';
const logger = getLogger('gsc.tools.properties');
/**
 * List all properties tool
 */
export const listPropertiesTool = {
    name: 'list_properties',
    description: 'List all Search Console properties you have access to',
    inputSchema: {
        type: 'object',
        properties: {},
        required: [],
    },
    async handler(_input) {
        try {
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(_input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Search Console API access');
            }
            // Create GSC client with user's OAuth token
            const gscClient = createGSCClient(oauthToken);
            const audit = getAuditLogger();
            logger.info('Listing properties');
            const res = await gscClient.sites.list();
            const response = res.data;
            const sites = response.siteEntry || [];
            // Return all discovered properties (full property discovery mode - no filtering)
            const allProperties = sites.map((site) => ({
                url: site.siteUrl,
                permissionLevel: site.permissionLevel,
            }));
            await audit.logReadOperation('user', 'list_properties', 'system', {
                totalProperties: sites.length,
                discoveredProperties: allProperties.length,
            });
            // Inject rich guidance into response
            const guidanceText = `📊 DISCOVERED ${allProperties.length} GOOGLE SEARCH CONSOLE PROPERTIES

${allProperties.map((p, i) => `${i + 1}. ${p.url} (${p.permissionLevel})`).join('\n')}

💡 WHAT YOU CAN DO WITH THESE PROPERTIES:

**Performance Analysis:**
- Analyze search traffic: use query_search_analytics
- Get search terms report: specify property + date range
- Track ranking changes: compare different time periods

**Index Management:**
- Check URL indexing status: use inspect_url
- View sitemaps: use list_sitemaps
- Submit new sitemaps: use submit_sitemap

**Technical SEO:**
- Check Core Web Vitals: use get_core_web_vitals_origin
- Analyze page speed: use get_core_web_vitals_url
- Compare device performance: use compare_cwv_form_factors

${formatNextSteps([
                'Start with traffic analysis: call query_search_analytics with a property',
                'Check site health: call inspect_url for your homepage',
                'Monitor Core Web Vitals: call get_core_web_vitals_origin'
            ])}

Which property would you like to analyze?`;
            return injectGuidance({
                properties: allProperties,
                total: allProperties.length,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list properties', error);
            await getAuditLogger().logFailedOperation('user', 'list_properties', 'system', error.message);
            throw error;
        }
    },
};
/**
 * Get property details tool
 */
export const getPropertyTool = {
    name: 'get_property',
    description: 'Get detailed information about a specific property',
    inputSchema: {
        type: 'object',
        properties: {
            property: {
                type: 'string',
                description: 'Property URL (e.g., sc-domain:example.com, sc-https://example.com/)',
            },
        },
        required: ['property'],
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
            // Validate input
            validateGSCProperty(property);
            const audit = getAuditLogger();
            // Note: Access control removed for full property discovery mode
            // Google API will handle permission errors if user doesn't own the property
            logger.info('Getting property details', { property });
            const res = await gscClient.sites.get({ siteUrl: property });
            const site = res.data;
            await audit.logReadOperation('user', 'get_property', property, {
                permissionLevel: site.permissionLevel,
            });
            // Inject guidance with next steps
            const guidanceText = `📋 PROPERTY DETAILS

**Property:** ${site.siteUrl}
**Permission Level:** ${site.permissionLevel}

💡 WHAT THIS MEANS:

**Permission Level "${site.permissionLevel}":**
${site.permissionLevel === 'siteOwner' ? '✅ Full access - Can manage everything' :
                site.permissionLevel === 'siteFullUser' ? '✅ Full user - Can view and manage most settings' :
                    site.permissionLevel === 'siteRestrictedUser' ? '⚠️  Limited access - Read-only permissions' :
                        'ℹ️  Standard access level'}

${formatNextSteps([
                'Analyze traffic: use query_search_analytics',
                'Check URL indexing: use inspect_url',
                'Review sitemaps: use list_sitemaps',
                'Monitor performance: use get_core_web_vitals_origin'
            ])}`;
            return injectGuidance({
                url: site.siteUrl,
                permissionLevel: site.permissionLevel,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to get property', error);
            await getAuditLogger().logFailedOperation('user', 'get_property', input.property, error.message);
            throw error;
        }
    },
};
/**
 * Add property tool (WRITE)
 */
export const addPropertyTool = {
    name: 'add_property',
    description: 'Add a new property to your Search Console account',
    inputSchema: {
        type: 'object',
        properties: {
            siteUrl: {
                type: 'string',
                description: 'Property URL (e.g., sc-domain:example.com, sc-https://example.com/)',
            },
        },
        required: ['siteUrl'],
    },
    async handler(input) {
        try {
            const { siteUrl } = input;
            // Extract OAuth token from request
            const oauthToken = await extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Search Console API access');
            }
            // Create GSC client with user's OAuth token
            const gscClient = createGSCClient(oauthToken);
            // Validate input
            validateGSCProperty(siteUrl);
            const config = getConfigManager();
            const approval = getApprovalManager();
            const audit = getAuditLogger();
            // Check permission
            if (!config.hasPermission('editor')) {
                throw new Error('Insufficient permissions for write operations');
            }
            logger.info('Add property requested', { siteUrl });
            // Perform dry-run
            const dryRun = new DryRunResultBuilder()
                .wouldSucceed(true)
                .addChange(`Add property: ${siteUrl}`)
                .addWarning('Property will be added but ownership must be verified in Search Console')
                .riskLevel('medium')
                .estimatedImpact('New property will appear in your Search Console account')
                .build();
            // Request approval
            if (config.requiresApprovalForWrite()) {
                console.log('\n' + formatDryRunResult(dryRun));
                console.log('Please confirm this action by typing the approval ID: ' +
                    approval.createRequest('add_property', siteUrl, dryRun, 'user'));
                // In production, this would be handled by the LLM or user
                return {
                    success: false,
                    data: {
                        requiresApproval: true,
                        dryRun,
                        message: 'Operation requires approval. Check console for approval ID.',
                    },
                };
            }
            // Execute
            await gscClient.sites.add({ siteUrl });
            await audit.logWriteOperation('user', 'add_property', siteUrl);
            return {
                success: true,
                data: {
                    property: siteUrl,
                    message: `Property added successfully. You must verify ownership in Search Console.`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to add property', error);
            await getAuditLogger().logFailedOperation('user', 'add_property', input.siteUrl, error.message);
            throw error;
        }
    },
};
// delete_property tool REMOVED - Property deletion is prohibited through MCP for safety
// Property deletion must be done manually through Google Search Console UI
// This is a permanent safety restriction to prevent accidental loss of Search Console access
//# sourceMappingURL=properties.js.map