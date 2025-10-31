/**
 * MCP Tools for BigQuery API
 * Datasets, tables, queries, data loading
 */

import { extractOAuthToken, createBigQueryClient } from '../shared/oauth-client-factory.js';
import { getLogger } from '../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../shared/vagueness-detector.js';
import { injectGuidance, formatNextSteps } from '../shared/interactive-workflow.js';

const logger = getLogger('bigquery.tools');

/**
 * List datasets
 */
export const listDatasetsTool = {
  name: 'list_bigquery_datasets',
  description: 'List all BigQuery datasets in your project.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
  async handler(_input: any) {
    try {
      // Extract OAuth token from request
      const oauthToken = await extractOAuthToken(_input);
      if (!oauthToken) {
        throw new Error('OAuth token required for BigQuery API access');
      }

      // Create BigQuery client with user's OAuth token
      const bigquery = createBigQueryClient(oauthToken);

      logger.info('Listing BigQuery datasets');

      const [datasets] = await bigquery.getDatasets();

      const formatted = (datasets || []).map((ds: any) => ({
        id: ds.id,
        friendlyName: ds.metadata?.friendlyName,
        location: ds.metadata?.location,
        creationTime: ds.metadata?.creationTime,
      }));

      // Inject rich guidance into response
      const guidanceText = `📊 DISCOVERED ${formatted.length} BIG QUERY DATASET(S)

${formatted.map((ds, i) =>
  `${i + 1}. ${ds.friendlyName || ds.id}
   Dataset ID: ${ds.id}
   Location: ${ds.location || 'N/A'}
   Created: ${ds.creationTime ? new Date(parseInt(ds.creationTime)).toLocaleDateString() : 'N/A'}`
).join('\n\n')}

💡 WHAT ARE BIGQUERY DATASETS:

**Datasets are containers for tables** - think of them as databases:
- Organize tables by project, client, or purpose
- Control access and permissions at dataset level
- Store related data together for efficient querying
- Each dataset has a location (US, EU, etc.) affecting query performance

📊 WHAT YOU CAN DO WITH THESE DATASETS:

**Data Exploration:**
- Run SQL queries: use run_bigquery_query
- Join data across tables within a dataset
- Query multiple datasets for data blending

**Data Management:**
- Create new datasets: use create_bigquery_dataset
- Upload data from marketing platforms: use push_platform_data_to_bigquery
- Organize tables by client or project

**Reporting:**
- Build custom dashboards: use create_dashboard_from_table
- Analyze marketing performance: combine GSC, Ads, Analytics data
- Generate insights: use analyze_gsc_data_for_insights

${formatNextSteps([
  'Run a query: call run_bigquery_query with SQL',
  'Upload marketing data: call push_platform_data_to_bigquery',
  'Create dashboard: call create_dashboard_from_table with a BigQuery table'
])}

Which dataset would you like to work with?`;

      return injectGuidance(
        {
          datasets: formatted,
          count: formatted.length,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('Failed to list datasets', error as Error);
      throw error;
    }
  },
};

/**
 * Create dataset
 */
export const createDatasetTool = {
  name: 'create_bigquery_dataset',
  description: `Create a new BigQuery dataset.

💡 AGENT GUIDANCE:

🎯 WHAT THIS DOES:
- Creates dataset to organize tables
- Sets location (US, EU, multi-region)
- Configures access control

💡 USE CASES:
- "Create dataset for client XYZ marketing data"
- "Set up dataset for Google Ads + Analytics blending"`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      datasetId: {
        type: 'string',
        description: 'Dataset ID (alphanumeric, underscores)',
      },
      location: {
        type: 'string',
        description: 'Dataset location (US, EU, etc., default: US)',
      },
      description: {
        type: 'string',
        description: 'Dataset description',
      },
      confirmationToken: {
        type: 'string',
      },
    },
    required: ['datasetId'],
  },
  async handler(input: any) {
    try {
      const { datasetId, location = 'US', description, confirmationToken } = input;

      detectAndEnforceVagueness({
        operation: 'create_bigquery_dataset',
        inputText: `create dataset ${datasetId}`,
        inputParams: { datasetId },
      });

      // Extract OAuth token from request
      const oauthToken = await extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for BigQuery API access');
      }

      // Create BigQuery client with user's OAuth token
      const bigquery = createBigQueryClient(oauthToken);

      const approvalEnforcer = getApprovalEnforcer();
      const dryRunBuilder = new DryRunResultBuilder('create_bigquery_dataset', 'BigQuery', datasetId);

      dryRunBuilder.addChange({
        resource: 'Dataset',
        resourceId: datasetId,
        field: 'dataset',
        currentValue: 'N/A',
        newValue: `"${datasetId}" in ${location}`,
        changeType: 'create',
      });

      const dryRun = dryRunBuilder.build();

      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'create_bigquery_dataset',
          'BigQuery',
          datasetId,
          { datasetId }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
        return { success: true, requiresApproval: true, preview, confirmationToken: token };
      }

      logger.info('Creating dataset with confirmation', { datasetId });

      await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
        const [dataset] = await bigquery.createDataset(datasetId, { location, description });
        return dataset;
      });

      return {
        success: true,
        data: {
          datasetId,
          location,
          message: `✅ Dataset "${datasetId}" created in ${location}`,
        },
      };
    } catch (error) {
      logger.error('Failed to create dataset', error as Error);
      throw error;
    }
  },
};

/**
 * Run BigQuery SQL query
 */
export const runQueryTool = {
  name: 'run_bigquery_query',
  description: `Run SQL query in BigQuery and get results.

💡 AGENT GUIDANCE - BIGQUERY QUERIES:

🎯 WHAT THIS DOES:
- Run SQL queries against BigQuery tables
- Analyze and blend data from multiple sources
- Export results or save to new table

📊 QUERY CAPABILITIES:
- JOIN data from Google Ads, GSC, Analytics tables
- Aggregate and calculate metrics
- Filter and group data
- Create derived tables

💡 COMMON USE CASES:
- "Blend Google Ads and Search Console data"
- "Calculate ROI across all channels"
- "Find top-performing campaigns by revenue"

⚠️ COST NOTES:
- First 1TB queries/month FREE
- $6.25 per TB after that
- Check query size before running large queries`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      sql: {
        type: 'string',
        description: 'SQL query to execute',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum rows to return (default: 1000)',
      },
    },
    required: ['sql'],
  },
  async handler(input: any) {
    try {
      const { sql, maxResults = 1000 } = input;

      // Extract OAuth token from request
      const oauthToken = await extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for BigQuery API access');
      }

      // Create BigQuery client with user's OAuth token
      const bigquery = createBigQueryClient(oauthToken);

      logger.info('Running BigQuery query', { sqlLength: sql.length });

      // Execute query directly with BigQuery client
      const [job] = await bigquery.createQueryJob({
        query: sql,
        maxResults,
      });

      const [rows] = await job.getQueryResults();

      return {
        success: true,
        data: {
          rows: (rows || []).slice(0, maxResults),
          rowCount: rows?.length || 0,
          jobId: job.id,
          message: `Query completed: ${rows?.length || 0} row(s) returned`,
        },
      };
    } catch (error) {
      logger.error('Failed to run query', error as Error);
      throw error;
    }
  },
};

/**
 * Export BigQuery tools
 */
export const bigQueryTools = [
  listDatasetsTool,
  createDatasetTool,
  runQueryTool,
];
