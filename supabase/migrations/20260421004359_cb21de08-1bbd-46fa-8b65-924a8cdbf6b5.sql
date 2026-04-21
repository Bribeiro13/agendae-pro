
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Reserva pública (cria/reaproveita cliente, cria agendamento + pix)
CREATE OR REPLACE FUNCTION public.reservar_horario_publico(
  _organizacao_id uuid,
  _profissional_id uuid,
  _servico_id uuid,
  _cliente_nome text,
  _cliente_telefone text,
  _cliente_email text,
  _inicio timestamptz
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org public.organizacoes%ROWTYPE;
  _serv public.servicos%ROWTYPE;
  _prof public.profissionais%ROWTYPE;
  _fim timestamptz;
  _cliente_id uuid;
  _agendamento_id uuid;
  _valor_sinal numeric(10,2);
  _expira timestamptz;
  _txid text;
  _qr_texto text;
  _pagamento_id uuid;
BEGIN
  IF _cliente_nome IS NULL OR length(trim(_cliente_nome)) = 0 THEN
    RAISE EXCEPTION 'Nome é obrigatório';
  END IF;
  IF _cliente_telefone IS NULL OR length(regexp_replace(_cliente_telefone, '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Telefone inválido';
  END IF;

  SELECT * INTO _org FROM public.organizacoes WHERE id = _organizacao_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Organização não encontrada'; END IF;

  SELECT * INTO _serv FROM public.servicos
    WHERE id = _servico_id AND organizacao_id = _organizacao_id AND ativo = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Serviço indisponível'; END IF;

  SELECT * INTO _prof FROM public.profissionais
    WHERE id = _profissional_id AND organizacao_id = _organizacao_id AND ativo = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profissional indisponível'; END IF;

  _fim := _inicio + (_serv.duracao_minutos || ' minutes')::interval;

  IF public.tem_conflito_horario(_profissional_id, _inicio, _fim, NULL) THEN
    RAISE EXCEPTION 'Horário indisponível';
  END IF;

  -- cliente: reaproveita se já existir telefone para a org
  SELECT id INTO _cliente_id FROM public.clientes
    WHERE organizacao_id = _organizacao_id AND telefone = _cliente_telefone;
  IF _cliente_id IS NULL THEN
    INSERT INTO public.clientes (organizacao_id, nome, telefone, email)
    VALUES (_organizacao_id, trim(_cliente_nome), _cliente_telefone, NULLIF(trim(_cliente_email), ''))
    RETURNING id INTO _cliente_id;
  ELSE
    UPDATE public.clientes
      SET nome = trim(_cliente_nome),
          email = COALESCE(NULLIF(trim(_cliente_email), ''), email)
      WHERE id = _cliente_id;
  END IF;

  _valor_sinal := round(_serv.preco * _org.percentual_sinal / 100.0, 2);

  INSERT INTO public.agendamentos (
    organizacao_id, cliente_id, profissional_id, servico_id,
    inicio, fim, status, preco_total, valor_sinal
  ) VALUES (
    _organizacao_id, _cliente_id, _profissional_id, _servico_id,
    _inicio, _fim, 'pendente', _serv.preco, _valor_sinal
  ) RETURNING id INTO _agendamento_id;

  _expira := now() + (_org.minutos_expiracao_pix || ' minutes')::interval;
  _txid := 'AGD' || replace(_agendamento_id::text, '-', '');
  _qr_texto := '00020126' || _txid || '5204000053039865802BR5913AGENDAE MOCK6009SAO PAULO62070503***6304MOCK';

  INSERT INTO public.pagamentos_pix (
    agendamento_id, organizacao_id, valor, qr_code_texto, txid, status, expira_em
  ) VALUES (
    _agendamento_id, _organizacao_id, _valor_sinal, _qr_texto, _txid, 'aguardando', _expira
  ) RETURNING id INTO _pagamento_id;

  RETURN jsonb_build_object(
    'agendamento_id', _agendamento_id,
    'pagamento_id', _pagamento_id,
    'valor_sinal', _valor_sinal,
    'qr_code_texto', _qr_texto,
    'txid', _txid,
    'expira_em', _expira,
    'inicio', _inicio,
    'fim', _fim
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reservar_horario_publico(uuid, uuid, uuid, text, text, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reservar_horario_publico(uuid, uuid, uuid, text, text, text, timestamptz) TO anon, authenticated;

-- Expira pagamentos vencidos e libera o slot
CREATE OR REPLACE FUNCTION public.expirar_pix_vencidos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _qtd integer;
BEGIN
  WITH expirados AS (
    UPDATE public.pagamentos_pix
      SET status = 'expirado'
      WHERE status = 'aguardando' AND expira_em < now()
      RETURNING agendamento_id
  )
  UPDATE public.agendamentos a
    SET status = 'expirado'
    FROM expirados e
    WHERE a.id = e.agendamento_id AND a.status = 'pendente';
  GET DIAGNOSTICS _qtd = ROW_COUNT;
  RETURN _qtd;
END;
$$;

-- Confirma pagamento (usada pela edge function de webhook)
CREATE OR REPLACE FUNCTION public.confirmar_pagamento_pix(_txid text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ag_id uuid;
BEGIN
  UPDATE public.pagamentos_pix
    SET status = 'pago', pago_em = now()
    WHERE txid = _txid AND status = 'aguardando'
    RETURNING agendamento_id INTO _ag_id;
  IF _ag_id IS NULL THEN
    RETURN NULL;
  END IF;
  UPDATE public.agendamentos
    SET status = 'pago'
    WHERE id = _ag_id;
  RETURN _ag_id;
END;
$$;
