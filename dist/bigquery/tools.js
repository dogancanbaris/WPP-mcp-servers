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
        type: 'object',
        properties: {},
    },
    async handler(_input) {
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
            const formatted = (datasets || []).map((ds) => ({
                id: ds.id,
                friendlyName: ds.metadata?.friendlyName,
                location: ds.metadata?.location,
                creationTime: ds.metadata?.creationTime,
            }));
            // Inject rich guidance into response
            const guidanceText = `📊 DISCOVERED ${formatted.length} BIG QUERY DATASET(S)

${formatted.map((ds, i) => `${i + 1}. ${ds.friendlyName || ds.id}
   Dataset ID: ${ds.id}
   Location: ${ds.location || 'N/A'}
   Created: ${ds.creationTime ? new Date(parseInt(ds.creationTime)).toLocaleDateString() : 'N/A'}`).join('\n\n')}

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
            return injectGuidance({
                datasets: formatted,
                count: formatted.length,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list datasets', error);
            throw error;
        }
    },
};
/**
 * Create dataset
 */
export const createDatasetTool = {
    name: 'create_bigquery_dataset',
    description: 'Create a new BigQuery dataset to organize tables.',
    inputSchema: {
        type: 'object',
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
    async handler(input) {
        try {
            const { datasetId, location = 'US', description, confirmationToken } = input;
            // Discovery: Prompt for dataset ID if missing
            if (!datasetId) {
                return injectGuidance({}, `💾 CREATE BIGQUERY DATASET (Step 1/2)

**What is a Dataset?**
A dataset is a container for tables, like a database. Organize your marketing data by client, project, or platform.

**Naming Guidelines:**
- Use lowercase letters, numbers, underscores
- Descriptive name: "client_acme_marketing", "gsc_data_2025"
- No spaces or special characters
- Examples: "wpp_marketing", "client_xyz_analytics"

**Common Dataset Structures:**

**By Client:**
- client_acme_marketing (all Acme data)
- client_xyz_analytics (all XYZ data)

**By Platform:**
- google_ads_data (all Ads tables)
- search_console_data (all GSC tables)

**By Project:**
- q1_campaign_analysis
- annual_performance_report

🎯 **What dataset ID would you like to create?**
Provide: datasetId parameter (e.g., "client_acme_marketing")`);
            }
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
            dryRunBuilder.addRecommendation('After creating dataset, you can add tables using push_platform_data_to_bigquery');
            dryRunBuilder.addRecommendation(`Dataset will be created in ${location} region. Choose EU for GDPR compliance if needed.`);
            const dryRun = dryRunBuilder.build();
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_bigquery_dataset', 'BigQuery', datasetId, { datasetId });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return { success: true, requiresApproval: true, preview, confirmationToken: token };
            }
            logger.info('Creating dataset with confirmation', { datasetId });
            await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const [dataset] = await bigquery.createDataset(datasetId, { location, description });
                return dataset;
            });
            const guidanceText = `✅ DATASET CREATED SUCCESSFULLY

**Dataset Details:**
- Dataset ID: ${datasetId}
- Location: ${location}
- Description: ${description || 'None'}

💡 **WHAT YOU CAN DO NEXT:**
${formatNextSteps([
                'Add tables: use push_platform_data_to_bigquery',
                'Query data: use run_bigquery_query',
                'Create dashboard: use create_dashboard_from_table',
                'List tables: SELECT * FROM \`${datasetId}.INFORMATION_SCHEMA.TABLES\`'
            ])}

📊 **Common Use Cases:**
- Import Google Ads data: push_platform_data_to_bigquery with platform="google_ads"
- Import Search Console data: push_platform_data_to_bigquery with platform="gsc"
- Create custom dashboards: use create_dashboard_from_table with your tables`;
            return injectGuidance({
                datasetId,
                location,
                description,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to create dataset', error);
            throw error;
        }
    },
};
/**
 * Run BigQuery SQL query
 */
export const runQueryTool = {
    name: 'run_bigquery_query',
    description: 'Run SQL query in BigQuery and get results.',
    inputSchema: {
        type: 'object',
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
    async handler(input) {
        try {
            const { sql, maxResults = 1000 } = input;
            // Discovery: Prompt for SQL if missing
            if (!sql) {
                return injectGuidance({}, `💾 BIGQUERY QUERY BUILDER

**What is BigQuery?**
BigQuery is Google's data warehouse. Run SQL queries to analyze data from Google Ads, Search Console, Analytics, and custom tables.

**Example Queries:**

**List Tables in a Dataset:**
\`\`\`sql
SELECT table_name, row_count, size_bytes
FROM \`project-id.dataset-name.INFORMATION_SCHEMA.TABLES\`
ORDER BY row_count DESC
\`\`\`

**Query Marketing Data:**
\`\`\`sql
SELECT date, SUM(clicks) as total_clicks, SUM(impressions) as total_impressions
FROM \`mcp-servers-475317.wpp_marketing.gsc_performance_shared\`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND workspace_id = 'your-workspace-id'
GROUP BY date
ORDER BY date DESC
LIMIT 100
\`\`\`

**Join Multiple Sources:**
\`\`\`sql
SELECT
  gsc.date,
  gsc.query,
  gsc.clicks as organic_clicks,
  ads.clicks as paid_clicks,
  (gsc.clicks + ads.clicks) as total_clicks
FROM \`project.dataset.gsc_table\` gsc
LEFT JOIN \`project.dataset.ads_table\` ads
  ON gsc.date = ads.date AND gsc.query = ads.keyword
WHERE gsc.date >= '2025-10-01'
LIMIT 1000
\`\`\`

💰 **Cost Notes:**
- First 1 TB queries/month: FREE
- After 1 TB: $6.25 per TB
- Your queries are likely under 1 MB each (FREE tier)

🎯 **What query would you like to run?**
Provide: sql parameter with your SQL query`);
            }
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
            // Format results with rich analysis
            const rowCount = rows?.length || 0;
            const jobId = job.id || 'unknown';
            const guidanceText = `📊 BIGQUERY QUERY RESULTS

**Query Executed Successfully**
Job ID: ${jobId}
Rows Returned: ${rowCount} ${rowCount >= maxResults ? `(limited to ${maxResults})` : ''}

${rowCount > 0 ? `**Sample Data (First 3 Rows):**
${JSON.stringify((rows || []).slice(0, 3), null, 2)}

**Column Names:**
${Object.keys(rows[0] || {}).join(', ')}` : '**No rows returned.** Check your WHERE clause or date range.'}

💡 **WHAT YOU CAN DO NEXT:**
${formatNextSteps([
                'Export results: Save to CSV or create dashboard',
                'Refine query: Adjust filters or add aggregations',
                'Create dashboard: use create_dashboard_from_table',
                'Join more data: Add other platform tables to your query'
            ])}

📈 **Analysis Tips:**
- Use GROUP BY for aggregations (SUM, AVG, COUNT)
- Add date filters to speed up queries
- Use workspace_id to isolate your data in shared tables
- JOIN tables to blend data from multiple platforms`;
            return injectGuidance({
                rows: (rows || []).slice(0, maxResults),
                rowCount,
                jobId,
                columns: rowCount > 0 ? Object.keys(rows[0]) : [],
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to run query', error);
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
//# sourceMappingURL=tools.js.map