import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  MessageCircle,
  QrCode,
  Smartphone,
  Clock,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Star,
  Check,
  X,
  Scissors,
  Stethoscope,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
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
  const reduce = useReducedMotion();

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
function Navbar({ destino, user }: { destino: string; user: boolean }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-white">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-[var(--shadow-brand)]">
            <CalendarDays className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Agendae</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#recursos" className="transition hover:text-white">Recursos</a>
          <a href="#como" className="transition hover:text-white">Como Funciona</a>
          <a href="#planos" className="transition hover:text-white">Planos</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
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
}

/* ---------- Hero ---------- */
function Hero({ destino, reduce }: { destino: string; reduce: boolean }) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--ink))] pb-20 pt-32 text-white md:pb-28 md:pt-36">
      {/* glows */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-60" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        {/* Left */}
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
            initial="hidden"
            animate="show"
            custom={1}
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg text-white/70"
          >
            Agendamentos online, lembretes automáticos via WhatsApp e
            recebimentos via Pix. Tudo em um único lugar, bonito e simples de usar.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <Button
              asChild
              size="lg"
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

        {/* Right — Floating agenda card */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative"
        >
          <div className={reduce ? "" : "animate-float"}>
            <AgendaPreviewCard />
          </div>
          {/* subtle ring */}
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-transparent to-transparent blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

function AgendaPreviewCard() {
  const items = [
    { time: "09:00", name: "João Pedro Souza", svc: "Corte + Barba", price: "R$ 80" },
    { time: "10:30", name: "Dra. Camila Resende", svc: "Consulta", price: "R$ 250" },
    { time: "13:00", name: "Mariana Albuquerque", svc: "Limpeza de Pele", price: "R$ 120" },
  ];
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
        {items.map((it, i) => (
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

/* ---------- Social proof marquee ---------- */
function SocialProof() {
  const logos = [
    { icon: Scissors, name: "Studio Barba & Cia" },
    { icon: Stethoscope, name: "DermatoClinic" },
    { icon: Sparkles, name: "Espaço Beleza" },
    { icon: CheckCircle2, name: "VANGUARD" },
    { icon: Scissors, name: "Mendes Barber" },
    { icon: Stethoscope, name: "Clínica Vita" },
  ];
  const row = [...logos, ...logos];
  return (
    <section className="border-b border-border bg-white py-10">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Aprovado por mais de 2.000 profissionais em todo o Brasil
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-14 px-6">
          {row.map((l, i) => (
            <div key={i} className="flex items-center gap-2.5 text-muted-foreground/80">
              <l.icon className="h-4 w-4" />
              <span className="font-display text-sm font-semibold tracking-wide">{l.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Features (Bento) ---------- */
function Features() {
  return (
    <section id="recursos" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          title="Tudo o que você precisa, sem complicação."
          desc="Desenhamos o Agendae para ser a ferramenta mais elegante e fácil de usar no dia a dia do seu negócio."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          <FeatureCard
            className="lg:col-span-3 bg-[hsl(var(--tint-mint))]"
            icon={MessageCircle}
            iconColor="text-emerald-600 bg-emerald-100"
            title="Lembretes Automáticos"
            desc="Diga adeus às faltas. O Agendae envia mensagens de WhatsApp automáticas 24h antes do horário."
          >
            <ChatBubble />
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-3 bg-[hsl(var(--tint-peach))]"
            icon={QrCode}
            iconColor="text-brand bg-brand/10"
            title="Pix Integrado"
            desc="Cobre um sinal antecipado e acabe com os prejuízos de quem marca e não aparece."
          >
            <PixMock />
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2 bg-[hsl(var(--tint-sky))]"
            icon={Smartphone}
            iconColor="text-blue-600 bg-blue-100"
            title="Link de Agendamento"
            desc="Um link elegante para colocar no seu Instagram. O cliente agenda sozinho."
          >
            <PhoneMock />
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-4 bg-[hsl(var(--tint-lavender))]"
            icon={CalendarDays}
            iconColor="text-violet-600 bg-violet-100"
            title="Agenda Inteligente"
            desc="Sem chance de horário duplicado. Controle a rotina de múltiplos profissionais em uma visão única e fluida."
          >
            <AgendaStripsMock />
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
      <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold md:text-4xl">
        {title}
      </motion.h2>
      <motion.p variants={fadeUp} custom={1} className="mt-3 text-base text-muted-foreground">
        {desc}
      </motion.p>
    </motion.div>
  );
}

function FeatureCard({
  className = "",
  icon: Icon,
  iconColor,
  title,
  desc,
  children,
}: {
  className?: string;
  icon: any;
  iconColor: string;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-3xl border border-border/60 p-7 ${className}`}
    >
      <div className={`mb-5 inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconColor}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <h3 className="font-display text-base font-bold">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{desc}</p>
      {children && <div className="mt-6">{children}</div>}
    </motion.div>
  );
}

function ChatBubble() {
  return (
    <div className="flex justify-center">
      <div className="flex max-w-sm items-start gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Olá João! Seu corte de cabelo está confirmado para amanhã às 14h no Studio Barba.
        </p>
      </div>
    </div>
  );
}

function PixMock() {
  return (
    <div className="flex justify-center">
      <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="grid h-24 w-24 grid-cols-7 grid-rows-7 gap-[2px] [&>span]:rounded-[1px]">
          {Array.from({ length: 49 }).map((_, i) => {
            const seed = (i * 7 + 3) % 11;
            return <span key={i} className={seed > 5 ? "bg-[hsl(var(--ink))]" : "bg-transparent"} />;
          })}
        </div>
        <p className="mt-2 text-center text-[10px] font-medium text-muted-foreground">Pix Copia e Cola</p>
      </div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="flex justify-center">
      <div className="w-32 rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]">
        <div className="mx-auto mb-2.5 h-1 w-8 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-2 rounded bg-muted" />
          <div className="h-2 w-4/5 rounded bg-muted" />
          <div className="h-2 w-3/5 rounded bg-muted" />
          <div className="mt-2 h-6 rounded-md bg-brand/30" />
        </div>
      </div>
    </div>
  );
}

function AgendaStripsMock() {
  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "70%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="rounded-md bg-violet-200/70 px-3 py-2 text-xs font-semibold text-violet-900"
      >
        Rafael — 09:00
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "85%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="ml-6 rounded-md bg-blue-200/70 px-3 py-2 text-xs font-semibold text-blue-900"
      >
        Marcos — 10:00
      </motion.div>
    </div>
  );
}

/* ---------- How it works ---------- */
function HowItWorks() {
  const steps = [
    { icon: Smartphone, title: "O Cliente Acessa", desc: "Clica no link do seu Instagram ou WhatsApp." },
    { icon: Clock, title: "Escolhe o Horário", desc: "Vê apenas os horários livres na sua agenda." },
    { icon: CreditCard, title: "Paga o Sinal", desc: "Faz um Pix na hora para garantir a reserva." },
    { icon: CheckCircle2, title: "Tudo Confirmado", desc: "Horário salvo e lembrete agendado. Sem estresse." },
  ];
  return (
    <section id="como" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          title="Como funciona na prática"
          desc="Um fluxo perfeito que poupa seu tempo e passa profissionalismo para o seu cliente."
        />
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-7 hidden border-t border-dashed border-border md:block" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {steps.map((s, i) => (
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
                <h4 className="mt-5 font-display text-sm font-bold">
                  {i + 1}. {s.title}
                </h4>
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
function Testimonials() {
  const items = [
    {
      txt: "Antes eu perdia horas respondendo WhatsApp e lidando com quem marcava e não ia. Com o sinal obrigatório via Pix, meu faturamento subiu 30%.",
      name: "Carlos Mendes",
      role: "Proprietário, Mendes Barber",
      ini: "CM",
    },
    {
      txt: "A interface é muito clean e passa uma imagem premium para as minhas pacientes. O controle financeiro no final do dia é perfeito.",
      name: "Dra. Juliana Silva",
      role: "Clínica de Estética",
      ini: "DJS",
    },
    {
      txt: "Melhor investimento que fiz esse ano. A equipe toda usa no celular e a agenda nunca conflita. O suporte é rápido e humano.",
      name: "Roberto Alves",
      role: "Estúdio RC",
      ini: "RA",
    },
  ];
  return (
    <section className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          title="Quem usa, recomenda"
          desc="Veja o que os proprietários de negócios dizem sobre o Agendae."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">"{t.txt}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {t.ini}
                </div>
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
function Pricing({ destino }: { destino: string }) {
  const plans = [
    {
      name: "Essencial",
      desc: "Para o profissional autônomo",
      price: "39",
      cta: "Assinar Essencial",
      featured: false,
      features: [
        { ok: true, t: "1 Profissional" },
        { ok: true, t: "Agendamentos ilimitados" },
        { ok: true, t: "Link de Reserva Público" },
        { ok: false, t: "Sem cobrança de Pix antecipado" },
        { ok: false, t: "Sem lembretes de WhatsApp" },
      ],
    },
    {
      name: "Profissional",
      desc: "O pacote completo para crescer",
      price: "79",
      cta: "Assinar Profissional",
      featured: true,
      features: [
        { ok: true, t: "Até 3 Profissionais" },
        { ok: true, t: "Tudo do plano Essencial" },
        { ok: true, t: "Cobrança de Sinal via Pix" },
        { ok: true, t: "Lembretes automáticos (WhatsApp)" },
        { ok: true, t: "Histórico de Clientes (CRM)" },
      ],
    },
    {
      name: "Estúdio",
      desc: "Para times maiores e clínicas",
      price: "149",
      cta: "Assinar Estúdio",
      featured: false,
      features: [
        { ok: true, t: "Profissionais ilimitados" },
        { ok: true, t: "Tudo do plano Profissional" },
        { ok: true, t: "Painel Financeiro Avançado" },
        { ok: true, t: "Relatórios de Desempenho" },
        { ok: true, t: "Suporte Prioritário" },
      ],
    },
  ];
  return (
    <section id="planos" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          title="Preço simples. Sem surpresas."
          desc="Escolha o plano ideal para o tamanho do seu negócio. Cancele quando quiser."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl border p-7 ${
                p.featured
                  ? "border-transparent bg-[hsl(var(--ink))] text-white shadow-[var(--shadow-card-lg)]"
                  : "border-border bg-white shadow-[var(--shadow-soft)]"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Mais Popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.featured ? "text-white/60" : "text-muted-foreground"}`}>
                {p.desc}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold">R$ {p.price}</span>
                <span className={`text-sm ${p.featured ? "text-white/60" : "text-muted-foreground"}`}>/mês</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f.t} className="flex items-center gap-2.5 text-sm">
                    {f.ok ? (
                      <Check className={`h-4 w-4 flex-shrink-0 ${p.featured ? "text-brand" : "text-emerald-600"}`} />
                    ) : (
                      <X className={`h-4 w-4 flex-shrink-0 ${p.featured ? "text-white/30" : "text-muted-foreground/50"}`} />
                    )}
                    <span className={!f.ok ? "text-muted-foreground line-through opacity-70" : ""}>{f.t}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-7 w-full rounded-full ${
                  p.featured
                    ? "bg-brand text-white hover:bg-brand/90"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
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
function Faq() {
  const items = [
    {
      q: "Como funciona a proteção contra faltas (no-show)?",
      a: "Você define um percentual (30%-50%) cobrado via Pix no momento do agendamento. Se o cliente não confirmar o pagamento, o horário é liberado automaticamente.",
    },
    {
      q: "Existe risco de dois clientes marcarem o mesmo horário?",
      a: "Não. O Agendae detecta conflitos em tempo real no banco de dados, garantindo que cada slot seja exclusivo de um único cliente.",
    },
    {
      q: "Os lembretes de WhatsApp são cobrados à parte?",
      a: "Estão inclusos a partir do plano Profissional. Você só paga a integração se quiser usar provedores oficiais como Z-API ou Evolution.",
    },
    {
      q: "Posso usar no celular e no computador?",
      a: "Sim. O Agendae é 100% responsivo e funciona perfeitamente em qualquer dispositivo, sem precisar instalar app.",
    },
    {
      q: "Como recebo o dinheiro do Pix?",
      a: "Os Pix caem direto na sua conta bancária cadastrada. O Agendae apenas registra e organiza os recebimentos no seu painel.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHead title="Perguntas Frequentes" desc="Tire suas dúvidas antes de começar." />
        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-white">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} className={i > 0 ? "border-t border-border" : ""}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-secondary/50"
                >
                  <span className="text-sm font-semibold">{it.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
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
            <Button
              asChild
              size="lg"
              className="rounded-full bg-brand px-7 py-6 text-base font-semibold shadow-[var(--shadow-brand)] hover:bg-brand/90"
            >
              <Link to={destino}>
                Começar agora <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
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
