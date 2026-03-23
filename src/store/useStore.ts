import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bike, Customer, Sale, EMI, Expense, CartItem, UserRole, UserAccount, StockLog } from '@/types';
import { supabase } from '@/lib/supabase';

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
  { id: '1', customerId: '1', customerName: 'Rahim Ahmed', items: [{ bikeId: '2', bikeName: 'Honda CB Hornet', quantity: 1, unitPrice: 195000, brand: 'Honda', model: 'CB Hornet 2.0', engineCC: 184, color: 'Matte Black' }], totalPrice: 195000, discount: 5000, discountType: 'fixed', tax: 0, grandTotal: 190000, paymentType: 'cash', date: new Date().toISOString() },
  { id: '2', customerId: '3', customerName: 'Fatema Begum', items: [{ bikeId: '6', bikeName: 'Hero Splendor Plus', quantity: 1, unitPrice: 82000, brand: 'Hero', model: 'Splendor Plus', engineCC: 97, color: 'Black' }], totalPrice: 82000, discount: 0, discountType: 'fixed', tax: 0, grandTotal: 82000, paymentType: 'emi', date: new Date(Date.now() - 86400000).toISOString() },
];

const seedExpenses: Expense[] = [
  { id: '1', title: 'Shop Rent - March', amount: 35000, category: 'rent', date: new Date().toISOString() },
  { id: '2', title: 'Mechanic Salary', amount: 18000, category: 'salary', date: new Date().toISOString() },
];

const seedEMIs: EMI[] = [
  { id: '1', saleId: '2', customerName: 'Fatema Begum', downPayment: 20000, monthlyAmount: 5167, duration: 12, paidAmount: 20000, dueAmount: 62000, payments: [{ date: new Date().toISOString(), amount: 20000 }] },
];

const seedAccounts: UserAccount[] = [
  { id: '1', name: 'Admin', email: 'admin@bikehub.com', password: 'admin123', phone: '01700000001', role: 'admin', createdAt: new Date().toISOString() },
  { id: '2', name: 'Manager', email: 'manager@bikehub.com', password: 'manager123', phone: '01700000002', role: 'manager', createdAt: new Date().toISOString() },
  { id: '3', name: 'Sales', email: 'sales@bikehub.com', password: 'sales123', phone: '01700000003', role: 'salesman', createdAt: new Date().toISOString() },
];

interface AppState {
  // Auth
  currentUser: { id: string; name: string; role: UserRole } | null;
  accounts: UserAccount[];
  register: (name: string, email: string, password: string, phone: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (email: string, password: string) => { success: boolean; error?: string };
  updateUser: (userId: string, updates: { name?: string; phone?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  // Bikes
  bikes: Bike[];
  addBike: (bike: Omit<Bike, 'id'>) => Promise<void>;
  updateBike: (id: string, bike: Partial<Bike>) => Promise<void>;
  deleteBike: (id: string) => Promise<void>;
  // Customers
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>;
  // Sales
  sales: Sale[];
  addSale: (s: Omit<Sale, 'id'>) => Promise<void>;
  // Cart
  cart: CartItem[];
  addToCart: (bike: Bike) => void;
  removeFromCart: (bikeId: string) => void;
  updateCartQuantity: (bikeId: string, qty: number) => void;
  clearCart: () => void;
  // EMI
  emis: EMI[];
  addEMI: (e: Omit<EMI, 'id'>) => Promise<void>;
  recordEMIPayment: (emiId: string, amount: number) => Promise<void>;
  // Expenses
  expenses: Expense[];
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  // Stock log
  stockLogs: StockLog[];
  addStockLog: (log: Omit<StockLog, 'id'>) => Promise<void>;

  initializeSupabase: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accounts: seedAccounts,
      register: async (name, email, password, phone, role) => {
        const state = get();
        if (state.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'Email already registered' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }
        const account: UserAccount = { id: generateId(), name, email, password, phone, role, createdAt: new Date().toISOString() };
        set({ accounts: [...state.accounts, account] });
        await supabase.from('accounts').insert([account]);
        return { success: true };
      },
      loginWithCredentials: (identifier, password) => {
        const state = get();
        const account = state.accounts.find(
          (a) =>
            (a.email.toLowerCase() === identifier.toLowerCase() || a.name.toLowerCase() === identifier.toLowerCase()) &&
            a.password === password,
        );
        if (!account) return { success: false, error: 'Invalid email/username or password' };
        set({ currentUser: { id: account.id, name: account.name, role: account.role } });
        return { success: true };
      },
      deleteUser: async (userId) => {
        const state = get();
        const currentUser = state.currentUser;
        const userToDelete = state.accounts.find((a) => a.id === userId);
        if (!userToDelete) {
          return { success: false, error: 'User not found' };
        }
        if (userToDelete.role === 'admin' && currentUser?.id !== userId) {
          return { success: false, error: 'Admin accounts can only be deleted by themselves' };
        }
        set({ accounts: state.accounts.filter((a) => a.id !== userId) });
        await supabase.from('accounts').delete().eq('id', userId);
        return { success: true };
      },
      updateUser: async (userId, updates) => {
        const state = get();
        const userToUpdate = state.accounts.find((a) => a.id === userId);
        if (!userToUpdate) {
          return { success: false, error: 'User not found' };
        }
        if (updates.password && updates.password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }
        const updated = {
          ...userToUpdate,
          name: updates.name ?? userToUpdate.name,
          phone: updates.phone ?? userToUpdate.phone,
          password: updates.password ?? userToUpdate.password,
        };
        set({ accounts: state.accounts.map((a) => (a.id === userId ? updated : a)) });
        await supabase.from('accounts').update(updated).eq('id', userId);
        return { success: true };
      },
      logout: () => set({ currentUser: null }),
      darkMode: false,
      toggleDarkMode: () => set((s) => {
        const next = !s.darkMode;
        document.documentElement.classList.toggle('dark', next);
        return { darkMode: next };
      }),

      bikes: [],
      addBike: async (bikeData) => {
        const id = generateId();
        const newBike = { ...bikeData, id };
        set((state) => ({ bikes: [...state.bikes, newBike] }));
        await supabase.from('bikes').insert([newBike]);
      },
      updateBike: async (id, updates) => {
        set((state) => ({
          bikes: state.bikes.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
        await supabase.from('bikes').update(updates).eq('id', id);
      },
      deleteBike: async (id) => {
        set((state) => ({ bikes: state.bikes.filter((b) => b.id !== id) }));
        await supabase.from('bikes').delete().eq('id', id);
      },

      // Customers
      customers: [],
      addCustomer: async (c) => {
        const id = generateId();
        const newCustomer = { ...c, id };
        set((state) => ({ customers: [...state.customers, newCustomer] }));
        await supabase.from('customers').insert([newCustomer]);
      },
      updateCustomer: async (id, c) => {
        set((state) => ({
          customers: state.customers.map((cust) => (cust.id === id ? { ...cust, ...c } : cust)),
        }));
        await supabase.from('customers').update(c).eq('id', id);
      },

      // Sales
      sales: [],
      addSale: async (s) => {
        const id = generateId();
        const newSale = { ...s, id };
        set((state) => {
          const updatedBikes = state.bikes.map((b) => {
            const item = s.items.find((i) => i.bikeId === b.id);
            return item ? { ...b, stock: Math.max(0, b.stock - item.quantity) } : b;
          });
          const newLogs = [...state.stockLogs];
          s.items.forEach((item) => {
            newLogs.push({ id: generateId(), bikeId: item.bikeId, bikeName: item.bikeName, type: 'sale', quantity: -item.quantity, date: new Date().toISOString(), note: `Sold to ${s.customerName}` });
          });
          return { sales: [...state.sales, newSale], bikes: updatedBikes, stockLogs: newLogs };
        });

        // Extract items off payload mapping remaining natively to Posgres columns
        const { items, ...salePayload } = newSale;
        const result = await supabase.from('sales').insert([salePayload]);
        
        if (result.error) {
            console.error('Supabase Sales Insert Error:', result.error);
        }

        // Insert relational items independently
        const itemsToInsert = s.items.map(item => ({ ...item, saleId: id, id: generateId() }));
        if (itemsToInsert.length > 0) {
          await supabase.from('sale_items').insert(itemsToInsert);
        }

        // Record background analytical logs updating core stock database values securely
        for (const item of s.items) {
           const affectedBike = get().bikes.find(b => b.id === item.bikeId);
           if (affectedBike) {
               await supabase.from('bikes').update({ stock: affectedBike.stock }).eq('id', item.bikeId);
           }
           
           await supabase.from('stock_logs').insert([{
               id: generateId(),
               bikeId: item.bikeId,
               bikeName: item.bikeName,
               type: 'sale',
               quantity: -item.quantity,
               date: newSale.date || new Date().toISOString(),
               note: `Sold to ${s.customerName}`
           }]);
        }
      },
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
      // EMI
      emis: [],
      addEMI: async (e) => {
        const id = generateId();
        const newEmi = { ...e, id };
        set((state) => ({ emis: [...state.emis, newEmi] }));
        await supabase.from('emis').insert([newEmi]);
      },
      recordEMIPayment: async (emiId, amount) => {
        const payment = { date: new Date().toISOString(), amount };
        let updatedEmiData = null;

        set((state) => ({
          emis: state.emis.map((e) => {
            if (e.id === emiId) {
              updatedEmiData = { ...e, paidAmount: e.paidAmount + amount, dueAmount: e.dueAmount - amount, payments: [...e.payments, payment] };
              return updatedEmiData as EMI;
            }
            return e;
          }),
        }));

        if (updatedEmiData) await supabase.from('emis').update(updatedEmiData).eq('id', emiId);
      },

      // Expenses
      expenses: [],
      addExpense: async (e) => {
        const id = generateId();
        const newExpense = { ...e, id };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
        await supabase.from('expenses').insert([newExpense]);
      },
      deleteExpense: async (id) => {
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
        await supabase.from('expenses').delete().eq('id', id);
      },

      // Stock
      stockLogs: [],
      addStockLog: async (log) => {
        const id = generateId();
        const newLog = { ...log, id };
        set((state) => ({ stockLogs: [newLog, ...state.stockLogs] }));
        await supabase.from('stock_logs').insert([newLog]);
      },

      initializeSupabase: async () => {
        try {
          const [{ data: b }, { data: c }, { data: s }, { data: e }, { data: em }, { data: sl }, { data: ac }] = await Promise.all([
            supabase.from('bikes').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('sales').select('*'),
            supabase.from('expenses').select('*'),
            supabase.from('emis').select('*'),
            supabase.from('stock_logs').select('*'),
            supabase.from('accounts').select('*')
          ]);
          if (b?.length) set({ bikes: b as Bike[] });
          if (c?.length) set({ customers: c as Customer[] });

          if (s?.length) {
            // Retrieve relational sale_items dynamically
            const { data: si } = await supabase.from('sale_items').select('*');
            const populatedSales = s.map((sale: any) => ({
              ...sale, items: (si || []).filter((item: any) => item.saleId === sale.id)
            }));
            set({ sales: populatedSales as Sale[] });
          }

          if (e?.length) set({ expenses: e as Expense[] });
          if (em?.length) set({ emis: em as EMI[] });
          if (sl?.length) set({ stockLogs: sl as StockLog[] });
          if (ac?.length) set({ accounts: ac as UserAccount[] });

        } catch (err) {
          console.error("Supabase Initialization Failed", err);
        }
      },
    }),
    { name: 'bike-pos-store' }
  )
);
