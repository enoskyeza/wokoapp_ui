import jsPDF from 'jspdf';
import { FetchedRegistration } from '@/types';

const toTitleCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const getBase64FromUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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

type TicketRegistration = FetchedRegistration & {
  program_logo_url?: string | null;
};

export const generateTicketPdf = async (
  registration: TicketRegistration,
  download = true
): Promise<jsPDF> => {
  // Ticket size: landscape card
  const doc = new jsPDF({ unit: 'mm', format: [160, 80], orientation: 'landscape' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const BLUE = { r: 0, g: 33, b: 243 }; // #0021f3
  const LIGHT = { r: 240, g: 246, b: 255 };

  // Background
  doc.setFillColor(LIGHT.r, LIGHT.g, LIGHT.b);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top bar
  doc.setFillColor(BLUE.r, BLUE.g, BLUE.b);
  doc.rect(0, 0, pageWidth, 18, 'F');

  // Logo (optional)
  const logoUrl = registration.program_logo_url || undefined;
  if (logoUrl) {
    try {
      const logoDataUrl = await getBase64FromUrl(logoUrl);
      const { width: srcW, height: srcH } = await getImageSize(logoDataUrl);
      // Rectangular logo: center it and preserve aspect ratio (no skew)
      const maxW = 70;
      const maxH = 12;
      const { w, h } = contain(srcW, srcH, maxW, maxH);
      const x = (pageWidth - w) / 2;
      const y = (18 - h) / 2;
      doc.addImage(logoDataUrl, 'PNG', x, y, w, h);
    } catch {
      // ignore
    }
  }

  // Program title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  const programName = registration.program || 'Program';
  doc.text(String(programName), pageWidth / 2, 11.5, { align: 'center' });


  // QR code block
  const qr = registration.coupon?.qr_code;
  if (qr) {
    try {
      const qrDataUrl = await getBase64FromUrl(qr);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 44, 24, 36, 36, 3, 3, 'F');
      doc.addImage(qrDataUrl, 'PNG', pageWidth - 42, 26, 32, 32);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text('Scan at entry', pageWidth - 26, 64, { align: 'center' });
    } catch {
      // ignore
    }
  }

  // Participant
  const participantName = toTitleCase(
    `${registration.participant.first_name} ${registration.participant.last_name}`
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 30, 60);
  doc.text(participantName, 10, 30);

  // Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 90);

  doc.text(`Registration #: ${registration.id}`, 10, 38);
  if (registration.category_value) {
    doc.text(`Category: ${registration.category_value}`, 10, 45);
  }

  const issuedDate = registration.updated_at || registration.created_at;
  if (issuedDate) {
    doc.text(`Issued: ${new Date(issuedDate).toLocaleDateString('en-UG')}`, 10, 52);
  }

  // Status badge
  doc.setFillColor(BLUE.r, BLUE.g, BLUE.b);
  doc.roundedRect(10, 58, 60, 10, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('ADMIT ONE', 40, 64, { align: 'center' });

  // Footer line
  doc.setDrawColor(200, 210, 230);
  doc.line(10, 72, pageWidth - 10, 72);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(90, 100, 120);
  doc.text('Please keep this ticket safe. QR code is required for entry.', 10, 77);

  if (download) {
    doc.save(`ticket_${registration.id}.pdf`);
  }

  return doc;
};
