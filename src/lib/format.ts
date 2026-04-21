export const formatBRL = (v: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export const formatTel = (v: string) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{0,4})(\d{0,4}).*/, (_m, a, b, c) =>
      [a && `(${a})`, b && ` ${b}`, c && `-${c}`].filter(Boolean).join("")
    );
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
};

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "bg-event-amber/15 text-event-amber border-event-amber/30" },
  confirmado: { label: "Confirmado", cls: "bg-event-blue/15 text-event-blue border-event-blue/30" },
  pago: { label: "Pago", cls: "bg-event-green/15 text-event-green border-event-green/30" },
  cancelado: { label: "Cancelado", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  expirado: { label: "Expirado", cls: "bg-muted text-muted-foreground border-border" },
  concluido: { label: "Concluído", cls: "bg-event-slate/15 text-event-slate border-event-slate/30" },
};
