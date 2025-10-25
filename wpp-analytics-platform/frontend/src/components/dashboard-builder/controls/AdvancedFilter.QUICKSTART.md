# AdvancedFilter - Quick Start Guide

Get started with the AdvancedFilter component in 5 minutes!

## 🚀 Quick Start

### Step 1: Import

```tsx
import { AdvancedFilter, FilterGroup } from './components/dashboard-builder/controls';
import './components/dashboard-builder/controls/AdvancedFilter.css';
```

### Step 2: Define Your Fields

```tsx
const fields = [
  { name: 'campaign_name', label: 'Campaign Name', dataType: 'string' },
  { name: 'impressions', label: 'Impressions', dataType: 'number' },
  { name: 'clicks', label: 'Clicks', dataType: 'number' },
  { name: 'cost', label: 'Cost', dataType: 'number' },
  { name: 'date', label: 'Date', dataType: 'date' },
  {
    name: 'status',
    label: 'Status',
    dataType: 'string',
    values: ['ENABLED', 'PAUSED', 'REMOVED'] // Creates dropdown
  },
];
```

### Step 3: Initialize State

```tsx
const [filter, setFilter] = useState<FilterGroup>({
  id: 'root-' + Date.now(),
  operator: 'AND',
  enabled: true,
  conditions: [],
  groups: [],
});
```

### Step 4: Render Component

```tsx
<AdvancedFilter
  value={filter}
  onChange={setFilter}
  availableFields={fields}
  maxDepth={3}
/>
```

### Step 5: Use the Filter

```tsx
import { convertFilterToSQL } from './AdvancedFilter.example';

// Generate SQL
const sqlWhere = convertFilterToSQL(filter);
const query = `SELECT * FROM campaigns WHERE ${sqlWhere}`;

// Or use with Cube.js
const cubeQuery = {
  measures: ['Campaigns.cost'],
  dimensions: ['Campaigns.name'],
  filters: convertGroupToCubeFilters(filter),
};
```

## 🎯 Common Use Cases

### Use Case 1: Simple Filter

Filter enabled campaigns with more than 1000 impressions:

```tsx
const simpleFilter: FilterGroup = {
  id: 'root',
  operator: 'AND',
  enabled: true,
  conditions: [
    {
      id: 'c1',
      field: 'status',
      operator: 'equals',
      value: 'ENABLED',
      dataType: 'string',
      enabled: true,
    },
    {
      id: 'c2',
      field: 'impressions',
      operator: 'greater_than',
      value: '1000',
      dataType: 'number',
      enabled: true,
    },
  ],
  groups: [],
};

// Result: status = 'ENABLED' AND impressions > 1000
```

### Use Case 2: Complex Filter with OR Logic

Campaigns that are either high-performing OR high-cost:

```tsx
const complexFilter: FilterGroup = {
  id: 'root',
  operator: 'OR',
  enabled: true,
  conditions: [
    {
      id: 'c1',
      field: 'impressions',
      operator: 'greater_than',
      value: '10000',
      dataType: 'number',
      enabled: true,
    },
    {
      id: 'c2',
      field: 'cost',
      operator: 'greater_than',
      value: '1000',
      dataType: 'number',
      enabled: true,
    },
  ],
  groups: [],
};

// Result: impressions > 10000 OR cost > 1000
```

### Use Case 3: Nested Groups

Active campaigns with (high impressions OR high clicks):

```tsx
const nestedFilter: FilterGroup = {
  id: 'root',
  operator: 'AND',
  enabled: true,
  conditions: [
    {
      id: 'c1',
      field: 'status',
      operator: 'equals',
      value: 'ENABLED',
      dataType: 'string',
      enabled: true,
    },
  ],
  groups: [
    {
      id: 'g1',
      operator: 'OR',
      enabled: true,
      conditions: [
        {
          id: 'c2',
          field: 'impressions',
          operator: 'greater_than',
          value: '10000',
          dataType: 'number',
          enabled: true,
        },
        {
          id: 'c3',
          field: 'clicks',
          operator: 'greater_than',
          value: '1000',
          dataType: 'number',
          enabled: true,
        },
      ],
      groups: [],
    },
  ],
};

// Result: status = 'ENABLED' AND (impressions > 10000 OR clicks > 1000)
```

## 🔧 Common Operations

### Get Filter Summary

```tsx
import { getFilterSummary } from './AdvancedFilter.utils';

const summary = getFilterSummary(filter);
console.log(summary); // "3 conditions, 1 group"
```

### Validate Filter

```tsx
import { validateFilterGroup } from './AdvancedFilter.utils';

const { isValid, errors } = validateFilterGroup(filter);
if (!isValid) {
  alert('Invalid filter: ' + errors.join(', '));
}
```

### Convert to Human-Readable

```tsx
import { filterToString } from './AdvancedFilter.utils';

const readable = filterToString(filter);
console.log(readable);
// "status equals 'ENABLED' AND impressions greater than 10000"
```

### Save to localStorage

```tsx
import { serializeFilter, deserializeFilter } from './AdvancedFilter.utils';

// Save
localStorage.setItem('myFilter', serializeFilter(filter));

// Load
const loaded = deserializeFilter(localStorage.getItem('myFilter'));
if (loaded) {
  setFilter(loaded);
}
```

### Share via URL

```tsx
import { compressFilter, decompressFilter } from './AdvancedFilter.utils';

// Encode for URL
const compressed = compressFilter(filter);
const shareUrl = `${window.location.origin}/dashboard?filter=${compressed}`;

// Decode from URL
const params = new URLSearchParams(window.location.search);
const restored = decompressFilter(params.get('filter'));
if (restored) {
  setFilter(restored);
}
```

## 📊 Integration Examples

### With BigQuery

```tsx
function BigQueryExample() {
  const [filter, setFilter] = useState(initialFilter);
  const [results, setResults] = useState([]);

  const runQuery = async () => {
    const whereClause = convertFilterToSQL(filter);
    const sql = `
      SELECT
        campaign_name,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(cost) as cost
      FROM \`project.dataset.google_ads_data\`
      WHERE ${whereClause}
      GROUP BY campaign_name
      ORDER BY cost DESC
      LIMIT 100
    `;

    const data = await runBigQueryQuery(sql);
    setResults(data);
  };

  return (
    <>
      <AdvancedFilter
        value={filter}
        onChange={setFilter}
        availableFields={fields}
      />
      <button onClick={runQuery}>Run Query</button>
      <DataTable data={results} />
    </>
  );
}
```

### With Cube.js

```tsx
import { useCubeQuery } from '@cubejs-client/react';

function CubeExample() {
  const [filter, setFilter] = useState(initialFilter);

  const { resultSet, isLoading } = useCubeQuery({
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
    dimensions: ['GoogleAds.campaignName'],
    filters: convertGroupToCubeFilters(filter),
    timeDimensions: [{
      dimension: 'GoogleAds.date',
      dateRange: 'last 30 days',
    }],
  });

  return (
    <>
      <AdvancedFilter
        value={filter}
        onChange={setFilter}
        availableFields={fields}
      />
      {isLoading ? <Spinner /> : <Chart data={resultSet} />}
    </>
  );
}
```

### With REST API

```tsx
function RestAPIExample() {
  const [filter, setFilter] = useState(initialFilter);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const apiFilter = convertFilterToAPI(filter);
    const params = new URLSearchParams({
      filter: JSON.stringify(apiFilter),
      limit: '100',
    });

    const response = await fetch(`/api/campaigns?${params}`);
    const json = await response.json();
    setData(json.data);
  };

  return (
    <>
      <AdvancedFilter
        value={filter}
        onChange={setFilter}
        availableFields={fields}
      />
      <button onClick={fetchData}>Fetch Data</button>
      <DataTable data={data} />
    </>
  );
}
```

## 🎨 Customization

### Custom Styling

```tsx
<AdvancedFilter
  className="my-filter"
  // ... other props
/>
```

```css
.my-filter {
  border: 2px solid #3b82f6;
}

.my-filter .filter-condition {
  background: #eff6ff;
}

.my-filter .operator-toggle.and {
  background: #dbeafe;
}
```

### Custom Operators

Want to add custom operators? Extend the component:

```tsx
// In your fork/copy
const CUSTOM_OPERATORS = {
  ...OPERATORS_BY_TYPE,
  string: [
    ...OPERATORS_BY_TYPE.string,
    'sounds_like', // Add custom operator
  ],
};
```

## 🐛 Troubleshooting

### Problem: "Value is required" error

**Solution**: Make sure values are provided for operators that need them:

```tsx
// ❌ Wrong
{ operator: 'equals', value: '' }

// ✅ Correct
{ operator: 'equals', value: 'ENABLED' }

// ✅ Also correct (for null checks)
{ operator: 'is_null', value: null }
```

### Problem: Filter not updating

**Solution**: Make sure you're using controlled component pattern:

```tsx
// ❌ Wrong
const [filter, setFilter] = useState(initial);
<AdvancedFilter value={filter} onChange={(f) => console.log(f)} />

// ✅ Correct
const [filter, setFilter] = useState(initial);
<AdvancedFilter value={filter} onChange={setFilter} />
```

### Problem: "Between" operator showing one input

**Solution**: Between requires array value:

```tsx
// ❌ Wrong
{ operator: 'between', value: '100' }

// ✅ Correct
{ operator: 'between', value: ['100', '500'] }
```

## 📚 Next Steps

1. Read the full [README](./AdvancedFilter.README.md) for complete documentation
2. Check out the [Examples](./AdvancedFilter.example.tsx) for more patterns
3. Review the [Tests](./AdvancedFilter.test.tsx) for usage patterns
4. Explore [Utilities](./AdvancedFilter.utils.ts) for helper functions

## 💡 Pro Tips

1. **Use predefined values** for dropdowns instead of free text
2. **Validate filters** before sending to API to catch errors early
3. **Compress filters** when storing in URLs to avoid length limits
4. **Simplify filters** periodically to optimize performance
5. **Enable/disable** instead of deleting to preserve user's work
6. **Duplicate conditions** to speed up filter building

## 🎯 Real-World Example

Complete working example for Google Ads dashboard:

```tsx
import React, { useState, useEffect } from 'react';
import { AdvancedFilter, FilterGroup, validateFilterGroup } from './controls';
import { convertFilterToSQL } from './AdvancedFilter.example';

const GOOGLE_ADS_FIELDS = [
  { name: 'campaign_name', label: 'Campaign Name', dataType: 'string' },
  { name: 'campaign_status', label: 'Status', dataType: 'string',
    values: ['ENABLED', 'PAUSED', 'REMOVED'] },
  { name: 'impressions', label: 'Impressions', dataType: 'number' },
  { name: 'clicks', label: 'Clicks', dataType: 'number' },
  { name: 'cost', label: 'Cost', dataType: 'number' },
  { name: 'conversions', label: 'Conversions', dataType: 'number' },
  { name: 'date', label: 'Date', dataType: 'date' },
];

export function GoogleAdsDashboard() {
  const [filter, setFilter] = useState<FilterGroup>({
    id: 'root-' + Date.now(),
    operator: 'AND',
    enabled: true,
    conditions: [
      {
        id: 'default-1',
        field: 'campaign_status',
        operator: 'equals',
        value: 'ENABLED',
        dataType: 'string',
        enabled: true,
      },
    ],
    groups: [],
  });

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    // Validate before fetching
    const { isValid, errors } = validateFilterGroup(filter);
    if (!isValid) {
      setError(errors.join(', '));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const whereClause = convertFilterToSQL(filter);
      const sql = `
        SELECT
          campaign_name,
          campaign_status,
          SUM(impressions) as impressions,
          SUM(clicks) as clicks,
          SUM(cost) as cost,
          SUM(conversions) as conversions
        FROM \`wpp-project.google_ads.campaign_performance\`
        WHERE ${whereClause}
        GROUP BY campaign_name, campaign_status
        ORDER BY cost DESC
        LIMIT 100
      `;

      const response = await fetch('/api/bigquery/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });

      const result = await response.json();
      setData(result.rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on filter change (with debounce in production)
  useEffect(() => {
    fetchData();
  }, [filter]);

  return (
    <div className="dashboard">
      <h1>Google Ads Campaign Performance</h1>

      <div className="filter-section">
        <AdvancedFilter
          value={filter}
          onChange={setFilter}
          availableFields={GOOGLE_ADS_FIELDS}
          maxDepth={3}
        />
      </div>

      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Status</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Cost</th>
              <th>Conversions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.campaign_name}</td>
                <td>{row.campaign_status}</td>
                <td>{row.impressions.toLocaleString()}</td>
                <td>{row.clicks.toLocaleString()}</td>
                <td>${row.cost.toFixed(2)}</td>
                <td>{row.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

Happy filtering! 🚀
