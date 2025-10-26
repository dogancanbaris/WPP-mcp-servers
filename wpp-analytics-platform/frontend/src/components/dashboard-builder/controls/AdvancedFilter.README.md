# AdvancedFilter Component

A comprehensive, production-ready React component for building complex filter conditions with AND/OR logic, nested groups, and multiple data type support.

## Features

✅ **Complex Logic**: Build filters with AND/OR operators and nested groups
✅ **Multiple Data Types**: Support for string, number, date, and boolean fields
✅ **Rich Operators**: 16+ operators including equals, contains, between, in, regex, etc.
✅ **Drag & Drop**: Reorder conditions and groups (visual feedback included)
✅ **Enable/Disable**: Toggle conditions and groups without deleting them
✅ **Duplicate**: Quickly copy existing conditions
✅ **Validation**: Built-in validation with helpful error messages
✅ **Type Safety**: Full TypeScript support with comprehensive types
✅ **Responsive**: Mobile-friendly design
✅ **Dark Mode**: Automatic dark mode support
✅ **Export Ready**: Convert to SQL, dataset API, MongoDB, REST API formats

## Installation

```bash
# Copy the component files to your project
cp AdvancedFilter.tsx your-project/src/components/
cp AdvancedFilter.css your-project/src/components/
cp AdvancedFilter.utils.ts your-project/src/components/
```

### Dependencies

```bash
npm install lucide-react
# or
yarn add lucide-react
```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { AdvancedFilter, FilterGroup } from './AdvancedFilter';
import './AdvancedFilter.css';

function MyComponent() {
  const [filter, setFilter] = useState<FilterGroup>({
    id: 'root',
    operator: 'AND',
    enabled: true,
    conditions: [],
    groups: [],
  });

  const availableFields = [
    { name: 'campaign_name', label: 'Campaign Name', dataType: 'string' },
    { name: 'impressions', label: 'Impressions', dataType: 'number' },
    { name: 'date', label: 'Date', dataType: 'date' },
  ];

  return (
    <AdvancedFilter
      value={filter}
      onChange={setFilter}
      availableFields={availableFields}
    />
  );
}
```

## Props

### AdvancedFilterProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `FilterGroup` | Yes | - | Current filter state |
| `onChange` | `(value: FilterGroup) => void` | Yes | - | Callback when filter changes |
| `availableFields` | `FieldConfig[]` | Yes | - | Array of available fields to filter on |
| `className` | `string` | No | `''` | Additional CSS class name |
| `maxDepth` | `number` | No | `3` | Maximum nesting depth for groups |

### FieldConfig

```typescript
interface FieldConfig {
  name: string;           // Field identifier (used in queries)
  label: string;          // Display name for the field
  dataType: FilterDataType; // 'string' | 'number' | 'date' | 'boolean'
  values?: any[];         // Optional predefined values (creates dropdown)
}
```

### FilterGroup

```typescript
interface FilterGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: FilterCondition[];
  groups: FilterGroup[];  // Nested groups
  enabled: boolean;
}
```

### FilterCondition

```typescript
interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  dataType: FilterDataType;
  enabled: boolean;
}
```

## Supported Operators

### String Operators
- `equals` - Exact match
- `not_equals` - Not equal to
- `contains` - Contains substring
- `not_contains` - Does not contain substring
- `starts_with` - Starts with
- `ends_with` - Ends with
- `in` - In list
- `not_in` - Not in list
- `is_null` - Is null/empty
- `is_not_null` - Is not null/empty
- `regex_match` - Regex pattern match

### Number Operators
- `equals`
- `not_equals`
- `greater_than`
- `greater_than_or_equal`
- `less_than`
- `less_than_or_equal`
- `between` - Between two values
- `in` - In list
- `not_in` - Not in list
- `is_null`
- `is_not_null`

### Date Operators
- `equals`
- `not_equals`
- `greater_than` (after)
- `greater_than_or_equal`
- `less_than` (before)
- `less_than_or_equal`
- `between` - Date range
- `is_null`
- `is_not_null`

### Boolean Operators
- `equals`
- `not_equals`
- `is_null`
- `is_not_null`

## Advanced Examples

### Predefined Values (Dropdown)

```tsx
const fields = [
  {
    name: 'status',
    label: 'Status',
    dataType: 'string',
    values: ['ENABLED', 'PAUSED', 'REMOVED'], // Creates dropdown
  },
];
```

### Complex Nested Filter

```tsx
const complexFilter: FilterGroup = {
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
          value: 1000,
          dataType: 'number',
          enabled: true,
        },
        {
          id: 'c3',
          field: 'clicks',
          operator: 'greater_than',
          value: 100,
          dataType: 'number',
          enabled: true,
        },
      ],
      groups: [],
    },
  ],
};

// Translates to:
// status = 'ENABLED' AND (impressions > 1000 OR clicks > 100)
```

### Between Operator

```tsx
const betweenCondition: FilterCondition = {
  id: 'c1',
  field: 'cost',
  operator: 'between',
  value: [100, 500],  // Between 100 and 500
  dataType: 'number',
  enabled: true,
};
```

### In Operator (Multiple Values)

```tsx
const inCondition: FilterCondition = {
  id: 'c1',
  field: 'country',
  operator: 'in',
  value: ['USA', 'UK', 'Canada'],  // Multiple values
  dataType: 'string',
  enabled: true,
};
```

## Converting to Query Formats

### SQL

```tsx
import { convertFilterToSQL } from './AdvancedFilter.example';

const sql = convertFilterToSQL(filter);
// Output: "status = 'ENABLED' AND (impressions > 1000 OR clicks > 100)"

const query = `SELECT * FROM campaigns WHERE ${sql}`;
```

### dataset API

```tsx
import { convertFilterToCubeJS } from './AdvancedFilter.example';

const cubeQuery = {
  measures: ['Campaigns.count'],
  dimensions: ['Campaigns.name'],
  filters: convertGroupToCubeFilters(filter),
};
```

### MongoDB

```tsx
import { convertFilterToMongoDB } from './AdvancedFilter.utils';

const mongoQuery = convertFilterToMongoDB(filter);
// Output: { $and: [{ status: 'ENABLED' }, { $or: [...] }] }

await db.collection('campaigns').find(mongoQuery).toArray();
```

### REST API

```tsx
import { convertFilterToAPI } from './AdvancedFilter.example';

const apiFilter = convertFilterToAPI(filter);
const url = `/api/campaigns?filter=${encodeURIComponent(JSON.stringify(apiFilter))}`;
```

## Utility Functions

### Validation

```tsx
import { validateFilterGroup } from './AdvancedFilter.utils';

const { isValid, errors } = validateFilterGroup(filter);
if (!isValid) {
  console.error('Validation errors:', errors);
}
```

### Counting

```tsx
import { countConditions, countGroups } from './AdvancedFilter.utils';

const conditionCount = countConditions(filter);
const groupCount = countGroups(filter);
console.log(`${conditionCount} conditions, ${groupCount} groups`);
```

### Cloning

```tsx
import { cloneFilterGroup } from './AdvancedFilter.utils';

const cloned = cloneFilterGroup(filter);
// Deep copy - safe to mutate
```

### Check Empty

```tsx
import { isFilterEmpty } from './AdvancedFilter.utils';

if (isFilterEmpty(filter)) {
  console.log('No filters applied');
}
```

### Human-Readable String

```tsx
import { filterToString, getFilterSummary } from './AdvancedFilter.utils';

const readable = filterToString(filter);
// "campaign_name equals 'Test' AND impressions greater than 1000"

const summary = getFilterSummary(filter);
// "2 conditions, 1 group"
```

### Serialization

```tsx
import {
  serializeFilter,
  deserializeFilter,
  compressFilter,
  decompressFilter
} from './AdvancedFilter.utils';

// Save to localStorage
const json = serializeFilter(filter);
localStorage.setItem('savedFilter', json);

// Load from localStorage
const loaded = deserializeFilter(localStorage.getItem('savedFilter'));

// URL-safe compression
const compressed = compressFilter(filter);
const url = `/dashboard?filter=${compressed}`;

// Decompress from URL
const params = new URLSearchParams(window.location.search);
const restored = decompressFilter(params.get('filter'));
```

## Styling

### Custom Styling

```tsx
<AdvancedFilter
  className="my-custom-filter"
  // ... other props
/>
```

```css
.my-custom-filter {
  border: 2px solid #3b82f6;
  border-radius: 12px;
}

.my-custom-filter .filter-condition {
  background: #eff6ff;
}

.my-custom-filter .operator-toggle.and {
  background: #dbeafe;
}
```

### Dark Mode

The component automatically supports dark mode via CSS media queries:

```css
@media (prefers-color-scheme: dark) {
  .advanced-filter {
    background: #1f2937;
    color: #f9fafb;
  }
}
```

## Integration Examples

### With dataset API

```tsx
import { useDatasetQuery } from 'dataset query hook';
import { AdvancedFilter } from './AdvancedFilter';

function Dashboard() {
  const [filter, setFilter] = useState(initialFilter);

  const { resultSet, isLoading } = useDatasetQuery({
    measures: ['GoogleAds.impressions', 'GoogleAds.clicks'],
    dimensions: ['GoogleAds.campaignName'],
    filters: convertGroupToCubeFilters(filter),
  });

  return (
    <>
      <AdvancedFilter
        value={filter}
        onChange={setFilter}
        availableFields={GOOGLE_ADS_FIELDS}
      />
      {isLoading ? <Spinner /> : <ChartComponent data={resultSet} />}
    </>
  );
}
```

### With BigQuery

```tsx
function BigQueryDashboard() {
  const [filter, setFilter] = useState(initialFilter);

  const executeQuery = async () => {
    const whereClause = convertFilterToSQL(filter);
    const query = `
      SELECT campaign_name, SUM(impressions) as impressions
      FROM \`project.dataset.google_ads\`
      WHERE ${whereClause}
      GROUP BY campaign_name
    `;

    const results = await runBigQueryQuery(query);
    return results;
  };

  return (
    <>
      <AdvancedFilter
        value={filter}
        onChange={setFilter}
        availableFields={BIGQUERY_FIELDS}
      />
      <button onClick={executeQuery}>Run Query</button>
    </>
  );
}
```

### With React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';

function FormWithFilter() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log('Filter:', data.filter);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="filter"
        control={control}
        render={({ field }) => (
          <AdvancedFilter
            value={field.value}
            onChange={field.onChange}
            availableFields={FIELDS}
          />
        )}
      />
      <button type="submit">Apply Filter</button>
    </form>
  );
}
```

## Performance Considerations

### Large Field Lists

For 100+ fields, consider implementing search:

```tsx
const [fieldSearch, setFieldSearch] = useState('');

const filteredFields = availableFields.filter(f =>
  f.label.toLowerCase().includes(fieldSearch.toLowerCase())
);

<input
  type="text"
  placeholder="Search fields..."
  value={fieldSearch}
  onChange={(e) => setFieldSearch(e.target.value)}
/>
<AdvancedFilter availableFields={filteredFields} {...props} />
```

### Memoization

```tsx
import { useMemo } from 'react';

const memoizedFilter = useMemo(() =>
  convertFilterToSQL(filter),
  [filter]
);
```

### Debouncing Changes

```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedOnChange = useDebouncedCallback(
  (newFilter) => {
    onChange(newFilter);
  },
  500
);

<AdvancedFilter onChange={debouncedOnChange} {...props} />
```

## Testing

Run tests:

```bash
npm test AdvancedFilter.test.tsx
```

Example test:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedFilter } from './AdvancedFilter';

test('adds new condition', () => {
  const onChange = jest.fn();
  render(<AdvancedFilter value={filter} onChange={onChange} availableFields={fields} />);

  fireEvent.click(screen.getByText('Add Condition'));

  expect(onChange).toHaveBeenCalled();
  const newFilter = onChange.mock.calls[0][0];
  expect(newFilter.conditions.length).toBe(2);
});
```

## Accessibility

- ✅ Full keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels on interactive elements
- ✅ Focus management
- ✅ High contrast mode support

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Roadmap

- [ ] Field groups/categories
- [ ] Saved filter templates
- [ ] Import/export to JSON/CSV
- [ ] Visual query builder mode
- [ ] Natural language input
- [ ] Undo/redo functionality
- [ ] Filter suggestions based on data
- [ ] Performance profiling tools

## Changelog

### v1.0.0 (2025-01-22)
- Initial release
- 16+ operators
- Nested groups up to 3 levels
- Full TypeScript support
- Drag & drop reordering
- Enable/disable toggles
- Duplicate conditions
- Validation utilities
- Export to SQL/dataset API/MongoDB/REST
- Comprehensive test suite
- Dark mode support
- Responsive design
