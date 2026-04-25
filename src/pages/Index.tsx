import { Link } from "react-router-dom";
import { memo, useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CalendarDays, MessageCircle, QrCode, Smartphone, Clock, CreditCard,
  CheckCircle2, ArrowRight, Star, Check, X,
  Sparkles, ChevronDown, Bell, TrendingUp, Users, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/* =========================================================
   AGENDAE — Landing page (warm orange / charcoal, animated)
   ========================================================= */

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE },
  }),
};

export default function Index() {
  const { user, org } = useAuth();
  const destino = user ? (org ? "/app" : "/onboarding") : "/auth";
  const reduce  = useReducedMotion();

  return (
    <div className="min-h-screen bg-white text-[hsl(var(--ink))]">
      <Navbar destino={destino} user={!!user} />
      <Hero destino={destino} reduce={!!reduce} />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing destino={destino} />
      <Faq />
      <Cta destino={destino} />
      <Footer />
    </div>
  );
}

/* ---------- Navbar ---------- */
// memo evita re-render do navbar quando o estado interno não muda
const Navbar = memo(function Navbar({ destino, user }: { destino: string; user: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    // passive: true melhora performance de scroll no mobile
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "border-b border-white/5 bg-[hsl(var(--ink))]/25 backdrop-blur-xl supports-[backdrop-filter]:bg-[hsl(var(--ink))]/15"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 text-white transition-all duration-500 ease-out ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-[var(--shadow-brand)]">
            <CalendarDays className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Agendae</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#recursos" className="transition hover:text-white">Recursos</a>
          <a href="#como"     className="transition hover:text-white">Como Funciona</a>
          <a href="#planos"   className="transition hover:text-white">Planos</a>
          <a href="#faq"      className="transition hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="hidden text-sm text-white/80 transition hover:text-white sm:inline">
            {user ? "Painel" : "Entrar"}
          </Link>
          <Button asChild className="rounded-full bg-brand px-4 text-white shadow-[var(--shadow-brand)] hover:bg-brand/90">
            <Link to={destino}>Teste Grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
});

/* ---------- Hero ---------- */
// Estático durante a sessão — sem props dinâmicas mutáveis
const Hero = memo(function Hero({ destino, reduce }: { destino: string; reduce: boolean }) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--ink))] pb-20 pt-32 text-white md:pb-28 md:pt-36">
      {/* glows — will-change desnecessário aqui pois são estáticos */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-60" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Feito para Clínicas e Barbearias
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          >
            A agenda que o<br />
            <span className="text-brand">seu negócio</span> merece.
          </motion.h1>

          <motion.p
            initial="hidden" animate="show" custom={1} variants={fadeUp}
            className="mt-6 max-w-xl text-lg text-white/70"
          >
            Agendamentos online, lembretes automáticos via WhatsApp e
            recebimentos via Pix. Tudo em um único lugar, bonito e simples de usar.
          </motion.p>

          <motion.div
            initial="hidden" animate="show" custom={2} variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <Button
              asChild size="lg"
              className="group rounded-full bg-brand px-6 py-6 text-base font-semibold shadow-[var(--shadow-brand)] hover:bg-brand/90"
            >
              <Link to={destino}>
                Começar teste de 7 dias
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <span className="inline-flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              Sem cartão de crédito
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative"
        >
          <div className={reduce ? "" : "animate-float"}>
            <AgendaPreviewCard />
          </div>
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-transparent to-transparent blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
});

// Dados estáticos fora do componente — não recriados a cada render
const PREVIEW_ITEMS = [
  { time: "09:00", name: "João Pedro Souza",     svc: "Corte + Barba", price: "R$ 80" },
  { time: "10:30", name: "Dra. Camila Resende",  svc: "Consulta",      price: "R$ 250" },
  { time: "13:00", name: "Mariana Albuquerque",  svc: "Limpeza de Pele", price: "R$ 120" },
];

function AgendaPreviewCard() {
  return (
    <div className="rounded-3xl bg-white p-6 text-[hsl(var(--ink))] shadow-[var(--shadow-card-lg)]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Agenda de Hoje</h3>
          <p className="text-xs text-muted-foreground">Terça, 24 de Outubro</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Sparkles className="h-4 w-4" />
          </span>
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        {PREVIEW_ITEMS.map((it, i) => (
          <motion.div
            key={it.time}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/50 px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold tabular-nums text-muted-foreground">{it.time}</span>
              <div>
                <p className="text-sm font-semibold">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.svc}</p>
              </div>
            </div>
            <span className="text-sm font-semibold">{it.price}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Métricas / Resultados ---------- */
const METRICS = [
  { value: 2000, suffix: "+",  label: "Profissionais ativos",     hint: "Crescendo todo mês"        },
  { value: 30,   suffix: "%",  label: "Aumento médio no faturamento", hint: "Após 60 dias de uso"   },
  { value: 98,   suffix: "%",  label: "Redução de no-shows",      hint: "Com sinal via Pix"         },
  { value: 4.9,  suffix: "/5", label: "Avaliação dos clientes",   hint: "Mais de 800 reviews",  decimals: 1 },
];

function useCountUp(target: number, decimals = 0, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString("pt-BR");
}

function MetricCard({ m, i, inView }: { m: typeof METRICS[number]; i: number; inView: boolean }) {
  const display = useCountUp(m.value, m.decimals ?? 0, 1500 + i * 150, inView);
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      className="group relative flex flex-col items-start gap-2 rounded-2xl border border-border/70 bg-white/60 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand/30 hover:bg-white hover:shadow-[var(--shadow-soft)]"
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {display}
        </span>
        <span className="font-display text-2xl font-bold text-brand md:text-3xl">{m.suffix}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{m.label}</p>
      <p className="text-xs text-muted-foreground">{m.hint}</p>
    </motion.div>
  );
}

function SocialProof() {
  const [inView, setInView] = useState(false);
  return (
    <section className="relative overflow-hidden border-b border-border bg-white py-20">
      {/* glows decorativos */}
      <div className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-[100px]" />

      <motion.div
        initial="hidden"
        whileInView="show"
        onViewportEnter={() => setInView(true)}
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto max-w-6xl px-6"
      >
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <TrendingUp className="h-3.5 w-3.5 text-brand" />
            Resultados que falam por si
          </motion.span>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-5 font-display text-3xl font-bold leading-[1.15] md:text-4xl"
          >
            Negócios reais, <span className="gradient-text">números reais.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-3 text-base text-muted-foreground">
            Mais de 2.000 profissionais já transformaram a rotina da sua agenda.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {METRICS.map((m, i) => (
            <MetricCard key={m.label} m={m} i={i} inView={inView} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- Features (Bento) ---------- */
function Features() {
  return (
    <section id="recursos" className="relative overflow-hidden bg-gradient-to-b from-white via-secondary/30 to-white py-28">
      <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-brand/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-violet-500/[0.06] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]"
          >
            <Zap className="h-3.5 w-3.5 text-brand" />
            Recursos pensados nos detalhes
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 font-display text-4xl font-bold leading-[1.1] md:text-5xl">
            Tudo o que você precisa,
            <br />
            <span className="gradient-text">sem complicação.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-base text-muted-foreground">
            Cada detalhe foi desenhado para tornar o dia a dia do seu negócio mais leve, profissional e rentável.
          </motion.p>
        </motion.div>

        <div className="mt-16 grid auto-rows-[minmax(0,auto)] grid-cols-1 gap-5 md:grid-cols-12">
          {/* Row 1 — Hero WhatsApp (wide) + Pix (tall) */}
          <FeatureCard className="md:col-span-8" tone="emerald" pad="lg">
            <FeatureHeader icon={MessageCircle} tone="emerald" eyebrow="WhatsApp Automático" title="Lembretes que reduzem faltas em até 78%" desc="O Agendae conversa com seus clientes por você. Confirmações, lembretes 24h antes e mensagens de pós-atendimento — tudo automático." />
            <ChatThread />
          </FeatureCard>

          <FeatureCard className="md:col-span-4" tone="brand" pad="md">
            <FeatureHeader icon={QrCode} tone="brand" eyebrow="Pix Integrado" title="Cobre sinal antecipado" desc="Acabe com prejuízos de quem marca e não aparece." />
            <PixMockRich />
          </FeatureCard>

          {/* Row 2 — três cartões equilibrados */}
          <FeatureCard className="md:col-span-4" tone="violet" pad="md">
            <FeatureHeader icon={TrendingUp} tone="violet" eyebrow="Resultados reais" title="Mais receita, menos faltas" />
            <StatMock />
          </FeatureCard>

          <FeatureCard className="md:col-span-4" tone="sky" pad="md">
            <FeatureHeader icon={Smartphone} tone="sky" eyebrow="Link público" title="O cliente agenda sozinho" desc="Coloque no Instagram e receba reservas 24/7." />
            <PhoneMockRich />
          </FeatureCard>

          <FeatureCard className="md:col-span-4" tone="peach" pad="md">
            <FeatureHeader icon={Users} tone="brand" eyebrow="CRM simples" title="Conheça quem te procura" />
            <CrmMock />
          </FeatureCard>

          {/* Row 3 — Calendário largo */}
          <FeatureCard className="md:col-span-12" tone="lavender" pad="md">
            <FeatureHeader icon={CalendarDays} tone="violet" eyebrow="Agenda inteligente" title="Vários profissionais, uma visão fluida" desc="Sem chance de horários duplicados. Visual claro, conflitos detectados em tempo real." />
            <AgendaGridMock />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-2xl text-center"
    >
      <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold md:text-4xl">{title}</motion.h2>
      <motion.p variants={fadeUp} custom={1} className="mt-3 text-base text-muted-foreground">{desc}</motion.p>
    </motion.div>
  );
}

const TONE_BG: Record<string, string> = {
  emerald:  "bg-[hsl(var(--tint-mint))]",
  brand:    "bg-[hsl(var(--tint-peach))]",
  peach:    "bg-[hsl(var(--tint-peach))]",
  sky:      "bg-[hsl(var(--tint-sky))]",
  violet:   "bg-[hsl(var(--tint-lavender))]",
  lavender: "bg-[hsl(var(--tint-lavender))]",
};
const TONE_ICON: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-700",
  brand:   "bg-brand/15 text-brand",
  sky:     "bg-blue-500/15 text-blue-700",
  violet:  "bg-violet-500/15 text-violet-700",
};

function FeatureCard({ className = "", tone = "brand", pad = "md", children }: {
  className?: string; tone?: keyof typeof TONE_BG; pad?: "md" | "lg"; children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 ${TONE_BG[tone]} ${pad === "lg" ? "p-8 md:p-10" : "p-6 md:p-7"} shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60" />
      <div className="relative flex h-full flex-col">{children}</div>
    </motion.div>
  );
}

function FeatureHeader({ icon: Icon, tone, eyebrow, title, desc }: {
  icon: any; tone: keyof typeof TONE_ICON; eyebrow?: string; title: string; desc?: string;
}) {
  return (
    <div>
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${TONE_ICON[tone]}`}>
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      {eyebrow && <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>}
      <h3 className="mt-1.5 font-display text-xl font-bold leading-tight md:text-[1.4rem]">{title}</h3>
      {desc && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}

/* ---- Mocks ---- */

const CHAT_MSGS = [
  { from: "biz",    text: "Olá João! Confirmando seu corte amanhã às 14h no Studio Barba 💈", time: "09:12" },
  { from: "client", text: "Confirmado! Estarei aí 👍",                                          time: "09:14" },
  { from: "biz",    text: "Perfeito! Te esperamos ✨",                                           time: "09:14" },
];

function ChatThread() {
  return (
    <div className="mt-7 flex-1">
      <div className="relative mx-auto max-w-md rounded-2xl bg-white p-5 shadow-[var(--shadow-card-lg)]">
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Studio Barba</p>
              <p className="text-[10px] text-emerald-600">● online</p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">hoje</span>
        </div>
        <div className="space-y-2">
          {CHAT_MSGS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.25, duration: 0.45 }}
              className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-snug ${m.from === "client" ? "rounded-br-sm bg-emerald-500 text-white" : "rounded-bl-sm bg-secondary text-foreground"}`}>
                {m.text}
                <div className={`mt-0.5 text-right text-[9px] ${m.from === "client" ? "text-white/70" : "text-muted-foreground"}`}>{m.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// QR code fake com array estático — não recriado a cada render
const QR_CELLS = Array.from({ length: 81 }, (_, i) => (i * 13 + 7) % 17 > 8);

function PixMockRich() {
  return (
    <div className="mt-6 flex-1">
      <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sinal</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Pago</span>
        </div>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums">R$ 24,00</p>
        <div className="mt-3 grid grid-cols-9 grid-rows-9 gap-[2px] rounded-md bg-secondary/60 p-2">
          {QR_CELLS.map((filled, i) => (
            <span key={i} className={filled ? "rounded-[1px] bg-[hsl(var(--ink))]" : "bg-transparent"} />
          ))}
        </div>
      </div>
    </div>
  );
}

const STAT_BARS = [40, 55, 35, 70, 60, 85, 95];

function StatMock() {
  return (
    <div className="mt-6 flex-1">
      <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-2xl font-bold text-violet-700">+78%</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> vs. mês anterior
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">Comparecimento</p>
        <div className="mt-3 flex h-16 items-end gap-1.5">
          {STAT_BARS.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-300 to-violet-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const PHONE_SLOTS = ["09h", "10h", "11h", "14h", "15h", "16h"];

function PhoneMockRich() {
  return (
    <div className="mt-6 flex flex-1 justify-center">
      <div className="w-40 rounded-[1.6rem] border-[6px] border-[hsl(var(--ink))] bg-white p-2.5 shadow-[var(--shadow-card-lg)]">
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-muted" />
        <div className="rounded-lg bg-secondary/60 p-2">
          <p className="text-[9px] font-bold">Studio Barba</p>
          <p className="text-[8px] text-muted-foreground">Escolha um horário</p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {PHONE_SLOTS.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className={`rounded text-center text-[9px] font-semibold py-1 ${i === 3 ? "bg-brand text-white" : "bg-secondary text-foreground"}`}
            >
              {t}
            </motion.div>
          ))}
        </div>
        <div className="mt-2 rounded-md bg-brand py-1.5 text-center text-[9px] font-bold text-white">Confirmar</div>
      </div>
    </div>
  );
}

const CRM_PEOPLE = [
  { n: "Mariana A.", v: "12 visitas", c: "bg-rose-200 text-rose-800" },
  { n: "João Pedro", v: "8 visitas",  c: "bg-amber-200 text-amber-800" },
  { n: "Camila R.",  v: "5 visitas",  c: "bg-emerald-200 text-emerald-800" },
];

function CrmMock() {
  return (
    <div className="mt-6 flex-1 space-y-2">
      {CRM_PEOPLE.map((p, i) => (
        <motion.div
          key={p.n}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.1 }}
          className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-[var(--shadow-soft)]"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${p.c}`}>{p.n[0]}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{p.n}</p>
            <p className="text-[10px] text-muted-foreground">{p.v}</p>
          </div>
          <Star className="h-3.5 w-3.5 fill-brand text-brand" />
        </motion.div>
      ))}
    </div>
  );
}

const AGENDA_EVENTS = [
  { col: 0, top: 4,  h: 28, label: "Rafael — 09:00", c: "bg-violet-300/80 text-violet-900" },
  { col: 1, top: 14, h: 36, label: "Marcos — 10:00", c: "bg-blue-300/80 text-blue-900" },
  { col: 2, top: 8,  h: 24, label: "Beatriz — 09:30", c: "bg-emerald-300/80 text-emerald-900" },
  { col: 0, top: 50, h: 20, label: "João — 13:00",   c: "bg-amber-300/80 text-amber-900" },
  { col: 2, top: 46, h: 30, label: "Carla — 12:30",  c: "bg-rose-300/80 text-rose-900" },
];
const AGENDA_HOURS = ["09h", "10h", "11h", "12h", "13h", "14h"];
const AGENDA_LINES = [1, 2, 3, 4, 5];

function AgendaGridMock() {
  return (
    <div className="mt-6 flex-1">
      <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="mb-2 grid grid-cols-[28px_repeat(3,1fr)] gap-1.5 text-[10px] font-semibold text-muted-foreground">
          <span /><span className="text-center">Rafael</span><span className="text-center">Marcos</span><span className="text-center">Beatriz</span>
        </div>
        <div className="grid grid-cols-[28px_repeat(3,1fr)] gap-1.5">
          <div className="flex flex-col justify-between py-0.5 text-[9px] text-muted-foreground">
            {AGENDA_HOURS.map((h) => <span key={h}>{h}</span>)}
          </div>
          {[0, 1, 2].map((col) => (
            <div key={col} className="relative h-32 rounded-md bg-secondary/40">
              {AGENDA_LINES.map((l) => (
                <div key={l} className="absolute inset-x-0 border-t border-dashed border-border/60" style={{ top: `${l * 20}%` }} />
              ))}
              {AGENDA_EVENTS.filter((e) => e.col === col).map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleY: 0.6 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                  style={{ top: `${e.top}%`, height: `${e.h}%`, transformOrigin: "top" }}
                  className={`absolute inset-x-1 truncate rounded-md px-1.5 py-1 text-[9px] font-semibold shadow-sm ${e.c}`}
                >
                  {e.label}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- How it works ---------- */
const HOW_STEPS = [
  { icon: Smartphone,   title: "O Cliente Acessa",  desc: "Clica no link do seu Instagram ou WhatsApp." },
  { icon: Clock,        title: "Escolhe o Horário", desc: "Vê apenas os horários livres na sua agenda." },
  { icon: CreditCard,   title: "Paga o Sinal",      desc: "Faz um Pix na hora para garantir a reserva." },
  { icon: CheckCircle2, title: "Tudo Confirmado",   desc: "Horário salvo e lembrete agendado. Sem estresse." },
];

function HowItWorks() {
  return (
    <section id="como" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead title="Como funciona na prática" desc="Um fluxo perfeito que poupa seu tempo e passa profissionalismo para o seu cliente." />
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-7 hidden border-t border-dashed border-border md:block" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center"
              >
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white text-brand shadow-[var(--shadow-soft)]">
                  <s.icon className="h-5 w-5" />
                </div>
                <h4 className="mt-5 font-display text-sm font-bold">{i + 1}. {s.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
const TESTIMONIALS = [
  { txt: "Antes eu perdia horas respondendo WhatsApp e lidando com quem marcava e não ia. Com o sinal obrigatório via Pix, meu faturamento subiu 30%.", name: "Carlos Mendes",    role: "Proprietário, Mendes Barber", ini: "CM" },
  { txt: "A interface é muito clean e passa uma imagem premium para as minhas pacientes. O controle financeiro no final do dia é perfeito.",             name: "Dra. Juliana Silva", role: "Clínica de Estética",          ini: "DJS" },
  { txt: "Melhor investimento que fiz esse ano. A equipe toda usa no celular e a agenda nunca conflita. O suporte é rápido e humano.",                   name: "Roberto Alves",     role: "Estúdio RC",                   ini: "RA" },
];
const STARS = Array.from({ length: 5 }, (_, i) => i);

function Testimonials() {
  return (
    <section className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead title="Quem usa, recomenda" desc="Veja o que os proprietários de negócios dizem sobre o Agendae." />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex gap-0.5 text-brand">
                {STARS.map((j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">"{t.txt}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">{t.ini}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
const PLANS = [
  {
    name: "Essencial", desc: "Para o profissional autônomo", price: "39", cta: "Assinar Essencial", featured: false,
    features: [
      { ok: true,  t: "1 Profissional" },
      { ok: true,  t: "Agendamentos ilimitados" },
      { ok: true,  t: "Link de Reserva Público" },
      { ok: false, t: "Sem cobrança de Pix antecipado" },
      { ok: false, t: "Sem lembretes de WhatsApp" },
    ],
  },
  {
    name: "Profissional", desc: "O pacote completo para crescer", price: "79", cta: "Assinar Profissional", featured: true,
    features: [
      { ok: true, t: "Até 3 Profissionais" },
      { ok: true, t: "Tudo do plano Essencial" },
      { ok: true, t: "Cobrança de Sinal via Pix" },
      { ok: true, t: "Lembretes automáticos (WhatsApp)" },
      { ok: true, t: "Histórico de Clientes (CRM)" },
    ],
  },
  {
    name: "Estúdio", desc: "Para times maiores e clínicas", price: "149", cta: "Assinar Estúdio", featured: false,
    features: [
      { ok: true, t: "Profissionais ilimitados" },
      { ok: true, t: "Tudo do plano Profissional" },
      { ok: true, t: "Painel Financeiro Avançado" },
      { ok: true, t: "Relatórios de Desempenho" },
      { ok: true, t: "Suporte Prioritário" },
    ],
  },
];

function Pricing({ destino }: { destino: string }) {
  return (
    <section id="planos" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead title="Preço simples. Sem surpresas." desc="Escolha o plano ideal para o tamanho do seu negócio. Cancele quando quiser." />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl border p-7 ${p.featured ? "border-transparent bg-[hsl(var(--ink))] text-white shadow-[var(--shadow-card-lg)]" : "border-border bg-white shadow-[var(--shadow-soft)]"}`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Mais Popular</span>
              )}
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.featured ? "text-white/60" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold">R$ {p.price}</span>
                <span className={`text-sm ${p.featured ? "text-white/60" : "text-muted-foreground"}`}>/mês</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f.t} className="flex items-center gap-2.5 text-sm">
                    {f.ok
                      ? <Check className={`h-4 w-4 flex-shrink-0 ${p.featured ? "text-brand" : "text-emerald-600"}`} />
                      : <X className={`h-4 w-4 flex-shrink-0 ${p.featured ? "text-white/30" : "text-muted-foreground/50"}`} />
                    }
                    <span className={!f.ok ? "text-muted-foreground line-through opacity-70" : ""}>{f.t}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-7 w-full rounded-full ${p.featured ? "bg-brand text-white hover:bg-brand/90" : "bg-secondary text-foreground hover:bg-muted"}`}
              >
                <Link to={destino}>{p.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQ_ITEMS = [
  { q: "Como funciona a proteção contra faltas (no-show)?", a: "Você define um percentual (30%-50%) cobrado via Pix no momento do agendamento. Se o cliente não confirmar o pagamento, o horário é liberado automaticamente." },
  { q: "Existe risco de dois clientes marcarem o mesmo horário?", a: "Não. O Agendae detecta conflitos em tempo real no banco de dados, garantindo que cada slot seja exclusivo de um único cliente." },
  { q: "Os lembretes de WhatsApp são cobrados à parte?", a: "Estão inclusos a partir do plano Profissional. Você só paga a integração se quiser usar provedores oficiais como Z-API ou Evolution." },
  { q: "Posso usar no celular e no computador?", a: "Sim. O Agendae é 100% responsivo e funciona perfeitamente em qualquer dispositivo, sem precisar instalar app." },
  { q: "Como recebo o dinheiro do Pix?", a: "Os Pix caem direto na sua conta bancária cadastrada. O Agendae apenas registra e organiza os recebimentos no seu painel." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHead title="Perguntas Frequentes" desc="Tire suas dúvidas antes de começar." />
        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-white">
          {FAQ_ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} className={i > 0 ? "border-t border-border" : ""}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-secondary/50"
                >
                  <span className="text-sm font-semibold">{it.q}</span>
                  <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{it.a}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function Cta({ destino }: { destino: string }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[hsl(var(--ink))] px-8 py-16 text-center text-white md:px-16"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand/30 blur-[100px]" />
          <div className="pointer-events-none absolute -right-10 -bottom-20 h-72 w-72 rounded-full bg-orange-500/20 blur-[100px]" />
          <h2 className="relative font-display text-3xl font-extrabold md:text-4xl">
            Pronto para nunca mais perder um horário?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/70">
            Comece grátis hoje. Sem cartão, sem fidelidade. Só uma agenda que finalmente funciona.
          </p>
          <div className="relative mt-8">
            <Button asChild size="lg" className="rounded-full bg-brand px-7 py-6 text-base font-semibold shadow-[var(--shadow-brand)] hover:bg-brand/90">
              <Link to={destino}>Começar agora <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-border bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <CalendarDays className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-sm font-bold">Agendae</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Agendae · Micro-SaaS de agendamento para o Brasil
        </p>
      </div>
    </footer>
  );
}
