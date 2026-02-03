import { ExternalLink, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock data - será substituído por dados do Supabase
const mockPartners = [
  {
    id: "1",
    slug: "farma-vida",
    name: "Farma Vida",
    category: "farmacia",
    description: "Rede de farmácias com mais de 50 lojas em São Paulo",
    logoUrl: null,
    websiteUrl: "https://farmavida.com.br",
    discountText: "10% de desconto em medicamentos",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: "2",
    slug: "clinica-saude",
    name: "Clínica Saúde & Bem Estar",
    category: "clinica",
    description: "Centro médico especializado em diversas áreas da saúde",
    logoUrl: null,
    websiteUrl: "https://clinicasaude.com.br",
    discountText: "15% em consultas",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: "3",
    slug: "flores-do-campo",
    name: "Flores do Campo",
    category: "floricultura",
    description: "Floricultura especializada em arranjos para homenagens",
    logoUrl: null,
    websiteUrl: "https://floresdocampo.com.br",
    discountText: "20% em coroas e arranjos",
    city: "Campinas",
    state: "SP",
  },
  {
    id: "4",
    slug: "lab-diagnose",
    name: "Lab Diagnose",
    category: "laboratorio",
    description: "Laboratório de análises clínicas com tecnologia de ponta",
    logoUrl: null,
    websiteUrl: "https://labdiagnose.com.br",
    discountText: "25% em exames",
    city: "Santos",
    state: "SP",
  },
];

const categories = [
  { value: "all", label: "Todos" },
  { value: "farmacia", label: "Farmácias" },
  { value: "clinica", label: "Clínicas" },
  { value: "floricultura", label: "Floriculturas" },
  { value: "laboratorio", label: "Laboratórios" },
];

function getCategoryLabel(category: string) {
  const cat = categories.find((c) => c.value === category);
  return cat?.label || category;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Parceiros() {
  return (
    <div className="py-12 md:py-16">
      <div className="container-wide">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground">Rede de Parceiros</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Descontos exclusivos para clientes Serenidade em uma rede de parceiros credenciados
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={category.value === "all" ? "default" : "outline"}
              size="sm"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Partners Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockPartners.map((partner) => (
            <div
              key={partner.id}
              className="card-elegant flex flex-col overflow-hidden"
            >
              {/* Logo */}
              <div className="flex h-32 items-center justify-center bg-secondary">
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <span className="font-display text-3xl font-semibold text-muted-foreground/50">
                    {getInitials(partner.name)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{partner.name}</h3>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {getCategoryLabel(partner.category)}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {partner.description}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-success" />
                    <span className="font-medium text-success">{partner.discountText}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{partner.city}, {partner.state}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                    >
                      Visitar site
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-16">
          <div className="card-elegant bg-secondary/30 p-8 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Quer ser um parceiro?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Faça parte da nossa rede de parceiros e ofereça benefícios exclusivos 
              para milhares de famílias protegidas pela Serenidade.
            </p>
            <Button className="mt-6">Quero ser parceiro</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
