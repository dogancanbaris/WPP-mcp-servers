/**
 * Add Demographic Targeting Criteria Tool
 *
 * MCP tool for adding demographic targeting (age, gender, income, parental status) to campaigns.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance, formatSuccessSummary } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { DryRunBuilder } from '../../../shared/dry-run-builder.js';

const logger = getLogger('ads.tools.targeting.demographic');
const audit = getAuditLogger();

/**
 * Age range constants
 */
const AGE_RANGES = [
  { id: '503001', name: '18-24', description: 'Young adults' },
  { id: '503002', name: '25-34', description: 'Young professionals' },
  { id: '503003', name: '35-44', description: 'Mid-career adults' },
  { id: '503004', name: '45-54', description: 'Established adults' },
  { id: '503005', name: '55-64', description: 'Pre-retirement' },
  { id: '503006', name: '65+', description: 'Seniors' },
  { id: '503999', name: 'Unknown', description: 'Age unknown' },
];

/**
 * Gender constants
 */
const GENDERS = [
  { id: '10', name: 'Male' },
  { id: '11', name: 'Female' },
  { id: '20', name: 'Undetermined', description: 'Gender unknown or unspecified' },
];

/**
 * Parental status constants
 */
const PARENTAL_STATUS = [
  { id: '300', name: 'Parent', description: 'Is a parent' },
  { id: '301', name: 'Not a Parent', description: 'Not a parent' },
  { id: '302', name: 'Unknown', description: 'Parental status unknown' },
];

/**
 * Household income constants (US-specific)
 */
const HOUSEHOLD_INCOME = [
  { id: '510001', name: 'Top 10%', description: 'Highest income bracket' },
  { id: '510002', name: 'Top 11-20%', description: 'Upper-middle income' },
  { id: '510003', name: 'Top 21-30%', description: 'Middle-upper income' },
  { id: '510004', name: 'Top 31-40%', description: 'Middle income' },
  { id: '510005', name: 'Top 41-50%', description: 'Lower-middle income' },
  { id: '510006', name: 'Bottom 50%', description: 'Lower income' },
  { id: '510000', name: 'Unknown', description: 'Income unknown' },
];

export const addDemographicCriteriaTool = {
  name: 'add_demographic_criteria',
  description: `Add demographic targeting (age, gender, income, parental status) to a campaign.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID to add demographic targeting',
      },
      ageRanges: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of age range IDs (e.g., ["503002", "503003"] for 25-44)',
      },
      genders: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of gender IDs (e.g., ["10", "11"] for male and female)',
      },
      parentalStatuses: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of parental status IDs (e.g., ["300"] for parents)',
      },
      householdIncomes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of household income IDs (e.g., ["510001", "510002"] for top 20%)',
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
      const { customerId, campaignId, ageRanges, genders, parentalStatuses, householdIncomes, confirmationToken } =
        input;

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

This account has no campaigns. Create a campaign first before adding demographic targeting.

**Next Steps:**
1. Use create_campaign to create a campaign
2. Then return here to add demographic targeting`;

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
          prompt: 'Which campaign should have demographic targeting?',
          nextParam: 'campaignId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: DEMOGRAPHIC SELECTION GUIDANCE ═══
      if (!ageRanges && !genders && !parentalStatuses && !householdIncomes) {
        const guidanceText = `👥 DEMOGRAPHIC TARGETING (Step 3/4)

Select demographic criteria to target your ads.

**AGE RANGES:**
${AGE_RANGES.map((a: any) => `• ${a.name} - ${a.description} (ID: ${a.id})`).join('\n')}

**GENDERS:**
${GENDERS.map((g: any) => `• ${g.name} (ID: ${g.id})`).join('\n')}

**PARENTAL STATUS:**
${PARENTAL_STATUS.map((p: any) => `• ${p.name} - ${p.description} (ID: ${p.id})`).join('\n')}

**HOUSEHOLD INCOME (US only):**
${HOUSEHOLD_INCOME.map((h: any) => `• ${h.name} - ${h.description} (ID: ${h.id})`).join('\n')}

**Examples:**

**Target Young Adults (18-34):**
\`\`\`json
ageRanges: ["503001", "503002"]
\`\`\`

**Target Parents Only:**
\`\`\`json
parentalStatuses: ["300"]
\`\`\`

**Target High-Income Females:**
\`\`\`json
genders: ["11"],
householdIncomes: ["510001", "510002"]
\`\`\`

**Target All Adults 25-54 (All Genders):**
\`\`\`json
ageRanges: ["503002", "503003", "503004"],
genders: ["10", "11", "20"]
\`\`\`

**How Demographic Targeting Works:**
• Multiple values within same category = OR logic (e.g., age 25-34 OR 35-44)
• Different categories = AND logic (e.g., age 25-34 AND female AND parent)
• Leave category empty to target all (no restriction)

**Best Practices:**
• Start broad, then narrow based on performance data
• Consider your product's actual customer demographics
• Review demographic reports before restricting
• Household income data only available in some countries (e.g., US)

**Provide:** At least one demographic criterion (ageRanges, genders, parentalStatuses, or householdIncomes)`;

        return injectGuidance({ customerId, campaignId }, guidanceText);
      }

      // ═══ STEP 4: DRY-RUN PREVIEW ═══
      if (!confirmationToken) {
        const dryRunBuilder = new DryRunBuilder('DEMOGRAPHIC TARGETING', 'Add demographic targeting to campaign');

        dryRunBuilder.addChange(`Campaign ID: ${campaignId}`);
        dryRunBuilder.addChange(`Customer ID: ${customerId}`);

        let totalCriteria = 0;

        if (ageRanges && ageRanges.length > 0) {
          const matched = ageRanges.map((id: any) => AGE_RANGES.find((a) => a.id === id)?.name || id);
          dryRunBuilder.addChange(`Age Ranges: ${matched.join(', ')}`);
          totalCriteria += ageRanges.length;
        }

        if (genders && genders.length > 0) {
          const matched = genders.map((id: any) => GENDERS.find((g) => g.id === id)?.name || id);
          dryRunBuilder.addChange(`Genders: ${matched.join(', ')}`);
          totalCriteria += genders.length;
        }

        if (parentalStatuses && parentalStatuses.length > 0) {
          const matched = parentalStatuses.map((id: any) => PARENTAL_STATUS.find((p) => p.id === id)?.name || id);
          dryRunBuilder.addChange(`Parental Status: ${matched.join(', ')}`);
          totalCriteria += parentalStatuses.length;
        }

        if (householdIncomes && householdIncomes.length > 0) {
          const matched = householdIncomes.map((id: any) => HOUSEHOLD_INCOME.find((h) => h.id === id)?.name || id);
          dryRunBuilder.addChange(`Household Income: ${matched.join(', ')}`);
          totalCriteria += householdIncomes.length;
        }

        dryRunBuilder.addChange(`Total Criteria: ${totalCriteria}`);

        dryRunBuilder.addRecommendation('Review demographic performance data after 1-2 weeks');
        dryRunBuilder.addRecommendation('Consider creating separate campaigns for different demographics if performance varies');
        dryRunBuilder.addRecommendation('Demographic targeting may reduce reach - monitor impression share');

        if (totalCriteria > 5) {
          dryRunBuilder.addRisk('Many demographic restrictions may significantly reduce audience size');
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
                '\n\n✅ Proceed with demographic targeting?\nCall again with confirmationToken to execute.',
            },
          ],
        };
      }

      // ═══ STEP 5: EXECUTE DEMOGRAPHIC TARGETING ═══
      logger.info('Adding demographic targeting', {
        customerId,
        campaignId,
        ageRanges,
        genders,
        parentalStatuses,
        householdIncomes,
      });

      const customer = client.getCustomer(customerId);
      const operations: any[] = [];

      // Add age range criteria
      if (ageRanges) {
        for (const ageRangeId of ageRanges) {
          operations.push({
            campaign: `customers/${customerId}/campaigns/${campaignId}`,
            age_range: {
              type: parseInt(ageRangeId),
            },
            type: 'AGE_RANGE',
            negative: false,
          });
        }
      }

      // Add gender criteria
      if (genders) {
        for (const genderId of genders) {
          operations.push({
            campaign: `customers/${customerId}/campaigns/${campaignId}`,
            gender: {
              type: parseInt(genderId),
            },
            type: 'GENDER',
            negative: false,
          });
        }
      }

      // Add parental status criteria
      if (parentalStatuses) {
        for (const statusId of parentalStatuses) {
          operations.push({
            campaign: `customers/${customerId}/campaigns/${campaignId}`,
            parental_status: {
              type: parseInt(statusId),
            },
            type: 'PARENTAL_STATUS',
            negative: false,
          });
        }
      }

      // Add household income criteria
      if (householdIncomes) {
        for (const incomeId of householdIncomes) {
          operations.push({
            campaign: `customers/${customerId}/campaigns/${campaignId}`,
            income_range: {
              type: parseInt(incomeId),
            },
            type: 'INCOME_RANGE',
            negative: false,
          });
        }
      }

      const result = await customer.campaignCriteria.create(operations);

      // AUDIT: Log successful demographic targeting
      await audit.logWriteOperation('user', 'add_demographic_criteria', customerId, {
        campaignId,
        ageRanges,
        genders,
        parentalStatuses,
        householdIncomes,
        criteriaCount: operations.length,
      });

      const summaryText = formatSuccessSummary({
        title: 'DEMOGRAPHIC TARGETING ADDED',
        operation: 'Demographic targeting configuration',
        details: {
          'Campaign ID': campaignId,
          'Total Criteria': operations.length,
          'Age Ranges': ageRanges ? ageRanges.length : 0,
          'Genders': genders ? genders.length : 0,
          'Parental Status': parentalStatuses ? parentalStatuses.length : 0,
          'Household Incomes': householdIncomes ? householdIncomes.length : 0,
        },
        nextSteps: [
          'Add location targeting: use add_location_criteria',
          'Add language targeting: use add_language_criteria',
          'Add audience targeting: use add_audience_criteria',
          'View demographic performance: use get_campaign_performance with demographic segments',
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
      logger.error('Failed to add demographic criteria', error as Error);

      await audit.logFailedOperation(
        'user',
        'add_demographic_criteria',
        input.customerId,
        (error as Error).message,
        {
          campaignId: input.campaignId,
          ageRanges: input.ageRanges,
          genders: input.genders,
          parentalStatuses: input.parentalStatuses,
          householdIncomes: input.householdIncomes,
        }
      );

      throw error;
    }
  },
};
