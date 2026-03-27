-- Run this code in your Supabase SQL Editor to instantly setup the Database
-- Important: We use exact camelCase column names wrapped in double quotes exactly matching the Vite App's Typescript Models, so the React App requires zero transformation code (it directly drops the frontend objects into table arrays!)

-- Drop existing tables first if you are re-running this
DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS emis CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS bikes CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Define Type Enums
CREATE TYPE payment_type AS ENUM ('cash', 'card', 'emi');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'salesman');

-- Create Customers Table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  nid TEXT,
  email TEXT,
  "drivingLicense" TEXT,
  "alternatePhone" TEXT
);

-- Create Bikes Table
CREATE TABLE bikes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  "engineCC" INTEGER,
  color TEXT,
  "purchasePrice" NUMERIC,
  "sellingPrice" NUMERIC NOT NULL,
  stock INTEGER DEFAULT 0,
  "brakeType" TEXT CHECK ("brakeType" IN ('Single Disc', 'Dual Disc', 'Drum')),
  abs BOOLEAN DEFAULT FALSE,
  condition TEXT DEFAULT 'New' CHECK (condition IN ('New', 'Used', 'Refurbished'))
);

-- Create Sales Table
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  "customerId" TEXT REFERENCES customers(id) ON DELETE SET NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT,
  "customerAddress" TEXT,
  "customerEmail" TEXT,
  "totalPrice" NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  "discountType" TEXT DEFAULT 'fixed',
  tax NUMERIC DEFAULT 0,
  "grandTotal" NUMERIC NOT NULL,
  "paymentType" payment_type NOT NULL,
  date TEXT NOT NULL,
  "soldBy" TEXT,
  "soldByPhone" TEXT
);

-- Create Sale Items Table (Stores the embedded array)
CREATE TABLE sale_items (
  id TEXT PRIMARY KEY,
  "saleId" TEXT REFERENCES sales(id) ON DELETE CASCADE,
  "bikeId" TEXT REFERENCES bikes(id) ON DELETE SET NULL,
  "bikeName" TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  "engineCC" INTEGER,
  color TEXT,
  quantity INTEGER NOT NULL,
  "unitPrice" NUMERIC NOT NULL
);

-- Create EMI Table
CREATE TABLE emis (
  id TEXT PRIMARY KEY,
  "saleId" TEXT REFERENCES sales(id) ON DELETE CASCADE,
  "customerName" TEXT,
  "downPayment" NUMERIC NOT NULL,
  "monthlyAmount" NUMERIC NOT NULL,
  duration INTEGER NOT NULL, 
  "paidAmount" NUMERIC NOT NULL,
  "dueAmount" NUMERIC NOT NULL,
  payments JSONB DEFAULT '[]'::JSONB 
);

-- Create Expenses Table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL
);

-- Create User Accounts Table
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT, 
  phone TEXT,
  role user_role DEFAULT 'salesman',
  "createdAt" TEXT NOT NULL
);

-- Insert Default Admin Account
INSERT INTO accounts (id, name, email, password, phone, role, "createdAt")
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'admin@bikehub.com', 'admin123', '01700000001', 'admin', NOW());

-- Create Stock Logs Table
CREATE TABLE stock_logs (
  id TEXT PRIMARY KEY,
  "bikeId" TEXT REFERENCES bikes(id) ON DELETE CASCADE,
  "bikeName" TEXT,
  type TEXT NOT NULL, 
  quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  note TEXT
);
