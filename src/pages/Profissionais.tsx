import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, UserCog } from "lucide-react";
import { toast } from "sonner";
import { formatTel } from "@/lib/format";

interface Profissional {
  id: string;
  nome: string;
  especialidade: string | null;
  telefone: string | null;
  ativo: boolean;
}

export default function Profissionais() {
  const { org } = useAuth();
  const [items, setItems] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", especialidade: "", telefone: "", ativo: true });

  const carregar = async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await supabase.from("profissionais").select("*")
      .eq("organizacao_id", org.id).order("nome");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [org]);

  const abrirNovo = () => {
    setEditId(null);
    setForm({ nome: "", especialidade: "", telefone: "", ativo: true });
    setOpen(true);
  };
  const abrirEditar = (p: Profissional) => {
    setEditId(p.id);
    setForm({ nome: p.nome, especialidade: p.especialidade ?? "", telefone: p.telefone ?? "", ativo: p.ativo });
    setOpen(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    const payload = {
      nome: form.nome.trim(),
      especialidade: form.especialidade.trim() || null,
      telefone: form.telefone.trim() || null,
      ativo: form.ativo,
      organizacao_id: org.id,
    };
    const { error } = editId
      ? await supabase.from("profissionais").update(payload).eq("id", editId)
      : await supabase.from("profissionais").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editId ? "Profissional atualizado" : "Profissional cadastrado");
    setOpen(false);
    carregar();
  };

  const toggleAtivo = async (p: Profissional) => {
    const { error } = await supabase.from("profissionais").update({ ativo: !p.ativo }).eq("id", p.id);
    if (error) return toast.error(error.message);
    carregar();
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Profissionais</h1>
            <p className="text-sm text-muted-foreground">Gerencie sua equipe.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" onClick={abrirNovo}><Plus className="h-4 w-4" /> Novo profissional</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editId ? "Editar profissional" : "Novo profissional"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={salvar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esp">Especialidade</Label>
                  <Input id="esp" value={form.especialidade} placeholder="Ex.: Cabeleireiro, Dermatologista"
                    onChange={(e) => setForm({ ...form, especialidade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tel">Telefone</Label>
                  <Input id="tel" value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: formatTel(e.target.value) })} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Ativo</p>
                    <p className="text-xs text-muted-foreground">Aparece para reservas</p>
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

        <Card className="bento-card p-0">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <UserCog className="h-8 w-8 text-muted-foreground" />
              <p className="font-display text-lg font-semibold">Nenhum profissional ainda</p>
              <p className="text-sm text-muted-foreground">Adicione sua equipe para começar a receber agendamentos.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                      {p.nome.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[p.especialidade, p.telefone].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={p.ativo ? "border-event-green/30 bg-event-green/10 text-event-green" : "border-border"}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Switch checked={p.ativo} onCheckedChange={() => toggleAtivo(p)} />
                    <Button variant="ghost" size="icon" onClick={() => abrirEditar(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
