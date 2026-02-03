import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const footerLinks = {
  institucional: [
    { name: "Sobre Nós", href: "/sobre" },
    { name: "Nossos Planos", href: "/planos" },
    { name: "Parceiros", href: "/parceiros" },
    { name: "Blog", href: "/blog" },
  ],
  suporte: [
    { name: "Central de Ajuda", href: "/ajuda" },
    { name: "Perguntas Frequentes", href: "/faq" },
    { name: "Fale Conosco", href: "/contato" },
    { name: "Área do Cliente", href: "/login" },
  ],
  legal: [
    { name: "Termos de Uso", href: "/termos" },
    { name: "Política de Privacidade", href: "/privacidade" },
    { name: "LGPD", href: "/lgpd" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container-wide py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand & Contact */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <span className="font-display text-lg font-semibold text-primary-foreground">S</span>
              </div>
              <span className="font-display text-xl font-semibold text-foreground">Serenidade</span>
            </Link>
            
            <p className="mt-4 text-sm text-muted-foreground">
              Cuidando de quem você ama com dignidade e respeito há mais de 30 anos.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="tel:0800-123-4567"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                0800 123 4567
              </a>
              <a
                href="mailto:contato@serenidade.com.br"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                contato@serenidade.com.br
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Atendimento 24 horas
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Av. da Paz, 1000 - Centro<br />São Paulo - SP</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Institucional</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.institucional.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Suporte</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.suporte.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} Serenidade Planos Funerários. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
