
-- Corrige search_path
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$;

-- Substitui policies públicas permissivas demais por versões validadas
DROP POLICY IF EXISTS "Público insere cliente (booking)" ON public.clientes;
CREATE POLICY "Público insere cliente (booking)" ON public.clientes FOR INSERT
  TO anon WITH CHECK (
    EXISTS (SELECT 1 FROM public.organizacoes o WHERE o.id = organizacao_id)
  );

DROP POLICY IF EXISTS "Público insere agendamento (booking)" ON public.agendamentos;
CREATE POLICY "Público insere agendamento (booking)" ON public.agendamentos FOR INSERT
  TO anon WITH CHECK (
    status = 'pendente'
    AND lembrete_enviado = false
    AND EXISTS (SELECT 1 FROM public.profissionais p WHERE p.id = profissional_id AND p.organizacao_id = agendamentos.organizacao_id AND p.ativo = true)
    AND EXISTS (SELECT 1 FROM public.servicos s WHERE s.id = servico_id AND s.organizacao_id = agendamentos.organizacao_id AND s.ativo = true)
    AND EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = cliente_id AND c.organizacao_id = agendamentos.organizacao_id)
    AND NOT public.tem_conflito_horario(profissional_id, inicio, fim, NULL)
  );

DROP POLICY IF EXISTS "Público insere pagamento (booking)" ON public.pagamentos_pix;
CREATE POLICY "Público insere pagamento (booking)" ON public.pagamentos_pix FOR INSERT
  TO anon WITH CHECK (
    status = 'aguardando'
    AND EXISTS (SELECT 1 FROM public.agendamentos a WHERE a.id = agendamento_id AND a.organizacao_id = pagamentos_pix.organizacao_id)
  );
