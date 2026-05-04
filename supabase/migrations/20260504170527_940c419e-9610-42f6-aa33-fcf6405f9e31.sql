REVOKE EXECUTE ON FUNCTION public.pode_acessar(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.simular_pagamento(uuid, public.plano_assinatura, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.simular_cancelamento(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pode_acessar(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.simular_pagamento(uuid, public.plano_assinatura, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.simular_cancelamento(uuid) TO authenticated;