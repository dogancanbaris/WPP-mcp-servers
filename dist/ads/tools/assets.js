/**
 * MCP Tools for Google Ads Assets & Creative
 * Includes: AssetService, AssetGroupService
 */
import { getGoogleAdsClient } from '../client.js';
import { getLogger } from '../../shared/logger.js';
const logger = getLogger('ads.tools.assets');
/**
 * List assets
 */
export const listAssetsTool = {
    name: 'list_assets',
    description: `List all assets (images, videos, text) in Google Ads account.

💡 AGENT GUIDANCE - ASSETS:

📊 WHAT ARE ASSETS:
- Images, logos, videos, headlines, descriptions
- Used in responsive ads and Performance Max campaigns
- Reusable across multiple campaigns

🎯 ASSET TYPES:
- IMAGE - Product photos, lifestyle images
- VIDEO - YouTube videos
- TEXT - Headlines and descriptions
- LOGO - Brand logos
- CALL_TO_ACTION - Button text

📋 USE CASES:
- "Show me all uploaded images"
- "List assets for Performance Max campaign"
- "Which assets have the best performance?"`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            assetType: {
                type: 'string',
                enum: ['IMAGE', 'VIDEO', 'TEXT', 'YOUTUBE_VIDEO', 'MEDIA_BUNDLE', 'LOGO'],
                description: 'Filter by asset type (optional)',
            },
        },
        required: ['customerId'],
    },
    async handler(input) {
        try {
            const { customerId, assetType } = input;
            const client = getGoogleAdsClient();
            logger.info('Listing assets', { customerId, assetType });
            let query = `
        SELECT
          asset.id,
          asset.name,
          asset.type,
          asset.image_asset.full_size.url,
          asset.youtube_video_asset.youtube_video_id,
          asset.text_asset.text
        FROM asset
        WHERE asset.type != 'UNSPECIFIED'
      `;
            if (assetType) {
                query += ` AND asset.type = '${assetType}'`;
            }
            query += ' ORDER BY asset.name';
            const customer = client.getCustomer(customerId);
            const results = await customer.query(query);
            const assets = [];
            for (const row of results) {
                const asset = row.asset;
                assets.push({
                    id: String(asset?.id || ''),
                    name: String(asset?.name || ''),
                    type: String(asset?.type || ''),
                    imageUrl: asset?.image_asset?.full_size?.url || undefined,
                    youtubeVideoId: asset?.youtube_video_asset?.youtube_video_id || undefined,
                    text: asset?.text_asset?.text || undefined,
                });
            }
            return {
                success: true,
                data: {
                    customerId,
                    assets,
                    count: assets.length,
                    message: `Found ${assets.length} asset(s)`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to list assets', error);
            throw error;
        }
    },
};
/**
 * Export asset tools
 */
export const assetTools = [listAssetsTool];
//# sourceMappingURL=assets.js.map