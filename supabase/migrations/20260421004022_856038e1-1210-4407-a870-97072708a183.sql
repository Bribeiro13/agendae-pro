
CREATE OR REPLACE FUNCTION public.criar_organizacao_com_dono(
  _nome TEXT,
  _slug TEXT,
  _telefone TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _org_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  IF _nome IS NULL OR length(trim(_nome)) = 0 THEN
    RAISE EXCEPTION 'Nome do negócio é obrigatório';
  END IF;
  IF _slug IS NULL OR length(trim(_slug)) = 0 THEN
    RAISE EXCEPTION 'Slug é obrigatório';
  END IF;

  INSERT INTO public.organizacoes (nome, slug, telefone)
  VALUES (trim(_nome), lower(trim(_slug)), NULLIF(trim(_telefone), ''))
  RETURNING id INTO _org_id;

  INSERT INTO public.user_roles (user_id, organizacao_id, role)
  VALUES (_uid, _org_id, 'dono');

  RETURN _org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.criar_organizacao_com_dono(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.criar_organizacao_com_dono(TEXT, TEXT, TEXT) TO authenticated;
