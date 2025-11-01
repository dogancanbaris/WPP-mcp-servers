/**
 * Set Ad Schedule Tool
 *
 * MCP tool for setting ad scheduling (day-parting) for campaigns.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, injectGuidance, formatSuccessSummary } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
import { DryRunBuilder } from '../../../shared/dry-run-builder.js';
const logger = getLogger('ads.tools.targeting.ad-schedule');
const audit = getAuditLogger();
/**
 * Day of week constants
 */
const DAYS_OF_WEEK = [
    { id: 'MONDAY', name: 'Monday' },
    { id: 'TUESDAY', name: 'Tuesday' },
    { id: 'WEDNESDAY', name: 'Wednesday' },
    { id: 'THURSDAY', name: 'Thursday' },
    { id: 'FRIDAY', name: 'Friday' },
    { id: 'SATURDAY', name: 'Saturday' },
    { id: 'SUNDAY', name: 'Sunday' },
];
/**
 * Common schedule presets
 */
const SCHEDULE_PRESETS = {
    business_hours: {
        name: 'Business Hours (Mon-Fri 9am-5pm)',
        description: 'Standard business hours, weekdays only',
        schedules: [
            { day: 'MONDAY', startHour: 9, endHour: 17 },
            { day: 'TUESDAY', startHour: 9, endHour: 17 },
            { day: 'WEDNESDAY', startHour: 9, endHour: 17 },
            { day: 'THURSDAY', startHour: 9, endHour: 17 },
            { day: 'FRIDAY', startHour: 9, endHour: 17 },
        ],
    },
    extended_business: {
        name: 'Extended Business Hours (Mon-Sat 8am-8pm)',
        description: 'Extended hours including Saturday',
        schedules: [
            { day: 'MONDAY', startHour: 8, endHour: 20 },
            { day: 'TUESDAY', startHour: 8, endHour: 20 },
            { day: 'WEDNESDAY', startHour: 8, endHour: 20 },
            { day: 'THURSDAY', startHour: 8, endHour: 20 },
            { day: 'FRIDAY', startHour: 8, endHour: 20 },
            { day: 'SATURDAY', startHour: 8, endHour: 20 },
        ],
    },
    weekends_only: {
        name: 'Weekends Only (Sat-Sun All Day)',
        description: 'Target weekend shoppers',
        schedules: [
            { day: 'SATURDAY', startHour: 0, endHour: 24 },
            { day: 'SUNDAY', startHour: 0, endHour: 24 },
        ],
    },
    evenings: {
        name: 'Evenings (Mon-Sun 6pm-11pm)',
        description: 'Target after-work hours',
        schedules: [
            { day: 'MONDAY', startHour: 18, endHour: 23 },
            { day: 'TUESDAY', startHour: 18, endHour: 23 },
            { day: 'WEDNESDAY', startHour: 18, endHour: 23 },
            { day: 'THURSDAY', startHour: 18, endHour: 23 },
            { day: 'FRIDAY', startHour: 18, endHour: 23 },
            { day: 'SATURDAY', startHour: 18, endHour: 23 },
            { day: 'SUNDAY', startHour: 18, endHour: 23 },
        ],
    },
};
export const setAdScheduleTool = {
    name: 'set_ad_schedule',
    description: `Set ad scheduling (day-parting) for a campaign.`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            campaignId: {
                type: 'string',
                description: 'Campaign ID to set ad schedule',
            },
            schedules: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        day: { type: 'string', enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] },
                        startHour: { type: 'number', minimum: 0, maximum: 23 },
                        startMinute: { type: 'number', minimum: 0, maximum: 59 },
                        endHour: { type: 'number', minimum: 0, maximum: 24 },
                        endMinute: { type: 'number', minimum: 0, maximum: 59 },
                    },
                },
                description: 'Array of schedule objects defining when ads should run',
            },
            preset: {
                type: 'string',
                enum: ['business_hours', 'extended_business', 'weekends_only', 'evenings'],
                description: 'Use a preset schedule',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
            const { customerId, campaignId, schedules, preset, confirmationToken } = input;
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
                const accounts = resourceNames.map((rn) => ({
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

This account has no campaigns. Create a campaign first before setting ad schedule.

**Next Steps:**
1. Use create_campaign to create a campaign
2. Then return here to set ad schedule`;
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
                    prompt: 'Which campaign should have ad scheduling?',
                    nextParam: 'campaignId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: SCHEDULE GUIDANCE ═══
            if (!schedules && !preset) {
                const guidanceText = `🕒 AD SCHEDULING (DAY-PARTING) (Step 3/4)

Control when your ads run by day and time.

**OPTION 1: Use a Preset Schedule**

Available Presets:
${Object.entries(SCHEDULE_PRESETS)
                    .map(([key, preset]) => `
• **${key}**: ${preset.name}
  ${preset.description}
  Coverage: ${preset.schedules.length} time slots`)
                    .join('\n')}

**Usage:**
\`\`\`json
preset: "business_hours"
\`\`\`

**OPTION 2: Custom Schedule**

Define your own time slots:
\`\`\`json
schedules: [
  {
    day: "MONDAY",
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0
  },
  {
    day: "TUESDAY",
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0
  }
]
\`\`\`

**Schedule Format:**
• **day**: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
• **startHour**: 0-23 (24-hour format)
• **startMinute**: 0-59 (default: 0)
• **endHour**: 0-24 (24 = midnight next day)
• **endMinute**: 0-59 (default: 0)

**Examples:**

**Business Hours Only:**
\`\`\`json
schedules: [
  { day: "MONDAY", startHour: 9, endHour: 17 },
  { day: "TUESDAY", startHour: 9, endHour: 17 },
  { day: "WEDNESDAY", startHour: 9, endHour: 17 },
  { day: "THURSDAY", startHour: 9, endHour: 17 },
  { day: "FRIDAY", startHour: 9, endHour: 17 }
]
\`\`\`

**Lunch Break (9am-12pm, 1pm-5pm):**
\`\`\`json
schedules: [
  { day: "MONDAY", startHour: 9, endHour: 12 },
  { day: "MONDAY", startHour: 13, endHour: 17 }
]
\`\`\`

**Evening Hours (6pm-11pm Daily):**
\`\`\`json
schedules: [
  { day: "MONDAY", startHour: 18, endHour: 23 },
  { day: "TUESDAY", startHour: 18, endHour: 23 },
  // ... repeat for all days
]
\`\`\`

**How Ad Scheduling Works:**
• Ads only show during specified time slots
• All times in account's timezone
• No schedule = 24/7 (default)
• Multiple slots per day allowed
• Great for optimizing based on conversion data

**Best Practices:**
• Review hourly performance data first (last 30 days)
• Start with observation mode (bid adjustments, not strict schedules)
• Allow 2 weeks of data before aggressive day-parting
• Consider timezone of target audience vs account timezone

**Provide:** Either preset (string) OR schedules (array of schedule objects)`;
                return injectGuidance({ customerId, campaignId }, guidanceText);
            }
            // Resolve preset to schedules
            let finalSchedules = schedules;
            if (preset && SCHEDULE_PRESETS[preset]) {
                finalSchedules = SCHEDULE_PRESETS[preset].schedules;
            }
            if (!finalSchedules || finalSchedules.length === 0) {
                throw new Error('Invalid preset or empty schedules array');
            }
            // ═══ STEP 4: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                const dryRunBuilder = new DryRunBuilder('AD SCHEDULE', 'Set ad scheduling (day-parting) for campaign');
                dryRunBuilder.addChange(`Campaign ID: ${campaignId}`);
                dryRunBuilder.addChange(`Customer ID: ${customerId}`);
                if (preset) {
                    const presetInfo = SCHEDULE_PRESETS[preset];
                    dryRunBuilder.addChange(`Using Preset: ${presetInfo.name}`);
                }
                dryRunBuilder.addChange(`Total Time Slots: ${finalSchedules.length}`);
                // Group by day for readability
                const groupedByDay = finalSchedules.reduce((acc, schedule) => {
                    if (!acc[schedule.day])
                        acc[schedule.day] = [];
                    acc[schedule.day].push(schedule);
                    return acc;
                }, {});
                for (const day of DAYS_OF_WEEK) {
                    const daySchedules = groupedByDay[day.id];
                    if (daySchedules && daySchedules.length > 0) {
                        const timeSlots = daySchedules
                            .map((s) => `${s.startHour}:${(s.startMinute || 0).toString().padStart(2, '0')}-${s.endHour}:${(s.endMinute || 0).toString().padStart(2, '0')}`)
                            .join(', ');
                        dryRunBuilder.addChange(`${day.name}: ${timeSlots}`);
                    }
                    else {
                        dryRunBuilder.addChange(`${day.name}: No ads`);
                    }
                }
                dryRunBuilder.addRecommendation('Ad schedule is based on your account timezone');
                dryRunBuilder.addRecommendation('Review hourly performance data after 1-2 weeks');
                dryRunBuilder.addRecommendation('Consider bid adjustments instead of strict schedules initially');
                // Calculate coverage
                const totalHours = finalSchedules.reduce((sum, s) => {
                    const duration = (s.endHour - s.startHour) + ((s.endMinute || 0) - (s.startMinute || 0)) / 60;
                    return sum + duration;
                }, 0);
                const coverage = ((totalHours / 168) * 100).toFixed(1); // 168 hours in a week
                dryRunBuilder.addChange(`Weekly Coverage: ${coverage}% (${totalHours.toFixed(1)} hours)`);
                if (parseFloat(coverage) < 30) {
                    dryRunBuilder.addRisk('Low coverage (<30%) may significantly reduce impressions and conversions');
                }
                const preview = dryRunBuilder.build('4/4');
                return {
                    requiresApproval: true,
                    confirmationToken: dryRunBuilder.getConfirmationToken(),
                    preview,
                    content: [
                        {
                            type: 'text',
                            text: preview + '\n\n✅ Proceed with ad schedule?\nCall again with confirmationToken to execute.',
                        },
                    ],
                };
            }
            // ═══ STEP 5: EXECUTE AD SCHEDULE ═══
            logger.info('Setting ad schedule', { customerId, campaignId, schedules: finalSchedules, preset });
            const customer = client.getCustomer(customerId);
            const operations = finalSchedules.map((schedule) => ({
                campaign: `customers/${customerId}/campaigns/${campaignId}`,
                ad_schedule: {
                    day_of_week: schedule.day,
                    start_hour: schedule.startHour,
                    start_minute: schedule.startMinute || 0,
                    end_hour: schedule.endHour,
                    end_minute: schedule.endMinute || 0,
                },
                type: 'AD_SCHEDULE',
            }));
            const result = await customer.campaignCriteria.create(operations);
            // AUDIT: Log successful ad schedule
            await audit.logWriteOperation('user', 'set_ad_schedule', customerId, {
                campaignId,
                scheduleCount: finalSchedules.length,
                preset: preset || 'custom',
            });
            const totalHours = finalSchedules.reduce((sum, s) => {
                const duration = (s.endHour - s.startHour) + ((s.endMinute || 0) - (s.startMinute || 0)) / 60;
                return sum + duration;
            }, 0);
            const coverage = ((totalHours / 168) * 100).toFixed(1);
            const summaryText = formatSuccessSummary({
                title: 'AD SCHEDULE SET',
                operation: 'Ad scheduling (day-parting) configuration',
                details: {
                    'Campaign ID': campaignId,
                    'Time Slots': finalSchedules.length,
                    'Weekly Coverage': `${coverage}% (${totalHours.toFixed(1)} hours)`,
                    'Preset Used': preset || 'Custom',
                },
                nextSteps: [
                    'Monitor performance by hour: use get_campaign_performance with hourly segments',
                    'Adjust bid modifiers for specific hours if needed',
                    'Review conversion patterns after 2 weeks',
                    'Consider A/B testing different schedules',
                ],
            });
            return {
                success: true,
                content: [{ type: 'text', text: summaryText }],
                data: {
                    customerId,
                    campaignId,
                    criteriaAdded: operations.length,
                    coverage,
                    result,
                },
            };
        }
        catch (error) {
            logger.error('Failed to set ad schedule', error);
            await audit.logFailedOperation('user', 'set_ad_schedule', input.customerId, error.message, {
                campaignId: input.campaignId,
                schedules: input.schedules,
                preset: input.preset,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=set-ad-schedule.tool.js.map