import { useState } from "react";
import { IdCard, Download, Loader2, QrCode, Phone, Calendar, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { pdf } from "@react-pdf/renderer";
import { CarteirinhaPDF } from "@/components/carteirinha/CarteirinhaPDF";

export default function DashboardCarteirinha() {
  const { profile, plan, user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Format CPF for display (masked)
  const maskedCPF = profile?.cpf 
    ? `***.***.***-${profile.cpf.slice(-2)}`
    : "Não informado";

  // QR Code data
  const qrData = JSON.stringify({
    userId: user?.id,
    name: profile?.full_name,
    plan: plan?.name,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    checksum: btoa(`${user?.id}${Date.now()}`).slice(0, 8),
  });

  // Calculate validity (1 year from now)
  const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const validUntilFormatted = validUntil.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleDownload = async () => {
    if (!profile || !plan || !user) {
      toast({
        title: "Erro",
        description: "Dados incompletos para gerar a carteirinha.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const blob = await pdf(
        <CarteirinhaPDF
          fullName={profile.full_name}
          cpf={profile.cpf || ""}
          planName={plan.name}
          validUntil={validUntilFormatted}
          qrData={qrData}
          userId={user.id}
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carteirinha-serenidade-${profile.full_name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Carteirinha gerada!",
        description: "O PDF foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Carteirinha Digital
        </h1>
        <p className="mt-1 text-muted-foreground">
          Sua identificação como membro do plano Serenidade
        </p>
      </div>

      {/* Card Preview */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          {/* Physical Card Preview */}
          <Card className="overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 text-white shadow-2xl">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between bg-stone-700/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <span className="font-display text-sm font-bold text-stone-800">S</span>
                  </div>
                  <span className="font-display text-lg font-semibold">Serenidade</span>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  {plan?.name || "Plano"}
                </span>
              </div>

              {/* Content */}
              <div className="flex gap-6 p-6">
                {/* Left - Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-400">Nome</p>
                    <p className="text-lg font-semibold">{profile?.full_name || "Usuário"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-400">CPF</p>
                      <p className="font-mono text-sm">{maskedCPF}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-stone-400">Validade</p>
                      <p className="text-sm">{validUntilFormatted}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-400">Central 24h</p>
                    <p className="text-sm font-medium">0800 123 4567</p>
                  </div>
                </div>

                {/* Right - QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="rounded-lg bg-white p-2">
                    <QRCodeSVG
                      value={qrData}
                      size={80}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="mt-2 text-center text-[10px] text-stone-400">
                    Escaneie para validar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={handleDownload}
          disabled={isGenerating || !profile?.cpf}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Baixar Carteirinha em PDF
            </>
          )}
        </Button>
      </div>

      {/* Info Notice */}
      {!profile?.cpf && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <IdCard className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">CPF não cadastrado</p>
              <p className="text-sm text-amber-700">
                Para gerar sua carteirinha, você precisa cadastrar seu CPF no perfil.
              </p>
              <Button variant="link" className="mt-2 h-auto p-0 text-amber-700 hover:text-amber-900" asChild>
                <a href="/dashboard/perfil">Atualizar perfil →</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Titular</p>
              <p className="font-medium text-foreground">{profile?.full_name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IdCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plano</p>
              <p className="font-medium text-foreground">{plan?.name || "Não definido"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Validade</p>
              <p className="font-medium text-foreground">{validUntilFormatted}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium text-success">Ativa</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
