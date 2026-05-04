-- 1. Enums
DO $$ BEGIN
  CREATE TYPE public.plano_assinatura AS ENUM ('free', 'pro', 'premium');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_assinatura AS ENUM ('inativo', 'ativo', 'cancelado', 'inadimplente', 'expirado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Colunas na organizacoes
ALTER TABLE public.organizacoes
  ADD COLUMN IF NOT EXISTS plano public.plano_assinatura NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS status_assinatura public.status_assinatura NOT NULL DEFAULT 'inativo',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS plano_expira_em timestamptz;

-- 3. Tabela subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id uuid NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
  plano public.plano_assinatura NOT NULL,
  status public.status_assinatura NOT NULL DEFAULT 'ativo',
  data_inicio timestamptz NOT NULL DEFAULT now(),
  data_expiracao timestamptz,
  stripe_subscription_id text,
  origem text NOT NULL DEFAULT 'simulacao', -- 'simulacao' | 'stripe'
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_stripe_id
  ON public.subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros veem assinaturas" ON public.subscriptions;
CREATE POLICY "Membros veem assinaturas" ON public.subscriptions
  FOR SELECT USING (public.is_membro(auth.uid(), organizacao_id));

DROP POLICY IF EXISTS "Donos gerenciam assinaturas" ON public.subscriptions;
CREATE POLICY "Donos gerenciam assinaturas" ON public.subscriptions
  FOR ALL USING (public.has_role(auth.uid(), organizacao_id, 'dono'));

DROP TRIGGER IF EXISTS trg_subscriptions_atualizado_em ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_atualizado_em
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- 4. pode_acessar(org, feature) — controle de acesso server-side
CREATE OR REPLACE FUNCTION public.pode_acessar(_organizacao_id uuid, _feature text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plano public.plano_assinatura;
  _status public.status_assinatura;
  _expira timestamptz;
BEGIN
  SELECT plano, status_assinatura, plano_expira_em
    INTO _plano, _status, _expira
  FROM public.organizacoes WHERE id = _organizacao_id;

  IF _plano IS NULL THEN RETURN false; END IF;

  -- Se expirou, força free
  IF _expira IS NOT NULL AND _expira < now() AND _plano <> 'free' THEN
    _plano := 'free';
    _status := 'expirado';
  END IF;

  -- Inadimplente / cancelado / inativo só liberam o que free liberaria
  IF _status NOT IN ('ativo') AND _plano <> 'free' THEN
    _plano := 'free';
  END IF;

  RETURN CASE _plano
    WHEN 'premium' THEN true  -- acesso total
    WHEN 'pro' THEN _feature IN ('agendamento_basico', 'relatorios')
    WHEN 'free' THEN _feature IN ('agendamento_basico')
  END;
END;
$$;

-- 5. simular_pagamento — ativa plano sem Stripe (somente dono)
CREATE OR REPLACE FUNCTION public.simular_pagamento(
  _organizacao_id uuid,
  _plano public.plano_assinatura,
  _dias integer DEFAULT 30
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _expira timestamptz;
  _sub_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.has_role(_uid, _organizacao_id, 'dono') THEN
    RAISE EXCEPTION 'Apenas o dono pode alterar a assinatura';
  END IF;
  IF _plano = 'free' THEN
    RAISE EXCEPTION 'Use simular_cancelamento para voltar ao free';
  END IF;

  _expira := now() + (_dias || ' days')::interval;

  -- Encerra assinaturas anteriores ativas
  UPDATE public.subscriptions
    SET status = 'cancelado', atualizado_em = now()
    WHERE organizacao_id = _organizacao_id AND status = 'ativo';

  INSERT INTO public.subscriptions (organizacao_id, plano, status, data_expiracao, origem)
  VALUES (_organizacao_id, _plano, 'ativo', _expira, 'simulacao')
  RETURNING id INTO _sub_id;

  UPDATE public.organizacoes
    SET plano = _plano,
        status_assinatura = 'ativo',
        plano_expira_em = _expira,
        atualizado_em = now()
    WHERE id = _organizacao_id;

  RETURN _sub_id;
END;
$$;

-- 6. simular_cancelamento — volta para free
CREATE OR REPLACE FUNCTION public.simular_cancelamento(_organizacao_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.has_role(_uid, _organizacao_id, 'dono') THEN
    RAISE EXCEPTION 'Apenas o dono pode cancelar';
  END IF;

  UPDATE public.subscriptions
    SET status = 'cancelado', atualizado_em = now()
    WHERE organizacao_id = _organizacao_id AND status = 'ativo';

  UPDATE public.organizacoes
    SET plano = 'free',
        status_assinatura = 'cancelado',
        plano_expira_em = NULL,
        atualizado_em = now()
    WHERE id = _organizacao_id;
END;
$$;