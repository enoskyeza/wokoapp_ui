import React from "react";
import jsPDF, { jsPDF as JsPDFType } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";

// Import shared types
import { Parent, Participant, PaymentMethod} from "@/types";

interface ReportGeneratorProps {
  parents: Parent[];
  contestants: Participant[];
}

// Extend jsPDF with autoTable metadata
interface JsPDFWithAutoTable extends JsPDFType {
  lastAutoTable?: {
    finalY: number;
  };
}

export default function ReportGenerator({ parents, contestants }: ReportGeneratorProps) {
  // CSV export for guardians
  const generateGuardiansCSV = () => {
    const headers = [
      'ID', 'First Name', 'Last Name', 'Profession', 'Address', 'Email', 'Phone', 'Contestant IDs'
    ];
    const rows = parents.map(p => [
      p.id,
      p.first_name,
      p.last_name,
      p.profession,
      p.address,
      p.email,
      p.phone_number,
      p.contestants.map(c => c.id).join(';')
    ]);
    const csvContent = [headers, ...rows]
      .map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'guardians_report.csv');
  };

  // CSV export for participants, including parent name & phone
  const generateParticipantsCSV = () => {
    const headers = [
      'ID', 'Identifier', 'First Name', 'Last Name', 'Email', 'Age', 'Gender', 'School', 'Payment Status', 'Payment Method', 'Parent Name', 'Parent Phone'
    ];
    const rows = contestants.map(c => {
      const parent = parents.find(p => p.id === c.parent);
      const parentName = parent ? `${parent.first_name} ${parent.last_name}` : '';
      const parentPhone = parent ? parent.phone_number : '';
      const paymentMethod = (c.payment_method as PaymentMethod)?.payment_method || '';
      return [
        c.id,
        c.identifier,
        c.first_name,
        c.last_name,
        c.email,
        c.age,
        c.gender,
        c.school,
        c.payment_status,
        paymentMethod,
        parentName,
        parentPhone,
      ];
    });
    const csvContent = [headers, ...rows]
      .map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'participants_report.csv');
  };

  // PDF export for participants, including parent name & phone
  const generateParticipantsPDF = () => {
    const doc = new jsPDF();
    const pdf = doc as JsPDFWithAutoTable;
    const title = 'WOKOBER TOY MAKING & INNOVATION FESTIVAL 2024';
    const subtitle = "Participants Report";
    doc.setFontSize(12);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

    const headers = [
      'ID', 'Identifier', 'First Name', 'Last Name', 'Age', 'Gender', 'School', 'Payment Status', 'Payment Method', 'Parent Name', 'Parent Phone'
    ];
    const rows = contestants.map(c => {
      const parent = parents.find(p => p.id === c.parent);
      const parentName = parent ? `${parent.first_name} ${parent.last_name}` : '';
      const parentPhone = parent ? parent.phone_number : '';
      const paymentMethod = (c.payment_method as PaymentMethod)?.payment_method || '';
      return [
        c.id.toString(),
        c.identifier,
        c.first_name,
        c.last_name,
        c.age.toString(),
        c.gender,
        c.school,
        c.payment_status,
        paymentMethod,
        parentName,
        parentPhone,
      ];
    });
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: rows,
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    // Footer
    const footerY = (pdf.lastAutoTable?.finalY ?? 30) + 10;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Printed from WokoApp on ${new Date().toLocaleString()}`,
      14,
      footerY
    );

    doc.save('participants_report.pdf');
  };

  return (
    <Menu as="div" className="relative inline-block text-left z-10">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={generateGuardiansCSV}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          <CloudArrowDownIcon className="h-4 w-4" /> Guardians Report CSV
        </button>
        <button
          onClick={generateParticipantsPDF}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <CloudArrowDownIcon className="h-4 w-4" /> Participants Report PDF
        </button>
        <button
          onClick={generateParticipantsCSV}
          className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
        >
          <CloudArrowDownIcon className="h-4 w-4" /> Participant Report CSV
        </button>
      </div>
    </Menu>
  );
}
