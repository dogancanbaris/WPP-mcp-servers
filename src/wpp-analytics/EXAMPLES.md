# Dashboard Management Tools - Usage Examples

## Quick Start

### 1. Create a Simple Dashboard

```javascript
const { createDashboardTool } = require('./dist/wpp-analytics/tools/dashboards');

const result = await createDashboardTool.handler({
  title: "My First Dashboard",
  datasource: "gsc_performance_7days",
  supabaseUrl: "https://your-project.supabase.co",
  supabaseKey: "your-anon-key",
  rows: [
    {
      columns: [
        {
          width: "3/4",
          component: {
            type: "title",
            title: "SEO Performance"
          }
        },
        {
          width: "1/4",
          component: {
            type: "date_filter"
          }
        }
      ]
    },
    {
      columns: [
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Total Clicks",
            metrics: ["clicks"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Impressions",
            metrics: ["impressions"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "CTR",
            metrics: ["ctr"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Position",
            metrics: ["position"]
          }
        }
      ]
    }
  ]
});

console.log(`Dashboard created: ${result.dashboard_url}`);
// Output: Dashboard created: /dashboards/550e8400-e29b-41d4-a716-446655440000
```

---

## Complete Examples

### Example 1: SEO Performance Dashboard

Full dashboard with header, KPIs, trends, and breakdowns.

```javascript
const seoDashboard = {
  title: "Comprehensive SEO Dashboard",
  datasource: "gsc_performance_30days",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  rows: [
    // Header Row
    {
      columns: [
        {
          width: "3/4",
          component: {
            type: "title",
            title: "🚀 SEO Performance Overview - Last 30 Days"
          }
        },
        {
          width: "1/4",
          component: {
            type: "date_filter"
          }
        }
      ]
    },

    // KPI Row
    {
      columns: [
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Total Clicks",
            metrics: ["clicks"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Impressions",
            metrics: ["impressions"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Avg CTR",
            metrics: ["ctr"]
          }
        },
        {
          width: "1/4",
          component: {
            type: "scorecard",
            title: "Avg Position",
            metrics: ["position"]
          }
        }
      ]
    },

    // Trend Chart
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "time_series",
            title: "Performance Trend",
            dimension: "date",
            metrics: ["clicks", "impressions"],
            chartConfig: {
              showLegend: true,
              showDataLabels: false
            }
          }
        }
      ]
    },

    // Breakdown Charts
    {
      columns: [
        {
          width: "1/2",
          component: {
            type: "bar_chart",
            title: "Top 10 Pages by Clicks",
            dimension: "page",
            metrics: ["clicks"],
            chartConfig: {
              orientation: "horizontal"
            }
          }
        },
        {
          width: "1/2",
          component: {
            type: "bar_chart",
            title: "Top 10 Queries by Impressions",
            dimension: "query",
            metrics: ["impressions"],
            chartConfig: {
              orientation: "horizontal"
            }
          }
        }
      ]
    },

    // Detailed Table
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "table",
            title: "Query Performance Details",
            dimension: "query",
            metrics: ["clicks", "impressions", "ctr", "position"]
          }
        }
      ]
    }
  ]
};

const result = await createDashboardTool.handler(seoDashboard);
```

---

### Example 2: Google Ads Campaign Dashboard

Marketing campaign performance with spend, conversions, and ROAS.

```javascript
const adsDashboard = {
  title: "Google Ads Campaign Performance",
  datasource: "google_ads_campaign_stats",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  rows: [
    // Header
    {
      columns: [
        { width: "3/4", component: { type: "title", title: "💰 Campaign Performance Dashboard" }},
        { width: "1/4", component: { type: "date_filter" }}
      ]
    },

    // Primary KPIs
    {
      columns: [
        { width: "1/3", component: { type: "scorecard", title: "Total Spend", metrics: ["cost"] }},
        { width: "1/3", component: { type: "scorecard", title: "Conversions", metrics: ["conversions"] }},
        { width: "1/3", component: { type: "gauge", title: "ROAS", metrics: ["roas"] }}
      ]
    },

    // Secondary KPIs
    {
      columns: [
        { width: "1/4", component: { type: "scorecard", title: "Clicks", metrics: ["clicks"] }},
        { width: "1/4", component: { type: "scorecard", title: "CTR", metrics: ["ctr"] }},
        { width: "1/4", component: { type: "scorecard", title: "CPC", metrics: ["cpc"] }},
        { width: "1/4", component: { type: "scorecard", title: "CPA", metrics: ["cpa"] }}
      ]
    },

    // Trends
    {
      columns: [
        {
          width: "1/2",
          component: {
            type: "area_chart",
            title: "Daily Spend",
            dimension: "date",
            metrics: ["cost"]
          }
        },
        {
          width: "1/2",
          component: {
            type: "area_chart",
            title: "Daily Conversions",
            dimension: "date",
            metrics: ["conversions"]
          }
        }
      ]
    },

    // Campaign Breakdown
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "table",
            title: "Campaign Details",
            dimension: "campaign_name",
            metrics: ["clicks", "impressions", "cost", "conversions", "roas", "ctr", "cpc"]
          }
        }
      ]
    }
  ]
};

const result = await createDashboardTool.handler(adsDashboard);
```

---

### Example 3: Executive Summary Dashboard

High-level overview for executives with key metrics only.

```javascript
const executiveDashboard = {
  title: "Executive Summary",
  datasource: "gsc_performance_7days",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  rows: [
    {
      columns: [
        { width: "3/4", component: { type: "title", title: "📊 Weekly Executive Summary" }},
        { width: "1/4", component: { type: "date_filter" }}
      ]
    },
    {
      columns: [
        { width: "1/3", component: { type: "scorecard", title: "Organic Traffic", metrics: ["clicks"] }},
        { width: "1/3", component: { type: "scorecard", title: "Visibility", metrics: ["impressions"] }},
        { width: "1/3", component: { type: "gauge", title: "Engagement Rate", metrics: ["ctr"] }}
      ]
    },
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "time_series",
            title: "7-Day Trend",
            dimension: "date",
            metrics: ["clicks", "impressions"],
            chartConfig: { showLegend: true }
          }
        }
      ]
    }
  ]
};

const result = await createDashboardTool.handler(executiveDashboard);
```

---

## Working with Templates

### List All Templates

```javascript
const { listDashboardTemplatesTool } = require('./dist/wpp-analytics/tools/dashboards');

const templates = await listDashboardTemplatesTool.handler({});

console.log('Available templates:');
templates.templates.forEach(t => {
  console.log(`- ${t.name}: ${t.description}`);
});

// Output:
// Available templates:
// - SEO Overview: Header + 4 scorecards + time series + 2 comparison charts
// - Campaign Performance: Header + 6 scorecards + 3 charts
// - Analytics Overview: Header + 4 KPIs + traffic analysis
// - Blank Dashboard: Empty canvas
```

### Create from Template

```javascript
// Get SEO template
const template = templates.templates.find(t => t.id === 'seo_overview');

// Customize and create
const result = await createDashboardTool.handler({
  title: "My Custom SEO Dashboard",
  datasource: "gsc_performance_90days", // Changed from 7 days
  rows: template.rows,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
```

### Modify Template Before Creating

```javascript
const template = templates.templates.find(t => t.id === 'campaign_performance');

// Change a metric in first scorecard
template.rows[1].columns[0].component.title = "Daily Budget";
template.rows[1].columns[0].component.metrics = ["daily_budget"];

// Add custom row
template.rows.push({
  columns: [
    {
      width: "1/1",
      component: {
        type: "heatmap",
        title: "Performance by Day of Week",
        dimension: "day_of_week",
        metrics: ["clicks", "conversions"]
      }
    }
  ]
});

const result = await createDashboardTool.handler({
  title: "Custom Campaign Dashboard",
  datasource: "google_ads_campaign_stats",
  rows: template.rows,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
```

---

## Updating Dashboards

### Add a New Row

```javascript
const { updateDashboardLayoutTool } = require('./dist/wpp-analytics/tools/dashboards');

await updateDashboardLayoutTool.handler({
  dashboard_id: "550e8400-e29b-41d4-a716-446655440000",
  operation: "add_row",
  data: {
    columns: [
      {
        width: "1/2",
        component: {
          type: "pie_chart",
          title: "Traffic by Device",
          dimension: "device",
          metrics: ["clicks"]
        }
      },
      {
        width: "1/2",
        component: {
          type: "pie_chart",
          title: "Traffic by Country",
          dimension: "country",
          metrics: ["clicks"]
        }
      }
    ]
  },
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
```

### Update a Component

```javascript
await updateDashboardLayoutTool.handler({
  dashboard_id: "550e8400-e29b-41d4-a716-446655440000",
  operation: "update_component",
  data: {
    component_id: "col-abc123",
    component: {
      type: "time_series",
      title: "Updated Trend Chart",
      dimension: "date",
      metrics: ["clicks", "impressions", "ctr"],
      chartConfig: {
        showLegend: true,
        showDataLabels: true
      }
    }
  },
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
```

### Remove a Row

```javascript
// First, get the dashboard to find row ID
// (In production, you'd track row IDs from creation)

await updateDashboardLayoutTool.handler({
  dashboard_id: "550e8400-e29b-41d4-a716-446655440000",
  operation: "remove_row",
  data: {
    row_id: "row-xyz789"
  },
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
```

---

## Advanced Examples

### Multi-Source Dashboard

Dashboard pulling from multiple data sources (requires frontend support).

```javascript
// Create separate dashboards for each source
const seoResult = await createDashboardTool.handler({
  title: "SEO Metrics",
  datasource: "gsc_performance_7days",
  rows: [/* SEO components */],
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});

const adsResult = await createDashboardTool.handler({
  title: "Ads Metrics",
  datasource: "google_ads_campaign_stats",
  rows: [/* Ads components */],
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});

// Link them in your UI
console.log(`SEO: ${seoResult.dashboard_url}`);
console.log(`Ads: ${adsResult.dashboard_url}`);
```

### Dashboard with Filters

```javascript
const filteredDashboard = {
  title: "Filtered Performance",
  datasource: "gsc_performance_30days",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  rows: [
    {
      columns: [
        { width: "3/4", component: { type: "title", title: "US Traffic Only" }},
        { width: "1/4", component: { type: "date_filter" }}
      ]
    },
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "time_series",
            title: "US Clicks Trend",
            dimension: "date",
            metrics: ["clicks"],
            filters: [
              {
                field: "country",
                operator: "equals",
                values: ["USA"]
              }
            ]
          }
        }
      ]
    }
  ]
};

const result = await createDashboardTool.handler(filteredDashboard);
```

### Responsive Dashboard

Different layouts for mobile vs. desktop (handled by frontend).

```javascript
const responsiveDashboard = {
  title: "Responsive Dashboard",
  datasource: "gsc_performance_7days",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  rows: [
    // Header - always full width
    {
      columns: [
        { width: "3/4", component: { type: "title", title: "Performance" }},
        { width: "1/4", component: { type: "date_filter" }}
      ]
    },
    // KPIs - 1/4 on desktop, stack on mobile
    {
      columns: [
        { width: "1/4", component: { type: "scorecard", title: "Clicks", metrics: ["clicks"] }},
        { width: "1/4", component: { type: "scorecard", title: "Impressions", metrics: ["impressions"] }},
        { width: "1/4", component: { type: "scorecard", title: "CTR", metrics: ["ctr"] }},
        { width: "1/4", component: { type: "scorecard", title: "Position", metrics: ["position"] }}
      ]
    },
    // Chart - full width on all devices
    {
      columns: [
        {
          width: "1/1",
          component: {
            type: "time_series",
            title: "Trend",
            dimension: "date",
            metrics: ["clicks"]
          }
        }
      ]
    }
  ]
};

const result = await createDashboardTool.handler(responsiveDashboard);
```

---

## Error Handling Examples

### Handle Authentication Errors

```javascript
try {
  const result = await createDashboardTool.handler({
    title: "Test Dashboard",
    rows: [/* ... */],
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  });
} catch (error) {
  if (error.message.includes('not authenticated')) {
    console.error('Authentication failed. Provide workspaceId explicitly:');
    const result = await createDashboardTool.handler({
      title: "Test Dashboard",
      workspaceId: "your-workspace-id-here",
      rows: [/* ... */],
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    });
  }
}
```

### Validate Before Creating

```javascript
function validateDashboard(config) {
  const errors = [];

  if (!config.title || config.title.length === 0) {
    errors.push('Title is required');
  }

  if (!config.rows || config.rows.length === 0) {
    errors.push('At least one row is required');
  }

  config.rows?.forEach((row, i) => {
    if (!row.columns || row.columns.length === 0) {
      errors.push(`Row ${i} must have at least one column`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.join('\n')}`);
  }
}

// Usage
try {
  validateDashboard(myDashboard);
  const result = await createDashboardTool.handler(myDashboard);
} catch (error) {
  console.error('Validation error:', error.message);
}
```

---

## Testing Examples

### Unit Test

```javascript
const { createDashboardTool } = require('./dist/wpp-analytics/tools/dashboards');

describe('createDashboardTool', () => {
  it('should create a dashboard', async () => {
    const result = await createDashboardTool.handler({
      title: "Test Dashboard",
      datasource: "test_table",
      rows: [
        {
          columns: [
            { width: "1/1", component: { type: "title", title: "Test" }}
          ]
        }
      ],
      workspaceId: "test-workspace-id",
      supabaseUrl: process.env.TEST_SUPABASE_URL,
      supabaseKey: process.env.TEST_SUPABASE_KEY
    });

    expect(result.success).toBe(true);
    expect(result.dashboard_id).toBeDefined();
    expect(result.row_count).toBe(1);
    expect(result.component_count).toBe(1);
  });
});
```

### Integration Test

```javascript
describe('Dashboard Workflow', () => {
  let dashboardId;

  it('should create dashboard', async () => {
    const result = await createDashboardTool.handler({
      title: "Integration Test Dashboard",
      datasource: "gsc_performance_7days",
      rows: [{ columns: [{ width: "1/1", component: { type: "title", title: "Test" }}]}],
      workspaceId: "test-workspace-id",
      supabaseUrl: process.env.TEST_SUPABASE_URL,
      supabaseKey: process.env.TEST_SUPABASE_KEY
    });

    dashboardId = result.dashboard_id;
    expect(result.success).toBe(true);
  });

  it('should update dashboard', async () => {
    const result = await updateDashboardLayoutTool.handler({
      dashboard_id: dashboardId,
      operation: "add_row",
      data: {
        columns: [{ width: "1/1", component: { type: "scorecard", title: "Clicks", metrics: ["clicks"] }}]
      },
      supabaseUrl: process.env.TEST_SUPABASE_URL,
      supabaseKey: process.env.TEST_SUPABASE_KEY
    });

    expect(result.success).toBe(true);
    expect(result.row_count).toBe(2);
  });
});
```

---

## Production Examples

### Environment-Specific Configuration

```javascript
const getSupabaseConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
  } else {
    return {
      supabaseUrl: process.env.TEST_SUPABASE_URL,
      supabaseKey: process.env.TEST_SUPABASE_KEY
    };
  }
};

const result = await createDashboardTool.handler({
  title: "Production Dashboard",
  rows: [/* ... */],
  ...getSupabaseConfig()
});
```

### Batch Dashboard Creation

```javascript
async function createMultipleDashboards(dashboards) {
  const results = await Promise.allSettled(
    dashboards.map(config =>
      createDashboardTool.handler({
        ...config,
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`Created ${successful} dashboards, ${failed} failed`);

  return results;
}

// Usage
const dashboards = [
  { title: "SEO Dashboard", datasource: "gsc_performance_7days", rows: [/* ... */] },
  { title: "Ads Dashboard", datasource: "google_ads_campaign_stats", rows: [/* ... */] },
  { title: "Analytics Dashboard", datasource: "google_analytics_sessions", rows: [/* ... */] }
];

const results = await createMultipleDashboards(dashboards);
```

---

**Last Updated:** 2025-10-22
