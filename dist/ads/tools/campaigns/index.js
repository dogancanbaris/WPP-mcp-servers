/**
 * Google Ads Campaign Tools - Main Export
 *
 * Central export point for all campaign management tools.
 */
// Re-export tools
export { updateCampaignStatusTool } from './update-status.tool.js';
export { createCampaignTool } from './create-campaign.tool.js';
export { updateCampaignTool } from './update-campaign.tool.js';
// Import tools for array export
import { updateCampaignStatusTool } from './update-status.tool.js';
import { createCampaignTool } from './create-campaign.tool.js';
import { updateCampaignTool } from './update-campaign.tool.js';
/**
 * Array of all campaign tools for MCP server registration
 */
export const campaignTools = [
    updateCampaignStatusTool,
    createCampaignTool,
    updateCampaignTool,
];
//# sourceMappingURL=index.js.map