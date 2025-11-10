/**
 * Export all Google Ads MCP tools
 */

// Account management
export { listAccessibleAccountsTool, getAccountInfoTool } from './accounts.js';

// Performance reporting
export {
  listCampaignsTool,
  getCampaignPerformanceTool,
  getSearchTermsReportTool,
  getKeywordPerformanceTool,
  listBudgetsTool,
  runCustomReportTool,
  getAdGroupPerformanceTool,
  getAdPerformanceTool,
} from './reporting/index.js';

// Campaign write operations
export { updateCampaignStatusTool, createCampaignTool, updateCampaignTool } from './campaigns/index.js';

// Ad group write operations
export { createAdGroupTool, updateAdGroupTool, listAdGroupsTool, updateAdGroupBidModifierTool, getAdGroupQualityScoreTool } from './ad-groups/index.js';

// Ad creative management
export { createAdTool, listAdsTool, updateAdTool, pauseAdTool } from './ads/index.js';

// Budget write operations
export { createBudgetTool, updateBudgetTool } from './budgets.js';

// Keyword operations
export {
  addKeywordsTool,
  addNegativeKeywordsTool,
  removeNegativeKeywordsTool,
  listKeywordsTool,
  removeKeywordsTool,
  setKeywordBidTool,
  updateKeywordMatchTypeTool,
} from './keywords.js';
export { updateKeywordTool, pauseKeywordTool } from './keywords-update.js';

// Conversion tracking
export { conversionTools } from './conversions.js';

// Audience targeting
export { audienceTools } from './audiences.js';

// Assets & creative
export { assetTools } from './assets.js';

// Keyword planning
export { keywordPlanningTools } from './keyword-planning.js';

// Bidding strategies
export { biddingTools } from './bidding.js';

// Ad extensions
export { extensionTools } from './extensions.js';

// Campaign targeting criteria
export { targetingTools } from './targeting/index.js';

// Bid modifiers
export { bidModifierTools } from './bid-modifiers/index.js';

// Re-export as collection
import { listAccessibleAccountsTool, getAccountInfoTool } from './accounts.js';
import {
  listCampaignsTool,
  getCampaignPerformanceTool,
  getSearchTermsReportTool,
  getKeywordPerformanceTool,
  listBudgetsTool,
  runCustomReportTool,
  getAdGroupPerformanceTool,
  getAdPerformanceTool,
} from './reporting/index.js';
import { updateCampaignStatusTool, createCampaignTool, updateCampaignTool } from './campaigns/index.js';
import { createAdGroupTool, updateAdGroupTool, listAdGroupsTool, updateAdGroupBidModifierTool, getAdGroupQualityScoreTool } from './ad-groups/index.js';
import { createAdTool, listAdsTool, updateAdTool, pauseAdTool } from './ads/index.js';
import { createBudgetTool, updateBudgetTool } from './budgets.js';
import {
  addKeywordsTool,
  addNegativeKeywordsTool,
  removeNegativeKeywordsTool,
  listKeywordsTool,
  removeKeywordsTool,
  setKeywordBidTool,
  updateKeywordMatchTypeTool,
} from './keywords.js';
import { updateKeywordTool, pauseKeywordTool } from './keywords-update.js';
import { conversionTools } from './conversions.js';
import { audienceTools } from './audiences.js';
import { assetTools } from './assets.js';
import { keywordPlanningTools } from './keyword-planning.js';
import { biddingTools } from './bidding.js';
import { extensionTools } from './extensions.js';
import { targetingTools } from './targeting/index.js';
import { bidModifierTools } from './bid-modifiers/index.js';

/**
 * All Google Ads tools
 */
export const googleAdsTools = [
  // Read-only tools (safe, immediate value)
  listAccessibleAccountsTool,
  getAccountInfoTool,
  listCampaignsTool,
  getCampaignPerformanceTool,
  getSearchTermsReportTool,
  listBudgetsTool,
  getKeywordPerformanceTool,
  runCustomReportTool,
  getAdGroupPerformanceTool,
  getAdPerformanceTool,
  listKeywordsTool,
  listAdGroupsTool,
  listAdsTool,
  getAdGroupQualityScoreTool,

  // Write operations (with comprehensive agent guidance)
  updateCampaignStatusTool,
  createCampaignTool,
  updateCampaignTool,
  createBudgetTool,
  updateBudgetTool,
  createAdGroupTool,
  updateAdGroupTool,
  updateAdGroupBidModifierTool,
  createAdTool,
  updateAdTool,
  pauseAdTool,
  addKeywordsTool,
  addNegativeKeywordsTool,
  removeNegativeKeywordsTool,
  removeKeywordsTool,
  setKeywordBidTool,
  updateKeywordMatchTypeTool,
  updateKeywordTool,
  pauseKeywordTool,

  // Conversion tracking (5 tools)
  ...conversionTools,

  // Audience targeting (4 tools)
  ...audienceTools,

  // Assets & creative (1 tool)
  ...assetTools,

  // Keyword planning (1 tool)
  ...keywordPlanningTools,

  // Bidding strategies (1 tool)
  ...biddingTools,

  // Ad extensions (13 tools: list + sitelinks + callouts + structured + calls + locations + price + promotions)
  ...extensionTools,

  // Campaign targeting criteria (5 tools: location, language, demographic, audience, ad schedule)
  ...targetingTools,

  // Bid modifiers (4 tools: device, location, demographic, ad schedule)
  ...bidModifierTools,
];

/**
 * Read-only tools (no risk)
 */
export const readOnlyAdsTools = [
  listAccessibleAccountsTool,
  listCampaignsTool,
  getCampaignPerformanceTool,
  getSearchTermsReportTool,
  listBudgetsTool,
  getKeywordPerformanceTool,
  runCustomReportTool,
  getAdGroupPerformanceTool,
  getAdPerformanceTool,
  listKeywordsTool,
  listAdGroupsTool,
  listAdsTool,
  getAdGroupQualityScoreTool,
];

/**
 * Write tools (require approval)
 */
export const writeAdsTools = [
  updateCampaignStatusTool,
  createCampaignTool,
  createBudgetTool,
  updateBudgetTool,
  createAdGroupTool,
  updateAdGroupTool,
  updateAdGroupBidModifierTool,
  createAdTool,
  updateAdTool,
  pauseAdTool,
  addKeywordsTool,
  addNegativeKeywordsTool,
  removeNegativeKeywordsTool,
  removeKeywordsTool,
  setKeywordBidTool,
  updateKeywordMatchTypeTool,
  updateKeywordTool,
  pauseKeywordTool,
];
