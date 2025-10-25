/**
 * MCP Tools for Google Ads Extensions (Assets)
 * Includes: CallAssetService, SitelinkAssetService, etc.
 */
import { getLogger } from '../../shared/logger.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
const logger = getLogger('ads.tools.extensions');
/**
 * List ad extensions (now called assets)
 */
export const listAdExtensionsTool = {
    name: 'list_ad_extensions',
    description: `List all ad extensions (sitelinks, calls, structured snippets, etc.) in account.

💡 AGENT GUIDANCE - AD EXTENSIONS:

📊 WHAT ARE EXTENSIONS:
- Additional information shown with your ads
- Increase ad size and visibility
- Improve click-through rates
- Previously called "extensions", now called "assets"

🎯 EXTENSION TYPES:
- SITELINK - Additional links below ad
- CALL - Phone number
- STRUCTURED_SNIPPET - Feature highlights
- CALLOUT - Short text highlights
- PROMOTION - Sales and discounts
- PRICE - Pricing information
- LOCATION - Business address

💡 USE CASES:
- "Show all sitelink extensions"
- "List phone call extensions"
- "Which extensions are performing best?"`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
        },
        required: ['customerId'],
    },
    async handler(input) {
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
            return {
                success: true,
                data: {
                    customerId,
                    extensions,
                    count: extensions.length,
                    message: `Found ${extensions.length} extension(s)`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to list ad extensions', error);
            throw error;
        }
    },
};
/**
 * Export extension tools
 */
export const extensionTools = [listAdExtensionsTool];
//# sourceMappingURL=extensions.js.map