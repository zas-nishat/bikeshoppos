import jsPDF from 'jspdf';
import type { Sale } from '@/types';

export function generateInvoicePDF(sale: Sale) {
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
  doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 14, 56);
  doc.text(`Customer: ${sale.customerName}`, 14, 62);
  doc.text(`Payment: ${sale.paymentType.toUpperCase()}`, 14, 68);

  // Line
  doc.setDrawColor(200);
  doc.line(14, 73, w - 14, 73);

  // Table header
  let y = 80;
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
    doc.text(item.bikeName, 14, y);
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

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for your purchase!', w / 2, y + 20, { align: 'center' });
  doc.text('BikeHub POS - Powered by technology', w / 2, y + 26, { align: 'center' });

  return doc;
}

export function downloadInvoice(sale: Sale) {
  const doc = generateInvoicePDF(sale);
  doc.save(`invoice-${sale.id}.pdf`);
}

export function printInvoice(sale: Sale) {
  const doc = generateInvoicePDF(sale);
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
