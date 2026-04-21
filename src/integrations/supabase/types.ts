export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          atualizado_em: string
          cliente_id: string
          criado_em: string
          fim: string
          id: string
          inicio: string
          lembrete_enviado: boolean
          observacoes: string | null
          organizacao_id: string
          preco_total: number
          profissional_id: string
          servico_id: string
          status: Database["public"]["Enums"]["status_agendamento"]
          valor_sinal: number
        }
        Insert: {
          atualizado_em?: string
          cliente_id: string
          criado_em?: string
          fim: string
          id?: string
          inicio: string
          lembrete_enviado?: boolean
          observacoes?: string | null
          organizacao_id: string
          preco_total: number
          profissional_id: string
          servico_id: string
          status?: Database["public"]["Enums"]["status_agendamento"]
          valor_sinal?: number
        }
        Update: {
          atualizado_em?: string
          cliente_id?: string
          criado_em?: string
          fim?: string
          id?: string
          inicio?: string
          lembrete_enviado?: boolean
          observacoes?: string | null
          organizacao_id?: string
          preco_total?: number
          profissional_id?: string
          servico_id?: string
          status?: Database["public"]["Enums"]["status_agendamento"]
          valor_sinal?: number
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          criado_em: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          organizacao_id: string
          telefone: string
        }
        Insert: {
          criado_em?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          organizacao_id: string
          telefone: string
        }
        Update: {
          criado_em?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          organizacao_id?: string
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          endereco: string | null
          id: string
          minutos_expiracao_pix: number
          nome: string
          percentual_sinal: number
          slug: string
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          endereco?: string | null
          id?: string
          minutos_expiracao_pix?: number
          nome: string
          percentual_sinal?: number
          slug: string
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          endereco?: string | null
          id?: string
          minutos_expiracao_pix?: number
          nome?: string
          percentual_sinal?: number
          slug?: string
          telefone?: string | null
        }
        Relationships: []
      }
      pagamentos_pix: {
        Row: {
          agendamento_id: string
          criado_em: string
          expira_em: string
          id: string
          organizacao_id: string
          pago_em: string | null
          qr_code_imagem_url: string | null
          qr_code_texto: string
          status: Database["public"]["Enums"]["status_pagamento"]
          txid: string
          valor: number
        }
        Insert: {
          agendamento_id: string
          criado_em?: string
          expira_em: string
          id?: string
          organizacao_id: string
          pago_em?: string | null
          qr_code_imagem_url?: string | null
          qr_code_texto: string
          status?: Database["public"]["Enums"]["status_pagamento"]
          txid: string
          valor: number
        }
        Update: {
          agendamento_id?: string
          criado_em?: string
          expira_em?: string
          id?: string
          organizacao_id?: string
          pago_em?: string | null
          qr_code_imagem_url?: string | null
          qr_code_texto?: string
          status?: Database["public"]["Enums"]["status_pagamento"]
          txid?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_pix_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_pix_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          criado_em: string
          email: string | null
          id: string
          nome_completo: string | null
        }
        Insert: {
          avatar_url?: string | null
          criado_em?: string
          email?: string | null
          id: string
          nome_completo?: string | null
        }
        Update: {
          avatar_url?: string | null
          criado_em?: string
          email?: string | null
          id?: string
          nome_completo?: string | null
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          ativo: boolean
          criado_em: string
          especialidade: string | null
          id: string
          nome: string
          organizacao_id: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          especialidade?: string | null
          id?: string
          nome: string
          organizacao_id: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          especialidade?: string | null
          id?: string
          nome?: string
          organizacao_id?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          criado_em: string
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          organizacao_id: string
          preco: number
          profissional_id: string | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          descricao?: string | null
          duracao_minutos: number
          id?: string
          nome: string
          organizacao_id: string
          preco: number
          profissional_id?: string | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          organizacao_id?: string
          preco?: number
          profissional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          criado_em: string
          id: string
          organizacao_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          organizacao_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          organizacao_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _organizacao_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_membro: {
        Args: { _organizacao_id: string; _user_id: string }
        Returns: boolean
      }
      tem_conflito_horario: {
        Args: {
          _fim: string
          _ignorar_id?: string
          _inicio: string
          _profissional_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "dono" | "funcionario"
      status_agendamento:
        | "pendente"
        | "confirmado"
        | "pago"
        | "cancelado"
        | "concluido"
        | "expirado"
      status_pagamento: "aguardando" | "pago" | "expirado" | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["dono", "funcionario"],
      status_agendamento: [
        "pendente",
        "confirmado",
        "pago",
        "cancelado",
        "concluido",
        "expirado",
      ],
      status_pagamento: ["aguardando", "pago", "expirado", "cancelado"],
    },
  },
} as const
