import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export default function Onboarding() {
  const { user, org, loading, refreshOrg } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [telefone, setTelefone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (org) return <Navigate to="/app" replace />;

  const handleNome = (v: string) => {
    setNome(v);
    setSlug(slugify(v));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: orgData, error: orgErr } = await supabase
      .from("organizacoes")
      .insert({ nome, slug, telefone })
      .select()
      .single();
    if (orgErr || !orgData) {
      setSubmitting(false);
      return toast.error(orgErr?.message ?? "Erro ao criar negócio");
    }
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, organizacao_id: orgData.id, role: "dono" });
    setSubmitting(false);
    if (roleErr) return toast.error(roleErr.message);
    toast.success("Tudo pronto! Bem-vindo ao Agendae.");
    await refreshOrg();
    navigate("/app");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft p-6">
      <Card className="w-full max-w-lg border-border/60 p-8 shadow-elevated">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Vamos configurar seu negócio</h1>
            <p className="text-sm text-muted-foreground">Você poderá editar tudo depois.</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do negócio</Label>
            <Input id="nome" required value={nome} onChange={(e) => handleNome(e.target.value)} placeholder="Barbearia do João" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Link público</Label>
            <div className="flex items-center overflow-hidden rounded-md border border-input bg-background">
              <span className="border-r border-input bg-muted px-3 py-2 text-xs text-muted-foreground">
                agendae.app/r/
              </span>
              <input id="slug" required value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" placeholder="barbearia-do-joao" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tel">Telefone (WhatsApp)</Label>
            <Input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
          </div>
          <Button variant="gradient" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Criando..." : "Criar meu Agendae"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
