import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import OPDLabRequests from "./pages/OPDLabRequests";
import LaboratoryDashboard from "./pages/LaboratoryDashboard";
import Prescriptions from "./pages/Prescriptions";
import Payments from "./pages/Payments";
import DrugStore from "./pages/DrugStore";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import type { UserRole } from "@/types/clinic";
import Consultations from "./pages/Consultations";
import OPDStock from "./pages/OPDStock";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function RoleRoute({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      
      {/* Common */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Reception */}
      <Route path="/patients" element={<RoleRoute roles={["receptionist", "opd"]}><Patients /></RoleRoute>} />
      <Route path="/appointments" element={<RoleRoute roles={["receptionist", "opd"]}><Appointments /></RoleRoute>} />
      <Route path="/payments" element={<RoleRoute roles={["receptionist"]}><Payments /></RoleRoute>} />

      {/* OPD */}
      <Route path="/prescriptions" element={<RoleRoute roles={["opd", "injection"]}><Prescriptions /></RoleRoute>} />
      <Route path="/consultations" element={<RoleRoute roles={["opd"]}><Consultations /></RoleRoute>} />
      <Route path="/opd-stock" element={<RoleRoute roles={["opd"]}><OPDStock /></RoleRoute>} />

      {/* Lab (split pages) */}
      <Route path="/opd/lab-requests" element={<RoleRoute roles={["opd"]}><OPDLabRequests /></RoleRoute>} />
      <Route path="/lab/dashboard" element={<RoleRoute roles={["laboratory"]}><LaboratoryDashboard /></RoleRoute>} />
      {/* Backward-compatible alias: redirect /lab-tests to role-specific page */}
      <Route path="/lab-tests" element={<RoleRoute roles={["opd", "laboratory"]}><LabTestsRouter /></RoleRoute>} />

      {/* Injection room */}
      <Route path="/injections" element={<RoleRoute roles={["injection"]}><Prescriptions /></RoleRoute>} />

      {/* Pharmacy/Drug store - optional access */}
      <Route path="/drug-store" element={<RoleRoute roles={["receptionist", "opd", "injection"]}><DrugStore /></RoleRoute>} />

      {/* Settings */}
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function LabTestsRouter() {
  const { user } = useAuth();
  if (user?.role === 'opd') return <Navigate to="/opd/lab-requests" replace />;
  if (user?.role === 'laboratory') return <Navigate to="/lab/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
