/**
 * MCP Tools for Google Ads Extensions (Assets)
 * Includes: CallAssetService, SitelinkAssetService, etc.
 */
import { getLogger } from '../../shared/logger.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { injectGuidance, formatDiscoveryResponse, formatNextSteps } from '../../shared/interactive-workflow.js';
const logger = getLogger('ads.tools.extensions');
/**
 * List ad extensions (now called assets)
 */
export const listAdExtensionsTool = {
    name: 'list_ad_extensions',
    description: 'List all ad extensions (sitelinks, calls, structured snippets, etc.) in account.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
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
            // Account discovery
            if (!input.customerId) {
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: rn.split('/')[1],
                }));
                return formatDiscoveryResponse({
                    step: '1/2',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account would you like to list ad extensions for?',
                    nextParam: 'customerId',
                });
            }
            const { customerId } = input;
            const customer = client.getCustomer(customerId);
            logger.info('Listing ad extensions', { customerId });
            const query = `
        SELECT
          asset.id,
          asset.name,
          asset.type,
          asset.sitelink_asset.link_text,
          asset.call_asset.phone_number,
          asset.structured_snippet_asset.header,
          asset.promotion_asset.promotion_target
        FROM asset
        WHERE asset.type IN ('SITELINK', 'CALL', 'STRUCTURED_SNIPPET', 'CALLOUT', 'PROMOTION', 'PRICE')
        ORDER BY asset.type, asset.name
      `;
            const results = await customer.query(query);
            const extensions = [];
            for (const row of results) {
                const asset = row.asset;
                extensions.push({
                    id: String(asset?.id || ''),
                    name: String(asset?.name || ''),
                    type: String(asset?.type || ''),
                    sitelinkText: asset?.sitelink_asset?.link_text || undefined,
                    phoneNumber: asset?.call_asset?.phone_number || undefined,
                    snippetHeader: asset?.structured_snippet_asset?.header || undefined,
                    promotionTarget: asset?.promotion_asset?.promotion_target || undefined,
                });
            }
            // Calculate summary stats
            const byType = extensions.reduce((acc, e) => {
                acc[e.type] = (acc[e.type] || 0) + 1;
                return acc;
            }, {});
            // Inject rich guidance into response
            const guidanceText = `📊 AD EXTENSIONS (ASSETS)

**Account:** ${customerId}
**Total Extensions:** ${extensions.length}

📋 EXTENSION BREAKDOWN:
${Object.entries(byType).map(([type, count]) => `• ${type}: ${count} extension(s)`).join('\n')}

🎯 EXTENSIONS IN THIS ACCOUNT:
${extensions.slice(0, 10).map((e, i) => `${i + 1}. ${e.name} (${e.type})
   • ID: ${e.id}${e.sitelinkText ? `\n   • Link Text: "${e.sitelinkText}"` : ''}${e.phoneNumber ? `\n   • Phone: ${e.phoneNumber}` : ''}${e.snippetHeader ? `\n   • Header: "${e.snippetHeader}"` : ''}`).join('\n\n')}${extensions.length > 10 ? `\n\n... and ${extensions.length - 10} more` : ''}

💡 EXTENSION TYPES EXPLAINED:
- **SITELINK:** Additional links below your ad (e.g., "Shop Now", "Contact Us")
- **CALL:** Phone number users can click to call
- **STRUCTURED_SNIPPET:** Feature highlights (e.g., "Brands: Nike, Adidas, Puma")
- **CALLOUT:** Short text highlights (e.g., "Free Shipping", "24/7 Support")
- **PROMOTION:** Sales and discounts (e.g., "20% Off Holiday Sale")
- **PRICE:** Pricing information for services/products

🎯 WHY USE EXTENSIONS:
✅ Increase ad size and visibility (more screen real estate)
✅ Improve click-through rates (10-25% CTR boost)
✅ Provide more information without extra cost
✅ Better mobile experience (easier to call or navigate)
✅ No extra cost - only pay for clicks on main ad or extension

${formatNextSteps([
                'Create new sitelink: use create_sitelink_extension',
                'Add phone extension: use create_call_extension',
                'Check extension performance: use get_extension_performance',
                'Associate extensions with campaigns: use link_extension_to_campaign'
            ])}`;
            return injectGuidance({
                customerId,
                extensions,
                count: extensions.length,
                byType,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list ad extensions', error);
            throw error;
        }
    },
};
// Import new extension tools
// TODO: Extension tools need API integration fixes - temporarily disabled
// import {
//   createStructuredSnippetTool,
//   updateStructuredSnippetTool,
//   createCallExtensionTool,
//   updateCallExtensionTool,
//   createSitelinkExtensionTool,
//   updateSitelinkExtensionTool,
//   createCalloutExtensionTool,
//   updateCalloutExtensionTool,
//   createLocationExtensionTool,
//   updateLocationExtensionTool,
//   createPriceExtensionTool,
//   createPromotionExtensionTool,
//   updatePromotionExtensionTool,
// } from './extensions/index.js';
/**
 * Export extension tools
 */
export const extensionTools = [
    listAdExtensionsTool,
    // TODO: Extension creation tools temporarily disabled - need API fixes
    // createStructuredSnippetTool,
    // updateStructuredSnippetTool,
    // createCallExtensionTool,
    // updateCallExtensionTool,
    // createSitelinkExtensionTool,
    // updateSitelinkExtensionTool,
    // createCalloutExtensionTool,
    // updateCalloutExtensionTool,
    // createLocationExtensionTool,
    // updateLocationExtensionTool,
    // createPriceExtensionTool,
    // createPromotionExtensionTool,
    // updatePromotionExtensionTool,
];
//# sourceMappingURL=extensions.js.map