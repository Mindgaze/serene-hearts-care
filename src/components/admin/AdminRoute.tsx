import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AdminRoute({ children, requireAdmin = false }: AdminRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isAdminOrEditor, isLoading } = useAdminAuth();

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdminOrEditor) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
