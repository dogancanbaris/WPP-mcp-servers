/**
 * Enhanced Export System for WPP Analytics Platform
 *
 * Features:
 * - Export with active filters applied
 * - Scheduled exports (recurring)
 * - Email delivery integration
 * - Multiple formats (PDF, Excel, CSV, JSON, PNG)
 * - Background processing for large exports
 * - Export templates and presets
 * - Watermarking and branding
 * - Compression for large files
 */

import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import * as JSZip from 'jszip';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'zip';
export type ExportFrequency = 'once' | 'daily' | 'weekly' | 'monthly';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: unknown;
  label?: string;
}

export interface ExportOptions {
  // Basic options
  format: ExportFormat;
  filename?: string;

  // Data filtering
  filters?: ExportFilter[];
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };

  // Scheduling
  scheduled?: boolean;
  frequency?: ExportFrequency;
  nextRunAt?: Date;

  // Email delivery
  emailDelivery?: {
    enabled: boolean;
    recipients: string[];
    subject?: string;
    body?: string;
  };

  // Formatting options
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

export interface ExportJob {
  id: string;
  userId: string;
  dashboardId?: string;
  dashboardName: string;
  options: ExportOptions;
  status: ExportStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  options: Partial<ExportOptions>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportResult {
  success: boolean;
  jobId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  emailSent?: boolean;
}

// ============================================================================
// Enhanced Export Manager
// ============================================================================

export class EnhancedExportManager {
  private jobs: Map<string, ExportJob> = new Map();
  private templates: Map<string, ExportTemplate> = new Map();

  /**
   * Main export method with all enhanced features
   */
  async export(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions,
    element?: HTMLElement
  ): Promise<ExportResult> {
    // Create job
    const jobId = this.generateJobId();
    const job: ExportJob = {
      id: jobId,
      userId: this.getCurrentUserId(),
      dashboardName,
      options,
      status: 'pending',
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);

    try {
      // Update status
      job.status = 'processing';
      job.startedAt = new Date();

      // Apply filters if provided
      const filteredData = options.filters
        ? this.applyFilters(data, options.filters)
        : data;

      // Limit rows if specified
      const limitedData = options.maxRows
        ? filteredData.slice(0, options.maxRows)
        : filteredData;

      // Generate export based on format
      let result: ExportResult;

      switch (options.format) {
        case 'pdf':
          result = await this.exportToPDF(dashboardName, limitedData, options, element);
          break;
        case 'excel':
          result = await this.exportToExcel(dashboardName, limitedData, options);
          break;
        case 'csv':
          result = await this.exportToCSV(dashboardName, limitedData, options);
          break;
        case 'json':
          result = await this.exportToJSON(dashboardName, limitedData, options);
          break;
        case 'png':
          result = await this.exportToPNG(dashboardName, options, element);
          break;
        case 'zip':
          result = await this.exportToZip(dashboardName, limitedData, options, element);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Update job status
      job.status = 'completed';
      job.completedAt = new Date();
      job.fileUrl = result.fileUrl;
      job.fileSize = result.fileSize;

      // Send email if configured
      if (options.emailDelivery?.enabled && result.fileUrl) {
        await this.sendEmailWithAttachment(
          options.emailDelivery,
          result.fileUrl,
          dashboardName,
          options
        );
        result.emailSent = true;
      }

      // Schedule next run if recurring
      if (options.scheduled && options.frequency !== 'once') {
        await this.scheduleNextExport(dashboardName, data, options, element);
      }

      return { ...result, jobId, success: true };

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.error = error instanceof Error ? error.message : 'Unknown error';

      console.error('Export failed:', error);
      return {
        success: false,
        jobId,
        error: job.error,
      };
    }
  }

  // ============================================================================
  // Format-Specific Export Methods
  // ============================================================================

  /**
   * Enhanced PDF export with filters, branding, and metadata
   */
  private async exportToPDF(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions,
    element?: HTMLElement
  ): Promise<ExportResult> {
    const pdf = new jsPDF({
      orientation: options.pageOrientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add logo if provided
    if (options.logo?.url) {
      try {
        const img = await this.loadImage(options.logo.url);
        const logoWidth = options.logo.width || 30;
        const logoHeight = options.logo.height || 15;
        pdf.addImage(img, 'PNG', 10, yPosition, logoWidth, logoHeight);
        yPosition += logoHeight + 5;
      } catch (err) {
        console.warn('Failed to load logo:', err);
      }
    }

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(dashboardName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add timestamp
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    // Add applied filters section
    if (options.includeFilters && options.filters && options.filters.length > 0) {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Applied Filters:', 10, yPosition);
      yPosition += 5;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      options.filters.forEach((filter) => {
        const filterText = `${filter.label || filter.field}: ${filter.operator} ${JSON.stringify(filter.value)}`;
        pdf.text(filterText, 15, yPosition);
        yPosition += 4;
      });
      yPosition += 3;
    }

    // Add date range if provided
    if (options.dateRange) {
      pdf.setFontSize(9);
      pdf.text(
        `Date Range: ${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}`,
        10,
        yPosition
      );
      yPosition += 8;
    }

    // Add charts if element provided
    if (options.includeCharts && element) {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Handle pagination if image is too tall
      if (yPosition + imgHeight > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, Math.min(imgHeight, pageHeight - yPosition - 20));
      yPosition += imgHeight + 10;
    }

    // Add data table
    if (options.includeMetadata && data.length > 0) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data Summary', 10, yPosition);
      yPosition += 7;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');

      // Table headers
      const columns = options.columnOrder || Object.keys(data[0]);
      const colWidth = (pageWidth - 20) / columns.length;

      columns.forEach((col, i) => {
        pdf.text(String(col), 10 + i * colWidth, yPosition);
      });
      yPosition += 5;

      // Table rows (limited to fit page)
      const maxRows = Math.min(data.length, 20);
      for (let i = 0; i < maxRows; i++) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        columns.forEach((col, j) => {
          const value = data[i][col];
          const text = String(value ?? '');
          pdf.text(text.substring(0, 20), 10 + j * colWidth, yPosition);
        });
        yPosition += 4;
      }

      if (data.length > maxRows) {
        yPosition += 3;
        pdf.setFontSize(9);
        pdf.text(`... and ${data.length - maxRows} more rows`, 10, yPosition);
      }
    }

    // Add watermark if provided
    if (options.watermark) {
      const totalPages = pdf.getNumberOfPages();
      pdf.setFontSize(40);
      pdf.setTextColor(200, 200, 200);

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(
          options.watermark.text,
          pageWidth / 2,
          pageHeight / 2,
          {
            align: 'center',
            angle: 45,
          }
        );
      }
    }

    // Generate filename
    const filename = this.generateFilename(dashboardName, options, 'pdf');

    // Save PDF
    const pdfBlob = pdf.output('blob');
    const fileUrl = await this.uploadFile(pdfBlob, filename);

    return {
      success: true,
      fileUrl,
      fileName: filename,
      fileSize: pdfBlob.size,
    };
  }

  /**
   * Enhanced Excel export with multiple sheets and formatting
   */
  private async exportToExcel(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if (options.includeMetadata) {
      const summaryData = [
        ['Dashboard Export Report'],
        [],
        ['Dashboard Name:', dashboardName],
        ['Export Date:', new Date().toLocaleString()],
        ['Total Records:', data.length],
        [],
      ];

      // Add filters to summary
      if (options.filters && options.filters.length > 0) {
        summaryData.push(['Applied Filters:']);
        options.filters.forEach((filter) => {
          summaryData.push([
            filter.label || filter.field,
            filter.operator,
            JSON.stringify(filter.value),
          ]);
        });
        summaryData.push([]);
      }

      // Add date range
      if (options.dateRange) {
        summaryData.push(['Date Range:']);
        summaryData.push([
          'Start:',
          new Date(options.dateRange.start).toLocaleDateString(),
        ]);
        summaryData.push([
          'End:',
          new Date(options.dateRange.end).toLocaleDateString(),
        ]);
        summaryData.push([]);
      }

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Data sheet
    const dataSheet = XLSX.utils.json_to_sheet(data);

    // Apply column ordering if specified
    if (options.columnOrder) {
      dataSheet['!cols'] = options.columnOrder.map(() => ({ wch: 20 }));
    }

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');

    // Add statistics sheet
    if (options.includeMetadata && data.length > 0) {
      const statsData = this.calculateStatistics(data);
      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    }

    // Generate filename
    const filename = this.generateFilename(dashboardName, options, 'xlsx');

    // Write file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    let fileUrl: string;
    let fileSize = excelBlob.size;

    // Compress if option enabled and file is large
    if (options.compression && fileSize > 1024 * 1024) {
      const compressed = await this.compressFile(excelBlob, filename);
      fileUrl = await this.uploadFile(compressed, filename + '.zip');
      fileSize = compressed.size;
    } else {
      fileUrl = await this.uploadFile(excelBlob, filename);
    }

    return {
      success: true,
      fileUrl,
      fileName: filename,
      fileSize,
    };
  }

  /**
   * Enhanced CSV export with metadata header
   */
  private async exportToCSV(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions
  ): Promise<ExportResult> {
    let csvContent = '';

    // Add metadata header as comments
    if (options.includeMetadata) {
      csvContent += `# Dashboard: ${dashboardName}\n`;
      csvContent += `# Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `# Records: ${data.length}\n`;

      if (options.filters && options.filters.length > 0) {
        csvContent += '# Applied Filters:\n';
        options.filters.forEach((filter) => {
          csvContent += `# - ${filter.label || filter.field}: ${filter.operator} ${JSON.stringify(filter.value)}\n`;
        });
      }

      if (options.dateRange) {
        csvContent += `# Date Range: ${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}\n`;
      }

      csvContent += '\n';
    }

    // Convert data to CSV
    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      csvContent += csv;
    }

    // Generate filename
    const filename = this.generateFilename(dashboardName, options, 'csv');

    // Create blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileUrl = await this.uploadFile(blob, filename);

    return {
      success: true,
      fileUrl,
      fileName: filename,
      fileSize: blob.size,
    };
  }

  /**
   * Export to JSON with metadata
   */
  private async exportToJSON(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const exportData: Record<string, unknown> = {
      dashboard: dashboardName,
      exportedAt: new Date().toISOString(),
      recordCount: data.length,
      data,
    };

    if (options.includeMetadata) {
      exportData.metadata = {
        filters: options.filters || [],
        dateRange: options.dateRange,
      };
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = this.generateFilename(dashboardName, options, 'json');
    const blob = new Blob([jsonString], { type: 'application/json' });

    const fileUrl = await this.uploadFile(blob, filename);

    return {
      success: true,
      fileUrl,
      fileName: filename,
      fileSize: blob.size,
    };
  }

  /**
   * Export dashboard visualization as PNG
   */
  private async exportToPNG(
    dashboardName: string,
    options: ExportOptions,
    element?: HTMLElement
  ): Promise<ExportResult> {
    if (!element) {
      throw new Error('Element required for PNG export');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    // Add watermark if specified
    if (options.watermark) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '48px Arial';
        ctx.fillStyle = `rgba(200, 200, 200, ${options.watermark.opacity || 0.3})`;
        ctx.textAlign = 'center';
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.fillText(options.watermark.text, 0, 0);
      }
    }

    const filename = this.generateFilename(dashboardName, options, 'png');

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });

    const fileUrl = await this.uploadFile(blob, filename);

    return {
      success: true,
      fileUrl,
      fileName: filename,
      fileSize: blob.size,
    };
  }

  /**
   * Export everything as a ZIP archive
   */
  private async exportToZip(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions,
    element?: HTMLElement
  ): Promise<ExportResult> {
    const zip = new JSZip();

    // Add CSV data
    const csvResult = await this.exportToCSV(dashboardName, data, {
      ...options,
      compression: false,
    });
    if (csvResult.fileUrl) {
      const csvBlob = await fetch(csvResult.fileUrl).then((r) => r.blob());
      zip.file('data.csv', csvBlob);
    }

    // Add JSON data
    const jsonResult = await this.exportToJSON(dashboardName, data, options);
    if (jsonResult.fileUrl) {
      const jsonBlob = await fetch(jsonResult.fileUrl).then((r) => r.blob());
      zip.file('data.json', jsonBlob);
    }

    // Add PNG screenshot if element provided
    if (element) {
      const pngResult = await this.exportToPNG(dashboardName, options, element);
      if (pngResult.fileUrl) {
        const pngBlob = await fetch(pngResult.fileUrl).then((r) => r.blob());
        zip.file('dashboard.png', pngBlob);
      }
    }

    // Add README
    const readme = this.generateReadme(dashboardName, data, options);
    zip.file('README.txt', readme);

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const filename = this.generateFilename(dashboardName, options, 'zip');
    const fileUrl = await this.uploadFile(zipBlob, filename);

    return {
      success: true,
      fileUrl,
      fileName: filename,
      fileSize: zipBlob.size,
    };
  }

  // ============================================================================
  // Filtering & Data Processing
  // ============================================================================

  /**
   * Apply filters to data
   */
  private applyFilters(
    data: Record<string, unknown>[],
    filters: ExportFilter[]
  ): Record<string, unknown>[] {
    return data.filter((row) => {
      return filters.every((filter) => {
        const value = row[filter.field];

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).includes(String(filter.value));
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'between':
            if (Array.isArray(filter.value) && filter.value.length === 2) {
              return Number(value) >= Number(filter.value[0]) &&
                     Number(value) <= Number(filter.value[1]);
            }
            return false;
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });
  }

  /**
   * Calculate basic statistics for numeric columns
   */
  private calculateStatistics(data: Record<string, unknown>[]): Record<string, unknown>[] {
    if (data.length === 0) return [];

    const stats: Record<string, unknown>[] = [];
    const columns = Object.keys(data[0]);

    columns.forEach((col) => {
      const values = data.map((row) => row[col]).filter((v) => typeof v === 'number');

      if (values.length > 0) {
        const numValues = values as number[];
        const sum = numValues.reduce((a, b) => a + b, 0);
        const avg = sum / numValues.length;
        const min = Math.min(...numValues);
        const max = Math.max(...numValues);

        stats.push({
          Column: col,
          Count: numValues.length,
          Sum: sum,
          Average: avg,
          Min: min,
          Max: max,
        });
      }
    });

    return stats;
  }

  // ============================================================================
  // Scheduling & Email
  // ============================================================================

  /**
   * Schedule next export for recurring jobs
   */
  private async scheduleNextExport(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions,
    element?: HTMLElement
  ): Promise<void> {
    if (!options.frequency || options.frequency === 'once') return;

    const nextRun = this.calculateNextRun(options.frequency);
    const scheduledOptions = { ...options, nextRunAt: nextRun };

    // Store scheduled job
    console.log(`Scheduled next export for ${dashboardName} at ${nextRun}`);

    // In production, this would integrate with a job queue system
    // For now, we'll use localStorage to persist scheduled jobs
    const scheduledJobs = this.getScheduledJobs();
    scheduledJobs.push({
      dashboardName,
      options: scheduledOptions,
      nextRun: nextRun.toISOString(),
    });
    localStorage.setItem('scheduled_exports', JSON.stringify(scheduledJobs));
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRun(frequency: ExportFrequency): Date {
    const now = new Date();

    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const next = new Date(now);
        next.setMonth(next.getMonth() + 1);
        return next;
      default:
        return now;
    }
  }

  /**
   * Send email with export attachment
   */
  private async sendEmailWithAttachment(
    emailConfig: NonNullable<ExportOptions['emailDelivery']>,
    fileUrl: string,
    dashboardName: string,
    options: ExportOptions
  ): Promise<void> {
    // In production, this would integrate with an email service (SendGrid, AWS SES, etc.)
    // For now, we'll log the email details

    const subject = emailConfig.subject || `Dashboard Export: ${dashboardName}`;
    const body = emailConfig.body || this.generateEmailBody(dashboardName, options);

    console.log('Sending export email:', {
      recipients: emailConfig.recipients,
      subject,
      body,
      attachment: fileUrl,
    });

    // Simulated API call
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailConfig.recipients,
          subject,
          body,
          attachmentUrl: fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Email delivery failed');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Generate email body for export notification
   */
  private generateEmailBody(dashboardName: string, options: ExportOptions): string {
    let body = `Your export for "${dashboardName}" is ready.\n\n`;
    body += `Format: ${options.format.toUpperCase()}\n`;
    body += `Generated: ${new Date().toLocaleString()}\n\n`;

    if (options.filters && options.filters.length > 0) {
      body += 'Applied Filters:\n';
      options.filters.forEach((filter) => {
        body += `- ${filter.label || filter.field}: ${filter.operator} ${JSON.stringify(filter.value)}\n`;
      });
      body += '\n';
    }

    if (options.dateRange) {
      body += `Date Range: ${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}\n\n`;
    }

    body += 'Please download the attachment to view your data.\n';

    return body;
  }

  // ============================================================================
  // Templates & Presets
  // ============================================================================

  /**
   * Save export configuration as a template
   */
  saveTemplate(name: string, description: string, options: Partial<ExportOptions>): ExportTemplate {
    const template: ExportTemplate = {
      id: this.generateJobId(),
      name,
      description,
      options,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(template.id, template);
    this.persistTemplates();

    return template;
  }

  /**
   * Load saved template
   */
  loadTemplate(templateId: string): ExportTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * List all templates
   */
  listTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      this.persistTemplates();
    }
    return deleted;
  }

  // ============================================================================
  // Job Management
  // ============================================================================

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ExportJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * List all jobs for current user
   */
  listJobs(userId?: string): ExportJob[] {
    const currentUserId = userId || this.getCurrentUserId();
    return Array.from(this.jobs.values())
      .filter((job) => job.userId === currentUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Cancel pending job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Cancelled by user';
      job.completedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get scheduled jobs
   */
  getScheduledJobs(): Array<{
    dashboardName: string;
    options: ExportOptions;
    nextRun: string;
  }> {
    try {
      const stored = localStorage.getItem('scheduled_exports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID (would integrate with auth system)
   */
  private getCurrentUserId(): string {
    // In production, get from auth context
    return 'current_user_id';
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(
    dashboardName: string,
    options: ExportOptions,
    extension: string
  ): string {
    if (options.filename) {
      return `${options.filename}.${extension}`;
    }

    const sanitized = dashboardName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitized}_${timestamp}.${extension}`;
  }

  /**
   * Load image from URL
   */
  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Compress file using JSZip
   */
  private async compressFile(blob: Blob, filename: string): Promise<Blob> {
    const zip = new JSZip();
    zip.file(filename, blob);
    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
  }

  /**
   * Upload file (simulated - in production would use S3, GCS, etc.)
   */
  private async uploadFile(blob: Blob, filename: string): Promise<string> {
    // In production, upload to cloud storage
    // For now, create a local object URL
    const url = URL.createObjectURL(blob);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return url;
  }

  /**
   * Generate README for ZIP exports
   */
  private generateReadme(
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions
  ): string {
    let readme = `Dashboard Export: ${dashboardName}\n`;
    readme += '='.repeat(50) + '\n\n';
    readme += `Generated: ${new Date().toLocaleString()}\n`;
    readme += `Records: ${data.length}\n\n`;

    readme += 'Contents:\n';
    readme += '- data.csv: Raw data in CSV format\n';
    readme += '- data.json: Structured data in JSON format\n';
    readme += '- dashboard.png: Visual snapshot of the dashboard\n\n';

    if (options.filters && options.filters.length > 0) {
      readme += 'Applied Filters:\n';
      options.filters.forEach((filter) => {
        readme += `- ${filter.label || filter.field}: ${filter.operator} ${JSON.stringify(filter.value)}\n`;
      });
      readme += '\n';
    }

    if (options.dateRange) {
      readme += `Date Range: ${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}\n\n`;
    }

    readme += 'For questions or support, contact your administrator.\n';

    return readme;
  }

  /**
   * Persist templates to localStorage
   */
  private persistTemplates(): void {
    const templates = Array.from(this.templates.values());
    localStorage.setItem('export_templates', JSON.stringify(templates));
  }

  /**
   * Load templates from localStorage
   */
  loadTemplatesFromStorage(): void {
    try {
      const stored = localStorage.getItem('export_templates');
      if (stored) {
        const templates = JSON.parse(stored) as ExportTemplate[];
        templates.forEach((t) => this.templates.set(t.id, t));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const exportManager = new EnhancedExportManager();

// Load templates on initialization
exportManager.loadTemplatesFromStorage();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick export with common defaults
 */
export async function quickExport(
  dashboardName: string,
  data: Record<string, unknown>[],
  format: ExportFormat = 'pdf',
  element?: HTMLElement
): Promise<ExportResult> {
  return exportManager.export(dashboardName, data, {
    format,
    includeCharts: true,
    includeMetadata: true,
    includeFilters: true,
  }, element);
}

/**
 * Export with filters applied
 */
export async function exportWithFilters(
  dashboardName: string,
  data: Record<string, unknown>[],
  filters: ExportFilter[],
  format: ExportFormat = 'excel',
  element?: HTMLElement
): Promise<ExportResult> {
  return exportManager.export(dashboardName, data, {
    format,
    filters,
    includeCharts: true,
    includeMetadata: true,
    includeFilters: true,
  }, element);
}

/**
 * Schedule recurring export with email delivery
 */
export async function scheduleExport(
  dashboardName: string,
  data: Record<string, unknown>[],
  frequency: ExportFrequency,
  recipients: string[],
  format: ExportFormat = 'pdf',
  element?: HTMLElement
): Promise<ExportResult> {
  return exportManager.export(dashboardName, data, {
    format,
    scheduled: true,
    frequency,
    emailDelivery: {
      enabled: true,
      recipients,
    },
    includeCharts: true,
    includeMetadata: true,
    includeFilters: true,
  }, element);
}
