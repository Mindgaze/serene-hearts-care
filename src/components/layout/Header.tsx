import { Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Início", href: "/" },
  { name: "Planos", href: "/planos" },
  { name: "Obituários", href: "/obituario" },
  { name: "Parceiros", href: "/parceiros" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container-wide flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="font-display text-lg font-semibold text-primary-foreground">S</span>
          </div>
          <span className="font-display text-xl font-semibold text-foreground">Serenidade</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <a
            href="tel:0800-123-4567"
            className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <Phone className="h-4 w-4" />
            0800 123 4567
          </a>
          
          <Button asChild className="hidden md:inline-flex">
            <Link to="/login">Área do Cliente</Link>
          </Button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Abrir menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-4">
              <Button asChild className="w-full">
                <Link to="/login">Área do Cliente</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
