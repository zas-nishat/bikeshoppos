import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { Sale, Expense, Bike } from '@/types';
import { formatDateTime } from '@/lib/utils';

export function exportSalesReportPDF(sales: Sale[], title: string) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, w / 2, 20, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, w / 2, 27, { align: 'center' });

  let y = 38;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 14, y);
  doc.text('Customer', 50, y);
  doc.text('Items', 100, y);
  doc.text('Payment', 130, y);
  doc.text('Total', 165, y);
  doc.line(14, y + 2, w - 14, y + 2);

  doc.setFont('helvetica', 'normal');
  y += 8;
  let grandTotal = 0;
  sales.forEach((s) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(formatDateTime(s.date), 14, y);
    doc.text(s.customerName.substring(0, 20), 50, y);
    doc.text(String(s.items.length), 100, y);
    doc.text(s.paymentType, 130, y);
    doc.text(`৳${s.grandTotal.toLocaleString()}`, 165, y);
    grandTotal += s.grandTotal;
    y += 6;
  });

  y += 4;
  doc.line(14, y, w - 14, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ৳${grandTotal.toLocaleString()}`, 165, y, { align: 'right' });

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}

export function exportProfitLossPDF(sales: Sale[], expenses: Expense[], bikes: Bike[]) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Profit & Loss Report', w / 2, 20, { align: 'center' });

  const totalRevenue = sales.reduce((s, x) => s + x.grandTotal, 0);
  const totalCost = sales.reduce((s, x) => s + x.items.reduce((is, item) => {
    const bike = bikes.find((b) => b.id === item.bikeId);
    return is + (bike ? bike.purchasePrice * item.quantity : 0);
  }, 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalCost - totalExpenses;

  let y = 40;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const rows = [
    ['Total Revenue', `৳${totalRevenue.toLocaleString()}`],
    ['Cost of Goods Sold', `৳${totalCost.toLocaleString()}`],
    ['Operating Expenses', `৳${totalExpenses.toLocaleString()}`],
  ];
  rows.forEach(([label, val]) => {
    doc.text(label, 20, y);
    doc.text(val, 170, y, { align: 'right' });
    y += 8;
  });

  doc.line(20, y, w - 20, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(profit >= 0 ? 'Net Profit' : 'Net Loss', 20, y);
  doc.text(`৳${Math.abs(profit).toLocaleString()}`, 170, y, { align: 'right' });

  doc.save('profit_loss_report.pdf');
}

export function exportSalesExcel(sales: Sale[]) {
  const data = sales.map((s) => ({
    Date: formatDateTime(s.date),
    Customer: s.customerName,
    Items: s.items.map((i) => i.bikeName).join(', '),
    Subtotal: s.totalPrice,
    Discount: s.discount,
    Tax: s.tax,
    Total: s.grandTotal,
    Payment: s.paymentType,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales');
  XLSX.writeFile(wb, 'sales_report.xlsx');
}

export function exportExpensesExcel(expenses: Expense[]) {
  const data = expenses.map((e) => ({
    Date: formatDateTime(e.date),
    Title: e.title,
    Category: e.category,
    Amount: e.amount,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  XLSX.writeFile(wb, 'expenses_report.xlsx');
}
