import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Painel from "./pages/Painel.tsx";
import Agenda from "./pages/Agenda.tsx";
import EmBreve from "./pages/EmBreve.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app" element={<AppLayout><Painel /></AppLayout>} />
            <Route path="/app/agenda" element={<AppLayout><Agenda /></AppLayout>} />
            <Route path="/app/clientes" element={<EmBreve titulo="Clientes" descricao="CRM com histórico de serviços." />} />
            <Route path="/app/servicos" element={<EmBreve titulo="Serviços" descricao="Cadastro de serviços e preços." />} />
            <Route path="/app/profissionais" element={<EmBreve titulo="Profissionais" descricao="Gestão da sua equipe." />} />
            <Route path="/app/link-publico" element={<EmBreve titulo="Link público" descricao="Página de reservas para divulgar." />} />
            <Route path="/app/configuracoes" element={<EmBreve titulo="Configurações" descricao="Pix, lembretes e preferências." />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
