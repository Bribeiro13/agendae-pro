import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Scissors, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";

interface Profissional { id: string; nome: string; ativo: boolean }
interface Servico {
  id: string; nome: string; descricao: string | null; preco: number;
  duracao_minutos: number; ativo: boolean; profissional_id: string | null;
  profissionais?: { nome: string } | null;
}

export default function Servicos() {
  const { org } = useAuth();
  const [items, setItems] = useState<Servico[]>([]);
  const [profs, setProfs] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "", preco: "", duracao: "30", profissional_id: "", ativo: true });

  const carregar = async () => {
    if (!org) return;
    setLoading(true);
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("servicos").select("*, profissionais(nome)").eq("organizacao_id", org.id).order("nome"),
      supabase.from("profissionais").select("id, nome, ativo").eq("organizacao_id", org.id).eq("ativo", true).order("nome"),
    ]);
    setItems((s ?? []) as unknown as Servico[]);
    setProfs(p ?? []);
    setLoading(false);
  };
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [org]);

  const abrirNovo = () => {
    setEditId(null);
    setForm({ nome: "", descricao: "", preco: "", duracao: "30", profissional_id: "", ativo: true });
    setOpen(true);
  };
  const abrirEditar = (s: Servico) => {
    setEditId(s.id);
    setForm({
      nome: s.nome, descricao: s.descricao ?? "",
      preco: String(s.preco), duracao: String(s.duracao_minutos),
      profissional_id: s.profissional_id ?? "", ativo: s.ativo,
    });
    setOpen(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    const preco = Number(form.preco.replace(",", "."));
    const dur = parseInt(form.duracao, 10);
    if (!preco || preco < 0) return toast.error("Preço inválido");
    if (!dur || dur < 5) return toast.error("Duração deve ser ao menos 5 min");
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      preco,
      duracao_minutos: dur,
      profissional_id: form.profissional_id || null,
      ativo: form.ativo,
      organizacao_id: org.id,
    };
    const { error } = editId
      ? await supabase.from("servicos").update(payload).eq("id", editId)
      : await supabase.from("servicos").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editId ? "Serviço atualizado" : "Serviço cadastrado");
    setOpen(false);
    carregar();
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Serviços</h1>
            <p className="text-sm text-muted-foreground">Catálogo, preços e duração.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" onClick={abrirNovo}><Plus className="h-4 w-4" /> Novo serviço</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editId ? "Editar serviço" : "Novo serviço"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={salvar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Corte masculino" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input id="preco" required inputMode="decimal" value={form.preco}
                      onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="50,00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dur">Duração (min)</Label>
                    <Input id="dur" required type="number" min={5} step={5} value={form.duracao}
                      onChange={(e) => setForm({ ...form, duracao: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Profissional responsável</Label>
                  <Select value={form.profissional_id || "todos"} onValueChange={(v) => setForm({ ...form, profissional_id: v === "todos" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Qualquer profissional</SelectItem>
                      {profs.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Descrição</Label>
                  <Textarea id="desc" rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Ativo</p>
                    <p className="text-xs text-muted-foreground">Disponível para reservas</p>
                  </div>
                  <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" variant="gradient">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {loading ? (
          <Card className="bento-card p-8 text-center text-sm text-muted-foreground">Carregando...</Card>
        ) : items.length === 0 ? (
          <Card className="bento-card flex flex-col items-center gap-2 py-12 text-center">
            <Scissors className="h-8 w-8 text-muted-foreground" />
            <p className="font-display text-lg font-semibold">Nenhum serviço cadastrado</p>
            <p className="text-sm text-muted-foreground">Cadastre seus serviços para abrir reservas online.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((s) => (
              <Card key={s.id} className="bento-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg font-semibold">{s.nome}</h3>
                      {!s.ativo && <Badge variant="outline" className="text-xs">inativo</Badge>}
                    </div>
                    {s.descricao && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.descricao}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-display text-xl font-bold gradient-text">{formatBRL(s.preco)}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {s.duracao_minutos} min
                      </span>
                    </div>
                    {s.profissionais?.nome && (
                      <p className="mt-2 text-xs text-muted-foreground">com {s.profissionais.nome}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => abrirEditar(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
