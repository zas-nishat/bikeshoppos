import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, History } from 'lucide-react';

export default function InventoryPage() {
  const { bikes, stockLogs } = useStore();
  const sorted = [...bikes].sort((a, b) => a.stock - b.stock);
  const recentLogs = [...stockLogs].reverse().slice(0, 20);

  return (
    <div>
      <PageHeader title="Inventory" description="Stock levels, alerts, and history" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sorted.map((b, i) => (
              <Card key={b.id} className="shadow-sm animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${b.stock <= 3 ? 'bg-destructive/10 text-destructive' : b.stock <= 5 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.brand}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums">{b.stock}</p>
                      <Badge variant={b.stock <= 3 ? 'destructive' : b.stock <= 5 ? 'secondary' : 'default'} className="text-[10px]">
                        {b.stock <= 3 ? 'Critical' : b.stock <= 5 ? 'Low' : 'OK'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Stock History</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No stock changes yet</p>
                  <p className="text-xs mt-1">Changes will appear as you sell or restock</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-auto scrollbar-thin">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between text-xs p-2 rounded-md bg-muted/50">
                      <div>
                        <p className="font-medium">{log.bikeName}</p>
                        <p className="text-muted-foreground">{log.note}</p>
                        <p className="text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={log.type === 'sale' ? 'destructive' : 'default'} className="text-[10px] ml-2 shrink-0">
                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                      </Badge>
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
