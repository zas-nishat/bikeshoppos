import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { ROLE_PERMISSIONS } from "@/types";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import POSPage from "./pages/POSPage";
import BikesPage from "./pages/BikesPage";
import CustomersPage from "./pages/CustomersPage";
import EMIPage from "./pages/EMIPage";
import InventoryPage from "./pages/InventoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ page, children }: { page: string; children: React.ReactNode }) {
  const currentUser = useStore((s) => s.currentUser);
  if (!currentUser) return <Navigate to="/" replace />;
  const allowed = ROLE_PERMISSIONS[currentUser.role];
  if (!allowed.includes(page)) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-4xl mb-2">🔒</p>
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">Your role ({currentUser.role}) does not have access to this page.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function AppContent() {
  const { currentUser, darkMode } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (!currentUser) return <LoginPage />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<ProtectedRoute page="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute page="pos"><POSPage /></ProtectedRoute>} />
        <Route path="/bikes" element={<ProtectedRoute page="bikes"><BikesPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute page="customers"><CustomersPage /></ProtectedRoute>} />
        <Route path="/emi" element={<ProtectedRoute page="emi"><EMIPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute page="inventory"><InventoryPage /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute page="expenses"><ExpensesPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute page="reports"><ReportsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
