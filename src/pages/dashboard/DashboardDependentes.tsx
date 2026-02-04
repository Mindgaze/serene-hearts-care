import { useState } from "react";
import { 
  Users, 
  Plus, 
  Mail, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export default function DashboardDependentes() {
  const { user, plan } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [newDependente, setNewDependente] = useState({
    full_name: "",
    email: "",
    cpf: "",
  });

  // Fetch dependentes
  const { data: dependentes = [], isLoading } = useQuery({
    queryKey: ["dependentes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("titular_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!user,
  });

  const maxDependentes = plan?.max_dependents || 0;
  const canAddMore = dependentes.length < maxDependentes;

  // Add dependente mutation
  const addMutation = useMutation({
    mutationFn: async (data: typeof newDependente) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).slice(-12) + "A1!", // Temp password
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: window.location.origin + "/login",
        },
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");
      
      // Update profile to be dependente
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          titular_id: user.id,
          role: "dependente",
          cpf: data.cpf.replace(/\D/g, "") || null,
        })
        .eq("id", authData.user.id);
      
      if (profileError) throw profileError;
      
      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependentes"] });
      queryClient.invalidateQueries({ queryKey: ["dependents-count"] });
      setIsDialogOpen(false);
      setNewDependente({ full_name: "", email: "", cpf: "" });
      toast({
        title: "Dependente adicionado",
        description: "Um email foi enviado para o dependente acessar a conta.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove dependente mutation
  const removeMutation = useMutation({
    mutationFn: async (dependenteId: string) => {
      // Remove titular_id to unlink (can't delete auth user from client)
      const { error } = await supabase
        .from("profiles")
        .update({ titular_id: null, role: "titular" })
        .eq("id", dependenteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependentes"] });
      queryClient.invalidateQueries({ queryKey: ["dependents-count"] });
      setDeleteDialogId(null);
      toast({
        title: "Dependente removido",
        description: "O dependente foi desvinculado do seu plano.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDependente.full_name || !newDependente.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e email do dependente.",
        variant: "destructive",
      });
      return;
    }
    addMutation.mutate(newDependente);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Dependentes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os dependentes do seu plano
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canAddMore}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Dependente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Adicionar Dependente</DialogTitle>
                <DialogDescription>
                  O dependente receberá um email para acessar a conta
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Nome completo</label>
                  <Input
                    value={newDependente.full_name}
                    onChange={(e) => setNewDependente(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Nome do dependente"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newDependente.email}
                    onChange={(e) => setNewDependente(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">CPF (opcional)</label>
                  <Input
                    value={newDependente.cpf}
                    onChange={(e) => setNewDependente(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Limit Status */}
      <Card className={!canAddMore ? "border-amber-200 bg-amber-50" : ""}>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            canAddMore ? "bg-primary/10" : "bg-amber-100"
          }`}>
            <Users className={`h-6 w-6 ${canAddMore ? "text-primary" : "text-amber-600"}`} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {dependentes.length} de {maxDependentes} dependentes
            </p>
            <p className="text-sm text-muted-foreground">
              {canAddMore 
                ? `Você pode adicionar mais ${maxDependentes - dependentes.length} dependente(s)`
                : "Você atingiu o limite do seu plano"}
            </p>
          </div>
          {!canAddMore && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
              <AlertCircle className="h-3 w-3" />
              Limite atingido
            </span>
          )}
        </CardContent>
      </Card>

      {/* Dependentes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : dependentes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-medium text-foreground">Nenhum dependente</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione dependentes para que eles também tenham acesso ao plano
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dependentes.map((dep) => (
            <Card key={dep.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-medium text-primary">
                        {dep.full_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{dep.full_name}</CardTitle>
                      <CardDescription className="text-xs">Dependente</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteDialogId(dep.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {dep.cpf && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono text-xs">
                      CPF: ***.***.***-{dep.cpf.slice(-2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-success">Carteirinha disponível</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover dependente?</AlertDialogTitle>
            <AlertDialogDescription>
              O dependente será desvinculado do seu plano e perderá acesso aos benefícios.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDialogId && removeMutation.mutate(deleteDialogId)}
            >
              {removeMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
