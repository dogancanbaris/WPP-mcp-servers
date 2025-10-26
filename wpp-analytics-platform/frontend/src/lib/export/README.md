# Enhanced Export System

Comprehensive export functionality for WPP Analytics Platform with advanced features including filtered exports, scheduled exports, email delivery, and multiple format support.

## Features

### 🎯 Core Features
- **Multiple Export Formats**: PDF, Excel, CSV, JSON, PNG, ZIP
- **Filter Application**: Export with active dashboard filters applied
- **Visual Export**: Capture dashboard screenshots with HTML2Canvas
- **Metadata Inclusion**: Add timestamps, filters, and summaries

### 📅 Advanced Features
- **Scheduled Exports**: Daily, weekly, or monthly recurring exports
- **Email Delivery**: Automatic email with attachment to multiple recipients
- **Export Templates**: Save and reuse export configurations
- **Job Management**: Track export history and monitor progress

### 🎨 Customization
- **Branding**: Add logos and watermarks
- **Compression**: Automatic compression for large files
- **Column Control**: Specify column order and limit rows
- **Page Orientation**: Portrait or landscape for PDF exports

### 🔒 Production-Ready
- **Background Processing**: Handle large exports without blocking UI
- **Error Handling**: Comprehensive error tracking and reporting
- **Progress Tracking**: Real-time progress updates
- **File Management**: Automatic upload to cloud storage

## Quick Start

### 1. Basic Export Button

```tsx
import { ExportButton } from '@/components/export';

function Dashboard() {
  const data = [
    { campaign: 'Campaign A', clicks: 1000, cost: 500 },
    { campaign: 'Campaign B', clicks: 1500, cost: 750 },
  ];

  return (
    <div>
      <h1>My Dashboard</h1>
      <ExportButton
        dashboardName="Campaign Performance"
        data={data}
        onSuccess={(fileUrl) => console.log('Downloaded:', fileUrl)}
      />
    </div>
  );
}
```

### 2. Export with Filters

```tsx
import { ExportButton } from '@/components/export';
import type { ExportFilter } from '@/lib/export';

function Dashboard() {
  const activeFilters: ExportFilter[] = [
    {
      field: 'date',
      operator: 'between',
      value: ['2024-01-01', '2024-01-31'],
      label: 'Date Range',
    },
    {
      field: 'status',
      operator: 'equals',
      value: 'active',
      label: 'Status',
    },
  ];

  return (
    <ExportButton
      dashboardName="Filtered Campaign Data"
      data={data}
      activeFilters={activeFilters}
    />
  );
}
```

### 3. Programmatic Export

```tsx
import { useEnhancedExport } from '@/lib/export';

function Dashboard() {
  const exportHook = useEnhancedExport();

  const handleExport = async () => {
    const result = await exportHook.export(
      'My Dashboard',
      data,
      {
        format: 'pdf',
        includeCharts: true,
        includeMetadata: true,
        pageOrientation: 'landscape',
        watermark: {
          text: 'CONFIDENTIAL',
          opacity: 0.3,
        },
      }
    );

    if (result.success) {
      console.log('Export complete:', result.fileUrl);
    }
  };

  return (
    <button onClick={handleExport}>
      Export Dashboard
    </button>
  );
}
```

### 4. Scheduled Export with Email

```tsx
import { useEnhancedExport } from '@/lib/export';

function Dashboard() {
  const exportHook = useEnhancedExport();

  const setupWeeklyReport = async () => {
    const result = await exportHook.export(
      'Weekly Performance Report',
      data,
      {
        format: 'pdf',
        scheduled: true,
        frequency: 'weekly',
        emailDelivery: {
          enabled: true,
          recipients: ['team@example.com', 'manager@example.com'],
          subject: 'Weekly Performance Report',
          body: 'Please find attached this week\'s performance report.',
        },
      }
    );

    if (result.success) {
      console.log('Scheduled export created');
    }
  };

  return (
    <button onClick={setupWeeklyReport}>
      Setup Weekly Report
    </button>
  );
}
```

## Components

### ExportButton

Quick-access button with dropdown for common export formats.

```tsx
<ExportButton
  dashboardName="Dashboard Name"
  data={dataArray}
  element={dashboardElement}  // Optional: HTMLElement to capture
  activeFilters={filtersArray}  // Optional: Current filters
  variant="default"  // default | outline | ghost
  size="default"  // default | sm | lg
  onSuccess={(fileUrl) => {}}  // Optional: Success callback
/>
```

### ExportDialog

Comprehensive dialog for configuring export options.

```tsx
const [dialogOpen, setDialogOpen] = useState(false);

<ExportDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  dashboardName="Dashboard Name"
  data={dataArray}
  element={dashboardElement}
  activeFilters={filtersArray}
  onSuccess={(fileUrl) => {}}
/>
```

### ExportJobsPanel

Monitor and manage export job history.

```tsx
<ExportJobsPanel />
```

### ExportTemplatesPanel

Save and reuse export configurations.

```tsx
<ExportTemplatesPanel />
```

## Hooks

### useEnhancedExport()

Main hook providing full export functionality.

```tsx
const {
  // Export methods
  export,
  quickExport,
  exportWithFilters,
  scheduleExport,

  // State
  isExporting,
  progress,
  currentJob,
  error,
  lastResult,

  // Job management
  jobs,
  getJobStatus,
  cancelJob,
  refreshJobs,

  // Template management
  templates,
  saveTemplate,
  loadTemplate,
  deleteTemplate,

  // Scheduled exports
  scheduledJobs,
  refreshScheduledJobs,
} = useEnhancedExport();
```

### useQuickExport()

Simplified hook for quick one-click exports.

```tsx
const {
  exportPDF,
  exportExcel,
  exportCSV,
  isExporting,
  error,
} = useQuickExport();

// Usage
await exportPDF('Dashboard Name', data, htmlElement);
await exportExcel('Dashboard Name', data);
await exportCSV('Dashboard Name', data);
```

### useExportTemplates()

Manage export templates.

```tsx
const {
  templates,
  save,
  load,
  remove,
  refresh,
} = useExportTemplates();

// Save template
const template = save('Monthly Report', 'PDF with charts', {
  format: 'pdf',
  includeCharts: true,
  emailDelivery: {
    enabled: true,
    recipients: ['team@example.com'],
  },
});

// Load template
const config = load(templateId);
```

### useExportJobs()

Monitor export job status.

```tsx
const {
  jobs,
  activeJobs,
  refresh,
  cancel,
  getStatus,
} = useExportJobs();
```

## API Reference

### ExportOptions

```typescript
interface ExportOptions {
  // Basic
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'zip';
  filename?: string;

  // Filtering
  filters?: ExportFilter[];
  dateRange?: { start: Date | string; end: Date | string };

  // Scheduling
  scheduled?: boolean;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  nextRunAt?: Date;

  // Email
  emailDelivery?: {
    enabled: boolean;
    recipients: string[];
    subject?: string;
    body?: string;
  };

  // Formatting
  includeCharts?: boolean;
  includeMetadata?: boolean;
  includeFilters?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  compression?: boolean;

  // Branding
  watermark?: {
    text: string;
    opacity?: number;
  };
  logo?: {
    url: string;
    width?: number;
    height?: number;
  };

  // Advanced
  maxRows?: number;
  columnOrder?: string[];
  customStyles?: Record<string, unknown>;
}
```

### ExportFilter

```typescript
interface ExportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: unknown;
  label?: string;
}
```

### ExportResult

```typescript
interface ExportResult {
  success: boolean;
  jobId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  emailSent?: boolean;
}
```

## Export Formats

### PDF
- **Use Case**: Professional reports, presentations
- **Features**: Multi-page, charts, tables, watermarks, logos
- **Options**: Portrait/landscape, compression

### Excel
- **Use Case**: Data analysis, spreadsheets
- **Features**: Multiple sheets, formulas, statistics
- **Sheets**: Summary, Data, Statistics

### CSV
- **Use Case**: Raw data export, import to other tools
- **Features**: Metadata header comments, column ordering
- **Compatibility**: Universal spreadsheet format

### JSON
- **Use Case**: API integration, data exchange
- **Features**: Structured data with metadata
- **Format**: Pretty-printed, typed

### PNG
- **Use Case**: Visual reports, presentations
- **Features**: High-resolution screenshot, watermarks
- **Quality**: 2x scale for clarity

### ZIP
- **Use Case**: Complete export package
- **Contents**: CSV + JSON + PNG + README
- **Features**: Compression, all formats in one

## Filter Operators

```typescript
// Equality
{ field: 'status', operator: 'equals', value: 'active' }

// Text search
{ field: 'campaign', operator: 'contains', value: 'Brand' }

// Numeric comparison
{ field: 'cost', operator: 'gt', value: 1000 }
{ field: 'cost', operator: 'lt', value: 5000 }

// Range
{ field: 'date', operator: 'between', value: ['2024-01-01', '2024-01-31'] }

// List membership
{ field: 'status', operator: 'in', value: ['active', 'paused'] }
```

## Integration with Dataset API

```tsx
import { useCubeQuery } from '@cubejs-client/react';
import { useEnhancedExport } from '@/lib/export';

function CubeDashboard() {
  const { resultSet } = useCubeQuery({
    measures: ['Orders.count', 'Orders.totalAmount'],
    dimensions: ['Orders.status'],
    timeDimensions: [{
      dimension: 'Orders.createdAt',
      dateRange: 'last 30 days',
    }],
  });

  const exportHook = useEnhancedExport();

  const handleExport = async () => {
    if (!resultSet) return;

    // Convert Dataset API format to flat array
    const data = resultSet.tablePivot().map((row) => {
      const flatRow: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        const shortKey = key.split('.').pop() || key;
        flatRow[shortKey] = row[key];
      });
      return flatRow;
    });

    await exportHook.quickExport('Order Analysis', data, 'excel');
  };

  return <button onClick={handleExport}>Export</button>;
}
```

## Email Configuration

### Production Setup

For production, integrate with an email service:

**SendGrid:**
```typescript
// In your API route: /api/email/send
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req: Request) {
  const { to, subject, body, attachmentUrl } = await req.json();

  const msg = {
    to,
    from: 'reports@yourcompany.com',
    subject,
    text: body,
    attachments: [{
      filename: 'export.pdf',
      content: await fetch(attachmentUrl).then(r => r.arrayBuffer()),
      type: 'application/pdf',
    }],
  };

  await sgMail.send(msg);
  return Response.json({ success: true });
}
```

**AWS SES:**
```typescript
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });

// Create MIME email with attachment
// Send via ses.send(new SendRawEmailCommand(...))
```

## File Storage

### Production Setup

For production, upload files to cloud storage:

**AWS S3:**
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

**Google Cloud Storage:**
```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket('exports-bucket');

async function uploadFile(blob: Blob, filename: string): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const file = bucket.file(`exports/${Date.now()}_${filename}`);

  await file.save(Buffer.from(buffer), {
    contentType: blob.type,
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return url;
}
```

## Job Scheduling

### Production Setup

For production, use a job queue system:

**Bull Queue (Redis):**
```typescript
import Bull from 'bull';

const exportQueue = new Bull('exports', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
});

exportQueue.process(async (job) => {
  const { dashboardName, data, options } = job.data;
  const result = await exportManager.export(dashboardName, data, options);
  return result;
});

// Schedule recurring job
exportQueue.add(
  { dashboardName, data, options },
  {
    repeat: {
      cron: '0 0 * * 1', // Every Monday at midnight
    },
  }
);
```

## Performance Optimization

### Token Efficiency

Always aggregate data before exporting to minimize token usage:

```tsx
// ❌ BAD: Export 50,000 raw rows
const data = await fetchAllData(); // 50,000 rows
await exportHook.quickExport('Report', data, 'excel');

// ✅ GOOD: Aggregate first, export 100 rows
const data = await fetchAggregatedData(); // 100 aggregated rows
await exportHook.quickExport('Report', data, 'excel');
```

### Large Datasets

For large datasets, use pagination or maxRows:

```tsx
await exportHook.export('Large Dataset', data, {
  format: 'csv',
  maxRows: 1000,  // Limit to 1000 rows
  compression: true,  // Enable compression
});
```

### Background Processing

For very large exports, use background processing:

```typescript
// Queue the export
const jobId = await queueExport({
  dashboardName: 'Large Report',
  data: largeDataset,
  options: exportOptions,
});

// Poll for completion
const interval = setInterval(async () => {
  const job = exportManager.getJobStatus(jobId);
  if (job?.status === 'completed') {
    clearInterval(interval);
    console.log('Export complete:', job.fileUrl);
  }
}, 5000);
```

## Troubleshooting

### Common Issues

**1. Charts not appearing in PDF:**
```tsx
// Make sure element is rendered before export
const dashboardRef = useRef<HTMLDivElement>(null);

// Wait for render
await new Promise(resolve => setTimeout(resolve, 100));

// Then export
await exportHook.export('Dashboard', data, options, dashboardRef.current);
```

**2. Memory issues with large exports:**
```tsx
// Use compression and limit rows
{
  maxRows: 10000,
  compression: true,
  includeCharts: false,  // Skip charts for large exports
}
```

**3. Email not sending:**
```typescript
// Check API route logs
// Verify email service credentials
// Test with curl:
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"to":["test@example.com"],"subject":"Test","body":"Test"}'
```

**4. File not downloading:**
```typescript
// Check CORS settings for cloud storage
// Verify signed URL expiration
// Test URL in browser directly
```

## Best Practices

### 1. Filter Before Export
Always apply filters before exporting to reduce file size:

```tsx
const filteredData = data.filter(row =>
  row.status === 'active' &&
  row.date >= startDate
);

await exportHook.quickExport('Filtered Data', filteredData, 'excel');
```

### 2. Use Templates for Recurring Reports
Save templates for frequently used export configurations:

```tsx
// Save once
const template = exportHook.saveTemplate(
  'Monthly Report',
  'PDF with charts and email',
  { format: 'pdf', includeCharts: true, emailDelivery: { ... } }
);

// Reuse many times
const config = exportHook.loadTemplate(template.id);
await exportHook.export('January Report', data, config.options);
```

### 3. Provide User Feedback
Always show progress and success/error states:

```tsx
{exportHook.isExporting && (
  <div>
    <Progress value={exportHook.progress} />
    <span>Exporting... {exportHook.progress}%</span>
  </div>
)}

{exportHook.error && (
  <Alert variant="destructive">{exportHook.error}</Alert>
)}

{exportHook.lastResult?.success && (
  <Alert variant="success">Export completed!</Alert>
)}
```

### 4. Clean Up Old Jobs
Implement job retention policy:

```typescript
// Delete jobs older than 30 days
const jobs = exportManager.listJobs();
const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

jobs.forEach(job => {
  if (job.createdAt.getTime() < thirtyDaysAgo) {
    // Delete from storage and database
  }
});
```

## Examples

See `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/export/example-usage.tsx` for complete working examples including:

- Simple export button in dashboard header
- Full export management page
- Programmatic export with custom options
- Scheduled export setup
- Dataset API integration
- Template usage
- Complete dashboard integration

## Support

For issues, questions, or feature requests:
- Check examples in `example-usage.tsx`
- Review API reference above
- Contact: development team

## License

Internal use only - WPP Analytics Platform
