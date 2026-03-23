import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { Sale } from '@/types';
import { formatDateTime } from '@/lib/utils';

export async function generateInvoicePDF(sale: Sale) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BikeHub POS', w / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Bike Showroom & Sales', w / 2, 27, { align: 'center' });

  // Invoice info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', w / 2, 40, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: INV-${sale.id.toUpperCase()}`, 14, 50);
  doc.text(`Date: ${formatDateTime(sale.date)}`, 14, 56);
  doc.text(`Customer: ${sale.customerName}`, 14, 62);
  doc.text(`Payment: ${sale.paymentType.toUpperCase()}`, 14, 68);

  // Line
  let y = 73;
  if (sale.soldBy) {
    doc.text(`Sold By: ${sale.soldBy} ${sale.soldByPhone ? `(${sale.soldByPhone})` : ''}`, 14, 74);
    y = 80;
  }

  try {
    const qrData = JSON.stringify({
      Invoice: `INV-${sale.id.toUpperCase()}`,
      Date: formatDateTime(sale.date),
      Total: sale.grandTotal,
      SoldBy: sale.soldBy || 'N/A'
    });
    const qrImage = await QRCode.toDataURL(qrData);
    doc.addImage(qrImage, 'PNG', w - 44, 40, 30, 30);
  } catch (err) {
    console.error('Failed to generate QR code', err);
  }

  doc.setDrawColor(200);
  doc.line(14, y, w - 14, y);

  // Table header
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Item', 14, y);
  doc.text('Qty', 110, y);
  doc.text('Price', 130, y);
  doc.text('Total', 160, y);

  doc.setDrawColor(200);
  doc.line(14, y + 2, w - 14, y + 2);

  // Items
  doc.setFont('helvetica', 'normal');
  y += 8;
  sale.items.forEach((item) => {
    // We print brand, model, engine CC, color, and standard name fallback.
    const bikeStr = item.brand ? `${item.brand} ${item.model} ${item.engineCC}cc (${item.color})` : item.bikeName;
    doc.text(bikeStr, 14, y);
    doc.text(String(item.quantity), 110, y);
    doc.text(`৳${item.unitPrice.toLocaleString()}`, 130, y);
    doc.text(`৳${(item.unitPrice * item.quantity).toLocaleString()}`, 160, y);
    y += 7;
  });

  // Totals
  doc.line(14, y, w - 14, y);
  y += 8;
  doc.text(`Subtotal:`, 130, y);
  doc.text(`৳${sale.totalPrice.toLocaleString()}`, 160, y);

  if (sale.discount > 0) {
    y += 6;
    doc.text(`Discount:`, 130, y);
    doc.text(`-৳${sale.discount.toLocaleString()}`, 160, y);
  }
  if (sale.tax > 0) {
    y += 6;
    doc.text(`Tax:`, 130, y);
    doc.text(`৳${sale.tax.toLocaleString()}`, 160, y);
  }

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Grand Total:`, 125, y);
  doc.text(`৳${sale.grandTotal.toLocaleString()}`, 160, y);

  // Signatures
  y += 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.setDrawColor(150);
  doc.line(14, y, 60, y);
  doc.text('Customer Signature', 18, y + 5);

  doc.line(w - 60, y, w - 14, y);
  doc.text('Authorized Signature', w - 55, y + 5);

  // Footer
  doc.setFontSize(8);
  doc.text('Thank you for your purchase!', w / 2, y + 20, { align: 'center' });
  doc.text('BikeHub POS - Powered by technology', w / 2, y + 26, { align: 'center' });

  return doc;
}

export async function downloadInvoice(sale: Sale) {
  const doc = await generateInvoicePDF(sale);
  doc.save(`invoice-${sale.id}.pdf`);
}

export async function printInvoice(sale: Sale) {
  const doc = await generateInvoicePDF(sale);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url);
  if (win) {
    win.onload = () => {
      win.print();
      URL.revokeObjectURL(url);
    };
  }
}
