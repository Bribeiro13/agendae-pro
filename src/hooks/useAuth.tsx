import { useEffect, useState, createContext, useContext, ReactNode } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrg = async (uid: string) => {
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
  };

  useEffect(() => {
    // Listener primeiro (CRITICAL)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => fetchOrg(sess.user.id), 0);
      } else {
        setOrg(null);
      }
    });
    // Depois sessão atual
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchOrg(sess.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshOrg = async () => {
    if (user) await fetchOrg(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setOrg(null);
  };

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
