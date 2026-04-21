import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarCheck, QrCode, MessageCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user, org } = useAuth();
  const destino = user ? (org ? "/app" : "/onboarding") : "/auth";

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Agendae</span>
        </div>
        <Button variant="gradient" size="sm" asChild>
          <Link to={destino}>{user ? "Abrir painel" : "Entrar"} <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-12 text-center md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Feito para barbearias e clínicas no Brasil
        </span>
        <h1 className="mt-6 font-display text-5xl font-bold tracking-tight md:text-6xl">
          A agenda que <span className="gradient-text">cobra antes</span>
          <br />e elimina o no-show.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Agendamento online, sinal automático via Pix e lembretes no WhatsApp.
          Tudo em um só lugar, sem mensalidade alta.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="gradient" size="lg" asChild>
            <Link to={destino}>Começar grátis <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#recursos">Ver recursos</a>
          </Button>
        </div>
      </section>

      {/* Bento de features */}
      <section id="recursos" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: CalendarCheck, t: "Agenda visual", d: "Visões diária e semanal com detecção automática de conflitos." },
            { icon: QrCode, t: "Sinal via Pix", d: "QR code gerado na hora. Se não pagar, o horário é liberado." },
            { icon: MessageCircle, t: "Lembretes WhatsApp", d: "Avisos automáticos 24h antes via Evolution API ou Z-API." },
          ].map((f) => (
            <div key={f.t} className="bento-card">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Agendae · Micro-SaaS de agendamento
      </footer>
    </div>
  );
}
