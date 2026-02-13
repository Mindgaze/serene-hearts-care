import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ArrowRight, Users, Star, Shield, Clock, Heart, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS, type PlanSlug } from "@/config/stripe";
import { toast } from "sonner";

const plans = [
  {
    slug: "individual" as PlanSlug,
    name: "Individual",
    price: 89.90,
    description: "Ideal para quem busca proteção individual com cobertura essencial",
    features: [
      "Assistência 24 horas",
      "Traslado até 100km",
      "Urna padrão",
      "Velório por 6 horas",
      "Carteirinha digital",
      "Suporte telefônico",
    ],
    maxDependents: 0,
  },
  {
    slug: "familiar" as PlanSlug,
    name: "Familiar",
    price: 149.90,
    description: "Proteção completa para você e sua família com benefícios exclusivos",
    features: [
      "Tudo do plano Individual",
      "Até 4 dependentes inclusos",
      "Traslado até 200km",
      "Urna intermediária",
      "Velório por 12 horas",
      "Velório online incluso",
      "Desconto em parceiros",
    ],
    maxDependents: 4,
    popular: true,
  },
  {
    slug: "gold" as PlanSlug,
    name: "Gold",
    price: 249.90,
    description: "Cobertura premium com serviços diferenciados e atendimento prioritário",
    features: [
      "Tudo do plano Familiar",
      "Até 6 dependentes inclusos",
      "Traslado ilimitado",
      "Urna premium",
      "Velório por 24 horas",
      "Floricultura inclusa",
      "Cremação opcional",
      "Atendimento prioritário",
    ],
    maxDependents: 6,
  },
  {
    slug: "platinum" as PlanSlug,
    name: "Platinum",
    price: 399.90,
    description: "O mais completo, com concierge dedicado e benefícios exclusivos",
    features: [
      "Tudo do plano Gold",
      "Até 10 dependentes inclusos",
      "Concierge dedicado",
      "Jazigo perpétuo",
      "Seguro de vida complementar",
      "Descontos exclusivos em parceiros",
      "Cerimonial personalizado",
      "Acompanhamento pós-serviço",
    ],
    maxDependents: 10,
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Cobertura Nacional",
    description: "Assistência em todo o território brasileiro",
  },
  {
    icon: Clock,
    title: "Carência Zero",
    description: "Para morte acidental desde o primeiro dia",
  },
  {
    icon: Heart,
    title: "Atendimento Humanizado",
    description: "Equipe treinada para momentos delicados",
  },
];

export default function Planos() {
  const { user, subscription } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const checkoutCancelled = searchParams.get("checkout") === "cancelled";

  const handleCheckout = async (slug: PlanSlug) => {
    if (!user) {
      toast.error("Faça login para contratar um plano");
      return;
    }

    const stripeConfig = STRIPE_PLANS[slug];
    if (!stripeConfig) return;

    setLoadingPlan(slug);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: stripeConfig.price_id },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao iniciar checkout";
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (slug: PlanSlug) => subscription.subscribed && subscription.planSlug === slug;

  return (
    <div className="py-12 md:py-16">
      {/* Header */}
      <div className="container-wide">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground">Nossos Planos</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Escolha o plano que melhor atende às necessidades da sua família. 
            Todos incluem assistência 24 horas e cobertura completa.
          </p>
          {checkoutCancelled && (
            <p className="mt-4 text-sm text-destructive">
              O checkout foi cancelado. Pode tentar novamente quando quiser.
            </p>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="container-wide mt-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
              <benefit.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{benefit.title}</p>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="container-wide mt-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const current = isCurrentPlan(plan.slug);
            return (
              <div
                key={plan.slug}
                className={`card-elegant relative flex flex-col p-6 transition-all duration-200 hover:shadow-lg ${
                  current
                    ? "border-success ring-2 ring-success"
                    : plan.popular
                    ? "border-primary ring-1 ring-primary"
                    : ""
                }`}
              >
                {current && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground">
                    <Check className="mr-1 h-3 w-3" />
                    Seu Plano
                  </Badge>
                )}
                {!current && plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    <Star className="mr-1 h-3 w-3" />
                    Mais escolhido
                  </Badge>
                )}

                <div className="mb-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {plan.name}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">/mês</span>
                  </div>
                  {plan.maxDependents > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Até {plan.maxDependents} dependentes
                    </div>
                  )}
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {current ? (
                  <Button variant="outline" disabled className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Plano Atual
                  </Button>
                ) : subscription.subscribed ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/financeiro">
                      Alterar plano
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleCheckout(plan.slug)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.slug ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {user ? "Contratar plano" : "Fazer login para contratar"}
                    {loadingPlan !== plan.slug && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="container-wide mt-16">
        <div className="card-elegant bg-secondary/30 p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Precisa de ajuda para escolher?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Nossos consultores estão prontos para ajudar você a encontrar o plano ideal. 
            Atendimento personalizado e sem compromisso.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a href="tel:0800-123-4567">
                <Phone className="mr-2 h-4 w-4" />
                0800 123 4567
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contato">Enviar mensagem</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
