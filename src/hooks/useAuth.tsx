import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface OrgInfo {
  id: string;
  nome: string;
  slug: string;
  role: "dono" | "funcionario";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  org: OrgInfo | null;
  loading: boolean;
  refreshOrg: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [org, setOrg]         = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref para evitar double-fetch quando onAuthStateChange e getSession disparam juntos
  const fetchingOrgFor = useRef<string | null>(null);

  const fetchOrg = useCallback(async (uid: string) => {
    if (fetchingOrgFor.current === uid) return; // já buscando para este uid
    fetchingOrgFor.current = uid;
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role, organizacao_id, organizacoes(id, nome, slug)")
        .eq("user_id", uid)
        .maybeSingle();

      if (data?.organizacoes) {
        setOrg({
          id: data.organizacoes.id,
          nome: data.organizacoes.nome,
          slug: data.organizacoes.slug,
          role: data.role as "dono" | "funcionario",
        });
      } else {
        setOrg(null);
      }
    } finally {
      fetchingOrgFor.current = null;
    }
  }, []);

  useEffect(() => {
    let didCancel = false;

    // 1. Carrega sessão atual (evita flash de tela de login)
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (didCancel) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchOrg(sess.user.id).finally(() => {
          if (!didCancel) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // 2. Listener para mudanças subsequentes (login/logout/refresh de token)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (didCancel) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // setTimeout(0) evita deadlock com o getSession acima
        setTimeout(() => fetchOrg(sess.user.id), 0);
      } else {
        setOrg(null);
        // Se ainda estava carregando, conclui agora
        setLoading(false);
      }
    });

    return () => {
      didCancel = true;
      sub.subscription.unsubscribe();
    };
  }, [fetchOrg]);

  const refreshOrg = useCallback(async () => {
    if (user) await fetchOrg(user.id);
  }, [user, fetchOrg]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setOrg(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, org, loading, refreshOrg, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
