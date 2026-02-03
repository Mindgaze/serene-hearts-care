import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu email e senha.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bem-vindo(a)!",
      description: "Login realizado com sucesso.",
    });

    navigate("/dashboard");
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, preencha seu email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erro ao enviar link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Link enviado!",
      description: "Verifique seu email para acessar sua conta.",
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="card-elegant p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <span className="font-display text-xl font-semibold text-primary-foreground">S</span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
              Área do Cliente
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse sua conta para gerenciar seu plano
            </p>
          </div>

          {/* Toggle */}
          <div className="mt-8 flex rounded-lg bg-secondary p-1">
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                !isMagicLink
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMagicLink(false)}
            >
              Email e Senha
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                isMagicLink
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMagicLink(true)}
            >
              Link Mágico
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={isMagicLink ? handleMagicLink : handleEmailLogin}
            className="mt-6 space-y-4"
          >
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

            {!isMagicLink && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </label>
                  <Link
                    to="/recuperar-senha"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Carregando..."
              ) : isMagicLink ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar link de acesso
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem uma conta?{" "}
            <Link to="/cadastro" className="font-medium text-foreground hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
