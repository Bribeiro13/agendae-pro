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
import Profissionais from "./pages/Profissionais.tsx";
import Servicos from "./pages/Servicos.tsx";
import Clientes from "./pages/Clientes.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import LinkPublico from "./pages/LinkPublico.tsx";
import ReservaPublica from "./pages/ReservaPublica.tsx";

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
            <Route path="/r/:slug" element={<ReservaPublica />} />

            <Route path="/app" element={<AppLayout><Painel /></AppLayout>} />
            <Route path="/app/agenda" element={<AppLayout><Agenda /></AppLayout>} />
            <Route path="/app/clientes" element={<Clientes />} />
            <Route path="/app/servicos" element={<Servicos />} />
            <Route path="/app/profissionais" element={<Profissionais />} />
            <Route path="/app/link-publico" element={<LinkPublico />} />
            <Route path="/app/configuracoes" element={<Configuracoes />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
