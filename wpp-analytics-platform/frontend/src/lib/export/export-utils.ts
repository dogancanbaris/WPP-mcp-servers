// Export utilities for dashboard (PDF, Excel, CSV)
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

/**
 * Export dashboard as PDF
 * Takes screenshots of charts and compiles into PDF
 */
export async function exportToPDF(dashboardName: string, element: HTMLElement) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add title
    pdf.setFontSize(20);
    pdf.text(dashboardName, pageWidth / 2, 20, { align: 'center' });

    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

    // Capture dashboard as image
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 35;

    // Add image, handle multiple pages if needed
    if (imgHeight > pageHeight - 40) {
      // Image too tall, split across pages
      let srcY = 0;
      while (srcY < canvas.height) {
        const sliceHeight = ((pageHeight - 40) / imgWidth) * canvas.width;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = Math.min(sliceHeight, canvas.height - srcY);

        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, srcY,
            canvas.width, tempCanvas.height,
            0, 0,
            canvas.width, tempCanvas.height
          );
        }

        const sliceData = tempCanvas.toDataURL('image/png');
        pdf.addImage(sliceData, 'PNG', 10, yPosition, imgWidth, (tempCanvas.height * imgWidth) / tempCanvas.width);

        srcY += sliceHeight;
        if (srcY < canvas.height) {
          pdf.addPage();
          yPosition = 10;
        }
      }
    } else {
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
    }

    // Save PDF
    pdf.save(`${dashboardName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

    return { success: true };
  } catch (error) {
    console.error('PDF export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

interface ChartData {
  title?: string;
  type?: string;
  data?: Record<string, unknown>[];
}

/**
 * Export data to Excel
 * Converts chart data to Excel workbook with multiple sheets
 */
export function exportToExcel(dashboardName: string, chartsData: ChartData[]) {
  try {
    const workbook = XLSX.utils.book_new();

    // Add a sheet for each chart
    chartsData.forEach((chart, index) => {
      if (!chart.data || chart.data.length === 0) return;

      const wsData = [
        [chart.title || `Chart ${index + 1}`],
        [],
        ...chart.data
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      // Auto-size columns
      const maxWidth = 50;
      const cols = wsData[2] ? wsData[2].map(() => ({ wch: maxWidth })) : [];
      worksheet['!cols'] = cols;

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        `Chart_${index + 1}`.substring(0, 31) // Excel sheet name limit
      );
    });

    // Add summary sheet
    const summary = [
      ['Dashboard Export Summary'],
      [],
      ['Dashboard Name:', dashboardName],
      ['Export Date:', new Date().toLocaleString()],
      ['Number of Charts:', chartsData.length],
      [],
      ['Chart', 'Type', 'Rows'],
      ...chartsData.map((chart, i) => [
        chart.title || `Chart ${i + 1}`,
        chart.type || 'Unknown',
        chart.data?.length || 0
      ])
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');

    // Write file
    XLSX.writeFile(
      workbook,
      `${dashboardName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`
    );

    return { success: true };
  } catch (error) {
    console.error('Excel export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Export single table to CSV
 */
export function exportToCSV(filename: string, data: Record<string, unknown>[]) {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

interface ChartConfig {
  title?: string;
  type?: string;
}

interface ResultSet {
  tablePivot: () => Record<string, unknown>[];
}

/**
 * Convert chart result set to exportable format
 */
export function prepareChartDataForExport(chart: ChartConfig, resultSet: ResultSet | null) {
  if (!resultSet) return null;

  const data = resultSet.tablePivot();

  return {
    title: chart.title,
    type: chart.type,
    data: data.map((row: Record<string, unknown>) => {
      // Flatten object for export
      const flatRow: Record<string, unknown> = {};
      Object.keys(row).forEach(key => {
        const shortKey = key.split('.').pop() || key;
        flatRow[shortKey] = row[key];
      });
      return flatRow;
    })
  };
}
