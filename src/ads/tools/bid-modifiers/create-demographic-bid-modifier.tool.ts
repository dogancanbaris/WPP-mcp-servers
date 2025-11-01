/**
 * Create Demographic Bid Modifier Tool
 *
 * MCP tool for creating demographic bid modifiers (adjust bids by +/-% for age groups and gender).
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';

const logger = getLogger('ads.tools.bid-modifiers.demographic');
const audit = getAuditLogger();

/**
 * Create demographic bid modifier
 */
export const createDemographicBidModifierTool = {
  name: 'create_demographic_bid_modifier',
  description: `Create a demographic bid modifier to adjust bids by percentage for specific age groups or gender.

💡 AGENT GUIDANCE - DEMOGRAPHIC BID MODIFIERS:

⚠️ WHAT ARE DEMOGRAPHIC BID MODIFIERS?
Adjust your bids up or down based on the user's age or gender.

**Example:**
- Women convert 30% better → Set +30% modifier for female
- 18-24 age group low conversions → Set -20% modifier
- 55-64 high value customers → Set +40% modifier

📋 MODIFIER RANGE:
- Minimum: -90% (reduce bids by 90%)
- Maximum: +900% (increase bids by 900%)
- Special: -100% = exclude demographic entirely

💡 BEST PRACTICES - DEMOGRAPHIC TARGETING:
- Review "Demographics" report BEFORE setting modifiers
- Age and gender performance varies by product/service
- Start conservative (±10-20%), optimize over time
- Consider combining with audience targeting
- Respect privacy and avoid discrimination

🎯 TYPICAL USE CASES:
1. **Gender-specific products** → +50% for target gender, -50% for opposite
2. **Age-targeted offers** → +40% for age group most likely to convert
3. **Exclude demographics** → -100% for non-relevant segments
4. **B2B campaigns** → +30% for 25-54 age range (working professionals)

⚠️ COMMON MISTAKES TO AVOID:
- Setting modifiers without demographic performance data
- Aggressive exclusions (can limit reach unnecessarily)
- Assuming stereotypes (test data, don't assume)
- Not considering product type (B2B vs B2C)

📊 AGE GROUPS:
- **AGE_18_24** → 18-24 years old
- **AGE_25_34** → 25-34 years old
- **AGE_35_44** → 35-44 years old
- **AGE_45_54** → 45-54 years old
- **AGE_55_64** → 55-64 years old
- **AGE_65_UP** → 65+ years old
- **AGE_UNDETERMINED** → Age unknown

📊 GENDER:
- **MALE** → Male
- **FEMALE** → Female
- **UNDETERMINED** → Gender unknown

⚠️ LEGAL & ETHICAL:
- Comply with anti-discrimination laws
- Use for optimization, not exclusion of protected groups
- Document business justification for demographic targeting
- Consult legal counsel if targeting sensitive demographics

💰 FINANCIAL IMPACT:
A +30% modifier for females on $1.50 bids = $1.95 effective bid
A -20% modifier for 18-24 on $1.00 bids = $0.80 effective bid`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad Group ID to apply modifier to',
      },
      demographicType: {
        type: 'string',
        enum: ['AGE', 'GENDER'],
        description: 'Type of demographic modifier (AGE or GENDER)',
      },
      demographicValue: {
        type: 'string',
        description:
          'Demographic value (e.g., AGE_25_34, AGE_35_44, MALE, FEMALE)',
      },
      bidModifierPercent: {
        type: 'number',
        description: 'Bid adjustment percentage (-90 to +900, e.g., 30 = +30%, -20 = -20%)',
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
      const { customerId, adGroupId, demographicType, demographicValue, bidModifierPercent, confirmationToken } =
        input;

      // Extract OAuth tokens
      const refreshToken = extractRefreshToken(input);
      if (!refreshToken) {
        throw new Error('Refresh token required for Google Ads API.');
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
          step: '1/5',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🎯',
        });
      }

      // ═══ STEP 2: AD GROUP DISCOVERY ═══
      if (!adGroupId) {
        // First get campaigns
        const campaigns = await client.listCampaigns(customerId);

        if (campaigns.length === 0) {
          return injectGuidance(
            { customerId },
            '⚠️ NO CAMPAIGNS FOUND\n\nCreate a campaign first using create_campaign tool.'
          );
        }

        // For simplicity, query all ad groups
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

        if (adGroups.length === 0) {
          return injectGuidance(
            { customerId },
            '⚠️ NO AD GROUPS FOUND\n\nCreate an ad group first using create_ad_group tool.'
          );
        }

        return formatDiscoveryResponse({
          step: '2/5',
          title: 'SELECT AD GROUP',
          items: adGroups,
          itemFormatter: (ag, i) => {
            const adGroup = ag.ad_group;
            const campaign = ag.campaign;
            return `${i + 1}. ${adGroup?.name || 'Unnamed Ad Group'}
   ID: ${adGroup?.id}
   Campaign: ${campaign?.name || 'Unknown'}
   Status: ${adGroup?.status}`;
          },
          prompt: 'Which ad group should have demographic bid modifiers?',
          nextParam: 'adGroupId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: DEMOGRAPHIC TYPE GUIDANCE ═══
      if (!demographicType) {
        const guidanceText = `👥 SELECT DEMOGRAPHIC TYPE (Step 3/5)

Choose the type of demographic to modify bids for:

**Available Demographic Types:**

1. **AGE** (Age Groups)
   • Target by age range
   • Options: 18-24, 25-34, 35-44, 45-54, 55-64, 65+
   • Best for: Age-specific products, services, offers
   • Example: Retirement planning → +40% for 55-64

2. **GENDER** (Male/Female)
   • Target by gender
   • Options: MALE, FEMALE, UNDETERMINED
   • Best for: Gender-specific products, fashion, cosmetics
   • Example: Women's shoes → +50% for FEMALE

**Important Notes:**
• Review "Demographics" report BEFORE setting modifiers
• Test assumptions with data (don't assume based on stereotypes)
• Consider legal/ethical implications
• Use for optimization, not discrimination

**Provide:** demographicType (AGE or GENDER)

Which demographic type?`;

        return injectGuidance({ customerId, adGroupId }, guidanceText);
      }

      // ═══ STEP 4: DEMOGRAPHIC VALUE GUIDANCE ═══
      if (!demographicValue) {
        let guidanceText = '';

        if (demographicType === 'AGE') {
          guidanceText = `📊 SELECT AGE GROUP (Step 4/5)

**Ad Group ID:** ${adGroupId}

Choose the age group to modify bids for:

**Available Age Groups:**

1. **AGE_18_24** → 18-24 years old
   • Young adults, students, entry-level workers
   • Often lower purchasing power but high engagement

2. **AGE_25_34** → 25-34 years old
   • Millennials, established careers, high digital adoption
   • Prime consumer demographic for many products

3. **AGE_35_44** → 35-44 years old
   • Gen X, peak earning years, families
   • High purchasing power, decision makers

4. **AGE_45_54** → 45-54 years old
   • Established professionals, high disposable income
   • Brand loyal, value quality

5. **AGE_55_64** → 55-64 years old
   • Pre-retirement, high savings, health-conscious
   • Good for retirement, health, luxury products

6. **AGE_65_UP** → 65+ years old
   • Retirees, fixed income, experienced buyers
   • Good for health, travel, leisure services

7. **AGE_UNDETERMINED** → Age unknown
   • Users who haven't provided age data

**Provide:** demographicValue (e.g., AGE_25_34, AGE_35_44)

Which age group?`;
        } else if (demographicType === 'GENDER') {
          guidanceText = `⚥ SELECT GENDER (Step 4/5)

**Ad Group ID:** ${adGroupId}

Choose the gender to modify bids for:

**Available Options:**

1. **MALE**
   • Male users
   • Use for male-focused products/services

2. **FEMALE**
   • Female users
   • Use for female-focused products/services

3. **UNDETERMINED**
   • Gender unknown
   • Users who haven't provided gender data

**Legal & Ethical Notes:**
• Only use gender targeting when business-justified
• Comply with anti-discrimination laws
• Document business reasons for gender modifiers
• Consider unisex appeal before excluding gender

**Provide:** demographicValue (MALE, FEMALE, or UNDETERMINED)

Which gender?`;
        }

        return injectGuidance({ customerId, adGroupId, demographicType }, guidanceText);
      }

      // ═══ STEP 5: BID MODIFIER PERCENTAGE ═══
      if (bidModifierPercent === undefined) {
        const demographicLabel =
          demographicType === 'AGE'
            ? demographicValue.replace('AGE_', '').replace('_', '-')
            : demographicValue;

        const guidanceText = `📊 SET BID MODIFIER PERCENTAGE (Step 5/5)

**Ad Group:** ID ${adGroupId}
**Demographic:** ${demographicType} - ${demographicLabel}

Enter the bid adjustment percentage:

**Modifier Range:**
- **-90% to +900%** (valid range)
- **-100%** = Exclude demographic entirely (no ads shown)
- **0%** = No adjustment (default)

**Examples:**

**Increase Bids (Demographic performs well):**
• +20% = Raise bids by 20% for ${demographicLabel}
• +40% = Raise bids by 40% (moderate increase)
• +60% = Raise bids by 60% (high-value demographic)

**Decrease Bids (Demographic performs poorly):**
• -10% = Lower bids by 10% for ${demographicLabel}
• -30% = Lower bids by 30% (moderate decrease)
• -50% = Lower bids by 50% (low-performing demographic)

**Exclude Demographic:**
• -100% = Don't show ads to ${demographicLabel}

**Financial Impact:**
If base bid = $1.50:
• +40% modifier → Effective bid = $2.10 for ${demographicLabel}
• -30% modifier → Effective bid = $1.05 for ${demographicLabel}
• -100% modifier → No ads shown to ${demographicLabel}

**Best Practice:**
1. Review "Demographics" report for performance data
2. Start conservative (±10-30%)
3. Monitor for 14-30 days before adjusting
4. Consider business justification for exclusions
5. Document legal/compliance reasons if needed

**Provide:** bidModifierPercent (number from -90 to +900)

What percentage adjustment for ${demographicLabel}?`;

        return injectGuidance(
          { customerId, adGroupId, demographicType, demographicValue },
          guidanceText
        );
      }

      // Validate modifier range
      if (bidModifierPercent < -100 || bidModifierPercent > 900) {
        throw new Error(
          'Bid modifier must be between -100% (exclude) and +900%. Provided: ' + bidModifierPercent
        );
      }

      // ═══ STEP 6: DRY-RUN PREVIEW ═══
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'create_demographic_bid_modifier',
        'Google Ads',
        customerId
      );

      const demographicLabel =
        demographicType === 'AGE'
          ? demographicValue.replace('AGE_', '').replace('_', '-')
          : demographicValue;

      dryRunBuilder.addChange({
        resource: 'Ad Group Bid Modifier',
        resourceId: adGroupId,
        field: `${demographicType} ${demographicLabel} bid modifier`,
        currentValue: '0% (no adjustment)',
        newValue: `${bidModifierPercent > 0 ? '+' : ''}${bidModifierPercent}%`,
        changeType: 'create',
      });

      // Calculate financial impact
      const isIncrease = bidModifierPercent > 0;
      const impactDescription =
        bidModifierPercent === -100
          ? `All ads to ${demographicLabel} will be EXCLUDED (not shown)`
          : `All bids for ${demographicLabel} will be ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`;

      dryRunBuilder.addChange({
        resource: 'Financial Impact',
        resourceId: adGroupId,
        field: 'Bid adjustment',
        currentValue: 'No adjustment',
        newValue: impactDescription,
        changeType: 'update',
      });

      // Add warnings
      if (Math.abs(bidModifierPercent) >= 50) {
        dryRunBuilder.addRecommendation(
          `⚠️ Large bid adjustment (${bidModifierPercent}%) for ${demographicLabel}. This will significantly impact spend for this demographic.`
        );
      }

      if (bidModifierPercent === -100) {
        dryRunBuilder.addRecommendation(
          `🚫 EXCLUSION: Ads will NOT show to ${demographicLabel}. Ensure this complies with anti-discrimination policies and has business justification.`
        );
      }

      if (Math.abs(bidModifierPercent) < 10) {
        dryRunBuilder.addRecommendation(
          `ℹ️ Small adjustment (${bidModifierPercent}%). May have minimal impact on ${demographicLabel} performance.`
        );
      }

      dryRunBuilder.addRecommendation(
        `📊 Monitor ${demographicLabel} performance after this change. Check "Demographics" report in 14-30 days.`
      );

      dryRunBuilder.addRecommendation(
        `⚖️ Legal: Ensure demographic targeting complies with applicable laws and Google Ads policies.`
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'create_demographic_bid_modifier',
          'Google Ads',
          customerId,
          { adGroupId, demographicType, demographicValue, bidModifierPercent }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Demographic bid modifier creation requires approval. Review the preview and call this tool again with confirmationToken.',
        };
      }

      // ═══ STEP 7: EXECUTE MODIFIER CREATION ═══
      logger.info('Creating demographic bid modifier', {
        customerId,
        adGroupId,
        demographicType,
        demographicValue,
        bidModifierPercent,
      });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const customer = client.getCustomer(customerId);

          // Convert percentage to multiplier
          const bidModifier = bidModifierPercent === -100 ? 0 : 1 + bidModifierPercent / 100;

          // Map demographic values to criterion IDs
          const ageGroupIds: Record<string, number> = {
            AGE_18_24: 503001,
            AGE_25_34: 503002,
            AGE_35_44: 503003,
            AGE_45_54: 503004,
            AGE_55_64: 503005,
            AGE_65_UP: 503006,
            AGE_UNDETERMINED: 503999,
          };

          const genderIds: Record<string, number> = {
            MALE: 10,
            FEMALE: 11,
            UNDETERMINED: 20,
          };

          let criterionId: number;
          if (demographicType === 'AGE') {
            criterionId = ageGroupIds[demographicValue];
            if (!criterionId) {
              throw new Error(`Invalid age group: ${demographicValue}`);
            }
          } else if (demographicType === 'GENDER') {
            criterionId = genderIds[demographicValue];
            if (!criterionId) {
              throw new Error(`Invalid gender: ${demographicValue}`);
            }
          } else {
            throw new Error(`Invalid demographic type: ${demographicType}`);
          }

          const operation: any = {
            ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
            criterion_id: criterionId,
            bid_modifier: bidModifier,
          };

          const createResult = await customer.adGroupCriteria.create([operation]);
          return createResult;
        }
      );

      // AUDIT: Log successful modifier creation
      await audit.logWriteOperation('user', 'create_demographic_bid_modifier', customerId, {
        adGroupId,
        demographicType,
        demographicValue,
        bidModifierPercent,
        resultId: result,
      });

      return {
        success: true,
        data: {
          customerId,
          adGroupId,
          demographicType,
          demographicValue,
          bidModifierPercent,
          modifierId: result,
          message: `✅ Demographic bid modifier created: ${demographicLabel} bids ${bidModifierPercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`,
        },
        nextSteps: [
          `Monitor ${demographicLabel} performance in "Demographics" report`,
          'Check spend and conversions after 14-30 days',
          'Consider adding modifiers for other demographic segments',
          'Verify compliance with anti-discrimination policies',
        ],
      };
    } catch (error) {
      logger.error('Failed to create demographic bid modifier', error as Error);

      await audit.logFailedOperation(
        'user',
        'create_demographic_bid_modifier',
        input.customerId,
        (error as Error).message,
        {
          adGroupId: input.adGroupId,
          demographicType: input.demographicType,
          demographicValue: input.demographicValue,
          bidModifierPercent: input.bidModifierPercent,
        }
      );

      throw error;
    }
  },
};
