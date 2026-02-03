import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content:
      "Em um momento tão difícil, a Serenidade foi acolhedora e profissional. O velório online permitiu que familiares de outras cidades pudessem se despedir.",
    author: "Maria Silva",
    role: "Cliente há 5 anos",
    location: "São Paulo, SP",
  },
  {
    id: 2,
    content:
      "A transparência nos valores e o atendimento humanizado fizeram toda diferença. Recomendo a todos que buscam tranquilidade para suas famílias.",
    author: "João Santos",
    role: "Cliente há 3 anos",
    location: "Campinas, SP",
  },
  {
    id: 3,
    content:
      "O plano familiar nos deu segurança de que todos estão protegidos. A assistência 24 horas é um diferencial que valorizo muito.",
    author: "Ana Costa",
    role: "Cliente há 7 anos",
    location: "Santos, SP",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-secondary/50 py-16 md:py-24">
      <div className="container-wide">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-foreground">O que nossos clientes dizem</h2>
          <p className="mt-4 text-muted-foreground">
            Histórias de famílias que confiaram em nós nos momentos mais importantes
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="card-elegant flex flex-col p-6"
            >
              <Quote className="h-8 w-8 text-primary/20" />
              
              <blockquote className="mt-4 flex-1">
                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
              </blockquote>

              <div className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role} • {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
