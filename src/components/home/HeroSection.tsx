import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Proteção Completa",
    description: "Cobertura para toda a família",
  },
  {
    icon: Clock,
    title: "Atendimento 24h",
    description: "Suporte quando você precisar",
  },
  {
    icon: Heart,
    title: "Cuidado e Respeito",
    description: "Tratamento humanizado",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-subtle">
      <div className="container-wide py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-success" />
            Mais de 50.000 famílias protegidas
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in text-foreground">
            Proteja quem você ama com{" "}
            <span className="text-primary">dignidade e serenidade</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Planos funerários pensados para oferecer tranquilidade no momento mais difícil. 
            Assistência 24 horas, velório online e rede de parceiros credenciados.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" asChild>
              <Link to="/planos">
                Conheça nossos planos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="tel:0800-123-4567">Falar com consultor</a>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-elegant flex items-start gap-4 p-6 transition-all duration-200"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
