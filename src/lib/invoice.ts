import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import QRCode from 'qrcode';
import type { Sale } from '@/types';
import { formatDateTime } from '@/lib/utils';

export async function generateInvoicePDF(sale: Sale) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Colors
  const primaryColor = [31, 41, 55]; // Dark Navy
  const accentColor = [37, 99, 235];  // Blue
  const textColor = [55, 65, 81];    // Slate Gray

  // --- 1. Header ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('BIKEHUB POS', margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Motorcycle Sales & Service Center', margin, 27);
  doc.text('123 Bike Avenue, Dhaka | +880 1XXX-XXXXXX', margin, 33);

  // --- 2. QR Code ---
  try {
    const qrData = JSON.stringify({
      id: sale.id.toUpperCase(),
      total: sale.grandTotal,
      date: formatDateTime(sale.date)
    });
    const qrImage = await QRCode.toDataURL(qrData);
    doc.addImage(qrImage, 'PNG', pageWidth - 45, 45, 30, 30);
  } catch (err) {
    console.error('QR error', err);
  }

  // --- 3. Invoice Info ---
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, 55);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  doc.text(`Invoice No : INV-${sale.id.toUpperCase()}`, margin, 65);
  doc.text(`Date           : ${formatDateTime(sale.date)}`, margin, 70);
  doc.text(`Payment      : ${sale.paymentType.toUpperCase()}`, margin, 75);

  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, 88);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(sale.customerName, margin, 94);

  if (sale.soldBy) {
    doc.setFontSize(9);
    doc.text(`Sold By: ${sale.soldBy} (${sale.soldByPhone})`, margin, 100);
  }

  // --- 4. Table (Fixed Type Assignment) ---
  const tableRows: RowInput[] = sale.items.map((item) => [
    {
      content: item.brand
        ? `${item.brand} ${item.model} ${item.engineCC}cc\nColor: ${item.color}`
        : item.bikeName,
      styles: { fontStyle: 'bold' as const } // Fixed TS Error
    },
    item.quantity.toString(),
    `TK ${item.unitPrice.toLocaleString()}`,
    `TK ${(item.unitPrice * item.quantity).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 110,
    head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold' as const,
    },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // --- 5. Summary Section ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const summaryX = pageWidth - 75;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`TK ${sale.totalPrice.toLocaleString()}`, pageWidth - margin, finalY, { align: 'right' });

  let currentY = finalY + 6;
  if (sale.discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Discount:', summaryX, currentY);
    doc.text(`-TK ${sale.discount.toLocaleString()}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 6;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  }

  if (sale.tax > 0) {
    doc.text('Tax:', summaryX, currentY);
    doc.text(`TK ${sale.tax.toLocaleString()}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 6;
  }

  doc.setDrawColor(200);
  doc.line(summaryX, currentY - 2, pageWidth - margin, currentY - 2);
  currentY += 4;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('Grand Total:', summaryX, currentY);
  doc.text(`TK ${sale.grandTotal.toLocaleString()}`, pageWidth - margin, currentY, { align: 'right' });

  // --- 6. Footer & Signatures ---
  const sigY = pageHeight - 40;
  doc.setDrawColor(200);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.line(margin, sigY, margin + 50, sigY);
  doc.text('Customer Signature', margin + 8, sigY + 5);

  doc.line(pageWidth - margin - 50, sigY, pageWidth - margin, sigY);
  doc.text('Authorized Signature', pageWidth - margin - 45, sigY + 5);

  doc.setFillColor(249, 250, 251);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Thank you for choosing BikeHub! Ride safe and wear a helmet.', pageWidth / 2, pageHeight - 7, { align: 'center' });

  return doc;
}

export async function downloadInvoice(sale: Sale) {
  const doc = await generateInvoicePDF(sale);
  doc.save(`Invoice_INV-${sale.id.toUpperCase()}.pdf`);
}

export async function printInvoice(sale: Sale) {
  const doc = await generateInvoicePDF(sale);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url);
  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  }
}