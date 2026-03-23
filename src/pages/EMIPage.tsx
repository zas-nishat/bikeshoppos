import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/utils';

export default function EMIPage() {
  const { emis, recordEMIPayment } = useStore();
  const [payAmounts, setPayAmounts] = useState<Record<string, number>>({});

  const handlePayment = (emiId: string) => {
    const amount = payAmounts[emiId] || 0;
    if (amount <= 0) { toast.error('Enter valid amount'); return; }
    recordEMIPayment(emiId, amount);
    setPayAmounts((p) => ({ ...p, [emiId]: 0 }));
    toast.success('Payment recorded');
  };

  return (
    <div>
      <PageHeader title="EMI Tracking" description={`${emis.length} active installment plans`} />
      {emis.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p>No EMI plans yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emis.map((e, i) => (
            <Card key={e.id} className="shadow-sm animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{e.customerName}</CardTitle>
                  <Badge variant={e.dueAmount <= 0 ? 'default' : 'destructive'} className="text-[10px]">
                    {e.dueAmount <= 0 ? 'Paid' : `৳${e.dueAmount.toLocaleString()} due`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Down Payment</span><p className="font-medium">৳{e.downPayment.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Monthly</span><p className="font-medium">৳{e.monthlyAmount.toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Duration</span><p className="font-medium">{e.duration} months</p></div>
                  <div><span className="text-muted-foreground">Paid</span><p className="font-medium">৳{e.paidAmount.toLocaleString()}</p></div>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (e.paidAmount / (e.paidAmount + e.dueAmount)) * 100)}%` }} />
                </div>
                {e.dueAmount > 0 && (
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Amount" className="h-8 text-xs" value={payAmounts[e.id] || ''} onChange={(ev) => setPayAmounts((p) => ({ ...p, [e.id]: +ev.target.value }))} />
                    <Button size="sm" className="h-8" onClick={() => handlePayment(e.id)}>Pay</Button>
                  </div>
                )}
                {e.payments.length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment History</p>
                    {e.payments.slice(-3).map((p, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{formatDateTime(p.date)}</span>
                        <span className="font-medium">৳{p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
