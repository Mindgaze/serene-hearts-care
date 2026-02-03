import { Link } from "react-router-dom";
import { Check, ArrowRight, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    slug: "individual",
    name: "Individual",
    price: 89.90,
    description: "Ideal para quem busca proteção individual",
    features: ["Assistência 24h", "Traslado até 100km", "Urna padrão", "Velório por 6h"],
    maxDependents: 0,
  },
  {
    slug: "familiar",
    name: "Familiar",
    price: 149.90,
    description: "Proteção completa para sua família",
    features: ["Tudo do Individual", "Até 4 dependentes", "Traslado até 200km", "Velório online"],
    maxDependents: 4,
    popular: true,
  },
  {
    slug: "gold",
    name: "Gold",
    price: 249.90,
    description: "Cobertura premium com benefícios exclusivos",
    features: ["Tudo do Familiar", "Até 6 dependentes", "Traslado ilimitado", "Floricultura inclusa"],
    maxDependents: 6,
  },
];

export function PlansPreview() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-wide">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground">
            Escolha o plano ideal para você
          </h2>
          <p className="mt-4 text-muted-foreground">
            Planos flexíveis que se adaptam às necessidades da sua família
          </p>
        </div>

        {/* Plans Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`card-elegant relative flex flex-col p-6 transition-all duration-200 hover:scale-[1.02] ${
                plan.popular ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  <Star className="mr-1 h-3 w-3" />
                  Mais escolhido
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
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

              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "default" : "outline"}
                asChild
                className="w-full"
              >
                <Link to={`/planos/${plan.slug}`}>
                  Ver detalhes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button variant="link" asChild>
            <Link to="/planos">
              Ver todos os planos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
