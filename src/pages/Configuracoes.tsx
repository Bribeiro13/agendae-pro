import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { formatTel } from "@/lib/format";

export default function Configuracoes() {
  const { org, refreshOrg } = useAuth();
  const [form, setForm] = useState({ nome: "", telefone: "", endereco: "", percentual_sinal: 30, minutos_expiracao_pix: 30 });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!org) return;
    (async () => {
      const { data } = await supabase.from("organizacoes").select("*").eq("id", org.id).single();
      if (data) setForm({
        nome: data.nome,
        telefone: data.telefone ?? "",
        endereco: data.endereco ?? "",
        percentual_sinal: data.percentual_sinal,
        minutos_expiracao_pix: data.minutos_expiracao_pix,
      });
    })();
  }, [org]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setSalvando(true);
    const { error } = await supabase.from("organizacoes").update({
      nome: form.nome.trim(),
      telefone: form.telefone.trim() || null,
      endereco: form.endereco.trim() || null,
      percentual_sinal: form.percentual_sinal,
      minutos_expiracao_pix: form.minutos_expiracao_pix,
    }).eq("id", org.id);
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    refreshOrg();
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Dados do negócio e regras de pagamento.</p>
        </header>

        <Card className="bento-card">
          <form onSubmit={salvar} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do negócio</Label>
              <Input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tel">Telefone (WhatsApp)</Label>
                <Input id="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: formatTel(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Endereço</Label>
                <Input id="end" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center justify-between">
                <Label className="font-display text-sm font-semibold">Sinal via Pix</Label>
                <span className="font-display text-2xl font-bold gradient-text">{form.percentual_sinal}%</span>
              </div>
              <Slider min={0} max={100} step={5}
                value={[form.percentual_sinal]}
                onValueChange={([v]) => setForm({ ...form, percentual_sinal: v })} />
              <p className="text-xs text-muted-foreground">
                Cobrança antecipada exigida no momento da reserva. 0% desativa o Pix.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp">Tempo para pagar o Pix (minutos)</Label>
              <Input id="exp" type="number" min={5} max={240} step={5}
                value={form.minutos_expiracao_pix}
                onChange={(e) => setForm({ ...form, minutos_expiracao_pix: parseInt(e.target.value, 10) || 30 })} />
              <p className="text-xs text-muted-foreground">Após esse tempo sem pagamento, o horário é liberado.</p>
            </div>

            <Button type="submit" variant="gradient" disabled={salvando}>
              <Save className="h-4 w-4" /> {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </Card>

        <Card className="bento-card flex items-start gap-3">
          <div className="rounded-lg bg-secondary p-2"><SettingsIcon className="h-4 w-4" /></div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Webhook de Pix</p>
            <p>Aponte seu provedor (Mercado Pago, Asaas, Gerencianet) para esta URL:</p>
            <code className="mt-1 block break-all rounded-md bg-secondary px-2 py-1 text-xs">
              https://dpctqkvknwxuqmclugac.supabase.co/functions/v1/pix-webhook
            </code>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
