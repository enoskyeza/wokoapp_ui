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

const getImageSize = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
};

const contain = (
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number
): { w: number; h: number } => {
  if (srcW <= 0 || srcH <= 0) return { w: maxW, h: maxH };
  const scale = Math.min(maxW / srcW, maxH / srcH);
  return { w: srcW * scale, h: srcH * scale };
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
  program_logo_url?: string | null;
  program_fee?: string;
  amount_paid_total?: string;
  outstanding_balance?: string;
}

export const generateReceiptPdf = async (receipt: ReceiptData, download = true): Promise<jsPDF> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - 2 * margin;

  const toTitleCase = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const parseMoneyValue = (value?: string | number | null) => {
    if (value === null || value === undefined) return 0;
    const n = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(n) ? n : 0;
  };

  // Add program logo (preferred) or fallback header image
  try {
    const logoPath = receipt.program_logo_url || HEADER_IMAGE_PATH;
    const logoDataUrl = await getBase64FromUrl(logoPath);
    const { width: srcW, height: srcH } = await getImageSize(logoDataUrl);

    // Rectangular logo: center and preserve aspect ratio (no skew)
    const maxW = usableWidth;
    const maxH = receipt.program_logo_url ? 11 : 15;
    const { w, h } = contain(srcW, srcH, maxW, maxH);
    const x = margin + (usableWidth - w) / 2;
    const y = margin - 1;
    doc.addImage(logoDataUrl, 'PNG', x, y, w, h);
  } catch {
    console.warn('Header/logo image not loaded, continuing without it');
  }

  let currentY = margin + 28;

  // Program title (under logo)
  const programName = receipt.program_name || receipt.registration_details?.program || 'N/A';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(programName, pageWidth / 2, currentY - 8, { align: 'center' });

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

  // Participant information
  doc.setFont('helvetica', 'bold');
  doc.text('Received From:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  const participantName = participant 
    ? `${participant.first_name} ${participant.last_name}`
    : receipt.participant_name || 'N/A';
  doc.text(toTitleCase(participantName), margin + 40, currentY);
  currentY += 7;

  // Guardian information
  if (guardian) {
    doc.setFont('helvetica', 'bold');
    doc.text('Guardian:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(toTitleCase(`${guardian.first_name} ${guardian.last_name}`), margin + 40, currentY);
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

  const amountPaidTotal = parseMoneyValue(receipt.amount_paid_total ?? receipt.amount);

  // Payment details table
  const tableData = [
    ['Description', 'Amount'],
    ['Registration Payment', formatMoney(amountPaidTotal)]
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
  doc.text(`Total Amount: ${formatMoney(amountPaidTotal)}`, pageWidth - margin, currentY, {
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
  const outstanding = parseMoneyValue(receipt.outstanding_balance ?? receipt.registration_details?.amount_due);
  if (receipt.registration_details?.amount_due !== undefined || receipt.outstanding_balance !== undefined) {
    const balance = outstanding;
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
