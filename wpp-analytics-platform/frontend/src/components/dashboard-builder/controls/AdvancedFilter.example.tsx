import React, { useState } from 'react';
import { AdvancedFilter, FilterGroup } from './AdvancedFilter';
import './AdvancedFilter.css';

/**
 * Example usage of the AdvancedFilter component
 *
 * This demo shows:
 * 1. How to set up available fields with different data types
 * 2. How to initialize a filter with default values
 * 3. How to handle filter changes
 * 4. How to convert filters to SQL/API queries
 */

// Define available fields for filtering
const AVAILABLE_FIELDS = [
  // Google Ads Fields
  {
    name: 'campaign_name',
    label: 'Campaign Name',
    dataType: 'string' as const,
  },
  {
    name: 'campaign_status',
    label: 'Campaign Status',
    dataType: 'string' as const,
    values: ['ENABLED', 'PAUSED', 'REMOVED'],
  },
  {
    name: 'impressions',
    label: 'Impressions',
    dataType: 'number' as const,
  },
  {
    name: 'clicks',
    label: 'Clicks',
    dataType: 'number' as const,
  },
  {
    name: 'cost',
    label: 'Cost',
    dataType: 'number' as const,
  },
  {
    name: 'ctr',
    label: 'CTR (%)',
    dataType: 'number' as const,
  },
  {
    name: 'conversions',
    label: 'Conversions',
    dataType: 'number' as const,
  },
  {
    name: 'date',
    label: 'Date',
    dataType: 'date' as const,
  },
  {
    name: 'is_enabled',
    label: 'Is Enabled',
    dataType: 'boolean' as const,
  },
  // Search Console Fields
  {
    name: 'query',
    label: 'Search Query',
    dataType: 'string' as const,
  },
  {
    name: 'position',
    label: 'Average Position',
    dataType: 'number' as const,
  },
  {
    name: 'device',
    label: 'Device Type',
    dataType: 'string' as const,
    values: ['MOBILE', 'DESKTOP', 'TABLET'],
  },
  {
    name: 'country',
    label: 'Country',
    dataType: 'string' as const,
    values: ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'],
  },
];

// Initial filter state
const initialFilter: FilterGroup = {
  id: `${Date.now()}-root`,
  operator: 'AND',
  enabled: true,
  conditions: [
    {
      id: `${Date.now()}-1`,
      field: 'campaign_status',
      operator: 'equals',
      value: 'ENABLED',
      dataType: 'string',
      enabled: true,
    },
    {
      id: `${Date.now()}-2`,
      field: 'cost',
      operator: 'greater_than',
      value: '100',
      dataType: 'number',
      enabled: true,
    },
  ],
  groups: [],
};

export const AdvancedFilterExample: React.FC = () => {
  const [filter, setFilter] = useState<FilterGroup>(initialFilter);
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');

  // Handle filter changes
  const handleFilterChange = (newFilter: FilterGroup) => {
    setFilter(newFilter);

    // Update SQL query
    const sql = convertFilterToSQL(newFilter);
    setSqlQuery(sql);

    // Update JSON output
    setJsonOutput(JSON.stringify(newFilter, null, 2));
  };

  return (
    <div className="advanced-filter-example" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Advanced Filter Component Demo
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Build complex filter conditions with AND/OR logic, nested groups, and multiple operators.
        </p>
      </div>

      {/* Filter Component */}
      <div style={{ marginBottom: '24px' }}>
        <AdvancedFilter
          value={filter}
          onChange={handleFilterChange}
          availableFields={AVAILABLE_FIELDS}
          maxDepth={3}
        />
      </div>

      {/* Output Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* SQL Query Output */}
        <div
          style={{
            background: '#1f2937',
            color: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            overflow: 'auto',
            maxHeight: '400px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#60a5fa' }}>
            Generated SQL WHERE Clause
          </h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {sqlQuery || 'No filters applied'}
          </pre>
        </div>

        {/* JSON Output */}
        <div
          style={{
            background: '#1f2937',
            color: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            overflow: 'auto',
            maxHeight: '400px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#60a5fa' }}>
            Filter JSON Structure
          </h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {jsonOutput}
          </pre>
        </div>
      </div>

      {/* Usage Examples */}
      <div style={{ marginTop: '32px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          Integration Examples
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Cube.js Example */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#3b82f6' }}>
              Cube.js Query:
            </h4>
            <pre
              style={{
                background: '#1f2937',
                color: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
              {convertFilterToCubeJS(filter)}
            </pre>
          </div>

          {/* BigQuery Example */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#3b82f6' }}>
              BigQuery Query:
            </h4>
            <pre
              style={{
                background: '#1f2937',
                color: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
              {`SELECT *
FROM \`project.dataset.google_ads_data\`
WHERE ${sqlQuery || 'TRUE'}`}
            </pre>
          </div>

          {/* REST API Example */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#3b82f6' }}>
              REST API Query Parameter:
            </h4>
            <pre
              style={{
                background: '#1f2937',
                color: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
              {`/api/campaigns?filter=${encodeURIComponent(JSON.stringify(convertFilterToAPI(filter)))}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Convert filter to SQL WHERE clause
 */
function convertFilterToSQL(group: FilterGroup, depth: number = 0): string {
  if (!group.enabled) return 'TRUE';

  const parts: string[] = [];

  // Process conditions
  for (const condition of group.conditions) {
    if (!condition.enabled) continue;

    const field = condition.field;
    const operator = condition.operator;
    const value = condition.value;

    let sql = '';

    switch (operator) {
      case 'equals':
        sql = `${field} = ${formatSQLValue(value, condition.dataType)}`;
        break;
      case 'not_equals':
        sql = `${field} != ${formatSQLValue(value, condition.dataType)}`;
        break;
      case 'contains':
        sql = `${field} LIKE '%${value}%'`;
        break;
      case 'not_contains':
        sql = `${field} NOT LIKE '%${value}%'`;
        break;
      case 'starts_with':
        sql = `${field} LIKE '${value}%'`;
        break;
      case 'ends_with':
        sql = `${field} LIKE '%${value}'`;
        break;
      case 'greater_than':
        sql = `${field} > ${formatSQLValue(value, condition.dataType)}`;
        break;
      case 'greater_than_or_equal':
        sql = `${field} >= ${formatSQLValue(value, condition.dataType)}`;
        break;
      case 'less_than':
        sql = `${field} < ${formatSQLValue(value, condition.dataType)}`;
        break;
      case 'less_than_or_equal':
        sql = `${field} <= ${formatSQLValue(value, condition.dataType)}`;
        break;
      case 'between':
        const [from, to] = Array.isArray(value) ? value : [value, value];
        sql = `${field} BETWEEN ${formatSQLValue(from, condition.dataType)} AND ${formatSQLValue(to, condition.dataType)}`;
        break;
      case 'in':
        const inValues = Array.isArray(value) ? value : [value];
        sql = `${field} IN (${inValues.map(v => formatSQLValue(v, condition.dataType)).join(', ')})`;
        break;
      case 'not_in':
        const notInValues = Array.isArray(value) ? value : [value];
        sql = `${field} NOT IN (${notInValues.map(v => formatSQLValue(v, condition.dataType)).join(', ')})`;
        break;
      case 'is_null':
        sql = `${field} IS NULL`;
        break;
      case 'is_not_null':
        sql = `${field} IS NOT NULL`;
        break;
      case 'regex_match':
        sql = `REGEXP_CONTAINS(${field}, r'${value}')`;
        break;
    }

    if (sql) parts.push(sql);
  }

  // Process nested groups
  for (const nestedGroup of group.groups) {
    const nestedSQL = convertFilterToSQL(nestedGroup, depth + 1);
    if (nestedSQL && nestedSQL !== 'TRUE') {
      parts.push(`(${nestedSQL})`);
    }
  }

  if (parts.length === 0) return 'TRUE';
  if (parts.length === 1) return parts[0];

  return parts.join(` ${group.operator} `);
}

/**
 * Format SQL value based on data type
 */
function formatSQLValue(value: any, dataType: FilterDataType): string {
  if (value === null || value === undefined || value === '') return 'NULL';

  switch (dataType) {
    case 'string':
      return `'${String(value).replace(/'/g, "''")}'`;
    case 'number':
      return String(Number(value));
    case 'date':
      return `'${value}'`;
    case 'boolean':
      return value ? 'TRUE' : 'FALSE';
    default:
      return `'${value}'`;
  }
}

/**
 * Convert filter to Cube.js query format
 */
function convertFilterToCubeJS(group: FilterGroup): string {
  const filters = convertGroupToCubeFilters(group);
  return JSON.stringify(
    {
      measures: ['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.cost'],
      dimensions: ['GoogleAds.campaignName'],
      filters: filters,
      timeDimensions: [
        {
          dimension: 'GoogleAds.date',
          dateRange: 'last 30 days',
        },
      ],
    },
    null,
    2
  );
}

/**
 * Convert filter group to Cube.js filters array
 */
function convertGroupToCubeFilters(group: FilterGroup): any[] {
  if (!group.enabled) return [];

  const filters: any[] = [];

  // Convert conditions
  for (const condition of group.conditions) {
    if (!condition.enabled) continue;

    filters.push({
      member: `GoogleAds.${condition.field}`,
      operator: convertOperatorToCubeJS(condition.operator),
      values: Array.isArray(condition.value) ? condition.value : [condition.value],
    });
  }

  // Convert nested groups
  for (const nestedGroup of group.groups) {
    const nestedFilters = convertGroupToCubeFilters(nestedGroup);
    if (nestedFilters.length > 0) {
      filters.push({
        [nestedGroup.operator.toLowerCase()]: nestedFilters,
      });
    }
  }

  return filters;
}

/**
 * Convert operator to Cube.js format
 */
function convertOperatorToCubeJS(operator: string): string {
  const mapping: Record<string, string> = {
    equals: 'equals',
    not_equals: 'notEquals',
    contains: 'contains',
    not_contains: 'notContains',
    starts_with: 'startsWith',
    ends_with: 'endsWith',
    greater_than: 'gt',
    greater_than_or_equal: 'gte',
    less_than: 'lt',
    less_than_or_equal: 'lte',
    in: 'equals',
    not_in: 'notEquals',
    is_null: 'notSet',
    is_not_null: 'set',
  };

  return mapping[operator] || operator;
}

/**
 * Convert filter to REST API format
 */
function convertFilterToAPI(group: FilterGroup): any {
  return {
    operator: group.operator.toLowerCase(),
    enabled: group.enabled,
    conditions: group.conditions
      .filter(c => c.enabled)
      .map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        dataType: c.dataType,
      })),
    groups: group.groups.map(convertFilterToAPI),
  };
}

export default AdvancedFilterExample;
