import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RootLayout } from "@/components/layout/RootLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/dashboard/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import Index from "./pages/Index";
import Planos from "./pages/Planos";
import Obituario from "./pages/Obituario";
import Parceiros from "./pages/Parceiros";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import NotFound from "./pages/NotFound";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardPerfil from "./pages/dashboard/DashboardPerfil";
import DashboardDependentes from "./pages/dashboard/DashboardDependentes";
import DashboardFinanceiro from "./pages/dashboard/DashboardFinanceiro";
import DashboardCarteirinha from "./pages/dashboard/DashboardCarteirinha";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminObituarios from "./pages/admin/AdminObituarios";
import AdminParceiros from "./pages/admin/AdminParceiros";
import AdminUtilizadores from "./pages/admin/AdminUtilizadores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<RootLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/obituario" element={<Obituario />} />
              <Route path="/parceiros" element={<Parceiros />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="perfil" element={<DashboardPerfil />} />
              <Route
                path="dependentes"
                element={
                  <ProtectedRoute requireTitular>
                    <DashboardDependentes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="financeiro"
                element={
                  <ProtectedRoute requireTitular>
                    <DashboardFinanceiro />
                  </ProtectedRoute>
                }
              />
              <Route path="carteirinha" element={<DashboardCarteirinha />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="obituarios" element={<AdminObituarios />} />
              <Route path="parceiros" element={<AdminParceiros />} />
              <Route
                path="utilizadores"
                element={
                  <AdminRoute requireAdmin>
                    <AdminUtilizadores />
                  </AdminRoute>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
