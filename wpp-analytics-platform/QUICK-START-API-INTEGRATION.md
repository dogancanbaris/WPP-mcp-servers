# Quick Start: API Integration

**For developers continuing this work**

---

## What Was Done (Wave 3)

Connected all Setup tab components to backend APIs:
- ✅ Created API client library
- ✅ Created API routes (fields, CRUD)
- ✅ Updated ChartSetup component
- ✅ Updated dashboardStore

---

## How to Use

### Fetch Fields
```typescript
import { getAvailableFields } from '@/lib/api/dashboards';

const fields = await getAvailableFields();
// fields.sources → Array of data sources
```

### Save Dashboard
```typescript
import { saveDashboard } from '@/lib/api/dashboards';

const result = await saveDashboard('dash-123', {
  title: 'My Dashboard',
  rows: [...]
});
```

### Load Dashboard
```typescript
import { loadDashboard } from '@/lib/api/dashboards';

const result = await loadDashboard('dash-123');
if (result.success) {
  // Use result.dashboard
}
```

---

## API Endpoints

### GET /api/dashboards/fields
Returns available data sources and their fields

**Response**:
```json
{
  "sources": [
    {
      "id": "google_search_console",
      "name": "Google Search Console",
      "fields": [...]
    }
  ]
}
```

### GET /api/dashboards/[id]
Load dashboard by ID

### PUT /api/dashboards/[id]
Save/update dashboard

### DELETE /api/dashboards/[id]
Delete dashboard

---

## File Locations

**API Client**: `src/lib/api/dashboards.ts`
**Fields Endpoint**: `src/app/api/dashboards/fields/route.ts`
**CRUD Endpoint**: `src/app/api/dashboards/[id]/route.ts`

---

## Testing

1. Start dev server: `npm run dev`
2. Navigate to dashboard builder
3. Open DevTools Network tab
4. Verify API calls succeed

---

## Next Steps

1. Replace mock data with BigQuery queries
2. Integrate Cube.js semantic layer
3. Implement query execution endpoint
4. Wire up chart rendering

---

See **WAVE-3-IMPLEMENTATION-SUMMARY.md** for complete details.
