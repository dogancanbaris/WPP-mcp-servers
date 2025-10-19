/**
 * Export all MCP tools
 */

export { listPropertiesTool, getPropertyTool, addPropertyTool } from './properties.js';
// deletePropertyTool REMOVED - Property deletion prohibited for safety
export { querySearchAnalyticsTool } from './analytics.js';
export {
  listSitemapsTool,
  getSitemapTool,
  submitSitemapTool,
  deleteSitemapTool,
} from './sitemaps.js';
export { inspectUrlTool } from './url-inspection.js';

// Re-export all tools as a collection
import { listPropertiesTool, getPropertyTool, addPropertyTool } from './properties.js';
// deletePropertyTool removed - property deletion prohibited
import { querySearchAnalyticsTool } from './analytics.js';
import { listSitemapsTool, getSitemapTool, submitSitemapTool, deleteSitemapTool } from './sitemaps.js';
import { inspectUrlTool } from './url-inspection.js';
import { cruxTools } from '../../crux/tools.js';
import { googleAdsTools } from '../../ads/tools/index.js';
import { analyticsTools } from '../../analytics/tools/index.js';
import { businessProfileTools } from '../../business-profile/tools.js';
import { bigQueryTools } from '../../bigquery/tools.js';
import { serpTools } from '../../serp/tools.js';

export const allTools = [
  // GSC Read operations
  listPropertiesTool,
  getPropertyTool,
  querySearchAnalyticsTool,
  listSitemapsTool,
  getSitemapTool,
  inspectUrlTool,
  // GSC Write operations
  addPropertyTool,
  submitSitemapTool,
  deleteSitemapTool,
  // deletePropertyTool REMOVED for safety
  // CrUX (Core Web Vitals) operations
  ...cruxTools,
  // Google Ads operations (25 tools)
  ...googleAdsTools,
  // Google Analytics operations (11 tools)
  ...analyticsTools,
  // Google Business Profile operations (3 tools)
  ...businessProfileTools,
  // BigQuery operations (3 tools)
  ...bigQueryTools,
  // SERP API operations (1 tool)
  ...serpTools,
];

export const readTools = [
  listPropertiesTool,
  getPropertyTool,
  querySearchAnalyticsTool,
  listSitemapsTool,
  getSitemapTool,
  inspectUrlTool,
  // CrUX tools are all read-only
  ...cruxTools,
];

export const writeTools = [
  addPropertyTool,
  submitSitemapTool,
  deleteSitemapTool,
  // deletePropertyTool REMOVED for safety
];
