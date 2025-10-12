import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Receipt, FetchedRegistration } from '@/types';

const HEADER_IMAGE_PATH = '/header.png';

export const formatMoney = (value: number): string => {
  return `UGX ${value.toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load image:', error);
    throw error;
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

interface ReceiptData extends Receipt {
  registration_details?: FetchedRegistration;
  program_name?: string;
  participant_name?: string;
}

export const generateReceiptPdf = async (receipt: ReceiptData, download = true): Promise<jsPDF> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - 2 * margin;

  // Add header image
  try {
    const headerDataUrl = await getBase64FromUrl(HEADER_IMAGE_PATH);
    const headerHeight = 30;
    doc.addImage(headerDataUrl, 'PNG', margin, margin, usableWidth, headerHeight);
  } catch {
    console.warn('Header image not loaded, continuing without it');
  }

  let currentY = margin + 35;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('OFFICIAL RECEIPT', pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  // Receipt number
  doc.setFontSize(14);
  doc.setTextColor(0, 100, 0);
  doc.text(`Receipt No: RCT-${String(receipt.id).padStart(4, '0')}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 12;

  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Receipt details
  const participant = receipt.registration_details?.participant;
  const guardian = receipt.registration_details?.guardian_at_registration;
  const programName = receipt.program_name || receipt.registration_details?.program || 'N/A';

  // Participant information
  doc.setFont('helvetica', 'bold');
  doc.text('Received From:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  const participantName = participant 
    ? `${participant.first_name} ${participant.last_name}`
    : receipt.participant_name || 'N/A';
  doc.text(participantName, margin + 40, currentY);
  currentY += 7;

  // Guardian information
  if (guardian) {
    doc.setFont('helvetica', 'bold');
    doc.text('Guardian:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${guardian.first_name} ${guardian.last_name}`, margin + 40, currentY);
    currentY += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Contact:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(guardian.phone_number || 'N/A', margin + 40, currentY);
    currentY += 10;
  } else {
    currentY += 7;
  }

  // Program information
  doc.setFont('helvetica', 'bold');
  doc.text('Program:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(programName, margin + 40, currentY);
  currentY += 7;

  // Date
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDateTime(receipt.created_at), margin + 40, currentY);
  currentY += 15;

  // Payment details table
  const tableData = [
    ['Description', 'Amount'],
    ['Registration Payment', formatMoney(receipt.amount)]
  ];

  autoTable(doc, {
    startY: currentY,
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: usableWidth * 0.6 },
      1: { cellWidth: usableWidth * 0.4, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY;
  currentY += 10;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 100, 0);
  doc.text(`Total Amount: ${formatMoney(receipt.amount)}`, pageWidth - margin, currentY, {
    align: 'right',
  });
  currentY += 12;

  // Status
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Status: ${receipt.status.toUpperCase()}`, pageWidth - margin, currentY, {
    align: 'right',
  });
  currentY += 15;

  // Balance information if available
  if (receipt.registration_details?.amount_due !== undefined) {
    const balance = typeof receipt.registration_details.amount_due === 'string' 
      ? parseFloat(receipt.registration_details.amount_due) 
      : receipt.registration_details.amount_due;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (balance > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text(`Outstanding Balance: ${formatMoney(balance)}`, margin, currentY);
    } else {
      doc.setTextColor(0, 150, 0);
      doc.text('✓ Fully Paid', margin, currentY);
    }
    currentY += 10;
  }

  // Signature section
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Issued By:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.issued_by_name || 'Staff', margin + 25, currentY);
  currentY += 8;

  // Signature line
  doc.line(margin, currentY, margin + 60, currentY);
  currentY += 5;
  doc.setFontSize(9);
  doc.text('Authorized Signature', margin, currentY);

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This is an official computer-generated receipt', pageWidth / 2, pageHeight - 20, {
    align: 'center',
  });
  doc.text(`Generated on ${new Date().toLocaleString('en-UG')}`, pageWidth / 2, pageHeight - 15, {
    align: 'center',
  });
  doc.text('Thank you for your payment!', pageWidth / 2, pageHeight - 10, {
    align: 'center',
  });

  if (download) {
    doc.save(`receipt_${receipt.id}.pdf`);
  }

  return doc;
};

// Generate PDF as blob for sharing
export const generateReceiptPdfBlob = async (receipt: ReceiptData): Promise<Blob> => {
  const doc = await generateReceiptPdf(receipt, false);
  return doc.output('blob');
};

// Print receipt directly
export const printReceipt = async (receipt: ReceiptData): Promise<void> => {
  const doc = await generateReceiptPdf(receipt, false);
  const pdfUrl = doc.output('bloburl');
  const printWindow = window.open(pdfUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
