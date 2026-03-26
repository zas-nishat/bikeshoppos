import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit2, Trash2, Bike } from 'lucide-react';
import { ROLE_ACTIONS } from '@/types';
import type { Bike as BikeType } from '@/types';
import { toast } from 'sonner';

function BikeForm({ bike, onSubmit, onClose, isUpdating = false }: { bike?: BikeType; onSubmit: (data: Omit<BikeType, 'id'>) => void; onClose: () => void; isUpdating?: boolean }) {
  const [form, setForm] = useState({
    name: bike?.name || '',
    brand: bike?.brand || '',
    model: bike?.model || '',
    engineCC: bike?.engineCC || 0,
    color: bike?.color || '',
    purchasePrice: bike?.purchasePrice || 0,
    sellingPrice: bike?.sellingPrice || 0,
    stock: bike?.stock || 0,
    brakeType: bike?.brakeType || '' as BikeType['brakeType'],
    abs: bike?.abs ?? false,
    condition: bike?.condition || 'New' as BikeType['condition'],
  });
  const set = (k: string, v: string | number | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating && bike) {
      onSubmit(form);
    } else {
      onSubmit(form);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Yamaha R1M" required />
        </div>
        <div>
          <Label className="text-xs">Brand</Label>
          <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Yamaha" required />
        </div>
        <div>
          <Label className="text-xs">Model</Label>
          <Input value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="2024, V4, ABS" required />
        </div>
        <div>
          <Label className="text-xs">Engine CC</Label>
          <Input type="number" value={form.engineCC || ''} onChange={(e) => set('engineCC', +e.target.value)} placeholder="155" />
        </div>
        <div>
          <Label className="text-xs">Color</Label>
          <Input value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Matte Black, Red" />
        </div>
        <div>
          <Label className="text-xs">Stock</Label>
          <Input type="number" value={form.stock || ''} onChange={(e) => set('stock', +e.target.value)} placeholder="5" />
        </div>
        <div>
          <Label className="text-xs">Purchase Price</Label>
          <Input type="number" value={form.purchasePrice || ''} onChange={(e) => set('purchasePrice', +e.target.value)} placeholder="150000" />
        </div>
        <div>
          <Label className="text-xs">Selling Price</Label>
          <Input type="number" value={form.sellingPrice || ''} onChange={(e) => set('sellingPrice', +e.target.value)} placeholder="175000" />
        </div>

        {/* Brake Type */}
        <div>
          <Label className="text-xs">Brake Type</Label>
          <Select value={form.brakeType || ''} onValueChange={(v) => set('brakeType', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select brake type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single Disc">Single Disc</SelectItem>
              <SelectItem value="Dual Disc">Dual Disc</SelectItem>
              <SelectItem value="Drum">Drum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div>
          <Label className="text-xs">Condition</Label>
          <Select value={form.condition || 'New'} onValueChange={(v) => set('condition', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
              <SelectItem value="Refurbished">Refurbished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ABS - full width */}
        <div className="col-span-2">
          <Label className="text-xs">ABS</Label>
          <Select value={form.abs ? 'yes' : 'no'} onValueChange={(v) => set('abs', v === 'yes')}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="ABS available?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes — ABS Available</SelectItem>
              <SelectItem value="no">No — Without ABS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm">{bike ? 'Update' : 'Add'} Bike</Button>
      </div>
    </form>
  );
}

export default function BikesPage() {
  const { bikes, addBike, updateBike, deleteBike, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BikeType | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState<BikeType | null>(null);
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
  const [pendingBikeData, setPendingBikeData] = useState<Omit<BikeType, 'id'> | null>(null);

  const role = currentUser?.role || 'salesman';
  const canAdd = ROLE_ACTIONS[role].includes('add_bike');
  const canEdit = ROLE_ACTIONS[role].includes('edit_bike');
  const canDelete = ROLE_ACTIONS[role].includes('delete_bike');

  const filtered = bikes.filter((b) =>
    `${b.name} ${b.brand} ${b.model}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Bike Management" description={`${bikes.length} bikes in catalog`}>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Bike</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Bike</DialogTitle></DialogHeader>
              <BikeForm
                bike={editing}
                isUpdating={!!editing}
                onSubmit={(data) => {
                  if (editing) {
                    setPendingBikeData(data);
                    setUpdateConfirmOpen(true);
                  } else {
                    addBike(data);
                    toast.success('Bike added successfully');
                    setDialogOpen(false);
                    setEditing(undefined);
                  }
                }}
                onClose={() => { setDialogOpen(false); setEditing(undefined); }}
              />
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search bikes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bike className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No bikes found</p>
          <p className="text-sm mt-1">{bikes.length === 0 ? 'Add your first bike to get started' : 'Try a different search term'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b, i) => (
            <Card key={b.id} className="shadow-sm hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{b.name}</h3>
                    <p className="text-xs text-muted-foreground">{b.brand} • {b.model}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={b.stock <= 3 ? 'destructive' : 'secondary'} className="text-[10px]">{b.stock} in stock</Badge>
                    {b.condition && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${b.condition === 'New' ? 'border-green-500 text-green-600' : b.condition === 'Used' ? 'border-orange-400 text-orange-500' : 'border-blue-400 text-blue-500'}`}
                      >
                        {b.condition}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mt-3">
                  <span>{b.engineCC}cc</span>
                  <span>{b.color}</span>
                  <span>Buy: ৳{b.purchasePrice.toLocaleString()}</span>
                  <span className="font-semibold text-foreground">Sell: ৳{b.sellingPrice.toLocaleString()}</span>
                  {b.brakeType && <span>{b.brakeType}</span>}
                  {b.abs !== undefined && (
                    <span className={b.abs ? 'text-green-600 font-medium' : ''}>
                      {b.abs ? '✓ ABS' : 'No ABS'}
                    </span>
                  )}
                </div>

                {(canEdit || canDelete) && (
                  <div className="flex gap-1 mt-3 pt-3 border-t">
                    {canEdit && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={() => { setEditing(b); setDialogOpen(true); }}>
                        <Edit2 className="h-3 w-3 mr-1" />Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive flex-1"
                        onClick={() => { setBikeToDelete(b); setDeleteConfirmOpen(true); }}>
                        <Trash2 className="h-3 w-3 mr-1" />Delete
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bike</DialogTitle>
            <DialogDescription>Are you sure you want to delete {bikeToDelete?.name}? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
            <Button variant="destructive" size="sm" onClick={() => {
              if (bikeToDelete) {
                deleteBike(bikeToDelete.id);
                toast.success('Bike deleted successfully');
                setDeleteConfirmOpen(false);
                setBikeToDelete(null);
              }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={updateConfirmOpen} onOpenChange={setUpdateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Bike</DialogTitle>
            <DialogDescription>Are you sure you want to update {editing?.name}?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
            <Button size="sm" onClick={() => {
              if (editing && pendingBikeData) {
                updateBike(editing.id, pendingBikeData);
                toast.success('Bike updated successfully');
                setUpdateConfirmOpen(false);
                setPendingBikeData(null);
                setDialogOpen(false);
                setEditing(undefined);
              }
            }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}