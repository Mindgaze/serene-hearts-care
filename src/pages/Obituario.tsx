import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, MapPin, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data - será substituído por dados do Supabase
const mockObituaries = [
  {
    id: "1",
    slug: "maria-santos-2024",
    fullName: "Maria da Silva Santos",
    birthDate: "1945-03-15",
    deathDate: "2024-01-28",
    photoUrl: null,
    funeralLocation: "Memorial São Paulo - Sala 3",
    funeralDatetime: "2024-01-29T14:00:00",
    hasVideo: true,
  },
  {
    id: "2",
    slug: "jose-oliveira-2024",
    fullName: "José Carlos Oliveira",
    birthDate: "1952-07-22",
    deathDate: "2024-01-27",
    photoUrl: null,
    funeralLocation: "Capela do Morumbi",
    funeralDatetime: "2024-01-28T10:00:00",
    hasVideo: false,
  },
  {
    id: "3",
    slug: "ana-costa-2024",
    fullName: "Ana Paula Costa",
    birthDate: "1968-11-08",
    deathDate: "2024-01-26",
    photoUrl: null,
    funeralLocation: "Cemitério da Consolação",
    funeralDatetime: "2024-01-27T15:00:00",
    hasVideo: true,
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Obituario() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredObituaries = mockObituaries.filter((obituary) =>
    obituary.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-12 md:py-16">
      <div className="container-wide">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground">Obituários</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Homenageie a memória de quem partiu. Encontre informações sobre velórios e cerimônias.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-12">
          {filteredObituaries.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground">Nenhum obituário encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredObituaries.map((obituary) => (
                <Link
                  key={obituary.id}
                  to={`/obituario/${obituary.slug}`}
                  className="card-elegant group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg"
                >
                  {/* Photo / Initials */}
                  <div className="relative aspect-[4/3] bg-secondary">
                    {obituary.photoUrl ? (
                      <img
                        src={obituary.photoUrl}
                        alt={obituary.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-display text-4xl font-semibold text-muted-foreground/50">
                          {getInitials(obituary.fullName)}
                        </span>
                      </div>
                    )}
                    
                    {obituary.hasVideo && (
                      <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">
                        <Video className="mr-1 h-3 w-3" />
                        Velório Online
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {obituary.fullName}
                    </h3>
                    
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Faleceu em {formatDate(obituary.deathDate)}</span>
                      </div>
                      
                      {obituary.funeralLocation && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>{obituary.funeralLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="ghost" size="sm" className="w-full">
                        Ver homenagem
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredObituaries.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline">Carregar mais</Button>
          </div>
        )}
      </div>
    </div>
  );
}
