/**
 * Example Usage of Enhanced Export System
 *
 * Demonstrates how to integrate the export functionality into your dashboard
 */

import React, { useRef } from 'react';
import { ExportButton } from './ExportButton';
import { ExportDialog } from './ExportDialog';
import { ExportJobsPanel } from './ExportJobsPanel';
import { ExportTemplatesPanel } from './ExportTemplatesPanel';
import { useEnhancedExport } from '@/lib/export/use-enhanced-export';
import type { ExportFilter } from '@/lib/export/enhanced-export';

// ============================================================================
// Example 1: Simple Export Button in Dashboard Header
// ============================================================================

export function DashboardHeaderExample() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Your dashboard data
  const dashboardData = [
    { campaign: 'Campaign A', clicks: 1000, cost: 500, conversions: 50 },
    { campaign: 'Campaign B', clicks: 1500, cost: 750, conversions: 75 },
    { campaign: 'Campaign C', clicks: 2000, cost: 1000, conversions: 100 },
  ];

  // Active filters from your dashboard state
  const activeFilters: ExportFilter[] = [
    {
      field: 'date',
      operator: 'between',
      value: ['2024-01-01', '2024-01-31'],
      label: 'Date Range',
    },
    {
      field: 'campaign',
      operator: 'contains',
      value: 'Campaign',
      label: 'Campaign Name',
    },
  ];

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">Google Ads Dashboard</h1>

      <ExportButton
        dashboardName="Google Ads Performance"
        data={dashboardData}
        element={dashboardRef.current || undefined}
        activeFilters={activeFilters}
        onSuccess={(fileUrl) => {
          console.log('Export successful:', fileUrl);
          // Optional: Show success toast
        }}
      />
    </div>
  );
}

// ============================================================================
// Example 2: Full Export Page with Jobs and Templates
// ============================================================================

export function ExportManagementPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Export Management</h1>
        <p className="text-muted-foreground">
          Manage your exports, view history, and save templates
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExportJobsPanel />
        <ExportTemplatesPanel />
      </div>
    </div>
  );
}

// ============================================================================
// Example 3: Programmatic Export with Custom Options
// ============================================================================

export function ProgrammaticExportExample() {
  const exportHook = useEnhancedExport();

  const handleCustomExport = async () => {
    const data = [
      { metric: 'Impressions', value: 10000 },
      { metric: 'Clicks', value: 500 },
      { metric: 'Conversions', value: 25 },
    ];

    const result = await exportHook.export(
      'Campaign Performance Summary',
      data,
      {
        format: 'pdf',
        includeCharts: true,
        includeMetadata: true,
        includeFilters: true,
        pageOrientation: 'landscape',
        watermark: {
          text: 'CONFIDENTIAL',
          opacity: 0.2,
        },
        emailDelivery: {
          enabled: true,
          recipients: ['manager@example.com', 'team@example.com'],
          subject: 'Weekly Campaign Report',
          body: 'Please find attached the weekly campaign performance report.',
        },
      }
    );

    if (result.success) {
      console.log('Export completed:', result);
    } else {
      console.error('Export failed:', result.error);
    }
  };

  return (
    <button onClick={handleCustomExport}>
      Export with Custom Settings
    </button>
  );
}

// ============================================================================
// Example 4: Scheduled Export Setup
// ============================================================================

export function ScheduledExportExample() {
  const exportHook = useEnhancedExport();

  const setupWeeklyReport = async () => {
    const data = [
      { week: 'Week 1', revenue: 5000, cost: 2000 },
      { week: 'Week 2', revenue: 5500, cost: 2100 },
      { week: 'Week 3', revenue: 6000, cost: 2200 },
    ];

    const result = await exportHook.scheduleExport(
      'Weekly Performance Report',
      data,
      'weekly',
      ['team@example.com'],
      'pdf'
    );

    if (result.success) {
      console.log('Scheduled export created successfully');
    }
  };

  return (
    <button onClick={setupWeeklyReport}>
      Setup Weekly Email Report
    </button>
  );
}

// ============================================================================
// Example 5: Export with Cube.js Data
// ============================================================================

export function CubeJsExportExample() {
  const exportHook = useEnhancedExport();

  // Assuming you have a Cube.js result set
  const handleCubeExport = async (resultSet: any) => {
    // Convert Cube.js data to flat format
    const data = resultSet.tablePivot().map((row: any) => {
      const flatRow: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        // Remove cube name prefix for cleaner column names
        const shortKey = key.split('.').pop() || key;
        flatRow[shortKey] = row[key];
      });
      return flatRow;
    });

    // Export with active query filters
    const result = await exportHook.exportWithFilters(
      'Multi-Platform Search Analysis',
      data,
      [
        {
          field: 'date',
          operator: 'between',
          value: ['2024-01-01', '2024-01-31'],
          label: 'Date Range',
        },
      ],
      'excel'
    );

    return result;
  };

  return <div>Cube.js Export Example</div>;
}

// ============================================================================
// Example 6: Export Template Usage
// ============================================================================

export function ExportTemplateExample() {
  const { templates, saveTemplate, loadTemplate } = useEnhancedExport();

  const saveCurrentConfig = () => {
    const template = saveTemplate(
      'Monthly PDF Report',
      'PDF export with charts, email delivery, and watermark',
      {
        format: 'pdf',
        includeCharts: true,
        includeMetadata: true,
        pageOrientation: 'landscape',
        watermark: {
          text: 'CONFIDENTIAL',
          opacity: 0.2,
        },
        emailDelivery: {
          enabled: true,
          recipients: ['monthly-report@example.com'],
        },
      }
    );

    console.log('Template saved:', template);
  };

  const useExistingTemplate = (templateId: string) => {
    const template = loadTemplate(templateId);
    if (template) {
      console.log('Using template:', template);
      // Use template.options for export
    }
  };

  return (
    <div>
      <button onClick={saveCurrentConfig}>Save as Template</button>
      <div>
        {templates.map((t) => (
          <button key={t.id} onClick={() => useExistingTemplate(t.id)}>
            Use {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Complete Dashboard Integration
// ============================================================================

export function CompleteDashboardExample() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  const dashboardData = [
    { campaign: 'Campaign A', impressions: 10000, clicks: 500, cost: 250 },
    { campaign: 'Campaign B', impressions: 15000, clicks: 750, cost: 375 },
    { campaign: 'Campaign C', impressions: 20000, clicks: 1000, cost: 500 },
  ];

  const activeFilters: ExportFilter[] = [
    {
      field: 'date',
      operator: 'between',
      value: ['2024-01-01', '2024-01-31'],
      label: 'Date Range',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Export Button */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Campaign Dashboard</h1>

          <div className="flex gap-2">
            {/* Quick Export Button */}
            <ExportButton
              dashboardName="Campaign Performance"
              data={dashboardData}
              element={dashboardRef.current || undefined}
              activeFilters={activeFilters}
              variant="outline"
            />

            {/* Advanced Export Dialog */}
            <button
              onClick={() => setExportDialogOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Advanced Export
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container py-6" ref={dashboardRef}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Your charts and widgets here */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Total Impressions</h3>
            <div className="text-3xl font-bold">45,000</div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Total Clicks</h3>
            <div className="text-3xl font-bold">2,250</div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Total Cost</h3>
            <div className="text-3xl font-bold">$1,125</div>
          </div>
        </div>

        {/* Data table */}
        <div className="mt-6">
          <table className="w-full border rounded-lg">
            <thead>
              <tr className="border-b bg-muted">
                <th className="p-2 text-left">Campaign</th>
                <th className="p-2 text-right">Impressions</th>
                <th className="p-2 text-right">Clicks</th>
                <th className="p-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{row.campaign}</td>
                  <td className="p-2 text-right">{row.impressions.toLocaleString()}</td>
                  <td className="p-2 text-right">{row.clicks.toLocaleString()}</td>
                  <td className="p-2 text-right">${row.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        dashboardName="Campaign Performance"
        data={dashboardData}
        element={dashboardRef.current || undefined}
        activeFilters={activeFilters}
        onSuccess={(fileUrl) => {
          console.log('Export successful:', fileUrl);
        }}
      />
    </div>
  );
}
