
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('dono', 'funcionario');
CREATE TYPE public.status_agendamento AS ENUM ('pendente', 'confirmado', 'pago', 'cancelado', 'concluido', 'expirado');
CREATE TYPE public.status_pagamento AS ENUM ('aguardando', 'pago', 'expirado', 'cancelado');

-- ORGANIZACOES (tenant)
CREATE TABLE public.organizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  telefone TEXT,
  endereco TEXT,
  percentual_sinal INTEGER NOT NULL DEFAULT 30 CHECK (percentual_sinal BETWEEN 0 AND 100),
  minutos_expiracao_pix INTEGER NOT NULL DEFAULT 30,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  email TEXT,
  avatar_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER ROLES (vincula usuário a organização com papel)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organizacao_id, role)
);

-- PROFISSIONAIS
CREATE TABLE public.profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  especialidade TEXT,
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SERVICOS
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
  preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CLIENTES
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organizacao_id, telefone)
);

-- AGENDAMENTOS
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  status public.status_agendamento NOT NULL DEFAULT 'pendente',
  preco_total NUMERIC(10,2) NOT NULL,
  valor_sinal NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  lembrete_enviado BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fim > inicio)
);
CREATE INDEX idx_agendamentos_org_inicio ON public.agendamentos(organizacao_id, inicio);
CREATE INDEX idx_agendamentos_profissional ON public.agendamentos(profissional_id, inicio);

-- PAGAMENTOS PIX
CREATE TABLE public.pagamentos_pix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  qr_code_texto TEXT NOT NULL,
  qr_code_imagem_url TEXT,
  txid TEXT NOT NULL UNIQUE,
  status public.status_pagamento NOT NULL DEFAULT 'aguardando',
  expira_em TIMESTAMPTZ NOT NULL,
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECURITY DEFINER: verifica role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _organizacao_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND organizacao_id = _organizacao_id AND role = _role
  )
$$;

-- SECURITY DEFINER: verifica se usuário é membro da org (qualquer role)
CREATE OR REPLACE FUNCTION public.is_membro(_user_id UUID, _organizacao_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND organizacao_id = _organizacao_id
  )
$$;

-- SECURITY DEFINER: detecta colisão de horário (para booking público)
CREATE OR REPLACE FUNCTION public.tem_conflito_horario(
  _profissional_id UUID, _inicio TIMESTAMPTZ, _fim TIMESTAMPTZ, _ignorar_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agendamentos
    WHERE profissional_id = _profissional_id
      AND status NOT IN ('cancelado', 'expirado')
      AND (_ignorar_id IS NULL OR id <> _ignorar_id)
      AND tstzrange(inicio, fim, '[)') && tstzrange(_inicio, _fim, '[)')
  )
$$;

-- TRIGGER: cria profile no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome_completo', NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRIGGER: atualiza atualizado_em
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_org_upd BEFORE UPDATE ON public.organizacoes FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();
CREATE TRIGGER trg_agend_upd BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ENABLE RLS
ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_pix ENABLE ROW LEVEL SECURITY;

-- POLICIES: profiles
CREATE POLICY "Usuário vê próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuário edita próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuário insere próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLICIES: organizacoes
CREATE POLICY "Membros veem sua organização" ON public.organizacoes FOR SELECT
  USING (public.is_membro(auth.uid(), id));
CREATE POLICY "Qualquer autenticado cria organização" ON public.organizacoes FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "Donos editam organização" ON public.organizacoes FOR UPDATE
  USING (public.has_role(auth.uid(), id, 'dono'));
CREATE POLICY "Leitura pública para booking" ON public.organizacoes FOR SELECT
  TO anon USING (true);

-- POLICIES: user_roles
CREATE POLICY "Usuário vê seus papéis" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário cria papel próprio" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Donos gerenciam papéis da org" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), organizacao_id, 'dono'));

-- POLICIES: profissionais
CREATE POLICY "Membros veem profissionais" ON public.profissionais FOR SELECT
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Donos gerenciam profissionais" ON public.profissionais FOR ALL
  USING (public.has_role(auth.uid(), organizacao_id, 'dono'));
CREATE POLICY "Público lê profissionais ativos" ON public.profissionais FOR SELECT
  TO anon USING (ativo = true);

-- POLICIES: servicos
CREATE POLICY "Membros veem serviços" ON public.servicos FOR SELECT
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Donos gerenciam serviços" ON public.servicos FOR ALL
  USING (public.has_role(auth.uid(), organizacao_id, 'dono'));
CREATE POLICY "Público lê serviços ativos" ON public.servicos FOR SELECT
  TO anon USING (ativo = true);

-- POLICIES: clientes
CREATE POLICY "Membros veem clientes" ON public.clientes FOR SELECT
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Membros gerenciam clientes" ON public.clientes FOR ALL
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Público insere cliente (booking)" ON public.clientes FOR INSERT
  TO anon WITH CHECK (true);

-- POLICIES: agendamentos
CREATE POLICY "Membros veem agendamentos" ON public.agendamentos FOR SELECT
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Membros gerenciam agendamentos" ON public.agendamentos FOR ALL
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Público insere agendamento (booking)" ON public.agendamentos FOR INSERT
  TO anon WITH CHECK (true);

-- POLICIES: pagamentos_pix
CREATE POLICY "Membros veem pagamentos" ON public.pagamentos_pix FOR SELECT
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Membros gerenciam pagamentos" ON public.pagamentos_pix FOR ALL
  USING (public.is_membro(auth.uid(), organizacao_id));
CREATE POLICY "Público insere pagamento (booking)" ON public.pagamentos_pix FOR INSERT
  TO anon WITH CHECK (true);
CREATE POLICY "Público lê pagamento próprio (status)" ON public.pagamentos_pix FOR SELECT
  TO anon USING (true);
