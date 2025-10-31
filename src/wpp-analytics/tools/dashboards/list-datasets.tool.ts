/**
 * List Datasets Tool
 *
 * MCP tool for discovering shareable BigQuery datasets in a workspace.
 * Enables table sharing - multiple dashboards can use the same dataset.
 */

import { z } from 'zod';
import { getLogger } from '../../../shared/logger.js';
import { initSupabase, initSupabaseFromEnv } from './helpers.js';
import { injectGuidance } from '../../../shared/interactive-workflow.js';

const logger = getLogger('wpp-analytics.dashboards.list-datasets');

const ListDatasetsSchema = z.object({
  workspace_id: z.string().uuid('Invalid workspace_id format'),
  platform: z.string().optional(),
  supabaseUrl: z.string().url().optional(),
  supabaseKey: z.string().optional(),
});

export const listDatasetsTool = {
  name: 'list_datasets',
  description: `List all shareable BigQuery datasets in a workspace for table reuse.

**Purpose:**
Discover existing BigQuery tables that can be reused across multiple dashboards.
This enables table sharing - instead of creating duplicate tables, dashboards can
share the same underlying data source.

**Use Cases:**
- Before pulling GSC data, check if table already exists
- Find datasets for a specific platform (GSC, Ads, Analytics)
- Audit data sources in workspace
- Implement "create dashboard from existing data" workflows

**Table Sharing Benefits:**
1. Reduce BigQuery storage costs (no duplicate tables)
2. Faster dashboard creation (data already available)
3. Consistent data across dashboards
4. Centralized data refresh

**Parameters:**
- workspace_id: UUID of workspace to query (required)
- platform: Filter by platform type (optional, e.g., "gsc", "ads", "ga4")
- supabaseUrl: Supabase project URL (optional - loads from ENV)
- supabaseKey: Supabase API key (optional - loads from ENV)

**Example Usage - Find All Datasets:**
\`\`\`json
{
  "workspace_id": "945907d8-7e88-45c4-8fde-9db35d5f5ce2"
}
\`\`\`

**Example Usage - Find GSC Datasets Only:**
\`\`\`json
{
  "workspace_id": "945907d8-7e88-45c4-8fde-9db35d5f5ce2",
  "platform": "gsc"
}
\`\`\`

**Returns:**
\`\`\`json
{
  "success": true,
  "datasets": [
    {
      "id": "dataset-uuid-1",
      "name": "GSC Data - themindfulsteward.com",
      "bigquery_table": "gsc_performance_shared",
      "platform": "gsc",
      "property": "sc-domain:themindfulsteward.com",
      "dashboard_count": 3,
      "last_refreshed": "2025-10-28T10:00:00.000Z",
      "estimated_rows": 58000,
      "created_at": "2025-10-20T10:00:00.000Z"
    },
    {
      "id": "dataset-uuid-2",
      "name": "Google Ads Campaign Data",
      "bigquery_table": "ads_performance_shared",
      "platform": "ads",
      "property": "account-123456",
      "dashboard_count": 1,
      "last_refreshed": "2025-10-28T12:00:00.000Z",
      "estimated_rows": 125000,
      "created_at": "2025-10-21T14:00:00.000Z"
    }
  ],
  "total_count": 2,
  "by_platform": {
    "gsc": 1,
    "ads": 1
  }
}
\`\`\`

**Workflow for Dashboard Creation with Table Sharing:**

1. **Check for Existing Data:**
   \`\`\`json
   // Agent calls list_datasets first
   list_datasets({ workspace_id: "workspace-uuid", platform: "gsc" })
   \`\`\`

2. **If Dataset Exists - Reuse It:**
   \`\`\`json
   // Use existing dataset_id
   create_dashboard({
     dataset_id: "existing-dataset-uuid",
     title: "New SEO Dashboard",
     rows: [...]
   })
   \`\`\`

3. **If Dataset Doesn't Exist - Create New:**
   \`\`\`json
   // First pull data
   push_platform_data_to_bigquery({
     platform: "gsc",
     property: "sc-domain:example.com",
     useSharedTable: true,
     workspaceId: "workspace-uuid"
   })
   // Then create dashboard (will auto-create dataset entry)
   create_dashboard_from_table({
     bigqueryTable: "gsc_performance_shared",
     ...
   })
   \`\`\`

**Best Practices:**
1. Always call list_datasets before pulling new data
2. Reuse datasets when possible (saves time and storage)
3. Use platform filter to narrow search
4. Check dashboard_count to see usage
5. Monitor last_refreshed to ensure data is fresh

**Benefits:**
- Faster workflows (skip data pull if table exists)
- Cost savings (no duplicate BigQuery tables)
- Better data governance (centralized sources)

**Error Handling:**
- Returns error if workspace not found
- Returns error if user doesn't have access
- Validates workspace_id format`,

  inputSchema: {
    type: 'object' as const,
    properties: {
      workspace_id: {
        type: 'string',
        description: 'Workspace UUID to query datasets',
      },
      platform: {
        type: 'string',
        description: 'Filter by platform (e.g., "gsc", "ads", "ga4")',
      },
      supabaseUrl: {
        type: 'string',
        description: 'Supabase project URL (optional - loads from ENV if not provided)',
      },
      supabaseKey: {
        type: 'string',
        description: 'Supabase API key (optional - loads from ENV if not provided)',
      },
    },
    required: ['workspace_id'],
  },

  async handler(input: any) {
    try {
      // Validate input
      const validated = ListDatasetsSchema.parse(input);

      logger.info('list_datasets called', {
        workspace_id: validated.workspace_id,
        platform: validated.platform,
      });

      // Initialize Supabase (from ENV or parameters)
      const supabase = validated.supabaseUrl && validated.supabaseKey
        ? initSupabase(validated.supabaseUrl, validated.supabaseKey)
        : initSupabaseFromEnv();

      // Build query
      let query = supabase
        .from('datasets')
        .select(`
          id,
          name,
          description,
          bigquery_table_id,
          platform_metadata,
          last_refreshed_at,
          estimated_row_count,
          data_freshness_days,
          created_at,
          updated_at
        `)
        .eq('workspace_id', validated.workspace_id)
        .order('created_at', { ascending: false });

      // Apply platform filter if provided
      if (validated.platform) {
        query = query.filter('platform_metadata->>platform', 'eq', validated.platform);
      }

      const { data: datasets, error: queryError } = await query;

      if (queryError) {
        logger.error('Dataset query failed', { error: queryError.message });
        throw new Error(`Failed to query datasets: ${queryError.message}`);
      }

      if (!datasets || datasets.length === 0) {
        logger.info('No datasets found', {
          workspace_id: validated.workspace_id,
          platform: validated.platform,
        });
        return {
          success: true,
          datasets: [],
          total_count: 0,
          by_platform: {},
          message: validated.platform
            ? `No ${validated.platform} datasets found in this workspace`
            : 'No datasets found in this workspace',
        };
      }

      // For each dataset, get dashboard count
      const datasetsWithCounts = await Promise.all(
        datasets.map(async (dataset) => {
          const { count } = await supabase
            .from('dashboards')
            .select('id', { count: 'exact', head: true })
            .eq('dataset_id', dataset.id);

          const metadata = dataset.platform_metadata || {};

          return {
            id: dataset.id,
            name: dataset.name,
            description: dataset.description,
            bigquery_table: dataset.bigquery_table_id,
            platform: metadata.platform || 'unknown',
            property: metadata.property || null,
            dashboard_count: count || 0,
            last_refreshed: dataset.last_refreshed_at,
            estimated_rows: dataset.estimated_row_count,
            data_freshness_days: dataset.data_freshness_days,
            created_at: dataset.created_at,
            updated_at: dataset.updated_at,
          };
        })
      );

      // Calculate platform distribution
      const byPlatform: Record<string, number> = {};
      datasetsWithCounts.forEach((dataset) => {
        const platform = dataset.platform || 'unknown';
        byPlatform[platform] = (byPlatform[platform] || 0) + 1;
      });

      logger.info('Datasets retrieved successfully', {
        workspace_id: validated.workspace_id,
        total_count: datasetsWithCounts.length,
        by_platform: byPlatform,
      });

      // Build rich guidance response
      const platformSummary = Object.entries(byPlatform)
        .map(([platform, count]) => `   • ${platform.toUpperCase()}: ${count} dataset${count !== 1 ? 's' : ''}`)
        .join('\n');

      const guidanceText = `📊 FOUND ${datasetsWithCounts.length} DATASET${datasetsWithCounts.length !== 1 ? 'S' : ''}

${datasetsWithCounts.map((d, i) => `${i + 1}. **${d.name}**
   • Platform: ${d.platform.toUpperCase()}
   • BigQuery Table: ${d.bigquery_table}
   • Property: ${d.property || 'N/A'}
   • Used by ${d.dashboard_count} dashboard${d.dashboard_count !== 1 ? 's' : ''}
   • Last Refreshed: ${d.last_refreshed ? new Date(d.last_refreshed).toLocaleDateString() : 'Never'}
   • Estimated Rows: ${d.estimated_rows?.toLocaleString() || 'Unknown'}
   • Data Freshness: ${d.data_freshness_days || 'Unknown'} days`).join('\n\n')}

📈 **BY PLATFORM:**
${platformSummary}

💡 WHAT YOU CAN DO NEXT:
   • Reuse dataset: use create_dashboard with dataset_id
   • Check data freshness: Review last_refreshed timestamps
   • Create new dataset: use push_platform_data_to_bigquery
   • View dashboards using this data: use list_dashboards with workspace_id

💰 **TABLE SHARING BENEFITS:**
   • No duplicate BigQuery tables (cost savings)
   • Faster dashboard creation (data already available)
   • Consistent data across dashboards

${validated.platform ? `🔍 **Filtered by platform:** ${validated.platform}` : ''}`;

      return injectGuidance(
        {
          datasets: datasetsWithCounts,
          total_count: datasetsWithCounts.length,
          by_platform: byPlatform,
        },
        guidanceText
      );
    } catch (error) {
      logger.error('list_datasets failed', { error });

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation error',
          details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
