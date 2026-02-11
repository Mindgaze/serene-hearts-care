import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AdminRole = "admin" | "editor";

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useAuth();
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAdminRole(null);
      setIsLoadingRole(false);
      return;
    }

    const fetchRole = async () => {
      setIsLoadingRole(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching admin role:", error);
        setAdminRole(null);
      } else {
        const roles = data?.map((r) => r.role) || [];
        if (roles.includes("admin")) {
          setAdminRole("admin");
        } else if (roles.includes("editor")) {
          setAdminRole("editor");
        } else {
          setAdminRole(null);
        }
      }
      setIsLoadingRole(false);
    };

    fetchRole();
  }, [user, authLoading]);

  return {
    adminRole,
    isAdmin: adminRole === "admin",
    isEditor: adminRole === "editor",
    isAdminOrEditor: adminRole === "admin" || adminRole === "editor",
    isLoading: authLoading || isLoadingRole,
  };
}
