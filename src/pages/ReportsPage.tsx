import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { exportSalesReportPDF, exportProfitLossPDF, exportSalesExcel } from '@/lib/export';

const COLORS = ['hsl(349,89%,50%)', 'hsl(32,95%,52%)', 'hsl(152,60%,40%)', 'hsl(220,70%,55%)', 'hsl(280,60%,55%)'];

export default function ReportsPage() {
  const { sales, bikes, expenses } = useStore();

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

  // Expense breakdown
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => { expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount; });
  const expensePie = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  // Payment type breakdown
  const paymentBreakdown: Record<string, number> = {};
  sales.forEach((s) => { paymentBreakdown[s.paymentType] = (paymentBreakdown[s.paymentType] || 0) + s.grandTotal; });
  const paymentPie = Object.entries(paymentBreakdown).map(([name, value]) => ({ name, value }));

  // Today's & monthly sales
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const todaySales = sales.filter((s) => new Date(s.date).toDateString() === today);
  const monthlySales = sales.filter((s) => new Date(s.date).getMonth() === thisMonth);

  // Recent sold items with buyer and bike details
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Business performance overview">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => { exportSalesReportPDF(todaySales, 'Daily Sales Report'); toast.success('Daily report exported'); }}>
            <FileText className="h-4 w-4 mr-1" /> Daily PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => { exportSalesReportPDF(monthlySales, 'Monthly Sales Report'); toast.success('Monthly report exported'); }}>
            <FileText className="h-4 w-4 mr-1" /> Monthly PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => { exportProfitLossPDF(sales, expenses, bikes); toast.success('P&L report exported'); }}>
            <FileText className="h-4 w-4 mr-1" /> P&L PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => { exportSalesExcel(sales); toast.success('Exported to Excel'); }}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
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
                <p className="text-xs mt-1">Complete a sale to see analytics</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBikes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '320ms' }}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            {expensePie.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No expenses recorded</p>
                <p className="text-xs mt-1">Add expenses to see the breakdown</p>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expensePie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {expensePie.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `৳${v.toLocaleString()}`} />
                  </PieChart>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Sales</CardTitle>
            <p className="text-xs text-muted-foreground">Latest sold invoices with bike and buyer details</p>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No recent sales yet</p>
                <p className="text-xs mt-1">Complete a sale in POS to see it here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-auto scrollbar-thin">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="rounded-md border border-border bg-muted/20 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="text-sm font-semibold">{sale.customerName || 'Anonymous Buyer'}</p>
                      <span className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                      <div><span className="font-medium">Invoice ID:</span> {sale.id}</div>
                      <div><span className="font-medium">Total:</span> ৳{sale.grandTotal.toLocaleString()}</div>
                      <div><span className="font-medium">Payment:</span> {sale.paymentType}</div>
                      <div><span className="font-medium">Discount:</span> ৳{sale.discount.toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="font-medium">Buyer Details</p>
                      <p>{sale.customerPhone || 'Phone: N/A'} | {sale.customerAddress || 'Address: N/A'} | {sale.customerEmail || 'Email: N/A'}</p>
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="font-medium">Bikes Sold</p>
                      <div className="space-y-1">
                        {sale.items.map((item) => (
                          <div key={`${sale.id}-${item.bikeId}`} className="flex justify-between text-ssm">
                            <span>{item.bikeName} ({item.brand} {item.model}, {item.color}, {item.engineCC}cc)</span>
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
