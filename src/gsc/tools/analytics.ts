/**
 * MCP Tools for Search Analytics operations
 */

import { getGoogleClient } from '../google-client.js';
import { getAuditLogger } from '../audit.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';

const logger = getLogger('gsc.tools.analytics');

/**
 * Query search analytics tool
 */
export const querySearchAnalyticsTool = {
  name: 'query_search_analytics',
  description:
    'Query search traffic data from Google Search Console with filters and aggregations',
  inputSchema: {
    type: 'object' as const,
    properties: {
      property: {
        type: 'string',
        description: 'Property URL (e.g., sc-domain:example.com)',
      },
      startDate: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format',
      },
      endDate: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format',
      },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Dimensions to group by (query, page, country, device, searchAppearance, date, hour)',
      },
      searchType: {
        type: 'string',
        enum: ['web', 'image', 'video', 'news', 'discover', 'googleNews'],
        description: 'Search type to query',
      },
      rowLimit: {
        type: 'number',
        description: 'Maximum rows to return (1-25000)',
      },
    },
    required: ['property', 'startDate', 'endDate'],
  },
  async handler(input: any) {
    try {
      const { property, startDate, endDate, dimensions, searchType, rowLimit } = input;

      // Validate input
      validateGSCProperty(property);

      const client = getGoogleClient();
      const audit = getAuditLogger();

      // Note: Access control removed for full property discovery mode
      // Google API will handle permission errors if user doesn't own the property

      logger.info('Query search analytics requested', {
        property,
        startDate,
        endDate,
        dimensionsCount: dimensions?.length || 0,
        searchType,
      });

      // Build request body
      const requestBody: any = {
        startDate,
        endDate,
      };

      if (dimensions && dimensions.length > 0) {
        requestBody.dimensions = dimensions;
      }

      if (searchType) {
        requestBody.type = searchType;
      }

      if (rowLimit) {
        requestBody.rowLimit = Math.min(rowLimit, 25000);
      } else {
        requestBody.rowLimit = 1000;
      }

      // Query API
      const response = await client.querySearchAnalytics(property, requestBody);

      // Format response
      const rows = response.rows || [];
      const formattedRows = rows.map((row: any) => ({
        keys: row.keys,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));

      await audit.logReadOperation('user', 'query_search_analytics', property, {
        startDate,
        endDate,
        rowsReturned: rows.length,
        dimensions: dimensions?.join(','),
      });

      return {
        success: true,
        data: {
          property,
          dateRange: { start: startDate, end: endDate },
          dimensions: dimensions || [],
          searchType: searchType || 'web',
          rows: formattedRows,
          rowCount: rows.length,
          message: `Retrieved ${rows.length} rows of search analytics data`,
        },
      };
    } catch (error) {
      logger.error('Failed to query search analytics', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'query_search_analytics',
        input.property,
        (error as Error).message
      );
      throw error;
    }
  },
};
