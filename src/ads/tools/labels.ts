/**
 * MCP Tools for Google Ads Label Management
 *
 * Labels organize campaigns, ad groups, and keywords for reporting and management.
 * Think of them as tags that help categorize and filter your advertising resources.
 */

import { extractCustomerId } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { getAuditLogger } from '../../gsc/audit.js';
import {
  formatDiscoveryResponse,
  injectGuidance,
  formatNextSteps,
  formatSuccessSummary
} from '../../shared/interactive-workflow.js';

const logger = getLogger('ads.tools.labels');
const audit = getAuditLogger();

/**
 * List labels (READ)
 */
export const listLabelsTool = {
  name: 'list_labels',
  description: 'List all labels in a Google Ads account.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const { customerId } = input;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/1',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account do you want to list labels for?',
          nextParam: 'customerId',
          emoji: '🏷️',
        });
      }

      // ═══ STEP 2: FETCH LABELS ═══
      logger.info('[list_labels] Fetching labels', { customerId });

      const labels = await client.listLabels(customerId);

      // Format guidance with results
      const guidanceText = `🏷️ LABELS IN ACCOUNT ${customerId}

${labels.length === 0 ? '(No labels found - create one to get started!)' : labels.map((l, i) => {
  const label = l.label;
  return `${i + 1}. ${label.name || 'Unnamed'}
   ID: ${label.id}
   Status: ${label.status}
   Resource: ${label.resource_name}`;
}).join('\n\n')}

Total: ${labels.length} label(s)

💡 WHAT ARE LABELS?
Labels are tags you apply to campaigns, ad groups, and keywords to:
- Organize resources by client, team, or strategy
- Filter reports by label
- Bulk edit resources with same label
- Track performance by category

📊 WHAT YOU CAN DO:
- Create new label: use create_label
- Apply to campaign: use apply_label_to_campaign
- Apply to ad group: use apply_label_to_ad_group
- Apply to keyword: use apply_label_to_keyword
- Remove label: use remove_label

${formatNextSteps([
  'Create a new label: call create_label with name',
  'Apply label to resource: use apply_label_to_campaign, apply_label_to_ad_group, or apply_label_to_keyword',
  'Organize campaigns: apply same label to multiple campaigns for bulk management'
])}`;

      return injectGuidance(
        {
          labels,
          count: labels.length,
          customerId,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('[list_labels] Error:', error as Error);
      throw error;
    }
  },
};

/**
 * Create label (WRITE)
 */
export const createLabelTool = {
  name: 'create_label',
  description: 'Create a new label to organize campaigns, ad groups, and keywords.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      name: {
        type: 'string',
        description: 'Label name (e.g., "Q4 Campaigns", "High Priority", "Client XYZ")',
      },
      description: {
        type: 'string',
        description: 'Optional description for the label',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const { customerId, name, description } = input;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/2',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account do you want to create a label in?',
          nextParam: 'customerId',
          emoji: '🏷️',
        });
      }

      // ═══ STEP 2: NAME GUIDANCE ═══
      if (!name) {
        const guidanceText = `🏷️ LABEL NAME (Step 2/2)

Enter a descriptive name for the label:

**Examples:**
- "Q4 2025 Campaigns"
- "High Priority Keywords"
- "Client ABC - All Campaigns"
- "Brand Defense"
- "Test Campaigns"

**Best Practices:**
- Use clear, descriptive names
- Include context (client, team, strategy)
- Use consistent naming convention
- Keep it concise (< 50 characters)

What should the label be named?`;

        return injectGuidance({ customerId }, guidanceText);
      }

      // ═══ STEP 3: EXECUTE ═══
      logger.info('[create_label] Creating label', { customerId, name });

      const result = await client.createLabel(customerId, name, description);

      // AUDIT: Log successful label creation
      await audit.logWriteOperation('user', 'create_label', customerId, {
        labelName: name,
        labelId: result,
        description: description || 'N/A',
      });

      const successText = formatSuccessSummary({
        title: 'LABEL CREATED SUCCESSFULLY',
        operation: 'Label creation',
        details: {
          'Label Name': name,
          'Label ID': result,
          'Customer ID': customerId,
          'Description': description || 'N/A',
        },
        nextSteps: [
          'Apply to campaign: use apply_label_to_campaign',
          'Apply to ad group: use apply_label_to_ad_group',
          'Apply to keyword: use apply_label_to_keyword',
          'View all labels: use list_labels'
        ],
        emoji: '✅',
      });

      return injectGuidance(
        {
          success: true,
          labelId: result,
          labelName: name,
          customerId,
        },
        successText
      );
    } catch (error) {
      logger.error('[create_label] Error:', error as Error);

      // AUDIT: Log failed label creation
      await audit.logFailedOperation('user', 'create_label', input.customerId, (error as Error).message, {
        labelName: input.name,
      });

      throw error;
    }
  },
};

/**
 * Remove label (WRITE)
 */
export const removeLabelTool = {
  name: 'remove_label',
  description: 'Delete a label (removes label from all resources it was applied to).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      labelId: {
        type: 'string',
        description: 'Label ID to remove',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const { customerId, labelId } = input;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/2',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account contains the label to remove?',
          nextParam: 'customerId',
          emoji: '🗑️',
        });
      }

      // ═══ STEP 2: LABEL DISCOVERY ═══
      if (!labelId) {
        const labels = await client.listLabels(customerId);

        if (labels.length === 0) {
          return injectGuidance(
            { customerId },
            `🗑️ NO LABELS FOUND (Step 2/2)

No labels exist in account ${customerId}.

Create a label first using create_label.`
          );
        }

        return formatDiscoveryResponse({
          step: '2/2',
          title: 'SELECT LABEL TO REMOVE',
          items: labels,
          itemFormatter: (l, i) => {
            const label = l.label;
            return `${i + 1}. ${label.name || 'Unnamed'}
   ID: ${label.id}
   Status: ${label.status}
   ⚠️ WARNING: Removing this label will remove it from ALL resources`;
          },
          prompt: '⚠️ Which label do you want to permanently delete?',
          nextParam: 'labelId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: EXECUTE ═══
      logger.info('[remove_label] Removing label', { customerId, labelId });

      // Get label name before deletion
      const labels = await client.listLabels(customerId);
      const labelToRemove = labels.find((l: any) => l.label.id === labelId);
      const labelName = labelToRemove?.label?.name || 'Unknown';

      await client.removeLabel(customerId, labelId);

      // AUDIT: Log successful label removal
      await audit.logWriteOperation('user', 'remove_label', customerId, {
        labelId,
        labelName,
      });

      const successText = formatSuccessSummary({
        title: 'LABEL REMOVED SUCCESSFULLY',
        operation: 'Label deletion',
        details: {
          'Label Name': labelName,
          'Label ID': labelId,
          'Customer ID': customerId,
        },
        warnings: [
          'Label has been removed from all campaigns, ad groups, and keywords it was applied to',
          'This action cannot be undone',
        ],
        nextSteps: [
          'View remaining labels: use list_labels',
          'Create new label: use create_label'
        ],
        emoji: '✅',
      });

      return injectGuidance(
        {
          success: true,
          labelId,
          labelName,
          customerId,
        },
        successText
      );
    } catch (error) {
      logger.error('[remove_label] Error:', error as Error);

      // AUDIT: Log failed label removal
      await audit.logFailedOperation('user', 'remove_label', input.customerId, (error as Error).message, {
        labelId: input.labelId,
      });

      throw error;
    }
  },
};

/**
 * Apply label to campaign (WRITE)
 */
export const applyCampaignLabelTool = {
  name: 'apply_label_to_campaign',
  description: 'Apply a label to a campaign for organization and reporting.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID to apply label to',
      },
      labelId: {
        type: 'string',
        description: 'Label ID to apply',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const { customerId, campaignId, labelId } = input;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🏷️',
        });
      }

      // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
      if (!campaignId) {
        const campaigns = await client.listCampaigns(customerId);

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT CAMPAIGN',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign.name || 'Unnamed'}
   ID: ${campaign.id}
   Status: ${campaign.status}
   Type: ${campaign.advertising_channel_type}`;
          },
          prompt: 'Which campaign do you want to label?',
          nextParam: 'campaignId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: LABEL DISCOVERY ═══
      if (!labelId) {
        const labels = await client.listLabels(customerId);

        if (labels.length === 0) {
          return injectGuidance(
            { customerId, campaignId },
            `🏷️ NO LABELS FOUND (Step 3/3)

No labels exist in account ${customerId}.

Create a label first using create_label, then apply it to campaigns.`
          );
        }

        return formatDiscoveryResponse({
          step: '3/3',
          title: 'SELECT LABEL TO APPLY',
          items: labels,
          itemFormatter: (l, i) => {
            const label = l.label;
            return `${i + 1}. ${label.name || 'Unnamed'}
   ID: ${label.id}
   Status: ${label.status}`;
          },
          prompt: 'Which label do you want to apply?',
          nextParam: 'labelId',
          context: { customerId, campaignId },
        });
      }

      // ═══ STEP 4: EXECUTE ═══
      logger.info('[apply_campaign_label] Applying label to campaign', { customerId, campaignId, labelId });

      // Get names for audit trail
      const campaigns = await client.listCampaigns(customerId);
      const campaign = campaigns.find((c: any) => c.campaign.id === campaignId);
      const campaignName = campaign?.campaign?.name || 'Unknown';

      const labels = await client.listLabels(customerId);
      const label = labels.find((l: any) => l.label.id === labelId);
      const labelName = label?.label?.name || 'Unknown';

      await client.applyCampaignLabel(customerId, campaignId, labelId);

      // AUDIT: Log successful label application
      await audit.logWriteOperation('user', 'apply_campaign_label', customerId, {
        campaignId,
        campaignName,
        labelId,
        labelName,
      });

      const successText = formatSuccessSummary({
        title: 'LABEL APPLIED TO CAMPAIGN',
        operation: 'Label application',
        details: {
          'Campaign': `${campaignName} (ID: ${campaignId})`,
          'Label': `${labelName} (ID: ${labelId})`,
          'Customer ID': customerId,
        },
        nextSteps: [
          'Apply same label to other campaigns for bulk management',
          'Apply label to ad groups: use apply_label_to_ad_group',
          'Apply label to keywords: use apply_label_to_keyword',
          'View all labels: use list_labels'
        ],
        emoji: '✅',
      });

      return injectGuidance(
        {
          success: true,
          campaignId,
          campaignName,
          labelId,
          labelName,
          customerId,
        },
        successText
      );
    } catch (error) {
      logger.error('[apply_campaign_label] Error:', error as Error);

      // AUDIT: Log failed label application
      await audit.logFailedOperation('user', 'apply_campaign_label', input.customerId, (error as Error).message, {
        campaignId: input.campaignId,
        labelId: input.labelId,
      });

      throw error;
    }
  },
};

/**
 * Apply label to ad group (WRITE)
 */
export const applyAdGroupLabelTool = {
  name: 'apply_label_to_ad_group',
  description: 'Apply a label to an ad group for organization and reporting.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad Group ID to apply label to',
      },
      labelId: {
        type: 'string',
        description: 'Label ID to apply',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, labelId } = input;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🏷️',
        });
      }

      // ═══ STEP 2: AD GROUP DISCOVERY ═══
      if (!adGroupId) {
        // Get ad groups via campaign query
        const customer = client.getCustomer(customerId);
        const adGroups = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            campaign.id,
            campaign.name
          FROM ad_group
          ORDER BY ad_group.name
        `);

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT AD GROUP',
          items: adGroups,
          itemFormatter: (ag, i) => {
            const adGroup = ag.ad_group;
            const campaign = ag.campaign;
            return `${i + 1}. ${adGroup.name || 'Unnamed'}
   ID: ${adGroup.id}
   Status: ${adGroup.status}
   Campaign: ${campaign.name} (${campaign.id})`;
          },
          prompt: 'Which ad group do you want to label?',
          nextParam: 'adGroupId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: LABEL DISCOVERY ═══
      if (!labelId) {
        const labels = await client.listLabels(customerId);

        if (labels.length === 0) {
          return injectGuidance(
            { customerId, adGroupId },
            `🏷️ NO LABELS FOUND (Step 3/3)

No labels exist in account ${customerId}.

Create a label first using create_label, then apply it to ad groups.`
          );
        }

        return formatDiscoveryResponse({
          step: '3/3',
          title: 'SELECT LABEL TO APPLY',
          items: labels,
          itemFormatter: (l, i) => {
            const label = l.label;
            return `${i + 1}. ${label.name || 'Unnamed'}
   ID: ${label.id}
   Status: ${label.status}`;
          },
          prompt: 'Which label do you want to apply?',
          nextParam: 'labelId',
          context: { customerId, adGroupId },
        });
      }

      // ═══ STEP 4: EXECUTE ═══
      logger.info('[apply_ad_group_label] Applying label to ad group', { customerId, adGroupId, labelId });

      // Get names for audit trail
      const customer = client.getCustomer(customerId);
      const adGroups = await customer.query(`
        SELECT ad_group.id, ad_group.name
        FROM ad_group
        WHERE ad_group.id = ${adGroupId}
      `);
      const adGroupName = adGroups[0]?.ad_group?.name || 'Unknown';

      const labels = await client.listLabels(customerId);
      const label = labels.find((l: any) => l.label.id === labelId);
      const labelName = label?.label?.name || 'Unknown';

      await client.applyAdGroupLabel(customerId, adGroupId, labelId);

      // AUDIT: Log successful label application
      await audit.logWriteOperation('user', 'apply_ad_group_label', customerId, {
        adGroupId,
        adGroupName,
        labelId,
        labelName,
      });

      const successText = formatSuccessSummary({
        title: 'LABEL APPLIED TO AD GROUP',
        operation: 'Label application',
        details: {
          'Ad Group': `${adGroupName} (ID: ${adGroupId})`,
          'Label': `${labelName} (ID: ${labelId})`,
          'Customer ID': customerId,
        },
        nextSteps: [
          'Apply same label to other ad groups for bulk management',
          'Apply label to keywords: use apply_label_to_keyword',
          'View all labels: use list_labels'
        ],
        emoji: '✅',
      });

      return injectGuidance(
        {
          success: true,
          adGroupId,
          adGroupName,
          labelId,
          labelName,
          customerId,
        },
        successText
      );
    } catch (error) {
      logger.error('[apply_ad_group_label] Error:', error as Error);

      // AUDIT: Log failed label application
      await audit.logFailedOperation('user', 'apply_ad_group_label', input.customerId, (error as Error).message, {
        adGroupId: input.adGroupId,
        labelId: input.labelId,
      });

      throw error;
    }
  },
};

/**
 * Apply label to keyword (WRITE)
 */
export const applyKeywordLabelTool = {
  name: 'apply_label_to_keyword',
  description: 'Apply a label to a keyword for organization and reporting.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      criterionId: {
        type: 'string',
        description: 'Keyword criterion ID (format: adGroupId~keywordId)',
      },
      labelId: {
        type: 'string',
        description: 'Label ID to apply',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const { customerId, criterionId, labelId } = input;

      // Extract OAuth tokens from request
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      // Create Google Ads client with user's refresh token
      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/3',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🏷️',
        });
      }

      // ═══ STEP 2: KEYWORD DISCOVERY ═══
      if (!criterionId) {
        const keywords = await client.listKeywords(customerId);

        if (keywords.length === 0) {
          return injectGuidance(
            { customerId },
            `🏷️ NO KEYWORDS FOUND (Step 2/3)

No keywords exist in account ${customerId}.

Add keywords first using add_keywords, then apply labels to them.`
          );
        }

        return formatDiscoveryResponse({
          step: '2/3',
          title: 'SELECT KEYWORD',
          items: keywords.slice(0, 50), // Limit to 50 for display
          itemFormatter: (kw, i) => {
            const criterion = kw.ad_group_criterion;
            const adGroup = kw.ad_group;
            const campaign = kw.campaign;
            return `${i + 1}. "${criterion.keyword.text}"
   Match: ${criterion.keyword.match_type}
   Status: ${criterion.status}
   Ad Group: ${adGroup.name} (${adGroup.id})
   Campaign: ${campaign.name}
   Criterion ID: ${criterion.criterion_id}`;
          },
          prompt: 'Which keyword do you want to label? (showing first 50)',
          nextParam: 'criterionId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: LABEL DISCOVERY ═══
      if (!labelId) {
        const labels = await client.listLabels(customerId);

        if (labels.length === 0) {
          return injectGuidance(
            { customerId, criterionId },
            `🏷️ NO LABELS FOUND (Step 3/3)

No labels exist in account ${customerId}.

Create a label first using create_label, then apply it to keywords.`
          );
        }

        return formatDiscoveryResponse({
          step: '3/3',
          title: 'SELECT LABEL TO APPLY',
          items: labels,
          itemFormatter: (l, i) => {
            const label = l.label;
            return `${i + 1}. ${label.name || 'Unnamed'}
   ID: ${label.id}
   Status: ${label.status}`;
          },
          prompt: 'Which label do you want to apply?',
          nextParam: 'labelId',
          context: { customerId, criterionId },
        });
      }

      // ═══ STEP 4: EXECUTE ═══
      logger.info('[apply_keyword_label] Applying label to keyword', { customerId, criterionId, labelId });

      // Get names for audit trail
      const keywords = await client.listKeywords(customerId);
      const keyword = keywords.find((kw: any) => kw.ad_group_criterion.criterion_id === criterionId);
      const keywordText = keyword?.ad_group_criterion?.keyword?.text || 'Unknown';

      const labels = await client.listLabels(customerId);
      const label = labels.find((l: any) => l.label.id === labelId);
      const labelName = label?.label?.name || 'Unknown';

      await client.applyKeywordLabel(customerId, criterionId, labelId);

      // AUDIT: Log successful label application
      await audit.logWriteOperation('user', 'apply_keyword_label', customerId, {
        criterionId,
        keywordText,
        labelId,
        labelName,
      });

      const successText = formatSuccessSummary({
        title: 'LABEL APPLIED TO KEYWORD',
        operation: 'Label application',
        details: {
          'Keyword': `"${keywordText}"`,
          'Criterion ID': criterionId,
          'Label': `${labelName} (ID: ${labelId})`,
          'Customer ID': customerId,
        },
        nextSteps: [
          'Apply same label to other keywords for bulk management',
          'Filter reports by label',
          'View all labels: use list_labels'
        ],
        emoji: '✅',
      });

      return injectGuidance(
        {
          success: true,
          criterionId,
          keywordText,
          labelId,
          labelName,
          customerId,
        },
        successText
      );
    } catch (error) {
      logger.error('[apply_keyword_label] Error:', error as Error);

      // AUDIT: Log failed label application
      await audit.logFailedOperation('user', 'apply_keyword_label', input.customerId, (error as Error).message, {
        criterionId: input.criterionId,
        labelId: input.labelId,
      });

      throw error;
    }
  },
};
