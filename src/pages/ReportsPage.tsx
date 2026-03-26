import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, ChevronDown, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { exportSalesReportPDF, exportProfitLossPDF, exportSalesExcel } from '@/lib/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const COLORS = ['hsl(349,89%,50%)', 'hsl(32,95%,52%)', 'hsl(152,60%,40%)', 'hsl(220,70%,55%)', 'hsl(280,60%,55%)'];

export default function ReportsPage() {
  const { sales, bikes, expenses } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const totalRevenue = sales.reduce((s, x) => s + x.grandTotal, 0);
  const totalCost = sales.reduce((s, x) => {
    return s + x.items.reduce((is, item) => {
      const bike = bikes.find((b) => b.id === item.bikeId);
      return is + (bike ? bike.purchasePrice * item.quantity : 0);
    }, 0);
  }, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalCost - totalExpenses;

  // Top selling bikes
  const bikeSalesMap: Record<string, { name: string; count: number; revenue: number }> = {};
  sales.forEach((s) => s.items.forEach((item) => {
    if (!bikeSalesMap[item.bikeId]) bikeSalesMap[item.bikeId] = { name: item.bikeName, count: 0, revenue: 0 };
    bikeSalesMap[item.bikeId].count += item.quantity;
    bikeSalesMap[item.bikeId].revenue += item.unitPrice * item.quantity;
  }));
  const topBikes = Object.values(bikeSalesMap).sort((a, b) => b.count - a.count).slice(0, 5);

  // Payment type breakdown
  const paymentBreakdown: Record<string, number> = {};
  sales.forEach((s) => { paymentBreakdown[s.paymentType] = (paymentBreakdown[s.paymentType] || 0) + s.grandTotal; });
  const paymentPie = Object.entries(paymentBreakdown).map(([name, value]) => ({ name, value }));

  // Today's & monthly sales
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const todaySales = sales.filter((s) => new Date(s.date).toDateString() === today);
  const monthlySales = sales.filter((s) => new Date(s.date).getMonth() === thisMonth);

  // Filtered recent sales
  const filteredSales = sales.filter((sale) =>
    sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customerPhone?.includes(searchQuery)
  );

  const recentSales = [...filteredSales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Print a single sale invoice
  const handlePrintSale = (sale: typeof sales[0]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${sale.id}</title>
        <style>
          body { font-family: sans-serif; padding: 32px; font-size: 14px; color: #111; }
          h2 { margin-bottom: 4px; }
          .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { text-align: left; border-bottom: 2px solid #ddd; padding: 6px 8px; font-size: 12px; }
          td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px; }
          .total-row td { font-weight: bold; border-top: 2px solid #ddd; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h2>Invoice</h2>
        <div class="meta">
          <div><strong>Invoice ID:</strong> ${sale.id}</div>
          <div><strong>Customer:</strong> ${sale.customerName || 'Anonymous Buyer'}</div>
          ${sale.customerPhone ? `<div><strong>Phone:</strong> ${sale.customerPhone}</div>` : ''}
          <div><strong>Date:</strong> ${new Date(sale.date).toLocaleString()}</div>
          <div><strong>Payment:</strong> ${sale.paymentType}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Bike</th>
              <th>Brand</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td>${item.bikeName}</td>
                <td>${item.brand}</td>
                <td>${item.quantity}</td>
                <td>৳${item.unitPrice.toLocaleString()}</td>
                <td>৳${(item.unitPrice * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">Grand Total</td>
              <td>৳${sale.grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Export single sale as PDF using existing util
  const handlePDFSale = (sale: typeof sales[0]) => {
    exportSalesReportPDF([sale], `Invoice-${sale.id}`);
    toast.success('Invoice PDF exported');
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Business performance overview">
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => { exportSalesReportPDF(todaySales, 'Daily Sales Report'); toast.success('Daily report exported'); }}>
              <FileText className="h-4 w-4 mr-2" /> Daily PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { exportSalesReportPDF(monthlySales, 'Monthly Sales Report'); toast.success('Monthly report exported'); }}>
              <FileText className="h-4 w-4 mr-2" /> Monthly PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { exportProfitLossPDF(sales, expenses, bikes); toast.success('P&L report exported'); }}>
              <FileText className="h-4 w-4 mr-2" /> P&L PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { exportSalesExcel(sales); toast.success('Exported to Excel'); }}>
              <Download className="h-4 w-4 mr-2" /> Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: totalRevenue, color: 'text-success' },
          { label: 'Total Costs', value: totalCost + totalExpenses, color: 'text-destructive' },
          { label: 'Net Profit', value: profit, color: profit >= 0 ? 'text-success' : 'text-destructive' },
        ].map((item, i) => (
          <Card key={item.label} className="shadow-sm animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
              <p className={`text-2xl font-bold tabular-nums ${item.color}`}>৳{item.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '240ms' }}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Selling Bikes</CardTitle></CardHeader>
          <CardContent>
            {topBikes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBikes}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} width={30} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
          <CardContent>
            {paymentPie.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No sales data</p>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {paymentPie.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `৳${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Recent Sales</CardTitle>
              <p className="text-xs text-muted-foreground">Latest sold invoices</p>
            </div>
            <div className="relative w-full max-w-sm ml-4">
              <Input
                type="search"
                placeholder="Search by customer or invoice..."
                className="pl-1 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No sales found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-auto scrollbar-thin">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="rounded-md border border-border bg-muted/20 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                      <div>
                        {/* Customer Name */}
                        <p className="text-sm font-semibold">{sale.customerName || 'Anonymous Buyer'}</p>
                        {/* Customer Address (Added here) */}
                        <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                          {sale.customerPhone || 'Phone: N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleString()}</span>
                        {/* Per-sale action dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => handlePrintSale(sale)}>
                              <Printer className="h-3.5 w-3.5 mr-2" /> Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePDFSale(sale)}>
                              <FileText className="h-3.5 w-3.5 mr-2" /> Save PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-3">
                      <div><span className="font-medium">Invoice ID:</span> {sale.id}</div>
                      <div><span className="font-medium">Total:</span> ৳{sale.grandTotal.toLocaleString()}</div>
                    </div>

                    <div className="mt-2 text-xs">
                      <p className="font-medium text-muted-foreground">Model:</p>
                      <div className="space-y-1">
                        {sale.items.map((item) => (
                          <div key={`${sale.id}-${item.bikeId}`} className="flex justify-between">
                            <span>{item.bikeName} ({item.brand})</span>
                            <span>{item.quantity} × ৳{item.unitPrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}