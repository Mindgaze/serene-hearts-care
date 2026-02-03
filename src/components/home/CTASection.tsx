import { useState } from "react";
import { Phone, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function CTASection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
    
    toast({
      title: "Solicitação enviada!",
      description: "Um consultor entrará em contato em breve.",
    });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container-wide">
        <div className="card-elegant overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Content */}
            <div className="p-8 lg:p-12">
              <h2 className="text-foreground">
                Fale com um consultor
              </h2>
              <p className="mt-4 text-muted-foreground">
                Receba um atendimento personalizado e encontre o plano ideal para sua família. 
                Sem compromisso.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ligue agora</p>
                  <a
                    href="tel:0800-123-4567"
                    className="text-lg font-semibold text-foreground hover:underline"
                  >
                    0800 123 4567
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-secondary/30 p-8 lg:p-12">
              {isSubmitted ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                    Obrigado pelo contato!
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Um de nossos consultores entrará em contato em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                      Nome completo
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        Solicitar contato
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Ao enviar, você concorda com nossa{" "}
                    <a href="/privacidade" className="underline hover:text-foreground">
                      Política de Privacidade
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
