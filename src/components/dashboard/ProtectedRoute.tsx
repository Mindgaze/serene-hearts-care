import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireTitular?: boolean;
}

export function ProtectedRoute({ children, requireTitular = false }: ProtectedRouteProps) {
  const { user, isLoading, isTitular, isDependente } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect dependentes away from titular-only routes
  if (requireTitular && isDependente) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
