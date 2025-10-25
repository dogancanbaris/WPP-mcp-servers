# DateRangeFilter Architecture

## Component Structure

```
DateRangeFilter
├── Preset Selector (Popover)
│   ├── Relative Dates Category
│   │   ├── Today
│   │   ├── Yesterday
│   │   ├── Last 7 days
│   │   ├── Last 14 days
│   │   ├── Last 28 days
│   │   ├── Last 30 days
│   │   └── Last 90 days
│   ├── Periods Category
│   │   ├── This week
│   │   ├── Last week
│   │   ├── This month
│   │   ├── Last month
│   │   ├── This quarter
│   │   ├── Last quarter
│   │   ├── This year
│   │   └── Last year
│   └── Custom Category
│       └── Custom range
├── Date Display (Read-only text)
├── Calendar Button (Popover trigger)
│   └── Dual-Month Calendar
│       ├── Month Navigation
│       ├── Range Selection
│       └── Visual Feedback
├── Comparison Toggle (Optional)
│   ├── Checkbox
│   └── Comparison Period Display
├── Summary Badges
│   ├── Duration Badge
│   └── Comparison Status Badge
└── Apply Button (Optional)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interaction                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DateRangeFilter                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ State: DateRangeFilterValue                            │ │
│  │ {                                                      │ │
│  │   range: { type, preset, startDate, endDate },        │ │
│  │   comparison: { enabled, comparisonDates }            │ │
│  │ }                                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Helper Functions                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ toCubeTimeDimension()                                  │ │
│  │ toCubeTimeDimensionWithComparison()                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cube.js TimeDimension                       │
│  {                                                           │
│    dimension: 'Orders.createdAt',                           │
│    dateRange: ['2025-09-22', '2025-10-22'],                 │
│    granularity: 'day'                                       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      useCubeQuery()                          │
│  Executes query against Cube.js semantic layer              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BigQuery (via Cube.js)                   │
│  SELECT date, SUM(orders) FROM orders                        │
│  WHERE date BETWEEN '2025-09-22' AND '2025-10-22'           │
│  GROUP BY date                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ResultSet (30-90 rows)                    │
│  Token-efficient aggregated data                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Chart Components                        │
│  LineChart, BarChart, TableChart, etc.                       │
└─────────────────────────────────────────────────────────────┘
```

## Integration Flow

### Scenario 1: Dashboard-Wide Filter

```
┌──────────────────────────────────────────────────────────────┐
│                    Dashboard Layout                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              DateRangeFilter (in header)               │  │
│  │  User selects "Last 30 days" → onChange fired         │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Dashboard Context / State Update               │  │
│  │  updateDashboardContext({ dateFilter: value })         │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│          ┌───────────────┼───────────────┐                   │
│          ▼               ▼               ▼                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Chart 1    │ │  Chart 2    │ │  Chart 3    │           │
│  │ (re-queries)│ │ (re-queries)│ │ (re-queries)│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### Scenario 2: Chart-Specific Filter

```
┌──────────────────────────────────────────────────────────────┐
│                      Chart Component                         │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              DateRangeFilter (local state)             │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         toCubeTimeDimension(value, ...)                │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         useCubeQuery({ timeDimensions: [...] })        │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              LineChart (renders data)                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## State Management

### Option 1: Local State (Chart-Specific)

```tsx
function CampaignPerformanceChart() {
  // Local to this component
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last30days' },
    comparison: { enabled: false },
  });

  const timeDimension = toCubeTimeDimension(dateRange, 'GoogleAds.date', 'day');

  const { resultSet } = useCubeQuery({
    measures: ['GoogleAds.impressions'],
    timeDimensions: timeDimension ? [timeDimension] : [],
  });

  return (
    <Card>
      <DateRangeFilter value={dateRange} onChange={setDateRange} />
      <LineChart data={resultSet} />
    </Card>
  );
}
```

### Option 2: Context API (Dashboard-Wide)

```tsx
// Context provider
const DashboardContext = createContext<{
  dateFilter: DateRangeFilterValue;
  setDateFilter: (value: DateRangeFilterValue) => void;
  timeDimension: CubeTimeDimension | null;
}>(null);

function DashboardProvider({ children }) {
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({
    range: { type: 'preset', preset: 'last30days' },
    comparison: { enabled: false },
  });

  const timeDimension = useMemo(
    () => toCubeTimeDimension(dateFilter, 'date', 'day'),
    [dateFilter]
  );

  return (
    <DashboardContext.Provider value={{ dateFilter, setDateFilter, timeDimension }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Usage in header
function DashboardHeader() {
  const { dateFilter, setDateFilter } = useDashboardContext();
  return <DateRangeFilter value={dateFilter} onChange={setDateFilter} />;
}

// Usage in charts
function Chart() {
  const { timeDimension } = useDashboardContext();
  const { resultSet } = useCubeQuery({
    measures: ['Orders.count'],
    timeDimensions: timeDimension ? [timeDimension] : [],
  });
  return <LineChart data={resultSet} />;
}
```

### Option 3: Zustand Store (Global State)

```tsx
// Store definition
interface DashboardStore {
  dateFilter: DateRangeFilterValue;
  setDateFilter: (value: DateRangeFilterValue) => void;
  timeDimension: CubeTimeDimension | null;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  dateFilter: {
    range: { type: 'preset', preset: 'last30days' },
    comparison: { enabled: false },
  },
  setDateFilter: (dateFilter) => {
    const timeDimension = toCubeTimeDimension(dateFilter, 'date', 'day');
    set({ dateFilter, timeDimension });
  },
  timeDimension: null,
}));

// Usage
function DashboardHeader() {
  const { dateFilter, setDateFilter } = useDashboardStore();
  return <DateRangeFilter value={dateFilter} onChange={setDateFilter} />;
}

function Chart() {
  const timeDimension = useDashboardStore((state) => state.timeDimension);
  const { resultSet } = useCubeQuery({
    measures: ['Orders.count'],
    timeDimensions: timeDimension ? [timeDimension] : [],
  });
  return <LineChart data={resultSet} />;
}
```

## Comparison Mode Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Enables Comparison                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Calculate Comparison Period                       │
│                                                              │
│  Primary: 2025-10-15 to 2025-10-21 (7 days)                │
│                                                              │
│  Duration = 7 days                                           │
│  Comparison End = 2025-10-14 (day before primary start)     │
│  Comparison Start = 2025-10-08 (7 days before end)          │
│                                                              │
│  Comparison: 2025-10-08 to 2025-10-14 (7 days)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          Generate Two Cube.js Queries                        │
│                                                              │
│  Primary Query:                                              │
│  {                                                           │
│    dimension: 'Orders.createdAt',                           │
│    dateRange: ['2025-10-15', '2025-10-21'],                 │
│    granularity: 'day'                                       │
│  }                                                           │
│                                                              │
│  Comparison Query:                                           │
│  {                                                           │
│    dimension: 'Orders.createdAt',                           │
│    dateRange: ['2025-10-08', '2025-10-14'],                 │
│    granularity: 'day'                                       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Execute Both Queries in Parallel                   │
│                                                              │
│  const { resultSet: current } = useCubeQuery(primaryQuery); │
│  const { resultSet: previous } = useCubeQuery(compQuery);   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Render Chart with Both Datasets                   │
│                                                              │
│  - Show both lines on LineChart                             │
│  - Calculate % change for Scorecard                         │
│  - Display side-by-side in TableChart                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Mount                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Initialize with default value                   │
│  { range: { type: 'preset', preset: 'last30days' } }       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Calculate actual date range (useMemo)              │
│  Last 30 days = 2025-09-22 to 2025-10-22                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Render UI                                 │
│  - Preset selector shows "Last 30 days"                     │
│  - Date display shows "Sep 22, 2025 - Oct 22, 2025"        │
│  - Calendar button available                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  User Interaction                            │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│Select Preset │    │Open Calendar │    │Enable Compare│
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│Update State  │    │Select Dates  │    │Calculate     │
│Call onChange │    │Update State  │    │Comparison    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Parent Component Re-renders                     │
│  (if using dashboard context, all charts re-query)          │
└─────────────────────────────────────────────────────────────┘
```

## Token Efficiency Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   User Request:                              │
│  "Show me Google Ads performance for last 30 days"          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              DateRangeFilter Configuration                   │
│  Preset: last30days                                          │
│  Granularity: day                                            │
│  Result: 30 rows (1 per day)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BigQuery Execution                        │
│  SELECT                                                      │
│    DATE(date) as date,                                      │
│    SUM(impressions) as impressions,                         │
│    SUM(clicks) as clicks,                                   │
│    SUM(cost) as cost                                        │
│  FROM google_ads_data                                       │
│  WHERE date BETWEEN '2025-09-22' AND '2025-10-22'          │
│  GROUP BY DATE(date)                                        │
│  ORDER BY date                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Result: 30 Rows                           │
│  date       | impressions | clicks | cost                   │
│  2025-09-22 | 1,245       | 87     | 124.50                │
│  2025-09-23 | 1,398       | 92     | 138.20                │
│  ...                                                         │
│  2025-10-22 | 1,567       | 103    | 156.80                │
│                                                              │
│  Token cost: ~500 tokens (vs 50,000+ for raw data)         │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Platform Integration

```
┌─────────────────────────────────────────────────────────────┐
│           Multi-Platform Search Dashboard                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Single DateRangeFilter                          │
│  User selects: Last 28 days                                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Google Ads      │ │  Search Console  │ │  Analytics       │
│  Cube            │ │  Cube            │ │  Cube            │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  BigQuery        │ │  BigQuery        │ │  BigQuery        │
│  ads_data        │ │  gsc_data        │ │  analytics_data  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Aggregated Results (28 rows each)                 │
│  Total: 84 rows across 3 platforms                          │
│  Token-efficient for Claude analysis                         │
└─────────────────────────────────────────────────────────────┘
```

## Security & Multi-Tenancy

```
┌─────────────────────────────────────────────────────────────┐
│                   User Authentication                        │
│  JWT with: { userId, tenantId, department }                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              DateRangeFilter (Frontend)                      │
│  Stores: { range, comparison }                              │
│  Does NOT store tenantId (comes from auth)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Cube.js Semantic Layer                          │
│  Applies security context:                                   │
│                                                              │
│  cube('GoogleAds', {                                         │
│    sql: `                                                    │
│      SELECT * FROM google_ads_data                          │
│      WHERE tenant_id = ${SECURITY_CONTEXT.tenantId}         │
│      AND department = ${SECURITY_CONTEXT.department}        │
│    `                                                         │
│  })                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BigQuery with RLS                               │
│  User only sees their tenant's data                          │
└─────────────────────────────────────────────────────────────┘
```

---

**Version**: 1.0.0
**Last Updated**: 2025-10-22
**Component**: DateRangeFilter
**Architecture Type**: Frontend Control with Backend Integration
