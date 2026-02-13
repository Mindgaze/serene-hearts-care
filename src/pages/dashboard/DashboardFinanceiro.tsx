import { useState } from "react";
import {
  CreditCard,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Payment = Tables<"payments">;

const statusConfig = {
  pending: {
    label: "Pendente",
    variant: "outline" as const,
    icon: Clock,
    color: "text-amber-600",
  },
  paid: {
    label: "Pago",
    variant: "default" as const,
    icon: CheckCircle,
    color: "text-success",
  },
  overdue: {
    label: "Vencido",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "text-destructive",
  },
  cancelled: {
    label: "Cancelado",
    variant: "secondary" as const,
    icon: AlertCircle,
    color: "text-muted-foreground",
  },
};

export default function DashboardFinanceiro() {
  const { user, plan, subscription, isSubscriptionLoading } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });

  const pendingPayments = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
  const nextPayment = pendingPayments[0];

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erro ao abrir portal";
      toast.error(msg);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Financeiro
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe seus pagamentos e assinatura
          </p>
        </div>
        {subscription.subscribed && (
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Settings className="mr-2 h-4 w-4" />
            )}
            Gerir Assinatura
          </Button>
        )}
      </div>

      {/* Subscription Status Card */}
      <Card className={subscription.subscribed ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"}>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              subscription.subscribed ? "bg-success/10" : "bg-destructive/10"
            }`}>
              {isSubscriptionLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : subscription.subscribed ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <AlertCircle className="h-6 w-6 text-destructive" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {subscription.subscribed ? "Assinatura Ativa" : "Sem Assinatura"}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription.subscribed && subscription.subscriptionEnd
                  ? `Renova em ${format(new Date(subscription.subscriptionEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                  : "Contrate um plano para começar"}
              </p>
            </div>
          </div>
          {subscription.subscribed && subscription.planSlug && (
            <Badge variant="default" className="text-sm capitalize">
              Plano {subscription.planSlug}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximo Pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            {nextPayment ? (
              <>
                <p className="text-2xl font-bold text-foreground">
                  R$ {Number(nextPayment.amount).toFixed(2).replace(".", ",")}
                </p>
                <p className={`text-sm ${nextPayment.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                  {nextPayment.status === "overdue" ? "Vencido em " : "Vence em "}
                  {format(new Date(nextPayment.due_date), "dd/MM/yyyy")}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum pagamento pendente</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mensalidade do Plano</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              R$ {plan ? Number(plan.price).toFixed(2).replace(".", ",") : "0,00"}
            </p>
            <p className="text-sm text-muted-foreground">{plan?.name || "Sem plano"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pago</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              R$ {totalPaid.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-sm text-muted-foreground">
              {payments.filter((p) => p.status === "paid").length} pagamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Payment Action */}
      {nextPayment && (
        <Card
          className={
            nextPayment.status === "overdue"
              ? "border-destructive/50 bg-destructive/5"
              : "border-primary/50 bg-primary/5"
          }
        >
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  nextPayment.status === "overdue"
                    ? "bg-destructive/10"
                    : "bg-primary/10"
                }`}
              >
                <CreditCard
                  className={`h-6 w-6 ${
                    nextPayment.status === "overdue"
                      ? "text-destructive"
                      : "text-primary"
                  }`}
                />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {nextPayment.status === "overdue"
                    ? "Pagamento em atraso"
                    : "Próximo pagamento"}
                </p>
                <p
                  className={`text-sm ${
                    nextPayment.status === "overdue"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  Vencimento:{" "}
                  {format(
                    new Date(nextPayment.due_date),
                    "dd 'de' MMMM 'de' yyyy",
                    { locale: ptBR }
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {nextPayment.invoice_url && (
                <Button asChild>
                  <a
                    href={nextPayment.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Pagar Boleto
                  </a>
                </Button>
              )}
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Todos os seus pagamentos e boletos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium text-foreground">
                Nenhum pagamento
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Seus pagamentos aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const config = statusConfig[payment.status];
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.due_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          R${" "}
                          {Number(payment.amount)
                            .toFixed(2)
                            .replace(".", ",")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.paid_at
                            ? format(new Date(payment.paid_at), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.invoice_url &&
                              payment.status !== "paid" && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a
                                    href={payment.invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
