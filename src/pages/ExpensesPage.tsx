import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wallet } from 'lucide-react';
import type { Expense } from '@/types';

const categoryColors: Record<string, string> = {
  rent: 'bg-chart-4/10 text-chart-4',
  salary: 'bg-chart-3/10 text-chart-3',
  maintenance: 'bg-chart-2/10 text-chart-2',
  other: 'bg-muted text-muted-foreground',
};

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', amount: 0, category: 'other' as Expense['category'] });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({ ...form, date: new Date().toISOString() });
    setForm({ title: '', amount: 0, category: 'other' });
    setDialogOpen(false);
  };

  return (
    <div>
      <PageHeader title="Expenses" description={`Total: ৳${totalExpenses.toLocaleString()}`}>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label className="text-xs">Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} required /></div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Expense['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {expenses.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No expenses recorded</p></div>
      ) : (
        <div className="space-y-2">
          {expenses.map((e, i) => (
            <Card key={e.id} className="shadow-sm animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${categoryColors[e.category]} capitalize text-[10px]`}>{e.category}</Badge>
                  <div>
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">৳{e.amount.toLocaleString()}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteExpense(e.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
