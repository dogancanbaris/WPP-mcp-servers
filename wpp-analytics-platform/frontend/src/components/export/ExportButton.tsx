/**
 * Export Button Component
 *
 * Quick-access button with dropdown for common export formats
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuickExport } from '@/lib/export/use-enhanced-export';
import { ExportDialog } from './ExportDialog';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  FileJson,
  Image,
  Package,
  Settings,
  Check,
  Loader2,
} from 'lucide-react';
import type { ExportFormat, ExportFilter } from '@/lib/export/enhanced-export';

// ============================================================================
// Props
// ============================================================================

export interface ExportButtonProps {
  dashboardName: string;
  data: Record<string, unknown>[];
  element?: HTMLElement;
  activeFilters?: ExportFilter[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onSuccess?: (fileUrl: string) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function ExportButton({
  dashboardName,
  data,
  element,
  activeFilters = [],
  variant = 'default',
  size = 'default',
  className,
  onSuccess,
}: ExportButtonProps) {
  const { exportPDF, exportExcel, exportCSV, isExporting, error } = useQuickExport();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastExportedFormat, setLastExportedFormat] = useState<ExportFormat | null>(null);

  const handleQuickExport = async (format: ExportFormat) => {
    let result;

    switch (format) {
      case 'pdf':
        result = await exportPDF(dashboardName, data, element);
        break;
      case 'excel':
        result = await exportExcel(dashboardName, data);
        break;
      case 'csv':
        result = await exportCSV(dashboardName, data);
        break;
      default:
        return;
    }

    if (result.success) {
      setLastExportedFormat(format);
      if (result.fileUrl) {
        onSuccess?.(result.fileUrl);
      }
      // Clear success indicator after 3 seconds
      setTimeout(() => setLastExportedFormat(null), 3000);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : lastExportedFormat ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Exported
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => handleQuickExport('pdf')}
            disabled={isExporting}
          >
            <FileDown className="mr-2 h-4 w-4" />
            <span>PDF Document</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleQuickExport('excel')}
            disabled={isExporting}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Excel Workbook</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleQuickExport('csv')}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>CSV File</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Advanced Options...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dashboardName={dashboardName}
        data={data}
        element={element}
        activeFilters={activeFilters}
        onSuccess={onSuccess}
      />

      {error && (
        <div className="fixed bottom-4 right-4 max-w-md p-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg">
          Export failed: {error}
        </div>
      )}
    </>
  );
}

// ============================================================================
// Icon-Only Variant
// ============================================================================

export function ExportIconButton({
  dashboardName,
  data,
  element,
  activeFilters = [],
  onSuccess,
}: ExportButtonProps) {
  return (
    <ExportButton
      dashboardName={dashboardName}
      data={data}
      element={element}
      activeFilters={activeFilters}
      variant="ghost"
      size="sm"
      onSuccess={onSuccess}
    />
  );
}
