import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Plus, Search, Users, Edit2 } from 'lucide-react';
import type { Customer } from '@/types';
import { toast } from 'sonner';

function CustomerForm({ customer, onSubmit, onClose }: { customer?: Customer; onSubmit: (data: Omit<Customer, 'id'>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: customer?.name || '', phone: customer?.phone || '',
    address: customer?.address || '', nid: customer?.nid || '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); onClose(); }} className="space-y-3">
      <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
      <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
      <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      <div><Label className="text-xs">NID (Optional)</Label><Input value={form.nid} onChange={(e) => setForm({ ...form, nid: e.target.value })} /></div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm">{customer ? 'Update' : 'Add'} Customer</Button>
      </div>
    </form>
  );
}

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | undefined>();
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<Omit<Customer, 'id'> | null>(null);

  const filtered = customers.filter((c) =>
    `${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Customers" description={`${customers.length} registered customers`}>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Customer</DialogTitle></DialogHeader>
            <CustomerForm
              customer={editing}
              onSubmit={(data) => {
                if (editing) {
                  setPendingData(data);
                  setUpdateConfirmOpen(true);
                } else {
                  addCustomer(data);
                  toast.success('Customer added');
                }
              }}
              onClose={() => { setDialogOpen(false); setEditing(undefined); }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No customers found</p>
          <p className="text-sm mt-1">{customers.length === 0 ? 'Add your first customer' : 'Try a different search'}</p>
          {customers.length === 0 && (
            <Button size="sm" className="mt-3" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add First Customer
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <Card key={c.id} className="shadow-sm animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>
                    <p className="text-xs text-muted-foreground">{c.address}</p>
                    {c.nid && <p className="text-xs text-muted-foreground">NID: {c.nid}</p>}
                  </div>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={updateConfirmOpen} onOpenChange={setUpdateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to update {editing?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={() => {
                if (editing && pendingData) {
                  updateCustomer(editing.id, pendingData);
                  toast.success('Customer updated successfully');
                  setUpdateConfirmOpen(false);
                  setDialogOpen(false);
                  setEditing(undefined);
                  setPendingData(null);
                }
              }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
