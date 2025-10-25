/**
 * React Hook for Enhanced Export System
 *
 * Provides easy-to-use React integration for the enhanced export functionality
 */

import { useState, useCallback, useRef } from 'react';
import {
  exportManager,
  quickExport,
  exportWithFilters,
  scheduleExport,
  type ExportOptions,
  type ExportResult,
  type ExportJob,
  type ExportFilter,
  type ExportFormat,
  type ExportFrequency,
  type ExportTemplate,
} from './enhanced-export';

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseEnhancedExportReturn {
  // Export methods
  export: (
    dashboardName: string,
    data: Record<string, unknown>[],
    options: ExportOptions,
    element?: HTMLElement
  ) => Promise<ExportResult>;
  quickExport: (
    dashboardName: string,
    data: Record<string, unknown>[],
    format?: ExportFormat,
    element?: HTMLElement
  ) => Promise<ExportResult>;
  exportWithFilters: (
    dashboardName: string,
    data: Record<string, unknown>[],
    filters: ExportFilter[],
    format?: ExportFormat,
    element?: HTMLElement
  ) => Promise<ExportResult>;
  scheduleExport: (
    dashboardName: string,
    data: Record<string, unknown>[],
    frequency: ExportFrequency,
    recipients: string[],
    format?: ExportFormat,
    element?: HTMLElement
  ) => Promise<ExportResult>;

  // State
  isExporting: boolean;
  progress: number;
  currentJob: ExportJob | null;
  error: string | null;
  lastResult: ExportResult | null;

  // Job management
  jobs: ExportJob[];
  getJobStatus: (jobId: string) => ExportJob | null;
  cancelJob: (jobId: string) => boolean;
  refreshJobs: () => void;

  // Template management
  templates: ExportTemplate[];
  saveTemplate: (name: string, description: string, options: Partial<ExportOptions>) => ExportTemplate;
  loadTemplate: (templateId: string) => ExportTemplate | null;
  deleteTemplate: (templateId: string) => boolean;
  refreshTemplates: () => void;

  // Scheduled exports
  scheduledJobs: Array<{
    dashboardName: string;
    options: ExportOptions;
    nextRun: string;
  }>;
  refreshScheduledJobs: () => void;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useEnhancedExport(): UseEnhancedExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ExportResult | null>(null);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<Array<{
    dashboardName: string;
    options: ExportOptions;
    nextRun: string;
  }>>([]);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Export Methods
  // ============================================================================

  const handleExport = useCallback(
    async (
      dashboardName: string,
      data: Record<string, unknown>[],
      options: ExportOptions,
      element?: HTMLElement
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setProgress(0);
      setError(null);

      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const result = await exportManager.export(dashboardName, data, options, element);

        if (result.success) {
          setProgress(100);
          setLastResult(result);

          // Get updated job
          if (result.jobId) {
            const job = exportManager.getJobStatus(result.jobId);
            setCurrentJob(job);
          }

          // Refresh jobs list
          setJobs(exportManager.listJobs());
        } else {
          setError(result.error || 'Export failed');
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsExporting(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setProgress(0);
      }
    },
    []
  );

  const handleQuickExport = useCallback(
    async (
      dashboardName: string,
      data: Record<string, unknown>[],
      format: ExportFormat = 'pdf',
      element?: HTMLElement
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setProgress(0);
      setError(null);

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const result = await quickExport(dashboardName, data, format, element);

        if (result.success) {
          setProgress(100);
          setLastResult(result);
        } else {
          setError(result.error || 'Export failed');
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsExporting(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setProgress(0);
      }
    },
    []
  );

  const handleExportWithFilters = useCallback(
    async (
      dashboardName: string,
      data: Record<string, unknown>[],
      filters: ExportFilter[],
      format: ExportFormat = 'excel',
      element?: HTMLElement
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setProgress(0);
      setError(null);

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const result = await exportWithFilters(dashboardName, data, filters, format, element);

        if (result.success) {
          setProgress(100);
          setLastResult(result);
        } else {
          setError(result.error || 'Export failed');
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsExporting(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setProgress(0);
      }
    },
    []
  );

  const handleScheduleExport = useCallback(
    async (
      dashboardName: string,
      data: Record<string, unknown>[],
      frequency: ExportFrequency,
      recipients: string[],
      format: ExportFormat = 'pdf',
      element?: HTMLElement
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setProgress(0);
      setError(null);

      try {
        const result = await scheduleExport(
          dashboardName,
          data,
          frequency,
          recipients,
          format,
          element
        );

        if (result.success) {
          setProgress(100);
          setLastResult(result);
          setScheduledJobs(exportManager.getScheduledJobs());
        } else {
          setError(result.error || 'Export scheduling failed');
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsExporting(false);
        setProgress(0);
      }
    },
    []
  );

  // ============================================================================
  // Job Management
  // ============================================================================

  const getJobStatus = useCallback((jobId: string): ExportJob | null => {
    return exportManager.getJobStatus(jobId);
  }, []);

  const cancelJob = useCallback((jobId: string): boolean => {
    const cancelled = exportManager.cancelJob(jobId);
    if (cancelled) {
      setJobs(exportManager.listJobs());
    }
    return cancelled;
  }, []);

  const refreshJobs = useCallback(() => {
    setJobs(exportManager.listJobs());
  }, []);

  // ============================================================================
  // Template Management
  // ============================================================================

  const saveTemplate = useCallback(
    (name: string, description: string, options: Partial<ExportOptions>): ExportTemplate => {
      const template = exportManager.saveTemplate(name, description, options);
      setTemplates(exportManager.listTemplates());
      return template;
    },
    []
  );

  const loadTemplate = useCallback((templateId: string): ExportTemplate | null => {
    return exportManager.loadTemplate(templateId);
  }, []);

  const deleteTemplate = useCallback((templateId: string): boolean => {
    const deleted = exportManager.deleteTemplate(templateId);
    if (deleted) {
      setTemplates(exportManager.listTemplates());
    }
    return deleted;
  }, []);

  const refreshTemplates = useCallback(() => {
    setTemplates(exportManager.listTemplates());
  }, []);

  // ============================================================================
  // Scheduled Jobs
  // ============================================================================

  const refreshScheduledJobs = useCallback(() => {
    setScheduledJobs(exportManager.getScheduledJobs());
  }, []);

  // ============================================================================
  // Initialize State
  // ============================================================================

  const initialized = useRef(false);
  if (!initialized.current) {
    setJobs(exportManager.listJobs());
    setTemplates(exportManager.listTemplates());
    setScheduledJobs(exportManager.getScheduledJobs());
    initialized.current = true;
  }

  return {
    // Export methods
    export: handleExport,
    quickExport: handleQuickExport,
    exportWithFilters: handleExportWithFilters,
    scheduleExport: handleScheduleExport,

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
    refreshTemplates,

    // Scheduled exports
    scheduledJobs,
    refreshScheduledJobs,
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for quick one-click exports
 */
export function useQuickExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPDF = useCallback(
    async (dashboardName: string, data: Record<string, unknown>[], element?: HTMLElement) => {
      setIsExporting(true);
      setError(null);
      try {
        return await quickExport(dashboardName, data, 'pdf', element);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export failed');
        return { success: false, error: 'Export failed' };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportExcel = useCallback(
    async (dashboardName: string, data: Record<string, unknown>[]) => {
      setIsExporting(true);
      setError(null);
      try {
        return await quickExport(dashboardName, data, 'excel');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export failed');
        return { success: false, error: 'Export failed' };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportCSV = useCallback(
    async (dashboardName: string, data: Record<string, unknown>[]) => {
      setIsExporting(true);
      setError(null);
      try {
        return await quickExport(dashboardName, data, 'csv');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export failed');
        return { success: false, error: 'Export failed' };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportPDF,
    exportExcel,
    exportCSV,
    isExporting,
    error,
  };
}

/**
 * Hook for managing export templates
 */
export function useExportTemplates() {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);

  const refresh = useCallback(() => {
    setTemplates(exportManager.listTemplates());
  }, []);

  const save = useCallback(
    (name: string, description: string, options: Partial<ExportOptions>): ExportTemplate => {
      const template = exportManager.saveTemplate(name, description, options);
      refresh();
      return template;
    },
    [refresh]
  );

  const load = useCallback((templateId: string): ExportTemplate | null => {
    return exportManager.loadTemplate(templateId);
  }, []);

  const remove = useCallback(
    (templateId: string): boolean => {
      const deleted = exportManager.deleteTemplate(templateId);
      if (deleted) {
        refresh();
      }
      return deleted;
    },
    [refresh]
  );

  // Initialize
  const initialized = useRef(false);
  if (!initialized.current) {
    refresh();
    initialized.current = true;
  }

  return {
    templates,
    save,
    load,
    remove,
    refresh,
  };
}

/**
 * Hook for monitoring export jobs
 */
export function useExportJobs(userId?: string) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<ExportJob[]>([]);

  const refresh = useCallback(() => {
    const allJobs = exportManager.listJobs(userId);
    setJobs(allJobs);
    setActiveJobs(allJobs.filter((j) => j.status === 'pending' || j.status === 'processing'));
  }, [userId]);

  const cancel = useCallback(
    (jobId: string): boolean => {
      const cancelled = exportManager.cancelJob(jobId);
      if (cancelled) {
        refresh();
      }
      return cancelled;
    },
    [refresh]
  );

  const getStatus = useCallback((jobId: string): ExportJob | null => {
    return exportManager.getJobStatus(jobId);
  }, []);

  // Initialize and poll for active jobs
  const initialized = useRef(false);
  if (!initialized.current) {
    refresh();
    initialized.current = true;

    // Poll every 5 seconds if there are active jobs
    const interval = setInterval(() => {
      if (activeJobs.length > 0) {
        refresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }

  return {
    jobs,
    activeJobs,
    refresh,
    cancel,
    getStatus,
  };
}
