/**
 * Export all Google Ads MCP tools
 */

// Account management
export { listAccessibleAccountsTool } from './accounts.js';

// Performance reporting
export {
  listCampaignsTool,
  getCampaignPerformanceTool,
  getSearchTermsReportTool,
  getKeywordPerformanceTool,
  listBudgetsTool,
} from './reporting/index.js';

// Campaign write operations
export { updateCampaignStatusTool, createCampaignTool } from './campaigns/index.js';

// Budget write operations
export { createBudgetTool, updateBudgetTool } from './budgets.js';

// Keyword write operations
export { addKeywordsTool, addNegativeKeywordsTool } from './keywords.js';

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

// Re-export as collection
import { listAccessibleAccountsTool } from './accounts.js';
import {
  listCampaignsTool,
  getCampaignPerformanceTool,
  getSearchTermsReportTool,
  getKeywordPerformanceTool,
  listBudgetsTool,
} from './reporting/index.js';
import { updateCampaignStatusTool, createCampaignTool } from './campaigns/index.js';
import { createBudgetTool, updateBudgetTool } from './budgets.js';
import { addKeywordsTool, addNegativeKeywordsTool } from './keywords.js';
import { conversionTools } from './conversions.js';
import { audienceTools } from './audiences.js';
import { assetTools } from './assets.js';
import { keywordPlanningTools } from './keyword-planning.js';
import { biddingTools } from './bidding.js';
import { extensionTools } from './extensions.js';

/**
 * All Google Ads tools
 */
export const googleAdsTools = [
  // Read-only tools (safe, immediate value)
  listAccessibleAccountsTool,
  listCampaignsTool,
  getCampaignPerformanceTool,
  getSearchTermsReportTool,
  listBudgetsTool,
  getKeywordPerformanceTool,

  // Write operations (with comprehensive agent guidance)
  updateCampaignStatusTool,
  createCampaignTool,
  createBudgetTool,
  updateBudgetTool,
  addKeywordsTool,
  addNegativeKeywordsTool,

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

  // Ad extensions (1 tool)
  ...extensionTools,
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
];

/**
 * Write tools (require approval)
 */
export const writeAdsTools = [
  updateCampaignStatusTool,
  createCampaignTool,
  createBudgetTool,
  updateBudgetTool,
  addKeywordsTool,
  addNegativeKeywordsTool,
];
