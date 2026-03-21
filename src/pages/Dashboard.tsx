import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Bike, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { bikes, sales, expenses } = useStore();
  const today = new Date().toDateString();

  const todaySales = sales.filter((s) => new Date(s.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalStock = bikes.reduce((sum, b) => sum + b.stock, 0);
  const lowStock = bikes.filter((b) => b.stock <= 5);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const dayTotal = sales.filter((s) => new Date(s.date).toDateString() === dayStr).reduce((sum, s) => sum + s.grandTotal, 0);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), revenue: dayTotal };
  });

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your showroom performance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
          <StatCard title="Today's Sales" value={`৳${todayRevenue.toLocaleString()}`} icon={DollarSign} variant="primary" trend={`${todaySales.length} transactions`} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '80ms' }}>
          <StatCard title="Total Revenue" value={`৳${totalRevenue.toLocaleString()}`} icon={TrendingUp} variant="success" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '160ms' }}>
          <StatCard title="Bikes in Stock" value={totalStock} icon={Bike} variant="accent" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '240ms' }}>
          <StatCard title="Total Expenses" value={`৳${totalExpenses.toLocaleString()}`} icon={ShoppingCart} variant="warning" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '380ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">All bikes well stocked ✓</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <span className="truncate mr-2">{b.name}</span>
                      <Badge variant={b.stock <= 2 ? 'destructive' : 'secondary'}>{b.stock} left</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '460ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet</p>
              ) : (
                <div className="space-y-2">
                  {sales.slice(-5).reverse().map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium truncate">{s.customerName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-semibold text-foreground">৳{s.grandTotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
