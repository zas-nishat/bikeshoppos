import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bike, Customer, Sale, EMI, Expense, CartItem, UserRole } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 10);

// Seed data
const seedBikes: Bike[] = [
  { id: '1', name: 'Yamaha R15 V4', brand: 'Yamaha', model: 'R15 V4', engineCC: 155, color: 'Racing Blue', purchasePrice: 280000, sellingPrice: 325000, stock: 8, image: '' },
  { id: '2', name: 'Honda CB Hornet', brand: 'Honda', model: 'CB Hornet 2.0', engineCC: 184, color: 'Matte Black', purchasePrice: 160000, sellingPrice: 195000, stock: 12, image: '' },
  { id: '3', name: 'Bajaj Pulsar NS200', brand: 'Bajaj', model: 'Pulsar NS200', engineCC: 199, color: 'Red', purchasePrice: 145000, sellingPrice: 175000, stock: 5, image: '' },
  { id: '4', name: 'TVS Apache RTR 160', brand: 'TVS', model: 'Apache RTR 160 4V', engineCC: 159, color: 'Grey', purchasePrice: 120000, sellingPrice: 148000, stock: 15, image: '' },
  { id: '5', name: 'Suzuki Gixxer SF', brand: 'Suzuki', model: 'Gixxer SF 250', engineCC: 249, color: 'Blue/Silver', purchasePrice: 190000, sellingPrice: 225000, stock: 3, image: '' },
  { id: '6', name: 'Hero Splendor Plus', brand: 'Hero', model: 'Splendor Plus', engineCC: 97, color: 'Black', purchasePrice: 65000, sellingPrice: 82000, stock: 25, image: '' },
];

const seedCustomers: Customer[] = [
  { id: '1', name: 'Rahim Ahmed', phone: '01712345678', address: 'Dhanmondi, Dhaka', nid: '1990123456789' },
  { id: '2', name: 'Karim Hossain', phone: '01898765432', address: 'Mirpur 10, Dhaka' },
  { id: '3', name: 'Fatema Begum', phone: '01556789012', address: 'Chittagong', nid: '1985987654321' },
];

const seedSales: Sale[] = [
  { id: '1', customerId: '1', customerName: 'Rahim Ahmed', items: [{ bikeId: '2', bikeName: 'Honda CB Hornet', quantity: 1, unitPrice: 195000 }], totalPrice: 195000, discount: 5000, discountType: 'fixed', tax: 0, grandTotal: 190000, paymentType: 'cash', date: new Date().toISOString() },
  { id: '2', customerId: '3', customerName: 'Fatema Begum', items: [{ bikeId: '6', bikeName: 'Hero Splendor Plus', quantity: 1, unitPrice: 82000 }], totalPrice: 82000, discount: 0, discountType: 'fixed', tax: 0, grandTotal: 82000, paymentType: 'emi', date: new Date(Date.now() - 86400000).toISOString() },
];

const seedExpenses: Expense[] = [
  { id: '1', title: 'Shop Rent - March', amount: 35000, category: 'rent', date: new Date().toISOString() },
  { id: '2', title: 'Mechanic Salary', amount: 18000, category: 'salary', date: new Date().toISOString() },
];

const seedEMIs: EMI[] = [
  { id: '1', saleId: '2', customerName: 'Fatema Begum', downPayment: 20000, monthlyAmount: 5167, duration: 12, paidAmount: 20000, dueAmount: 62000, payments: [{ date: new Date().toISOString(), amount: 20000 }] },
];

interface AppState {
  // Auth
  currentUser: { name: string; role: UserRole } | null;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  // Bikes
  bikes: Bike[];
  addBike: (bike: Omit<Bike, 'id'>) => void;
  updateBike: (id: string, bike: Partial<Bike>) => void;
  deleteBike: (id: string) => void;
  // Customers
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  // Sales
  sales: Sale[];
  addSale: (s: Omit<Sale, 'id'>) => void;
  // Cart
  cart: CartItem[];
  addToCart: (bike: Bike) => void;
  removeFromCart: (bikeId: string) => void;
  updateCartQuantity: (bikeId: string, qty: number) => void;
  clearCart: () => void;
  // EMI
  emis: EMI[];
  addEMI: (e: Omit<EMI, 'id'>) => void;
  recordEMIPayment: (emiId: string, amount: number) => void;
  // Expenses
  expenses: Expense[];
  addExpense: (e: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (name, role) => set({ currentUser: { name, role } }),
      logout: () => set({ currentUser: null }),
      darkMode: false,
      toggleDarkMode: () => set((s) => {
        const next = !s.darkMode;
        document.documentElement.classList.toggle('dark', next);
        return { darkMode: next };
      }),
      bikes: seedBikes,
      addBike: (bike) => set((s) => ({ bikes: [...s.bikes, { ...bike, id: generateId() }] })),
      updateBike: (id, data) => set((s) => ({ bikes: s.bikes.map((b) => b.id === id ? { ...b, ...data } : b) })),
      deleteBike: (id) => set((s) => ({ bikes: s.bikes.filter((b) => b.id !== id) })),
      customers: seedCustomers,
      addCustomer: (c) => set((s) => ({ customers: [...s.customers, { ...c, id: generateId() }] })),
      updateCustomer: (id, data) => set((s) => ({ customers: s.customers.map((c) => c.id === id ? { ...c, ...data } : c) })),
      sales: seedSales,
      addSale: (s) => set((state) => {
        const sale = { ...s, id: generateId() };
        const updatedBikes = state.bikes.map((b) => {
          const item = s.items.find((i) => i.bikeId === b.id);
          return item ? { ...b, stock: Math.max(0, b.stock - item.quantity) } : b;
        });
        return { sales: [...state.sales, sale], bikes: updatedBikes };
      }),
      cart: [],
      addToCart: (bike) => set((s) => {
        const existing = s.cart.find((c) => c.bike.id === bike.id);
        if (existing) {
          return { cart: s.cart.map((c) => c.bike.id === bike.id ? { ...c, quantity: c.quantity + 1 } : c) };
        }
        return { cart: [...s.cart, { bike, quantity: 1 }] };
      }),
      removeFromCart: (bikeId) => set((s) => ({ cart: s.cart.filter((c) => c.bike.id !== bikeId) })),
      updateCartQuantity: (bikeId, qty) => set((s) => ({
        cart: qty <= 0 ? s.cart.filter((c) => c.bike.id !== bikeId) : s.cart.map((c) => c.bike.id === bikeId ? { ...c, quantity: qty } : c),
      })),
      clearCart: () => set({ cart: [] }),
      emis: seedEMIs,
      addEMI: (e) => set((s) => ({ emis: [...s.emis, { ...e, id: generateId() }] })),
      recordEMIPayment: (emiId, amount) => set((s) => ({
        emis: s.emis.map((e) => e.id === emiId ? {
          ...e,
          paidAmount: e.paidAmount + amount,
          dueAmount: e.dueAmount - amount,
          payments: [...e.payments, { date: new Date().toISOString(), amount }],
        } : e),
      })),
      expenses: seedExpenses,
      addExpense: (e) => set((s) => ({ expenses: [...s.expenses, { ...e, id: generateId() }] })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
    }),
    { name: 'bike-pos-store' }
  )
);
