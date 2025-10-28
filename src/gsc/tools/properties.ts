/**
 * MCP Tools for GSC Properties (Sites) operations
 */

import { extractOAuthToken, createGSCClient } from '../../shared/oauth-client-factory.js';
import { getConfigManager } from '../config.js';
import { getAuditLogger } from '../audit.js';
import { DryRunResultBuilder, getApprovalManager, formatDryRunResult } from '../approval.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';

const logger = getLogger('gsc.tools.properties');

/**
 * List all properties tool
 */
export const listPropertiesTool = {
  name: 'list_properties',
  description: 'List all Search Console properties you have access to',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
  async handler(_input: any) {
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

      return {
        success: true,
        data: {
          properties: allProperties,
          total: allProperties.length,
          message: `Found ${allProperties.length} properties in your Google Search Console account`,
        },
      };
    } catch (error) {
      logger.error('Failed to list properties', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'list_properties',
        'system',
        (error as Error).message
      );
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
    type: 'object' as const,
    properties: {
      property: {
        type: 'string',
        description:
          'Property URL (e.g., sc-domain:example.com, sc-https://example.com/)',
      },
    },
    required: ['property'],
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

      return {
        success: true,
        data: {
          url: site.siteUrl,
          permissionLevel: site.permissionLevel,
        },
      };
    } catch (error) {
      logger.error('Failed to get property', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'get_property',
        input.property,
        (error as Error).message
      );
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
    type: 'object' as const,
    properties: {
      siteUrl: {
        type: 'string',
        description:
          'Property URL (e.g., sc-domain:example.com, sc-https://example.com/)',
      },
    },
    required: ['siteUrl'],
  },
  async handler(input: any) {
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
        console.log(
          'Please confirm this action by typing the approval ID: ' +
            approval.createRequest('add_property', siteUrl, dryRun, 'user')
        );

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
    } catch (error) {
      logger.error('Failed to add property', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'add_property',
        input.siteUrl,
        (error as Error).message
      );
      throw error;
    }
  },
};

// delete_property tool REMOVED - Property deletion is prohibited through MCP for safety
// Property deletion must be done manually through Google Search Console UI
// This is a permanent safety restriction to prevent accidental loss of Search Console access
