import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const { addCustomer } = useStore();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    nid: '',
    email: '',
    drivingLicense: '',
    alternatePhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    addCustomer(form);
    toast.success('Customer added successfully');
    navigate(-1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="New Customer" description="Add a new customer to the system" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Enter customer name" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="e.g. 01700000000" />
              </div>
              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Alternate Phone (Optional)</Label>
                <Input value={form.alternatePhone} onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })} placeholder="e.g. 01800000000" />
              </div>
              <div className="space-y-2">
                <Label>NID (Optional)</Label>
                <Input value={form.nid} onChange={(e) => setForm({ ...form, nid: e.target.value })} placeholder="National ID" />
              </div>
              <div className="space-y-2">
                <Label>Driving License Number (Optional)</Label>
                <Input value={form.drivingLicense} onChange={(e) => setForm({ ...form, drivingLicense: e.target.value })} placeholder="License ID" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit">Save Customer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
