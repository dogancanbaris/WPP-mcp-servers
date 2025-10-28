import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/store/dashboardStore';
import { saveDashboard, loadDashboard } from '@/lib/supabase/dashboard-service';
import { toast } from '@/lib/toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const useFileActions = (onOpenNewDashboard?: () => void) => {
  const router = useRouter();
  const { config, setTitle, save } = useDashboardStore();

  const onNew = () => {
    if (confirm('Create new dashboard? Unsaved changes will be lost.')) {
      if (onOpenNewDashboard) {
        // Open dialog in current context
        onOpenNewDashboard();
      } else {
        // Fallback: Navigate to dashboard list
        router.push('/dashboard');
      }
    }
  };

  const onMakeCopy = async () => {
    try {
      const newId = crypto.randomUUID();
      const copyConfig = {
        ...config,
        id: newId,
        title: `${config.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await saveDashboard(newId, copyConfig);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save copy');
      }

      toast.success('Dashboard copied successfully');
      router.push(`/dashboard/${newId}/builder`);
    } catch (error) {
      toast.error('Failed to copy dashboard');
      console.error('Copy dashboard error:', error);
    }
  };

  const onRename = async () => {
    // Trigger title edit mode (already exists in EditorTopbar)
    const titleInput = document.querySelector('[data-title-input]') as HTMLElement;
    if (titleInput) {
      titleInput.focus();
    } else {
      // Fallback: Use prompt
      const newTitle = prompt('Enter new dashboard title:', config.title);
      if (newTitle && newTitle.trim()) {
        try {
          // Update local title and persist
          setTitle(newTitle.trim());
          await save(config.id, true);
          toast.success('Dashboard renamed');
        } catch (error) {
          toast.error('Failed to rename dashboard');
          console.error('Rename error:', error);
        }
      }
    }
  };

  const onMoveToFolder = () => {
    // Stub for now - will be implemented when folder management is added
    toast.info('Folder management coming soon');
  };

  const onDownloadPDF = async () => {
    try {
      const canvas = document.querySelector('[data-canvas]') as HTMLElement;
      if (!canvas) {
        toast.error('Canvas not found');
        return;
      }

      toast.info('Generating PDF...');

      const canvasImage = await html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvasImage.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${config.title || 'dashboard'}.pdf`);

      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const onDownloadCSV = async () => {
    try {
      const { exportDashboardToCSV } = await import('@/lib/export/csv-exporter');
      await exportDashboardToCSV(config);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export CSV');
      console.error('CSV export error:', error);
    }
  };

  const onScheduleEmail = () => {
    // Stub for scheduled email delivery
    toast.info('Email scheduling coming soon');
  };

  const onPageSetup = () => {
    // Stub for page setup dialog (canvas size, margins, etc.)
    toast.info('Page setup dialog coming soon');
  };

  const onDashboardSettings = () => {
    // Stub for dashboard settings panel
    toast.info('Dashboard settings coming soon');
  };

  return {
    onNew,
    onMakeCopy,
    onRename,
    onMoveToFolder,
    onDownloadPDF,
    onDownloadCSV,
    onScheduleEmail,
    onPageSetup,
    onDashboardSettings,
  };
};
