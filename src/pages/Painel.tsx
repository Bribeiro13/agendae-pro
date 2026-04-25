import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, CircleDollarSign, Clock, TrendingUp, Users2 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProximoItem {
  id: string;
  inicio: string;
  cliente: string;
  servico: string;
  status: string;
}

interface Metricas {
  agendamentosHoje: number;
  receitaPrevista: number;
  sinaisConfirmados: number;
  pendentes: number;
  proximos: ProximoItem[];
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const statusBadge: Record<string, { label: string; cls: string }> = {
  pendente:   { label: "Pendente",   cls: "bg-event-amber/15 text-event-amber border-event-amber/30" },
  confirmado: { label: "Confirmado", cls: "bg-event-blue/15 text-event-blue border-event-blue/30" },
  pago:       { label: "Pago",       cls: "bg-event-green/15 text-event-green border-event-green/30" },
  cancelado:  { label: "Cancelado",  cls: "bg-destructive/15 text-destructive border-destructive/30" },
  expirado:   { label: "Expirado",   cls: "bg-muted text-muted-foreground border-border" },
  concluido:  { label: "Concluído",  cls: "bg-event-slate/15 text-event-slate border-event-slate/30" },
};

const METRICAS_VAZIAS: Metricas = {
  agendamentosHoje: 0, receitaPrevista: 0, sinaisConfirmados: 0, pendentes: 0, proximos: [],
};

export default function Painel() {
  const { org } = useAuth();
  const [m, setM] = useState<Metricas>(METRICAS_VAZIAS);
  const [loading, setLoading] = useState(true);

  const carregarMetricas = useCallback(async () => {
    if (!org) return;
    const inicio = startOfDay(new Date()).toISOString();
    const fim    = endOfDay(new Date()).toISOString();

    const { data } = await supabase
      .from("agendamentos")
      .select("id, inicio, status, preco_total, valor_sinal, clientes(nome), servicos(nome)")
      .eq("organizacao_id", org.id)
      .gte("inicio", inicio)
      .lte("inicio", fim)
      .order("inicio");

    const lista = data ?? [];
    const validos = lista.filter((a) => a.status !== "cancelado" && a.status !== "expirado");

    setM({
      agendamentosHoje:   validos.length,
      receitaPrevista:    validos.reduce((s, a) => s + Number(a.preco_total), 0),
      sinaisConfirmados:  lista
        .filter((a) => a.status === "pago" || a.status === "confirmado")
        .reduce((s, a) => s + Number(a.valor_sinal), 0),
      pendentes: lista.filter((a) => a.status === "pendente").length,
      proximos:  validos.slice(0, 5).map((a) => ({
        id:      a.id,
        inicio:  a.inicio,
        cliente: (a.clientes as { nome: string } | null)?.nome ?? "—",
        servico: (a.servicos as { nome: string } | null)?.nome ?? "—",
        status:  a.status,
      })),
    });
    setLoading(false);
  }, [org]);

  useEffect(() => {
    carregarMetricas();
  }, [carregarMetricas]);

  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <header>
        <p className="text-sm capitalize text-muted-foreground">{hoje}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Painel</h1>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          loading={loading}
          icon={<CalendarDays className="h-4 w-4 text-event-blue" />}
          iconBg="bg-event-blue/10"
          label="Agendamentos"
          badge="Hoje"
          value={String(m.agendamentosHoje)}
        />
        <MetricCard
          loading={loading}
          icon={<TrendingUp className="h-4 w-4 text-event-green" />}
          iconBg="bg-event-green/10"
          label="Receita do dia"
          badge="Previsto"
          value={formatBRL(m.receitaPrevista)}
        />
        <MetricCard
          loading={loading}
          icon={<CircleDollarSign className="h-4 w-4 text-accent" />}
          iconBg="bg-accent/10"
          label="Sinais confirmados"
          badge="Pix"
          value={formatBRL(m.sinaisConfirmados)}
        />
        <MetricCard
          loading={loading}
          icon={<Clock className="h-4 w-4 text-event-amber" />}
          iconBg="bg-event-amber/10"
          label="Pendentes"
          badge="Aguardando"
          value={String(m.pendentes)}
        />

        {/* Próximos agendamentos */}
        <Card className="bento-card md:col-span-2 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Próximos hoje</h2>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : m.proximos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum agendamento para hoje. Aproveite para divulgar seu link público!
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {m.proximos.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-center">
                      <span className="text-sm font-bold leading-none">
                        {format(new Date(a.inicio), "HH:mm")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.cliente}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.servico}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusBadge[a.status]?.cls}>
                    {statusBadge[a.status]?.label ?? a.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Dica */}
        <Card className="bento-card bg-gradient-primary text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">Dica</p>
          <p className="mt-2 font-display text-lg font-semibold leading-snug">
            Cobre 30% de sinal via Pix e reduza no-shows em até 70%.
          </p>
          <p className="mt-2 text-xs opacity-80">Configure em Configurações → Pagamentos.</p>
        </Card>
      </div>
    </div>
  );
}

// Componente extraído para evitar re-renders desnecessários
function MetricCard({
  loading, icon, iconBg, label, badge, value,
}: {
  loading: boolean;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  badge: string;
  value: string;
}) {
  return (
    <Card className="bento-card">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
        <Badge variant="secondary" className="text-xs">{badge}</Badge>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1 h-9 w-24 rounded-md" />
      ) : (
        <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      )}
    </Card>
  );
}
