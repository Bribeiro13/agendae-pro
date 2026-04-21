import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function LinkPublico() {
  const { org } = useAuth();
  const [copiado, setCopiado] = useState(false);
  if (!org) return null;
  const url = `${window.location.origin}/r/${org.slug}`;

  const copiar = async () => {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopiado(false), 1800);
  };

  const wppUrl = `https://wa.me/?text=${encodeURIComponent(`Agende seu horário em ${org.nome}: ${url}`)}`;

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight">Link público</h1>
          <p className="text-sm text-muted-foreground">Compartilhe para receber agendamentos online.</p>
        </header>

        <Card className="bento-card">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sua URL pública</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="flex-1 break-all rounded-md bg-secondary px-3 py-2 text-sm">{url}</code>
            <Button variant="outline" size="sm" onClick={copiar}>
              <Copy className="h-4 w-4" /> {copiado ? "Copiado" : "Copiar"}
            </Button>
            <Button variant="gradient" size="sm" asChild>
              <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Abrir</a>
            </Button>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bento-card flex flex-col items-center text-center">
            <h2 className="font-display text-lg font-semibold">QR Code</h2>
            <p className="mb-4 text-xs text-muted-foreground">Imprima ou poste nas redes sociais.</p>
            <div className="rounded-2xl bg-white p-4 shadow-soft">
              <QRCodeSVG value={url} size={192} bgColor="#ffffff" fgColor="#0f172a" level="M" />
            </div>
          </Card>

          <Card className="bento-card">
            <h2 className="font-display text-lg font-semibold">Compartilhar</h2>
            <p className="text-sm text-muted-foreground">Envie o link para seus clientes.</p>
            <div className="mt-4 space-y-2">
              <Button variant="accent" className="w-full" asChild>
                <a href={wppUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> Compartilhar no WhatsApp
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                Dica: cole esse link na bio do Instagram, no Google Meu Negócio e no rodapé do seu site.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
