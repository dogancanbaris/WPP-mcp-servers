import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/store/dashboardStore';
import { saveDashboard, loadDashboard } from '@/lib/supabase/dashboard-service';
import { toast } from '@/lib/toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const useFileActions = () => {
  const router = useRouter();
  const { config, setConfig } = useDashboardStore();

  const onNew = () => {
    if (confirm('Create new dashboard? Unsaved changes will be lost.')) {
      router.push('/dashboard/new/builder');
    }
  };

  const onMakeCopy = async () => {
    try {
      const newId = `copy-${Date.now()}`;
      const copyConfig = {
        ...config,
        id: newId,
        title: `${config.title} (Copy)`,
      };
      await saveDashboard(newId, copyConfig);
      toast.success('Dashboard copied successfully');
      router.push(`/dashboard/${newId}/builder`);
    } catch (error) {
      toast.error('Failed to copy dashboard');
      console.error('Copy dashboard error:', error);
    }
  };

  const onRename = () => {
    // Trigger title edit mode (already exists in EditorTopbar)
    const titleInput = document.querySelector('[data-title-input]') as HTMLElement;
    if (titleInput) {
      titleInput.focus();
    } else {
      // Fallback: Use prompt
      const newTitle = prompt('Enter new dashboard title:', config.title);
      if (newTitle && newTitle.trim()) {
        setConfig({ ...config, title: newTitle.trim() });
        toast.success('Dashboard renamed');
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

  const onDownloadCSV = () => {
    // Export first table chart data as CSV
    // For now, just stub - will be implemented when data export is added
    toast.info('CSV export coming soon');
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
