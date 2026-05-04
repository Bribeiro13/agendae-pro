import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlano, type Feature } from "@/hooks/usePlano";

interface Props {
  feature: Feature;
  children: ReactNode;
  /** Texto alternativo opcional para o bloqueio */
  mensagem?: string;
}

/**
 * Bloqueia conteúdo conforme o plano da organização (validação SERVER-SIDE via RPC).
 * Não confiar apenas no front — a UI é só conveniência. RLS/funções no banco são a fonte de verdade.
 */
export function PlanoGuard({ feature, children, mensagem }: Props) {
  const { podeAcessar, isLoading } = usePlano();
  const [permitido, setPermitido] = useState<boolean | null>(null);

  useEffect(() => {
    let cancel = false;
    podeAcessar(feature).then((ok) => {
      if (!cancel) setPermitido(ok);
    });
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature]);

  if (isLoading || permitido === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!permitido) {
    return (
      <Card className="mx-auto max-w-md border-border/60 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold">Recurso bloqueado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {mensagem ?? "Disponível nos planos Pro ou Premium."}
        </p>
        <Button asChild variant="gradient" className="mt-4">
          <Link to="/app/billing">Ver planos</Link>
        </Button>
      </Card>
    );
  }

  return <>{children}</>;
}
