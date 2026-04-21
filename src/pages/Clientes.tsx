import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Search, Users2, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_LABEL, formatBRL } from "@/lib/format";

interface Cliente {
  id: string; nome: string; telefone: string; email: string | null;
  observacoes: string | null; criado_em: string;
}
interface HistoricoItem {
  id: string; inicio: string; status: string; preco_total: number;
  servicos: { nome: string } | null;
  profissionais: { nome: string } | null;
}

export default function Clientes() {
  const { org } = useAuth();
  const [items, setItems] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState<Cliente | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [carregandoHist, setCarregandoHist] = useState(false);

  useEffect(() => {
    if (!org) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("clientes")
        .select("*").eq("organizacao_id", org.id).order("nome");
      setItems(data ?? []);
      setLoading(false);
    })();
  }, [org]);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return items;
    return items.filter((c) =>
      c.nome.toLowerCase().includes(q) ||
      c.telefone.includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  }, [items, busca]);

  const abrir = async (c: Cliente) => {
    setAberto(c);
    setCarregandoHist(true);
    const { data } = await supabase.from("agendamentos")
      .select("id, inicio, status, preco_total, servicos(nome), profissionais(nome)")
      .eq("cliente_id", c.id).order("inicio", { ascending: false });
    setHistorico((data ?? []) as unknown as HistoricoItem[]);
    setCarregandoHist(false);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}.</p>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome, telefone ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <Card className="bento-card p-0">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <Users2 className="h-8 w-8 text-muted-foreground" />
              <p className="font-display text-lg font-semibold">{items.length === 0 ? "Nenhum cliente ainda" : "Nada encontrado"}</p>
              <p className="text-sm text-muted-foreground">
                {items.length === 0 ? "Os clientes aparecem aqui após o primeiro agendamento." : "Tente outro termo."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtrados.map((c) => (
                <li key={c.id}>
                  <button onClick={() => abrir(c)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-secondary/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-accent text-sm font-semibold text-accent-foreground">
                        {c.nome.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{c.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.telefone}{c.email ? ` · ${c.email}` : ""}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Sheet open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {aberto && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">{aberto.nome}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2 text-sm">
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{aberto.telefone}</p>
                {aberto.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{aberto.email}</p>}
                <p className="text-xs text-muted-foreground">Cliente desde {format(new Date(aberto.criado_em), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Histórico</h3>
                {carregandoHist ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : historico.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {historico.map((h) => {
                      const st = STATUS_LABEL[h.status];
                      return (
                        <li key={h.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{h.servicos?.nome ?? "—"}</p>
                            <Badge variant="outline" className={st?.cls}>{st?.label}</Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {format(new Date(h.inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            {h.profissionais?.nome ? ` · ${h.profissionais.nome}` : ""}
                          </p>
                          <p className="mt-1 text-xs font-medium">{formatBRL(h.preco_total)}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
