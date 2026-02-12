import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email obrigatório", description: "Por favor, preencha seu email.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/redefinir-senha",
    });
    setIsLoading(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    setSent(true);
    toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada para redefinir a senha." });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="card-elegant p-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
              Recuperar Senha
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {sent
                ? "Enviámos um link para o seu email. Verifique a caixa de entrada e spam."
                : "Informe seu email para receber um link de recuperação."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          ) : (
            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Reenviar email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
