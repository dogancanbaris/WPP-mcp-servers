/**
 * Create Ad Tool
 *
 * MCP tool for creating Responsive Search Ads in Google Ads.
 */
import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, formatSuccessSummary, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';
const logger = getLogger('ads.tools.ads.create');
const audit = getAuditLogger();
/**
 * Create Responsive Search Ad
 */
export const createAdTool = {
    name: 'create_ad',
    description: 'Create a new Responsive Search Ad in Google Ads.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            adGroupId: {
                type: 'string',
                description: 'Ad Group ID where the ad will be created',
            },
            headlines: {
                type: 'array',
                items: { type: 'string' },
                description: 'Headlines (3-15 required, 30 chars max each)',
            },
            descriptions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Descriptions (2-4 required, 90 chars max each)',
            },
            finalUrl: {
                type: 'string',
                description: 'Final URL (must be HTTPS)',
            },
            path1: {
                type: 'string',
                description: 'Display path 1 (optional, 15 chars max)',
            },
            path2: {
                type: 'string',
                description: 'Display path 2 (optional, 15 chars max)',
            },
            // Mobile and tracking parameters
            mobileFinalUrl: {
                type: 'string',
                description: 'Mobile final URL (optional but recommended - 60% of traffic is mobile)',
            },
            finalUrlSuffix: {
                type: 'string',
                description: 'Final URL suffix for UTM tracking (optional, e.g., "utm_source=google")',
            },
            trackingTemplate: {
                type: 'string',
                description: 'Tracking URL template for conversion tracking (optional)',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token for executing the operation',
            },
        },
        required: [], // Make optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, adGroupId, headlines, descriptions, finalUrl, path1, path2, mobileFinalUrl, finalUrlSuffix, trackingTemplate, confirmationToken } = input;
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
                    step: '1/6',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account do you want to create an ad in?',
                    nextParam: 'customerId',
                    emoji: '🎯',
                });
            }
            // ═══ STEP 2: AD GROUP DISCOVERY ═══
            if (!adGroupId) {
                const customer = client.getCustomer(customerId);
                const adGroups = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            campaign.id,
            campaign.name
          FROM ad_group
          WHERE ad_group.status != 'REMOVED'
          ORDER BY campaign.name, ad_group.name
        `);
                if (adGroups.length === 0) {
                    const guidanceText = `⚠️ NO AD GROUPS FOUND (Step 2/6)

This account has no ad groups. You must create an ad group before creating ads.

**Next Steps:**
1. Create a campaign (if needed)
2. Create an ad group in that campaign
3. Then return here to create the ad

Ad groups organize your keywords and ads within a campaign.`;
                    return injectGuidance({ customerId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '2/6',
                    title: 'SELECT AD GROUP',
                    items: adGroups,
                    itemFormatter: (ag, i) => {
                        const adGroup = ag.ad_group;
                        const campaign = ag.campaign;
                        return `${i + 1}. ${adGroup?.name || 'Unnamed Ad Group'}
   ID: ${adGroup?.id}
   Campaign: ${campaign?.name || 'N/A'}
   Status: ${adGroup?.status}`;
                    },
                    prompt: 'Which ad group should this ad belong to?',
                    nextParam: 'adGroupId',
                    context: { customerId },
                });
            }
            // ═══ STEP 3: HEADLINES VALIDATION ═══
            if (!headlines || headlines.length === 0) {
                const guidanceText = `📝 CREATE HEADLINES (Step 3/6)

Responsive Search Ads require 3-15 headlines:

**Requirements:**
- Minimum: 3 headlines
- Maximum: 15 headlines
- Character limit: 30 chars per headline
- Google shows up to 3 at a time (tests combinations)

**Best Practices:**
✅ Include keywords in multiple headlines
✅ Vary your messaging (features, benefits, CTAs)
✅ Use dynamic keyword insertion: {KeyWord:Default}
✅ Test different value propositions

**Examples:**
- "Fast, Free Shipping" (19 chars)
- "Shop Premium Running Shoes" (26 chars)
- "Save Up to 50% Today" (20 chars)
- "Trusted by 1M+ Customers" (24 chars)

**Provide:** Array of 3-15 headlines (as JSON array or comma-separated)

Example:
\`\`\`json
{
  "headlines": [
    "Premium Running Shoes",
    "Fast Free Shipping",
    "Save Up to 50% Off",
    "Shop Top Brands",
    "Trusted Since 2010"
  ]
}
\`\`\``;
                return injectGuidance({ customerId, adGroupId }, guidanceText);
            }
            // Validate headlines count
            if (headlines.length < 3) {
                const guidanceText = `❌ TOO FEW HEADLINES (Step 3/6)

You provided ${headlines.length} headline${headlines.length === 1 ? '' : 's'}, but need at least 3.

**Current Headlines:**
${headlines.map((h, i) => `${i + 1}. "${h}" (${h.length} chars)`).join('\n')}

**Required:** 3-15 headlines total

Add ${3 - headlines.length} more headline${3 - headlines.length === 1 ? '' : 's'}.`;
                return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
            }
            if (headlines.length > 15) {
                const guidanceText = `❌ TOO MANY HEADLINES (Step 3/6)

You provided ${headlines.length} headlines, but maximum is 15.

**Limit:** 3-15 headlines

Remove ${headlines.length - 15} headline${headlines.length - 15 === 1 ? '' : 's'}.`;
                return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
            }
            // Validate headline character limits
            const tooLongHeadlines = headlines.filter((h) => h.length > 30);
            if (tooLongHeadlines.length > 0) {
                const guidanceText = `❌ HEADLINES TOO LONG (Step 3/6)

These headlines exceed 30 characters:

${tooLongHeadlines.map((h) => `• "${h}" (${h.length} chars - ${h.length - 30} over)`).join('\n')}

**Limit:** 30 characters per headline

Shorten these headlines and try again.`;
                return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
            }
            // ═══ STEP 4: DESCRIPTIONS VALIDATION ═══
            if (!descriptions || descriptions.length === 0) {
                const guidanceText = `📝 CREATE DESCRIPTIONS (Step 4/6)

Responsive Search Ads require 2-4 descriptions:

**Requirements:**
- Minimum: 2 descriptions
- Maximum: 4 descriptions
- Character limit: 90 chars per description
- Google shows up to 2 at a time

**Best Practices:**
✅ Expand on headline value propositions
✅ Include call-to-action
✅ Highlight unique selling points
✅ Use different tones (urgent, informational)

**Examples:**
- "Shop our collection of premium running shoes. Fast, free shipping on all orders over $50." (88 chars)
- "Find the perfect fit for your running style. Expert support available 24/7." (76 chars)

**Current Progress:**
✅ Headlines: ${headlines.length} provided (valid)

**Provide:** Array of 2-4 descriptions

Example:
\`\`\`json
{
  "descriptions": [
    "Shop premium running shoes with fast, free shipping on orders over $50. Find your perfect fit.",
    "Expert support available 24/7. Trusted by over 1 million runners worldwide."
  ]
}
\`\`\``;
                return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
            }
            // Validate descriptions count
            if (descriptions.length < 2) {
                const guidanceText = `❌ TOO FEW DESCRIPTIONS (Step 4/6)

You provided ${descriptions.length} description${descriptions.length === 1 ? '' : 's'}, but need at least 2.

**Current Descriptions:**
${descriptions.map((d, i) => `${i + 1}. "${d}" (${d.length} chars)`).join('\n')}

**Required:** 2-4 descriptions total

Add ${2 - descriptions.length} more description${2 - descriptions.length === 1 ? '' : 's'}.`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
            }
            if (descriptions.length > 4) {
                const guidanceText = `❌ TOO MANY DESCRIPTIONS (Step 4/6)

You provided ${descriptions.length} descriptions, but maximum is 4.

**Limit:** 2-4 descriptions

Remove ${descriptions.length - 4} description${descriptions.length - 4 === 1 ? '' : 's'}.`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
            }
            // Validate description character limits
            const tooLongDescriptions = descriptions.filter((d) => d.length > 90);
            if (tooLongDescriptions.length > 0) {
                const guidanceText = `❌ DESCRIPTIONS TOO LONG (Step 4/6)

These descriptions exceed 90 characters:

${tooLongDescriptions.map((d) => `• "${d}" (${d.length} chars - ${d.length - 90} over)`).join('\n')}

**Limit:** 90 characters per description

Shorten these descriptions and try again.`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
            }
            // ═══ STEP 5: FINAL URL VALIDATION ═══
            if (!finalUrl) {
                const guidanceText = `🔗 FINAL URL (Step 5/6)

Enter the landing page URL where users will go when they click the ad:

**Requirements:**
- Must start with https:// (secure)
- Valid URL format
- Working landing page

**Best Practices:**
✅ Match ad message to landing page content
✅ Use clean, readable URLs
✅ Include tracking parameters if needed
✅ Test the page loads correctly

**Examples:**
- https://example.com/running-shoes
- https://example.com/products/premium-collection?utm_source=google
- https://shop.example.com/sale

**Current Progress:**
✅ Headlines: ${headlines.length} provided (valid)
✅ Descriptions: ${descriptions.length} provided (valid)

**Provide:** finalUrl (HTTPS URL)`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
            }
            // Validate HTTPS
            if (!finalUrl.startsWith('https://')) {
                const guidanceText = `❌ INVALID URL (Step 5/6)

Final URL must start with https:// (secure connection required).

**Your URL:** ${finalUrl}

**Fix:** Add https:// at the beginning

Example: https://example.com/running-shoes`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl }, guidanceText);
            }
            // Validate URL format
            try {
                new URL(finalUrl);
            }
            catch (e) {
                const guidanceText = `❌ INVALID URL FORMAT (Step 5/6)

The URL format is invalid.

**Your URL:** ${finalUrl}

**Requirements:**
- Must be valid URL format
- Must start with https://
- Must include domain name

Example: https://example.com/page`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl }, guidanceText);
            }
            // Validate path1 if provided
            if (path1 && path1.length > 15) {
                const guidanceText = `❌ PATH1 TOO LONG (Step 5/6)

Display path 1 exceeds 15 characters.

**Your path1:** "${path1}" (${path1.length} chars - ${path1.length - 15} over)

**Limit:** 15 characters

Shorten or remove path1.`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl, path1 }, guidanceText);
            }
            // Validate path2 if provided
            if (path2 && path2.length > 15) {
                const guidanceText = `❌ PATH2 TOO LONG (Step 5/6)

Display path 2 exceeds 15 characters.

**Your path2:** "${path2}" (${path2.length} chars - ${path2.length - 15} over)

**Limit:** 15 characters

Shorten or remove path2.`;
                return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl, path1, path2 }, guidanceText);
            }
            // ═══ STEP 6: DRY-RUN PREVIEW ═══
            if (!confirmationToken) {
                const displayUrl = finalUrl.replace('https://', '').replace('http://', '');
                const domain = displayUrl.split('/')[0];
                const fullDisplayPath = [domain, path1, path2].filter(Boolean).join('/');
                const previewText = `📋 AD CREATION PREVIEW (Step 6/6)

**RESPONSIVE SEARCH AD:**

**Display URL:** ${fullDisplayPath}
**Final URL:** ${finalUrl}
${mobileFinalUrl ? `**Mobile Final URL:** ${mobileFinalUrl}` : '⚠️ **No Mobile URL** - 60% of traffic is mobile!'}
${finalUrlSuffix ? `**Tracking Suffix:** ${finalUrlSuffix}` : ''}
${trackingTemplate ? `**Tracking Template:** ${trackingTemplate}` : ''}

**Headlines (${headlines.length}):**
${headlines.map((h, i) => `${i + 1}. ${h} (${h.length} chars)`).join('\n')}

**Descriptions (${descriptions.length}):**
${descriptions.map((d, i) => `${i + 1}. ${d} (${d.length} chars)`).join('\n')}

**Ad Preview (Example Combination):**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ad • ${fullDisplayPath}

${headlines[0]} | ${headlines[1]} | ${headlines[2]}

${descriptions[0]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Note:** Google will test different combinations of your headlines and descriptions.

⚠️ **IMPORTANT:**
• Ad will be created in PAUSED status
• Review all text carefully (no edits after creation)
• Ensure landing page matches ad message
• Ad must be approved by Google before serving

✅ **Ready to create this ad?**

Call this tool again with the same parameters plus:
\`\`\`json
{
  "confirmationToken": "${Math.random().toString(36).substring(7)}"
}
\`\`\``;
                return {
                    content: [{
                            type: 'text',
                            text: previewText
                        }],
                    data: {
                        customerId,
                        adGroupId,
                        headlines,
                        descriptions,
                        finalUrl,
                        path1,
                        path2,
                    },
                    requiresApproval: true,
                    confirmationToken: Math.random().toString(36).substring(7),
                    success: true,
                };
            }
            // ═══ STEP 7: EXECUTE AD CREATION ═══
            logger.info('Creating responsive search ad', { customerId, adGroupId, headlineCount: headlines.length, descriptionCount: descriptions.length });
            const customer = client.getCustomer(customerId);
            // Build responsive search ad
            const adOperation = {
                create: {
                    ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
                    status: 'PAUSED',
                    ad: {
                        responsive_search_ad: {
                            headlines: headlines.map((text) => ({ text })),
                            descriptions: descriptions.map((text) => ({ text })),
                            path1: path1 || undefined,
                            path2: path2 || undefined,
                        },
                        final_urls: [finalUrl],
                        // Add mobile URLs if provided
                        final_mobile_urls: mobileFinalUrl ? [mobileFinalUrl] : undefined,
                        // Add tracking if provided
                        final_url_suffix: finalUrlSuffix || undefined,
                        tracking_url_template: trackingTemplate || undefined,
                    },
                },
            };
            const result = await customer.adGroupAds.create([adOperation]);
            // Extract ad ID from result
            const adId = result[0]?.results?.[0]?.resource_name?.split('/').pop() || 'unknown';
            // AUDIT: Log successful ad creation
            await audit.logWriteOperation('user', 'create_ad', customerId, {
                adGroupId,
                adId,
                headlineCount: headlines.length,
                descriptionCount: descriptions.length,
                finalUrl,
            });
            const successText = formatSuccessSummary({
                title: 'AD CREATED SUCCESSFULLY',
                operation: 'Responsive Search Ad creation',
                details: {
                    'Ad ID': adId,
                    'Ad Group ID': adGroupId,
                    'Headlines': `${headlines.length} provided`,
                    'Descriptions': `${descriptions.length} provided`,
                    'Status': 'PAUSED',
                    'Final URL': finalUrl,
                },
                auditId: `ad_${adId}`,
                nextSteps: [
                    'Review ad in Google Ads interface',
                    'Wait for Google approval (usually 1 business day)',
                    'Enable ad when ready to start serving',
                    'Monitor performance: use list_ads to see all ads',
                ],
                warnings: [
                    'Ad created in PAUSED status - will not serve until enabled',
                    'Google must approve ad before it can serve',
                    'No edits allowed after creation - create new ad if changes needed',
                ],
            });
            return injectGuidance({
                success: true,
                customerId,
                adGroupId,
                adId,
                status: 'PAUSED',
                headlineCount: headlines.length,
                descriptionCount: descriptions.length,
            }, successText);
        }
        catch (error) {
            logger.error('Failed to create ad', error);
            // AUDIT: Log failed ad creation
            await audit.logFailedOperation('user', 'create_ad', input.customerId, error.message, {
                adGroupId: input.adGroupId,
                headlineCount: input.headlines?.length,
                descriptionCount: input.descriptions?.length,
            });
            throw error;
        }
    },
};
//# sourceMappingURL=create-ad.tool.js.map