import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt } from 'lucide-react';
import type { PaymentType } from '@/types';
import { toast } from 'sonner';

export default function POSPage() {
  const { bikes, customers, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, addSale, addCustomer, addEMI } = useStore();
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [tax, setTax] = useState(0);
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [emiMonths, setEmiMonths] = useState(12);
  const [downPayment, setDownPayment] = useState(0);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  const filteredBikes = bikes.filter((b) =>
    b.stock > 0 && `${b.name} ${b.brand} ${b.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((sum, c) => sum + c.bike.sellingPrice * c.quantity, 0);
  const discountAmount = discountType === 'percentage' ? subtotal * (discount / 100) : discount;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;

  const handleCheckout = () => {
    let finalCustomerId = customerId;
    let customerName = '';

    if (!finalCustomerId && newCustomerName && newCustomerPhone) {
      const newId = Math.random().toString(36).substring(2, 10);
      addCustomer({ name: newCustomerName, phone: newCustomerPhone, address: '' });
      finalCustomerId = newId;
      customerName = newCustomerName;
    } else {
      const c = customers.find((c) => c.id === finalCustomerId);
      if (!c) { toast.error('Please select or add a customer'); return; }
      customerName = c.name;
    }

    if (cart.length === 0) { toast.error('Cart is empty'); return; }

    addSale({
      customerId: finalCustomerId,
      customerName,
      items: cart.map((c) => ({ bikeId: c.bike.id, bikeName: c.bike.name, quantity: c.quantity, unitPrice: c.bike.sellingPrice })),
      totalPrice: subtotal,
      discount: discountAmount,
      discountType,
      tax: taxAmount,
      grandTotal,
      paymentType,
      date: new Date().toISOString(),
    });

    if (paymentType === 'emi') {
      const due = grandTotal - downPayment;
      addEMI({
        saleId: '',
        customerName,
        downPayment,
        monthlyAmount: Math.ceil(due / emiMonths),
        duration: emiMonths,
        paidAmount: downPayment,
        dueAmount: due,
        payments: [{ date: new Date().toISOString(), amount: downPayment }],
      });
    }

    clearCart();
    setDiscount(0);
    setTax(0);
    setCustomerId('');
    toast.success('Sale completed!');
  };

  return (
    <div>
      <PageHeader title="POS / Sales" description="Quick sales terminal" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Product Selection */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search bikes by name or model..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-auto scrollbar-thin pr-1">
            {filteredBikes.map((b) => (
              <Card key={b.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => addToCart(b)}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.brand} • {b.engineCC}cc</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">৳{b.sellingPrice.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-[10px]">{b.stock} left</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredBikes.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No bikes available</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm sticky top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Cart ({cart.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Add bikes to cart</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-auto scrollbar-thin">
                  {cart.map((item) => (
                    <div key={item.bike.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-medium truncate">{item.bike.name}</p>
                        <p className="text-xs text-muted-foreground">৳{item.bike.sellingPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateCartQuantity(item.bike.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateCartQuantity(item.bike.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.bike.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3 space-y-2">
                <div>
                  <Label className="text-xs">Customer</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {!customerId && (
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-[10px]">New Name</Label><Input className="h-7 text-xs" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} /></div>
                    <div><Label className="text-[10px]">Phone</Label><Input className="h-7 text-xs" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} /></div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Discount</Label>
                    <div className="flex gap-1">
                      <Input type="number" className="h-7 text-xs" value={discount} onChange={(e) => setDiscount(+e.target.value)} />
                      <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'fixed' | 'percentage')}>
                        <SelectTrigger className="h-7 w-16 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="fixed">৳</SelectItem><SelectItem value="percentage">%</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Tax %</Label>
                    <Input type="number" className="h-7 text-xs" value={tax} onChange={(e) => setTax(+e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Payment</Label>
                  <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="emi">EMI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentType === 'emi' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">Down Payment</Label><Input type="number" className="h-7 text-xs" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} /></div>
                    <div><Label className="text-xs">Months</Label><Input type="number" className="h-7 text-xs" value={emiMonths} onChange={(e) => setEmiMonths(+e.target.value)} /></div>
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-৳{discountAmount.toLocaleString()}</span></div>}
                {taxAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>৳{taxAmount.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total</span><span>৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleCheckout} disabled={cart.length === 0}>
                Complete Sale
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
