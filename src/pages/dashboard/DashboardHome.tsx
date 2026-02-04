import { Link } from "react-router-dom";
import { 
  IdCard, 
  Users, 
  CreditCard, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardHome() {
  const { profile, plan, isTitular, user } = useAuth();

  // Fetch dependents count for titulares
  const { data: dependentsCount } = useQuery({
    queryKey: ["dependents-count", user?.id],
    queryFn: async () => {
      if (!isTitular || !user) return 0;
      
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("titular_id", user.id);
      
      return count || 0;
    },
    enabled: isTitular && !!user,
  });

  // Fetch next payment for titulares
  const { data: nextPayment } = useQuery({
    queryKey: ["next-payment", user?.id],
    queryFn: async () => {
      if (!isTitular || !user) return null;
      
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(1)
        .single();
      
      return data;
    },
    enabled: isTitular && !!user,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const quickActions = [
    {
      title: "Carteirinha Digital",
      description: "Acesse ou baixe sua carteirinha",
      icon: IdCard,
      href: "/dashboard/carteirinha",
      color: "bg-primary/10 text-primary",
    },
    ...(isTitular
      ? [
          {
            title: "Dependentes",
            description: `${dependentsCount || 0}/${plan?.max_dependents || 0} cadastrados`,
            icon: Users,
            href: "/dashboard/dependentes",
            color: "bg-blue-500/10 text-blue-600",
          },
          {
            title: "Financeiro",
            description: nextPayment 
              ? `Próximo: ${format(new Date(nextPayment.due_date), "dd/MM", { locale: ptBR })}`
              : "Nenhum boleto pendente",
            icon: CreditCard,
            href: "/dashboard/financeiro",
            color: "bg-emerald-500/10 text-emerald-600",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground lg:text-3xl">
          {getGreeting()}, {profile?.full_name?.split(" ")[0] || "Usuário"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isTitular 
            ? "Gerencie seu plano e acompanhe seus dependentes" 
            : "Acesse sua carteirinha e informações do plano"}
        </p>
      </div>

      {/* Plan Status Card */}
      {plan && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Seu Plano</CardTitle>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <CheckCircle className="h-3 w-3" />
                Ativo
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <p className="text-2xl font-semibold text-foreground">{plan.name}</p>
                <p className="text-sm text-muted-foreground">{plan.type}</p>
              </div>
              <div className="h-10 w-px bg-border hidden sm:block" />
              <div>
                <p className="text-sm text-muted-foreground">Mensalidade</p>
                <p className="text-lg font-semibold text-foreground">
                  R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                </p>
              </div>
              {isTitular && (
                <>
                  <div className="h-10 w-px bg-border hidden sm:block" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dependentes</p>
                    <p className="text-lg font-semibold text-foreground">
                      {dependentsCount || 0} de {plan.max_dependents}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependente Notice */}
      {!isTitular && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Você é um dependente</p>
              <p className="text-sm text-amber-700">
                Para questões financeiras ou alterações no plano, entre em contato com o titular da sua conta.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Acesso Rápido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Next Payment Alert (Titular only) */}
      {isTitular && nextPayment && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">Próximo Pagamento</p>
                <p className="text-sm text-amber-700">
                  Vencimento em {format(new Date(nextPayment.due_date), "dd 'de' MMMM", { locale: ptBR })} - 
                  R$ {Number(nextPayment.amount).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100">
              <Link to="/dashboard/financeiro">Ver boleto</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
