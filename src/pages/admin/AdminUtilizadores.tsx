import { useState, useEffect } from "react";
import { Search, Shield, UserCheck, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface UserWithRole extends Profile {
  admin_role?: string | null;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  titular: "Titular",
  dependente: "Dependente",
};

export default function AdminUtilizadores() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("none");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({ title: "Erro ao carregar utilizadores", description: profilesError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
      const userRoles = (roles || []).filter((r) => r.user_id === profile.id);
      const adminRole = userRoles.find((r) => r.role === "admin" || r.role === "editor");
      return {
        ...profile,
        admin_role: adminRole?.role || null,
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedRole(user.admin_role || "none");
    setDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    setSaving(true);

    // Remove existing admin/editor roles for this user
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", selectedUser.id)
      .in("role", ["admin", "editor"]);

    if (deleteError) {
      toast({ title: "Erro ao atualizar role", description: deleteError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Insert new role if not "none"
    if (selectedRole !== "none") {
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUser.id, role: selectedRole as "admin" | "editor" });

      if (insertError) {
        toast({ title: "Erro ao atribuir role", description: insertError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    toast({ title: "Role atualizada com sucesso" });
    setDialogOpen(false);
    fetchUsers();
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (u.cpf && u.cpf.includes(search))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Utilizadores</h1>
        <p className="text-sm text-muted-foreground">Gerir roles e permissões dos utilizadores</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Nenhum utilizador encontrado.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="card-elegant flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-muted-foreground">
                  {user.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {roleLabels[user.role] || user.role}
                    {user.cpf && ` • CPF: ${user.cpf}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.admin_role && (
                  <Badge
                    variant={user.admin_role === "admin" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {roleLabels[user.admin_role]}
                  </Badge>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEditRole(user)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Editar Role — {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label>Role Administrativa</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (apenas cliente)</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedRole === "admin"
                  ? "Acesso total: obituários, parceiros, gestão de utilizadores e base de dados."
                  : selectedRole === "editor"
                  ? "Acesso parcial: gestão de obituários e parceiros."
                  : "Sem acesso administrativo. Apenas área do cliente."}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveRole} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
