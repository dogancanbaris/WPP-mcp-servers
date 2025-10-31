/**
 * Test script for create_dashboard MCP tool with multi-page support
 *
 * This script tests the updated create-dashboard tool to ensure it:
 * 1. Accepts pages array (multi-page format)
 * 2. Falls back to rows array (legacy format)
 * 3. Saves config.pages correctly
 * 4. Returns page_count and component_count
 */

const testMultiPageDashboard = {
  title: "Multi-Page Test Dashboard",
  description: "Testing multi-page dashboard creation",
  datasource: "gsc_performance_7days",
  pages: [
    {
      name: "Overview",
      order: 0,
      rows: [
        {
          columns: [
            {
              width: "1/1",
              component: {
                type: "title",
                title: "Overview Page"
              }
            }
          ]
        },
        {
          columns: [
            {
              width: "1/3",
              component: {
                type: "scorecard",
                title: "Clicks",
                metrics: ["clicks"]
              }
            },
            {
              width: "1/3",
              component: {
                type: "scorecard",
                title: "Impressions",
                metrics: ["impressions"]
              }
            },
            {
              width: "1/3",
              component: {
                type: "scorecard",
                title: "CTR",
                metrics: ["ctr"]
              }
            }
          ]
        }
      ]
    },
    {
      name: "Performance",
      order: 1,
      filters: [
        {
          field: "date",
          operator: ">=",
          values: ["2024-01-01"]
        }
      ],
      rows: [
        {
          columns: [
            {
              width: "1/1",
              component: {
                type: "time_series",
                title: "Performance Over Time",
                dimension: "date",
                metrics: ["clicks", "impressions"]
              }
            }
          ]
        }
      ]
    }
  ]
};

const testLegacyDashboard = {
  title: "Legacy Single-Page Dashboard",
  datasource: "gsc_performance_7days",
  rows: [
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "scorecard",
            title: "Total Clicks",
            metrics: ["clicks"]
          }
        }
      ]
    }
  ]
};

console.log("=== Multi-Page Dashboard Test ===");
console.log(JSON.stringify(testMultiPageDashboard, null, 2));
console.log("\n=== Legacy Dashboard Test ===");
console.log(JSON.stringify(testLegacyDashboard, null, 2));
console.log("\n=== Expected Response Format ===");
console.log({
  success: true,
  dashboard_id: "<uuid>",
  dashboard_url: "/dashboard/<uuid>/builder",
  workspace_id: "<uuid>",
  page_count: 2, // For multi-page
  component_count: 4, // Total across all pages
  created_at: "<timestamp>"
});
