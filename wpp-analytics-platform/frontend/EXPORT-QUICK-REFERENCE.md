# Enhanced Export System - Quick Reference

## 🚀 Quick Start

### 1. Add Export Button to Dashboard (5 min)

```tsx
import { ExportButton } from '@/components/export';

<ExportButton
  dashboardName="My Dashboard"
  data={dataArray}
/>
```

### 2. With Filters (10 min)

```tsx
const filters = [
  { field: 'date', operator: 'between', value: ['2024-01-01', '2024-01-31'], label: 'Date' }
];

<ExportButton
  dashboardName="Filtered Report"
  data={dataArray}
  activeFilters={filters}
/>
```

### 3. Programmatic Export (15 min)

```tsx
import { useEnhancedExport } from '@/lib/export';

const { export, isExporting, progress } = useEnhancedExport();

await export('Report', data, {
  format: 'pdf',
  includeCharts: true,
  watermark: { text: 'CONFIDENTIAL' }
});
```

## 📦 Export Formats

| Format | Use Case | Features |
|--------|----------|----------|
| PDF | Reports, presentations | Charts, multi-page, watermarks |
| Excel | Data analysis | Multiple sheets, statistics |
| CSV | Raw data | Metadata headers, universal |
| JSON | API integration | Structured, typed |
| PNG | Screenshots | High-resolution, watermarks |
| ZIP | Complete package | All formats + README |

## 🎯 Common Use Cases

### Export with Dashboard Screenshot

```tsx
const dashboardRef = useRef<HTMLDivElement>(null);

<div ref={dashboardRef}>
  {/* Your dashboard content */}
</div>

<ExportButton
  dashboardName="Dashboard"
  data={data}
  element={dashboardRef.current || undefined}
/>
```

### Schedule Weekly Email Report

```tsx
const { scheduleExport } = useEnhancedExport();

await scheduleExport(
  'Weekly Performance Report',
  data,
  'weekly',
  ['team@example.com', 'manager@example.com'],
  'pdf'
);
```

### Save as Template

```tsx
const { saveTemplate } = useEnhancedExport();

const template = saveTemplate(
  'Monthly Report',
  'PDF with charts and email',
  {
    format: 'pdf',
    includeCharts: true,
    emailDelivery: {
      enabled: true,
      recipients: ['team@example.com']
    }
  }
);
```

### Monitor Export Jobs

```tsx
import { ExportJobsPanel } from '@/components/export';

<ExportJobsPanel />
```

## 🔧 Hooks

### useEnhancedExport()

```tsx
const {
  export,              // Main export function
  quickExport,         // Quick export (PDF/Excel/CSV)
  exportWithFilters,   // Export with filters
  scheduleExport,      // Schedule recurring export
  isExporting,         // Loading state
  progress,            // Progress percentage
  error,               // Error message
  lastResult,          // Last export result
  jobs,                // Job history
  templates,           // Saved templates
} = useEnhancedExport();
```

### useQuickExport()

```tsx
const {
  exportPDF,
  exportExcel,
  exportCSV,
  isExporting,
  error,
} = useQuickExport();

await exportPDF('Dashboard', data, htmlElement);
```

### useExportTemplates()

```tsx
const {
  templates,
  save,
  load,
  remove,
  refresh,
} = useExportTemplates();
```

### useExportJobs()

```tsx
const {
  jobs,
  activeJobs,
  refresh,
  cancel,
  getStatus,
} = useExportJobs();
```

## 📋 ExportOptions Reference

```typescript
interface ExportOptions {
  // Required
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'zip';

  // Optional
  filename?: string;
  filters?: ExportFilter[];
  dateRange?: { start: Date; end: Date };
  scheduled?: boolean;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  emailDelivery?: {
    enabled: boolean;
    recipients: string[];
    subject?: string;
    body?: string;
  };
  includeCharts?: boolean;
  includeMetadata?: boolean;
  includeFilters?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  compression?: boolean;
  watermark?: { text: string; opacity?: number };
  logo?: { url: string; width?: number; height?: number };
  maxRows?: number;
  columnOrder?: string[];
}
```

## 🎨 Components

### ExportButton

```tsx
<ExportButton
  dashboardName="Dashboard"
  data={data}
  element={htmlElement}
  activeFilters={filters}
  variant="default"  // default | outline | ghost
  size="default"     // default | sm | lg
  onSuccess={(fileUrl) => console.log(fileUrl)}
/>
```

### ExportDialog

```tsx
const [open, setOpen] = useState(false);

<ExportDialog
  open={open}
  onOpenChange={setOpen}
  dashboardName="Dashboard"
  data={data}
  element={htmlElement}
  activeFilters={filters}
  onSuccess={(fileUrl) => console.log(fileUrl)}
/>
```

### ExportJobsPanel

```tsx
<ExportJobsPanel />
```

### ExportTemplatesPanel

```tsx
<ExportTemplatesPanel />
```

## 🔍 Filter Operators

```typescript
// Equality
{ field: 'status', operator: 'equals', value: 'active' }

// Text search
{ field: 'campaign', operator: 'contains', value: 'Brand' }

// Numeric comparison
{ field: 'cost', operator: 'gt', value: 1000 }
{ field: 'cost', operator: 'lt', value: 5000 }

// Range
{ field: 'date', operator: 'between', value: ['2024-01-01', '2024-12-31'] }

// List
{ field: 'status', operator: 'in', value: ['active', 'paused'] }
```

## 🏢 Cube.js Integration

```tsx
import { useCubeQuery } from '@cubejs-client/react';
import { useEnhancedExport } from '@/lib/export';

function CubeDashboard() {
  const { resultSet } = useCubeQuery({ /* query */ });
  const { quickExport } = useEnhancedExport();

  const handleExport = async () => {
    if (!resultSet) return;

    const data = resultSet.tablePivot().map(row => {
      const flat: Record<string, unknown> = {};
      Object.keys(row).forEach(key => {
        flat[key.split('.').pop()!] = row[key];
      });
      return flat;
    });

    await quickExport('Cube Dashboard', data, 'excel');
  };

  return <button onClick={handleExport}>Export</button>;
}
```

## 🚀 Production Setup

### Email Service (SendGrid)

```typescript
// /app/api/email/send/route.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  const { to, subject, body, attachmentUrl } = await req.json();

  const attachment = await fetch(attachmentUrl);
  const buffer = Buffer.from(await attachment.arrayBuffer());

  await sgMail.send({
    to,
    from: 'reports@yourcompany.com',
    subject,
    text: body,
    attachments: [{
      content: buffer.toString('base64'),
      filename: 'export.pdf',
      type: 'application/pdf',
    }],
  });

  return Response.json({ success: true });
}
```

### File Storage (AWS S3)

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

async function uploadFile(blob: Blob, filename: string): Promise<string> {
  const buffer = await blob.arrayBuffer();

  await s3.send(new PutObjectCommand({
    Bucket: 'exports-bucket',
    Key: `exports/${Date.now()}_${filename}`,
    Body: Buffer.from(buffer),
    ContentType: blob.type,
  }));

  return `https://exports-bucket.s3.amazonaws.com/exports/${filename}`;
}
```

### Job Queue (Bull)

```typescript
import Bull from 'bull';

const exportQueue = new Bull('exports', {
  redis: { host: 'localhost', port: 6379 }
});

exportQueue.process(async (job) => {
  const { dashboardName, data, options } = job.data;
  return await exportManager.export(dashboardName, data, options);
});

// Schedule
exportQueue.add(exportData, {
  repeat: { cron: '0 0 * * 1' } // Every Monday
});
```

## 💡 Best Practices

### 1. Aggregate Before Export

```tsx
// ❌ Bad: 50,000 rows
const allData = await fetchAllData();
await export('Report', allData, options);

// ✅ Good: 100 aggregated rows
const summary = await fetchAggregatedData();
await export('Report', summary, options);
```

### 2. Use Templates

```tsx
// Save once
const template = saveTemplate('Monthly Report', 'Description', options);

// Reuse many times
const config = loadTemplate(template.id);
await export('January', data, config.options);
```

### 3. Provide Feedback

```tsx
{isExporting && <Progress value={progress} />}
{error && <Alert variant="destructive">{error}</Alert>}
{lastResult?.success && <Alert>Success!</Alert>}
```

### 4. Limit Data Size

```tsx
await export('Large Dataset', data, {
  maxRows: 1000,
  compression: true,
  includeCharts: false,
});
```

## 📁 File Locations

```
/frontend/
  src/
    lib/export/
      enhanced-export.ts       [Core manager]
      use-enhanced-export.ts   [React hooks]
      README.md                [Full docs]
    components/export/
      ExportButton.tsx         [Quick button]
      ExportDialog.tsx         [Config dialog]
      ExportJobsPanel.tsx      [Job history]
      ExportTemplatesPanel.tsx [Templates]
      example-usage.tsx        [Examples]
  ENHANCED-EXPORT-IMPLEMENTATION.md [Implementation guide]
  EXPORT-QUICK-REFERENCE.md         [This file]
```

## 🆘 Troubleshooting

**Charts not rendering?**
```tsx
// Wait for render
await new Promise(resolve => setTimeout(resolve, 500));
await export('Dashboard', data, options, element);
```

**Memory errors?**
```tsx
// Limit rows and enable compression
{ maxRows: 1000, compression: true, includeCharts: false }
```

**Email not sending?**
```bash
# Test endpoint
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"to":["test@example.com"],"subject":"Test","body":"Test"}'
```

## 📞 Support

- Full Documentation: `/frontend/src/lib/export/README.md`
- Implementation Guide: `/frontend/ENHANCED-EXPORT-IMPLEMENTATION.md`
- Working Examples: `/frontend/src/components/export/example-usage.tsx`

---

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Date:** 2025-10-22
