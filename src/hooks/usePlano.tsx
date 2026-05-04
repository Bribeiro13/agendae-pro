import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Plano = "free" | "pro" | "premium";
export type StatusAssinatura = "inativo" | "ativo" | "cancelado" | "inadimplente" | "expirado";

export type Feature = "agendamento_basico" | "relatorios" | "whatsapp" | "link_publico_custom" | "multi_profissionais";

export interface PlanoInfo {
  plano: Plano;
  status_assinatura: StatusAssinatura;
  plano_expira_em: string | null;
}

export function usePlano() {
  const { org } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["plano", org?.id],
    enabled: !!org?.id,
    queryFn: async (): Promise<PlanoInfo | null> => {
      if (!org?.id) return null;
      const { data, error } = await supabase
        .from("organizacoes")
        .select("plano, status_assinatura, plano_expira_em")
        .eq("id", org.id)
        .maybeSingle();
      if (error) throw error;
      return data as PlanoInfo | null;
    },
  });

  /** Verifica acesso a uma feature server-side (fonte de verdade). */
  const podeAcessar = async (feature: Feature): Promise<boolean> => {
    if (!org?.id) return false;
    const { data, error } = await supabase.rpc("pode_acessar", {
      _organizacao_id: org.id,
      _feature: feature,
    });
    if (error) {
      console.error("[pode_acessar]", error);
      return false;
    }
    return data === true;
  };

  const refresh = () => qc.invalidateQueries({ queryKey: ["plano", org?.id] });

  return { ...query, info: query.data ?? null, podeAcessar, refresh };
}
