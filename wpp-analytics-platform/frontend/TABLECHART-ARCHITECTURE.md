# TableChart Component Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cube.js Semantic Layer                   │
│  (BigQuery → Cube.js Data Models → REST/GraphQL/SQL APIs)       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ useCubeQuery({
                          │   measures: ['GoogleAds.cost', ...],
                          │   dimensions: ['GoogleAds.campaign'],
                          │   filters: [...],
                          │   limit: 1000
                          │ })
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Raw Table Data (useMemo)                    │
│  resultSet.tablePivot() → TableRow[]                             │
│  [                                                               │
│    { campaign: 'A', cost: 1000, clicks: 500 },                  │
│    { campaign: 'B', cost: 2000, clicks: 800 },                  │
│    ... (up to 1000 rows)                                         │
│  ]                                                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ User clicks column header
                          │ setSortConfig({ column: 'cost', direction: 'desc' })
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Sorted Data (useMemo)                       │
│  Sort algorithm with type detection (numeric vs string)          │
│  [                                                               │
│    { campaign: 'B', cost: 2000, clicks: 800 },                  │
│    { campaign: 'A', cost: 1000, clicks: 500 },                  │
│    ... (sorted, same 1000 rows)                                  │
│  ]                                                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ currentPage = 1, pageSize = 10
                          │ slice((1-1)*10, 1*10) = [0, 10]
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Paginated Data (useMemo)                      │
│  sortedData.slice(startIndex, endIndex)                          │
│  [                                                               │
│    { campaign: 'B', cost: 2000, clicks: 800 },                  │
│    { campaign: 'A', cost: 1000, clicks: 500 },                  │
│    ... (only 10 rows for current page)                           │
│  ]                                                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ map() to render <tr> elements
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Table Render                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Campaign ↑    Cost ↕       Clicks ↕                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Campaign B    $2,000.00    800                          │   │
│  │ Campaign A    $1,000.00    500                          │   │
│  │ ...                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Showing 1 to 10 of 1000 rows  [10▼]  [<<][<][1][2][>][>>]│  │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Structure

```typescript
TableChart
├── Props (from ComponentConfig)
│   ├── Data Configuration
│   │   ├── dimension: string
│   │   ├── breakdownDimension: string
│   │   ├── metrics: string[]
│   │   └── filters: FilterConfig[]
│   │
│   ├── Visual Styling
│   │   ├── Title styles
│   │   ├── Background & borders
│   │   └── Table styling
│   │
│   └── Metric Formatting
│       └── metricsConfig: MetricStyleConfig[]
│
├── State Management
│   ├── sortConfig: { column, direction }
│   ├── currentPage: number
│   └── pageSize: number
│
├── Data Processing (useMemo)
│   ├── rawTableData: TableRow[]
│   ├── sortedData: TableRow[]
│   └── paginatedData: TableRow[]
│
├── Event Handlers
│   ├── handleSort(column)
│   ├── handlePageChange(page)
│   └── handlePageSizeChange(size)
│
└── Render
    ├── Title
    ├── Table
    │   ├── Headers (sortable)
    │   └── Body (rows)
    └── Pagination Controls
```

## State Transitions

### Sorting State Machine

```
Initial State
┌─────────────────┐
│ column: ''      │
│ direction: null │
└────────┬────────┘
         │ Click "Cost" header
         ▼
┌─────────────────┐
│ column: 'Cost'  │
│ direction: 'asc'│  Icon: ↑ (blue)
└────────┬────────┘
         │ Click "Cost" header again
         ▼
┌─────────────────┐
│ column: 'Cost'  │
│ direction: 'desc'│ Icon: ↓ (blue)
└────────┬────────┘
         │ Click "Cost" header again
         ▼
┌─────────────────┐
│ column: ''      │
│ direction: null │ Icon: ↕ (gray) - back to initial
└─────────────────┘
```

### Pagination State

```
currentPage = 1
pageSize = 10
totalPages = 100

User actions:
├── Click page number → setCurrentPage(n)
├── Click next → setCurrentPage(currentPage + 1)
├── Click previous → setCurrentPage(currentPage - 1)
├── Click first → setCurrentPage(1)
├── Click last → setCurrentPage(totalPages)
└── Change page size → setPageSize(n) + setCurrentPage(1)
```

## Performance Optimizations

### 1. Memoization Strategy

```typescript
// Level 1: Cache raw data from Cube.js
const rawTableData = useMemo(() => {
  return (resultSet?.tablePivot() || []) as TableRow[];
}, [resultSet]); // Only recalculate when query result changes

// Level 2: Cache sorted data
const sortedData = useMemo(() => {
  // Expensive operation: sorting 1000 rows
  return [...rawTableData].sort(...);
}, [rawTableData, sortConfig]); // Only re-sort when data or sort changes

// Level 3: Cache paginated slice
const paginatedData = useMemo(() => {
  // Cheap operation: array slice
  return sortedData.slice(startIndex, endIndex);
}, [sortedData, currentPage, pageSize]); // Only re-slice when needed
```

### 2. Render Optimization

```
Table renders only 10 rows (paginated)
vs
Rendering all 1000 rows (performance killer)

Benefit: 100x fewer DOM elements
```

## Integration Points

### 1. Cube.js Client

```typescript
import { cubeApi } from '@/lib/cubejs/client';

// Client configured with:
// - API URL
// - API Secret
// - Request retry logic
```

### 2. Metric Formatter

```typescript
import { formatMetricValue, getMetricStyle } from '@/lib/utils/metric-formatter';

// Handles:
// - Number formatting (1000 → 1,000)
// - Currency ($1000.00)
// - Percentages (0.25 → 25%)
// - Compact notation (1000000 → 1M)
// - Custom styling
```

### 3. Dashboard Builder

```typescript
// TableChart is registered in dashboard builder component registry
// Users can drag & drop from component palette
// Property panel binds to component props
// Supports export/share functionality
```

## Example Query Flow

### Scenario: Display Google Ads Campaign Performance

```typescript
// 1. User configures in dashboard builder UI
<TableChart
  dimension="GoogleAds.campaignName"
  metrics={[
    'GoogleAds.impressions',
    'GoogleAds.clicks',
    'GoogleAds.cost',
    'GoogleAds.conversions'
  ]}
  filters={[
    {
      field: 'GoogleAds.date',
      operator: 'inDateRange',
      values: ['2025-09-22', '2025-10-22']
    }
  ]}
/>

// 2. Component builds Cube.js query
{
  measures: [
    'GoogleAds.impressions',
    'GoogleAds.clicks',
    'GoogleAds.cost',
    'GoogleAds.conversions'
  ],
  dimensions: ['GoogleAds.campaignName'],
  filters: [{
    member: 'GoogleAds.date',
    operator: 'inDateRange',
    values: ['2025-09-22', '2025-10-22']
  }],
  limit: 1000
}

// 3. Cube.js converts to optimized SQL
SELECT
  campaign_name,
  SUM(impressions) as impressions,
  SUM(clicks) as clicks,
  SUM(cost) as cost,
  SUM(conversions) as conversions
FROM google_ads_data
WHERE date >= '2025-09-22' AND date <= '2025-10-22'
GROUP BY campaign_name
LIMIT 1000;

// 4. BigQuery executes query (aggregated)
// Returns 50 campaigns instead of 1M rows

// 5. Component receives data
[
  {
    'GoogleAds.campaignName': 'Brand Campaign',
    'GoogleAds.impressions': 50000,
    'GoogleAds.clicks': 2500,
    'GoogleAds.cost': 1500.00,
    'GoogleAds.conversions': 75
  },
  // ... 49 more campaigns
]

// 6. User sorts by cost (desc)
// Client-side sort, no new query

// 7. User views page 1 (10 rows)
// Client-side slice, no new query

// Result: Single query, instant sorting & pagination
```

## Error Handling

```
┌─────────────────────┐
│ User opens dashboard│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Query Cube.js       │
└──────────┬──────────┘
           │
           ├─► Success → Render table
           │
           ├─► Loading → Show spinner
           │
           └─► Error → Display error message
                │
                └─► Possible errors:
                    - Network timeout
                    - Invalid query
                    - Cube.js down
                    - Authentication failed
```

## Accessibility

```
Keyboard Navigation:
- Tab → Navigate between sort headers
- Enter/Space → Trigger sort
- Tab → Navigate to pagination controls
- Arrow keys → Navigate page buttons

Screen Readers:
- Column headers announce "sortable"
- Sort state announced (ascending/descending)
- Pagination announces "Page X of Y"
- Disabled buttons announce "disabled"

Visual:
- High contrast borders
- Clear hover states
- Disabled state opacity
- Focus indicators
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses standard ES2020 features, no polyfills required.

## Performance Metrics

Expected performance with 1000 rows:

| Operation           | Time     | Notes                          |
|---------------------|----------|--------------------------------|
| Initial query       | 500ms    | Cube.js + network              |
| Sort                | 5ms      | Client-side, memoized          |
| Pagination          | <1ms     | Array slice                    |
| Render page         | 10ms     | Only 10 rows rendered          |
| User interaction    | <16ms    | 60 FPS maintained              |

Token efficiency:
- Fetches 1000 rows (acceptable for Claude context)
- Aggregated data from Cube.js (not raw millions)
- No repeated queries for sort/paginate
