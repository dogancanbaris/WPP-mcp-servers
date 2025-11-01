/**
 * Create Device Bid Modifier Tool
 *
 * MCP tool for creating device bid modifiers (adjust bids by +/-% for mobile/desktop/tablet).
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';

const logger = getLogger('ads.tools.bid-modifiers.device');
const audit = getAuditLogger();

/**
 * Create device bid modifier
 */
export const createDeviceBidModifierTool = {
  name: 'create_device_bid_modifier',
  description: `Create a device bid modifier to adjust bids by percentage for mobile, desktop, or tablet.

💡 AGENT GUIDANCE - DEVICE BID MODIFIERS:

⚠️ WHAT ARE DEVICE BID MODIFIERS?
Adjust your bids up or down based on the device type (mobile, desktop, tablet).

**Example:**
- Mobile performs 30% better → Set +30% modifier
- Desktop converts poorly → Set -20% modifier
- Tablet not relevant → Set -100% modifier (exclude)

📋 MODIFIER RANGE:
- Minimum: -90% (reduce bids by 90%)
- Maximum: +900% (increase bids by 900%)
- Special: -100% = exclude device entirely

💡 BEST PRACTICES - DEVICE TARGETING:
- Review performance by device BEFORE setting modifiers
- Mobile often has different conversion rates than desktop
- Tablet traffic typically low volume
- Start conservative (±10-20%), optimize over time
- Monitor after changes (performance may shift)

🎯 TYPICAL USE CASES:
1. **Mobile-first strategy** → +30% to +50% mobile modifier
2. **Desktop-heavy campaigns** → -20% to -40% mobile modifier
3. **Exclude tablets** → -100% tablet modifier
4. **Equal bidding** → 0% modifier (default, no adjustment)

⚠️ COMMON MISTAKES TO AVOID:
- Setting modifiers without performance data
- Too aggressive adjustments (causes bid instability)
- Forgetting to monitor after changes
- Excluding devices without testing first

📊 DEVICE TYPES:
- **MOBILE** → Smartphones (iOS, Android)
- **DESKTOP** → Desktop computers, laptops
- **TABLET** → iPads, Android tablets

💰 FINANCIAL IMPACT:
A +30% modifier on $1.00 bids = $1.30 effective bid
A -20% modifier on $1.00 bids = $0.80 effective bid`,
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
      deviceType: {
        type: 'string',
        enum: ['MOBILE', 'DESKTOP', 'TABLET'],
        description: 'Device type to modify bids for',
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
      const { customerId, campaignId, deviceType, bidModifierPercent, confirmationToken } = input;

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
          step: '1/4',
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
          step: '2/4',
          title: 'SELECT CAMPAIGN',
          items: campaigns,
          itemFormatter: (c, i) => {
            const campaign = c.campaign;
            return `${i + 1}. ${campaign?.name || 'Unnamed'}
   ID: ${campaign?.id}
   Status: ${campaign?.status}`;
          },
          prompt: 'Which campaign should have device bid modifiers?',
          nextParam: 'campaignId',
          context: { customerId },
        });
      }

      // ═══ STEP 3: DEVICE TYPE GUIDANCE ═══
      if (!deviceType) {
        const guidanceText = `📱 SELECT DEVICE TYPE (Step 3/4)

Choose the device type to modify bids for:

**Available Device Types:**

1. **MOBILE** (Smartphones)
   • iOS, Android smartphones
   • Typically higher volume, variable conversion rates
   • Mobile-friendly sites: often +20% to +40%
   • Non-mobile sites: often -20% to -40%

2. **DESKTOP** (Computers)
   • Desktop computers, laptops
   • Often higher conversion rates for complex purchases
   • Good for B2B, high-ticket items
   • Typical modifiers: -20% to +30%

3. **TABLET** (Tablets)
   • iPads, Android tablets
   • Usually lower volume than mobile/desktop
   • Often excluded (-100%) if performance poor
   • Typical modifiers: -50% to +20%

**Best Practice:**
Review performance by device BEFORE setting modifiers:
1. Check "Devices" report in campaign
2. Compare CTR, conversion rate by device
3. Set modifier based on relative performance

**Provide:** deviceType (MOBILE, DESKTOP, or TABLET)

Which device type?`;

        return injectGuidance({ customerId, campaignId }, guidanceText);
      }

      // ═══ STEP 4: BID MODIFIER PERCENTAGE ═══
      if (bidModifierPercent === undefined) {
        const guidanceText = `📊 SET BID MODIFIER PERCENTAGE (Step 4/4)

**Campaign:** ID ${campaignId}
**Device Type:** ${deviceType}

Enter the bid adjustment percentage:

**Modifier Range:**
- **-90% to +900%** (valid range)
- **-100%** = Exclude device entirely (no ads shown)
- **0%** = No adjustment (default)

**Examples:**

**Increase Bids (Device performs well):**
• +10% = Raise bids by 10% on ${deviceType}
• +30% = Raise bids by 30% (moderate increase)
• +50% = Raise bids by 50% (aggressive increase)

**Decrease Bids (Device performs poorly):**
• -10% = Lower bids by 10% on ${deviceType}
• -30% = Lower bids by 30% (moderate decrease)
• -50% = Lower bids by 50% (aggressive decrease)

**Exclude Device:**
• -100% = Don't show ads on ${deviceType}

**Financial Impact:**
If base bid = $1.00:
• +30% modifier → Effective bid = $1.30
• -20% modifier → Effective bid = $0.80
• -100% modifier → No ads shown

**Best Practice:**
1. Start conservative (±10-20%)
2. Monitor performance for 7-14 days
3. Adjust based on results
4. Avoid extreme modifiers without data

**Provide:** bidModifierPercent (number from -90 to +900)

What percentage adjustment?`;

        return injectGuidance({ customerId, campaignId, deviceType }, guidanceText);
      }

      // Validate modifier range
      if (bidModifierPercent < -100 || bidModifierPercent > 900) {
        throw new Error(
          'Bid modifier must be between -100% (exclude) and +900%. Provided: ' + bidModifierPercent
        );
      }

      // ═══ STEP 5: DRY-RUN PREVIEW ═══
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'create_device_bid_modifier',
        'Google Ads',
        customerId
      );

      dryRunBuilder.addChange({
        resource: 'Campaign Bid Modifier',
        resourceId: campaignId,
        field: `${deviceType} bid modifier`,
        currentValue: '0% (no adjustment)',
        newValue: `${bidModifierPercent > 0 ? '+' : ''}${bidModifierPercent}%`,
        changeType: 'create',
      });

      // Calculate financial impact
      const isIncrease = bidModifierPercent > 0;
      const impactDescription = bidModifierPercent === -100
        ? `All ads on ${deviceType} will be EXCLUDED (not shown)`
        : `All bids on ${deviceType} will be ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`;

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
          `⚠️ Large bid adjustment (${bidModifierPercent}%). This will significantly impact spend. Monitor closely.`
        );
      }

      if (bidModifierPercent === -100) {
        dryRunBuilder.addRecommendation(
          `🚫 EXCLUSION: Ads will NOT show on ${deviceType}. Ensure this is intentional.`
        );
      }

      if (Math.abs(bidModifierPercent) < 10) {
        dryRunBuilder.addRecommendation(
          `ℹ️ Small adjustment (${bidModifierPercent}%). May have minimal impact. Consider larger adjustment if performance gap is significant.`
        );
      }

      dryRunBuilder.addRecommendation(
        `📊 Monitor ${deviceType} performance after this change. Check "Devices" report in 7-14 days.`
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'create_device_bid_modifier',
          'Google Ads',
          customerId,
          { campaignId, deviceType, bidModifierPercent }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Device bid modifier creation requires approval. Review the preview and call this tool again with confirmationToken.',
        };
      }

      // ═══ STEP 6: EXECUTE MODIFIER CREATION ═══
      logger.info('Creating device bid modifier', { customerId, campaignId, deviceType, bidModifierPercent });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const customer = client.getCustomer(customerId);

          // Convert percentage to multiplier (Google Ads uses multiplier, not percentage)
          // Example: +30% = 1.3, -20% = 0.8, -100% = 0
          const bidModifier = bidModifierPercent === -100 ? 0 : 1 + bidModifierPercent / 100;

          const operation: any = {
            campaign: `customers/${customerId}/campaigns/${campaignId}`,
            criterion_id: deviceType === 'MOBILE' ? 30001 : deviceType === 'DESKTOP' ? 30002 : 30003,
            bid_modifier: bidModifier,
          };

          const createResult = await customer.campaignCriteria.create([operation]);
          return createResult;
        }
      );

      // AUDIT: Log successful modifier creation
      await audit.logWriteOperation('user', 'create_device_bid_modifier', customerId, {
        campaignId,
        deviceType,
        bidModifierPercent,
        resultId: result,
      });

      return {
        success: true,
        data: {
          customerId,
          campaignId,
          deviceType,
          bidModifierPercent,
          modifierId: result,
          message: `✅ Device bid modifier created: ${deviceType} bids ${bidModifierPercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(bidModifierPercent)}%`,
        },
        nextSteps: [
          `Monitor ${deviceType} performance in "Devices" report`,
          'Check spend and conversions after 7-14 days',
          'Adjust modifier if needed using update_device_bid_modifier',
        ],
      };
    } catch (error) {
      logger.error('Failed to create device bid modifier', error as Error);

      await audit.logFailedOperation(
        'user',
        'create_device_bid_modifier',
        input.customerId,
        (error as Error).message,
        {
          campaignId: input.campaignId,
          deviceType: input.deviceType,
          bidModifierPercent: input.bidModifierPercent,
        }
      );

      throw error;
    }
  },
};
