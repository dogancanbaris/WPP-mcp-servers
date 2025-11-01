/**
 * Create Ad Schedule Bid Modifier Tool
 *
 * MCP tool for creating ad schedule bid modifiers (adjust bids by +/-% for specific days/hours).
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';

const logger = getLogger('ads.tools.bid-modifiers.ad-schedule');
const audit = getAuditLogger();

/**
 * Create ad schedule bid modifier
 */
export const createAdScheduleBidModifierTool = {
  name: 'create_ad_schedule_bid_modifier',
  description: `Create an ad schedule bid modifier to adjust bids by percentage for specific days and hours.

💡 AGENT GUIDANCE - AD SCHEDULE BID MODIFIERS:

⚠️ WHAT ARE AD SCHEDULE BID MODIFIERS?
Adjust your bids up or down based on the day of week and time of day (dayparting).

**Example:**
- Monday 9am-5pm (business hours) converts 40% better → Set +40% modifier
- Saturday 2am-6am low traffic → Set -50% modifier
- Friday evening high engagement → Set +30% modifier

📋 MODIFIER RANGE:
- Minimum: -90% (reduce bids by 90%)
- Maximum: +900% (increase bids by 900%)
- No exclusion option (-100% not available for ad schedules)

💡 BEST PRACTICES - AD SCHEDULING:
- Review "Ad schedule" report BEFORE setting modifiers
- Business hours often convert better for B2B
- Evenings/weekends better for B2C
- Consider time zones (account timezone applies)
- Start conservative (±10-30%), optimize over time

🎯 TYPICAL USE CASES:
1. **B2B campaigns** → +40% Mon-Fri 9am-5pm (business hours)
2. **E-commerce** → +30% evenings/weekends (shopping time)
3. **Local services** → +50% during operating hours
4. **Night traffic reduction** → -50% overnight (2am-6am)

⚠️ COMMON MISTAKES TO AVOID:
- Setting schedules without hourly performance data
- Too granular (hourly) without enough volume
- Forgetting account timezone (may differ from target audience)
- Not accounting for conversion lag (late clicks, next-day conversions)

📊 DAYS OF WEEK:
- **MONDAY** → Monday
- **TUESDAY** → Tuesday
- **WEDNESDAY** → Wednesday
- **THURSDAY** → Thursday
- **FRIDAY** → Friday
- **SATURDAY** → Saturday
- **SUNDAY** → Sunday

⏰ TIME FORMAT:
- 24-hour format (0-23)
- Start hour: 0-23 (e.g., 9 = 9am, 17 = 5pm)
- End hour: 0-24 (e.g., 17 = 5pm, 24 = midnight)
- Minimum 1-hour blocks

🌍 TIMEZONE CONSIDERATIONS:
- Account timezone applies (check in Google Ads settings)
- Example: Account in PST, target EST → Need to convert
- Consider daylight savings time changes

💰 FINANCIAL IMPACT:
A +40% modifier Mon-Fri 9-5pm on $2.00 bids = $2.80 effective bid during business hours
A -30% modifier Sat-Sun on $1.00 bids = $0.70 effective bid on weekends`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID to apply modifier to',
      },
      dayOfWeek: {
        type: 'string',
        enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        description: 'Day of week',
      },
      startHour: {
        type: 'number',
        description: 'Start hour (0-23, e.g., 9 = 9am, 17 = 5pm)',
      },
      endHour: {
        type: 'number',
        description: 'End hour (1-24, e.g., 17 = 5pm, 24 = midnight)',
      },
      bidModifierPercent: {
        type: 'number',
        description: 'Bid adjustment percentage (-90 to +900, e.g., 40 = +40%, -30 = -30%)',
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
      const { customerId, campaignId, dayOfWeek, startHour, endHour, bidModifierPercent, confirmationToken } = input;

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
          step: '1/6',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account?',
          nextParam: 'customerId',
          emoji: '🎯',
        });
      }

      // ═══ STEP 2: CAMPAIGN DISCOVERY ═══
      if (!campaignId) {
        const campaigns = await client.listCampaigns(customerId);

        if (campaigns.length === 0) {
          return injectGuidance(
            { customerId },
            '⚠️ NO CAMPAIGNS FOUND\n\nCreate a campaign first using create_campaign tool.'
          );
        }

        return formatDiscoveryResponse({
          step: '2/6',
          title: 'SELECT CAMPAIGN',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign?.name || 'Unnamed'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}`;
          },
          prompt: 'Which campaign should have ad schedule bid modifiers?',
          nextParam: 'campaignId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: DAY OF WEEK GUIDANCE ═══
      if (!dayOfWeek) {
        const guidanceText = `📅 SELECT DAY OF WEEK (Step 3/6)

Choose the day of week for the ad schedule:

**Available Days:**

1. **MONDAY** → Monday
2. **TUESDAY** → Tuesday
3. **WEDNESDAY** → Wednesday
4. **THURSDAY** → Thursday
5. **FRIDAY** → Friday
6. **SATURDAY** → Saturday
7. **SUNDAY** → Sunday

**Best Practices:**

**B2B Campaigns:**
• Mon-Fri typically perform better
• Tuesday-Thursday often peak days
• Weekends often low conversion rates

**B2C Campaigns:**
• Weekends often high shopping time
• Friday evening high engagement
• Sunday often good for research/browsing

**E-commerce:**
• Evenings after work (all days)
• Lunch hours (Mon-Fri)
• Weekend mornings

**Local Services:**
• Operating hours (when you can take calls)
• High-demand days based on business type

**Recommendation:**
Start by reviewing "Ad schedule" report to identify high/low-performing days.

**Provide:** dayOfWeek (e.g., MONDAY, FRIDAY, SUNDAY)

Which day?`;

        return injectGuidance({ customerId, campaignId }, guidanceText);
      }

      // ═══ STEP 4: START HOUR GUIDANCE ═══
      if (startHour === undefined) {
        const guidanceText = `⏰ START HOUR (Step 4/6)

**Day:** ${dayOfWeek}

Enter the start hour (24-hour format):

**Format:**
- 0-23 (0 = midnight, 12 = noon, 23 = 11pm)

**Common Time Blocks:**

**Business Hours:**
• 9 = 9am (morning start)
• 13 = 1pm (afternoon start)
• 17 = 5pm (evening start)

**All Day:**
• 0 = midnight (start of day)

**Overnight:**
• 22 = 10pm (night start)
• 2 = 2am (late night)

**Examples:**

**B2B (9am-5pm):**
• Start: 9 (9am)

**E-commerce (Evening 5pm-10pm):**
• Start: 17 (5pm)

**24/7 but lower overnight (12am-6am):**
• Start: 0 (midnight)

**Lunch hour (12pm-1pm):**
• Start: 12 (noon)

⚠️ **Timezone Note:**
Uses your Google Ads account timezone (check account settings).

**Provide:** startHour (0-23)

What is the start hour?`;

        return injectGuidance({ customerId, campaignId, dayOfWeek }, guidanceText);
      }

      // Validate start hour
      if (startHour < 0 || startHour > 23) {
        throw new Error('Start hour must be between 0 and 23. Provided: ' + startHour);
      }

      // ═══ STEP 5: END HOUR GUIDANCE ═══
      if (endHour === undefined) {
        const guidanceText = `⏰ END HOUR (Step 5/6)

**Day:** ${dayOfWeek}
**Start Hour:** ${startHour} (${startHour === 0 ? '12am' : startHour < 12 ? startHour + 'am' : startHour === 12 ? '12pm' : (startHour - 12) + 'pm'})

Enter the end hour (24-hour format):

**Format:**
- 1-24 (must be greater than start hour)
- 24 = midnight (end of day)

**Common Time Blocks:**

**Business Hours (9am-5pm):**
• Start: 9, End: 17

**Extended Business (8am-7pm):**
• Start: 8, End: 19

**Evening (5pm-10pm):**
• Start: 17, End: 22

**Full Day:**
• Start: 0, End: 24

**Overnight (12am-6am):**
• Start: 0, End: 6

**Examples:**

**9am-5pm workday:**
• Start: 9, End: 17

**Lunch hour (12pm-1pm):**
• Start: 12, End: 13

**After-work shopping (5pm-11pm):**
• Start: 17, End: 23

**Overnight low-traffic (12am-6am):**
• Start: 0, End: 6

⚠️ **Important:**
- End hour must be > start hour (${startHour})
- Minimum 1-hour block
- Maximum 24 hours

**Provide:** endHour (${startHour + 1}-24)

What is the end hour?`;

        return injectGuidance({ customerId, campaignId, dayOfWeek, startHour }, guidanceText);
      }

      // Validate end hour
      if (endHour < 1 || endHour > 24) {
        throw new Error('End hour must be between 1 and 24. Provided: ' + endHour);
      }

      if (endHour <= startHour) {
        throw new Error(`End hour (${endHour}) must be greater than start hour (${startHour}).`);
      }

      // ═══ STEP 6: BID MODIFIER PERCENTAGE ═══
      if (bidModifierPercent === undefined) {
        const formatTime = (hour: number) => {
          if (hour === 0) return '12am (midnight)';
          if (hour === 24) return '12am (midnight)';
          if (hour === 12) return '12pm (noon)';
          if (hour < 12) return hour + 'am';
          return (hour - 12) + 'pm';
        };

        const timeBlock = `${dayOfWeek} ${formatTime(startHour)} - ${formatTime(endHour)}`;

        const guidanceText = `📊 SET BID MODIFIER PERCENTAGE (Step 6/6)

**Campaign:** ID ${campaignId}
**Schedule:** ${timeBlock}

Enter the bid adjustment percentage:

**Modifier Range:**
- **-90% to +900%** (valid range)
- **Note:** Cannot exclude time periods (-100% not available for ad schedules)
- **0%** = No adjustment (default)

**Examples:**

**Increase Bids (Time performs well):**
• +20% = Raise bids by 20% during ${timeBlock}
• +40% = Raise bids by 40% (moderate increase)
• +60% = Raise bids by 60% (high-converting time)

**Decrease Bids (Time performs poorly):**
• -10% = Lower bids by 10% during ${timeBlock}
• -30% = Lower bids by 30% (moderate decrease)
• -50% = Lower bids by 50% (low-converting time)

**Financial Impact:**
If base bid = $2.00:
• +40% modifier → Effective bid = $2.80 during ${timeBlock}
• -30% modifier → Effective bid = $1.40 during ${timeBlock}

**Best Practice:**
1. Review "Ad schedule" report for hourly performance
2. Start conservative (±10-30%)
3. B2B: Often +30-50% during business hours
4. B2C: Often +20-40% evenings/weekends
5. Overnight: Often -30-50% (2am-6am)
6. Monitor for 14-30 days before adjusting

**Common Patterns:**

**B2B (9am-5pm Mon-Fri):**
• +40% modifier (high conversion time)

**E-commerce (5pm-10pm):**
• +30% modifier (after-work shopping)

**Overnight (12am-6am):**
• -50% modifier (low traffic, poor quality)

**Provide:** bidModifierPercent (number from -90 to +900)

What percentage adjustment for ${timeBlock}?`;

        return injectGuidance(
          { customerId, campaignId, dayOfWeek, startHour, endHour },
          guidanceText
        );
      }

      // Validate modifier range
      if (bidModifierPercent < -90 || bidModifierPercent > 900) {
        throw new Error(
          'Bid modifier must be between -90% and +900%. Provided: ' + bidModifierPercent
        );
      }

      // ═══ STEP 7: DRY-RUN PREVIEW ═══
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'create_ad_schedule_bid_modifier',
        'Google Ads',
        customerId
      );

      const formatTime = (hour: number) => {
        if (hour === 0) return '12am';
        if (hour === 24) return '12am';
        if (hour === 12) return '12pm';
        if (hour < 12) return hour + 'am';
        return (hour - 12) + 'pm';
      };

      const timeBlock = `${dayOfWeek} ${formatTime(startHour)}-${formatTime(endHour)}`;

      dryRunBuilder.addChange({
        resource: 'Campaign Ad Schedule',
        resourceId: campaignId,
        field: `${timeBlock} bid modifier`,
        currentValue: '0% (no adjustment)',
        newValue: `${bidModifierPercent > 0 ? '+' : ''}${bidModifierPercent}%`,
        changeType: 'create',
      });

      // Calculate financial impact
      const isIncrease = bidModifierPercent > 0;
      const impactDescription = `All bids during ${timeBlock} will be ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`;

      dryRunBuilder.addChange({
        resource: 'Financial Impact',
        resourceId: campaignId,
        field: 'Bid adjustment',
        currentValue: 'No adjustment',
        newValue: impactDescription,
        changeType: 'update',
      });

      // Add warnings
      if (Math.abs(bidModifierPercent) >= 50) {
        dryRunBuilder.addRecommendation(
          `⚠️ Large bid adjustment (${bidModifierPercent}%) for ${timeBlock}. This will significantly impact spend during this time period.`
        );
      }

      if (Math.abs(bidModifierPercent) < 10) {
        dryRunBuilder.addRecommendation(
          `ℹ️ Small adjustment (${bidModifierPercent}%). May have minimal impact during ${timeBlock}.`
        );
      }

      const hourDuration = endHour - startHour;
      if (hourDuration >= 12) {
        dryRunBuilder.addRecommendation(
          `📊 Large time block (${hourDuration} hours). Consider breaking into smaller blocks for more granular optimization.`
        );
      }

      dryRunBuilder.addRecommendation(
        `⏰ Monitor ${timeBlock} performance after this change. Check "Ad schedule" report in 14-30 days.`
      );

      dryRunBuilder.addRecommendation(
        `🌍 Timezone: This schedule uses your account timezone. Verify it matches your target audience timezone.`
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'create_ad_schedule_bid_modifier',
          'Google Ads',
          customerId,
          { campaignId, dayOfWeek, startHour, endHour, bidModifierPercent }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Ad schedule bid modifier creation requires approval. Review the preview and call this tool again with confirmationToken.',
        };
      }

      // ═══ STEP 8: EXECUTE MODIFIER CREATION ═══
      logger.info('Creating ad schedule bid modifier', {
        customerId,
        campaignId,
        dayOfWeek,
        startHour,
        endHour,
        bidModifierPercent,
      });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const customer = client.getCustomer(customerId);

          // Convert percentage to multiplier
          const bidModifier = 1 + bidModifierPercent / 100;

          // Map day of week to Google Ads enum
          const dayMapping: Record<string, string> = {
            MONDAY: 'MONDAY',
            TUESDAY: 'TUESDAY',
            WEDNESDAY: 'WEDNESDAY',
            THURSDAY: 'THURSDAY',
            FRIDAY: 'FRIDAY',
            SATURDAY: 'SATURDAY',
            SUNDAY: 'SUNDAY',
          };

          const operation: any = {
            campaign: `customers/${customerId}/campaigns/${campaignId}`,
            ad_schedule: {
              day_of_week: dayMapping[dayOfWeek],
              start_hour: startHour,
              start_minute: 0, // Always 0 (on the hour)
              end_hour: endHour === 24 ? 0 : endHour, // 24 = 0 (midnight)
              end_minute: 0,
            },
            bid_modifier: bidModifier,
          };

          const createResult = await customer.campaignCriteria.create([operation]);
          return createResult;
        }
      );

      // AUDIT: Log successful modifier creation
      await audit.logWriteOperation('user', 'create_ad_schedule_bid_modifier', customerId, {
        campaignId,
        dayOfWeek,
        startHour,
        endHour,
        bidModifierPercent,
        resultId: result,
      });

      return {
        success: true,
        data: {
          customerId,
          campaignId,
          dayOfWeek,
          startHour,
          endHour,
          bidModifierPercent,
          modifierId: result,
          message: `✅ Ad schedule bid modifier created: ${timeBlock} bids ${bidModifierPercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`,
        },
        nextSteps: [
          `Monitor ${timeBlock} performance in "Ad schedule" report`,
          'Check spend and conversions after 14-30 days',
          'Consider adding modifiers for other time blocks',
          'Verify account timezone matches target audience',
        ],
      };
    } catch (error) {
      logger.error('Failed to create ad schedule bid modifier', error as Error);

      await audit.logFailedOperation(
        'user',
        'create_ad_schedule_bid_modifier',
        input.customerId,
        (error as Error).message,
        {
          campaignId: input.campaignId,
          dayOfWeek: input.dayOfWeek,
          startHour: input.startHour,
          endHour: input.endHour,
          bidModifierPercent: input.bidModifierPercent,
        }
      );

      throw error;
    }
  },
};
