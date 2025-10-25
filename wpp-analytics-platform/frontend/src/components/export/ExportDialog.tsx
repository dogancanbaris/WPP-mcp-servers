/**
 * Export Dialog Component
 *
 * Comprehensive UI for configuring and triggering exports
 */

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEnhancedExport } from '@/lib/export/use-enhanced-export';
import {
  FileDown,
  Mail,
  Calendar,
  Filter,
  Settings,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import type {
  ExportFormat,
  ExportFrequency,
  ExportFilter,
  ExportOptions,
} from '@/lib/export/enhanced-export';

// ============================================================================
// Props
// ============================================================================

export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardName: string;
  data: Record<string, unknown>[];
  element?: HTMLElement;
  activeFilters?: ExportFilter[];
  onSuccess?: (fileUrl: string) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function ExportDialog({
  open,
  onOpenChange,
  dashboardName,
  data,
  element,
  activeFilters = [],
  onSuccess,
}: ExportDialogProps) {
  const exportHook = useEnhancedExport();

  // State for export options
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [filename, setFilename] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [compression, setCompression] = useState(false);
  const [maxRows, setMaxRows] = useState<number | undefined>(undefined);

  // Scheduling state
  const [scheduled, setScheduled] = useState(false);
  const [frequency, setFrequency] = useState<ExportFrequency>('once');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [recipients, setRecipients] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Filters state
  const [useActiveFilters, setUseActiveFilters] = useState(true);
  const [customFilters, setCustomFilters] = useState<ExportFilter[]>([]);

  // Watermark state
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');

  const handleExport = async () => {
    const options: ExportOptions = {
      format,
      filename: filename || undefined,
      includeCharts,
      includeMetadata,
      includeFilters,
      pageOrientation,
      compression,
      maxRows,
      filters: useActiveFilters ? activeFilters : customFilters,
      scheduled,
      frequency: scheduled ? frequency : undefined,
      emailDelivery: emailEnabled
        ? {
            enabled: true,
            recipients: recipients.split(',').map((r) => r.trim()),
            subject: emailSubject || undefined,
            body: emailBody || undefined,
          }
        : undefined,
      watermark: watermarkEnabled
        ? {
            text: watermarkText,
            opacity: 0.3,
          }
        : undefined,
    };

    const result = await exportHook.export(dashboardName, data, options, element);

    if (result.success && result.fileUrl) {
      onSuccess?.(result.fileUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Export Dashboard
          </DialogTitle>
          <DialogDescription>
            Configure export settings for "{dashboardName}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Settings Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Workbook</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                  <SelectItem value="png">PNG Image</SelectItem>
                  <SelectItem value="zip">ZIP Archive (All Formats)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filename">Filename (optional)</Label>
              <Input
                id="filename"
                placeholder="Leave empty for auto-generated name"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  disabled={format === 'csv' || format === 'json'}
                />
                <Label htmlFor="includeCharts" className="cursor-pointer">
                  Include charts and visualizations
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="includeMetadata" className="cursor-pointer">
                  Include metadata (timestamp, summary)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFilters"
                  checked={includeFilters}
                  onCheckedChange={(checked) => setIncludeFilters(checked as boolean)}
                />
                <Label htmlFor="includeFilters" className="cursor-pointer">
                  Include applied filters
                </Label>
              </div>
            </div>

            {(format === 'pdf' || format === 'zip') && (
              <div className="space-y-2">
                <Label htmlFor="orientation">Page Orientation</Label>
                <Select
                  value={pageOrientation}
                  onValueChange={(v) => setPageOrientation(v as 'portrait' | 'landscape')}
                >
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total records:</span>
                  <span className="font-medium">{data.length.toLocaleString()}</span>
                </div>
                {activeFilters.length > 0 && (
                  <div className="flex justify-between mt-1">
                    <span>Active filters:</span>
                    <Badge variant="secondary">{activeFilters.length}</Badge>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Filter Options</Label>
                <Badge variant={useActiveFilters ? 'default' : 'secondary'}>
                  {useActiveFilters ? 'Using Dashboard Filters' : 'Custom Filters'}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useActiveFilters"
                  checked={useActiveFilters}
                  onCheckedChange={(checked) => setUseActiveFilters(checked as boolean)}
                />
                <Label htmlFor="useActiveFilters" className="cursor-pointer">
                  Use active dashboard filters
                </Label>
              </div>

              {useActiveFilters && activeFilters.length > 0 && (
                <div className="mt-3 p-3 bg-muted rounded-lg space-y-2">
                  <div className="text-sm font-medium">Active Filters:</div>
                  {activeFilters.map((filter, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Filter className="h-3 w-3" />
                      <span className="font-medium">{filter.label || filter.field}:</span>
                      <span className="text-muted-foreground">{filter.operator}</span>
                      <span>{JSON.stringify(filter.value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {!useActiveFilters && (
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Custom filter configuration (coming soon)
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Add Filter
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRows">Maximum Rows (optional)</Label>
              <Input
                id="maxRows"
                type="number"
                placeholder="Leave empty for all rows"
                value={maxRows || ''}
                onChange={(e) =>
                  setMaxRows(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
              <p className="text-xs text-muted-foreground">
                Limit the number of rows included in the export
              </p>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="scheduled"
                checked={scheduled}
                onCheckedChange={(checked) => setScheduled(checked as boolean)}
              />
              <Label htmlFor="scheduled" className="cursor-pointer font-medium">
                Schedule recurring export
              </Label>
            </div>

            {scheduled && (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={frequency}
                    onValueChange={(v) => setFrequency(v as ExportFrequency)}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailEnabled"
                  checked={emailEnabled}
                  onCheckedChange={(checked) => setEmailEnabled(checked as boolean)}
                />
                <Label htmlFor="emailEnabled" className="cursor-pointer font-medium">
                  Email delivery
                </Label>
              </div>

              {emailEnabled && (
                <div className="space-y-4 pl-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipients">Recipients</Label>
                    <Input
                      id="recipients"
                      placeholder="email@example.com, another@example.com"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated email addresses
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Subject (optional)</Label>
                    <Input
                      id="emailSubject"
                      placeholder="Auto-generated if empty"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailBody">Message (optional)</Label>
                    <Input
                      id="emailBody"
                      placeholder="Auto-generated if empty"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="compression"
                checked={compression}
                onCheckedChange={(checked) => setCompression(checked as boolean)}
              />
              <Label htmlFor="compression" className="cursor-pointer">
                Enable compression for large files
              </Label>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="watermarkEnabled"
                  checked={watermarkEnabled}
                  onCheckedChange={(checked) => setWatermarkEnabled(checked as boolean)}
                  disabled={format === 'csv' || format === 'json'}
                />
                <Label htmlFor="watermarkEnabled" className="cursor-pointer">
                  Add watermark
                </Label>
              </div>

              {watermarkEnabled && (
                <div className="space-y-2 pl-6 mt-3">
                  <Label htmlFor="watermarkText">Watermark Text</Label>
                  <Input
                    id="watermarkText"
                    placeholder="CONFIDENTIAL"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t">
              <div className="text-sm space-y-2">
                <div className="font-medium">Export Summary</div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Format:</div>
                  <div className="font-medium">{format.toUpperCase()}</div>

                  <div>Records:</div>
                  <div className="font-medium">
                    {maxRows ? Math.min(maxRows, data.length) : data.length}
                  </div>

                  <div>Scheduled:</div>
                  <div className="font-medium">{scheduled ? frequency : 'No'}</div>

                  <div>Email:</div>
                  <div className="font-medium">
                    {emailEnabled ? recipients.split(',').length + ' recipient(s)' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {exportHook.isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exporting...</span>
              <span className="font-medium">{exportHook.progress}%</span>
            </div>
            <Progress value={exportHook.progress} />
          </div>
        )}

        {exportHook.error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            <X className="h-4 w-4" />
            <span>{exportHook.error}</span>
          </div>
        )}

        {exportHook.lastResult?.success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
            <Check className="h-4 w-4" />
            <span>Export completed successfully!</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exportHook.isExporting}>
            {exportHook.isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
