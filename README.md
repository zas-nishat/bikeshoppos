# 🏍️ BikeHub POS — Advanced Bike Dealership Management System

![BikeHub POS](/public/og-image.png)

An elegant, real-time Point of Sale (POS) and Dealership Management application crafted specifically for modern Bike Showrooms. Built with a rich tech stack to seamlessly manage Sales, EMI installments, Inventory, Expenses, and custom User Access Control synced real-time over the Cloud.

**Developed by:** [Nishat (zas-nishat)](https://github.com/zas-nishat)

---

## ✨ Key Features
- **Smart Point Of Sale:** Multi-product cart system with automated Google/Bing image fetching for bikes, supporting direct subtotal, tax, and discount generation.
- **EMI Management:** Manage partial/down payments automatically tracking due instalments with intuitive timeline charts.
- **Robust Cloud Sync:** Powered entirely by `Supabase` capturing identical Postgres JSON records efficiently.
- **Printable Invoices:** Native PDF printing mapped automatically extracting user permissions and dynamic signatures.
- **Dark Mode Support:** Clean toggles rendering across modern Shadcn/UI interfaces.

---

## 🚀 Quick Start Guide

### 1. Installation
Clone the repository and install the standard dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
*(Your unique configuration from the Supabase API dashboard goes here)*

### 3. Supabase Database Migration
To make sure your tables (`bikes`, `sales`, `customers`, `emis`, etc.) exist remotely before booting the app, you need to push the Supabase database schema! 

**Option A - Using Supabase CLI (Recommended)**
Run these commands in your editor terminal:
```bash
# Install CLI
npm i -g supabase

# Authenticate your terminal
npx supabase login

# Link your specific cloud project
npx supabase link --project-ref <your-project-id>

# Auto-push the Database Configuration Tables
npx supabase db push
```

**Option B - Using Supabase Dashboard (Manual)**
1. Open your Supabase Project in the browser.
2. Go to the **SQL Editor**.
3. Copy the entire contents of the `supabase/schema.sql` file and paste it into the editor.
4. Click **Run**.

### 4. Run the Project
Start the Vite development server locally!
```bash
npm run dev
```

Visit the application locally via the terminal link (usually `http://localhost:8080/`).

---

## 🛠️ Technology Stack
* **Vite + React (TypeScript):** Blazing fast module bundling.
* **Supabase (PostgreSQL):** Serverless Backend Architecture.
* **Zustand:** Ultra-smooth optimistic React state management.
* **Tailwind CSS + Shadcn UI:** Gorgeous utility-first modular styling.
* **jsPDF:** Frontend native document generation.

> **Note:** To secure administrator routing properly, please manually generate the first account directly through the `accounts` or UI Registration layout panel before toggling permissions away.