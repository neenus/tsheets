import { timesheetText, timesheetTitle } from './timesheet.js';

const ACCENT = [79, 70, 229]; // indigo-600

const emailSubject = (sheet) => `${timesheetTitle(sheet)} – ${sheet.range}`;

// jsPDF is only loaded when someone actually exports, keeping it out of the initial bundle.
export const createTimesheetPdf = async (sheet) => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 48;

  doc.setFont('helvetica', 'bold').setFontSize(22).text('Timesheet', margin, 64);
  doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(80);
  const details = [sheet.name, sheet.range].filter(Boolean);
  details.forEach((line, i) => doc.text(line, margin, 88 + i * 16));

  autoTable(doc, {
    startY: 88 + details.length * 16 + 8,
    margin: { left: margin, right: margin },
    head: [['Date', 'Start', 'End', 'Break', { content: 'Hours', styles: { halign: 'right' } }]],
    body: sheet.rows.map((row) => [row.date, row.start, row.end, row.break, row.hours]),
    foot: [[{ content: 'Total', colSpan: 4 }, { content: sheet.total, styles: { halign: 'right' } }]],
    theme: 'striped',
    headStyles: { fillColor: ACCENT },
    footStyles: { fillColor: [241, 245, 249], textColor: 20 },
    columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
    styles: { fontSize: 11, cellPadding: 8 },
  });

  return doc.output('blob');
};

export const downloadFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Shares the PDF via the native share sheet (phones), or opens a mail draft with the text version.
export const sendByEmail = async (sheet, pdf, { navigator, openUrl }) => {
  const file = new File([pdf], sheet.fileName, { type: 'application/pdf' });
  const title = emailSubject(sheet);
  const text = timesheetText(sheet);

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  openUrl(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`);
};
