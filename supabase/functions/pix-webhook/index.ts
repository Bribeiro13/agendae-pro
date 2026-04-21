import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Webhook genérico de confirmação Pix (mock).
 * Em produção: validar assinatura/HMAC do provedor (Mercado Pago, Asaas, Gerencianet, etc.)
 *
 * Body esperado: { "txid": "AGD..." }   ou   { "endToEndId": "...", "txid": "..." }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const txid = body?.txid ?? body?.txId ?? body?.pix?.[0]?.txid;

    if (!txid || typeof txid !== "string") {
      return new Response(JSON.stringify({ erro: "txid ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.rpc("confirmar_pagamento_pix", { _txid: txid });
    if (error) throw error;

    if (!data) {
      return new Response(JSON.stringify({ ok: false, mensagem: "Pagamento não encontrado ou já processado" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[pix-webhook] Pagamento confirmado: txid=${txid} agendamento=${data}`);
    return new Response(JSON.stringify({ ok: true, agendamento_id: data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[pix-webhook] erro", e);
    return new Response(JSON.stringify({ erro: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
