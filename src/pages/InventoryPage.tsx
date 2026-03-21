import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  const { bikes } = useStore();
  const sorted = [...bikes].sort((a, b) => a.stock - b.stock);

  return (
    <div>
      <PageHeader title="Inventory" description="Stock levels and alerts" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}
