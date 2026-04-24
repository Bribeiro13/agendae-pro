import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import PageTransition from "@/components/PageTransition";
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

const wrap = (node: React.ReactNode) => <PageTransition>{node}</PageTransition>;

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={wrap(<Index />)} />
        <Route path="/auth" element={wrap(<Auth />)} />
        <Route path="/onboarding" element={wrap(<Onboarding />)} />
        <Route path="/r/:slug" element={wrap(<ReservaPublica />)} />

        <Route path="/app" element={<AppLayout>{wrap(<Painel />)}</AppLayout>} />
        <Route path="/app/agenda" element={<AppLayout>{wrap(<Agenda />)}</AppLayout>} />
        <Route path="/app/clientes" element={wrap(<Clientes />)} />
        <Route path="/app/servicos" element={wrap(<Servicos />)} />
        <Route path="/app/profissionais" element={wrap(<Profissionais />)} />
        <Route path="/app/link-publico" element={wrap(<LinkPublico />)} />
        <Route path="/app/configuracoes" element={wrap(<Configuracoes />)} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={wrap(<NotFound />)} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
