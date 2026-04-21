import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Job cron: marca pagamentos vencidos e libera o slot
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase.rpc("expirar_pix_vencidos");
  if (error) {
    return new Response(JSON.stringify({ erro: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  console.log(`[expirar-pix] expirados: ${data}`);
  return new Response(JSON.stringify({ expirados: data }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
