import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");

  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate("/app");
  };

  const cadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { nome_completo: nome },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Vamos configurar seu negócio.");
    navigate("/onboarding");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Lado decorativo */}
      <div className="relative hidden overflow-hidden bg-gradient-sidebar p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-accent-foreground">Agendae</span>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="font-display text-4xl font-bold leading-tight text-sidebar-accent-foreground">
            Sua agenda <span className="bg-gradient-primary bg-clip-text text-transparent">inteligente</span>,
            sem furos no caixa.
          </h1>
          <p className="max-w-md text-sidebar-foreground">
            Gerencie horários, receba sinais via Pix e reduza no-shows na sua barbearia ou clínica.
          </p>
        </div>
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <p className="relative z-10 text-xs text-sidebar-foreground/60">© Agendae · feito para o Brasil</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-gradient-soft p-6">
        <Card className="w-full max-w-md border-border/60 p-8 shadow-elevated">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Agendae</span>
            </div>
          </div>
          <Tabs defaultValue="entrar">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="criar">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="entrar">
              <form onSubmit={entrar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-l">E-mail</Label>
                  <Input id="email-l" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-l">Senha</Label>
                  <Input id="senha-l" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
                </div>
                <Button variant="gradient" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="criar">
              <form onSubmit={cadastrar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João Silva" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-c">E-mail</Label>
                  <Input id="email-c" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-c">Senha</Label>
                  <Input id="senha-c" type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} />
                </div>
                <Button variant="gradient" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Criando..." : "Criar conta grátis"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
