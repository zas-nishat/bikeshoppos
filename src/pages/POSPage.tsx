import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt, Download, Printer, Loader2 } from 'lucide-react';
import type { PaymentType, Sale } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { downloadInvoice, printInvoice } from '@/lib/invoice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';

export default function POSPage() {
  const navigate = useNavigate();
  const { bikes, customers, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, addSale, addCustomer, addEMI, currentUser, accounts } = useStore();
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
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBikes = bikes.filter((b) =>
    b.stock > 0 && `${b.name} ${b.brand} ${b.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((sum, c) => sum + c.bike.sellingPrice * c.quantity, 0);
  const discountAmount = discountType === 'percentage' ? subtotal * (discount / 100) : discount;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;

  const handleCheckout = () => {
    if (!customerId) {
      toast.error('Please select a customer or create a new one');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setConfirmOpen(true);
  };

  const finalizeSale = async () => {
    setIsSubmitting(true);
    let finalCustomerId = customerId;
    let customerName = '';
    let customerPhone = '';
    let customerAddress = '';
    let customerEmail = '';

    const c = customers.find((c) => c.id === finalCustomerId);
    if (c) {
      customerName = c.name;
      customerPhone = c.phone || '';
      customerAddress = c.address || '';
      customerEmail = c.email || '';
    }

    const loggedInUser = accounts.find((a) => a.id === currentUser?.id);
    const soldBy = loggedInUser?.name || currentUser?.name || 'Unknown';
    const soldByPhone = loggedInUser?.phone || '';

    const saleDateIso = new Date().toISOString();

    await new Promise(resolve => setTimeout(resolve, 3000));

    const saleData: Omit<Sale, 'id'> = {
      customerId: finalCustomerId,
      customerName,
      customerPhone,
      customerAddress,
      customerEmail,
      items: cart.map((c) => ({
        bikeId: c.bike.id,
        bikeName: c.bike.name,
        quantity: c.quantity,
        unitPrice: c.bike.sellingPrice,
        brand: c.bike.brand,
        model: c.bike.model,
        engineCC: c.bike.engineCC,
        color: c.bike.color
      })),
      totalPrice: subtotal,
      discount: discountAmount,
      discountType,
      tax: taxAmount,
      grandTotal,
      paymentType,
      date: saleDateIso,
      soldBy,
      soldByPhone,
    };

    const completedSaleId = await addSale(saleData);

    const completedSale: Sale = { ...saleData, id: completedSaleId };
    setLastSale(completedSale);
    setConfirmOpen(false);
    setInvoiceOpen(true);

    if (paymentType === 'emi') {
      const due = grandTotal - downPayment;
      await addEMI({
        saleId: completedSaleId,
        customerName,
        downPayment,
        monthlyAmount: Math.ceil(due / emiMonths),
        duration: emiMonths,
        paidAmount: downPayment,
        dueAmount: due,
        payments: [{ date: saleDateIso, amount: downPayment }],
      });
    }

    clearCart();
    setDiscount(0);
    setTax(0);
    setCustomerId('');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setIsSubmitting(false);
    toast.success('Sale completed successfully!');
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
              <Card key={b.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]" onClick={() => {
                addToCart(b); toast.info(`${b.name} added to cart`, {
                  position: 'top-right',
                });
              }}>
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
                <p className="text-xs mt-1">Try a different search term</p>
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
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                  <p className="text-xs mt-1">Click on a bike to add it</p>
                </div>
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
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => {
                          removeFromCart(item.bike.id); toast.info('Removed from cart', {
                            position: 'top-right',
                            style: {
                              color: 'red',
                            }
                          });
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3 space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Customer</Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select customer" /></SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/new-customer')}>New Customer</Button>
                </div>

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

      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" /> Sale Complete!</DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{formatDateTime(lastSale.date)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{lastSale.customerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sold By</span><span className="font-medium">{lastSale.soldBy || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{lastSale.items.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="capitalize">{lastSale.paymentType}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>৳{lastSale.grandTotal.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => downloadInvoice(lastSale)}>
                  <Download className="h-4 w-4 mr-1" /> Download PDF
                </Button>
                <Button className="flex-1" onClick={() => printInvoice(lastSale)}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Sale</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to finalize this sale? This action will update inventory and record the transaction.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>No, Cancel</Button>
            <Button onClick={finalizeSale} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                "Yes, Proceed"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
