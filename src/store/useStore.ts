import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bike, Customer, Sale, EMI, Expense, CartItem, UserRole, UserAccount, StockLog } from '@/types';
import { supabase } from '@/lib/supabase';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'bike-pos-secret-99'; // Same key for consistency

const generateId = () => crypto.randomUUID();

const seedAccounts: UserAccount[] = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Admin', email: 'admin@bikehub.com', password: 'admin123', phone: '01700000001', role: 'admin', createdAt: new Date().toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Manager', email: 'manager@bikehub.com', password: 'manager123', phone: '01700000002', role: 'manager', createdAt: new Date().toISOString() },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Sales', email: 'sales@bikehub.com', password: 'sales123', phone: '01700000003', role: 'salesman', createdAt: new Date().toISOString() },
];

interface AppState {
  // Auth
  currentUser: { id: string; name: string; role: UserRole } | null;
  accounts: UserAccount[];
  register: (name: string, email: string, password: string, phone: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (email: string, password: string) => { success: boolean; error?: string };
  updateUser: (userId: string, updates: { name?: string; email?: string; phone?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
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
  addSale: (s: Omit<Sale, 'id'>) => Promise<string>;
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
  isInitialized: boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accounts: seedAccounts,
      isInitialized: false,
      register: async (name, email, password, phone, role) => {
        const state = get();
        if (state.accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'Email already exists' };
        }
        if (phone && state.accounts.some((a) => a.phone === phone)) {
          return { success: false, error: 'Phone number already exists' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }
        // Encrypt password before saving
        const encryptedPassword = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
        const account: UserAccount = { id: generateId(), name, email, password: encryptedPassword, phone, role, createdAt: new Date().toISOString() };

        const { error } = await supabase.from('accounts').insert([account]);
        if (error) {
          console.error('Registration failed in Supabase:', error);
          return { success: false, error: error.message };
        }

        set({ accounts: [...get().accounts, account] });
        return { success: true };
      },
      loginWithCredentials: (identifier, password) => {
        const state = get();
        // If not initialized yet, we only have seed accounts. 
        // We still search, but it might fail if they aren't in seed.
        const account = state.accounts.find((a) => {
          let decryptedPass = '';
          try {
            const bytes = CryptoJS.AES.decrypt(a.password, ENCRYPTION_KEY);
            decryptedPass = bytes.toString(CryptoJS.enc.Utf8);
            // Fallback if decryption result is unexpectedly empty (like if pass was plain text)
            if (!decryptedPass) decryptedPass = a.password;
          } catch {
            decryptedPass = a.password;
          }
          return (a.email.toLowerCase() === identifier.toLowerCase() || a.name.toLowerCase() === identifier.toLowerCase()) &&
            decryptedPass === password;
        });
        if (!account) return { success: false, error: 'Invalid email/username or password' };
        set({ currentUser: { id: account.id, name: account.name, role: account.role } });
        return { success: true };
      },
      deleteUser: async (userId) => {
        const userToDelete = get().accounts.find((a) => a.id === userId);
        if (!userToDelete) {
          return { success: false, error: 'User not found' };
        }

        const currentUser = get().currentUser;
        if (userToDelete.role === 'admin' && (!currentUser || currentUser.id !== userId)) {
          return { success: false, error: 'Admin accounts can only be deleted by themselves' };
        }

        const { error } = await supabase.from('accounts').delete().eq('id', userId);
        if (error) {
          console.error('Delete failed in Supabase:', error);
          return { success: false, error: error.message };
        }

        set({ accounts: get().accounts.filter((a) => a.id !== userId) });
        return { success: true };
      },
      updateUser: async (userId, updates) => {
        const userToUpdate = get().accounts.find((a) => a.id === userId);
        if (!userToUpdate) {
          return { success: false, error: 'User not found' };
        }

        // Prevent setting a phone/email that belongs to a different user
        if (updates.email && get().accounts.some((a) => a.id !== userId && a.email.toLowerCase() === updates.email?.toLowerCase())) {
          return { success: false, error: 'Email already exists' };
        }
        if (updates.phone && get().accounts.some((a) => a.id !== userId && a.phone === updates.phone)) {
          return { success: false, error: 'Phone number already exists' };
        }

        if (updates.password && updates.password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        const encryptedPassword = updates.password ? CryptoJS.AES.encrypt(updates.password, ENCRYPTION_KEY).toString() : userToUpdate.password;

        const updated = {
          ...userToUpdate,
          name: updates.name ?? userToUpdate.name,
          email: updates.email ?? userToUpdate.email,
          phone: updates.phone ?? userToUpdate.phone,
          password: encryptedPassword,
        };

        const { error } = await supabase.from('accounts').update(updated).eq('id', userId);
        if (error) {
          console.error('Update failed in Supabase:', error);
          return { success: false, error: error.message };
        }

        set({ accounts: get().accounts.map((a) => (a.id === userId ? updated : a)) });
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
        const { error } = await supabase.from('bikes').insert([newBike]);
        if (!error) {
          set((state) => ({ bikes: [...state.bikes, newBike] }));
        } else {
          console.error("Failed to add bike:", error);
        }
      },
      updateBike: async (id, updates) => {
        const { error } = await supabase.from('bikes').update(updates).eq('id', id);
        if (!error) {
          set((state) => ({
            bikes: state.bikes.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          }));
        } else {
          console.error("Failed to update bike:", error);
        }
      },
      deleteBike: async (id) => {
        const { error } = await supabase.from('bikes').delete().eq('id', id);
        if (!error) {
          set((state) => ({ bikes: state.bikes.filter((b) => b.id !== id) }));
        } else {
          console.error("Failed to delete bike:", error);
        }
      },

      // Customers
      customers: [],
      addCustomer: async (c) => {
        const id = generateId();
        const newCustomer = { ...c, id };
        const { error } = await supabase.from('customers').insert([newCustomer]);
        if (!error) {
          set((state) => ({ customers: [...state.customers, newCustomer] }));
        } else {
          console.error("Failed to add customer:", error);
        }
      },
      updateCustomer: async (id, c) => {
        const { error } = await supabase.from('customers').update(c).eq('id', id);
        if (!error) {
          set((state) => ({
            customers: state.customers.map((cust) => (cust.id === id ? { ...cust, ...c } : cust)),
          }));
        } else {
          console.error("Failed to update customer:", error);
        }
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

        return id;
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
          const [
            { data: b },
            { data: c },
            { data: s },
            { data: e },
            { data: em },
            { data: sl },
            { data: ac }
          ] = await Promise.all([
            supabase.from('bikes').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('sales').select('*'),
            supabase.from('expenses').select('*'),
            supabase.from('emis').select('*'),
            supabase.from('stock_logs').select('*'),
            supabase.from('accounts').select('*')
          ]);

          // Update state if data exists (even if empty array, which overwrites seeds)
          if (b) set({ bikes: b as Bike[] });
          if (c) set({ customers: c as Customer[] });

          if (s) {
            // Retrieve relational sale_items dynamically
            const { data: si } = await supabase.from('sale_items').select('*');
            const populatedSales = s.map((sale: any) => ({
              ...sale, items: (si || []).filter((item: any) => item.saleId === sale.id)
            }));
            set({ sales: populatedSales as Sale[] });
          }

          if (e) set({ expenses: e as Expense[] });
          if (em) set({ emis: em as EMI[] });
          if (sl) set({ stockLogs: sl as StockLog[] });
          if (ac) set({ accounts: ac as UserAccount[] });

          set({ isInitialized: true });
        } catch (err) {
          console.error("Supabase Initialization Failed", err);
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'bike-pos-store',
      // Only persist currentUser and darkMode
      partialize: (state) => ({
        currentUser: state.currentUser,
        darkMode: state.darkMode
      }),
      // Custom encrypted storage for localStorage
      storage: {
        getItem: (name) => {
          const encrypted = localStorage.getItem(name);
          if (!encrypted) return null;
          try {
            const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedString) return null;
            return JSON.parse(decryptedString);
          } catch (e) {
            return null;
          }
        },
        setItem: (name, value) => {
          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), ENCRYPTION_KEY).toString();
          localStorage.setItem(name, encrypted);
        },
        removeItem: (name) => localStorage.removeItem(name),
      }
    }
  )
);
