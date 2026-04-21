import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function EmBreve({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </header>
        <Card className="bento-card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Construction className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="font-display text-lg font-semibold">Em breve</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Esta seção faz parte da próxima fase do MVP. Diga qual módulo priorizar e eu construo a seguir.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
