import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addDays, addWeeks, endOfDay, endOfWeek, format, isSameDay,
  startOfDay, startOfWeek, subDays, subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarRange, Plus } from "lucide-react";
import NovoAgendamentoDialog from "@/components/agenda/NovoAgendamentoDialog";

type Vista = "dia" | "semana";

interface Agendamento {
  id: string;
  inicio: string;
  fim: string;
  status: string;
  cliente_id: string;
  profissional_id: string;
  clientes: { nome: string } | null;
  servicos: { nome: string } | null;
  profissionais: { nome: string } | null;
}

const HORA_INICIO = 8;
const HORA_FIM = 21;
const SLOT_PX = 60;

// Memoizado fora do componente — não recriado a cada render
const corPorStatus = (s: string) => {
  switch (s) {
    case "pago":       return "bg-event-green/15 border-event-green text-event-green";
    case "confirmado": return "bg-event-blue/15 border-event-blue text-event-blue";
    case "pendente":   return "bg-event-amber/15 border-event-amber text-event-amber";
    case "cancelado":
    case "expirado":   return "bg-muted border-border text-muted-foreground line-through";
    default:           return "bg-event-slate/15 border-event-slate text-event-slate";
  }
};

// Horas calculadas uma vez — não re-computadas a cada render
const HORAS = Array.from({ length: HORA_FIM - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);

export default function Agenda() {
  const { org } = useAuth();
  const [vista, setVista]     = useState<Vista>("semana");
  const [refDate, setRefDate] = useState<Date>(() => new Date());
  const [items, setItems]     = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoAberto, setNovoAberto]   = useState(false);
  const [novoSugerido, setNovoSugerido] = useState<Date | undefined>();

  // Ref para cancelar fetch ao desmontar
  const abortRef = useRef<AbortController | null>(null);

  const intervalo = useMemo(() => {
    if (vista === "dia") return { ini: startOfDay(refDate), fim: endOfDay(refDate) };
    return {
      ini: startOfWeek(refDate, { weekStartsOn: 1 }),
      fim: endOfWeek(refDate, { weekStartsOn: 1 }),
    };
  }, [refDate, vista]);

  const dias = useMemo(() => {
    if (vista === "dia") return [intervalo.ini];
    return Array.from({ length: 7 }, (_, i) => addDays(intervalo.ini, i));
  }, [intervalo, vista]);

  const carregar = useCallback(async () => {
    if (!org) return;
    // Cancela fetch anterior se ainda em andamento
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    const { data } = await supabase
      .from("agendamentos")
      .select("id, inicio, fim, status, cliente_id, profissional_id, clientes(nome), servicos(nome), profissionais(nome)")
      .eq("organizacao_id", org.id)
      .gte("inicio", intervalo.ini.toISOString())
      .lte("inicio", intervalo.fim.toISOString())
      .order("inicio");

    setItems((data ?? []) as unknown as Agendamento[]);
    setLoading(false);
  }, [org, intervalo]);

  useEffect(() => {
    carregar();
    return () => { abortRef.current?.abort(); };
  }, [carregar]);

  const navegar = useCallback((dir: -1 | 1) => {
    setRefDate((d) =>
      vista === "dia"
        ? dir === 1 ? addDays(d, 1) : subDays(d, 1)
        : dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)
    );
  }, [vista]);

  const labelPeriodo = vista === "dia"
    ? format(refDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
    : `${format(intervalo.ini, "dd MMM", { locale: ptBR })} – ${format(intervalo.fim, "dd MMM, yyyy", { locale: ptBR })}`;

  const abrirNovoEmSlot = useCallback((dia: Date, hora: number) => {
    const d = new Date(dia);
    d.setHours(hora, 0, 0, 0);
    setNovoSugerido(d);
    setNovoAberto(true);
  }, []);

  const hoje = new Date();

  return (
    <div className="mx-auto max-w-7xl space-y-4 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm capitalize text-muted-foreground">{labelPeriodo}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRefDate(new Date())}>
            <CalendarRange className="h-4 w-4" /> Hoje
          </Button>
          <div className="flex overflow-hidden rounded-md border border-border">
            <Button variant="ghost" size="icon" className="rounded-none" onClick={() => navegar(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none border-l border-border" onClick={() => navegar(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={vista} onValueChange={(v) => setVista(v as Vista)}>
            <TabsList>
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="gradient" size="sm" onClick={() => { setNovoSugerido(undefined); setNovoAberto(true); }}>
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </div>
      </header>

      <Card className="overflow-hidden border-border/70 shadow-soft">
        {/* Header de dias */}
        <div
          className="grid border-b border-border bg-secondary/40"
          style={{ gridTemplateColumns: `64px repeat(${dias.length}, minmax(0, 1fr))` }}
        >
          <div />
          {dias.map((d) => {
            const isToday = isSameDay(d, hoje);
            return (
              <div key={d.toISOString()} className="border-l border-border px-3 py-2 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {format(d, "EEE", { locale: ptBR })}
                </p>
                <p className={`mt-0.5 font-display text-lg font-bold ${isToday ? "text-primary" : ""}`}>
                  {format(d, "d")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grade de horas */}
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `64px repeat(${dias.length}, minmax(0, 1fr))` }}
        >
          {/* Coluna de horas */}
          <div>
            {HORAS.map((h) => (
              <div key={h} className="relative h-[60px] border-b border-border pr-2 text-right">
                <span className="absolute -top-2 right-2 text-[11px] font-medium text-muted-foreground">
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colunas de dias */}
          {dias.map((dia) => {
            const eventosDoDia = items.filter((a) => isSameDay(new Date(a.inicio), dia));
            return (
              <div key={dia.toISOString()} className="relative border-l border-border">
                {HORAS.map((h) => (
                  <button
                    key={h}
                    onClick={() => abrirNovoEmSlot(dia, h)}
                    className="block h-[60px] w-full border-b border-border transition-colors hover:bg-secondary/40"
                  />
                ))}
                {eventosDoDia.map((a) => {
                  const ini = new Date(a.inicio);
                  const fim = new Date(a.fim);
                  const offsetMin = (ini.getHours() - HORA_INICIO) * 60 + ini.getMinutes();
                  const dur = Math.max(20, (fim.getTime() - ini.getTime()) / 60000);
                  if (offsetMin < 0 || offsetMin >= (HORA_FIM - HORA_INICIO + 1) * 60) return null;
                  return (
                    <div
                      key={a.id}
                      className={`absolute left-1 right-1 overflow-hidden rounded-lg border-l-4 px-2 py-1.5 text-xs shadow-soft transition-all hover:shadow-elevated cursor-pointer ${corPorStatus(a.status)}`}
                      style={{ top: (offsetMin / 60) * SLOT_PX, height: (dur / 60) * SLOT_PX - 2 }}
                    >
                      <p className="truncate font-semibold text-foreground">
                        {format(ini, "HH:mm")} · {a.clientes?.nome ?? "—"}
                      </p>
                      <p className="truncate text-[11px] opacity-80">{a.servicos?.nome ?? ""}</p>
                      {dur >= 60 && (
                        <p className="truncate text-[10px] opacity-70">com {a.profissionais?.nome ?? "—"}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { l: "Pago",       cls: "bg-event-green" },
          { l: "Confirmado", cls: "bg-event-blue" },
          { l: "Pendente",   cls: "bg-event-amber" },
          { l: "Cancelado",  cls: "bg-muted-foreground" },
        ].map((it) => (
          <Badge key={it.l} variant="outline" className="gap-1.5 border-border bg-card font-normal">
            <span className={`h-2 w-2 rounded-full ${it.cls}`} />
            {it.l}
          </Badge>
        ))}
        {loading && <span className="text-muted-foreground">Carregando...</span>}
      </div>

      <NovoAgendamentoDialog
        open={novoAberto}
        onOpenChange={setNovoAberto}
        inicioSugerido={novoSugerido}
        onCriado={carregar}
      />
    </div>
  );
}
