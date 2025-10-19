/**
 * MCP Tools for Chrome UX Report API operations
 */

import { getCruxClient } from './client.js';
import { validateCruxQuery, hasOrigin, hasUrl } from './validation.js';
import { getLogger } from '../shared/logger.js';
import type { FormFactor } from './types.js';

const logger = getLogger('crux.tools');

/**
 * Get Core Web Vitals for an origin (entire domain)
 */
export const getCoreWebVitalsOriginTool = {
  name: 'get_core_web_vitals_origin',
  description:
    'Get Core Web Vitals metrics (LCP, INP, CLS) for an entire origin/domain. Returns p75 values and distribution (good/needs improvement/poor percentages).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      origin: {
        type: 'string',
        description: 'Origin URL (e.g., https://keepersdigital.com)',
      },
      formFactor: {
        type: 'string',
        enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
        description: 'Device type to query. Defaults to ALL (aggregated across all devices)',
      },
    },
    required: ['origin'],
  },
  async handler(input: any) {
    try {
      validateCruxQuery(input);

      const client = getCruxClient();

      logger.info('Querying CWV for origin', { origin: input.origin, formFactor: input.formFactor });

      const response = await client.queryRecord({
        origin: input.origin,
        ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
      });

      const processed = client.processCWVData(response);

      return {
        success: true,
        data: {
          origin: input.origin,
          formFactor: input.formFactor || 'ALL',
          ...processed,
          message: `Core Web Vitals retrieved for ${input.origin}`,
        },
      };
    } catch (error) {
      logger.error('Failed to get CWV for origin', error as Error);
      throw error;
    }
  },
};

/**
 * Get Core Web Vitals for a specific URL
 */
export const getCoreWebVitalsUrlTool = {
  name: 'get_core_web_vitals_url',
  description:
    'Get Core Web Vitals metrics for a specific page URL. Returns p75 values and distribution for that page.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string',
        description: 'Full page URL (e.g., https://keepersdigital.com/about)',
      },
      formFactor: {
        type: 'string',
        enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
        description: 'Device type to query. Defaults to ALL',
      },
    },
    required: ['url'],
  },
  async handler(input: any) {
    try {
      validateCruxQuery(input);

      const client = getCruxClient();

      logger.info('Querying CWV for URL', { url: input.url, formFactor: input.formFactor });

      const response = await client.queryRecord({
        url: input.url,
        ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
      });

      const processed = client.processCWVData(response);

      return {
        success: true,
        data: {
          url: input.url,
          formFactor: input.formFactor || 'ALL',
          ...processed,
          message: `Core Web Vitals retrieved for ${input.url}`,
        },
      };
    } catch (error) {
      logger.error('Failed to get CWV for URL', error as Error);
      throw error;
    }
  },
};

/**
 * Get historical Core Web Vitals for an origin
 */
export const getCwvHistoryOriginTool = {
  name: 'get_cwv_history_origin',
  description:
    'Get historical Core Web Vitals data for an origin over time. Shows trends in CWV metrics.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      origin: {
        type: 'string',
        description: 'Origin URL (e.g., https://keepersdigital.com)',
      },
      formFactor: {
        type: 'string',
        enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
        description: 'Device type to query. Defaults to ALL',
      },
    },
    required: ['origin'],
  },
  async handler(input: any) {
    try {
      validateCruxQuery(input);

      const client = getCruxClient();

      logger.info('Querying CWV history for origin', { origin: input.origin, formFactor: input.formFactor });

      const response = await client.queryHistoryRecord({
        origin: input.origin,
        ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
      });

      return {
        success: true,
        data: {
          origin: input.origin,
          formFactor: input.formFactor || 'ALL',
          history: response.record,
          collectionPeriods: response.record.collectionPeriods,
          message: `Historical Core Web Vitals retrieved for ${input.origin}`,
        },
      };
    } catch (error) {
      logger.error('Failed to get CWV history for origin', error as Error);
      throw error;
    }
  },
};

/**
 * Get historical Core Web Vitals for a specific URL
 */
export const getCwvHistoryUrlTool = {
  name: 'get_cwv_history_url',
  description:
    'Get historical Core Web Vitals data for a specific page over time. Shows trends in CWV metrics for that page.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string',
        description: 'Full page URL (e.g., https://keepersdigital.com/about)',
      },
      formFactor: {
        type: 'string',
        enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
        description: 'Device type to query. Defaults to ALL',
      },
    },
    required: ['url'],
  },
  async handler(input: any) {
    try {
      validateCruxQuery(input);

      const client = getCruxClient();

      logger.info('Querying CWV history for URL', { url: input.url, formFactor: input.formFactor });

      const response = await client.queryHistoryRecord({
        url: input.url,
        ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
      });

      return {
        success: true,
        data: {
          url: input.url,
          formFactor: input.formFactor || 'ALL',
          history: response.record,
          collectionPeriods: response.record.collectionPeriods,
          message: `Historical Core Web Vitals retrieved for ${input.url}`,
        },
      };
    } catch (error) {
      logger.error('Failed to get CWV history for URL', error as Error);
      throw error;
    }
  },
};

/**
 * Compare Core Web Vitals across form factors
 */
export const compareCwvFormFactorsTool = {
  name: 'compare_cwv_form_factors',
  description:
    'Compare Core Web Vitals across different device types (desktop, mobile, tablet) for an origin or URL.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      origin: {
        type: 'string',
        description: 'Origin URL (e.g., https://keepersdigital.com)',
      },
      url: {
        type: 'string',
        description: 'Full page URL (alternative to origin)',
      },
    },
  },
  async handler(input: any) {
    try {
      if (!hasOrigin(input) && !hasUrl(input)) {
        throw new Error('Must provide either origin or url');
      }

      const client = getCruxClient();
      const formFactors: FormFactor[] = ['DESKTOP', 'PHONE', 'TABLET'];
      const results: any = {
        target: (input as any).origin || (input as any).url,
        comparison: {},
      };

      logger.info('Comparing CWV across form factors', {
        origin: (input as any).origin,
        url: (input as any).url,
      });

      for (const formFactor of formFactors) {
        try {
          const response = await client.queryRecord({
            origin: (input as any).origin,
            url: (input as any).url,
            formFactor,
          });

          const processed = client.processCWVData(response);
          results.comparison[formFactor] = processed;
        } catch (error) {
          // Some form factors might not have data
          results.comparison[formFactor] = {
            error: (error as Error).message,
          };
        }
      }

      return {
        success: true,
        data: {
          ...results,
          message: `Core Web Vitals comparison completed for ${results.target}`,
        },
      };
    } catch (error) {
      logger.error('Failed to compare CWV across form factors', error as Error);
      throw error;
    }
  },
};

/**
 * Export all CrUX tools
 */
export const cruxTools = [
  getCoreWebVitalsOriginTool,
  getCoreWebVitalsUrlTool,
  getCwvHistoryOriginTool,
  getCwvHistoryUrlTool,
  compareCwvFormFactorsTool,
];
