import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import PageTransition from "@/components/PageTransition";

// Importação síncrona apenas para rotas críticas (acima do fold)
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy loading para rotas secundárias — só carregam quando acessadas
const Onboarding   = lazy(() => import("./pages/Onboarding"));
const Painel       = lazy(() => import("./pages/Painel"));
const Agenda       = lazy(() => import("./pages/Agenda"));
const Profissionais = lazy(() => import("./pages/Profissionais"));
const Servicos     = lazy(() => import("./pages/Servicos"));
const Clientes     = lazy(() => import("./pages/Clientes"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const LinkPublico  = lazy(() => import("./pages/LinkPublico"));
const ReservaPublica = lazy(() => import("./pages/ReservaPublica"));
const NotFound     = lazy(() => import("./pages/NotFound"));

// QueryClient configurado com stale time generoso — evita re-fetches desnecessários
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // dados frescos por 30s — reduz chamadas ao Supabase
      gcTime: 5 * 60_000,       // mantém cache por 5min
      retry: 1,                 // 1 retry em falha (não 3)
      refetchOnWindowFocus: false, // não re-busca ao focar janela
    },
  },
});

// Spinner mínimo para o Suspense — sem dependência extra
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const wrap = (node: React.ReactNode) => <PageTransition>{node}</PageTransition>;

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Rotas públicas — sem lazy (críticas para SEO e primeiro acesso) */}
        <Route path="/"     element={wrap(<Index />)} />
        <Route path="/auth" element={wrap(<Auth />)} />

        {/* Rotas com lazy — envolvidas em Suspense individual */}
        <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}>{wrap(<Onboarding />)}</Suspense>} />
        <Route path="/r/:slug"    element={<Suspense fallback={<PageLoader />}>{wrap(<ReservaPublica />)}</Suspense>} />

        {/* Área autenticada */}
        <Route path="/app"                element={<AppLayout><Suspense fallback={<PageLoader />}>{wrap(<Painel />)}</Suspense></AppLayout>} />
        <Route path="/app/agenda"         element={<AppLayout><Suspense fallback={<PageLoader />}>{wrap(<Agenda />)}</Suspense></AppLayout>} />
        <Route path="/app/clientes"       element={<AppLayout><Suspense fallback={<PageLoader />}>{wrap(<Clientes />)}</Suspense></AppLayout>} />
        <Route path="/app/servicos"       element={<AppLayout><Suspense fallback={<PageLoader />}>{wrap(<Servicos />)}</Suspense></AppLayout>} />
        <Route path="/app/profissionais"  element={<AppLayout><Suspense fallback={<PageLoader />}>{wrap(<Profissionais />)}</Suspense></AppLayout>} />
        <Route path="/app/link-publico"   element={<AppLayout><Suspense fallback={<PageLoader />}>{wrap(<LinkPublico />)}</Suspense></AppLayout>} />
        <Route path="/app/configuracoes"  element={<AppLayout><Suspense fallback={<PageLoader />}>{wrap(<Configuracoes />)}</Suspense></AppLayout>} />

        <Route path="*" element={<Suspense fallback={<PageLoader />}>{wrap(<NotFound />)}</Suspense>} />
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
