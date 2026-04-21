import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { addDays, addMinutes, format, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sparkles, Clock, ArrowLeft, ArrowRight, Copy, CheckCircle2, Loader2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, formatTel } from "@/lib/format";

interface Org { id: string; nome: string; slug: string; telefone: string | null; endereco: string | null; percentual_sinal: number; minutos_expiracao_pix: number }
interface Servico { id: string; nome: string; descricao: string | null; preco: number; duracao_minutos: number; profissional_id: string | null }
interface Profissional { id: string; nome: string; especialidade: string | null }

const HORA_INICIO = 9;
const HORA_FIM = 19;
const PASSO_MIN = 30;

export default function ReservaPublica() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [org, setOrg] = useState<Org | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [agendamentos, setAgendamentos] = useState<Array<{ profissional_id: string; inicio: string; fim: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [servico, setServico] = useState<Servico | null>(null);
  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(startOfDay(addDays(new Date(), 0)));
  const [inicio, setInicio] = useState<Date | null>(null);
  const [cliente, setCliente] = useState({ nome: "", telefone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const [pagamento, setPagamento] = useState<{
    pagamento_id: string; valor_sinal: number; qr_code_texto: string; expira_em: string; status: string;
  } | null>(null);

  // Carrega org + catálogo
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: o } = await supabase.from("organizacoes").select("*").eq("slug", slug).maybeSingle();
      if (!o) { setErro("Estabelecimento não encontrado."); setLoading(false); return; }
      setOrg(o as Org);
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("servicos").select("id, nome, descricao, preco, duracao_minutos, profissional_id")
          .eq("organizacao_id", o.id).eq("ativo", true).order("nome"),
        supabase.from("profissionais").select("id, nome, especialidade")
          .eq("organizacao_id", o.id).eq("ativo", true).order("nome"),
      ]);
      setServicos(s ?? []);
      setProfissionais(p ?? []);
      setLoading(false);
    })();
  }, [slug]);

  // Carrega agenda do profissional para o dia
  useEffect(() => {
    if (!org || !profissional) return;
    const ini = startOfDay(diaSelecionado).toISOString();
    const fim = addDays(startOfDay(diaSelecionado), 1).toISOString();
    supabase.from("agendamentos")
      .select("profissional_id, inicio, fim")
      .eq("organizacao_id", org.id)
      .eq("profissional_id", profissional.id)
      .gte("inicio", ini).lt("inicio", fim)
      .in("status", ["pendente", "confirmado", "pago"])
      .then(({ data }) => setAgendamentos(data ?? []));
  }, [org, profissional, diaSelecionado]);

  // Polling do status do pagamento
  useEffect(() => {
    if (!pagamento || pagamento.status === "pago") return;
    const t = setInterval(async () => {
      const { data } = await supabase.from("pagamentos_pix")
        .select("status").eq("id", pagamento.pagamento_id).maybeSingle();
      if (data?.status && data.status !== pagamento.status) {
        setPagamento({ ...pagamento, status: data.status });
        if (data.status === "pago") toast.success("Pagamento confirmado! 🎉");
        if (data.status === "expirado") toast.error("Pix expirou. Faça uma nova reserva.");
      }
    }, 4000);
    return () => clearInterval(t);
  }, [pagamento]);

  const profissionaisDoServico = useMemo(() => {
    if (!servico) return profissionais;
    if (!servico.profissional_id) return profissionais;
    return profissionais.filter((p) => p.id === servico.profissional_id);
  }, [servico, profissionais]);

  const slotsDisponiveis = useMemo(() => {
    if (!servico || !profissional) return [];
    const out: Date[] = [];
    const base = startOfDay(diaSelecionado);
    const agora = new Date();
    for (let h = HORA_INICIO * 60; h + servico.duracao_minutos <= HORA_FIM * 60; h += PASSO_MIN) {
      const ini = addMinutes(base, h);
      const fim = addMinutes(ini, servico.duracao_minutos);
      if (isSameDay(ini, agora) && isBefore(ini, agora)) continue;
      const conflita = agendamentos.some((a) => {
        const ai = new Date(a.inicio); const af = new Date(a.fim);
        return isBefore(ini, af) && isAfter(fim, ai);
      });
      if (!conflita) out.push(ini);
    }
    return out;
  }, [servico, profissional, diaSelecionado, agendamentos]);

  const dias = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  const reservar = async () => {
    if (!org || !servico || !profissional || !inicio) return;
    setSubmitting(true);
    const tel = cliente.telefone.replace(/\D/g, "");
    const { data, error } = await supabase.rpc("reservar_horario_publico", {
      _organizacao_id: org.id,
      _profissional_id: profissional.id,
      _servico_id: servico.id,
      _cliente_nome: cliente.nome,
      _cliente_telefone: tel,
      _cliente_email: cliente.email || null,
      _inicio: inicio.toISOString(),
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    const r = data as { pagamento_id: string; valor_sinal: number; qr_code_texto: string; expira_em: string };
    if (org.percentual_sinal === 0) {
      // Sem cobrança Pix — exibe sucesso direto
      setStep(5);
      setPagamento({ ...r, status: "pago" });
    } else {
      setPagamento({ ...r, status: "aguardando" });
      setStep(5);
    }
  };

  const copiarPix = async () => {
    if (!pagamento) return;
    await navigator.clipboard.writeText(pagamento.qr_code_texto);
    toast.success("Pix copiado!");
  };

  // — confirmação de pagamento manual via webhook (ajuda no teste) —
  const simularPagamento = async () => {
    if (!pagamento) return;
    const { data } = await supabase.from("pagamentos_pix").select("txid").eq("id", pagamento.pagamento_id).single();
    if (!data) return;
    const url = `https://dpctqkvknwxuqmclugac.supabase.co/functions/v1/pix-webhook`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txid: data.txid }),
    });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gradient-soft"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (erro || !org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft p-6">
        <Card className="bento-card max-w-sm text-center">
          <p className="font-display text-lg font-semibold">Página não encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">{erro ?? "Verifique o link com o estabelecimento."}</p>
        </Card>
      </div>
    );
  }

  const valorSinal = servico ? (servico.preco * org.percentual_sinal) / 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-soft pb-12">
      {/* Header */}
      <header className="bg-gradient-sidebar px-4 py-6 text-sidebar-accent-foreground">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold">Agendae</span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold leading-tight">{org.nome}</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-sidebar-foreground">
            {org.endereco && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{org.endereco}</span>}
            {org.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{org.telefone}</span>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-6">
        {/* Stepper */}
        {step < 5 && (
          <div className="mb-5 flex items-center gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? "bg-gradient-primary" : "bg-border"}`} />
            ))}
          </div>
        )}

        {/* STEP 1 — Serviço */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-display text-xl font-semibold">Escolha o serviço</h2>
            {servicos.length === 0 && (
              <Card className="bento-card text-center text-sm text-muted-foreground">Nenhum serviço disponível ainda.</Card>
            )}
            {servicos.map((s) => (
              <button key={s.id} onClick={() => { setServico(s); setProfissional(null); setInicio(null); setStep(2); }}
                className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-elevated">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{s.nome}</p>
                    {s.descricao && <p className="line-clamp-2 text-xs text-muted-foreground">{s.descricao}</p>}
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {s.duracao_minutos} min
                    </p>
                  </div>
                  <span className="font-display text-lg font-bold gradient-text">{formatBRL(s.preco)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — Profissional */}
        {step === 2 && servico && (
          <div className="space-y-3 animate-fade-in">
            <button onClick={() => setStep(1)} className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowLeft className="h-3 w-3" /> {servico.nome}
            </button>
            <h2 className="font-display text-xl font-semibold">Escolha o profissional</h2>
            {profissionaisDoServico.map((p) => (
              <button key={p.id} onClick={() => { setProfissional(p); setInicio(null); setStep(3); }}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-elevated">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                  {p.nome.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.nome}</p>
                  {p.especialidade && <p className="truncate text-xs text-muted-foreground">{p.especialidade}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3 — Data e horário */}
        {step === 3 && servico && profissional && (
          <div className="space-y-4 animate-fade-in">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowLeft className="h-3 w-3" /> {profissional.nome}
            </button>
            <h2 className="font-display text-xl font-semibold">Quando?</h2>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {dias.map((d) => {
                const ativo = isSameDay(d, diaSelecionado);
                return (
                  <button key={d.toISOString()} onClick={() => setDiaSelecionado(d)}
                    className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-all ${
                      ativo ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow" : "border-border bg-card hover:border-primary/40"
                    }`}>
                    <span className="text-[10px] uppercase opacity-80">{format(d, "EEE", { locale: ptBR })}</span>
                    <span className="font-display text-lg font-bold">{format(d, "d")}</span>
                    <span className="text-[10px] opacity-80">{format(d, "MMM", { locale: ptBR })}</span>
                  </button>
                );
              })}
            </div>

            {slotsDisponiveis.length === 0 ? (
              <Card className="bento-card text-center text-sm text-muted-foreground">
                Sem horários disponíveis neste dia. Tente outro.
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slotsDisponiveis.map((s) => (
                  <button key={s.toISOString()} onClick={() => { setInicio(s); setStep(4); }}
                    className="rounded-lg border border-border bg-card py-2 text-sm font-medium transition-all hover:border-primary hover:bg-gradient-primary hover:text-primary-foreground">
                    {format(s, "HH:mm")}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Dados do cliente */}
        {step === 4 && servico && profissional && inicio && (
          <div className="space-y-4 animate-fade-in">
            <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowLeft className="h-3 w-3" /> {format(inicio, "dd/MM 'às' HH:mm", { locale: ptBR })}
            </button>
            <h2 className="font-display text-xl font-semibold">Seus dados</h2>

            <Card className="bento-card space-y-2 bg-secondary/40">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Resumo</p>
              <p className="font-medium">{servico.nome} · {servico.duracao_minutos}min</p>
              <p className="text-sm">com {profissional.nome}</p>
              <p className="text-sm capitalize">{format(inicio, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm">Valor total</span>
                <span className="font-display text-lg font-bold">{formatBRL(servico.preco)}</span>
              </div>
              {org.percentual_sinal > 0 && (
                <div className="flex items-center justify-between text-sm text-accent">
                  <span>Sinal via Pix ({org.percentual_sinal}%)</span>
                  <span className="font-semibold">{formatBRL(valorSinal)}</span>
                </div>
              )}
            </Card>

            <form onSubmit={(e) => { e.preventDefault(); reservar(); }} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="n">Nome</Label>
                <Input id="n" required value={cliente.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t">WhatsApp</Label>
                <Input id="t" required value={cliente.telefone} placeholder="(11) 99999-0000"
                  onChange={(e) => setCliente({ ...cliente, telefone: formatTel(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e">E-mail (opcional)</Label>
                <Input id="e" type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
              </div>
              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Reservando...</> : <>Confirmar reserva <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 5 — Pix / Sucesso */}
        {step === 5 && pagamento && servico && profissional && inicio && (
          <div className="animate-fade-in space-y-4">
            {pagamento.status === "pago" ? (
              <Card className="bento-card text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-accent shadow-soft">
                  <CheckCircle2 className="h-7 w-7 text-accent-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">Reserva confirmada!</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {format(inicio, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="mt-1 text-sm">{servico.nome} com {profissional.nome}</p>
                <p className="mt-4 text-xs text-muted-foreground">Você receberá um lembrete no WhatsApp 24h antes.</p>
              </Card>
            ) : pagamento.status === "expirado" ? (
              <Card className="bento-card text-center">
                <h2 className="font-display text-xl font-bold">Pix expirou</h2>
                <p className="mt-1 text-sm text-muted-foreground">O horário foi liberado. Faça uma nova reserva.</p>
                <Button variant="gradient" className="mt-4" onClick={() => { setStep(1); setPagamento(null); setInicio(null); }}>
                  Reservar novamente
                </Button>
              </Card>
            ) : (
              <Card className="bento-card">
                <Badge className="bg-event-amber/15 text-event-amber border-event-amber/30" variant="outline">
                  Aguardando pagamento
                </Badge>
                <h2 className="mt-3 font-display text-xl font-bold">Pague o sinal via Pix</h2>
                <p className="text-sm text-muted-foreground">
                  {formatBRL(pagamento.valor_sinal)} · expira em {format(new Date(pagamento.expira_em), "HH:mm")}
                </p>
                <div className="mt-4 flex justify-center rounded-2xl bg-white p-4 shadow-soft">
                  <QRCodeSVG value={pagamento.qr_code_texto} size={208} bgColor="#ffffff" fgColor="#0f172a" level="M" />
                </div>
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Pix copia e cola</p>
                <code className="mt-1 block break-all rounded-md bg-secondary px-3 py-2 text-xs">{pagamento.qr_code_texto}</code>
                <Button variant="outline" className="mt-2 w-full" onClick={copiarPix}>
                  <Copy className="h-4 w-4" /> Copiar código
                </Button>
                <Button variant="ghost" size="sm" className="mt-2 w-full text-xs text-muted-foreground" onClick={simularPagamento}>
                  (modo teste) Simular pagamento confirmado
                </Button>
              </Card>
            )}
          </div>
        )}
      </main>
      <footer className="mt-10 text-center text-xs text-muted-foreground">
        Reservas por <span className="font-semibold gradient-text">Agendae</span>
      </footer>
    </div>
  );
}
