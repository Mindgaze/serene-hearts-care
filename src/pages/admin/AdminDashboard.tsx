import { useEffect, useState } from "react";
import { Newspaper, Handshake, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminDashboard() {
  const { isAdmin } = useAdminAuth();
  const [stats, setStats] = useState({ obituaries: 0, partners: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [obits, partners] = await Promise.all([
        supabase.from("obituaries").select("id", { count: "exact", head: true }),
        supabase.from("partners").select("id", { count: "exact", head: true }),
      ]);

      let usersCount = 0;
      if (isAdmin) {
        const { count } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });
        usersCount = count || 0;
      }

      setStats({
        obituaries: obits.count || 0,
        partners: partners.count || 0,
        users: usersCount,
      });
    };

    fetchStats();
  }, [isAdmin]);

  const cards = [
    { title: "Obituários", value: stats.obituaries, icon: Newspaper, show: true },
    { title: "Parceiros", value: stats.partners, icon: Handshake, show: true },
    { title: "Utilizadores", value: stats.users, icon: Users, show: isAdmin },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Painel Administrativo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral do sistema
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards
          .filter((c) => c.show)
          .map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">{card.value}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
