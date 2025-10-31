# Chart Label Formatting - Quick Reference

## For Developers: How to Use

### Recharts Charts

```typescript
import { formatChartLabel } from '@/lib/utils/label-formatter';

// Legend
<Legend formatter={(value) => formatChartLabel(value)} />

// Tooltip
<Tooltip formatter={(value, name) => [value, formatChartLabel(name as string)]} />

// Bar/Line/Area name prop
<Bar name={formatChartLabel(metric)} />
<Line name={formatChartLabel(metric)} />
<Area name={formatChartLabel(metric)} />
```

### ECharts Charts

```typescript
import { formatChartLabel } from '@/lib/utils/label-formatter';

const option = {
  // Legend
  legend: {
    formatter: (name: string) => formatChartLabel(name)
  },

  // Tooltip
  tooltip: {
    formatter: (params: any) => {
      const name = formatChartLabel(params.name);
      return `${name}: ${params.value}`;
    }
  },

  // Axis labels
  xAxis: {
    name: formatChartLabel(xAxisField)
  },
  yAxis: {
    name: formatChartLabel(yAxisField)
  }
};
```

### Table Charts

```typescript
import { formatColumnHeader } from '@/lib/utils/label-formatter';

// Column headers
const columns = metrics.map(metric => ({
  key: metric,
  header: formatColumnHeader(metric)
}));
```

## Supported Conversions

| Input | Output | Type |
|-------|--------|------|
| `clicks` | Clicks | Simple word |
| `ctr` | CTR | Acronym |
| `cost_per_click` | Cost Per Click | snake_case |
| `sessionDuration` | Session Duration | camelCase |
| `total_roas` | Total ROAS | Mixed |
| `clicks_prev` | Clicks (Previous) | Comparison |
| `ctr_change` | CTR Δ | Change |

## Supported Acronyms

CTR, CPC, CPM, ROAS, ROI, KPI, URL, SEO, SEM, API, HTTP, HTTPS, SSL, TLS, DNS, CDN, HTML, CSS, JS, JSON, XML, CSV, PDF, SMS, MMS, ID, UUID

## Adding New Acronyms

Edit `/frontend/src/lib/utils/label-formatter.ts`:

```typescript
const acronyms = [
  'ctr', 'cpc', 'cpm', 'roas', 'roi', 'kpi',
  'your_new_acronym'  // Add here
];
```

## Testing

```bash
npm test -- label-formatter.test.ts
```

## Files Reference

- **Utility:** `/frontend/src/lib/utils/label-formatter.ts`
- **Tests:** `/frontend/src/lib/utils/__tests__/label-formatter.test.ts`
- **Example:** See any Recharts chart (BarChart, LineChart, etc.)
