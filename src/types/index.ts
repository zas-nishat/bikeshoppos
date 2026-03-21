export interface Bike {
  id: string;
  name: string;
  brand: string;
  model: string;
  engineCC: number;
  color: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  image: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  nid?: string;
}

export interface CartItem {
  bike: Bike;
  quantity: number;
}

export type PaymentType = 'cash' | 'card' | 'emi';

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  items: { bikeId: string; bikeName: string; quantity: number; unitPrice: number }[];
  totalPrice: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  tax: number;
  grandTotal: number;
  paymentType: PaymentType;
  date: string;
}

export interface EMI {
  id: string;
  saleId: string;
  customerName: string;
  downPayment: number;
  monthlyAmount: number;
  duration: number;
  paidAmount: number;
  dueAmount: number;
  payments: { date: string; amount: number }[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'rent' | 'salary' | 'maintenance' | 'other';
  date: string;
}

export type UserRole = 'admin' | 'manager' | 'salesman';
