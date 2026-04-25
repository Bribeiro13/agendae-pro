import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatTel } from "@/lib/format";
import { addMinutes } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  inicioSugerido?: Date;
  profissionalSugerido?: string;
  onCriado?: () => void;
}

interface Servico    { id: string; nome: string; preco: number; duracao_minutos: number; profissional_id: string | null }
interface Profissional { id: string; nome: string }
interface Cliente   { id: string; nome: string; telefone: string }

const FORM_INICIAL = {
  servico_id: "",
  profissional_id: "",
  cliente_id: "",
  novoCliente: { nome: "", telefone: "" },
  usarNovoCliente: false,
  data: "",
  hora: "",
};

export default function NovoAgendamentoDialog({ open, onOpenChange, inicioSugerido, profissionalSugerido, onCriado }: Props) {
  const { org } = useAuth();
  const [servicos,   setServicos]   = useState<Servico[]>([]);
  const [profs,      setProfs]      = useState<Profissional[]>([]);
  const [clientes,   setClientes]   = useState<Cliente[]>([]);
  const [form,       setForm]       = useState(FORM_INICIAL);
  const [submitting, setSubmitting] = useState(false);

  // Evita buscar dados duplicados ao abrir/fechar rapidamente
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !org) return;
    const key = org.id;
    if (loadedFor.current === key) {
      // Só atualiza data/hora sem re-buscar dados
      const ini = inicioSugerido ?? new Date();
      setForm((f) => ({
        ...f,
        profissional_id: profissionalSugerido ?? f.profissional_id,
        data: ini.toISOString().slice(0, 10),
        hora: ini.toTimeString().slice(0, 5),
      }));
      return;
    }

    (async () => {
      const [{ data: s }, { data: p }, { data: c }] = await Promise.all([
        supabase.from("servicos").select("id, nome, preco, duracao_minutos, profissional_id").eq("organizacao_id", org.id).eq("ativo", true).order("nome"),
        supabase.from("profissionais").select("id, nome").eq("organizacao_id", org.id).eq("ativo", true).order("nome"),
        supabase.from("clientes").select("id, nome, telefone").eq("organizacao_id", org.id).order("nome").limit(200),
      ]);
      setServicos(s ?? []);
      setProfs(p ?? []);
      setClientes(c ?? []);

      const ini = inicioSugerido ?? new Date();
      setForm({
        ...FORM_INICIAL,
        profissional_id: profissionalSugerido ?? "",
        data: ini.toISOString().slice(0, 10),
        hora: ini.toTimeString().slice(0, 5),
      });
      loadedFor.current = key;
    })();
  }, [open, org, inicioSugerido, profissionalSugerido]);

  // Limpa cache ao trocar de org
  useEffect(() => {
    loadedFor.current = null;
  }, [org?.id]);

  const submeter = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    if (!form.servico_id || !form.profissional_id) return toast.error("Escolha serviço e profissional");
    if (!form.data || !form.hora) return toast.error("Defina data e hora");

    let clienteId = form.cliente_id;
    setSubmitting(true);

    try {
      if (form.usarNovoCliente || !clienteId) {
        const tel = form.novoCliente.telefone.replace(/\D/g, "");
        if (!form.novoCliente.nome.trim() || tel.length < 10) {
          return toast.error("Informe nome e telefone do cliente");
        }
        const existing = clientes.find((c) => c.telefone === tel);
        if (existing) {
          clienteId = existing.id;
        } else {
          const { data, error } = await supabase.from("clientes").insert({
            organizacao_id: org.id, nome: form.novoCliente.nome.trim(), telefone: tel,
          }).select().single();
          if (error || !data) return toast.error(error?.message ?? "Erro ao cadastrar cliente");
          clienteId = data.id;
          // Atualiza lista local sem re-buscar do servidor
          setClientes((prev) => [...prev, data as Cliente]);
        }
      }

      const serv = servicos.find((s) => s.id === form.servico_id)!;
      const inicio = new Date(`${form.data}T${form.hora}`);
      const fim    = addMinutes(inicio, serv.duracao_minutos);

      const { data: conflito } = await supabase.rpc("tem_conflito_horario", {
        _profissional_id: form.profissional_id,
        _inicio: inicio.toISOString(),
        _fim:    fim.toISOString(),
      });
      if (conflito) return toast.error("Conflito de horário com outro agendamento");

      const valor_sinal = Math.round((serv.preco * 0.3) * 100) / 100;
      const { error } = await supabase.from("agendamentos").insert({
        organizacao_id:  org.id,
        cliente_id:      clienteId,
        profissional_id: form.profissional_id,
        servico_id:      serv.id,
        inicio:          inicio.toISOString(),
        fim:             fim.toISOString(),
        preco_total:     serv.preco,
        valor_sinal,
        status: "confirmado",
      });
      if (error) return toast.error(error.message);

      toast.success("Agendamento criado");
      onOpenChange(false);
      onCriado?.();
    } finally {
      setSubmitting(false);
    }
  }, [org, form, servicos, clientes, onOpenChange, onCriado]);

  const toggleNovoCliente = useCallback(() => {
    setForm((f) => ({ ...f, usarNovoCliente: !f.usarNovoCliente, cliente_id: "" }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo agendamento</DialogTitle></DialogHeader>
        <form onSubmit={submeter} className="space-y-4">
          <div className="space-y-2">
            <Label>Serviço</Label>
            <Select value={form.servico_id} onValueChange={(v) => {
              const s = servicos.find((x) => x.id === v);
              setForm((f) => ({ ...f, servico_id: v, profissional_id: s?.profissional_id || f.profissional_id }));
            }}>
              <SelectTrigger><SelectValue placeholder="Escolha o serviço" /></SelectTrigger>
              <SelectContent>
                {servicos.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select value={form.profissional_id} onValueChange={(v) => setForm((f) => ({ ...f, profissional_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Escolha o profissional" /></SelectTrigger>
              <SelectContent>
                {profs.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="d">Data</Label>
              <Input id="d" type="date" required value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="h">Hora</Label>
              <Input id="h" type="time" required value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cliente</Label>
              <button type="button" className="text-xs text-primary underline-offset-2 hover:underline" onClick={toggleNovoCliente}>
                {form.usarNovoCliente ? "Escolher existente" : "Novo cliente"}
              </button>
            </div>
            {form.usarNovoCliente ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nome"
                  value={form.novoCliente.nome}
                  onChange={(e) => setForm((f) => ({ ...f, novoCliente: { ...f.novoCliente, nome: e.target.value } }))}
                />
                <Input
                  placeholder="(11) 99999-0000"
                  value={form.novoCliente.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, novoCliente: { ...f.novoCliente, telefone: formatTel(e.target.value) } }))}
                />
              </div>
            ) : (
              <Select value={form.cliente_id} onValueChange={(v) => setForm((f) => ({ ...f, cliente_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={clientes.length ? "Escolha o cliente" : "Nenhum cliente — cadastre um novo"} />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} · {c.telefone}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="gradient" disabled={submitting}>{submitting ? "Criando..." : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
