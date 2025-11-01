/**
 * Add Language Targeting Criteria Tool
 *
 * MCP tool for adding language targeting to campaigns.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance, formatSuccessSummary } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { DryRunBuilder } from '../../../shared/dry-run-builder.js';

const logger = getLogger('ads.tools.targeting.language');
const audit = getAuditLogger();

/**
 * Common language constants
 */
const COMMON_LANGUAGES = [
  { id: '1000', name: 'English', nativeName: 'English' },
  { id: '1003', name: 'Spanish', nativeName: 'Español' },
  { id: '1002', name: 'French', nativeName: 'Français' },
  { id: '1001', name: 'German', nativeName: 'Deutsch' },
  { id: '1005', name: 'Italian', nativeName: 'Italiano' },
  { id: '1004', name: 'Portuguese', nativeName: 'Português' },
  { id: '1009', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { id: '1010', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { id: '1005', name: 'Japanese', nativeName: '日本語' },
  { id: '1012', name: 'Korean', nativeName: '한국어' },
  { id: '1027', name: 'Arabic', nativeName: 'العربية' },
  { id: '1019', name: 'Russian', nativeName: 'Русский' },
  { id: '1014', name: 'Dutch', nativeName: 'Nederlands' },
  { id: '1023', name: 'Polish', nativeName: 'Polski' },
  { id: '1025', name: 'Turkish', nativeName: 'Türkçe' },
];

export const addLanguageCriteriaTool = {
  name: 'add_language_criteria',
  description: `Add language targeting to a campaign.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID to add language targeting',
      },
      languageIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of language constant IDs (e.g., ["1000"] for English)',
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token from dry-run preview',
      },
    },
    required: [],
  },
  async handler(input: any) {
    try {
      const { customerId, campaignId, languageIds, confirmationToken } = input;

      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required. OMA must provide X-Google-Refresh-Token header.');
      }

      const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
      }

      const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);

      // ═══ STEP 1: ACCOUNT DISCOVERY ═══
      if (!customerId) {
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn: any) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/4',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account contains the campaign?',
          nextParam: 'customerId',
          emoji: '🎯',
        });
      }

      // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
      if (!campaignId) {
        const campaigns = await client.listCampaigns(customerId);

        if (campaigns.length === 0) {
          const guidanceText = `⚠️ NO CAMPAIGNS FOUND (Step 2/4)

This account has no campaigns. Create a campaign first before adding language targeting.

**Next Steps:**
1. Use create_campaign to create a campaign
2. Then return here to add language targeting`;

          return injectGuidance({ customerId }, guidanceText);
        }

        return formatDiscoveryResponse({
          step: '2/4',
          title: 'SELECT CAMPAIGN',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign?.name || 'Unnamed'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}
   Type: ${campaign?.advertising_channel_type}`;
          },
          prompt: 'Which campaign should have language targeting?',
          nextParam: 'campaignId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: LANGUAGE SELECTION GUIDANCE ═══
      if (!languageIds) {
        const guidanceText = `🗣️ LANGUAGE TARGETING (Step 3/4)

Select languages to target for your ads.

**Common Languages:**
${COMMON_LANGUAGES.map((l: any) => `• ${l.name} (${l.nativeName}): languageIds: ["${l.id}"]`).join('\n')}

**Examples:**

**Single Language (English):**
\`\`\`json
languageIds: ["1000"]
\`\`\`

**Multiple Languages (English + Spanish):**
\`\`\`json
languageIds: ["1000", "1003"]
\`\`\`

**All Major European Languages:**
\`\`\`json
languageIds: ["1000", "1003", "1002", "1001", "1005"]
\`\`\`

**How Language Targeting Works:**
• Shows ads to users whose Google interface is in selected language(s)
• Based on user's Google language preference, not browser language
• Multiple languages = OR logic (user matches any one language)

**Best Practices:**
• Match language to ad creative language
• Consider market: English in US vs English in UK may perform differently
• For multilingual markets, consider separate campaigns per language

**Provide:** languageIds (array of language constant IDs)`;

        return injectGuidance({ customerId, campaignId }, guidanceText);
      }

      // ═══ STEP 4: DRY-RUN PREVIEW ═══
      if (!confirmationToken) {
        const dryRunBuilder = new DryRunBuilder('LANGUAGE TARGETING', 'Add language targeting to campaign');

        dryRunBuilder.addChange(`Campaign ID: ${campaignId}`);
        dryRunBuilder.addChange(`Customer ID: ${customerId}`);
        dryRunBuilder.addChange(`Language IDs: ${languageIds.join(', ')}`);
        dryRunBuilder.addChange(`Total Languages: ${languageIds.length}`);

        // Try to match to known languages
        const matchedLanguages = languageIds
          .map((id: any) => COMMON_LANGUAGES.find((l: any) => l.id === id))
          .filter(Boolean)
          .map((l: any) => l!.name);

        if (matchedLanguages.length > 0) {
          dryRunBuilder.addChange(`Languages: ${matchedLanguages.join(', ')}`);
        }

        dryRunBuilder.addRecommendation('Ensure ad creative is in the targeted language(s)');
        dryRunBuilder.addRecommendation('Language targeting is additive - you can add more languages later');
        dryRunBuilder.addRecommendation('Language targeting affects ad delivery immediately once campaign is enabled');

        if (languageIds.length > 10) {
          dryRunBuilder.addRisk('Targeting many languages may require diverse ad creative');
        }

        const preview = dryRunBuilder.build('4/4');

        return {
          requiresApproval: true,
          confirmationToken: dryRunBuilder.getConfirmationToken(),
          preview,
          content: [
            {
              type: 'text',
              text:
                preview +
                '\n\n✅ Proceed with language targeting?\nCall again with confirmationToken to execute.',
            },
          ],
        };
      }

      // ═══ STEP 5: EXECUTE LANGUAGE TARGETING ═══
      logger.info('Adding language targeting', { customerId, campaignId, languageIds });

      const customer = client.getCustomer(customerId);
      const operations: any[] = languageIds.map((languageId: any) => ({
        campaign: `customers/${customerId}/campaigns/${campaignId}`,
        language: {
          language_constant: `languageConstants/${languageId}`,
        },
        type: 'LANGUAGE',
        negative: false,
      }));

      const result = await customer.campaignCriteria.create(operations);

      // AUDIT: Log successful language targeting
      await audit.logWriteOperation('user', 'add_language_criteria', customerId, {
        campaignId,
        languageIds,
        criteriaCount: operations.length,
      });

      const matchedLanguages = languageIds
        .map((id: any) => COMMON_LANGUAGES.find((l: any) => l.id === id))
        .filter(Boolean)
        .map((l: any) => l!.name);

      const summaryText = formatSuccessSummary({
        title: 'LANGUAGE TARGETING ADDED',
        operation: 'Language targeting configuration',
        details: {
          'Campaign ID': campaignId,
          'Languages Added': matchedLanguages.length > 0 ? matchedLanguages.join(', ') : languageIds.join(', '),
          'Total Criteria': operations.length,
        },
        nextSteps: [
          'Add location targeting: use add_location_criteria',
          'Add demographic targeting: use add_demographic_criteria',
          'View campaign performance: use get_campaign_performance',
        ],
      });

      return {
        success: true,
        content: [{ type: 'text', text: summaryText }],
        data: {
          customerId,
          campaignId,
          criteriaAdded: operations.length,
          result,
        },
      };
    } catch (error) {
      logger.error('Failed to add language criteria', error as Error);

      await audit.logFailedOperation(
        'user',
        'add_language_criteria',
        input.customerId,
        (error as Error).message,
        { campaignId: input.campaignId, languageIds: input.languageIds }
      );

      throw error;
    }
  },
};
