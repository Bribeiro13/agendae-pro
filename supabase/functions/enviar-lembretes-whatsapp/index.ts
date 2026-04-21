import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Envia lembretes de WhatsApp para agendamentos que começam em 24h.
 * Placeholder com integração para Evolution API ou Z-API.
 *
 * Para ativar de verdade, configure os secrets:
 *   EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE
 *   OU  ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN
 *
 * Provedor escolhido pelo secret WHATSAPP_PROVIDER ("evolution" | "zapi" | "mock").
 */

interface Agendamento {
  id: string;
  inicio: string;
  cliente_telefone: string;
  cliente_nome: string;
  servico_nome: string;
  profissional_nome: string;
  organizacao_nome: string;
}

async function enviarMensagem(telefone: string, mensagem: string) {
  const provider = Deno.env.get("WHATSAPP_PROVIDER") ?? "mock";

  if (provider === "evolution") {
    const url = Deno.env.get("EVOLUTION_API_URL");
    const key = Deno.env.get("EVOLUTION_API_KEY");
    const instance = Deno.env.get("EVOLUTION_INSTANCE");
    if (!url || !key || !instance) throw new Error("Evolution API: secrets ausentes");
    const r = await fetch(`${url}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ number: telefone, text: mensagem }),
    });
    if (!r.ok) throw new Error(`Evolution: ${r.status} ${await r.text()}`);
    return;
  }

  if (provider === "zapi") {
    const inst = Deno.env.get("ZAPI_INSTANCE_ID");
    const token = Deno.env.get("ZAPI_TOKEN");
    const ct = Deno.env.get("ZAPI_CLIENT_TOKEN");
    if (!inst || !token) throw new Error("Z-API: secrets ausentes");
    const r = await fetch(`https://api.z-api.io/instances/${inst}/token/${token}/send-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(ct ? { "Client-Token": ct } : {}) },
      body: JSON.stringify({ phone: telefone, message: mensagem }),
    });
    if (!r.ok) throw new Error(`Z-API: ${r.status} ${await r.text()}`);
    return;
  }

  console.log(`[mock-whatsapp] Para ${telefone}:\n${mensagem}\n---`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Janela: agendamentos confirmados/pagos que começam entre 23h e 25h a partir de agora
  const agora = new Date();
  const min = new Date(agora.getTime() + 23 * 3600 * 1000).toISOString();
  const max = new Date(agora.getTime() + 25 * 3600 * 1000).toISOString();

  const { data: lista, error } = await supabase
    .from("agendamentos")
    .select(`
      id, inicio,
      clientes(nome, telefone),
      servicos(nome),
      profissionais(nome),
      organizacoes(nome)
    `)
    .in("status", ["pago", "confirmado"])
    .eq("lembrete_enviado", false)
    .gte("inicio", min)
    .lte("inicio", max);

  if (error) {
    console.error("[lembretes] erro consulta", error);
    return new Response(JSON.stringify({ erro: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let enviados = 0;
  let falhas = 0;
  for (const row of lista ?? []) {
    const a: Agendamento = {
      id: row.id,
      inicio: row.inicio,
      cliente_telefone: (row.clientes as any)?.telefone ?? "",
      cliente_nome: (row.clientes as any)?.nome ?? "",
      servico_nome: (row.servicos as any)?.nome ?? "",
      profissional_nome: (row.profissionais as any)?.nome ?? "",
      organizacao_nome: (row.organizacoes as any)?.nome ?? "",
    };
    if (!a.cliente_telefone) continue;
    const horario = new Date(a.inicio).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
    const msg =
      `Olá, ${a.cliente_nome}! 👋\n\nLembrete do seu agendamento na *${a.organizacao_nome}*:\n` +
      `🗓 ${horario}\n💈 ${a.servico_nome} com ${a.profissional_nome}\n\n` +
      `Caso precise remarcar, responda esta mensagem.\nAté lá! ✨`;
    try {
      await enviarMensagem(a.cliente_telefone, msg);
      await supabase.from("agendamentos").update({ lembrete_enviado: true }).eq("id", a.id);
      enviados++;
    } catch (e) {
      falhas++;
      console.error(`[lembretes] falha ${a.id}`, e);
    }
  }

  return new Response(JSON.stringify({ enviados, falhas, total: lista?.length ?? 0 }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
