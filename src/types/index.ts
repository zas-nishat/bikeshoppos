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
  image?: string;
  brakeType?: 'Single Disc' | 'Dual Disc' | 'Drum';
  abs?: boolean;
  condition?: 'New' | 'Used' | 'Refurbished';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  nid?: string;
  email?: string;
  drivingLicense?: string;
  alternatePhone?: string;
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
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  items: {
    bikeId: string;
    bikeName: string;
    quantity: number;
    unitPrice: number;
    brand: string;
    model: string;
    engineCC: number;
    color: string;
  }[];
  totalPrice: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  tax: number;
  grandTotal: number;
  paymentType: PaymentType;
  date: string;
  soldBy?: string;
  soldByPhone?: string;
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

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface StockLog {
  id: string;
  bikeId: string;
  bikeName: string;
  type: 'sale' | 'restock' | 'adjustment';
  quantity: number;
  date: string;
  note: string;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'pos', 'bikes', 'customers', 'emi', 'inventory', 'expenses', 'reports', 'users'],
  manager: ['dashboard', 'pos', 'bikes', 'customers', 'emi', 'inventory', 'expenses', 'reports'],
  salesman: ['dashboard', 'pos', 'customers', 'emi'],
};

export const ROLE_ACTIONS: Record<UserRole, string[]> = {
  admin: ['add_bike', 'edit_bike', 'delete_bike', 'add_expense', 'delete_expense', 'view_reports', 'manage_inventory'],
  manager: ['add_bike', 'edit_bike', 'add_expense', 'view_reports', 'manage_inventory'],
  salesman: ['create_sale', 'add_customer'],
};
