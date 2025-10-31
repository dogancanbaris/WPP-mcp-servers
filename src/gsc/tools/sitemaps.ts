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
    type: 'object' as const,
    properties: {
      property: {
        type: 'string',
        description: 'Property URL (e.g., sc-domain:example.com)',
      },
    },
    required: [],
  },
  async handler(input: any) {
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

      const formatted = sitemaps.map((sitemap: any) => ({
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

${formatted.map((s, i) => `${i+1}. ${s.url}
   Last submitted: ${s.lastSubmitted || 'N/A'}
   Errors: ${s.errors} | Warnings: ${s.warnings}`).join('\n\n')}

${formatNextSteps(['Submit new: use submit_sitemap', 'Get details: use get_sitemap', 'Check indexing: use inspect_url'])}`);
    } catch (error) {
      logger.error('Failed to list sitemaps', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'list_sitemaps',
        input.property,
        (error as Error).message
      );
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
    type: 'object' as const,
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
  async handler(input: any) {
    try {
      const { property, sitemapUrl } = input;

      // Extract OAuth token
      const oauthToken = await extractOAuthToken(input);
      if (!oauthToken) throw new Error('OAuth token required for Google Search Console API access');
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

      const sitemapData = {
        url: sitemap.path,
        lastSubmitted: sitemap.lastSubmitted,
        lastDownloaded: sitemap.lastDownloaded,
        errors: sitemap.errors || 0,
        warnings: sitemap.warnings || 0,
        contents: sitemap.contents || [],
      };

      // Generate insights
      const insights: string[] = [];
      const daysSinceSubmission = sitemap.lastSubmitted
        ? Math.floor((Date.now() - new Date(sitemap.lastSubmitted).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      if (sitemapData.errors === 0 && sitemapData.warnings === 0) {
        insights.push('✅ No errors or warnings detected');
      } else {
        if (Number(sitemapData.errors) > 0) {
          insights.push(`🔴 ${sitemapData.errors} error(s) found - requires immediate attention`);
        }
        if (Number(sitemapData.warnings) > 0) {
          insights.push(`⚠️ ${sitemapData.warnings} warning(s) - review recommended`);
        }
      }

      if (daysSinceSubmission !== null) {
        if (daysSinceSubmission === 0) {
          insights.push('✅ Submitted today');
        } else if (daysSinceSubmission < 7) {
          insights.push(`✅ Recently submitted (${daysSinceSubmission} days ago)`);
        } else if (daysSinceSubmission < 30) {
          insights.push(`⚠️ Submitted ${daysSinceSubmission} days ago - consider resubmitting`);
        } else {
          insights.push(`🔴 Last submitted ${daysSinceSubmission} days ago - resubmit recommended`);
        }
      }

      const guidanceText = `🗺️ SITEMAP DETAILS

**Property:** ${property}
**Sitemap URL:** ${sitemapData.url}

**STATUS:**
- Last Submitted: ${sitemapData.lastSubmitted || 'Never'}
- Last Downloaded: ${sitemapData.lastDownloaded || 'Never'}
- Errors: ${sitemapData.errors}
- Warnings: ${sitemapData.warnings}
- Contents: ${sitemapData.contents.length} item(s)

**CONTENTS BREAKDOWN:**
${sitemapData.contents.length > 0
  ? sitemapData.contents.map((c: any, i) =>
    `${i + 1}. Type: ${c.type || 'Unknown'}
   URLs: ${c.submitted || 0} submitted, ${c.indexed || 0} indexed`)
    .join('\n\n')
  : '(No content data available)'}

💡 KEY INSIGHTS:
${insights.map(i => `   • ${i}`).join('\n')}

${formatNextSteps([
  'View all sitemaps: use list_sitemaps',
  'Submit updated sitemap: use submit_sitemap',
  'Inspect specific URLs: use inspect_url',
  'Check indexing status: compare submitted vs indexed counts'
])}`;

      return injectGuidance(sitemapData, guidanceText);
    } catch (error) {
      logger.error('Failed to get sitemap', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'get_sitemap',
        input.property,
        (error as Error).message
      );
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
    type: 'object' as const,
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
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { property, sitemapUrl, confirmationToken } = input;

      // Extract OAuth token from request
      const oauthToken = await extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for Google Search Console API access');
      }

      // Create GSC client with user's OAuth token
      const gscClient = createGSCClient(oauthToken);

      // ═══ STEP 1: PROPERTY DISCOVERY ═══
      if (!property) {
        logger.info('Property discovery mode - listing properties');
        const res = await gscClient.sites.list();
        const sites = res.data.siteEntry || [];
        const properties = sites.map((site) => ({
          url: site.siteUrl,
          permissionLevel: site.permissionLevel,
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT PROPERTY',
          items: properties,
          itemFormatter: (p, i) =>
            `${i + 1}. ${p.url}\n   Permission: ${p.permissionLevel}`,
          prompt: 'Which property do you want to submit a sitemap to?',
          nextParam: 'property',
          emoji: '🗺️',
        });
      }

      // ═══ STEP 2: SITEMAP URL SPECIFICATION ═══
      if (!sitemapUrl) {
        const guidanceText = `📋 SPECIFY SITEMAP URL (Step 2/3)

**Property:** ${property}

Please provide the full URL of the sitemap you want to submit:

**Examples:**
- https://example.com/sitemap.xml
- https://example.com/sitemap_index.xml
- https://example.com/sitemaps/posts.xml

💡 REQUIREMENTS:
- Must be accessible via HTTPS or HTTP
- Must be in valid XML sitemap format
- Should be within your domain
- Can be sitemap index or regular sitemap

⚠️ NOTE: Submission doesn't guarantee immediate indexing. Google will process the sitemap at its own pace.

What sitemap URL would you like to submit?`;

        return injectGuidance(
          { property },
          guidanceText
        );
      }

      // ═══ STEP 3: DRY-RUN PREVIEW (existing logic) ═══
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

      const dryRunBuilder = new NewDryRunResultBuilder(
        'submit_sitemap',
        'Google Search Console',
        property
      );

      dryRunBuilder.addChange({
        resource: 'Sitemap',
        resourceId: sitemapUrl,
        field: 'status',
        currentValue: 'Not submitted',
        newValue: 'Submitted',
        changeType: 'create',
      });

      dryRunBuilder.addRecommendation(
        'Verify sitemap is accessible and valid before submitting'
      );
      dryRunBuilder.addRecommendation(
        'Indexing may take hours or days - monitor in Search Console'
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'submit_sitemap',
          'Google Search Console',
          property,
          { sitemapUrl }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Sitemap submission requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Submitting sitemap with confirmation', { property, sitemapUrl });

      await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          await gscClient.sitemaps.submit({ siteUrl: property, feedpath: sitemapUrl });
          await getAuditLogger().logWriteOperation('user', 'submit_sitemap', property, {
            sitemapUrl,
          });
          return { property, sitemapUrl };
        }
      );

      return {
        success: true,
        data: {
          property,
          sitemapUrl,
          message: '✅ Sitemap submitted successfully',
        },
      };
    } catch (error) {
      logger.error('Failed to submit sitemap', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'submit_sitemap',
        input.property,
        (error as Error).message
      );
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
    type: 'object' as const,
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
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { property, sitemapUrl, confirmationToken } = input;

      // Extract OAuth token from request
      const oauthToken = await extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for Google Search Console API access');
      }

      // Create GSC client with user's OAuth token
      const gscClient = createGSCClient(oauthToken);

      // ═══ STEP 1: PROPERTY DISCOVERY ═══
      if (!property) {
        logger.info('Property discovery mode - listing properties');
        const res = await gscClient.sites.list();
        const sites = res.data.siteEntry || [];
        const properties = sites.map((site) => ({
          url: site.siteUrl,
          permissionLevel: site.permissionLevel,
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT PROPERTY',
          items: properties,
          itemFormatter: (p, i) =>
            `${i + 1}. ${p.url}\n   Permission: ${p.permissionLevel}`,
          prompt: '🚨 DESTRUCTIVE: Which property contains the sitemap you want to delete?',
          nextParam: 'property',
          emoji: '⚠️',
        });
      }

      // ═══ STEP 2: SITEMAP DISCOVERY ═══
      if (!sitemapUrl) {
        const res = await gscClient.sitemaps.list({ siteUrl: property });
        const sitemaps = res.data.sitemap || [];

        if (sitemaps.length === 0) {
          return injectGuidance(
            { property, sitemaps: [] },
            `⚠️ NO SITEMAPS FOUND

**Property:** ${property}

No sitemaps are currently submitted to this property.

${formatNextSteps([
  'Submit a sitemap: use submit_sitemap',
  'Check another property: call list_properties'
])}`
          );
        }

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT SITEMAP TO DELETE',
          items: sitemaps,
          itemFormatter: (s, i) => {
            const sitemap = s as any;
            return `${i + 1}. ${sitemap.path}
   Last Submitted: ${sitemap.lastSubmitted || 'Never'}
   Errors: ${sitemap.errors || 0} | Warnings: ${sitemap.warnings || 0}`;
          },
          prompt: '🚨 Which sitemap do you want to DELETE? (This action is permanent)',
          nextParam: 'sitemapUrl',
          context: { property },
        });
      }

      // ═══ STEP 3: DRY-RUN PREVIEW (existing logic) ═══
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

      const dryRunBuilder = new NewDryRunResultBuilder(
        'delete_sitemap',
        'Google Search Console',
        property
      );

      dryRunBuilder.addChange({
        resource: 'Sitemap',
        resourceId: sitemapUrl,
        field: 'status',
        currentValue: 'Submitted',
        newValue: 'Deleted',
        changeType: 'delete',
      });

      dryRunBuilder.addRisk(
        'This removes the sitemap from Search Console tracking'
      );
      dryRunBuilder.addRisk(
        'Google may continue to use cached sitemap data temporarily'
      );

      dryRunBuilder.addRecommendation(
        'The sitemap file itself will NOT be deleted from your server'
      );
      dryRunBuilder.addRecommendation(
        'Consider if you really need to delete this sitemap'
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'delete_sitemap',
          'Google Search Console',
          property,
          { sitemapUrl }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'DESTRUCTIVE OPERATION: Sitemap deletion requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Deleting sitemap with confirmation', { property, sitemapUrl });

      await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          await gscClient.sitemaps.delete({ siteUrl: property, feedpath: sitemapUrl });
          await getAuditLogger().logWriteOperation('user', 'delete_sitemap', property, {
            sitemapUrl,
          });
          return { property, sitemapUrl };
        }
      );

      return {
        success: true,
        data: {
          property,
          sitemapUrl,
          message: '✅ Sitemap deleted successfully',
        },
      };
    } catch (error) {
      logger.error('Failed to delete sitemap', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'delete_sitemap',
        input.property,
        (error as Error).message
      );
      throw error;
    }
  },
};
