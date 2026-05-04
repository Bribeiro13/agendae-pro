import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlano, type Plano } from "@/hooks/usePlano";

const PLANOS: Array<{
  id: Plano;
  nome: string;
  preco: string;
  icon: typeof Zap;
  features: string[];
}> = [
  {
    id: "free",
    nome: "Free",
    preco: "R$ 0",
    icon: Sparkles,
    features: ["Agendamento básico", "1 profissional", "Link público padrão"],
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 49/mês",
    icon: Zap,
    features: ["Tudo do Free", "Relatórios completos", "Lembretes automáticos"],
  },
  {
    id: "premium",
    nome: "Premium",
    preco: "R$ 99/mês",
    icon: Crown,
    features: ["Tudo do Pro", "WhatsApp ilimitado", "Profissionais ilimitados", "Suporte prioritário"],
  },
];

export default function Billing() {
  const { org } = useAuth();
  const { info, refresh, isLoading } = usePlano();
  const [agindo, setAgindo] = useState<Plano | "cancelar" | null>(null);

  const planoAtual = info?.plano ?? "free";
  const status = info?.status_assinatura ?? "inativo";

  async function simularPagamento(plano: Plano) {
    if (!org?.id) return;
    setAgindo(plano);
    const { error } = await supabase.rpc("simular_pagamento", {
      _organizacao_id: org.id,
      _plano: plano,
      _dias: 30,
    });
    setAgindo(null);
    if (error) return toast.error(error.message);
    toast.success(`Plano ${plano.toUpperCase()} ativado! (modo simulação)`);
    refresh();
  }

  async function cancelar() {
    if (!org?.id) return;
    setAgindo("cancelar");
    const { error } = await supabase.rpc("simular_cancelamento", { _organizacao_id: org.id });
    setAgindo(null);
    if (error) return toast.error(error.message);
    toast.success("Assinatura cancelada. Você voltou ao plano Free.");
    refresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold">Planos e cobrança</h1>
        <p className="text-muted-foreground">
          Modo de simulação ativo — sem cobrança real. Use para testar o controle de acesso.
        </p>
      </header>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Plano atual</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-display text-2xl font-bold capitalize">{planoAtual}</span>
            <Badge variant={status === "ativo" ? "default" : "secondary"}>{status}</Badge>
          </div>
          {info?.plano_expira_em && (
            <p className="mt-1 text-xs text-muted-foreground">
              Expira em {new Date(info.plano_expira_em).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
        {planoAtual !== "free" && (
          <Button variant="outline" onClick={cancelar} disabled={agindo !== null}>
            {agindo === "cancelar" ? "Cancelando..." : "Cancelar assinatura"}
          </Button>
        )}
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        {PLANOS.map((p) => {
          const Icon = p.icon;
          const ativo = planoAtual === p.id && status === "ativo";
          const destaque = p.id === "pro";
          return (
            <Card
              key={p.id}
              className={`relative flex flex-col gap-5 border-border/60 p-6 ${
                destaque ? "ring-2 ring-primary" : ""
              } ${ativo ? "border-primary" : ""}`}
            >
              {ativo && (
                <Badge className="absolute right-4 top-4">Ativo</Badge>
              )}
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{p.nome}</h3>
                  <p className="text-sm text-muted-foreground">{p.preco}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {p.id === "free" ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano básico
                  </Button>
                ) : (
                  <Button
                    variant={destaque ? "gradient" : "default"}
                    className="w-full"
                    disabled={isLoading || ativo || agindo !== null}
                    onClick={() => simularPagamento(p.id)}
                  >
                    {agindo === p.id
                      ? "Ativando..."
                      : ativo
                      ? "Plano atual"
                      : `Simular pagamento ${p.nome}`}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
