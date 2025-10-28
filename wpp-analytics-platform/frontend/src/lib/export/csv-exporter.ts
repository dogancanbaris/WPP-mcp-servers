import type { DashboardConfig, ComponentConfig } from '@/types/dashboard-builder';

interface CSVExportResult {
  filename: string;
  data: string;
  rowCount: number;
  componentCount: number;
}

/**
 * Convert dashboard data to CSV format
 * Extracts data from table and scorecard components
 */
export const exportDashboardToCSV = async (
  dashboardConfig: DashboardConfig
): Promise<void> => {
  try {
    const exportables = extractExportableComponents(dashboardConfig);

    if (exportables.length === 0) {
      throw new Error('No table or scorecard components found to export');
    }

    // For single component, export directly
    // For multiple components, create a zip or multiple sheets (for now, export first)
    if (exportables.length === 1) {
      const csv = await generateCSVForComponent(exportables[0]);
      downloadCSV(csv, getFilenameForComponent(exportables[0], dashboardConfig.title));
    } else {
      // Export multiple components as separate CSV files
      // In a real implementation, you'd create a zip file
      for (let i = 0; i < exportables.length; i++) {
        const component = exportables[i];
        const csv = await generateCSVForComponent(component);
        const filename = getFilenameForComponent(component, dashboardConfig.title, i + 1);
        downloadCSV(csv, filename);
      }
    }
  } catch (error) {
    console.error('CSV export error:', error);
    throw error;
  }
};

/**
 * Extract exportable components (tables and scorecards)
 */
function extractExportableComponents(config: DashboardConfig): ComponentConfig[] {
  const exportables: ComponentConfig[] = [];

  for (const row of config.rows) {
    for (const col of row.columns) {
      if (col.component) {
        const type = col.component.type;
        // Export tables and scorecards
        if (
          type === 'table' ||
          type === 'pivot_table' ||
          type === 'scorecard'
        ) {
          exportables.push(col.component);
        }
      }
    }
  }

  return exportables;
}

/**
 * Generate CSV for a single component
 */
async function generateCSVForComponent(component: ComponentConfig): Promise<string> {
  // In a real implementation, you would:
  // 1. Query the actual data from the datasource
  // 2. Apply filters and date ranges
  // 3. Format the data properly

  // For now, generate a sample CSV based on component configuration
  const rows: string[] = [];

  if (component.type === 'table' || component.type === 'pivot_table') {
    // Generate table CSV
    const headers = [
      component.dimension || 'Dimension',
      ...(component.metrics || []),
    ];
    rows.push(headers.map(escapeCSVField).join(','));

    // Add sample data rows
    // In production, this would fetch real data from the datasource
    rows.push(`Sample Data 1,100,200,0.5`);
    rows.push(`Sample Data 2,150,250,0.6`);
    rows.push(`Sample Data 3,120,220,0.55`);
  } else if (component.type === 'scorecard') {
    // Generate scorecard CSV
    rows.push('Metric,Value');
    const metricName = component.metrics?.[0] || 'Value';
    rows.push(`${escapeCSVField(metricName)},1234`);
  }

  return rows.join('\n');
}

/**
 * Download CSV data as a file
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for component export
 */
function getFilenameForComponent(
  component: ComponentConfig,
  dashboardTitle?: string,
  index?: number
): string {
  const safeTitle = (dashboardTitle || 'dashboard')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const componentName = (component.title || component.type)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const timestamp = new Date().toISOString().split('T')[0];
  const suffix = index ? `-${index}` : '';

  return `${safeTitle}-${componentName}${suffix}-${timestamp}.csv`;
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string): string {
  if (typeof field !== 'string') {
    field = String(field);
  }

  // If field contains comma, quote, or newline, wrap in quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Escape quotes by doubling them
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

/**
 * Export specific table data (for future use with real data fetching)
 */
export async function exportTableData(
  datasource: string,
  dimension: string | null,
  metrics: string[],
  filters?: any[],
  dateRange?: any
): Promise<string> {
  // TODO: Implement actual data fetching from Cube.js/BigQuery
  // This is a placeholder for when we integrate real data export

  const headers = [dimension || 'Dimension', ...metrics];
  const rows: string[] = [headers.map(escapeCSVField).join(',')];

  // In production, fetch real data here
  // For now, return sample data
  rows.push(`Sample 1,100,200,0.5`);
  rows.push(`Sample 2,150,250,0.6`);

  return rows.join('\n');
}

/**
 * Export all dashboard data as ZIP (future enhancement)
 */
export async function exportDashboardToZip(
  dashboardConfig: DashboardConfig
): Promise<void> {
  // TODO: Implement ZIP export using JSZip library
  // This would bundle multiple CSV files into a single ZIP
  throw new Error('ZIP export not yet implemented. Install jszip library first.');
}
