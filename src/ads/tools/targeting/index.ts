/**
 * Export all campaign targeting criteria tools
 */

export { addLocationCriteriaTool } from './add-location-criteria.tool.js';
export { addLanguageCriteriaTool } from './add-language-criteria.tool.js';
export { addDemographicCriteriaTool } from './add-demographic-criteria.tool.js';
export { addAudienceCriteriaTool } from './add-audience-criteria.tool.js';
export { setAdScheduleTool } from './set-ad-schedule.tool.js';

import { addLocationCriteriaTool } from './add-location-criteria.tool.js';
import { addLanguageCriteriaTool } from './add-language-criteria.tool.js';
import { addDemographicCriteriaTool } from './add-demographic-criteria.tool.js';
import { addAudienceCriteriaTool } from './add-audience-criteria.tool.js';
import { setAdScheduleTool } from './set-ad-schedule.tool.js';

/**
 * All campaign targeting criteria tools
 */
export const targetingTools = [
  addLocationCriteriaTool,
  addLanguageCriteriaTool,
  addDemographicCriteriaTool,
  addAudienceCriteriaTool,
  setAdScheduleTool,
];
