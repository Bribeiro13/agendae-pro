import { ReactNode, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NovoAgendamentoDialog from "@/components/agenda/NovoAgendamentoDialog";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, org, loading } = useAuth();
  const location = useLocation();
  const [novoAberto, setNovoAberto] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (!org) return <Navigate to="/onboarding" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="text-foreground" />
            <Button variant="gradient" size="sm" onClick={() => setNovoAberto(true)}>
              <Plus className="h-4 w-4" /> Novo agendamento
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <NovoAgendamentoDialog open={novoAberto} onOpenChange={setNovoAberto} />
    </SidebarProvider>
  );
}
